angular.module('mamarApp').controller('createJobController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', 'sharedModels', '$anchorScroll', '$location', '$filter', 'userAccountStorageFactory', '$window','$timeout',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, sharedModels, $anchorScroll, $location, $filter, userAccountStorageFactory, $window, $timeout) {
        $scope.$storage = $storage;
        $("#loadingScreen").show();
        //For triggering search on enter
        $('#createJobDiv').bind('keydown', function (event) {
            //console.log(event.keyCode);
            if (event.keyCode == 13) {
                $scope.PopulateData();
            }
        });
        $scope.userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
        $('#createJobDiv').focus();
        //endregion
        $anchorScroll.yOffset = -750;
        $scope.selectedRowNum = null;
        $scope.detailsPageSize = 5;
        $scope.selectedTab = $stateParams.transportMode ? $stateParams.transportMode : "M";//default mode is Sea

        $scope.Importer = '';
        $scope.errReturned = '';
        $scope.selectedDORecord = {};
        $scope.selectedDO = 0;
        $scope.printCertificateParameter = {};
        $scope.jobsAndDoData = [];

        //Region Search 
        function ResetPageNumber() {
            $scope.searchParameter.pageNumber = 1;
        }
        function InitialiseSearch() {
            $scope.searchParameter = {
                centerCode: this.centerCode ? this.centerCode : '',
                agentCode: '',
                doNumber: '',
                jobNumber: '',
                custBillNumber: '',
                billType: '',
                cargoType: '',
                houseBLNumber: '',
                importerExporter: '',
                masterBL: '',
                containerNumber: '',
                chassisNumber: '',
                //pageNumber: 1,
                pageSize: 10,
                orderBy: ''
            };
            $scope.selectedBLDO = '';
            $scope.ddlSelBookingNo = false;
            $scope.ddlSelDoNum = false;
            $scope.ddlSelJobNum = false;
            $scope.ddlSelCustBillNo = false;
            $scope.showWarning = false;
            $scope.ddlSelValue = true;
            $scope.invalidDo = false;
            $scope.isBLDODisabled = false;
        }
        //OGA Status Modal
        $scope.showOGGStatus = function (jobNumber) {
            var ActionStatusRequestObject = {
                jobNumber: jobNumber,
                centerCode: $scope.selCenterCode
            }
            $scope.SelectedJobNumber = jobNumber; // Just to show in UI
            var promise = apiService.GetActionStatus(false, ActionStatusRequestObject);
            promise.then(function (AuthorityStatus) {
                $scope.AuthorityStatus = AuthorityStatus;
                $("#oggModal").modal('show');
            }, function (error) {
                console.log(error);
            });
        }
        $scope.closeModalPopUp = () => {
            $("#oggModal").modal('hide');
        }
        //OGA Status Modal

        $scope.LoadLookupCenterCodes = function () {
            $scope.lkupCntrCodepm = {
                transportMode: $scope.selectedTab,
                searchString: ''
            };
            apiService.get('Customs/Lookup/CenterCodes',
                $scope.lkupCntrCodepm,
                function (results) {
                    $scope.centerCodes = results.data.ResponseResult.Data;
                    $storage.set('storedCenterCodes', $scope.centerCodes); //store the center code in local storage for using in other screens; as part of performance improvement
                    if ($scope.centerCodes) {

                        // if (sharedModels.transactionSearchModel && sharedModels.transactionSearchModel.fromShipment)//if redirected from shipment screen, maintain the center code

                        if ($scope.StoredCenter) {
                            $scope.selCenterCode = $scope.StoredCenter;
                        }
                        else {
                            var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) { return (cenCode.Code == 'V') });
                            $scope.selCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
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
        var LoadLookupBillType = function () {
            var opt = {};
            opt.Code = '';
            opt.NameEnglish = '--Select--';
            opt.NameArabic = '--الشحن--';

            $scope.lkBillTypeParameter = {
                centerCode: $scope.selCenterCode,
                searchString: ''
            };
            getIndexData('billTypes', $scope.selCenterCode, function (data) {
                $scope.lookupBillTpResult = data;
                
                if ($scope.lookupBillTpResult) {
                    $scope.lookupBillTpResult.unshift(opt);
                }

            }, function () {
                apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParameter, function (results) {

                    $scope.lookupBillTpResult = angular.copy(results.data.ResponseResult.Data);
                    storeData(results.data.ResponseResult.Data, 'billTypes', $scope.selCenterCode);
                    if ($scope.lookupBillTpResult) {
                        $scope.lookupBillTpResult.unshift(opt);
                    }
                },
            function error(response) {
                console.log(response);
            })
            });
        }

        var LoadLookupCargoType = function () {
            var optionSelect = {
                Code: '',
                EnglishName: '--Select--',
                ArabicName: '--الشحن--'
            };
            $scope.lkCargoTypeParameter = {
                centerCode: $scope.selCenterCode,
                searchString: ''
            };
            getIndexData('cargoTypes', '', function (data) {
                $scope.lookupCargoTpResult = data;
                if ($scope.lookupCargoTpResult) {
                    $scope.lookupCargoTpResult.unshift(optionSelect);
                }

            }, function () {
                apiService.get('Customs/Lookup/CargoTypes', $scope.lkCargoTypeParameter, function (results) {
                    $scope.lookupCargoTpResult = angular.copy(results.data.ResponseResult.Data);
                    storeData(results.data.ResponseResult.Data, 'cargoTypes', '');
                    if ($scope.lookupCargoTpResult) {
                        $scope.lookupCargoTpResult.unshift(optionSelect);
                    }
                },
                function error(response) {
                    console.log(response);
                })
            });
        }

        $scope.ImporterExporterChanged = function (searchStr) {
            if (searchStr) {
                apiService.get('Customs/Lookup/ImporterExporter',
                {
                    centerCode: $scope.selCenterCode,
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
        $scope.ValidateSearch = function () {

            $scope.searchParameter.importerExporter = ($scope.Importer && $scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject) ? $scope.selectedImporterExporterCode.originalObject.Code : '';

            $scope.invalidDo = false;
            $scope.invalidImporter = false;

            if ($scope.searchParameter.agentCode) {
                if (!$scope.searchParameter.doNumber || ($scope.searchParameter.doNumber && $scope.searchParameter.doNumber.length == 0)) {
                    $scope.invalidDo = true;
                    return false;
                }
            }
            var selectedImporter = ($scope.Importer && $scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject) ? ($scope.selectedImporterExporterCode.originalObject.Code + $scope.selectedImporterExporterCode.originalObject.EnglishName + $scope.selectedImporterExporterCode.originalObject.ArabicName) : '';
            if ($scope.Importer.replace(/\s/g, '') != selectedImporter.replace(/\s/g, '')) {
                $scope.invalidImporter = true;
                return false;
            }

            return true;
        }
        //To get the Job List Search Criteria.
        $scope.BLDOList = apiService.getJobListSearchCriteria($scope.selectedTab);
        //Event : Center Code Change event , will initialise everything and will load fresh data
        $scope.centerCodeChanged = function () {
            $("#loadingScreen").hide();
            InitialiseSearch();

            ResetPageNumber();
            $scope.jobsAndDoData = [];
            $scope.InitializeDetailsGrid();
            $scope.searchParameter.centerCode = $scope.selCenterCode;
            localStorage.setItem("centerCode_" + $scope.selectedTab + '_' + $scope.userAccntInfo.CCode, $scope.selCenterCode);
            setSharedValues();
            populateLookups();
        }
        //Search Buttom Click Event
        $scope.searchResults = function () {
            var isValidForSearch = $scope.ValidateSearch();
            if (isValidForSearch) {
                $scope.searchParameter.importerExporter = ($scope.Importer && $scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject) ? $scope.selectedImporterExporterCode.originalObject.Code : '';
                $scope.searchParameter.pageNumber = 1;
                $scope.PopulateData();
            }
        }
        //Job List Search Criteria change event
        $scope.blDdlChanged = function () {

            $scope.searchParameter.houseBLNumber = '';
            $scope.searchParameter.doNumber = '';
            $scope.searchParameter.jobNumber = '';
            $scope.searchParameter.custBillNumber = '';
            $scope.searchParameter.containerNumber = '';
            $scope.searchParameter.chassisNumber = '';

            $scope.ddlSelBookingNo = false;
            $scope.ddlSelDoNum = false
            $scope.ddlSelJobNum = false
            $scope.ddlSelBOE = false;
            $scope.ddlSelCustBillNo = false;
            $scope.ddlSelValue = true;
            $scope.ddlSelCntNo = false;
            $scope.ddlSelChsNo = false;

            switch ($scope.selectedBLDO) {
                case 'houseBLNumber':
                    $scope.ddlSelBookingNo = true;
                    $scope.ddlSelValue = false;
                    $scope.searchParameter.doNumber = '';
                    $scope.searchParameter.jobNumber = '';
                    $scope.searchParameter.custBillNumber = '';
                    break;
                case 'doNumber':
                    $scope.ddlSelDoNum = true
                    $scope.ddlSelValue = false;
                    $scope.searchParameter.houseBLNumber = '';
                    $scope.searchParameter.jobNumber = '';
                    $scope.searchParameter.custBillNumber = '';
                    break;
                case 'jobNumber':
                    $scope.ddlSelJobNum = true
                    $scope.ddlSelValue = false;
                    $scope.searchParameter.doNumber = '';
                    $scope.searchParameter.houseBLNumber = '';
                    $scope.searchParameter.custBillNumber = '';
                    break;
                case 'custBillNumber':
                    $scope.ddlSelCustBillNo = true;
                    $scope.ddlSelValue = false;
                    $scope.searchParameter.jobNumber = '';
                    $scope.searchParameter.doNumber = '';
                    $scope.searchParameter.houseBLNumber = '';
                    break;
                case 'containerNumber':
                    $scope.ddlSelCntNo = true;
                    $scope.ddlSelValue = false;
                    $scope.searchParameter.containerNumber = '';
                    break;
                case 'chassisNumber':
                    $scope.ddlSelChsNo = true;
                    $scope.ddlSelValue = false;
                    $scope.searchParameter.chassisNumber = '';
                    break;
            }
        }
        $scope.agentCodeChange = function () {
            if ($scope.searchParameter.agentCode) {
                //Warning Message
                $scope.showWarning = true;
                //Select DO in dropdown
                $scope.isBLDODisabled = true;
                $scope.selectedBLDO = 'doNumber';
                $scope.blDdlChanged();
                $scope.searchParameter.billType = '';
                $scope.searchParameter.cargoType = '';
            }
            else {
                $scope.showWarning = false;
                $scope.isBLDODisabled = false;
                $scope.selectedBLDO = 'doNumber';
                $scope.ddlSelBookingNo = false;
                $scope.ddlSelDoNum = true;
                $scope.ddlSelJobNum = false;
                $scope.ddlSelCustBillNo = false;
                $scope.invalidDo = false;
                //$scope.ddlSelValue = true;
                //$scope.searchParameter.doNumber = '';
            }
        }
        function setSharedValues() {
            sharedModels.transactionSearchModel = $scope.searchParameter;
            sharedModels.transactionSearchModel.TransportMode = $scope.selectedTab;
            sharedModels.transactionSearchModel.fromShipment = false;
            sharedModels.transactionSearchModel.selectedBLDO = $scope.selectedBLDO;
            sharedModels.transactionSearchModel.ddlSelBookingNo = $scope.ddlSelBookingNo;
            sharedModels.transactionSearchModel.ddlSelDoNum = $scope.ddlSelDoNum;
            sharedModels.transactionSearchModel.ddlSelJobNum = $scope.ddlSelJobNum;
            sharedModels.transactionSearchModel.ddlSelCustBillNo = $scope.ddlSelCustBillNo;
            sharedModels.transactionSearchModel.ddlSelValue = $scope.ddlSelValue;
            sharedModels.transactionSearchModel.isBLDODisabled = $scope.isBLDODisabled;
        }
        //Load Transaction List
        $scope.PopulateData = function () {
            $scope.InitializeDetailsGrid();
            $("#loadingScreen").show();
            $scope.searchParameter.centerCode = $scope.selCenterCode;
            apiService.get('Customs/Job/GetJobList', $scope.searchParameter, function (results) {

                $("#loadingScreen").hide();

                if ($scope.JobCreated) {
                    $scope.JobCreated = false;
                }

                setSharedValues();

                if (results && results.data && results.data.ResponseResult && results.data.ResponseResult.IsValid) {
                    $scope.jobsAndDoData = results.data.ResponseResult.Data;

                    ///This should be removed once service add 'ATACarnet' property
                    if ($scope.jobsAndDoData) {
                        $scope.jobsAndDoData.map((obj) => {
                            obj.ATACarnet = false;
                            return obj;
                        });
                    }

                    if ($scope.jobsAndDoData != null && $scope.jobsAndDoData.length > 0) {
                        $scope.totalCount = $scope.jobsAndDoData[0].TotalCount;
                    }
                }
                else {
                    var message = "An Error has occurred while fetching data.";
                    if (results && results.data && results.data.ResponseResult && results.data.ResponseResult.Messages)
                        message = results.data.ResponseResult.Messages;
                    modalErrorShow(message);
                }
            },
        function error(response) {
            $("#loadingScreen").hide();

            //alert('something went wrong')
            console.log(response);
        });
        }
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.searchParameter.pageNumber = newPageNo;
            $scope.PopulateData();
            $scope.selectedDORecord = {};
        }
        $scope.GoToShipmentDetails = function () {
            $state.go('shipmentAndInvoice', {
                centerCode: $scope.selCenterCode, jobNumber: $scope.newJobNumber, tab: 'shipmentdetails'
            },
            { notify: true });
        }
        //Details Section
        $scope.GetJobTransactionDetail = function () {
            $("#loadingScreen").show();
            $scope.searchParameter.centerCode = $scope.selCenterCode;

            apiService.get('Customs/Job/GetJobTransactionDetail', $scope.TransactionDetailsRequestObject, function (results) {
                $scope.TransactionDetails = results.data.ResponseResult.Data;
                $scope.ContainerDetails = $scope.TransactionDetails.ContainerInfo;
                $scope.ChasisDetails = $scope.TransactionDetails.ChassisInfo;
                $scope.ReferenceDetails = $scope.TransactionDetails.MVIHInfo;
                $scope.VoucherDetails = $scope.TransactionDetails.BillInfo;

                $scope.ApprovalAuthority = $scope.selectedDORecord.ADFCA ? "ADFCA" : "";
                $("#loadingScreen").hide();
                gotoAnchor("MTransDetails");
            },
        function error(response) {
            $("#loadingScreen").hide();
            alert('something went wrong')
            console.log(response);
        });

        }
        $scope.PopulateTransactionRequestObject = function () {
            $scope.TransactionDetailsRequestObject.centerCode = $scope.searchParameter.centerCode;
            $scope.TransactionDetailsRequestObject.jobNumber = $scope.selectedDORecord.JobNumber;
        }
        $scope.InitializeDetailsGrid = function () {
            $scope.selectedDO = '';
            $scope.selectedDORecord = [];
            $scope.TransactionDetailsRequestObject = {
                companyCode: '',
                userCode: '',
                centerCode: '',
                jobNumber: '',
            };

            $scope.ChasisDetails = [{
                ChassisNumber: '',
                CertNumber: '',
                CertDate: ''
            }];

            $scope.ContainerDetails = [{
                ContainerNumber: '',
                SealNumber: ''
            }];

            $scope.ReferenceDetails = [{
                ReferenceNumber: '',
                TransportNumber: ''
            }];

            $scope.VoucherDetails = [{
                VoucherName: '',
                VoucherType: '',
                VoucherAmount: '',
                VoucherDate: ''
            }];
        }
        $scope.SelectRow = function (gridItem) {
            $scope.selectedDO = gridItem.DONumber;
        }
        function undefinedToNull(data) {
            return data ? data : null;
        }
        var gotoAnchor = function (divId) {
            if ($location.hash() !== divId) {
                $location.hash(divId);
            } else {
                $anchorScroll();
            }
        };
        $scope.setClickedRow = function (mySelectedItems) {
            $scope.InitializeDetailsGrid();
            if (!apiService.isNullOrEmptyOrUndefined(mySelectedItems)) {
                $scope.selectedRowNum = mySelectedItems.RowNumber;
                $scope.selectedDO = mySelectedItems.DONumber;
                $scope.selectedDORecord = mySelectedItems;
                $scope.PopulateTransactionRequestObject();
                $scope.GetJobTransactionDetail();
            }
            else {
                $scope.selectedDORecord = {};
            }
        };

        //Region: Create Job
        $scope.CreateNewJob = function (gridItem) {
            if (gridItem) {
                $scope.createJobParameter = {};
                $scope.createJobParameter.CompanyCode = '';//Company code will be taken from token
                $scope.createJobParameter.userCode = '';//User code will be taken from token
                $scope.createJobParameter.blNumber = undefinedToNull(gridItem.HouseBLNumber);
                $scope.createJobParameter.vesselCode = undefinedToNull(gridItem.VesselCode);
                $scope.createJobParameter.doNumber = undefinedToNull(gridItem.DONumber);
                $scope.createJobParameter.voyageNumber = undefinedToNull(gridItem.VoyageNumber);
                $scope.createJobParameter.arrivalDate = undefinedToNull(gridItem.ArrivalDate);
                $scope.createJobParameter.centerCode = undefinedToNull($scope.selCenterCode);
                $scope.createJobParameter.JobNumber = gridItem.JobNumber > 0 ? gridItem.JobNumber : null;
                $scope.createJobParameter.isATACarnetFlag = gridItem.ATACarnet ? 'Y' : 'N';
                $scope.createJobParameter.isBill = undefinedToNull(gridItem.IsBil);
                $scope.createJobParameter.agentCode = undefinedToNull(gridItem.AgentCode);
                $scope.createJobParameter.BillType = undefinedToNull(gridItem.BillType);

                //billType
                $("#loadingScreen").show();
                $scope.JobCreated = true;
                apiService.post('Customs/Job/CreateJob', '', $scope.createJobParameter, function (result) {

                    $("#loadingScreen").hide();
                    console.log("Customs/Job/CreateJob: " + result.data.StatusIsSuccessful);

                    var data = result.data.ResponseResult;
                    if (data) {
                        if (data.IsValid && data.Data && data.Data["JobCode"] && data.Data["JobCode"] != 0) {
                            //$scope.createJobFailed = false;
                            //$scope.errReturned = '';
                            //Refresh Grid 
                            InitialiseSearch();
                            ResetPageNumber();
                            //$scope.PopulateData();
                            var createJobsuccessMsg = $filter('translate')('JobCreateSuccessMsg') + '<b>' + data.Data["JobCode"] + '</b>';
                            $scope.newJobNumber = data.Data["JobCode"];
                            //showSuccessMessage(createJobsuccessMsg);

                          

                            showConfirmMessage(createJobsuccessMsg);
                        }
                        else if (data.IsValid && data.Data && data.Data["ERR_DESC_E"] != '') {
                            var errMsg = apiService.formatResponseMessage(data.Data["ERR_DESC_E"]);
                            showErrorMessage(errMsg);
                        }
                        else if (!data.IsValid) {
                            var createJobErrMsg = $filter('translate')('CreateJobErrMsg');
                            if (data && data.Data["ERR_DESC_E"] != '') {
                                createJobErrMsg = apiService.formatResponseMessage(data.Data["ERR_DESC_E"]);
                            }
                            showErrorMessage(createJobErrMsg);
                        }
                    }
                    else {
                        var createJobErrMsg = $filter('translate')('CreateJobErrMessage');
                        showErrorMessage(createJobErrMsg);
                    }

                },
                function (result) {
                    $("#loadingScreen").hide();
                    var jobErrMsg = $filter('translate')('CreateJobErrMessage');
                    showErrorMessage(jobErrMsg);
                });
            }
        };


        //Print Preclearance report
        $scope.PrintPreClearanceCertificates = function (jobNumber, after24Hours) {
            $("#loadingScreen").show();
            $scope.selectedJobNoForPreclearance = jobNumber;
            $scope.printParameter = {
                centerCode: $scope.selCenterCode,
                jobNumber: jobNumber,
                printValidation: 'N'
            };
            if (after24Hours) {
                $scope.printParameter.printValidation = 'Y';
            }
            apiService.get('Customs/Reporting/PreclearanceReport', $scope.printParameter, function (results) {
                $("#loadingScreen").hide();
                var resultData = results.data.ResponseResult;
                if (resultData.IsValid) {
                    if (resultData.Messages) {
                        showYesNoConfirmatioMessage(resultData.Messages);
                    }
                    else {
                        apiService.printDocuments(resultData.Data);
                    }
                }
                else {
                    modalErrorShow(resultData.Messages);
                }
            },
           function error(response) {
               $("#loadingScreen").hide();
               console.log('Preclearance' + response);
           });
        }

        $scope.DownloadGatePass = function (jobNumber) {
            debugger;

            $("#loadingScreen").show();
            $scope.gatePassParameter = {
                centerCode: $scope.selCenterCode,
                jobNumber: jobNumber
            }
            apiService.get('Customs/Reporting/GetManifestContainerGatePass', $scope.gatePassParameter, function (results) {
                $("#loadingScreen").hide();
                var resultData = results.data.ResponseResult;
                if (resultData.IsValid) {
                    apiService.printDocuments(resultData.Data);
                }
                else {
                    modalErrorShow(resultData.Messages);
                }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log('Preclearance' + response);
                });
        }

        function GetBilltypeCode(Code)
        {
            let str = Code.toUpperCase();
            let ReturnCode = '';

            if (str == 'IMPORT')
            {
                ReturnCode = 'I';
            }
            else if (str == 'EXPORT')
            {
                ReturnCode = 'E';
            }
            else if (str == 'RE EXPORT') {
                ReturnCode = 'R';
            }
            else if (str == 'TEMPORARY ENTRY')
            {
                ReturnCode = 'N';
            }
            else if (str == 'TRANSIT IN')
            {
                ReturnCode = 'T';
            }
            else if (str == 'TRANSIT OUT')
            {
                ReturnCode = 'O';
            }            //Free Zone
            else if (str == 'FREEZONE EXIT-LOCAL') {
                ReturnCode = 'I';
            }
            else if (str == 'FREEZONE ENTRY-UAE ORIGIN') {
                ReturnCode = 'E';
            }
            else if (str == 'FREEZONE ENTRY-FOREIGN ORIGIN') {
                ReturnCode = 'R';
            }
            else if (str == 'FREEZONE EXIT-TRANSIT') {
                ReturnCode = 'T';
            }
            return ReturnCode;

        }
        //Create a duplicate job
        $scope.CreateDuplicateJob = function (jobNumber, custBillType, custBillNumber, BillType) {
            $("#loadingScreen").show();
            $scope.duplicateJobParameter =
            {
                companyCode: null,
                userCode: null,
                centerCode: $scope.selCenterCode,
                jobNumber: jobNumber,
                BillType: GetBilltypeCode(BillType)
            }
            apiService.post('Customs/Job/DuplicateJob', '', $scope.duplicateJobParameter, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = apiService.formatResponseMessageObject(response.Messages);
                if (response.IsValid) {
                    ResetPageNumber();
                    $scope.PopulateData();
                    //modalSuccessShow(successMsg);
                    showSuccessMessage(msg.eng + '<br\>' + msg.arb);
                }
                else {
                    //modalErrorShow(msg);
                    showErrorMessage(msg.eng + '<br\>' + msg.arb);
                }
            },
           function error(response) {
               $("#loadingScreen").hide();
               console.log('DuplicateJob' + response);
           });
        }

        //Region : Print Entry/Exit Certificate

        //Open print entry exit popup
        $scope.ShowEntryExitCertificateModal = function (selectedRow) {
            //$scope.IsValidPrintEntryExitCertificate = true;
            $scope.sealsInput = '';
            $scope.trucksInput = '';
            $scope.selectedJob = selectedRow;
           
            $scope.printEntryExitParameter = {
                companyCode: '',
                userCode: '',
                centerCode: $scope.selCenterCode,
                billNumber: $scope.selectedJob.CustomerBillNumber,
                billYear: $scope.selectedJob.CustBillYear,
                billCenterCode: $scope.selectedJob.CustBillCenter,
              //  billType: $scope.selectedJob.CustBillType,
                paymentType: null,
                debit: null,
                ExistingRecord: $scope.selectedJob.GRRNumber ? 1 : 0,
                Seals: [],
                Trucks: []
            }

            //
            var infoBillType = $scope.selectedJob.CustBillType;
            var TransitIn = "Transit In";
            var TransitOUT = "Transit Out";
            var freeZoneTransitIn = "Freezones Exit - Transit";
            var ReImport = "Re Export";
            //

            if (infoBillType.toUpperCase() == TransitIn.toUpperCase() || infoBillType.toUpperCase() == freeZoneTransitIn.toUpperCase()) {
                $scope.printEntryExitParameter.billType = 'T';
            }
            else if (infoBillType.toUpperCase() == TransitOUT.toUpperCase()) {
                $scope.printEntryExitParameter.billType = 'O';
            }
            else if (infoBillType.toUpperCase() == ReImport.toUpperCase()) {
                $scope.printEntryExitParameter.billType = 'R';
            }
            //

            $scope.sealNoMandatory = false;
            $scope.sealValidationError = false;
            if ($scope.selectedJob && $scope.selectedJob.GRRNumber) //Skip popup and directly print entry exit
            {
                downloadPrintEntryExit(true);
            }
            else {
                $('#printEntryExitModal').modal({
                    backdrop: "static"
                });
            }
        }
        //Validate Print Entry Exit input fields
        $scope.ValidatePrintEntryExitCertificate = function () {
            $scope.sealNoMandatory = $scope.sealsInput ? false : true;
            $scope.IsValidPrintEntryExitCertificate = $scope.sealNoMandatory ? false : true;
        }
        function downloadPrintEntryExit(isDownload) {
   
            $("#loadingScreen").show();
            apiService.post('Customs/Vehicle/ExitEntryCertificate', '', $scope.printEntryExitParameter, function (results) {
                $("#loadingScreen").hide();
                var resultData = results.data.ResponseResult;
                if (resultData && resultData.Data && resultData.IsValid) {
                    $scope.sealValidationError = false;
                    if (!isDownload) {
                        $('#printEntryExitModal').modal('hide');
                        $scope.selectedJob.GRRNumber = resultData.Data.GRRNumber;
                        var successMsg = $filter('translate')('sealValidationSuccessMessage');
                        var newGrr = $filter('translate')('NewGRRMessage');
                        var exitentrydownloadMsg = $filter('translate')('exitentrydownloadMsg');
                        var msg = successMsg + '<br/>' + exitentrydownloadMsg + '<br/>' + newGrr + '<b>' + resultData.Data.GRRNumber + '</b>';
                        showSuccessMessage(msg);
                    }
                    apiService.printDocuments(resultData.Data.bytes);
                }
                else {
                    if (!isDownload) {
                        $scope.sealValidationError = true;
                        $scope.sealValidationErrorMessage = apiService.formatResponseMessage(resultData.Messages);
                    }
                    else {
                        modalErrorShow(apiService.formatResponseMessage(resultData.Messages));
                    }
                }
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log('ExitEntryCertificate' + response);
            });
        }
        //Save and Print Exit Entry Certificate
        $scope.PrintEntryExitCertificate = function () {
            $scope.ValidatePrintEntryExitCertificate();
            if ($scope.IsValidPrintEntryExitCertificate) {

                var sealsArray = angular.copy($scope.sealsInput);
                var trucksArray = angular.copy($scope.trucksInput);

                $scope.printEntryExitParameter.Seals = sealsArray ? sealsArray.split(',') : [];
                $scope.printEntryExitParameter.Trucks = trucksArray ? trucksArray.split(',') : [];
                downloadPrintEntryExit(false);
                //$("#loadingScreen").show();
                //apiService.post('Customs/Vehicle/ExitEntryCertificate', '', $scope.printEntryExitParameter, function (results) {
                //    $("#loadingScreen").hide();
                //    var resultData = results.data.ResponseResult;
                //    if (resultData && resultData.Data && resultData.IsValid) {
                //        $scope.sealValidationError = false;
                //        $('#printEntryExitModal').modal('hide');
                //        $scope.selectedJob.GRRNumber = resultData.Data.GRRNumber;
                //        var successMsg = $filter('translate')('sealValidationSuccessMessage');
                //        var newGrr = $filter('translate')('NewGRRMessage');
                //        var exitentrydownloadMsg = $filter('translate')('exitentrydownloadMsg');
                //        var msg = successMsg + '<br/>' + exitentrydownloadMsg + '<br/>' + newGrr + '<b>' + resultData.Data.GRRNumber + '</b>';
                //        showSuccessMessage(msg);
                //        apiService.printDocuments(resultData.Data.bytes);
                //    }
                //    else {
                //        $scope.sealValidationError = true;
                //        $scope.sealValidationErrorMessage = apiService.formatResponseMessage(resultData.Messages);
                //    }
                //},
                //function error(response) {
                //    $("#loadingScreen").hide();
                //    console.log('ExitEntryCertificate' + response);
                //});
            }
            else {

            }
        }
        //Show DO/BL details
        $scope.showShipmentDetails = (selectedRow) => {
            if (selectedRow) {
                $storage.set('voucherFlag', (selectedRow.Voucher == 'Y' ? true : false));
                $storage.set('globalDisableFlag', (selectedRow.OGAPresent > 0 ? true : false));
                $state.go('shipmentAndInvoice', { 'centerCode': $scope.selCenterCode, 'jobNumber': selectedRow.JobNumber, 'tab': 'shipmentdetails', 'Status': selectedRow.PreClear });
            }
        }

        //Show DO/BL details in draft mode for which job has not been created
        $scope.showShipmentInDraftMode = function (selectedRow) {
            var DoNumber = selectedRow.DONumber;
            var AgentCode = selectedRow.AgentCode;
            if (typeof (Storage) !== "undefined") {
                localStorage.storedDoInfo = JSON.stringify(selectedRow);
            }
            $state.go('shipmentInDraft', { 'centerCode': $scope.selCenterCode, 'DoNumber': DoNumber, 'AgentCode': AgentCode });
        }


        //Gate Pass
        $scope.closeAttachmentPopup = function () {
            $("#loadingScreen").show();
            $("#loadingScreen").hide();
            //GetDelegateDetail();
        }

        $scope.openAttachments = function (delegateNumber) {
            debugger;
            $("#loadingScreen").show();
            $scope.Message = '';
            $('#attachments').modal({
                backdrop: "static"
            });

            $scope.DownloadGatePass(delegateNumber);
        }

        //Download Document
        $scope.downloadDelegateDocument = function (gridItem) {
            $scope.Message = '';
            apiService.get('Customs/ImporterExporter/ViewDelegateAttachment',
                {
                    centerCode: $stateParams.centerCode,
                    delegateNumber: gridItem.DelegateNumber,
                    serialNumber: gridItem.ID
                },
                function (results) {
                    var data = results.data.ResponseResult;
                    if (data.IsValid) {
                        var attachement = {};
                        var attachementList = [];
                        attachement.content = data.Data.Data;
                        attachement.FileName = gridItem.FilePath;
                        attachementList.push(attachement);
                        $("#loadingScreen").hide();
                        apiService.printDocuments(attachementList);
                        return;
                    }
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }
        //Nagigate to Payment Gateway
        $scope.warningMsgOKClick = () => {
            if ($scope.idbUrl) {
                $window.open($scope.idbUrl, '_blank');
            }
        }
        $scope.gotoPaymentGateway = (jobNumber) => {
            $("#loadingScreen").show();
            $scope.paymentUrlGetParams = {
                CenterCode: $scope.selCenterCode,
                jobNumber: jobNumber
            }
            apiService.get('Customs/Job/IDBPayOperation', $scope.paymentUrlGetParams, function (results) {
                $("#loadingScreen").hide();
                var resultData = results.data.ResponseResult;
                if (resultData && resultData.IsValid) {
                    $scope.idbUrl = (resultData.Data && resultData.Data.URL) ? resultData.Data.URL : '';
                    if (resultData.Messages && resultData.Messages.length > 0) {
                        modalWarningConfirmShow(resultData.Messages);
                    }
                }
                else {
                    modalErrorShow(resultData.Messages);
                }
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log('Redirect to payment Gateway' + response);
            });
        }
        //Delete Document
        ////

        //******* Region: Seal Number inline add /edit logic *******
        //$scope.addNewSealNo = function () {
        //    $scope.addingNewRow = true;
        //}
        //$scope.pushSealNo = function () {

        //    $scope.sealNoMandatory = false;

        //    if ($scope.sealNo) {
        //        var newSealNo = { SealNumber: angular.copy($scope.sealNo) };
        //        $scope.SealList.push(newSealNo);
        //        $scope.sealNo = '';
        //        $scope.sealValidationError = false;
        //        $scope.addingNewRow = false;
        //        angular.forEach($scope.editRow, function (value, index) {
        //            $scope.editRow[index] = false;
        //        });
        //    }
        //    else {
        //        $scope.sealNoMandatory = true;
        //    }
        //}
        //$scope.editSelectedSealNo = function (index) {
        //    $scope.sealNoMandatory = false;
        //    if ($scope.SealList[index].SealNumber) {
        //        $scope.addingNewRow = false;
        //        angular.forEach($scope.editRow, function (value, index) {
        //            $scope.editRow[index] = false;
        //        });
        //    }
        //    else {
        //        $scope.sealNoMandatory = true;
        //    }
        //}
        //$scope.editSeal = function (index) {
        //    $scope.addingNewRow = false;
        //    $scope.editRow[index] = true;
        //    $scope.oldSealNo = $scope.SealList[index].SealNumber;
        //}
        //$scope.deleteSeal = function (index) {
        //    $scope.addingNewRow = false;
        //    $scope.SealList.splice(index, 1);
        //}
        //$scope.cancelAddEditSeal = function (index) {
        //    $scope.addingNewRow = false;
        //    $scope.sealNoMandatory = false;
        //    $scope.editRow[index] = false;
        //    if (index >= 0) {
        //        $scope.SealList[index].SealNumber = $scope.oldSealNo;
        //    }
        //    $scope.sealNo = '';
        //}
        //******* End of Region: Seal Number inline add /edit logic *******

        //Tab Change Event
        $scope.$watch("selectedTab", function () {
            $scope.LoadLookupCenterCodes();
            $scope.selectedDORecord = {
            };
        });

        $scope.StoredCenter = localStorage.getItem("centerCode_" + $scope.selectedTab + '_' + $scope.userAccntInfo.CCode);
        if ($scope.StoredCenter) {
            $scope.selCenterCode = $scope.StoredCenter;
            //$scope.centerCodeChanged();
            populateLookups();
        }
        else {
            $scope.selCenterCode = '';
        }



        //Caching Lookups 
        function populateHarmonized(){

            var reqObject = $storage.get('reqObject');
            var fullUrl = reqObject.ApiUrl + "api/" + 'Customs/Lookup/HarmonizedCode';

            apiService.get('Customs/Lookup/HarmonizedCode',
            {
                centerCode: $scope.selCenterCode,
                searchString: '',
                jobNumber: '3',
                OriginType: ''
            },
            function (results) {
                var data = results.data.ResponseResult.Data;
                storeData(data, 'hsCode', '');
            },
            function error(response) {
                console.log(response);
            });
        }

        function GetStorageTypes() {
            getIndexData('storageTypes', '', function (data) {
                //$scope.storageTypes = data;
            }, function () {
                apiService.get('Customs/Lookup/StorageType',
                 {
                     centerCode: $scope.selCenterCode,
                     searchString: ''
                 },
                 function (results) {
                    // $scope.storageTypes = results.data.ResponseResult.Data;
                     storeData(results.data.ResponseResult.Data, 'storageTypes', '');
                 },
                 function error(response) {
                     //modalErrorShow("An Error has occurred while getting lookup Data!");
                 }
             )
            });
        }

        function getEmiratesLookupData() {
            getIndexData('emirates', '', function (data) {
                //$scope.emirates = data;
            }, function () {
            apiService.get('Customs/Lookup/Emirates',
                 {
                     centerCode: $scope.selCenterCode,
                     searchString: ''
                 },
                 function (results) {
                     storeData(results.data.ResponseResult.Data, 'emirates', '');
                 },
                 function error(response) {
                     modalErrorShow("An Error has occurred while getting cneter code Lookup Data!");
                 })
            });
        }

        function GetImporterCategoryCodes() {
            getIndexData('ImporterCategory', '', function (data) {
            }, function () {
                apiService.get('Customs/Lookup/ImporterCategory',
                    {
                        centerCode: $scope.selCenterCode,
                        searchString: ''
                    },
                    function (results) {
                        storeData(results.data.ResponseResult.Data, 'ImporterCategory', '');
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                )
            });
        }

        function  PopulateOriginExporter() {
            getIndexData('OriginExporter', '', function (data) {
                
            }, function () {
                apiService.get('Customs/Lookup/OriginExporter',
                {
                    centerCode: $scope.selCenterCode,
                    searchString: ''
                },
                function (results) {
                    storeData(results.data.ResponseResult.Data, 'OriginExporter', '');
                },
                function error(response) {
                    console.log("An Error has occurred while getting lookup Data OriginExporter!");
                })
            });
        }

        function  PopulateChargeType() {

            getIndexData('ChargesType', '', function (data) {

            }, function () {
                apiService.get('Customs/Lookup/ChargesType',
                {
                    centerCode: $scope.selCenterCode,
                    searchString: ''
                },
                function (results) {
                    storeData(results.data.ResponseResult.Data, 'ChargesType', '');
                },
                function error(response) {
                    console.log("An Error has occurred while getting lookup Data ChargesType!");
                })
            });
        }

        function showConfirmMessage(msg) {
            swal({
                title: '',
                text: msg,
                type: "success",
                confirmButtonColor: "#666",
                confirmButtonText: $filter('translate')('ViewJobList'),
                closeOnConfirm: true,
                showCancelButton: true,
                cancelButtonText: $filter('translate')('ViewJobDetails'),
                html: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    $scope.PopulateData();
                }
                else {
                    $scope.GoToShipmentDetails();
                }
            });
        }
        function showYesNoConfirmatioMessage(msg) {
            swal({
                title: '',
                text: msg,
                type: "success",
                confirmButtonColor: "#666",
                confirmButtonText: $filter('translate')('ok'),
                closeOnConfirm: true,
                showCancelButton: true,
                cancelButtonText: $filter('translate')('Cancel'),
                html: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    $scope.PrintPreClearanceCertificates($scope.selectedJobNoForPreclearance, true);
                }
            });
        }

        function PopulatePorts() {
            getIndexData('Ports', '', function (data) {
            }, function () {
            apiService.get('Customs/Lookup/Ports',
               {
                   centerCode: $scope.selCenterCode,
                   searchString: ''
               },
               function (results) {
                   storeData(results.data.ResponseResult.Data, 'Ports', '');
               },
               function error(response) {
                  
               });
            });
        }

        function populateLookups() {
            $timeout(function () {
                LoadLookupBillType();
                LoadLookupCargoType();
                GetStorageTypes();
               // populateHarmonized();
                getEmiratesLookupData()
                GetImporterCategoryCodes();
                PopulateOriginExporter();
                PopulateChargeType();
                PopulatePorts();
            }, 1);
        }

    }]);