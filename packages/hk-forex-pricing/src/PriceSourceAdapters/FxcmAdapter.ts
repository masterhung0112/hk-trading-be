import { IMarketDataAdapter } from '../constracts/IMarketDataAdapter'
import io from 'socket.io-client'
import querystring from 'querystring'
import { catchError, fromEvent, map, mergeMap, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs'
import { RxHttpClient, RequestInit } from 'hk-cloud'
import { CandleStickBidAskDTO, CandleStickDTO, CandleQuoteDto, ResolutionType } from 'hk-trading-contract'

const token = '0ddf14082b58fcaf076c6ae899ddf950607d721d' // get this from http://tradingstation.fxcm.com/
const tradingApiHost = 'api-demo.fxcm.com'
const tradingApiPort = 443
const tradingApiProto = 'https' // http or https

export type FxcmSymboInfo = {
  Updated: number,
  Rates: number[],
  Symbol: string
}

export type FxcmSubscribeReply = {
  response: {
    executed: boolean
    error: string
  }
  pairs: FxcmSymboInfo[]
}

export type FxcmCandlesGetReply = {
  response: {
    executed: boolean
    error: string
  }
  instrument_id: string
  period_id: string
  candles: [timestamp: number, bidOpen: number, bidClose: number, bidHigh: number, bidLow: number, askOpen: number, askClose: number, askHigh: number, askLow: number, tickQty: number][]
}

function resolutionTypeToFxcmPeriod(resolution: ResolutionType): string {
  switch (resolution) {
    case '1s':
      return 'm1'
    case '1m':
      return 'm1'
    case '5m':
      return 'm5'
    case '1h':
      return 'H1'
    case '4h':
      return 'H4'
    case '1d':
      return 'D1'
    case '1w':
      return 'W1'
  }
  throw new Error(`unsupported period for FXCM ${resolution}`)
}

//Reference: https://apiwiki.fxcorporate.com/api/RestAPI/Socket%20REST%20API%20Specs.pdf
export class FxcmAdapter implements IMarketDataAdapter {
  private socket: SocketIOClient.Socket
  // socket: Socket
  private socket$: Observable<SocketIOClient.Socket>
  private connect$: Observable<SocketIOClient.Socket>
  private globalRequestID = 1;
  private socketId = ''

  private _quoteMap = new Map<string, Subject<CandleQuoteDto>>()
  private _marketDataSubject = new Subject<CandleQuoteDto[]>()

  request_headers = {
    // 'User-Agent': 'request',
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: ''
  }

  getNextRequestID() {
    return this.globalRequestID++
  }

  sendRequest(method: string, resource: string, params) {
    // const requestID = this.getNextRequestID()
    if (typeof (method) === 'undefined') {
      method = 'GET'
    }

    // GET HTTP(S) requests have parameters encoded in URL
    if (method === 'GET') {
      resource += '/?' + querystring.stringify(params)
    }

    const requestConfig: RequestInit = {
      headers: this.request_headers,
      method: method,
    }
    if (method === 'POST') {
      requestConfig.body = querystring.stringify(params)
    }

    const requestUrl = `${tradingApiProto}://${tradingApiHost}:${tradingApiPort}/${resource}`
    return new RxHttpClient().request(
      method,
      requestUrl,
      requestConfig
    ).pipe(
      catchError((err) => {
        throw new Error(`${requestUrl}: ${err.message}`)
      })
    )
    // from(fetch(`, {
    //     headers: this.request_headers,
    //     method: method,
    // })).pipe(
    //     map((response) => this._responseInterceptors.execute(new HttpResponse(response))),
    //     tap(HttpErrorHandler.throwIfNotOkResponse)
    // )
    // var req = https.request({
    //     host: trading_api_host,
    //     port: trading_api_port,
    //     path: resource,
    //     method: method,
    //     headers: this.request_headers
    // }, (response) => {
    //     var data = '';
    //     response.on('data', (chunk) => data += chunk); // re-assemble fragmented response data
    //     response.on('end', () => {
    //         callback(response.statusCode, requestID, data);
    //     });
    // }).on('error', (err) => {
    //     callback(0, requestID, err); // this is called when network request fails
    // });

    // // non-GET HTTP(S) reuqests pass arguments as data
    // if (method !== "GET" && typeof (params) !== 'undefined') {
    //     req.write(params);
    // }
    // req.end();
  }
  // send_raw(params) {
  //     // avoid undefined errors if params are not defined
  //     if (typeof (params.params) === 'undefined') {
  //         params.params = '';
  //     }
  //     // method and resource must be set for request to be sent
  //     if (typeof (params.method) === 'undefined') {
  //         console.log('command error: "method" parameter is missing.');
  //     } else if (typeof (params.resource) === 'undefined') {
  //         console.log('command error: "resource" parameter is missing.');
  //     } else {
  //         return this.request_processor(params.method, params.resource, params.params);
  //     }
  // }
  // send(params) {
  //     if (typeof (params.params) !== 'undefined') {
  //         params.params = querystring.stringify(params.params)
  //     }
  //     return this.send_raw(params)
  // }
  priceUpdate(update, s: Subject<CandleQuoteDto>) {
    try {
      const jsonData = JSON.parse(update)
      // JavaScript floating point arithmetic is not accurate, so we need to round rates to 5 digits
      // Be aware that .toFixed returns a String
      const [b, a] = jsonData.Rates
      jsonData.Rates = jsonData.Rates.map(function (element) {
        return element.toFixed(5)
      })
      const sym = jsonData.Symbol.replace('/', '')

      s.next({ sym: `FM:${sym}`, b, a, sts: jsonData.Updated })

      // this._marketDataSubject.next([new MarketData(new CurrencyPair(symbol), (bid + ask) / 2, jsonData.Updated, "FXCM")])
      // console.log(`@${jsonData.Updated} Price update of [${jsonData.Symbol}]: ${jsonData.Rates}`);
    } catch (e) {
      console.log('price update JSON parse error: ', e)
      return
    }
  }
  // subscribe(pair: string) {
  //     return this.authenticate().pipe(
  //         // switchMap((socket) => of({
  //         //     socket,
  //         // })),
  //         tap(() => {
  //             this.sendRequest('POST', 'subscribe', { pairs: pair }).pipe(
  //                 mergeMap((response) => response.json())
  //             ).subscribe((response) => {
  //                 const subscribeReply = (response as FxcmSubscribeReply)
  //                 if (subscribeReply.executed) {
  //                     for (const pair of subscribeReply.pairs) {

  //                         // const symboInfo = JSON.parse()

  //                     }
  //                 }
  //             })
  //         })
  //     )
  //     // let self = this
  //     // var callback = (statusCode, requestID, data) => {
  //     //     if (statusCode === 200) {
  //     //         try {
  //     //             var jsonData = JSON.parse(data);
  //     //         } catch (e) {
  //     //             console.log('subscribe request #', requestID, ' JSON parse error: ', e);
  //     //             return;
  //     //         }
  //     //         // Execution successful
  //     //         if (jsonData.response.executed) {
  //     //             try {
  //     //                 for (var i in jsonData.pairs) {
  //     //                     this.socket.on(jsonData.pairs[i].Symbol, self.priceUpdate.bind(self));
  //     //                     // self.priceUpdate(jsonData)
  //     //                 }
  //     //             } catch (e) {
  //     //                 console.log('subscribe request #', requestID, ' "pairs" JSON parse error: ', e);
  //     //                 return;
  //     //             }
  //     //         } else {
  //     //             console.log('subscribe request #', requestID, ' not executed: ', jsonData);
  //     //         }
  //     //     } else {
  //     //         console.log('subscribe request #', requestID, ' execution error: ', statusCode, ' : ', data);
  //     //     }
  //     // }
  //     // if (!this.socket$) {
  //     //     return this.authenticate().then(() => {
  //     //         this.send({ "method": "POST", "resource": "/subscribe", "params": { pairs: pair }, "callback": callback })
  //     //     })
  //     // } else {
  //     //     return this.send({ "method": "POST", "resource": "/subscribe", "params": { pairs: pair }, "callback": callback })
  //     // }
  // }

  // async unsubscribe(pair: string) {
  //     const callback = (statusCode, requestID, data) => {
  //         if (statusCode === 200) {
  //             try {
  //                 var jsonData = JSON.parse(data)
  //             } catch (e) {
  //                 console.log('unsubscribe request #', requestID, ' JSON parse error: ', e)
  //                 return
  //             }
  //             if (jsonData.response.executed) {
  //                 try {
  //                     for (const i in jsonData.pairs) {
  //                         // this.socket.off(jsonData.pairs[i], this.priceUpdate);
  //                     }
  //                 } catch (e) {
  //                     console.log('unsubscribe request #', requestID, ' "pairs" JSON parse error: ', e)
  //                     return
  //                 }
  //             } else {
  //                 console.log('unsubscribe request #', requestID, ' not executed: ', jsonData)
  //             }
  //         } else {
  //             console.log('unsubscribe request #', requestID, ' execution error: ', statusCode, ' : ', data)
  //         }
  //     }
  //     // this.send({ "method": "POST", "resource": "/unsubscribe", "params": { "pairs": pair }, "callback": callback })
  // }

  listenOnConnect<T>(event) {
    return this.connect$.pipe(
      switchMap(socket => fromEvent<T>(socket, event))
    )
  }

  emitOnConnect<T>(observable$: Observable<T>) {
    return this.connect$.pipe(
      switchMap(socket => observable$.pipe(
        map(data => ({ socket, data }))
      ))
    )
  }

  // FXCM REST API requires socket.io connection to be open for requests to be processed
  // id of this connection is part of the Bearer authorization
  authenticate() {
    if (!this.socket$) {
      this.socket = io(tradingApiProto + '://' + tradingApiHost + ':' + tradingApiPort, {
        query: {
          access_token: token
        },
        jsonp: false, transports: ['websocket']
      })
      this.socket$ = of(this.socket)
    }
    if (!this.connect$) {
      this.connect$ = this.socket$.pipe(
        switchMap(socket =>
          fromEvent(socket, 'connect').pipe(
            tap(() => {
              this.socketId = socket.id
              this.request_headers.Authorization = 'Bearer ' + socket.id + token
              socket.on('connect_error', () => {
                console.log('connect_error')
              })
              socket.on('error', () => {
                console.log('error')
              })
            }),
            takeUntil(fromEvent(socket, 'disconnect')),
            map(() => socket),
          ))
      )
    }
    return this.connect$

    // this.socket.on('error', (error) => {
    //     console.log('Socket.IO session error: ', error);
    // })
    // return fromEvent(this.socket, 'connect').pipe(
    //     tap(() => {
    //         this.request_headers.Authorization = 'Bearer ' + this.socket.id + token;
    //     }),
    //     takeUntil(fromEvent(this.socket, "disconnect")),
    // )

    // // fired when socket.io connects with no errors
    // // this.socket.on('connect', () => {
    // //     console.log('Socket.IO session has been opened: ', this.socket.id);
    // //     this.request_headers.Authorization = 'Bearer ' + this.socket.id + token;
    // //     resolve()
    // // });
    // // fired when socket.io cannot connect (network errors)
    // this.socket.on('connect_error', (error) => {
    //     console.log('Socket.IO session connect error: ', error);
    //     reject(error)
    // });
    // // fired when socket.io cannot connect (login errors)
    // this.socket.on('error', (error) => {
    //     console.log('Socket.IO session error: ', error);
    //     reject(error)
    // });
    // // fired when socket.io disconnects from the server
    // // this.socket.on('disconnect', () => {
    // //     console.log('Socket disconnected, terminating client.');
    // //     // process.exit(-1);
    // //     reject(new Error('disconnected'))
    // // });
    // return {
    //     dispose: () => {
    //         this.socket.close()
    //         this.socket = null
    //     }
    // }
    // })
  }

  createQuote(symbol: string): Observable<CandleQuoteDto> {
    const quoteSubject = this._quoteMap.get(symbol)
    if (quoteSubject) {
      return quoteSubject.asObservable()
    }

    const s = new Subject<CandleQuoteDto>()
    this._quoteMap.set(symbol, s)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    return this.authenticate().pipe(
      mergeMap((socket) => {
        /* Call /subscribe to FXCM. After subscribing, market price updates will be pushed to the client via the socket
         */
        return this.sendRequest('POST', 'subscribe', { pairs: symbol }).pipe(
          // Convert response to JSON object
          mergeMap((response) => response.json()),
          // Parse
          mergeMap((response) => {
            const subscribeReply = (response as FxcmSubscribeReply)
            console.log(subscribeReply)
            if (subscribeReply.response.executed) {
              if (subscribeReply.pairs.length != 1) {
                throw new Error(`Multiple pairs (${subscribeReply.pairs}) when only one pair subscribed`)
              }
              // const events = []
              for (const pair of subscribeReply.pairs) {
                // fromEvent(socket, pair.Symbol).subscribe((data) => self.priceUpdate(data, s))
                socket.on(pair.Symbol, (data) => self.priceUpdate(data, s))
              }
              return s
            } else {
              // Throw exception when there's error
              throw new Error(subscribeReply.response.error ? subscribeReply.response.error : 'executed not success')
            }
          }
          ))
      }),
      // Return Subject
      // switchMap(() => s)
    )
  }

  get marketDataObservable(): Observable<CandleQuoteDto[]> {
    return this._marketDataSubject.asObservable()
  }

  createCandlesStream(symbol: string, resolution: ResolutionType, option: { fromTimestamp?: Date; toTimestamp?: Date, num?: number }): Observable<CandleStickDTO[]> {
    // if (token) {
    //   params['access_token'] = token
    // }

    // if (this.socketId) {
    //   params['socket_id'] = this.socketId
    // }

    const socket$ = this.authenticate()
    return socket$.pipe(
      mergeMap(() => {
        const params: { from?: number, to?: number, num: number } = { num: 200 }
        if (option.fromTimestamp || option.toTimestamp) {
          if (!option.fromTimestamp) {
            throw new Error('option.fromTimestamp is needed')
          }
          if (!option.toTimestamp) {
            throw new Error('option.toTimestamp is needed')
          }

          params.from = Math.floor(option.fromTimestamp.getTime() / 1000) // Convert to epoch time
          params.to = Math.floor(option.toTimestamp.getTime() / 1000) // Convert to epoch time
        }

        if (option.num) {
          params.num = option.num
        }

        /* Call /candles to FXCM
         */
        return this.sendRequest('GET', `candles/1/${resolutionTypeToFxcmPeriod(resolution)}`, params).pipe(
          // Convert response to JSON object
          mergeMap((response) => response.json()),
          // Parse
          mergeMap((response) => {
            const getReply = (response as FxcmCandlesGetReply)
            console.log(getReply)
            if (getReply.response.executed) {
              const candles: CandleStickBidAskDTO[] = []
              // For each returned candle, add it to the array
              for (const [timestamp, bidOpen, bidClose, bidHigh, bidLow, askOpen, askClose, askHigh, askLow, tickQty] of getReply.candles) {
                candles.push({
                  resolutionType: '1m',
                  sym: 'FM:EURUSD',
                  sts: timestamp,
                  // ets?: number;
                  bo: bidOpen,
                  bh: bidHigh,
                  bl: bidLow,
                  bc: bidClose,
                  ao: askOpen,
                  ah: askHigh,
                  al: askLow,
                  ac: askClose,
                  v: tickQty
                })
              }

              // Return the array of candles
              return of(candles)
            } else {
              if (getReply.response.error) {
                // Throw exception when there's error
                throw new Error(getReply.response.error)
              }
              // There's no candle stick for the target resolution yet
              return of()
            }
          }
          ))
      }),
      take(1),
    )
  }

  close() {
    this.socket.close()
    this.socket = null
    this.socket$ = null
  }
}
