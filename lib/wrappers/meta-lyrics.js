define(function (require, exports, module) {
    var ViewLyricsApi = require('../api/view-lyrics');
    var LyricWikiaApi = require('../api/lyric-wikia');

    var MetaLyrics = {};

    var lyrics_cached = {
        artist: '',
        track: '',
        lyrics: '',
    };

    var cacheLyrics = function (artist, track, lyrics) {
        lyrics_cached = {
            artist: artist,
            track: track,
            lyrics: lyrics,
        };
    };

    var tryLoadingLyrics = function(artist, track, modules, cb) {
        if (modules.length === 0) {
            cacheLyrics(artist, track, false);
            return cb(false, true);
        }

        var module = modules.shift();

        return module.getLyrics(artist, track, function (lyrics, error) {
            if (error) {
                return tryLoadingLyrics(artist, track, modules, cb);
            }

            cacheLyrics(artist, track, lyrics);
            return cb(lyrics, error);
        });
    };

    MetaLyrics.getLyrics = function (artist, track, cb) {
        artist = encodeURIComponent(artist.replace(/ /g, '_'));
        track = encodeURIComponent(track.replace(/ /g, '_'));

        if (lyrics_cached.artist === artist &&
            lyrics_cached.track === track) {
            var lyrics = lyrics_cached.lyrics;
            return cb(lyrics, lyrics === false);
        }

        return tryLoadingLyrics(artist, track, [
            ViewLyricsApi,
            LyricWikiaApi,
        ], cb);
    };

    module.exports = MetaLyrics;
});