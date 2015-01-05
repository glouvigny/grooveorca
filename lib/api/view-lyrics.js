define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser/browser')
        .get('http-client');
    var Dom = require('../ext/caoutchouc/browser/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var ViewLyricsApi = {};

    var extractLyrics = function (doc) {
        var lyrics = doc.querySelector('.col-sm-7.col-xs-12');

        if (!lyrics) {
            return false;
        }

        return DomUtils.keepTextOnly(lyrics).querySelector('body').innerHTML;
    };

    ViewLyricsApi.getLyrics = function (artist, track, cb) {
        artist = encodeURIComponent(artist);
        track = encodeURIComponent(track);

        var url = 'http://viewlyrics.com/lyrics/' + artist + '/' + track;

        return HttpClient.get(url, null, function (res) {
            var doc = Dom.parse(res.body, "text/html");
            var lyrics = extractLyrics(doc);

            var found = res.status === 200 && lyrics !== false;

            return cb(lyrics, !found);
        });
    };

    module.exports = ViewLyricsApi;
});