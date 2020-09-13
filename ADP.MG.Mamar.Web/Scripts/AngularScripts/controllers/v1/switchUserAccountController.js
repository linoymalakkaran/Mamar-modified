angular.module('mamarApp').controller('switchUserAccountController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$window', '$storage', 'userAccountStorageFactory',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $filter, $window, $storage , userAccountStorageFactory) {

        $('#myModal').modal('show');
        $scope.isNavigated = $stateParams.isNavigated;
        localStorage.setItem("isNavigatedFromLogin", angular.toJson(false));
        $scope.userAccounts = [];
        $scope.selectedAccount = "";
        $scope.isValidAccount = true;
        $scope.$storage = $storage;

        $scope.init = function () {
            $scope.uaDetails = userAccountStorageFactory.getUserAccntInfo();
            if ($scope.uaDetails) {
                $scope.userAccounts = $scope.uaDetails.accounts;
                $scope.selAccount = $filter('filter')($scope.userAccounts, function (ua) { return (ua.pKey == $scope.uaDetails.UCode) });
                $scope.selectedUserAccount = ($scope.selAccount && $scope.selAccount.length == 1) ? $scope.selAccount[0] : $scope.userAccounts[0];
                $scope.selectedAccountSuperUser = $scope.selectedUserAccount.pValue + ' ' + $scope.selectedUserAccount.pCompany;
            }
        }

        $scope.selectedAccountChange = function (selected) {
            $scope.onAccountChange(selected.originalObject.pKey);
            $scope.selectedUserAccount = selected.originalObject;
            $scope.isValidAccount = true;
        }

        $scope.onAccountChange = function (item) {
            $scope.userInfo = $scope.uaDetails ? angular.copy($scope.uaDetails) : '';
            var selectedItem = $filter('filter')($scope.userAccounts, { pKey: item }, true)[0];
            $scope.uaDetails.UCode = selectedItem.pKey;
            $scope.uaDetails.CCode = selectedItem.pValue;
            userAccountStorageFactory.setUserAccntInfo($scope.uaDetails);
            $scope.$emit('userAccountChanged', $scope.uaDetails);
            $storage.set('announcemnetShownFlag', false);
        }

        //go back to prev history
        $scope.goBack = function () {
            $('#myModal').modal('hide');
            if ($scope.userInfo) {
                $scope.uaDetails.UCode = $scope.userInfo.UCode;
                $scope.uaDetails.CCode = $scope.userInfo.CCode;
                userAccountStorageFactory.setUserAccntInfo($scope.uaDetails);
                $scope.$emit('userAccountChanged', $scope.uaDetails);
            }
            $window.history.back();
        }

        $scope.gotToDashboard=function()
        {
            Validate();
            if ($scope.isValidAccount) {
                $('#myModal').modal('hide');
                var page = "dashboard";
                //if ($('#ddlUserAccount :selected').text().toUpperCase().contains("CONSOLIDATOR")) {
                //    page = "consolidatorManifestUpload";
                //    window.location = $Url.resolve('~/Home/ConsolidatedIndex#/consolidatorManifestUpload');
                //}
                //else {
                //    window.location = $Url.resolve('~/Home/Index#/dashboard');
                //    //$state.go(page, {
                //    //    notify: true
                //    //});
                //}
                if ($scope.selectedUserAccount && ($scope.selectedUserAccount.pValue.toUpperCase().contains("CONSOLIDATOR"))) {
                    page = "consolidatorManifestUpload";

                    if (localStorage.getItem("subscribeObj") != undefined) {
                        var obj = JSON.parse(localStorage.getItem("subscribeObj"));
                        $scope.subscriptionRequired = obj.subscriptionRequired;
                    }
                    if ($scope.subscriptionRequired != undefined && $scope.subscriptionRequired) {
                        page ='subscription';
                    }
                    
                    window.location = $Url.resolve('~/Home/ConsolidatedIndex#/' + page);
                }
                else {
                    window.location = $Url.resolve('~/Home/Index#/dashboard');
                }
            }
        }

        function Validate()
        {
            $scope.isValidAccount = true;

            if (!$scope.selectedAccountSuperUser || !$scope.selectedUserAccount)
            {
                $scope.isValidAccount = false;
            }
            else
            {
                var selectedValue = $scope.selectedUserAccount ? (($scope.selectedUserAccount.pValue + ' ' + $scope.selectedUserAccount.pCompany).replace(/\s/g, '')) : '';
                var valueSelected = $scope.selectedAccountSuperUser ? $scope.selectedAccountSuperUser.replace(/\s/g, '') : '';

                if (selectedValue != valueSelected)
                {
                    $scope.isValidAccount = false;
                } 
            } 
        }
        $scope.OnFocusInAngucomplete = function () {
            if ($scope.uaDetails && $scope.uaDetails.isPCSSuperUser == 'False') {
                document.getElementById("ddlSuperUserAccount_value").value = "";
                angular.element('#ddlSuperUserAccount_value').triggerHandler('input');
                $scope.selectedAccountSuperUser = $scope.selectedUserAccount.pValue + ' ' + $scope.selectedUserAccount.pCompany;
            }
        };
        //$scope.onAccountInputChange = function(searchStr)
        //{
        //    $scope.selectedAccountSuperUser = '';
        //}
         
        //init
        $scope.init();

    }]);