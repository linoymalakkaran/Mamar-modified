angular.module('mamarApp').controller('subDOChassisListController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', '$timeout', '$http', 'apiService', '$storage', '$log', 'userAccountStorageFactory', 'paginationService',
        function ($scope, $rootScope, $http, $state, $stateParams, $filter, $timeout, $http, apiService, $storage, $log, userAccountStorageFactory, paginationService) {

            $scope.$storage = $storage;

            $scope.backtoSubDoDetails = () => {
                $state.go('subDODetails', { 'centerCode': $stateParams.centerCode, 'agentCode': $stateParams.agentCode, 'mode': 'edit' });
            }

            //Look Ups
            //OnChange of Country
            $scope.$watch("selectedMadeInModel", function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedMadeInModel)) {
                    $scope.ValidateCountry();
                }
            });

            function populateMadeInModel() {
                getIndexData('MadeInModel', '', function (data) {
                    $scope.madeIn = data;
                }, function () {
                    apiService.get('Customs/Lookup/GenericLookup',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: '',
                            lookupType: 'Country'
                        },
                        function (results) {
                            $scope.madeIn = results.data.ResponseResult.Data;
                            storeData($scope.madeIn, 'MadeInModel', '');
                        },
                        function error(response) {
                        });
                });
            }
            populateMadeInModel();

            //OnChange of Color
            $scope.$watch("selectedColorCode", function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedColorCode)) {
                    $scope.ValidateColor();
                }
            });

            function populateColorModel() {
                getIndexData('ColorModel', '', function (data) {
                    $scope.color = data;
                }, function () {
                    apiService.get('Customs/Lookup/GenericLookup',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: '',
                            lookupType: 'Color'
                        },
                        function (results) {
                            $scope.color = results.data.ResponseResult.Data;
                            storeData($scope.color, 'ColorModel', '');
                        },
                        function error(response) {
                        });
                });
            }
            populateColorModel();

            //Generic Lookup - Begin
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'MadeIn':
                        if ($scope.lookUpMode == 'add') {
                            $scope.selectedMadeInModel = row.Code.toString();
                            $scope.selectedMadeIn = {};
                            $scope.selectedMadeIn.originalObject = row;
                            $('#MadeIn_value').focus();
                            break;
                        }
                        else if ($scope.lookUpMode == 'edit') {
                            $scope.selectedMadeInModelEdit[$scope.chassisRNum] = row.Code.toString();
                            $scope.selectedMadeInEdit[$scope.chassisRNum] = {};
                            $scope.selectedMadeInEdit[$scope.chassisRNum].originalObject = row;
                            $('#MadeInEdit_value').focus();
                            break;
                        }

                    case 'Color':
                        if ($scope.lookUpMode == 'add') {
                            $scope.selectedColorCode = row.EnglishName ? row.EnglishName : '';
                            $scope.selectedColor = {};
                            $scope.selectedColor.originalObject = row;
                            $('#Color_value').focus();
                            break;
                        }
                        if ($scope.lookUpMode == 'edit') {
                            $scope.selectedColorCodeEdit[$scope.chassisRNum] = row.EnglishName ? row.EnglishName : '';
                            $scope.selectedColorEdit[$scope.chassisRNum] = {};
                            $scope.selectedColorEdit[$scope.chassisRNum].originalObject = row;
                            $('#ColorEdit_value').focus();
                            break;
                        }
                }
                $("#genericLookUp").modal("hide");
            }

            $scope.populateLookupData = function (lookupId) {
                switch (lookupId) {
                    case 'MadeIn':
                        break;
                    case 'Color':
                        break;
                }
            }

            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'MadeIn':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.madeIn) {
                                $scope.lookUpData = $scope.madeIn.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;

                        case 'Color':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.color) {
                                $scope.lookUpData = $scope.color.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                    }
                });
            }


            $scope.openLookup = function (lookupId, mode, chassisRNum) {
                $scope.lookUpMode = mode;
                $scope.chassisRNum = chassisRNum;
                $('#searchLookupText').val("");
                $timeout(function () {
                    $scope.lookupId = lookupId;
                    switch (lookupId) {
                        case 'MadeIn':
                            $scope.lookUpTitle = $filter("translate")("MadeIn");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.madeIn;
                            break;
                        case 'Color':
                            $scope.lookUpTitle = $filter("translate")("Color");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.color;
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

            $scope.lookupKeyDown = function (event, lookupId, mode, chassisRNum) {
                if (event.key == 'F9') {
                    $scope.openLookup(lookupId, mode, chassisRNum);
                }
            }
            //Generic Lookup - End

            // VALIDATE --> START      
            $scope.ValidateCountry = function (chassis) {
                $scope.countryValid = true;
                if ($scope.saveMode == 'add') {
                    var countrySelected = $scope.selectedMadeIn && $scope.selectedMadeIn.originalObject && $scope.selectedMadeIn.originalObject.Code ? $scope.selectedMadeIn.originalObject.Code : '';
                    if ($scope.selectedMadeInModel && (countrySelected == 0 || $scope.selectedMadeInModel.replace(/\s/g, '') != countrySelected.replace(/\s/g, ''))) {
                        $scope.countryValid = false;
                        $scope.Valid = false;
                    }
                }
                else if ($scope.saveMode == 'edit') {
                    var countrySelected = $scope.selectedMadeInEdit[chassis.RNum] && $scope.selectedMadeInEdit[chassis.RNum].originalObject && $scope.selectedMadeInEdit[chassis.RNum].originalObject.Code ? $scope.selectedMadeInEdit[chassis.RNum].originalObject.Code : '';
                    if ($scope.selectedMadeInModelEdit[chassis.RNum] && (countrySelected == 0 || $scope.selectedMadeInModelEdit[chassis.RNum].replace(/\s/g, '') != countrySelected.replace(/\s/g, ''))) {
                        $scope.countryValid = false;
                        $scope.Valid = false;
                    }
                }

            }
            $scope.ValidateColor = function (chassis) {
                $scope.colorValid = true;
                if ($scope.saveMode == 'add') {
                    var colorSelected = $scope.selectedColor && $scope.selectedColor.originalObject && $scope.selectedColor.originalObject.Code ? $scope.selectedColor.originalObject.EnglishName : '';
                    if ($scope.selectedColorCode && (colorSelected == 0 || $scope.selectedColorCode.replace(/\s/g, '') != colorSelected.replace(/\s/g, ''))) {
                        $scope.colorValid = false;
                        $scope.Valid = false;
                    }
                }
                else if ($scope.saveMode == 'edit') {
                    var colorSelected = $scope.selectedColorEdit[chassis.RNum] && $scope.selectedColorEdit[chassis.RNum].originalObject && $scope.selectedColorEdit[chassis.RNum].originalObject.EnglishName ? $scope.selectedColorEdit[chassis.RNum].originalObject.EnglishName : '';
                    if ($scope.selectedColorCodeEdit[chassis.RNum] && (colorSelected == 0 || $scope.selectedColorCodeEdit[chassis.RNum].replace(/\s/g, '') != colorSelected.replace(/\s/g, ''))) {
                        $scope.colorValid = false;
                        $scope.Valid = false;
                    }
                }
            }

            $scope.ValidateChassis = function () {
                $scope.validChassis = $scope.recordToSave.ChassisNumber ? true : false;
                $scope.Valid = (!$scope.validChassis) ? false : $scope.Valid;
            }
            $scope.ValidateEngineNo = function () {
                $scope.validEngineNo = $scope.recordToSave.EngineNo ? true : false;
                $scope.Valid = (!$scope.validEngineNo) ? false : $scope.Valid;
            }

            $scope.ValidateModelYear = function (event) {

                $scope.validModelYr = true;
                //$scope.validModelYearAvail = true;

                //$scope.validModelYearAvail = $scope.recordToSave.ModelYear ? true : false;
                if ($scope.recordToSave.ModelYear) {
                    var currentdate = new Date();
                    if (parseInt($scope.recordToSave.ModelYear) > (currentdate.getFullYear() + 2)) {
                        $scope.validModelYr = false;
                    }
                };
                $scope.Valid = !$scope.validModelYr ? false : $scope.Valid;
            }
            // VALIDATE --> END

            // reset GET params
            function resetParameter() {
                $scope.parameters = {
                    centerCode: $stateParams.centerCode,
                    houseBLNumber: '',
                    voyageNumber: '',
                    doCenterCode: $stateParams.centerCode,
                    agentCode: $stateParams.agentCode,
                    MasterBLNumber: '',
                    vesselCode: '',
                    pageNumber: 1,
                    pageSize: 10,
                    searchString: ''
                };
            }

            // Get DO Chassis List
            function getChassisList() {
                var manifestInformation = $storage.get('storedManifestInformation');
                if (manifestInformation) {
                    $scope.parameters.houseBLNumber = manifestInformation.HouseBlNumber ? manifestInformation.HouseBlNumber.trim() : '';
                    $scope.parameters.MasterBLNumber = manifestInformation.MasterBlNumber ? manifestInformation.MasterBlNumber.trim() : '';
                    $scope.parameters.voyageNumber = manifestInformation.VoyageNumber ? manifestInformation.VoyageNumber.trim() : '';
                    $scope.parameters.vesselCode = manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : '';
                }

                $("#loadingScreen").show();

                apiService.get('Customs/Chassis/GetDOChassisList', $scope.parameters, function (results) {
                    $("#loadingScreen").hide();
                    $scope.chassisList = results.data.ResponseResult.Data;
                    if ($scope.chassisList != null && $scope.chassisList.length > 0) {
                        $scope.totalCount = $scope.chassisList[0].TotalCount;
                    }
                },
                function error(response) {
                    $("#loadingScreen").hide();
                });
            }

            //Get LookUp Data for Edit
            function getMadeIn(chassis) {
                $scope.selectedMadeInEdit = [];
                $scope.selectedMadeInModelEdit = [];
                if (chassis) {
                    $scope.selectedMadeInModelEdit[chassis.RNum] = chassis.CountryCode;

                    $scope.selectedMadeInEdit[chassis.RNum] = {};
                    $scope.selectedMadeInEdit[chassis.RNum].originalObject = {};
                    $scope.selectedMadeInEdit[chassis.RNum].originalObject.Code = chassis.CountryCode ? chassis.CountryCode : null;
                }

            }
            function getColor(chassis) {
                $scope.selectedColorEdit = [];
                $scope.selectedColorCodeEdit = [];
                if (chassis) {
                    $scope.selectedColorCodeEdit[chassis.RNum] = chassis.ColorArabic;

                    $scope.selectedColorEdit[chassis.RNum] = {};
                    $scope.selectedColorEdit[chassis.RNum].originalObject = {};
                    $scope.selectedColorEdit[chassis.RNum].originalObject.EnglishName = chassis.ColorArabic ? chassis.ColorArabic : null;
                }

            }


            $scope.GetSearchResult = () => {
                getChassisList();
            }

            function resetEditedIndex() {
                $scope.editRecord = [];
                angular.forEach($scope.chassisList, function (value, key) {
                    $scope.editRecord[value.RNum] = false;
                });
            }

            // Edit Chassis
            $scope.editChassisDetails = function (chassis) {
                resetEditedIndex();
                $scope.savedSuccess = false;
                $scope.addNew = false;
                $scope.recordToSave = angular.copy(chassis);
                $scope.editRecord[chassis.RNum] = true;
                getMadeIn(chassis);
                getColor(chassis);
            }

            //Add New Chassis
            $scope.addNewChassis = () => {
                $scope.addNew = true;
                $scope.validChassis = true;
                $scope.countryValid = true;
                $scope.validEngineNo = true;
                $scope.validModelYr = true;
                //$scope.validModelYearAvail = true;
                $scope.colorValid = true;
                $scope.selectedMadeIn = null;
                $scope.selectedColor = null;
                $scope.selectedMadeInModel = '';
                $scope.selectedColorCode = '';
                $scope.recordToSave = {};
                resetEditedIndex();
            }

            // Cancle Chassis Save
            $scope.cancelChassisSave = (chassis) => {
                $scope.addNew = false;
                $scope.validChassis = true;
                $scope.countryValid = true;
                $scope.validEngineNo = true;
                $scope.validModelYr = true;
                //$scope.validModelYearAvail = true;
                $scope.colorValid = true;

                if (chassis) {
                    $scope.editRecord[chassis.RNum] = false;
                    $scope.recordToSave = angular.copy(chassis);
                }

            }

            function validateChassis(saveMode, chassis) {
                $scope.Valid = true;
                $scope.ValidateChassis();
                //$scope.ValidateEngineNo();
                //$scope.ValidateCountry(chassis);
                $scope.ValidateModelYear();
                $scope.ValidateColor(chassis);
            }


            //Save Chassis
            $scope.saveChassis = function (saveMode, chassis) {
                $scope.saveMode = saveMode;
                validateChassis(saveMode, chassis);
                if (!$scope.Valid) {
                    return false;
                }

                var manifestInformation = $storage.get('storedManifestInformation');
                if (manifestInformation) {
                    var arrivalDate = manifestInformation.ArrivalDate ? $filter('date')((new Date(manifestInformation.ArrivalDate)), 'dd/MM/yyyy') : manifestInformation.arrivalDate;
                    $scope.recordToSave.CenterCode = $stateParams.centerCode;
                    $scope.recordToSave.MasterBLNumber = manifestInformation.MasterBlNumber;
                    $scope.recordToSave.HouseBLNumber = manifestInformation.HouseBlNumber;
                    $scope.recordToSave.VoyageNumber = manifestInformation.VoyageNumber;
                    $scope.recordToSave.VesselCode = manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : '';
                    $scope.recordToSave.ETADate = arrivalDate;
                }

                if ($scope.Valid) {
                    if (saveMode == 'add') {
                        //$scope.recordToSave.CountryCode = $scope.selectedMadeIn && $scope.selectedMadeIn.originalObject ? $scope.selectedMadeIn.originalObject.Code : '';
                        $scope.recordToSave.ColorArabic = $scope.selectedColor && $scope.selectedColor.originalObject ? $scope.selectedColor.originalObject.EnglishName : '';
                    }
                    else if (saveMode == 'edit') {
                        //$scope.recordToSave.CountryCode = $scope.selectedMadeInEdit[chassis.RNum] && $scope.selectedMadeInEdit[chassis.RNum].originalObject ? $scope.selectedMadeInEdit[chassis.RNum].originalObject.Code : '';
                        $scope.recordToSave.ColorArabic = $scope.selectedColorEdit[chassis.RNum] && $scope.selectedColorEdit[chassis.RNum].originalObject ? $scope.selectedColorEdit[chassis.RNum].originalObject.EnglishName : '';
                    }

                    $("#loadingScreen").show();
                    apiService.post('Customs/Manifest/AddUpdateMChassis', '', $scope.recordToSave, function (result) {
                        $("#loadingScreen").hide();
                        var response = result.data.ResponseResult;
                        var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Chassis details could not be updated.";
                        if (response.IsValid) {
                            $scope.addNew = false;
                            //Manafath Integration Changes --> Save to PCS DB
                            apiService.saveManifestDetailsToPcs('~/Manifest/AddUpdateMFChassis', $scope.recordToSave, '');

                            $scope.recordToSave = {};
                            if (chassis)
                                $scope.editRecord[chassis.RNum] = false;
                            getChassisList();
                            $scope.savedSuccess = true;
                            $timeout(function () {
                                $scope.savedSuccess = false;
                            }, 4000);
                        }
                        else if (!response.IsValid) {
                            modalErrorShow(msg);
                        }
                    },
                    function (result) {
                        $("#loadingScreen").hide();
                        modalErrorShow("An Error has occurred while adding/updating Chassis details. " + result);
                    });
                }
            }

            //Delete Chassis
            $scope.deleteChassis = function (index) {
                $scope.deleteIndex = index;
                $("#ConfirmDeleteModalPopup").modal("show");
            }
            // delete chassis Okay
            $scope.deleteOkay = function () {
                $("#ConfirmDeleteModalPopup").modal("hide");
                $("#loadingScreen").show();
                var chassisToDelete = $scope.chassisList[$scope.deleteIndex];
                var manifestInformation = $storage.get('storedManifestInformation');
                var data = {};
                if (manifestInformation) {
                    data = {
                        chassisNumber: chassisToDelete.ChassisNumber,
                        centerCode: $stateParams.centerCode,
                        houseBLNumber: manifestInformation.HouseBlNumber,
                        masterBLNumber: manifestInformation.MasterBlNumber,
                        voyageNumber: manifestInformation.VoyageNumber,
                        vesselCode: manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : ''
                    }
                    $scope.deleteChassisParams = data;
                }
                apiService.get('Customs/Manifest/DeleteChassis', data, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = apiService.formatResponseMessage(response.Messages);
                    if (response.IsValid) {
                        //Manafath Changes
                        var config = { params: $scope.deleteChassisParams };
                        $http.get($Url.resolve('~/Manifest/DeleteMFChassis'), config).then(function (result) {
                            console.log('success - delete chassis');
                        }, function (error) {
                            console.log('error - ' + error);
                        });
                        //end
                        if ($scope.chassisList.length == 1) {
                            $scope.parameters.pageNumber = 1;
                        }
                        getChassisList();
                        $('#successModal').modal('show');
                    }
                    else if (!response.IsValid) {
                        modalErrorShow(msg);
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
                $scope.parameters.pageNumber = newPageNo;
                getChassisList();
            }

            //Load
            $scope.init = () => {
                $scope.addNew = false;
                $scope.validChassis = true;
                $scope.countryValid = true;
                $scope.validEngineNo = true;
                $scope.validModelYr = true;
                //$scope.validModelYearAvail = true;
                $scope.colorValid = true;

                $scope.selectedMadeIn = null;
                $scope.selectedColor = null;
                $scope.selectedMadeInModel = '';
                $scope.selectedColorCode = '';

                $scope.recordToSave = {};

                $scope.clearanceFlag = $stateParams.ClearanceFlag;

                resetParameter();
                getChassisList();
            }

            $scope.init();
        }
    ]);