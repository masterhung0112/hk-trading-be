import { BehaviorSubject, bufferTime, catchError, filter, from, mergeMap } from "rxjs";
import { scan } from 'rxjs/operators'
import { BatchProcessingOptions, defaultBatchProcessingOptions, retrieveCompanies, retrieveCompanyOrders, sendBulkEmails, TOTAL_COMPANY_COUNT, validateBatchProcessingOptions } from "../Utils/fakeUtils";

export const approach4ObservableBuffer = async (options?: BatchProcessingOptions) => {
    options = {
        ...defaultBatchProcessingOptions,
        ...options,
    }
    validateBatchProcessingOptions(options)

    const controller$ = new BehaviorSubject(0)

    return controller$
        .pipe(
            /**
             * Fetch the next batch of data (the batchSize number of records
             *   after the current offset).
             */
            mergeMap(
                (curOffset) => retrieveCompanies(options.batchSize, curOffset),
                options.retrieveCompaniesConcurrency
            ),
            /**
             * Flatten the array of fetched companies into individual company records.
             * The proceeding observable operators will therefore work on the individual companies.
             * Break the iteration if the fetched data is empty.
             */
            mergeMap(companies => {
                if (companies.length === 0) {
                    controller$.complete();
                }
                return from(companies);
            }),
            // Retrieve each company's orders concurrently.
            mergeMap(async (company) => {
                company.orders = await retrieveCompanyOrders(company)
                return company
            }, options.retrieveOrdersConcurrency),
            /**
             * Accumulate the companies processed but don't wait until the entire
             * batch has been processed. Instead accumulate (i.e. buffer) processed
             * companies (possibly out of order) until we reach `options.maxBulkEmailCount`
             * amount or the `500ms` timer elapses.
             * When either condition is reached, continue on with the pipeline.
             */
            bufferTime(500, undefined, options.maxBulkEmailCount),
            /**
             * Don't continue processing if the timer in `bufferTime` was reached and
             *   there are no buffered companies.
             */
            filter((companies) => companies.length > 0),
            /**
             * Send the bulk emails to the companies accumulated in `bufferTime`.
             *   Also allow multiple bulk emails to be sent concurrently.
             */
            mergeMap(
                async companies => {
                    await sendBulkEmails(companies);
                    return companies;
                },
                options.bulkEmailConcurrency,
            ),
            /**
             * Accumulate the number of companies processed so far.
             * As we process companies, the queue of companies remaining
             * to be processed gets smaller.  The goal here is to keep the
             * queue always full. Therefore, as long as the queue isn't too
             * large `< options.maxQueueSize`, keep advancing the `controller$`
             * subject to fetch more companies, thereby increasing the size
             * of the queue.
             */
            scan(
                (acc: any, companies) => {
                    acc.totalProcessedCount += companies.length

                    let queueSize = acc.curOffset - acc.totalProcessedCount
                    while (queueSize + options.batchSize <= options.maxQueueSize) {
                        queueSize += options.batchSize;
                        acc.curOffset += options.batchSize;
                        controller$.next(acc.curOffset);
                    }
                    return acc
                },
                {
                    curOffset: 0,
                    totalProcessedCount: 0,
                }
            ),
            catchError(async err => {
                console.error('err', err)
                return err
            }),
        )
        .toPromise()
}