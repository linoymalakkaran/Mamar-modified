angular.module('mamarApp').controller('chassisListController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$storage', '$uibModal', 'userAccountStorageFactory', '$timeout','paginationService',
        function ($scope, $rootScope, $state, $stateParams, $filter, apiService, $storage, $uibModal, userAccountStorageFactory, $timeout, paginationService) {
            $scope.$storage = $storage;
            $scope.selectedLanguage = $('#selLang :selected').text() == "Arabic" ? 'ae' : $('#selLang :selected').text() == "English" ? 'en' : 'en';
            $scope.centerCodeShipment = $stateParams.centerCode;
            $scope.jobNoShipment = $stateParams.jobNumber;
            var billType = $stateParams.BillType;
            $scope.impExpCategory = $stateParams.ImporterExporterCode;
            $scope.pageNumber = 1;
            $scope.pageSize = 10;
            $scope.globalDisableFlag = $stateParams.globalDisableFlag == "view";
            $scope.acceptFiles = ".xlsx,.xls";
            $scope.parameters = {
                centerCode: $scope.centerCodeShipment,
                pageNumber: 1,
                pageSize: 10,
                jobNumber: $scope.jobNoShipment,
                searchString: ''
            };

            $scope.searchBodyTypeText = '';
            $scope.searchSubTypeText = '';

            //#region Get/Load menthod during page load.
            $scope.GetChassisList = function () {
                $("#loadingScreen").show();
                apiService.get('Customs/Chassis/GetChassisList',
                    $scope.parameters
                    ,
                    function (results) {
                        //debugger;
                        $scope.chassisList = results.data.ResponseResult.Data;
                        $("#loadingScreen").hide();
                        if ($scope.chassisList != null && $scope.chassisList.length > 0) {
                            $scope.totalCount = $scope.chassisList[0].TotalCount;
                        }
                    },
                    function error(response) {
                        //console.log('something went wrong in GetChassisList' + response);
                        $("#loadingScreen").hide();
                    });
            }

            $scope.ExportToExcel = function () {
                var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
                var targetaddrss = 'DocumentUpload/reportData?DocId=0ce954a0-7c52-4899-8c06-fc22f0aa707b';
                document.location.href = "../Home/DownloadReport?targetUrl=" + targetaddrss + "&UCode=" + userAccntInfo.UCode + "&CCode=" + userAccntInfo.CCode + "&ReportParameter=" + $stateParams.centerCode + ";" + $stateParams.jobNumber + ";" + "" + ";" + 0 + ";" + 0;
            };

            function ValidateTrafficNoByCategoryCode() {
                if ($scope.impExpCategory) {
                    if ($scope.impExpCategory == 'PSE' || $scope.impExpCategory == 'PSL' || $scope.impExpCategory == 'GCC' || $scope.impExpCategory == 'GSL' || $scope.impExpCategory == 'PLN' || $scope.impExpCategory == 'PSF') {

                        $scope.trafficNoRequired = false;
                        $scope.validTrafficNo = true;
                    }
                    else {
                        $scope.trafficNoRequired = true;
                        $scope.validTrafficNo = $scope.chassisDetails.TrafficNumber ? true : false;

                        $scope.UAEIDRequired = false;
                        $scope.validUAENo = true;

                        $scope.Valid = (!$scope.validTrafficNo) ? false : $scope.Valid;
                    }
                }
            }
            $scope.GetChassisList();
            //#endregion

            $scope.GetSearchResult = function () {
                $scope.chassisList = {
                };
                $scope.pageNumber = 1;
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                $scope.GetChassisList();
            }
            // load More Records
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.pageNumber = newPageNo;
                $scope.GetChassisList();
            }
            $scope.chassisNoChanged = function () {
                if (!$scope.parameters.searchString) {
                    $scope.GetChassisList();
                }
            }
            //Delete Chassis
            $scope.deleteConfirm = function (index) {
                $("#ConfirmDeleteModalPopup").modal("show");
                $scope.deleteRowIndex = index;
            }
            $scope.deleteOkay = function () {
                $("#loadingScreen").show();
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                $("#ConfirmDeleteModalPopup").modal("hide");
                var chassis = angular.copy($scope.chassisList[$scope.deleteRowIndex]);
                if (chassis) {
                    chassis.centerCode = $scope.centerCodeShipment;
                    apiService.post('Customs/Chassis/DeleteChassis', '', chassis, function (result) {
                        $("#loadingScreen").hide();
                        var data = result.data.ResponseResult;
                        $scope.pageNumber = 1;
                        $scope.GetChassisList();
                        $('#successModal').modal('show');
                    },
                        function (result) {
                            $("#loadingScreen").hide();
                            var msg = apiService.formatResponseMessage(response.Messages);
                            modalErrorShow(msg);
                        });
                }
            }


            //Chassis Details
            $scope.GetChassisDetails = function () {
                $("#loadingScreen").show();
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                apiService.get('Customs/Chassis/GetChassisDetail',
                    {
                        centerCode: $stateParams.centerCode,
                        jobNumber: $stateParams.jobNumber,
                        chassisNumber: $scope.selectedChassisNo
                    },
                    function (results) {
                        $scope.chassisDetails = results.data.ResponseResult.Data;
                        GetPoliceColorLookUpFormattedData();
                        GetColorLookUpFormattedData();
                        GetBodyTypeLookUpFormattedData();
                        GetSubTypeLookUpFormattedData();
                        GetCountryLookUpFormattedDate();
                        GetCurrencyLookUpFormattedDate();
                        GetRemarksLookUpFormattedDate();

                        $scope.chassisDetails.Cylinders = $scope.chassisDetails.Cylinders ? JSON.stringify($scope.chassisDetails.Cylinders) : "";
                        //$scope.chassisDetails.PatrolType = $scope.chassisDetails.PatrolType ? JSON.stringify($scope.chassisDetails.PatrolType) : "";
                        $scope.chassisDetails.NumberOfDoors = $scope.chassisDetails.NumberOfDoors ? JSON.stringify($scope.chassisDetails.NumberOfDoors) : "";
                        $scope.chassisDetails.NumberOfAxils = $scope.chassisDetails.NumberOfAxils ? JSON.stringify($scope.chassisDetails.NumberOfAxils) : "";
                        $scope.chassisDetails.EnginePower = $scope.chassisDetails.EnginePower ? JSON.stringify($scope.chassisDetails.EnginePower) : "";

                        $("#loadingScreen").hide();
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                    });
            }
            // open chassis details Modal popup form
            $scope.initialiseChassisDetails = function () {
                $scope.chassisDetails = {
                };
                $scope.selectedMadeIn = null;
                $scope.selectedColor = null;
                $scope.selectedPoliceColor = null;
                $scope.selectedSubType = null;
                $scope.selectedBodyType = null;
                $scope.selectedCurrency = null;
                $scope.selectedAgentRemark = null;
                $scope.selectedVehicleSpecification = null;

                $scope.selectedMadeInModel = '';
                $scope.selectedColorCode = '';
                $scope.selectedPColor = '';
                $scope.selectedSubTypeModel = '';
                $scope.selectedBodyTypeModel = '';
                $scope.selectedCurrencyModel = '';
                $scope.selectedAgentRemarkModel = '';
                $scope.selectedVehicleRemarksModel = '';

                $scope.chassisDetails.Cylinders = ($scope.cylinders && $scope.cylinders.length > 3) ? $scope.cylinders[3].Code : '';
                $scope.chassisDetails.PatrolType = ($scope.fuel && $scope.fuel.length > 0) ? $scope.fuel[0].Code : '';
                $scope.chassisDetails.NumberOfDoors = ($scope.doors && $scope.doors.length > 2) ? $scope.doors[2].Code : '';
                $scope.chassisDetails.EnginePower = ($scope.engine && $scope.engine.length > 1) ? $scope.engine[1].Code : '';
                $scope.chassisDetails.NumberOfAxils = ($scope.axils && $scope.axils.length > 0) ? $scope.axils[0].Code : '';
                $scope.chassisDetails.SteeringType = ($scope.steering && $scope.steering.length > 0) ? $scope.steering.filter(x=>x.EnglishName == 'Left')[0].Code : '';

                $scope.chassisDetails.TransmissionType = ($scope.transmission && $scope.transmission.length > 0) ? $scope.transmission[0].Code : '';
                $scope.chassisDetails.PayLoad = 1;
                $scope.chassisDetails.Weight = 1;
                $scope.chassisDetails.NumberOfChairs = 4;
                $scope.chassisDetails.NumberOfWheels = 4;

                if (billType == 'R') {
                    $scope.chassisDetails.ReExportFlag = 'Y'
                }
                else {
                    $scope.chassisDetails.ReExportFlag = 'N'
                }

                $scope.validChassis = true;
                $scope.countryValid = true;
                $scope.validEngineNo = true;
                $scope.validModelYr = true;
                $scope.validModelYearAvail = true;
                $scope.validPassengers = true;
                $scope.validWheels = true;
                $scope.validPayload = true;
                $scope.validWeight = true;
                $scope.validPriceCIF = true;
                $scope.validPoliceColor = true;
                $scope.colorValid = true;
                $scope.validSubType = true;
                $scope.validBodyType = true;
                $scope.validCurrency = true;
                $scope.validTrafficNo = true;
                $scope.validUAENo = true;
                $scope.validEmiratesID = true;
                $scope.trafficNoRequired = false;
                $scope.UAEIDRequired = false;

                $scope.validCylinders = true;
                $scope.validFuel = true;
                $scope.validDoors = true;
                $scope.validAxils = true;
                $scope.validEnginePower = true;
                $scope.validTransmission = true;
                $scope.validSteering = true;
            };

            $scope.openChassisDetails = function (chassisNo, mode) {
                $scope.initialiseChassisDetails();
                $scope.selectedChassisNo = chassisNo;
                showTrafficNoMandatory();
                $scope.mode = mode;
                if ($scope.mode != 'New') {
                    $scope.GetChassisDetails();
                }
                $('#chassisModal').modal({
                    backdrop: "static"
                });
            }

            // close Modal Popup
            $scope.closeModalPopUp = function () {
                $scope.initialiseChassisDetails();
                $('#chassisModal').modal('hide');
            };
            function GetPoliceColorLookUpFormattedData() {

                if (!apiService.isNullOrEmptyOrUndefined($scope.chassisDetails)) {
                    $scope.selectedPColor = $scope.chassisDetails.PoliceColorCode ? $scope.chassisDetails.PoliceColorCode + "     " : "";
                    $scope.selectedPColor = $scope.selectedPColor + ($scope.chassisDetails.PoliceColorEngName ? $scope.chassisDetails.PoliceColorEngName + "     " : "");
                    $scope.selectedPColor = $scope.selectedPColor + ($scope.chassisDetails.PoliceColorArbName ? $scope.chassisDetails.PoliceColorArbName : "");
                }
                $scope.selectedPoliceColor = {
                };
                $scope.selectedPoliceColor.originalObject = {
                };
                $scope.selectedPoliceColor.originalObject.Code = $scope.chassisDetails ? $scope.chassisDetails.PoliceColorCode : null;
                $scope.selectedPoliceColor.originalObject.EnglishName = $scope.chassisDetails ? $scope.chassisDetails.PoliceColorEngName : null;
                $scope.selectedPoliceColor.originalObject.ArabicName = $scope.chassisDetails ? $scope.chassisDetails.PoliceColorArbName : null;

            }
            function GetColorLookUpFormattedData() {

                if (!apiService.isNullOrEmptyOrUndefined($scope.chassisDetails)) {
                    $scope.selectedColorCode = $scope.chassisDetails.ColorCode ? $scope.chassisDetails.ColorCode + "     " : "";
                    $scope.selectedColorCode = $scope.selectedColorCode + ($scope.chassisDetails.ColorEngName ? $scope.chassisDetails.ColorEngName + "     " : "");
                    $scope.selectedColorCode = $scope.selectedColorCode + ($scope.chassisDetails.ColorArbName ? $scope.chassisDetails.ColorArbName : "");
                }
                $scope.selectedColor = {
                };
                $scope.selectedColor.originalObject = {
                };
                $scope.selectedColor.originalObject.Code = $scope.chassisDetails ? $scope.chassisDetails.ColorCode : null;
                $scope.selectedColor.originalObject.EnglishName = $scope.chassisDetails ? $scope.chassisDetails.ColorEngName : null;
                $scope.selectedColor.originalObject.ArabicName = $scope.chassisDetails ? $scope.chassisDetails.ColorArbName : null;
            }

            function GetSubTypeLookUpFormattedData() {

                if (!apiService.isNullOrEmptyOrUndefined($scope.chassisDetails)) {
                    $scope.selectedSubTypeModel = $scope.chassisDetails.SubTypeCode ? $scope.chassisDetails.SubTypeCode + "     " : "";
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.SubEngName ? $scope.chassisDetails.SubEngName + "     " : "");
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.SubArbName ? $scope.chassisDetails.SubArbName + "     " : "");
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.CatgoryEng ? $scope.chassisDetails.CatgoryEng + "     " : "");
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.BodyTypeCode ? $scope.chassisDetails.BodyTypeCode + "     " : "");
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.CategoryArb ? $scope.chassisDetails.CategoryArb + "     " : "");
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.BodyTypeEng ? $scope.chassisDetails.BodyTypeEng + "     " : "");
                    $scope.selectedSubTypeModel = $scope.selectedSubTypeModel + ($scope.chassisDetails.BodyTypeArb ? $scope.chassisDetails.BodyTypeArb : "");
                }
                $scope.selectedSubType = {
                };
                $scope.selectedSubType.originalObject = {
                };
                $scope.selectedSubType.originalObject.SubTypeCode = $scope.chassisDetails ? $scope.chassisDetails.SubTypeCode : null;
                $scope.selectedSubType.originalObject.SubTypeEngName = $scope.chassisDetails ? $scope.chassisDetails.SubEngName : null;
                $scope.selectedSubType.originalObject.SubTypeArbName = $scope.chassisDetails ? $scope.chassisDetails.SubArbName : null;
                $scope.selectedSubType.originalObject.BodyTypeCode = $scope.chassisDetails ? $scope.chassisDetails.BodyTypeCode : null;
                $scope.selectedSubType.originalObject.BodyTypeEngName = $scope.chassisDetails ? $scope.chassisDetails.BodyTypeEng : null;
                $scope.selectedSubType.originalObject.BodyTypeArbName = $scope.chassisDetails ? $scope.chassisDetails.BodyTypeArb : null;
                $scope.selectedSubType.originalObject.CategoryEngName = $scope.chassisDetails ? $scope.chassisDetails.CategoryEngName : null;
                $scope.selectedSubType.originalObject.CategoryArbName = $scope.chassisDetails ? $scope.chassisDetails.CategoryArbName : null;
            }

            function GetBodyTypeLookUpFormattedData() {

                if ($scope.chassisDetails) {
                    $scope.selectedBodyTypeModel = $scope.selectedBodyTypeModel + ($scope.chassisDetails.BodyTypeCode ? $scope.chassisDetails.BodyTypeCode + "     " : "");
                    $scope.selectedBodyTypeModel = $scope.selectedBodyTypeModel + ($scope.chassisDetails.BodyTypeEng ? $scope.chassisDetails.BodyTypeEng + "     " : "");
                    $scope.selectedBodyTypeModel = $scope.selectedBodyTypeModel + ($scope.chassisDetails.BodyTypeArb ? $scope.chassisDetails.BodyTypeArb : "");
                }
                $scope.selectedBodyType = {
                };
                $scope.selectedBodyType.originalObject = {
                };

                $scope.selectedBodyType.originalObject.BodyCode = $scope.chassisDetails ? $scope.chassisDetails.BodyTypeCode : null;
                $scope.selectedBodyType.originalObject.BodyEngName = $scope.chassisDetails ? $scope.chassisDetails.BodyTypeEng : null;
                $scope.selectedBodyType.originalObject.BodyArbName = $scope.chassisDetails ? $scope.chassisDetails.BodyTypeArb : null;
            }

            function GetCountryLookUpFormattedDate() {

                if (!apiService.isNullOrEmptyOrUndefined($scope.chassisDetails)) {
                    $scope.selectedMadeInModel = $scope.chassisDetails.CountryCode ? $scope.chassisDetails.CountryCode + "     " : "";
                    $scope.selectedMadeInModel = $scope.selectedMadeInModel + ($scope.chassisDetails.CountryEngName ? $scope.chassisDetails.CountryEngName + "     " : "");
                    $scope.selectedMadeInModel = $scope.selectedMadeInModel + ($scope.chassisDetails.CountryArbName ? $scope.chassisDetails.CountryArbName : "");
                }
                $scope.selectedMadeIn = {
                };
                $scope.selectedMadeIn.originalObject = {
                };
                $scope.selectedMadeIn.originalObject.Code = $scope.chassisDetails ? $scope.chassisDetails.CountryCode : null;
                $scope.selectedMadeIn.originalObject.EnglishName = $scope.chassisDetails ? $scope.chassisDetails.CountryEngName : null;
                $scope.selectedMadeIn.originalObject.ArabicName = $scope.chassisDetails ? $scope.chassisDetails.CountryArbName : null;
            }

            function GetCurrencyLookUpFormattedDate() {

                if (!apiService.isNullOrEmptyOrUndefined($scope.chassisDetails)) {
                    $scope.selectedCurrencyModel = $scope.chassisDetails.CurrencyCode ? $scope.chassisDetails.CurrencyCode + "     " : "";
                    $scope.selectedCurrencyModel = $scope.selectedCurrencyModel + ($scope.chassisDetails.CurrenyEng ? $scope.chassisDetails.CurrenyEng + "     " : "");
                    $scope.selectedCurrencyModel = $scope.selectedCurrencyModel + ($scope.chassisDetails.CurrencyArb ? $scope.chassisDetails.CurrencyArb : "");
                }
                $scope.selectedCurrency = {
                };
                $scope.selectedCurrency.originalObject = {
                };
                $scope.selectedCurrency.originalObject.Code = $scope.chassisDetails ? $scope.chassisDetails.CurrencyCode : null;
                $scope.selectedCurrency.originalObject.NameEnglish = $scope.chassisDetails ? $scope.chassisDetails.CurrenyEng : null;
                $scope.selectedCurrency.originalObject.NameArabic = $scope.chassisDetails ? $scope.chassisDetails.CurrencyArb : null;
                //$scope.selectedCurrency.originalObject.Rate = $scope.chassisDetails ? $scope.chassisDetails.ExchangeRate : null;
            }
            function GetRemarksLookUpFormattedDate() {

                if (!apiService.isNullOrEmptyOrUndefined($scope.chassisDetails)) {
                    $scope.selectedVehicleRemarksModel = $scope.chassisDetails.VehicleRemarks ? $scope.chassisDetails.VehicleRemarks : "";
                    $scope.selectedAgentRemarkModel = $scope.chassisDetails.AgentRemarks ? $scope.chassisDetails.AgentRemarks : "";
                }

                $scope.selectedAgentRemark = {
                };
                $scope.selectedAgentRemark.originalObject = {
                };
                $scope.selectedAgentRemark.originalObject.EnglishName = $scope.chassisDetails ? $scope.chassisDetails.AgentRemarks : "";
                $scope.selectedAgentRemark.originalObject.ArabicName = $scope.chassisDetails ? $scope.chassisDetails.AgentRemarks : "";

                $scope.selectedVehicleSpecification = {
                };
                $scope.selectedVehicleSpecification.originalObject = {
                };
                $scope.selectedVehicleSpecification.originalObject.EnglishName = $scope.chassisDetails ? $scope.chassisDetails.VehicleRemarks : "";
                $scope.selectedVehicleSpecification.originalObject.ArabicName = $scope.chassisDetails ? $scope.chassisDetails.VehicleRemarks : "";
            }
            //Get all lookup values
            function GetUpdatedLookupFields() {
                //Get Color Details
                $scope.chassisDetails.ColorCode = ($scope.selectedColor && $scope.selectedColor.originalObject) ? $scope.selectedColor.originalObject.Code : null;
                $scope.chassisDetails.ColorEngName = ($scope.selectedColor && $scope.selectedColor.originalObject) ? $scope.selectedColor.originalObject.EnglishName : null;
                $scope.chassisDetails.ColorArbName = ($scope.selectedColor && $scope.selectedColor.originalObject) ? $scope.selectedColor.originalObject.ArabicName : null;
                //Get SubType Details
                $scope.chassisDetails.SubTypeCode = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.SubTypeCode : null;
                $scope.chassisDetails.SubEngName = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.SubTypeEngName : null;
                $scope.chassisDetails.SubArbName = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.SubTypArbName : null;
                ////Get BodyType Details
                $scope.chassisDetails.BodyTypeCode = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.BodyTypeCode : null;
                $scope.chassisDetails.BodyTypeEng = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.BodyTypeEngName : null;
                $scope.chassisDetails.BodyTypeArb = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.BodyTypeArbName : null;
                ////Category
                ////Get BodyType Details
                $scope.chassisDetails.CategoryArb = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.CategoryEngName : null;
                $scope.chassisDetails.CatgoryEng = ($scope.selectedSubTypeModel && $scope.selectedSubType && $scope.selectedSubType.originalObject) ? $scope.selectedSubType.originalObject.CategoryArbName : null;
                ////Get Currency Details
                $scope.chassisDetails.CurrencyCode = ($scope.selectedCurrency && $scope.selectedCurrency.originalObject) ? $scope.selectedCurrency.originalObject.Code : null;
                $scope.chassisDetails.CurrenyEng = ($scope.selectedCurrency && $scope.selectedCurrency.originalObject) ? $scope.selectedCurrency.originalObject.NameEnglish : null;
                $scope.chassisDetails.CurrencyArb = ($scope.selectedCurrency && $scope.selectedCurrency.originalObject) ? $scope.selectedCurrency.originalObject.NameArabic : null;
                ////Get Country Details
                $scope.chassisDetails.CountryCode = ($scope.selectedMadeInModel && $scope.selectedMadeIn && $scope.selectedMadeIn.originalObject) ? $scope.selectedMadeIn.originalObject.Code : null;
                $scope.chassisDetails.CountryEngName = ($scope.selectedMadeInModel && $scope.selectedMadeIn && $scope.selectedMadeIn.originalObject) ? $scope.selectedMadeIn.originalObject.EnglishName : null;
                $scope.chassisDetails.CountryArbName = ($scope.selectedMadeInModel && $scope.selectedMadeIn && $scope.selectedMadeIn.originalObject) ? $scope.selectedMadeIn.originalObject.ArabicName : null;
                //Get Police Color Details
                $scope.chassisDetails.PoliceColorCode = ($scope.selectedPoliceColor && $scope.selectedPoliceColor.originalObject) ? $scope.selectedPoliceColor.originalObject.Code : null;
                $scope.chassisDetails.PoliceColorEngName = ($scope.selectedPoliceColor && $scope.selectedPoliceColor.originalObject) ? $scope.selectedPoliceColor.originalObject.EnglishName : null;
                $scope.chassisDetails.PoliceColorArbName = ($scope.selectedPoliceColor && $scope.selectedPoliceColor.originalObject) ? $scope.selectedPoliceColor.originalObject.ArabicName : null;

                $scope.chassisDetails.AgentRemarks = $scope.selectedAgentRemarkModel;
                $scope.chassisDetails.VehicleRemarks = $scope.selectedVehicleRemarksModel;

            }
            $scope.ValidateCountry = function () {
                $scope.countryValid = true;
                var countrySelected = $scope.selectedMadeIn && $scope.selectedMadeIn.originalObject && $scope.selectedMadeIn.originalObject.Code  ? $scope.selectedMadeIn.originalObject.Code + $scope.selectedMadeIn.originalObject.EnglishName + $scope.selectedMadeIn.originalObject.ArabicName : '';
                if ($scope.selectedMadeInModel && (countrySelected == 0 || $scope.selectedMadeInModel.replace(/\s/g, '') != countrySelected.replace(/\s/g, ''))) {
                    $scope.countryValid = false;
                    $scope.Valid = false;
                }
            }
            $scope.ValidateColor = function () {
                $scope.colorValid = true;
                var colorSelected = $scope.selectedColor && $scope.selectedColor.originalObject && $scope.selectedColor.originalObject.Code ? $scope.selectedColor.originalObject.Code + $scope.selectedColor.originalObject.EnglishName + $scope.selectedColor.originalObject.ArabicName : '';
                if ((!$scope.selectedColorCode) || ($scope.selectedColorCode && (colorSelected == 0 || $scope.selectedColorCode.replace(/\s/g, '') != colorSelected.replace(/\s/g, '')))) {
                    $scope.colorValid = false;
                    $scope.Valid = false;
                }
            }
            $scope.ValidatePoliceColor = function () {
                $scope.validPoliceColor = true;
                var policeColorSelected = $scope.selectedPoliceColor && $scope.selectedPoliceColor.originalObject && $scope.selectedPoliceColor.originalObject.Code ? $scope.selectedPoliceColor.originalObject.Code + $scope.selectedPoliceColor.originalObject.EnglishName + $scope.selectedPoliceColor.originalObject.ArabicName : '';
                if ((!$scope.selectedPColor) || ($scope.selectedPColor && (policeColorSelected == 0 || $scope.selectedPColor.replace(/\s/g, '') != policeColorSelected.replace(/\s/g, '')))) {
                    $scope.validPoliceColor = false;
                    $scope.Valid = false;
                }
            }
            $scope.ValidateSubType = function () {
                $scope.validSubType = true;
                if ($scope.selectedSubTypeModel) {
                    if ($scope.selectedSubType) {
                        var code = $scope.selectedSubTypeModel.split(' ');
                        if (code && (code[0] != $scope.selectedSubType.originalObject.SubTypeCode)) {
                            $scope.validSubType = false;
                            $scope.Valid = false;
                        }
                    }
                    else {
                        $scope.validSubType = false;
                        $scope.Valid = false;
                    }
                }
            }
            $scope.ValidateBodyType = function () {
                $scope.validBodyType = true;
                if ($scope.selectedBodyTypeModel) {
                    if ($scope.selectedBodyType) {
                        var code = $scope.selectedBodyTypeModel.split(' ');
                        if (code && (code[0] != $scope.selectedBodyType.originalObject.BodyCode)) {
                            $scope.validBodyType = false;
                            $scope.Valid = false;
                        }
                    }
                    else {
                        $scope.validBodyType = false;
                        $scope.Valid = false;
                    }
                }
            }
            $scope.ValidateCurrency = function () {
                //$scope.validCurrency = ($scope.selectedCurrency && $scope.selectedCurrency.originalObject && $scope.selectedCurrency.originalObject.Code) ? true : false;
                $scope.validCurrency = true;
                var currencySelected = $scope.selectedCurrency && $scope.selectedCurrency.originalObject && $scope.selectedCurrency.originalObject.Code ? $scope.selectedCurrency.originalObject.Code + $scope.selectedCurrency.originalObject.NameEnglish + $scope.selectedCurrency.originalObject.NameArabic : '';
                if ((!$scope.selectedCurrencyModel) || ($scope.selectedCurrencyModel && (currencySelected == 0 || $scope.selectedCurrencyModel.replace(/\s/g, '') != currencySelected.replace(/\s/g, '')))) {
                    $scope.validCurrency = false;
                    $scope.Valid = false;
                }
            }
            $scope.ValidateChassis = function () {
                $scope.validChassis = $scope.chassisDetails.ChassisNumber ? true : false;
                $scope.Valid = (!$scope.validChassis) ? false : $scope.Valid;
            }
            $scope.ValidateEngineNo = function () {
                $scope.validEngineNo = $scope.chassisDetails.EngineNumber ? true : false;
                $scope.Valid = (!$scope.validEngineNo) ? false : $scope.Valid;
            }
            $scope.ValidatePayLoad = function () {
                $scope.validPayload = $scope.chassisDetails.PayLoad ? true : false;
                $scope.Valid = (!$scope.validPayload) ? false : $scope.Valid;
            }
            $scope.ValidateModelYear = function (event) {

                $scope.validModelYr = true;
                $scope.validModelYearAvail = true;

                $scope.validModelYearAvail = $scope.chassisDetails.ModelYear ? true : false;
                if ($scope.chassisDetails.ModelYear) {
                    var currentdate = new Date();
                    if (parseInt($scope.chassisDetails.ModelYear) > (currentdate.getFullYear() + 2)) {
                        $scope.validModelYr = false;
                    }
                };
                $scope.Valid = ((!$scope.validModelYr) || (!$scope.validModelYearAvail)) ? false : $scope.Valid;
            }
            $scope.ValidatePassengers = function () {
                $scope.validPassengers = $scope.chassisDetails.NumberOfChairs ? true : false;
                $scope.Valid = (!$scope.validPassengers) ? false : $scope.Valid;
            }
            $scope.ValidateWheels = function () {
                $scope.validWheels = $scope.chassisDetails.NumberOfWheels ? true : false;
                $scope.Valid = (!$scope.validWheels) ? false : $scope.Valid;
            }
            $scope.ValidateWeight = function () {
                $scope.validWeight = $scope.chassisDetails.Weight ? true : false;
                $scope.Valid = (!$scope.validWeight) ? false : $scope.Valid;
            }
            $scope.ValidatePriceCIF = function () {
                $scope.validPriceCIF = $scope.chassisDetails.PriceCIF ? true : false;
                $scope.Valid = (!$scope.validPriceCIF) ? false : $scope.Valid;
            }
            $scope.ValidateCylinder = function () {
                $scope.validCylinders = $scope.chassisDetails.Cylinders ? true : false;
                $scope.Valid = (!$scope.validCylinders) ? false : $scope.Valid;
            }
            $scope.ValidateFuel = function () {
                $scope.validFuel = $scope.chassisDetails.PatrolType ? true : false;
                $scope.Valid = (!$scope.validFuel) ? false : $scope.Valid;
            }
            $scope.ValidateDoors = function () {
                $scope.validDoors = $scope.chassisDetails.NumberOfDoors ? true : false;
                $scope.Valid = (!$scope.validDoors) ? false : $scope.Valid;
            }
            $scope.ValidateAxils = function () {
                $scope.validAxils = $scope.chassisDetails.NumberOfAxils ? true : false;
                $scope.Valid = (!$scope.validAxils) ? false : $scope.Valid;
            }
            $scope.ValidateEnginePower = function () {
                $scope.validEnginePower = $scope.chassisDetails.EnginePower ? true : false;
                $scope.Valid = (!$scope.validEnginePower) ? false : $scope.Valid;
            }
            $scope.ValidateTransmission = function () {
                $scope.validTransmission = $scope.chassisDetails.TransmissionType ? true : false;
                $scope.Valid = (!$scope.validTransmission) ? false : $scope.Valid;
            }
            $scope.ValidateSteeringType = function () {
                $scope.validSteering = $scope.chassisDetails.SteeringType ? true : false;
                $scope.Valid = (!$scope.validSteering) ? false : $scope.Valid;
            }
            $scope.ValidateUAENo = function () {
                $scope.validEmiratesID = true;

                //***** Comment this part if UAE ID is not mandatory
                if (!$scope.chassisDetails.UAEID) {
                    if ((billType == 'I' || billType == 'N') && ($scope.impExpCategory == 'PSE' || $scope.impExpCategory == 'PSL' || $scope.impExpCategory == 'GCC' || $scope.impExpCategory == 'GSL' || $scope.impExpCategory == 'PLN' || $scope.impExpCategory == 'PSF')) {
                        $scope.validUAENo = $scope.chassisDetails.UAEID ? true : false;
                        $scope.Valid = (!$scope.validUAENo) ? false : $scope.Valid;
                    }
                }
                else
                    //***** Comment this part if UAE ID is not mandatory

                    if ($scope.chassisDetails.UAEID) {
                        $scope.validUAENo = true;
                        if ($scope.chassisDetails.UAEID.toString().length == 15) {
                            apiService.get('Customs/Invoice//ValidateUAEID',
                            {
                                id: $scope.chassisDetails.UAEID
                            },
                            function (result) {
                                var response = result.data.ResponseResult;
                                if (response && response.Data) {
                                    $scope.validEmiratesID = response.Data.IsValidUAEID == 'Y' ? true : false;
                                    $scope.Valid = (!$scope.validEmiratesID) ? false : $scope.Valid;
                                }
                            },
                            function error(response) {
                            });
                        }
                        else {
                            $scope.validEmiratesID = false;
                            $scope.Valid = (!$scope.validEmiratesID) ? false : $scope.Valid;
                        }
                    }
            }
            $scope.ValidateTrafficNo = function () {
                if (billType == 'I' || billType == 'N') {
                    ValidateTrafficNoByCategoryCode();
                }
                else {
                    $scope.trafficNoRequired = true;
                    $scope.validTrafficNo = $scope.chassisDetails.TrafficNumber ? true : false;
                    $scope.Valid = (!$scope.validTrafficNo) ? false : $scope.Valid;
                }
            }
            function showTrafficNoMandatory() {
                if ((billType == 'I' || billType == 'N') && ($scope.impExpCategory == 'PSE' || $scope.impExpCategory == 'PSL' || $scope.impExpCategory == 'GCC' || $scope.impExpCategory == 'GSL' || $scope.impExpCategory == 'PLN' || $scope.impExpCategory == 'PSF')) {
                    $scope.trafficNoRequired = false;
                    $scope.UAEIDRequired = true; //***** Comment this line if UAE ID is not mandatory
                }
                else {
                    $scope.trafficNoRequired = true;
                    $scope.UAEIDRequired = false; //***** Comment this line if UAE ID is not mandatory
                }
            }

            function ValidateForm() {

                $scope.Valid = true;
                $scope.ValidateCountry();
                $scope.ValidatePoliceColor();
                $scope.ValidateColor();
                $scope.ValidateSubType();
                $scope.ValidateBodyType();
                $scope.ValidateCurrency();

                $scope.ValidateChassis();
                $scope.ValidateEngineNo();
                $scope.ValidatePayLoad();
                $scope.ValidateModelYear();
                $scope.ValidatePassengers();
                $scope.ValidateWheels();
                $scope.ValidateWeight();
                $scope.ValidatePriceCIF();
                $scope.ValidateCylinder();
                $scope.ValidateFuel();
                $scope.ValidateDoors();
                $scope.ValidateAxils();
                $scope.ValidateEnginePower();
                $scope.ValidateTransmission();
                $scope.ValidateSteeringType();
                $scope.ValidateUAENo();
                $scope.ValidateTrafficNo();

            }
            //Save
            $scope.SaveChassis = function () {

                ValidateForm();
                if (!$scope.Valid) {
                    return;
                }
                $("#loadingScreen").show();
                GetUpdatedLookupFields();
                $scope.chassisDetails.JobNumber = $scope.jobNoShipment;
                $scope.chassisDetails.ChassisIssueFlag = ($scope.chassisDetails && $scope.chassisDetails.ChassisIssueFlag && ($scope.chassisDetails.ChassisIssueFlag == true || $scope.chassisDetails.ChassisIssueFlag == 'Y')) ? 'Y' : 'N';
                $scope.chassisDetails.ReExportFlag = ($scope.chassisDetails && $scope.chassisDetails.ReExportFlag && ($scope.chassisDetails.ReExportFlag == true || $scope.chassisDetails.ReExportFlag == 'Y')) ? 'Y' : 'N';
                $scope.chassisDetails.VehicleSpecification = ($scope.chassisDetails && $scope.chassisDetails.ReExportFlag && ($scope.chassisDetails.VehicleSpecification == true || $scope.chassisDetails.VehicleSpecification == 'GCC')) ? 'GCC' : 'NONGCC';
                $scope.chassisDetails.CompanyCode = '';
                $scope.chassisDetails.UserCode = '';
                $scope.chassisDetails.CenterCode = $stateParams.centerCode;

                //console.log($scope.chassisDetails);
                apiService.post('Customs/Chassis/AddUpdateChassis', '', $scope.chassisDetails, function (result) {
                    $("#loadingScreen").hide();
                    //console.log("Customs/Chassis/AddUpdateChassis: " + result.data.StatusIsSuccessful);
                    var response = result.data.ResponseResult;
                    var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Chassis could not be added/updated";
                    if (response.IsValid) {
                        $scope.pageNumber = 1;
                        $scope.GetChassisList();
                        $scope.closeModalPopUp();
                        $('#successModal').modal('show');
                    }
                    else if (!response.IsValid) {
                        modalErrorShow(msg);
                    }
                },
                function (result) {
                    $("#loadingScreen").hide();
                    //console.log("An Error has occurred while creating chassis job!" + result);
                    modalErrorShow("An Error has occurred while creating chassis job!" + result);
                });
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
            }
            //Look Ups
            //OnChange of Country
            $scope.$watch("selectedMadeInModel", function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedMadeInModel)) {
                    ////#region Made In Lookup              
                    //apiService.get('Customs/Lookup/GenericLookup',
                    //{
                    //    centerCode: $stateParams.centerCode,
                    //    searchString: '',
                    //    lookupType: 'Country'
                    //},
                    //function (results) {
                    //    $scope.madeIn = results.data.ResponseResult.Data;
                    //},
                    //function error(response) {
                    //    //console.log(response);
                    //});
                    //#endregion
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
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });
            }
            populateMadeInModel();
            //OnChange of Color
            $scope.$watch("selectedColorCode", function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedColorCode)) {
                    //#region Color Lookup              
                    //apiService.get('Customs/Lookup/GenericLookup',
                    //{
                    //    centerCode: $stateParams.centerCode,
                    //    searchString: '',
                    //    lookupType: 'Color'
                    //},
                    //function (results) {
                    //    $scope.color = results.data.ResponseResult.Data;
                    //},
                    //function error(response) {
                    //    //console.log('Color lookup : ' + response);
                    //});
                    //#endregion
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
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });
            }
            populateColorModel();


            //OnChange of Police Color
            $scope.$watch("selectedPColor", function () {

                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedPColor)) {
                    //#region PoliceColor Lookup              
                    //apiService.get('Customs/Lookup/GenericLookup',
                    //{
                    //    centerCode: $stateParams.centerCode,
                    //    searchString: '',
                    //    lookupType: 'POLICE-COLORS'
                    //},
                    //function (results) {
                    //    $scope.policeColor = results.data.ResponseResult.Data;
                    //},
                    //function error(response) {
                    //    //console.log('PoliceColor lookup : ' + response);
                    //});
                    //#endregion
                    $scope.ValidatePoliceColor();

                }
            });

            function populatePoliceColorModel() {
                getIndexData('PoliceColor', '', function (data) {
                    $scope.policeColor = data;
                }, function () {
                    apiService.get('Customs/Lookup/GenericLookup',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: '',
                            lookupType: 'POLICE-COLORS'
                        },
                        function (results) {
                            $scope.policeColor = results.data.ResponseResult.Data;
                            storeData($scope.policeColor, 'PoliceColor', '');
                        },
                        function error(response) {
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });
            }
            populatePoliceColorModel();

            //OnChange of BodyType 
            $scope.$watch("searchSubTypeText", function () {
                $scope.onSubTypeChange();
            });
            //OnChange of BodyType 
            $scope.$watch("searchBodyTypeText", function () {
                $scope.onBodyTypeChange();
            });
            $scope.$watch("selectedBodyType", function () {
                if ($scope.selectedBodyType && ($scope.selectedBodyType.originalObject.BodyCode != $scope.chassisDetails.BodyTypeCode)) {
                    $scope.selectedSubTypeModel = '';
                    $scope.selectedSubType = {};
                }
                $scope.PopulateSubTypes();
            });
            //#region CYLINDERS Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Cylinders'
                },
            function (results) {
                $scope.cylinders = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log(response);
            });
            //#endregion
            //#region Fuel Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Fuel'
                },
            function (results) {
                $scope.fuel = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log(response);
            });
            //#endregion 
            //#region Doors Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Doors'
                },
            function (results) {
                $scope.doors = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log('Country lookup : ' + response);
            });
            //#endregion
            //#region Engine Power Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Engine'
                },
            function (results) {
                $scope.engine = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log(response);
            });
            //#endregion
            //#region Axils Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Axils'
                },
            function (results) {
                $scope.axils = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log('Axils lookup : ' + response);
            });
            //#endregion
            //#region STEERING Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Steering'
                },
            function (results) {
                $scope.steering = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log(response);
            });
            //#endregion  
            //#region Transmission Lookup              
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Transmission'
                },
            function (results) {
                $scope.transmission = results.data.ResponseResult.Data;
            },
            function error(response) {
                //console.log('Transmission lookup : ' + response);
            });
            //#endregion
            //OnChange of Currency
            $scope.$watch("selectedCurrencyModel", function () {

                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCurrencyModel)) {
                    //#region Currency Lookup              
                    //apiService.get('Customs/Lookup/Currencies',
                    //{
                    //    centerCode: $stateParams.centerCode,
                    //    searchString: ''
                    //},
                    //function (results) {
                    //    $scope.currency = results.data.ResponseResult.Data;
                    //},
                    //function error(response) {
                    //    //console.log('Currency lookup : ' + response);
                    //});
                    //#endregion
                    $scope.ValidateCurrency();
                }
            });
            function populateCurrencyModel() {
                getIndexData('CurrencyModel', '', function (data) {
                    $scope.currency = data;
                }, function () {
                    apiService.get('Customs/Lookup/Currencies',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.currency = results.data.ResponseResult.Data;
                            storeData($scope.currency, 'CurrencyModel', '');
                        },
                        function error(response) {
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
                });
            }
            populateCurrencyModel();

            //OnChange of AgentRemark
            $scope.$watch("selectedAgentRemarkModel", function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedAgentRemarkModel)) {
                    //#region AgentRemark Lookup              
                    apiService.get('Customs/Lookup/GenericLookup',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: '',
                        lookupType: 'REMARKS'
                    },
                    function (results) {
                        $scope.agentRemark = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        //console.log('AgentRemark lookup : ' + response);
                    });
                    //#endregion
                }
            });
            //OnChange of Vehicle Remark
            $scope.$watch("selectedVehicleRemarksModel", function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedVehicleRemarksModel)) {
                    //#region AgentRemark Lookup              
                    apiService.get('Customs/Lookup/GenericLookup',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: '',
                        lookupType: 'REMARKS'
                    },
                    function (results) {
                        $scope.vehicleRemark = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        //console.log('AgentRemark lookup : ' + response);
                    });
                    //#endregion
                }
            });
            $scope.$on('changeLanguage', function (event, args) {
                $scope.selectedLanguage = args.language;
            });



            $scope.PopulateBodyTypes = function () {
                apiService.get('Customs/Lookup/BodyType',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: '',
                    },
                    function (results) {
                        $scope.bodyTypesFull = results.data.ResponseResult.Data;
                        $scope.bodyTypes = angular.copy($scope.bodyTypesFull);

                    });
            }

            $scope.bodyLookupKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openBodyTypeLookup();
                }
            }
            $scope.subTypeLookupKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openSubTypeLookup();
                }
            }
            $scope.PopulateBodyTypes();
            $scope.openBodyTypeLookup = function (item) {
                $scope.searchBodyTypeText='';
                $scope.recordToEdit = item;
                $('#bodyTypeLookup').modal({
                    backdrop: "static"
                });
                $('#searchBodyTypeText').focus();
                //$('#searchBodyTypeText').select();
                $scope.onBodyTypeChange();
               // $("#bodyTypeLookup").off("keydown");
                //$('#bodyTypeLookup').bind('keydown', function (event) {
                //    console.log(event.keyCode);
                //    $timeout(function () {
                //        switch (event.keyCode) {
                //            case 40:
                //                if ($scope.rowIndex < $scope.bodyTypes.length - 1) {
                //                    $scope.rowIndex++;
                //                    if ($scope.rowIndex > 10 * $scope.lookUpCurrentPage - 1) {
                //                        $scope.lookUpCurrentPage++;
                //                    }
                //                    $scope.bodySelected = $scope.harmonisedList[$scope.rowIndex];
                //                }
                //                break;
                //            case 38:
                //                if ($scope.rowIndex > 0) {

                //                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                //                        $scope.lookUpCurrentPage--;
                //                    }
                //                    $scope.rowIndex--;
                //                    $scope.harmonizedItemSelected = $scope.harmonisedList[$scope.rowIndex];
                //                }
                //                break;
                //            case 13:
                //                $scope.setHarmonized($scope.harmonizedItemSelected);
                //                break;
                //        }
                //    });
                //});
            }

            $scope.onBodyTypeChange = function () {
                $scope.rowIndex = 0;
              
                $scope.lookUpCurrentPage = 1;
                if ($scope.bodyTypesFull)
                {
                    $scope.bodyTypes = $scope.bodyTypesFull.filter(obj => {
                        return obj.BodyCode.toString().includes($scope.searchBodyTypeText) || (obj.BodyEngName && obj.BodyEngName.toLowerCase().includes($scope.searchBodyTypeText.toLowerCase()))
                            || (obj.BodyArbName && obj.BodyArbName.toLowerCase().includes($scope.searchBodyTypeText.toLowerCase()));
                    });
                }
            }

            $scope.setBodyType = function (row) {
                $scope.selectedBodyTypeModel = row.BodyCode.toString() + "     " + (row.BodyEngName ? row.BodyEngName : '') + "     " + (row.BodyArbName ? row.BodyArbName : '');
                $scope.selectedBodyType = {};
                $scope.selectedBodyType.originalObject = row;
                $("#bodyTypeLookup").modal("hide");
            }


            $scope.PopulateSubTypes = function () {
                apiService.get('Customs/Lookup/BodySubType',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: '',
                        bodyCode: $scope.selectedBodyType?$scope.selectedBodyType.originalObject.BodyCode:''
                    },
                    function (results) {
                        $scope.subTypesFull = results.data.ResponseResult.Data;
                        $scope.subTypes = angular.copy($scope.subTypesFull);

                    });
            }

            
            $scope.openSubTypeLookup = function (item) {
                $scope.searchSubTypeText='';
                $scope.recordToEdit = item;
                $('#subTypeLookup').modal({
                    backdrop: "static"
                });
                $('#searchSubTypeText').focus();
                //$('#searchSubTypeText').select();
                $scope.onSubTypeChange();
                // $("#subTypeLookup").off("keydown");
                //$('#subTypeLookup').bind('keydown', function (event) {
                //    console.log(event.keyCode);
                //    $timeout(function () {
                //        switch (event.keyCode) {
                //            case 40:
                //                if ($scope.rowIndex < $scope.subTypes.length - 1) {
                //                    $scope.rowIndex++;
                //                    if ($scope.rowIndex > 10 * $scope.lookUpCurrentPage - 1) {
                //                        $scope.lookUpCurrentPage++;
                //                    }
                //                    $scope.subSelected = $scope.harmonisedList[$scope.rowIndex];
                //                }
                //                break;
                //            case 38:
                //                if ($scope.rowIndex > 0) {

                //                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                //                        $scope.lookUpCurrentPage--;
                //                    }
                //                    $scope.rowIndex--;
                //                    $scope.harmonizedItemSelected = $scope.harmonisedList[$scope.rowIndex];
                //                }
                //                break;
                //            case 13:
                //                $scope.setHarmonized($scope.harmonizedItemSelected);
                //                break;
                //        }
                //    });
                //});
            }

            $scope.onSubTypeChange = function () {
                $scope.rowIndex = 0;
               
                $scope.lookUpCurrentPage = 1;
                if ($scope.subTypesFull) {
                    $scope.subTypes = $scope.subTypesFull.filter(obj => {
                        return obj.SubTypeCode.toString().includes($scope.searchSubTypeText) || (obj.SubTypeEngName && obj.SubTypeEngName.toLowerCase().includes($scope.searchSubTypeText.toLowerCase()))
                            || (obj.SubTypeArbName && obj.SubTypeArbName.toLowerCase().includes($scope.searchSubTypeText.toLowerCase()));
                    });
                }
            } 

            $scope.setSubType = function (row) {
                $scope.selectedSubTypeModel = row.SubTypeCode.toString() + "     " + (row.SubTypeEngName ? row.SubTypeEngName : '') + "     " + (row.SubTypeArbName ? row.SubTypeArbName : '')
                + "     " + (row.BodyTypeCode ? row.BodyTypeCode : '') + "     " + (row.BodyTypeEngName ? row.BodyTypeEngName : '') + "     " + (row.BodyTypeArbName ? row.BodyTypeArbName : '') + "     " + (row.CategoryEngName ? row.CategoryEngName : '')
                + "     " + (row.CategoryArbName ? row.CategoryArbName : '');
                $scope.selectedSubType = {};
                $scope.selectedSubType.originalObject = row;
                $("#subTypeLookup").modal("hide");
            }

            $scope.closeBodyTypeLookup = function () {
                $("#bodyTypeLookup").modal("hide");
            }

            $scope.closeSubTypeLookup = function () {
                $("#subTypeLookup").modal("hide");
            }


            $scope.$on("selectedFile", function (event, args) {

                if ($scope.acceptFiles.split(",").includes("." + args.file.name.split(".")[1])) {
                    // $("#loadingScreen").show();
                    toastr.info('', "Upload in progress <i class='icon-spinner2 spinner position-center pull-right'></i>");
                    AddAttachment(args, args.file.name);
                    $scope.Message = "Your file is in progress, will inform you once it gets Done";
                    showSuccessMessage($scope.Message);
                }
                else {
                    modalErrorShow("Attached document is invalid file");
                }

            });


            //Generic Lookup - Begin
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'MadeIn':
                        $scope.selectedMadeInModel = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedMadeIn = {};
                        $scope.selectedMadeIn.originalObject = row;
                        $('#MadeIn_value').focus();
                        break;
                    case 'Color':
                        $scope.selectedColorCode = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedColor = {};
                        $scope.selectedColor.originalObject = row;
                        $('#Color_value').focus();
                        break;
                    case 'PoliceColor':
                        $scope.selectedPColor = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedPoliceColor = {};
                        $scope.selectedPoliceColor.originalObject = row;
                        $('#PoliceColorCode_value').focus();
                        break;
                    case 'Currency':
                        $scope.selectedCurrencyModel = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                        $scope.selectedCurrency = {};
                        $scope.selectedCurrency.originalObject = row;
                        $('#Currency_value').focus();
                        break;
                        
                }
                $("#genericLookUp").modal("hide");
                //$scope.frmchassisDetails.$setDirty();
            }

            $scope.populateLookupData = function (lookupId) {
                switch (lookupId) {
                    case 'MadeIn':
                        break;
                    case 'Color':
                        break;
                    case 'PoliceColor':
                        break;
                    case 'Currency':
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

                        case 'PoliceColor':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.policeColor) {
                                $scope.lookUpData = $scope.policeColor.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                        case 'Currency':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.currency) {
                                $scope.lookUpData = $scope.currency.filter(obj => {
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
                        case 'PoliceColor':
                            $scope.lookUpTitle = $filter("translate")("PoliceColor"); 
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.policeColor;
                            break;
                        case 'Currency':
                            $scope.lookUpTitle = $filter("translate")("Currency"); 
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }, { Text: "Rate", Width: ""}];
                            $scope.lookUpData = $scope.currency;
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
            //Generic Lookup - End

            function GetWarningMessage(data) {
                var information = data.split('|');
                let counter = 0;
                if (information.length > 2) {
                    $scope.Warning = [];
                    information[2].split('WarningMsgChasssis:')[1].split('#').filter(v => v != '').map((item) => {

                        let weather = {
                            ID: counter,
                            Warning: item
                        }
                        if (!apiService.isNullOrEmptyOrUndefined(weather.Warning)) {
                            $scope.Warning.push(Object.assign(weather));
                            counter++;
                        }
                    });

                    information[3].split('WarningMsgInvoiceGroup:').filter(v => v != '').map((item) => {

                        let weather = {
                            ID: counter,
                            Warning: item
                        }
                        if (!apiService.isNullOrEmptyOrUndefined(weather.Warning)) {
                            $scope.Warning.push(Object.assign(weather));
                            counter++;
                        }
                    });

                    information[4].split('WarningMsgInvoiceDetail:').filter(v => v != '').map((item) => {

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
                    WarningModalOnFormM($scope.Warning);
                    $('#WarningModalOnForm2').modal('show');
                }
         
                if ($scope.Warning && $scope.Warning.length > 0) {
                    WarningModalOnFormM($scope.Warning);
                    $('#WarningModalOnForm2').modal('show');
                }
            }
            function AddAttachment(args, name)
            {
                var chassisErrorValidation = '';
                var chassisErrorValidationWarning = [];
                $('#ChassisErrordivResults').empty();
               // modalErrorShow("Eng: File size is too big Please, File size should not be more than 4000K | Arb: حجم الملف كبير جدًا");
               // $("#loadingScreen").hide();
                var errormsg = "An Error has occurred while uploading file!"
                var serviceAttachInp = {};
                serviceAttachInp.CenterCode = $stateParams.centerCode;
                serviceAttachInp.jobNumber = $stateParams.jobNumber;
                serviceAttachInp.FilePath = args.file.name;
                if (args.file.size > 10485760 ) {
                    $("#loadingScreen").hide();
                    $(".toast-info").hide();
                    modalErrorShow("Eng: File size is too big Please, File size should not be more than 10mb | Arb: حجم الملف كبير جدًا");
                    return;
                }
                var fileAttach = apiService.postfile('Customs/Chassis/BulkUpload', '', args.file, serviceAttachInp, 'Chassis');
                fileAttach.then(function (results) {
                    // $("#loadingScreen").hide();
                    $(".toast-info").hide();
                    if (results.data.ResponseCode == "405") {
                        modalErrorShow(results.data.ResponseResult);
                        return;
                    }
                    if (results.data.ResponseResult == "") {
                        modalErrorShow(errormsg);
                        return;
                    }
                    if (results.data.IsError)
                    {
                        //results.data.Response.split('&#10;')
                        chassisErrorValidation = '';
                        chassisErrorValidation = "<table class='table table - bordered' border='1'>";
                        for (a = 0; a < results.data.Response.split('&#10;').length; a++) {
                            let weather =
                                {
                                    Warning: results.data.Response.split('&#10;')[a]
                                }

                            if (!isNullOrEmptyOrUndefined(weather.Warning))
                            {
                                chassisErrorValidation += "<tr><td><i class='fa fa - warning' style='font - size: 20px'>" + weather.Warning + "</i></td></tr>";
                                chassisErrorValidationWarning.push(Object.assign(weather.Warning));
                            }
                        }

                        chassisErrorValidation += "</table>";
                        $('#ChassisErrordivResults').append(chassisErrorValidation);
                        $('#ChassisErrorModalOnForm').modal('show');
                      
                        return;
                    }
                    var data = JSON.parse(results.data.ResponseResult);
                    if (data.isValid != "false") {
                        $scope.Message = "Your file is being uploaded.";
                        $scope.GetChassisList();
                        showSuccessMessage($scope.Message);
                        return;
                    }
                    else {
                        console.log(data.messages);
                        //modalErrorShow(data.Messages);
                        return;
                    }
                },
                    function error(response) {
                        $("#loadingScreen").hide();
                        $(".toast-info").hide();
                        modalErrorShow(errormsg);
                    });
               
            }
        }

    ]
);