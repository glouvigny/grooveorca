(function () {
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('rdio', ['*://*.rdio.com/*']);
        if (mb.scriptReloaded || !mb.loaded) {
            return;
        }
    }

    var _r = function () {
        return window.R || unsafeWindow.R;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.bind(bridgeWatcher);

    var nextRepeatMode = {0: 2, 2: 1, 1: 0};
    var repeatModes = {'none': 0, 'song': 1, 'all': 2};

    var updateTrack =  function (force) {
        var raw = _r().player._model.get('playingTrack').attributes;
        if (!raw) {
            return;
        }

        updateData('song', {
            artist: raw.artist,
            track: raw.name,
            album: raw.album,
            album_id: raw.albumKey,
            track_id: raw.key,
            artist_id: raw.albumArtistKey,
            duration: raw.duration,
            album_art: raw.bigIcon1200,
            disk_number: raw.disc,
            track_number: raw.number,
        }, force);
    };

    var updatePosition = function (force) {
        updateData('position', _r().player.position(), force);
    };

    var updateVolume = function (force) {
        updateData('volume', _r().player.volume(), force);
    };

    var updateState = function (force) {
        if (_r().player.isPlaying()) {
            return updateData('state', 'playing', force);
        } else if (_r().player.playState() == _r().player.PLAYSTATE_PAUSED) {
            return updateData('state', 'paused', force);
        }

        return updateData('state', 'stopped', force);
    };

    var updateShuffle = function (force) {
        updateData('shuffle', _r().player.shuffle(), force);
    };

    var updateRepeat = function (force) {
        var repeat = 'none';
        for (var i in repeatModes) {
            if (repeatModes.hasOwnProperty(i)) {
                if (repeatModes[i] === R.player.repeat()) {
                    repeat = i;
                }
            }
        }

        updateData('repeat', repeat, force);
    };

    var eltsToWatch = {
        '.player_bottom .time': updatePosition,
        '.text_metadata': updateTrack,
        '.Slider.volume': updateVolume,
        '.play_pause': updateState,
        '.shuffle': updateShuffle,
        '.repeat': updateRepeat,
    };

    var actions = {
        'playpause': function () { _r().player.playPause(); },
        'next': function () { _r().player.next(); },
        'previous': function () { _r().player.previous(); },
        'volume': function (param) { _r().player.setVolume(param.volume); },
        'play': function () { _r().player.play(); },
        'pause': function () { _r().player.pause(); },
        'seek': function (param) { _r().player.seek(param.position); },
        'repeat': function (param) {
            if (param.mode === undefined) {
                param.mode = nextRepeatMode[R.player.repeat()];
            } else {
                param.mode = repeatModes[param.mode];
            }

            _r().player.setRepeat(param.mode);
        },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) {
            if (param.shuffle === undefined) {
                param.shuffle = !_r().player.shuffle();
            }

            _r().player.setShuffle(param.shuffle);
        },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch, true);
})();
