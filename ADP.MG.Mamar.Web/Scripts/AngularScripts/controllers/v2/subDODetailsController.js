angular.module('mamarApp').controller('subDODetailsController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$filter', '$timeout', '$http', 'apiService', '$storage', '$log', 'userAccountStorageFactory', 'paginationService',
        function ($scope, $rootScope, $state, $stateParams, $filter, $timeout, $http, apiService, $storage, $log, userAccountStorageFactory, paginationService) {

            $scope.$storage = $storage;

            $scope.resetDODate = () => {
                $scope.doDate = '';
                $scope.doExpiryDate = '';
            }

            $scope.masterBLChange = function () {
                $scope.isMasterBLEdit = false;
                if ($scope.initialMasterBL && ($scope.initialMasterBL != $scope.subDODetails.MasterBLNumber)) {
                    $scope.isMasterBLEdit = true;
                }
            }

            //Back to listing
            $scope.showSubDOList = () => {
                $storage.set('storedManifestInformation', '');
                $state.go("consolidatorManifestUpload");
            }

            //reset search Parameters
            function resetSearchParameters() {
                $scope.params = {
                    centerCode: $stateParams.centerCode,
                    doNumber: '',
                    agentCode: $stateParams.agentCode,
                    vesselCode: '',
                    voyageNumber: '',
                    masterBL: '',
                    houseBL: '',
                    arrivalDate: '',
                    billType: ''
                };
            }

            //Bind Data in UI 
            function bindSubDODetails() {
                //BL Details
                $scope.billType = $scope.subDODetails.BillTypeCode + ' ' + $scope.subDODetails.BillTypeEngName + ' ' + $scope.subDODetails.BillTypeArbName;
                $scope.vessel = $scope.subDODetails.VesselCode + ' ' + $scope.subDODetails.VesselNameEng + ' ' + $scope.subDODetails.VesselNameArb;
                $scope.selectedVessel = {
                };
                $scope.selectedVessel.originalObject = {
                };
                $scope.selectedVessel.originalObject.Code = $scope.subDODetails ? $scope.subDODetails.VesselCode : null;
                $scope.selectedVessel.originalObject.VesselNameEnglish = $scope.subDODetails ? $scope.subDODetails.VesselNameEng : null;
                $scope.selectedVessel.originalObject.VesselNameArabic = $scope.subDODetails ? $scope.subDODetails.VesselNameArb : null;

                $scope.VoyageArrivalDate = $filter('date')((new Date($scope.subDODetails.VoyageArrivalDate)), 'dd/MM/yyyy');

                $scope.CustomBillDate = ($scope.subDODetails.CustBillDate) ? $filter('date')((new Date($scope.subDODetails.CustBillDate)), 'dd/MM/yyyy') : '';
                //Port Lookup formatted Data
                $scope.port = $scope.subDODetails.PortCode ? $scope.subDODetails.PortCode + "     " : "";
                $scope.port = $scope.port + ($scope.subDODetails.PortNameEng ? $scope.subDODetails.PortNameEng + "     " : "");
                $scope.port = $scope.port + ($scope.subDODetails.PortNameArb ? $scope.subDODetails.PortNameArb : "");

                $scope.selectedPort = {
                };
                $scope.selectedPort.originalObject = {
                };

                $scope.selectedPort.originalObject.Code = $scope.subDODetails ? $scope.subDODetails.PortCode : null;
                $scope.selectedPort.originalObject.PortNameEnglish = $scope.subDODetails ? $scope.subDODetails.PortNameEng : null;
                $scope.selectedPort.originalObject.PortNameArabic = $scope.subDODetails ? $scope.subDODetails.PortNameArb : null;


                //Unit Lookup formatted Data
                $scope.unit = $scope.subDODetails.UnitCode ? $scope.subDODetails.UnitCode + "     " : "";
                $scope.unit = $scope.unit + ($scope.subDODetails.UnitNameEng ? $scope.subDODetails.UnitNameEng + "     " : "");
                $scope.unit = $scope.unit + ($scope.subDODetails.UnitNameArb ? $scope.subDODetails.UnitNameArb : "");

                $scope.selectedUnit = {
                };
                $scope.selectedUnit.originalObject = {
                };

                $scope.selectedUnit.originalObject.Code = $scope.subDODetails ? $scope.subDODetails.UnitCode : null;
                $scope.selectedUnit.originalObject.EnglishName = $scope.subDODetails ? $scope.subDODetails.UnitNameEng : null;
                $scope.selectedUnit.originalObject.ArabicName = $scope.subDODetails ? $scope.subDODetails.UnitNameArb : null;


                //DO Details
                $scope.doDate = $scope.subDODetails.DODate ? $filter('date')((new Date($scope.subDODetails.DODate)), 'dd/MM/yyyy') : '';
                $scope.doExpiryDate = $scope.subDODetails.DOExpiryDate ? $filter('date')((new Date($scope.subDODetails.DOExpiryDate)), 'dd/MM/yyyy') : '';

                //Cargo Agent Lookup formatted Data
                $scope.manifestCargoAgent = $scope.subDODetails.DOCargoAgentCode ? $scope.subDODetails.DOCargoAgentCode + "     " : "";
                $scope.manifestCargoAgent = $scope.manifestCargoAgent + ($scope.subDODetails.DOCargoAgentEngName ? $scope.subDODetails.DOCargoAgentEngName + "     " : "");
                $scope.manifestCargoAgent = $scope.manifestCargoAgent + ($scope.subDODetails.DOCargoAgentArbName ? $scope.subDODetails.DOCargoAgentArbName : "");

                $scope.selectedCargoAgent = {
                };
                $scope.selectedCargoAgent.originalObject = {
                };

                $scope.selectedCargoAgent.originalObject.CargoAgentCode = $scope.subDODetails ? $scope.subDODetails.DOCargoAgentCode : null;
                $scope.selectedCargoAgent.originalObject.CargoAgentEngName = $scope.subDODetails ? $scope.subDODetails.DOCargoAgentEngName : null;
                $scope.selectedCargoAgent.originalObject.CargoAgentArbName = $scope.subDODetails ? $scope.subDODetails.DOCargoAgentArbName : null;

                //ManifestConsignee Lookup formatted Data
                $scope.manifestConsignee = $scope.subDODetails.ImporterCode ? $scope.subDODetails.ImporterCode + "     " : "";
                $scope.manifestConsignee = $scope.manifestConsignee + ($scope.subDODetails.ImporterEngName ? $scope.subDODetails.ImporterEngName + "     " : "");
                $scope.manifestConsignee = $scope.manifestConsignee + ($scope.subDODetails.SAY_IMPORTER_ENG1 ? $scope.subDODetails.SAY_IMPORTER_ENG1 : "");

                $scope.selectedConsignee = {
                };
                $scope.selectedConsignee.originalObject = {
                };
                $scope.selectedConsignee.originalObject.ImporterCode = $scope.subDODetails ? $scope.subDODetails.ImporterCode : null;
                $scope.selectedConsignee.originalObject.ImporterEngName = $scope.subDODetails ? $scope.subDODetails.ImporterEngName : null;
                $scope.selectedConsignee.originalObject.ImporterArbName = $scope.subDODetails ? $scope.subDODetails.SAY_IMPORTER_ENG1 : null;

                //Freight Currency Lookup formatted Data
                $scope.manifestFreightCurrency = $scope.subDODetails.CurrencyCode ? $scope.subDODetails.CurrencyCode + "     " : "";
                $scope.manifestFreightCurrency = $scope.manifestFreightCurrency + ($scope.subDODetails.CurrencyEng ? $scope.subDODetails.CurrencyEng + "     " : "");
                $scope.manifestFreightCurrency = $scope.manifestFreightCurrency + ($scope.subDODetails.CurrencyArb ? $scope.subDODetails.CurrencyArb : "");

                $scope.selectedFreightCurrency = {
                };
                $scope.selectedFreightCurrency.originalObject = {
                };
                $scope.selectedFreightCurrency.originalObject.Code = $scope.subDODetails ? $scope.subDODetails.CurrencyCode : null;
                $scope.selectedFreightCurrency.originalObject.NameEnglish = $scope.subDODetails ? $scope.subDODetails.CurrencyEng : null;
                $scope.selectedFreightCurrency.originalObject.NameArabic = $scope.subDODetails ? $scope.subDODetails.CurrencyArb : null;

                $scope.initialMasterBL = $scope.subDODetails.MasterBLNumber;
            }

            //Get sub DO Details
            function getSubDODetails() {
                resetSearchParameters();
                var manifestInformation = $storage.get('storedManifestInformation');
                if (manifestInformation) {
                    var arrivalDate = manifestInformation.ArrivalDate ? $filter('date')((new Date(manifestInformation.ArrivalDate)), 'dd/MM/yyyy') : manifestInformation.arrivalDate;
                    $scope.params.vesselCode = manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : '';
                    $scope.params.voyageNumber = manifestInformation.VoyageNumber;
                    $scope.params.masterBL = manifestInformation.MasterBlNumber;
                    $scope.params.houseBL = manifestInformation.HouseBlNumber;
                    $scope.params.arrivalDate = arrivalDate;
                    $scope.params.billType = manifestInformation.BillType;
                    $("#loadingScreen").show();
                    apiService.get('Customs/DeliveryOrder/ShipmentDetailByDO', $scope.params,
                        function (results) {
                            $("#loadingScreen").hide();
                            var data = results.data.ResponseResult;
                            if (data && data.data && data.data.length > 0) {

                                $scope.subDODetails = data.data[0];
                                $scope.originalsubDODetails = angular.copy($scope.subDODetails);
                                if ($scope.subDODetails) {
                                    bindSubDODetails();
                                }
                            }

                        },
                        function error(response) {
                            $("#loadingScreen").hide();
                            $log.log('' + response);
                        });
                }
                else {
                    $scope.subDODetails = {};
                }
            }

            ///Lookup
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
                $scope.port = row.Code.toString() + "     " + (row.PortNameEnglish ? row.PortNameEnglish : '') + "     " + (row.PortNameArabic ? row.PortNameArabic : '');
                $scope.selectedPort = {};
                $scope.selectedPort.originalObject = row;
                $("#shippingOriginDestinationLookup").modal("hide");
                $("#ddlPorts_value").attr("tabindex", "5");
                $('#ddlPorts_value').focus();
            }
            $scope.$watchCollection("searchShippingOriginDestinationText", function () {
                if ($scope.searchShippingOriginDestinationText)
                    $scope.onShippingOriginDestinationChange($scope.searchShippingOriginDestinationText);
            });

            $scope.closeShippingOriginDestination = function () {
                $scope.searchShippingOriginDestinationText = '';
            }
            ///Shipping Origin/Destination/////////

            ///Cargo Type Dropdown/////////
            $scope.LoadLookupCargoType = function () {
                getIndexData('cargoTypes', '', function (data) {
                    $scope.cargoTypes = data;
                    $scope.subDODetails.CargoType = ($scope.cargoTypes && $scope.cargoTypes.length > 0) ? $scope.cargoTypes[0].Code : '';
                    //$scope.$apply();
                }, function () {
                    $scope.lkCargoTypeParameter = {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    };
                    apiService.get('Customs/Lookup/CargoTypes', $scope.lkCargoTypeParameter, function (results) {
                        $scope.cargoTypes = results.data.ResponseResult.Data;
                        $scope.subDODetails.CargoType = ($scope.cargoTypes && $scope.cargoTypes.length > 0) ? $scope.cargoTypes[0].Code : '';
                        //$scope.$apply();
                        storeData(results.data.ResponseResult.Data, 'cargoTypes', '');
                    },
                        function error(response) {
                            console.log(response);
                        });
                });
            }

            /////////
            ///Cargo Agent Lookup
            $scope.PopulateCargoAgents = function () {
                apiService.get('Customs/Lookup/ManifestCargoAgents',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.cargoAgentsFull = results.data.ResponseResult.Data;
                        $scope.cargoAgents = angular.copy($scope.cargoAgentsFull);
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data in PopulateCargoAgents!");
                    });
            }

            $scope.openCargoAgentLookup = function (item) {
                $scope.searchCargoAgentText = '';
                $('#cargoAgentLookup').modal({
                    backdrop: "static"
                });
                $('#searchCargoAgentText').focus();
                $('#searchCargoAgentText').select();
                $scope.onCargoAgentChange();
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

            $scope.onCargoAgentChange = function () {
                $scope.rowIndex = 0;
                $scope.lookUpCurrentPage = 1;
                if ($scope.cargoAgentsFull) {
                    $scope.cargoAgents = $scope.cargoAgentsFull.filter(obj => {
                        return obj.CargoAgentCode.toString().toLowerCase().includes($scope.searchCargoAgentText.toLowerCase()) || (obj.CargoAgentEngName && obj.CargoAgentEngName.toLowerCase().includes($scope.searchCargoAgentText.toLowerCase()))
                            || (obj.CargoAgentArbName && obj.CargoAgentArbName.toLowerCase().includes($scope.searchCargoAgentText.toLowerCase()));
                    });
                }
            }
            $scope.setCargoAgent = function (row) {
                $scope.manifestCargoAgent = row.CargoAgentCode.toString() + "     " + (row.CargoAgentEngName ? row.CargoAgentEngName : '') + "     " + (row.CargoAgentArbName ? row.CargoAgentArbName : '');
                $scope.selectedCargoAgent = {};
                $scope.selectedCargoAgent.originalObject = row;
                $("#cargoAgentLookup").modal("hide");
                $("#subDOCargoAgents_value").attr("tabindex", "20");
                $('#subDOCargoAgents_value').focus();
            }
            $scope.$watch("searchCargoAgentText", function () {
                $scope.onCargoAgentChange();
            });
            $scope.cargoAgentKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openCargoAgentLookup();
                }
            }
            ////Consignee
            $scope.PopulateConsignees = function (searchStr) {
                apiService.get('Customs/Lookup/ManifestImporters',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.consigneesFull = results.data.ResponseResult.Data;
                        $scope.consignees = angular.copy($scope.consigneesFull);
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data in PopulateConsignees!");
                    });
            }

            $scope.openConsigneeLookup = function (item) {
                $scope.searchConsigneeText = '';
                $('#consigneeLookup').modal({
                    backdrop: "static"
                });
                $('#searchConsigneeText').focus();
                $('#searchConsigneeText').select();
                $scope.onConsigneeChange($scope.searchConsigneeText);
                $("#consigneeLookup").off("keydown");
                $('#consigneeLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndexConsignee < $scope.consigneesFull.length - 1) {
                                    $scope.rowIndexConsignee++;
                                    if ($scope.rowIndexConsignee > 10 * $scope.consigneesFull - 1) {
                                        $scope.lookUpCurrentPageConsignee++;
                                    }
                                    $scope.consigneeItemSelected = $scope.consigneesFull[$scope.rowIndexConsignee];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndexConsignee > 0) {

                                    if ($scope.rowIndexConsignee == 10 * ($scope.lookUpCurrentPageConsignee - 1)) {
                                        $scope.lookUpCurrentPageConsignee--;
                                    }
                                    $scope.rowIndexConsignee--;
                                    $scope.consigneeItemSelected = $scope.consigneesFull[$scope.rowIndexConsignee];
                                }
                                break;
                            case 13:
                                $scope.setConsignee($scope.consigneeItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onConsigneeChange = function (searchStr) {
                $scope.rowIndexConsignee = 0;
                $scope.lookUpCurrentPageConsignee = 1;
                $scope.PopulateConsignees(searchStr);
                //if ($scope.consigneesFull) {
                //    $scope.searchConsigneeText = $scope.searchConsigneeText ? $scope.searchConsigneeText : '';
                //    $scope.consignees = $scope.consigneesFull.filter(obj => {
                //        return obj.ImporterCode.toString().toLowerCase().includes($scope.searchConsigneeText) || (obj.ImporterEngName && obj.ImporterEngName.toLowerCase().includes($scope.searchConsigneeText.toLowerCase()))
                //            || (obj.ImporterArbName && obj.ImporterArbName.toLowerCase().includes($scope.searchConsigneeText.toLowerCase()));
                //    });
                //}
            }
            $scope.setConsignee = function (row) {
                $scope.manifestConsignee = row.ImporterCode.toString() + "     " + (row.ImporterEngName ? row.ImporterEngName : '') + "     " + (row.ImporterArbName ? row.ImporterArbName : '');
                $scope.selectedConsignee = {};
                $scope.selectedConsignee.originalObject = row;
                $("#consigneeLookup").modal("hide");
                $("#ImporterExporter_value").attr("tabindex", "22");
                $('#ImporterExporter_value').focus();
            }
            $scope.$watch("searchConsigneeText", function () {
                if ($scope.searchConsigneeText)
                    $scope.onConsigneeChange($scope.searchConsigneeText);
            });

            /// F9 key down event
            $scope.manifestConsigneeKeyDown = function (event, item) {
                if (event.key == 'F9') {
                    $scope.openConsigneeLookup(item);
                }
            }
            ///////////
            ///Freight Currency
            $scope.PopulateFreightCurrency = function () {
                $scope.stoppedSearch = false;
                apiService.get('Customs/Lookup/Currencies',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.freightCurrencyFull = results.data.ResponseResult.Data;
                        $scope.freightCurrencies = angular.copy($scope.freightCurrencyFull);
                        $scope.stoppedSearch = true;
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data in PopulateCargoAgents!");
                        $scope.stoppedSearch = true;
                    });
            }

            $scope.openFreightCurrencyLookup = function (item) {
                $scope.searchFreightCurrencyText = '';
                $('#freightCurrencyLookup').modal({
                    backdrop: "static"
                });
                $('#searchFreightCurrencyText').focus();
                $('#searchFreightCurrencyText').select();
                $scope.onFreightCurrencyChange();

                $("#freightCurrencyLookup").off("keydown");
                $('#freightCurrencyLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndexFreightCurrency < $scope.freightCurrencyFull.length - 1) {
                                    $scope.rowIndexFreightCurrency++;
                                    if ($scope.rowIndexFreightCurrency > 10 * $scope.freightCurrencyFull - 1) {
                                        $scope.lookUpCurrentPageFreightCurrency++;
                                    }
                                    $scope.freightCurrencyItemSelected = $scope.freightCurrencyFull[$scope.rowIndexFreightCurrency];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndexFreightCurrency > 0) {

                                    if ($scope.rowIndexFreightCurrency == 10 * ($scope.lookUpCurrentPageFreightCurrency - 1)) {
                                        $scope.lookUpCurrentPageFreightCurrency--;
                                    }
                                    $scope.rowIndexFreightCurrency--;
                                    $scope.freightCurrencyItemSelected = $scope.freightCurrencyFull[$scope.rowIndexFreightCurrency];
                                }
                                break;
                            case 13:
                                $scope.setFreightCurrency($scope.freightCurrencyItemSelected);
                                break;
                        }
                    });
                });
            }

            $scope.onFreightCurrencyChange = function () {
                $scope.rowIndexFreightCurrency = 0;
                $scope.lookUpCurrentPageFreightCurrency = 1;
                if ($scope.freightCurrencyFull) {
                    $scope.searchFreightCurrencyText = $scope.searchFreightCurrencyText ? $scope.searchFreightCurrencyText : '';
                    $scope.freightCurrencies = $scope.freightCurrencyFull.filter(obj => {
                        return obj.Code.toString().toLowerCase().includes($scope.searchFreightCurrencyText.toLowerCase()) || (obj.NameEnglish && obj.NameEnglish.toLowerCase().includes($scope.searchFreightCurrencyText.toLowerCase()))
                            || (obj.NameArabic && obj.NameArabic.toLowerCase().includes($scope.searchFreightCurrencyText.toLowerCase()));
                    });
                }
            }
            $scope.setFreightCurrency = function (row) {
                $scope.manifestFreightCurrency = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                $scope.selectedFreightCurrency = {};
                $scope.selectedFreightCurrency.originalObject = row;
                $("#freightCurrencyLookup").modal("hide");
                $("#FreightCurrencies_value").attr("tabindex", "26");
                $('#FreightCurrencies_value').focus();
            }
            $scope.$watch("searchFreightCurrencyText", function () {
                $scope.onFreightCurrencyChange();
            });
            /// F9 key down event
            $scope.freightCurrencyKeyDown = function (event, item) {
                if (event.key == 'F9') {
                    $scope.openFreightCurrencyLookup(item);
                }
            }
            //////////////////////

            //Unit Lookup
            //#region Units Lookup

            function setDefaultUnit() {
                if ($scope.units) {
                    var defaultUnit = $scope.units.filter(x => { return x.Code == "PKG" });
                    if (defaultUnit) {
                        $scope.unit = defaultUnit[0].Code.toString() + "     " + (defaultUnit[0].EnglishName ? defaultUnit[0].EnglishName : '') + "     " + (defaultUnit[0].ArabicName ? defaultUnit[0].ArabicName : '');
                        $scope.selectedUnit = {};
                        $scope.selectedUnit.originalObject = defaultUnit[0];
                    }
                }
            }

            function populateUnits() {
                getIndexData('Units', '', function (data) {
                    $scope.units = data;
                    //setDefaultUnit();
                }, function () {
                    apiService.get('Customs/Lookup/Units',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.units = results.data.ResponseResult.Data;
                            storeData($scope.units, 'Units', '');
                            //setDefaultUnit();
                        },
                        function error(response) {
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });


            }

            //#endregion       

            //Vessel Lookup
            function populateVessels() {
                getIndexData('Vessels', '', function (data) {
                    $scope.vessels = data;
                }, function () {
                    apiService.get('Customs/Lookup/Vessel',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.vessels = results.data.ResponseResult.Data;
                            storeData($scope.vessels, 'Vessels', '');
                        },
                        function error(response) {
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });
            }

            //Voyage List Lookup
            //--------------------
            function initVoyageListSearch() {
                $scope.voyListSearchParam = {
                    CenterCode: $stateParams.centerCode,
                    VoyageNumber: '',
                    VesselCode: '',
                    BillType: '',
                    PageNumber: 1,
                    PageSize: 10
                };
                $scope.selectedVesselCode = '';
                $scope.selectedVessel = {};
                $scope.selectedVessel.originalObject = {};
                $scope.voyageList = '';
                $scope.totalVoyageCount = 0;
            }
            $scope.loadMoreVoyageRecords = function (newPageNo) {
                $scope.voyListSearchParam.PageNumber = newPageNo;
                $scope.PopulateVoyageList();
            }
            $scope.PopulateVoyageList = function () {
                $("#loadingScreen").show();
                apiService.get('Customs/Manifest/FindVoyage',
                    $scope.voyListSearchParam,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.voyageList = results.data.ResponseResult.Data;
                            if ($scope.voyageList != null) {
                                $scope.totalVoyageCount = $scope.voyageList[0].TotalCount;
                            }
                        }
                        $("#loadingScreen").hide();

                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
            $scope.clearVoyageSearchFilters = function () {
                initVoyageListSearch();
            }
            $scope.searchVoyage = function () {
                $scope.isRequiredVoyage = false;
                $scope.voyListSearchParam.VoyageNumber = $scope.voyListSearchParam.VoyageNumber ? $scope.voyListSearchParam.VoyageNumber.trim() : $scope.voyListSearchParam.VoyageNumber;
                $scope.voyListSearchParam.VesselCode = ($scope.selectedVessel && $scope.selectedVessel.originalObject && $scope.selectedVessel.originalObject.Code) ? $scope.selectedVessel.originalObject.Code.trim() : $scope.selectedVesselCode;
                $scope.voyListSearchParam.PageNumber = 1;
                if (!$scope.voyListSearchParam.VesselCode && !$scope.voyListSearchParam.VoyageNumber) {
                    $scope.isRequiredVoyage = true;
                    return;
                }
                $scope.PopulateVoyageList();
            }
            $scope.selectVoyage = function (event) {
                switch (event.keyCode) {
                    case 40:
                        if ($scope.rowIndexVoyage < $scope.voyageList.length - 1) {
                            $scope.rowIndexVoyage++;
                            if ($scope.rowIndexVoyage > 10 * $scope.voyageList - 1) {
                                $scope.lookUpCurrentPageVoyage++;
                            }
                            $scope.voyageSelected = $scope.voyageList[$scope.rowIndexVoyage];
                        }
                        break;
                    case 38:
                        if ($scope.rowIndexVoyage > 0) {

                            if ($scope.rowIndexVoyage == 10 * ($scope.lookUpCurrentPageVoyage - 1)) {
                                $scope.lookUpCurrentPageVoyage--;
                            }
                            $scope.rowIndexVoyage--;
                            $scope.voyageSelected = $scope.voyageList[$scope.rowIndexVoyage];
                        }
                        break;
                    case 13:
                        $scope.setVoyage($scope.voyageSelected);
                        break;
                }
            }

            function populateBillTypes() {
                var opt = {};
                opt.Code = '';
                opt.NameEnglish = '--Select--';
                opt.NameArabic = '--الشحن--';

                $scope.lkBillTypeParameter = {
                    centerCode: $stateParams.centerCode,
                    searchString: ''
                };
                getIndexData('billTypes', $stateParams.centerCode, function (data) {
                    $scope.billTypes = data;

                    if ($scope.billTypes) {
                        $scope.billTypes.unshift(opt);
                    }

                }, function () {
                    apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParameter, function (results) {

                        $scope.billTypes = angular.copy(results.data.ResponseResult.Data);
                        storeData(results.data.ResponseResult.Data, 'billTypes', $stateParams.centerCode);
                        if ($scope.billTypes) {
                            $scope.billTypes.unshift(opt);
                        }
                    },
                        function error(response) {
                            console.log(response);
                        })
                });

            }

            $scope.openVoyageLookup = function () {
                $scope.isRequiredVoyage = false;
                populateBillTypes();
                $scope.clearVoyageSearchFilters();
                $('#voyageNumberLookup').modal({
                    backdrop: "static"
                });
            }

            $scope.setVoyage = function (row) {
                $scope.subDODetails.VoyageNumber = row.VoyageNumber;
                $scope.vessel = row.VesselCode;
                $scope.selectedVessel = {
                };
                $scope.selectedVessel.originalObject = {
                };
                $scope.selectedVessel.originalObject.Code = $scope.vessel ? $scope.vessel : null;
                $scope.billType = $scope.subDODetails.BillTypeCode = row.Type;
                $scope.subDODetails.VoyageArrivalDate = row.ArrivalDate;
                $scope.VoyageArrivalDate = $filter('date')((new Date(row.ArrivalDate)), 'dd/MM/yyyy');

                $("#voyageNumberLookup").modal("hide");
                $('#voyageNumber_value').focus();
            }

            //GenericLookup Methods
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'Units':
                        $scope.unit = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedUnit = {};
                        $scope.selectedUnit.originalObject = row;
                        $("#Unit_value").attr("tabindex", "13");
                        $('#Unit_value').focus();
                        break;
                    case 'Vessels':
                        $scope.selectedVesselCode = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedVessel = {};
                        $scope.selectedVessel.originalObject = row;
                        $('#ddlvessel_value').focus();
                        break;
                }
                $("#genericLookUp").modal("hide");
            }

            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'Units':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.units) {
                                $scope.lookUpData = $scope.units.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                        case 'Vessels':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.vessels) {
                                $scope.lookUpData = $scope.vessels.filter(obj => {
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
                        case 'Units':
                            $scope.lookUpTitle = $filter("translate")("Unit");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.units;
                            break;
                        case 'Vessels':
                            $scope.lookUpTitle = $filter("translate")("Vessel");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.vessels;
                            break;
                    }

                    $scope.searchLookupTextModel = '';
                    $('#genericLookUp').modal({
                        backdrop: "static"
                    });
                    $('#searchLookupText').focus();
                    $('#searchLookupText').select();
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
            //////////////Lookup ///////////////////
            ///Container Chassis 
            $scope.gotoContainers = () => {
                $state.go('subDOContainerDetails', { centerCode: $stateParams.centerCode, agentCode: $stateParams.agentCode, ClearanceFlag: $scope.subDODetails.ClearanceFlag },
                    { notify: true });
            }
            $scope.gotoChassis = () => {
                $state.go('subDOChassisDetails', { centerCode: $stateParams.centerCode, agentCode: $stateParams.agentCode, ClearanceFlag: $scope.subDODetails.ClearanceFlag },
                    { notify: true });
            }

            /////////////////////

            //Validate and Save Sub DO
            function ValidateSubDoDetails() {
                $scope.isValidSubDo = true;
                $scope.InvalidPort = false;
                $scope.InvalidUnit = false;
                $scope.InvalidCargoAgent = false;
                $scope.InvalidConsignee = false;
                $scope.InvalidFreightCurrency = false;
                $scope.InvalidDoExpiryDate = false;

                $scope.invalidNetWeight = (($scope.subDODetails.NetWeight ? parseFloat($scope.subDODetails.NetWeight) : $scope.subDODetails.NetWeight) > ($scope.subDODetails.GrossWeight ? parseFloat($scope.subDODetails.GrossWeight) : $scope.subDODetails.GrossWeight)) ? true : false;
                $scope.isValidSubDo = !$scope.invalidNetWeight;

                var shippingOriginDestinationSelected = $scope.selectedPort ? ($scope.selectedPort.originalObject.Code + $scope.selectedPort.originalObject.PortNameEnglish + $scope.selectedPort.originalObject.PortNameArabic) : '';
                if (!$scope.port || !shippingOriginDestinationSelected || ($scope.port && (shippingOriginDestinationSelected == 0 || shippingOriginDestinationSelected == 'undefined' || ($scope.port.replace(/\s/g, '') != shippingOriginDestinationSelected.replace(/\s/g, ''))))) {
                    $scope.InvalidPort = true;
                    $scope.isValidSubDo = false;
                }

                var UnitSelected = $scope.selectedUnit && !apiService.isNullOrEmptyOrUndefined($scope.selectedUnit.originalObject.Code) ? $scope.selectedUnit.originalObject.Code + $scope.selectedUnit.originalObject.EnglishName + $scope.selectedUnit.originalObject.ArabicName : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.unit) && (UnitSelected == 0 || ($scope.unit.toLowerCase().replace(/\s/g, '') != UnitSelected.toLowerCase().replace(/\s/g, '')))) {
                    $scope.InvalidUnit = true;
                    $scope.isValidSubDo = false;
                }

                var cargoAgentSelected = $scope.selectedCargoAgent && !apiService.isNullOrEmptyOrUndefined($scope.selectedCargoAgent.originalObject.CargoAgentCode) ? $scope.selectedCargoAgent.originalObject.CargoAgentCode + $scope.selectedCargoAgent.originalObject.CargoAgentEngName + $scope.selectedCargoAgent.originalObject.CargoAgentArbName : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.manifestCargoAgent) && (cargoAgentSelected == 0 || ($scope.manifestCargoAgent.replace(/\s/g, '') != cargoAgentSelected.replace(/\s/g, '')))) {
                    $scope.InvalidCargoAgent = true;
                    $scope.isValidSubDo = false;
                }

                var consigneeSelected = $scope.selectedConsignee && !apiService.isNullOrEmptyOrUndefined($scope.selectedConsignee.originalObject.ImporterCode) ? $scope.selectedConsignee.originalObject.ImporterCode + $scope.selectedConsignee.originalObject.ImporterEngName + $scope.selectedConsignee.originalObject.ImporterArbName : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.manifestConsignee) && (consigneeSelected == 0 || ($scope.manifestConsignee.replace(/\s/g, '') != consigneeSelected.replace(/\s/g, '')))) {
                    $scope.InvalidConsignee = true;
                    $scope.isValidSubDo = false;
                }

                var freightCurrencySelected = $scope.selectedFreightCurrency && $scope.selectedFreightCurrency.originalObject && $scope.selectedFreightCurrency.originalObject.Code ? $scope.selectedFreightCurrency.originalObject.Code + $scope.selectedFreightCurrency.originalObject.NameEnglish + $scope.selectedFreightCurrency.originalObject.NameArabic : '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.manifestFreightCurrency) && (freightCurrencySelected == 0 || ($scope.manifestFreightCurrency.replace(/\s/g, '').replace(/\d*/g, '').replace(/\./g, '') != freightCurrencySelected.replace(/\s/g, '')))) {
                    $scope.InvalidFreightCurrency = true;
                    $scope.isValidSubDo = false;
                }

                if ($scope.subDODetails.doDate && $scope.subDODetails.doExpiryDate && ($scope.subDODetails.doDate == $scope.subDODetails.doExpiryDate)) {
                    $scope.InvalidDoExpiryDate = true;
                    $scope.isValidSubDo = false;
                }
            }

            $scope.saveDOBLInformation = () => {
                ValidateSubDoDetails();
                if ($scope.isValidSubDo) {
                    $("#loadingScreen").show();

                    var arrival = ($scope.subDODetails && $scope.subDODetails.VoyageArrivalDate) ? $filter('date')(new Date($scope.subDODetails.VoyageArrivalDate), 'dd/MM/yyyy') : '';
                    var doDate = ($scope.subDODetails && $scope.doDate) ? $scope.doDate : '';
                    var expiry = ($scope.subDODetails && $scope.doExpiryDate) ? $scope.doExpiryDate : '';
                    //var doConsignee = ($scope.selectedConsignee && $scope.selectedConsignee.originalObject) ? $scope.selectedConsignee.originalObject.ImporterEngName : null;
                    //if ($scope.language == 'ae')
                    var doConsignee = ($scope.selectedConsignee && $scope.selectedConsignee.originalObject) ? $scope.selectedConsignee.originalObject.ImporterArbName : null;

                    var manifestDetails = {
                        CenterCode: $stateParams.centerCode,
                        MasterBLNumber: $scope.subDODetails.MasterBLNumber,
                        HouseBLNumber: $scope.subDODetails.HouseBLNumber,
                        VoyageNumber: $scope.subDODetails.VoyageNumber,
                        VesselCode: ($scope.selectedVessel && $scope.selectedVessel.originalObject) ? $scope.selectedVessel.originalObject.Code : '',
                        ETADate: arrival,
                        BillType: $scope.subDODetails.BillTypeCode,
                        CargoType: $scope.subDODetails.CargoTypeCode,
                        LoadPort: ($scope.selectedPort && $scope.selectedPort.originalObject) ? $scope.selectedPort.originalObject.Code : '',
                        Unit: ($scope.selectedUnit && $scope.selectedUnit.originalObject) ? $scope.selectedUnit.originalObject.Code : '',
                        Shipper: $scope.subDODetails.Shipper,
                        Consignee: $scope.subDODetails.CONSIGNEE ? $scope.subDODetails.CONSIGNEE : '',
                        NotifyName: $scope.subDODetails.NotifyParty,
                        Mark: $scope.subDODetails.MarksNo,
                        Packages: '',
                        Description: $scope.subDODetails.GoodDesc,
                        NetWeight: $scope.subDODetails.NetWeight,
                        GrossWeight: $scope.subDODetails.GrossWeight,
                        Quantity: $scope.subDODetails.Quantity,
                        Volume: $scope.subDODetails.Volume,
                        Remarks: $scope.subDODetails.BLRemarks,
                        DONumber: $scope.subDODetails.DONumber ? $scope.subDODetails.DONumber : null,
                        DODate: doDate ? doDate : null,
                        ExpiryDate: expiry ? expiry : null,
                        DeliverTo: ($scope.selectedConsignee && $scope.selectedConsignee.originalObject) ? $scope.selectedConsignee.originalObject.ImporterCode : null,
                        FreightAmount: $scope.subDODetails.FreightAmount ? $scope.subDODetails.FreightAmount : null,
                        FreightCurrency: ($scope.selectedFreightCurrency && $scope.selectedFreightCurrency.originalObject) ? $scope.selectedFreightCurrency.originalObject.Code : null,
                        CargoAgentCode: ($scope.selectedCargoAgent && $scope.selectedCargoAgent.originalObject) ? $scope.selectedCargoAgent.originalObject.CargoAgentCode : null,
                        DOConsignee: doConsignee,
                        PFlag: ($scope.mode == 'add' ? 'N' : 'Y'),
                        OldMasterBLNumber: $scope.originalsubDODetails ? $scope.originalsubDODetails.MasterBLNumber : null,
                        OldDONumber: $scope.originalsubDODetails ? $scope.originalsubDODetails.DONumber : null
                    };
                    $scope.mfDetails = manifestDetails;
                    apiService.post('Customs/Manifest/AddUpdateManifest', '', manifestDetails, function (result) {
                        $("#loadingScreen").hide();
                        var data = result.data.ResponseResult;
                        if (data) {
                            if (data.IsValid) {
                                $('#successModal').modal('show');
                                //Manafath Integration Changes --> Save to PCS DB
                                apiService.saveManifestDetailsToPcs('~/Manifest/AddUpdateManifest', $scope.mfDetails, '');
                                
                                $scope.mode = 'edit';
                                var manifestDetails = {
                                    arrivalDate: arrival,
                                    VesselCode: ($scope.selectedVessel && $scope.selectedVessel.originalObject) ? $scope.selectedVessel.originalObject.Code : '',
                                    VoyageNumber: $scope.subDODetails.VoyageNumber,
                                    MasterBlNumber: $scope.subDODetails.MasterBLNumber,
                                    HouseBlNumber: $scope.subDODetails.HouseBLNumber,
                                    BillType: $scope.subDODetails.BillTypeCode
                                };
                                $storage.set('storedManifestInformation', manifestDetails);
                                getSubDODetails();
                            }
                            else {
                                var errMsg = apiService.formatResponseMessage(data.Messages);
                                showErrorMessage(errMsg);
                            }
                        }
                    },
                function (result) {
                    $("#loadingScreen").hide();
                });
                }
            }
            /////////////

            //Page Initialize
            $scope.init = () => {
                $scope.selectedCenterCode = $storage.get('SubDOCenterCode');
                $scope.subDODetails = {};
                $scope.mode = $stateParams.mode;
                //BL
                $scope.subDODetails.CargoType = '';
                $scope.billType = '';
                $scope.vessel = '';
                $scope.port = '';
                $scope.unit = '';
                $scope.isRequiredVoyage = false;
                //DO
                $scope.cargoAgent = '';
                $scope.doDate = '';
                $scope.doExpiryDate = '';
                //Validations
                $scope.InvalidPort = false;
                $scope.invalidNetWeight = false;

                //On Load Methods
                $scope.LoadLookupCargoType();
                $scope.PopulateCargoAgents();
                //$scope.PopulateConsignees();
                $scope.PopulateFreightCurrency();
                populateUnits();
                populateVessels();
                resetSearchParameters();
                getSubDODetails();
            }

            //On load
            $scope.init();
        }
    ]
);