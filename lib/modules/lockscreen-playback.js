define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Browser = require('../ext/caoutchouc/browser');
    var Templating = require('../ext/caoutchouc/templating');
    var IdleApi = Browser.get('idle');

    var LockscreenPlayback = function (router) {
        Abstract.call(this, router);
        this.id = 'lockscreen_playback';
        this.name = 'i18n_lockscreen_playback';
        this.enabled = true;
        this.context = {
            settings: {
                enabled: true,
            },
        };

        IdleApi.register(pauseOnLock.bind(this));
    };

    var pauseOnLock = function (state) {
        if (state === 'locked' && this.context.settings.enabled) {
            this.router.sendResponse(
                {api_action: 'pause'},
                'player_control',
                'pause'
            );
        };
    }

    LockscreenPlayback.prototype = Object.create(Abstract.prototype);

    LockscreenPlayback.prototype.routes = {};

    LockscreenPlayback.prototype.settingsPage = function () {
        return Templating.render('templates/settings-lockscreen.mst',
            this.context);
    };

    module.exports = LockscreenPlayback;
});