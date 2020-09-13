angular.module('mamarApp').controller('maqasaReExportController',
    [
        '$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', '$log', 'apiService', 'sharedModels',
        'userAccountStorageFactory', '$filter', 'paginationService',
        function ($scope,
            $rootScope,
            $http,
            $state,
            $stateParams,
            $timeout,
            $log,
            apiService,
            sharedModels,
            userAccountStorageFactory,
            $filter,
            paginationService) {

            ///Include Center Code in Maqasa Create Job
            $scope.transModes = [
                { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
                { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
            ];

            $scope.userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            $scope.storedTransMode = localStorage.getItem("ReExportTransMode_" + $scope.userAccntInfo.CCode);

            $scope.selectedTransMode = $scope.storedTransMode ? $scope.storedTransMode : $scope.transModes[0].key;

            $scope.centerCodelookUpParams = {
                transportMode: $scope.selectedTransMode,
                searchString: ''
            };

            $scope.getCenterCodes = function () {
                apiService.get('Customs/Lookup/CenterCodes',
                    $scope.centerCodelookUpParams,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.centerCodes = results.data.ResponseResult.Data;
                            if ($scope.centerCodes) {
                                if ($scope.storedPreferredCenter) {
                                    $scope.selectedCenterCode = $scope.storedPreferredCenter;
                                }
                                else {
                                    var selectedCenter = $filter('filter')($scope.centerCodes,
                                        function (cenCode) {
                                            return (cenCode.Code == 'V')
                                        });
                                    $scope.selectedCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
                                    localStorage.setItem("ReExportCenterCode_" + $scope.selectedTransMode + '_' + $scope.userAccntInfo.CCode, $scope.selectedCenterCode);
                                }
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

            $scope.getCenterCodes();

            //////////////////////////
            var currentdate = new Date();
            var currentYear = currentdate.getFullYear();
            var invalidBillNoErrMsg = 'No data exists for this combination - لا توجد بيانات لهذه المجموعة';

            $scope.maqasaReExportEntity = {};
            $scope.maqasaReExportEntity.ImportJobNumber = null;
            $scope.maqasaReExportEntity.Bills = [];
            $scope.Year = currentYear;
            $scope.ImportBillNo = '';
            $scope.CreateBillValid = true;

            // initialize check data - search parameters
            function clearData() {
                $scope.selectedEntryCenter = '';
                $scope.selectedEntryCenterObj = {};
                $scope.selectedEntryCenterObj.originalObject = {};
                $scope.selectedEntryCenterObj.originalObject.Code = null;
                $scope.selectedEntryCenterObj.originalObject.EnglishName = null;
                $scope.selectedEntryCenterObj.originalObject.ArabicName = null;

                $scope.maqasaReExportEntity = {};
                $scope.Year = currentYear;
                $scope.ImportBillNo = '';
                $scope.selectedDestinationGCC = '';

                $scope.selectedGCCObj = {};
                $scope.selectedGCCObj.originalObject = {};
                $scope.selectedGCCObj.originalObject.GccCountCode = null;
                $scope.selectedGCCObj.originalObject.GccCountEngName = null;
                $scope.selectedGCCObj.originalObject.GccCountArbName = null;

                $scope.selectedExitCenter = '';
                $scope.selectedExitCenterObj = {};
                $scope.selectedExitCenterObj.originalObject = {};
                $scope.selectedExitCenterObj.originalObject.Code = null;
                $scope.selectedExitCenterObj.originalObject.PortNameEnglish = null;
                $scope.selectedExitCenterObj.originalObject.PortNameArabic = null;

                $scope.isValidEntryCenter = $scope.isValidExitCenter = $scope.isValidDestinationGCC = $scope.isValidYear =
                    $scope.isValidImportBillNo = true;

            }
            function resetCheckDataParameters() {
                $scope.checkDataParameters = {
                    centerCode: $scope.selectedCenterCode,
                    billNumber: '',
                    billYear: '',
                    billCenterCode: '',
                    countryCode: '',
                    pageNumber: 1,
                    pageSize: 10
                };
            }

            resetCheckDataParameters();

            $scope.$watch("selectedTransMode", function () {
                localStorage.setItem("ReExportTransMode_" + $scope.userAccntInfo.CCode, $scope.selectedTransMode);
                $scope.storedPreferredCenter = localStorage.getItem("ReExportCenterCode_" + $scope.selectedTransMode + '_' + $scope.userAccntInfo.CCode);
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.getCenterCodes();
                resetCheckDataParameters();
                clearData();
            });

            //$scope.onModeChanged = function () {
            //    $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
            //    localStorage.setItem("ReExportTransMode_" + $scope.userAccntInfo.CCode, $scope.selectedTransMode);		       
            //    $scope.getCenterCodes();
            //    resetCheckDataParameters();
            //    clearData();
            //}
            $scope.onCenterCodeChanged = function () {
                localStorage.setItem("ReExportCenterCode_" + $scope.selectedTransMode + '_' + $scope.userAccntInfo.CCode, $scope.selectedCenterCode);
                resetCheckDataParameters();
                clearData();
            }

            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

            $scope.isValidEntryCenter = $scope.isValidExitCenter = $scope.isValidDestinationGCC = $scope.isValidYear =
                $scope.isValidImportBillNo = true;
            $scope.isValidCheckDataForm = true;

            // lookups initialization
            $scope.selectedDestinationGCC = '';
            $scope.selectedExitCenter = '';
            $scope.selectedEntryCenter = '';

            //***** lookup selected Obj ****
            $scope.selectedGCCObj = {};
            $scope.selectedGCCObj.originalObject = {};
            $scope.selectedGCCObj.originalObject.GccCountCode = null;
            $scope.selectedGCCObj.originalObject.GccCountEngName = null;
            $scope.selectedGCCObj.originalObject.GccCountArbName = null;

            $scope.selectedExitCenterObj = {};
            $scope.selectedExitCenterObj.originalObject = {};
            $scope.selectedExitCenterObj.originalObject.Code = null;
            $scope.selectedExitCenterObj.originalObject.PortNameEnglish = null;
            $scope.selectedExitCenterObj.originalObject.PortNameArabic = null;

            $scope.selectedEntryCenterObj = {};
            $scope.selectedEntryCenterObj.originalObject = {};
            $scope.selectedEntryCenterObj.originalObject.Code = null;
            $scope.selectedEntryCenterObj.originalObject.EnglishName = null;
            $scope.selectedEntryCenterObj.originalObject.ArabicName = null;

            // END


            // get GCC country list - Shipment Destination
            //$scope.onGCCChange = function (searchStr) {
            //    $scope.isValidDestinationGCC = true;
            //    $scope.selectedDestinationGCC = searchStr;
            //    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedDestinationGCC)) {
            //        $scope.maqasaReExportEntity.ImportJobNumber = null;
            //        apiService.get('Customs/Lookup/GCCCountries',
            //        {
            //            centerCode: '',
            //            searchString: $scope.selectedDestinationGCC
            //        },
            //        function (results) {
            //            $scope.GCCList = results.data.ResponseResult.Data;
            //        },
            //        function error(response) {
            //            console.log(response);
            //        });
            //    }
            //    else { $scope.GCCList = null; $scope.selectedDestinationGCC = ''; }
            //}


            // get Entry Centers
            $scope.onEntryCenterChange = function (searchStr) {
                $scope.isValidEntryCenter = true;
                $scope.selectedEntryCenter = searchStr;
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedEntryCenter)) {
                    $scope.maqasaReExportEntity.ImportJobNumber = null;
                    //apiService.get('Customs/Lookup/EntryCenter',
                    //	{
                    //		centerCode: '',
                    //		searchString: $scope.selectedEntryCenter
                    //	},
                    //	function(results) {
                    //		$scope.entryCenterList = results.data.ResponseResult.Data;
                    //	},
                    //	function error(response) {
                    //		console.log(response);
                    //	});
                } else {
                    //$scope.entryCenterList = null;
                    $scope.selectedEntryCenter = '';
                }
            }
            function populateEntryCenterModel() {
                getIndexData('EntryCenter', '', function (data) {
                    $scope.entryCenterList = data;
                }, function () {
                    apiService.get('Customs/Lookup/EntryCenter',
                        {
                            centerCode: '',
                            searchString: $scope.selectedEntryCenter
                        },
                        function (results) {
                            $scope.entryCenterList = results.data.ResponseResult.Data;
                            storeData($scope.entryCenterList, 'EntryCenter', '');
                        },
                        function error(response) {
                            console.log(response);
                        });
                });
            }
            populateEntryCenterModel();
            // on Import Bill No. Change
            $scope.onImportBillChange = function () {
                $scope.maqasaReExportEntity.ImportJobNumber = null;
                if (apiService.isNullOrEmptyOrUndefined($scope.ImportBillNo)) {
                    $scope.maqasaReExportEntity.Bills = [];
                    $scope.maqasaReExportEntity.TotalAmountCollected = '';
                    $scope.maqasaReExportEntity.TotalClearanceAmount = '';
                    $scope.maqasaReExportEntity.SettlementAmount = '';
                    $scope.maqasaReExportEntity.ImportJobDuty = '';
                    $scope.isValidImportBillNo = false;
                } else {
                    $scope.isValidImportBillNo = true;
                }
            }

            // on Year Change
            $scope.onYearChange = function () {
                $scope.maqasaReExportEntity.ImportJobNumber = null;
                if (apiService.isNullOrEmptyOrUndefined($scope.Year)) {
                    $scope.isValidYear = false;
                } else {
                    $scope.isValidYear = true;
                }
            }

            // validate entry center
            $scope.validateEntryCenter = function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedEntryCenter)) {
                    var selEntryCenter = $scope.selectedEntryCenterObj && $scope.selectedEntryCenterObj.originalObject && $scope.selectedEntryCenterObj.originalObject.Code
                        ? $scope.selectedEntryCenterObj.originalObject.Code +
                        $scope.selectedEntryCenterObj.originalObject.EnglishName +
                        $scope.selectedEntryCenterObj.originalObject.ArabicName
                        : '';

                    if (selEntryCenter == 0 ||
                        $scope.selectedEntryCenter.replace(/\s/g, '') != selEntryCenter.replace(/\s/g, '')) {
                        $scope.isValidEntryCenter = false;
                    } else {
                        $scope.isValidEntryCenter = true;
                    }
                } else {
                    $scope.isValidEntryCenter = false;
                }
                return $scope.isValidEntryCenter;
            }

            // validate exit center
            $scope.validateExitCenter = function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedExitCenter)) {
                    var selExitCenter = $scope.selectedExitCenterObj && $scope.selectedExitCenterObj.originalObject && $scope.selectedExitCenterObj.originalObject.Code
                        ? $scope.selectedExitCenterObj.originalObject.Code +
                        $scope.selectedExitCenterObj.originalObject.PortNameEnglish +
                        $scope.selectedExitCenterObj.originalObject.PortNameArabic
                        : '';

                    if (selExitCenter == 0 ||
                        $scope.selectedExitCenter.replace(/\s/g, '') != selExitCenter.replace(/\s/g, '')) {
                        $scope.isValidExitCenter = false;
                    } else {
                        $scope.isValidExitCenter = true;
                    }
                } else {
                    $scope.isValidExitCenter = false;
                }
                return $scope.isValidExitCenter;
            }

            // validate destination GCC
            $scope.validateDestinationGCC = function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedDestinationGCC)) {
                    var selDestinationGCC = $scope.selectedGCCObj && $scope.selectedGCCObj.originalObject && $scope.selectedGCCObj.originalObject.GccCountCode
                        ? $scope.selectedGCCObj.originalObject.GccCountCode +
                        $scope.selectedGCCObj.originalObject.GccCountEngName +
                        $scope.selectedGCCObj.originalObject.GccCountArbName
                        : '';

                    if (selDestinationGCC == 0 ||
                        $scope.selectedDestinationGCC.replace(/\s/g, '') != selDestinationGCC.replace(/\s/g, '')) {
                        $scope.isValidDestinationGCC = false;
                    } else {
                        $scope.isValidDestinationGCC = true;
                    }
                } else {
                    $scope.isValidDestinationGCC = false;
                }
                return $scope.isValidDestinationGCC;
            }

            // validate check data form
            $scope.validateCheckDataForm = function () {
                $scope.isValidYear = !apiService.isNullOrEmptyOrUndefined($scope.Year) ? true : false;
                $scope.isValidImportBillNo = !apiService.isNullOrEmptyOrUndefined($scope.ImportBillNo) ? true : false;
                var validEntryCenter = $scope.validateEntryCenter();
                var validExitCenter = $scope.validateExitCenter();
                var validGCC = $scope.validateDestinationGCC();
                $scope.isValidCheckDataForm =
                    validEntryCenter && validExitCenter && validGCC && $scope.isValidYear && $scope.isValidImportBillNo
                        ? true
                        : false;
                return $scope.isValidCheckDataForm;
            }


            // Get Bills and Settlement Balance Amount by Import Bill No.
            $scope.checkData = function () {

                var isValidChckData = $scope.validateCheckDataForm();
                if (isValidChckData) {
                    $("#loadingScreen").show();
                    $scope.checkDataParameters.centerCode = $scope.selectedCenterCode;
                    $scope.checkDataParameters.billNumber = $scope.ImportBillNo;
                    $scope.checkDataParameters.billYear = $scope.Year;
                    $scope.checkDataParameters.billCenterCode = $scope.selectedEntryCenterObj.originalObject.Code;

                    apiService.get('Customs/ReExport/GetReExportCustBillList',
                        $scope.checkDataParameters,
                        function (results) {
                            $("#loadingScreen").hide();
                            if (results.data && results.data.ResponseResult != null) {
                                var resultData = results.data.ResponseResult.Data;
                                if (resultData != null) {
                                    if (resultData.ImportJobNumber != null) {
                                        $scope.maqasaReExportEntity = resultData;
                                        $scope.maqasaReExportEntity.Bills = resultData.Bills;
                                    }
                                    else if (results.data.ResponseResult.Messages) {
                                        var msg = apiService.formatResponseMessage(results.data.ResponseResult.Messages);
                                        modalErrorShow(msg);
                                    }
                                    else {
                                        modalErrorShow(invalidBillNoErrMsg);
                                    }

                                }
                            }
                        },
                        function error(response) {
                            $("#loadingScreen").hide();
                            console.log(response);
                        });
                } else {
                    return false;
                }
            }

            // delete confirm
            $scope.deleteConfirm = function (index) {
                $scope.deleteIndex = index;
                $("#ConfirmDeleteModalPopup").modal("show");
            }

            // delete CustBill item - Okay
            $scope.deleteOkay = function () {
                $("#ConfirmDeleteModalPopup").modal("hide");
                $("#loadingScreen").show();
                var custBillItem = $scope.maqasaReExportEntity.Bills[$scope.deleteIndex];
                custBillItem.CenterCode = $scope.selectedEntryCenterObj.originalObject.Code;

                apiService.post('Customs/ReExport/DeleteReExportCustBill',
                    '',
                    custBillItem,
                    function (result) {
                        var response = result.data.ResponseResult;
                        var msg = apiService.formatResponseMessage(response.Messages);
                        if (response.IsValid) {
                            $scope.checkData();
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

            // go to maqasa create bill screen
            $scope.createMaqasaDeclaration = function () {
                $scope.maqasaReExportEntity.EntryCenter = $scope.selectedEntryCenter;
                $scope.maqasaReExportEntity.DestinationGCC = $scope.selectedDestinationGCC;
                $scope.maqasaReExportEntity.ExitCenter = $scope.selectedExitCenter;
                $scope.maqasaReExportEntity.ImportBillNo = $scope.ImportBillNo;
                $scope.maqasaReExportEntity.gccYear = $scope.Year;

                $scope.maqasaReExportEntity.DestinationGCCCodeSelected      =   ($scope.selectedGCCObj  &&  $scope.selectedGCCObj.originalObject) ? $scope.selectedGCCObj.originalObject.GccCountCode       : '';
                $scope.maqasaReExportEntity.DestinationGCCEngNameSelected   =   ($scope.selectedGCCObj  &&  $scope.selectedGCCObj.originalObject) ? $scope.selectedGCCObj.originalObject.GccCountEngName    : '';
                $scope.maqasaReExportEntity.DestinationGCCArbNameSelected   =   ($scope.selectedGCCObj  &&  $scope.selectedGCCObj.originalObject) ? $scope.selectedGCCObj.originalObject.GccCountArbName    : '';

                sharedModels.maqasaReExportSrchEntity = $scope.maqasaReExportEntity;
                var isValid = ($scope.maqasaReExportEntity.EntryCenter &&
                    $scope.maqasaReExportEntity.DestinationGCC &&
                    $scope.maqasaReExportEntity.ExitCenter &&
                    $scope.maqasaReExportEntity.ImportBillNo &&
                    $scope.maqasaReExportEntity.gccYear &&
                    $scope.maqasaReExportEntity.ImportJobNumber)
                    ? true
                    : false;
                if (!isValid) {
                    $scope.CreateBillValid = false;
                    return;
                }
                $state.go('maqasaCreateBill', { 'transportMode': $scope.selectedTransMode, 'centerCode': $scope.selectedCenterCode }, { reload: true, notify: true });

            }

            // go to maqasa details - shipment n Invoice tabs
            $scope.getMaqasaDetails = function (selectedJob) {
                $state.go('shipmentAndInvoice',
                    { centerCode: selectedJob.Entry, jobNumber: selectedJob.JobNumber, tab: 'shipmentdetails' },
                    { reload: true, notify: true });
            }

            ///Lookup Enhancements - Exit Center //////////
            $scope.searchExitCenterText = '';

            $scope.exitCenterKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openExitCenterLookup();
                }
            }
            $scope.PopulateExitCenter = function () {
                apiService.get('Customs/Lookup/ExitPortList',
                    {
                        centerCode: '',
                        searchString: ''
                    },
                    function (results) {
                        $scope.exitCentersFull = results.data.ResponseResult.Data;
                        $scope.exitCenters = angular.copy($scope.exitCentersFull);
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data ExitCenter!");
                    });
            }
            $scope.openExitCenterLookup = function (item) {
                $scope.searchExitCenterText = '';
                $('#exitCenterLookup').modal({
                    backdrop: "static"
                });
                $('#searchExitCenterText').focus();
                $('#searchExitCenterText').select();
                $scope.onExitCenterChange();
                $("#exitCenterLookup").off("keydown");
                $('#exitCenterLookup').bind('keydown',
                    function (event) {
                        $timeout(function () {
                            switch (event.keyCode) {
                                case 40:
                                    if ($scope.rowIndexExitCenter < $scope.exitCenters.length - 1) {
                                        $scope.rowIndexExitCenter++;
                                        if ($scope.rowIndexExitCenter > 10 * $scope.exitCenters - 1) {
                                            $scope.lookUpCurrentPageExitCenter++;
                                        }
                                        $scope.exitCenterItemSelected = $scope.exitCenters[$scope.rowIndexExitCenter];
                                    }
                                    break;
                                case 38:
                                    if ($scope.rowIndexExitCenter > 0) {

                                        if ($scope.rowIndexExitCenter == 10 * ($scope.lookUpCurrentPageExitCenter - 1)) {
                                            $scope.lookUpCurrentPageExitCenter--;
                                        }
                                        $scope.rowIndexExitCenter--;
                                        $scope.exitCenterItemSelected = $scope.exitCenters[$scope.rowIndexExitCenter];
                                    }
                                    break;
                                case 13:
                                    $scope.setExitCenter($scope.exitCenterItemSelected);
                                    break;
                            }
                        });
                    });
            }

            $scope.onExitCenterChange = function () {
                $scope.rowIndexExitCenter = 0;
                $scope.lookUpCurrentPageExitCenter = 1;
                if ($scope.exitCentersFull) {
                    $scope.exitCenters = $scope.exitCentersFull.filter(obj => {
                        return obj.Code.toString().toLowerCase().includes($scope.searchExitCenterText.toLowerCase()) ||
                            (obj.PortNameEnglish &&
                                obj.PortNameEnglish.toLowerCase()
                                    .includes($scope.searchExitCenterText.toLowerCase())) ||
                            (obj.PortNameArabic &&
                                obj.PortNameArabic.toLowerCase().includes($scope.searchExitCenterText.toLowerCase()));
                    });
                }
            }

            $scope.setExitCenter = function (row) {
                $scope.selectedExitCenter = row.Code.toString() +
                    "     " +
                    (row.PortNameEnglish ? row.PortNameEnglish : '') +
                    "     " +
                    (row.PortNameArabic ? row.PortNameArabic : '');
                $scope.selectedExitCenterObj = {};
                $scope.selectedExitCenterObj.originalObject = angular.copy(row);
                $("#exitCenterLookup").modal("hide");
                $('#exitCenter_value').focus();
                $scope.searchExitCenterText = '';
                $scope.isValidExitCenter = true;
            }

            $scope.PopulateExitCenter();

            $scope.$watch("searchExitCenterText",
                function () {
                    $scope.onExitCenterChange();
                });
            $scope.closeExitCenter = function () {
                $scope.searchExitCenterText = '';
            }

            ///////////////////////////////////////////////
            ///Lookup Enhancements - Shipment Destination //////////
            $scope.searchShipmentDestinationText = '';

            $scope.shipmentDestinationKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openShipmentDestinationLookup();
                }
            }
            $scope.PopulateShipmentDestination = function () {
                apiService.get('Customs/Lookup/GCCCountries',
                    {
                        centerCode: '',
                        searchString: ''
                    },
                    function (results) {
                        $scope.shipmentDestinationsFull = results.data.ResponseResult.Data;
                        $scope.shipmentDestinations = angular.copy($scope.shipmentDestinationsFull);
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data ShipmentDestination!");
                    });
            }
            $scope.openShipmentDestinationLookup = function (item) {
                $scope.searchShipmentDestinationText = '';
                $('#shipmentDestinationLookup').modal({
                    backdrop: "static"
                });
                $('#searchShipmentDestinationText').focus();
                $('#searchShipmentDestinationText').select();
                $scope.onShipmentDestinationChange();
                $("#shipmentDestinationLookup").off("keydown");
                $('#shipmentDestinationLookup').bind('keydown',
                    function (event) {
                        $timeout(function () {
                            switch (event.keyCode) {
                                case 40:
                                    if ($scope.rowIndexShipmentDestination < $scope.shipmentDestinations.length - 1) {
                                        $scope.rowIndexShipmentDestination++;
                                        if ($scope.rowIndexShipmentDestination > 10 * $scope.shipmentDestinations - 1) {
                                            $scope.lookUpCurrentPageShipmentDestination++;
                                        }
                                        $scope.shipmentDestinationItemSelected =
                                            $scope.shipmentDestinations[$scope.rowIndexShipmentDestination];
                                    }
                                    break;
                                case 38:
                                    if ($scope.rowIndexShipmentDestination > 0) {

                                        if ($scope.rowIndexShipmentDestination ==
                                            10 * ($scope.lookUpCurrentPageShipmentDestination - 1)) {
                                            $scope.lookUpCurrentPageShipmentDestination--;
                                        }
                                        $scope.rowIndexShipmentDestination--;
                                        $scope.shipmentDestinationItemSelected =
                                            $scope.shipmentDestinations[$scope.rowIndexShipmentDestination];
                                    }
                                    break;
                                case 13:
                                    $scope.setShipmentDestination($scope.shipmentDestinationItemSelected);
                                    break;
                            }
                        });
                    });
            }

            $scope.onShipmentDestinationChange = function () {
                $scope.rowIndexShipmentDestination = 0;
                $scope.lookUpCurrentPageShipmentDestination = 1;
                if ($scope.shipmentDestinationsFull) {
                    $scope.shipmentDestinations = $scope.shipmentDestinationsFull.filter(obj => {
                        return obj.GccCountCode.toString().toLowerCase()
                            .includes($scope.searchShipmentDestinationText.toLowerCase()) ||
                            (obj.GccCountEngName &&
                                obj.GccCountEngName.toLowerCase()
                                    .includes($scope.searchShipmentDestinationText.toLowerCase())) ||
                            (obj.GccCountArbName &&
                                obj.GccCountArbName.toLowerCase()
                                    .includes($scope.searchShipmentDestinationText.toLowerCase()));
                    });
                }
            }

            $scope.setShipmentDestination = function (row) {
                $scope.selectedDestinationGCC = row.GccCountCode.toString() +
                    "     " +
                    (row.GccCountEngName ? row.GccCountEngName : '') +
                    "     " +
                    (row.GccCountArbName ? row.GccCountArbName : '');
                $scope.selectedGCCObj = {};
                $scope.selectedGCCObj.originalObject = angular.copy(row);
                $("#shipmentDestinationLookup").modal("hide");
                $('#shipmentDestination_value').focus();
                $scope.searchShipmentDestinationText = '';
                $scope.isValidDestinationGCC = true;
            }

            $scope.PopulateShipmentDestination();

            $scope.$watch("searchShipmentDestinationText",
                function () {
                    $scope.onShipmentDestinationChange();
                });
            $scope.closeShipmentDestinations = function () {
                $scope.searchShipmentDestinationText = '';
            }
            ///////////////////////////////////////////////


            //Tab Out Lookup Changes
            $scope.AddEntryCenter = function (selectedCode) {
                if (selectedCode) {
                    var entryList = angular.copy($scope.entryCenterList);
                    var index = entryList ?  (entryList.findIndex(doc => doc.Code.toUpperCase() == selectedCode.toUpperCase())) : -1;
                    if (index != -1) {
                        var code = entryList[index];
                        $scope.selectedEntryCenterObj.originalObject.Code = angular.copy(code.Code);
                        $scope.selectedEntryCenterObj.originalObject.EnglishName = code.EnglishName;
                        $scope.selectedEntryCenterObj.originalObject.ArabicName = code.ArabicName;
                        $scope.selectedEntryCenter = ($scope.selectedEntryCenterObj.originalObject.Code.toString()) + ' ' + ($scope.selectedEntryCenterObj.originalObject.EnglishName ? $scope.selectedEntryCenterObj.originalObject.EnglishName : '' ) + ' ' + ($scope.selectedEntryCenterObj.originalObject.ArabicName ? $scope.selectedEntryCenterObj.originalObject.ArabicName : '');
                        $scope.isValidEntryCenter = true;
                    } else {
                        $scope.selectedEntryCenterObj.originalObject.EnglishName = '';
                        $scope.selectedEntryCenterObj.originalObject.ArabicName = '';
                        $scope.isValidEntryCenter = false;
                    }
                } else {
                    $scope.selectedEntryCenterObj = {};
                    $scope.selectedEntryCenterObj.originalObject = {};
                    $scope.selectedEntryCenterObj.originalObject.EnglishName = '';
                    $scope.selectedEntryCenterObj.originalObject.ArabicName = '';
                }
            }

            $scope.AddShipmentDestination = function (selectedCode) {
                if (selectedCode) {
                    var shipmentDestinationsSelected = angular.copy($scope.shipmentDestinations);
                    var index = shipmentDestinationsSelected ? ( shipmentDestinationsSelected.findIndex(doc => doc.GccCountCode.toUpperCase() == selectedCode.toUpperCase())) : -1;
                    if (index != -1) {
                        var code = shipmentDestinationsSelected[index];
                        $scope.selectedGCCObj.originalObject.GccCountCode = angular.copy(code.GccCountCode);
                        $scope.selectedGCCObj.originalObject.GccCountEngName = code.GccCountEngName;
                        $scope.selectedGCCObj.originalObject.GccCountArbName = code.GccCountArbName;
                        $scope.selectedDestinationGCC = ($scope.selectedGCCObj.originalObject.GccCountCode.toString()) + ' ' + ($scope.selectedGCCObj.originalObject.GccCountEngName ? $scope.selectedGCCObj.originalObject.GccCountEngName : '') + ' ' + ($scope.selectedGCCObj.originalObject.GccCountArbName ? $scope.selectedGCCObj.originalObject.GccCountArbName : '');
                        $scope.isValidDestinationGCC = true;
                    } else {
                        $scope.selectedGCCObj.originalObject.GccCountEngName = '';
                        $scope.selectedGCCObj.originalObject.GccCountArbName = '';
                        $scope.isValidDestinationGCC = false;
                    }
                } else {
                    $scope.selectedGCCObj = {};
                    $scope.selectedGCCObj.originalObject = {};
                    $scope.selectedGCCObj.originalObject.GccCountEngName = '';
                    $scope.selectedGCCObj.originalObject.GccCountArbName = '';
                }
            }
            $scope.AddExitCenter = function (selectedCode) {
                if (selectedCode) {
                    var exitCentersSelected = angular.copy($scope.exitCenters);
                    var index = exitCentersSelected ? ( exitCentersSelected.findIndex(doc => doc.Code == selectedCode)) : -1;
                    if (index != -1) {
                        var code = exitCentersSelected[index];
                        $scope.selectedExitCenterObj.originalObject.Code = angular.copy(code.Code);
                        $scope.selectedExitCenterObj.originalObject.PortNameEnglish = code.PortNameEnglish;
                        $scope.selectedExitCenterObj.originalObject.PortNameArabic = code.PortNameArabic;
                        $scope.selectedExitCenter = ($scope.selectedExitCenterObj.originalObject.Code.toString()) + ' ' + ($scope.selectedExitCenterObj.originalObject.PortNameEnglish ? $scope.selectedExitCenterObj.originalObject.PortNameEnglish : '') + ' ' + ($scope.selectedExitCenterObj.originalObject.PortNameArabic ? $scope.selectedExitCenterObj.originalObject.PortNameArabic : '');
                        $scope.isValidExitCenter = true;
                    } else {
                        $scope.selectedExitCenterObj.originalObject.PortNameEnglish = '';
                        $scope.selectedExitCenterObj.originalObject.PortNameArabic = '';
                        $scope.isValidExitCenter = false;
                    }
                } else {
                    $scope.selectedExitCenterObj = {};
                    $scope.selectedExitCenterObj.originalObject = {};
                    $scope.selectedExitCenterObj.originalObject.PortNameEnglish = '';
                    $scope.selectedExitCenterObj.originalObject.PortNameArabic = '';
                }
            }

            //GenericLookup Methods Begin
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'EntryCenter':
                        $scope.selectedEntryCenterObj = {};
                        $scope.selectedEntryCenterObj.originalObject = angular.copy(row);
                        $scope.isValidEntryCenter = true;

                        $scope.selectedEntryCenter = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');

                        $('#EntryCenter_value').focus();
                        break;
                }
                $("#genericLookUp").modal("hide");
            }

            $scope.populateLookupData = function (lookupId) {
                switch (lookupId) {
                    case 'EntryCenter':
                        break;
                }
            }

            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'EntryCenter':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.entryCenterList) {
                                $scope.lookUpData = $scope.entryCenterList.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                    }
                });
            }

            $scope.openLookup = function (lookupId) {
                $('#searchLookupText').val("");
                $timeout(function () {
                    $scope.lookupId = lookupId;
                    switch (lookupId) {
                        case 'EntryCenter':
                            $scope.lookUpTitle = $filter("translate")("EntryCenter");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.entryCenterList;
                            break;
                    }

                    $scope.searchLookupTextModel = '';
                    $('#genericLookUp').modal({
                        backdrop: "static"
                    });
                    $('#searchLookupText').focus();
                    $('#searchLookupText').select();
                    //$scope.onLookupSearhChange(lookupId);
                    $('#genericLookUp').off("keydown");
                    $('#genericLookUp').bind('keydown', function (event) {
                        $timeout(function () {
                            switch (event.keyCode) {
                                case 13:
                                    $scope.setLookupData(lookupId);
                                    break;
                            }
                        });
                    });
                    //Page was not resetting back to 1; so explicitly called 'setCurrentPage(1)'
                    if (paginationService.isRegistered("lookUpPager")) {
                        paginationService.setCurrentPage("lookUpPager", 1);
                    }
                    $scope.lookUpCurrentPage = 1;
                });
            }

            $scope.lookupKeyDown = function (event, lookupId) {
                if (event.key == 'F9') {
                    $scope.openLookup(lookupId);
                }
            }

            //GenericLookup Methods End
        }
    ]);