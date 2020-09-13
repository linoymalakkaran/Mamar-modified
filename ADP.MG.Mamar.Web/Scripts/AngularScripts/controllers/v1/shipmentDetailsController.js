angular.module('mamarApp').controller('shipmentDetailsController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$filter', '$timeout', 'apiService', '$uibModal', 'sharedModels', 'userAccountStorageFactory', '$storage', 'paginationService',
        function ($scope, $rootScope, $state, $stateParams, $filter, $timeout, apiService, $uibModal, sharedModels, userAccountStorageFactory, $storage, paginationService) {

            $scope.$storage = $storage;
            // var initializing = true;
            $scope.selectedFreightCurrency = {};
            $scope.selectedFreightCurrency.originalObject = {};
            $scope.selectedFreightCurrency.originalObject.Rate = '';
            $scope.centerCodeShipment = $stateParams.centerCode;
            $scope.jobNoShipment = $stateParams.jobNumber;
            $scope.Receipts = [];
            $scope.IsValidBillType = true;
            $scope.IsValidCargoType = true;
            $scope.IsValidVoyageNumber = true;
            $scope.IsValidAirShippingOrigin = true;
            $scope.IsValidSeaShippingOrigin = true;
            $scope.IsValidETA = true;
            $scope.IsValidAirDONumber = true;
            $scope.IsValidSeaDONumber = true;
            $scope.IsValidAirDODate = true;
            $scope.IsValidSeaDODate = true;
            $scope.IsDisableConsignee = false;
            $scope.IsValidStorageType = true;
            $scope.IsValidAirDOExpiry = true;
            $scope.IsValidSeaDOExpiry = true;
            $scope.IsValidSeaVessel = true;
            $scope.IsValidAirVessel = true;
            $scope.IsValidKSACustomer = true;
            $scope.IsValidUnit = true;
            $scope.IsValidMasterAWB = true;
            $scope.IsInValidMasterAWB = false;
            $scope.IsValidMasterBL = true;
            $scope.IsValidHouseBL = true;
            $scope.IsValidHouseAWB = true;
            $scope.IsInValidHouseAWB = false;
            $scope.IsValidImporterExporter = true;
            $scope.IsValidManifestShipper = true;
            $scope.IsValidManifestConsignee = true;
            $scope.IsValidQuantity = true;
            $scope.IsValidNetWeight = true;
            $scope.IsValidGrossWeight = true;
            $scope.IsValidVolume = true;
            $scope.IsValidGoods = true;
            $scope.IsValidCargoAgent = true;
            $scope.IsValidNetnGrossWeight = true;
            $scope.InvalidImporterExporter = false;
            $scope.InvalidFreightCurrency = false;
            $scope.InvalidCarAgent = false;
            $scope.InvalidVessel = false;
            $scope.InvalidCargoAgent = false;
            $scope.InvalidKSACustomer = false;
            $scope.InvalidUnit = false;
            $scope.selectedLanguage = 'en';
            $scope.english = true;
            $scope.Valid = true;
            $scope.IsInValid = false;
            $scope.mode = 'View';
            $scope.NewJobNumber = '';
            $scope.VoyageArrivalTime = "00:00";
            $scope.isHumanCorps = false;
            $storage.set('isHumanCorps', $scope.isHumanCorps);
            $scope.move = function () {
                window.scrollBy(0, 200);
            }

            $scope.moveDO = function () {
                window.scrollBy(0, 250);
            }

            //To maintain the transport Mode on page reload
            try {
                if (sharedModels.transactionSearchModel) {
                    $scope.selectedMode = sharedModels.transactionSearchModel.TransportMode;
                    if (typeof (Storage) !== "undefined") {
                        localStorage.storedTransSearchModel = JSON.stringify(sharedModels.transactionSearchModel);
                    }
                }
                else {
                    $scope.selectedMode = JSON.parse(localStorage.storedTransSearchModel).TransportMode;
                }
            }
            catch (e) {

            }

            //Method to set/reset global disable flag
            function setGlobalDisableFlag() {
                if ($scope.DOBLDTO) {
                    $storage.set('voucherFlag', ($scope.DOBLDTO.VoucherFlag == 'Y' ? true : false));
                    $storage.set('globalDisableFlag', ($scope.DOBLDTO.OGAPresent > 0 ? true : false));

                    //if ($scope.DOBLDTO.OGAPresent == 10) {
                    //    $storage.set('preclearanceInProgress', true);
                    //}
                    //else
                    //    $storage.set('preclearanceInProgress', false);

                }
            }

            //For Private Company
            function setDefaultImporter() {
                //This code block is introduced to set the private company as default importer for a private company login : as per BA and QA team.
                if ($storage.get('isPrivateCompany') && $scope.impotersExporters) {

                    if ($scope.impotersExporters.length > 1) {//if more than 1 record , filter for company name
                        //var pCompany = ($scope.userAccntDetails && $scope.userAccntDetails.accounts) ? $scope.userAccntDetails.accounts[0].pCompany : '';
                        //$scope.loggedInUserImporter = $scope.impotersExporters.filter(obj => {
                        //    return obj.EnglishName.toString().toLowerCase().includes(pCompany.toLowerCase());
                        //});
                        var companyCode = ($scope.userAccntDetails && $scope.userAccntDetails.UCode) ? $scope.userAccntDetails.UCode.slice(1) : null;
                        $scope.loggedInUserImporter = $scope.impotersExporters.filter(obj => {
                            return obj.Code.toString().toLowerCase() == companyCode.toLowerCase();
                        });
                    }
                    else {
                        $scope.loggedInUserImporter = angular.copy($scope.impotersExporters);
                    }

                    if ($scope.loggedInUserImporter) {
                        $scope.DOBLDTO.Importer = $scope.loggedInUserImporter[0].Code ? $scope.loggedInUserImporter[0].Code + "  " : "";
                        $scope.DOBLDTO.Importer = $scope.DOBLDTO.Importer + ($scope.loggedInUserImporter[0].EnglishName ? $scope.loggedInUserImporter[0].EnglishName + "  " : "");
                        $scope.DOBLDTO.Importer = $scope.DOBLDTO.Importer + ($scope.loggedInUserImporter[0].ArabicName ? $scope.loggedInUserImporter[0].ArabicName : "");

                        $scope.selectedImporterExporterCode = {};
                        $scope.selectedImporterExporterCode.originalObject = {};
                        $scope.selectedImporterExporterCode.originalObject.Code = $scope.loggedInUserImporter[0].Code;
                        $scope.selectedImporterExporterCode.originalObject.EnglishName = $scope.loggedInUserImporter[0].EnglishName;
                        $scope.selectedImporterExporterCode.originalObject.ArabicName = $scope.loggedInUserImporter[0].ArabicName;
                        $scope.selectedImporterExporterCode.originalObject.CategoryCode = $scope.loggedInUserImporter[0].CategoryCode;
                    }
                }
            }

            $scope.ImporterExporterChanged = function (searchStr) {
                if (searchStr && searchStr.length >= 3) {
                    apiService.get('Customs/Lookup/ImporterExporter',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.impotersExporters = results.data.ResponseResult.Data;
                        setDefaultImporter();
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data of Importer Exporter!", response);
                    });
                }
            };
            //Private Company Default Values
            function getDefaultImporterForPrivateCompany() {
                var companyCode = ($scope.userAccntDetails && $scope.userAccntDetails.UCode) ? $scope.userAccntDetails.UCode.slice(1) : null;
                if (companyCode)
                    $scope.ImporterExporterChanged(companyCode);
            }

            //#region Get/Load method during page load.
            $scope.getShipmentDetails = function searchJobs() {
                $("#loadingScreen").show();
                apiService.get('Customs/DeliveryOrder',
                    {
                        centerCode: $stateParams.centerCode,
                        jobNumber: $stateParams.jobNumber
                    },
                    function (results) {
                        $("#loadingInvoiceScreen").hide();
                        $("#loadingScreen").hide();
                        //$("#loadingChargeScreen").hide();
                        $(".modal-backdrop").hide();

                        if (!apiService.isNullOrEmptyOrUndefined(results.data.ResponseResult.Data)) {
                            if (!apiService.isNullOrEmptyOrUndefined((results.data.ResponseResult.Data).DeliveryOrder)) {
                                $scope.DOBLDTO = (results.data.ResponseResult.Data).DeliveryOrder;
                            }
                            if (!apiService.isNullOrEmptyOrUndefined((results.data.ResponseResult.Data).Receipts)) {
                                $scope.Receipts = (results.data.ResponseResult.Data).Receipts;
                            }
                        }
                        if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO)) {
                            $scope.DOBLDTO.CargoTypeVal = '';
                            if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.DODate)) {
                                $scope.DODate = $filter('date')((new Date($scope.DOBLDTO.DODate)), "dd/MM/yyyy");
                            }


                            if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.DOExpiryDate)) {
                                $scope.DOExpiryDate = $filter('date')((new Date($scope.DOBLDTO.DOExpiryDate)), "dd/MM/yyyy");
                            }

                            if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.VoyageArrivalDate)) {
                                $scope.VoyageArrivalDate = $filter('date')((new Date($scope.DOBLDTO.VoyageArrivalDate)), "dd/MM/yyyy");
                                $scope.VoyageArrivalTime = $filter('date')((new Date($scope.DOBLDTO.VoyageArrivalDate)), "HH:mm");
                            }
                            else {
                                $scope.VoyageArrivalTime = "00:00";
                            }
                            $scope.etaTimeOnLoad = angular.copy($scope.VoyageArrivalTime);

                            if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.ExchangeRate)) {
                                $scope.selectedFreightCurrency.originalObject.Rate = $scope.DOBLDTO.ExchangeRate;
                            }
                            if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.GoodDesc) && ($scope.DOBLDTO.GoodDesc.trim() == '')) {
                                $scope.DOBLDTO.GoodDesc = '';
                            }

                            if ($scope.DOBLDTO.CustomerBillNumber == $stateParams.jobNumber) {
                                $scope.CustomerBillNumber = '';
                            }
                            else {
                                $storage.set('globalDisableFlag', true);
                                $scope.CustomerBillNumber = $scope.DOBLDTO.CustomerBillNumber;
                            }


                            // fixes - set default storage type as 'Stores'
                            $scope.DOBLDTO.StorageType = !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.StorageType) ? $scope.DOBLDTO.StorageType : "S";

                            setGlobalDisableFlag();//Moved the below logic to a function 
                            //Voucher flag will be true if it is pre cleared
                            //var voucherFlagShipmentDetails = ($scope.DOBLDTO.VoucherFlag && $scope.DOBLDTO.VoucherFlag == 'Y') ? true : false;
                            //$storage.set('voucherFlag', voucherFlagShipmentDetails);
                            //if (voucherFlagShipmentDetails) {
                            //    $timeout(function () {
                            //        $rootScope.$broadcast('voucherFlagChanged');
                            //    });
                            //}
                            //sharedModels.voucherFlag = ($scope.DOBLDTO.VoucherFlag && $scope.DOBLDTO.VoucherFlag == 'Y') ? true : false;

                            //$scope.$parent.GetActionStatus();
                            SetIsInvoiceFlag();
                            SetIsOrginFlag();
                            SetIsPackingFlag();
                            SetIsBillFlag();

                            GetCenterLookUpFormattedData();
                            GetBillLookUpFormattedData();
                            GetCargoTypeLookUpFormattedData();
                            GetVesselLookUpFormattedData();
                            GetPortLookUpFormattedData();
                            GetImporterLookUpFormattedData();
                            GetCarAgentLookUpFormattedData();
                            GetCargoAgentLookUpFormattedData();
                            GetClearingAgentLookUpFormattedData();
                            GetUnitLookUpFormattedData();
                            GetFreightCurrencyLookUpFormattedData();
                            GetKSACustomerLookUpFormattedData();
                            $("#loadingScreen").hide();

                            $scope.consigneeOnLoad = angular.copy($scope.DOBLDTO.Consignee);
                            $scope.shipperOnLoad = angular.copy($scope.DOBLDTO.Shipper);
                        }
                        else {
                            $("#loadingScreen").hide();
                        }

                        var Response = results.data.ResponseResult.Messages.split('|')[0] + '|' + results.data.ResponseResult.Messages.split('|')[1];
                        const msg = apiService.formatResponseMessageObject(Response);
                        GetWarningMessage(results.data.ResponseResult.Messages, results.data.ResponseResult.IsValid);
                        //results.data.ResponseResult.Messages
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        modalErrorShow("An Error has occurred while getting shipment details Data!");
                    }, true);
            }

            if ($scope.jobNoShipment == '') {
                $scope.mode = 'Edit';
                $scope.DOBLDTO =
               {
                   "CenterCode": "",
                   "CenterNameEng": "",
                   "CenterNameArb": "",
                   "BillTypeCode": "",
                   "BillTypeEngName": null,
                   "BillTypeArbName": null,
                   "DOClearingAgentCode": "",
                   "DOClearingAgentEngName": "",
                   "DOClearingAgentArbName": "",
                   "BHAgentCode": "",
                   "BHClearingAgentEngName": "",
                   "BHClearingAgentArbName": "",
                   "DOCargoAgentCode": "",
                   "DOCargoAgentEngName": "",
                   "DOCargoAgentArbName": "",
                   "DODate": "",
                   "DOExpiryDate": "",
                   "CargoAgent": "",
                   "CarAgentCode": "",
                   "CarAgentEngName": "",
                   "CarAgentArbName": "",
                   "ImporterEngName": "",
                   "ImporterArbName": "",
                   "ImporterCategoryCode": "",
                   "CurrencyCode": "",
                   "CurrencyEng": null,
                   "CurrencyArb": null,
                   "PortCode": "",
                   "PortNameEng": null,
                   "PortNameArb": null,
                   "HouseBLNumber": "",
                   "MasterBLNumber": "",
                   "KSAEngName": null,
                   "KSAArbName": null,
                   "VoyageNumber": "",
                   "VoyageArrivalDate": "",
                   "VesselCode": "",
                   "VesselNameEng": null,
                   "VesselNameArb": null,
                   "CargoTypeCode": "",
                   "CargoTypeEng": "",
                   "CargoTypeArb": "",
                   "ATACarnetFlag": "",
                   "InvoiceFlag": "",
                   "BillFlag": "",
                   "OrginFlag": "",
                   "PackingFlag": "",
                   "BHJobNumber": null,
                   "BHSharedVessel": null,
                   "UnitCode": "",
                   "UnitNameEng": null,
                   "UnitNameArb": null,
                   "CompanyCode": "",
                   "UserCode": "",
                   "JobNumber": null,
                   "StorageType": "S",
                   "ChannelResult": null,
                   "BH_GCC_EXIT_CENT": null,
                   "DOWarningMessage": null,
                   "DORemarks": "",
                   "BHCustBlType": "",
                   "CustomerBillNumber": null,
                   "Shipper": "",
                   "Consignee": "",
                   "NotifyParty": null,
                   "GoodDesc": "",
                   "ExchangeRate": null,
                   "MarksNo": null,
                   "BLRemarks": null,
                   "RocTrans": null,
                   "Status": null,
                   "OGA": null
               }
                $("#loadingScreen").hide();
                if ($scope.selectedMode == 'R') {
                    $scope.DOBLDTO.MasterBLNumber = 1;
                    $scope.DOBLDTO.HouseBLNumber = 1;

                    var sdate = new Date();
                    sdate.setDate(sdate.getDate() + 30);
                    $scope.DOBLDTO.DOExpiryDate = $filter('date')(sdate, "dd/MM/yyyy");
                    $scope.DOExpiryDate = $filter('date')(sdate, "dd/MM/yyyy");
                }

                $scope.selectedCargoAgent = {};
                $scope.selectedCargoAgent.originalObject = {};
                $scope.selectedCargoAgent.originalObject.Code = '';
                $scope.selectedCargoAgent.originalObject.NameEnglish = '';
                $scope.selectedCargoAgent.originalObject.NameArabic = '';
                //To set default importer for private company
                if ($storage.get('isPrivateCompany')) {
                    getDefaultImporterForPrivateCompany();
                }
            }
            else
                $scope.getShipmentDetails();
            //#endregion

            //Refresh the shipment details after preclearance which is being done from shipment main controller
            $scope.$on('RefreshShipmentDetails', function (event, args) {
                $scope.getShipmentDetails();
            });

            $scope.checkisNullOrEmptyOrUndefined = function (val) {
                if (apiService.isNullOrEmptyOrUndefined(val))
                    return true;
                else
                    return false;
            };

            $scope.SetInvoiceFlag = function () {
                if ($scope.DOBLDTO.IsInvoiceFlag)
                    $scope.DOBLDTO.InvoiceFlag = 'Y';
                else
                    $scope.DOBLDTO.InvoiceFlag = 'N';
            }

            $scope.SetBillFlag = function () {
                if ($scope.DOBLDTO.IsBillFlag)
                    $scope.DOBLDTO.BillFlag = 'Y';
                else
                    $scope.DOBLDTO.BillFlag = 'N';
            }

            $scope.SetPackingFlag = function () {
                if ($scope.DOBLDTO.IsPackingFlag)
                    $scope.DOBLDTO.PackingFlag = 'Y';
                else
                    $scope.DOBLDTO.PackingFlag = 'N';
            }

            $scope.SetOrginFlag = function () {
                if ($scope.DOBLDTO.IsOrginFlag)
                    $scope.DOBLDTO.OrginFlag = 'Y';
                else
                    $scope.DOBLDTO.OrginFlag = 'N';
            }

            $scope.SetATACarnetFlag = function () {
                if ($scope.DOBLDTO.IsATACarnetFlag)
                    $scope.DOBLDTO.ATACarnetFlag = 'Y';
                else
                    $scope.DOBLDTO.ATACarnetFlag = 'N';
            }


            function GetWarningMessage(data, isValid) {
                var information = data.split('|');
                let counter = 0;
                if (information.length > 2) {
                    $scope.Warning = [];
                    information[2].split('WarningMsgEng:')[1].split('#').filter(v => v != '').map((item) => {

                        let weather = {
                            ID: counter,
                            Warning: item
                        }
                        if (!apiService.isNullOrEmptyOrUndefined(weather.Warning)) {
                            $scope.Warning.push(Object.assign(weather));
                            counter++;
                        }
                    });
                }
                if ($scope.Warning && $scope.Warning.length > 0) {

                    if (!isValid) {//Cust Bill CR on 09 Feb 2020
                        var message = apiService.formatResponseMessageObject(data);
                        showErrorMessageWithAction((message['eng'] + message['arb']), ($scope.Warning[0].Warning == 'EXIT') ? true : false);
                        return;
                    }

                    //WarningModalOnFormM($scope.Warning);
                    $('#WarningModalOnForm2').modal('show');

                }
            }

            //#region functions              
            function SetIsInvoiceFlag() {
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.InvoiceFlag)) {
                    if ($scope.DOBLDTO.InvoiceFlag == 'Y') {
                        $scope.DOBLDTO.IsInvoiceFlag = true;
                    } else if ($scope.DOBLDTO.InvoiceFlag == 'N') {
                        $scope.DOBLDTO.IsInvoiceFlag = false;
                    }
                }
            }

            function SetIsOrginFlag() {
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.OrginFlag)) {
                    if ($scope.DOBLDTO.OrginFlag == 'Y') {
                        $scope.DOBLDTO.IsOrginFlag = true;
                    } else if ($scope.DOBLDTO.OrginFlag == 'N') {
                        $scope.DOBLDTO.IsOrginFlag = false;
                    }
                }
                else { }

            }

            function SetIsPackingFlag() {
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.PackingFlag)) {
                    if ($scope.DOBLDTO.PackingFlag == 'Y') {
                        $scope.DOBLDTO.IsPackingFlag = true;
                    } else if ($scope.DOBLDTO.PackingFlag == 'N') {
                        $scope.DOBLDTO.IsPackingFlag = false;
                    }
                }
            }

            function SetIsBillFlag() {
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.BillFlag)) {
                    if ($scope.DOBLDTO.BillFlag == 'Y') {
                        $scope.DOBLDTO.IsBillFlag = true;
                    } else if ($scope.DOBLDTO.BillFlag == 'N') {
                        $scope.DOBLDTO.IsBillFlag = false;
                    }
                }
            }

            function GetCenterLookUpFormattedData() {
                $scope.DOBLDTO.Center = $scope.DOBLDTO.CenterCode ? $scope.DOBLDTO.CenterCode + "     " : "";
                $scope.DOBLDTO.Center = $scope.DOBLDTO.Center + ($scope.DOBLDTO.CenterNameEng ? $scope.DOBLDTO.CenterNameEng + "     " : "");
                $scope.DOBLDTO.Center = $scope.DOBLDTO.Center + ($scope.DOBLDTO.CenterNameArb ? $scope.DOBLDTO.CenterNameArb : "");
            }

            function GetBillLookUpFormattedData() {
                $scope.DOBLDTO.Bill = $scope.DOBLDTO.BillTypeCode ? $scope.DOBLDTO.BillTypeCode + "     " : "";
                $scope.DOBLDTO.Bill = $scope.DOBLDTO.Bill + ($scope.DOBLDTO.BillTypeEngName ? $scope.DOBLDTO.BillTypeEngName + "     " : "");
                $scope.DOBLDTO.Bill = $scope.DOBLDTO.Bill + ($scope.DOBLDTO.BillTypeArbName ? $scope.DOBLDTO.BillTypeArbName : "");
                sharedModels.shipmentHeader.Bill = $scope.DOBLDTO.Bill;
            }

            function GetCargoTypeLookUpFormattedData() {
                //$scope.DOBLDTO.CargoType = $scope.DOBLDTO.CargoTypeCode ? $scope.DOBLDTO.CargoTypeCode + "     " : "";
                //$scope.DOBLDTO.CargoType = $scope.DOBLDTO.CargoType + ($scope.DOBLDTO.CargoTypeEng ? $scope.DOBLDTO.CargoTypeEng + "     " : "");
                //$scope.DOBLDTO.CargoType = $scope.DOBLDTO.CargoType + ($scope.DOBLDTO.CargoTypeArb ? $scope.DOBLDTO.CargoTypeArb : "");
                //The above code has been commented for the issue 
                //On shipment details the cargo type was showing free text.
                $scope.DOBLDTO.CargoTypeVal = $scope.DOBLDTO.CargoTypeCode;
            }

            function GetVesselLookUpFormattedData() {
                $scope.DOBLDTO.Vessel = $scope.DOBLDTO.VesselCode ? $scope.DOBLDTO.VesselCode + "     " : "";
                $scope.DOBLDTO.Vessel = $scope.DOBLDTO.Vessel + ($scope.DOBLDTO.VesselNameEng ? $scope.DOBLDTO.VesselNameEng + "     " : "");
                $scope.DOBLDTO.Vessel = $scope.DOBLDTO.Vessel + ($scope.DOBLDTO.VesselNameArb ? $scope.DOBLDTO.VesselNameArb : "");

                $scope.selectedVessel = {};
                $scope.selectedVessel.originalObject = {};
                $scope.selectedVessel.originalObject.Code = $scope.DOBLDTO.VesselCode;
                $scope.selectedVessel.originalObject.EnglishName = $scope.DOBLDTO.VesselNameEng;
                $scope.selectedVessel.originalObject.ArabicName = $scope.DOBLDTO.VesselNameArb;
            }

            function GetPortLookUpFormattedData() {
                $scope.DOBLDTO.Port = $scope.DOBLDTO.PortCode ? $scope.DOBLDTO.PortCode + "     " : "";
                $scope.DOBLDTO.Port = $scope.DOBLDTO.Port + ($scope.DOBLDTO.PortNameEng ? $scope.DOBLDTO.PortNameEng + "     " : "");
                $scope.DOBLDTO.Port = $scope.DOBLDTO.Port + ($scope.DOBLDTO.PortNameArb ? $scope.DOBLDTO.PortNameArb : "");

                $scope.selectedPort = {};
                $scope.selectedPort.originalObject = {};
                $scope.selectedPort.originalObject.Code = $scope.DOBLDTO.PortCode;
                $scope.selectedPort.originalObject.PortNameEnglish = $scope.DOBLDTO.PortNameEng;
                $scope.selectedPort.originalObject.PortNameArabic = $scope.DOBLDTO.PortNameArb;
            }

            function GetImporterLookUpFormattedData() {
                if ($storage.get('isPrivateCompany')) {
                    var companyCode = ($scope.userAccntDetails && $scope.userAccntDetails.UCode) ? $scope.userAccntDetails.UCode.slice(1) : null;
                    if (companyCode)
                        $scope.ImporterExporterChanged(companyCode);
                }
                else {
                    $scope.DOBLDTO.Importer = $scope.DOBLDTO.ImporterCode ? $scope.DOBLDTO.ImporterCode + "     " : "";
                    $scope.DOBLDTO.Importer = $scope.DOBLDTO.Importer + ($scope.DOBLDTO.ImporterEngName ? $scope.DOBLDTO.ImporterEngName + "     " : "");
                    $scope.DOBLDTO.Importer = $scope.DOBLDTO.Importer + ($scope.DOBLDTO.ImporterArbName ? $scope.DOBLDTO.ImporterArbName : "");

                    $scope.selectedImporterExporterCode = {};
                    $scope.selectedImporterExporterCode.originalObject = {};
                    $scope.selectedImporterExporterCode.originalObject.Code = $scope.DOBLDTO.ImporterCode;
                    $scope.selectedImporterExporterCode.originalObject.EnglishName = $scope.DOBLDTO.ImporterEngName;
                    $scope.selectedImporterExporterCode.originalObject.ArabicName = $scope.DOBLDTO.ImporterArbName;
                    $scope.selectedImporterExporterCode.originalObject.CategoryCode = $scope.DOBLDTO.ImporterCategoryCode;
                }
            }

            function GetCarAgentLookUpFormattedData() {
                $scope.DOBLDTO.CarAgent = $scope.DOBLDTO.CarAgentCode ? $scope.DOBLDTO.CarAgentCode + "     " : "";
                $scope.DOBLDTO.CarAgent = $scope.DOBLDTO.CarAgent + ($scope.DOBLDTO.CarAgentEngName ? $scope.DOBLDTO.CarAgentEngName + "     " : "");
                $scope.DOBLDTO.CarAgent = $scope.DOBLDTO.CarAgent + ($scope.DOBLDTO.CarAgentArbName ? $scope.DOBLDTO.CarAgentArbName : "");

                $scope.selectedCarAgent = {};
                $scope.selectedCarAgent.originalObject = {};
                $scope.selectedCarAgent.originalObject.Code = $scope.DOBLDTO.CarAgentCode;
                $scope.selectedCarAgent.originalObject.NameEnglish = $scope.DOBLDTO.CarAgentEngName;
                $scope.selectedCarAgent.originalObject.NameArabic = $scope.DOBLDTO.CarAgentArbName;
            }


            function GetCargoAgentLookUpFormattedData() {
                $scope.DOBLDTO.CargoAgent = $scope.DOBLDTO.DOCargoAgentCode ? $scope.DOBLDTO.DOCargoAgentCode + "     " : "";
                $scope.DOBLDTO.CargoAgent = $scope.DOBLDTO.CargoAgent + ($scope.DOBLDTO.DOCargoAgentEngName ? $scope.DOBLDTO.DOCargoAgentEngName + "     " : "");
                $scope.DOBLDTO.CargoAgent = $scope.DOBLDTO.CargoAgent + ($scope.DOBLDTO.DOCargoAgentArbName ? $scope.DOBLDTO.DOCargoAgentArbName : "");

                $scope.selectedCargoAgent = {};
                $scope.selectedCargoAgent.originalObject = {};
                $scope.selectedCargoAgent.originalObject.Code = $scope.DOBLDTO.DOCargoAgentCode;
                $scope.selectedCargoAgent.originalObject.NameEnglish = $scope.DOBLDTO.DOCargoAgentEngName;
                $scope.selectedCargoAgent.originalObject.NameArabic = $scope.DOBLDTO.DOCargoAgentArbName;
            }

            function GetClearingAgentLookUpFormattedData() {
                $scope.DOBLDTO.ClearingAgent = $scope.DOBLDTO.DOClearingAgentCode ? $scope.DOBLDTO.DOClearingAgentCode + "     " : "";
                $scope.DOBLDTO.ClearingAgent = $scope.DOBLDTO.ClearingAgent + ($scope.DOBLDTO.DOClearingAgentEngName ? $scope.DOBLDTO.DOClearingAgentEngName + "     " : "");
                $scope.DOBLDTO.ClearingAgent = $scope.DOBLDTO.ClearingAgent + ($scope.DOBLDTO.DOClearingAgentArbName ? $scope.DOBLDTO.DOClearingAgentArbName : "");

                //$scope.DOBLDTO.ClearingAgent = $scope.DOBLDTO.CargoAgent + ($scope.DOBLDTO.DOClearingAgentEngName ? $scope.DOBLDTO.DOClearingAgentEngName + "     " : "");
                //$scope.DOBLDTO.ClearingAgent = $scope.DOBLDTO.CargoAgent + ($scope.DOBLDTO.DOClearingAgentArbName ? $scope.DOBLDTO.DOClearingAgentArbName : "");

                $scope.selectedClearingAgent = {};
                $scope.selectedClearingAgent.originalObject = {};
                $scope.selectedClearingAgent.originalObject.Code = $scope.DOBLDTO.DOClearingAgentCode;
                $scope.selectedClearingAgent.originalObject.EnglishName = $scope.DOBLDTO.DOClearingAgentEngName;
                $scope.selectedClearingAgent.originalObject.ArabicName = $scope.DOBLDTO.DOClearingAgentArbName;
            }

            function GetUnitLookUpFormattedData() {
                $scope.DOBLDTO.Unit = $scope.DOBLDTO.UnitCode ? $scope.DOBLDTO.UnitCode + "     " : "";
                $scope.DOBLDTO.Unit = $scope.DOBLDTO.Unit + ($scope.DOBLDTO.UnitNameEng ? $scope.DOBLDTO.UnitNameEng + "     " : "");
                $scope.DOBLDTO.Unit = $scope.DOBLDTO.Unit + ($scope.DOBLDTO.UnitNameArb ? $scope.DOBLDTO.UnitNameArb : "");

                $scope.selectedUnit = {};
                $scope.selectedUnit.originalObject = {};
                $scope.selectedUnit.originalObject.Code = $scope.DOBLDTO.UnitCode;
                $scope.selectedUnit.originalObject.EnglishName = $scope.DOBLDTO.UnitNameEng;
                $scope.selectedUnit.originalObject.ArabicName = $scope.DOBLDTO.UnitNameArb;
            }

            function GetFreightCurrencyLookUpFormattedData() {
                $scope.DOBLDTO.FreightCurrency = $scope.DOBLDTO.CurrencyCode ? $scope.DOBLDTO.CurrencyCode + "     " : "";
                $scope.DOBLDTO.FreightCurrency = $scope.DOBLDTO.FreightCurrency + ($scope.DOBLDTO.CurrencyEng ? $scope.DOBLDTO.CurrencyEng + "     " : "");
                $scope.DOBLDTO.FreightCurrency = $scope.DOBLDTO.FreightCurrency + ($scope.DOBLDTO.CurrencyArb ? $scope.DOBLDTO.CurrencyArb : "");

                $scope.selectedFreightCurrency = {};
                $scope.selectedFreightCurrency.originalObject = {};
                $scope.selectedFreightCurrency.originalObject.Code = $scope.DOBLDTO.CurrencyCode;
                $scope.selectedFreightCurrency.originalObject.NameEnglish = $scope.DOBLDTO.CurrencyEng;
                $scope.selectedFreightCurrency.originalObject.NameArabic = $scope.DOBLDTO.CurrencyArb;
                $scope.selectedFreightCurrency.originalObject.Rate = $scope.DOBLDTO.ExchangeRate;
            }

            function GetKSACustomerLookUpFormattedData() {
                if ($scope.DOBLDTO.KSACode == 0) {
                    $scope.DOBLDTO.KSACustomer = '0';
                }
                if ($scope.DOBLDTO.KSACode !== 0) {
                    $scope.DOBLDTO.KSACustomer = $scope.DOBLDTO.KSACode ? $scope.DOBLDTO.KSACode + "     " : "";
                    $scope.DOBLDTO.KSACustomer = $scope.DOBLDTO.KSACustomer + ($scope.DOBLDTO.KSAEngName ? $scope.DOBLDTO.KSAEngName + "     " : "");
                    $scope.DOBLDTO.KSACustomer = $scope.DOBLDTO.KSACustomer + ($scope.DOBLDTO.KSAArbName ? $scope.DOBLDTO.KSAArbName : "");

                    $scope.selectedKSACustomer = {};
                    $scope.selectedKSACustomer.originalObject = {};
                    $scope.selectedKSACustomer.originalObject.Code = $scope.DOBLDTO.KSACode;
                    $scope.selectedKSACustomer.originalObject.EnglishName = $scope.DOBLDTO.KSAEngName;
                    $scope.selectedKSACustomer.originalObject.ArabicName = $scope.DOBLDTO.KSAArbName;
                    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedKSACustomer.originalObject.ArabicName)) {
                        $scope.IsDisableConsignee = true;
                    }
                }

            }
            //#End region 


            //#region Lookups
            function GetCargoTypes() {

                getIndexData('cargoTypes', '', function (data) {
                    $scope.cargoTypes = data;
                    if ($scope.DOBLDTO && !$scope.DOBLDTO.CargoTypeCode && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                        $timeout(function () {
                            $scope.DOBLDTO.CargoTypeVal = 'G';
                            $scope.DOBLDTO.CargoTypeCode = 'G';
                        });
                    }

                }, function () {
                    apiService.get('Customs/Lookup/CargoTypes',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.cargoTypes = results.data.ResponseResult.Data;
                        if ($scope.DOBLDTO && !$scope.DOBLDTO.CargoTypeCode && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                            $timeout(function () {
                                $scope.DOBLDTO.CargoTypeVal = 'G';
                                $scope.DOBLDTO.CargoTypeCode = 'G';
                            });
                        }
                    },
                    function error(response) {
                        //modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
                });
            }
            GetCargoTypes();

            function GetBillTypes() {
                getIndexData('billTypes', $stateParams.centerCode, function (data) {
                    $scope.billTypes = data;
                }, function () {
                    apiService.get('Customs/Lookup/BillTypes',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.billTypes = results.data.ResponseResult.Data;
                        storeData($scope.billTypes, 'billTypes', $stateParams.centerCode);
                    },
                function error(response) {
                    // modalErrorShow("An Error has occurred while getting lookup Data!");
                });
                });
            }
            GetBillTypes();
            //#endregion


            function GetStorageTypes() {
                getIndexData('storageTypes', '', function (data) {
                    $scope.storageTypes = data;
                }, function () {
                    apiService.get('Customs/Lookup/StorageType',
                     {
                         centerCode: $stateParams.centerCode,
                         searchString: ''
                     },
                     function (results) {
                         $scope.storageTypes = results.data.ResponseResult.Data;
                         storeData($scope.storageTypes, 'storageTypes', '');
                     },
                     function error(response) {
                         //modalErrorShow("An Error has occurred while getting lookup Data!");
                     }
                 )
                });
            }
            GetStorageTypes();
            //#endregion

            $scope.changeCargoType = function (val) {
                $scope.DOBLDTO.CargoTypeCode = val;
            };

            $scope.Copy = function () {
                if ($scope.DOBLDTO.BillTypeCode == 'I' || $scope.DOBLDTO.BillTypeCode == 'N') {
                    $scope.DOBLDTO.Consignee = $scope.selectedImporterExporterCode.originalObject.EnglishName;
                } else if ($scope.DOBLDTO.BillTypeCode == 'E' || $scope.DOBLDTO.BillTypeCode == 'R') {
                    $scope.DOBLDTO.Shipper = $scope.selectedImporterExporterCode.originalObject.EnglishName;
                }
            };

            //#region Car Agents Lookup
            function populateCarsAgent() {
                getIndexData('CarAgents', '', function (data) {
                    $scope.carAgentsFull = data;
                    $scope.carAgents = data;
                }, function () {
                    apiService.get('Customs/Lookup/CarAgents',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.carAgents = results.data.ResponseResult.Data;
                        $scope.carAgentsFull = results.data.ResponseResult.Data;
                        storeData($scope.carAgents, 'CarAgents', '');
                    },
                    function error(response) {
                        //modalErrorShow("An Error has occurred while getting lookup Data!");
                    });
                });
            }
            populateCarsAgent();
            //#endregion



            //#region Units Lookup

            function populateUnits() {
                getIndexData('Units', '', function (data) {
                    $scope.units = data;
                }, function () {
                    apiService.get('Customs/Lookup/Units',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.units = results.data.ResponseResult.Data;
                        storeData($scope.units, 'Units', '');
                    },
                    function error(response) {
                        //modalErrorShow("An Error has occurred while getting lookup Data!");
                    });
                });
            }
            populateUnits();
            //#endregion       

            //#region Currency Lookup
            $scope.FreightCurrencyChanged = function (searchStr) {
                $scope.DOBLDTO.FreightCurrency = searchStr;
                //if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.FreightCurrency)) {
                //    apiService.get('Customs/Lookup/Currencies',
                //    {
                //        centerCode: $stateParams.centerCode,
                //        searchString: $scope.DOBLDTO.FreightCurrency
                //    },
                //    function (results) {
                //        $scope.freightCurrencies = results.data.ResponseResult.Data;
                //    },
                //    function error(response) {
                //        //modalErrorShow("An Error has occurred while getting lookup Data!");
                //    });
                //}
            };



            function populateCurrencyDetail() {
                getIndexData('CurrencyModel', '', function (data) {
                    $scope.freightCurrencies = data;
                }, function () {
                    apiService.get('Customs/Lookup/Currencies',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.freightCurrencies = results.data.ResponseResult.Data;
                            storeData($scope.freightCurrencies, 'CurrencyModel', '');
                        },
                        function error(response) {
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });
            }
            populateCurrencyDetail();
            //#endregion

            //#Endregion

            //#region validation
            function validateShipmentForm() {

                if ($scope.jobNoShipment == '') {
                    if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.BillTypeCode)) {
                        $scope.IsValidBillType = false;
                        $scope.Valid = false;
                    } else
                        $scope.IsValidBillType = true;
                }

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.VoyageNumber)) {
                    $scope.IsValidVoyageNumber = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidVoyageNumber = true;

                var vesselSelected = $scope.selectedVessel ? $scope.selectedVessel.originalObject.Code + $scope.selectedVessel.originalObject.EnglishName + ($scope.selectedVessel.originalObject.ArabicName ? $scope.selectedVessel.originalObject.ArabicName : '') : '';
                if ((!$scope.DOBLDTO.Vessel) || ($scope.DOBLDTO.Vessel && (vesselSelected == 0 || ($scope.DOBLDTO.Vessel.replace(/\s/g, '') != vesselSelected.replace(/\s/g, ''))))) {
                    //if (($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                    //    $scope.IsValidAirVessel = false;
                    //    $scope.Valid = false;
                    //}
                    //else
                    if ((($scope.selectedMode == 'M' && $scope.DOBLDTO.Maqasa != 'Y') || ($scope.selectedMode == 'Z' && $scope.centerType == 'M'))) //For Maqasa ReExport, no need to validate vessel
                    {
                        $scope.IsValidSeaVessel = false;
                        $scope.Valid = false;
                    }

                }
                else {
                    $scope.IsValidAirVessel = true;
                    $scope.IsValidSeaVessel = true;
                }

                //Mandatory Validation is required for Airline Number for Air Mode and for freezone and centercode A
                if ((!$scope.DOBLDTO.Vessel) && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                    $scope.IsValidAirVessel = false;
                    $scope.Valid = false;
                }
                else {
                    $scope.IsValidAirVessel = true;
                }
                //if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Vessel) && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                //    $scope.IsValidAirVessel = false;
                //    $scope.Valid = false;
                //} else
                //    $scope.IsValidAirVessel = true;

                //if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Vessel) && ($scope.selectedMode == 'M' || ($scope.selectedMode == 'Z' && $scope.centerType == 'M'))) {
                //    $scope.IsValidSeaVessel = false;
                //    $scope.Valid = false;
                //} else
                //    $scope.IsValidSeaVessel = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.VoyageArrivalDate) && ($scope.selectedMode !== 'M')) {
                    $scope.IsValidETA = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidETA = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Port) && ($scope.selectedMode == 'M' || ($scope.selectedMode == 'Z' && $scope.centerType == 'M'))) {
                    $scope.IsValidSeaShippingOrigin = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidSeaShippingOrigin = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.PortCode) && ($scope.selectedMode == 'A' || $scope.selectedMode == 'R' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A') || ($scope.selectedMode == 'Z' && $scope.centerType == 'R'))) {
                    $scope.IsValidAirShippingOrigin = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidAirShippingOrigin = true;


                // || ($scope.selectedMode == 'Z' && $scope.centerType == 'A')
                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.DONumber) && ($scope.selectedMode == 'A' && $scope.selectedMode != 'Z')) {
                    $scope.IsValidAirDONumber = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidAirDONumber = true;

                //($scope.selectedMode == 'Z' &&
                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.DONumber) && ($scope.centerType == 'M' && $scope.selectedMode != 'Z')) {
                    $scope.IsValidSeaDONumber = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidSeaDONumber = true;

                // || ($scope.selectedMode == 'Z' && $scope.centerType == 'A')
                if (apiService.isNullOrEmptyOrUndefined($scope.DODate) && ($scope.selectedMode == 'A')) {
                    $scope.IsValidAirDODate = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidAirDODate = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DODate) && (($scope.selectedMode == 'Z' && $scope.centerType == 'M'))) {
                    $scope.IsValidSeaDODate = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidSeaDODate = true;

                //if (apiService.isNullOrEmptyOrUndefined($scope.DOExpiryDate) && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                //    $scope.IsValidAirDOExpiry = false;
                //    $scope.Valid = false;
                //} else
                //    $scope.IsValidAirDOExpiry = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOExpiryDate) && (($scope.selectedMode == 'Z' && $scope.centerType == 'M'))) {
                    $scope.IsValidSeaDOExpiry = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidSeaDOExpiry = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.StorageType) && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                    $scope.IsValidStorageType = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidStorageType = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Unit)) {
                    $scope.IsValidUnit = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidUnit = true;

                //Removed || ($scope.selectedMode == 'Z' && $scope.centerType !== 'A') in validating MasterBL; 
                //this has been removed as suggested by BA and QA team. This is part of fix TFS #33967 
                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.MasterBLNumber) && ($scope.selectedMode !== 'M') && ($scope.selectedMode !== 'A') && ($scope.selectedMode != 'Z')) {
                    $scope.IsValidMasterBL = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidMasterBL = true;

                //Commented mandatory validation for Airway Bill No in Mamar Ph2
                //if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.MasterBLNumber) && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                //    $scope.IsValidMasterAWB = false;
                //    $scope.Valid = false;
                //} else
                //    $scope.IsValidMasterAWB = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.HouseBLNumber) && ($scope.selectedMode !== 'A' || ($scope.selectedMode == 'Z' && $scope.centerType !== 'A'))) {
                    $scope.IsValidHouseBL = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidHouseBL = true;

                //Commented mandatory validation for House Airway Bill No in Mamar Ph2
                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.HouseBLNumber) && ($scope.selectedMode == 'A' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A'))) {
                    $scope.IsValidHouseAWB = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidHouseAWB = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CargoTypeVal) && apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CargoType)) {
                    $scope.IsValidCargoType = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidCargoType = true;

                if (($scope.jobNoShipment !== '' && !$scope.DOBLDTO.Consignee) || (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Consignee) && apiService.isNullOrEmptyOrUndefined($scope.selectedKSACustomer))) {
                    $scope.IsValidManifestConsignee = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidManifestConsignee = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Shipper)) {
                    $scope.IsValidManifestShipper = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidManifestShipper = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Importer)) {
                    $scope.IsValidImporterExporter = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidImporterExporter = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Quantity)) {
                    $scope.IsValidQuantity = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidQuantity = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.NetWeight)) {
                    $scope.IsValidNetWeight = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidNetWeight = true;


                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.GrossWeight)) {
                    $scope.IsValidGrossWeight = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidGrossWeight = true;

                //if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Volume)) {
                //    $scope.IsValidVolume = false;
                //    $scope.Valid = false;
                //} else
                //    $scope.IsValidVolume = true;

                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.GoodDesc)) {
                    $scope.IsValidGoods = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidGoods = true;


                if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CargoAgent) && ($scope.selectedMode != 'R')) {
                    $scope.IsValidCargoAgent = false;
                    $scope.Valid = false;
                } else
                    $scope.IsValidCargoAgent = true;

                var importerExporterSelected = $scope.selectedImporterExporterCode ? $scope.selectedImporterExporterCode.originalObject.Code + $scope.selectedImporterExporterCode.originalObject.EnglishName + $scope.selectedImporterExporterCode.originalObject.ArabicName : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Importer) && (importerExporterSelected == 0 || $scope.DOBLDTO.Importer.replace(/\s/g, '') != importerExporterSelected.replace(/\s/g, ''))) {
                    $scope.InvalidImporterExporter = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidImporterExporter = false;
                }

                var freightCurrencySelected = $scope.selectedFreightCurrency && $scope.selectedFreightCurrency.originalObject && $scope.selectedFreightCurrency.originalObject.Code ? $scope.selectedFreightCurrency.originalObject.Code + $scope.selectedFreightCurrency.originalObject.NameEnglish + $scope.selectedFreightCurrency.originalObject.NameArabic : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.FreightCurrency) && (freightCurrencySelected == 0 || ($scope.DOBLDTO.FreightCurrency.replace(/\s/g, '').replace(/\d*/g, '').replace(/\./g, '') != freightCurrencySelected.replace(/\s/g, '')))) {
                    $scope.InvalidFreightCurrency = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidFreightCurrency = false;
                }

                var carAgentSelected = $scope.selectedCarAgent && !apiService.isNullOrEmptyOrUndefined($scope.selectedCarAgent.originalObject.Code) ? $scope.selectedCarAgent.originalObject.Code + $scope.selectedCarAgent.originalObject.NameEnglish + $scope.selectedCarAgent.originalObject.NameArabic : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CarAgent) && (carAgentSelected == 0 || ($scope.DOBLDTO.CarAgent.replace(/\s/g, '') != carAgentSelected.replace(/\s/g, '')))) {
                    $scope.InvalidCarAgent = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidCarAgent = false;
                }

                var vesselSelected = $scope.selectedVessel ? $scope.selectedVessel.originalObject.Code + ($scope.selectedVessel.originalObject.EnglishName ? $scope.selectedVessel.originalObject.EnglishName : "") + ($scope.selectedVessel.originalObject.ArabicName ? $scope.selectedVessel.originalObject.ArabicName : "") : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Vessel) && (vesselSelected == 0 || ($scope.DOBLDTO.Vessel.replace(/\s/g, '') != vesselSelected.replace(/\s/g, '')))) {

                    if (!$scope.DOBLDTO.Vessel) {
                        $scope.InvalidVessel = true;
                        $scope.IsInValid = true;
                    }
                    else {
                        $scope.selectedVessel = {};
                        $scope.selectedVessel.originalObject = {};
                        $scope.selectedVessel.originalObject.Code = $scope.DOBLDTO.Vessel;
                    }
                }
                else {
                    $scope.InvalidVessel = false;
                }

                var cargoAgentSelected = $scope.selectedCargoAgent && !apiService.isNullOrEmptyOrUndefined($scope.selectedCargoAgent.originalObject.Code) ? $scope.selectedCargoAgent.originalObject.Code + $scope.selectedCargoAgent.originalObject.NameEnglish + $scope.selectedCargoAgent.originalObject.NameArabic : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CargoAgent) && (cargoAgentSelected == 0 || ($scope.DOBLDTO.CargoAgent.replace(/\s/g, '') != cargoAgentSelected.replace(/\s/g, '')))) {
                    $scope.InvalidCargoAgent = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidCargoAgent = false;
                }
                //Added Clearing Agent
                var clearingAgentSelected = $scope.selectedClearingAgent ? $scope.selectedClearingAgent.originalObject.Code + $scope.selectedClearingAgent.originalObject.EnglishName + $scope.selectedClearingAgent.originalObject.ArabicName : '';
                if ($scope.DOBLDTO.ClearingAgent && (clearingAgentSelected == 0 || ($scope.DOBLDTO.ClearingAgent.replace(/\s/g, '') != clearingAgentSelected.replace(/\s/g, '')))) {
                    $scope.InvalidClearingAgent = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidClearingAgent = false;
                }

                var KSACustomerSelected = $scope.selectedKSACustomer ? $scope.selectedKSACustomer.originalObject.Code + ($scope.selectedKSACustomer.originalObject.EnglishName ? $scope.selectedKSACustomer.originalObject.EnglishName : '') + $scope.selectedKSACustomer.originalObject.ArabicName : '';
                if ($scope.selectedKSACustomer && $scope.selectedKSACustomer.originalObject.Code != '0' && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.KSACustomer) && ($scope.DOBLDTO.KSACustomer !== '0') && (KSACustomerSelected == 0 || ($filter('uppercase')($scope.DOBLDTO.KSACustomer.replace(/\s/g, '')) != ($filter('uppercase')(KSACustomerSelected.replace(/\s/g, '')))))) {
                    $scope.InvalidKSACustomer = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidKSACustomer = false;
                }

                var UnitSelected = $scope.selectedUnit && !apiService.isNullOrEmptyOrUndefined($scope.selectedUnit.originalObject.Code) ? $scope.selectedUnit.originalObject.Code + $scope.selectedUnit.originalObject.EnglishName + $scope.selectedUnit.originalObject.ArabicName : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Unit) && (UnitSelected == 0 || ($scope.DOBLDTO.Unit.toLowerCase().replace(/\s/g, '') != UnitSelected.toLowerCase().replace(/\s/g, '')))) {
                    $scope.InvalidUnit = true;
                    $scope.IsInValid = true;
                }
                else {
                    $scope.InvalidUnit = false;
                }

                if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.GrossWeight) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.NetWeight)) {
                    $scope.IsValidNetnGrossWeight = (parseFloat($scope.DOBLDTO.GrossWeight) < parseFloat($scope.DOBLDTO.NetWeight)) ? false : true;
                    if (!$scope.IsValidNetnGrossWeight) {
                        $scope.IsInValid = true;
                    }
                }

                if ($scope.selectedMode == 'M') {
                    var shippingOriginDestinationSelected = $scope.selectedPort ? $scope.selectedPort.originalObject.Code + $scope.selectedPort.originalObject.PortNameEnglish + $scope.selectedPort.originalObject.PortNameArabic : '';
                    if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Port) && (shippingOriginDestinationSelected == 0 || ($scope.DOBLDTO.Port.replace(/\s/g, '') != shippingOriginDestinationSelected.replace(/\s/g, '')))) {
                        $scope.InvalidShippingOriginDestination = true;
                        $scope.IsInValid = true;
                    }
                    else {
                        $scope.InvalidShippingOriginDestination = false;
                    }
                }
            }
            //#end region 

            //#region Save/Update of BL/DO Information.
            $scope.saveDOBLInformation = function (callBackMethod, backGround, moveToInvoice, validateClicked) {
                debugger;
                // //This has been commented on 14/Jan/2019 as per Vini's suggestion to improve performance by removing auto save
                if (callBackMethod || moveToInvoice || validateClicked) {
                    if (($scope.etaTimeOnLoad != $("#etaTimeData").val()) || ($scope.consigneeOnLoad != $scope.DOBLDTO.Consignee) || ($scope.shipperOnLoad != $scope.DOBLDTO.Shipper)) {
                        $scope.shipmentDetails.$setDirty();
                    }
                    if ($scope.shipmentDetails.$dirty) {
                        var unsavedChangesMsg = $filter('translate')('UnSavedChangesMsg');
                        modalWarningConfirmShow(unsavedChangesMsg);
                        return;
                    }

                    if (validateClicked && !$scope.shipmentDetails.$dirty) {
                        $rootScope.$broadcast('validateClickedWithFormChange', {});
                        return;
                    }

                    if (callBackMethod)
                        callBackMethod();

                    if (moveToInvoice) {
                        $rootScope.$broadcast('invoiceTabClicked', { isSaveSuccess: true, moveToInvoice: moveToInvoice });
                        return;
                    }
                }
                else {
                    $scope.IsInValid = false;
                    if ($storage.get('globalDisableFlag') || $storage.get('voucherFlag')) {
                        $timeout(function () {
                            $rootScope.$broadcast('shipmentSaved', { isSaveSuccess: true, moveToInvoice: moveToInvoice });
                        });
                        if (callBackMethod) {
                            callBackMethod();
                        }
                    }
                    else {
                        $("#loadingScreen").show();
                        validateShipmentForm();
                        if (!$scope.Valid) {
                            $scope.Valid = true;
                            $("#loadingScreen").hide();
                            modalErrorShow('Please enter the required fields');
                            return false;
                        }

                        if ($scope.IsInValid) {
                            // $scope.IsInValid = false;
                            $("#loadingScreen").hide();
                            modalErrorShow('Please enter the Valid Value');
                            return false;
                        }

                        //if ($scope.IsInValidMasterAWB && $scope.IsInValidHouseAWB) {
                        //    //$scope.IsInValid = false;
                        //    //$("#loadingScreen").hide();
                        //    //modalErrorShow('Please enter the Valid AWB');
                        //   // return false;
                        //}

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCenterCode)) {
                            $scope.DOBLDTO.CenterCode = $scope.selectedCenterCode.originalObject.Code;
                            // sharedModels.shipmentHeader.selectedCenter = $scope.selectedCenter;
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedKSACustomer) && ($scope.DOBLDTO.KSACustomer !== '0')) {
                            if ($scope.selectedKSACustomer.originalObject.ArabicName) {
                                $scope.DOBLDTO.Consignee = $scope.selectedKSACustomer.originalObject.ArabicName;
                            }
                        }

                        if ($scope.jobNoShipment == '') {
                            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCenterVal)) {
                                $scope.DOBLDTO.CenterCode = $scope.selectedCenterVal[0].Code;
                            }
                            $scope.DOBLDTO.BillType = $scope.DOBLDTO.BillTypeCode;

                        }
                        if (!apiService.isNullOrEmptyOrUndefined($scope.DODate)) {
                            $scope.DOBLDTO.DODate = $filter('date')(new Date(apiService.formatDateObject($scope.DODate)), "MM/dd/yyyy");
                        }
                        if (!apiService.isNullOrEmptyOrUndefined($scope.DOExpiryDate)) {
                            $scope.DOBLDTO.DOExpiryDate = $filter('date')(new Date(apiService.formatDateObject($scope.DOExpiryDate)), "MM/dd/yyyy");
                        }
                        else {
                            $scope.DOBLDTO.DOExpiryDate = null;
                        }
                        if (!apiService.isNullOrEmptyOrUndefined($scope.VoyageArrivalDate)) {
                            $scope.DOBLDTO.VoyageArrivalDate = $filter('date')(new Date(apiService.formatDateTimeObject($scope.VoyageArrivalDate + " " + $("#etaTimeData").val())), "MM/dd/yyyy HH:mm");
                            //sharedModels.shipmentHeader.ArrivalDate = $scope.DOBLDTO.VoyageArrivalDate;
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedImporterExporterCode) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Importer)) {
                            $scope.DOBLDTO.ImporterCode = $scope.selectedImporterExporterCode.originalObject.Code;
                        }
                        else if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Importer)) {
                            $scope.DOBLDTO.ImporterCode = "";
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCarAgent) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CarAgent)) {
                            $scope.DOBLDTO.CarAgentCode = $scope.selectedCarAgent.originalObject.Code;
                        }
                        else if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CarAgent)) {
                            $scope.DOBLDTO.CarAgentCode = "";
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCargoAgent) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CargoAgent)) {
                            $scope.DOBLDTO.DOCargoAgentCode = $scope.selectedCargoAgent.originalObject.Code;
                        }
                        else if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.CargoAgent)) {
                            $scope.DOBLDTO.DOCargoAgentCode = "";
                        }

                        $scope.DOBLDTO.DOClearingAgentCode = ($scope.selectedClearingAgent && $scope.selectedClearingAgent.originalObject) ? $scope.selectedClearingAgent.originalObject.Code : '';
                        $scope.DOBLDTO.DOClearingAgentEngName = ($scope.selectedClearingAgent && $scope.selectedClearingAgent.originalObject) ? $scope.selectedClearingAgent.originalObject.EnglishName : '';
                        $scope.DOBLDTO.DOClearingAgentArbName = ($scope.selectedClearingAgent && $scope.selectedClearingAgent.originalObject) ? $scope.selectedClearingAgent.originalObject.ArabicName : '';

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedUnit) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Unit)) {
                            $scope.DOBLDTO.UnitCode = $scope.selectedUnit.originalObject.Code;
                        }
                        else if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.Unit)) {
                            $scope.DOBLDTO.UnitCode = "";
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedPort) && !($scope.selectedMode == 'A' || $scope.selectedMode == 'R' || ($scope.selectedMode == 'Z' && $scope.centerType == 'A') || ($scope.selectedMode == 'Z' && $scope.centerType == 'R'))) {
                            $scope.DOBLDTO.PortCode = $scope.selectedPort.originalObject.Code;
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedVessel)) {
                            $scope.DOBLDTO.VesselCode = $scope.selectedVessel.originalObject.Code;
                        }

                        if (!apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.KSACustomer) && ($scope.DOBLDTO.KSACustomer == '0')) {
                            $scope.DOBLDTO.KSACode = "0";
                        }
                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedKSACustomer) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.KSACustomer) && ($scope.DOBLDTO.KSACustomer !== '0')) {
                            $scope.DOBLDTO.KSACode = $scope.selectedKSACustomer.originalObject.Code;
                        }
                        else if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.KSACustomer)) {
                            $scope.DOBLDTO.KSACode = "";
                        }


                        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedFreightCurrency.originalObject.Code) && !apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.FreightCurrency)) {
                            $scope.DOBLDTO.CurrencyCode = $scope.selectedFreightCurrency.originalObject.Code;
                            $scope.DOBLDTO.ExchangeRate = $scope.selectedFreightCurrency.originalObject.Rate;
                        }
                        else if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.FreightCurrency)) {
                            $scope.DOBLDTO.CurrencyCode = "";
                            $scope.DOBLDTO.ExchangeRate = "";
                        }

                        if (apiService.isNullOrEmptyOrUndefined($scope.DOBLDTO.VesselCode) && ($scope.selectedMode == 'R' || ($scope.selectedMode == 'Z' && $scope.centerType == 'R'))) {
                            $scope.DOBLDTO.VesselCode = 'TRUCK';
                        }

                        $scope.DOBLDTO.OldJobNumber = null;//New field added; but this has been added in Cust Bill Section
                        $scope.DOBLDTO.FanrReferenceNumber = null;//New field added for FanrReferenceNumber; but this has been added in Cust Bill Section
                        $scope.DOBLDTO.TempImportJob = null;    // New field added for Ref. Job, but this has been added in Cust Bill section


                        apiService.post('Customs/DeliveryOrder/UpdateDOBLInformation', '', $scope.DOBLDTO,
                            function (result) {

                                var data = result.data.ResponseResult;
                                console.log(data.Data);

                                if (data.Data.JobNumber) {
                                    $scope.NewJobNumber = data.Data.JobNumber;
                                    $scope.DOBLDTO.JobNumber = data.Data.JobNumber;
                                }

                                var Response = data.Messages.split('|')[0] + '|' + data.Messages.split('|')[1];
                                const msg = apiService.formatResponseMessageObject(Response);
                                //var msg = apiService.formatResponseMessage(data.Messages);
                                if (data) {
                                    if (data.IsValid) {
                                        $("#loadingScreen").hide();
                                        if ($scope.shipmentDetails) {
                                            $scope.shipmentDetails.$setPristine();
                                            $scope.consigneeOnLoad = angular.copy($scope.DOBLDTO.Consignee);
                                            $scope.shipperOnLoad = angular.copy($scope.DOBLDTO.Shipper);
                                            $scope.etaTimeOnLoad = angular.copy($("#etaTimeData").val());
                                        }

                                        if (!backGround) {
                                            $timeout(function () {
                                                $rootScope.$broadcast('shipmentSaved', { isSaveSuccess: true, moveToInvoice: false });
                                            });
                                            $('#saveSuccessModal').modal('show');
                                            $('#CloseSuccessModal').on('click', function () {
                                                if ($scope.jobNoShipment == '') {
                                                    $("#btnsave").hide();
                                                }
                                                else
                                                    $("#btnsave").show();

                                                if ($scope.NewJobNumber) {
                                                    $state.go('shipmentAndInvoice', { 'centerCode': $scope.centerCodeShipment, 'jobNumber': $scope.NewJobNumber, 'tab': 'shipmentdetails' });
                                                }

                                            });
                                            //return;
                                        }
                                        else if (callBackMethod) {
                                            $timeout(function () {
                                                $rootScope.$broadcast('shipmentSaved', { isSaveSuccess: true, moveToInvoice: false });
                                            });
                                            callBackMethod();
                                        }
                                        else {
                                            // For invoice tab
                                            $timeout(function () {
                                                $rootScope.$broadcast('shipmentSaved', { isSaveSuccess: true, moveToInvoice: true });
                                            });
                                        }
                                    }
                                    else if (!data.IsValid) {
                                        $("#loadingScreen").hide();
                                        $timeout(function () {
                                            $rootScope.$broadcast('shipmentSaved', { isSaveSuccess: false, moveToInvoice: false });
                                        });
                                        if (msg) {
                                            if ($scope.language == 'en') {//$scope.language
                                                modalErrorShow(msg['eng']);
                                                //showErrorMessage(msg['eng']);
                                            }
                                            else {
                                                modalErrorShow(msg['arb']);
                                                //showErrorMessage(msg['arb']);
                                            }
                                        }
                                        //modalErrorShow(msg);
                                        //return;
                                    }

                                    GetWarningMessage(data.Messages, data.IsValid);
                                }

                            },

                            function (result) {
                                $("#loadingScreen").hide();
                                modalErrorShow("An Error has occurred while updating shipment Data!");
                            });
                    }
                }
            }
            //#endregion

            //Popup Section
            $scope.openAtaCarnet = function () {
                console.log('opening pop up');
                var modalInstance = $uibModal.open({
                    templateUrl: '../tpl/ataCarnetDetails.html',
                    windowClass: 'angularModalWindowLong', //modal open size large
                    //backdrop: 'static',
                    //keyboard: false,
                    controller: 'ataCarnetController',
                    resolve: {
                        parameters:
                            function () {
                                return { jobNumber: $stateParams.jobNumber, centerCode: $stateParams.centerCode };
                            }
                    }
                });
            }

            $scope.openadditionalDescription = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: '../tpl/additionalDescription.html',
                    size: 'lg', //modal open size large
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'additionalDescriptionController',
                    resolve: {
                        parameters:
                           function () {
                               return { jobNumber: $stateParams.jobNumber, centerCode: $stateParams.centerCode };
                           }
                    }
                });
            }

            $scope.DownloadReport = function () {
                var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
                var targetaddrss = 'DocumentUpload/reportData?DocId=0ce954a0-7c52-4899-8c06-fc22f0aa707b';
                document.location.href = "../Home/DownloadApprovalReport?targetUrl=" + targetaddrss + "&UCode=" + userAccntInfo.UCode + "&CCode=" + userAccntInfo.CCode + "&ReportParameter=" + $stateParams.centerCode + ";" + $stateParams.jobNumber;
            };

            // GET CONTAINERS
            $scope.getContainers = function () {
                $state.go('containers', { centerCode: $stateParams.centerCode, jobNumber: $stateParams.jobNumber },
                    { notify: true });
            }

            $scope.getTruckDetails = function () {
                $state.go('vehicleList', { centerCode: $scope.centerCodeShipment, jobNumber: $scope.jobNoShipment, BillType: $scope.DOBLDTO.BillTypeCode, fromMenu: 'N', Status: $stateParams.Status },
                    { notify: true });
            }

            $scope.getChasisList = function () {
                $state.go('chassisList', { centerCode: $scope.centerCodeShipment, jobNumber: $scope.jobNoShipment, BillType: $scope.DOBLDTO.BillTypeCode, ImporterExporterCode: $scope.selectedImporterExporterCode.originalObject.CategoryCode },
                 { notify: true });
            }

            $scope.$on('changeLanguage', function (event, args) {
                $scope.english = args.language == 'en' ? true : false;
            });

            $scope.openEExemption = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: '../tpl/eExemptions.html',
                    size: 'lg', //modal open size large
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'eExemptionsController',
                    resolve: {
                        parameters:
                           function () {
                               return { jobNumber: $stateParams.jobNumber, centerCode: $stateParams.centerCode, };
                           }
                    }
                });
            }
            //
            $scope.validateMasterAWB = function () {
                if ($scope.DOBLDTO.MasterBLNumber) {
                    if ($scope.selectedImporterExporterCode && $scope.DOBLDTO.BillTypeCode && $scope.DOBLDTO.VoyageNumber) {
                        apiService.get('Customs/DeliveryOrder/ValidateAWBNumber',
                             {
                                 centerCode: $stateParams.centerCode,
                                 jobNumber: $stateParams.jobNumber,
                                 houseBlNumber: $scope.DOBLDTO.HouseBLNumber,
                                 importerCode: $scope.selectedImporterExporterCode.originalObject.CategoryCode,
                                 masterBlNumber: $scope.DOBLDTO.MasterBLNumber,
                                 billType: $scope.DOBLDTO.BillTypeCode,
                                 voyageNumber: $scope.DOBLDTO.VoyageNumber
                             },
                               function (result) {
                                   debugger;
                                   var data = result.data.ResponseResult;
                                   var msg = '';
                                   if (data.Messages) {
                                       //msg = apiService.formatResponseMessage(data.Messages);
                                       var Response = data.Messages.split('|')[0] + '|' + data.Messages.split('|')[1];
                                       msg = apiService.formatResponseMessageObject(Response);
                                       GetWarningMessage(data.Messages, data.IsValid);
                                   }

                                   if (data) {
                                       if (data.IsValid) {
                                           $scope.IsInValidMasterAWB = false;
                                           $("#loadingScreen").hide();
                                           $scope.MasterAWBMESSAGE = (msg && msg.arb && msg.eng) ? msg : '';
                                           //if (!apiService.isNullOrEmptyOrUndefined(msg)) {
                                           //    modalSuccessShow(msg);
                                           //}
                                           //return;
                                       }
                                       else if (!data.IsValid) {
                                           $scope.IsInValidMasterAWB = true;
                                           $("#loadingScreen").hide();
                                           $scope.MasterAWBMESSAGE = (msg && msg.arb && msg.eng) ? msg : '';
                                           //if (!apiService.isNullOrEmptyOrUndefined(msg)) {
                                           //    modalErrorShow(msg);
                                           //}
                                           //return;
                                       }
                                   }
                                   else {
                                       $scope.IsInValidMasterAWB = true;
                                       $("#loadingScreen").hide();
                                   }
                                   if ($scope.IsInValidHouseAWB) {
                                       $scope.validateHouseAWB();
                                   }

                               },

                        function (result) {
                            $scope.IsInValidMasterAWB = true;
                            $("#loadingScreen").hide();
                            modalErrorShow("An Error has occurred while validating Master AWB!");
                        });
                    }
                    else {
                        $scope.DOBLDTO.MasterBLNumber = '';
                        $("#loadingScreen").hide();
                        modalErrorShow("Please enter BillType,Importer/Exporter and Flight Number value to Proceed!");
                    }
                }

            };

            $scope.validateHouseAWB = function () {
                debugger;
                if ($scope.DOBLDTO.HouseBLNumber) {
                    if ($scope.selectedImporterExporterCode && $scope.DOBLDTO.BillTypeCode && $scope.DOBLDTO.VoyageNumber) {
                        apiService.get('Customs/DeliveryOrder/ValidateAWBNumber',
                             {
                                 centerCode: $stateParams.centerCode,
                                 jobNumber: $stateParams.jobNumber,
                                 houseBlNumber: $scope.DOBLDTO.HouseBLNumber,
                                 importerCode: $scope.selectedImporterExporterCode.originalObject.CategoryCode,
                                 masterBlNumber: $scope.DOBLDTO.MasterBLNumber,
                                 billType: $scope.DOBLDTO.BillTypeCode,
                                 voyageNumber: $scope.DOBLDTO.VoyageNumber
                             },
                               function (result) {
                                   debugger;
                                   var data = result.data.ResponseResult;
                                   var msg = '';
                                   if (data.Messages) {
                                       var Response = data.Messages.split('|')[0] + '|' + data.Messages.split('|')[1];
                                       msg = apiService.formatResponseMessageObject(Response);
                                       GetWarningMessage(data.Messages, data.IsValid);
                                       // msg = apiService.formatResponseMessage(data.Messages);
                                   }

                                   if (data) {
                                       if (data.IsValid) {
                                           $scope.IsInValidHouseAWB = false;
                                           $("#loadingScreen").hide();
                                           $scope.HouseAWBMESSAGE = (msg && msg.arb && msg.eng) ? msg : '';;
                                           //if (!apiService.isNullOrEmptyOrUndefined(msg)) {
                                           //    modalSuccessShow(msg);
                                           //}
                                           //return;
                                       }
                                       else if (!data.IsValid) {
                                           $scope.IsInValidHouseAWB = true;
                                           $("#loadingScreen").hide();
                                           $scope.HouseAWBMESSAGE = (msg && msg.arb && msg.eng) ? msg : '';;
                                           //if (!apiService.isNullOrEmptyOrUndefined(msg)) {
                                           //    modalErrorShow(msg);
                                           //}
                                           //return;
                                       }
                                   } else {
                                       $scope.IsInValidHouseAWB = true;
                                       $("#loadingScreen").hide();
                                   }

                               },

                        function (result) {
                            $scope.IsInValidHouseAWB = true;
                            $("#loadingScreen").hide();
                            modalErrorShow("An Error has occurred while validating Master AWB!");
                        });
                    }

                    else {
                        $scope.DOBLDTO.MasterBLNumber = '';
                        $("#loadingScreen").hide();
                        modalErrorShow("Please enter BillType,Importer/Exporter and Flight Number value to Proceed!");
                    }
                }
            };


            $scope.GetAttachmentCount = () => {
                apiService.get('Customs/BillOfLading/AttachmentCount',
                    {
                        centerCode: $stateParams.centerCode,
                        jobNumber: $stateParams.jobNumber
                    },
                     function (results) {
                         var attachMentData = results.data.ResponseResult.Data;
                         if (attachMentData) {
                             $scope.AttachmentCount = attachMentData.AttachmentCount;
                         }
                     },
                function error(response) {
                    modalErrorShow("An Error has occurred while getting Data!");
                });
            }
            $scope.GetAttachmentCount();

            $scope.openAttachments = function () {
                $('#attachmentModal').modal('show');
            }

            $scope.openAttachmentUri = function (isAdd) {
                apiService.get('Customs/DeliveryOrder/DirectAttachmentToken',
                 {
                     centerCode: $stateParams.centerCode,
                     jobNumber: $stateParams.jobNumber,
                     attachmentFlag: isAdd ? 'Add' : 'VIEWONLY'
                 },
                  function (results) {
                      var data = results.data.ResponseResult.Data;
                      var uri = "https://archive.dof.ae/Mamar/DofDocServlet.dof?accept_ut=true&ut=" + data;
                      window.open(uri, 'newwindow', 'width=1200,height=650'); return false;
                  },
              function error(response) {
                  modalErrorShow("An Error has occurred while getting Data!");
              });

            }

            $scope.$on('refreshAfterSendPreclear', function (event) {
                $scope.getShipmentDetails();
            });

            //#region Center Codes Lookup      
            $scope.getCenterCodes = () => {
                apiService.get('Customs/Lookup/CenterCodes',
                {
                    transportMode: $scope.selectedMode,
                    searchString: ''
                },
                function (results) {
                    $scope.centerCodes = results.data.ResponseResult.Data;
                    if ($scope.centerCodes) {
                        $scope.selectedCenterVal = $filter('filter')($scope.centerCodes, {
                            Code: $stateParams.centerCode
                        });
                        if ($scope.selectedCenterVal && $scope.selectedCenterVal.length <= 0) {
                            $scope.selectedCenterVal = ($scope.centerCodes && $scope.centerCodes.length > 0) ? $scope.centerCodes[0] : null;
                            $scope.selectedCenter = $scope.selectedCenterVal.Code ? $scope.selectedCenterVal.Code + "     " : "";
                            $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal.EnglishName ? $scope.selectedCenterVal.EnglishName + "     " : "");
                            $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal.ArabicName ? $scope.selectedCenterVal.ArabicName : "");
                            $scope.centerType = $scope.selectedCenterVal.CenterType;
                            sharedModels.shipmentHeader.selectedCenter = $scope.selectedCenter;
                        }
                        else {
                            $scope.selectedCenter = $scope.selectedCenterVal[0].Code ? $scope.selectedCenterVal[0].Code + "     " : "";
                            $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].EnglishName ? $scope.selectedCenterVal[0].EnglishName + "     " : "");
                            $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].ArabicName ? $scope.selectedCenterVal[0].ArabicName : "");
                            $scope.centerType = $scope.selectedCenterVal[0].CenterType;
                            sharedModels.shipmentHeader.selectedCenter = $scope.selectedCenter;
                        }
                    }
                },
                function error(response) {
                    //modalErrorShow("An Error has occurred while getting lookup Data!");
                }
              );
            }
            ///Logic added for populating center codes from server if localstorage center code is empty
            ///else populate from local storage which is being stored in transaction list screen 
            ///This logic has been implemented as part of performance fine tuning actvity on 18/Apr/2019
            var storedCenterCodes = $storage.get('storedCenterCodes');
            if (storedCenterCodes) {
                $scope.centerCodes = storedCenterCodes;
                if ($scope.centerCodes) {
                    $scope.selectedCenterVal = $filter('filter')($scope.centerCodes, {
                        Code: $stateParams.centerCode
                    });
                    $scope.selectedCenter = $scope.selectedCenterVal[0].Code ? $scope.selectedCenterVal[0].Code + "     " : "";
                    $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].EnglishName ? $scope.selectedCenterVal[0].EnglishName + "     " : "");
                    $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].ArabicName ? $scope.selectedCenterVal[0].ArabicName : "");
                    $scope.centerType = $scope.selectedCenterVal[0].CenterType;
                    sharedModels.shipmentHeader.selectedCenter = $scope.selectedCenter;
                }
            }
            else {
                $scope.getCenterCodes();
            }

            //This has been commented on 14/Jan/2019 as per Vini's suggestion to improve performance by removing auto save
            $scope.$on('ShouldSaveShipment', function (event, args) {
                var isSaved = $scope.saveDOBLInformation(null, true, args.moveToInvoice, args.validateClicked);
                //$rootScope.$broadcast('shipmentSaved', { isSaveSuccess: isSaved, moveToInvoice: args.moveToInvoice });
            });

            $scope.searchCargoAgentText = '';

            $scope.cargoAgentKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openCargoAgentLookup();
                }
            }

            $scope.PopulateCargoAgents = function () {
                getIndexData('CargoAgents', '', function (data) {
                    $scope.cargoAgentsFull = data;
                    $scope.cargoAgents = data;
                }, function () {
                    apiService.get('Customs/Lookup/CargoAgents',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.cargoAgentsFull = results.data.ResponseResult.Data;
                        $scope.cargoAgents = angular.copy($scope.cargoAgentsFull);
                        storeData(results.data.ResponseResult.Data, 'CargoAgents', '');
                    },
                    function error(response) {
                    });
                });
            }


            $scope.openCargoAgentLookup = function (item) {
                $scope.searchCargoAgentText = '';
                $('#cargoAgentLookup').modal({
                    backdrop: "static"
                });
                $('#searchCargoAgentText').focus();
                $('#searchCargoAgentText').select();
                $scope.onCargoAgentChange($scope.searchCargoAgentText);
                $("#cargoAgentLookup").off("keydown");
                $('#cargoAgentLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndex < $scope.cargoAgents.length - 1) {
                                    $scope.rowIndex++;
                                    if ($scope.rowIndex > 10 * $scope.cargoAgents - 1) {
                                        $scope.lookUpCurrentPage++;
                                    }
                                    $scope.cargoAgentItemSelected = $scope.cargoAgents[$scope.rowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndex > 0) {

                                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                                        $scope.lookUpCurrentPage--;
                                    }
                                    $scope.rowIndex--;
                                    $scope.cargoAgentItemSelected = $scope.cargoAgents[$scope.rowIndex];
                                }
                                break;
                            case 13:
                                $scope.setCargoAgent($scope.cargoAgentItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onCargoAgentChange = function (searchStr) {
                $scope.rowIndex = 0;
                $scope.lookUpCurrentPage = 1;
                if ($scope.cargoAgentsFull) {
                    $scope.cargoAgents = $scope.cargoAgentsFull.filter(obj => {
                        return obj.Code.toString().toLowerCase().includes($scope.searchCargoAgentText.toLowerCase()) || (obj.NameEnglish && obj.NameEnglish.toLowerCase().includes($scope.searchCargoAgentText.toLowerCase()))
                            || (obj.NameArabic && obj.NameArabic.toLowerCase().includes($scope.searchCargoAgentText.toLowerCase()));
                    });
                }
            }

            $scope.setCargoAgent = function (row) {
                $scope.DOBLDTO.CargoAgent = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                $scope.selectedCargoAgent = {};
                $scope.selectedCargoAgent.originalObject = row;
                $("#cargoAgentLookup").modal("hide");
                $('#EnglishCargoAgents_value').focus();
                $scope.shipmentDetails.$setDirty();
            }

            $scope.PopulateCargoAgents();

            $scope.$watchCollection("searchCargoAgentText", function () {
                if ($scope.searchCargoAgentText)
                    $scope.onCargoAgentChange($scope.searchCargoAgentText);
            });
            $scope.openVoyageArrivalDate = function () {
                $timeout(function () {
                    $("#VoyageArrivalDateCtrl").trigger('click');
                });
            }

            $scope.openDOExpiryDate = function () {
                $timeout(function () {
                    $("#DOExpiryDateCtrl").trigger('click');
                });
            }
            //Lookup Enhancements :Mamar Phase 2
            //Importer/Exporter
            //--------------------
            function initializeSearchParameters() {
                $scope.searchParameter = {
                    telephone: '',
                    mobile: '',
                    fileNumber: '',
                    cityCode: '',
                    addcCode: '',
                    municipCode: '',
                    poBox: '',
                    categoryCode: '',
                    importerCode: '',
                    importername: '',
                    uaeId: '',
                    pageSize: 10,
                    orderBy: '',
                    pageNumber: 1,
                    centerCode: $stateParams.centerCode
                };
            }
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.PopulateImporterExporters();
            }
            $scope.PopulateImporterExporters = function () {
                $("#loadingScreen").show();
                apiService.get('Customs/ImporterExporter/GetImportExporter',
                    $scope.searchParameter,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.importersExporters = results.data.ResponseResult.Data;
                            if ($scope.importersExporters != null) {
                                $scope.totalCount = $scope.importersExporters[0].TotalCount;
                            }
                        }
                        $("#loadingScreen").hide();

                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
            $scope.clearSearchFilters = function () {
                initializeSearchParameters();
                $scope.importersExporters = '';
                $scope.totalCount = 0;
                //$scope.PopulateImporterExporters();
            }
            $scope.searchResults = function () {
                $scope.searchParameter.pageNumber = 1;
                $scope.PopulateImporterExporters();
            }
            $scope.selectImporterExporter = function (event) {
                switch (event.keyCode) {
                    case 40:
                        if ($scope.rowIndexImporter < $scope.importersExporters.length - 1) {
                            $scope.rowIndexImporter++;
                            if ($scope.rowIndexImporter > 10 * $scope.importersExporters - 1) {
                                $scope.lookUpCurrentPageImporter++;
                            }
                            $scope.importerExporterItemSelected = $scope.importersExporters[$scope.rowIndexImporter];
                        }
                        break;
                    case 38:
                        if ($scope.rowIndexImporter > 0) {

                            if ($scope.rowIndexImporter == 10 * ($scope.lookUpCurrentPageImporter - 1)) {
                                $scope.lookUpCurrentPageImporter--;
                            }
                            $scope.rowIndexImporter--;
                            $scope.importerExporterItemSelected = $scope.importersExporters[$scope.rowIndexImporter];
                        }
                        break;
                    case 13:
                        $scope.setImporterExporter($scope.importerExporterItemSelected);
                        break;
                }
            }

            $scope.openImporterExporterLookup = function () {
                GetCategoryCodes();
                $scope.clearSearchFilters();
                $('#importerExporterLookup').modal({
                    backdrop: "static"
                });
            }


            $scope.setImporterExporter = function (row) {
                $scope.DOBLDTO.Importer = row.ImporterCode.toString() + "     " + (row.ImporterDescEng ? row.ImporterDescEng : '') + "     " + (row.ImporterDescArb ? row.ImporterDescArb : '');
                $scope.selectedImporterExporterCode = {};
                $scope.selectedImporterExporterCode.originalObject = {};
                $scope.selectedImporterExporterCode.originalObject.Code = row.ImporterCode;
                $scope.selectedImporterExporterCode.originalObject.EnglishName = row.ImporterDescEng;
                $scope.selectedImporterExporterCode.originalObject.ArabicName = row.ImporterDescArb;
                $scope.selectedImporterExporterCode.originalObject.CategoryCode = row.ImporterCategoryCode;
                $("#importerExporterLookup").modal("hide");
                $('#ImporterExporter_value').focus();
                $scope.shipmentDetails.$setDirty();
            }

            /// F9 key down event
            $scope.importerExporterKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.clearSearchFilters();
                    //if ($scope.selectedImporterExporterCode) {
                    //    $scope.searchParameter.importerCode = $scope.selectedImporterExporterCode.originalObject.Code;
                    //    $scope.searchParameter.importername = $scope.selectedImporterExporterCode.originalObject.EnglishName;
                    //    $scope.searchParameter.categoryCode = $scope.selectedImporterExporterCode.originalObject.CategoryCode;
                    //}
                    $scope.openImporterExporterLookup();
                    //$scope.PopulateImporterExporters();
                }
            }
            $scope.$watchCollection("DOBLDTO.Importer", function () {
                $scope.isHumanCorps = false;
                $storage.set('isHumanCorps', $scope.isHumanCorps);
                if ($scope.DOBLDTO && !($scope.DOBLDTO.Importer)) {
                    $scope.selectedImporterExporterCode = {};
                    $scope.selectedImporterExporterCode.originalObject = {};
                    $scope.selectedImporterExporterCode.originalObject.Code = null;
                    $scope.selectedImporterExporterCode.originalObject.EnglishName = null;
                    $scope.selectedImporterExporterCode.originalObject.ArabicName = null;
                    $scope.selectedImporterExporterCode.originalObject.CategoryCode = null;
                }
                else if ($scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject && $scope.selectedImporterExporterCode.originalObject.Code == '422307') //Human Corps change has implemented as part of the feedback given by BA & QA
                {
                    $scope.isHumanCorps = true;

                    $storage.set('isHumanCorps', $scope.isHumanCorps);

                    $scope.DOBLDTO.GoodDesc = $scope.DOBLDTO.GoodDesc ? $scope.DOBLDTO.GoodDesc : '-';
                    if (($scope.DOBLDTO.BillTypeCode == 'I' || $scope.DOBLDTO.BillTypeCode == 'N' || $scope.DOBLDTO.BillTypeCode == 'T') && (!$scope.DOBLDTO.Consignee)) {
                        $scope.DOBLDTO.Consignee = '-';
                    }
                    if (($scope.DOBLDTO.BillTypeCode == 'E' || $scope.DOBLDTO.BillTypeCode == 'R' || $scope.DOBLDTO.BillTypeCode == 'O') && (!$scope.DOBLDTO.Shipper)) {
                        $scope.DOBLDTO.Shipper = '-';
                    }
                }
            });
            function GetCategoryCodes() {
                apiService.get('Customs/Lookup/ImporterCategory',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.categoryCodes = results.data.ResponseResult.Data;
                        $("#selectCategory").select2();
                    },
                    function error(response) {
                        //modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
            }
            //GetCategoryCodes();
            ///////////KSA Customer Lookup Enhancement --------------

            $scope.searchKSACustomerText = '';

            $scope.ksaCustomerKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openKSACustomerLookup();
                }
            }

            $scope.PopulateKSACustomers = function (searchString) {
                $scope.stoppedSearch = false;
                apiService.get('Customs/Lookup/KSACustomers',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchString
                },
                function (results) {
                    $scope.ksacustomersFull = results.data.ResponseResult.Data;
                    $scope.ksaCustomers = angular.copy($scope.ksacustomersFull);
                    $scope.stoppedSearch = true;
                    //if ($scope.ksacustomersFull) {
                    //    $scope.ksaCustomers = $scope.ksacustomersFull.filter(obj => {
                    //        return obj.Code.toString().toLowerCase().includes($scope.searchKSACustomerText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.searchKSACustomerText.toLowerCase()))
                    //            || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.searchKSACustomerText.toLowerCase()));
                    //    });
                    //}

                },
                function error(response) {
                    $scope.stoppedSearch = true;
                    //console.log("An Error has occurred while getting lookup Data KSACustomers! ", response);
                });
            }


            $scope.openKSACustomerLookup = function (item) {
                $scope.searchKSACustomerText = '';
                $('#ksaCustomerLookup').modal({
                    backdrop: "static"
                });
                $('#searchKSACustomerText').focus();
                $('#searchKSACustomerText').select();
                $scope.onKSACustomerChange($scope.searchKSACustomerText);
                $("#ksaCustomerLookup").off("keydown");
                $('#ksaCustomerLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.ksaRowIndex < $scope.ksacustomers.length - 1) {
                                    $scope.ksaRowIndex++;
                                    if ($scope.ksaRowIndex > 10 * $scope.ksacustomers - 1) {
                                        $scope.ksaCustomerCurrentPage++;
                                    }
                                    $scope.ksaCustomerItemSelected = $scope.ksacustomers[$scope.ksaRowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.ksaRowIndex > 0) {

                                    if ($scope.ksaRowIndex == 10 * ($scope.ksaCustomerCurrentPage - 1)) {
                                        $scope.ksaCustomerCurrentPage--;
                                    }
                                    $scope.ksaRowIndex--;
                                    $scope.ksaCustomerItemSelected = $scope.ksacustomers[$scope.ksaRowIndex];
                                }
                                break;
                            case 13:
                                $scope.setKSACustomer($scope.ksaCustomerItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onKSACustomerChange = function (searchStr) {
                $scope.ksaRowIndex = 0;
                $scope.ksaCustomerCurrentPage = 1;
                $scope.PopulateKSACustomers(searchStr);
            }

            $scope.setKSACustomer = function (row) {
                $scope.DOBLDTO.KSACustomer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                $scope.selectedKSACustomer = {};
                $scope.selectedKSACustomer.originalObject = row;
                $("#ksaCustomerLookup").modal("hide");
                $('#KSACustomerName_value').focus();
                $scope.shipmentDetails.$setDirty();
            }

            //$scope.PopulateKSACustomers();

            $scope.$watchCollection("searchKSACustomerText", function () {
                if ($scope.searchKSACustomerText)
                    $scope.onKSACustomerChange($scope.searchKSACustomerText);
                if ($scope.searchKSACustomerText) {
                    if ($scope.DOBLDTO.KSACustomer !== '0' && $scope.DOBLDTO.KSACustomer !== "0") {
                        if ($scope.selectedKSACustomer && $scope.selectedKSACustomer.originalObject) {
                            $scope.selectedKSACustomer.originalObject.ArabicName = '';
                        }
                        $scope.IsDisableConsignee = false;
                    }
                }
            });


            //--------------------
            ///////////////////////////////////////////////
            ///Lookup Enhancements - Airline //////////
            $scope.searchVesselText = '';

            $scope.vesselKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openVesselLookup();
                }
            }
            $scope.PopulateVessel = function (searchStr) {
                $scope.stoppedSearch = false;
                apiService.get('Customs/Lookup/Vessel',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.vesselsFull = results.data.ResponseResult.Data;
                    $scope.vessels = angular.copy($scope.vesselsFull);
                    $scope.stoppedSearch = true;
                },
                function error(response) {
                    $scope.stoppedSearch = true;
                    //Console.log("An Error has occurred while getting lookup Data Vessel!");
                });
            }
            $scope.openVesselLookup = function (item) {
                $scope.searchVesselText = '';
                $('#vesselLookup').modal({
                    backdrop: "static"
                });
                $('#searchVesselText').focus();
                $('#searchVesselText').select();
                $scope.onVesselChange($scope.searchVesselText);
                $("#vesselLookup").off("keydown");
                $('#vesselLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndexVessel < $scope.vessels.length - 1) {
                                    $scope.rowIndexVessel++;
                                    if ($scope.rowIndexVessel > 10 * $scope.vessels - 1) {
                                        $scope.lookUpCurrentPageVessel++;
                                    }
                                    $scope.vesselItemSelected = $scope.vessels[$scope.rowIndexVessel];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndexVessel > 0) {

                                    if ($scope.rowIndexVessel == 10 * ($scope.lookUpCurrentPageVessel - 1)) {
                                        $scope.lookUpCurrentPageVessel--;
                                    }
                                    $scope.rowIndexVessel--;
                                    $scope.vesselItemSelected = $scope.vessels[$scope.rowIndexVessel];
                                }
                                break;
                            case 13:
                                $scope.setVessel($scope.vesselItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onVesselChange = function (searchStr) {
                $scope.rowIndexVessel = 0;
                $scope.lookUpCurrentPageVessel = 1;
                $scope.PopulateVessel(searchStr);
                //if ($scope.vesselsFull) {
                //    $scope.vessels = $scope.vesselsFull.filter(obj => {
                //        return obj.Code.toString().toLowerCase().includes($scope.searchVesselText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.searchVesselText.toLowerCase()))
                //            || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.searchVesselText.toLowerCase()));
                //    });
                //}
            }

            $scope.setVessel = function (row) {
                if (row) {
                    $scope.DOBLDTO.Vessel = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.selectedVessel = {};
                    $scope.selectedVessel.originalObject = row;
                    $scope.shipmentDetails.$setDirty();
                }
                $("#vesselLookup").modal("hide");
                $('#ddlvessel_value').focus();
                $scope.searchVesselText = '';
            }

            // $scope.PopulateVessel();

            $scope.$watchCollection("searchVesselText", function () {
                if ($scope.searchVesselText)
                    $scope.onVesselChange($scope.searchVesselText);
            });
            $scope.closeVessels = function () {
                $scope.searchVesselText = '';
            }
            ///////////////////////////////////////////////
            ///Lookup Enhancements - Shipping Origin/Destination //////////
            $scope.searchShippingOriginDestinationText = '';

            $scope.shippingOriginDestinationKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openShippingOriginDestinationLookup();
                }
            }
            $scope.PopulateShippingOriginDestination = function (searchStr) {
                apiService.get('Customs/Lookup/Ports',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.shippingOriginDestinationsFull = results.data.ResponseResult.Data;
                    $scope.shippingOriginDestinations = angular.copy($scope.shippingOriginDestinationsFull);
                },
                function error(response) {
                    console.log("An Error has occurred while getting lookup Data ShippingOriginDestination!", response);
                });
            }
            $scope.openShippingOriginDestinationLookup = function (item) {
                $scope.searchShippingOriginDestinationText = '';
                $('#shippingOriginDestinationLookup').modal({
                    backdrop: "static"
                });
                $('#searchShippingOriginDestinationText').focus();
                $('#searchShippingOriginDestinationText').select();
                $scope.onShippingOriginDestinationChange($scope.searchShippingOriginDestinationText);
                $("#shippingOriginDestinationLookup").off("keydown");
                $('#shippingOriginDestinationLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndexShippingOriginDestination < $scope.shippingOriginDestinations.length - 1) {
                                    $scope.rowIndexShippingOriginDestination++;
                                    if ($scope.rowIndexShippingOriginDestination > 10 * $scope.shippingOriginDestinations - 1) {
                                        $scope.lookUpCurrentPageShippingOriginDestination++;
                                    }
                                    $scope.shippingOriginDestinationItemSelected = $scope.shippingOriginDestinations[$scope.rowIndexShippingOriginDestination];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndexShippingOriginDestination > 0) {

                                    if ($scope.rowIndexShippingOriginDestination == 10 * ($scope.lookUpCurrentPageShippingOriginDestination - 1)) {
                                        $scope.lookUpCurrentPageShippingOriginDestination--;
                                    }
                                    $scope.rowIndexShippingOriginDestination--;
                                    $scope.shippingOriginDestinationItemSelected = $scope.shippingOriginDestinations[$scope.rowIndexShippingOriginDestination];
                                }
                                break;
                            case 13:
                                $scope.setShippingOriginDestination($scope.shippingOriginDestinationItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onShippingOriginDestinationChange = function (searchStr) {
                $scope.rowIndexShippingOriginDestination = 0;
                $scope.lookUpCurrentPageShippingOriginDestination = 1;
                $scope.PopulateShippingOriginDestination(searchStr);
            }

            $scope.setShippingOriginDestination = function (row) {
                $scope.searchShippingOriginDestinationText = '';
                $scope.validShippingOriginDestination = true;
                $scope.DOBLDTO.Port = row.Code.toString() + "     " + (row.PortNameEnglish ? row.PortNameEnglish : '') + "     " + (row.PortNameArabic ? row.PortNameArabic : '');
                $scope.selectedPort = {};
                $scope.selectedPort.originalObject = row;
                $("#shippingOriginDestinationLookup").modal("hide");
                $('#ddlPorts_value').focus();
                $scope.shipmentDetails.$setDirty();
            }
            $scope.$watchCollection("searchShippingOriginDestinationText", function () {
                if ($scope.searchShippingOriginDestinationText)
                    $scope.onShippingOriginDestinationChange($scope.searchShippingOriginDestinationText);
            });

            $scope.closeShippingOriginDestination = function () {
                $scope.searchShippingOriginDestinationText = '';
            }
            //Lookup Enhancements :Mamar Phase 2

            //New lookup Clearing Agent has been added as part of sprint7 Ph2
            $scope.searchClearingAgentText = '';

            $scope.clearingAgentKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openClearingAgentLookup();
                }
            }

            $scope.PopulateClearingAgents = function (searchStr) {
                apiService.get('Customs//Lookup/GetDOClearingAgents',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.clearingAgentsFull = results.data.ResponseResult.Data;
                    $scope.clearingAgents = angular.copy($scope.clearingAgentsFull);
                },
                function error(response) {
                    //modalErrorShow("An Error has occurred while getting lookup Data!");
                });

            }

            $scope.openClearingAgentLookup = function (item) {
                $scope.searchClearingAgentText = '';
                $('#clearingAgentLookup').modal({
                    backdrop: "static"
                });
                $('#searchClearingAgentText').focus();
                $('#searchClearingAgentText').select();
                $scope.onClearingAgentChange($scope.searchClearingAgentText);
                $("#clearingAgentLookup").off("keydown");
                $('#clearingAgentLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndex < $scope.clearingAgents.length - 1) {
                                    $scope.rowIndex++;
                                    if ($scope.rowIndex > 10 * $scope.clearingAgents - 1) {
                                        $scope.lookUpCurrentPage++;
                                    }
                                    $scope.clearingAgentItemSelected = $scope.clearingAgents[$scope.rowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndex > 0) {

                                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                                        $scope.lookUpCurrentPage--;
                                    }
                                    $scope.rowIndex--;
                                    $scope.clearingAgentItemSelected = $scope.clearingAgents[$scope.rowIndex];
                                }
                                break;
                            case 13:
                                $scope.setClearingAgent($scope.clearingAgentItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onClearingAgentChange = function (searchStr) {
                $scope.rowIndex = 0;

                $scope.lookUpCurrentPage = 1;
                $scope.PopulateClearingAgents(searchStr);
                //if ($scope.clearingAgentsFull) {
                //    $scope.clearingAgents = $scope.clearingAgentsFull.filter(obj => {
                //        return obj.Code.toString().toLowerCase().includes($scope.searchClearingAgentText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.searchClearingAgentText.toLowerCase()))
                //            || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.searchClearingAgentText.toLowerCase()));
                //    });
                //}
            }

            $scope.setClearingAgent = function (row) {
                $scope.DOBLDTO.ClearingAgent = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                $scope.selectedClearingAgent = {};
                $scope.selectedClearingAgent.originalObject = row;
                $("#clearingAgentLookup").modal("hide");
                $('#EnglishClearingAgents_value').focus();
                $scope.shipmentDetails.$setDirty();
            }

            //$scope.PopulateClearingAgents();

            $scope.$watchCollection("searchClearingAgentText", function () {
                if ($scope.searchClearingAgentText)
                    $scope.onClearingAgentChange($scope.searchClearingAgentText);
            });


            //GenericLookup Methods
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'CarsAgent':
                        $scope.DOBLDTO.CarAgent = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                        $scope.selectedCarAgent = {};
                        $scope.selectedCarAgent.originalObject = row;

                        $('#EnglishCarAgents_value').focus();
                        break;

                    case 'Units':
                        $scope.DOBLDTO.Unit = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedUnit = {};
                        $scope.selectedUnit.originalObject = row;

                        $('#Unit_value').focus();
                        break;
                    case 'Currency':
                        $scope.DOBLDTO.FreightCurrency = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                        $scope.selectedFreightCurrency = {};
                        $scope.selectedFreightCurrency.originalObject = row;

                        $('#FreightCurrencies_value').focus();
                        break;
                        // freightCurrencies
                }
                $("#genericLookUp").modal("hide");
                $scope.shipmentDetails.$setDirty();
            }

            $scope.populateLookupData = function (lookupId) {
                switch (lookupId) {
                    case 'CarsAgent':
                        break;
                    case 'Units':
                        break;
                    case 'Currency':
                        break;
                }
            }

            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'CarsAgent':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.carAgentsFull) {
                                $scope.lookUpData = $scope.carAgentsFull.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.NameEnglish && obj.NameEnglish.toLowerCase().includes(searchText))
                                        || (obj.NameArabic && obj.NameArabic.toLowerCase().includes(searchText));
                                });
                            }
                            break;

                        case 'Units':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.units) {
                                $scope.lookUpData = $scope.units.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                        case 'Currency':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.freightCurrencies) {
                                $scope.lookUpData = $scope.freightCurrencies.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.NameEnglish && obj.NameEnglish.toLowerCase().includes(searchText))
                                        || (obj.NameArabic && obj.NameArabic.toLowerCase().includes(searchText));
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
                        case 'CarsAgent':
                            $scope.lookUpTitle = $filter("translate")("CarsAgent");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.carAgents;
                            break;
                        case 'Units':
                            $scope.lookUpTitle = $filter("translate")("Unit");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.units;
                            break;
                        case 'Currency':
                            $scope.lookUpTitle = $filter("translate")("Currency");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }, { Text: "Rate", Width: "" }];
                            $scope.lookUpData = $scope.freightCurrencies;
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

            function showErrorMessageWithAction(msg, exit) {
                swal({
                    title: '',
                    text: msg + '!',
                    type: "error",
                    confirmButtonColor: "#EF5350",
                    confirmButtonText: $filter('translate')('OK'),
                    closeOnConfirm: true,
                    showCancelButton: false,
                    cancelButtonText: '',
                    html: true
                },
                function (isConfirm) {
                    if (isConfirm && exit) {
                        $state.go('transactions', { 'transportMode': $scope.selectedMode });
                    }
                });
            }
        }
    ]
);