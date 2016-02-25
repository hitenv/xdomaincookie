/**
 * Created by Hiten on 27/11/2015.
 */
/*jslint browser: true */
/*global console: false */
var xDomainCookie = xDomainCookie === undefined ? {} : xDomainCookie;

xDomainCookie.consumer = {};

xDomainCookie.consumer.init = function(url, callback, debug){
    window.onload = function() {
        var iframe = document.createElement('iframe');
        iframe.id = 'xDomainCookieIframe';

        if (debug === true){
            iframe.style.display = 'block';
            iframe.style.width = '100%';
            iframe.style.height = '300px';
        } else {
            iframe.style.display = 'none';
        }

        iframe.src = url;

        document.body.appendChild(iframe);

        if (callback){
            callback();
        }
    };
};

xDomainCookie.consumer.receiver = function(callback, debug){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

    eventer(messageEvent,function(e) {
        if (debug === true){
            console.log(e);
        }


        if (typeof e.data === 'object') {
            if (e.data.type === 'xDomainCookie') {
                callback(e);
            }
        }
    });
};

xDomainCookie.consumer.create = function(key, value, expiration){
    var messageId = Math.random();
    var payload = {
        type : 'xDomainCookie',
        messageId : messageId,
        action : 'create',
        data: {
            key: key,
            value: value,
            expiration: expiration
        }
    };

    xDomainCookie.consumer.sendMessageToHost(payload);

    return messageId;
};

xDomainCookie.consumer.destroy = function(key){
    var messageId = Math.random();

    var payload = {
        type : 'xDomainCookie',
        messageId : messageId,
        action : 'destroy',
        data: {
            key: key
        }
    };

    xDomainCookie.consumer.sendMessageToHost(payload);

    return messageId;
};

xDomainCookie.consumer.retrieve = function(key){
    var messageId = Math.random();

    var payload = {
        type : 'xDomainCookie',
        messageId : messageId,
        action : 'retrieve',
        data: {
            key: key
        }
    };

    xDomainCookie.consumer.sendMessageToHost(payload);

    return messageId;
};

xDomainCookie.consumer.sendMessageToHost = function (message){
    var ifr = document.getElementById('xDomainCookieIframe');

    ifr.contentWindow.postMessage(message, '*');
};
