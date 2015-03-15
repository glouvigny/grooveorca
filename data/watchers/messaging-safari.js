try {
    if (safari === undefined || safari.self === undefined) {
        throw new Error();
    }

    var Messaging = {};

    var isPopup = function () {
        var ret = false;

        try {
            ret = !!(safari &&
                safari.extension &&
                safari.extension.globalPage);
        } catch (e) {
        }

        return ret;
    };

    var recvs = [];

    Messaging.send = function (options) {
        options.origin = 'foreground';

        console.log(['send', options]);

        if (isPopup()) {
            safari.extension.globalPage.contentWindow.router.dispatch(options);
        } else {
            safari.self.tab.dispatchMessage('message', options);
        }
    };

    Messaging.recv = function (options) {
        if (!isPopup()) {
            options = options.message;
        }

        if (typeof options !== 'object' || options.origin == 'foreground') {
            return false;
        }

        console.log(['recv', options]);

        for (var i = recvs.length - 1; i >= 0; i--) {
            var recv = recvs[i];
            recv(options);
        }
    };

    Messaging.addRecv = function (recv) {
        recvs.push(recv);
    };

    Messaging.removeRecv = function (recv) {
        var pos = recvs.indexOf(recv);

        recvs.splice(pos, 1);
    };

    safari.self.addEventListener('message', Messaging.recv, false);
} catch (e) {
}