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

    var updateTrack = function (force) {
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
        }, force);
    };

    var updatePosition = function (force) {
        var player = _getPlayer();
        if (!player) {
            return;
        }

        updateData('position', parseInt(player.position() / 1000, 10), force);
    };

    var updateVolume = function (force) {
        var player = _getPlayer();
        if (!player) {
            return;
        }

        updateData('volume', _getPlayer().getVolume(), force);
    };

    var updateState = function (force) {
        var state = 'stopped';
        var player = _getPlayer();

        if (player && player.isPlaying) {
            state = 'playing';
        } else if (player && player.isPaused) {
            state = 'paused';
        }

        updateData('state', state, force);
    };

    var updateShuffle = function (force) {
        updateData('shuffle', Spotify.Shuttle._initContext
            .contextPlayer._shuffled, force);
    };

    var eltsToWatch = [
        updatePosition,
        updateTrack,
        updateVolume,
        updateState,
        updateShuffle,
    ];

    var actions = {
        'playpause': function() { _getCtxPlayer().togglePlay(); },
        'next': function() { _getCtxPlayer().next("fwdbtn"); },
        'previous': function() { _getCtxPlayer().previous("backbtn"); },
        'volume': function(param) { _getCtxPlayer().setVolume(param.volume); },
        'shuffle': function(param) {
            if (param.shuffle === undefined) {
                param.shuffle = !Spotify.Shuttle._initContext
                    .contextPlayer._shuffled;
            }

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
        'update_track': function() { updateTrack(true); },
    };

    bridgeWatcher.registerElementsToWatch(eltsToWatch);
    bridgeWatcher.registerActions(actions);
})();
