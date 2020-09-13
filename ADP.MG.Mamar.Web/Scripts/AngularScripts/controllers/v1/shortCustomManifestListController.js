angular.module('mamarApp').controller('shortCustManifestListController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$storage', 'sharedModels', '$timeout', '$window',
    function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $storage, sharedModels, $timeout, $window) {

        $scope.$storage = $storage;
        // Get Center Codes List based on transport mode
        $scope.transModes = [
            { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
            { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
        ];

        var custManifestTransMode = $storage.get('shortCustomTransMode');
        $scope.selectedMode = $scope.selectedTransMode = custManifestTransMode ? custManifestTransMode[0].key : $scope.transModes[0].key;

        $scope.centerCodelookUpParams = {
            transportMode: $scope.selectedTransMode,
            searchString: ''
        };

        $scope.searchParams = {
            CenterCode: '',
            JobNumber: '',
            BillType: '',
            CreatedDate: '',
            ImporterCode: '',
            GoodDescription: '',
            NetWeight: '',
            GrossWeight: '',
            Quantity: '',
            pageNumber: 1,
            pageSize: 10
        };

        $scope.getCenterCodes = function () {
            apiService.get('Customs/Lookup/CenterCodes', $scope.centerCodelookUpParams,
                function (results) {
                    if (results.data.ResponseResult != "") {
                        $scope.centerCodes = results.data.ResponseResult.Data;
                        if ($scope.centerCodes) {

                            var custManifestCenter = $storage.get('shortCustomCenterCode');
                            var customCenterCode = custManifestCenter ? custManifestCenter[0].Code : 'V';

                            var selectedCenter = $filter('filter')($scope.centerCodes,
                                function (cenCode) { return (cenCode.Code == customCenterCode) });
                            $scope.selectedCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ?
                                $scope.centerCodes[0].Code : "";
                            $scope.searchParams.CenterCode = $scope.selectedCenterCode;
                            //$scope.getShortManifestList();
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

        $scope.getBillTypes = function () {
            apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParams,
                function (results) {
                    if (results.data.ResponseResult) {
                        $scope.listBillType = results.data.ResponseResult.Data;

                    }
                },
                function error(response) {
                    console.log('something went wrong in LookupBillTypes' + response);
                });
        }

        // on transport mode changed
        $scope.onModeChanged = function () {
            $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
            $scope.selectedMode = $scope.selectedTransMode;
            $scope.getCenterCodes();
            $scope.resetSearchFilters();
        }

        // on center code changed
        $scope.onCenterCodeChanged = function () {
            $scope.searchParams.CenterCode = $scope.selectedCenterCode;
            $scope.resetSearchFilters();
        }

        // Reset Search Filters
        $scope.resetSearchFilters = function () {
            $scope.searchParams.JobNumber = $scope.searchParams.BillType = $scope.searchParams.CreatedDate = $scope.searchParams.ImporterCode = '';
            $scope.shortManifestList = null;
        }

        // Get Short Manifest List
        $scope.getShortManifestList = function () {
            $("#loadingScreen").show();
            apiService.post('Customs/Manifest/GetShortManifestList', '', $scope.searchParams, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = response.Messages ? apiService.formatResponseMessage(response.Messages) : '';
                if (response.IsValid) {
                    $scope.shortManifestList = result.data.ResponseResult ? result.data.ResponseResult.Data : null;
                    $scope.totalCount = $scope.shortManifestList ? $scope.shortManifestList[0].TotalCount : null;
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
            $scope.getShortManifestList();
        }

        // Get Search Results
        $scope.getSearchResult = function () {
            $scope.searchParams.pageNumber = 1;
            $scope.getShortManifestList();
        }

        $scope.printEntryExitCertificate = function (item) {

            var currentdate = new Date();
            var currentYear = currentdate.getFullYear();

            var billType = '';
            if (item.BillType) {
                var bill = item.BillType.toLowerCase();
                if (bill == "temporary entry")
                    billType = 'N';
                else if (bill == "import")
                    billType = 'I';
                else if (bill == "export")
                    billType = 'E';
                else if (bill == "re export" || bill == "re_export")
                    billType = 'R';
                else if (bill == "transit in")
                    billType = 'T';
                else if (bill == "transit out")
                    billType = 'O';
            }
            $scope.printEntryExitParameter = {
                companyCode: '',
                userCode: '',
                centerCode: $scope.selectedCenterCode,
                billNumber: item.JobNumber,
                billYear: currentYear,
                billCenterCode: $scope.selectedCenterCode,
                billType: billType,
                paymentType: null,
                debit: null,
                ExistingRecord: item.GRRNumber ? 1 : 0,
                Seals: [],
                Trucks: []
            };
            $("#loadingScreen").show();
            apiService.post('Customs/Vehicle/ExitEntryCertificate', '', $scope.printEntryExitParameter, function (results) {
                $("#loadingScreen").hide();
                var resultData = results.data.ResponseResult;
                if (resultData && resultData.Data && resultData.IsValid) {
                    apiService.printDocuments(resultData.Data.bytes);
                }
                else {
                    modalErrorShow(apiService.formatResponseMessage(resultData.Messages));
                }
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log('ExitEntryCertificate' + response);
            });
        }

        //goto Shipment Details
        $scope.gotoShipmentDetails = function (selectedRow) {

            $storage.set('storedCenterCodes', null);

            sharedModels.transactionSearchModel = {};
            sharedModels.transactionSearchModel.TransportMode = $scope.selectedMode;
            localStorage.storedTransSearchModel = JSON.stringify(sharedModels.transactionSearchModel);

            $state.go('shipmentAndInvoice', {
                centerCode: $scope.selectedCenterCode, jobNumber: selectedRow.JobNumber, tab: 'shipmentdetails', Status: 'N'
            }, { notify: true });
        }

        $scope.gotoShortCustomManifestDetails = function () {
            var shortCustomCenterCode = $filter('filter')($scope.centerCodes,
                function (cenCode) { return (cenCode.Code == $scope.selectedCenterCode) });
            $storage.set('shortCustomCenterCode', shortCustomCenterCode);

            var shortCustomTransMode = $filter('filter')($scope.transModes,
                function (mode) { return (mode.key == $scope.selectedTransMode) });
            $storage.set('shortCustomTransMode', shortCustomTransMode);

            $state.go('shortCustManifestDetail', {
                transportMode: $scope.selectedTransMode,
                centerCode: $scope.selectedCenterCode
            }, { reload: true, notify: true });
        }
        // init
        $scope.init = function () {
            $scope.getCenterCodes();
            $scope.getBillTypes();
        }


        $scope.init();

    }]);