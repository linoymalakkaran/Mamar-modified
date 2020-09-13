angular.module('mamarApp').controller('MaqasaCreateBillController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$uibModal', '$filter', '$timeout', 'paginationService',
    'exemptionEntryGroupInfoService', 'sharedModels', 'userAccountStorageFactory',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $uibModal, $filter, $timeout, paginationService, exemptionEntryGroupInfoService, sharedModels, userAccountStorageFactory) {

        $scope.$storage = $storage;
        $scope.userAccntInfo = userAccountStorageFactory.getUserAccntInfo();

        if (sharedModels.maqasaReExportSrchEntity && sharedModels.maqasaReExportSrchEntity.ImportBillNo) {
            $scope.maqasaSrchEntity = sharedModels.maqasaReExportSrchEntity;
            if (typeof (Storage) !== "undefined") {
                localStorage.storedMaqasaEntity = JSON.stringify(sharedModels.maqasaReExportSrchEntity);
            }
        }
        else {
            $scope.maqasaSrchEntity = JSON.parse(localStorage.storedMaqasaEntity);
        }

        $scope.transMode = $stateParams.transportMode;
        $scope.validCargoDesc = true;
        var entryCenterCode = ($scope.maqasaSrchEntity && $scope.maqasaSrchEntity.EntryCenter && $scope.maqasaSrchEntity.EntryCenter.split(' ').length > 0) ? $scope.maqasaSrchEntity.EntryCenter.split(' ')[0] : '';
        var centerCode = $stateParams.centerCode;
        var jobNumber = $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.ImportJobNumber : '';
        $scope.validNetWeightGrossWeight = true;
        $('#voyageNo').focus();
        ////Region Maqasa Re Export Create Bill ///////////////


        //Region : Lookups
        $scope.LoadLookupCargoType = function () {

            getIndexData('cargoTypes', '', function (data) {
                $scope.lookupCargoTpResult = data;
                $scope.maqasaCreateBill.CargoType = ($scope.lookupCargoTpResult && $scope.lookupCargoTpResult.length > 0) ? $scope.lookupCargoTpResult[0].Code : '';
            }, function () {

                $scope.lkCargoTypeParameter = {
                    centerCode: $stateParams.centerCode,
                    searchString: ''
                };

                apiService.get('Customs/Lookup/CargoTypes', $scope.lkCargoTypeParameter, function (results) {
                    $scope.lookupCargoTpResult = results.data.ResponseResult.Data;
                    $scope.maqasaCreateBill.CargoType = ($scope.lookupCargoTpResult && $scope.lookupCargoTpResult.length > 0) ? $scope.lookupCargoTpResult[0].Code : '';
                    storeData(results.data.ResponseResult.Data, 'cargoTypes', '');
                },
                    function error(response) {
                        console.log(response);
                    });

            });
        }


        $scope.LoadLookupCargo = function () {
            getIndexData('Cargoes', '', function (data) {
                $scope.lookupCargoResult = data;
                $scope.maqasaCreateBill.CargoCode = ($scope.lookupCargoResult && $scope.lookupCargoResult.length > 0) ? $scope.lookupCargoResult[0].CargoCode : '';
                $scope.showDriver = false;
            }, function () {

                $scope.lkCargoParameter = {
                    centerCode: $stateParams.centerCode,
                    searchString: ''
                };
                apiService.get('Customs/Lookup/Cargoes', $scope.lkCargoParameter, function (results) {
                    $scope.lookupCargoResult = results.data.ResponseResult.Data;
                    $scope.maqasaCreateBill.CargoCode = ($scope.lookupCargoResult && $scope.lookupCargoResult.length > 0) ? $scope.lookupCargoResult[0].CargoCode : '';
                    $scope.showDriver = false;
                    storeData(results.data.ResponseResult.Data, 'Cargoes', '');
                },
                    function error(response) {
                        console.log(response);
                    });
            });
        }



        function populateVesselType() {
            getIndexData('VesselTypes', '', function (data) {
                $scope.vesselTypes = data;
                $scope.validVesselType = true;
                lookupVesselTypeAddEnglishArabicName();
            }, function () {
                $scope.validVesselType = true;
                apiService.get('Customs/Lookup/VesselTypes',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.vesselTypes = results.data.ResponseResult.Data;
                        storeData(results.data.ResponseResult.Data, 'VesselTypes', '');
                        lookupVesselTypeAddEnglishArabicName();
                    },
                    function error(response) {
                        console.log(response);
                    });
            });


        }
        populateVesselType();
        function lookupVesselTypeAddEnglishArabicName() {
            angular.forEach($scope.vesselTypes, function (key, value) {
                key.Code = key.VesselCode;
                key.NameEnglish = key.VesselEngName;
                key.NameArabic = key.VesselArbName;
            });
        }
        function populateTruckNationality() {
            getIndexData('TruckNationality', '', function (data) {
                $scope.truckNationalities = data;
                $scope.validTruckNationality = true;
            }, function () {
                $scope.validTruckNationality = true;
                apiService.get('Customs/Lookup/GetTruckNationality',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.truckNationalities = results.data.ResponseResult.Data;
                        storeData(results.data.ResponseResult.Data, 'TruckNationality', '');
                    },
                    function error(response) {
                        console.log(response);
                    });
            });
        }
        populateTruckNationality();


        function populateDriverNationality() {
            getIndexData('DriverNationality', '', function (data) {
                $scope.driverNationalities = data;
                $scope.validDriverNationality = true;
            }, function () {
                $scope.validDriverNationality = true;
                apiService.get('Customs/Lookup/GetDriverNationality',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.driverNationalities = results.data.ResponseResult.Data;
                        storeData(results.data.ResponseResult.Data, 'DriverNationality', '');
                    },
                    function error(response) {
                        console.log(response);
                    });
            });
        }
        populateDriverNationality();

        $scope.setDefaultUnit = function () {
            $scope.unitObj = {};
            $scope.unitObj.originalObject = {};
            if ($scope.units) {
                var selectedUnitMaqasa = $scope.units.filter(x => { return x.Code == "UNT" });
                if (selectedUnitMaqasa) {
                    $scope.unitObj.originalObject.Code = angular.copy(selectedUnitMaqasa[0].Code);
                    $scope.unitObj.originalObject.EnglishName = angular.copy(selectedUnitMaqasa[0].EnglishName);
                    $scope.unitObj.originalObject.ArabicName = angular.copy(selectedUnitMaqasa[0].ArabicName);
                    $scope.unit = ($scope.unitObj.originalObject.Code.toString()) + ' ' + ($scope.unitObj.originalObject.EnglishName ? $scope.unitObj.originalObject.EnglishName : '') + ' ' + ($scope.unitObj.originalObject.ArabicName ? $scope.unitObj.originalObject.ArabicName : '');
                }
            }
        }

        function populateUnits() {
            // $scope.validUnit = true;
            getIndexData('Units', '', function (data) {
                $scope.units = data;
                $scope.setDefaultUnit();
            }, function () {
                apiService.get('Customs/Lookup/Units',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.units = results.data.ResponseResult.Data;
                        storeData($scope.units, 'Units', '');
                        $scope.setDefaultUnit();
                    },
                    function error(response) {
                        //modalErrorShow("An Error has occurred while getting lookup Data!");
                    });
            });
        }
        populateUnits();

        $scope.cargoChanged = function () {
            $scope.showDriver = false;
            $scope.validTruckNationality = true;
            $scope.validDriverNationality = true;
            $scope.validDriver = true;
            if ($scope.lookupCargoResult && $scope.maqasaCreateBill.CargoCode) {
                var cargoSelected = $filter('filter')($scope.lookupCargoResult, { CargoCode: $scope.maqasaCreateBill.CargoCode });
                if (cargoSelected && cargoSelected.length > 0 && cargoSelected[0].CargoEngName != 'Driven') {
                    $scope.showDriver = true;
                }
            }
        }
        //End Region : Lookups

        //Tab Out Lookup Changes
        $scope.AddVesselType = function (selectedCode) {
            if (selectedCode) {
                var vesselTypesSelected = angular.copy($scope.vesselTypes);
                var index = vesselTypesSelected ? (vesselTypesSelected.findIndex(doc => doc.VesselCode == selectedCode)) : -1;
                if (index != -1) {
                    var code = vesselTypesSelected[index];
                    $scope.vesselTypeObj.originalObject.VesselCode = angular.copy(code.VesselCode);
                    $scope.vesselTypeObj.originalObject.VesselEngName = code.VesselEngName;
                    $scope.vesselTypeObj.originalObject.VesselArbName = code.VesselArbName;
                    $scope.selectedVesselType = ($scope.vesselTypeObj.originalObject.VesselCode.toString()) + ' ' + ($scope.vesselTypeObj.originalObject.VesselEngName ? $scope.vesselTypeObj.originalObject.VesselEngName : '') + ' ' + ($scope.vesselTypeObj.originalObject.VesselArbName ? $scope.vesselTypeObj.originalObject.VesselArbName : '');
                    $scope.validVesselType = true;
                } else {
                    $scope.selectedVesselType = '';
                    $scope.vesselTypeObj.originalObject.VesselEngName = '';
                    $scope.vesselTypeObj.originalObject.VesselArbName = '';
                    $scope.validVesselType = false;
                }
            } else {
                $scope.selectedVesselType = '';
                $scope.vesselTypeObj = {};
                $scope.vesselTypeObj.originalObject = {};
                $scope.vesselTypeObj.originalObject.VesselEngName = '';
                $scope.vesselTypeObj.originalObject.VesselArbName = '';
            }
        }
        $scope.AddDischargePort = function (selectedCode) {
            if (selectedCode) {
                var dischargePortsSelected = angular.copy($scope.dischargePorts);
                var index = dischargePortsSelected ? (dischargePortsSelected.findIndex(doc => doc.PortCode.toUpperCase() == selectedCode.toUpperCase())) : -1;
                if (index != -1) {
                    var code = dischargePortsSelected[index];
                    $scope.dischargePortObj.originalObject.PortCode = angular.copy(code.PortCode);
                    $scope.dischargePortObj.originalObject.PortName = code.PortName;
                    $scope.dischargePortObj.originalObject.CountryName = code.CountryName;
                    $scope.dischargePort = ($scope.dischargePortObj.originalObject.PortCode.toString()) + ' ' + ($scope.dischargePortObj.originalObject.PortName ? $scope.dischargePortObj.originalObject.PortName : '') + ' ' + ($scope.dischargePortObj.originalObject.CountryName ? $scope.dischargePortObj.originalObject.CountryName : '');
                    $scope.validDischargePort = true;
                } else {
                    $scope.dischargePort = '';
                    $scope.dischargePortObj.originalObject.PortName = '';
                    $scope.dischargePortObj.originalObject.CountryName = '';
                    $scope.validDischargePort = false;
                }
            } else {
                $scope.dischargePort = '';
                $scope.dischargePortObj = {};
                $scope.dischargePortObj.originalObject = {};
                $scope.dischargePortObj.originalObject.PortName = '';
                $scope.dischargePortObj.originalObject.CountryName = '';
            }
        }

        $scope.AddUnit = function (selectedCode) {
            if (selectedCode) {
                var unitsSelected = angular.copy($scope.units);
                var index = unitsSelected ? (unitsSelected.findIndex(doc => doc.Code.toUpperCase() == selectedCode.toUpperCase())) : -1;
                if (index != -1) {
                    var code = unitsSelected[index];
                    $scope.unitObj.originalObject.Code = angular.copy(code.Code);
                    $scope.unitObj.originalObject.EnglishName = code.EnglishName;
                    $scope.unitObj.originalObject.ArabicName = code.ArabicName;
                    $scope.unit = ($scope.unitObj.originalObject.Code.toString()) + ' ' + ($scope.unitObj.originalObject.EnglishName ? $scope.unitObj.originalObject.EnglishName : '') + ' ' + ($scope.unitObj.originalObject.ArabicName ? $scope.unitObj.originalObject.ArabicName : '');
                    $scope.validUnit = true;
                } else {
                    $scope.unitObj.originalObject.EnglishName = '';
                    $scope.unitObj.originalObject.ArabicName = '';
                    $scope.validUnit = false;
                }
            } else {
                $scope.unitObj = {};
                $scope.unitObj.originalObject = {};
                $scope.unitObj.originalObject.EnglishName = '';
                $scope.unitObj.originalObject.ArabicName = '';
            }
        }
        $scope.AddShipper = function (selectedCode) {
            if (selectedCode) {
                $("#loadingScreen").show();
                apiService.get('Customs/Lookup/GetMaqasaImporter',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: selectedCode
                    },
                    function (results) {
                        $("#loadingScreen").hide();
                        $scope.shippers = results.data.ResponseResult.Data;
                        if ($scope.shippers) {

                            if ($scope.shippers.length > 1 && $storage.get('isPrivateCompany')) {
                                $scope.impotersExporters = angular.copy($scope.shippers);
                                var companyCode = ($scope.userAccntDetails && $scope.userAccntDetails.UCode) ? $scope.userAccntDetails.UCode.slice(1) : null;
                                $scope.shippers = $scope.impotersExporters.filter(obj => {
                                    return obj.ImporterCode.toString().toLowerCase() == companyCode.toLowerCase();
                                });
                            }

                            var code = $scope.shippers[0];
                            $scope.shipperObj = {};
                            $scope.shipperObj.originalObject = {};
                            $scope.shipperObj.originalObject.ImporterCode = angular.copy(code.ImporterCode);
                            $scope.shipperObj.originalObject.ImporterEngName = code.ImporterEngName;
                            $scope.shipperObj.originalObject.ImporterArbName = code.ImporterArbName;
                            $scope.shipper = ($scope.shipperObj.originalObject.ImporterCode.toString()) + ' ' + ($scope.shipperObj.originalObject.ImporterEngName ? $scope.shipperObj.originalObject.ImporterEngName : '') + ' ' + ($scope.shipperObj.originalObject.ImporterArbName ? $scope.shipperObj.originalObject.ImporterArbName : '');
                            $scope.validDischargePort = true;
                        }
                        else {
                            $scope.shipper = '';
                            $scope.shipperObj.originalObject.ImporterEngName = '';
                            $scope.shipperObj.originalObject.ImporterArbName = '';
                            $scope.validDischargePort = false;
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        modalErrorShow("An Error has occurred while getting lookup Data for Shipper!");
                    });
            }
            else {
                $scope.shipper = '';
                $scope.shipperObj = {};
                $scope.shipperObj.originalObject = {};
                $scope.shipperObj.originalObject.ImporterEngName = '';
                $scope.shipperObj.originalObject.ImporterArbName = '';
            }
        }
        //Region Methods

        $scope.LoadMaqasaReExportCreateBill = function () {
            $scope.maqasaCreateBill = {};
            $scope.maqasaCreateBill.DestinationCountry = $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.DestinationGCC : '';
            $scope.maqasaCreateBill.ExitCenter = $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.ExitCenter : '';
            $scope.maqasaCreateBill.FromCountry = ($scope.maqasaSrchEntity && $scope.maqasaSrchEntity.CountryCode) ? ($scope.maqasaSrchEntity.CountryCode + '  ' + $scope.maqasaSrchEntity.CountryEngName + '  ' + $scope.maqasaSrchEntity.CountryArbName) : '';
            $scope.maqasaCreateBill.ArrivalDate = $filter('date')(new Date(), "dd/MM/yyyy");

            //The below code is written for just displaying in UI the code, Eng, Arabic name separately. This is same as DestinationGCC
            $scope.DestinationCountryCodeSelected = $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.DestinationGCCCodeSelected : '';
            $scope.DestinationCountryEngNameSelected = $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.DestinationGCCEngNameSelected : '';
            $scope.DestinationCountryArbNameSelected = $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.DestinationGCCArbNameSelected : '';

        }

        //Region Watch Shipper Model
        $scope.$watch("shipperObj", function () {
            if (!apiService.isNullOrEmptyOrUndefined($scope.shipperObj)) {
                $scope.maqasaCreateBill.ShipperInArabic = $scope.shipperObj.originalObject.ImporterArbName;
                $scope.maqasaCreateBill.ConsigneeInArabic = $scope.shipperObj.originalObject.ImporterArbName;
            }
        });
        //End Region Watch Shipper Model

        //Create Bill  

        function InitializeValidationMessages() {
            $scope.isValid = true;
            $scope.validVoyageNo = true;
            $scope.validArrivalDate = true;
            $scope.validShipper = true;
            $scope.validVesselType = true;
            $scope.validDischargePort = true;
            $scope.validConsignee = true;
            $scope.validShipperInArabic = true;
            $scope.validFromCountry = true;
            $scope.validDestinationCountry = true;
            $scope.validInvoice = true;
            $scope.validContainer = true;
            $scope.validUnit = true;
            $scope.validTruckNationality = true;
            $scope.validDriverNationality = true;
            $scope.validDriver = true;
        }

        $scope.ValidateVoyageNo = function () {
            $scope.validVoyageNo = $scope.maqasaCreateBill.VoyageNumber ? true : false;
            $scope.isValid = !$scope.validVoyageNo ? false : $scope.isValid
        }
        function ValidateArrivalDate() {
            $scope.validArrivalDate = $scope.maqasaCreateBill.ArrivalDate ? true : false;
            $scope.isValid = !$scope.validArrivalDate ? false : $scope.isValid
        }
        function ValidateUnit() {
            $scope.validUnit = true;
            var unitSelected = ($scope.unitObj && $scope.unitObj.originalObject.Code) ? $scope.unitObj.originalObject.Code + $scope.unitObj.originalObject.EnglishName + ($scope.unitObj.originalObject.ArabicName ? $scope.unitObj.originalObject.ArabicName : '') : '';
            if ((!$scope.unit) || ($scope.unit && (unitSelected == 0 || $scope.unit.replace(/\s/g, '') != unitSelected.replace(/\s/g, '')))) {
                $scope.validUnit = false;
                $scope.isValid = false;
            }
        }
        function ValidateTruckNationality() {
            $scope.validTruckNationality = true;
            var truckSelected = ($scope.truckNationalityObj && $scope.truckNationalityObj.originalObject.Code) ? $scope.truckNationalityObj.originalObject.Code + $scope.truckNationalityObj.originalObject.EngName + ($scope.truckNationalityObj.originalObject.ArbName ? $scope.truckNationalityObj.originalObject.ArbName : '') : '';
            if ((!$scope.truckNationality)) {
                $scope.validTruckNationality = false;
                $scope.isValid = false;
            }
        }
        function ValidateDriverNationality() {
            $scope.validDriverNationality = true;
            var driverSelected = ($scope.driverNationalityObj && $scope.driverNationalityObj.originalObject.Code) ? $scope.driverNationalityObj.originalObject.Code + $scope.driverNationalityObj.originalObject.EngName + ($scope.driverNationalityObj.originalObject.ArbName ? $scope.driverNationalityObj.originalObject.ArbName : '') : '';
            if ((!$scope.driverNationality)) {
                $scope.validDriverNationality = false;
                $scope.isValid = false;
            }
        }
        $scope.ValidateDriver = function () {
            $scope.validDriver = $scope.maqasaCreateBill.TruckDriver ? true : false;
            $scope.isValid = !$scope.validDriver ? false : $scope.isValid
        }
        function ValidateShipper() {
            $scope.validShipper = true;
            var shipperSelected = ($scope.shipperObj && $scope.shipperObj.originalObject.ImporterCode) ? $scope.shipperObj.originalObject.ImporterCode + $scope.shipperObj.originalObject.ImporterEngName + ($scope.shipperObj.originalObject.ImporterArbName ? $scope.shipperObj.originalObject.ImporterArbName : '') : '';
            if ((!$scope.shipper) || ($scope.shipper && (shipperSelected == 0 || $scope.shipper.replace(/\s/g, '') != shipperSelected.replace(/\s/g, '')))) {
                $scope.validShipper = false;
                $scope.isValid = false;
            }
        }
        $scope.ValidateVesselType = function () {
            $scope.validVesselType = true;
            var vesselTypeSelected = ($scope.vesselTypeObj && $scope.vesselTypeObj.originalObject.VesselCode) ? $scope.vesselTypeObj.originalObject.VesselCode + $scope.vesselTypeObj.originalObject.VesselEngName + ($scope.vesselTypeObj.originalObject.VesselArbName ? $scope.vesselTypeObj.originalObject.VesselArbName : '') : '';
            if ((!$scope.selectedVesselType)) {
                $scope.validVesselType = false;
                $scope.isValid = false;
            }
        }
        function ValidateDischargePort() {
            $scope.validDischargePort = true;
            var dischargePortSelected = ($scope.dischargePortObj && $scope.dischargePortObj.originalObject.PortCode) ? $scope.dischargePortObj.originalObject.PortCode + ($scope.dischargePortObj.originalObject.PortName ? $scope.dischargePortObj.originalObject.PortName : '') + ($scope.dischargePortObj.originalObject.CountryName ? $scope.dischargePortObj.originalObject.CountryName : '') : '';
            if ((!$scope.dischargePort) || (($stateParams.transportMode == 'M') && ($scope.dischargePort && (dischargePortSelected == 0 || $scope.dischargePort.replace(/\s/g, '') != dischargePortSelected.replace(/\s/g, ''))))) {
                $scope.validDischargePort = false;
                $scope.isValid = false;
            }
        }
        $scope.ValidateConsignee = function () {
            $scope.validConsignee = $scope.maqasaCreateBill.ConsigneeInArabic ? true : false;
            $scope.isValid = !$scope.validConsignee ? false : $scope.isValid
        }
        $scope.copyShipperToConsignee = function () {
            $scope.maqasaCreateBill.ConsigneeInArabic = angular.copy($scope.maqasaCreateBill.ShipperInArabic);
            $scope.ValidateShipperInArabic();
        }
        $scope.ValidateShipperInArabic = function () {
            $scope.validShipperInArabic = $scope.maqasaCreateBill.ShipperInArabic ? true : false;
            $scope.isValid = !$scope.validShipperInArabic ? false : $scope.isValid;
            //New change as per BA
            //$scope.maqasaCreateBill.ConsigneeInArabic = angular.copy($scope.maqasaCreateBill.ShipperInArabic);
        }
        $scope.ValidateInvoiceDetails = function () {
            $scope.validInvoice = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.length > 0) ? true : false;
            $scope.isValid = !$scope.validInvoice ? false : $scope.isValid
        }
        $scope.ValidateImportDetails = function () {
            if ($scope.validInvoice) {
                $scope.validContainer = (($scope.selectedCargoDetails && $scope.selectedCargoDetails.length > 0) ||
                    ($scope.selectedChassisDetails && $scope.selectedChassisDetails.length > 0) ||
                    ($scope.selectedContainerDetails && $scope.selectedContainerDetails.length > 0)) ? true : false;
                $scope.isValid = !$scope.validContainer ? false : $scope.isValid
            }
        }
        function ValidateForm() {
            $scope.isValid = true;
            $scope.validFromCountry = $scope.maqasaCreateBill.FromCountry ? true : false;
            $scope.isValid = !$scope.validFromCountry ? false : $scope.isValid

            $scope.validDestinationCountry = $scope.maqasaCreateBill.DestinationCountry ? true : false;
            $scope.isValid = !$scope.validDestinationCountry ? false : $scope.isValid

            $scope.ValidateVoyageNo();
            ValidateArrivalDate();
            ValidateShipper();
            ValidateUnit();
            $scope.ValidateVesselType();
            ValidateDischargePort();
            $scope.ValidateConsignee();
            $scope.ValidateShipperInArabic();
            $scope.ValidateInvoiceDetails();
            $scope.ValidateImportDetails();
            if ($scope.showDriver) {
                ValidateTruckNationality();
                ValidateDriverNationality();
                $scope.ValidateDriver();
            }
            if (!$scope.validNetWeightGrossWeight) {
                $scope.isValid = false;
            }
            $scope.isValid = !$scope.validCargoDesc ? false : $scope.isValid;
        }

        function InitializePostParameter() {
            var destCountryCode = ($scope.maqasaCreateBill && $scope.maqasaCreateBill.DestinationCountry && $scope.maqasaCreateBill.DestinationCountry.split(' ').length > 0) ? $scope.maqasaCreateBill.DestinationCountry.split(' ')[0] : '';
            var fromCountryCode = ($scope.maqasaCreateBill && $scope.maqasaCreateBill.FromCountry && $scope.maqasaCreateBill.FromCountry.split(' ').length > 0) ? $scope.maqasaCreateBill.FromCountry.split(' ')[0] : '';
            var exitCenterCode = ($scope.maqasaCreateBill && $scope.maqasaCreateBill.ExitCenter && $scope.maqasaCreateBill.ExitCenter.split(' ').length > 0) ? $scope.maqasaCreateBill.ExitCenter.split(' ')[0] : '';
            var cargoListToSave = $scope.selectedCargoDetails.map(x => ({ JobNumber: '', CargoDesc: x.CargoDescription, SerialNumber: '' }));
            var containerListToSave = $scope.selectedContainerDetails.map(x => ({ ContainerNumber: x.ContainerNumber, SealNumber: x.SealNumber }));
            var chassisListToSave = $scope.selectedChassisDetails.map(x => ({
                ChassisNumber: x.ChassisNumber, ChassisColorArbName: x.ChassisColorArbName,
                ChassisModelYear: x.ChassisModelYear, VehicleTypeArb: x.VehicleTypeArb, SubTypeArbName: x.SubTypeArbName
            }));
            var invoiceListToSave = $scope.selectedInvoiceDetails.map(x => ({
                InvoiceSerialNumber: x.InvoiceSerialNumber, GroupSerialNumber: x.GroupSerialNumber,
                HarmoniseCode: x.HarmoniseCode, UnitCode: x.UnitCode, Weight: x.Weight, Quantity: x.Quantity,
                CIFAmount: x.CIFAmount, Amount: x.Amount, DutyPercent: x.DutyPercent
            }));

            var arrivalDate = ($scope.maqasaCreateBill && $scope.maqasaCreateBill.ArrivalDate) ? $filter('date')(new Date(apiService.formatDateObject($scope.maqasaCreateBill.ArrivalDate)), "MM/dd/yyyy") : '';

            $scope.createJobParameter = {
                CompanyCode: '',
                UserCode: '',
                CenterCode: $stateParams.centerCode,
                ExitCenter: exitCenterCode,
                BillRefNumber: $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.ImportBillNo : '',
                BillYear: $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.gccYear : '',
                BillCentCode: entryCenterCode,
                CountryCode: fromCountryCode,
                TotalCollected: $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.TotalAmountCollected : '',

                ReExportBillDatInfo: {
                    CountryCode: fromCountryCode,
                    DestCountryCode: destCountryCode,
                    ArrivalDate: arrivalDate,
                    CargoType: $scope.maqasaCreateBill ? $scope.maqasaCreateBill.CargoCode : '',
                    VoyageNumber: $scope.maqasaCreateBill ? $scope.maqasaCreateBill.VoyageNumber : '',
                    VesselCode: $scope.vesselTypeObj && $scope.vesselTypeObj.originalObject.VesselCode ? ($scope.vesselTypeObj.originalObject.VesselArbName ? $scope.vesselTypeObj.originalObject.VesselArbName.substring(0, 25) : $scope.vesselTypeObj.originalObject.VesselEngName ? $scope.vesselTypeObj.originalObject.VesselEngName.substring(0, 25) : '') : $scope.selectedVesselType,
                    TruckNAT: $scope.truckNationalityObj ? ($scope.truckNationalityObj.originalObject.ArbName ? $scope.truckNationalityObj.originalObject.ArbName.substring(0, 20) : $scope.truckNationalityObj.originalObject.EngName ? $scope.truckNationalityObj.originalObject.EngName.substring(0, 20) : '') : $scope.truckNationality,
                    TruckDriver: $scope.maqasaCreateBill ? $scope.maqasaCreateBill.TruckDriver : '',
                    DriverNAT: $scope.driverNationalityObj ? ($scope.driverNationalityObj.originalObject.ArbName ? $scope.driverNationalityObj.originalObject.ArbName.substring(0, 20) : $scope.driverNationalityObj.originalObject.EngName ? $scope.driverNationalityObj.originalObject.EngName.substring(0, 20) : '') : $scope.driverNationality,
                    PortCode: $scope.dischargePortObj && $stateParams.transportMode == 'M' ? $scope.dischargePortObj.originalObject.PortCode :
                        $stateParams.transportMode != 'M' && $scope.dischargePort.replace(/\s/g, '').length > 10 ? $scope.dischargePort.replace(/\s/g, '').substring(0, 5) : $scope.dischargePort,
                    AgentCode: '',
                    FclFlag: $scope.maqasaCreateBill ? $scope.maqasaCreateBill.CargoType : '',
                    ImpCode: $scope.shipperObj ? $scope.shipperObj.originalObject.ImporterCode : '',
                    Consignee: $scope.maqasaCreateBill ? $scope.maqasaCreateBill.ConsigneeInArabic : '',
                    Shipper: $scope.maqasaCreateBill ? $scope.maqasaCreateBill.ShipperInArabic : '',
                    Quantity: $scope.TotalQuantity,
                    GrossWeight: $scope.TotalGrossWeight,
                    Volume: $scope.VolumeCBM,
                    Weight: $scope.NetWeight,
                    UnitCode: $scope.unitObj ? $scope.unitObj.originalObject.Code : '',
                },
                ReExportContainerInfo: containerListToSave,
                ReExportCargoInfo: cargoListToSave,
                ReExportChassisInfo: chassisListToSave,
                ReExportInvoiceInfo: invoiceListToSave
            };
        }
        $scope.validateNetWeightGrossWeight = function () {
            if ($scope.NetWeight > $scope.TotalGrossWeight) {
                $scope.validNetWeightGrossWeight = false;
            }
            else {
                $scope.validNetWeightGrossWeight = true;
            }
        }
        function showConfirmMessage(msg) {
            swal({
                title: '',
                text: msg,
                type: "success",
                confirmButtonColor: "#66BB6A",
                confirmButtonText: $filter('translate')('ok'),
                closeOnConfirm: true,
                html: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        successOkay();
                    }
                });
        }

        $scope.CreateJobNumber = function () {
            ValidateForm();
            if ($scope.isValid) {
                InitializePostParameter();
                $("#loadingScreen").show();
                apiService.post('Customs/ReExport/CreateReExportCustBill', '', $scope.createJobParameter, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = (response && response.Messages) ? apiService.formatResponseMessage(response.Messages) : '';
                    if (response.IsValid) {
                        $scope.maqasaCreateBill.JobNumber = (response && response.Data) ? response.Data.JobNumber : '';
                        //$('#billSuccessModal').modal({
                        //    backdrop: "static"
                        //});

                        var createJobsuccessMsg = $filter('translate')('BillCreateSuccessMsg') + '<b>' + $scope.maqasaCreateBill.JobNumber + '</b>';
                        showConfirmMessage(createJobsuccessMsg);
                    }
                    else if (!response.IsValid) {
                        //modalErrorShow(msg);
                        showErrorMessage(msg);
                    }
                },
                    function (result) {
                        $("#loadingScreen").hide();
                        modalErrorShow(result ? result.statusText + result.data : 'Server Error');
                    });
            }
        };

        function setSharedValues() {

            $scope.searchParameterForJobList = {
                centerCode: $stateParams.centerCode,
                agentCode: '',
                doNumber: '',
                jobNumber: '',
                custBillNumber: '',
                billType: '',
                cargoType: '',
                houseBLNumber: '',
                importerExporter: '',
                masterBL: '',
                //pageNumber: 1,
                pageSize: 10,
                orderBy: ''
            };

            sharedModels.transactionSearchModel = $scope.searchParameterForJobList;
            sharedModels.transactionSearchModel.TransportMode = $stateParams.transportMode;
            sharedModels.transactionSearchModel.fromShipment = false;
            sharedModels.transactionSearchModel.selectedBLDO = '';
            sharedModels.transactionSearchModel.ddlSelBookingNo = '';
            sharedModels.transactionSearchModel.ddlSelDoNum = '';
            sharedModels.transactionSearchModel.ddlSelJobNum = '';
            sharedModels.transactionSearchModel.ddlSelCustBillNo = '';
            sharedModels.transactionSearchModel.ddlSelValue = '';
            sharedModels.transactionSearchModel.isBLDODisabled = '';

            localStorage.setItem("centerCode_" + $stateParams.transportMode + '_' + $scope.userAccntInfo.CCode, $stateParams.centerCode);
        }

        var successOkay = function () {
            //$('#successModal').modal('hide');
            $timeout(function () {
                $storage.set('storedCenterCodes', null);//Reset the local storage
                setSharedValues();
                $state.go('shipmentAndInvoice', {
                    centerCode: $stateParams.centerCode, jobNumber: $scope.maqasaCreateBill.JobNumber, tab: 'shipmentdetails', Status: 'N'
                },
                    { notify: true });
            }, 300);
        }
        //End Region Methods

        //OnLoad
        $scope.LoadLookupCargoType();
        $scope.LoadLookupCargo();
        $scope.LoadMaqasaReExportCreateBill();
        InitializeValidationMessages();
        ////End Region Maqasa Re Export Create Bill ///////////////

        // back to maqasa reexport search
        $scope.gotoMaqasaReExport = function () {
            $state.go('maqasaReExport', {
                notify: true
            });
        }
        //********* Region : Popups for Container, Chassis, Goods Description and Invoice Details **********////

        // Region Invoice List
        $scope.selectedInvoiceIds = [];
        $scope.selectedInvoiceDetails = [];
        $scope.selectedInvoiceIdsTemp = [];
        $scope.selectedInvoiceDetailsTemp = [];


        $scope.searchParameterInvoice = {
            centerCode: centerCode,
            jobNumber: jobNumber,
            gccYear: $scope.maqasaSrchEntity ? $scope.maqasaSrchEntity.gccYear : '',
            pageNumber: 1,
            pageSize: 5,
            searchString: ''
        };

        $scope.openInvoiceLists = function () {
            $('#maqasaInvoiceDetails').modal({
                backdrop: "static"
            });
            $scope.searchParameterInvoice.pageNumber = 1;
            $scope.searchParameterInvoice.searchString = '';
            $scope.selectedInvoiceDetailsTemp = angular.copy($scope.selectedInvoiceDetails);
            $scope.selectedInvoiceIdsTemp = angular.copy($scope.selectedInvoiceIds);
            $scope.GetInvoiceList();
        }

        $scope.pushOrPopSelectedItem = function (item) {
            var invoices = $scope.selectedInvoiceDetailsTemp;
            if ($scope.selectedInvoiceIdsTemp[item.InvoiceSerialNumber]) {
                $scope.selectedInvoiceDetailsTemp.push(item);
            }
            else {
                for (var i = 0; i < invoices.length; i++)
                    if (invoices[i].InvoiceSerialNumber === item.InvoiceSerialNumber) {
                        $scope.selectedInvoiceDetailsTemp.splice(i, 1);
                        break;
                    }
            }
        }

        $scope.loadMoreInvoiceRecords = function (newPageNo) {
            $scope.searchParameterInvoice.pageNumber = newPageNo;
            $scope.GetInvoiceList();
        }

        $scope.GetInvoiceList = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/ReExport/GetReExportInvoices', $scope.searchParameterInvoice, function (results) {
                $("#loadingScreen").hide();
                $scope.allInvoiceDetailsData = results.data.ResponseResult ? results.data.ResponseResult.Data : null;
                $scope.totalInvCount = $scope.allInvoiceDetailsData && $scope.allInvoiceDetailsData.length > 0 ? $scope.allInvoiceDetailsData[0].TotalCount : 0;
            },
                function error(response) {
                    $("#loadingScreen").hide();
                });
        }

        $scope.saveInvoiceDetails = function () {
            $scope.selectedInvoiceDetails = angular.copy($scope.selectedInvoiceDetailsTemp);
            $scope.selectedInvoiceIds = angular.copy($scope.selectedInvoiceIdsTemp);
            CalculateTotal();
            $('#maqasaInvoiceDetails').modal('hide');
            $scope.ValidateInvoiceDetails();

            $('#invoicebtn').focus();
        }

        function CalculateTotal() {
            $scope.DutyAmount = 0;
            $scope.NetWeight = 0;
            $scope.TotalGrossWeight = 0;
            $scope.TotalQuantity = 0;
            $scope.TotalCIF = 0;
            $scope.VolumeCBM = 0;

            for (var item of $scope.selectedInvoiceDetails) {
                $scope.NetWeight += item.Weight;
                //$scope.TotalGrossWeight += item.GrossWeight;
                $scope.TotalGrossWeight = angular.copy($scope.NetWeight);
                $scope.TotalQuantity += item.Quantity;
                $scope.TotalCIF += item.CIFAmount;
                $scope.VolumeCBM += item.Volume;
                var dutyAmountProduct = item.DutyPercent * item.CIFAmount;
                if (dutyAmountProduct > 0)
                    $scope.DutyAmount += dutyAmountProduct / 100;
            }

            $scope.DutyAmount = Math.round($scope.DutyAmount * 100) / 100; //Round to 3 decimal places
            $scope.TotalCIF = Math.round($scope.TotalCIF * 100) / 100;
            $scope.NetWeight = Math.round($scope.NetWeight * 1000) / 1000;
            $scope.TotalGrossWeight = Math.round($scope.TotalGrossWeight * 1000) / 1000;
            $scope.TotalQuantity = Math.round($scope.TotalQuantity * 1000) / 1000;
            $scope.VolumeCBM = Math.round($scope.VolumeCBM * 1000) / 1000;
        }

        $scope.CalculateTotalOnChange = function (item, itemWeight) {
            //if (itemWeight) {
            //    var invIndex = $scope.selectedInvoiceDetails.findIndex(x => x.InvoiceSerialNumber == item.InvoiceSerialNumber);
            //    var selectedInv = $scope.selectedInvoiceDetails[invIndex];
            //    selectedInv.GrossWeight = itemWeight;
            //}
            CalculateTotal();
        }
        $scope.cancelInvoice = function () {
            $scope.searchParameterInvoice.searchString = '';
            $('#maqasaInvoiceDetails').modal('hide');
            $('#invoicebtn').focus();
        }

        // search Invoice
        $scope.searchInvoice = function () {
            $scope.searchParameterInvoice.pageNumber = 1;
            $scope.GetInvoiceList();
        }


        $scope.openHarmonizeLookup = function (item) {
            $scope.RecordToEdit = item;
            $scope.rowIndex = 0;
            $scope.harmonizedItemSelected = {};
            //$scope.harmonizedItemSelected.ShortHarmCode = item.HarmoniseCode.substring(2);
            $scope.harmonizedItemSelected.ShortHarmCode = item.HarmoniseCode; //This change has been done as per PL Sql team;
            $scope.searchText = $scope.harmonizedItemSelected.ShortHarmCode;
            $('#harmonizeLookup').modal({
                backdrop: "static"
            });
            $('#searchText').focus();
            $('#searchText').select();
            $scope.onHarmonizeChange();
            $("#harmonizeLookup").off("keydown");
            $('#harmonizeLookup').bind('keydown', function (event) {
                console.log(event.keyCode);
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.harmonisedList.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.lookUpCurrentPage - 1) {
                                    $scope.lookUpCurrentPage++;
                                }
                                $scope.harmonizedItemSelected = $scope.harmonisedList[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                                    $scope.lookUpCurrentPage--;
                                }
                                $scope.rowIndex--;
                                $scope.harmonizedItemSelected = $scope.harmonisedList[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setHarmonized($scope.harmonizedItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.populateHarmonized = function () {
            getIndexData('hsCode', '', function (data) {
                $scope.fullHarmonisedList = data
            }, function () {
                apiService.get('Customs/Lookup/HarmonizedCode',
                    {
                        centerCode: centerCode,
                        searchString: '',
                        jobNumber: jobNumber,
                        OriginType: ''
                    },
                    function (results) {
                        $scope.lookUpCurrentPage = 1;
                        $scope.fullHarmonisedList = results.data.ResponseResult.Data;
                        $scope.HarmonizedRequired = false;
                        storeData(results.data.ResponseResult.Data, 'hsCode', '');
                    },
                    function error(response) {
                        console.log(response);
                    });
            });
        }
        $scope.populateHarmonized();

        $scope.onHarmonizeChange = function () {
            $scope.rowIndex = 0;
            $scope.searchText;
            $scope.lookUpCurrentPage = 1;
            $scope.harmonisedList = $scope.fullHarmonisedList.filter(obj => {
                return obj.ShortHarmCode.includes($scope.searchText.toLowerCase()) || (obj.HarmonizeEngName && obj.HarmonizeEngName.toLowerCase().includes($scope.searchText))
                    || (obj.HarmonizeArbName && obj.HarmonizeArbName.toLowerCase().includes($scope.searchText));
            });
            $scope.HarmonizedRequired = false;
        }

        $scope.setHarmonized = function (row, serial) {
            $scope.RecordToEdit.HarmoniseCode = row.ShortHarmCode;
            $scope.RecordToEdit.UnitCode = row.UnitCode;
            $("#harmonizeLookup").modal("hide");
            $('#' + $scope.RecordToEdit.InvoiceSerialNumber + '_Weight').focus();
        }
        $scope.setfocusForWeight = function () {
            if ($scope.RecordToEdit) {
                $('#' + $scope.RecordToEdit.InvoiceSerialNumber + '_Weight').focus();
            }
        }
        //End Region

        //**********Region Import Chassis **************////

        $scope.searchChassisParameter = {
            centerCode: centerCode,
            jobNumber: jobNumber,
            pageNumber: 1,
            pageSize: 5,
            searchString: ''
        };

        $scope.selectedChassisIds = {
        };
        $scope.selectedChassisDetails = [];
        $scope.selectedChassisIdsTemp = {
        };
        $scope.selectedChassisDetailsTemp = [];

        $scope.openChassisLists = function () {
            $('#maqasaChassisDetails').modal({
                backdrop: "static"
            });
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.searchChassisParameter.searchString = '';
            $scope.selectedChassisDetailsTemp = angular.copy($scope.selectedChassisDetails);
            $scope.selectedChassisIdsTemp = angular.copy($scope.selectedChassisIds);
            $scope.GetChassisList();
        }

        $scope.pushOrPopSelectedChassis = function (item) {
            var chassis = $scope.selectedChassisDetailsTemp;
            if ($scope.selectedChassisIdsTemp[item.ChassisNumber]) {
                $scope.selectedChassisDetailsTemp.push(item);
            }
            else {
                for (var i = 0; i < chassis.length; i++)
                    if (chassis[i].ChassisNumber === item.ChassisNumber) {
                        $scope.selectedChassisDetailsTemp.splice(i, 1);
                        break;
                    }
            }
        }

        $scope.loadMoreChassisRecords = function (newPageNo) {
            $scope.searchChassisParameter.pageNumber = newPageNo;
            $scope.GetChassisList();
        }

        $scope.GetChassisList = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/ReExport/GetReExportChassis', $scope.searchChassisParameter, function (results) {
                $("#loadingScreen").hide();

                $scope.allChassisDetailsData = results.data.ResponseResult ? results.data.ResponseResult.Data : null;
                $scope.totalCountChassis = ($scope.allChassisDetailsData && $scope.allChassisDetailsData.length > 0) ? $scope.allChassisDetailsData[0].TotalCount : 0;

            },
                function error(response) {
                    $("#loadingScreen").hide();
                });
        }

        $scope.saveChassisDetails = function () {
            $scope.selectedChassisDetails = angular.copy($scope.selectedChassisDetailsTemp);
            $scope.selectedChassisIds = angular.copy($scope.selectedChassisIdsTemp);
            $('#maqasaChassisDetails').modal('hide');
            $scope.ValidateImportDetails();
            $('#chassisbtn').focus();
        }

        $scope.cancelChassis = function () {
            $scope.searchChassisParameter.searchString = '';
            $('#maqasaChassisDetails').modal('hide');
            $('#chassisbtn').focus();
        }

        // search Chassis
        $scope.searchChassis = function () {
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.GetChassisList();
        }

        //End Region : Import Chassis

        //**********Region Import Cargo **************////
        $scope.selectedCargoIds = {
        };
        $scope.selectedCargoDetails = [];
        $scope.selectedCargoIdsTemp = {
        };
        $scope.selectedCargoDetailsTemp = [];

        $scope.openDescriptionImportLists = function () {
            $('#maqasaCargoDetails').modal({
                backdrop: "static" 
            });
            $scope.validCargoDesc = true;
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.searchChassisParameter.searchString = '';
            $scope.selectedCargoDetailsTemp = angular.copy($scope.selectedCargoDetails);
            $scope.selectedCargoIdsTemp = angular.copy($scope.selectedCargoIds);
            $scope.GetCargoList();
        }
      
        $scope.pushOrPopSelectedCargo = function (item) {
            var cargo = $scope.selectedCargoDetailsTemp;
            if ($scope.selectedCargoIdsTemp[item.CargoDescription]) {
                $scope.selectedCargoDetailsTemp.push(item);
            }
            else {
                for (var i = 0; i < cargo.length; i++)
                    if (cargo[i].CargoDescription === item.CargoDescription) {
                        $scope.selectedCargoDetailsTemp.splice(i, 1);
                        break;
                    }
            }
        }

        $scope.GetCargoList = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/ReExport/GetReExportCargos', $scope.searchChassisParameter, function (results) {
                $("#loadingScreen").hide();
                $scope.allCargoDetailsData = results.data.ResponseResult ? results.data.ResponseResult.Data : null;
                $scope.totalCountCargo = $scope.allCargoDetailsData ? $scope.allCargoDetailsData[0].TotalCount : 0;
            },
                function error(response) {
                    $("#loadingScreen").hide();
                });
        }

        $scope.saveCargoDetails = function () {
            $scope.selectedCargoDetails = angular.copy($scope.selectedCargoDetailsTemp);
            $scope.selectedCargoIds = angular.copy($scope.selectedCargoIdsTemp);
            $('#maqasaCargoDetails').modal('hide');
            $scope.ValidateImportDetails();
            //$('#cargoDesc_0').focus();
            $('#cargobtn').focus();
        }
        $scope.loadMoreCargoRecords = function (newPageNo) {
            $scope.cargoParameters.pageNumber = newPageNo;
            $scope.GetCargoList();
        }
        $scope.cancelCargo = function () {
            $scope.searchChassisParameter.searchString = '';
            $('#maqasaCargoDetails').modal('hide');
            $('#cargobtn').focus();
        }
       
        $scope.validateCargo = function (cargoDescription) {
            $scope.validCargoDesc = (cargoDescription && cargoDescription.length > 70) ? false : true;
        }

        // search Cargo
        $scope.searchCargo = function () {
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.GetCargoList();
        }

        //End Region : Import Cargo

        //**********Region Import Container **************////

        $scope.selectedContainerIds = {
        };
        $scope.selectedContainerDetails = [];
        $scope.selectedContainerIdsTemp = {
        };
        $scope.selectedContainerDetailsTemp = [];

        $scope.openContainerLists = function () {
            $('#maqasaContainerDetails').modal({
                backdrop: "static"
            });
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.searchChassisParameter.searchString = '';
            $scope.selectedContainerDetailsTemp = angular.copy($scope.selectedContainerDetails);
            $scope.selectedContainerIdsTemp = angular.copy($scope.selectedContainerIds);
            $scope.GetContainerList();
        }

        $scope.pushOrPopSelectedContainer = function (item) {
            var container = $scope.selectedContainerDetailsTemp;
            if ($scope.selectedContainerIdsTemp[item.ContainerNumber]) {
                $scope.selectedContainerDetailsTemp.push(item);
            }
            else {
                for (var i = 0; i < container.length; i++)
                    if (container[i].ContainerNumber === item.ContainerNumber) {
                        $scope.selectedContainerDetailsTemp.splice(i, 1);
                        break;
                    }
            }
        }

        $scope.loadMoreContainerRecords = function (newPageNo) {
            $scope.searchChassisParameter.pageNumber = newPageNo;
            $scope.GetContainerList();
        }

        $scope.GetContainerList = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/ReExport/GetReExportContainer', $scope.searchChassisParameter, function (results) {
                $("#loadingScreen").hide();

                $scope.allContainerDetailsData = results.data.ResponseResult ? results.data.ResponseResult.Data : null;
                $scope.totalCountContainer = ($scope.allContainerDetailsData && $scope.allContainerDetailsData.length > 0) ? $scope.allContainerDetailsData[0].TotalCount : 0;

            },
                function error(response) {
                    $("#loadingScreen").hide();
                });
        }

        $scope.saveContainerDetails = function () {
            $scope.selectedContainerDetails = angular.copy($scope.selectedContainerDetailsTemp);
            $scope.selectedContainerIds = angular.copy($scope.selectedContainerIdsTemp);
            $('#maqasaContainerDetails').modal('hide');
            $scope.ValidateImportDetails();
            $('#containerbtn').focus();
        }

        $scope.cancelContainer = function () {
            $scope.searchChassisParameter.searchString = '';
            $('#maqasaContainerDetails').modal('hide');
            $('#containerbtn').focus();
            
        }

        // search Container
        $scope.searchContainer = function () {
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.GetContainerList();
        }

        //End Region : Import Container


        $scope.searchImportByDefault = function (searchBy) {
            switch (searchBy) {
                case "containerNo":
                    if (!$scope.searchChassisParameter.searchString) { $scope.GetContainerList(); }
                    break;
                case "chassisNo":
                    if (!$scope.searchChassisParameter.searchString) { $scope.GetChassisList(); }
                    break;
                case "cargoDesc":
                    if (!$scope.searchChassisParameter.searchString) { $scope.GetCargoList(); }
                    break;
                case "hsCode":
                    if (!$scope.searchParameterInvoice.searchString) { $scope.GetInvoiceList(); }
                    break;
                default:
                    break;
            }

        }

        //Lookup Enhancement

        $scope.searchResults = function () {
            $scope.searchChassisParameter.pageNumber = 1;
            $scope.PopulateImporterExporters();
        }
        $scope.searchShipperText = '';

        $scope.shipperKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openShipperLookup();
            }
        }

        $scope.PopulateShippers = function (searchStr) {
            apiService.get('Customs/Lookup/GetMaqasaImporter',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.shipperFull = results.data.ResponseResult.Data;
                    $scope.shippers = angular.copy($scope.shipperFull);
                },
                function error(response) {
                    console.log("An Error has occurred while getting lookup Data Shippers!");
                });
        }

        $scope.clearSearchFilters = function () {
            initializeImporterSearchParameters();
            $scope.importersExporters = '';
            $scope.totalCount = 0;
        }
        //Importer/Exporter
        //--------------------
        function initializeImporterSearchParameters() {
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
        $scope.setImporterExporter = function (row) {

            $scope.shipper = row.ImporterCode.toString() + "     " + (row.ImporterDescEng ? row.ImporterDescEng : '') + "     " + (row.ImporterDescArb ? row.ImporterDescArb : '');
            $scope.shipperObj = {};
            $scope.shipperObj.originalObject = {};
            $scope.shipperObj.originalObject.ImporterCode = row.ImporterCode;
            $scope.shipperObj.originalObject.ImporterEngName = row.ImporterDescEng;
            $scope.shipperObj.originalObject.ImporterArbName = row.ImporterDescArb;
            $scope.validShipper = true;
            $("#importerExporterLookup").modal("hide");
            $('#shipper').focus();
        }
        $scope.openShipperLookup = function (item) {
            GetCategoryCodes();
            $scope.clearSearchFilters();
            $('#importerExporterLookup').modal({
                backdrop: "static"
            });
        }

        $scope.onShipperChange = function (searchStr) {
            $scope.shipperRowIndex = 0;
            $scope.shipperCurrentPage = 1;
            $scope.PopulateShippers(searchStr);
        }

        $scope.setShipper = function (row) {
            $scope.shipper = row.ImporterCode.toString() + "     " + (row.ImporterEngName ? row.ImporterEngName : '') + "     " + (row.ImporterArbName ? row.ImporterArbName : '');
            $scope.shipperObj = {};
            $scope.shipperObj.originalObject = angular.copy(row);
            $scope.validShipper = true;
            $("#shipperLookup").modal("hide");
            $('#shipper').focus();
        }


        //To set default importer for private company
        //Private Company Default Values
        $scope.getDefaultImporterForPrivateCompany = function () {
            var companyCode = ($scope.userAccntDetails && $scope.userAccntDetails.UCode) ? $scope.userAccntDetails.UCode.slice(1) : null;
            if (companyCode)
                $scope.AddShipper(companyCode);
        }
        if ($storage.get('isPrivateCompany')) {
            $scope.getDefaultImporterForPrivateCompany();
        }
        //$scope.PopulateShippers();

        $scope.$watch("searchShipperText", function () {
            $scope.onShipperChange($scope.searchShipperText);
        });

        //Discharge port lookup
        $scope.searchDischargePortText = '';

        $scope.dischargePortKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openDischargePortLookup();
            }
        }

        $scope.PopulateDischargePorts = function () {
            //getIndexData('Ports', '', function (data) {
            //    $scope.dischargePorts = $scope.fullDischargePorts = data;
            //}, function () {
            //$scope.stoppedSearch = false;
            //apiService.get('Customs/Lookup/Ports',
            //   {
            //       centerCode: $stateParams.centerCode,
            //       searchString: ''
            //   },
            //   function (results) {
            //       $scope.dischargePorts = $scope.fullDischargePorts = results.data.ResponseResult.Data;
            //       $scope.stoppedSearch = true;
            //       storeData(results.data.ResponseResult.Data, 'Ports', '');
            //   },
            //   function error(response) {
            //       console.log(response);
            //       $scope.stoppedSearch = true;
            //   });
            //});

            //In order to bring in country name, new look up is using for discharge port

            getIndexData('CustPortCode', '', function (data) {
                $scope.dischargePorts = $scope.fullDischargePorts = data;
            }, function () {
                apiService.get('Customs/Lookup/ShortManifestPort',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: '',
                    },
                    function (results) {
                        //$scope.lookUpCurrentPage = 1;
                        $scope.dischargePorts = $scope.fullDischargePorts = results.data.ResponseResult.Data;
                        storeData(results.data.ResponseResult.Data, 'CustPortCode', '');
                    },
                    function error(response) {
                        console.log(response);
                    });
            });

        }
        $scope.portChange = function (code, name, country) {
            $scope.dischargePortRowIndex = 0;
            $scope.dischargePortCurrentPage = 1;
            $scope.dischargePorts = angular.copy($scope.fullDischargePorts);
            if (code) {
                $scope.dischargePorts = $scope.fullDischargePorts.filter(obj => {
                    return obj.PortCode.toLowerCase().includes(code.toLowerCase());
                });
            }
            else if (name) {
                $scope.dischargePorts = $scope.fullDischargePorts.filter(obj => {
                    if (obj.PortName) {
                        return obj.PortName.toLowerCase().includes(name.toLowerCase());
                    }
                });
            }
            else if (country) {
                $scope.dischargePorts = $scope.fullDischargePorts.filter(obj => {
                    return obj.CountryName.toLowerCase().includes(country.toLowerCase());
                });
            }
        }
        $scope.openDischargePortLookup = function (item) {
            $scope.searchDischargePortCode = '';
            $scope.searchDischargePortName = '';
            $scope.searchDischargePortCountry = '';
            $('#dischargePortLookupModal').modal({
                backdrop: "static"
            });
            $('#searchDischargePortText').focus();
            $('#searchDischargePortText').select();
            //$scope.onDischargePortChange($scope.searchDischargePortText);
            $scope.portChange();
            $("#dischargePortLookupModal").off("keydown");
            $('#dischargePortLookupModal').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.dischargePortRowIndex < $scope.dischargePorts.length - 1) {
                                $scope.dischargePortRowIndex++;
                                if ($scope.dischargePortRowIndex > 10 * $scope.dischargePorts - 1) {
                                    $scope.dischargePortCurrentPage++;
                                }
                                $scope.dischargePortItemSelected = $scope.dischargePorts[$scope.dischargePortRowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.dischargePortRowIndex > 0) {

                                if ($scope.dischargePortRowIndex == 10 * ($scope.dischargePortCurrentPage - 1)) {
                                    $scope.dischargePortCurrentPage--;
                                }
                                $scope.dischargePortRowIndex--;
                                $scope.dischargePortItemSelected = $scope.dischargePorts[$scope.dischargePortRowIndex];
                            }
                            break;
                        case 13:
                            $scope.setDischargePort($scope.dischargePortItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.onDischargePortChange = function (searchStr) {
            $scope.dischargePortRowIndex = 0;
            $scope.dischargePortCurrentPage = 1;
            var searchTextLowerCase = $scope.searchDischargePortText.toLowerCase();
            if ($scope.fullDischargePorts) {
                $scope.dischargePorts = $scope.fullDischargePorts.filter(obj => {
                    return obj.Code.toLowerCase().includes(searchTextLowerCase) || (obj.PortNameEnglish && obj.PortNameEnglish.toLowerCase().includes(searchTextLowerCase))
                        || (obj.PortNameArabic && obj.PortNameArabic.toLowerCase().includes(searchTextLowerCase));
                });
            }
        }

        $scope.setDischargePort = function (row) {
            $scope.dischargePort = row.PortCode.toString() + "     " + (row.PortName ? row.PortName : '') + "     " + (row.CountryName ? row.CountryName : '');
            $scope.dischargePortObj = {};
            $scope.dischargePortObj.originalObject = angular.copy(row);
            $scope.validDischargePort = true;
            $("#dischargePortLookupModal").modal("hide");
            $('#dischargePortLookup_value').focus();
        }

        $scope.PopulateDischargePorts();

        $scope.$watch("searchDischargePortText", function () {
            if ($scope.searchDischargePortText)
                $scope.onDischargePortChange($scope.searchDischargePortText);
        });
        $scope.closeDischargePort = function () {
            $('#dischargePortLookup_value').focus();
        }
        //GenericLookup Methods Begin

        $scope.setLookupData = function (row, lookupId) {
            switch (lookupId) {
                case 'Unit':
                    $scope.unit = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.unitObj = {};
                    $scope.unitObj.originalObject = angular.copy(row);
                    $scope.validUnit = true;
                    $('#unitLookup').focus();
                    break;
                case 'VesselType':
                    $scope.selectedVesselType = row.VesselCode.toString() + "     " + (row.VesselEngName ? row.VesselEngName : '') + "     " + (row.VesselArbName ? row.VesselArbName : '');
                    $scope.vesselTypeObj = {};
                    $scope.vesselTypeObj.originalObject = angular.copy(row);
                    $scope.validVesselType = true;
                    $('#vesselTypeLookup_value').focus();
                    break;
            }
            $("#genericLookUp").modal("hide");
        }

        $scope.populateLookupData = function (lookupId) {
            switch (lookupId) {
                case 'Unit':
                    break;
                case 'VesselType':
                    break;
            }
        }

        $scope.onLookupSearhChange = function () {
            var searchText = $("#searchLookupText").val().toLowerCase();
            $timeout(function () {
                switch ($scope.lookupId) {
                    case 'Unit':
                        $scope.lookUpCurrentPage = 1;
                        if ($scope.units) {
                            $scope.lookUpData = $scope.units.filter(obj => {
                                return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                    || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                            });
                        }
                        break;
                    case 'VesselType':
                        $scope.lookUpCurrentPage = 1;
                        if ($scope.vesselTypes) {
                            $scope.lookUpData = $scope.vesselTypes.filter(obj => {
                                return obj.VesselCode.toString().toLowerCase().includes(searchText) || (obj.VesselEngName && obj.VesselEngName.toLowerCase().includes(searchText))
                                    || (obj.VesselArbName && obj.VesselArbName.toLowerCase().includes(searchText));
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
                    case 'Unit':
                        $scope.lookUpTitle = $filter("translate")("Unit");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                        $scope.lookUpData = $scope.units;
                        break;
                    case 'VesselType':
                        $scope.lookUpTitle = $filter("translate")("VesselType");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                        $scope.lookUpData = $scope.vesselTypes;
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
    }]);