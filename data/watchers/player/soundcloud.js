(function () {
    if (typeof ConditionalLoading !== 'undefined') {
        if (!ConditionalLoading.check('data/watchers/player/soundcloud.js')) {
            return;
        }
    }

    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('soundcloud');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var updateTrack =  function (force) {
        raw = {};

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
        var pos = document
            .querySelector('.playControls .playbackTimeline__timePassed')
            .innerText;

        if (pos === '') {
            pos = 0;
        } else {
            pos = parseInt(pos.substr(0, pos.indexOf(':')), 10) * 60 +
                parseInt(pos.substr(pos.indexOf(':') + 1), 10);            
        }

        updateData('position', pos, force);
    };

    var updateVolume = function (force) {
        var slider = document.querySelector('.volume__sliderWrapper');

        updateData('volume',
            parseInt(slider.getAttribute('aria-valuenow'), 10) /
            parseInt(slider.getAttribute('aria-valuemax'), 10),
            force);

        updateData('volume', _gs().getVolume(), force);
    };

    var updateState = function (force) {
        var play = document.querySelector('button.playControl.playing');

        if (play !== null) {
            return updateData('state', 'playing', force);
        }

        return updateData('state', 'paused', force);
    };

    var updateShuffle = function (force) {
        return updateData('shuffle', false, force);
    };

    var updateRepeat = function (force) {
        var repeat = document.querySelector('button.repeatControl.m-active');

        if (repeat !== null) {
            return updateData('repeat', 'song', force);
        }

        return updateData('repeat', 'none', force);
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
        'playpause': function () {},
        'next': function () {},
        'previous': function () {},
        'volume': function (param) {},
        'play': function () {},
        'pause': function () {},
        'seek': function (param) {},
        'repeat': function (param) {},
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) { /* N/A */ },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
