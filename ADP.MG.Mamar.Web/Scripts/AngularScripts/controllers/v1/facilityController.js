angular.module('mamarApp').controller('facilityController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, sharedModels, $filter) {
        $scope.totalCount = 0;
        $scope.LoadLookupCenterCodes = function () {
            $scope.lkupCntrCodepm = {
                transportMode: 'M',
                searchString: ''
            };

            //apiService.get('Customs/Lookup/CenterCodes',
            //    $scope.lkupCntrCodepm,
            //    function (results) {
            //        $scope.centerCodes = results.data.ResponseResult.Data;
            //        if ($scope.centerCodes) {
            //            var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) { return (cenCode.Code == 'V') });
            //            $scope.selCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
            //            $scope.PopulateObject();
            //            $scope.PopulateFacilityData();
            //        }
            //    },
            //function error(response) {
            //    console.log('something went wrong in LoadLookupCentreCodes' + response);
            //});
        }
        $scope.report = {
            centerCode: $scope.selectedCenterCode, //"V",
            vBSNumber: '',
        };
        $scope.PopulateObject = function () {
            $scope.mFacilityRequestObject = {
                CenterCode: $scope.DefaultCenterCode,
                pageNumber: 1,
                pageSize: 10,
            }
        }
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.mFacilityRequestObject.pageNumber = newPageNo;
            $scope.PopulateFacilityData();
        }
        $scope.PopulateFacilityData = function () {

            $scope.facilityStatements = null;
            $("#loadingScreen").show();
            apiService.get('Customs/MPayment/GetFacilityInfo', $scope.mFacilityRequestObject, function (results) {
                $scope.facility = results.data.ResponseResult.Data;
                if ($scope.facility != null) {
                    $scope.totalCount = $scope.facility[0].TotalCount;
                }
                $("#loadingScreen").hide();
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }

            $scope.centerCodeChanged = function () {
            $scope.PopulateObject();
            $scope.PopulateFacilityData();
        };
        //$scope.LoadLookupCenterCodes();
        // $scope.PopulateFacilityData();

        //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
        //    $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
        //    $scope.PopulateObject();
        //    $scope.PopulateFacilityData();
        //}

        $scope.DefaultCenterCode = $scope.selectedCenterCode,
        $scope.PopulateObject();
        $scope.PopulateFacilityData();
    }]);