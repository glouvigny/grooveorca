try {
    if (chrome === undefined || chrome.i18n === undefined) {
        throw new Error();
    }

    var Messaging = {};

    var recvs = [];

    Messaging.send = function (options) {
        options.origin = 'foreground';

        chrome.runtime.sendMessage(options, function (response) {});
    };

    Messaging.recv = function (options, sender, cb) {
        if (typeof options !== 'object' || options.origin == 'foreground') {
            return false;
        }


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

    chrome.runtime.onMessage.addListener(Messaging.recv);
} catch (e) {
}