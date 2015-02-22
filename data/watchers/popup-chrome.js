// Firefox JS are loaded from main.js, Chrome from popup.html
(function() {
    var loadScripts;

    // TODO: get scripts from manifest.json#browser_action.scripts
    var scripts = [
        'ext/jquery/dist/jquery.js',
        'watchers/messaging-chrome.js',
        'watchers/messaging-safari.js',
        'watchers/popup.js'
    ];

    if (/chrome/i.test(navigator.userAgent)) {
        loadScripts = function (scripts) {
            if (scripts.length === 0) {
                return false;
            }

            var fileref = document.createElement('script');
            fileref.setAttribute('src', scripts.shift());
            document.querySelector('head').appendChild(fileref);

            window.setTimeout(function () {
                loadScripts(scripts);
            }, 50);

            return true;
        };


        loadScripts(scripts);
    } else if (/safari/i.test(navigator.userAgent)) {
        // playing around safari security
        loadScripts = function (scripts) {
            if (scripts.length === 0) {
                return false;
            }

            var script = scripts.shift();

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) {
                    return;
                }

                var fileref = document.createElement('script');
                fileref.text = xhr.responseText;
                document.querySelector('head').appendChild(fileref);

                return loadScripts(scripts);
            };

            var url = safari.extension.baseURI + 'data/' + script;

            xhr.open('GET', url, true);
            return xhr.send(null);
        };

        setTimeout(function () {
            loadScripts(scripts);
        }, 1500);

    }
})();