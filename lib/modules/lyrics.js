define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating/templating');
    var LyricsApi = require('../wrappers/meta-lyrics');

    var currentArtist = null;
    var currentTrack = null;

    var Lyrics = function (router) {
        Abstract.call(this, router);
        this.name = 'Lyrics';
        this.enabled = true;
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
        if (currentArtist != options.data.artist ||
            currentTrack != options.data.track) {
            currentArtist = options.data.artist;
            currentTrack = options.data.track;
            this._reload();
        }
    };

    Lyrics.prototype.showLyrics = function(options, lyrics) {
        return Templating.render('templates/lyrics.mst', {
            lyrics: lyrics,
        }, function (view) {
            this.router.sendResponse(options, 'view', view);
        }.bind(this));
    };

    Lyrics.prototype.routes.lyrics_page = function (options) {
        if (currentArtist === null || currentTrack === null) {
            return Templating.render('templates/lyrics-default.mst', {},
                function (view) {
                    this.router.sendResponse(options, 'view', view);
            }.bind(this));
        }

        return LyricsApi.getLyrics(currentArtist, currentTrack,
            function (lyrics, error) {
                if (error) {
                    return Templating.render('templates/lyrics-error.mst', {
                    }, function (view) {
                       this.router.sendResponse(options, 'view', view);
                    }.bind(this));
                }

                return this.showLyrics(options, lyrics);
            }.bind(this));
    };

    module.exports = Lyrics;
});