define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var ViewLyricsApi = {};

    var extractLyrics = function (doc) {
        var lyrics = doc.querySelector('.col-sm-7.col-xs-12 span:nth-child(2)');

        if (!lyrics) {
            return false;
        }

        lyrics = DomUtils.whiteListTags(lyrics, ['br', 'p']);
        lyrics = DomUtils.whiteListAttr(lyrics);

        return lyrics.innerHTML;
    };

    ViewLyricsApi.getLyrics = function (artist, track) {
        artist = encodeURIComponent(artist);
        track = encodeURIComponent(track);

        var url = 'http://viewlyrics.com/lyrics/' + artist + '/' + track;

        return HttpClient.get(url)
            .then(function (res) {
                var doc = Dom.parse(res.body, 'text/html');
                var lyrics = extractLyrics(doc);

                if (res.status !== 200 || lyrics === false) {
                    return Promise.reject();
                }

                return Promise.resolve({
                    lyrics: lyrics,
                    url: url,
                });
            });
    };

    module.exports = ViewLyricsApi;
});