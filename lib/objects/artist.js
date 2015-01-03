define(function (require, exports, module) {
    var Abstract = require('./abstract');

    var Artist = function (source, id, name, picture) {
        Abstract.call(this, 'artist', source, id);

        this.name = name;
        this.albums = [];
        this.picture = picture;
    };

    Artist.prototype = Object.create(Abstract.prototype);

    Artist.prototype.addAlbum = function (album) {
        for (var i in this.albums) {
            if (this.albums[i].id === album.id) {
                return false;
            }
        }

        this.albums.push(album);
        return true;
    };

    Artist.isLoaded = Abstract.isLoaded.bind(null, 'artist');
    Artist.getCache = Abstract.getCache.bind(null, 'artist');

    module.exports = Artist;
});