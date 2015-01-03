define(function (require, exports, module) {
    var Track = require('./track');
    var DzArtist = require('./dz-artist');
    var DzAlbum = require('./dz-album');

    var DzTrack = function (artist, album, data) {
        if (DzTrack.isLoaded(data.id)) {
            return DzTrack.getCache(data.id);
        }

        if (!(this instanceof DzTrack)) {
            return new DzTrack(artist, album, data);
        }

        artist = artist || DzArtist(data.artist);
        album = album || DzAlbum(artist, data.album);

        Track.call(this, 'deezer', data.id, data.title, artist,
            album, data.duration, data.track_position);
    };

    DzTrack.isLoaded = Track.isLoaded.bind(null, 'deezer');
    DzTrack.getCache = Track.getCache.bind(null, 'deezer');

    DzTrack.prototype = Object.create(Track.prototype);

    module.exports = DzTrack;
});