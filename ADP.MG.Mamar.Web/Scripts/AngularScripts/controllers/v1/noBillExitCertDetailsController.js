angular.module('mamarApp').controller('noBillExitCertDetailsController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$storage', 'sharedModels', '$timeout', '$window',
    function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $storage, sharedModels, $timeout, $window) {

        // init
        $stateParams.centerCode = 'V';
        $scope.EENumber = '';
        $scope.searchCargoAgentText = '';
        $scope.cargoAgentModel = '';
        $scope.eeImporterModel = '';
        $scope.eeCountryExpModel = '';
        $scope.eeCountryDestModel = '';

        $scope.noBillCert = {};
        $scope.noBillCert.ExitEntryDetail = {};
        $scope.noBillCert.Trucks = [];
        $scope.noBillCert.Containers = [];
        $scope.noBillCert.Chassises = [];
        $scope.noBillCert.Seals = [];

        $scope.isValidEEAgent = true;
        $scope.isValidEEImporter = true;
        $scope.isValidEECountryExp = true;
        $scope.isValidEEDestCountry = true;

        // EEBillTypes List --> START
        $scope.getEEBillTypes = function () {
            apiService.get('Customs/Lookup/NoBillExitEntryBillTypes',
                 {
                     centerCode: $stateParams.centerCode,
                     searchString: ''
                 },
                 function (results) {
                     $scope.eeBillTypes = results.data.ResponseResult.Data;
                     if ($scope.eeBillTypes && $scope.eeBillTypes.length > 0) {
                         $scope.noBillCert.ExitEntryDetail.EEBillType = $scope.eeBillTypes[0].BILL_TYPE_CODE;
                     }
                 },
                 function error(response) {
                     modalErrorShow("An Error has occurred while getting cneter code Lookup Data!");
                 });
        }
        // EEBillTypes List --> END

        // EEOrigin List --> START
        $scope.getEmiratesLookupData = function () {
            getIndexData('emirates', '', function (data) {
                $scope.emirates = data;
            }, function () {
                apiService.get('Customs/Lookup/Emirates',
                     {
                         centerCode: $stateParams.centerCode,
                         searchString: ''
                     },
                     function (results) {
                         $scope.emirates = results.data.ResponseResult.Data;
                         storeData(results.data.ResponseResult.Data, 'emirates', '');
                     },
                     function error(response) {
                         modalErrorShow("An Error has occurred while getting cneter code Lookup Data!");
                     })
            });
        }
        // EEOrigin List --> END

        // CountryExp/CountryDest Lookup --> START
        $scope.getEECountryExp = function () {
            getIndexData('ShipmentCountry', '', function (data) {
                $scope.country = data;
                $scope.destCountry = data;
            }, function () {
                apiService.get('Customs/Lookup/ShipmentCountries',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.country = results.data.ResponseResult.Data;
                        $scope.destCountry = results.data.ResponseResult.Data;
                        storeData($scope.country, 'ShipmentCountry', '');
                    },
                    function error(response) {
                    });
            });
        }

        $scope.setEECountryLookupData = function (row, lookupId) {
            switch (lookupId) {
                case 'CountryExp':
                    $scope.eeCountryExpModel = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.selectedOriginCountry = {};
                    $scope.selectedOriginCountry.originalObject = row;
                    $('#EECountryExp_value').focus();
                    break;
                case 'CountryDest':
                    $scope.eeCountryDestModel = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.selectedDestCountry = {};
                    $scope.selectedDestCountry.originalObject = row;

                    $('#EECountryDest_value').focus();
                    break;
            }
            $("#eeCountryLookUp").modal("hide");
        }

        $scope.populateLookupData = function (lookupId) {
            switch (lookupId) {
                case 'CountryExp':
                    break;
                case 'CountryDest':
                    break;
            }
        }

        $scope.onEECountryLookupSearhChange = function () {
            var searchText = $("#searchEECountryLookupText").val().toLowerCase();
            $timeout(function () {
                switch ($scope.lookupId) {
                    case 'CountryExp':
                        $scope.lookUpCurrentPage = 1;
                        if ($scope.country) {
                            $scope.lookUpData = $scope.country.filter(obj => {
                                return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                    || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                            });
                        }
                        break;
                    case 'CountryDest':
                        $scope.lookUpCurrentPage = 1;
                        if ($scope.destCountry) {
                            $scope.lookUpData = $scope.destCountry.filter(obj => {
                                return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                    || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                            });
                        }
                        break;

                }
            });
        }

        $scope.openEECountryLookup = function (lookupId) {
            $("#searchEECountryLookupText").val("");
            $timeout(function () {
                $scope.lookupId = lookupId;
                switch (lookupId) {
                    case 'CountryExp':
                        $scope.lookUpTitle = $filter("translate")("CountryExp");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                        $scope.lookUpData = $scope.country;
                        break;
                    case 'CountryDest':
                        $scope.lookUpTitle = $filter("translate")("CountryDest");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                        $scope.lookUpData = $scope.country;
                        break;
                }

                $scope.searchLookupTextModel = '';
                $('#eeCountryLookUp').modal({
                    backdrop: "static"
                });
                $('#searchEECountryLookupText').focus();
                $('#searchEECountryLookupText').select();
                $('#eeCountryLookUp').off("keydown");
                $('#eeCountryLookUp').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 13:
                                $scope.setEECountryLookupData(lookupId);
                                break;
                        }
                    });
                });
                $scope.lookUpCurrentPage = 1;
            });
        }

        $scope.eeCountryLookupKeyDown = function (event, lookupId) {
            if (event.key == 'F9') {
                $scope.openEECountryLookup(lookupId);
            }
        }

        // CountryExp and CountryDest Lookup --> START

        // EEImporter LookUp --> START
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
            $scope.totalCount = 0;;
        }
        $scope.searchResults = function () {
            $scope.searchParameter.pageNumber = 1;
            $scope.PopulateImporterExporters();
        }

        $scope.openImporterExporterLookup = function () {
            GetCategoryCodes();
            $scope.clearSearchFilters();
            $('#importerExporterLookup').modal({
                backdrop: "static"
            });
        }

        $scope.setImporterExporter = function (row) {
            $scope.eeImporterModel = row.ImporterCode.toString() + "     " + (row.ImporterDescEng ? row.ImporterDescEng : '') + "     " + (row.ImporterDescArb ? row.ImporterDescArb : '');
            $scope.selectedImporterExporterCode = {};
            $scope.selectedImporterExporterCode.originalObject = {};
            $scope.selectedImporterExporterCode.originalObject.Code = row.ImporterCode;
            $scope.selectedImporterExporterCode.originalObject.EnglishName = row.ImporterDescEng;
            $scope.selectedImporterExporterCode.originalObject.ArabicName = row.ImporterDescArb;
            $scope.selectedImporterExporterCode.originalObject.CategoryCode = row.ImporterCategoryCode;
            $("#importerExporterLookup").modal("hide");
            $('#ImporterExporter_value').focus();
        }

        /// F9 key down event
        $scope.importerExporterKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.clearSearchFilters();
                $scope.openImporterExporterLookup();
            }
        }
        $scope.$watchCollection("eeImporterModel", function () {
            $scope.isHumanCorps = false;

            if (!$scope.eeImporterModel) {
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

        $scope.ImporterExporterChanged = function (searchStr) {
            if (searchStr && searchStr.length >= 3) {
                apiService.get('Customs/Lookup/ImporterExporter',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.impotersExporters = results.data.ResponseResult.Data;
                },
                function error(response) {
                    console.log("An Error has occurred while getting lookup Data of Importer Exporter!", response);
                });
            }
        };

        // EEImporter LookUp --> END

        // CargoAgents LookUp --> START
        $scope.getCargoAgents = function () {
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

        $scope.setCargoAgent = function (row) {
            $scope.cargoAgentModel = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
            $scope.selectedCargoAgent = {};
            $scope.selectedCargoAgent.originalObject = row;
            $("#cargoAgentLookup").modal("hide");
            $('#EnglishCargoAgents_value').focus();
        }


        $scope.openCargoAgentLookup = function () {
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


        $scope.cargoAgentKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openCargoAgentLookup();
            }
        }

        $scope.$watchCollection("searchCargoAgentText", function () {
            if ($scope.searchCargoAgentText)
                $scope.onCargoAgentChange($scope.searchCargoAgentText);
        });

        // CargoAgents LookUp --> END

        // Add/Edit Truck Info --> START
        $scope.resetTruckEditedIndex = function () {
            $scope.editTruck = [];
            angular.forEach($scope.noBillCert.Trucks, function (value, key) {
                $scope.editTruck[key] = false;
            });
        }

        $scope.addNewTruckInfo = function () {
            $scope.isAddNewTruck = true;
            $scope.rowTruckInfo = {};
            $scope.resetTruckEditedIndex();
        }

        $scope.editTruckInfo = function (truck, index) {
            $scope.resetTruckEditedIndex();
            $scope.isAddNewTruck = false;
            $scope.rowTruckInfo = angular.copy(truck);
            $scope.editTruck[index] = true;
        }
        $scope.cancelTruckSave = function (action, truck, index) {
            $scope.isAddNewTruck = false;
            if (action == 'edit') {
                $scope.editTruck[index] = false;
                $scope.rowTruckInfo = angular.copy(truck);
            }
        }
        $scope.saveTruckInfo = function (action, index) {
            $scope.isAddNewTruck = false;
            if (action == 'add') {
                $scope.noBillCert.Trucks.unshift($scope.rowTruckInfo);
                $scope.rowTruckInfo = {};
            }
            if (action == 'edit') {
                $scope.noBillCert.Trucks[index] = angular.copy($scope.rowTruckInfo);
                $scope.editTruck[index] = false;
            }
        }

        $scope.deleteTruck = function (index) {
            $scope.noBillCert.Trucks.splice(index, 1);
        }
        // Add/Edit Truck Info --> END

        // Add/Edit Containers --> START
        $scope.resetContainerEditedIndex = function () {
            $scope.editContainer = [];
            angular.forEach($scope.noBillCert.Containers, function (value, key) {
                $scope.editContainer[key] = false;
            });
        }

        $scope.addNewContainer = function () {
            $scope.isAddNewContainer = true;
            $scope.rowContainer = {};
            $scope.resetContainerEditedIndex();
        }

        $scope.editContainerInfo = function (container, index) {
            $scope.resetContainerEditedIndex();
            $scope.isAddNewContainer = false;
            $scope.rowContainer = angular.copy(container);
            $scope.editContainer[index] = true;
        }
        $scope.cancelContainerSave = function (action, container, index) {
            $scope.isAddNewContainer = false;
            if (action == 'edit') {
                $scope.editContainer[index] = false;
                $scope.rowContainer = angular.copy(container);
            }
        }
        $scope.saveContainer = function (action, index) {
            $scope.isAddNewContainer = false;
            if (action == 'add') {
                $scope.noBillCert.Containers.unshift($scope.rowContainer);
                $scope.rowContainer = {};
            }
            if (action == 'edit') {
                $scope.noBillCert.Containers[index] = angular.copy($scope.rowContainer);
                $scope.editContainer[index] = false;
            }
        }

        $scope.deleteContainer = function (index) {
            $scope.noBillCert.Containers.splice(index, 1);
        }
        // Add/Edit Container --> END

        // Add/Edit Chassis --> START
        $scope.resetChassisEditedIndex = function () {
            $scope.editChassis = [];
            angular.forEach($scope.noBillCert.Chassises, function (value, key) {
                $scope.editChassis[key] = false;
            });
        }

        $scope.addNewChassis = function () {
            $scope.isAddNewChassis = true;
            $scope.rowChassis = {};
            $scope.resetChassisEditedIndex();
        }

        $scope.editChassis = function (chassis, index) {
            $scope.resetChassisEditedIndex();
            $scope.isAddNewChassis = false;
            $scope.rowChassis = angular.copy(chassis);
            $scope.editChassis[index] = true;
        }
        $scope.cancelChassisSave = function (action, chassis, index) {
            $scope.isAddNewChassis = false;
            if (action == 'edit') {
                $scope.editChassis[index] = false;
                $scope.rowChassis = angular.copy(chassis);
            }
        }
        $scope.saveChassis = function (action, index) {
            $scope.isAddNewChassis = false;
            if (action == 'add') {
                $scope.noBillCert.Chassises.unshift($scope.rowChassis);
                $scope.rowChassis = {};
            }
            if (action == 'edit') {
                $scope.noBillCert.Chassises[index] = angular.copy($scope.rowChassis);
                $scope.editChassis[index] = false;
            }
        }

        $scope.deleteChassis = function (index) {
            $scope.noBillCert.Chassises.splice(index, 1);
        }
        // Add/Edit Chassis --> END

        // Add/Edit SealNo. --> START
        $scope.resetSealEditedIndex = function () {
            $scope.editSeal = [];
            angular.forEach($scope.noBillCert.Seals, function (value, key) {
                $scope.editSeal[key] = false;
            });
        }

        $scope.addNewSeal = function () {
            $scope.isAddNewSeal = true;
            $scope.rowSeal = {};
            $scope.resetSealEditedIndex();
        }

        $scope.editSeal = function (seal, index) {
            $scope.resetChassisEditedIndex();
            $scope.isAddNewSeal = false;
            $scope.rowSeal = angular.copy(seal);
            $scope.editSeal[index] = true;
        }
        $scope.cancelSealSave = function (action, seal, index) {
            $scope.isAddNewSeal = false;
            if (action == 'edit') {
                $scope.editSeal[index] = false;
                $scope.rowSeal = angular.copy(seal);
            }
        }
        $scope.saveSeal = function (action, index) {
            $scope.isAddNewSeal = false;
            if (action == 'add') {
                $scope.noBillCert.Seals.unshift($scope.rowSeal);
                $scope.rowSeal = {};
            }
            if (action == 'edit') {
                $scope.noBillCert.Seals[index] = angular.copy($scope.rowSeal);
                $scope.editSeal[index] = false;
            }
        }

        $scope.deleteSeal = function (index) {
            $scope.noBillCert.Seals.splice(index, 1);
        }
        // Add/Edit SealNo. --> END

        // Validate NoBillEECert form --> START
        $scope.validateNoBillEEForm = function () {
            var selectedEEAgent = $scope.selectedCargoAgent && $scope.selectedCargoAgent.originalObject ? $scope.selectedCargoAgent.originalObject.Code + $scope.selectedCargoAgent.originalObject.NameEnglish + $scope.selectedCargoAgent.originalObject.NameArabic : '';
            $scope.isValidEEAgent = $scope.cargoAgentModel && (selectedEEAgent == 0 || ($scope.cargoAgentModel.replace(/\s/g, '') != selectedEEAgent.replace(/\s/g, ''))) ? false : true;

            var selectedEEImporter = $scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject ? $scope.selectedImporterExporterCode.originalObject.Code + $scope.selectedImporterExporterCode.originalObject.EnglishName + $scope.selectedImporterExporterCode.originalObject.ArabicName : '';
            $scope.isValidEEImporter = $scope.eeImporterModel && (selectedEEImporter == 0 || $scope.eeImporterModel.replace(/\s/g, '') != selectedEEImporter.replace(/\s/g, '')) ? false : true;

            var selectedEECountryExp = $scope.selectedOriginCountry && $scope.selectedOriginCountry.originalObject ? $scope.selectedOriginCountry.originalObject.Code + $scope.selectedOriginCountry.originalObject.EnglishName + $scope.selectedOriginCountry.originalObject.ArabicName : '';
            $scope.isValidEECountryExp = $scope.eeCountryExpModel && (selectedEECountryExp == 0 || $scope.eeCountryExpModel.replace(/\s/g, '') != selectedEECountryExp.replace(/\s/g, '')) ? false : true;
               
            var selectedEECountryDest = $scope.selectedDestCountry && $scope.selectedDestCountry.originalObject ? $scope.selectedDestCountry.originalObject.Code + $scope.selectedDestCountry.originalObject.EnglishName + $scope.selectedDestCountry.originalObject.ArabicName : '';
            $scope.isValidEEDestCountry = $scope.eeCountryDestModel && (selectedEECountryDest == 0 || ($scope.eeCountryDestModel.replace(/\s/g, '') != selectedEECountryDest.replace(/\s/g, ''))) ? false : true;

            $scope.isValidNoBillEEForm = $scope.isValidEEAgent && $scope.isValidEEImporter && $scope.isValidEECountryExp && $scope.isValidEEDestCountry ? true : false;
            return $scope.isValidNoBillEEForm;
        }

        // Validate NoBillEECert form --> END


        // SAVE NOBillEECert Details --> START

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
                    $window.location.reload();
                }
            });
        }

        $scope.saveNoBillEECert = function () {
            $("#loadingScreen").show();
            if ($scope.validateNoBillEEForm()) {
                $scope.noBillCert.centerCode = $stateParams.centerCode;
                $scope.noBillCert.ExitEntryDetail.EEAgent = $scope.selectedCargoAgent ? $scope.selectedCargoAgent.originalObject.Code : '';
                $scope.noBillCert.ExitEntryDetail.EEImporter = $scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject.Code ? $scope.selectedImporterExporterCode.originalObject.Code.toString() : '';
                $scope.noBillCert.ExitEntryDetail.EECountry = $scope.selectedOriginCountry ? $scope.selectedOriginCountry.originalObject.Code : '';
                $scope.noBillCert.ExitEntryDetail.EEDestCountry = $scope.selectedDestCountry ? $scope.selectedDestCountry.originalObject.Code : '';

                apiService.post('Customs/Job/ExitEntryNoBill', '', $scope.noBillCert, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    if (response.IsValid) {
                        $scope.EENumber = (response && response.Data) ? response.Data.ECCNumber : '';
                        var msg = 'Done Successfully! Generated Number is ' + '<b>' + $scope.EENumber + '</b>';
                        showConfirmMessage(msg);
                    }
                    else if (!response.IsValid) {
                        //showErrorMessage(msg);
                    }
                    console.log(response);
                },
                        function (result) {
                            $("#loadingScreen").hide();
                            console.log("An Error has occurred!");
                            console.log(result);
                        });
            }
            else { $("#loadingScreen").hide(); return; }
        }

        // SAVE NOBillEECert Details --> START

        // Validate NoBillExitCert service availability

        function showServiceValidationService(msg) {
            swal({
                title: '',
                text: msg + "!",
                confirmButtonColor: "#EF5350",
                confirmButtonText: $filter('translate')('ok'),
                type: "error",
                closeOnConfirm: true,
                html: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    $state.go('dashboard', { notify: true });
                }
            });
        }

        $scope.validateNoBillEECert = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/job/ValidateUserExitEntry', { centerCode: $stateParams.centerCode },
                    function (results) {
                        $("#loadingScreen").hide();
                        var response = results.data.ResponseResult;
                        if (response.Messages != null && !response.IsValid) {
                            var errorMsg = "NoBillExitEntrtyCertificate service not available"
                            showServiceValidationService(errorMsg);                            
                        }
                        else {
                            $scope.init();
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log('something went wrong in LoadLookupCentreCodes' + response);
                    });
        }

        // on page init
        $scope.init = function () {            
            $scope.getCargoAgents();
            $scope.getEECountryExp();
            $scope.getEmiratesLookupData();
            $scope.getEEBillTypes();
        }

        // Validate NoBillEECert service
        $scope.validateNoBillEECert();

    }]);