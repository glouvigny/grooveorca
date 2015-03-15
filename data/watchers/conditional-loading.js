var ConditionalLoading = {};
ConditionalLoading.check = function (script) {
    var i, j, k;

    for (i = manifest_json.content_scripts.length - 1; i >= 0; i--) {
        var content_script = manifest_json.content_scripts[i];

        for (j = content_script.js.length - 1; j >= 0; j--) {
            if (content_script.js[j] == script) {
                for (k = content_script.matches.length - 1; k >= 0; k--) {
                    var pattern = content_script.matches[k]
                        .replace(/\./g, '\\.')
                        .replace(/\*/g, '.*');

                    var regexp = new RegExp(pattern);

                    if (regexp.test(location.href)) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
};