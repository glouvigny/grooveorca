// Firefox JS are loaded from main.js, Chrome from popup.html
if (/chrome/i.test(navigator.userAgent)) {
    var loadScripts = function (scripts) {
        if (scripts.length === 0) {
            return false;
        }

        var fileref = document.createElement('script');
        fileref.setAttribute('src', scripts.shift());
        document.querySelector('head').appendChild(fileref);

        window.setTimeout(function () {
            loadScripts(scripts);
        }, 0);

        return true;
    };

    // TODO: get scripts from manifest.json#browser_action.scripts
    var scripts = [
        'ext/jquery/dist/jquery.js',
        'watchers/messaging-chrome.js',
        'watchers/popup.js'
    ];

    loadScripts(scripts);
}
