angular.module('mamarApp').controller('accountInformationController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService','sharedModels',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, sharedModels) {

        $scope.totalCount = 0;
        $scope.mAccountInformationRequestObject = {
            CenterCode: "V",
            pageNumber: 1,
            pageSize: 10,
        }
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.mAccountInformationRequestObject.pageNumber = newPageNo;
            $scope.PopulateData();
        }

        $scope.PopulateData = function () {
            $("#loadingScreen").show();
            $scope.mAccountInformationRequestObject.CenterCode = $scope.DefaultCenterCode;
            apiService.get('Customs/MPayment/GetAccountInfo', $scope.mAccountInformationRequestObject, function (results) {
                $scope.accountInformation = results.data.ResponseResult.Data;
                if ($scope.accountInformation != null) {
                    $scope.totalCount = $scope.accountInformation[0].TotalCount;
                }
                $("#loadingScreen").hide();
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }
       // $scope.PopulateData();
        //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
        //    $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
        //    $scope.PopulateData();
        //}

        $scope.DefaultCenterCode = $scope.selectedCenterCode;
        $scope.PopulateData();

    }]);