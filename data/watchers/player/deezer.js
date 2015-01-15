(function() {
    // ! Deezer overrides things such as console.log, setTimeout
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('deezer');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var dzPlayer = window.dzPlayer || unsafeWindow.dzPlayer;
    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.bind(bridgeWatcher);

    var nextRepeatMode = {0: 1, 1: 2, 2: 0};
    var repeatModes = {'none': 0, 'all': 1, 'song': 2};

    var dzSongToApi = function (raw) {
        var title = raw.SNG_TITLE;
        if (raw.VERSION) {
            title += ' ' + raw.VERSION;
        }

        return {
            artist: raw.ART_NAME,
            track: title,
            album: raw.ALB_TITLE,
            album_id: raw.ALB_ID,
            track_id: raw.SNG_ID,
            artist_id: raw.ART_ID,
            duration: raw.DURATION,
            album_art: 'http://cdn-images.deezer.com/images/cover/' +
                raw.ALB_PICTURE +
                '/250x250-000000-80-0-0.jpg',
            disk_number: raw.DISK_NUMBER,
            track_number: raw.TRACK_NUMBER,
            label_id: raw.LABEL_ID,
        };
    };

    var updateTrack =  function (force) {
        updateData('song', dzSongToApi(dzPlayer.getCurrentSong()), force);
    };

    var updatePosition = function (force) {
        updateData('position', parseInt(dzPlayer.getPosition(), 10), force);
    };

    var updateVolume = function (force) {
        updateData('volume', dzPlayer.getVolume(), force);
    };

    var updateQueue = function (force) {
        updateData('queue', dzPlayer.getTrackList().map(dzSongToApi), force);
    };

    var updateShuffle = function (force) {
        updateData('shuffle', dzPlayer.shuffle, force);
    };

    var updateRepeat = function (force) {
        var repeat = 'none';
        for (var i in repeatModes) {
            if (repeatModes.hasOwnProperty(i)) {
                if (repeatModes[i] === dzPlayer.repeat) {
                    repeat = i;
                }
            }
        }

        updateData('repeat', repeat, force);
    };

    var updateState = function (force) {
        if (dzPlayer.isPlaying()) {
            return updateData('state', 'playing', force);
        } else if (dzPlayer.isPaused()) {
            return updateData('state', 'paused', force);
        }

        return updateData('state', 'stopped', force);
    };

    var eltsToWatch = {
        // Old
        '#player_track_progress': updatePosition,
        '#player_track_position': updatePosition,
        '#player_track_progress_handler': updatePosition,
        '#player_track_title': updateTrack,
        '#current-list': updateQueue,
        // New
        '.progress-time': updatePosition,
        '.player-track': updateTrack,
        '[data-panel="queuelist"]': updateQueue,
        '.control.control-shuffle': updateShuffle,
        '.control.control-repeat': updateRepeat,
        // Both
        '.volume-progress': updateVolume,
        '.control.control-play': updateState,
    };

    var actions = {
        'playpause': dzPlayer.control.togglePause,
        'next': dzPlayer.control.nextSong,
        'previous': dzPlayer.control.prevSong,
        'volume': dzPlayer.control.setVolume,
        'shuffle': function (param) {
            if (param.shuffle === undefined) {
                param.shuffle = !dzPlayer.shuffle;
            }

            dzPlayer.control.setShuffle(param.shuffle);
        },
        'play': dzPlayer.control.play,
        'pause': dzPlayer.control.pause,
        'seek': function (param) {
            dzPlayer.control.seek(param.position /
                dzPlayer.getCurrentSong().DURATION);
        },
        'repeat': function (param) {
            if (param.mode === undefined) {
                param.mode = nextRepeatMode[dzPlayer.repeat];
            } else {
                param.mode = repeatModes[param.mode];
            }

            dzPlayer.control.setRepeat(param.mode);
        },
        'update_track': function() { updateTrack(true); },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch, true);
})();
