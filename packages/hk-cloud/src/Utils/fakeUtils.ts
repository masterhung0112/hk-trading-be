import faker from 'faker'

export const TOTAL_COMPANY_COUNT = 100;

export interface Order {
    id: number;
    productName: string;
    price: string;
    purchaseDate: Date;
}

export interface Company {
    id: number;
    name: string;
    city: string;
    countryCode: string;
    orders?: Order[];
}

/**
 * Enable to introduce anomalies. This will multiply the delay of
 *   `retrieveCompanyOrders()` by `ANOMALY_MULTIPLIER` for every
 *   `ANOMALY_FREQUENCY` companies.
 */
const USE_ANOMALIES = false;
const ANOMALY_FREQUENCY = 10;
const ANOMALY_MULTIPLIER = 10;

export interface BatchProcessingOptions {
    /** The amount of companies to fetch in one request. */
    batchSize?: number;
    /** The amount of companies to be queued for processing. */
    maxQueueSize?: number;
    /** The number of concurrent requests to fetch companies.  Should be higher than batchSize. */
    retrieveCompaniesConcurrency?: number;
    /** The number of concurrent requests to fetch a company's orders. */
    retrieveOrdersConcurrency?: number;
    /** The number of concurrent requests to send bulk email.  Should be lower than batchSize. */
    bulkEmailConcurrency?: number;
    /** The maximum number of emails to send in one request. */
    maxBulkEmailCount?: number;
}

export const defaultBatchProcessingOptions: BatchProcessingOptions = {
    batchSize: 5,
    maxQueueSize: 15,
    retrieveCompaniesConcurrency: 1,
    retrieveOrdersConcurrency: 5,
    bulkEmailConcurrency: 5,
    maxBulkEmailCount: 5,
};

// Enable to get random delays and order counts.
const USE_RANDOMNESS = false;

const RETRIEVE_ONE_COMPANY_DELAY = () =>
    USE_RANDOMNESS ? faker.datatype.number({ min: 4, max: 8 }) : 0;
const RETRIEVE_ONE_COMPANY_ORDER_DELAY = () =>
    USE_RANDOMNESS ? faker.datatype.number({ min: 3, max: 7 }) : 0;
const ORDERS_PER_COMPANY = () =>
    USE_RANDOMNESS ? faker.datatype.number({ min: 4, max: 8 }) : 6;
const SEND_BULK_EMAILS_DELAY = () =>
    USE_RANDOMNESS ? faker.datatype.number({ min: 40, max: 80 }) : 0;

export const validateBatchProcessingOptions = (
    options: BatchProcessingOptions,
) => {
    if (options.maxQueueSize < options.batchSize) {
        console.warn(
            `Invalid options: maxQueueSize ${options.maxQueueSize
            } must be higher than batchSize ${options.batchSize}.`,
        );
        return;
    }
    if (options.maxBulkEmailCount > options.batchSize) {
        console.warn(
            `Invalid options: maxBulkEmailCount ${options.maxBulkEmailCount
            } cannot be higher than ${options.batchSize}.`,
        );
        return;
    }
}

export const retrieveCompanies = async (
    limit: number,
    offset: number
): Promise<Company[]> => {
    await new Promise(resolve =>
        setTimeout(resolve, RETRIEVE_ONE_COMPANY_DELAY() * limit),
    )

    if (offset >= TOTAL_COMPANY_COUNT || limit == 0) {
        return []
    }
    const num = Math.min(TOTAL_COMPANY_COUNT - offset, limit)
    const companies = []
    for (let i = 0; i < num; ++i) {
        companies.push({
            id: i + offset,
            name: faker.company.companyName(),
            city: faker.address.city(),
            countryCode: faker.address.countryCode()
        })
    }

    return companies
}

export const retrieveCompanyOrders = async (
    company: Company,
): Promise<Order[]> => {
    const ordersPerCompany = ORDERS_PER_COMPANY();

    await new Promise(resolve =>
        setTimeout(resolve,
            // Apply the anomaly multiplier if enabled and the index is hit.
            (USE_ANOMALIES && (company.id + 1) % ANOMALY_FREQUENCY === 0
                ? ANOMALY_MULTIPLIER
                : 1) *
            RETRIEVE_ONE_COMPANY_ORDER_DELAY() *
            ordersPerCompany,
        ),
    )

    const orders = []
    for (let i = 0; i < ordersPerCompany; ++i) {
        orders.push({
            id: faker.datatype.number(100000),
            productName: faker.commerce.product(),
            price: faker.commerce.price(),
            purchaseDate: faker.date.past(1),
        })
    }

    return orders
}

/**
 * Send multiple emails at a time using an email API.
 * Other real-world examples could be:
 *   - Dumping the data to a CSV.
 *   - Inserting the updated data back into the DB.
 *   - Indexing the data into a elasticsearch.
 */
export const sendBulkEmails = async (_bulkEmails: Company[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, SEND_BULK_EMAILS_DELAY()));
}

class Timer {
    public start: number;
    constructor(private name: string) {
        this.start = Date.now();
    }
    public stop() {
        const stop = Date.now() - this.start;
        console.log(`${this.name} took ${stop}ms`);
        return stop;
    }
}

/**
 * Utility to time-benchmark a function.
 */
export const benchmark = async (
    name: string,
    approach: (options: BatchProcessingOptions) => Promise<void>,
    repetitions: number,
    approachOptions?: BatchProcessingOptions,
): Promise<number> => {
    let totalTime = 0;
    for (let i = 0; i < repetitions; i++) {
        const t1 = new Timer(`Run ${i + 1}/${repetitions} ${name}`);
        await approach(approachOptions);
        totalTime += t1.stop();
    }
    const avg = Math.round(totalTime / repetitions);
    console.log(`Avg ${name}: ${avg}ms`);
    return avg;
}