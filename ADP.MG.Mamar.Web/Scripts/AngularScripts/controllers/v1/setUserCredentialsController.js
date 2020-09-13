angular.module('mamarApp').controller('setUserCredentialsController', ['$scope', '$rootScope', '$http', '$location', '$stateParams', 'apiService', '$storage', '$filter', '$timeout',
    function ($scope, $rootScope, $http, $location, $stateParams, apiService, $storage, $filter, $timeout) {

        //On Load
        function init() {
            $scope.loading = false;
            $scope.user = {};
            $scope.user.UseroId = $location.search().oid;
            $scope.isValidUserName = true;
            $scope.isValidPassword = true;
            $scope.isValidConfirmPassword = true;
            $scope.isValid = true;
            $scope.usernameExists = null;
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
            $("#loading").show();
            var apiUrl = document.getElementById("apiurl").value;
            $http.post(apiUrl + '/api/Customs/UserManagement/SetUserCredentials', $scope.user).then(function (result) {
                $("#loading").hide();
                var response = result.data;
                if(response.IsValid)
                    $scope.isSuccess = true;
                else
                {
                    $scope.userCreationFailed = true;
                    $scope.userCreationFailedMsg = response.Message;
                }
            },
            function (response) {
                $("#loading").hide();
                $scope.userCreationFailed = true;
                $scope.userCreationFailedMsg = response;
            });
        }

        $scope.redirectToLogin = () =>
        {
            window.location = document.getElementById("loginUrl").value;
        }

    }]);