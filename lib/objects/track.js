define(function (require, exports, module) {
    var Abstract = require('./abstract');

    var Track = function (source, id, name, artist, album, duration,
            track_position) {
        Abstract.call(this, 'track', source, id);

        this.name = name;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.track_position = parseInt(track_position, 10);

        album.addTrack(this);
    };

    Track.prototype = Object.create(Abstract.prototype);

    Track.isLoaded = Abstract.isLoaded.bind(null, 'track');
    Track.getCache = Abstract.getCache.bind(null, 'track');

    module.exports = Track;
});