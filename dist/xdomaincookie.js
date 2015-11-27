/*! xdomaincookie - v0.0.1 - 2015-11-27
* Copyright (c) 2015 ; Licensed  */
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

        callback(e);
    });
};

xDomainCookie.consumer.create = function(key, value, expiration){
    var messageId = Math.random();
    var payload = {
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

/*jslint browser: true */

var xDomainCookie = xDomainCookie === undefined ? {} : xDomainCookie;

xDomainCookie.host = {};

xDomainCookie.host.create = function(key, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = key + "=" + value + "; " + expires + '; Path=/;';
};

xDomainCookie.host.destroy = function(key) {
    document.cookie = key +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

xDomainCookie.host.retrieve = function(key) {
    var name = key + "=";

    var ca = document.cookie.split(';');

    for(var i=0; i<ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0)===' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }

    return '';
};

xDomainCookie.host.sendCookieToConsumer = function(key, action, status, messageId){
    var cookie = xDomainCookie.host.retrieve(key);

    var message = {
        messageId: messageId,
        status: status,
        action: action,
        cookie: cookie
    };

    xDomainCookie.host.sendMessageToConsumer(message);
};

xDomainCookie.host.sendMessageToConsumer = function (message){
    parent.postMessage(message,'*');
};

xDomainCookie.host.init = function(callback){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

    eventer(messageEvent,function(e) {
        if (e.data){
            if (e.data.data && e.data.data){
                switch (e.data.action){
                    case 'destroy': xDomainCookie.host.destroy(e.data.data.key); xDomainCookie.host.sendCookieToConsumer(e.data.data.key, 'destroy', true, e.data.messageId); break;
                    case 'retrieve': xDomainCookie.host.retrieve(e.data.data.key);  xDomainCookie.host.sendCookieToConsumer(e.data.data.key, 'retrieve', true, e.data.messageId); break;
                    case 'create': xDomainCookie.host.create(e.data.data.key, e.data.data.value, e.data.data.expiration); xDomainCookie.host.sendCookieToConsumer(e.data.data.key, 'create', true, e.data.messageId); break;
                }
            }
        }

        if (callback){
            callback(e);
        }
    });
};