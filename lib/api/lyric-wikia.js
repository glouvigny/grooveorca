define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var LyricWikiaApi = {};

    var regexpSpace = / /g;

    var extractLyrics = function (doc) {
        var lyricbox = doc.querySelector('.lyricbox');

        lyricbox = DomUtils.removeScripts(lyricbox);
        lyricbox = DomUtils.keepTextOnly(lyricbox);

        return lyricbox.querySelector('body').innerHTML;
    };

    var tryLoadingLyrics = function(artist, track, urls, cb) {
        if (urls.length === 0) {
            return cb('', true);
        }

        var url = urls.shift();

        return HttpClient.get(url, null, function (res) {
            if (res.status >= 400) {
                return tryLoadingLyrics(artist, track, urls, cb);
            }

            var doc = Dom.parse(res.body, 'text/html');
            var lyrics = extractLyrics(doc);

            return cb(lyrics, false);
        });
    };

    LyricWikiaApi.getLyrics = function (artist, track, cb) {
        artist = encodeURIComponent(artist.replace(regexpSpace, '_'));
        track = encodeURIComponent(track.replace(regexpSpace, '_'));

        return tryLoadingLyrics(artist, track, [
            'http://lyrics.wikia.com/' + track + '%3A' + artist,
            'http://lyrics.wikia.com/' + artist + '%3A' + track,
        ], cb);
    };

    module.exports = LyricWikiaApi;
});