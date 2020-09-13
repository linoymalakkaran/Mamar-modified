angular.module('mamarApp').controller('ChassisDraftListController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$storage', '$uibModal', 'sharedModels', 'userAccountStorageFactory',
        function ($scope, $rootScope, $state, $stateParams, $filter, apiService, $storage, $uibModal, sharedModels, userAccountStorageFactory) {

            $scope.$storage = $storage;

            $scope.selectedLanguage = $('#selLang :selected').text() == "Arabic" ? 'ae' : $('#selLang :selected').text() == "English" ? 'en' : 'en';
            $scope.centerCodeShipment = $stateParams.centerCode;
            //$scope.jobNoShipment = '';
            var billType = $stateParams.BillType;
            $scope.impExpCategory = $stateParams.ImporterExporterCode;
            $scope.pageNumber = 1;
            $scope.pageSize = 10;
            $scope.globalDisableFlag = $stateParams.globalDisableFlag == "view";

            
            $scope.parameters = [];
            //$scope.parameters = {
            //    centerCode: $stateParams.centerCode,
            //    houseBLNumber: $stateParams.HouseBLNumber,
            //    voyageNumber: $stateParams.VoyageNumber,
            //    doCenterCode: $stateParams.centerCode,
            //    agentCode: $stateParams.AgentCode,
            //    MasterBLNumber: $stateParams.MasterBLNumber,
            //    vesselCode: $stateParams.VesselCode,
            //    pageNumber: 1,
            //    pageSize: 10,
            //    searchString: ''
            //};
            $scope.parameters = {
                centerCode: sharedModels.ShipmentDraft.centerCode,
                houseBLNumber: sharedModels.ShipmentDraft.HouseBLNumber,
                voyageNumber: sharedModels.ShipmentDraft.VoyageNumber,
                doCenterCode: sharedModels.ShipmentDraft.centerCode,
                agentCode: sharedModels.ShipmentDraft.AgentCode,
                MasterBLNumber: sharedModels.ShipmentDraft.MasterBLNumber,
                vesselCode: sharedModels.ShipmentDraft.VesselCode,
                pageNumber: 1,
                pageSize: 10,
                searchString: ''
            };
            $scope.openChassisDetails = function (chassisNo, mode) {
                $scope.initialiseChassisDetails();
                $scope.selectedChassisNo = chassisNo;
                showTrafficNoMandatory();
                $scope.mode = mode;
                if ($scope.mode != 'New') {
                    $scope.GetChassisDetails(chassisNo);
                }
                $('#chassisModal').modal({
                    backdrop: "static"
                });
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
            // close Modal Popup
            $scope.closeModalPopUp = function () {
                $scope.initialiseChassisDetails();
                $('#chassisModal').modal('hide');
            };
            //#region Get/Load menthod during page load.
            $scope.GetChassisList = function () {
                $("#loadingScreen").show();
                var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
                var check = userAccntInfo.CCode.includes("CONSOLIDATOR");
                if (check == true) {
                    $scope.ISConsolidate = true;
                }
                else {
                    $scope.ISConsolidate = false;
                }
                apiService.get('Customs/Chassis/GetDOChassisList',
                    $scope.parameters,
                    function (results) {
                        //debugger;
                        $scope.chassisList = results.data.ResponseResult.Data;
                        console.log($scope.chassisList);
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
            $scope.GetSearchResult = function () {
                $scope.chassisList = {
                };
                $scope.pageNumber = 1;
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                $scope.parameters.searchString = $scope.searchString;
                $scope.GetChassisList();
            }
            // load More Records
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.parameters.pageNumber = newPageNo;
                $scope.pageNumber = newPageNo;
                $scope.GetChassisList();
            }
            $scope.chassisNoChanged = function () {
                if (!$scope.parameters.searchString) {
                    $scope.GetChassisList();
                }
            }
            // open chassis details Modal popup form
            $scope.initialiseChassisDetails = function () {
                $scope.chassisDetails = {
                };
                $scope.selectedMadeIn = null;
                $scope.selectedColor = null;
                $scope.selectedPoliceColor = null;
                $scope.selectedSubType = null;
                $scope.selectedCurrency = null;
                $scope.selectedAgentRemark = null;
                $scope.selectedVehicleSpecification = null;

                $scope.selectedMadeInModel = '';
                $scope.selectedColorCode = '';
                $scope.selectedPColor = '';
                $scope.selectedSubTypeModel = '';
                $scope.selectedCurrencyModel = '';
                $scope.selectedAgentRemarkModel = '';
                $scope.selectedVehicleRemarksModel = '';

                $scope.chassisDetails.Cylinders = ($scope.cylinders && $scope.cylinders.length > 1) ? $scope.cylinders[1].Code : '';
                $scope.chassisDetails.PatrolType = ($scope.fuel && $scope.fuel.length > 0) ? $scope.fuel[0].Code : '';
                $scope.chassisDetails.NumberOfDoors = ($scope.doors && $scope.doors.length > 2) ? $scope.doors[2].Code : '';
                $scope.chassisDetails.EnginePower = ($scope.engine && $scope.engine.length > 1) ? $scope.engine[1].Code : '';
                $scope.chassisDetails.NumberOfAxils = ($scope.axils && $scope.axils.length > 0) ? $scope.axils[0].Code : '';
                $scope.chassisDetails.SteeringType = ($scope.steering && $scope.steering.length > 0) ? $scope.steering[0].Code : '';
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
            $scope.Initialize = function () {
                // get Chassis list
                debugger;
                $scope.GetChassisList();
            }
            //Chassis Details
            $scope.GetChassisDetails = function (chassisNo) {
                $("#loadingScreen").show();
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                apiService.get('Customs/Chassis/GetDOChassisDetail',
                    {
                        centerCode: sharedModels.ShipmentDraft.centerCode,
                        houseBLNumber: sharedModels.ShipmentDraft.HouseBLNumber,
                        voyageNumber: sharedModels.ShipmentDraft.VoyageNumber,
                        doCenterCode: sharedModels.ShipmentDraft.centerCode,
                        agentCode: sharedModels.ShipmentDraft.AgentCode,
                        MasterBLNumber: sharedModels.ShipmentDraft.MasterBLNumber,
                        vesselCode: sharedModels.ShipmentDraft.VesselCode,
                        chassisNumber: chassisNo
                    },
                    function (results) {
                        $scope.chassisDetails = results.data.ResponseResult.Data;
                        GetPoliceColorLookUpFormattedData();
                        GetColorLookUpFormattedData();
                        GetSubTypeLookUpFormattedData();
                        GetCountryLookUpFormattedDate();
                        GetCurrencyLookUpFormattedDate();
                        GetRemarksLookUpFormattedDate();

                        $scope.chassisDetails.Cylinders = $scope.chassisDetails.Cylinders ? JSON.stringify($scope.chassisDetails.Cylinders) : "";
                        $scope.chassisDetails.PatrolType = $scope.chassisDetails.PatrolType ? JSON.stringify($scope.chassisDetails.PatrolType) : "";
                        $scope.chassisDetails.NumberOfDoors = $scope.chassisDetails.NumberOfDoors ? JSON.stringify($scope.chassisDetails.NumberOfDoors) : "";
                        $scope.chassisDetails.NumberOfAxils = $scope.chassisDetails.NumberOfAxils ? JSON.stringify($scope.chassisDetails.NumberOfAxils) : "";
                        $scope.chassisDetails.EnginePower = $scope.chassisDetails.EnginePower ? JSON.stringify($scope.chassisDetails.EnginePower) : "";

                        $("#loadingScreen").hide();
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                    });
            }
            $scope.ShipmentDraftDetails = function () {
                $state.go('shipmentInDraft', { 'centerCode': sharedModels.ShipmentDraft.centerCode, 'DoNumber': sharedModels.ShipmentDraft.DoNumber, 'AgentCode': sharedModels.ShipmentDraft.ShipmentDraftAgentCode });
                // $state.go('shipmentInDraft', { 'centerCode': $stateParams.centerCode, 'DoNumber': $stateParams.DoNumber, 'AgentCode': $stateParams.ShipmentDraftAgentCode });
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
                var param = $scope.chassisList[$scope.deleteRowIndex];
                var data = {
                    chassisNumber: param.ChassisNumber,
                    centerCode: sharedModels.ShipmentDraft.centerCode,
                    houseBLNumber: sharedModels.ShipmentDraft.HouseBLNumber,
                    MasterBLNumber: sharedModels.ShipmentDraft.MasterBLNumber,
                    voyageNumber: sharedModels.ShipmentDraft.VoyageNumber,
                    vesselCode: sharedModels.ShipmentDraft.VesselCode
                }
                debugger;
                apiService.get('Customs/Manifest/DeleteChassis', data, function (result) {
                    $("#loadingScreen").hide();
                    var data = result.data.ResponseResult;
                    if (data.IsValid) {
                        $scope.pageNumber = 1;
                        $scope.GetChassisList();
                        $('#successModal').modal('show');
                        $scope.closeModalPopUp();
                    }
                    else if (!data.IsValid) {
                        modalErrorShow(msg);
                    }
                },
                    function (result) {
                        $("#loadingScreen").hide();
                        var msg = apiService.formatResponseMessage(response.Messages);
                        modalErrorShow(msg);
                    });
            }
        $scope.Initialize();
        }]);