define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var MetroLyricsApi = {};

    var extractLyrics = function (doc) {
        var lyrics = doc.querySelector('#lyrics-body-text');

        if (!lyrics) {
            return false;
        }

        lyrics = DomUtils.whiteListTags(lyrics, ['br', 'p']);
        lyrics = DomUtils.whiteListAttr(lyrics);

        return lyrics.innerHTML;
    };

    MetroLyricsApi.getLyrics = function (artist, track) {
        artist = encodeURIComponent(artist.replace(/ /g, '-').toLowerCase());
        track = encodeURIComponent(track.replace(/ /g, '-').toLowerCase());

        var url = 'http://www.metrolyrics.com/' + track + '-lyrics-' +
            artist +'.html';

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

    module.exports = MetroLyricsApi;
});