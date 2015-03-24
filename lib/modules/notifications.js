define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var NotificationsApi = require('../ext/caoutchouc/browser')
        .get('notifications');
    var Templating = require('../ext/caoutchouc/templating');
    var I18n = require('../ext/caoutchouc/browser').get('i18n');

    var Notifications = function (router) {
        Abstract.call(this, router);
        this.id = 'notifications';
        this.name = 'i18n_notifications';
        this.enabled = true;
        this.context = {
            notificationId: null,
            settings: {
                enabled: true,
            },
        };
    };

    var action = function (action) {
        this.router.dispatch({name: action});
    };

    Notifications.prototype = Object.create(Abstract.prototype);

    Notifications.prototype.routes = {};

    Notifications.prototype.routes.player_song_changed = function (options) {
        if (!this.context.settings.enabled) {
            return;
        }

        if (this.context.notificationId !== null) {
            NotificationsApi.hide(this.context.notificationId);
        }

        return NotificationsApi.send('now_playing', options.data.track,
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
                this.context.notificationId = id;
            }.bind(this)
        );
    };

    Notifications.prototype.routes.player_unload = function (options) {
        if (this.context.notificationId !== null) {
            NotificationsApi.hide(this.context.notificationId);
        }

        this.context.notificationId = null;
    };

    Notifications.prototype.settingsPage = function () {
        return Templating.render('templates/settings-notifications.mst',
            this.context);
    };

    module.exports = Notifications;
});