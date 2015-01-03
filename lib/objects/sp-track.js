define(function (require, exports, module) {
    var Track = require('./track');
    var SpArtist = require('./sp-artist');
    var SpAlbum = require('./sp-album');

    var SpTrack = function (artist, album, data) {
        if (SpTrack.isLoaded(data.id)) {
            return SpTrack.getCache(data.id);
        }

        if (!(this instanceof SpTrack)) {
            return new SpTrack(artist, album, data);
        }

        artist = artist || SpArtist(data.artists[0]);
        album = album || SpAlbum(artist, data.album);

        Track.call(this, 'spotify', data.id, data.name, artist,
            album, parseInt(data.duration_ms / 1000, 10), data.track_number);
    };

    SpTrack.isLoaded = Track.isLoaded.bind(null, 'spotify');
    SpTrack.getCache = Track.getCache.bind(null, 'spotify');

    SpTrack.prototype = Object.create(Track.prototype);

    module.exports = SpTrack;
});