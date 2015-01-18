define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Persistance = require('../ext/caoutchouc/browser').get('persistance');
    var Templating = require('../ext/caoutchouc/templating');

    var Settings = function (router) {
        Abstract.call(this, router);
        this.name = 'Settings';
        this.enabled = true;
    };

    Settings.prototype = Object.create(Abstract.prototype);

    Settings.prototype.routes = {};
    Settings.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': 'Settings',
            'icon': 'icon-cog',
            'view': 'settings_page',
            'action': 'replace-first',
        });

        this.router.dispatch({
            stack: 'settings_page',
            name: 'settings_page',
            action: 'replace-first',
        });
    };

    Settings.prototype.findModuleById = function (module_id) {
        for (var i in this.router.modules) {
            if (this.router.modules.hasOwnProperty(i)) {
                if (this.router.modules[i].id !== module_id) {
                    continue;
                }

                return this.router.modules[i];
            }
        }

        return null;
    };

    Settings.prototype.castParam = function (param_type, param_value) {
        if (param_type === 'number') {
            param_value = parseFloat(param_value);

        } else if (param_type === 'boolean') {
            if (parseInt(param_value, 10) === 0) {
                param_value = false;
            } else {
                param_value = !!param_value;
            }
        }

        return param_value;
    };

    Settings.prototype.routes.settings_save = function (options) {
        var param_ref = options.data.param_ref;
        var module_id = param_ref.substr(0, param_ref.indexOf('#'));
        var param_name = param_ref.substr(param_ref.indexOf('#') + 1);

        var module = this.findModuleById(module_id);

        if (module === null) {
            return;
        }

        var param_type = typeof module.context.settings[param_name];

        if (param_type === 'undefined') {
            return;
        }

        var param_value = this.castParam(param_type, options.data.param_value);

        module.context.settings[param_name] = param_value;
        console.log(module.context.settings);
    };

    Settings.prototype.routes.settings_page = function (options) {
        var p = Promise.resolve();

        var settingsPages = [];

        var addSettingPage = function (settingsPage) {
            settingsPages.push(settingsPage);
            return Promise.resolve();
        };

        for (var i in this.router.modules) {
            if (this.router.modules.hasOwnProperty(i)) {
                var module = this.router.modules[i];
                if (module.settingsPage !== undefined) {
                    p = p.then(module.settingsPage.bind(module))
                        .then(addSettingPage);
                }
            }
        }

        p
            .then(function () {
                return Templating.render('templates/settings.mst', {
                    settingsPages: settingsPages,
                });
            })
            .then(function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this));

    };

    module.exports = Settings;
});