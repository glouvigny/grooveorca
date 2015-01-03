define(function (require, exports, module) {
    var Artist = require('./artist');

    var SpArtist = function (data) {
        if (SpArtist.isLoaded(data.id)) {
            return SpArtist.getCache(data.id);
        }

        if (!(this instanceof SpArtist)) {
            return new SpArtist(data);
        }

        var picture = null;
        if (data.images && data.images[0]) {
            picture = data.images[0].url;
        }
        Artist.call(this, 'spotify', data.id, data.name, picture);
    };


    SpArtist.isLoaded = Artist.isLoaded.bind(null, 'spotify');
    SpArtist.getCache = Artist.getCache.bind(null, 'spotify');

    SpArtist.prototype = Object.create(Artist.prototype);

    module.exports = SpArtist;
});