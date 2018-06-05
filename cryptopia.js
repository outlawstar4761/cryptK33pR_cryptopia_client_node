//todo REMEMBER YOU OUGHT TO RESOLVE data.Data instead of data

var self = this;
self.https = require('https');
self.crypto = require('crypto');
self.apiBase = 'https://www.cryptopia.co.nz/api/';
self.hostname = 'www.cryptopia.co.nz';
self.port = '443';
self.publicKey = '12345';
self.privateKey = '12345';
self.publicMethods = [
    "GetCurrencies",
    "GetTradePairs",
    "GetMarkets",
    "GetMarket",
    "GetMarketHistory",
    "GetMarketOrders"
];
self.privateMethods = [
    "GetBalance",
    "GetDepositAddress",
    "GetOpenOrders",
    "GetTradeHistory",
    "GetTransactions",
    "SubmitTrade",
    "CancelTrade",
    "SubmitTip",
    "SubmitWithdraw",
    "SubmitTransfer"
];
self.getUrl = function(url){
    return new Promise(function(resolve,reject){
        self.https.get(url,function(response){
            let data = '';
            response.on('data',function(chunk){
                data += chunk;
            });
            response.on('end',function(){
                resolve(JSON.parse(data));
            });
        }).on('error',function(err){
            reject(err.message);
        });
    });
}
self.postUrl = function(method,params){
    return new Promise(function(resolve, reject){
        const https = require('https');
        var options = {
            hostname:self.hostname,
            port:self.port,
            path:'/Api/' + method,
            method:'POST',
            headers:{
                'Content-Type':'application/json; charset=utf-8',
                "Content-Length": Buffer.byteLength(JSON.stringify(params)),
                "Authorization":self.buildAuthHeader(method,params)
            }
        };
        var req = https.request(options,function(response){
            let data = '';
            response.on('data',function(chunk){
                data += chunk;
            });
            response.on('end',function(){
                resolve(JSON.parse(data));
            });
        }).on('error',function(err){
            reject(err.message);
        });
        req.write(JSON.stringify(params));
    });
}
self.apiCall = function(method,params){
    var uri = self.apiBase + method;
    if(self.publicMethods.indexOf(method) > -1){
        if(params){
            uri += '/' + params.join('/');
        }
        return new Promise(function(resolve, reject){
            self.getUrl(uri).then(function(data){
                resolve(data);
            },function(err){
                reject(err);
            });
        });
    }else if(self.privateMethods.indexOf(method) > -1){
        if(!params){
            params = {};
        }
        return new Promise(function(resolve, reject){
            self.postUrl(method,params).then(function(data){
                resolve(data);
            },function(err){
                reject(err);
            });
        });
    }else{
        throw new Error('Invalid API Method');
    }
}
self.buildAuthHeader = function(method,params){
    var publicKey = self.publicKey;
    var privateKey = self.privateKey;
    var urlBase = self.apiBase + method;
    var postData = params;
    var md5 = self.crypto.createHash('md5').update(JSON.stringify(postData)).digest('binary');
    var requestContentBase64String = md5.toString('base64');
    var nonce = Math.floor(new Date().getTime() / 1000);
    var md5 = self.crypto.createHash('md5').update(JSON.stringify(postData)).digest();
    var requestContentBase64String = md5.toString('base64');
    var signature = publicKey + 'POST' + encodeURIComponent(urlBase).toLowerCase() + nonce + requestContentBase64String;
    var hmacSignature = self.crypto.createHmac('sha256', new Buffer( privateKey, "base64" ) ).update( signature ).digest().toString('base64');
    var headerValue = 'amx ' + publicKey + ":" + hmacSignature + ":" + nonce;
    return headerValue;
}


/* PUBLIC */

self.getCurrencies = function(){
    return new Promise(function(resolve,reject){
        self.apiCall("GetCurrencies").then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getTradePairs = function(){
    return new Promise(function(resolve,reject){
        self.apiCall("GetTradePairs").then(function(data){
            resolve(data.Data);
        },function(err){
            reject(err);
        });
    });
}
self.getMarkets = function(baseMarket = '',hours = 24){
    return new Promise(function(resolve, reject){
        var params = [baseMarket,hours];
        self.apiCall("GetMarkets",params).then(function(data){
            resolve(data.Data);
        },function(err){
            resolve(err);
        });
    });
}
self.getMarket = function(market,hours = 24){
    return new Promise(function(resolve,reject){
        var params = [market,hours];
        self.apiCall("GetMarket",params).then(function(data){
            resolve(data.Data);
        },function(err){
            reject(err);
        });
    });
}
self.getMarketHistory = function(market,hours = 24){
    return new Promise(function(resolve, reject){
        var params = [market,hours];
        self.apiCall("GetMarketHistory",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getMarketOrders = function(market,limit = 100){
    return new Promise(function(resolve, reject){
        var params = [market,limit];
        self.apiCall("GetMarketOrders",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getMarketOrderGroups = function(){}


/* PRIVATE */

self.getBalance = function(currency = null){
    return new Promise(function(resolve, reject){
        var params = {};
        if(currency){
            params.currency = currency;
        }
        self.apiCall("GetBalance",params).then(function(data){
            resolve(data.Data);
        },function(err){
            reject(err);
        });
    });
}
self.getDepositAddress = function(currency){
    return new Promise(function(resolve, reject){
        var params = {"Currency":currency}
        self.apiCall("GetDepositAddress",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.getOpenOrders = function(market,limit = 100){
    return new Promise(function(resolve, reject){
        var params = {"Market":market,"Count":limit};
        self.apiCall("GetOpenOrders",params).then(function(data){
            resolve(data.Data);
        },function(err){
            reject(err);
        });
    });
}
self.getTradeHistory = function(market,limit = 100){
    return new Promise(function(resolve, reject){
        var params = {"Market":market,"Count":limit};
        self.apiCall("GetTradeHistory",params).then(function(data){
            resolve(data.Data);
        },function(err){
            reject(err);
        });
    });
}
self.getTransactions = function(type,limit = 100){
    return new Promise(function(resolve, reject){
        var params = {"Type":type,"Count":limit};
        self.apiCall("GetTransactions",params).then(function(data){
            resolve(data.Data);
        },function(err){
            reject(err);
        });
    });
}
self.submitTrade = function(market,type,rate,amount){
    return new Promise(function(resolve, reject){
        var params = {"Market":market,"Type":type,"Rate":rate,"Amount":amount};
        self.apiCall("SubmitTrade",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.cancelTrade = function(type){
    return new Promise(function(resolve, reject){
        var params = {"Type":type};
        //todo handle teh ids
        self.apiCall("CancelTrade",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.submitTip = function(currency,userLimit,amount){
    return new Promise(function(resolve, reject){
        var params = {Currency:currency,ActiveUsers:userLimit,Amount:amount};
        self.apiCall("SubmitTip",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.submitWithdraw = function(currency,amount,address,paymentId){
    return new Promise(function(resolve, reject){
        var params = {Currency:currency,Amount:amount,Address:address,PaymentId:paymentId};
        self.apiCall("SubmitWithdraw",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}
self.submitTransfer = function(currency,username,amount){
    return new Promise(function(resol){
        var params = {Currency:currency,Username:username,Amount:amount};
        self.apiCall("SubmitTransfer",params).then(function(data){
            resolve(data);
        },function(err){
            reject(err);
        });
    });
}

module.exports = self;