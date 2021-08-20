import { catchError, from, of, tap, toArray } from "rxjs"
import { publishToKinesis, toRecord } from "./KinesisOperator"

import { KinesisConnector } from '../Connectors/KinesisConnector'

describe('KinesisOperator', () => {
    
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

    const expectedValue = {
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
    }


    it('should publish', (done) => {
        // putRecords will return empty object
        jest.spyOn(KinesisConnector.prototype, 'putRecords').mockResolvedValue({} as any)

        of(uows).pipe(
            publishToKinesis({
                streamName: 'test'
            }),
            toArray(),
            tap((collected) => {
                expect(collected).toHaveLength(1)
                expect(collected[0]).toMatchObject({
                    ...expectedValue,
                    // putRecords returns empty object
                    publishResponse: {},
                })
            })
        ).subscribe(() => done())
    })

    it('reject', (done) => {
        jest.spyOn(KinesisConnector.prototype, 'putRecords').mockRejectedValue(new Error('test error'))

        from([uows, uows]).pipe(
            publishToKinesis({
                streamName: 'test'
            }),
            catchError((err, _) => {
                expect(err.toString()).toEqual('Error: test error')
                expect(err.uow).toMatchObject(expectedValue)
                return of()
            }),
            toArray(),
            tap((collected) => {
                expect(collected).toHaveLength(0)
            })
        ).subscribe(() => done())
    })
})