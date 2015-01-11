define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var SpArtist = require('../objects/sp-artist');
    var SpAlbum = require('../objects/sp-album');
    var SpTrack = require('../objects/sp-track');

    var endpoint = 'https://api.spotify.com/v1/';

    var Spotify = {};

    Spotify.name = 'spotify';

    var boundConstructor = function (constructor, bound) {
        bound = bound.slice(0);

        while (bound.length > 0) {
            constructor = constructor.bind(null, bound.shift());
        }

        return constructor;
    };

    var getObject = function (jsType, bound, type, id) {
        var constructor = boundConstructor(jsType, bound);

        if (jsType.isLoaded(id)) {
            var object = constructor({id: id});

            if (object.isComplete()) {
                return Promise.resolve(object, {});
            }
        }

        return HttpClient.get(endpoint + type + '/' + id)
            .then(function (res) {
                if (res.status !== 200) {
                    return Promise.reject();
                }

                var data = JSON.parse(res.body);
                var object = constructor(data);

                return Promise.resolve(object, data);
            });
    };

    var getObjectList = function (jsType, bound, node, path) {
        var constructor = boundConstructor(jsType, bound);

        return HttpClient.get(endpoint + path)
            .then(function (res) {
                if (res.status !== 200) {
                    return Promise.reject(false);
                }

                var result = [];
                var data = JSON.parse(res.body);
                if (node !== null) {
                    data = data[node];
                }

                for (var i in data.items) {
                    result.push(constructor(data.items[i]));
                }

                return Promise.resolve(result, data);
            });
    };

    Spotify.getAlbum = getObject.bind(null, SpAlbum, [null], 'albums');
    Spotify.getTrack = getObject.bind(null, SpTrack, [null, null], 'tracks');

    Spotify.getAlbum = function (id) {
        var album = null;

        return getObject(SpAlbum, [null], 'albums', id)
            .then(function (al) {
                album = al;

                var path = 'albums/' + id + '/tracks' +
                    '?limit=50';

                return getObjectList(SpTrack, [null, album], null, path);
            })
            .then(function (tracks) {
                return Promise.resolve(album);
            });
    };


    Spotify.getArtist = function (id, cb) {
        var artist = null;

        return getObject(SpArtist, [], 'artists', id)
            .then(function (ar) {
                artist = ar;

                var path = 'artists/' + id + '/albums' +
                    '?album_type=album&market=FR&limit=50';

                return getObjectList(SpAlbum, [artist], null, path);
            })
            .then(function () {
                return Promise.resolve(artist);
            });
    };

    Spotify.searchArtists = function (artist, cb) {
        return getObjectList(SpArtist, [], 'artists', 'search?type=artist&q=' +
            encodeURIComponent(artist))
            .then(function (artists) {
                return Promise.resolve(artists);
            });
    };

    module.exports = Spotify;
});