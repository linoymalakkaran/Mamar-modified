// config

var mamarApp = angular
    .module("mamarApp")
    .config([
        "$controllerProvider",
        "$compileProvider",
        "$filterProvider",
        "$provide",
        "$httpProvider",
        function (
            $controllerProvider,
            $compileProvider,
            $filterProvider,
            $provide,
            $httpProvider
        ) {
            $compileProvider.debugInfoEnabled(false);
            //$compileProvider.commentDirectivesEnabled(false);
            //$compileProvider.cssClassDirectivesEnabled(false);
            // lazy controller, directive and service
            mamarApp.controller = $controllerProvider.register;
            mamarApp.directive = $compileProvider.directive;
            mamarApp.filter = $filterProvider.register;
            mamarApp.factory = $provide.factory;
            mamarApp.service = $provide.service;
            mamarApp.constant = $provide.constant;
            mamarApp.value = $provide.value;
            $httpProvider.useLegacyPromiseExtensions = false;
        },
    ])
    .config(function ($translateProvider) {
        $translateProvider.registerAvailableLanguageKeys(["en", "ae"], {
            en: "en",
            ae: "ae",
        });

        $translateProvider.useStaticFilesLoader({
            prefix: "../global_assets/locales/",
            suffix: ".json",
        });

        $translateProvider.preferredLanguage("en");
        $translateProvider.fallbackLanguage("ae");
    });

angular.module("mamarApp").constant("mamarAppConstants", {
    getPCSWebUrl: "~/Home/Get",
    Account_login: "/Account/login",
    localhostBaseApi: "http://localhost:6543/api/",
    appVersion: 'v2'
});

angular.module('mamarApp').constant('appVersionConfiguration', getAppVersionConfiguration());
//angular.module('mamarApp').service('APIInterceptor', ['appVersionConfiguration', 'mamarAppConstants',
//    function (appVersionConfiguration, mamarAppConstants) {
//        var service = this;
//        debugger;
//        service.request = function (config) {
//            config.headers.version = mamarAppConstants.appVersion;
//            return config;
//        };
//    }]);

//angular.module("mamarApp").factory('APIInterceptor'['mamarAppConstants', 'window', '$q',
//    function (mamarAppConstants, $window, $q) {
//        return {
//            request: function (config) {
//                debugger;
//                config.headers = config.headers || {};
//                config.headers.version = mamarAppConstants.appVersion;
//                return config || $q.when(config);
//            },
//            response: function (response) {
//                if (response.status === 401) {
//                    //  Redirect user to login page / signup Page.
//                }
//                return response || $q.when(response);
//            }
//        };
//    }]);

angular.module('mamarApp').config(['$httpProvider', 'mamarAppConstants', function ($httpProvider, mamarAppConstants) {
    //$httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.common['version'] = mamarAppConstants.appVersion;
}]);

angular.module('mamarApp').config(['$httpProvider', 'mamarAppConstants', function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', 'mamarAppConstants',
        function ($q, mamarAppConstants) {
            return {
                'request': function (request) {
                    if (request.url.substr(-5) == '.html') {
                        if (request.url.startsWith('../tpl')) {
                            var appVersion = mamarAppConstants.appVersion;
                            var requestUrl = request.url.replace('../tpl', '');
                            var templateBaseUrl = `../tpl/${appVersion}${requestUrl}`;
                            request.url = templateBaseUrl;
                        }
                        //var versioOfApi = appVersionConfiguration[request.url.method];
                        //else {
                        //    debugger;
                        //    $httpProvider.interceptors.push('APIInterceptor');
                        //    //request.headers.version = mamarAppConstants.appVersion;
                        //}
                        //request.params = {
                        //    v: appVersion
                        //}
                    }
                    return $q.resolve(request);
                }
            }
        }]);
}]);



//angular.module('mamarApp').run(['$rootScope', '$window', 'appVersion', 'configService',
//    function ($rootScope, $window, version, configService) {
//        $rootScope.checkVersion = function () {
//            configService.getVersion().then(function (data) {
//                if (data.appVersion != appVersion) {
//                    // show user a message that new version is available
//                    promptUserForReload().then(function () {
//                        $window.location.reload(true);
//                    })
//                }
//            });
//        }

//        $window.addEventListener("focus", $rootScope.checkVersion);

//        $rootScope.checkVersion();
//    }])

function redirect(url) {
    let $a = $('<a href="#"></a>');
    $a.attr("href", url);
    $a[0].click();
}


function getAppVersionConfiguration() {
    return {
        versions: ['v1', 'v2'],
        v1: {
            api: {
                version: 'v1',
                isMultipleVersionsAvailable: false,
                apiEndPointVersionsOtherThanCurrentOne: {
                }
            },
            tpl: {
                version: 'v1',
                isMultipleVersionsAvailable: false,
                tplEndPointVersionsOtherThanCurrentOne: {

                }
            },
            ctrl: {
                version: 'v1',
                isMultipleVersionsAvailable: false,
                ctrlEndPointVersionsOtherThanCurrentOne: {

                }
            }
        },
        v2: {
            api: {
                version: 'v2',
                isMultipleVersionsAvailable: true,
                apiEndPointVersionsOtherThanCurrentOne: {
                    'token/SetAuthCookie': 'v1',
                    'Customs/Lookup/MaterialType': 'v1'
                }
            },
            tpl: {
                version: 'v2',
                isMultipleVersionsAvailable: false,
                tplEndPointVersionsOtherThanCurrentOne: {

                }
            },
            ctrl: {
                version: 'v1',
                isMultipleVersionsAvailable: false,
                ctrlEndPointVersionsOtherThanCurrentOne: {

                }
            }
        }
    }
}