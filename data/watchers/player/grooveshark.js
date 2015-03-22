(function () {
    if (typeof ConditionalLoading !== 'undefined') {
        if (!ConditionalLoading.check('data/watchers/player/grooveshark.js')) {
            return;
        }
    }

    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('grooveshark');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var _gs = function () {
        return window.Grooveshark || unsafeWindow.Grooveshark;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var updateTrack =  function (force) {
        if (!_gs().getCurrentSongStatus().song) {
            return;
        }

        var raw = _gs().getCurrentSongStatus().song;

        if (!raw) {
            return;
        }

        updateData('song', {
            artist: raw.artistName,
            track: raw.songName,
            album: raw.albumName,
            album_id: raw.albumName,
            track_id: raw.songID,
            artist_id: raw.artistID,
            duration: parseInt(raw.calculatedDuration / 1000, 10),
            album_art: raw.artURL,
            disk_number: 0,
            track_number: raw.trackNum,
        }, force);
    };

    var updatePosition = function (force) {
        var raw = _gs().getCurrentSongStatus().song;
        if (!raw) {
            return;
        }

        updateData('position', parseInt(raw.position / 1000, 10), force);
    };

    var updateVolume = function (force) {
        updateData('volume', _gs().getVolume(), force);
    };

    var updateState = function (force) {
        var state = _gs().getCurrentSongStatus().status;

        if (state === 'buffering' || state === 'loading' ||
            state === 'playing') {
            return updateData('state', 'playing', force);
        } else if (state === 'paused') {
            return updateData('state', 'paused', force);
        }

        return updateData('state', 'stopped', force);
    };

    var updateShuffle = function (force) { /* TODO, hack */ };
    var updateRepeat = function (force) { /* TODO, hack */ };

    var eltsToWatch = [
        updatePosition,
        updateTrack,
        updateVolume,
        updateState,
        updateShuffle,
        updateRepeat,
    ];

    var actions = {
        'playpause': function () { _gs().togglePlayPause(); },
        'next': function () { _gs().next(); },
        'previous': function () { _gs().previous(); },
        'volume': function (param) {
            _gs().setVolume(param.volume);
        },
        'play': function () {
            if (_gs().getCurrentSongStatus().status === 'paused') {
                _gs().togglePlayPause();
            } else {
                _gs().play();
            }
        },
        'pause': function () { _gs().pause(); },
        'seek': function (param) {
            _gs().seekToPosition(param.position * 1000);
        },
        'repeat': function (param) { /* TODO, hack */ },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) { /* TODO, hack */ },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
