angular.module('mamarApp').controller('AdminRecordController',
    [
        '$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter', '$log',
        'userAccountStorageFactory', '$storage',
        function ($scope,
            $rootScope,
            $http,
            $state,
            $stateParams,
            apiService,
            sharedModels,
            $filter,
            $log,
            userAccountStorageFactory,
            $storage) {
          
            $scope.userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

            function InitialiseSearch() {
                $scope.searchParameter = {
                    Query: '',
                    CenterCode: null,
                    CompanyCode: null,
                    UserCode :null
                };

                $scope.searchParameter1 = {
                    Query: '',
                    CenterCode: null,
                    CompanyCode: null,
                    UserCode: null
                };
            }

            function ResetPageNumber() {
                //$scope.searchParameter.pageNumber = 1;
            }

            // init
            $scope.initPendingTrans = function () {
                $("#loadingScreen").show();
                InitialiseSearch();
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedTransMode)) {
                    $scope.getCenterCodes();
                }
            }
            $scope.loadMoreRecords = function (newPageNo) {
                //$scope.searchParameter.pageNumber = newPageNo;
                $scope.PopulateData();
            }
    
            $scope.PopulateData = function () {
                $("#loadingScreen").show();
                $scope.searchParameter1 = angular.copy($scope.searchParameter);
                $scope.searchParameter1.Query = btoa($scope.searchParameter1.Query);
                apiService.post('Customs/Lookup/RunGenericQuery', '',
                    $scope.searchParameter1,
                    function (results) {
                        if (results.data.ResponseResult != "")
                        {
                            console.log(results.data);
                            $scope.ksaCreateBillData = results.data.ResponseResult;
                            //if ($scope.ksaCreateBillData != null) {
                            //    $scope.totalCount = $scope.ksaCreateBillData[0].Total;
                            //}
                        }
                        $("#loadingScreen").hide();

                    },
                    function error(err) {
                        showErrorMessage(err);
                        $scope.ksaCreateBillData = null;
                        $("#loadingScreen").hide();
                        $log.log(err);
                    });
            }
            $scope.clearSearchFilters = function () {
                InitialiseSearch();
                //$scope.searchParameter.centerCode = $scope.selectedCenterCode;
                $scope.PopulateData();
            }
            $scope.searchResults = function () {
                if (typeof $scope.searchParameter == "undefined") {
                    $scope.searchParameter = {};
                }
              //  $scope.searchParameter.pageNumber = 1;
                $scope.PopulateData();
            }
            //$scope.getCenterCodes();

          
            // init
            $scope.init = () => {
                InitialiseSearch();
                //$scope.PopulateData();
            }
            $scope.init();

          
           ///

            $scope.exportData = function () {
                $("#exportable").table2excel({
                    filename: "Table.xls"
                });
            };
          
        }
    ]);