import { pipe } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { KinesisConnector } from "../Connectors/KinesisConnector"
import { rejectWithFault } from './fault';

export const publishToKinesis = ({ streamName, eventField = 'event', handleErrors = true }: {
    streamName: string,
    eventField?: string
    handleErrors?: boolean
}) => {
    const kinesisConnector = new KinesisConnector({ streamName });

    const toInputParams = (batchUow) => ({
        ...batchUow,
        inputParams: {
          Records: batchUow.map((uow) => toRecord(uow[eventField])),
        },
      })

    const putRecords = async (batchUow) => {
        try {
        const publishResponse = await kinesisConnector.putRecords(batchUow.inputParams)
        return {
            ...batchUow,
            publishResponse
        }
    } catch (e) {
        return rejectWithFault(batchUow, !handleErrors)(e)
    }
            // publishResponse store the returned value of putRecords
            // .then((publishResponse) => ({ ...batchUow, publishResponse }))
            // .catch(rejectWithFault(batchUow, !handleErrors));

        // return from(p) // wrap promise in a stream
    }
    return pipe(
        // toArray(),
        // map(toBatchUow),
        map(toInputParams),
        // Push data to Kinesis in parallel
        mergeMap(putRecords),
        // flatMap(unBatchUow)
    )
}

export const toRecord = (e) => ({
    Data: Buffer.from(JSON.stringify(e)),
    PartitionKey: e.partitionKey,
})