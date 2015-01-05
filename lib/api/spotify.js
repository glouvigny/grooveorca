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

    var getObject = function (jsType, bound, type, id, cb) {
        var constructor = boundConstructor(jsType, bound);

        if (jsType.isLoaded(id)) {
            var object = constructor({id: id});

            if (object.isComplete()) {
                return cb(object, {});
            }
        }

        return HttpClient.get(endpoint + type + '/' + id, {}, function (res) {
            if (res.status !== 200) {
                return cb(false);
            }

            var data = JSON.parse(res.body);
            var object = constructor(data);

            return cb(object, data);
        });
    };

    var getObjectList = function (jsType, bound, node, path, cb) {
        var constructor = boundConstructor(jsType, bound);

        return HttpClient.get(endpoint + path, {}, function (res) {
            if (res.status !== 200) {
                return cb(false);
            }

            var result = [];
            var data = JSON.parse(res.body);
            if (node !== null) {
                data = data[node];
            }

            for (var i in data.items) {
                result.push(constructor(data.items[i]));
            }

            return cb(result, data);
        });
    };

    Spotify.getAlbum = getObject.bind(null, SpAlbum, [null], 'albums');
    Spotify.getTrack = getObject.bind(null, SpTrack, [null, null], 'tracks');

    Spotify.getAlbum = function (id, cb) {
        return getObject(SpAlbum, [null], 'albums', id, function (album) {
            var path = 'albums/' + id + '/tracks' +
                '?limit=50';

            return getObjectList(SpTrack, [null, album], null,
                path, function (tracks) {
                    return cb(album);
                }
            );
        });
    };


    Spotify.getArtist = function (id, cb) {
        return getObject(SpArtist, [], 'artists', id, function (artist) {
            var path = 'artists/' + id + '/albums' +
                '?album_type=album&market=FR&limit=50';

            return getObjectList(SpAlbum, [artist], null,
                path, function (albums) {
                    return cb(artist);
                }
            );
        });
    };

    Spotify.searchArtists = function (artist, cb) {
        return getObjectList(SpArtist, [], 'artists', 'search?type=artist&q=' +
            encodeURIComponent(artist), function (artists) {
                return cb(artists);
            }
        );
    };

    module.exports = Spotify;
});