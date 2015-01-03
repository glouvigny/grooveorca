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

    var updateTrack =  function () {
        updateData('song', dzSongToApi(dzPlayer.getCurrentSong()));
    };

    var updatePosition = function () {
        updateData('position', parseInt(dzPlayer.getPosition(), 10));
    };

    var updateVolume = function () {
        updateData('volume', dzPlayer.getVolume());
    };

    var updateQueue = function () {
        updateData('queue', dzPlayer.getTrackList().map(dzSongToApi));
    };

    var updateState = function () {
        if (dzPlayer.isPlaying()) {
            return updateData('state', 'playing');
        } else if (dzPlayer.isPaused()) {
            return updateData('state', 'paused');
        }

        return updateData('state', 'stopped');
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
        // Both
        '.volume-progress': updateVolume,
        '.control.control-play': updateState,
    };

    var actions = {
        'playpause': dzPlayer.control.togglePause,
        'next': dzPlayer.control.nextSong,
        'previous': dzPlayer.control.prevSong,
        'volume': dzPlayer.control.setVolume,
        'shuffle': dzPlayer.control.setShuffle,
        'play': dzPlayer.control.play,
        'pause': dzPlayer.control.pause,
        'seek': function (param) {
            dzPlayer.control.seek(param.position /
                dzPlayer.getCurrentSong().DURATION);
        },
        'repeat': function (param) {
            var modes = {'none': 0, 'all': 1, 'song': 2};
            dzPlayer.control.setRepeat(modes[param.mode]);
        },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch, true);
})();
