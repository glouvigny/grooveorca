define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var LastfmApi = require('../api/lastfm');
    var Tabs = require('../ext/caoutchouc/browser').get('tabs');
    var Persistance = require('../ext/caoutchouc/browser').get('persistance');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var current = {
        artist: '',
        track: '',
        album: '',
        duration: 0,
    };

    var position = 0;
    var start_timestamp = 0;
    var scrobbled = false;
    var loved = false;
    var playcount_track = 0;
    var playcount_artist = 0;
    var wiki_track = null;
    var wiki_artist = null;

    var token = null;
    var username = null;

    Persistance.get('lastfm_session', null, function (lastfm_session) {
        Persistance.get('lastfm_username', null, function (lastfm_username) {
            if (typeof lastfm_session === 'string' &&
                typeof lastfm_username === 'string') {
                LastfmApi.setSession(lastfm_session, lastfm_username);
                username = lastfm_username;
            }
        });
    });

    var Lastfm = function (router) {
        Abstract.call(this, router);
        this.name = 'Last.fm';
        this.enabled = true;
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
        action(current, function (data) {
            if (data.error === undefined) {
                loved = !loved;
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
        current = options.data;
        position = 0;
        start_timestamp = parseInt(Date.now() / 1000, 10);

        LastfmApi.track.updateNowPlaying(current);
        return LastfmApi.artist.getInfo(current, 'en', function (data) {
            playcount_artist = parseInt(data.artist.stats.userplaycount, 10) ||
                0;

            if (data.artist.bio) {
                var doc = Dom.parse(data.artist.bio.content, 'text/html');
                doc = DomUtils.newWindowLinks(doc);
                wiki_artist = doc.documentElement.outerHTML;
            } else {
                wiki_artist = null;
            }

            return LastfmApi.track.getInfo(current, 'en', function (data) {
                playcount_track = parseInt(data.track.userplaycount, 10) || 0;

                loved = data.track.userloved === '1';

                if (data.track.wiki) {
                    var doc = Dom.parse(data.track.wiki.content, 'text/html');
                    doc = DomUtils.newWindowLinks(doc);
                    wiki_track = doc.documentElement.outerHTML;
                } else {
                    wiki_track = null;
                }

                this._reload();
            }.bind(this));
        }.bind(this));
    };

    Lastfm.prototype.routes.player_position_changed = function (options) {
        position = options.data;
        var pos_dur = position / current.duration;

        if (pos_dur > 0.75 && scrobbled === false) {
            // Mark as scrobbled, obviously erronous data
            scrobbled = true;

        } else if (pos_dur < 0.25 && position < 240) {
            // Mark as not scrobbled, obviously erronous data
            scrobbled = false;

            // set start playing date
            var now = parseInt(Date.now() / 1000, 10);
            if ((now - start_timestamp) > (current.duration * 0.25)) {
                start_timestamp = now;
            }

        } else if (current.duration >= 30 && scrobbled === false &&
            (pos_dur >= 0.5 || position >= 240)) {
            scrobbled = true;
            LastfmApi.track.scrobble(current, start_timestamp);
        }
    };

    Lastfm.prototype.routes.lastfm_page = function (options) {
        return Templating.render('templates/lastfm-login.mst', {
            has_token: !!token,
            username: username,
            loved: loved,
            playcount_track: playcount_track,
            playcount_artist: playcount_artist,
            wiki_track: wiki_track,
            wiki_artist: wiki_artist,
        },
            function (view) {
                this.router.sendResponse(options, 'view', view);
        }.bind(this));
    };

    Lastfm.prototype.routes.lastfm_auth = function (options) {
        return LastfmApi.auth.getToken(function (data) {
            token = data.token;
            var url = LastfmApi.loginUrl(token);
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
        return LastfmApi.auth.getSession(token, function (data) {
            if (data.session === undefined) {
                return;
            }

            LastfmApi.setSession(data.session.key, data.session.name);
            Persistance.set('lastfm_session', data.session.key, function () {
                Persistance.set('lastfm_username', data.session.name);
            });

            username = data.session.name;
            this._reload();
        }.bind(this));
    };

    Lastfm.prototype.routes.lastfm_logout = function (options) {
        LastfmApi.setSession(null, null);
        token = null;
        username = null;

        return Persistance.set('lastfm_session', null, function () {
            return Persistance.set('lastfm_username', null, function () {
                return this._reload();
            }.bind(this));
        }.bind(this));
    };

    module.exports = Lastfm;
});