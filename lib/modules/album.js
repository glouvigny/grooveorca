define(function (require, exports, module) {
    var CommonAlbumArtist = require('./common-album-artist');

    var Album = function (router) {
        CommonAlbumArtist.call(this, router);
        this.id = 'album';
        this.name = 'Album';
        this.enabled = true;

        this.template_file = 'templates/album.mst';
        this.template_not_found_file = 'templates/album-not-found.mst';
        this.stack_icon_class = 'icon-cd';
        this.stack_name = 'album_page';
        this.api_method = 'getAlbum';
        this.api_param = 'album_id';
    };

    Album.prototype = Object.create(CommonAlbumArtist.prototype);

    Album.prototype.routes = Object.create(CommonAlbumArtist.prototype.routes);
    Album.prototype.routes.album_page = CommonAlbumArtist.prototype.page;

    module.exports = Album;
});