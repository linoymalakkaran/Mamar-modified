angular.module('mamarApp').controller('shortCustomManifestDetailController',
    [
        '$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter', '$log', '$storage', '$timeout', 'paginationService',
        'userAccountStorageFactory',
        function ($scope, $rootScope, $http, $state, $stateParams, apiService, sharedModels, $filter, $log, $storage, $timeout, paginationService, userAccountStorageFactory) {

            $scope.$storage = $storage;
            $scope.customManifest = {};
            $scope.customValidationField = {};

            $scope.selectedCenterCode = $stateParams.centerCode;
            $scope.selectedShortCustomTransportMode = $stateParams.transportMode;
            var custManifestCenter = $storage.get('shortCustomCenterCode');
            $scope.shortCustomCenterCode = (custManifestCenter && custManifestCenter.length > 0) ? custManifestCenter[0].Code + ' ' + custManifestCenter[0].EnglishName + ' ' + custManifestCenter[0].ArabicName : $stateParams.centerCode;
            var custManifestTransMode = $storage.get('shortCustomTransMode');
            $scope.shortCustomTransMode = (custManifestTransMode && custManifestTransMode.length > 0) ? custManifestTransMode[0].key + ' ' + custManifestTransMode[0].value : $stateParams.transportMode;

            $scope.serviceUnavailable = false;

            function resetValidationErrorMessages() {
                $scope.Valid = true;
                $scope.fromCountryValid = true;
                $scope.destinationCountryValid = true;
                $scope.importerExporterValid = true;
                $scope.portValid = true;
                $scope.unitValid = true;
                $scope.originValid = true;
                $scope.hsCodeValid = true;
                $scope.currencyValid = true;
            }

            initializeShortManifest();

            function initializeShortManifest() {

                resetValidationErrorMessages();

                apiService.get('Customs/Manifest/initializeShortManifest',
                    {
                        centerCode: $scope.selectedCenterCode,
                    },
                    function (results) {
                        if (results.data != null && results.data.ResponseResult.IsValid) {
                            initialLoadData();
                        }
                        else {
                            $scope.serviceUnavailable = true;
                            showErrorMessage("Service not available");
                            return false;
                        }
                    },
                    function error(response) {
                        $scope.serviceUnavailable = true;
                        showErrorMessage("Service not available");
                        return false;
                    });
            };
           
            $scope.billTypeChange = function () {

                resetValidationErrorMessages();

                var billTypeSelected = $scope.customManifest ? angular.copy($scope.customManifest.billType):'';
                $scope.customManifest = {};
                $scope.customManifest.billType = billTypeSelected;
                var shrManifest = $scope.customManifest;
                shrManifest.Quantity = 1;

                $scope.selectedUnit = {};
                $scope.selectedUnit.originalObject = {};
                $scope.selectedUnit.originalObject.Code = "UNT";
                $scope.selectedUnit.originalObject.EnglishName = "UNIT";
                $scope.selectedUnit.originalObject.ArabicName = "وحدة ، مجموعة متكاملة";
                $scope.customManifest.Unit = shrManifest.Unit = $scope.selectedUnit.originalObject.Code + '  ' + $scope.selectedUnit.originalObject.EnglishName + '  ' + $scope.selectedUnit.originalObject.ArabicName;

                if (shrManifest.billType == "I" || shrManifest.billType == "N") {
                    shrManifest.emara = "A";
                    $scope.isFromEmara = false;
                }
                else if (shrManifest.billType == "E" ||
                    shrManifest.billType == "R" ||
                    shrManifest.billType == "T" ||
                    shrManifest.billType == "O") {
                    shrManifest.emara = "X";
                    $scope.isFromEmara = true;
                    if (shrManifest.billType == "T") {
                        $scope.isFromEmara = false;
                    }
                }
                mandatoryFieldSet();
            }

            function mandatoryFieldSet() {
                var fieldObj = $scope.customValidationField;
                var shrManifest = $scope.customManifest;
                if (shrManifest.billType == "I" || shrManifest.billType == "N") {
                    fieldObj.isFromReq = true;
                    fieldObj.isOriginReq = true;
                }
                else if (shrManifest.billType == "E") {
                    fieldObj.isDesReq = true;
                }
                else if (shrManifest.billType == "R" || shrManifest.billType == "T" || shrManifest.billType == "O") {
                    fieldObj.isFromReq = true;
                    fieldObj.isDesReq = true;
                    fieldObj.isOriginReq = true;
                }
            }
          
            $scope.ImporterExporterChanged = function (searchStr) {
                if (searchStr && searchStr.length >= 3) {
                    apiService.get('Customs/Lookup/ImporterExporter',
                        {
                            centerCode: $scope.selectedCenterCode,
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
            function populateUnits() {
                getIndexData('Units', '', function (data) {
                    $scope.units = data;
                }, function () {
                    apiService.get('Customs/Lookup/Units',
                        {
                            centerCode: $scope.selectedCenterCode,
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
           
            function getEmiratesLookupData() {
                getIndexData('emirates', '', function (data) {
                    $scope.emirates = data;
                }, function () {
                    apiService.get('Customs/Lookup/Emirates',
                        {
                            centerCode: $scope.selectedCenterCode,
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

            function GetOrigin() {
                apiService.get('Customs/Lookup/ShipmentCountries',
                    {
                        centerCode: $scope.selectedCenterCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.country = results.data.ResponseResult.Data;
                        $scope.destCountry = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                    });
            }
             
            function populateCurrencyModel() {
                    apiService.get('Customs/Lookup/Currencies',
                        {
                            centerCode: $scope.selectedCenterCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.currencyList = results.data.ResponseResult.Data;
                        },
                        function error(response) {
                            //modalErrorShow("An Error has occurred while getting lookup Data!");
                        });
            }

            //Importer Exporter Lookup Next Page Click
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.PopulateImporterExporters();
            }

            ///////
            $scope.gotoList = function () {
                $state.go('shortCustManifestList', {
                }, { reload: true, notify: true });
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
                        $scope.gotoList();
                    }
                });
            }

            function validateLookups() {

                resetValidationErrorMessages();

                var fromCountrySelected = $scope.selectedOriginCountry && $scope.selectedOriginCountry.originalObject && $scope.selectedOriginCountry.originalObject.Code ? $scope.selectedOriginCountry.originalObject.Code + $scope.selectedOriginCountry.originalObject.EnglishName + $scope.selectedOriginCountry.originalObject.ArabicName : '';
                if (($scope.customManifest.From || fromCountrySelected) && ($scope.customManifest.From.replace(/\s/g, '') != fromCountrySelected.replace(/\s/g, '')))  {
                    $scope.fromCountryValid = false;
                    $scope.Valid = false;
                }

                var destinationCountrySelected = $scope.selectedDestinationCountry && $scope.selectedDestinationCountry.originalObject && $scope.selectedDestinationCountry.originalObject.Code ? $scope.selectedDestinationCountry.originalObject.Code + $scope.selectedDestinationCountry.originalObject.EnglishName + $scope.selectedDestinationCountry.originalObject.ArabicName : '';
                if (($scope.customManifest.To || destinationCountrySelected) && ($scope.customManifest.To.replace(/\s/g, '') != destinationCountrySelected.replace(/\s/g, ''))) {
                    $scope.destinationCountryValid = false;
                    $scope.Valid = false;
                }

                var importerExporterSelected = $scope.selectedImporterExporterCode && $scope.selectedImporterExporterCode.originalObject && $scope.selectedImporterExporterCode.originalObject.Code ? $scope.selectedImporterExporterCode.originalObject.Code + $scope.selectedImporterExporterCode.originalObject.EnglishName + $scope.selectedImporterExporterCode.originalObject.ArabicName : '';
                if (($scope.customManifest.Importer || importerExporterSelected) && ($scope.customManifest.Importer.replace(/\s/g, '') != importerExporterSelected.replace(/\s/g, ''))) {
                    $scope.importerExporterValid = false;
                    $scope.Valid = false;
                }

                var portSelected = $scope.selectedPortCodeObj && $scope.selectedPortCodeObj.originalObject && $scope.selectedPortCodeObj.originalObject.PortCode ? $scope.selectedPortCodeObj.originalObject.PortCode + $scope.selectedPortCodeObj.originalObject.PortName + $scope.selectedPortCodeObj.originalObject.CountryName : '';
                if (($scope.customManifest.selectedPortCode || portSelected) && ($scope.customManifest.selectedPortCode.replace(/\s/g, '') != portSelected.replace(/\s/g, ''))) {
                    $scope.portValid = false;
                    $scope.Valid = false;
                }

                var unitSelected = $scope.selectedUnit && $scope.selectedUnit.originalObject && $scope.selectedUnit.originalObject.Code ? $scope.selectedUnit.originalObject.Code + $scope.selectedUnit.originalObject.EnglishName + $scope.selectedUnit.originalObject.ArabicName : '';
                if (($scope.customManifest.Unit || unitSelected) && ($scope.customManifest.Unit.replace(/\s/g, '') != unitSelected.replace(/\s/g, ''))) {
                    $scope.unitValid = false;
                    $scope.Valid = false;
                }

                var originSelected = $scope.selectedCountryObj && $scope.selectedCountryObj.originalObject && $scope.selectedCountryObj.originalObject.Code ? $scope.selectedCountryObj.originalObject.Code + $scope.selectedCountryObj.originalObject.EnglishName + $scope.selectedCountryObj.originalObject.ArabicName : '';
                if (($scope.customManifest.selectedCountry || originSelected) && ($scope.customManifest.selectedCountry.replace(/\s/g, '') != originSelected.replace(/\s/g, ''))) {
                    $scope.originValid = false;
                    $scope.Valid = false;
                }

                var hsCodeSelected = $scope.selectedHarmCodeObj && $scope.selectedHarmCodeObj.originalObject && $scope.selectedHarmCodeObj.originalObject.HarmCodeShort ? $scope.selectedHarmCodeObj.originalObject.HarmCodeShort + $scope.selectedHarmCodeObj.originalObject.HarmShortEng + $scope.selectedHarmCodeObj.originalObject.HarmShortArb : '';
                if (($scope.customManifest.selectedHarmCode || hsCodeSelected) && ($scope.customManifest.selectedHarmCode.replace(/\s/g, '') != hsCodeSelected.replace(/\s/g, ''))) {
                    $scope.hsCodeValid = false;
                    $scope.Valid = false;
                }

                var currencySelected = $scope.selectedCurrencyObj && $scope.selectedCurrencyObj.originalObject && $scope.selectedCurrencyObj.originalObject.Code ? $scope.selectedCurrencyObj.originalObject.Code + $scope.selectedCurrencyObj.originalObject.NameEnglish + $scope.selectedCurrencyObj.originalObject.NameArabic : '';
                if (($scope.customManifest.selectedCurrency || currencySelected) && ($scope.customManifest.selectedCurrency.replace(/\s/g, '') != currencySelected.replace(/\s/g, ''))) {
                    $scope.currencyValid = false;
                    $scope.Valid = false;
                }
            }

            $scope.postCustomManifestData = function () {

                validateLookups();

                if (!$scope.Valid)
                    return;

                var objCustom = angular.copy($scope.customManifest);
                objCustom.centerCode = $scope.selectedCenterCode;
                objCustom.Unit = ($scope.selectedUnit && $scope.selectedUnit.originalObject) ? $scope.selectedUnit.originalObject.Code : '';
                if (typeof $scope.selectedOriginCountry != "undefined") {
                    objCustom.fromCountryCode = $scope.selectedOriginCountry.originalObject.Code;
                }
                if (typeof $scope.selectedDestinationCountry != "undefined") {
                    objCustom.destCountryCode = $scope.selectedDestinationCountry.originalObject.Code;
                }
                if (typeof $scope.selectedImporterExporterCode != "undefined") {
                    objCustom.importerCode = $scope.selectedImporterExporterCode.originalObject.Code;
                }
                if (typeof $scope.selectedPortCodeObj != "undefined") {
                    objCustom.port = $scope.selectedPortCodeObj.originalObject.PortCode;
                }
                if (typeof $scope.selectedUnit != "undefined") {
                    objCustom.uomCode = $scope.selectedUnit.originalObject.Code;
                }
                if (typeof $scope.selectedCountryObj != "undefined") {
                    objCustom.originCountryCode = $scope.selectedCountryObj.originalObject.Code;
                }
                if (typeof $scope.selectedHarmCodeObj != "undefined") {
                    //objCustom.harmCode = $scope.selectedHarmCodeObj.originalObject.HarmCodeShort; //As per PL Sql Team used full harm code instead of short
                    objCustom.harmCode = $scope.selectedHarmCodeObj.originalObject.HarmCode;
                }
                if (typeof $scope.selectedCurrencyObj != "undefined") {
                    objCustom.bdInvoiceCurrency = $scope.selectedCurrencyObj.originalObject.Code;
                }
                objCustom.cbiQuantity = objCustom.quantity;
                objCustom.cbiWeight = objCustom.netGross;
                $("#loadingScreen").show();
                apiService.post('Customs/Manifest/CreateShortManifest','',objCustom,
                    function (result) {
                        console.log(result);
                        if (result.data.ResponseResult.IsValid) {
                            var obj = result.data.ResponseResult.Messages.split("Job Number : ")[1];
                            $scope.jobNo =  objCustom.jobNumber = obj.split(" ")[0];
                            $("#loadingScreen").hide();
                            var createJobsuccessMsg = $filter('translate')('BillCreateSuccessMsg') + '<b>' + $scope.jobNo + '</b>';
                            showConfirmMessage(createJobsuccessMsg);
                        }
                        else {
                            $("#loadingScreen").hide();
                            var message = (result && result.data && result.data.ResponseResult && result.data.ResponseResult.Messages) ? result.data.ResponseResult.Messages : "An Error has occurred while saving the data!";
                            modalErrorShow(message);
                        }
                    },
                    function (error) {
                        $("#loadingScreen").hide();
                        console.log(error);
                    });
            }
            var LoadLookupBillType = function () {
                var opt = {};
                opt.Code = '';
                opt.NameEnglish = '--Select--';
                opt.NameArabic = '--الشحن--';

                $scope.lkBillTypeParameter = {
                    centerCode: $scope.selectedCenterCode,
                    searchString: ''
                };
                apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParameter, function (results) {

                    $scope.lookupBillTpResult = angular.copy(results.data.ResponseResult.Data);
                    storeData(results.data.ResponseResult.Data, 'billTypes', $scope.selectedCenterCode);
                    if ($scope.lookupBillTpResult) {
                        $scope.lookupBillTpResult.unshift(opt);
                    }
                },
                function error(response) {
                    console.log(response);
                });
            }

            function populateShipmentCountriesModel() {
                getIndexData('ShipmentCountry', '', function (data) {
                    $scope.countryList = data;
                }, function () {
                    apiService.get('Customs/Lookup/ShipmentCountries',
                        {
                            centerCode: $scope.selectedCenterCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.countryList = results.data.ResponseResult.Data;
                            storeData($scope.countryList, 'ShipmentCountry', '');
                        },
                        function error(response) {
                        });
                });
            }
            function populateCurrencyModel() {
                getIndexData('CurrencyModel', '', function (data) {
                    $scope.currencyList = data;
                }, function () {
                    apiService.get('Customs/Lookup/Currencies',
                        {
                            centerCode: $scope.selectedCenterCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.currencyList = results.data.ResponseResult.Data;
                            storeData($scope.currencyList, 'CurrencyModel', '');
                        },
                        function error(response) {
                        });
                });
            }

            function populateHarmonized() {

                if (!$scope.harmonizedCodes) {
                    getIndexData('CustHarmCode', '', function (data) {
                        $scope.harmonizedCodes = $scope.harmonisedList = $scope.fullHarmonisedList = data
                    }, function () {
                            apiService.get('Customs/Lookup/ShortManifestHarmTypes',
                            {
                                centerCode: $scope.selectedCenterCode,
                                searchString: '',
                            },
                            function (results) {
                                $scope.lookUpCurrentPage = 1;
                                $scope.harmonizedCodes = $scope.harmonisedList = $scope.fullHarmonisedList = results.data.ResponseResult.Data;
                                storeData(results.data.ResponseResult.Data, 'CustHarmCode', '');
                            },
                            function error(response) {
                                console.log(response);
                            });
                    }); 
                }
            }

            function populatePort() {

                if (!$scope.portCodes) {
                    getIndexData('CustPortCode', '', function (data) {
                        $scope.portCodes = $scope.portList = $scope.fullportList = data
                    }, function () {
                            apiService.get('Customs/Lookup/ShortManifestPort',
                            {
                                centerCode: $scope.selectedCenterCode,
                                searchString: '',
                            },
                            function (results) {
                                $scope.lookUpCurrentPage = 1;
                                $scope.portCodes = $scope.portList = $scope.fullportList = results.data.ResponseResult.Data;
                                storeData(results.data.ResponseResult.Data, 'CustPortCode', '');
                            },
                            function error(response) {
                                console.log(response);
                            });
                    });
                }
            }

            $scope.openHarmonizeLookup = function (item) {
                $("#searchText").val('');
                $scope.searchText = '';
                $scope.recordToEdit = item;
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
            $scope.searchText = '';
            $scope.onHarmonizeChange = function () {
                $scope.rowIndex = 0;
                $scope.searchText = $("#searchText").val().toLowerCase();
                $scope.lookUpCurrentPage = 1;
                if ($scope.fullHarmonisedList) {
                    $scope.harmonisedList = $scope.fullHarmonisedList.filter(obj => {
                        return obj.HarmCodeShort.includes($scope.searchText) || (obj.HarmShortEng && obj.HarmShortEng.toLowerCase().includes($scope.searchText))
                            || (obj.HarmShortArb && obj.HarmShortArb.toLowerCase().includes($scope.searchText));
                    });
                }
                else {
                    $scope.populateHarmonized();
                }
                $scope.HarmonizedRequired = false;
            }

            $scope.setHarmonized = function (row) {
                if ($scope.recordToEdit) {
                    $scope.selectedHarmCodeEdit[$scope.recordToEdit] = row.HarmCodeShort + " " + row.HarmShortEng + " " + row.HarmShortArb;
                    $scope.selectedHarmCodeObjEdit[$scope.recordToEdit] = {};
                    $scope.selectedHarmCodeObjEdit[$scope.recordToEdit].originalObject = row;
                }
                else {
                    $scope.customManifest.selectedHarmCode = row.HarmCodeShort + " " + row.HarmShortEng + " " + row.HarmShortArb;
                    $scope.selectedHarmCodeObj = {};
                    $scope.selectedHarmCodeObj.originalObject = row;
                }

                $("#harmonizeLookup").modal("hide");
                $("#harmonizedLookup_value").attr("tabindex", "1");
                $('#harmonizedLookup_value').focus();
            }


            $scope.openPortLookup = function (item) {
                $("#searchText").val('');
                $scope.searchText = '';
                $scope.recordToEdit = item;
                $('#portLookup').modal({
                    backdrop: "static"
                });
                $('#searchText').focus();
                $('#searchText').select();
                $scope.onPortChange();
                $("#portLookup").off("keydown");
                $('#portLookup').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 40:
                                if ($scope.rowIndex < $scope.portList.length - 1) {
                                    $scope.rowIndex++;
                                    if ($scope.rowIndex > 10 * $scope.lookUpCurrentPage - 1) {
                                        $scope.lookUpCurrentPage++;
                                    }
                                    $scope.portSelected = $scope.portList[$scope.rowIndex];
                                }
                                break;
                            case 38:
                                if ($scope.rowIndex > 0) {

                                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                                        $scope.lookUpCurrentPage--;
                                    }
                                    $scope.rowIndex--;
                                    $scope.portSelected = $scope.portList[$scope.rowIndex];
                                }
                                break;
                            case 13:
                                $scope.setPort($scope.portSelected);
                                break;
                        }
                    });
                });
            }


            $scope.setPort = function (row) {

                $scope.customManifest.selectedPortCode = row.PortCode + " " + row.PortName + " " + row.CountryName;
                $scope.selectedPortCodeObj = {};
                $scope.selectedPortCodeObj.originalObject = row;

                $("#portLookup").modal("hide");
                $("#portsLookup_value").attr("tabindex", "11");
                $('#portsLookup_value').focus();
            }

            $scope.onPortChange = function () {
                $scope.rowIndex = 0;
                $scope.searchText = $scope.searchText ? $scope.searchText.toLowerCase() : ''; // $("#searchText").val().toLowerCase();
                $scope.lookUpCurrentPage = 1;
                if ($scope.portList) {
                    $scope.portList = $scope.fullportList.filter(obj => {
                        return obj.PortCode.includes($scope.searchText) || (obj.PortName && obj.PortName.toLowerCase().includes($scope.searchText))
                            || (obj.CountryName && obj.CountryName.toLowerCase().includes($scope.searchText));
                    });
                }
                else {
                    $scope.populatePort();
                }
                $scope.portRequired = false;
            }

            $scope.portCodeKeyDown = function (event, item) {
                if (event.key == 'F9') {
                    $scope.openPortLookup(item);
                }
            }

            $scope.harmonizedCodeKeyDown = function (event, item) {
                if (event.key == 'F9') {
                    $scope.openHarmonizeLookup(item);
                }
            }

            $scope.lookupKeyDown = function (event, lookupId) {
                if (event.key == 'F9') {
                    $scope.openLookup(lookupId);
                }
            }



            $scope.openLookup = function (lookupId) {
                $("#searchLookupText").val("");
                $timeout(function () {
                    $scope.lookupId = lookupId;
                    var modelName =""
                    switch (lookupId) {
                        case 'From':
                            $scope.lookUpTitle = $filter("translate")("From");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.country;
                            break;
                        case 'To':
                            $scope.lookUpTitle = $filter("translate")("To");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.country;
                            break;
                        case 'Units':
                            $scope.lookUpTitle = $filter("translate")("Unit");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.units;
                            break;
                        case 'OriginCountry':
                            $scope.lookUpTitle = $filter("translate")("OriginCountry");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                            $scope.lookUpData = $scope.countryList;
                            break;
                        case 'Currency':
                            $scope.lookUpTitle = $filter("translate")("Currency");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }, { Text: "Rate", Width: "" }];
                            $scope.lookUpData = $scope.currencyList;
                            break;
                            
                    }

                    $scope.searchLookupTextModel = '';
                    $("#genericLookUp").modal({
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
                    if (paginationService.isRegistered("lookUpPager")) {
                        paginationService.setCurrentPage("lookUpPager", 1);
                    }
                    $scope.lookUpCurrentPage = 1;
                });
            }
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'From':
                        $scope.customManifest.From = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedOriginCountry = {};
                        $scope.selectedOriginCountry.originalObject = row;
                        $('#From_value').focus();
                        break;
                    case 'To':
                        //$scope.customManifest.Destination = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        //$scope.selectedDestCountry = {};
                        //$scope.selectedDestCountry.originalObject = row;
                        $scope.customManifest.To = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedDestinationCountry = {};
                        $scope.selectedDestinationCountry.originalObject = row;
                        $('#Destination_value').focus();
                        break;
                    case 'Units':
                        $scope.customManifest.Unit = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedUnit = {};
                        $scope.selectedUnit.originalObject = row;
                        $('#Unit_value').focus();
                        break;
                    case 'OriginCountry':
                        $scope.customManifest.selectedCountry = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedCountryObj = {};
                        $scope.selectedCountryObj.originalObject = row;
                        $('#originCountry_value').focus();
                        break;
                    case 'Currency':
                        $scope.customManifest.selectedCurrency = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                        $scope.selectedCurrencyObj = {};
                        $scope.selectedCurrencyObj.originalObject = row;
                        $('#currency_value').focus();
                        break;
                  
                }
                $("#genericLookUp").modal("hide");
                $("#customDestFormLookUp").modal("hide");
            }
            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'From':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.country) {
                                $scope.lookUpData = $scope.country.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                        case 'To':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.destCountry) {
                                $scope.lookUpData = $scope.destCountry.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
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
                        case 'OriginCountry':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.countryList) {
                                $scope.lookUpData = $scope.countryList.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                        case 'Currency':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.currencyList) {
                                $scope.lookUpData = $scope.currencyList.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.NameEnglish && obj.NameEnglish.toLowerCase().includes(searchText))
                                        || (obj.NameArabic && obj.NameArabic.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                       
                    }
                });
            }

            $scope.openImporterExporterLookup = function () {
                GetCategoryCodes();
                $scope.clearSearchFilters();
                $('#importerExporterLookup').modal({
                    backdrop: "static"
                });
            }
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
                    centerCode: $scope.selectedCenterCode
                };
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
                        centerCode: $scope.selectedCenterCode,
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
                $scope.customManifest.Importer = row.ImporterCode.toString() + "     " + (row.ImporterDescEng ? row.ImporterDescEng : '') + "     " + (row.ImporterDescArb ? row.ImporterDescArb : '');
                $scope.selectedImporterExporterCode = {};
                $scope.selectedImporterExporterCode.originalObject = {};
                $scope.selectedImporterExporterCode.originalObject.Code = row.ImporterCode;
                $scope.selectedImporterExporterCode.originalObject.EnglishName = row.ImporterDescEng;
                $scope.selectedImporterExporterCode.originalObject.ArabicName = row.ImporterDescArb;
                $scope.selectedImporterExporterCode.originalObject.CategoryCode = row.ImporterCategoryCode;
                $("#importerExporterLookup").modal("hide");
                $('#ImporterExporter_value').focus();
            }
            $scope.importerExporterKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.clearSearchFilters();
                    $scope.openImporterExporterLookup();
                }
            }

            $scope.$watchCollection("customManifest.Importer", function () {
                if (!$scope.customManifest.Importer) {
                    $scope.selectedImporterExporterCode = {};
                    $scope.selectedImporterExporterCode.originalObject = {};
                    $scope.selectedImporterExporterCode.originalObject.Code = null;
                    $scope.selectedImporterExporterCode.originalObject.EnglishName = null;
                    $scope.selectedImporterExporterCode.originalObject.ArabicName = null;
                    $scope.selectedImporterExporterCode.originalObject.CategoryCode = null;
                }
            });
            function initialLoadData() {
                LoadLookupBillType();
                getEmiratesLookupData();
                GetOrigin();
                populateUnits();
                populateCurrencyModel();
                populateShipmentCountriesModel();
                populateHarmonized();
                populatePort();
                $scope.clearSearchFilters();

                $scope.customManifest.billType = '';
                $scope.isFromEmara = false;
            }

        }
    ]);