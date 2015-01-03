define(function (require, exports, module) {
    var Album = require('./album');
    var SpArtist = require('./sp-artist');

    var SpAlbum = function (artist, data) {
        if (SpAlbum.isLoaded(data.id)) {
            var obj = SpAlbum.getCache(data.id);

            if (obj.isComplete() === false) {
                obj.completeData(data);
            }

            return obj;
        }

        if (!(this instanceof SpAlbum)) {
            return new SpAlbum(artist, data);
        }

        artist = artist || SpArtist(data.artists[0]);

        var picture = null;
        if (data.images && data.images[0]) {
            picture = data.images[0].url;
        }

        var total_tracks = 0;
        if (data.tracks && data.tracks.total) {
            total_tracks = data.tracks.total;
        }

        Album.call(this, 'spotify', data.id, data.name, picture, artist,
            total_tracks);
        this.completeData(data);
    };

    SpAlbum.isLoaded = Album.isLoaded.bind(null, 'spotify');
    SpAlbum.getCache = Album.getCache.bind(null, 'spotify');
    SpAlbum.prototype = Object.create(Album.prototype);

    SpAlbum.prototype.isComplete = function () {
        return true;
    };

    module.exports = SpAlbum;

    return;
});