(function () {
    if (typeof ConditionalLoading !== 'undefined') {
        if (!ConditionalLoading.check('data/watchers/player/spotify.js')) {
            return;
        }
    }

    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('spotify');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var nextRepeatMode = {
        'none': 'track',
        'track': 'context',
        'context': 'none',
    };
    var repeatModes = {'none': 'none', 'all': 'context', 'song': 'track'};



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

    var updateRepeat = function (force) {
        var repeat = 'none';
        for (var i in repeatModes) {
            if (repeatModes.hasOwnProperty(i)) {
                if (repeatModes[i] === _getCtxPlayer()._repeatMode) {
                    repeat = i;
                }
            }
        }

        updateData('repeat', repeat, force);
    };

    var eltsToWatch = [
        updatePosition,
        updateTrack,
        updateVolume,
        updateState,
        updateShuffle,
        updateRepeat,
    ];

    var actions = {
        'playpause': function() { _getCtxPlayer().togglePlay(); },
        'next': function() { _getCtxPlayer().next("fwdbtn"); },
        'previous': function() { _getCtxPlayer().previous("backbtn"); },
        'volume': function(param) { _getCtxPlayer().setVolume(param.volume); },
        'shuffle': function(param) {
            if (param.shuffle === undefined) {
                param.shuffle = !_getCtxPlayer()._shuffled;
            }

            _getCtxPlayer().setShuffle(param.shuffle);
        },
        'play': function() { _getCtxPlayer().resume(); },
        'pause': function() { _getCtxPlayer().pause(); },
        'seek': function (param) {
            _getCtxPlayer().seek(param.position * 1000);
        },
        'repeat': function (param) {
            if (param.mode === undefined) {
                param.mode = nextRepeatMode[_getCtxPlayer()._repeatMode];
            } else {
                param.mode = repeatModes[param.mode];
            }

            console.log(param);

            _getCtxPlayer().setRepeat(param.mode);
        },
        'update_track': function() { updateTrack(true); },
    };

    bridgeWatcher.registerElementsToWatch(eltsToWatch);
    bridgeWatcher.registerActions(actions);
})();
