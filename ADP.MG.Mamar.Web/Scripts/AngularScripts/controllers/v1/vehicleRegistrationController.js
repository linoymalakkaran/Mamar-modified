angular.module('mamarApp').controller('vehicleRegistrationController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$timeout',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $filter, $timeout) {



        $scope.centerCode = $stateParams.centerCode;
        $scope.jobNumber = $stateParams.jobNumber;
        $scope.billType = $stateParams.BillType;
        $scope.navigatedFromMenu = $stateParams.fromMenu;
        $scope.showVehicleRegDetails = false;
        $scope.isValid = false;
        $scope.validSelectedGate = true;
        $scope.validPlateNumber = true;
        $scope.invalidPlateColor = false;
        $scope.invalidPlateOrigin = false;
        $scope.invalidPlateCategory = false;
        $scope.isValidPreDetails = false;
        $scope.invalidSubmit = false;
        $scope.IsEmiratesId = false;
        $scope.validOwnerNationality = true;
        $scope.validVehicleType = true;
        $scope.validVehicleCategory = true;
        $scope.validVehicleColor = true;
        // init Vehicle Registration
        $scope.vehicleReg = {
            CompanyCode: null,
            UserCode: null,
            CenterCode: $scope.centerCode,
            PermitNumber: null,
            PlateNumber: '',
            PlateColor: '',
            TextPlateColor: '',
            PlateOrigin: '',
            TextPlateOrigin: '',
            PlateCategory: '',
            TextPlateCategory: '',
            DateOpen: null,
            DateClose: null,
            CityCode: '',
            CityDesc: '',
            CarColor: '',
            CarT2Desc: '',
            VSTCode: '',
            TextVehicleType: '',
            VCTCode: '',
            TextVehicleCategory: '',
            ChassisNumber: '',
            OwnerName: '',
            OwnerName1: '',
            OwnerName2: '',
            OwnerName3: '',
            OwnerName4: '',
            OwnerNationality: '',
            TextOwnerNationality: '',
            CarEDate: '',
            TripTicket: null,
            TrailerNumber: null,
            VehicleModel: '',
            DriverNameOpen: '',
            DriverNameOpen1: '',
            DriverNameOpen2: '',
            DriverNameOpen3: '',
            DriverNameOpen4: '',
            DriverNATOpen: '',
            TextDriverNATOpen: '',
            PassangerNumberOpen: '',
            DestinationCountryOpen: '',
            TextDestinationCountryOpen: '',
            DriverIDTypeOpen: '',
            DriverIDNumberOpen: '',
            DriverIDDateOpen: '',
            LoadTypeOpen: '',
            LoadFlagOpen: '',
            JobNumberOpen: '',
            DriverNameClose: '',
            DriverNameClose1: '',
            DriverNameClose2: '',
            DriverNameClose3: '',
            DriverNameClose4: '',
            DriverNATClose: '',
            TextDriverNATClose: '',
            PassangerNumberClose: '',
            DestinationCountryClose: '',
            TextDestinationCountryClose: '',
            DriverIDTypeClose: '',
            DriverIDNumberClose: '',
            DriverIDDateClose: '',
            LoadTypeClose: null,
            LoadFlagClose: '',
            JobNumberClose: '',
            TextTransNumber: '',
            JobNumber: $scope.jobNumber,
            RemarksOpen: null,
            RemarksClose: null,
            CarT1Desc: null,
            GateSelection: ''
        };
        function initializeLookups() {
            // lookups initialization
            $scope.selectedPlateCategory = '';
            $scope.selectedPlateColor = '';
            $scope.selectedPlateOrigin = '';

            $scope.selectedVehicleCategory = '';
            $scope.selectedVehicleType = '';
            $scope.selectedVehicleColor = '';

            $scope.selectedOwnerNationality = '';
            $scope.selectedDriverNationality = '';

            $scope.selectedDestination = '';

            //***** lookup selected Obj ****
            $scope.selectedPlateCategoryObj = {};
            $scope.selectedPlateCategoryObj.originalObject = {};
            $scope.selectedPlateCategoryObj.originalObject.CategoryCode = null;
            $scope.selectedPlateCategoryObj.originalObject.CategoryEngName = null;
            $scope.selectedPlateCategoryObj.originalObject.CategoryArbName = null;
            $scope.selectedPlateCategoryObj.originalObject.Copies = null;

            $scope.selectedPlateColorObj = {};
            $scope.selectedPlateColorObj.originalObject = {};
            $scope.selectedPlateColorObj.originalObject.Code = null;
            $scope.selectedPlateColorObj.originalObject.EngName = null;
            $scope.selectedPlateColorObj.originalObject.ArbName = null;
            // $scope.selectedPlateColorObj.originalObject.Copies = null;

            $scope.selectedPlateOriginObj = {};
            $scope.selectedPlateOriginObj.originalObject = {};
            $scope.selectedPlateOriginObj.originalObject.Code = null;
            $scope.selectedPlateOriginObj.originalObject.CountryEngName = null;
            $scope.selectedPlateOriginObj.originalObject.CountryArbName = null;

            $scope.selectedVehicleTypeObj = {};
            $scope.selectedVehicleTypeObj.originalObject = {};
            $scope.selectedVehicleTypeObj.originalObject.SubTypeCode = $scope.selectedVehicleTypeObj.originalObject.SubTypeEngName = null;
            $scope.selectedVehicleTypeObj.originalObject.SubTypArbName = $scope.selectedVehicleTypeObj.originalObject.CategoryEngName = null;
            $scope.selectedVehicleTypeObj.originalObject.CategoryArbName = $scope.selectedVehicleTypeObj.originalObject.BodyTypeCode = null;
            $scope.selectedVehicleTypeObj.originalObject.BodyTypeEngName = $scope.selectedVehicleTypeObj.originalObject.BodyTypeArbName = null;

            $scope.selectedVehicleCategoryObj = {};
            $scope.selectedVehicleCategoryObj.originalObject = {};
            $scope.selectedVehicleCategoryObj.originalObject.Code = null;
            $scope.selectedVehicleCategoryObj.originalObject.EngName = null;
            $scope.selectedVehicleCategoryObj.originalObject.ArbName = null;

            $scope.selectedVehicleColorObj = {};
            $scope.selectedVehicleColorObj.originalObject = {};
            $scope.selectedVehicleColorObj.originalObject.Code = null;
            $scope.selectedVehicleColorObj.originalObject.EnglishName = null;
            $scope.selectedVehicleColorObj.originalObject.ArabicName = null;

            $scope.selectedOwnerNatOriginObj = {};
            $scope.selectedOwnerNatOriginObj.originalObject = {};
            $scope.selectedOwnerNatOriginObj.originalObject.Code = null;
            $scope.selectedOwnerNatOriginObj.originalObject.EngName = null;
            $scope.selectedOwnerNatOriginObj.originalObject.ArbName = null;

            $scope.selectedDriverNatOriginObj = {};
            $scope.selectedDriverNatOriginObj.originalObject = {};
            $scope.selectedDriverNatOriginObj.originalObject.Code = null;
            $scope.selectedDriverNatOriginObj.originalObject.CountryEngName = null;
            $scope.selectedDriverNatOriginObj.originalObject.CountryArbName = null;

            $scope.selectedDestinationObj = {};
            $scope.selectedDestinationObj.originalObject = {};
            $scope.selectedDestinationObj.originalObject.Code = null;
            $scope.selectedDestinationObj.originalObject.CountryEngName = null;
            $scope.selectedDestinationObj.originalObject.CountryArbName = null;
        }
        // END

        // GET PLATE ORIGIN LIST
        $scope.onPlateOriginChange = function (searchStr) {
            $scope.PopulatePlateOrigins(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPagePlateOrigin = 1;
            if ($scope.plateOriginsFull) {
                $scope.plateOrigins = $scope.plateOriginsFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchPlateOriginText.toLowerCase()) || (obj.CountryEngName && obj.CountryEngName.toLowerCase().includes($scope.searchPlateOriginText.toLowerCase()))
                        || (obj.CountryArbName && obj.CountryArbName.toLowerCase().includes($scope.searchPlateOriginText.toLowerCase()));
                });
            }
        }
        $scope.searchPlateOriginText = '';

        $scope.plateOriginKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openPlateOriginLookup();
            }
        }

        $scope.PopulatePlateOrigins = function (searchStr) {
            apiService.get('Customs/Lookup/UNCountries',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.plateOriginsFull = results.data.ResponseResult.Data;
                    $scope.plateOrigins = angular.copy($scope.plateOriginsFull);
                },
                function error(response) {
                    console.log(response);
                });
        }

        $scope.openPlateOriginLookup = function (item) {
            $scope.searchPlateOriginText = '';
            $('#plateOriginLookup').modal({
                backdrop: "static"
            });
            $('#searchPlateOriginText').focus();
            $('#searchPlateOriginText').select();
            $scope.onPlateOriginChange();
            $("#plateOriginLookup").off("keydown");
            $('#plateOriginLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.plateOrigins.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.plateOrigins - 1) {
                                    $scope.lookUpCurrentPagePlateOrigin++;
                                }
                                $scope.plateOriginItemSelected = $scope.plateOrigins[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateOrigin - 1)) {
                                    $scope.lookUpCurrentPagePlateOrigin--;
                                }
                                $scope.rowIndex--;
                                $scope.plateOriginItemSelected = $scope.plateOrigins[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setPlateOrigin($scope.plateOriginItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setPlateOrigin = function (row) {
            $scope.selectedPlateOrigin = row.Code.toString() + "     " + (row.CountryEngName ? row.CountryEngName : '') + "     " + (row.CountryArbName ? row.CountryArbName : '');
            $scope.selectedPlateOriginObj = {};
            $scope.selectedPlateOriginObj.originalObject = row;
            $("#plateOriginLookup").modal("hide");
        }

        //$scope.PopulatePlateOrigins();

        $scope.$watch("searchPlateOriginText", function () {
            $scope.onPlateOriginChange($scope.searchPlateOriginText);
        });

        // GET PLATE CATEGORY LIST
        $scope.onPlateCatChange = function (searchStr) {
            $scope.PopulatePlateCategorys(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPagePlateCategory = 1;
            if ($scope.plateCategorysFull) {
                $scope.plateCategorys = $scope.plateCategorysFull.filter(obj => {
                    return obj.CategoryCode.toString().toLowerCase().includes($scope.searchPlateCategoryText.toLowerCase()) || (obj.CategoryEngName && obj.CategoryEngName.toLowerCase().includes($scope.searchPlateCategoryText.toLowerCase()))
                        || (obj.CategoryArbName && obj.CategoryArbName.toLowerCase().includes($scope.searchPlateCategoryText.toLowerCase()));
                });
            }
        }
        $scope.searchPlateCategoryText = '';

        $scope.plateCategoryKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openPlateCategoryLookup();
            }
        }

        $scope.PopulatePlateCategorys = function (searchStr) {
            apiService.get('Customs/Lookup/PlateCategories',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.plateCategorysFull = results.data.ResponseResult.Data;
                    $scope.plateCategorys = angular.copy($scope.plateCategorysFull);
                },
                function error(response) {
                    console.log(response);
                });
        };

        $scope.openPlateCategoryLookup = function (item) {
            $scope.searchPlateCategoryText = '';
            $('#plateCategoryLookup').modal({
                backdrop: "static"
            });
            $('#searchPlateCategoryText').focus();
            $('#searchPlateCategoryText').select();
            $scope.onPlateCatChange();
            $("#plateCategoryLookup").off("keydown");
            $('#plateCategoryLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.plateCategorys.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.plateCategorys - 1) {
                                    $scope.lookUpCurrentPagePlateCategory++;
                                }
                                $scope.plateCategoryItemSelected = $scope.plateCategorys[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateCategory - 1)) {
                                    $scope.lookUpCurrentPagePlateCategory--;
                                }
                                $scope.rowIndex--;
                                $scope.plateCategoryItemSelected = $scope.plateCategorys[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setPlateCategory($scope.plateCategoryItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setPlateCategory = function (row) {
            $scope.selectedPlateCategory = row.CategoryCode.toString() + "     " + (row.CategoryEngName ? row.CategoryEngName : '') + "     " + (row.CategoryArbName ? row.CategoryArbName : '');
            $scope.selectedPlateCategoryObj = {};
            $scope.selectedPlateCategoryObj.originalObject = row;
            $("#plateCategoryLookup").modal("hide");
        }

        //$scope.PopulatePlateCategorys();

        $scope.$watch("searchPlateCategoryText", function () {
            $scope.onPlateCatChange($scope.searchPlateCategoryText);
        });
        // GET PLATE COLOR LIST
        $scope.onPlateColorChange = function (searchStr) {
            $scope.PopulatePlateColors(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPagePlateColor = 1;
            if ($scope.plateColorsFull) {
                $scope.plateColors = $scope.plateColorsFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchPlateColorText.toLowerCase()) || (obj.EngName && obj.EngName.toLowerCase().includes($scope.searchPlateColorText.toLowerCase()))
                        || (obj.ArbName && obj.ArbName.toLowerCase().includes($scope.searchPlateColorText.toLowerCase()));
                });
            }
        }
        $scope.searchPlateColorText = '';

        $scope.plateColorKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openPlateColorLookup();
            }
        }

        $scope.PopulatePlateColors = function (searchStr) {
            apiService.get('Customs/Lookup/PlateColors',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.plateColorsFull = results.data.ResponseResult.Data;
                    $scope.plateColors = angular.copy($scope.plateColorsFull);
                },
                function error(response) {
                    console.log(response);
                });
        }

        $scope.openPlateColorLookup = function (item) {
            $scope.searchPlateColorText = '';
            $('#plateColorLookup').modal({
                backdrop: "static"
            });
            $('#searchPlateColorText').focus();
            $('#searchPlateColorText').select();
            $scope.onPlateColorChange();
            $("#plateColorLookup").off("keydown");
            $('#plateColorLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.plateColors.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.plateColors - 1) {
                                    $scope.lookUpCurrentPagePlateColor++;
                                }
                                $scope.plateColorItemSelected = $scope.plateColors[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateColor - 1)) {
                                    $scope.lookUpCurrentPagePlateColor--;
                                }
                                $scope.rowIndex--;
                                $scope.plateColorItemSelected = $scope.plateColors[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setPlateColor($scope.plateColorItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setPlateColor = function (row) {
            $scope.selectedPlateColor = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            $scope.selectedPlateColorObj = {};
            $scope.selectedPlateColorObj.originalObject = row;
            $("#plateColorLookup").modal("hide");
        }

        //$scope.PopulatePlateColors();

        $scope.$watch("searchPlateColorText", function () {
            $scope.onPlateColorChange($scope.searchPlateColorText);
        });
        // GET VEHICLE TYPE LIST
        $scope.onVehicleTypeChange = function (searchStr) {
            $scope.PopulateVehicleTypes(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleType = 1;
            if ($scope.vehicleTypesFull) {
                $scope.vehicleTypes = $scope.vehicleTypesFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchVehicleTypeText.toLowerCase()) || (obj.EngName && obj.EngName.toLowerCase().includes($scope.searchVehicleTypeText.toLowerCase()))
                        || (obj.ArbName && obj.ArbName.toLowerCase().includes($scope.searchVehicleTypeText.toLowerCase()));
                });
            }
        }
        $scope.searchVehicleTypeText = '';

        $scope.vehicleTypeKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openVehicleTypeLookup();
            }
        }

        $scope.PopulateVehicleTypes = function (searchStr) {
            apiService.get('Customs/Lookup/VehicleTypes',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.vehicleTypesFull = results.data.ResponseResult.Data;
                    $scope.vehicleTypes = angular.copy($scope.vehicleTypesFull);
                },
                function error(response) {
                    console.log(response);
                });
        }
        $scope.OnVehicleTypesChange = function (event, searchStr) {
            if (event.key == 'F9') {
                $scope.openVehicleTypeLookup();
            }
            else if (event.keyCode == 9) {
                event.preventDefault();
                apiService.get('Customs/Lookup/VehicleTypes',
                    {
                        centerCode: $scope.centerCode,
                        searchString: searchStr
                    },
                    function (results) {
                        var vType = results.data.ResponseResult.Data;
                        if (vType != null) {
                            $scope.vehicleTypeEngilsh = vType[0].EngName;
                            $scope.vehicleTypeArabic = vType[0].ArbName;
                            $("#txtVehicleCategory").focus();
                            $scope.selectedVehicleTypeObj = {};
                            $scope.selectedVehicleTypeObj.originalObject = vType[0];
                            $scope.PopulateVehicleCategorys(vType[0].VCTCode, true);
                        }
                        else {
                            $scope.vehicleTypeEngilsh = "";
                            $scope.vehicleTypeArabic = "";
                            $("#txtVehicleCode").focus();
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });
            }
        };

        $scope.openVehicleTypeLookup = function (item) {
            $scope.searchVehicleTypeText = '';
            $('#vehicleTypeLookup').modal({
                backdrop: "static"
            });
            $('#searchVehicleTypeText').focus();
            $('#searchVehicleTypeText').select();
            $scope.onVehicleTypeChange();
            $("#vehicleTypeLookup").off("keydown");
            $('#vehicleTypeLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.vehicleTypes.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.vehicleTypes - 1) {
                                    $scope.lookUpCurrentPageVehicleType++;
                                }
                                $scope.vehicleTypeItemSelected = $scope.vehicleTypes[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageVehicleType - 1)) {
                                    $scope.lookUpCurrentPageVehicleType--;
                                }
                                $scope.rowIndex--;
                                $scope.vehicleTypeItemSelected = $scope.vehicleTypes[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setVehicleType($scope.vehicleTypeItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setVehicleType = function (row) {
            //$scope.selectedVehicleType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            $scope.selectedVehicleType = row.Code.toString();
            if (row.EngName)
                $scope.vehicleTypeEngilsh = row.EngName.toString();
            if (row.ArbName)
                $scope.vehicleTypeArabic = row.ArbName.toString();
            $scope.selectedVehicleTypeObj = {};
            $scope.selectedVehicleTypeObj.originalObject = row;
            $scope.PopulateVehicleCategorys(row.VCTCode, true);
            $("#vehicleTypeLookup").modal("hide");
        };

        $scope.setVehicleCategory = function (row) {
            //$scope.selectedVehicleCategory = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            $scope.selectedVehicleCategory = row.Code.toString();
            if (row.EngName)
                $scope.selectedVehicleCategoryEnglish = row.EngName.toString();
            if (row.ArbName)
                $scope.selectedVehicleCategoryArabic = row.ArbName.toString();
            $scope.selectedVehicleCategoryObj = {};
            $scope.selectedVehicleCategoryObj.originalObject = row;
            $("#vehicleCategoryLookup").modal("hide");
        }

      

        //$scope.PopulateVehicleTypes();

        $scope.$watch("searchVehicleTypeText", function () {
            $scope.onVehicleTypeChange($scope.searchVehicleTypeText);
        });

        $scope.$watch("selectedVehicleType", function () {
            if ($scope.selectedVehicleTypeObj && $scope.selectedVehicleTypeObj.originalObject) {
                $scope.PopulateVehicleCategorys($scope.selectedVehicleTypeObj.originalObject.VCTCode, true);
            }
        });

        // GET VEHICLE CATEGORY LIST
        $scope.onVehicleCatChange = function (searchStr) {
            $scope.PopulateVehicleCategorys(searchStr, false);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleCategory = 1;
            if ($scope.vehicleCategorysFull) {
                $scope.vehicleCategorys = $scope.vehicleCategorysFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchVehicleCategoryText.toLowerCase()) || (obj.EngName && obj.EngName.toLowerCase().includes($scope.searchVehicleCategoryText.toLowerCase()))
                        || (obj.ArbName && obj.ArbName.toLowerCase().includes($scope.searchVehicleCategoryText.toLowerCase()));
                });
            }
        }
        $scope.searchVehicleCategoryText = '';

        $scope.vehicleCategoryKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openVehicleCategoryLookup();
            }
            else if (event.keyCode == 9) {
                event.preventDefault();
                apiService.get('Customs/Lookup/VehicleCategories',
                    {
                        centerCode: $scope.centerCode,
                        searchString: $scope.selectedVehicleCategory
                    },
                    function (results) {
                        var vType = results.data.ResponseResult.Data;
                        if (vType != null) {
                            $scope.selectedVehicleCategoryEnglish = vType[0].EngName;
                            $scope.selectedVehicleCategoryArabic = vType[0].ArbName;
                            $("#txtVehicleColor").focus();
                            $scope.selectedVehicleCategoryObj = {};
                            $scope.selectedVehicleCategoryObj.originalObject = vType[0];
                        }
                        else {
                            $scope.selectedVehicleCategoryEnglish = "";
                            $scope.selectedVehicleCategoryArabic = "";
                            $("#txtVehicleCategory").focus();
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });
            }
        }

        $scope.PopulateVehicleCategorys = function (searchStr, loadCategory) {
            apiService.get('Customs/Lookup/VehicleCategories',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.vehicleCategorysFull = results.data.ResponseResult.Data;
                    $scope.vehicleCategorys = angular.copy($scope.vehicleCategorysFull);
                    if (loadCategory && $scope.vehicleCategorys) {//When selecting the vehicle type, the corresponding category has to be selected as default.
                        var row = $scope.vehicleCategorys.filter(x => x.Code == searchStr)
                        if (row && row.length > 0) {
                            $scope.setVehicleCategory(row[0]);
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                });
        }

        $scope.openVehicleCategoryLookup = function (item) {
            $scope.searchVehicleCategoryText = '';
            $('#vehicleCategoryLookup').modal({
                backdrop: "static"
            });
            $('#searchVehicleCategoryText').focus();
            $('#searchVehicleCategoryText').select();
            $scope.onVehicleCatChange();
            $("#vehicleCategoryLookup").off("keydown");
            $('#vehicleCategoryLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.vehicleCategorys.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.vehicleCategorys - 1) {
                                    $scope.lookUpCurrentPageVehicleCategory++;
                                }
                                $scope.vehicleCategoryItemSelected = $scope.vehicleCategorys[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageVehicleCategory - 1)) {
                                    $scope.lookUpCurrentPageVehicleCategory--;
                                }
                                $scope.rowIndex--;
                                $scope.vehicleCategoryItemSelected = $scope.vehicleCategorys[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setVehicleCategory($scope.vehicleCategoryItemSelected);
                            break;
                    }
                });
            });
        }
        //$scope.PopulateVehicleCategorys();

        $scope.$watch("searchVehicleCategoryText", function () {
            $scope.onVehicleCatChange($scope.searchVehicleCategoryText);
        });
        // GET VEHICLE COLOR LIST
        $scope.onVehicleColorChange = function (searchStr) {
            $scope.PopulateVehicleColors(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleColor = 1;
            if ($scope.vehicleColorsFull) {
                $scope.vehicleColors = $scope.vehicleColorsFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()))
                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()));
                });
            }
        }
        $scope.searchVehicleColorText = '';

        $scope.vehicleColorKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openVehicleColorLookup();
            }
            else if (event.keyCode == 9) {
                event.preventDefault();
                apiService.get('Customs/Lookup/GenericLookup',
                    {
                        centerCode: $scope.centerCode,
                        searchString: $scope.selectedVehicleColor,
                        lookupType: 'POLICE-COLORS'
                    },
                    function (results) {
                        var vType = results.data.ResponseResult.Data;
                        if (vType != null) {
                            $scope.selectedVehicleColorEng = vType[0].EnglishName;
                            $scope.selectedVehicleColorArb = vType[0].ArabicName;
                            $("#txtChassisNo").focus(); 
                            $scope.selectedVehicleColorObj = {};
                            $scope.selectedVehicleColorObj.originalObject = vType[0];
                        }
                        else {
                            $scope.selectedVehicleColorEng = "";
                            $scope.selectedVehicleColorArb = "";
                            $("#txtVehicleColor").focus();
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });

            }
        };

        $scope.PopulateVehicleColors = function (searchStr) {
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr,
                    lookupType: 'POLICE-COLORS'
                },
                function (results) {
                    $scope.vehicleColorsFull = results.data.ResponseResult.Data;
                    $scope.vehicleColors = angular.copy($scope.vehicleColorsFull);
                },
                function error(response) {
                    console.log(response);
                });
        }

        $scope.openVehicleColorLookup = function (item) {
            $scope.searchVehicleColorText = '';
            $('#vehicleColorLookup').modal({
                backdrop: "static"
            });
            $('#searchVehicleColorText').focus();
            $('#searchVehicleColorText').select();
            $scope.onVehicleColorChange();
            $("#vehicleColorLookup").off("keydown");
            $('#vehicleColorLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.vehicleColors.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.vehicleColors - 1) {
                                    $scope.lookUpCurrentPageVehicleColor++;
                                }
                                $scope.vehicleColorItemSelected = $scope.vehicleColors[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageVehicleColor - 1)) {
                                    $scope.lookUpCurrentPageVehicleColor--;
                                }
                                $scope.rowIndex--;
                                $scope.vehicleColorItemSelected = $scope.vehicleColors[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setVehicleColor($scope.vehicleColorItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setVehicleColor = function (row) {
            $scope.selectedVehicleColor = row.Code.toString();// + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            $scope.selectedVehicleColorEng = row.EnglishName;
            $scope.selectedVehicleColorArb = row.ArabicName;
            $scope.selectedVehicleColorObj = {};
            $scope.selectedVehicleColorObj.originalObject = row;
            $("#vehicleColorLookup").modal("hide");
        };

        //$scope.PopulateVehicleColors();

        $scope.$watch("searchVehicleColorText", function () {
            $scope.onVehicleColorChange($scope.searchVehicleColorText);
        });

        //Destination -- Begin

        // GET DESTINATION LIST
        $scope.onDestinationChange = function (searchStr) {
            apiService.get('Customs/Lookup/UNCountries',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.destinationList = results.data.ResponseResult.Data;
                    $scope.destinationListFull = angular.copy($scope.destinationList);
                },
                function error(response) {
                    console.log(response);
                });
        };


        $scope.openDestination = function (event, controltype) {
            $scope.searchDestinationText = '';
            if (event == 'click' || event.key == "F9") {
                $scope.controltype = controltype;
                $("#openDestinationLookup").modal({ backdrop: "static" });
                $('#searchDestinationText').focus();
                $scope.onDestinationChange();
                $('#searchDestinationText').select();
                $("#openDestinationLookup").off("keydown");
                $('#openDestinationLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndex < $scope.destinationList.length - 1) {
                                    $scope.rowIndex++;
                                    if ($scope.rowIndex > 10 * $scope.destinationList - 1) {
                                        $scope.lookUpCurrentPageDestination++;
                                    }
                                    $scope.destinationSelected = $scope.destinationList[$scope.rowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndex > 0) {

                                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageDestination - 1)) {
                                        $scope.lookUpCurrentPageDestination--;
                                    }
                                    $scope.rowIndex--;
                                    $scope.destinationSelected = $scope.destinationList[$scope.rowIndex];
                                }
                                break;
                            case 13:
                                $scope.setDestination($scope.destinationSelected);
                                break;
                        }
                    });
                });
            }
        };
        $scope.setDestination = function (row) {
            if ($scope.controltype == 'close') {
                $scope.selectedCloseDestination = row.Code.toString() + "     " + (row.CountryEngName ? row.CountryEngName : '') + "     " + (row.CountryArbName ? row.CountryArbName : '');
                $scope.selectedCloseDestinationObj = {};
                $scope.selectedCloseDestinationObj.originalObject = row;
            }
            else {
                $scope.selectedOpenDestination = row.Code.toString() + "     " + (row.CountryEngName ? row.CountryEngName : '') + "     " + (row.CountryArbName ? row.CountryArbName : '');
                $scope.selectedOpenDestinationObj = {};
                $scope.selectedOpenDestinationObj.originalObject = row;
            }
            $("#openDestinationLookup").modal("hide");
        };

        //$scope.onDestinationChange();

        $scope.$watch("searchDestinationText", function () {
            $scope.onDestinationChangeLookup($scope.searchDestinationText);
        });


        $scope.onDestinationChangeLookup = function (searchStr) {
            $scope.onDestinationChange(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageDestination = 1;
            if ($scope.destinationListFull) {
                $scope.destinationList = $scope.destinationListFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchDestinationText.toLowerCase()) || (obj.CountryEngName && obj.CountryEngName.toLowerCase().includes($scope.searchDestinationText.toLowerCase()))
                        || (obj.CountryArbName && obj.CountryArbName.toLowerCase().includes($scope.searchDestinationText.toLowerCase()));
                });
            }
        };

        //Destination -- End

        //Get Nationality Lookup-- Begin
        $scope.openNationality = function (event, controltype) {
            $scope.searchNationalityText = '';
            if (event == 'click' || event.key == "F9") {
                $scope.controltype = controltype;
                $("#openNationalityLookup").modal({ backdrop: "static" });
                $scope.onNationalityChange();
                $('#searchNationalityText').focus();
                $('#searchNationalityText').select();
                $("#openNationalityLookup").off("keydown");
                $('#openNationalityLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndex < $scope.nationalityList.length - 1) {
                                    $scope.rowIndex++;
                                    if ($scope.rowIndex > 10 * $scope.nationalityList - 1) {
                                        $scope.lookUpCurrentPageNationality++;
                                    }
                                    $scope.nationalitySelected = $scope.nationalityList[$scope.rowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndex > 0) {

                                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageNationality - 1)) {
                                        $scope.lookUpCurrentPageNationality--;
                                    }
                                    $scope.rowIndex--;
                                    $scope.nationalitySelected = $scope.nationalityList[$scope.rowIndex];
                                }
                                break;
                            case 13:
                                $scope.setNationality($scope.nationalitySelected);
                                $("#openNationalityLookup").modal("hide");
                                break;
                        }
                    });
                });
            }
            else if (event.keyCode == 9) {
                    apiService.get('Customs/Lookup/OwnerNationalities',
                    {
                        centerCode: $scope.centerCode,
                        searchString: $scope.selectedOwnerNationality
                    },
                    function (results) {
                        var vType = results.data.ResponseResult.Data;
                        if (vType != null) {
                            $scope.selectedOwnerNationalityEng = vType[0].EngName;
                            $scope.selectedOwnerNationalityArb = vType[0].ArbName;
                            $scope.controltype = 'owner';
                            $scope.setNationality(vType[0]);
                        }
                        else {
                            $scope.selectedOwnerNationalityEng = "";
                            $scope.selectedOwnerNationalityArb = "";
                            $("#txtOwnerNationality").focus();
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });
            }
        };
        $scope.setNationality = function (row) {
            var nationality = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            if ($scope.controltype == 'close') {
                $scope.selectedcloseDriverNationality = nationality;
                $scope.selectedcloseDriverNatOriginObj = {};
                $scope.selectedcloseDriverNatOriginObj.originalObject = row;
            }
            else if ($scope.controltype == 'open') {
                $scope.selectedopenDriverNationality = nationality;
                $scope.selectedopenDriverNatOriginObj = {};
                $scope.selectedopenDriverNatOriginObj.originalObject = row;
            } else if ($scope.controltype == 'owner') {
                $scope.selectedcloseDriverNationality = nationality;
                $scope.selectedcloseDriverNatOriginObj = {};
                $scope.selectedcloseDriverNatOriginObj.originalObject = row;
                $scope.selectedopenDriverNationality = nationality;
                $scope.selectedopenDriverNatOriginObj = {};
                $scope.selectedopenDriverNatOriginObj.originalObject = row;
                $scope.selectedOwnerNationality = row.Code.toString();
                $scope.selectedOwnerNationalityEng = row.EngName;
                $scope.selectedOwnerNationalityArb = row.ArbName;
                $scope.selectedOwnerNatOriginObj = {};
                $scope.selectedOwnerNatOriginObj.originalObject = row;
            }
            $("#openNationalityLookup").modal("hide");
        };

        // GET NATIONALITY LIST
        $scope.onNationalityChange = function (searchStr) {
            apiService.get('Customs/Lookup/OwnerNationalities',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.nationalityList = results.data.ResponseResult.Data;
                    $scope.nationalityListFull = angular.copy($scope.nationalityList);
                    if ($scope.IsEmiratesId) {
                        var obj = $scope.nationalityList.filter(a => a.ArbName == searchStr);
                        if (obj != null)
                            $scope.setNationality(obj[0]);
                    }
                },
                function error(response) {
                    console.log(response);
                });

        };
        //$scope.onNationalityChange();

        $scope.$watch("searchNationalityText", function () {
            $scope.onNationalityChangeLookup($scope.searchNationalityText);
        });


        $scope.onNationalityChangeLookup = function (searchStr) {
            $scope.onNationalityChange(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageNationality = 1;
            if ($scope.nationalityListFull) {
                $scope.nationalityList = $scope.nationalityListFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchNationalityText.toLowerCase()) || (obj.EngName && obj.EngName.toLowerCase().includes($scope.searchNationalityText.toLowerCase()))
                        || (obj.ArbName && obj.ArbName.toLowerCase().includes($scope.searchNationalityText.toLowerCase()));
                });
            }
        };



        //Get Nationality Lookup -- End

        //Get Load Type Lookup-- Begin
        $scope.openLoadTypeLookup = function (event, loadTypeMode) {
            $scope.searchLoadTypeText = '';
            if (event == 'click' || event.key == "F9") {
                $scope.loadTypeMode = loadTypeMode;
                $("#LoadTypeLookup").modal({ backdrop: "static" });
                $('#searchLoadTypeText').focus();
                $('#searchLoadTypeText').select();
                $("#LoadTypeLookup").off("keydown");
                $('#LoadTypeLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndex < $scope.loadTypeList.length - 1) {
                                    $scope.rowIndex++;
                                    if ($scope.rowIndex > 10 * $scope.loadTypeList - 1) {
                                        $scope.lookUpCurrentPageLoadType++;
                                    }
                                    $scope.loadTypeSelected = $scope.loadTypeList[$scope.rowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndex > 0) {

                                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageLoadType - 1)) {
                                        $scope.lookUpCurrentPageLoadType--;
                                    }
                                    $scope.rowIndex--;
                                    $scope.loadTypeSelected = $scope.loadTypeList[$scope.rowIndex];
                                }
                                break;
                            case 13:
                                $scope.setLoadType($scope.loadTypeSelected);
                                $("#LoadTypeLookup").modal("hide");
                                break;
                        }
                    });
                });
            }
        };
        $scope.setLoadType = function (row) {
            //var loadType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            var loadType = (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            if ($scope.loadTypeMode == 'close') {
                $scope.vehicleReg.LoadTypeClose = loadType;
                $scope.selectedcloseDriverNatOriginObj = {};
                $scope.selectedcloseDriverNatOriginObj.originalObject = row;
            }
            else if ($scope.loadTypeMode == 'open') {
                $scope.vehicleReg.LoadTypeOpen = loadType;
                $scope.selectedOpenLoadTypeObj = {};
                $scope.selectedOpenLoadTypeObj.originalObject = row;
            }
            $("#LoadTypeLookup").modal("hide");
        };

        // GET Load Type LIST
        $scope.onLoadTypeChange = function (searchStr) {
            apiService.get('Customs/Lookup/CarLoadTypes', {
                centerCode: $scope.centerCode, searchString: ''
            }, function (results) {
                $scope.loadTypeList = results.data.ResponseResult.Data;
                $scope.loadTypeListFull = angular.copy($scope.loadTypeList);
                //$scope.vehicleReg.LoadType = $scope.docTypeList != null ? $scope.carLoadTypeList[0].Code : "";
            })
        };
        $scope.onLoadTypeChange();

        $scope.$watch("searchLoadTypeText", function () {
            $scope.onLoadTypeChangeLookup($scope.searchLoadTypeText);
        });


        $scope.onLoadTypeChangeLookup = function (searchStr) {
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageLoadType = 1;
            if ($scope.loadTypeListFull) {
                $scope.loadTypeList = $scope.loadTypeListFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchLoadTypeText.toLowerCase()) || (obj.EngName && obj.EngName.toLowerCase().includes($scope.searchLoadTypeText.toLowerCase()))
                        || (obj.ArbName && obj.ArbName.toLowerCase().includes($scope.searchLoadTypeText.toLowerCase()));
                });
            }
        };

        //Get LoadType Lookup -- End

        // GET ENTRY/EXIT GATE LIST 
        $scope.GetEntryExitGateList = function () {
            apiService.get('Customs/Lookup/EntryExitGate', {
                centerCode: $scope.centerCode, searchString: ''
            }, function (results) {
                $scope.entryExitGateList = results.data.ResponseResult.Data;
                if ($scope.entryExitGateList != null) {
                    //var entryCode = $scope.entryExitGateList.filter(a => a.Code == 'N');
                    //$scope.selectedGate = entryCode[0].Code;
                    $scope.selectedGate = ($scope.billType == 'I' || $scope.billType == 'T' || $scope.billType == 'N') ? 'N' : 'X';
                }
            },
                function error(response) {
                    console.log(response);
                });
        }

        // GET CAR LOAD TYPE LIST 
        //$scope.GetCarLoadTypeList = function () {
        //    apiService.get('Customs/Lookup/CarLoadTypes', {
        //        centerCode: $scope.centerCode, searchString: ''
        //    }, function (results) {
        //        $scope.carLoadTypeList = results.data.ResponseResult.Data;
        //        $scope.vehicleReg.LoadType = $scope.docTypeList != null ? $scope.carLoadTypeList[0].Code : "";
        //    },
        //function error(response) {
        //    console.log(response);
        //});
        //}

        // GET DOC TYPE LIST 
        $scope.GetDocTypeList = function () {
            apiService.get('Customs/Lookup/DriverDocTypes', {
                centerCode: $scope.centerCode, searchString: ''
            }, function (results) {
                $scope.docTypeList = results.data.ResponseResult.Data;
                $scope.vehicleReg.DocType = $scope.docTypeList != null ? $scope.docTypeList[0].Code : "";
            },
                function error(response) {
                    console.log(response);
                });
        };
        $scope.gateSelectionChanged = function () {
            initializeLookups();
            $("#loadingScreen").show();
            var params =
            {
                centerCode: $scope.centerCode,
                gateSelection: $scope.selectedGate,
                preRegistrationFlag: $scope.navigatedFromMenu
            };
            apiService.get('Customs/Vehicle/GetGateLocation', params, function (result) {
                $("#loadingScreen").hide();
                resetPlateHeaderDetails();
                var response = result.data.ResponseResult;
                if (response && response.IsValid) {
                    var gateLocation = response.Data ? response.Data.GateLocation : '';
                    $scope.selectedGate = gateLocation;
                    $scope.truckDetailChange();
                }
                else {
                    modalErrorShow(msg);
                }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }
        function resetPlateHeaderDetails() {
            $scope.selectedPlateCategory = null;
            $scope.selectedPlateOrigin = null;
            $scope.selectedPlateColor = null;
            $scope.vehicleReg.PlateNumber = null;
            $scope.selectedPlateCategoryObj = null;
            $scope.selectedPlateOriginObj = null;
            $scope.selectedPlateColorObj = null;
        };
        $scope.truckDetailChange = function (data) {
            if (data == 'Yaa') {
                $scope.showVehicleRegDetails = false;
                }
        };
        $scope.$watch('[selectedPlateColor,selectedPlateOrigin,selectedPlateCategory]', function () {
            $scope.truckDetailChange();
        }, true);
        //Set Vehicel Details
        function setVehicleDetails() {
            if ($scope.vehicleReg) {

                //Set Vehicle Category
                if ($scope.vehicleReg.VCTCode) {
                    $scope.selectedVehicleCategory = $scope.vehicleReg ? ($scope.vehicleReg.VCTCode) : "";// + "     " + ($scope.vehicleReg.TextVehicleCategoryEng ? $scope.vehicleReg.TextVehicleCategoryEng : '') + "     " + ($scope.vehicleReg.TextVehicleCategory ? $scope.vehicleReg.TextVehicleCategory : '')) : '';
                    $scope.selectedVehicleCategoryEnglish = $scope.vehicleReg.TextVehicleCategoryEng;
                    $scope.selectedVehicleCategoryArabic = $scope.vehicleReg.TextVehicleCategory;
                    $scope.selectedVehicleCategoryObj = {};
                    $scope.selectedVehicleCategoryObj.originalObject = {};
                    $scope.selectedVehicleCategoryObj.originalObject.Code = $scope.vehicleReg.VCTCode;
                    $scope.selectedVehicleCategoryObj.originalObject.EngName = $scope.vehicleReg.TextVehicleCategoryEng;
                    $scope.selectedVehicleCategoryObj.originalObject.ArbName = $scope.vehicleReg.TextVehicleCategory;
                }
                //Set Vehicle Color
                if ($scope.vehicleReg.CarColor) {
                    $scope.selectedVehicleColor = $scope.vehicleReg ? ($scope.vehicleReg.CarColor) : "";//+ "     " + ($scope.vehicleReg.CarColorEng ? $scope.vehicleReg.CarColorEng : '') + "     " + ($scope.vehicleReg.CarT2Desc ? $scope.vehicleReg.CarT2Desc : '')) : '';
                    $scope.selectedVehicleColorEng = $scope.vehicleReg.CarColorEng;
                    $scope.selectedVehicleColorArb = $scope.vehicleReg.CarT2Desc;
                    $scope.selectedVehicleColorObj = {};
                    $scope.selectedVehicleColorObj.originalObject = {};
                    $scope.selectedVehicleColorObj.originalObject.Code = $scope.vehicleReg.CarColor;
                    $scope.selectedVehicleColorObj.originalObject.EnglishName = $scope.vehicleReg.CarColorEng;
                    $scope.selectedVehicleColorObj.originalObject.ArabicName = $scope.vehicleReg.CarT2Desc;
                }
                //Set Vehicle Type
                if ($scope.vehicleReg.VSTCode) {
                    $scope.selectedVehicleType = $scope.vehicleReg ? ($scope.vehicleReg.VSTCode) : "";// + "     " + ($scope.vehicleReg.TextVehicleTypeEng ? $scope.vehicleReg.TextVehicleTypeEng : '') + "     " + ($scope.vehicleReg.TextVehicleType ? $scope.vehicleReg.TextVehicleType : '')) : '';
                    $scope.vehicleTypeEngilsh = $scope.vehicleReg.TextVehicleTypeEng;
                    $scope.vehicleTypeArabic = $scope.vehicleReg.TextVehicleType;
                    $scope.selectedVehicleTypeObj = {};
                    $scope.selectedVehicleTypeObj.originalObject = {};
                    $scope.selectedVehicleTypeObj.originalObject.Code = $scope.vehicleReg.VSTCode;
                    $scope.selectedVehicleTypeObj.originalObject.EngName = $scope.vehicleReg.TextVehicleTypeEng;
                    $scope.selectedVehicleTypeObj.originalObject.ArbName = $scope.vehicleReg.TextVehicleType;
                }
                //Owner Nationality
                if ($scope.vehicleReg.OwnerNationality) {
                    $scope.selectedOwnerNationality = $scope.vehicleReg ? ($scope.vehicleReg.OwnerNationality):"";// + "     " + ($scope.vehicleReg.TextOwnerNationalityEng ? $scope.vehicleReg.TextOwnerNationalityEng : '') + "     " + ($scope.vehicleReg.TextOwnerNationality ? $scope.vehicleReg.TextOwnerNationality : '')) : '';
                    $scope.selectedOwnerNationalityEng = $scope.vehicleReg.TextOwnerNationalityEng;
                    $scope.selectedOwnerNationalityArb = $scope.vehicleReg.TextOwnerNationality;
                    $scope.selectedOwnerNatOriginObj = {};
                    $scope.selectedOwnerNatOriginObj.originalObject = {};
                    $scope.selectedOwnerNatOriginObj.originalObject.Code = $scope.vehicleReg.OwnerNationality;
                    $scope.selectedOwnerNatOriginObj.originalObject.EngName = $scope.vehicleReg.TextOwnerNationalityEng;
                    $scope.selectedOwnerNatOriginObj.originalObject.ArbName = $scope.vehicleReg.TextOwnerNationality;
                }
                //Open Destination
                if ($scope.vehicleReg.DestinationCountryOpen) {
                    $scope.selectedOpenDestination = $scope.vehicleReg ? ($scope.vehicleReg.DestinationCountryOpen + "     " + ($scope.vehicleReg.TextDestinationCountryOpenEng ? $scope.vehicleReg.TextDestinationCountryOpenEng : '') + "     " + ($scope.vehicleReg.TextDestinationCountryOpen ? $scope.vehicleReg.TextDestinationCountryOpen : '')) : '';
                    $scope.selectedOpenDestinationObj = {};
                    $scope.selectedOpenDestinationObj.originalObject = {};
                    $scope.selectedOpenDestinationObj.originalObject.Code = $scope.vehicleReg.DestinationCountryOpen;
                    $scope.selectedOpenDestinationObj.originalObject.CountryEngName = $scope.vehicleReg.TextDestinationCountryOpenEng;
                    $scope.selectedOpenDestinationObj.originalObject.CountryArbName = $scope.vehicleReg.TextDestinationCountryOpen;
                }
                //Close Destination
                if ($scope.vehicleReg.DestinationCountryClose) {
                    $scope.selectedCloseDestination = $scope.vehicleReg ? ($scope.vehicleReg.DestinationCountryClose + "     " + ($scope.vehicleReg.TextDestinationCountryCloseEng ? $scope.vehicleReg.TextDestinationCountryCloseEng : '') + "     " + ($scope.vehicleReg.TextDestinationCountryClose ? $scope.vehicleReg.TextDestinationCountryClose : '')) : '';
                    $scope.selectedCloseDestinationObj = {};
                    $scope.selectedCloseDestinationObj.originalObject = {};
                    $scope.selectedCloseDestinationObj.originalObject.Code = $scope.vehicleReg.DestinationCountryClose;
                    $scope.selectedCloseDestinationObj.originalObject.CountryEngName = $scope.vehicleReg.TextDestinationCountryCloseEng;
                    $scope.selectedCloseDestinationObj.originalObject.CountryArbName = $scope.vehicleReg.TextDestinationCountryClose;
                }
                //Open Nationality
                if ($scope.vehicleReg.DriverNATOpen) {
                    $scope.selectedopenDriverNationality = $scope.vehicleReg ? ($scope.vehicleReg.DriverNATOpen + "     " + ($scope.vehicleReg.TextDriverNATOpenEng ? $scope.vehicleReg.TextDriverNATOpenEng : '') + "     " + ($scope.vehicleReg.TextDriverNATOpen ? $scope.vehicleReg.TextDriverNATOpen : '')) : '';
                    $scope.selectedopenDriverNatOriginObj = {};
                    $scope.selectedopenDriverNatOriginObj.originalObject = {};
                    $scope.selectedopenDriverNatOriginObj.originalObject.Code = $scope.vehicleReg.DriverNATOpen;
                    $scope.selectedopenDriverNatOriginObj.originalObject.EngName = $scope.vehicleReg.TextDriverNATOpenEng;
                    $scope.selectedopenDriverNatOriginObj.originalObject.ArbName = $scope.vehicleReg.TextDriverNATOpen;
                }
                //Close Nationality
                if ($scope.vehicleReg.DriverNATClose) {
                    $scope.selectedcloseDriverNationality = $scope.vehicleReg ? ($scope.vehicleReg.DriverNATClose + "     " + ($scope.vehicleReg.TextDriverNATCloseEng ? $scope.vehicleReg.TextDriverNATCloseEng : '') + "     " + ($scope.vehicleReg.TextDriverNATClose ? $scope.vehicleReg.TextDriverNATClose : '')) : '';
                    $scope.selectedcloseDriverNatOriginObj = {};
                    $scope.selectedcloseDriverNatOriginObj.originalObject = {};
                    $scope.selectedcloseDriverNatOriginObj.originalObject.Code = $scope.vehicleReg.DriverNATClose;
                    $scope.selectedcloseDriverNatOriginObj.originalObject.EngName = $scope.vehicleReg.TextDriverNATCloseEng;
                    $scope.selectedcloseDriverNatOriginObj.originalObject.ArbName = $scope.vehicleReg.TextDriverNATClose;
                }
                //City
                $scope.city = ($scope.vehicleReg.CityCode ? $scope.vehicleReg.CityCode : '') + ' ' + ($scope.vehicleReg.CityDescEng ? $scope.vehicleReg.CityDescEng : '') + ' ' + ($scope.vehicleReg.CityDesc ? $scope.vehicleReg.CityDesc : '');

                $scope.vehicleReg.PermitNumber = $scope.vehicleReg.PermitNumber == '0' ? '' : $scope.vehicleReg.PermitNumber;

                $scope.vehicleReg.PassangerNumberOpen = $scope.vehicleReg.PassangerNumberOpen ? $scope.vehicleReg.PassangerNumberOpen : 1;
                $scope.vehicleReg.DriverIDTypeOpen = $scope.vehicleReg.DriverIDTypeOpen ? $scope.vehicleReg.DriverIDTypeOpen : "PASSPORT";

                //$scope.openTime = $scope.vehicleReg.DateOpen ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateOpen)), "HH:mm") : '';ss
                $scope.vehicleReg.DateOpen = $scope.vehicleReg.DateOpen != "" && $scope.vehicleReg.DateOpen != null ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateOpen)), "dd/MM/yyyy HH:mm") : '';
                //$scope.vehicleReg.closeTime = $scope.vehicleReg.DateClose ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateClose)), "HH:mm") : '';
                $scope.vehicleReg.DateClose = $scope.vehicleReg.DateClose != "" && $scope.vehicleReg.DateClose != null ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateClose)), "dd/MM/yyyy HH:mm") : '';
                $scope.vehicleReg.CarEDate = $scope.vehicleReg.CarEDate ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.CarEDate)), "dd/MM/yyyy") : '';
                $scope.vehicleReg.DriverIDDateOpen = $scope.vehicleReg.DriverIDDateOpen ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DriverIDDateOpen)), "dd/MM/yyyy") : '';
                $scope.vehicleReg.DriverIDDateClose = $scope.vehicleReg.DriverIDDateClose ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DriverIDDateClose)), "dd/MM/yyyy") : '';
                // $scope.vehicleReg.TextTransNumber = $scope.vehicleReg.PermitNumber;
                $scope.vehicleReg.ChassisNumber = "-";

                OpenCloseVisibility();
                //if Close section is editable, copy the driver name from open to close section
                if ($scope.IsCloseEditable) {
                    $scope.vehicleReg.DriverNameClose1 = angular.copy($scope.vehicleReg.DriverNameOpen1);
                    $scope.vehicleReg.DriverNameClose2 = angular.copy($scope.vehicleReg.DriverNameOpen2);
                    $scope.vehicleReg.DriverNameClose3 = angular.copy($scope.vehicleReg.DriverNameOpen3);
                    $scope.vehicleReg.DriverNameClose4 = angular.copy($scope.vehicleReg.DriverNameOpen4);
                }
                if ($scope.vehicleReg.JobNumberOpen != null) {
                    $scope.vehicleReg.IsdisableJobNumberOpen = true;
                }
                else {
                    $scope.vehicleReg.IsdisableJobNumberOpen = false;
                }
                if ($scope.vehicleReg.JobNumberClose != null) {
                    $scope.vehicleReg.IsdisableJobNumberClose = true;
                }
                else {
                    $scope.vehicleReg.IsdisableJobNumberClose = false;

                }
            }
            selectdatePicker();

        }
        function selectdatePicker() {
            $(".pickadate").pickadate({
                format: 'dd/mm/yyyy',
                selectYears: true,
                selectMonths: true
            });
        }

        function OpenCloseVisibility() {
            var row = $scope.selectedPlateOriginObj.originalObject;
            $scope.IsVisibleJobNumber = true;
            if ($scope.vehicleReg.OpenCloseFlag == "N") {
                $scope.IsOpenEditable = true;
                $scope.IsCloseEditable = true;
                $scope.IsVisibleJobNumber = true;
            }
            else {
                if (($scope.selectedGate == 'N' && row.CountryLocal == "N") || ($scope.selectedGate == 'X' && row.CountryLocal == "Y")) //(Entry && Foreign)&(Exit && Local)
                {
                    $scope.IsOpenEditable = true;
                    $scope.IsCloseEditable = false;
                    if ((row.CountryLocal == "N" && ['I', 'T', 'N'].includes($scope.billType)) || (row.CountryLocal == "Y" && ['E', 'O', 'R'].includes($scope.billType))) { // Job Number visible - False
                        $scope.IsVisibleJobNumber = false;
                    }
                }
                else if (($scope.selectedGate == 'N' && row.CountryLocal == "Y") || ($scope.selectedGate == 'X' && row.CountryLocal == "N")) { //Entry & Local
                    $scope.IsOpenEditable = false;
                    $scope.IsCloseEditable = true;
                    defaultValueSet();
                }
            }

        };
        function defaultValueSet() {
            $scope.vehicleReg.PassangerNumberClose = $scope.vehicleReg.PassangerNumberClose ? $scope.vehicleReg.PassangerNumberClose : 1;
            $scope.vehicleReg.DriverIDTypeClose = $scope.vehicleReg.DriverIDTypeClose ? $scope.vehicleReg.DriverIDTypeClose : "PASSPORT";
            if ($scope.vehicleReg.OpenCloseFlag == "Y") {
                $scope.vehicleReg.JobNumberClose = $scope.vehicleReg.JobNumberClose ? $scope.vehicleReg.JobNumberClose : $scope.jobNumber;
            }
            //$scope.vehicleReg.LoadTypeClose = $scope.vehicleReg.LoadTypeClose ? $scope.vehicleReg.LoadTypeClose : "80";
        }
        function validateTruckPreDetails() {
            //$scope.showVehicleRegDetails = true;
            $scope.validSelectedGate = $scope.selectedGate ? true : false;
            $scope.validPlateNumber = $scope.vehicleReg.PlateNumber ? true : false;

            var plateColorSelected = $scope.selectedPlateColorObj ? $scope.selectedPlateColorObj.originalObject.Code + $scope.selectedPlateColorObj.originalObject.EngName + ($scope.selectedPlateColorObj.originalObject.ArbName ? $scope.selectedPlateColorObj.originalObject.ArbName : '') : '';
            if ((!$scope.selectedPlateColor) || ($scope.selectedPlateColor && (plateColorSelected == 0 || ($scope.selectedPlateColor.replace(/\s/g, '') != plateColorSelected.replace(/\s/g, ''))))) {
                $scope.invalidPlateColor = true;
            }
            else {
                $scope.invalidPlateColor = false;
            }

            var plateOriginSelected = $scope.selectedPlateOriginObj ? $scope.selectedPlateOriginObj.originalObject.Code + ($scope.selectedPlateOriginObj.originalObject.CountryEngName ? $scope.selectedPlateOriginObj.originalObject.CountryEngName : '') + ($scope.selectedPlateOriginObj.originalObject.CountryArbName ? $scope.selectedPlateOriginObj.originalObject.CountryArbName : '') : '';
            if ((!$scope.selectedPlateOrigin) || ($scope.selectedPlateOrigin && (plateOriginSelected == 0 || ($scope.selectedPlateOrigin.replace(/\s/g, '') != plateOriginSelected.replace(/\s/g, ''))))) {
                $scope.invalidPlateOrigin = true;
            }
            else {
                $scope.invalidPlateOrigin = false;
            }

            var plateCategorySelected = $scope.selectedPlateCategoryObj ? $scope.selectedPlateCategoryObj.originalObject.CategoryCode + $scope.selectedPlateCategoryObj.originalObject.CategoryEngName + ($scope.selectedPlateCategoryObj.originalObject.CategoryArbName ? $scope.selectedPlateCategoryObj.originalObject.CategoryArbName : '') : '';
            if ((!$scope.selectedPlateCategory) || ($scope.selectedPlateCategory && (plateCategorySelected == 0 || ($scope.selectedPlateCategory.replace(/\s/g, '') != plateCategorySelected.replace(/\s/g, ''))))) {
                $scope.invalidPlateCategory = true;
            }
            else {
                $scope.invalidPlateCategory = false;
            }

            $scope.isValidPreDetails = ($scope.validSelectedGate && $scope.validPlateNumber && !$scope.invalidPlateColor && !$scope.invalidPlateOrigin && !$scope.invalidPlateCategory) ? true : false;

        }

        $scope.gotoVehicleTralier = function () {
            try
            {
                if (typeof (Storage) !== "undefined")
                {
                    var getTruckParameter =
                        {
                            centerCode: $scope.centerCode,
                            jobNumber: $scope.jobNumber,
                            plateNumber: $scope.vehicleReg ? $scope.vehicleReg.PlateNumber : '',
                            plateColor: ($scope.selectedPlateColorObj && $scope.selectedPlateColorObj.originalObject) ? $scope.selectedPlateColorObj.originalObject.Code : '',
                            plateOrigin: ($scope.selectedPlateOriginObj && $scope.selectedPlateOriginObj.originalObject) ? $scope.selectedPlateOriginObj.originalObject.Code : '',
                            plateCategory: ($scope.selectedPlateCategoryObj && $scope.selectedPlateCategoryObj.originalObject) ? $scope.selectedPlateCategoryObj.originalObject.CategoryCode : '',
                            gateSelection: $scope.selectedGate,
                            gateLocation: $scope.selectedGate
                        };

                    $scope.generateRegistrationPayLoad();
                    $scope.vehicleReg = angular.copy($scope.vehicleDetails);

                    localStorage.VehicleRegistrationStorageServiceParameter = JSON.stringify(getTruckParameter);
                    localStorage.VehicleRegistrationStorageData = JSON.stringify($scope.vehicleReg);

                   
                    

                    localStorage.selectedVehicleTypeObj = JSON.stringify($scope.selectedVehicleType);
                    localStorage.vehicleTypeEngilsh = JSON.stringify($scope.vehicleTypeEngilsh);
                    localStorage.vehicleTypeArabic = JSON.stringify($scope.vehicleTypeArabic);
                  

                    localStorage.selectedVehicleCategoryObj = JSON.stringify($scope.selectedVehicleCategory);
                    localStorage.selectedVehicleCategoryEnglish = JSON.stringify($scope.selectedVehicleCategoryEnglish);
                    localStorage.selectedVehicleCategoryArabic = JSON.stringify($scope.selectedVehicleCategoryArabic);
                 


                    localStorage.selectedVehicleColorObj = JSON.stringify($scope.selectedVehicleColor);
                    localStorage.selectedVehicleColorEng = JSON.stringify($scope.selectedVehicleColorEng);
                    localStorage.selectedVehicleColorArb = JSON.stringify($scope.selectedVehicleColorArb);
                   


                    localStorage.selectedOwnerNatOriginObj = JSON.stringify($scope.selectedOwnerNatOriginObj);

                    
                    localStorage.selectedcloseDriverNatOriginObj = JSON.stringify($scope.selectedcloseDriverNationality);
                    localStorage.selectedCloseDestinationObj = JSON.stringify($scope.selectedCloseDestination);

                    localStorage.selectedOpenDestinationObj = JSON.stringify($scope.selectedOpenDestination);
                    localStorage.selectedopenDriverNatOriginObj = JSON.stringify($scope.selectedopenDriverNationality);

                    //vehicleReg.LoadTypeClose
                    localStorage.LoadTypeClose = JSON.stringify($scope.vehicleReg.LoadTypeClose);
                    localStorage.LoadTypeOpen = JSON.stringify($scope.vehicleReg.LoadTypeOpen);
                    //vehicleReg.LoadTypeOpen

                    //selectedcloseDriverNationality

                    localStorage.selectedPlateColor = JSON.stringify($scope.selectedPlateColor);
                    localStorage.selectedPlateOrigin = JSON.stringify($scope.selectedPlateOrigin);
                    localStorage.selectedPlateCategory = JSON.stringify($scope.selectedPlateCategory);
                    //selectedPlateColor
                    //$scope.vehicleReg.PermitNumber
                    //$stateParams.PermitNumber

                }
            }
            catch (e) {

            }

            if (apiService.isNullOrEmptyOrUndefined($scope.vehicleReg.PermitNumber)) {
                $("#ConfirmSaveVehicleRegistration").modal("show");
            }
            else {
                $state.go("VehicleRegistrationTrailer", { 'centerCode': $scope.centerCode, 'PermitNumber': $scope.vehicleReg.PermitNumber, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $stateParams.fromMenu });
            }
            //$scope.GetPermitNumber();
            //  $state.go("VehicleRegistrationTrailer", { 'centerCode': $scope.centerCode, 'PermitNumber': $scope.vehicleReg.PermitNumber, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $stateParams.fromMenu});
            //$state.go('vehicleRegistration', { centerCode: $scope.centerCode, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $scope.navigatedFromMenu, PermitNumber: item.PermitNumber });
        };

        $scope.SaveVehicleInformation = function () {
            $scope.GetPermitNumber();
          //  $("#ConfirmSaveVehicleRegistration").modal("hide");
        }

        //Get Vehice Details on Validate Click
        $scope.GetTruckDetails = function (isSave) {
           resetVehicleRegitrationDetails();
            validateTruckPreDetails();
            if ($scope.isValidPreDetails)
            {
                //var getTruckParameter = {};
               var getTruckParameter =
                {
                    centerCode: $scope.centerCode,
                    jobNumber: $scope.jobNumber,
                    plateNumber: $scope.vehicleReg ? $scope.vehicleReg.PlateNumber : '',
                    plateColor: ($scope.selectedPlateColorObj && $scope.selectedPlateColorObj.originalObject) ? $scope.selectedPlateColorObj.originalObject.Code : '',
                    plateOrigin: ($scope.selectedPlateOriginObj && $scope.selectedPlateOriginObj.originalObject) ? $scope.selectedPlateOriginObj.originalObject.Code : '',
                    plateCategory: ($scope.selectedPlateCategoryObj && $scope.selectedPlateCategoryObj.originalObject) ? $scope.selectedPlateCategoryObj.originalObject.CategoryCode : '',
                    gateSelection: $scope.selectedGate,
                    gateLocation: $scope.selectedGate
                    };
                //if ($stateParams.Type == 'VehicleTrailer')
                //{
                //    Parameter = JSON.parse(localStorage.VehicleRegistrationStorageServiceParameter);
                //    getTruckParameter = Parameter;
                //}
                $("#loadingScreen").show();
                apiService.get('Customs/Vehicle/GetVehicleDetail',
                    getTruckParameter,
                    function (result) {
                        $("#loadingScreen").hide();
                        //result.data.ResponseResult = result.data.ResponseResult.replace(/\\n/g, "<br />");
                        var response = result.data.ResponseResult;
                        var msg = response ? response.Messages : '';
                        if (response && response.IsValid) {
                            if (msg && msg.length > 0 && !isSave) {
                                modalWarningShow(msg);
                            }
                            $scope.vehicleReg = response.Data;
                            setVehicleDetails();
                            $scope.showVehicleRegDetails = ($scope.vehicleReg && $scope.vehicleReg.FormFlag == 'Y') ? false : true;

                            if ($scope.vehicleReg.TrailerFlag == 1) {
                                $scope.TrailerFlag = false;
                            }
                            else {
                                $scope.TrailerFlag = true;
                            }
                        }
                        else {
                            if (!isSave) {
                                modalErrorShow(msg);
                            }
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
        }
        //Back to List
        $scope.gotoVehicleList = function () {
            $state.go('vehicleList', { centerCode: $scope.centerCode, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $scope.navigatedFromMenu },
                { notify: true });
        }
        $scope.ValidateForm = function () {
            $scope.isValid = true;
            $scope.validOwnerNationality = true;
            $scope.validVehicleType = true;
            $scope.validVehicleCategory = true;
            $scope.validVehicleColor = true;

            var ownerNationalitySelected = $scope.selectedOwnerNatOriginObj ? $scope.selectedOwnerNatOriginObj.originalObject.Code + ($scope.selectedOwnerNatOriginObj.originalObject.EngName ? $scope.selectedOwnerNatOriginObj.originalObject.EngName : '') + ($scope.selectedOwnerNatOriginObj.originalObject.ArbName ? $scope.selectedOwnerNatOriginObj.originalObject.ArbName : '') : '';
            if ((!$scope.selectedOwnerNationality) || ($scope.selectedOwnerNationality && (ownerNationalitySelected == 0))) {//|| ($scope.selectedOwnerNationality.replace(/\s/g, '') != ownerNationalitySelected.replace(/\s/g, ''))))) {
                $scope.validOwnerNationality = false;
                $scope.isValid = false;
            }
            var vehicleTypeSelected = $scope.selectedVehicleTypeObj ? $scope.selectedVehicleTypeObj.originalObject.Code + ($scope.selectedVehicleTypeObj.originalObject.EngName ? $scope.selectedVehicleTypeObj.originalObject.EngName : '') + ($scope.selectedVehicleTypeObj.originalObject.ArbName ? $scope.selectedVehicleTypeObj.originalObject.ArbName : '') : '';
            if ((!$scope.selectedVehicleType) || ($scope.selectedVehicleType && (vehicleTypeSelected == 0))) {// || ($scope.selectedVehicleType.replace(/\s/g, '') != vehicleTypeSelected.replace(/\s/g, ''))))) {
                $scope.validVehicleType = false;
                $scope.isValid = false;
            }
            var vehicleCategorySelected = $scope.selectedVehicleCategoryObj ? $scope.selectedVehicleCategoryObj.originalObject.Code + ($scope.selectedVehicleCategoryObj.originalObject.EngName ? $scope.selectedVehicleCategoryObj.originalObject.EngName : '') + ($scope.selectedVehicleCategoryObj.originalObject.ArbName ? $scope.selectedVehicleCategoryObj.originalObject.ArbName : '') : '';
        if ((!$scope.selectedVehicleCategory) || ($scope.selectedVehicleCategory && (vehicleCategorySelected == 0))) {// || ($scope.selectedVehicleCategory.replace(/\s/g, '') != vehicleCategorySelected.replace(/\s/g, ''))))) {
                $scope.validVehicleCategory = false;
                $scope.isValid = false;
            }
            var vehicleColorSelected = $scope.selectedVehicleColorObj ? $scope.selectedVehicleColorObj.originalObject.Code + ($scope.selectedVehicleColorObj.originalObject.EnglishName ? $scope.selectedVehicleColorObj.originalObject.EnglishName : '') + ($scope.selectedVehicleColorObj.originalObject.ArabicName ? $scope.selectedVehicleColorObj.originalObject.ArabicName : '') : '';
        if ((!$scope.selectedVehicleColor) || ($scope.selectedVehicleColor && (vehicleColorSelected == 0))) {// || ($scope.selectedVehicleColor.replace(/\s/g, '') != vehicleColorSelected.replace(/\s/g, ''))))) {
                $scope.validVehicleColor = false;
                $scope.isValid = false;
            }
        }
        $scope.generateRegistrationPayLoad = function () {

            $scope.vehicleDetails = angular.copy($scope.vehicleReg);
            //$scope.vehicleDetails.CompanyCode = null;
            //$scope.vehicleDetails.UserCode = null;
            $scope.vehicleDetails.CenterCode = $scope.centerCode;
            $scope.vehicleDetails.PlateColor = ($scope.selectedPlateColorObj && $scope.selectedPlateColorObj.originalObject) ? $scope.selectedPlateColorObj.originalObject.Code : '';
            $scope.vehicleDetails.TextPlateColor = ($scope.selectedPlateColorObj && $scope.selectedPlateColorObj.originalObject) ? $scope.selectedPlateColorObj.originalObject.ArbName : '';
            $scope.vehicleDetails.PlateOrigin = ($scope.selectedPlateOriginObj && $scope.selectedPlateOriginObj.originalObject) ? $scope.selectedPlateOriginObj.originalObject.Code : '';
            $scope.vehicleDetails.TextPlateOrigin = ($scope.selectedPlateOriginObj && $scope.selectedPlateOriginObj.originalObject) ? $scope.selectedPlateOriginObj.originalObject.CountryArbName : '';
            $scope.vehicleDetails.PlateCategory = ($scope.selectedPlateCategoryObj && $scope.selectedPlateCategoryObj.originalObject) ? $scope.selectedPlateCategoryObj.originalObject.CategoryCode : '';
            $scope.vehicleDetails.TextPlateCategory = ($scope.selectedPlateCategoryObj && $scope.selectedPlateCategoryObj.originalObject) ? $scope.selectedPlateCategoryObj.originalObject.CategoryArbName : '';
            $scope.vehicleDetails.PermitNumber = $scope.vehicleReg ? (($scope.vehicleReg.PermitNumber == '' || $scope.vehicleReg.PermitNumber == '0') ? null : $scope.vehicleReg.PermitNumber) : null;
            $scope.vehicleDetails.OwnerName = $scope.vehicleReg.OwnerName1 + ' ' + $scope.vehicleReg.OwnerName2 + ' ' + $scope.vehicleReg.OwnerName3 + ' ' + $scope.vehicleReg.OwnerName4;
            $scope.vehicleDetails.DriverNameOpen = ($scope.vehicleReg.DriverNameOpen1 ? ($scope.vehicleReg.DriverNameOpen1 + ' ') : '') + ($scope.vehicleReg.DriverNameOpen2 ? ($scope.vehicleReg.DriverNameOpen2 + ' ') : '') + ($scope.vehicleReg.DriverNameOpen3 ? ($scope.vehicleReg.DriverNameOpen3 + ' ') : '') + ($scope.vehicleReg.DriverNameOpen4 ? $scope.vehicleReg.DriverNameOpen4 : '');
            $scope.vehicleDetails.DriverNameClose = ($scope.vehicleReg.DriverNameClose1 ? ($scope.vehicleReg.DriverNameClose1 + ' ') : '') + ($scope.vehicleReg.DriverNameClose2 ? ($scope.vehicleReg.DriverNameClose2 + ' ') : '') + ($scope.vehicleReg.DriverNameClose3 ? ($scope.vehicleReg.DriverNameClose3 + ' ') : '') + ($scope.vehicleReg.DriverNameClose4 ? $scope.vehicleReg.DriverNameClose4 : '');

            $scope.vehicleDetails.GateSelection = $scope.selectedGate;

            $scope.vehicleDetails.VSTCode = ($scope.selectedVehicleTypeObj && $scope.selectedVehicleTypeObj.originalObject) ? $scope.selectedVehicleTypeObj.originalObject.Code : '';
            $scope.vehicleDetails.TextVehicleType = ($scope.selectedVehicleTypeObj && $scope.selectedVehicleTypeObj.originalObject) ? $scope.selectedVehicleTypeObj.originalObject.ArbName : '';

            $scope.vehicleDetails.VCTCode = ($scope.selectedVehicleCategoryObj && $scope.selectedVehicleCategoryObj.originalObject) ? $scope.selectedVehicleCategoryObj.originalObject.Code : '';
            $scope.vehicleDetails.TextVehicleCategory = ($scope.selectedVehicleCategoryObj && $scope.selectedVehicleCategoryObj.originalObject) ? $scope.selectedVehicleCategoryObj.originalObject.ArbName : '';

            $scope.vehicleDetails.CarColor = ($scope.selectedVehicleColorObj && $scope.selectedVehicleColorObj.originalObject) ? $scope.selectedVehicleColorObj.originalObject.ArabicName.substring(0, 19) : '';
            $scope.vehicleDetails.CarT2Desc = ($scope.selectedVehicleColorObj && $scope.selectedVehicleColorObj.originalObject) ? $scope.selectedVehicleColorObj.originalObject.Code : '';


            $scope.vehicleDetails.OwnerNationality = ($scope.selectedOwnerNatOriginObj && $scope.selectedOwnerNatOriginObj.originalObject) ? $scope.selectedOwnerNatOriginObj.originalObject.Code : '';
            $scope.vehicleDetails.TextOwnerNationality = ($scope.selectedOwnerNatOriginObj && $scope.selectedOwnerNatOriginObj.originalObject) ? $scope.selectedOwnerNatOriginObj.originalObject.ArbName : '';

            $scope.vehicleDetails.DriverNATOpen = ($scope.selectedopenDriverNatOriginObj && $scope.selectedopenDriverNatOriginObj.originalObject) ? $scope.selectedopenDriverNatOriginObj.originalObject.Code : '';
            $scope.vehicleDetails.TextDriverNATOpen = ($scope.selectedopenDriverNatOriginObj && $scope.selectedopenDriverNatOriginObj.originalObject) ? $scope.selectedopenDriverNatOriginObj.originalObject.ArbName : '';

            $scope.vehicleDetails.DestinationCountryOpen = ($scope.selectedOpenDestinationObj && $scope.selectedOpenDestinationObj.originalObject) ? $scope.selectedOpenDestinationObj.originalObject.Code : '';
            $scope.vehicleDetails.TextDestinationCountryOpen = ($scope.selectedOpenDestinationObj && $scope.selectedOpenDestinationObj.originalObject) ? $scope.selectedOpenDestinationObj.originalObject.CountryArbName : '';

            $scope.vehicleDetails.LoadFlagOpen = $scope.vehicleReg.LoadFlagOpen ? 'Y' : 'N';
            $scope.vehicleDetails.LoadFlagClose = $scope.vehicleReg.LoadFlagClose ? 'Y' : 'N';

            $scope.vehicleDetails.JobNumber = $scope.jobNumber;

            $scope.vehicleDetails.DriverNATClose = ($scope.selectedcloseDriverNatOriginObj && $scope.selectedcloseDriverNatOriginObj.originalObject) ? $scope.selectedcloseDriverNatOriginObj.originalObject.Code : '';
            $scope.vehicleDetails.TextDriverNATClose = ($scope.selectedcloseDriverNatOriginObj && $scope.selectedcloseDriverNatOriginObj.originalObject) ? $scope.selectedcloseDriverNatOriginObj.originalObject.ArbName : '';

            $scope.vehicleDetails.DestinationCountryClose = ($scope.selectedCloseDestinationObj && $scope.selectedCloseDestinationObj.originalObject) ? $scope.selectedCloseDestinationObj.originalObject.Code : '';
            $scope.vehicleDetails.TextDestinationCountryClose = ($scope.selectedCloseDestinationObj && $scope.selectedCloseDestinationObj.originalObject) ? $scope.selectedCloseDestinationObj.originalObject.CountryArbName : '';
            $scope.vehicleDetails.preRegistrationFlag = $scope.navigatedFromMenu;
            $scope.vehicleDetails.Direction = (($scope.vehicleReg.LocaFlag == 'Y' && $scope.selectedGate == 'X') || ($scope.vehicleReg.LocaFlag == 'N' && $scope.selectedGate == 'N')) ? 'OPEN' : 'CLOSE';
             
            //if ($scope.selectedGate == 'N') {
            //    $scope.vehicleDetails.DateClose = $filter('date')(new Date(), "dd/MM/yyyy HH:mm");
            //}
            //$scope.vehicleDetails.DateOpen = $filter('date')(new Date(), "dd/MM/yyyy HH:mm");

        };
        $scope.saveVehicleRegistration = function () {
            $scope.ValidateForm();
            if ($scope.isValid) {
                $("#loadingScreen").show();
                $scope.generateRegistrationPayLoad();

                apiService.post('Customs/Vehicle/RegisterVehicle', '', $scope.vehicleDetails, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Vehicle could not be registered.";
                    //$scope.vehicleReg.PermitNumber = (response && response.Data) ? response.Data.PermitNumber : '';
                    if (response && response.IsValid) {
                        $scope.GetTruckDetails(true);
                        $scope.okText = $filter('translate')('ok');
                        var vehicleRegistrationSuccessMsg = $filter('translate')('vehicleRegistrationSuccessMsg') + '<b>' + (response.Data ? response.Data.PermitNumber : '') + '</b>';
                        showConfirmMessage(vehicleRegistrationSuccessMsg);
                    }
                    else {
                        modalErrorShow(msg);
                    }
                },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
        }
        $scope.GetPermitNumber = () => {
            debugger;
            $("#loadingScreen").show();
            $scope.generateRegistrationPayLoad();
            apiService.post('Customs/Vehicle/GetPermitNumber', '', $scope.vehicleDetails,
                function (results) {
                    $("#loadingScreen").hide();
                    var data = results.data.ResponseResult;
                    if (data.IsValid) {
                        $stateParams.PermitNumber = data.Data.PermitNumber;
                        $scope.vehicleReg.PermitNumber = data.Data.PermitNumber;
                        $("#ConfirmSaveVehicleRegistration").modal("hide");
                        //$scope.IsJobNumberVisible = true;
                        $state.go("VehicleRegistrationTrailer", { 'centerCode': $scope.centerCode, 'PermitNumber': $scope.vehicleReg.PermitNumber, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $stateParams.fromMenu });
                    }
                    else {
                        $("#loadingScreen").hide();
                        modalWarningShow(data.MessageEnglish);
                    }
                },
                function error(response) {
                    modalErrorShow(response);
                    console.log(response);
                    $("#loadingScreen").hide();
                });
            //$("#loadingScreen").hide();
        }

        $scope.OwnerNameChange = function (inputModel, id) {
            if ($scope.IsCloseEditable) {
                $scope.vehicleReg["DriverNameClose" + id] = $scope.vehicleReg[inputModel];
            }
            if ($scope.IsOpenEditable) {
                $scope.vehicleReg["DriverNameOpen" + id] = $scope.vehicleReg[inputModel];
            }
        }

        //$scope.$watch("selectedOwnerNationality", function () {
        //    if ($scope.IsCloseEditable) {
        //        $scope.selectedcloseDriverNationality = angular.copy($scope.selectedopenDriverNationality);
        //        if ($scope.selectedopenDriverNatOriginObj) {
        //            $scope.selectedcloseDriverNationalityEng = angular.copy($scope.selectedopenDriverNatOriginObj.originalObject.EngName);
        //            $scope.selectedcloseDriverNationalityArb = angular.copy($scope.selectedopenDriverNatOriginObj.originalObject.ArbName);
        //        }
        //        $scope.selectedcloseDriverNatOriginObj = angular.copy($scope.selectedopenDriverNatOriginObj);
        //    }
        //    if ($scope.IsOpenEditable) {
        //        $scope.selectedopenDriverNationality = angular.copy($scope.selectedOwnerNationality);
        //        if ($scope.selectedOwnerNatOriginObj) {
        //            $scope.selectedopenDriverNationalityEng = angular.copy($scope.selectedOwnerNatOriginObj.originalObject.EngName);
        //            $scope.selectedopenDriverNationalityArb = angular.copy($scope.selectedOwnerNatOriginObj.originalObject.ArbName);
        //        }
        //        $scope.selectedopenDriverNatOriginObj = angular.copy($scope.selectedOwnerNatOriginObj);
        //    }
        //});

        function getClientIPAddress() {
            apiService.getClientName('', function (results) {
                $scope.clientIpAddress = (results && results.data) ? results.data.userHostAddress : '';
            },
                function (error) {
                    console.log(error);
                });
        }

        $scope.getEmirateIdDetails = function (type) {
            $("#loadingScreen").show();
            apiService.selfHostEIDGet("eidreader/GetPersonalData", null,
                function (result) {
                    $("#loadingScreen").hide();
                    var data = result.data;
                    var uaeId = data.EID;
                    var name = data.FullName.split(',');
                    var nationality = data.ArabicNationality;
                    $scope.IsEmiratesId = true;
                    $scope.controltype = type;
                    $scope.onNationalityChange(nationality);
                    //var row = $scope.nationalityList.filter(x => x.ArbName == nationality);
                    var expiryDate = data.ExpiryDate;
                    //if (row != null) {
                    //    $scope.setNationality(row[0]);
                    //}
                    if (type == 'close') {
                        $scope.vehicleReg.DriverIDNumberClose = uaeId;
                        $scope.vehicleReg.DriverNameClose1 = name[0];
                        $scope.vehicleReg.DriverNameClose2 = name[1];
                        $scope.vehicleReg.DriverNameClose3 = name[2];
                        $scope.vehicleReg.DriverNameClose4 = name[3] == "" ? name[4] : name[3];
                        $scope.vehicleReg.DriverIDTypeClose = "ID";
                        $scope.vehicleReg.DriverIDDateClose = expiryDate;
                    }
                    else {
                        $scope.vehicleReg.DriverIDNumberOpen = uaeId;
                        $scope.vehicleReg.DriverNameOpen1 = name[0];
                        $scope.vehicleReg.DriverNameOpen2 = name[1];
                        $scope.vehicleReg.DriverNameOpen3 = name[2];
                        $scope.vehicleReg.DriverNameOpen4 = name[3] == "" ? name[4] : name[3];
                        $scope.vehicleReg.DriverIDTypeOpen = "ID";
                        $scope.vehicleReg.DriverIDDateOpen = expiryDate;
                    }
                },
                function error(response) {
                    if (response.status == -1) {
                        modalErrorDownloadShow("Its seems Emirates ID Reader is not yet installed, To install please click downlad button and install");
                    }
                    else {
                        modalErrorShow("An Error has occurred while reading the Emirates ID");
                    }
                    //status -1  - not installed 
                    //status 500 - card not inserted 
                    $("#loadingScreen").hide();
                });
        };
        function resetVehicleRegitrationDetails() {
            $scope.selectedVehicleType = null;
            $scope.vehicleTypeEngilsh = null;
            $scope.vehicleTypeArabic = null;
            $scope.selectedVehicleCategory = null;
            $scope.selectedVehicleCategoryEnglish = null;
            $scope.selectedVehicleCategoryArabic = null;
            $scope.selectedVehicleColor = null;
            $scope.selectedVehicleColorEng = null;
            $scope.selectedVehicleColorArb = null;
            $scope.selectedOwnerNationality = null;
            $scope.selectedOwnerNationalityEng = null;
            $scope.selectedOwnerNationalityArb = null;
            $scope.selectedCloseDestination = null;
            $scope.selectedcloseDriverNationality = null;
            $scope.selectedOpenDestination = null;
            $scope.selectedopenDriverNationality = null;
            $scope.selectedVehicleTypeObj = null;
            $scope.selectedVehicleCategoryObj = null;
            $scope.selectedVehicleColorObj = null;
            $scope.selectedOwnerNatOriginObj = null;
        }

        $scope.GetTruckDetailsByLocalStorage = function (LocalData, isSave) {
            resetVehicleRegitrationDetails();
           // if ($scope.isValidPreDetails) {
            var getTruckParameter = LocalData;
                    //{
                    //    centerCode: $scope.centerCode,
                    //    jobNumber: $scope.jobNumber,
                    //    plateNumber: $scope.vehicleReg ? $scope.vehicleReg.PlateNumber : '',
                    //    plateColor: ($scope.selectedPlateColorObj && $scope.selectedPlateColorObj.originalObject) ? $scope.selectedPlateColorObj.originalObject.Code : '',
                    //    plateOrigin: ($scope.selectedPlateOriginObj && $scope.selectedPlateOriginObj.originalObject) ? $scope.selectedPlateOriginObj.originalObject.Code : '',
                    //    plateCategory: ($scope.selectedPlateCategoryObj && $scope.selectedPlateCategoryObj.originalObject) ? $scope.selectedPlateCategoryObj.originalObject.CategoryCode : '',
                    //    gateSelection: $scope.selectedGate,
                    //    gateLocation: $scope.selectedGate
                    //};
                $("#loadingScreen").show();
                apiService.get('Customs/Vehicle/GetVehicleDetail',
                    getTruckParameter,
                    function (result) {
                        $("#loadingScreen").hide();
                        //result.data.ResponseResult = result.data.ResponseResult.replace(/\\n/g, "<br />");
                        var response = result.data.ResponseResult;
                        var msg = response ? response.Messages : '';
                        if (response && response.IsValid) {
                            if (msg && msg.length > 0 && !isSave) {
                                modalWarningShow(msg);
                            }
                            $scope.vehicleReg = response.Data;
                            setVehicleDetails();
                            $scope.showVehicleRegDetails = ($scope.vehicleReg && $scope.vehicleReg.FormFlag == 'Y') ? false : true;

                            if ($scope.vehicleReg.TrailerFlag == 1) {
                                $scope.TrailerFlag = false;
                            }
                            else {
                                $scope.TrailerFlag = true;
                            }
                        }
                        else {
                            if (!isSave) {
                                modalErrorShow(msg);
                            }
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
           // }
        }

        $scope.init = function () {
            $scope.GetEntryExitGateList();
            $scope.GetDocTypeList();
            $scope.TrailerFlag = true;
            //$scope.GetCarLoadTypeList();
            initializeLookups();
            if ($stateParams.Type == 'VehicleTrailer')
            {
                var Parameter = '';

               
                if (!apiService.isNullOrEmptyOrUndefined(localStorage.VehicleRegistrationStorageServiceParameter)
                    && !apiService.isNullOrEmptyOrUndefined(localStorage.VehicleRegistrationStorageData))
                {
                   
                    Parameter = JSON.parse(localStorage.VehicleRegistrationStorageServiceParameter);

                    $scope.vehicleReg = JSON.parse(localStorage.VehicleRegistrationStorageData);
                    $scope.jobNumber = Parameter.jobNumber;
                    $scope.vehicleReg.PlateNumber = Parameter.plateNumber;

                    $scope.selectedPlateColor= $scope.vehicleReg.PlateColor + " " + $scope.vehicleReg.TextPlateColorEng + " " + $scope.vehicleReg.TextPlateColor;

                    $scope.selectedPlateColorObj.originalObject.Code = $scope.vehicleReg.PlateColor;
                    $scope.selectedPlateColorObj.originalObject.EngName = $scope.vehicleReg.TextPlateColorEng;
                    $scope.selectedPlateColorObj.originalObject.ArbName = $scope.vehicleReg.TextPlateColor;

                    $scope.selectedPlateOriginObj.originalObject.Code = $scope.vehicleReg.PlateOrigin;
                    $scope.selectedPlateOriginObj.originalObject.CountryEngName = $scope.vehicleReg.TextPlateOriginEng;
                    $scope.selectedPlateOriginObj.originalObject.CountryArbName = $scope.vehicleReg.TextPlateOrigin;

                    $scope.selectedPlateCategoryObj.originalObject.CategoryCode = $scope.vehicleReg.PlateCategory;
                    $scope.selectedPlateCategoryObj.originalObject.EngName = $scope.vehicleReg.TextPlateCategoryEng;
                    $scope.selectedPlateCategoryObj.originalObject.ArbName = $scope.vehicleReg.TextPlateCategory;
                    
                    $scope.selectedGate = Parameter.gateSelection;
                    $scope.selectedGate = Parameter.gateLocation;
                    $scope.vehicleReg.PermitNumber = $stateParams.PermitNumber;
                    setVehicleDeta();
                   // $scope.GetTruckDetailsByLocalStorage(Parameter, true);
                    $scope.showVehicleRegDetails = ($scope.vehicleReg && $scope.vehicleReg.FormFlag == 'Y') ? false : true;

                    try {
                        //$scope.selectedVehicleCategoryObj.originalObject = CheckData(localStorage.selectedVehicleCategoryObj)==true ? JSON.parse(localStorage.selectedVehicleCategoryObj):"";
                        //$scope.selectedVehicleColorObj.originalObject = CheckData(localStorage.selectedVehicleColorObj) == true ? JSON.parse(localStorage.selectedVehicleColorObj) : "";
                        //$scope.selectedVehicleTypeObj.originalObject = CheckData(localStorage.selectedVehicleTypeObj) == true ? JSON.parse(localStorage.selectedVehicleTypeObj) : "";
                        //$scope.selectedOwnerNatOriginObj.originalObject = CheckData(localStorage.selectedOwnerNatOriginObj) == true ? JSON.parse(localStorage.selectedOwnerNatOriginObj) : "";

                        //$scope.selectedCloseDestination = CheckData(localStorage.selectedOpenDestinationObj) == true ? JSON.parse(localStorage.selectedOpenDestinationObj) : "";
                        $scope.selectedCloseDestination = CheckData(localStorage.selectedCloseDestinationObj) == true ? JSON.parse(localStorage.selectedCloseDestinationObj) : "";
                        $scope.selectedopenDriverNationality = CheckData(localStorage.selectedopenDriverNatOriginObj) == true ? JSON.parse(localStorage.selectedopenDriverNatOriginObj) : "";
                        $scope.selectedcloseDriverNationality = CheckData(localStorage.selectedcloseDriverNatOriginObj) == true ? JSON.parse(localStorage.selectedcloseDriverNatOriginObj) : "";
                        $scope.selectedOpenDestination = CheckData(localStorage.selectedOpenDestinationObj) == true ? JSON.parse(localStorage.selectedOpenDestinationObj) : "";

                        $scope.vehicleReg.LoadTypeClose = CheckData(localStorage.LoadTypeClose) == true ? JSON.parse(localStorage.LoadTypeClose) : "";
                        $scope.vehicleReg.LoadTypeOpen = CheckData(localStorage.LoadTypeOpen) == true ? JSON.parse(localStorage.LoadTypeOpen) : "";


                        $scope.selectedVehicleType = CheckData(localStorage.selectedVehicleTypeObj) == true ? JSON.parse(localStorage.selectedVehicleTypeObj) : "";
                        $scope.vehicleTypeEngilsh = CheckData(localStorage.vehicleTypeEngilsh) == true ? JSON.parse(localStorage.vehicleTypeEngilsh) : "";
                        $scope.vehicleTypeArabic = CheckData(localStorage.vehicleTypeArabic) == true ? JSON.parse(localStorage.vehicleTypeArabic) : "";

                        $scope.selectedVehicleCategory = CheckData(localStorage.selectedVehicleCategoryObj) == true ? JSON.parse(localStorage.selectedVehicleCategoryObj) : "";
                        $scope.selectedVehicleCategoryEnglish = CheckData(localStorage.selectedVehicleCategoryEnglish) == true ? JSON.parse(localStorage.selectedVehicleCategoryEnglish) : "";
                        $scope.selectedVehicleCategoryArabic = CheckData(localStorage.selectedVehicleCategoryArabic) == true ? JSON.parse(localStorage.selectedVehicleCategoryArabic) : "";


                        $scope.selectedVehicleColor = CheckData(localStorage.selectedVehicleColorObj) == true ? JSON.parse(localStorage.selectedVehicleColorObj) : "";
                        $scope.selectedVehicleColorEng = CheckData(localStorage.selectedVehicleColorEng) == true ? JSON.parse(localStorage.selectedVehicleColorEng) : "";
                        $scope.selectedVehicleColorArb = CheckData(localStorage.selectedVehicleColorArb) == true ? JSON.parse(localStorage.selectedVehicleColorArb) : "";



                        $scope.selectedPlateColor = CheckData(localStorage.selectedPlateColor) == true ?JSON.parse(localStorage.selectedPlateColor):"";
                        $scope.selectedPlateOrigin = CheckData(localStorage.selectedPlateOrigin) == true ? JSON.parse(localStorage.selectedPlateOrigin) : "";
                        $scope.selectedPlateCategory = CheckData(localStorage.selectedPlateCategory) == true ? JSON.parse(localStorage.selectedPlateCategory) : "";
                        
                    }
                    catch{
                        localStorage.removeItem('selectedVehicleColorObj');
                        localStorage.removeItem('selectedVehicleColorEng');
                        localStorage.removeItem('selectedVehicleColorArb');

                        localStorage.removeItem('selectedVehicleTypeObj');
                        localStorage.removeItem('vehicleTypeEngilsh');
                        localStorage.removeItem('vehicleTypeArabic');

                        localStorage.removeItem('selectedVehicleCategoryObj');
                        localStorage.removeItem('selectedVehicleCategoryEnglish');
                        localStorage.removeItem('selectedVehicleCategoryArabic');

                        localStorage.removeItem('selectedVehicleColorObj');
                        localStorage.removeItem('selectedVehicleColorEng');
                        localStorage.removeItem('selectedVehicleColorArb');


                        localStorage.removeItem('selectedOwnerNatOriginObj');
                        localStorage.removeItem('selectedOpenDestinationObj');
                        localStorage.removeItem('selectedCloseDestinationObj');
                        localStorage.removeItem('selectedopenDriverNatOriginObj');
                        localStorage.removeItem('selectedcloseDriverNatOriginObj');

                        localStorage.removeItem('VehicleRegistrationStorageServiceParameter');
                        localStorage.removeItem('VehicleRegistrationStorageData');

                        localStorage.removeItem('selectedPlateColor');
                        localStorage.removeItem('selectedPlateOrigin');
                        localStorage.removeItem('selectedPlateCategory');

                    }

                    //$scope.GetTruckDetails(true);
                }
               
                if ($scope.vehicleReg.TrailerFlag == 1) {
                    $scope.TrailerFlag = false;
                }
                else {
                    $scope.TrailerFlag = true;
                }

                localStorage.removeItem('selectedVehicleCategoryObj');
                localStorage.removeItem('selectedVehicleColorObj');
                localStorage.removeItem('selectedVehicleTypeObj');
                localStorage.removeItem('selectedOwnerNatOriginObj');
                localStorage.removeItem('selectedOpenDestinationObj');
                localStorage.removeItem('selectedCloseDestinationObj');
                localStorage.removeItem('selectedopenDriverNatOriginObj');
                localStorage.removeItem('selectedcloseDriverNatOriginObj');
                localStorage.removeItem('VehicleRegistrationStorageServiceParameter');
                localStorage.removeItem('VehicleRegistrationStorageData');

                //if (!apiService.isNullOrEmptyOrUndefined($stateParams.IsJobNumberVisible))
                //{
                //    if ($stateParams.IsJobNumberVisible)
                //    {

                //    }
                //}
            }
        }

        function CheckData(item)
        {
            if (item == "undefined") {
                return false;
            }
            else if (apiService.isNullOrEmptyOrUndefined(item)) {
                return false;
            }
            else if (item == "null") {
                return false;
            }
            else if (item == '{"originalObject":""}') {
                return false;
            }
            return true;
        }
        function setVehicleDeta() {
            if ($scope.vehicleReg) {

                //Set Vehicle Category
                if ($scope.vehicleReg.VCTCode) {
                    $scope.selectedVehicleCategory = $scope.vehicleReg ? ($scope.vehicleReg.VCTCode) : "";// + "     " + ($scope.vehicleReg.TextVehicleCategoryEng ? $scope.vehicleReg.TextVehicleCategoryEng : '') + "     " + ($scope.vehicleReg.TextVehicleCategory ? $scope.vehicleReg.TextVehicleCategory : '')) : '';
                    $scope.selectedVehicleCategoryEnglish = $scope.vehicleReg.TextVehicleCategoryEng;
                    $scope.selectedVehicleCategoryArabic = $scope.vehicleReg.TextVehicleCategory;
                    $scope.selectedVehicleCategoryObj = {};
                    $scope.selectedVehicleCategoryObj.originalObject = {};
                    $scope.selectedVehicleCategoryObj.originalObject.Code = $scope.vehicleReg.VCTCode;
                    $scope.selectedVehicleCategoryObj.originalObject.EngName = $scope.vehicleReg.TextVehicleCategoryEng;
                    $scope.selectedVehicleCategoryObj.originalObject.ArbName = $scope.vehicleReg.TextVehicleCategory;
                }
                //Set Vehicle Color
                if ($scope.vehicleReg.CarColor) {
                    $scope.selectedVehicleColor = $scope.vehicleReg ? ($scope.vehicleReg.CarColor) : "";//+ "     " + ($scope.vehicleReg.CarColorEng ? $scope.vehicleReg.CarColorEng : '') + "     " + ($scope.vehicleReg.CarT2Desc ? $scope.vehicleReg.CarT2Desc : '')) : '';
                    $scope.selectedVehicleColorEng = $scope.vehicleReg.CarColorEng;
                    $scope.selectedVehicleColorArb = $scope.vehicleReg.CarT2Desc;
                    $scope.selectedVehicleColorObj = {};
                    $scope.selectedVehicleColorObj.originalObject = {};
                    $scope.selectedVehicleColorObj.originalObject.Code = $scope.vehicleReg.CarColor;
                    $scope.selectedVehicleColorObj.originalObject.EnglishName = $scope.vehicleReg.CarColorEng;
                    $scope.selectedVehicleColorObj.originalObject.ArabicName = $scope.vehicleReg.CarT2Desc;
                }
                //Set Vehicle Type
                if ($scope.vehicleReg.VSTCode) {
                    $scope.selectedVehicleType = $scope.vehicleReg ? ($scope.vehicleReg.VSTCode) : "";// + "     " + ($scope.vehicleReg.TextVehicleTypeEng ? $scope.vehicleReg.TextVehicleTypeEng : '') + "     " + ($scope.vehicleReg.TextVehicleType ? $scope.vehicleReg.TextVehicleType : '')) : '';
                    $scope.vehicleTypeEngilsh = $scope.vehicleReg.TextVehicleTypeEng;
                    $scope.vehicleTypeArabic = $scope.vehicleReg.TextVehicleType;
                    $scope.selectedVehicleTypeObj = {};
                    $scope.selectedVehicleTypeObj.originalObject = {};
                    $scope.selectedVehicleTypeObj.originalObject.Code = $scope.vehicleReg.VSTCode;
                    $scope.selectedVehicleTypeObj.originalObject.EngName = $scope.vehicleReg.TextVehicleTypeEng;
                    $scope.selectedVehicleTypeObj.originalObject.ArbName = $scope.vehicleReg.TextVehicleType;
                }
                //Owner Nationality
                if ($scope.vehicleReg.OwnerNationality) {
                    $scope.selectedOwnerNationality = $scope.vehicleReg ? ($scope.vehicleReg.OwnerNationality) : "";// + "     " + ($scope.vehicleReg.TextOwnerNationalityEng ? $scope.vehicleReg.TextOwnerNationalityEng : '') + "     " + ($scope.vehicleReg.TextOwnerNationality ? $scope.vehicleReg.TextOwnerNationality : '')) : '';
                    $scope.selectedOwnerNationalityEng = $scope.vehicleReg.TextOwnerNationalityEng;
                    $scope.selectedOwnerNationalityArb = $scope.vehicleReg.TextOwnerNationality;
                    $scope.selectedOwnerNatOriginObj = {};
                    $scope.selectedOwnerNatOriginObj.originalObject = {};
                    $scope.selectedOwnerNatOriginObj.originalObject.Code = $scope.vehicleReg.OwnerNationality;
                    $scope.selectedOwnerNatOriginObj.originalObject.EngName = $scope.vehicleReg.TextOwnerNationalityEng;
                    $scope.selectedOwnerNatOriginObj.originalObject.ArbName = $scope.vehicleReg.TextOwnerNationality;
                }
                //Open Destination
                if ($scope.vehicleReg.DestinationCountryOpen) {
                    $scope.selectedOpenDestination = $scope.vehicleReg ? ($scope.vehicleReg.DestinationCountryOpen + "     " + ($scope.vehicleReg.TextDestinationCountryOpenEng ? $scope.vehicleReg.TextDestinationCountryOpenEng : '') + "     " + ($scope.vehicleReg.TextDestinationCountryOpen ? $scope.vehicleReg.TextDestinationCountryOpen : '')) : '';
                    $scope.selectedOpenDestinationObj = {};
                    $scope.selectedOpenDestinationObj.originalObject = {};
                    $scope.selectedOpenDestinationObj.originalObject.Code = $scope.vehicleReg.DestinationCountryOpen;
                    $scope.selectedOpenDestinationObj.originalObject.CountryEngName = $scope.vehicleReg.TextDestinationCountryOpenEng;
                    $scope.selectedOpenDestinationObj.originalObject.CountryArbName = $scope.vehicleReg.TextDestinationCountryOpen;
                }
                //Close Destination
                if ($scope.vehicleReg.DestinationCountryClose) {
                    $scope.selectedCloseDestination = $scope.vehicleReg ? ($scope.vehicleReg.DestinationCountryClose + "     " + ($scope.vehicleReg.TextDestinationCountryCloseEng ? $scope.vehicleReg.TextDestinationCountryCloseEng : '') + "     " + ($scope.vehicleReg.TextDestinationCountryClose ? $scope.vehicleReg.TextDestinationCountryClose : '')) : '';
                    $scope.selectedCloseDestinationObj = {};
                    $scope.selectedCloseDestinationObj.originalObject = {};
                    $scope.selectedCloseDestinationObj.originalObject.Code = $scope.vehicleReg.DestinationCountryClose;
                    $scope.selectedCloseDestinationObj.originalObject.CountryEngName = $scope.vehicleReg.TextDestinationCountryCloseEng;
                    $scope.selectedCloseDestinationObj.originalObject.CountryArbName = $scope.vehicleReg.TextDestinationCountryClose;
                }
                //Open Nationality
                if ($scope.vehicleReg.DriverNATOpen) {
                    $scope.selectedopenDriverNationality = $scope.vehicleReg ? ($scope.vehicleReg.DriverNATOpen + "     " + ($scope.vehicleReg.TextDriverNATOpenEng ? $scope.vehicleReg.TextDriverNATOpenEng : '') + "     " + ($scope.vehicleReg.TextDriverNATOpen ? $scope.vehicleReg.TextDriverNATOpen : '')) : '';
                    $scope.selectedopenDriverNatOriginObj = {};
                    $scope.selectedopenDriverNatOriginObj.originalObject = {};
                    $scope.selectedopenDriverNatOriginObj.originalObject.Code = $scope.vehicleReg.DriverNATOpen;
                    $scope.selectedopenDriverNatOriginObj.originalObject.EngName = $scope.vehicleReg.TextDriverNATOpenEng;
                    $scope.selectedopenDriverNatOriginObj.originalObject.ArbName = $scope.vehicleReg.TextDriverNATOpen;
                }
                //Close Nationality
                if ($scope.vehicleReg.DriverNATClose) {
                    $scope.selectedcloseDriverNationality = $scope.vehicleReg ? ($scope.vehicleReg.DriverNATClose + "     " + ($scope.vehicleReg.TextDriverNATCloseEng ? $scope.vehicleReg.TextDriverNATCloseEng : '') + "     " + ($scope.vehicleReg.TextDriverNATClose ? $scope.vehicleReg.TextDriverNATClose : '')) : '';
                    $scope.selectedcloseDriverNatOriginObj = {};
                    $scope.selectedcloseDriverNatOriginObj.originalObject = {};
                    $scope.selectedcloseDriverNatOriginObj.originalObject.Code = $scope.vehicleReg.DriverNATClose;
                    $scope.selectedcloseDriverNatOriginObj.originalObject.EngName = $scope.vehicleReg.TextDriverNATCloseEng;
                    $scope.selectedcloseDriverNatOriginObj.originalObject.ArbName = $scope.vehicleReg.TextDriverNATClose;
                }
                //City
                $scope.city = ($scope.vehicleReg.CityCode ? $scope.vehicleReg.CityCode : '') + ' ' + ($scope.vehicleReg.CityDescEng ? $scope.vehicleReg.CityDescEng : '') + ' ' + ($scope.vehicleReg.CityDesc ? $scope.vehicleReg.CityDesc : '');

                $scope.vehicleReg.PermitNumber = $scope.vehicleReg.PermitNumber == '0' ? '' : $scope.vehicleReg.PermitNumber;

                $scope.vehicleReg.PassangerNumberOpen = $scope.vehicleReg.PassangerNumberOpen ? $scope.vehicleReg.PassangerNumberOpen : 1;
                $scope.vehicleReg.DriverIDTypeOpen = $scope.vehicleReg.DriverIDTypeOpen ? $scope.vehicleReg.DriverIDTypeOpen : "PASSPORT";

                //$scope.openTime = $scope.vehicleReg.DateOpen ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateOpen)), "HH:mm") : '';ss
                //$scope.vehicleReg.DateOpen = $scope.vehicleReg.DateOpen != "" && $scope.vehicleReg.DateOpen != null ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateOpen)), "dd/MM/yyyy HH:mm") : '';
                ////$scope.vehicleReg.closeTime = $scope.vehicleReg.DateClose ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateClose)), "HH:mm") : '';
                //$scope.vehicleReg.DateClose = $scope.vehicleReg.DateClose != "" && $scope.vehicleReg.DateClose != null ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DateClose)), "dd/MM/yyyy HH:mm") : '';
                //$scope.vehicleReg.CarEDate = $scope.vehicleReg.CarEDate ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.CarEDate)), "dd/MM/yyyy") : '';
                //$scope.vehicleReg.DriverIDDateOpen = $scope.vehicleReg.DriverIDDateOpen ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DriverIDDateOpen)), "dd/MM/yyyy") : '';
                //$scope.vehicleReg.DriverIDDateClose = $scope.vehicleReg.DriverIDDateClose ? $filter('date')(new Date(apiService.formatMMDDDateTimeObject($scope.vehicleReg.DriverIDDateClose)), "dd/MM/yyyy") : '';
                // $scope.vehicleReg.TextTransNumber = $scope.vehicleReg.PermitNumber;
                //$scope.vehicleReg.ChassisNumber = "-";

                OpenCloseVisibility();
                //if Close section is editable, copy the driver name from open to close section
                if ($scope.IsCloseEditable) {
                    $scope.vehicleReg.DriverNameClose1 = angular.copy($scope.vehicleReg.DriverNameOpen1);
                    $scope.vehicleReg.DriverNameClose2 = angular.copy($scope.vehicleReg.DriverNameOpen2);
                    $scope.vehicleReg.DriverNameClose3 = angular.copy($scope.vehicleReg.DriverNameOpen3);
                    $scope.vehicleReg.DriverNameClose4 = angular.copy($scope.vehicleReg.DriverNameOpen4);
                }
                if ($scope.vehicleReg.JobNumberOpen != null) {
                    $scope.vehicleReg.IsdisableJobNumberOpen = true;
                }
                else {
                    $scope.vehicleReg.IsdisableJobNumberOpen = false;
                }
                if ($scope.vehicleReg.JobNumberClose != null) {
                    $scope.vehicleReg.IsdisableJobNumberClose = true;
                }
                else {
                    $scope.vehicleReg.IsdisableJobNumberClose = false;

                }
            }
            selectdatePicker();

        }
        // init
        $scope.init();

        function showConfirmMessage(msg) {
            swal({
                title: '',
                text: msg,
                type: "success",
                confirmButtonColor: "#66BB6A",
                confirmButtonText: $scope.gotoVehicleList(),
                closeOnConfirm: true,
                html: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $scope.gotoVehicleList();
                    }
                });

        }
    }]);