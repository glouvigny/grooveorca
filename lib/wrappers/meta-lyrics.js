define(function (require, exports, module) {
    var ViewLyricsApi = require('../api/view-lyrics');
    var LyricWikiaApi = require('../api/lyric-wikia');

    var MetaLyrics = {};

    var current = {
        artist: null,
        track: null,
        lyrics: null,
    };

    MetaLyrics.getLyrics = function (artist, track) {
        if (current.artist === artist && current.track === track) {
            if (current.lyrics === false) {
                return Promise.reject();
            }

            return Promise.resolve(current.lyrics);
        }

        current.track = track;
        current.artist = artist;

        return ViewLyricsApi.getLyrics(artist, track)
            .catch(function () {
                return LyricWikiaApi.getLyrics(artist, track);
            })
            .catch(function () {
                current.lyrics = null;
                return Promise.reject();
            })
            .then(function (lyrics) {
                current.lyrics = lyrics;

                return Promise.resolve(lyrics);
            });
    };

    module.exports = MetaLyrics;
});