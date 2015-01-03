define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating/templating');
    var MetaMusicApi = require('../wrappers/meta-music-api');

    var albumId = null;
    var site = null;
    var album = null;
    var trackId = null;

    var Album = function (router) {
        Abstract.call(this, router);
        this.name = 'Album';
        this.enabled = true;
    };

    Album.prototype = Object.create(Abstract.prototype);

    Album.prototype._reload = function () {
        this.router.dispatch({
            stack: 'album_page',
            name: 'album_page',
            action: 'replace-first',
        });
    };

    Album.prototype.routes = {};
    Album.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': 'Album',
            'icon': 'icon-cd',
            'view': 'album_page',
            'action': 'replace-first',
        });

        this._reload(options);
    };

    Album.prototype.routes.player_song_changed = function (options) {
        trackId = options.data.track_id;

        if (albumId != options.data.album_id ||
            site != options.data.site) {

            albumId = options.data.album_id;
            site = options.site;
            album = null;
        }

        this._reload(options);
    };

    Album.prototype.routes.album_page = function(options) {
        if (album === false) {
            return Templating.render('templates/album-not-found.mst', {},
                function (view) {
                    this.router.sendResponse(options, 'view', view);
            }.bind(this));
        }

        if (album === null) {
            return MetaMusicApi.getAlbum(site, albumId, function (data) {
                if (!data) {
                    data = false;
                }

                album = data;
                this._reload(options);
            }.bind(this));
        }

        return Templating.render('templates/album.mst', {
                album: album,
                current_track_id: trackId,
            }, function (view) {
                this.router.sendResponse(options, 'view', view);
        }.bind(this));
    };

    module.exports = Album;
});