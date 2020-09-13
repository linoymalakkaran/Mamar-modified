'use strict';

var env = {};

// Import variables if present (from env.js)
if (window) {
    Object.assign(env, window.__env);
}

var mamarApp = angular.module('mamarApp', [
    'ui.router',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'oc.lazyLoad',
    'ui.bootstrap',
    'pascalprecht.translate',
    'angucomplete-alt',
    'template/tabs/tabs.html',
    'template/tabs/pane.html',
    'ui.bootstrap.tabs',
    'angularUtils.directives.dirPagination',
    'ngCookies',
]);

// Register environment in AngularJS as constant
ngModule.constant('__env', env);

mamarApp.controller('headController', function ($scope) {
    $scope.arabicCSS = null;
});
