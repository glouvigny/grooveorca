define(function (require, exports, module) {
    var Abstract = require('./abstract');

    var Album = function (source, id, name, picture, artist, tracks_count) {
        Abstract.call(this, 'album', source, id);

        this.name = name;
        this.picture = picture;
        this.artist = artist;
        this.tracks = [];
        this.tracks_count = tracks_count || 0;

        artist.addAlbum(this);
    };

    Album.prototype = Object.create(Abstract.prototype);

    Album.prototype.addTrack = function (track) {
        for (var i in this.tracks) {
            if (this.tracks[i].id === track.id) {
                return false;
            }
        }

        this.tracks.push(track);

        this.tracks.sort(function (a, b) {
            return a.track_position - b.track_position;
        });

        return true;
    };

    Album.isLoaded = Abstract.isLoaded.bind(null, 'album');
    Album.getCache = Abstract.getCache.bind(null, 'album');

    module.exports = Album;
});