angular.module('mamarApp').controller('queryShortageListController',
    [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', 'sharedModels',
        'userAccountStorageFactory', '$log', '$storage', '$timeout', 'Excel',
        function ($scope,
            $rootScope,
            $state,
            $stateParams,
            $filter,
            apiService,
            $uibModal,
            sharedModels,
            userAccountStorageFactory,
            $log, $storage, $timeout, Excel) {

            //#region Lookup Methods
            var loadLookupBillType = function () {
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
                    apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParameter, function (results) {

                        $scope.lookupBillTpResult = angular.copy(results.data.ResponseResult.Data);
                        storeData(results.data.ResponseResult.Data, 'billTypes', $scope.selectedCenterCode);
                        if ($scope.lookupBillTpResult) {
                            $scope.lookupBillTpResult.unshift(opt);
                        }
                    },
                        function error(response) {
                            console.log(response);
                        })
                });
            }
            //GET CENTER CODES
            $scope.getCenterCodes = () => {
                $("#loadingScreen").show();
                apiService.get('Customs/Lookup/CenterCodes',
                    $scope.centerCodelookUpParams,
                    function (results) {
                        $("#loadingScreen").hide();
                        if (results.data.ResponseResult != "") {
                            $scope.centerCodes = results.data.ResponseResult.Data;
                            if ($scope.centerCodes) {
                                var selectedCenter = $filter('filter')($scope.centerCodes,
                                    function (cenCode) { return (cenCode.Code == 'V') });
                                $scope.selectedCenterCode = selectedCenter.length == 1
                                    ? selectedCenter[0].Code
                                    : $scope.centerCodes.length > 0
                                        ? $scope.centerCodes[0].Code
                                        : "";

                                $scope.onCenterCodeChanged();
                            }
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log('something went wrong in LoadLookupCentreCodes' + response);
                    });
            }

            //importer lookup
            $scope.ImporterExporterChanged = function (searchStr) {
                if (searchStr) {
                    apiService.get('Customs/Lookup/ImporterExporter',
                        {
                            centerCode: $scope.selectedCenterCode,
                            searchString: searchStr
                        },
                        function (results) {
                            $scope.importersExporters = results.data.ResponseResult.Data;
                        },
                        function error(response) {
                            console.log("An Error has occurred while getting lookup Data of Importer Exporter!");
                        });
                }
            };
            //#endregion

            //#region Methods
            function validateSearch() {

                $scope.isValid = true;
                $scope.invalidImporter = false;
              
                var importerSelected = $scope.selectedImporterExporterCode
                    ? $scope.selectedImporterExporterCode.originalObject.Code +
                    $scope.selectedImporterExporterCode.originalObject.EnglishName +
                    ($scope.selectedImporterExporterCode.originalObject.ArabicName
                        ? $scope.selectedImporterExporterCode.originalObject.ArabicName
                        : '')
                    : '';
                if (($scope.importer &&
                    (importerSelected == 0 ||
                        ($scope.importer.replace(/\s/g, '') != importerSelected.replace(/\s/g, ''))))) {
                    $scope.invalidImporter = true;
                    $scope.isValid = false;
                }

                if (!$scope.invalidImporter)
                    $scope.searchParameter.importerCode = $scope.selectedImporterExporterCode ? $scope.selectedImporterExporterCode.originalObject.Code : '';
                 
            }

            $scope.getQueryShortageListBySearch = () => {
                validateSearch();
                if ($scope.isValid) {
                    $scope.queryShortageList = null;
                    $scope.totalCount = 0;
                    $("#loadingScreen").show();
                    apiService.post('Customs/Invoice/ShortageBillList', '',
                        $scope.searchParameter,
                        function (results) {
                            $("#loadingScreen").hide();
                            var result = results.data.ResponseResult;
                            if (result && result.IsValid) {
                                $scope.queryShortageList = result.Data ? result.Data.BillShorageList : '';
                                $scope.totalCount = $scope.queryShortageList ? $scope.queryShortageList[0].TOT_COUNT : 0;
                            } else {
                                modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No Records found!");
                            }
                        },
                        function error(response) {
                            $("#loadingScreen").hide();
                            console.log(response);
                        });
                }
            }

            $scope.loadMoreRecords = function (newPageNo) {
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.getQueryShortageListBySearch();
            }

            //#region print

             //function getLCReportData(onGenerateExcel) {
            //    $scope.lcReportData = null;
            //    apiService.get('Customs/LetterOfCredit/GenerateExcel',
            //        { cenCode: $scope.selectedCenterCode },
            //        function (results) {
            //            var result = results.data.ResponseResult;
            //            if (result && result.IsValid) {
            //                $scope.lcReportData = result.Data ? result.Data.Items : '';
            //                if (onGenerateExcel)
            //                    $scope.exportLCtoExcel('#exportTable');
            //            }
            //        },
            //        function error(response) {
            //            console.log(response);
            //        });
            //}
            $scope.printDutyShortage = () => {
                //if ($scope.lcReportData) {
                //    $scope.exportHref = Excel.tableToExcel(tableId, 'BankGuarantee');
                //    $timeout(function () {
                //        var sheetDate = $filter('date')(new Date(), "dd/MM/yyyy");
                //        var link = document.createElement('a');
                //        link.download = "BankGuarantee_" + sheetDate + ".xls";
                //        link.href = $scope.exportHref;
                //        link.click();
                //    }, 100);
                //}
                //else {
                //    getLCReportData(true);
                //}
            }
            //#endregion

            //#endregion

            //#region Navigation
            $scope.gotoQueryShortageDetails = (serialNo) => {
                var selectedCenter = $filter('filter')($scope.centerCodes,
                    function (cenCode) { return (cenCode.Code == $scope.selectedCenterCode) });
                var selectedCenterCodeDetails = (selectedCenter && selectedCenter.length > 0) ? (selectedCenter[0].Code + ' ' + selectedCenter[0].EnglishName + ' ' + selectedCenter[0].ArabicName) : '';
                $storage.set('qsCenterCode', selectedCenterCodeDetails);
                $state.go('queryShortageDetails', { centerCode: $scope.selectedCenterCode, serialNumber: serialNo });
            }
            //#endregion

            //#region initialisation
            function initialiseSearch() {

                $scope.isValid = true;
                $scope.invalidImporter = false;
                $scope.importer = '';
                $scope.selectedImporterExporterCode = {};
                $scope.selectedImporterExporterCode.originalObject = {};

                $scope.searchParameter = {
                    centerCode: $scope.selectedCenterCode,
                    serialNumber: '',
                    issueDate: '',
                    jobNumber: '',
                    billNumber: '',
                    billType: '',
                    billYear: '',
                    billCenterCode: '',
                    importerCode: '',
                    importerDescription: '',
                    vchrNumber: '',
                    pageNumber: 1,
                    pageSize: 10
                };
            }
            $scope.clearSearchFilters = () => {
                initialiseSearch();
            }
            $scope.init = () => {
                $scope.$storage = $storage;
                $scope.transModes = apiService.getTransportModeList();
                $scope.selectedTransMode = $scope.transModes ? $scope.transModes[0].key : '';
                $scope.centerCodelookUpParams = {
                    transportMode: $scope.selectedTransMode,
                    searchString: ''
                };
                $scope.onModeChanged();
            }
            //#endregion

            //#region on change event
            $scope.onModeChanged = function () {
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.selectedMode = $scope.selectedTransMode;
                $scope.getCenterCodes();
                $scope.queryShortageList = null;
            }
            $scope.onCenterCodeChanged = function () {
                initialiseSearch();
                $scope.searchParameter.centerCode = $scope.selectedCenterCode;
                $scope.queryShortageList = null;
                loadLookupBillType();
                $scope.getQueryShortageListBySearch();
            }

            //#endregion
            //On Page Load
            $scope.init();

        }
    ]);
