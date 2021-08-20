import * as AwsMock from 'aws-sdk-mock'
import { KinesisConnector, KinesisConnectorPutRecordsParams } from './KinesisConnector';

describe('KinesisConnector', () => {
    afterEach(() => {
        AwsMock.restore('Kinesis');
    })

    it('should publish', async () => {
        const spy = jest.fn().mockImplementation((p, cb) => cb(null, {}))
        AwsMock.mock('Kinesis', 'putRecords', spy)

        const inputParams: KinesisConnectorPutRecordsParams = {
            Records: [
                {
                    Data: Buffer.from(JSON.stringify({ type: 't1' })),
                    PartitionKey: '1',
                },
            ],
        };

        const data = await new KinesisConnector({
            streamName: 's1',
        }).putRecords(inputParams)
        
        expect(spy).toHaveBeenCalledWith({
            StreamName: 's1',
            Records: inputParams.Records,
        }, expect.anything());
        expect(data).toStrictEqual({});
    })
})