angular.module('mamarApp').controller('lcSettleController',
    [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', 'sharedModels',
        'userAccountStorageFactory', '$log', '$storage',
        function ($scope,
            $rootScope,
            $state,
            $stateParams,
            $filter,
            apiService,
            $uibModal,
            sharedModels,
            userAccountStorageFactory,
            $log, $storage) {

            //#region Methods
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

            $scope.printOutstanding = () => {
                var printParam = {
                    centerCode: $stateParams.centerCode,
                    importerCode: ($scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject && $scope.selectedImporterExporterCode.originalObject.Code) ? $scope.selectedImporterExporterCode.originalObject.Code : $stateParams.importer
                };
                $("#loadingScreen").show();
                apiService.get('Customs/LetterOfCredit/PrintSettledBill',
                    printParam,
                    function (results) {
                        $("#loadingScreen").hide();
                        var result = results.data.ResponseResult;
                        if (result && result.IsValid) {
                            apiService.printDocuments(result.Data);
                        } else {
                            modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No Records found for printing!");
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }

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
                    $scope.searchParameter.importerCode = ($scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject && $scope.selectedImporterExporterCode.originalObject.Code) ? $scope.selectedImporterExporterCode.originalObject.Code : $stateParams.importer;
            }

            $scope.getLCSettleListBySearch = () => {
                validateSearch();
                if ($scope.isValid) {
                    $scope.lcSettleList = null;
                    $scope.totalCount = 0;
                    $("#loadingScreen").show();
                    apiService.post('Customs/LetterOfCredit/SettleList', '',
                        $scope.searchParameter,
                        function (results) {
                            $("#loadingScreen").hide();
                            var result = results.data.ResponseResult;
                            if (result && result.IsValid) {
                                $scope.lcSettleList = result.Data ? result.Data.SettleList : '';
                                $scope.totalCount = $scope.lcSettleList ? $scope.lcSettleList[0].TOT_COUNT : 0;
                                $scope.vhTotalAmount = (result.Data && result.Data.VHTotalAmount) ? result.Data.VHTotalAmount : 0;
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
                $scope.getLCSettleListBySearch();
            }

            //#endregion

            //#region Navigation
            $scope.gotoLCDetails = () => {
                $state.go('lcDetails', { centerCode: $stateParams.centerCode });
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
                    centerCode: $stateParams.centerCode,
                    importerCode: $stateParams.importer,
                    currentYear: '',
                    billNumber: '',
                    vhNumber: '',
                    issueDate: '',
                    expDate: '',
                    payeeName: '',
                    vhAmount: '',
                    pageNumber: 1,
                    pageSize: 10
                };
            }
            $scope.clearSearchFilters = () => {
                initialiseSearch();
            }
            $scope.init = () => {
                $scope.$storage = $storage;
                $scope.vhTotalAmount = 0;
                initialiseSearch();
                $scope.getLCSettleListBySearch();
            }
            //#endregion

            //On Page Load
            $scope.init();

        }
    ]);
