import { BatchProcessingOptions, defaultBatchProcessingOptions, retrieveCompanies, retrieveCompanyOrders, sendBulkEmails, TOTAL_COMPANY_COUNT, validateBatchProcessingOptions } from "../Utils/fakeUtils";

export const approach2PromiseAll = async (options?: BatchProcessingOptions) => {
    options = {
        ...defaultBatchProcessingOptions,
        ...options,
    }
    validateBatchProcessingOptions(options)

    let retrieveCompaniesPromises = []
    for (let currentOffset = 0; currentOffset < TOTAL_COMPANY_COUNT; currentOffset += options.batchSize) {
        retrieveCompaniesPromises.push(retrieveCompanies(options.batchSize, currentOffset).then(async (companyBatch) => {
            await Promise.all([
                ...companyBatch.map(async (company) => {
                    company.orders = await retrieveCompanyOrders(company)
                }),
                sendBulkEmails(companyBatch)
            ]
            )
        }))
    }
    await Promise.all(retrieveCompaniesPromises)
}