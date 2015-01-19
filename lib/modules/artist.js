define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var MetaMusicApi = require('../wrappers/meta-music-api');

    var Artist = function (router) {
        Abstract.call(this, router);
        this.name = 'Artist';
        this.id = 'artist';
        this.enabled = true;
        this.context = {
            artistId: null,
            albumId: null,
            artist: null,
            site: null,
        };
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
        this.context.albumId = options.data.album_id;

        if (this.context.artistId != options.data.artist_id ||
            this.context.site != options.data.site) {

            this.context.artistId = options.data.artist_id;
            this.context.site = options.site;
            this.context.artist = null;
        }

        this._reload(options);
    };

    Artist.prototype.routes.artist_page = function(options) {
        if (this.context.artist === false) {
            return Templating.render('templates/artist-not-found.mst', {})
                .then(function (view) {
                    this.router.sendResponse(options, 'view', view);
                }.bind(this));
        }

        if (this.context.artist === null) {
            return MetaMusicApi.getArtist(this.context.site,
                this.context.artistId)
                .then(function (data) {
                    if (!data) {
                        data = false;
                    }

                    this.context.artist = data;
                    this._reload(options);
                }.bind(this));
        }

        return Templating.render('templates/artist.mst', this.context)
            .then(function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this));
    };

    module.exports = Artist;
});