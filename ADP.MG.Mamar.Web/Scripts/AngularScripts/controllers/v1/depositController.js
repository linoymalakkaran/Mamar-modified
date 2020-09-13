angular.module('mamarApp').controller('depositController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService','sharedModels','$filter',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, sharedModels, $filter) {
        $scope.totalCount = 0;
        $scope.LoadLookupCenterCodes = function () {
            $scope.lkupCntrCodepm = {
                transportMode: 'M',
                searchString: ''
            };
            
            apiService.get('Customs/Lookup/CenterCodes',
                $scope.lkupCntrCodepm,
                function (results) {
                    $scope.centerCodes = results.data.ResponseResult.Data;
                    if ($scope.centerCodes) {
                        var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) { return (cenCode.Code == 'V') });
                        $scope.selCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
                        $scope.PopulateObject();
                        $scope.PopulateData();
                    }
                },
            function error(response) {
                console.log('something went wrong in LoadLookupCentreCodes' + response);
            });
        }
        $scope.report = {
            centerCode: "V",
            vBSNumber: '',
        };
        $scope.PopulateObject = function () {
            $scope.depositRequestObject = {
                CenterCode: $scope.DefaultCenterCode,
                pageNumber: 1,
                pageSize: 10,
            }
        }
        $scope.loadMoreRecords = function (newPageNo) {

            $scope.depositRequestObject.pageNumber = newPageNo;
            $scope.PopulateData();
        }
        $scope.PopulateData = function () {
            $("#loadingScreen").show();
            $scope.facilityStatements = null;
            apiService.get('Customs/MPayment/GetDeposits', $scope.depositRequestObject, function (results) {
                $scope.deposit = results.data.ResponseResult.Data;
                if ($scope.deposit != null) {
                    $scope.totalCount = $scope.deposit[0].TotalCount;
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
            $scope.PopulateData();
        };
        //$scope.LoadLookupCenterCodes();
       // $scope.PopulateData();

        if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
            $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
            $scope.PopulateObject();
            $scope.PopulateData();
        }
    }]);