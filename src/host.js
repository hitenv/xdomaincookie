/**
 * Created by Hiten on 27/11/2015.
 */
/*jslint browser: true */


var xDomainCookie = xDomainCookie === undefined ? {} : xDomainCookie;

xDomainCookie.host = {};

xDomainCookie.host.create = function (key, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
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
