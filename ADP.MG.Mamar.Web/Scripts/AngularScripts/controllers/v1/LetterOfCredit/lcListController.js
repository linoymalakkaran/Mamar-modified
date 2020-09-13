angular.module('mamarApp').controller('lcListController',
    [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', 'sharedModels',
        'userAccountStorageFactory', '$log', '$storage','$timeout','Excel',
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
                $scope.invalidStartEndDate = false;

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

                if ($scope.searchParameter.startDate && $scope.searchParameter.endDate) {
                    var dtStart = apiService.formatDateObject($scope.searchParameter.startDate);
                    var dtEnd = apiService.formatDateObject($scope.searchParameter.endDate);
                    if (dtStart > dtEnd) {
                        $scope.invalidStartEndDate = true;
                    };
                }
                $scope.isValid = $scope.invalidStartEndDate ? false : $scope.isValid;

            }
            $scope.getLCListBySearch = () => {
                validateSearch();
                if ($scope.isValid) {
                    $scope.lcList = null;
                    $scope.totalCount = 0;
                    $("#loadingScreen").show();
                    apiService.post('Customs/LetterOfCredit/ControlList', '',
                        $scope.searchParameter,
                        function (results) {
                            $("#loadingScreen").hide();
                            var result = results.data.ResponseResult;
                            if (result && result.IsValid) {
                                $scope.lcList = result.Data ? result.Data.ControlList : '';
                                $scope.totalCount = $scope.lcList ? $scope.lcList[0].TOT_COUNT : 0;
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

            function getLCReportData(onGenerateExcel) {
                $scope.lcReportData = null;
                apiService.get('Customs/LetterOfCredit/GenerateExcel',
                    { cenCode: $scope.selectedCenterCode },
                    function (results) {
                        var result = results.data.ResponseResult;
                        if (result && result.IsValid) {
                            $scope.lcReportData = result.Data ? result.Data.Items : '';
                            if (onGenerateExcel)
                                $scope.exportLCtoExcel('#exportTable');
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });
            }

            $scope.loadMoreRecords = function (newPageNo) {
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.getLCListBySearch();
            }
            $scope.exportLCtoExcel = (tableId) => {
                if ($scope.lcReportData) {
                    var sheetDate = $filter('date')(new Date(), "ddMMyyyyHHmmss");
                    $scope.exportHref = Excel.tableToExcel(tableId, 'Bank_Guarantee_' + sheetDate);
                    $timeout(function () {
                        //var sheetDate = $filter('date')(new Date(), "ddMMyyyyHHmmss");
                        var link = document.createElement('a');
                        link.download = "Bank_Guarantee_" + sheetDate + ".xls";
                        link.href = $scope.exportHref;
                        link.click();
                    }, 100);
                }
                else {
                    getLCReportData(true);
                }
            }
            //#endregion

            //#region Navigation
            $scope.gotoLCDetails = () => {
                var selectedCenter = $filter('filter')($scope.centerCodes,
                    function (cenCode) { return (cenCode.Code == $scope.selectedCenterCode) });
                var selectedCenterCodeDetails = (selectedCenter && selectedCenter.length > 0) ? (selectedCenter[0].Code + ' ' + selectedCenter[0].EnglishName + ' ' + selectedCenter[0].ArabicName) : '';
                $storage.set('LCCenterCode', selectedCenterCodeDetails);
                $state.go('lcDetails', { centerCode: $scope.selectedCenterCode });
            }
            //#endregion

            //#region initialisation
            function initialiseSearch() {

                $scope.isValid = true;
                $scope.invalidStartDate = false;
                $scope.invalidEndDate = false;
                $scope.invalidStartEndDate = false;
                $scope.invalidImporter = false;
                $scope.importer = '';
                $scope.selectedImporterExporterCode = {};
                $scope.selectedImporterExporterCode.originalObject = {};

                $scope.searchParameter = {
                    centerCode: $scope.selectedCenterCode,
                    importerCode: '',
                    importerDescription: '',
                    startDate: '',
                    endDate: '',
                    lcNumber: '',
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
                $scope.lcList = null;
            }
            $scope.onCenterCodeChanged = function () {
                initialiseSearch();
                $scope.searchParameter.centerCode = $scope.selectedCenterCode;
                $scope.lcList = null;
                getLCReportData(false);
            }

            //#endregion
            //On Page Load
            $scope.init();

        }
    ]);
