angular.module('mamarApp').controller('clearingAgentActivityListController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$storage', 'sharedModels', '$timeout', '$window','Excel',
    function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $storage, sharedModels, $timeout, $window, Excel) {

        $scope.$storage = $storage;
       

        
        var LoadLookupBillType = function () {
            var opt = {};
            opt.Code = '';
            opt.NameEnglish = '--Select--';
            opt.NameArabic = '--الشحن--';

            $scope.lkBillTypeParameter = {
                centerCode: $scope.selectedCenterCode,
                searchString: ''
            };
            getIndexData('billTypes', $scope.selectedCenterCode, function (data) {
                $scope.lookupBillTpResult = data;

                if ($scope.lookupBillTpResult) {
                    $scope.lookupBillTpResult.unshift(opt);
                }

            }, function () {
                $("#loadingScreen").show();
                apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParameter, function (results) {
                    $("#loadingScreen").hide();
                    $scope.lookupBillTpResult = angular.copy(results.data.ResponseResult.Data);
                    storeData(results.data.ResponseResult.Data, 'billTypes', $scope.selectedCenterCode);
                    if ($scope.lookupBillTpResult) {
                        $scope.lookupBillTpResult.unshift(opt);
                    }
                },
            function error(response) {
                $("#loadingScreen").hide();
                console.log(response);
            })
            });
        }

        $scope.downloadActivityLogData = function () {
            $scope.searchParamsDownload = angular.copy($scope.searchParams);
            $scope.searchParamsDownload.pageSize = $scope.totalCount;
            $scope.searchParamsDownload.pageNumber = 1;
            apiService.get('Customs/PendingTransaction/GetCAgentActivityList', $scope.searchParamsDownload, function (result) {
                var response = result.data.ResponseResult;
                var msg = response.Messages ? apiService.formatResponseMessage(response.Messages) : '';
                if (response.IsValid) {
                    $scope.clearingAgentActivityCompleeteList = result.data.ResponseResult ? result.data.ResponseResult.Data : null;

                }
                else if (!response.IsValid) {
                    msg = msg != "" ? msg : "Error!";
                    showErrorMessage(msg);
                }
            },
                function (result) {

                    console.log("An Error has occurred!");
                    console.log(result);
                });
        }


        //$scope.ExportToExcel = function () {
        //    if ($scope.clearingAgentActivityCompleeteList) {
        //        var createdDate = new Date();
        //        $("#exportTable").table2excel({
        //            filename: "ActivityLog_" + (createdDate) + ".xls",
        //            preserveColors: true
        //        });
        //    }
        //}

        $scope.exportToExcel = function (tableId) {
            if ($scope.clearingAgentActivityCompleeteList) {
                $scope.exportHref = Excel.tableToExcel(tableId, 'Activity Log');
                $timeout(function () {
                    var sheetDate = $filter('date')(new Date(), "dd/MM/yyyy");
                    var link = document.createElement('a');
                    link.download = "Activitylog_" + sheetDate + ".xls";
                    link.href = $scope.exportHref;
                    link.click();
                }, 100);
            }
        };
        
        $scope.getCenterCodes = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/Lookup/CenterCodes', $scope.centerCodelookUpParams,
                function (results) {
                    $("#loadingScreen").hide();
                    if (results.data.ResponseResult != "") {
                        $scope.centerCodes = results.data.ResponseResult.Data;
                        if ($scope.centerCodes) {

                            var custManifestCenter = $storage.get('shortCustomCenterCode');
                            var customCenterCode = custManifestCenter ? custManifestCenter[0].Code : 'V';

                            var selectedCenter = $filter('filter')($scope.centerCodes,
                                function (cenCode) { return (cenCode.Code == customCenterCode) });
                            $scope.selectedCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ?
                                $scope.centerCodes[0].Code : "";
                            $scope.searchParams.centerCode = $scope.selectedCenterCode;
                            $scope.onCenterCodeChanged();
                        }

                    } else {
                        $("#loadingScreen").hide();
                    }
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log('something went wrong in LoadLookupCentreCodes' + response);
                });
        }


        // Get Bill Types
        $scope.lkBillTypeParams = {
            centerCode: $scope.selectedCenterCode ? $scope.selectedCenterCode : 'V',
            searchString: ''
        };


        // on transport mode changed
        $scope.onModeChanged = function () {
            $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
            $scope.getCenterCodes();
            $scope.resetSearchFilters();
        }

        // on center code changed
        $scope.onCenterCodeChanged = function () {
            $scope.searchParams.centerCode = $scope.selectedCenterCode;
            if ($scope.searchParams.centerCode) {
                LoadLookupBillType();
                $scope.resetSearchFilters();

            }
            else {
                $timeout(function () {
                    LoadLookupBillType();
                    $scope.resetSearchFilters();
                });
            }
        
        }

        // Get Search Results
        $scope.getSearchResult = function () {
            $scope.invalidStartDate = false;
            $scope.invalidEndDate = false;
            $scope.invalidStartEndDate = false;
            $scope.searchParams.pageNumber = 1;

            $scope.invalidStartDate = $scope.searchParams.startDate ? false : true;
            $scope.invalidEndDate = $scope.searchParams.endDate ? false : true;

            if ($scope.searchParams.startDate && $scope.searchParams.endDate && ($scope.searchParams.endDate < $scope.searchParams.startDate)) {
               $scope.invalidStartEndDate = true;
            }

            if ($scope.invalidStartDate || $scope.invalidEndDate || $scope.invalidStartEndDate) {
                return;
            }
            else {
                getClearingAgentActivityList();
            }
        }

        // Reset Search Filters
        $scope.resetSearchFilters = function () {
            $scope.invalidStartDate = false;
            $scope.invalidEndDate = false;
            $scope.invalidStartEndDate = false;
            $scope.searchParams.startDate = $scope.searchParams.endDate = $scope.searchParams.billNumber = $scope.searchParams.jobNumber = $scope.searchParams.billType = '';
            $scope.clearingAgentActivityList = null;
            $scope.clearingAgentActivityCompleeteList = null;
        }

        // Get Clearing Agent activity List
        function getClearingAgentActivityList() {
            $("#loadingScreen").show();
            apiService.get('Customs/PendingTransaction/GetCAgentActivityList', $scope.searchParams, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = response.Messages ? apiService.formatResponseMessage(response.Messages) : '';
                if (response.IsValid) {
                    $scope.clearingAgentActivityList = result.data.ResponseResult ? result.data.ResponseResult.Data : null;
                    $scope.totalCount = $scope.clearingAgentActivityList ? $scope.clearingAgentActivityList[0].TotalCount : null;
                    if ($scope.totalCount > $scope.searchParams.pageSize)
                        $scope.downloadActivityLogData();
                    else
                        $scope.clearingAgentActivityCompleeteList = $scope.clearingAgentActivityList;
                }
                else if (!response.IsValid) {

                    msg = msg != "" ? msg : "Error!";
                    showErrorMessage(msg);
                }
            },
                function (result) {
                    $("#loadingScreen").hide();
                    console.log("An Error has occurred!");
                    console.log(result);
                });
        }


        // load More Records
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.searchParams.pageNumber = newPageNo;
            getClearingAgentActivityList();
        }

        // init
        $scope.init = function () {
            // Get Center Codes List based on transport mode
            $scope.transModes = [
                { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
                { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
            ];
            $scope.selectedTransMode = $scope.transModes[0].key;
            $scope.centerCodelookUpParams = {
            transportMode: $scope.selectedTransMode,
            searchString: ''
            };

            $scope.searchParams = {
                centerCode: '',
                startDate: '',
                endDate: '',
                jobNumber: '',
                billNumber: '',
                billType: '',
                pageNumber: 1,
                pageSize: 10
            };

            $scope.invalidStartDate = false;
            $scope.invalidEndDate = false;
            $scope.getCenterCodes();
        }

        $scope.init();

    }]);