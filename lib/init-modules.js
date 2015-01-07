define(function (require, exports, module) {
    module.exports = function () {
        var Router = require('ext/caoutchouc/router');

        var router = new Router();
        var plugins = [
            require('modules/player-controls'),
            require('modules/wikipedia'),
            require('modules/lyrics'),
            require('modules/lastfm'),
            require('modules/artist'),
            require('modules/album'),
            require('modules/hotkeys'),
            require('modules/notifications'),
            require('modules/popup-update'),
        ];

        for (var i in plugins) {
            var instance = new plugins[i](router);
            router.registerModule(instance);
        }

        return router;
    };
});