define(function (require, exports, module) {
    var Album = require('./album');
    var DzArtist = require('./dz-artist');
    var DzTrack = require('./dz-track');

    var DzAlbum = function (artist, data) {
        if (DzAlbum.isLoaded(data.id)) {
            var obj = DzAlbum.getCache(data.id);

            if (obj.isComplete() === false) {
                obj.completeData(data);
            }

            return obj;
        }

        if (!(this instanceof DzAlbum)) {
            return new DzAlbum(artist, data);
        }

        artist = artist || DzArtist(data.artist);

        Album.call(this, 'deezer', data.id, data.title, data.cover, artist,
            data.nb_tracks);
        this.completeData(data);
    };

    DzAlbum.isLoaded = Album.isLoaded.bind(null, 'deezer');
    DzAlbum.getCache = Album.getCache.bind(null, 'deezer');

    DzAlbum.prototype = Object.create(Album.prototype);
    DzAlbum.prototype.isComplete = function () {
        return this.tracks_count !== 0 &&
            this.tracks_count === this.tracks.length;
    };

    DzAlbum.prototype.completeData = function (data) {
        if (data.tracks !== undefined) {
            for (var i in data.tracks.data) {
                if (data.tracks.data[i].track_position === undefined) {
                    data.tracks.data[i].track_position = parseInt(i, 10) + 1;
                }

                var track = DzTrack(this.artist, this, data.tracks.data[i]);
            }
        }
    };

    module.exports = DzAlbum;
});