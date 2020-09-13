angular.module('mamarApp').controller('gmsIndexController', ['$scope', '$rootScope', '$translate', 'apiService', '$state', '$filter',
    function ($scope, $rootScope, $translate, apiService, $state, $filter) {

        $scope.Title = "I am in indexController";
        $scope.language = 'en';
       
        $scope.languages = [
            { Code: "en", Name: "English" },
            { Code: "ae", Name: "عربي" }
        ];
        $scope.centreCodes = [];
        $scope.$parent.lang = $scope.language;
        $scope.$parent.dir = "ltr";
        $("#loadingScreen").show();


        $scope.switchLanguage = function () {
            $translate.use($scope.language);
            $scope.$broadcast('changeLanguage', { language: $scope.language });
            $scope.$parent.dir = $scope.language == 'ae' ? "rtl" : "ltr";
            $scope.$parent.lang = $scope.language;
        };
    
        $("#loadingScreen").hide();
        $("#loadingChargeScreen").hide();
    }]);