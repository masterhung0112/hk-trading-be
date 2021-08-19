import { IMarketDataAdapter } from "../constracts/IMarketDataAdapter";
import { MarketData } from "../constracts/MarketData";
import * as https from 'https'
import socketioclient, { Socket } from 'socket.io-client'
import * as querystring from 'querystring'

const token = "a43dbe2baa2cf75b900b7a48fa6ce2fd2a681b6d"; // get this from http://tradingstation.fxcm.com/
const trading_api_host = 'api-demo.fxcm.com';
const trading_api_port = 443;
const trading_api_proto = 'https'; // http or https

export class FxcmAdapter implements IMarketDataAdapter {
    socket: Socket
    globalRequestID = 1;
    request_headers = {
        'User-Agent': 'request',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: ''
    }

    getNextRequestID() {
        return this.globalRequestID++;
    }

    default_callback(statusCode, requestID, data) {
        if (statusCode === 200) {
            try {
                var jsonData = JSON.parse(data);
            } catch (e) {
                console.log('request #', requestID, ' JSON parse error:', e);
                return;
            }
            console.log('request #', requestID, ' has been executed:', JSON.stringify(jsonData, null, 2));
        } else {
            console.log('request #', requestID, ' execution error:', statusCode, ' : ', data);
        }
    }

    request_processor(method, resource, params, callback) {
        var requestID = this.getNextRequestID();
        if (typeof(callback) === 'undefined') {
            callback = this.default_callback;
            console.log('request #', requestID, ' sending');
        }
        if (typeof(method) === 'undefined') {
            method = "GET";
        }
    
        // GET HTTP(S) requests have parameters encoded in URL
        if (method === "GET") {
            resource += '/?' + params;
        }
        var req = https.request({
                host: trading_api_host,
                port: trading_api_port,
                path: resource,
                method: method,
                headers: this.request_headers
            }, (response) => {
                var data = '';
                response.on('data', (chunk) => data += chunk); // re-assemble fragmented response data
                response.on('end', () => {
                    callback(response.statusCode, requestID, data);
                });
            }).on('error', (err) => {
                callback(0, requestID, err); // this is called when network request fails
            });
    
        // non-GET HTTP(S) reuqests pass arguments as data
        if (method !== "GET" && typeof(params) !== 'undefined') {
            req.write(params);
        }
        req.end();
    }
    send_raw(params) {
        // avoid undefined errors if params are not defined
        if (typeof(params.params) === 'undefined') {
            params.params = '';
        }
        // method and resource must be set for request to be sent
        if (typeof(params.method) === 'undefined') {
            console.log('command error: "method" parameter is missing.');
        } else if (typeof(params.resource) === 'undefined') {
            console.log('command error: "resource" parameter is missing.');
        } else {
            this.request_processor(params.method, params.resource, params.params, params.callback);
        }   
    }
    send(params) {
        if (typeof(params.params) !== 'undefined') {
            params.params = querystring.stringify(params.params)
        }
        this.send_raw(params)
    }
    priceUpdate(update) {
        try {
            var jsonData = JSON.parse(update);
            // JavaScript floating point arithmetic is not accurate, so we need to round rates to 5 digits
            // Be aware that .toFixed returns a String
            jsonData.Rates = jsonData.Rates.map(function(element){
                return element.toFixed(5);
            });
            console.log(`@${jsonData.Updated} Price update of [${jsonData.Symbol}]: ${jsonData.Rates}`);
        } catch (e) {
            console.log('price update JSON parse error: ', e);
            return;
        }
    }
    subscribe(pairs) {
        var callback = (statusCode, requestID, data) => {
            if (statusCode === 200) {
                try {
                    var jsonData = JSON.parse(data);
                } catch (e) {
                    console.log('subscribe request #', requestID, ' JSON parse error: ', e);
                    return;
                }
                if(jsonData.response.executed) {
                    try {
                        for(var i in jsonData.pairs) {
                            this.socket.on(jsonData.pairs[i].Symbol, this.priceUpdate);
                        }
                    } catch (e) {
                        console.log('subscribe request #', requestID, ' "pairs" JSON parse error: ', e);
                        return;
                    }
                } else {
                    console.log('subscribe request #', requestID, ' not executed: ', jsonData);
                }
            } else {
                console.log('subscribe request #', requestID, ' execution error: ', statusCode, ' : ', data);
            }
        }
        this.send({ "method":"POST", "resource":"/subscribe", "params": pairs, "callback":callback })
    }
    unsubscribe(pairs) {
        var callback = (statusCode, requestID, data) => {
            if (statusCode === 200) {
                try {
                    var jsonData = JSON.parse(data);
                } catch (e) {
                    console.log('unsubscribe request #', requestID, ' JSON parse error: ', e);
                    return;
                }
                if(jsonData.response.executed) {
                    try {
                        for(var i in jsonData.pairs) {
                            this.socket.off(jsonData.pairs[i], this.priceUpdate);
                        }
                    } catch (e) {
                        console.log('unsubscribe request #', requestID, ' "pairs" JSON parse error: ', e);
                        return;
                    }
                } else {
                    console.log('unsubscribe request #', requestID, ' not executed: ', jsonData);
                }
            } else {
                console.log('unsubscribe request #', requestID, ' execution error: ', statusCode, ' : ', data);
            }
        }
        this.send({ "method":"POST", "resource":"/unsubscribe", "params": { "pairs":pairs }, "callback":callback })
    }

    // FXCM REST API requires socket.io connection to be open for requests to be processed
    // id of this connection is part of the Bearer authorization
    authenticate() {
        this.socket = socketioclient(trading_api_proto + '://' + trading_api_host + ':' + trading_api_port, {
			query: {
				access_token: token
			},
            jsonp: false, transports: ['websocket']
		});

        // fired when socket.io connects with no errors
        this.socket.on('connect', () => {
            console.log('Socket.IO session has been opened: ', this.socket.id);
            this.request_headers.Authorization = 'Bearer ' + this.socket.id + token;
        });
        // fired when socket.io cannot connect (network errors)
        this.socket.on('connect_error', (error) => {
            console.log('Socket.IO session connect error: ', error);
        });
        // fired when socket.io cannot connect (login errors)
        this.socket.on('error', (error) => {
            console.log('Socket.IO session error: ', error);
        });
        // fired when socket.io disconnects from the server
        this.socket.on('disconnect', () => {
            console.log('Socket disconnected, terminating client.');
            // process.exit(-1);
        });
    }
    get RequestUriString(): string {
        throw new Error("Method not implemented.");
    }
    GetMarketData(): Promise<MarketData[]> {
        throw new Error("Method not implemented.");
    }
}