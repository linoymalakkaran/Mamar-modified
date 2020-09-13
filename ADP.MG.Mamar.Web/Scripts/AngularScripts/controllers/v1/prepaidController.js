angular.module('mamarApp').controller('prepaidController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$uibModal', 'exemptionEntryGroupInfoService','sharedModels',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $uibModal, exemptionEntryGroupInfoService, sharedModels) {
        $scope.totalCount = 0;
        $scope.mPrepaidRequestObject = {
            CenterCode: "V",
            pageNumber: 1,
            pageSize: 10,
        };

        $scope.loadMoreRecords = function (newPageNo) {
            $scope.mPrepaidRequestObject.pageNumber = newPageNo;
            $scope.PopulateData();
        }

        $scope.PopulateData = function () {
            $("#loadingScreen").show();
            $scope.mPrepaidRequestObject.CenterCode = $scope.DefaultCenterCode;
            apiService.get('Customs/MPayment/GetPrepaidMT942List', $scope.mPrepaidRequestObject, function (results) {
                $scope.prepaidObject = results.data.ResponseResult.Data;
                if ($scope.prepaidObject != null) {
                    $scope.totalCount = $scope.prepaidObject[0].TotalCount;
                }
                $("#loadingScreen").hide();
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        };
        $scope.openMT942Details = function (seqNumber) {
            exemptionEntryGroupInfoService.setSerialNo(seqNumber);
            var modalInstance = $uibModal.open({
                templateUrl: '../tpl/ADCBMT942AutomaticDetails.html',
                size: 'lg', //modal open size large
                backdrop: 'static',
                keyboard: false,
                controller: 'adcbMT942AutomaticDetailsController',
            });
        }

        //$scope.PopulateData();
        //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
        //    $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
        //    $scope.PopulateData();
        //}

        $scope.DefaultCenterCode = $scope.selectedCenterCode;
        $scope.PopulateData();
    }]);