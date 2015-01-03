(function () {
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('spotify');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var Spotify = window.Spotify || unsafeWindow.Spotify;
    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.bind(bridgeWatcher);
    var _getPlayer = function () {
        return Spotify.Shuttle._initContext.core.audioManager.
            getActivePlayer();
    };
    var _getCtxPlayer = function () {
        return Spotify.Shuttle._initContext.contextPlayer;
    };

    var updateTrack = function () {
        var raw = _getCtxPlayer().getCurrentTrack();

        if (!raw) {
            return;
        }

        updateData('song', {
            artist: raw.artistName,
            track: raw.name,
            album: raw.albumName,
            album_id: raw.albumUri.substr(14),
            track_id: raw.uri.substr(14),
            artist_id: raw.artists[0].uri.substr(15),
            duration: raw.duration / 1000,
            album_art: raw.image,
            disk_number: raw.disc,
            track_number: raw.number,
        });
    };

    var updatePosition = function () {
        var player = _getPlayer();
        if (!player) {
            return;
        }

        updateData('position', parseInt(player.position() / 1000, 10));
    };

    var updateVolume = function () {
        var player = _getPlayer();
        if (!player) {
            return;
        }

        updateData('volume', _getPlayer().getVolume());
    };

    var updateState = function () {
        var state = 'stopped';
        var player = _getPlayer();

        if (player && player.isPlaying) {
            state = 'playing';
        } else if (player && player.isPaused) {
            state = 'paused';
        }

        updateData('state', state);
    };

    var eltsToWatch = [
        updatePosition,
        updateTrack,
        updateVolume,
        updateState,
    ];

    var actions = {
        'playpause': function() { _getCtxPlayer().togglePlay(); },
        'next': function() { _getCtxPlayer().next("fwdbtn"); },
        'previous': function() { _getCtxPlayer().previous("backbtn"); },
        'volume': function(param) { _getCtxPlayer().setVolume(param.volume); },
        'shuffle': function(param) {
            _getCtxPlayer().setShuffle(param.shuffle);
        },
        'play': function() { _getCtxPlayer().resume(); },
        'pause': function() { _getCtxPlayer().pause(); },
        'seek': function (param) {
            _getCtxPlayer().seek(param.position * 1000);
        },
        'repeat': function (param) {
            var modes = {'none': 'none', 'all': 'context', 'song': 'track'};
            _getCtxPlayer().setRepeat(modes[param.mode]);
        },
    };

    bridgeWatcher.registerElementsToWatch(eltsToWatch);
    bridgeWatcher.registerActions(actions);
})();
