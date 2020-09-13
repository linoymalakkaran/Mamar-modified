angular.module('mamarApp').controller('userIndexController', ['$scope', '$rootScope', '$http', '$location', '$stateParams', 'apiService', '$storage', '$filter', '$timeout',
    function ($scope, $rootScope, $http, $location, $stateParams, apiService, $storage, $filter, $timeout) {
        $scope.loading = false;
        //On Load
        function init() {
            $scope.loading = false;
            $scope.user = {};
            $scope.user.UseroId = $location.search().oid;
            $scope.user.SecurityKey = $location.search().EN_CRP;
            $scope.isValidUserName = true;
            $scope.isValidPassword = true;
            $scope.isValidConfirmPassword = true;
            $scope.isValid = true;
            $scope.isSuccess = false;
            $scope.userCreationFailed = false;
        }
        init();
        /////////////////////////////////////

        //Validate
        function validateUser() {
            $scope.userCreationFailed = false;
            $scope.isValid = true;
            $scope.isValid = ($scope.user.Password != $scope.user.RePassword) ? false : $scope.isValid;
        }

        $scope.saveUser = () => {
            validateUser();
            if (!$scope.isValid)
                return;

            //save user if valid
            $scope.loading = true;
            var apiUrl = document.getElementById("apiurl").value;
            $http.post(apiUrl + 'api/Customs/UserManagement/SetUserCredentials', $scope.user).then(function (result) {
                $scope.loading = false;
                var response = result.data;
                if (response.IsValid)
                    $scope.isSuccess = true;
                else {
                    $scope.userCreationFailed = true;
                    $scope.userCreationFailedMsg = response.Message;
                }
            },
            function (response) {
                $scope.loading = false;
                $scope.userCreationFailed = true;
                $scope.userCreationFailedMsg = response ? response.statusText:"Server Error";
            });
        } 
    }]);