angular.module('mamarApp').controller('invoiceGrpnDetailsController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$uibModal', 'exemptionEntryGroupInfoService', 'sharedModels', '$anchorScroll', '$location', '$filter', '$timeout', 'paginationService',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $uibModal, exemptionEntryGroupInfoService, sharedModels, $anchorScroll, $location, $filter, $timeout, paginationService) {

        $scope.$storage = $storage;

        $scope.jobNumber = $stateParams.jobNumber;
        $scope.centerCode = $stateParams.centerCode;
        //var selectedMode = $stateParams.selectedMode;

        $anchorScroll.yOffset = -100;
        //#Invoice Details 
        $scope.validHarmCode = true;
        $scope.validOriginExporter = true;
        $scope.validItemType = true;

        $scope.isBusy = false;
        $scope.showOtherDesc = false;
        $scope.hsCodeShowOtherDesc = false;
        $scope.otherDescValid = true;
        $scope.savedSuccess = false;
        $scope.globalDisableFlagLocal = $rootScope.globalDisableFlag;
        $scope.invoiceLoader = false;
        $scope.ftaHSCodeMandatory = false;
        $scope.enableOtherDesc = true;
        $scope.itemTypeEdited = false;
        $scope.originalFTASerialNo = '';
        $scope.originalFTAEng = '';
        //$scope.prevftaHasOther = false;
        $scope.withOtherPrefix = true;
        //#Invoice Details 

        $scope.custBillInfo = {};
        $scope.invoiceGrps = [];
        $scope.calculatedFreight = "";
        $scope.isValidInvGrpForm = $scope.isValidCountry = $scope.isValidCurrency = $scope.isValidFreightCurrency = $scope.isValidInvNo = true;
        $scope.isAgreementDisabled = false;

        // lookups initialization --> INVOICE GROUP
        $scope.selectedCountry = '';
        $scope.selectedCurrency = '';
        $scope.selectedFreightCurrency = '';

        //***** lookup selected Obj ****
        $scope.selectedCountryObj = {};
        $scope.selectedCountryObj.originalObject = {};
        $scope.selectedCountryObj.originalObject.Code = null;
        $scope.selectedCountryObj.originalObject.EnglishName = null;
        $scope.selectedCountryObj.originalObject.ArabicName = null;

        $scope.selectedCurrencyObj = {};
        $scope.selectedCurrencyObj.originalObject = {};
        $scope.selectedCurrencyObj.originalObject.Code = null;
        $scope.selectedCurrencyObj.originalObject.NameEnglish = null;
        $scope.selectedCurrencyObj.originalObject.NameArabic = null;
        $scope.selectedCurrencyObj.originalObject.Rate = null;

        $scope.selectedFreightCurrencyObj = {};
        $scope.selectedFreightCurrencyObj.originalObject = {};
        $scope.selectedFreightCurrencyObj.originalObject.Code = null;
        $scope.selectedFreightCurrencyObj.originalObject.NameEnglish = null;
        $scope.selectedFreightCurrencyObj.originalObject.NameArabic = null;
        $scope.selectedFreightCurrencyObj.originalObject.Rate = null;

        // END

        $scope.parameters = {
            centerCode: $scope.centerCode,
            jobNumber: $scope.jobNumber,
            OldJobNumber: ''
        };

        $scope.invoiceGroupAggregateData = {
            TotalFreightAmount: 0,
            TotalInvoiceAmount: 0,
            TotalInvoiceWeight: 0,
            TotalAmountCIF: 0,
            ToatlDutyAmount: 0,
        }

        //Method to set/reset global disable flag
        function setGlobalDisableFlag() {
            if ($scope.custBillInfo) {
                $storage.set('voucherFlag', ($scope.custBillInfo.VoucherFlag == 'Y' ? true : false));
                $storage.set('globalDisableFlag', ($scope.custBillInfo.OGAPresent > 0 ? true : false));
            }
        }

        function SetInvoiceGroupData(retrievedData) {
            $scope.invoiceGrps = retrievedData.InvoiceGroups;
            $scope.custBillInfo = retrievedData.CustomBillInfo;
            setGlobalDisableFlag();

            if ($scope.custBillInfo != null) {
                $scope.currentYear = $scope.custBillInfo.CurrentYear;
                $scope.custBillType = $scope.custBillInfo.CustBillType;
                $scope.custBillNo = $scope.custBillInfo.CustBillNumber;
                $scope.invoiceCenterCode = $scope.custBillInfo.CenterCode;
            }

            if ($scope.invoiceGrps) {
                $scope.invoiceGroupAggregateData = {
                    TotalFreightAmount: 0,
                    TotalInvoiceAmount: 0,
                    TotalInvoiceWeight: 0,
                    TotalAmountCIF: 0,
                    ToatlDutyAmount: 0,
                }
                $scope.invoiceGrps.forEach(function (invoiceGroupItem) {
                    $scope.invoiceGroupAggregateData.TotalFreightAmount += invoiceGroupItem.FreightAmount || 0;
                    $scope.invoiceGroupAggregateData.TotalInvoiceAmount += invoiceGroupItem.InvoiceAmount || 0;
                    $scope.invoiceGroupAggregateData.TotalInvoiceWeight += invoiceGroupItem.InvoiceWeight || 0;
                    $scope.invoiceGroupAggregateData.TotalAmountCIF += invoiceGroupItem.AmountCIF || 0;
                    $scope.invoiceGroupAggregateData.ToatlDutyAmount += invoiceGroupItem.DutyAmount || 0;
                });
            }
        }

        function GetInvoiceGroupData(isfromInvDetails) {
            if (!isfromInvDetails) {
                $("#loadingInvoiceScreen").show();
            }
            apiService.get('Customs/Invoice/GetCustBillInfo', $scope.parameters, function (results) {
                $scope.invoiceGroupAggregateData = {
                    TotalFreightAmount: 0,
                    TotalInvoiceAmount: 0,
                    TotalInvoiceWeight: 0,
                    TotalAmountCIF: 0,
                    ToatlDutyAmount: 0,
                }
                var resultData = results.data.ResponseResult.Data;
                if (resultData != null) {
                    if (!isfromInvDetails) {
                        $("#loadingInvoiceScreen").hide();
                    }

                    SetInvoiceGroupData(resultData);
                }
                else { $("#loadingInvoiceScreen").hide(); }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    alert('something went wrong');
                    console.log(response);
                }, true);
        }

        // get country list
        $scope.onCountryChange = function (searchStr) {
            $scope.isValidCountry = true;
            $scope.selectedCountry = searchStr;
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCountry)) {
                //apiService.get('Customs/Lookup/ShipmentCountries',
                //{
                //    centerCode: $scope.centerCode,
                //    searchString: $scope.selectedCountry
                //},
                //function (results) {
                //    $scope.countryList = results.data.ResponseResult.Data;
                //},
                //function error(response) {
                //    console.log(response);
                //});
            }
            // else { $scope.countryList = null; $scope.selectedCountry = ''; }
        }

        function populateShipmentCountriesModel() {
            getIndexData('ShipmentCountry', '', function (data) {
                $scope.countryList = data;
            }, function () {
                apiService.get('Customs/Lookup/ShipmentCountries',
                    {
                        centerCode: $scope.centerCode,
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
        populateShipmentCountriesModel();

        // get currency list
        $scope.onCurrencyChange = function (searchStr) {
            $scope.isValidCurrency = true;
            $scope.selectedCurrency = searchStr;
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCurrency)) {
                //apiService.get('Customs/Lookup/Currencies',
                //{
                //    centerCode: $scope.centerCode,
                //    searchString: $scope.selectedCurrency
                //},
                //function (results) {
                //    $scope.currencyList = results.data.ResponseResult.Data;
                //},
                //function error(response) {
                //    console.log(response);
                //});
            }
            //else { $scope.currencyList = null; $scope.selectedCurrency = ''; }
        }

        // get freight currency list
        $scope.onFreightCurrencyChange = function (searchStr) {
            $scope.isValidFreightCurrency = true;
            $scope.selectedFreightCurr = searchStr;
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedFreightCurr)) {
                //apiService.get('Customs/Lookup/Currencies',
                //{
                //    centerCode: $scope.centerCode,
                //    searchString: $scope.selectedFreightCurr
                //},
                //function (results) {
                //    $scope.freightCurrencyList = results.data.ResponseResult.Data;
                //},
                //function error(response) {
                //    console.log(response);
                //});
            }
            // else { $scope.freightCurrencyList = null; $scope.selectedFreightCurr = ''; }
        }

        function populateCurrencyModel() {
            getIndexData('CurrencyModel', '', function (data) {
                $scope.currencyList = data;
                $scope.freightCurrencyList = data;
            }, function () {
                apiService.get('Customs/Lookup/Currencies',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.currencyList = results.data.ResponseResult.Data;
                        $scope.freightCurrencyList = results.data.ResponseResult.Data;
                        storeData($scope.currencyList, 'CurrencyModel', '');
                    },
                    function error(response) {
                        //modalErrorShow("An Error has occurred while getting lookup Data!");
                    });
            });
        }
        populateCurrencyModel();

        // get Terms of Shipment
        $scope.GetTermsofShipmentList = function () {
            apiService.get('Customs/Lookup/TermOfShipment', {
                centerCode: $scope.centerCode, searchString: ''
            }, function (results) {
                $scope.termsOfShipList = results.data.ResponseResult.Data;
                if ($scope.action == 'add') {
                    $scope.selectedInvGrp.FreightType = $scope.termsOfShipList[0].Value;
                }
            },
                function error(response) {
                    alert('something went wrong');
                    console.log(response);
                });
        }

        // get Agreement Type List
        $scope.GetAgreementList = function (ExemptionCode) {
            apiService.get('Customs/Lookup/AgreementType', {
                centerCode: $scope.centerCode, searchString: ''
            }, function (results) {
                $scope.agreementList = results.data.ResponseResult.Data;
                if ($scope.action == 'edit') {
                    if ((ExemptionCode != null && ExemptionCode != '') && (ExemptionCode == '47' || ExemptionCode == '52' || ExemptionCode == '53')
                        && ($scope.custBillType == 'N' || $scope.custBillType == 'I')) {
                        $scope.selectedInvGrp.OriginType = $scope.agreementList[1].Code;
                    }
                    else {
                        $scope.selectedInvGrp.OriginType = $scope.agreementList[0].Code;
                        $scope.isAgreementDisabled = true;
                    }
                }
                if ($scope.action == 'add') {
                    $scope.selectedInvGrp.OriginType = $scope.agreementList[0].Code;
                }
            },
                function error(response) {
                    alert('something went wrong');
                    console.log(response);
                });
        }

        // Initialize InvcGrp VM - ADD NEW
        $scope.newInvoiceGrp = {
            'SerialNumber': '',
            'CountCode': '',
            'InvoiceCurrCode': '',
            'FreightAmount': '',
            'CalculatedFreight': '',
            'FreightCurrency': '',
            'InsuranceAmount': '',
            'OriginType': '',
            'OriginTypeDesc': '',
            'FreightType': '',
            'FreightDesc': '',
        }

        // EDIT VM
        $scope.selectedInvGrp = {};

        // reset lookups for Invoice Group
        $scope.resetLookUpsForInvGrp = function () {
            $scope.countryList = null;
            $scope.selectedCountry = '';
            $scope.selectedCountryObj = {};
            $scope.currencyList = null;
            $scope.selectedCurrency = '';
            $scope.selectedCurrencyObj = {};
            $scope.freightCurrencyList = null;
            $scope.selectedFreightCurr = '';
            $scope.selectedFreightCurrencyObj = {};
        }

        // format lookups for Invoice Group - EDIT
        $scope.formatLookUpsforInvGrp = function () {
            //country lookup formatted data
            $scope.selectedCountry = (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.CountCode) ? $scope.selectedInvGrp.CountCode + " " : "")
                + (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.CountEngName) ? $scope.selectedInvGrp.CountEngName + " " : "")
                + (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.CountArbName) ? $scope.selectedInvGrp.CountArbName + " " : "");

            $scope.selectedCountryObj = {};
            $scope.selectedCountryObj.originalObject = {};
            $scope.selectedCountryObj.originalObject.Code = $scope.selectedInvGrp.CountCode;
            $scope.selectedCountryObj.originalObject.EnglishName = $scope.selectedInvGrp.CountEngName;
            $scope.selectedCountryObj.originalObject.ArabicName = $scope.selectedInvGrp.CountArbName;

            //currency lookup formatted data
            $scope.selectedCurrency = (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.InvoiceCurrCode) ? $scope.selectedInvGrp.InvoiceCurrCode + " " : "")
                + (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.InvoiceCurrEngName) ? $scope.selectedInvGrp.InvoiceCurrEngName + " " : "")
                + (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.InvoiceCurrArbName) ? $scope.selectedInvGrp.InvoiceCurrArbName + " " : "");

            $scope.selectedCurrencyObj = {};
            $scope.selectedCurrencyObj.originalObject = {};
            $scope.selectedCurrencyObj.originalObject.Code = $scope.selectedInvGrp.InvoiceCurrCode;
            $scope.selectedCurrencyObj.originalObject.NameEnglish = $scope.selectedInvGrp.InvoiceCurrEngName;
            $scope.selectedCurrencyObj.originalObject.NameArabic = $scope.selectedInvGrp.InvoiceCurrArbName;
            $scope.selectedCurrencyObj.originalObject.Rate = $scope.selectedInvGrp.ExchangeRate;


            //Freightcurrency lookup formatted data
            $scope.selectedFreightCurr = (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.FreightCurrency) ? $scope.selectedInvGrp.FreightCurrency + " " : "")
                + (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.FreightCurrEngName) ? $scope.selectedInvGrp.FreightCurrEngName + " " : "")
                + (!apiService.isNullOrEmptyOrUndefined($scope.selectedInvGrp.FreightCurrArbName) ? $scope.selectedInvGrp.FreightCurrArbName + " " : "");

            $scope.selectedFreightCurrencyObj = {};
            $scope.selectedFreightCurrencyObj.originalObject = {};
            $scope.selectedFreightCurrencyObj.originalObject.Code = $scope.selectedInvGrp.FreightCurrency;
            $scope.selectedFreightCurrencyObj.originalObject.NameEnglish = $scope.selectedInvGrp.FreightCurrEngName;
            $scope.selectedFreightCurrencyObj.originalObject.NameArabic = $scope.selectedInvGrp.FreightCurrArbName;
            $scope.selectedFreightCurrencyObj.originalObject.Rate = $scope.selectedInvGrp.FreightExRate;
        }

        // map lookups for Invoice Group - POST
        $scope.mapLookUpsForInvGrp = function () {
            //country lookup
            if ($scope.selectedCountry && $scope.selectedCountryObj.originalObject) {
                $scope.selectedInvGrp.CountCode = $scope.selectedCountryObj.originalObject.Code;
                $scope.selectedInvGrp.CountEngName = $scope.selectedCountryObj.originalObject.EnglishName;
                $scope.selectedInvGrp.CountArbName = $scope.selectedCountryObj.originalObject.ArabicName;
            }
            else { $scope.selectedInvGrp.CountCode = $scope.selectedInvGrp.CountEngName = $scope.selectedInvGrp.CountArbName = null; }

            //currency lookup
            if ($scope.selectedCurrency && $scope.selectedCurrencyObj.originalObject) {
                $scope.selectedInvGrp.InvoiceCurrCode = $scope.selectedCurrencyObj.originalObject.Code;
                $scope.selectedInvGrp.InvoiceCurrEngName = $scope.selectedCurrencyObj.originalObject.NameEnglish;
                $scope.selectedInvGrp.InvoiceCurrArbName = $scope.selectedCurrencyObj.originalObject.NameArabic;
                $scope.selectedInvGrp.ExchangeRate = $scope.selectedCurrencyObj.originalObject.Rate;
            }
            else { $scope.selectedInvGrp.InvoiceCurrCode = $scope.selectedInvGrp.InvoiceCurrEngName = $scope.selectedInvGrp.InvoiceCurrArbName = $scope.selectedInvGrp.ExchangeRate = null; }

            //Freightcurrency lookup
            if ($scope.selectedFreightCurr && $scope.selectedFreightCurrencyObj.originalObject) {
                $scope.selectedInvGrp.FreightCurrency = $scope.selectedFreightCurrencyObj.originalObject.Code;
                $scope.selectedInvGrp.FreightCurrEngName = $scope.selectedFreightCurrencyObj.originalObject.NameEnglish;
                $scope.selectedInvGrp.FreightCurrArbName = $scope.selectedFreightCurrencyObj.originalObject.NameArabic;
                $scope.selectedInvGrp.FreightExRate = $scope.selectedFreightCurrencyObj.originalObject.Rate;
            }
            else if ($scope.selectedInvGrp.FreightAmount) {
                $scope.selectedInvGrp.FreightCurrency = $scope.selectedCurrencyObj.originalObject.Code;
                $scope.selectedInvGrp.FreightCurrEngName = $scope.selectedCurrencyObj.originalObject.NameEnglish;
                $scope.selectedInvGrp.FreightCurrArbName = $scope.selectedCurrencyObj.originalObject.NameArabic;
                $scope.selectedInvGrp.FreightExRate = $scope.selectedCurrencyObj.originalObject.Rate;
            }
            else {
                $scope.selectedInvGrp.FreightCurrency = $scope.selectedInvGrp.FreightCurrEngName = $scope.selectedInvGrp.FreightCurrArbName = $scope.selectedInvGrp.FreightExRate = null;
            }
        }

        // open Add/Edit Modal PopUp for Invoice Group
        $scope.openInvGrpForm = function (selectedInvGrp, action) {
            $scope.action = action;
            $scope.GetTermsofShipmentList();
            $scope.GetAgreementList(selectedInvGrp.ExemptionCode);
            $scope.selectedInvGrp = angular.copy(selectedInvGrp);
          
            if ($scope.action == 'edit') {
                $scope.formatLookUpsforInvGrp();
            }
            if ($scope.action == 'add' && $scope.custBillType == 'E') {
                $scope.selectedCountry = 'UAE UNITED ARAB EMIRATES الامارات العربية المتحدة ';
            }

            $('#modalInvoiceGroup').modal({
                backdrop: "static"
            });
            populateCurrencyModel();
            populateShipmentCountriesModel();
        }

        // close Modal Popup
        $scope.closeModalPopUp = function () {
            $scope.selectedInvGrp = {};
            $scope.resetLookUpsForInvGrp();
            $scope.isValidInvGrpForm = $scope.isValidCountry = $scope.isValidCurrency = $scope.isValidFreightCurrency = $scope.isValidInvNo = true;
 
            $('#modalInvoiceGroup').modal('hide');
            //$scope.invoiceGrpSelected = false;
            //$scope.selectedInvoiceGroup = {};
        };

        // delete confirm
        $scope.deleteConfirm = function (index) {
            $scope.deleteIndex = index;
            $("#ConfirmDeleteModalPopup").modal("show");
        }

        // delete Invoice Grp Okay
        $scope.deleteOkay = function () {
            $("#ConfirmDeleteModalPopup").modal("hide");
            $("#loadingScreen").show();
            var invoiceGrp = $scope.invoiceGrps[$scope.deleteIndex];
            invoiceGrp.centerCode = $scope.centerCode;
            apiService.post('Customs/Invoice/DeleteGroupCategory', '', invoiceGrp, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = apiService.formatResponseMessage(response.Messages);
                if (response.IsValid) {
                    GetInvoiceGroupData();
                    $scope.invoiceGrpSelected = false;
                    $scope.selectedInvoiceGroup = {};
                    $rootScope.$broadcast('invoiceDetailsSaved', {});
                    $('#successModal').modal('show');
                    //modalSuccessShow(msg);
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

        // Validate Origin Country
        $scope.validateOriginCountry = function () {
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCountry)) {
                var selectedOriginCountry = $scope.selectedCountryObj && $scope.selectedCountryObj.originalObject ? $scope.selectedCountryObj.originalObject.Code + $scope.selectedCountryObj.originalObject.EnglishName + $scope.selectedCountryObj.originalObject.ArabicName : '';

                if (selectedOriginCountry == 0 || $scope.selectedCountry.replace(/\s/g, '') != selectedOriginCountry.replace(/\s/g, '')) {
                    $scope.isValidCountry = false;
                }
                else {
                    $scope.isValidCountry = true;
                }
            }
            else {
                $scope.isValidCountry = false;
            }
            return $scope.isValidCountry;
        }


        // Validate Currency
        $scope.validateCurrency = function () {
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCurrency)) {
                var selectedOriginCurrency = $scope.selectedCurrencyObj && $scope.selectedCurrencyObj.originalObject ? $scope.selectedCurrencyObj.originalObject.Code + $scope.selectedCurrencyObj.originalObject.NameEnglish + $scope.selectedCurrencyObj.originalObject.NameArabic : '';

                if (selectedOriginCurrency == 0 || $scope.selectedCurrency.replace(/\s/g, '') != selectedOriginCurrency.replace(/\s/g, '')) {
                    $scope.isValidCurrency = false;
                }
                else {
                    $scope.isValidCurrency = true;
                }
            }
            else {
                $scope.isValidCurrency = false;
            }
            return $scope.isValidCurrency;
        }

        // Validate Freight Currency
        $scope.validateFreightCurrency = function () {
            var selectedFreightCurrency = $scope.selectedFreightCurrencyObj && $scope.selectedFreightCurrencyObj.originalObject ? $scope.selectedFreightCurrencyObj.originalObject.Code + $scope.selectedFreightCurrencyObj.originalObject.NameEnglish + $scope.selectedFreightCurrencyObj.originalObject.NameArabic : '';

            if ($scope.selectedFreightCurr && (selectedFreightCurrency == 0 || $scope.selectedFreightCurr.replace(/\s/g, '') != selectedFreightCurrency.replace(/\s/g, ''))) {
                $scope.isValidFreightCurrency = false;
            }
            else {
                $scope.isValidFreightCurrency = true;
            }
            return $scope.isValidFreightCurrency;
        }


        // Validate Invoice Group Form
        $scope.validateInvGrpForm = function (custBillType, selectedGrp) {
            if (custBillType == "E" || custBillType == "R") {
                $scope.isValidInvGrpForm = $scope.isValidCurrency = $scope.validateCurrency();
                $scope.selectedInvGrp.OriginType = '';
                $scope.selectedInvGrp.OriginTypeDesc = '';
                $scope.selectedInvGrp.FreightType = '';
                $scope.selectedInvGrp.FreightDesc = '';
            }
            else if (custBillType == "I" || custBillType == "T" || custBillType == "O" || custBillType == "N") {
                $scope.isValidCountry = $scope.validateOriginCountry();
                $scope.isValidCurrency = $scope.validateCurrency();
                if (selectedGrp.FreightType == 3 || selectedGrp.FreightType == 4) {
                    $scope.isValidFreightCurrency = $scope.validateFreightCurrency();
                    $scope.isValidInvGrpForm = $scope.isValidFreightCurrency && $scope.isValidCurrency && $scope.isValidCountry ? true : false;
                }
                else { $scope.isValidInvGrpForm = $scope.isValidCurrency && $scope.isValidCountry ? true : false; }

            }
            $scope.isValidInvNo = $scope.selectedInvGrp.InvoiceRefNumber ? true : false;
            $scope.isValidInvGrpForm = !$scope.isValidInvNo ? false : $scope.isValidInvGrpForm;
            return $scope.isValidInvGrpForm;
        }

        // selectedInvGrp model binding by custBillType
        $scope.mapModelByCustBillType = function (custBillType) {
            if (custBillType == "E" || custBillType == "R") {
                $scope.selectedInvGrp.OriginType = '';
                $scope.selectedInvGrp.OriginTypeDesc = '';
                $scope.selectedInvGrp.FreightType = '';
                $scope.selectedInvGrp.FreightDesc = '';
            }
            else if (custBillType == "I" || custBillType == "T" || custBillType == "O" || custBillType == "N") {
                var selectedTOS = $filter('filter')($scope.termsOfShipList, function (tos) { return (tos.Value == $scope.selectedInvGrp.FreightType) });
                $scope.selectedInvGrp.FreightDesc = selectedTOS.length == 1 ? selectedTOS[0].Type : $scope.selectedInvGrp.FreightDesc;
                $scope.selectedInvGrp.OriginTypeDesc = $scope.selectedInvGrp.OriginType == "O" ? "Not Apply" : "Apply";

                if ($scope.selectedInvGrp.FreightType == 1 || $scope.selectedInvGrp.FreightType == 2) {
                    $scope.selectedInvGrp.FreightAmount = $scope.selectedInvGrp.FreightCurrency = $scope.selectedInvGrp.FreightExRate = $scope.selectedInvGrp.CalculatedFreight = "";
                }
                if ($scope.selectedInvGrp.FreightType == 1 || $scope.selectedInvGrp.FreightType == 3) {
                    $scope.selectedInvGrp.InsuranceAmount = "";
                }
            }
        }

        //function showConfirmMessage(msg) {
        //    swal({
        //        title: '',
        //        text: msg,
        //        type: "success",
        //        confirmButtonColor: "#66BB6A",
        //        confirmButtonText: $filter('translate')('ok'),
        //        closeOnConfirm: true,
        //        html: true
        //    },
        //    function (isConfirm) {
        //        if (isConfirm) {
        //            $scope.RefreshInvoiceDetailsAfterSave();
        //        }
        //    });

        //}

        $scope.addFreightCurrency = function () {
            if ($scope.selectedInvGrp && $scope.selectedInvGrp.FreightAmount && !$scope.selectedInvGrp.FreightCurrency) {
                $scope.selectedInvGrp.FreightCurrency = $scope.selectedInvGrp.InvoiceCurrCode;
                $scope.selectedInvGrp.FreightCurrEngName = $scope.selectedInvGrp.InvoiceCurrEngName;
                $scope.selectedInvGrp.FreightCurrArbName = $scope.selectedInvGrp.InvoiceCurrArbName;
            }

        }

        $scope.freightAmountChanged = function () {
            $scope.mapLookUpsForInvGrp();
            $scope.addFreightCurrency();
        }
        // SAVE INVOICE GROUP
        $scope.saveInvoiceGrp = function () {
            var isValidForm = $scope.validateInvGrpForm($scope.custBillType, $scope.selectedInvGrp);
            if (isValidForm) {
                $("#loadingScreen").show();
                if ($scope.action == 'add') {
                    $scope.selectedInvGrp.CustBillNumber = $scope.custBillNo;
                    $scope.selectedInvGrp.CustBillType = $scope.custBillType;
                    $scope.selectedInvGrp.InvoiceCenterCode = $scope.invoiceCenterCode;
                    $scope.selectedInvGrp.CurrentYear = $scope.currentYear;
                }
                $scope.selectedInvGrp.CenterCode = $scope.centerCode;
                $scope.mapLookUpsForInvGrp();
                $scope.mapModelByCustBillType($scope.custBillType);
                $scope.addFreightCurrency();
                apiService.post('Customs/Invoice/AddUpdateGroupCategory', '', $scope.selectedInvGrp, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = apiService.formatResponseMessage(response.Messages);
                    if (response.IsValid) {
                        GetInvoiceGroupData();
                        if ($scope.action == 'edit') {
                            $scope.showInvoiceDetail($scope.selectedInvGrp);
                        }
                        //GetInvoiceDetails();
                        $scope.closeModalPopUp();
                        $('#successModal').modal('show');
                        //modalSuccessShow(msg);
                    }
                    else if (!response.IsValid) {
                        modalErrorShow(msg);
                    }
                    console.log(response);
                },
                    function (result) {
                        $("#loadingScreen").hide();
                        console.log("An Error has occurred!");
                        console.log(result);
                    });
            }
            else { return false; }
        }

        ////////Region : Invoice Details  /////////////////////




        //To get invoice details by invoice group 
        GetInvoiceDetails = function (isfromInvDetails) {
            sharedModels.invoiceDetails = null;
            $scope.HazardousItems = null;
            $scope.invoiceLoader = true;
            //if (!isfromInvDetails) {
            //    // $("#loadingScreen").show();
            //    $scope.invoiceLoader = true;
            //}
            apiService.get('Customs/Invoice/GetGroupDetail', $scope.detailsParameters, function (results) {
                $scope.invoiceLoader = false;
                //if (!isfromInvDetails) {
                //    //$("#loadingScreen").hide();
                //    $scope.invoiceLoader = false;
                //}
                $scope.invoiceDetailsData = results.data.ResponseResult ? results.data.ResponseResult.Data : null;
                $scope.invoiceDetails = ($scope.invoiceDetailsData && $scope.invoiceDetailsData.InvoiceDetails) ? $scope.invoiceDetailsData.InvoiceDetails : null;
                //Filter Hazardous items
                if ($scope.invoiceDetails) {
                    //new change
                    resetEditedIndex();
                    //new change
                    $scope.HazardousItems = $scope.invoiceDetails.filter(obj => {
                        return obj.IsHazardous === 'Y';
                    });
                    sharedModels.invoiceDetails = $scope.HazardousItems;
                }
            },
                function error(response) {
                    // $("#loadingScreen").hide();
                    $scope.invoiceLoader = false;
                });
        }

        $scope.GoToHazardous = function () {
            $state.go('hazardousMaterials', {
                'centerCode': $scope.centerCode, 'jobNumber': $scope.jobNumber,
                'serial': $scope.selectedInvoiceGroup.SerialNumber, 'CountryCode': $scope.selectedInvoiceGroup.CountCode
            });
        }

        //Invoice Details Edit Section
        $scope.detailsParameters = {
            centerCode: '',
            jobNumber: '',
            custBlNumber: '',
            currentYear: '',
            custBlType: '',
            serialNumber: ''
        };
        function InitializeInvoiceDetails() {
            $scope.detailsParameters = {
            };
            $scope.invoiceGrpSelected = false;
        }
        function InitializeInvoiceInline(selectedInvoiceGroup, newInvoice, invoice) {
            $scope.dutyPercentSelected = '';
            $scope.edit = false;
            $scope.colSpan = 4;
            $scope.selectedInvoiceGroup = selectedInvoiceGroup;
            $scope.withOtherPrefix = true;
            $scope.ValidNetWeightRqd = true;
            $scope.ValidGrossWeightRqd = true;
            $scope.ValidNetnGrossWeight = true;
            $scope.ValidQuantityRqd = true;
            $scope.ValidAmountRqd = true;
            $scope.validHarmCode = true;
            $scope.validOriginExporter = true;
            $scope.ftaHSCodeMandatory = false;
            $scope.validItemType = true;
            $scope.selectedInvoiceDetails = {};
            $scope.otherDescValid = true;

            if (newInvoice) {
                $scope.selectedInvoiceDetails = {
                    Item: '',
                    BillDetailSerialNumber: $scope.selectedInvoiceGroup.SerialNumber,
                    HarmonizedCode: '',
                    Quantity: '',
                    NetWeight: '',
                    GrossWeight: '',
                    Amount: '',
                    CifInDirhams: '',
                    DutyInDihrams: '',
                    OriginExportCode: '',
                    OriginExpEngCode: '',
                    OriginExpArbCode: '',
                    ItemTypeCode: '',
                    ItemTypeEngCode: '',
                    ItemTypeArbCode: '',
                    UnitCode: '',
                    DutyPercent: '',
                    TarrifYear: ($scope.CUSTBILL && $scope.CUSTBILL.Tarrif) ? $scope.CUSTBILL.Tarrif : '',
                    CustBillNumber: $scope.selectedInvoiceGroup.CustBillNumber,
                    FreightAmount: $scope.selectedInvoiceGroup.FreightAmount,
                    BhCurrentYear: ($scope.CUSTBILL && $scope.CUSTBILL.CurrentYear) ? $scope.CUSTBILL.CurrentYear : '',
                    GroupCustBillNumber: $scope.jobNumber,
                    CustBillType: ($scope.CUSTBILL && $scope.CUSTBILL.CustBillType) ? $scope.CUSTBILL.CustBillType : '',
                    InvoiceCenterCode: $scope.centerCode,
                    GroupSerialNo: $scope.selectedInvoiceGroup.SerialNumber,
                    InvoiceSerialNo: '',
                    HarmonizeCodeShort: '',
                    IsHazardous: '',
                    HarmonizeEngName: '',
                    HarmonizeArbName: '',
                    FederalRate: '',
                    LocalRate: '',
                    SitID: '',
                    CBIDutyPercent: '',
                    CompanyCode: '',
                    UserCode: '',
                    CenterCode: $scope.centerCode,
                    BillType: ($scope.CUSTBILL && $scope.CUSTBILL.CustBillType) ? $scope.CUSTBILL.CustBillType : ''
                }
                $scope.selectedInvoiceDetails.HarmDescription = '';
                GetHarmonizedLookUpFormattedData();
                GetOriginExporterLookUpFormattedData();
                GetItemTypeLookUpFormattedData();
                //setDefaultOriginExporter();
            }
            else {
                $scope.selectedInvoiceDetails = angular.copy(invoice);
                $scope.selectedInvoiceDetails.BillType = $scope.CUSTBILL ? $scope.CUSTBILL.CustBillType : '';
                $scope.selectedInvoiceDetails.CenterCode = $scope.centerCode;
            }
            $("#harmonizedLookup_value").attr("tabindex", "1");
            $('#harmonizedLookup_value').focus();
        }

        $scope.showInvoiceDetail = function (selectedInvoiceGroup) {

            InitializeInvoiceInline(selectedInvoiceGroup, true, null);
            InitializeInvoiceDetails();

            if (selectedInvoiceGroup) {

                $scope.invoiceGrpSelected = true; //to show-hide details section
                $scope.selectedInvoiceGroup = selectedInvoiceGroup;


                $scope.selectedInvoiceGroup.CalculatedFreight = $scope.selectedInvoiceGroup.FreightAmount * $scope.selectedInvoiceGroup.FreightExRate / $scope.selectedInvoiceGroup.ExchangeRate;
                $scope.selectedInvoiceGroup.CalculatedFreight = $scope.selectedInvoiceGroup.CalculatedFreight.toFixed(2);

                $scope.detailsParameters.centerCode = $scope.centerCode;
                $scope.detailsParameters.jobNumber = $scope.jobNumber;
                $scope.detailsParameters.custBlNumber = selectedInvoiceGroup.CustBillNumber;
                $scope.detailsParameters.currentYear = selectedInvoiceGroup.CurrentYear;
                $scope.detailsParameters.custBlType = selectedInvoiceGroup.CustBillType;
                $scope.detailsParameters.serialNumber = selectedInvoiceGroup.SerialNumber;

                GetInvoiceDetails();
                $scope.gotoAnchor("invoiceDetails");
            }

        };

        $scope.populateHarmonized = function () {

            if (!$scope.harmonizedCodes) {
                getIndexData('hsCode', '', function (data) {
                    $scope.harmonizedCodes = $scope.harmonisedList = $scope.fullHarmonisedList = data
                }, function () {
                    apiService.get('Customs/Lookup/HarmonizedCode',
                        {
                            centerCode: $scope.centerCode,
                            searchString: '',
                            jobNumber: $scope.jobNumber,
                            OriginType: ''
                        },
                        function (results) {
                            $scope.lookUpCurrentPage = 1;
                            $scope.harmonizedCodes = $scope.harmonisedList = $scope.fullHarmonisedList = results.data.ResponseResult.Data;
                            $scope.HarmonizedRequired = false;
                            storeData(results.data.ResponseResult.Data, 'hsCode', '');
                        },
                        function error(response) {
                            console.log(response);
                        });
                }); //Get local data or server
            }
        }
        $scope.populateHarmonized();

        $scope.openHarmonizeLookup = function (item) {
            $("#searchText").val('');
            $scope.searchText = '';
            $scope.recordToEdit = item;
            //$scope.rowIndex = 0;
            //$scope.harmonizedItemSelected = {};
            //$scope.harmonizedItemSelected.ShortHarmCode = item.HarmoniseCode.substring(2);
            //$scope.searchText = $scope.harmonizedItemSelected.ShortHarmCode;
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
                    return obj.ShortHarmCode.includes($scope.searchText) || (obj.HarmonizeEngName && obj.HarmonizeEngName.toLowerCase().includes($scope.searchText))
                        || (obj.HarmonizeArbName && obj.HarmonizeArbName.toLowerCase().includes($scope.searchText));
                });
            }
            else {
                $scope.populateHarmonized();
            }
            $scope.HarmonizedRequired = false;
        }
        function resetItemTypeDesc(item) {
            if (item && $scope.selectedInvoiceDetails)
            {
                var originalHarmDesc = getOriginalHarmDesc($scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeCode);
                $scope.selectedInvoiceDetails.HarmDescription = originalHarmDesc;
                $scope.withOtherPrefix = true;
                $scope.ftaHSCodeMandatory = false;
            }
        }
        function resetItemTypeObjEdit(item) {
            $scope.selectedItemTypeObjEdit = [];
            $scope.selectedItemTypeObjEdit[item] = {};
            $scope.selectedItemTypeObjEdit[item].originalObject = {};
            $scope.selectedItemTypeObjEdit[item].originalObject.SerialNo = '';
            $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmoniseCode = ''
            $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescEng = '';
            $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescArb = '';
            $scope.selectedItemTypeEdit = [];
            $scope.selectedItemTypeEdit[item] = '';
            $scope.validItemType = true;
        }
        function getDutyFromHSCode(item) {
            if (item) {
               
                if ($scope.selectedHarmCodeObjEdit[item] && $scope.selectedHarmCodeObjEdit[item].originalObject && $scope.selectedHarmCodeObjEdit[item].originalObject.ShortHarmCode) {

                    resetItemTypeObjEdit(item);
                    resetItemTypeDesc(item);

                    apiService.get('Customs/Invoice/DutyPercentage',
                        {
                            jobNumber: $scope.jobNumber,
                            centerCode: $scope.centerCode,
                            SerialNo: $scope.selectedInvoiceGroup.SerialNumber,
                            HarmCode: $scope.selectedHarmCodeObjEdit[item].originalObject.ShortHarmCode,
                            BillType: $scope.selectedInvoiceGroup.CustBillType
                        },
                        function (results) {
                            var response = results.data.ResponseResult.Data;
                            $scope.selectedInvoiceDetails.DutyPercent = response.DutyPercent ? response.DutyPercent : 0;
                            $scope.dutyPercentSelected = response.DutyPercent ? response.DutyPercent : 0;
                        },
                        function error(response) {
                            console.log(response);
                        });

                    //if the Harm Code is other, user should specify the description
                    var hsCodeEngDesc = $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeEngName ? $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeEngName.replace(/-/g, "").trim().toUpperCase() : '';
                    var hsCodeArbDesc = $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeArbName ? $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeArbName.replace(/-/g, "").trim() : '';
                    if (hsCodeEngDesc == 'OTHERS' || hsCodeEngDesc == 'OTHER' || hsCodeArbDesc == 'غيرها' || hsCodeArbDesc == 'غيره') {
                        $scope.enableOtherDesc = true;
                        $scope.showOtherDesc = true;
                        $scope.hsCodeShowOtherDesc = angular.copy($scope.showOtherDesc);
                        $scope.colSpan = $scope.edit ? 1 : 2;
                        if ($scope.selectedInvoiceDetails.HarmDescription.indexOf('OTHER') != 0) {
                            $scope.selectedInvoiceDetails.HarmDescription = '';
                        }
                    }
                    else {
                        $scope.colSpan = $scope.edit ? 2 : 3;
                        $scope.showOtherDesc = false;
                        $scope.hsCodeShowOtherDesc = angular.copy($scope.showOtherDesc);
                    }

                    //FTA
                    if ($scope.selectedHarmCodeObjEdit[item] && $scope.selectedHarmCodeObjEdit[item].originalObject) {
                        var selectedHSCodeDetails = $scope.harmonisedList.filter(function (x) {
                            return (x.HarmonizeCode == $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeCode);
                        });
                        $scope.ftaHSCodeMandatory = selectedHSCodeDetails && selectedHSCodeDetails[0].FTAFlag == 'Y' ? true : false;
                       
                        if ($scope.ftaHSCodeMandatory) {
                            getFTAHSCodes($scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeCode);
                        }
                        //else {
                        //    resetItemTypeObjEdit(item);
                        //}
                    }
                }
                //else {
                //    resetItemTypeObjEdit(item);
                //}
                
            }
        }
        $scope.invEditFocusOut = (item) => {
            $timeout(function () {
                getDutyFromHSCode(item);
                // $('#harmonizedLookupEdit').focus();
            }, 1000);

        }

        function resetItemTypeObject()
        {
            $scope.selectedItemTypeXportObj = {};
            $scope.selectedItemTypeXportObj.originalObject = {};
            $scope.selectedItemTypeXportObj.originalObject.SerialNo = '';
            $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng = '';
            $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb = '';
            $scope.selectedItemTypeXport = [];
            $scope.selectedItemTypeXport = '';
            $scope.validItemType = true;
        }

        $scope.setHarmonized = function (row) {
            if ($scope.recordToEdit) {
                $scope.selectedHarmCodeEdit[$scope.recordToEdit] = row.ShortHarmCode + " " + row.HarmonizeEngName + " " + row.HarmonizeArbName;
                $scope.selectedHarmCodeObjEdit[$scope.recordToEdit] = {};
                $scope.selectedHarmCodeObjEdit[$scope.recordToEdit].originalObject = row;
                $('#harmonizedLookupEdit_value').focus();
                $('#harmonizedLookupEdit_value').select();
                getDutyFromHSCode($scope.recordToEdit);
            }
            else {
                $scope.selectedHarmCode = row.ShortHarmCode + " " + row.HarmonizeEngName + " " + row.HarmonizeArbName;
                $scope.selectedHarmCodeObj = {};
                $scope.selectedHarmCodeObj.originalObject = row;
            }

            $("#harmonizeLookup").modal("hide");
            $("#harmonizedLookup_value").attr("tabindex", "1");
            $('#harmonizedLookup_value').focus();
            // $('#' + $scope.RecordToEdit.InvoiceSerialNumber + '_Weight').focus();
        }


        $scope.harmonizedCodeKeyDown = function (event, item) {
            if (event.key == 'F9') {
                $scope.openHarmonizeLookup(item);
            }
        }

        function resetEditedIndex() {
            $scope.editInvoice = [];
            for (var index = 0; index < ($scope.invoiceDetails ? $scope.invoiceDetails.length : 0); index++) {
                $scope.editInvoice[$scope.invoiceDetails[index].Item] = false;
            }
        }
        function getHSCodeDetails(item, edit) {
            //if the Harm Code is other, user should specify the description
            var hsCodeEngDesc = $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeEngName ? $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeEngName.replace(/-/g, "").trim().toUpperCase() : '';
            var hsCodeArbDesc = $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeArbName ? $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeArbName.replace(/-/g, "").trim() : '';
            if (hsCodeEngDesc == 'OTHERS' || hsCodeEngDesc == 'OTHER' || hsCodeArbDesc == 'غيرها' || hsCodeArbDesc == 'غيره') {
                $scope.enableOtherDesc = true;
                $scope.showOtherDesc = true;
                $scope.hsCodeShowOtherDesc = angular.copy($scope.showOtherDesc);
                $scope.colSpan = $scope.edit ? 1 : 2;
                if (edit) {
                    $scope.selectedInvoiceDetails.HarmDescription = $scope.selectedHarmCodeObjEdit[item].originalObject.HarmDescription;
                }
            }
            else {
                $scope.colSpan = $scope.edit ? 2 : 3;
                $scope.showOtherDesc = false;
                $scope.hsCodeShowOtherDesc = angular.copy($scope.showOtherDesc);
            }

            //FTA
            if ($scope.selectedHarmCodeObjEdit[item] && $scope.selectedHarmCodeObjEdit[item].originalObject) {
                var selectedHSCodeDetails = $scope.harmonizedCodes.filter(function (x) {
                    return (x.HarmonizeCode == $scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeCode);
                });
                $scope.ftaHSCodeMandatory = (selectedHSCodeDetails && selectedHSCodeDetails.length > 0) && selectedHSCodeDetails[0].FTAFlag == 'Y' ? true : false;
                if ($scope.ftaHSCodeMandatory) {
                    getFTAHSCodes($scope.selectedHarmCodeObjEdit[item].originalObject.HarmonizeCode);
                }
                else {
                    resetItemTypeObjEdit(item);
                }
            }
        }

        function getHSCode(invoice) {
            //HS Code
            $scope.selectedHarmCodeEdit = [];
            if ($scope.selectedInvoiceDetails) {
                var desc = $scope.selectedInvoiceDetails.HarmonizeCodeShort ? $scope.selectedInvoiceDetails.HarmonizeCodeShort + "     " : "";
                desc = desc + ($scope.selectedInvoiceDetails.HarmonizeEngName ? ($scope.selectedInvoiceDetails.HarmonizeEngName + "     ") : "");
                desc = desc + ($scope.selectedInvoiceDetails.HarmonizeArbName ? $scope.selectedInvoiceDetails.HarmonizeArbName : "");
                $scope.selectedHarmCodeEdit[invoice.Item] = desc;
            }
            $scope.selectedHarmCodeObjEdit = [];
            $scope.selectedHarmCodeObjEdit[invoice.Item] = {};
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject = {};
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.ShortHarmCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizeCodeShort : null;
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmonizeCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizedCode : null;
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmonizeEngName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizeEngName : null;
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmonizeArbName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizeArbName : null;
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.UnitCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.UnitCode : null;
            $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmDescription = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmDescription : null;

            getHSCodeDetails(invoice.Item, true);
        }
        function getOriginExporter(invoice) {
            //Origin Exporter
            $scope.selectedOrigXportEdit = [];
            if ($scope.selectedInvoiceDetails) {
                $scope.selectedOrigXportEdit[invoice.Item] = $scope.selectedInvoiceDetails.OriginExportCode ? $scope.selectedInvoiceDetails.OriginExportCode + "     " : "";
                $scope.selectedOrigXportEdit[invoice.Item] = $scope.selectedOrigXportEdit[invoice.Item] + ($scope.selectedInvoiceDetails.OriginExpEngCode ? $scope.selectedInvoiceDetails.OriginExpEngCode + "     " : "");
                $scope.selectedOrigXportEdit[invoice.Item] = $scope.selectedOrigXportEdit[invoice.Item] + ($scope.selectedInvoiceDetails.OriginExpArbCode ? $scope.selectedInvoiceDetails.OriginExpArbCode : "");
            }
            $scope.selectedOrigXportObjEdit = [];
            $scope.selectedOrigXportObjEdit[invoice.Item] = {};
            $scope.selectedOrigXportObjEdit[invoice.Item].originalObject = {};
            $scope.selectedOrigXportObjEdit[invoice.Item].originalObject.OrgnExporterCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.OriginExportCode : null;
            $scope.selectedOrigXportObjEdit[invoice.Item].originalObject.OrgnExporterEngName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.OriginExpEngCode : null;
            $scope.selectedOrigXportObjEdit[invoice.Item].originalObject.OrgnExporterArbName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.OriginExpArbCode : null;
        }

        function getItemType(invoice) {
            //Item Type
            $scope.selectedItemTypeEdit = [];
            if ($scope.selectedInvoiceDetails) {
                $scope.selectedItemTypeEdit[invoice.Item] = $scope.selectedInvoiceDetails.FTAHarmCode ? $scope.selectedInvoiceDetails.FTAHarmCode + "     " : "";
                $scope.selectedItemTypeEdit[invoice.Item] = $scope.selectedItemTypeEdit[invoice.Item] + ($scope.selectedInvoiceDetails.FTAHarmDescEng ? $scope.selectedInvoiceDetails.FTAHarmDescEng + "     " : "");
                $scope.selectedItemTypeEdit[invoice.Item] = $scope.selectedItemTypeEdit[invoice.Item] + ($scope.selectedInvoiceDetails.FTAHarmDescArb ? $scope.selectedInvoiceDetails.FTAHarmDescArb : "");
            }
            $scope.selectedItemTypeObjEdit = [];
            $scope.selectedItemTypeObjEdit[invoice.Item] = {};
            $scope.selectedItemTypeObjEdit[invoice.Item].originalObject = {};
            $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.SerialNo = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.FTAHarmCode : null;
            $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescEng = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.FTAHarmDescEng : null;
            $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescArb = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.FTAHarmDescArb : null;
            enableDisableHSCodeDescription(true, invoice.Item);
        }

        $scope.editInvoiceDetail = function (invoice) {
            $scope.inv = invoice;
            $scope.savedSuccess = false;
            InitializeInvoiceInline($scope.selectedInvoiceGroup, false, invoice);
            $scope.colSpan = 3;
            resetEditedIndex();
            $scope.editInvoice[invoice.Item] = true;
            $scope.originalFTASerialNo = invoice ? angular.copy(invoice.FTAHarmCode) : '';
            $scope.originalFTAEng = invoice ? angular.copy(invoice.FTAHarmDescEng) : '';
            //if FTA harm code is changing to some thing else from 'other' , then need to keep original harmcode
            //var prevhsCodeEngDesc = invoice ? angular.copy(invoice.FTAHarmDescEng) : '';
            //var prevhsCodeArbDesc = invoice ? angular.copy(invoice.FTAHarmDescArb) : '';
            //$scope.prevftaHasOther = false;
            //if (prevhsCodeEngDesc == 'OTHERS' || prevhsCodeEngDesc == 'OTHER' || prevhsCodeArbDesc == 'غيرها' || prevhsCodeArbDesc == 'غيره') {
            //    $scope.prevftaHasOther = true;
            //}
           
            $scope.edit = true;
            getHSCode(invoice);
            getOriginExporter(invoice);
            getItemType(invoice);
        }
        $scope.cancelEditInvoiceDetail = function (invoice) {
            $scope.editInvoice[invoice.Item] = false;
            InitializeInvoiceInline($scope.selectedInvoiceGroup, true, null);
        }

        $scope.onKeyDownInvoiceDetail = function ($event, mode) {
            if ($event.keyCode == 13) //Save invoice details on Enter keypress
            {
                $scope.SaveInvoiceDetails();
            }
        };

        $scope.cancelInvoiceDetail = () => {
            InitializeInvoiceInline($scope.selectedInvoiceGroup, true, null);
        }

        function GetHarmonizedLookUpFormattedData() {
            if ($scope.selectedInvoiceDetails) {
                $scope.selectedHarmCode = $scope.selectedInvoiceDetails.HarmonizeCodeShort ? $scope.selectedInvoiceDetails.HarmonizeCodeShort + "     " : "";
                $scope.selectedHarmCode = $scope.selectedHarmCode + ($scope.selectedInvoiceDetails.HarmonizeEngName ? $scope.selectedInvoiceDetails.HarmonizeEngName + "     " : "");
                $scope.selectedHarmCode = $scope.selectedHarmCode + ($scope.selectedInvoiceDetails.HarmonizeArbName ? $scope.selectedInvoiceDetails.HarmonizeArbName : "");
            }
            $scope.selectedHarmCodeObj = {};
            $scope.selectedHarmCodeObj.originalObject = {};
            $scope.selectedHarmCodeObj.originalObject.ShortHarmCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizeCodeShort : null;
            $scope.selectedHarmCodeObj.originalObject.HarmonizeCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizedCode : null;
            $scope.selectedHarmCodeObj.originalObject.HarmonizeEngName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizeEngName : null;
            $scope.selectedHarmCodeObj.originalObject.HarmonizeArbName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmonizeArbName : null;
            $scope.selectedHarmCodeObj.originalObject.UnitCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.UnitCode : null;
            $scope.selectedHarmCodeObj.originalObject.HarmDescription = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.HarmDescription : null;

        }
        function GetOriginExporterLookUpFormattedData() {
            if ($scope.selectedInvoiceDetails) {
                $scope.selectedOrigXport = $scope.selectedInvoiceDetails.OriginExportCode ? $scope.selectedInvoiceDetails.OriginExportCode + "     " : "";
                $scope.selectedOrigXport = $scope.selectedOrigXport + ($scope.selectedInvoiceDetails.OriginExpEngCode ? $scope.selectedInvoiceDetails.OriginExpEngCode + "     " : "");
                $scope.selectedOrigXport = $scope.selectedOrigXport + ($scope.selectedInvoiceDetails.OriginExpArbCode ? $scope.selectedInvoiceDetails.OriginExpArbCode : "");
            }
            $scope.selectedOrigXportObj = {};
            $scope.selectedOrigXportObj.originalObject = {};
            $scope.selectedOrigXportObj.originalObject.OrgnExporterCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.OriginExportCode : null;
            $scope.selectedOrigXportObj.originalObject.OrgnExporterEngName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.OriginExpEngCode : null;
            $scope.selectedOrigXportObj.originalObject.OrgnExporterArbName = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.OriginExpArbCode : null;
        }
        function GetItemTypeLookUpFormattedData() {
            if ($scope.selectedInvoiceDetails) {
                $scope.selectedItemTypeXport = $scope.selectedInvoiceDetails.ItemTypeCode ? $scope.selectedInvoiceDetails.ItemTypeCode + "     " : "";
                $scope.selectedItemTypeXport = $scope.selectedItemTypeXport + ($scope.selectedInvoiceDetails.ItemTypeEngCode ? $scope.selectedInvoiceDetails.ItemTypeEngCode + "     " : "");
                $scope.selectedItemTypeXport = $scope.selectedItemTypeXport + ($scope.selectedInvoiceDetails.ItemTypeArbCode ? $scope.selectedInvoiceDetails.ItemTypeArbCode : "");
            }
            $scope.selectedItemTypeXportObj = {};
            $scope.selectedItemTypeXportObj.originalObject = {};
            $scope.selectedItemTypeXportObj.originalObject.FTAHarmoniseCode = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.ItemTypeCode : null;
            $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.ItemTypeEngCode : null;
            $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb = $scope.selectedInvoiceDetails ? $scope.selectedInvoiceDetails.ItemTypeArbCode : null;
        }
        //getItemType

        //Region : Lookups in Invoice Detail ///////////
        $scope.harmonizedCodeChanged = function (searchStr) {
            $scope.savedSuccess = false;
            $scope.selectedHarmCode = searchStr;
            // $scope.harmonizedCodes = getIndexData('hsCode', $scope.centerCode); //Get local data
            getIndexData('hsCode', '', function (data) {
                $scope.harmonizedCodes = data;
            }, function () {
                if (!apiService.isNullOrEmptyOrUndefined($scope.selectedHarmCode)) {
                    apiService.get('Customs/Lookup/HarmonizedCode',
                        {
                            centerCode: $scope.centerCode,
                            searchString: $scope.selectedHarmCode,
                            jobNumber: $scope.jobNumber,
                            OriginType: ''
                        },
                        function (results) {
                            $scope.harmonizedCodes = results.data.ResponseResult.Data;
                            storeData(results.data.ResponseResult.Data, 'hsCode', '');
                        },
                        function error(response) {
                            console.log(response);
                        });

                }
            });
        }
        //On Page Load , select a default origin exporter
        function setDefaultOriginExporter() {
            if ($scope.originExportersFull) {
                $scope.originExporters = angular.copy($scope.originExportersFull);
                $scope.selectedOrigXport = $scope.originExporters[0].OrgnExporterCode + "     " + $scope.originExporters[0].OrgnExporterEngName + "     " + $scope.originExporters[0].OrgnExporterArbName;
                $scope.selectedOrigXportObj = {};
                $scope.selectedOrigXportObj.originalObject = {};
                $scope.selectedOrigXportObj.originalObject.OrgnExporterCode = $scope.originExporters[0].OrgnExporterCode;
                $scope.selectedOrigXportObj.originalObject.OrgnExporterEngName = $scope.originExporters[0].OrgnExporterEngName;
                $scope.selectedOrigXportObj.originalObject.OrgnExporterArbName = $scope.originExporters[0].OrgnExporterArbName;
            }


        }

        //Validation : Invoice Details
        $scope.ValidateOriginExporterEdit = function (selectedOriginCodeObj, selectedOriginCode) {
            $scope.validOriginExporter = true;
            var originExporterSelected = selectedOriginCodeObj ? selectedOriginCodeObj.originalObject.OrgnExporterCode + selectedOriginCodeObj.originalObject.OrgnExporterEngName + selectedOriginCodeObj.originalObject.OrgnExporterArbName : '';
            if (selectedOriginCode && originExporterSelected == 0) {
                $scope.validOriginExporter = false;
                $scope.isValidInvoiceDetails = false;
            }
            else if (originExporterSelected && (selectedOriginCode.replace(/\s/g, '') != originExporterSelected.replace(/\s/g, ''))) {
                $scope.validOriginExporter = false;
                $scope.isValidInvoiceDetails = false;
            }
        }
        $scope.ValidateItemTypeEdit = function (selectedItemTypeCodeObj, selectedItemTypeCode) {
            $scope.validItemType = true;
            var itemTypeSelected = selectedItemTypeCodeObj ? selectedItemTypeCodeObj.originalObject.SerialNo + selectedItemTypeCodeObj.originalObject.FTAHarmDescEng + selectedItemTypeCodeObj.originalObject.FTAHarmDescArb : '';
            if (selectedItemTypeCode && itemTypeSelected == 0) {
                $scope.validItemType = false;
                $scope.isValidInvoiceDetails = false;
            }
            else if (!selectedItemTypeCode || (itemTypeSelected && (selectedItemTypeCode.replace(/\s/g, '') != itemTypeSelected.replace(/\s/g, '')))) {
                $scope.validItemType = false;
                $scope.isValidInvoiceDetails = false;
            }
        }

        $scope.ValidateHarmonizecCodeEdit = function (selectedHSCodeObj, selectedHSCode) {
            $scope.validHarmCode = true;
            var harmCodeSelected = (selectedHSCodeObj && selectedHSCodeObj.originalObject.ShortHarmCode) ? selectedHSCodeObj.originalObject.ShortHarmCode + selectedHSCodeObj.originalObject.HarmonizeEngName + selectedHSCodeObj.originalObject.HarmonizeArbName : '';
            if ((!selectedHSCode) || (selectedHSCode && (harmCodeSelected == 0 || selectedHSCode.replace(/\s/g, '') != harmCodeSelected.replace(/\s/g, '')))) {
                $scope.validHarmCode = false;
                $scope.isValidInvoiceDetails = false;
            }
        }
        $scope.ValidateHarmonizecCode = function () {
            $scope.validHarmCode = true;
            var harmCodeSelected = ($scope.selectedHarmCodeObj && $scope.selectedHarmCodeObj.originalObject.ShortHarmCode) ? $scope.selectedHarmCodeObj.originalObject.ShortHarmCode + $scope.selectedHarmCodeObj.originalObject.HarmonizeEngName + $scope.selectedHarmCodeObj.originalObject.HarmonizeArbName : '';
            if ((!$scope.selectedHarmCode) || ($scope.selectedHarmCode && (harmCodeSelected == 0 || $scope.selectedHarmCode.replace(/\s/g, '') != harmCodeSelected.replace(/\s/g, '')))) {
                $scope.validHarmCode = false;
                $scope.isValidInvoiceDetails = false;
            }
        }
        $scope.ValidateOriginExporter = function () {
            $scope.validOriginExporter = true;
            var originExporterSelected = $scope.selectedOrigXportObj ? $scope.selectedOrigXportObj.originalObject.OrgnExporterCode + $scope.selectedOrigXportObj.originalObject.OrgnExporterEngName + $scope.selectedOrigXportObj.originalObject.OrgnExporterArbName : '';
            if ($scope.selectedOrigXport && (originExporterSelected == 0 || $scope.selectedOrigXport.replace(/\s/g, '') != originExporterSelected.replace(/\s/g, ''))) {
                $scope.validOriginExporter = false;
                $scope.isValidInvoiceDetails = false;
            }
        }
        $scope.ValidateFTAHSCode = function () {
            $scope.validItemType = true;
            var ftaHSCodeSelected = $scope.selectedItemTypeXportObj ? $scope.selectedItemTypeXportObj.originalObject.SerialNo + $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng + $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb : '';
            if (!$scope.selectedItemTypeXport || ($scope.selectedItemTypeXport && (ftaHSCodeSelected == 0 || $scope.selectedItemTypeXport.replace(/\s/g, '') != ftaHSCodeSelected.replace(/\s/g, '')))) {
                $scope.validItemType = false;
                $scope.isValidInvoiceDetails = false;
            }
        }
        $scope.ValidateNetWeight = function () {
            //$scope.selectedInvoiceDetails.GrossWeight = angular.copy($scope.selectedInvoiceDetails.NetWeight);

            $scope.ValidNetWeightRqd = true;
            $scope.ValidNetnGrossWeight = true;

            $scope.ValidNetWeightRqd = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.NetWeight) ? true : false;
            $scope.ValidNetnGrossWeight = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.GrossWeight && $scope.selectedInvoiceDetails.NetWeight && (parseFloat($scope.selectedInvoiceDetails.GrossWeight) < parseFloat($scope.selectedInvoiceDetails.NetWeight))) ? false : true;
            $scope.isValidInvoiceDetails = ($scope.ValidNetWeightRqd && $scope.ValidNetnGrossWeight) ? $scope.isValidInvoiceDetails : false;
        }
        $scope.ValidateGrossWeight = function () {

            $scope.ValidGrossWeightRqd = true;
            $scope.ValidNetnGrossWeight = true;

            $scope.ValidGrossWeightRqd = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.GrossWeight) ? true : false;
            $scope.ValidNetnGrossWeight = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.GrossWeight && $scope.selectedInvoiceDetails.NetWeight && (parseFloat($scope.selectedInvoiceDetails.GrossWeight) < parseFloat($scope.selectedInvoiceDetails.NetWeight))) ? false : true;
            $scope.isValidInvoiceDetails = ($scope.ValidGrossWeightRqd && $scope.ValidNetnGrossWeight) ? $scope.isValidInvoiceDetails : false;
        }
        $scope.ValidateRequiredFields = function () {
            $scope.ValidAmountRqd = true;
            $scope.ValidQuantityRqd = true;
            $scope.otherDescValid = true;
            $scope.ValidAmountRqd = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.Amount) ? true : false;
            $scope.ValidQuantityRqd = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.Quantity) ? true : false;
            if ($scope.showOtherDesc) {
                var desc = ($scope.selectedInvoiceDetails && $scope.selectedInvoiceDetails.HarmDescription) ? $scope.selectedInvoiceDetails.HarmDescription.replace(/-/g, '').trim().toUpperCase() : '';
                //$scope.otherDescValid = ($scope.selectedInvoiceDetails.HarmDescription && !($scope.selectedInvoiceDetails.HarmDescription == 'OTHER')) ? true : false;
                if ($scope.withOtherPrefix) {
                    $scope.otherDescValid = ($scope.selectedInvoiceDetails.HarmDescription && (desc != 'OTHER') && (desc.length > 5)) ? true : false;
                }
                else
                {
                    $scope.otherDescValid = $scope.selectedInvoiceDetails.HarmDescription? true : false;
                }
            }
            $scope.isValidInvoiceDetails = ($scope.ValidAmountRqd && $scope.ValidQuantityRqd && $scope.otherDescValid) ? $scope.isValidInvoiceDetails : false;
        }

        //End of Region : Lookups in Invoice Detail ///////////

       
        function getFTAHSCodes(hsCode)
        {
            $scope.itemTypes = '';
            if ($scope.itemTypesFull) {

                $scope.itemTypes = $scope.itemTypesFull.filter(function (x) {
                    return (x.FTAHarmoniseCode == hsCode);
                });

                $scope.itemsTypesAll = angular.copy($scope.itemTypes);
            }
        }

        $scope.$watch("selectedHarmCodeObj", function () {
            if ($scope.selectedHarmCodeObj && $scope.selectedHarmCodeObj.originalObject && $scope.selectedHarmCodeObj.originalObject.ShortHarmCode) {
                apiService.get('Customs/Invoice/DutyPercentage',
                    {
                        jobNumber: $scope.jobNumber,
                        centerCode: $scope.centerCode,
                        SerialNo: $scope.selectedInvoiceGroup.SerialNumber,
                        HarmCode: $scope.selectedHarmCodeObj.originalObject.ShortHarmCode,
                        BillType: $scope.selectedInvoiceGroup.CustBillType
                    },
                    function (results) {
                        var response = results.data.ResponseResult.Data;
                        $scope.selectedInvoiceDetails.DutyPercent = response.DutyPercent ? response.DutyPercent : 0;//Commented for new change
                        $scope.dutyPercentSelected = response.DutyPercent ? response.DutyPercent : 0; //New Change
                    },
                    function error(response) {
                        console.log(response);
                    });
                //if the Harm Code is other, user should specify the description
                var hsCodeEngDesc = $scope.selectedHarmCodeObj.originalObject.HarmonizeEngName ? $scope.selectedHarmCodeObj.originalObject.HarmonizeEngName.replace(/-/g, "").trim().toUpperCase() : '';
                var hsCodeArbDesc = $scope.selectedHarmCodeObj.originalObject.HarmonizeArbName ? $scope.selectedHarmCodeObj.originalObject.HarmonizeArbName.replace(/-/g, "").trim() : '';
                if (hsCodeEngDesc == 'OTHERS' || hsCodeEngDesc == 'OTHER' || hsCodeArbDesc == 'غيرها' || hsCodeArbDesc == 'غيره') {
                    $scope.enableOtherDesc = true;
                    $scope.showOtherDesc = true;
                    $scope.hsCodeShowOtherDesc = angular.copy($scope.showOtherDesc);
                    $scope.colSpan = $scope.edit ? 2 : 3;
                    //$scope.selectedInvoiceDetails.HarmDescription = $scope.selectedHarmCodeObj.originalObject.HarmDescription;
                }
                else {
                    $scope.colSpan = $scope.edit ? 3 : 4;
                    $scope.showOtherDesc = false;
                    $scope.hsCodeShowOtherDesc = angular.copy($scope.showOtherDesc);
                }
                //FTA flag
                resetItemTypeObject();
                getFTAHSCodes($scope.selectedHarmCodeObj.originalObject.HarmonizeCode);
                $scope.ftaHSCodeMandatory = $scope.selectedHarmCodeObj.originalObject.FTAFlag == 'Y' ? true : false;
                if (!$scope.ftaHSCodeMandatory) {
                    resetItemTypeObject();
                }
            }
        }, true);

        
        //End Region Watch HarmonizedCode Model
        function setHSCode(edit, invoice) {
            if (edit && invoice) {
                if ($scope.selectedHarmCodeObjEdit && $scope.selectedHarmCodeObjEdit[invoice.Item] && $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject) {
                    $scope.selectedInvoiceDetails.HarmonizedCode = $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmonizeCode;
                    $scope.selectedInvoiceDetails.HarmonizeCodeShort = $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.ShortHarmCode;
                    $scope.selectedInvoiceDetails.HarmonizeEngName = $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmonizeEngName;
                    $scope.selectedInvoiceDetails.HarmonizeArbName = $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmonizeArbName;
                    $scope.selectedInvoiceDetails.UnitCode = $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.UnitCode;
                    //Harmonized Code Description can be changed by user if it is 'Other'
                    //$scope.selectedInvoiceDetails.HarmDescription = $scope.showOtherDesc ? $scope.selectedInvoiceDetails.HarmDescription : $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmDescription;
                    $scope.selectedInvoiceDetails.HarmDescription = $scope.showOtherDesc ? $scope.selectedInvoiceDetails.HarmDescription : $scope.selectedHarmCodeObjEdit[invoice.Item].originalObject.HarmDescription;

                 

                }
            }
            else {
                if ($scope.selectedHarmCodeObj && $scope.selectedHarmCodeObj.originalObject) {
                    $scope.selectedInvoiceDetails.HarmonizedCode = $scope.selectedHarmCodeObj.originalObject.HarmonizeCode;
                    $scope.selectedInvoiceDetails.HarmonizeCodeShort = $scope.selectedHarmCodeObj.originalObject.ShortHarmCode;
                    $scope.selectedInvoiceDetails.HarmonizeEngName = $scope.selectedHarmCodeObj.originalObject.HarmonizeEngName;
                    $scope.selectedInvoiceDetails.HarmonizeArbName = $scope.selectedHarmCodeObj.originalObject.HarmonizeArbName;
                    $scope.selectedInvoiceDetails.UnitCode = $scope.selectedHarmCodeObj.originalObject.UnitCode;

                    //Harmonized Code Description can be changed by user if it is 'Other'
                    $scope.selectedInvoiceDetails.HarmDescription = $scope.showOtherDesc ? $scope.selectedInvoiceDetails.HarmDescription : $scope.selectedHarmCodeObj.originalObject.HarmDescription;
                }
            }
        }

        function setOriginExporter(edit, invoice) {
            if (edit && invoice) {
                if ($scope.selectedOrigXportObjEdit && $scope.selectedOrigXportObjEdit[invoice.Item] && $scope.selectedOrigXportObjEdit[invoice.Item].originalObject) {
                    $scope.selectedInvoiceDetails.OriginExportCode = $scope.selectedOrigXportObjEdit[invoice.Item].originalObject.OrgnExporterCode;
                    $scope.selectedInvoiceDetails.OriginExpEngCode = $scope.selectedOrigXportObjEdit[invoice.Item].originalObject.OrgnExporterEngName;
                    $scope.selectedInvoiceDetails.OriginExpArbCode = $scope.selectedOrigXportObjEdit[invoice.Item].originalObject.OrgnExporterArbName;
                }
            }
            else {
                $scope.selectedInvoiceDetails.OriginExportCode = $scope.selectedOrigXportObj ? $scope.selectedOrigXportObj.originalObject.OrgnExporterCode : '';
                $scope.selectedInvoiceDetails.OriginExpEngCode = $scope.selectedOrigXportObj ? $scope.selectedOrigXportObj.originalObject.OrgnExporterEngName : '';
                $scope.selectedInvoiceDetails.OriginExpArbCode = $scope.selectedOrigXportObj ? $scope.selectedOrigXportObj.originalObject.OrgnExporterArbName : '';
            }
        }

        ////////////////////////START OF FTA HS CODE CHANGE //////////////
        function enableDisableHSCodeDescription(editMode, item)
        {
            debugger;
            if(editMode)
            {
                $scope.withOtherPrefix = angular.copy($scope.hsCodeShowOtherDesc) ? true : false;
                if ($scope.selectedItemTypeObjEdit[item] && $scope.selectedItemTypeObjEdit[item].originalObject) {
                    $scope.itemTypeEdited = false;
                    if (($scope.originalFTASerialNo != $scope.selectedItemTypeObjEdit[item].originalObject.SerialNo) && ($scope.originalFTAEng != $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescEng)) {
                        $scope.itemTypeEdited = true;
                    }
                     
                    var ftaHSCodeEngDesc = $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescEng ? $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescEng.replace(/-/g, "").trim().toUpperCase() : '';
                    var ftaHSCodeArbDesc = $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescArb ? $scope.selectedItemTypeObjEdit[item].originalObject.FTAHarmDescArb.replace(/-/g, "").trim() : '';
                    if (ftaHSCodeEngDesc || ftaHSCodeArbDesc) {
                        if (ftaHSCodeEngDesc == 'OTHERS' || ftaHSCodeEngDesc == 'OTHER' || ftaHSCodeArbDesc == 'غيرها' || ftaHSCodeArbDesc == 'غيره') {

                            $scope.enableOtherDesc = true;
                            $scope.showOtherDesc = true;
                            $scope.colSpan = $scope.edit ? 1 : 2;
                            if ($scope.itemtypeedited) {
                                $scope.selectedinvoicedetails.harmdescription = '';
                            }
                            else {
                                $scope.selectedInvoiceDetails.HarmDescription = $scope.selectedHarmCodeObjEdit[item].originalObject.HarmDescription;
                            }
                        }
                        else {
                            $scope.enableOtherDesc = false;
                            if (!$scope.showOtherDesc && !$scope.hsCodeShowOtherDesc) {
                                $scope.colSpan = $scope.edit ? 2 : 3;
                                $scope.showOtherDesc = false;
                            }
                        }
                    }
                }
            }
            else
            {
                if ($scope.selectedItemTypeXportObj && $scope.selectedItemTypeXportObj.originalObject) {
                  
                    var ftaHSCodeEngDesc = $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng ? $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng.replace(/-/g, "").trim().toUpperCase() : '';
                    var ftaHSCodeArbDesc = $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb ? $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb.replace(/-/g, "").trim() : '';

                    if (ftaHSCodeEngDesc || ftaHSCodeArbDesc) {
                        if (ftaHSCodeEngDesc == 'OTHERS' || ftaHSCodeEngDesc == 'OTHER' || ftaHSCodeArbDesc == 'غيرها' || ftaHSCodeArbDesc == 'غيره') {
                            
                            if (!$scope.showOtherDesc && $scope.selectedInvoiceDetails) {
                                $scope.selectedInvoiceDetails.HarmDescription = '';
                            }
                            $scope.withOtherPrefix = $scope.hsCodeShowOtherDesc ? true : false;
                            $scope.enableOtherDesc = true;
                            $scope.showOtherDesc = true;
                            $scope.colSpan = 3;
                        }
                        else {
                            $scope.enableOtherDesc = false;
                            if ($scope.showOtherDesc && !$scope.hsCodeShowOtherDesc) {
                                $scope.colSpan = 4;
                                $scope.showOtherDesc = false;
                            }
                        }
                    }
                }
            }
        }

        //This watch method is used for capturing the change in Item Type in 'add mode'
        $scope.$watch("selectedItemTypeXportObj", function () {
            enableDisableHSCodeDescription(false, null);
        });

        $scope.invItemTypeEditFocusOut = (item) => {
            $timeout(function () {
                $scope.itemTypeEdited = true;
                enableDisableHSCodeDescription(true, item);
            }, 1000);
        }

        function getOriginalHarmDesc(originalHarmCode)
        {
            if($scope.harmonizedCodes)
            {
                var originalHSCode = $filter('filter')($scope.harmonizedCodes, function (hs) { return (hs.HarmonizeCode == originalHarmCode) });
                var originalHarmDesc = originalHSCode ? originalHSCode[0].HarmDescription : '';
                return originalHarmDesc;
            }
        }

        function setItemType(edit, invoice) {
            debugger;
            if (edit && invoice) {
                if ($scope.selectedItemTypeObjEdit && $scope.selectedItemTypeObjEdit[invoice.Item] && $scope.selectedItemTypeObjEdit[invoice.Item].originalObject) {

                    $scope.selectedInvoiceDetails.FTAHarmCode = $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.SerialNo;

                    var ftaHSCodeEngDesc = $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescEng ? $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescEng.replace(/-/g, "").trim().toUpperCase() : '';
                    var ftaHSCodeArbDesc = $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescArb ? $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescArb.replace(/-/g, "").trim() : '';

                    if (ftaHSCodeEngDesc == 'OTHERS' || ftaHSCodeEngDesc == 'OTHER' || ftaHSCodeArbDesc == 'غيرها' || ftaHSCodeArbDesc == 'غيره') {
                       //Logic
                    }
                    else {
                       
                        if ($scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescArb && $scope.itemTypeEdited) {
                            var harmPrefix = $scope.selectedInvoiceDetails.HarmDescription ? $scope.selectedInvoiceDetails.HarmDescription : 'OTHER';
                            $scope.selectedInvoiceDetails.HarmDescription = harmPrefix + ' - ' + $scope.selectedItemTypeObjEdit[invoice.Item].originalObject.FTAHarmDescArb;
                        }
                    }
                }
            }
            else {
                if ($scope.selectedItemTypeXportObj && $scope.selectedItemTypeXportObj.originalObject) {
 
                    $scope.selectedInvoiceDetails.FTAHarmCode = $scope.selectedItemTypeXportObj.originalObject.SerialNo;

                    var ftaHSCodeEngDesc = $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng ? $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescEng.replace(/-/g, "").trim().toUpperCase() : '';
                    var ftaHSCodeArbDesc = $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb ? $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb.replace(/-/g, "").trim() : '';

                    if (ftaHSCodeEngDesc == 'OTHERS' || ftaHSCodeEngDesc == 'OTHER' || ftaHSCodeArbDesc == 'غيرها' || ftaHSCodeArbDesc == 'غيره') {
                        //Logic
                    }
                    else {
                        if (!$scope.enableOtherDesc && $scope.hsCodeShowOtherDesc)
                        {
                            //$scope.selectedInvoiceDetails.HarmDescription = '';
                        }
                        if ($scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb) {
                            $scope.selectedInvoiceDetails.HarmDescription = ($scope.selectedInvoiceDetails.HarmDescription ? $scope.selectedInvoiceDetails.HarmDescription : 'OTHER') + ' - ' + $scope.selectedItemTypeXportObj.originalObject.FTAHarmDescArb;
                        }
                    }
                }
            }
        }
        ////////////////////////END OF FTA HS CODE CHANGE //////////////

        function saveInvoiceAddEdit() {
            $("#loadingInvoiceScreen").show();
            $scope.isBusy = true;
            //if (apiService.isNullOrEmptyOrUndefined($scope.selectedOrigXport)) {
            //    $scope.selectedInvoiceDetails.OriginExpArbCode = '';
            //    $scope.selectedInvoiceDetails.OriginExportCode = '';
            //    $scope.selectedInvoiceDetails.OriginExpEngCode = '';
            //}
            apiService.post('Customs/Invoice/AddUpdateGroupDetail', '', $scope.selectedInvoiceDetails, function (result) {
                $("#loadingInvoiceScreen").hide();
                $scope.isBusy = false;
                var response = result.data.ResponseResult;
                var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Invoice details could not be added/updated";
                if (response.IsValid) {
                    $scope.RefreshInvoiceDetailsAfterSave();
                    $scope.savedSuccess = true;
                    $timeout(function () {
                        $scope.savedSuccess = false;
                    }, 4000);
                    resetEditedIndex();
                    InitializeInvoiceInline($scope.selectedInvoiceGroup, true, null);
                   
                }
                else if (!response.IsValid) {
                    modalErrorShow(msg);
                }
            },
                function (result) {
                    $("#loadingInvoiceScreen").hide();
                    modalErrorShow("An Error has occurred while adding/updating invoice details. " + result);
                });
        }
        //To save Invoice details
        $scope.saveEditedInvoiceDetail = function (invoice) {
            $scope.isValidInvoiceDetails = true;
            setHSCode(true, invoice);
            setOriginExporter(true, invoice);
            setItemType(true, invoice);
            $scope.ValidateHarmonizecCodeEdit($scope.selectedHarmCodeObjEdit[invoice.Item], $scope.selectedHarmCodeEdit[invoice.Item]);
            $scope.ValidateOriginExporterEdit($scope.selectedOrigXportObjEdit[invoice.Item], $scope.selectedOrigXportEdit[invoice.Item]);

            $scope.validItemType = true;
            if ($scope.ftaHSCodeMandatory && $scope.validHarmCode) {
                $scope.ValidateItemTypeEdit($scope.selectedItemTypeObjEdit[invoice.Item], $scope.selectedItemTypeEdit[invoice.Item]);
            }
            $scope.ValidateNetWeight();
            $scope.ValidateGrossWeight();
            $scope.ValidateRequiredFields();
            if ($scope.isValidInvoiceDetails) {
                saveInvoiceAddEdit();
            }
        }
        $scope.SaveInvoiceDetails = function () {
            $scope.isValidInvoiceDetails = true;
            setHSCode(false, null);
            setOriginExporter(false, null);
            setItemType(false, null);
            $scope.ValidateHarmonizecCode();
            $scope.ValidateOriginExporter();

            $scope.validItemType = true;
            if ($scope.ftaHSCodeMandatory && $scope.validHarmCode) {
                $scope.ValidateFTAHSCode();
            }

            $scope.ValidateNetWeight();
            $scope.ValidateGrossWeight();
            $scope.ValidateRequiredFields();
            if ($scope.isValidInvoiceDetails) {
                saveInvoiceAddEdit();
            }
        }
        //Delete Invoice Details
        $scope.deleteIdConfirm = function (index) {
            $scope.savedSuccess = false;
            $("#ConfirmDeleteIDModalPopup").modal("show");
            $scope.deleteRowIndexID = index;
        }
        $scope.deleteOkayID = function () {
            //$scope.deleteSuccess = false;
            //$scope.deleteFailed = false;
            $("#ConfirmDeleteIDModalPopup").modal("hide");
            var delID = $scope.invoiceDetails[$scope.deleteRowIndexID];
            delID.BillType = $scope.CUSTBILL ? $scope.CUSTBILL.CustBillType : '';
            delID.CenterCode = $scope.centerCode;
            apiService.post('Customs/Invoice/DeleteGroupDetail', '', delID, function (result) {
                //$("#loadingScreen").show();
                var data = result.data.ResponseResult;
                var msg = apiService.formatResponseMessage(data.Messages);
                if (data.IsValid) {
                    GetInvoiceGroupData();
                    GetInvoiceDetails();
                    modalSuccessShow(msg);
                    $rootScope.$broadcast('invoiceDetailsSaved', {});
                }
                else if (!response.IsValid) {
                    modalErrorShow(msg);
                }
            },
                function (result) {
                    $("#loadingScreen").hide();
                    $scope.deleteFailed = false;
                });
        }
        //auto scroll down to see the invoice details section
        $scope.gotoAnchor = function (divId) {
            if ($location.hash() !== divId) {
                $location.hash(divId);
            } else {
                $anchorScroll();
            }
        };
        $scope.RefreshInvoiceDetailsAfterSave = function () {
            GetInvoiceGroupData(true);
            GetInvoiceDetails(true);
            $rootScope.$broadcast('invoiceDetailsSaved', {});
        }
        //Refresh the invoice details after preclearance as cust bill number will get updated during preclearnce
        $scope.$on('RefreshInvoiceDetails', function (event, args) {
            GetInvoiceGroupData();
        });
        //////End of Region : Invoice Details /////////////////////

        //#region Exemption 
        $scope.openexemptionEntry = function (item) {
            exemptionEntryGroupInfoService.setValue(item);
            var modalInstance = $uibModal.open({
                templateUrl: '../tpl/exemptionEntry.html',
                size: 'lg', //modal open size large
                backdrop: 'static',
                keyboard: false,
                controller: 'exemptionEntryController',
                resolve: {
                    parameters:
                        function () {
                            return {
                                globalDisableFlag: $rootScope.globalDisableFlag
                            };
                        }
                }
                //resolve: {
                //    parameters:
                //       function () {
                //           return { jobNumber: $stateParams.jobNumber, centerCode: $stateParams.centerCode, };
                //       }
                //}
            });
        }
        //#end Region Exemption

        $rootScope.$on("RefreshInvoiceGroup", function () {
            $scope.invoiceGrpSelected = false;
            $scope.selectedInvoiceGroup = {
            };
            GetInvoiceGroupData();
        });

        $scope.$on('custBillRetrieved', function (event, args) {
            $scope.invoiceGrpSelected = false;
            $scope.selectedInvoiceGroup = {
            };
            SetInvoiceGroupData(args.CustomBillInfo)//set already retrieved custbill data to prevent service call again.
        });


        //#end HazardousMaterials
        ///Lookup Enhancements - Origin Exporter //////////
        $scope.searchOriginExporterText = '';

        $scope.originExporterKeyDown = function (event, mode, invoiceItem) {
            if (event.key == 'F9') {
                $scope.openOriginExporterLookup(mode, invoiceItem);
                $scope.mode = mode;
                $scope.invoiceItem = invoiceItem;
            }
        }
        $scope.PopulateOriginExporter = function () {
            getIndexData('OriginExporter', '', function (data) {
                $scope.originExportersFull = data;
                console.log($scope.originExportersFull);
                $scope.originExporters = angular.copy($scope.originExportersFull);
                console.log($scope.originExporters);
            }, function () {
                apiService.get('Customs/Lookup/OriginExporter',
                    {
                        centerCode: $scope.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.originExportersFull = results.data.ResponseResult.Data;
                        $scope.originExporters = angular.copy($scope.originExportersFull);
                        storeData(results.data.ResponseResult.Data, 'OriginExporter', '');
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data OriginExporter!");
                    })
            });
        }
        $scope.openOriginExporterLookup = function (mode, invoiceItem) {
            $scope.modeOriginExporter = mode;
            $scope.invoiceItem = invoiceItem;
            $scope.searchOriginExporterText = '';
            $('#originExporterLookup').modal({
                backdrop: "static"
            });
            $('#searchOriginExporterText').focus();
            $('#searchOriginExporterText').select();
            $scope.onOriginExporterChange();
            $("#originExporterLookup").off("keydown");
            $('#originExporterLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexOriginExporter < $scope.originExporters.length - 1) {
                                $scope.rowIndexOriginExporter++;
                                if ($scope.rowIndexOriginExporter > 10 * $scope.originExporters - 1) {
                                    $scope.lookUpCurrentPageOriginExporter++;
                                }
                                $scope.originExporterItemSelected = $scope.originExporters[$scope.rowIndexOriginExporter];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexOriginExporter > 0) {

                                if ($scope.rowIndexOriginExporter == 10 * ($scope.lookUpCurrentPageOriginExporter - 1)) {
                                    $scope.lookUpCurrentPageOriginExporter--;
                                }
                                $scope.rowIndexOriginExporter--;
                                $scope.originExporterItemSelected = $scope.originExporters[$scope.rowIndexOriginExporter];
                            }
                            break;
                        case 13:
                            $scope.setOriginExporter($scope.originExporterItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.onOriginExporterChange = function () {
            $scope.rowIndexOriginExporter = 0;
            $scope.lookUpCurrentPageOriginExporter = 1;
            if ($scope.originExportersFull) {
                $scope.originExporters = $scope.originExportersFull.filter(obj => {
                    return obj.OrgnExporterCode.toString().toLowerCase().includes($scope.searchOriginExporterText.toLowerCase()) || (obj.OrgnExporterEngName && obj.OrgnExporterEngName.toLowerCase().includes($scope.searchOriginExporterText.toLowerCase()))
                        || (obj.OrgnExporterArbName && obj.OrgnExporterArbName.toLowerCase().includes($scope.searchOriginExporterText.toLowerCase()));
                });
            }
        }

        $scope.setOriginExporter = function (row) {
            if ($scope.modeOriginExporter == 'add') {
                $scope.selectedOrigXport = row.OrgnExporterCode.toString() + "     " + (row.OrgnExporterEngName ? row.OrgnExporterEngName : '') + "     " + (row.OrgnExporterArbName ? row.OrgnExporterArbName : '');
                $scope.selectedOrigXportObj = {};
                $scope.selectedOrigXportObj.originalObject = row;
                $("#originExporterLookup").modal("hide");
                $('#originExporter_value').focus();
                $('#originExporter_value').select();
            }
            else {
                $scope.selectedOrigXportEdit[$scope.invoiceItem] = row.OrgnExporterCode.toString() + "     " + (row.OrgnExporterEngName ? row.OrgnExporterEngName : '') + "     " + (row.OrgnExporterArbName ? row.OrgnExporterArbName : '');
                $scope.selectedOrigXportObjEdit[$scope.invoiceItem] = {};
                $scope.selectedOrigXportObjEdit[$scope.invoiceItem].originalObject = row;
                $("#originExporterLookup").modal("hide");
                $('#originExporterLookupEdit_value').focus();
                $('#originExporterLookupEdit_value').select();
            }

            $scope.searchOriginExporterText = '';
            $scope.validOriginExporter = true;
        }

        $scope.PopulateOriginExporter();

        $scope.$watch("searchOriginExporterText", function () {
            $scope.onOriginExporterChange();
        });

        $scope.closeOriginExporter = function () {
            $scope.searchOriginExporterText = '';
        }

        ///Lookup Enhancements - Item Type //////////
        $scope.itemTypeKeyDown = function (event, mode, invoiceItem) {

            if (event.key == 'F9' && $scope.ftaHSCodeMandatory) {
                $scope.openItemTypeLookup(mode, invoiceItem);
                $scope.mode = mode;
                $scope.invoiceItem = invoiceItem;
            }
        }

        $scope.PopulateItemType = function () {
            getIndexData('Itemtype', '', function (data) {
                $scope.itemTypesFull = data;
                //$scope.itemTypes = angular.copy($scope.itemTypesFull);
            }, function () {
                apiService.get('Customs/Lookup/FTAHarmonizedCode',
                    {
                        centerCode: $scope.centerCode,
                        searchString: '',
                        ftaHarmCode: ''

                    },
                    function (results) {
                        $scope.itemTypesFull = results.data.ResponseResult.Data;
                        //$scope.itemTypes = angular.copy($scope.itemTypesFull);
                        storeData(results.data.ResponseResult.Data, 'Itemtype', '');
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting lookup Data OriginExporter!");
                    })
            });
        }

        $scope.openItemTypeLookup = function (mode, invoiceItem) {
            $scope.modeItemType = mode;
            $scope.invoiceItem = invoiceItem;
            $scope.searchItemTypeText = '';
            $('#itemTypeLookupModel').modal({
                backdrop: "static"
            });
            $('#searchItemTypeText').focus();
            $('#searchItemTypeText').select();
            $scope.onItemTypeChange();
            console.log($scope.itemTypes);
            $("#itemTypeLookupModel").off("keydown");
            $('#itemTypeLookupModel').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexItemType < $scope.itemTypes.length - 1) {
                                $scope.rowIndexItemType++;
                                if ($scope.rowIndexItemType > 10 * $scope.itemTypes - 1) {
                                    $scope.lookUpCurrentPageItemType++;
                                }
                                $scope.itemTypesSelected = $scope.itemTypes[$scope.rowIndexItemType];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexItemType > 0) {

                                if ($scope.rowIndexItemType == 10 * ($scope.lookUpCurrentPageItemType - 1)) {
                                    $scope.lookUpCurrentPageItemType--;
                                }
                                $scope.rowIndexItemType--;
                                $scope.itemTypesSelected = $scope.itemTypes[$scope.rowIndexItemType];
                            }
                            break;
                        case 13:
                            $scope.setItemtype($scope.itemTypesSelected);
                            break;
                    }
                    
                });
            });
            console.log($scope.itemTypesSelected);
        }

        $scope.onItemTypeChange = function () {
            $scope.rowIndexItemType = 0;
            $scope.lookUpCurrentPageItemType = 1;
            if ($scope.itemsTypesAll) {
                $scope.itemTypes = $scope.itemsTypesAll.filter(obj => {
                    return obj.SerialNo.toString().toLowerCase().includes($scope.searchItemTypeText.toLowerCase()) || (obj.FTAHarmDescEng && obj.FTAHarmDescEng.toLowerCase().includes($scope.searchItemTypeText.toLowerCase()))
                        || (obj.FTAHarmDescArb && obj.FTAHarmDescArb.toLowerCase().includes($scope.searchItemTypeText.toLowerCase()));
                });
            }
        }

        $scope.setItemtype = function (row) {
            if ($scope.modeItemType == 'add') {
                $scope.selectedItemTypeXport = row.SerialNo.toString() + "     " + (row.FTAHarmDescEng ? row.FTAHarmDescEng : '') + "     " + (row.FTAHarmDescArb ? row.FTAHarmDescArb : '');
                $scope.selectedItemTypeXportObj = {};
                $scope.selectedItemTypeXportObj.originalObject = row;
                $("#itemTypeLookupModel").modal("hide");
                $('#itemType_value').focus();
                $('#itemType_value').select();
            }
            else {
                $scope.selectedItemTypeEdit[$scope.invoiceItem] = row.SerialNo.toString() + "     " + (row.FTAHarmDescEng ? row.FTAHarmDescEng : '') + "     " + (row.FTAHarmDescArb ? row.FTAHarmDescArb : '');
                $scope.selectedItemTypeObjEdit[$scope.invoiceItem] = {};
                $scope.selectedItemTypeObjEdit[$scope.invoiceItem].originalObject = row;
                $("#itemTypeLookupModel").modal("hide");
                $('#itemTypeLookupEdit_value').focus();
                $('#itemTypeLookupEdit_value').select();
                enableDisableHSCodeDescription(true, $scope.invoiceItem)
                $scope.itemTypeEdited = true;
            }

            $scope.searchItemTypeText = '';
            $scope.validItemType = true;
        }

        $scope.PopulateItemType();
        $scope.$watch("searchItemTypeText", function () {
            $scope.onItemTypeChange();
        });
        $scope.closeItemType = function () {
            $scope.searchItemTypeText = '';
        }

        //End

        /// Invoice Upload
        $scope.acceptFiles = ".xlsx,.xls";
        $scope.$on("selectedFile", function (event, args) {
            if ($scope.acceptFiles.split(",").includes("." + args.file.name.split(".")[1])) {
                // $("#loadingScreen").show();
                //showLoaderMessage("ss");
                toastr.info('', "Upload in progress <i class='icon-spinner2 spinner position-center pull-right'></i>");
                AddAttachment(args, args.file.name);
                $scope.Message = "Your file is in progress, will inform you once it gets Done";
                showSuccessMessage($scope.Message);
            }
            else {
                modalErrorShow("Attached document is invalid file");
            }

        });
        function AddAttachment(args, name) {
            var chassisErrorValidation = '';
            var chassisErrorValidationWarning = [];
            $('#ChassisErrordivResults').empty();
            var errormsg = "An Error has occurred while uploading file!"
            var serviceAttachInp = {};
            serviceAttachInp.CenterCode = $stateParams.centerCode;
            serviceAttachInp.jobNumber = $stateParams.jobNumber;
            serviceAttachInp.FilePath = args.file.name;
            if (args.file.size > 10485760) {
                $("#loadingScreen").hide();
                $(".toast-info").hide();
                modalErrorShow("Eng: File size is too big Please, File size should not be more than 10mb | Arb: حجم الملف كبير جدًا");
                return;
            }
            var fileAttach = apiService.postfile('Customs/Chassis/BulkUpload', '', args.file, serviceAttachInp, 'Invoice');
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
                if (results.data.IsError) {
                    //results.data.Response.split('&#10;')
                    chassisErrorValidation = '';
                    chassisErrorValidation = "<table class='table table - bordered' border='1'>";
                    for (a = 0; a < results.data.Response.split('&#10;').length; a++) {
                        let weather =
                        {
                            Warning: results.data.Response.split('&#10;')[a]
                        }

                        if (!isNullOrEmptyOrUndefined(weather.Warning)) {
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
                    GetInvoiceGroupData();
                    $rootScope.$broadcast('invoiceDetailsSaved', {});
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

        //GenericLookup Methods Begin

        $scope.setLookupData = function (row, lookupId) {
            switch (lookupId) {
                //case 'ShipmentFrom':
                //    $scope.CUSTBILL.Country = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                //    $scope.selectedOriginCountry = {};
                //    $scope.selectedOriginCountry.originalObject = row;

                //    $('#EnglishCarAgents_value').focus();
                //    break;
                case 'OriginCountry':
                    $scope.selectedCountry = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.selectedCountryObj = {};
                    $scope.selectedCountryObj.originalObject = row;
                    $('#originCountry_value').focus();
                    break;
                case 'Currency':
                    $scope.selectedCurrency = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                    $scope.selectedCurrencyObj = {};
                    $scope.selectedCurrencyObj.originalObject = row;
                    $('#currency_value').focus();
                    break;
                case 'FreightCurrency':
                    $scope.selectedFreightCurr = row.Code.toString() + "     " + (row.NameEnglish ? row.NameEnglish : '') + "     " + (row.NameArabic ? row.NameArabic : '');
                    $scope.selectedFreightCurrencyObj = {};
                    $scope.selectedFreightCurrencyObj.originalObject = row;
                    $('#ddlFreightCurrency_value').focus();
                    break;
            }
            $("#genericLookUp").modal("hide");
            if ($scope.shipmentDetails)
                $scope.shipmentDetails.$setDirty();
        }

        $scope.populateLookupData = function (lookupId) {
            switch (lookupId) {
                case 'ShipmentFrom':
                    break;
            }
        }
        //Generic Lookup
        $scope.onLookupSearhChange = function () {
            var searchText = $("#searchLookupText").val().toLowerCase();
            $timeout(function () {
                switch ($scope.lookupId) {
                    //case 'ShipmentFrom':
                    //    $scope.lookUpCurrentPage = 1;
                    //    if ($scope.country) {
                    //        $scope.lookUpData = $scope.country.filter(obj => {
                    //            return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                    //                || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                    //        });
                    //    }
                    //    break;
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
                    case 'FreightCurrency':
                        $scope.lookUpCurrentPage = 1;
                        if ($scope.freightCurrencyList) {
                            $scope.lookUpData = $scope.freightCurrencyList.filter(obj => {
                                return obj.Code.toString().toLowerCase().includes(searchText) || (obj.NameEnglish && obj.NameEnglish.toLowerCase().includes(searchText))
                                    || (obj.NameArabic && obj.NameArabic.toLowerCase().includes(searchText));
                            });
                        }
                        break;
                }
            });
        }

        $scope.openLookup = function (lookupId) {
            $("#searchLookupText").val("");
            $timeout(function () {
                $scope.lookupId = lookupId;
                switch (lookupId) {
                    //case 'ShipmentFrom':
                    //    $scope.lookUpTitle = $filter("translate")("ShipmentFrom");
                    //    $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                    //    $scope.lookUpData = $scope.country;
                    //    break;
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
                    case 'FreightCurrency':
                        $scope.lookUpTitle = $filter("translate")("FreightCurrency");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }, { Text: "Rate", Width: "" }];
                        $scope.lookUpData = $scope.freightCurrencyList;
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