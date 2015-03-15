try {
    if (window.mozContact === undefined) {
        throw new Error();
    }

    var Messaging = {};

    var recvs = [];

    Messaging = {
        send: function (options) {
            self.port.emit('message', options);
        },

        recv: function (options) {
            for (var i in recvs) {
                if (recvs.hasOwnProperty(i)) {
                    var recv = recvs[i];
                    recv(options);
                }
            }
        },

        addRecv: function (recv) {
            recvs.push(recv);
        },

        removeRecv: function (recv) {
            var pos = recvs.indexOf(recv);

            recvs.splice(pos, 1);
        },
    };

    self.port.on('message', Messaging.recv);
} catch (e) {
}