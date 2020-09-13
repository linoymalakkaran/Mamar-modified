var mamarApp = angular.module('mamarApp');
mamarApp.directive("mamarDialog", function () {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        transclude: true, // Insert custom content inside the directive
        link: function (scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.boxWidth) {
                scope.dialogStyle.width = attrs.boxWidth;
            }
            if (attrs.boxHeight) {
                scope.dialogStyle.height = attrs.boxHeight;
            }
            scope.hideModal = function () {
                scope.show = false;
            };
        },
        templateUrl: 'modalDialog.html'
    };
});