define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Browser = require('../ext/caoutchouc/browser');
    var NotificationsApi = Browser.get('notifications');
    var Templating = require('../ext/caoutchouc/templating');
    var I18n = require('../ext/caoutchouc/browser').get('i18n');

    var Notifications = function (router) {
        Abstract.call(this, router);
        this.id = 'notifications';
        this.name = 'i18n_notifications';
        this.enabled = true;
        this.context = {
            notificationId: null,
            artist: null,
            album: null,
            track: null,
            albumArt: null,
            state: 'stopped',
            settings: {
                enabled: true,
            },
        };
    };

    var action = function (action) {
        this.router.dispatch({name: action});
    };

    var showNotification = function () {
        var title = '', playPauseHint;

        if (this.context.state === 'playing') {
            title = '▶ ';
        } else {
            title = '❚❚ ';
        }

        title = title + this.context.track;

        if (this.context.state === null) {
            playPauseHint = I18n.get('i18n_PlayPause');
        } else if (this.context.state === 'playing') {
            playPauseHint = I18n.get('i18n_pause');
        } else {
            playPauseHint = I18n.get('i18n_play');
        }

        return NotificationsApi.send('now_playing', title,
            this.context.artist + '\n' + this.context.album,
            this.context.albumArt, [
                {
                    title: playPauseHint,
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

    Notifications.prototype = Object.create(Abstract.prototype);

    Notifications.prototype.routes = {};

    Notifications.prototype.routes.player_song_changed = function (options) {
        if (!this.context.settings.enabled) {
            return;
        }

        if (this.context.notificationId !== null) {
            NotificationsApi.hide(this.context.notificationId);
        }

        this.context.artist = options.data.artist;
        this.context.album = options.data.album;
        this.context.track = options.data.track;
        this.context.albumArt = options.data.album_art;


        showNotification.bind(this)();
    };

    Notifications.prototype.routes.player_state_changed = function (opt) {
        if (this.context.state == opt.data ||
            this.context.artist === null ||
            this.context.album === null ||
            this.context.track === null) {
            console.log('ignoring');
            return;
        }

        this.context.state = opt.data;

        NotificationsApi.hide(this.context.notificationId);
        showNotification.bind(this)();
    };

    Notifications.prototype.routes.player_unload = function (options) {
        if (this.context.notificationId !== null) {
            NotificationsApi.hide(this.context.notificationId);
        }

        this.context.notificationId = null;
        this.context.artist = null;
        this.context.album = null;
        this.context.track = null;
        this.context.albumArt = null;
        this.context.state = 'stopped';

    };

    Notifications.prototype.settingsPage = function () {
        return Templating.render('templates/settings-notifications.mst',
            this.context);
    };

    module.exports = Notifications;
});