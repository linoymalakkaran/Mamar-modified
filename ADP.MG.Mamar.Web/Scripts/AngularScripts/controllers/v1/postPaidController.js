angular.module('mamarApp').controller('postPaidController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$uibModal', 'exemptionEntryGroupInfoService', 'sharedModels',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $uibModal, exemptionEntryGroupInfoService, sharedModels) {
        $scope.totalCount = 0;
        $scope.mPostPaidRequestObject = {
            CenterCode: "V",
            pageNumber: 1,
            pageSize: 10,
        };

        $scope.loadMoreRecords = function (newPageNo) {
            $scope.mPostPaidRequestObject.pageNumber = newPageNo;
            $scope.PopulateData();
        };

        $scope.PopulateData = function () {
            $("#loadingScreen").show();
            $scope.mPostPaidRequestObject.CenterCode = $scope.DefaultCenterCode;
            apiService.get('Customs/MPayment/GetPostpaidMT942List', $scope.mPostPaidRequestObject, function (results) {
                $scope.postPaidObject = results.data.ResponseResult.Data;
                if ($scope.postPaidObject != null) {
                    $scope.totalCount = $scope.postPaidObject[0].TotalCount;
                }

                $("#loadingScreen").hide();
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }

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
        // $scope.PopulateData();
        //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
        //    $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
        //    $scope.PopulateData();
        //}

        $scope.DefaultCenterCode = $scope.selectedCenterCode;
        $scope.PopulateData();
    }]);