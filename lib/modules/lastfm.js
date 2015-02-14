define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var LastfmApi = require('../api/lastfm');
    var Tabs = require('../ext/caoutchouc/browser').get('tabs');
    var Persistance = require('../ext/caoutchouc/browser').get('persistance');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var Lastfm = function (router) {
        Abstract.call(this, router);
        this.id = 'lastfm';
        this.name = 'Last.fm';
        this.enabled = true;

        this.context = {
            current: {
                artist: '',
                track: '',
                album: '',
                duration: 0,
            },
            position: 0,
            start_timestamp: 0,
            scrobbled: false,
            loved: false,
            playcount_track: 0,
            playcount_artist: 0,
            wiki_track: null,
            wiki_artist: null,
            artist_picture: null,
            token: null,
            username: null,
            settings: {
                scrobbling: true,
                language: 'en',
            },
        };

        var session = null;

        Persistance.get('lastfm_session', null)
            .then(function (s) {
                session = s;
                return Persistance.get('lastfm_username', null);
            }.bind(this))
            .then(function (username) {
                if (typeof session === 'string' &&
                    typeof username === 'string') {
                    LastfmApi.setSession(session, username);
                    this.context.username = username;
                }
            }.bind(this));
    };

    Lastfm.prototype = Object.create(Abstract.prototype);

    Lastfm.prototype._reload = function () {
        this.router.dispatch({
            stack: 'lastfm_page',
            name: 'lastfm_page',
            action: 'replace-first',
        });
    };

    Lastfm.prototype._loveUnlove = function (love) {
        var action = love ? LastfmApi.track.love : LastfmApi.track.unlove;

        return action(this.context.current)
            .then(function (data) {
                if (data.error === undefined) {
                    this.context.loved = !this.context.loved;
                    this._reload();
                } else {
                    console.error(data.error.message);
                }
            }.bind(this));
    };

    Lastfm.prototype.routes = {};
    Lastfm.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': 'Last.fm',
            'icon': 'icon-lastfm',
            'view': 'lastfm_page',
            'action': 'replace-first',
        });

        this._reload();
    };

    Lastfm.prototype.routes.player_song_changed = function (options) {
        this.context.current = options.data;
        this.context.position = 0;
        this.context.start_timestamp = parseInt(Date.now() / 1000, 10);

        LastfmApi.track.updateNowPlaying(this.context.current);
        return LastfmApi.artist.getInfo(this.context.current,
            this.context.settings.language)
            .then(function (data) {
                this.context.playcount_artist =
                    parseInt(data.artist.stats.userplaycount, 10) || 0;

                if (data.artist.bio) {
                    var doc = Dom.parse(data.artist.bio.content, 'text/html');
                    doc = DomUtils.newWindowLinks(doc);
                    this.context.wiki_artist = doc.documentElement.outerHTML;
                } else {
                    this.context.wiki_artist = null;
                }

                if (data.artist.image) {
                    for (var i in data.artist.image) {
                        this.context.artist_picture =
                            data.artist.image[i]['#text'];
                    }
                }

                return LastfmApi.track.getInfo(this.context.current,
                    this.context.settings.language);
            }.bind(this))
            .then(function (data) {
                this.context.playcount_track =
                    parseInt(data.track.userplaycount, 10) || 0;

                this.context.loved = data.track.userloved === '1';

                if (data.track.wiki) {
                    var doc = Dom.parse(data.track.wiki.content,
                        'text/html');
                    doc = DomUtils.newWindowLinks(doc);
                    this.context.wiki_track =
                        doc.documentElement.outerHTML;
                } else {
                    this.context.wiki_track = null;
                }

                this._reload();
            }.bind(this));
    };

    Lastfm.prototype.routes.player_position_changed = function (options) {
        if (this.context.current.duration < 30 ||
            this.context.username === null) {
            return false;
        }

        this.context.position = options.data;
        var pos_dur = this.context.position / this.context.current.duration;

        if (pos_dur > 0.75 && this.context.scrobbled === false) {
            // Mark as scrobbled, obviously erronous data
            this.context.scrobbled = true;

        } else if (pos_dur < 0.25 && this.context.position < 240) {
            // Mark as not scrobbled, obviously erronous data
            this.context.scrobbled = false;

            // set start playing date
            var now = parseInt(Date.now() / 1000, 10);
            if ((now - this.context.start_timestamp) >
                    (this.context.current.duration * 0.25)) {
                this.context.start_timestamp = now;
            }

        } else if (this.context.current.duration >= 30 &&
            this.context.scrobbled === false &&
            this.context.settings.scrobbling === true &&
            (pos_dur >= 0.5 || this.context.position >= 240)) {
            this.context.scrobbled = true;
            this.context.playcount_track++;
            this.context.playcount_artist++;
            LastfmApi.track.scrobble(this.context.current,
                this.context.start_timestamp);

            this._reload();
        }
    };

    Lastfm.prototype.routes.lastfm_page = function (options) {
        return Templating.render('templates/lastfm-login.mst', this.context)
            .then(function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this));
    };

    Lastfm.prototype.routes.lastfm_auth = function (options) {
        return LastfmApi.auth.getToken()
            .then(function (data) {
                this.context.token = data.token;
                var url = LastfmApi.loginUrl(this.context.token);
                Tabs.open(url);

                this._reload();
            }.bind(this));
    };

    Lastfm.prototype.routes.lastfm_love = function (options) {
        this._loveUnlove(true);
    };

    Lastfm.prototype.routes.lastfm_unlove = function (options) {
        this._loveUnlove(false);
    };

    Lastfm.prototype.routes.lastfm_check = function (options) {
        return LastfmApi.auth.getSession(this.context.token)
            .then(function (data) {
                if (data.session === undefined) {
                    return;
                }

                LastfmApi.setSession(data.session.key, data.session.name);

                Persistance.set('lastfm_session', data.session.key)
                    .then(function () {
                        return Persistance.set('lastfm_username',
                            data.session.name);
                    }.bind(this));

                this.context.username = data.session.name;
                this._reload();
            }.bind(this));
    };

    Lastfm.prototype.routes.lastfm_logout = function (options) {
        LastfmApi.setSession(null, null);
        this.context.token = null;
        this.context.username = null;

        return Persistance.set('lastfm_session', null)
            .then(function () {
                return Persistance.set('lastfm_username', null);
            }.bind(this))
            .then(function () {
                return this._reload();
            }.bind(this));
    };

    Lastfm.prototype.settingsPage = function () {
        return LastfmApi.languages()
            .then(function (languages) {
                return Templating.render('templates/settings-lastfm.mst',
                    {
                        'context': this.context,
                        'languages': languages,
                    });
            }.bind(this));
    };

    module.exports = Lastfm;
});