define(function (require, exports, module) {
    module.exports = function () {
        var Router = require('ext/caoutchouc/router');

        var router = new Router([
            require('modules/player-controls'),
            require('modules/wikipedia'),
            require('modules/lyrics'),
            require('modules/lastfm'),
            require('modules/artist'),
            require('modules/album'),
            require('modules/hotkeys'),
            require('modules/notifications'),
            require('modules/settings'),
            require('modules/popup-update'),
        ]);

        return router;
    };
});