define(function (require, exports, module) {
    var CommonAlbumArtist = require('./common-album-artist');

    var Artist = function (router) {
        CommonAlbumArtist.call(this, router);
        this.id = 'artist';
        this.name = 'i18n_artist';
        this.enabled = true;

        this.template_file = 'templates/artist.mst';
        this.template_not_found_file = 'templates/artist-not-found.mst';
        this.stack_icon_class = 'icon-user';
        this.stack_name = 'artist_page';
        this.api_method = 'getArtist';
        this.api_param = 'artist_id';
    };

    Artist.prototype = Object.create(CommonAlbumArtist.prototype);

    Artist.prototype.routes = Object.create(CommonAlbumArtist.prototype.routes);
    Artist.prototype.routes.artist_page = CommonAlbumArtist.prototype.page;

    module.exports = Artist;
});
