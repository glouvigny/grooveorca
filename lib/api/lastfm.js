define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var Hashes = require('../ext/jshashes/hashes');
    var md5 = new Hashes.MD5().hex;

    var api_key = 'a0c592c65238b60549d2d9060c7b77ac';
    var api_sec = '3fad982f31d5fcff5fdcff2f4c7a3d26';
    var api_endpoint = 'http://ws.audioscrobbler.com/2.0/';

    var session = null;
    var username = null;

    var cleanNull = function (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i) && data[i] === null || data[i] === '') {
                delete data[i];
            }
        }

        return data;
    };

    var sortArgs = function (args) {
        var newArgs = {};
        var keys = Object.keys(args).sort();
        for (var i in keys) {
            newArgs[keys[i]] = args[keys[i]];
        }

        return newArgs;
    };

    var sign = function (args) {
        var sigString = '';

        for (var key in args) {
            sigString += key + args[key];
        }

        return md5(sigString + api_sec);
    };

    var request = function (auth_required, http_method, args, cb) {
        http_method = http_method.toLowerCase();
        args.api_key = api_key;

        cb = cb || function (data) {};

        if (session === null && auth_required) {
            return cb(false);
        } else if (session !== null) {
            args.sk = session;
        }

        args = sortArgs(args);
        args.api_sig = sign(args);
        args.format = 'json';

        return HttpClient[http_method](api_endpoint, args)
            .then(function (response) {
                return Promise.resolve(JSON.parse(response.body));
            });
    };

    var sendTrackMethod = function (method, song, cb) {
        var data = cleanNull({
            method: method,
            artist: song.artist,
            album: song.album,
            track: song.track,
        });

        return request(true, 'POST', data, cb);
    };

    var LastfmApi = {};

    LastfmApi.languages = function () {
        return Promise.resolve([
            {
                'code': 'en',
                'name': 'English',
            },
            {
                'code': 'de',
                'name': 'Deutsch',
            },
            {
                'code': 'es',
                'name': 'Espa\xF1ol',
            },
            {
                'code': 'fr',
                'name': 'Fran\xE7ais',
            },
            {
                'code': 'it',
                'name': 'Italiano',
            },
            {
                'code': 'ja',
                'name': '\u65E5\u672C\u8A9E',
            },
            {
                'code': 'pl',
                'name': 'Polski',
            },
            {
                'code': 'pt',
                'name': 'Portugu\xEAs',
            },
            {
                'code': 'ru',
                'name': '\u0420\u0443cc\u043A\u0438\u0439',
            },
            {
                'code': 'sv',
                'name': 'Svenska',
            },
            {
                'code': 'tr',
                'name': 'T\xFCrk\xE7e',
            },
            {
                'code': 'zh',
                'name': '\u7B80\u4F53\u4E2D\u6587',
            },
        ]);
    };

    LastfmApi.track = {};
    LastfmApi.track.scrobble = function (song, start_playing, cb) {
        var data = cleanNull({
            'method': 'track.scrobble',
            'artist[0]': song.artist,
            'album[0]': song.album,
            'track[0]': song.track,
            'duration[0]': parseInt(song.duration, 10),
            'timestamp[0]': parseInt(start_playing, 10),
        });

        return request(true, 'POST', data, cb);
    };

    LastfmApi.track.love = sendTrackMethod.bind(null, 'track.love');
    LastfmApi.track.unlove = sendTrackMethod.bind(null, 'track.unlove');
    LastfmApi.track.updateNowPlaying = sendTrackMethod
        .bind(null, 'track.updateNowPlaying');

    LastfmApi.track.getInfo = function (song, lang, cb) {
        var data = {
            method: 'track.getInfo',
            autocorrect: 1,
            artist: song.artist,
            album: song.album,
            track: song.track,
            lang: lang || 'en',
        };

        if (username) {
            data.username = username;
        }

        return request(false, 'GET', data, cb);
    };

    LastfmApi.artist = {};
    LastfmApi.artist.getInfo = function (song, lang, cb) {
        var data = {
            method: 'artist.getInfo',
            autocorrect: 1,
            artist: song.artist,
            lang: lang || 'en',
        };

        if (username) {
            data.username = username;
        }

        return request(false, 'GET', data, cb);
    };

    LastfmApi.auth = {};
    LastfmApi.auth.getToken = function (cb) {
        return request(false, 'GET', {
            'method': 'auth.getToken',
        }, cb);
    };

    LastfmApi.auth.getSession = function (token, cb) {
        return request(false, 'GET', {
            'method': 'auth.getSession',
            'token': token,
        }, cb);
    };

    LastfmApi.loginUrl = function (token) {
        return 'http://www.last.fm/api/auth/?api_key=' + api_key +
            '&token=' + token;
    };

    LastfmApi.setSession = function (new_session, new_username) {
        session = new_session;
        username = new_username;
    };

    LastfmApi.clearSession = function () {
        session = null;
        username = null;
    };

    module.exports = LastfmApi;
});