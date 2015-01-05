define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var NotificationsApi = require('../ext/caoutchouc/browser')
        .get('notifications');
    var I18n = require('../ext/caoutchouc/browser').get('i18n');

    var lastNotificationId = null;

    var Notifications = function (router) {
        Abstract.call(this, router);
        this.name = 'Notifications';
        this.enabled = true;
    };

    var action = function (action) {
        this.router.dispatch({name: action});
    };

    Notifications.prototype = Object.create(Abstract.prototype);

    Notifications.prototype.routes = {};

    Notifications.prototype.routes.player_song_changed = function (options) {
        if (lastNotificationId !== null) {
            NotificationsApi.hide(lastNotificationId);
        }

        return NotificationsApi.send(options.data.track,
            options.data.artist + '\n' + options.data.album,
            options.data.album_art, [
                {
                    title: I18n.get('i18n_PlayPause'),
                    cb: action.bind(this, 'controls_playpause')
                },
                {
                    title: I18n.get('i18n_Next'),
                    cb: action.bind(this, 'controls_next')
                }
            ], function (id) {
                lastNotificationId = id;
            });
    };

    module.exports = Notifications;
});