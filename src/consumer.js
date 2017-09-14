/**
 * Created by Hiten on 27/11/2015.
 */
/*jslint browser: true */
/*global console: false */
var xDomainCookie = xDomainCookie === undefined ? {} : xDomainCookie;

xDomainCookie.consumer = {};

xDomainCookie.consumer.iframes = [];
xDomainCookie.consumer.messages = {};

xDomainCookie.consumer.init = function (url, callback, debug) {

    var urls = [];

    if (Object.prototype.toString.call(url) === '[object Array]') {
        urls = url;
    }

    if (Object.prototype.toString.call(url) === '[object String]'){
        urls = [url];
    }


    var initialise = function () {
        for (var urlIndex in urls){
            
            var iframeIdentfier = 'xDomainCookieIframe_' + urlIndex; 

            xDomainCookie.consumer.iframes.push(iframeIdentfier);

            var iframe = document.createElement('iframe');
            iframe.id = iframeIdentfier;
    
            if (debug === true) {
                iframe.style.display = 'block';
                iframe.style.width = '100%';
                iframe.style.height = '300px';
            } else {
                iframe.style.display = 'none';
            }
    
            iframe.src = urls[urlIndex];
    
            document.body.appendChild(iframe);   
        }
        
        if (callback) {
            callback();
        }
    };

    if (window.attachEvent) { 
        window.attachEvent('onload', initialise); 
    } else if (window.addEventListener) { 
        window.addEventListener('load', initialise, false); 
    } else { 
        document.addEventListener('load', initialise, false); 
    }
};

xDomainCookie.consumer.receiver = function (callback, debug) {
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

    var hostParts = document.location.hostname.split('.');
    var topDomain = '.'+hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1];

    eventer(messageEvent, function (e) {
        if (debug === true) {
            console.log(e);
        }

        if (typeof e.data === 'object') {
            if (e.data.type === 'xDomainCookie') {
                
                var messageurl = document.createElement('a');
                messageurl.href=e.origin;

                var messageurlParts = messageurl.hostname.split('.');

                var messageurltopDomain = '.'+messageurlParts[messageurlParts.length - 2] + '.' + messageurlParts[messageurlParts.length - 1];
                
                if (xDomainCookie.consumer.messages.hasOwnProperty(e.data.messageId)){
                    xDomainCookie.consumer.messages[e.data.messageId].messagesRecieved = xDomainCookie.consumer.messages[e.data.messageId].messagesRecieved + 1;

                    if (messageurltopDomain === topDomain){
                        xDomainCookie.consumer.messages[e.data.messageId].e = e;
                    }
                    
                    if (xDomainCookie.consumer.messages[e.data.messageId].messagesRecieved === xDomainCookie.consumer.iframes.length){
                        var returnE = e;

                        if (xDomainCookie.consumer.messages[e.data.messageId].e !== null){
                            returnE = xDomainCookie.consumer.messages[e.data.messageId].e;
                        }

                        delete xDomainCookie.consumer.messages[e.data.messageId];

                        callback(returnE);
                    }
                }
            }
        }
    });
};

xDomainCookie.consumer.create = function (key, value, expiration) {
    var messageId = Math.random();
    var payload = {
        type: 'xDomainCookie',
        messageId: messageId,
        action: 'create',
        data: {
            key: key,
            value: value,
            expiration: expiration
        }
    };

    xDomainCookie.consumer.sendMessageToHost(payload);

    return messageId;
};

xDomainCookie.consumer.destroy = function (key) {
    var messageId = Math.random();

    var payload = {
        type: 'xDomainCookie',
        messageId: messageId,
        action: 'destroy',
        data: {
            key: key
        }
    };

    xDomainCookie.consumer.sendMessageToHost(payload);

    return messageId;
};

xDomainCookie.consumer.retrieve = function (key) {
    var messageId = Math.random();

    var payload = {
        type: 'xDomainCookie',
        messageId: messageId,
        action: 'retrieve',
        data: {
            key: key
        }
    };

    xDomainCookie.consumer.sendMessageToHost(payload);

    return messageId;
};

xDomainCookie.consumer.sendMessageToHost = function (message) {
    xDomainCookie.consumer.messages[message.messageId] = {
        message: message,
        messagesRecieved: 0,
        e: null 
    };

    for (var iframes in xDomainCookie.consumer.iframes){
        var ifr = document.getElementById(xDomainCookie.consumer.iframes[iframes]);
        
        ifr.contentWindow.postMessage(message, '*');
    }
};
