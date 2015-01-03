define(function (require, exports, module) {
    var Deezer = require('../api/deezer');
    var Spotify = require('../api/spotify');

    var apis = [Deezer, Spotify];

    var MetaMusic = {};

    var getApiForSite = function (site) {
        for (var i in apis) {
            if (apis[i].name === site) {
                return apis[i];
            }
        }
        return null;
    };

    MetaMusic.getArtist = function (site, id, cb) {
        var api = getApiForSite(site);
        if (api === null) {
            return cb(false);
        }

        return api.getArtist(id, cb);
    };

    MetaMusic.getAlbum = function (site, id, cb) {
        var api = getApiForSite(site);
        if (api === null) {
            return cb(false);
        }

        return api.getAlbum(id, cb);
    };

    module.exports = MetaMusic;
});