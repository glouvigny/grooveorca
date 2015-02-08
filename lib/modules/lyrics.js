define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var LyricsApi = require('../wrappers/meta-lyrics');

    var Lyrics = function (router) {
        Abstract.call(this, router);
        this.id = 'lyrics';
        this.name = 'Lyrics';
        this.enabled = true;
        this.context = {
            artist: null,
            track: null,
            url: null,
        };
    };

    Lyrics.prototype = Object.create(Abstract.prototype);

    Lyrics.prototype._reload = function () {
        this.router.dispatch({
            stack: 'lyrics_page',
            name: 'lyrics_page',
            action: 'replace-first',
        });
    };

    Lyrics.prototype.routes = {};
    Lyrics.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': 'Lyrics',
            'icon': 'icon-doc-text',
            'view': 'lyrics_page',
            'action': 'replace-first',
        });

        this._reload();
    };

    Lyrics.prototype.routes.player_song_changed = function (options) {
        if (this.context.artist != options.data.artist ||
            this.context.track != options.data.track) {
            this.context.artist = options.data.artist;
            this.context.track = options.data.track;
            this._reload();
        }
    };

    Lyrics.prototype.showLyrics = function(options, lyrics, url) {
        return Templating.render('templates/lyrics.mst', {
                lyrics: lyrics,
                url: url,
            })
            .then(function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this));
    };

    Lyrics.prototype.routes.lyrics_page = function (options) {
        if (this.context.artist === null || this.context.track === null) {
            return Templating.render('templates/lyrics-default.mst', {})
                .then(function (view) {
                    this.router.sendResponse(options, 'view', view);
                }.bind(this));
        }

        return LyricsApi.getLyrics(this.context.artist, this.context.track)
            .then(function (data) {
                return this.showLyrics(options, data.lyrics, data.url);
            }.bind(this))
            .catch(function () {
                return Templating.render('templates/lyrics-error.mst', {});
            })
            .then(function (view) {
                return this.router.sendResponse(options, 'view', view);
            }.bind(this));
    };

    module.exports = Lyrics;
});