import { BehaviorSubject, catchError, from, mergeMap, mergeScan } from "rxjs";
import { BatchProcessingOptions, defaultBatchProcessingOptions, retrieveCompanies, retrieveCompanyOrders, sendBulkEmails, TOTAL_COMPANY_COUNT, validateBatchProcessingOptions } from "../Utils/fakeUtils";

export const approach3Observable = async (options?: BatchProcessingOptions) => {
    options = {
        ...defaultBatchProcessingOptions,
        ...options,
    }
    validateBatchProcessingOptions(options)

    let curBatchReceivedCount = 0

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
                curBatchReceivedCount = companies.length;
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
             * Accumulate the companies processed for the current batch.
             * When the entire batch has been processed,
             * send the bulk emails and proceed to the next batch.
             */
            mergeScan(
                async (acc: any, company) => {
                    acc.curBatchProcessed.push(company)

                    if (acc.curBatchProcessed.length === curBatchReceivedCount) {
                        acc.curOffset += curBatchReceivedCount;
                        controller$.next(acc.curOffset);
                        await sendBulkEmails(acc.curBatchProcessed);
                        acc.curBatchProcessed = [];

                    }
                    return acc
                },
                {
                    curBatchProcessed: [],
                    curOffset: 0,
                },
                1,
            ),
            catchError(async err => {
                console.error('err', err)
                return err
            }),
        )
        .toPromise()
}