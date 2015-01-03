define(function (require, exports, module) {
    var Artist = require('./artist');

    var DzArtist = function (data) {
        if (DzArtist.isLoaded(data.id)) {
            return DzArtist.getCache(data.id);
        }

        if (!(this instanceof DzArtist)) {
            return new DzArtist(data);
        }

        Artist.call(this, 'deezer', data.id, data.name, data.picture);
    };


    DzArtist.isLoaded = Artist.isLoaded.bind(null, 'deezer');
    DzArtist.getCache = Artist.getCache.bind(null, 'deezer');

    DzArtist.prototype = Object.create(Artist.prototype);

    module.exports = DzArtist;
});