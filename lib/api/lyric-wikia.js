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

    var loadLyrics = function(url) {
        return HttpClient.get(url)
            .then(function (res) {
                if (res.status >= 400) {
                    return Promise.reject();
                }

                var doc = Dom.parse(res.body, 'text/html');
                var lyrics = extractLyrics(doc);

                return Promise.resolve(lyrics);
            });
    };

    LyricWikiaApi.getLyrics = function (artist, track) {
        artist = encodeURIComponent(artist.replace(regexpSpace, '_'));
        track = encodeURIComponent(track.replace(regexpSpace, '_'));

        return loadLyrics('http://lyrics.wikia.com/' + artist +
                '%3A' + track, null)
            .catch(loadLyrics.bind(null, 'http://lyrics.wikia.com/' + track +
            '%3A' + artist));
    };

    module.exports = LyricWikiaApi;
});