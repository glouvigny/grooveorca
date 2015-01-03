/* jshint moz: true */
try {
    window.mozContact = window.mozContact;

    var recvs = [];

    var Messaging = {
        send: function (options) {
            self.port.emit('message', options);
        },

        recv: function (options) {
            for each (var recv in recvs) {
                recv(options);
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