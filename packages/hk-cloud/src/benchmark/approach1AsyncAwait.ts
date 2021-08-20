import { BatchProcessingOptions, defaultBatchProcessingOptions, retrieveCompanies, retrieveCompanyOrders, sendBulkEmails, TOTAL_COMPANY_COUNT, validateBatchProcessingOptions } from "../Utils/fakeUtils";

export const approach1AsyncAwait = async (options?: BatchProcessingOptions) => {
    options = {
        ...defaultBatchProcessingOptions,
        ...options,
    }
    validateBatchProcessingOptions(options)

    for (let currentOffset = 0; currentOffset < TOTAL_COMPANY_COUNT; currentOffset += options.batchSize) {
        const companyBatch = await retrieveCompanies(options.batchSize, currentOffset)
        if (companyBatch.length == 0) {
            break
        }
        for (const company of companyBatch) {
            company.orders = await retrieveCompanyOrders(company)
        }

        await sendBulkEmails(companyBatch)
    }
}