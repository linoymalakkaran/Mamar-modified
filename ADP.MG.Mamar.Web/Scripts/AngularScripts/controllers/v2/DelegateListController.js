angular.module('mamarApp').controller('DelegateListController',
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

            $scope.$storage = $storage;
            $scope.selectedLanguage = $('#selLang :selected').text() == "Arabic"
                ? 'ae'
                : $('#selLang :selected').text() == "English"
                    ? 'en'
                    : 'en';
            $scope.transModes = [
                { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
                { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
            ];

            $scope.selectedTransMode = $storage.get('SelectedTransportModeDelegate') ? angular.copy($storage.get('SelectedTransportModeDelegate')) : $scope.transModes[0].key;

            //$scope.selectedTransMode = $scope.transModes[0].key;
            $scope.centerCodelookUpParams = {
                transportMode: $scope.selectedTransMode,
                searchString: ''
            };

            $scope.centerCodeShipment = $stateParams.centerCode;
            //$scope.jobNoShipment = '';
            var billType = $stateParams.BillType;
            $scope.impExpCategory = $stateParams.ImporterExporterCode;
            $scope.pageNumber = 1;
            $scope.pageSize = 10;
            $scope.globalDisableFlag = $stateParams.globalDisableFlag == "view";

            $scope.parameters = [];

            $scope.parameters = {
                centercode: '',
                pagenumber: 1,
                pagesize: 10,
                DelegateNumber: '',
                AgentCode: '',
                PeriodStart: '',
                PeriodEnd: '',
                ImporterCode: ''
            };

            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

            //};
            //#region Get/Load menthod during page load.
            $scope.GetDelegate = function () {
                $("#loadingScreen").show();
                apiService.get('Customs/ImporterExporter/DelegateImporters',
                    $scope.parameters,
                    function (results) {
                        //debugger;
                        $scope.DelegateList = results.data.ResponseResult.Data;
                        console.log($scope.DelegateList);
                        $("#loadingScreen").hide();
                        if (!apiService.isNullOrEmptyOrUndefined($scope.PeriodStart1)) {
                            $scope.parameters.PeriodStart = $scope.PeriodStart1;
                        }
                        if (!apiService.isNullOrEmptyOrUndefined($scope.PeriodEnd1)) {
                            $scope.parameters.PeriodEnd = $scope.PeriodEnd1;
                        }
                        if ($scope.DelegateList != null && $scope.DelegateList.length > 0) {
                            $scope.totalCount = $scope.DelegateList[0].TotalCount;
                        }
                    },
                    function error(response) {
                        //console.log('something went wrong in GetDelegate' + response);
                        $("#loadingScreen").hide();
                    });
            }
            $scope.IsSearch = false;
            $scope.GetSearchResult = function () {
                $scope.DelegateList = {
                };
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                $scope.IsSearch = true;
                $scope.InitSearchParams();
                $scope.GetDelegate();
            }
            // load More Records
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.parameters.pagenumber = newPageNo;
                $scope.parameters = {
                    centercode: $scope.selectedCenterCode,
                    pagenumber: newPageNo,
                    pagesize: 10,
                    DelegateNumber: $scope.parameters.DelegateNumber,
                    AgentCode: $scope.parameters.AgentCode,
                    PeriodStart: $scope.parameters.PeriodStart, //ChangeDateFormat($scope.parameters.PeriodStart),
                    PeriodEnd: $scope.parameters.PeriodEnd, // ChangeDateFormat($scope.parameters.PeriodEnd),
                    ImporterCode: $scope.parameters.ImporterCode
                };
                $scope.GetDelegate();
            }
            $scope.chassisNoChanged = function () {
                if (!$scope.parameters.searchString) {
                    $scope.GetDelegate();
                }
            }

            $scope.Initialize = function () {
                //debugger;
                //$scope.selectedLanguage = $('#selLang :selected').text() == "Arabic" ? 'ae' : $('#selLang :selected').text() == "English" ? 'en' : 'en';
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.selectedMode = $scope.selectedTransMode;
                $scope.getCenterCodes();
                //GetCategoryCodes();
            }

            $scope.onModeChanged = function () {
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.selectedMode = $scope.selectedTransMode;
                $scope.getCenterCodes();
            }

            $scope.onCenterCodeChanged = function () {
                $scope.parameters.centercode = $scope.selectedCenterCode;
                $scope.GetDelegate();
            }

            $scope.getCenterCodes = function () {
                apiService.get('Customs/Lookup/CenterCodes',
                    $scope.centerCodelookUpParams,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.centerCodes = results.data.ResponseResult.Data;
                            if ($scope.centerCodes) {

                                var tmpCenterCode = $storage.get('SelectedCenterCodeDelegate') ? angular.copy($storage.get('SelectedCenterCodeDelegate')) : 'V';

                                var selectedCenter = $filter('filter')($scope.centerCodes,
                                    function (cenCode) { return (cenCode.Code == tmpCenterCode) });
                                $scope.selectedCenterCode = selectedCenter.length == 1
                                    ? selectedCenter[0].Code
                                    : $scope.centerCodes.length > 0
                                        ? $scope.centerCodes[0].Code
                                        : "";
                                $scope.parameters.centercode = $scope.selectedCenterCode;
                                $scope.centerCode = $scope.selectedCenterCode;
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

            $scope.showDoDetails = function (selectedRow) {
                if (selectedRow) {
                    if (typeof (Storage) !== "undefined") {
                        localStorage.DelegateListInformation = JSON.stringify(selectedRow);

                    }
                    $state.go('delegateDetail',
                        {
                            'centerCode': $scope.selectedCenterCode,
                            'delegateNumber': selectedRow.DelegateNumber,
                            'TransportMode': $scope.selectedTransMode
                        });
                }
            }


            $scope.clearSearchFilters = function () {
                $scope.InitSearchParams();
                $scope.parameters.DelegateNumber = '';
                $scope.parameters.AgentCode = '';
                $scope.parameters.PeriodStart = '';
                $scope.parameters.PeriodEnd = '';
                $scope.parameters.ImporterCode = '';
                $scope.PeriodStart1 = '';
                $scope.PeriodEnd1 = '';
                $scope.GetDelegate();
            }
            $scope.InitSearchParams = function () {
                $scope.PeriodStart1 = $scope.parameters.PeriodStart;
                $scope.PeriodEnd1 = $scope.parameters.PeriodEnd;

                $scope.parameters = {
                    centercode: $scope.selectedCenterCode,
                    pagenumber: 1,
                    pagesize: 10,
                    DelegateNumber: $scope.parameters.DelegateNumber,
                    AgentCode: $scope.parameters.AgentCode,
                    PeriodStart: $scope.parameters.PeriodStart, //ChangeDateFormat($scope.parameters.PeriodStart),
                    PeriodEnd: $scope.parameters.PeriodEnd, //ChangeDateFormat($scope.parameters.PeriodEnd),
                    ImporterCode: $scope.parameters.ImporterCode
                };
            }
            ChangeDateFormat = (date) => {
                debugger;
                if (!apiService.isNullOrEmptyOrUndefined(date)) {
                    const format = date.split('/');
                    return format[2] + '/' + format[1] + '/' + format[0];
                } else {
                    return date;
                }
            }
            $scope.deleteConfimDelegate = function (delegateNumber) {
                $scope.delegateNumber = delegateNumber;
                $("#ConfirmDeleteModalPopup").modal("show");
            }
            $scope.deleteOkay = function () {
                $("#ConfirmDeleteModalPopup").modal("hide");
                $("#loadingScreen").show();
                var delegate = {};
                delegate.delegateNumber = $scope.delegateNumber;
                delegate.centerCode = $scope.centerCode;
                apiService.get('Customs/ImporterExporter/DeleteDeletegateImporter',
                    delegate,
                    function (result) {
                        $("#loadingScreen").hide();
                        var response = result.data.ResponseResult;
                        var msg = apiService.formatResponseMessage(response.Messages);
                        if (response.IsValid) {

                            $scope.GetDelegate();
                            $('#successModal').modal('show');
                        } else if (!response.IsValid) {
                            modalErrorShow(msg);
                        }
                    },
                    function (result) {
                        $("#loadingScreen").hide();
                        console.log("An Error has occurred!");
                        console.log(result);
                    });
            }

            function GetCategoryCodes() {
                apiService.get('Customs/Lookup/ImporterCategory',
                    {
                        centerCode: $scope.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.categoryCodes = results.data.ResponseResult.Data;
                        $("#selectCategory").select2();
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
            }

            $scope.Initialize();
        }
    ]);
