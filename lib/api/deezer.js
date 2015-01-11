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
                    return Promise.reject(false);
                }

                var data = JSON.parse(res.body);
                var object = constructor(data);

                return Promise.resolve(object, data);
            });
    };

    var getObjectList = function (jsType, bound, path) {
        var constructor = boundConstructor(jsType, bound);

        return HttpClient.get(endpoint + path)
            .then(function (res) {
                if (res.status !== 200) {
                    return Promise.reject(false);
                }

                var result = [];
                var data = JSON.parse(res.body);
                for (var i in data.data) {
                    result.push(constructor(data.data[i]));
                }

                return Promise.resolve(result);
            });
    };

    Deezer.getAlbum = getObject.bind(null, DzAlbum, [null], 'album');
    Deezer.getTrack = getObject.bind(null, DzTrack, [null, null], 'track');

    Deezer.getArtist = function (id) {
        var artist = null;
        return getObject(DzArtist, [], 'artist', id)
            .then(function (a) {
                artist = a;

                return getObjectList(DzAlbum, [artist],
                    'artist/' + id + '/albums');
            })
            .then (function () {
                return Promise.resolve(artist);
            });
    };

    Deezer.searchArtists = function (artist, cb) {
        return getObjectList(DzArtist, [], 'search/artist?q=' +
            encodeURIComponent(artist));
    };

    module.exports = Deezer;
});