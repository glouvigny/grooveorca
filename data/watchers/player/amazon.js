(function () {
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('amazon', [
            '*://*.amazon.fr/gp/dmusic/cloudplayer/*',
        ]);
        if (mb.scriptReloaded || !mb.loaded) {
            return;
        }
    }

    var _amznMusic = function () {
        return window.amznMusic || unsafeWindow.amznMusic;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var nextRepeatMode = {false: true, true: false};
    var repeatModes = {'none': false, 'song': true, 'all': true};

    var updateTrack =  function (force) {
        var raw = _amznMusic().widgets.player.getCurrent();

        if (!raw || !raw.metadata) {
            return;
        }

        raw = raw.metadata;

        updateData('song', {
            artist: raw.artistName,
            track: raw.title,
            album: raw.albumName,
            album_id: raw.albumAsin,
            track_id: raw.asin,
            artist_id: raw.artistAsin,
            duration: parseInt(raw.duration, 10),
            album_art: raw.albumCoverImageSmall,
            disk_number: parseInt(raw.discNum, 10),
            track_number: parseInt(raw.trackNum, 10),
        }, force);
    };

    var updatePosition = function (force) {
        updateData('position', _amznMusic().widgets.player.status.currentTime,
            force);
    };

    var updateVolume = function (force) {
        updateData('volume', _amznMusic().widgets.volume.getCurrent(), force);
    };

    var updateState = function (force) {
        if (_amznMusic().widgets.player.isPlaying()) {
            return updateData('state', 'playing', force);
        } else if (_amznMusic().widgets.player.isPaused()) {
            return updateData('state', 'paused', force);
        }

        return updateData('state', 'stopped', force);
    };

    var updateShuffle = function (force) {
        updateData('shuffle', _amznMusic().widgets.queueManager.isShuffled(),
            force);
    };

    var updateRepeat = function (force) {
        updateData('repeat', _amznMusic().widgets.queueManager.isRepeated() ?
            'all' : 'none', force);
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
        'playpause': function () {
            if (_amznMusic().widgets.player.isPlaying()) {
                _amznMusic().widgets.player.pause();
            } else {
                _amznMusic().widgets.player.resume();
            }
        },
        'next': function () { _amznMusic().widgets.player.playNext(); },
        'previous': function () { _amznMusic().widgets.player.playPrevious(); },
        'volume': function (param) {
            _amznMusic().widgets.volume.updateVolume(0, param.volume * 100);
        },
        'play': function () { _amznMusic().widgets.player.resume(); },
        'pause': function () { _amznMusic().widgets.player.pause(); },
        'seek': function (param) {
            _amznMusic().widgets.player.setTime(param.position);
        },
        'repeat': function (param) {
            if (param.mode === undefined) {
                param.mode = nextRepeatMode[_amznMusic().widgets
                    .queueManager.isRepeated()];
            } else {
                param.mode = repeatModes[param.mode];
            }

            if (_amznMusic().widgets.queueManager.isRepeated() !== param.mode) {
                _amznMusic().widgets.queueManager.toggleRepeat();
            }
        },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) {
            if (param.shuffle === undefined) {
                param.shuffle = !_amznMusic().widgets.queueManager.isShuffled();
            }

            if (_amznMusic().widgets.queueManager.isShuffled() !==
                param.shuffle) {
                _amznMusic().widgets.queueManager.toggleShuffle();
            }
        },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
