define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var MetaMusicApi = require('../wrappers/meta-music-api');

    var Album = function (router) {
        Abstract.call(this, router);
        this.name = 'Album';
        this.enabled = true;
        this.context = {
            albumId: null,
            site: null,
            album: null,
            trackId: null,
        };
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
        this.context.trackId = options.data.track_id;

        if (this.context.albumId != options.data.album_id ||
            this.context.site != options.data.site) {

            this.context.albumId = options.data.album_id;
            this.context.site = options.site;
            this.context.album = null;
        }

        this._reload(options);
    };

    Album.prototype.routes.album_page = function(options) {
        if (this.context.album === false) {
            return Templating.render('templates/album-not-found.mst', {},
                function (view) {
                    this.router.sendResponse(options, 'view', view);
            }.bind(this));
        }

        if (this.context.album === null) {
            return MetaMusicApi.getAlbum(this.context.site,
                this.context.albumId, function (data) {
                    if (!data) {
                        data = false;
                    }

                    this.context.album = data;
                    this._reload(options);
                }.bind(this)
            );
        }

        return Templating.render('templates/album.mst', this.context,
            function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this)
        );
    };

    module.exports = Album;
});