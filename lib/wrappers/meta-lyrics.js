define(function (require, exports, module) {
    var ViewLyricsApi = require('../api/view-lyrics');
    var MetroLyricsApi = require('../api/metro-lyrics');
    var LyricWikiaApi = require('../api/lyric-wikia');

    var MetaLyrics = {};

    var current = {
        artist: null,
        track: null,
        lyrics: null,
        url: null,
    };

    MetaLyrics.getLyrics = function (artist, track) {
        if (current.artist === artist && current.track === track) {
            if (current.lyrics === false) {
                return Promise.reject();
            }

            return Promise.resolve({
                lyrics: current.lyrics,
                url: current.url,
            });
        }

        current.track = track;
        current.artist = artist;

        return ViewLyricsApi.getLyrics(artist, track)
            .catch(function () {
                return MetroLyricsApi.getLyrics(artist, track);
            })
            .catch(function () {
                return LyricWikiaApi.getLyrics(artist, track);
            })
            .catch(function () {
                current.lyrics = null;
                current.url = null;

                return Promise.reject();
            })
            .then(function (data) {
                current.lyrics = data.lyrics;
                current.url = data.url;

                return Promise.resolve(current);
            });
    };

    module.exports = MetaLyrics;
});