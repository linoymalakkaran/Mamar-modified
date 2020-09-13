angular.module('mamarApp').controller('ksaCreateBillController',
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
            //$scope.transModes = [
            //    { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
            //    { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
            //];
            //$scope.selectedTransMode = $scope.transModes[0].key;

            //$scope.centerCodelookUpParams = {
            //    transportMode: $scope.selectedTransMode,
            //    searchString: ''
            //};
            $scope.userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

            function InitialiseSearch() {
                $scope.searchParameter = {
                    JobNumber: '',
                    DeclarationType: '',
                    DeclarationNumber: '',
                    pageSize: 10,
                    pageNumber: 1,
                    DateFrom: '',
                    DateTo: '',
                    ImporterCode: '',
                    AgentCode:'',
                    centerCode:$scope.selCenterCode
                };
            }

            function ResetPageNumber() {
                $scope.searchParameter.pageNumber = 1;
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
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.PopulateData();
            }
    
            $scope.PopulateData = function () {
                $("#loadingScreen").show();
                apiService.get('Customs/Invoice/KSABillList',
                    $scope.searchParameter,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.ksaCreateBillData = results.data.ResponseResult.Data;
                            if ($scope.ksaCreateBillData != null) {
                                $scope.totalCount = $scope.ksaCreateBillData[0].Total;
                            }
                        }
                        $("#loadingScreen").hide();

                    },
                    function error(err) {
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
                $scope.searchParameter.pageNumber = 1;
                $scope.PopulateData();
            }
            //$scope.getCenterCodes();

            $scope.transModes = [
                { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
                { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
            ];
            $scope.selectedTransMode = $scope.transModes[2].key;
            $scope.centerCodelookUpParams = {
                transportMode: $scope.selectedTransMode,
                searchString: ''
            };

            $scope.LoadLookupCenterCodes = function ()
            {
                apiService.get('Customs/Lookup/CenterCodes',
                    $scope.centerCodelookUpParams,
                    function (results) {
                        $scope.centerCodes = results.data.ResponseResult.Data;
                        $storage.set('storedCenterCodes', $scope.centerCodes); //store the center code in local storage for using in other screens; as part of performance improvement

                        if ($scope.centerCodes.length > 0)
                        {
                            var CheckCenterCodeG = $scope.centerCodes.filter(t => t.Code == 'G');
                            if (CheckCenterCodeG.length == 0)
                            {
                                $scope.IsAllow = true;
                                $("#loadingScreen").hide();
                                showErrorMessage("KSA bill service not available");
                                return;
                            }
                        }
                        if ($scope.centerCodes) {

                            // if (sharedModels.transactionSearchModel && sharedModels.transactionSearchModel.fromShipment)//if redirected from shipment screen, maintain the center code

                            if ($scope.StoredCenter) {
                                $scope.selCenterCode = $scope.StoredCenter;
                            }
                            else {
                                var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) { return (cenCode.Code == 'V') });
                                $scope.selCenterCode = $scope.centerCodes.filter(t => t.Code == 'G').length > 0 ? $scope.centerCodes.filter(t => t.Code == 'G')[0].Code : selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : ""; //selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
                                localStorage.setItem("centerCode_" + $scope.selectedTab + '_' + $scope.userAccntInfo.CCode, $scope.selCenterCode);
                            }
                            $scope.centerCodeChanged();
                        }
                        else {
                            $("#loadingScreen").hide();
                            showErrorMessage("No center code available");
                            $state.go('dashboard');
                        }
                    },
                    function error(response) {
                        console.log('something went wrong in LoadLookupCentreCodes' + response);
                    });
            }
            // init
            $scope.init = () => {
                $scope.IsAllow = false;
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.selectedMode = $scope.selectedTransMode;
                $scope.LoadLookupCenterCodes();
            }
            $scope.init();

            $scope.onModeChanged = function () {
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.selectedMode = $scope.selectedTransMode;
                $scope.LoadLookupCenterCodes();
            }
            $scope.centerCodeChanged = function () {
                $("#loadingScreen").hide();
                InitialiseSearch();
                ResetPageNumber();
                $scope.searchParameter.centerCode = $scope.selCenterCode;
                localStorage.setItem("centerCode_" + $scope.selectedTab + '_' + $scope.userAccntInfo.CCode, $scope.selCenterCode);
                $scope.PopulateData();
            }

            $scope.KSANavigation = function (item) {
               // $state.go('shipmentInDraft', { 'centerCode': sharedModels.ShipmentDraft.centerCode, 'DoNumber': sharedModels.ShipmentDraft.DoNumber, 'AgentCode': sharedModels.ShipmentDraft.AgentCode });

                if (item.JobNumber)
                {
                        //Just to keep the transport mode as 'R'
                        sharedModels.transactionSearchModel = {};
                        sharedModels.transactionSearchModel.TransportMode = $scope.selectedMode;
                        localStorage.storedTransSearchModel = JSON.stringify(sharedModels.transactionSearchModel);

                        $("#loadingScreen").show();
                        apiService.get('Customs/DeliveryOrder',
                            {
                                centerCode: $scope.selCenterCode,
                                jobNumber: item.JobNumber
                            },
                            function (results)
                            {
                                $("#loadingScreen").hide();
                                if (!results.data.ResponseResult.IsValid)
                                {
                                    modalErrorShow(results.data.ResponseResult.Messages);
                                }
                                else
                                {
                                    $state.go('shipmentAndInvoice', { 'centerCode': $scope.selCenterCode, 'jobNumber': item.JobNumber, 'tab': 'shipmentdetails', 'KSAFlag': 'Y' });
                                }
                            },
                            function error(response) {
                                $("#loadingScreen").hide();
                                modalErrorShow("An Error has occurred while getting shipment details Data!");
                            }, true);
                    
                }
                else
                {
                    $state.go('ksaBillInDraft', { 'centerCode': $scope.selCenterCode,'ID':item.ID});
                }

            };
        }
    ]);