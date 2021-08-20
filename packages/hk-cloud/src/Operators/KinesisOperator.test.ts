import { from, tap, toArray } from "rxjs"
import { publishToKinesis, toRecord } from "./KinesisOperator"

import { KinesisConnector } from '../Connectors/KinesisConnector'

describe('KinesisOperator', () => {
    it('should publish', (done) => {
        // putRecords will return empty object
        jest.spyOn(KinesisConnector.prototype, 'putRecords').mockResolvedValue({} as any)

        const uows = [{
            event: {
                id: '79a0d8f0-0eef-11ea-8d71-362b9e155667',
                type: 'p1',
                partitionKey: '79a0d8f0-0eef-11ea-8d71-362b9e155667',
            },
        },
        {
            event: {
                id: '79a0d8f0-0eef-11ea-8d71-362b9e155668',
                type: 'p1',
                partitionKey: '79a0d8f0-0eef-11ea-8d71-362b9e155667',
            },
        }]

        from(uows).pipe(
            publishToKinesis({
                streamName: 'test'
            }),
            toArray(),
            tap((collected) => {
                expect(collected).toHaveLength(1)
                expect(collected[0]).toMatchObject({
                    0: {
                        event: {
                            ...uows[0].event
                            //   tags: {
                            //     account: 'undefined',
                            //     functionname: 'undefined',
                            //     pipeline: 'undefined',
                            //     region: 'us-west-2',
                            //     source: 'undefined',
                            //     stage: 'undefined',
                            //     skip: true,
                            //   },
                        }
                    },
                    1: {
                        event: {
                            ...uows[1].event
                            //   tags: {
                            //     account: 'undefined',
                            //     functionname: 'undefined',
                            //     pipeline: 'undefined',
                            //     region: 'us-west-2',
                            //     source: 'undefined',
                            //     stage: 'undefined',
                            //     skip: true,
                            //   },
                        }
                    },
                    inputParams: {
                        Records: [
                            toRecord({
                                id: '79a0d8f0-0eef-11ea-8d71-362b9e155667',
                                type: 'p1',
                                partitionKey: '79a0d8f0-0eef-11ea-8d71-362b9e155667',
                                //   tags: {
                                //     account: 'undefined',
                                //     region: 'us-west-2',
                                //     stage: 'undefined',
                                //     source: 'undefined',
                                //     functionname: 'undefined',
                                //     pipeline: 'undefined',
                                //     skip: true,
                                //   },
                            }),
                            toRecord(uows[1].event)
                        ],
                    },
                    // putRecords returns empty object
                    publishResponse: {},
                })
            })
        ).subscribe(() => done())
    })
})