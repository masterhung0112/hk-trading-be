import { Kinesis } from 'aws-sdk'

export type KinesisConnectorPutRecordsParams = Omit<Kinesis.Types.PutRecordsInput, 'StreamName'>

export class KinesisConnector {
    public streamName: string
    private kinesisStream: Kinesis

    constructor({streamName, kinesisStream = new Kinesis()}: {
        streamName: string, 
        kinesisStream?: Kinesis
    }) {
        this.streamName = streamName || 'undefined'
        this.kinesisStream = kinesisStream
    }

    putRecords(inputParams: KinesisConnectorPutRecordsParams) {
        const params: Kinesis.Types.PutRecordsInput = {
            StreamName: this.streamName,
            ...inputParams,
        }
        return this.kinesisStream.putRecords(params).promise()
    }
}