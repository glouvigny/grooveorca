define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var MetaMusicApi = require('../wrappers/meta-music-api');

    var artistId = null;
    var albumId = null;
    var artist = null;
    var site = null;

    var Artist = function (router) {
        Abstract.call(this, router);
        this.name = 'Artist';
        this.enabled = true;
    };

    Artist.prototype = Object.create(Abstract.prototype);

    Artist.prototype._reload = function () {
        this.router.dispatch({
            stack: 'artist_page',
            name: 'artist_page',
            action: 'replace-first',
        });
    };

    Artist.prototype.routes = {};
    Artist.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': 'Artist',
            'icon': 'icon-user',
            'view': 'artist_page',
            'action': 'replace-first',
        });

        this._reload(options);
    };

    Artist.prototype.routes.player_song_changed = function (options) {
        albumId = options.data.album_id;

        if (artistId != options.data.artist_id ||
            site != options.data.site) {

            artistId = options.data.artist_id;
            site = options.site;
            artist = null;
        }

        this._reload(options);
    };

    Artist.prototype.routes.artist_page = function(options) {
        if (artist === false) {
            return Templating.render('templates/artist-not-found.mst', {},
                function (view) {
                    this.router.sendResponse(options, 'view', view);
            }.bind(this));
        }

        if (artist === null) {
            return MetaMusicApi.getArtist(site, artistId, function (data) {
                if (!data) {
                    data = false;
                }

                artist = data;
                this._reload(options);
            }.bind(this));
        }

        return Templating.render('templates/artist.mst', {
                artist: artist,
                current_album_id: albumId,
            }, function (view) {
                this.router.sendResponse(options, 'view', view);
        }.bind(this));
    };

    module.exports = Artist;
});