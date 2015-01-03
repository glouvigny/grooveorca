// useful for debug
var router;

if (require.config !== undefined) {
    // Firefox doesn't "require" this
    require.config({
        baseUrl: 'lib'
    });

    require(['ext/caoutchouc/init'], function (coreInit) {
        require(['./init-modules'], function (initModules) {
            router = initModules();
        });
    });
} else {
    require('./ext/caoutchouc/init');
    var initModules = require('./init-modules');
    router = initModules();
}
