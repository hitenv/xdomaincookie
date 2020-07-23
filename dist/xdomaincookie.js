/*! xdomaincookie - v0.0.12 - 2020-07-17
* Copyright (c) 2020 ; Licensed  */
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
    var topDomain = '';
    if (hostParts.length > 1){
        topDomain = '.'+hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1];
    } else {
        topDomain = hostParts[0];
    }

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

/*jslint browser: true */


var xDomainCookie = xDomainCookie === undefined ? {} : xDomainCookie;

xDomainCookie.host = {};

xDomainCookie.host.create = function (key, value, exdays) {
    var d = new Date(exdays.expires);
    var hostParts = document.location.hostname.split('.');
    var topDomain = '';

    var path = 'path=/;';
    var keyVal = key + '=' + value + ';';
    var expires = 'expires=' + d.toUTCString() + ';';
    var sameSite = 'SameSite=None;';
    var secure = 'Secure;';

    if (hostParts.length > 1) {
        topDomain = 'domain=' + '.' + hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1] + ';';
    } else {
        topDomain = 'domain=' + hostParts[0] + ';';
    }

    document.cookie = keyVal + expires + topDomain + path + sameSite + secure;
};

xDomainCookie.host.destroy = function (key) {
    var hostParts = document.location.hostname.split('.');
    var topDomain = '';
    var sameSite = 'SameSite=None;';
    var secure = 'Secure;';

    if (hostParts.length > 1) {
        topDomain = '.' + hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1];
    } else {
        topDomain = hostParts[0];
    }

    document.cookie = key + '=; domain=' + topDomain + ';path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;' + sameSite + secure;
};

xDomainCookie.host.retrieve = function (key) {
    var name = key + "=";

    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }

    return '';
};

xDomainCookie.host.sendCookieToConsumer = function (key, action, status, messageId) {
    var cookie = xDomainCookie.host.retrieve(key);

    var message = {
        type: 'xDomainCookie',
        messageId: messageId,
        status: status,
        action: action,
        cookie: cookie
    };

    xDomainCookie.host.sendMessageToConsumer(message);
};

xDomainCookie.host.sendMessageToConsumer = function (message) {
    parent.postMessage(message, '*');
};

xDomainCookie.host.init = function (callback) {
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

    eventer(messageEvent, function (e) {
        if (typeof e.data === 'object') {
            if (e.data.type === 'xDomainCookie') {
                if (e.data) {
                    if (e.data.data && e.data.data) {
                        switch (e.data.action) {
                            case 'destroy': xDomainCookie.host.destroy(e.data.data.key); xDomainCookie.host.sendCookieToConsumer(e.data.data.key, 'destroy', true, e.data.messageId); break;
                            case 'retrieve': xDomainCookie.host.retrieve(e.data.data.key); xDomainCookie.host.sendCookieToConsumer(e.data.data.key, 'retrieve', true, e.data.messageId); break;
                            case 'create': xDomainCookie.host.create(e.data.data.key, e.data.data.value, e.data.data.expiration); xDomainCookie.host.sendCookieToConsumer(e.data.data.key, 'create', true, e.data.messageId); break;
                        }
                    }
                }

                if (callback) {
                    callback(e);
                }
            }
        }
    });
};

window.xDomainCookie = xDomainCookie;
