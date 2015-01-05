define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser')
        .get('http-client');
    var DzArtist = require('../objects/dz-artist');
    var DzAlbum = require('../objects/dz-album');
    var DzTrack = require('../objects/dz-track');

    var endpoint = 'https://api.deezer.com/';

    var Deezer = {};

    Deezer.name = 'deezer';

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

    var getObjectList = function (jsType, bound, path, cb) {
        var constructor = boundConstructor(jsType, bound);

        return HttpClient.get(endpoint + path, {}, function (res) {
            if (res.status !== 200) {
                return cb(false);
            }

            var result = [];
            var data = JSON.parse(res.body);
            for (var i in data.data) {
                result.push(constructor(data.data[i]));
            }

            return cb(result, data);
        });
    };

    Deezer.getAlbum = getObject.bind(null, DzAlbum, [null], 'album');
    Deezer.getTrack = getObject.bind(null, DzTrack, [null, null], 'track');

    Deezer.getArtist = function (id, cb) {
        return getObject(DzArtist, [], 'artist', id, function (artist) {
            return getObjectList(DzAlbum, [artist], 'artist/' + id + '/albums',
                function () {
                    return cb(artist);
                }
            );
        });
    };

    Deezer.searchArtists = function (artist, cb) {
        return getObjectList(DzArtist, [], 'search/artist?q=' +
            encodeURIComponent(artist), function (artists) {
                return cb(artists);
            }
        );
    };


    module.exports = Deezer;
});