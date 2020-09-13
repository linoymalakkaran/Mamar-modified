angular.module('mamarApp').controller('invoiceDetailsController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$storage', '$uibModal', 'sharedModels', '$timeout',
    function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $storage, $uibModal, sharedModels, $timeout) {

        $scope.$storage = $storage;

        var jobNumber = $stateParams.jobNumber;
        var centerCode = $stateParams.centerCode;
        //  var selectedMode = $stateParams.selectedMode;        
        $scope.VoucherType = null;
        $scope.CUSTBILL = {};
        $scope.Valid = true;
        $scope.IsInValid = false;
        $scope.IsValidToEmirates = true;
        $scope.IsValidCreditCustomer = true;
        $scope.IsValidShipmentFrom = true;
        $scope.IsValidShipmentTo = true;
        $scope.IsValidExitPort = true;
        $scope.InvalidCreditCustomer = false;
        $scope.InvalidGCCCenter = false;
        $scope.InvalidShipmentFrom = false;
        $scope.InvalidDestCountry = false;
        $scope.InvalidExitPort = false;
        $scope.InvalidGCCNumber = false;
        $scope.IsValidGCCNumber = false;
        $scope.english = true;
        // $scope.$parent.loading = false;   
        $scope.loading = false;

        $scope.custDataParameters = {
            centerCode: centerCode,
            jobNumber: jobNumber,
            OldJobNumber: ''
        };
        $scope.shipmentHeader = {};
        if (sharedModels.shipmentHeader) {
            $scope.shipmentHeader = sharedModels.shipmentHeader;
        }

        $scope.$on('changeLanguage', function (event, args) {
            $scope.english = args.language == 'en' ? true : false;
        });



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

        $scope.getCenterCodes = () => {
            apiService.get('Customs/Lookup/CenterCodes',
                    {
                        transportMode: $scope.selectedMode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.centerCodes = results.data.ResponseResult.Data;
                        if ($scope.centerCodes) {
                            // var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) { return (cenCode.Code == 'V') });
                            $scope.selectedCenterVal = $filter('filter')($scope.centerCodes, { Code: $stateParams.centerCode });
                            $scope.selectedCenter = $scope.selectedCenterVal[0].Code ? $scope.selectedCenterVal[0].Code + "     " : "";
                            $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].EnglishName ? $scope.selectedCenterVal[0].EnglishName + "     " : "");
                            $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].ArabicName ? $scope.selectedCenterVal[0].ArabicName : "");
                            $scope.centerType = $scope.selectedCenterVal[0].CenterType;
                        }
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }, true
                );
        }
        //Method to set/reset global disable flag
        function setGlobalDisableFlag() {
            if ($scope.CUSTBILL) {
                $storage.set('voucherFlag', ($scope.CUSTBILL.VoucherFlag == 'Y' ? true : false));
                $storage.set('globalDisableFlag', ($scope.CUSTBILL.OGAPresent > 0 ? true : false));
            }
        }

        $scope.GetInvoiceData = function () {
            $("#loadingScreen").show();
            //$("#loadingChargeScreen").show();
            apiService.get('Customs/Invoice/GetCustBillInfo', $scope.custDataParameters, function (results) {
                var data = results.data.ResponseResult.Data;
                if (data.CustomBillInfo != null) {
                    $scope.CUSTBILL = data.CustomBillInfo;
                    setGlobalDisableFlag();
                    $scope.extendCustBill();
                    $scope.SealInfo = data.SealInfo;
                    $scope.VoucherType = $scope.CUSTBILL.VoucherType;
                    $scope.$broadcast('custBillRetrieved', { CustbillVoucher: $scope.VoucherType, CustomBillInfo: data });
                    if ($scope.invoice)
                        $scope.invoice.$setPristine();
                    if ($scope.invoiceRemarks)
                        $scope.invoiceRemarks.$setPristine();
                }
                $("#loadingScreen").hide();
            },
        function error(response) {
            $("#loadingScreen").hide();
            //$("#loadingChargeScreen").hide();
            modalErrorShow("An Error has occurred while getting Cust Bill!");
        });
        }

        // get Cust Bill Info
        $scope.GetInvoiceData();
        // $scope.$parent.GetActionStatus();

        ////////Region : Cust Bill Details  /////////////////////
        $scope.extendCustBill = function () {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
                $scope.CUSTBILL.JobNumber = $stateParams.jobNumber;
                $scope.CUSTBILL.SelectedMode = $scope.selectedMode;
                if (($scope.CUSTBILL.CustBillType == 'R' || $scope.CUSTBILL.CustBillType == 'E' || $scope.CUSTBILL.CustBillType == 'O' || $scope.CUSTBILL.CustBillType == 'T'
                    || ($scope.selectedMode == 'A')) && !$scope.CUSTBILL.FromEmirates) {
                    $scope.CUSTBILL.FromEmirates = 'A';
                }

                if (($scope.CUSTBILL.CustBillType !== 'T') && (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.VoucherType) || $scope.CUSTBILL.VoucherType == '1')) {
                    $scope.CUSTBILL.VoucherType = '2';
                }
                if (($scope.CUSTBILL.CustBillType == 'T') && (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.VoucherType) || $scope.CUSTBILL.VoucherType == '1')) {
                    $scope.CUSTBILL.VoucherType = '4';
                }
                if (!$scope.CUSTBILL.ReleaseDate || (new Date($scope.CUSTBILL.ReleaseDate) < new Date())) {
                    $scope.setReleaseDateToCurrentDate();
                }
                else {
                    $scope.ReleaseDate = $filter('date')((new Date($scope.CUSTBILL.ReleaseDate)), "dd/MM/yyyy");
                    $scope.ReleaseTime = $filter('date')((new Date($scope.CUSTBILL.ReleaseDate)), "HH:mm");
                }

                if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Volume)) {
                    $scope.Volume = $scope.CUSTBILL.Volume;
                }
                else {
                    $scope.Volume = '';
                }





                if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.StorageFlag)) {
                    $scope.CUSTBILL.StorageFlag = 'N';
                }


            }

            SetIsGCCBillFlag();
            SetIsStatBillFlag();
            SetIsMaqsaImportFlag();
            SetIsExitFlag();

            GetGCCCenterLookUpFormattedData();
            GetExitPortLookUpFormattedData();
            GetCountryLookUpFormattedData();
            GetDestCountryLookUpFormattedData();
            GetCreditCustomerLookUpFormattedData();
            //  GetRemarks1LookUpFormattedData();   
            //  GetRemarks2LookUpFormattedData(); 
        };

        $scope.SetGCCBillFlag = function () {
            if ($scope.CUSTBILL.IsGCCBillFlag)
                $scope.CUSTBILL.GCCBillFlag = 'Y';
            else
                $scope.CUSTBILL.GCCBillFlag = 'N';
        };

        $scope.SetStatBillFlag = function () {
            if ($scope.CUSTBILL.IsStatBillFlag)
                $scope.CUSTBILL.StatBillFlag = 'Y';
            else
                $scope.CUSTBILL.StatBillFlag = 'N';
        };

        $scope.SetMaqsaImportFlag = function () {
            if ($scope.CUSTBILL.IsMaqsaImportFlag)
                $scope.CUSTBILL.MaqsaImportFlag = 'Y';
            else
                $scope.CUSTBILL.MaqsaImportFlag = 'N';
        };

        $scope.SetIsExitFlag = function () {
            if ($scope.CUSTBILL.IsExitFlag)
                $scope.CUSTBILL.ExitFlag = 'Y';
            else
                $scope.CUSTBILL.ExitFlag = 'N';
        };

        //#region Functions 
        function SetIsGCCBillFlag() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCBillFlag)) {
                if ($scope.CUSTBILL.GCCBillFlag == 'Y') {
                    $scope.CUSTBILL.IsGCCBillFlag = true;
                } else if ($scope.CUSTBILL.GCCBillFlag == 'N') {
                    $scope.CUSTBILL.IsGCCBillFlag = false;
                }
            }
        }

        function SetIsStatBillFlag() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.StatBillFlag)) {
                if ($scope.CUSTBILL.StatBillFlag == 'Y') {
                    $scope.CUSTBILL.IsStatBillFlag = true;
                } else if ($scope.CUSTBILL.StatBillFlag == 'N') {
                    $scope.CUSTBILL.IsStatBillFlag = false;
                }
            }
        }

        function SetIsMaqsaImportFlag() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.MaqsaImportFlag)) {
                if ($scope.CUSTBILL.MaqsaImportFlag == 'Y') {
                    $scope.CUSTBILL.IsMaqsaImportFlag = true;
                } else if ($scope.CUSTBILL.MaqsaImportFlag == 'N') {
                    $scope.CUSTBILL.IsMaqsaImportFlag = false;
                }
                else
                    $scope.CUSTBILL.IsMaqsaImportFlag = false;
            }
            $scope.CUSTBILL.IsMaqsaImportFlag = false;
        }

        function SetIsExitFlag() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitFlag)) {
                if ($scope.CUSTBILL.ExitFlag == 'Y') {
                    $scope.CUSTBILL.IsExitFlag = true;
                } else if ($scope.CUSTBILL.ExitFlag == 'N') {
                    $scope.CUSTBILL.IsExitFlag = false;
                }
                else
                    $scope.CUSTBILL.IsExitFlag = false;
            }
            $scope.CUSTBILL.IsExitFlag = false;
        }

        function GetGCCCenterLookUpFormattedData() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
                $scope.CUSTBILL.GCCCenter = $scope.CUSTBILL.GCCCenterCode ? $scope.CUSTBILL.GCCCenterCode + "     " : "";
                $scope.CUSTBILL.GCCCenter = $scope.CUSTBILL.GCCCenter + ($scope.CUSTBILL.GCCCenterEngName ? $scope.CUSTBILL.GCCCenterEngName + "     " : "");
                $scope.CUSTBILL.GCCCenter = $scope.CUSTBILL.GCCCenter + ($scope.CUSTBILL.GCCCenterArbName ? $scope.CUSTBILL.GCCCenterArbName : "");

                $scope.selectedGCCCenter = {};
                $scope.selectedGCCCenter.originalObject = {};
                $scope.selectedGCCCenter.originalObject.Code = $scope.CUSTBILL.GCCCenterCode;
                $scope.selectedGCCCenter.originalObject.EnglishName = $scope.CUSTBILL.GCCCenterEngName;
                $scope.selectedGCCCenter.originalObject.ArabicName = $scope.CUSTBILL.GCCCenterArbName;
            }
        }

        /* function GetRemarks1LookUpFormattedData() {
             if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
 
            //if($scope.english){
             $scope.selectedRemark1 = {};
             $scope.selectedRemark1.originalObject = {};
             $scope.selectedRemark1.originalObject.RemarkCode = null;
             $scope.selectedRemark1.originalObject.RemarkEngName = $scope.CUSTBILL.Remarks1;
             $scope.selectedRemark1.originalObject.RemarkArbName = $scope.CUSTBILL.Remarks1;
             
             }
                
             }
         
           function GetRemarks2LookUpFormattedData() {
             if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
 
            //if($scope.english){
             $scope.selectedRemark2 = {};
             $scope.selectedRemark2.originalObject = {};
             $scope.selectedRemark2.originalObject.RemarkCode = null;
             $scope.selectedRemark2.originalObject.RemarkEngName = $scope.CUSTBILL.Remarks2;
             $scope.selectedRemark2.originalObject.RemarkArbName = $scope.CUSTBILL.Remarks2;
             
             }
                
             }*/

        function GetExitPortLookUpFormattedData() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
                $scope.CUSTBILL.ExitPort = $scope.CUSTBILL.ExitPortCode ? $scope.CUSTBILL.ExitPortCode + "     " : "";
                $scope.CUSTBILL.ExitPort = $scope.CUSTBILL.ExitPort + ($scope.CUSTBILL.PortEngName ? $scope.CUSTBILL.PortEngName + "     " : "");
                $scope.CUSTBILL.ExitPort = $scope.CUSTBILL.ExitPort + ($scope.CUSTBILL.PortArbName ? $scope.CUSTBILL.PortArbName : "");

                $scope.selectedExitPort = {};
                $scope.selectedExitPort.originalObject = {};
                $scope.selectedExitPort.originalObject.Code = $scope.CUSTBILL.ExitPortCode;
                $scope.selectedExitPort.originalObject.PortNameEnglish = $scope.CUSTBILL.PortEngName;
                $scope.selectedExitPort.originalObject.PortNameArabic = $scope.CUSTBILL.PortArbName;
            }
        }

        function GetCountryLookUpFormattedData() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
                $scope.CUSTBILL.Country = $scope.CUSTBILL.CountCode ? $scope.CUSTBILL.CountCode + "     " : "";
                $scope.CUSTBILL.Country = $scope.CUSTBILL.Country + ($scope.CUSTBILL.CountEngName ? $scope.CUSTBILL.CountEngName + "     " : "");
                $scope.CUSTBILL.Country = $scope.CUSTBILL.Country + ($scope.CUSTBILL.CountArbName ? $scope.CUSTBILL.CountArbName : "");

                $scope.selectedOriginCountry = {};
                $scope.selectedOriginCountry.originalObject = {};
                $scope.selectedOriginCountry.originalObject.Code = $scope.CUSTBILL.CountCode;
                $scope.selectedOriginCountry.originalObject.EnglishName = $scope.CUSTBILL.CountEngName;
                $scope.selectedOriginCountry.originalObject.ArabicName = $scope.CUSTBILL.CountArbName;
            }
        }

        function GetDestCountryLookUpFormattedData() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
                $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountCode ? $scope.CUSTBILL.DestCountCode + "     " : "";
                $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountry + ($scope.CUSTBILL.DestCountEngName ? $scope.CUSTBILL.DestCountEngName + "     " : "");
                $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountry + ($scope.CUSTBILL.DestCountArbName ? $scope.CUSTBILL.DestCountArbName : "");

                $scope.selectedDestCountry = {};
                $scope.selectedDestCountry.originalObject = {};
                $scope.selectedDestCountry.originalObject.Code = $scope.CUSTBILL.DestCountCode;
                $scope.selectedDestCountry.originalObject.EnglishName = $scope.CUSTBILL.DestCountEngName;
                $scope.selectedDestCountry.originalObject.ArabicName = $scope.CUSTBILL.DestCountArbName;
            }
        }

        function GetCreditCustomerLookUpFormattedData() {
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL)) {
                $scope.CUSTBILL.CreditCustomer = $scope.CUSTBILL.CreditCustCode ? $scope.CUSTBILL.CreditCustCode + "     " : "";
                $scope.CUSTBILL.CreditCustomer = $scope.CUSTBILL.CreditCustomer + ($scope.CUSTBILL.CreditCustEngName ? $scope.CUSTBILL.CreditCustEngName + "     " : "");
                $scope.CUSTBILL.CreditCustomer = $scope.CUSTBILL.CreditCustomer + ($scope.CUSTBILL.CreditCustArbName ? $scope.CUSTBILL.CreditCustArbName : "");

                $scope.selectedCreditCustomer = {};
                $scope.selectedCreditCustomer.originalObject = {};
                $scope.selectedCreditCustomer.originalObject.Code = $scope.CUSTBILL.CreditCustCode;
                $scope.selectedCreditCustomer.originalObject.EnglishName = $scope.CUSTBILL.CreditCustEngName;
                $scope.selectedCreditCustomer.originalObject.ArabicName = $scope.CUSTBILL.CreditCustArbName;
            }
        }

        function ValidateCustBill() {
            if ($scope.CUSTBILL.CustBillType == 'I' || $scope.CUSTBILL.CustBillType == 'N') {
                if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.FromEmirates)) {
                    $scope.IsValidToEmirates = false;
                    $scope.Valid = false;
                }
                else {
                    $scope.IsValidToEmirates = true;
                }
            }

            /*   if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.CreditCustomer)){
                        $scope.IsValidCreditCustomer = false; 
                         $scope.Valid = false;   
                   }
                   else {
                  $scope.IsValidCreditCustomer = true;
                  }     */

            if ($scope.CUSTBILL.CustBillType != 'E' && $scope.CUSTBILL.CustBillType != 'R') {
                if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country)) {
                    $scope.IsValidShipmentFrom = false;
                    $scope.Valid = false;
                }
                else {
                    $scope.IsValidShipmentFrom = true;
                }
            }

            if ($scope.CUSTBILL.CustBillType == 'T' || $scope.CUSTBILL.CustBillType == 'O' || $scope.CUSTBILL.CustBillType == 'R' || $scope.CUSTBILL.CustBillType == 'E') {
                if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.DestCountry)) {
                    $scope.IsValidShipmentTo = false;
                    $scope.Valid = false;
                }
                else {
                    $scope.IsValidShipmentTo = true;
                }
            }

            if ($scope.CUSTBILL.CustBillType == 'T' || $scope.CUSTBILL.CustBillType == 'O' || ($scope.CUSTBILL.CustBillType == 'R' && $scope.CUSTBILL.GCCBillFlag == 'Y')) {
                if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort)) {
                    $scope.IsValidExitPort = false;
                    $scope.Valid = false;
                }
                else {
                    $scope.IsValidExitPort = true;
                }
            }

            var creditCustomerSelected = $scope.selectedCreditCustomer ? $scope.selectedCreditCustomer.originalObject.Code + $scope.selectedCreditCustomer.originalObject.EnglishName + $scope.selectedCreditCustomer.originalObject.ArabicName : '';
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.CreditCustomer) && (creditCustomerSelected == 0 || $scope.CUSTBILL.CreditCustomer.replace(/\s/g, '') != creditCustomerSelected.replace(/\s/g, ''))) {
                $scope.InvalidCreditCustomer = true;
                $scope.IsInValid = true;
            }
            else {
                $scope.InvalidCreditCustomer = false;
            }

            /*   var remarks1Selected ='';
                 if($scope.english){
                 remarks1Selected = $scope.selectedRemark1 ? $scope.selectedRemark1.originalObject.RemarkEngName : '';
               if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Remarks1)  && (remarks1Selected==0  || $scope.CUSTBILL.Remarks1.replace(/\s/g, '') != remarks1Selected.replace(/\s/g, ''))) {
                   $scope.InvalidRemarks1 = true;
                   $scope.Valid = false;
               }
               else {
                   $scope.InvalidRemarks1 = false;
               }  
                } else if(!$scope.english){
                      remarks1Selected = $scope.selectedRemark1 ? $scope.selectedRemark1.originalObject.RemarkArbName : '';
               if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Remarks1)  && (remarks1Selected==0  || $scope.CUSTBILL.Remarks1.replace(/\s/g, '') != remarks1Selected.replace(/\s/g, ''))) {
                   $scope.InvalidRemarks1 = true;
                   $scope.Valid = false;
               }
               else {
                   $scope.InvalidRemarks1 = false;
               }  
                }
   
               var remarks2Selected ='';
                 if($scope.english){
                 remarks2Selected = $scope.selectedRemark2 ? $scope.selectedRemark2.originalObject.RemarkEngName : '';
               if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Remarks2) &&  (remarks2Selected==0  || $scope.CUSTBILL.Remarks2.replace(/\s/g, '') != remarks2Selected.replace(/\s/g, ''))) {
                   $scope.InvalidRemarks2 = true;
                   $scope.Valid = false;
               }
               else {
                   $scope.InvalidRemarks2 = false;
               }  
                } else if(!$scope.english){
                      remarks2Selected = $scope.selectedRemark2 ? $scope.selectedRemark2.originalObject.RemarkArbName : '';
               if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Remarks2) && (remarks2Selected==0  || $scope.CUSTBILL.Remarks2.replace(/\s/g, '') != remarks2Selected.replace(/\s/g, ''))) {
                   $scope.InvalidRemarks2 = true;
                   $scope.Valid = false;
               }
               else {
                   $scope.InvalidRemarks2 = false;
               }  
                }*/


            var GCCCenterSelected = $scope.selectedGCCCenter ? $scope.selectedGCCCenter.originalObject.Code + $scope.selectedGCCCenter.originalObject.EnglishName + $scope.selectedGCCCenter.originalObject.ArabicName : '';
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCCenter) && (GCCCenterSelected == 0 || $scope.CUSTBILL.GCCCenter.replace(/\s/g, '') != GCCCenterSelected.replace(/\s/g, ''))) {
                $scope.InvalidGCCCenter = true;
                $scope.IsInValid = true;
            }
            else {
                $scope.InvalidGCCCenter = false;
            }

            var shipmentFromSelected = $scope.selectedOriginCountry ? $scope.selectedOriginCountry.originalObject.Code + ($scope.selectedOriginCountry.originalObject.EnglishName ? $scope.selectedOriginCountry.originalObject.EnglishName : '') + ($scope.selectedOriginCountry.originalObject.ArabicName ? $scope.selectedOriginCountry.originalObject.ArabicName : '') : '';
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country) && (shipmentFromSelected == 0 || $scope.CUSTBILL.Country.replace(/\s/g, '') != shipmentFromSelected.replace(/\s/g, ''))) {
                $scope.InvalidShipmentFrom = true;
                $scope.IsInValid = true;
            }
            else {
                $scope.InvalidShipmentFrom = false;
            }

            var destCountrySelected = $scope.selectedDestCountry && $scope.selectedDestCountry.originalObject && $scope.selectedDestCountry.originalObject.Code ? $scope.selectedDestCountry.originalObject.Code + ($scope.selectedDestCountry.originalObject.EnglishName ? $scope.selectedDestCountry.originalObject.EnglishName : '') + ($scope.selectedDestCountry.originalObject.ArabicName ? $scope.selectedDestCountry.originalObject.ArabicName : '') : '';
            if ($scope.CUSTBILL.DestCountry && (destCountrySelected == 0 || $scope.CUSTBILL.DestCountry.replace(/\s/g, '') != destCountrySelected.replace(/\s/g, ''))) {
                $scope.InvalidDestCountry = true;
                $scope.IsInValid = true;
            }
            else {
                $scope.InvalidDestCountry = false;
            }


            var entryPointSelected = $scope.selectedExitPort ? $scope.selectedExitPort.originalObject.Code + $scope.selectedExitPort.originalObject.PortNameEnglish + $scope.selectedExitPort.originalObject.PortNameArabic : '';
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort) && (entryPointSelected == 0 || $scope.CUSTBILL.ExitPort.replace(/\s/g, '') != entryPointSelected.replace(/\s/g, ''))) {
                $scope.InvalidExitPort = true;
                $scope.IsInValid = true;
            }
            else {
                $scope.InvalidExitPort = false;
            }

            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCNumber) && $scope.CUSTBILL.GCCNumber.toString().length > 65) {
                $scope.InvalidGCCNumber = true;
                $scope.IsInValid = true;
            }
            else {
                $scope.InvalidGCCNumber = false;
            }
        }
        //#End Region


        //#region Lookup 
        function getEmiratesLookupData() {
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

        $scope.GCCCenterChanged = function (searchStr) {
            $scope.CUSTBILL.GCCCenter = searchStr;
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCCenter)) {
                apiService.get('Customs/Lookup/EntryCenter',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: $scope.CUSTBILL.GCCCenter
                },
                function (results) {
                    $scope.GCCCenters = results.data.ResponseResult.Data; //.slice(0, 10);
                },
                function error(response) {
                    modalErrorShow("An Error has occurred while getting Lookup Data!");
                });
            }
        };

        //$scope.Remarks1Changed = function (searchStr) {
        //    $scope.CUSTBILL.Remarks1 = searchStr;
        //    if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Remarks1)) {
        //        apiService.get('Customs/Lookup/Remarks',
        //        {
        //            centerCode: $stateParams.centerCode,
        //            searchString: $scope.CUSTBILL.Remarks1
        //        },
        //        function (results) {
        //            $scope.remarks1 = results.data.ResponseResult.Data; //.slice(0, 10);
        //        },
        //        function error(response) {
        //            modalErrorShow("An Error has occurred while getting Lookup Data!");
        //        });
        //    }
        //};

        //$scope.Remarks2Changed = function (searchStr) {
        //    $scope.CUSTBILL.Remarks2 = searchStr;
        //    if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Remarks2)) {
        //        apiService.get('Customs/Lookup/Remarks',
        //        {
        //            centerCode: $stateParams.centerCode,
        //            searchString: $scope.CUSTBILL.Remarks2
        //        },
        //        function (results) {
        //            $scope.remarks2 = results.data.ResponseResult.Data; //.slice(0, 10);
        //        },
        //        function error(response) {
        //            modalErrorShow("An Error has occurred while getting Lookup Data!");
        //        });
        //    }
        //};

        $scope.EntryPointChanged = function (searchStr) {
            $scope.CUSTBILL.ExitPort = searchStr;
            if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort)) {
                apiService.get('Customs/Lookup/ExitPortList',
                {
                    centerCode: $stateParams.centerCode,
                    //   CompanyCode: '',
                    //   UserCode: '',
                    searchString: $scope.CUSTBILL.ExitPort
                    //  CountryCode: 'UAE'
                },
                function (results) {
                    $scope.exitPort = results.data.ResponseResult.Data; //.slice(0, 10);
                },
                function error(response) {
                    modalErrorShow("An Error has occurred while getting Lookup Data!");
                });
            }
        };


        $scope.DestinationChanged = function (searchStr) {
            $scope.CUSTBILL.DestCountry = searchStr;
            //if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.DestCountry)) {
            //    apiService.get('Customs/Lookup/ShipmentCountries',
            //     {
            //         centerCode: $stateParams.centerCode,
            //         searchString: $scope.CUSTBILL.DestCountry
            //     },
            //     function (results) {
            //         $scope.destCountry = results.data.ResponseResult.Data;
            //     },
            //     function error(response) {
            //         modalErrorShow("An Error has occurred while getting Lookup Data!");
            //     });
            //}
        };

        $scope.OriginChanged = function (searchStr) {
            $scope.CUSTBILL.Country = searchStr;
            //if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country)) {
            //    apiService.get('Customs/Lookup/ShipmentCountries',
            //     {
            //         centerCode: $stateParams.centerCode,
            //         searchString: $scope.CUSTBILL.Country
            //     },
            //     function (results) {
            //         $scope.country = results.data.ResponseResult.Data;
            //     },
            //     function error(response) {
            //         modalErrorShow("An Error has occurred while getting Lookup Data!");
            //     });
            //}
        };
        function populateShipmentCountriesModel() {
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
        populateShipmentCountriesModel();
        function shipmentCountriesModel() {
            getIndexData('ShipmentCountry', '', function (data) {
                $scope.countryList = data;
            }, function () {
                apiService.get('Customs/Lookup/ShipmentCountries',
                    {
                        centerCode: $stateParams.centerCode,
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
        shipmentCountriesModel();



        function currencyModel() {
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
        currencyModel();
       
        $scope.setReleaseDateToCurrentDate = function () {
            var releaseDate = new Date();
            $scope.ReleaseDate = $filter('date')((new Date(releaseDate)), "dd/MM/yyyy");
            $scope.ReleaseTime = $filter('date')((new Date(releaseDate)), "HH:mm");
        }

        //$scope.changeVolume = function () {
        //    if ($scope.CUSTBILL.Volume !== $scope.Volume) {
        //        $scope.setReleaseDateToCurrentDate();
        //    }
        //};

        //#region Save/Update of CustBill Information.
        $scope.saveCUSTBillInformation = function (isBackGround, moveToShipment, validateClicked,voucherChange) {
            if ((moveToShipment || validateClicked) && ($scope.invoice.$dirty || $scope.invoiceRemarks.$dirty)) {
                var unsavedChangesMsg = $filter('translate')('UnSavedChangesMsg');
                modalWarningConfirmShow(unsavedChangesMsg);
                return;
            }

            if (validateClicked && !($scope.invoice.$dirty && $scope.invoiceRemarks.$dirty)) {
                $rootScope.$broadcast('validateClickedWithFormChange', {});
                return;
            }
            if (moveToShipment && !($scope.invoice.$dirty && $scope.invoiceRemarks.$dirty)) {
                $rootScope.$broadcast('shipmentTabClicked', { isSaveSuccess: true, moveToShipment: moveToShipment, CustbillVoucher: $scope.VoucherType });
                return;
            }

            if ($storage.get('globalDisableFlag') || $storage.get('voucherFlag') || $storage.get('isPcsSuperUser')) {
                if (isBackGround) {
                    $rootScope.$broadcast('custBillSaved', { isSaveSuccess: true, moveToShipment: moveToShipment, CustbillVoucher: $scope.VoucherType });
                    return;
                }
            }
            else {

                var voucherTemp = $scope.VoucherType;
                $scope.VoucherType = $scope.CUSTBILL.VoucherType; //For restoring when some validation error happened.
                $("#loadingScreen").show();
                ValidateCustBill();
                if (!$scope.Valid) {
                    $scope.Valid = true;
                    $("#loadingScreen").hide();
                    modalErrorShow('Please enter the required fields');
                    return false;
                }

                if ($scope.IsInValid) {
                    $scope.IsInValid = false;
                    $("#loadingScreen").hide();
                    modalErrorShow('Please enter the Valid Value');
                    return false;
                }

                $scope.VoucherType = voucherTemp;
                $scope.CUSTBILL.VoucherType = $scope.VoucherType;


                if (!apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCNumber)) {

                    apiService.get('Customs/BillOfLading/validateGCCNumber',
                            {
                                centerCode: $stateParams.centerCode,
                                jobNumber: $stateParams.jobNumber,
                                GCCNumber: $scope.CUSTBILL.GCCNumber
                            },
                             function (result) {



                                 var data = result.data.ResponseResult;
                                 var msg = apiService.formatResponseMessage(data.Messages);

                                 if (data) {
                                     if (data.IsValid) {
                                         $scope.CUSTBILL.Country = data.Data.CountryCode ? data.Data.CountryCode + "     " : "";
                                         $scope.CUSTBILL.Country = $scope.CUSTBILL.Country + (data.Data.CountryEng ? data.Data.CountryEng + "     " : "");
                                         $scope.CUSTBILL.Country = $scope.CUSTBILL.Country + (data.Data.CountryArb ? data.Data.CountryArb : "");

                                         $scope.selectedOriginCountry = {};
                                         $scope.selectedOriginCountry.originalObject = {};
                                         $scope.selectedOriginCountry.originalObject.Code = data.Data.CountryCode;
                                         $scope.selectedOriginCountry.originalObject.EnglishName = data.Data.CountryEng;
                                         $scope.selectedOriginCountry.originalObject.ArabicName = data.Data.CountryArb;

                                         $scope.CUSTBILL.DestCountry = data.Data.DestCountryCode ? data.Data.DestCountryCode + "     " : "";
                                         $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountry + (data.Data.DestCountryEng ? data.Data.DestCountryEng + "     " : "");
                                         $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountry + (data.Data.DestCountryArb ? data.Data.DestCountryArb : "");

                                         $scope.selectedDestCountry = {};
                                         $scope.selectedDestCountry.originalObject = {};
                                         $scope.selectedDestCountry.originalObject.Code = data.Data.DestCountryCode;
                                         $scope.selectedDestCountry.originalObject.EnglishName = data.Data.DestCountryEng;
                                         $scope.selectedDestCountry.originalObject.ArabicName = data.Data.DestCountryArb;


                                         if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCreditCustomer) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.CreditCustomer)) {
                                             $scope.CUSTBILL.CreditCustCode = $scope.selectedCreditCustomer.originalObject.Code;
                                         }
                                         else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.CreditCustomer)) {
                                             $scope.CUSTBILL.CreditCustCode = "";
                                         }

                                         if (!apiService.isNullOrEmptyOrUndefined($scope.selectedGCCCenter) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCCenter)) {
                                             $scope.CUSTBILL.GCCCenterCode = $scope.selectedGCCCenter.originalObject.Code;
                                         }
                                         else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCCenter)) {
                                             $scope.CUSTBILL.GCCCenterCode = "";
                                         }

                                         if (!apiService.isNullOrEmptyOrUndefined($scope.selectedOriginCountry) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country)) {
                                             $scope.CUSTBILL.CountCode = $scope.selectedOriginCountry.originalObject.Code;
                                         }
                                         else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country)) {
                                             $scope.CUSTBILL.CountCode = "";
                                         }

                                         if (!apiService.isNullOrEmptyOrUndefined($scope.selectedDestCountry) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.DestCountry)) {
                                             $scope.CUSTBILL.DestCountCode = $scope.selectedDestCountry.originalObject.Code;
                                         }
                                         else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.DestCountry)) {
                                             $scope.CUSTBILL.DestCountCode = "";
                                         }

                                         if (!apiService.isNullOrEmptyOrUndefined($scope.selectedExitPort) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort)) {
                                             $scope.CUSTBILL.ExitPortCode = $scope.selectedExitPort.originalObject.Code;
                                         }
                                         else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort)) {
                                             $scope.CUSTBILL.ExitPortCode = "";
                                         }



                                         if (!apiService.isNullOrEmptyOrUndefined($scope.Volume)) {
                                             $scope.CUSTBILL.Volume = $scope.Volume;
                                         }

                                         if (!apiService.isNullOrEmptyOrUndefined($scope.ReleaseDate)) {
                                             $scope.CUSTBILL.ReleaseDate = $filter('date')(new Date(apiService.formatDateTimeObject($scope.ReleaseDate + " " + $("#ReleasTimeData").val())), "MM/dd/yyyy HH:mm");
                                             if (new Date($scope.CUSTBILL.ReleaseDate) < new Date()) {
                                                 $scope.CUSTBILL.ReleaseDate = new Date();
                                             }
                                         }

                                         // var date =  moment('26/05/1986 00:00', 'DD/MM/YYYY HH:mm').format("MM/DD/YYYY HH:mm"); ArrivalDate

                                         //$("#loadingChargeScreen").show();
                                         apiService.post('Customs/Invoice/UpdateCustBillInfo', '', $scope.CUSTBILL,
                                            function (result) {
                                                var data = result.data.ResponseResult;
                                                var msg = apiService.formatResponseMessage(data.Messages);
                                                if (data) {
                                                    if (data.IsValid) {

                                                        $("#loadingScreen").hide();
                                                        //$('#successModal').modal('show');
                                                        if (!isBackGround) {
                                                            modalSuccessShow('Done Successfully !');
                                                            //if ($scope.CUSTBILL.ReleaseDate < $scope.shipmentHeader.ArrivalDate)
                                                            //{
                                                            //    modalErrorShow("Warning : Cargo release date less than the arrival date");
                                                            //}
                                                        }
                                                        $rootScope.$broadcast('custBillSaved', { isSaveSuccess: true, moveToShipment: moveToShipment, CustbillVoucher: $scope.VoucherType });
                                                        $scope.GetInvoiceData();
                                                    }
                                                    else if (!data.IsValid) {
                                                        $("#loadingScreen").hide();
                                                        modalErrorShow(msg);
                                                        $rootScope.$broadcast('custBillSaved', { isSaveSuccess: false, moveToShipment: false, CustbillVoucher: $scope.VoucherType });
                                                        // return;
                                                        if (voucherChange)
                                                        {
                                                            $scope.GetInvoiceData();
                                                        }
                                                    }
                                                }
                                                $("#loadingScreen").hide();

                                            },

                                            function (result) {
                                                //$("#loadingChargeScreen").hide();
                                                $("#loadingScreen").hide();
                                                modalErrorShow("An Error has occurred while updating Cust Bill Data!");
                                                $rootScope.$broadcast('custBillSaved', { isSaveSuccess: false, moveToShipment: false, CustbillVoucher: $scope.VoucherType });
                                            });
                                     }
                                     else if (!data.IsValid) {
                                         $scope.CUSTBILL.Country = '';
                                         $scope.CUSTBILL.DestCountry = '';
                                         $scope.CUSTBILL.GCCNumber = '';
                                         $("#loadingScreen").hide();
                                         modalErrorShow(msg);
                                         $rootScope.$broadcast('custBillSaved', { isSaveSuccess: false, moveToShipment: false, CustbillVoucher: $scope.VoucherType });
                                     }
                                 }
                                 $("#loadingScreen").hide();


                             },

                           function (result) {
                               $("#loadingScreen").hide();
                               modalErrorShow("An Error has occurred while validating GCC Number!");
                               $rootScope.$broadcast('custBillSaved', { isSaveSuccess: false, moveToShipment: false, CustbillVoucher: $scope.VoucherType });

                           });

                }
                else {

                    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCreditCustomer) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.CreditCustomer)) {
                        $scope.CUSTBILL.CreditCustCode = $scope.selectedCreditCustomer.originalObject.Code;
                    }
                    else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.CreditCustomer)) {
                        $scope.CUSTBILL.CreditCustCode = "";
                    }

                    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedGCCCenter) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCCenter)) {
                        $scope.CUSTBILL.GCCCenterCode = $scope.selectedGCCCenter.originalObject.Code;
                    }
                    else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.GCCCenter)) {
                        $scope.CUSTBILL.GCCCenterCode = "";
                    }

                    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedOriginCountry) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country)) {
                        $scope.CUSTBILL.CountCode = $scope.selectedOriginCountry.originalObject.Code;
                    }
                    else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.Country)) {
                        $scope.CUSTBILL.CountCode = "";
                    }

                    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedDestCountry) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.DestCountry)) {
                        $scope.CUSTBILL.DestCountCode = $scope.selectedDestCountry.originalObject.Code;
                    }
                    else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.DestCountry)) {
                        $scope.CUSTBILL.DestCountCode = "";
                    }

                    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedExitPort) && !apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort)) {
                        $scope.CUSTBILL.ExitPortCode = $scope.selectedExitPort.originalObject.Code;
                    }
                    else if (apiService.isNullOrEmptyOrUndefined($scope.CUSTBILL.ExitPort)) {
                        $scope.CUSTBILL.ExitPortCode = "";
                    }
                    if (!apiService.isNullOrEmptyOrUndefined($scope.Volume)) {
                        $scope.CUSTBILL.Volume = $scope.Volume;
                    }

                    if (!apiService.isNullOrEmptyOrUndefined($scope.ReleaseDate)) {
                        $scope.CUSTBILL.ReleaseDate = $filter('date')(new Date(apiService.formatDateTimeObject($scope.ReleaseDate + " " + $("#ReleasTimeData").val())), "MM/dd/yyyy HH:mm");
                        if (new Date($scope.CUSTBILL.ReleaseDate) < new Date()) {
                            $scope.CUSTBILL.ReleaseDate = new Date();
                        }
                    }
                    // var date =  moment('26/05/1986 00:00', 'DD/MM/YYYY HH:mm').format("MM/DD/YYYY HH:mm");
                    //$("#loadingChargeScreen").show();
                    apiService.post('Customs/Invoice/UpdateCustBillInfo', '', $scope.CUSTBILL,
                       function (result) {
                           var data = result.data.ResponseResult;
                           var msg = apiService.formatResponseMessage(data.Messages);
                           if (data) {
                               if (data.IsValid) {
                                   $("#loadingScreen").hide();
                                   //$('#successModal').modal('show');
                                   if (!isBackGround) {
                                       modalSuccessShow('Done Successfully !');
                                       //if ($scope.CUSTBILL.ReleaseDate < $scope.shipmentHeader.ArrivalDate) {
                                       //    modalErrorShow("Warning : Cargo release date less than the arrival date");
                                       //}
                                   }
                                   $rootScope.$broadcast('custBillSaved', { isSaveSuccess: true, moveToShipment: moveToShipment, CustbillVoucher: $scope.VoucherType, voucherRadioClicked: voucherChange});
                                   $scope.GetInvoiceData();
                               }
                               else if (!data.IsValid) {
                                   $("#loadingScreen").hide();
                                   modalErrorShow(msg);
                                   $rootScope.$broadcast('custBillSaved', { isSaveSuccess: false, moveToShipment: false, CustbillVoucher: $scope.VoucherType });
                                   if (voucherChange) {
                                       $scope.GetInvoiceData();
                                   }
                               }
                           }
                           $("#loadingScreen").hide();

                       },

                       function (result) {
                           // $("#loadingChargeScreen").hide();
                           $("#loadingScreen").hide();
                           modalErrorShow("An Error has occurred while updating Cust Bill Data!");
                           $rootScope.$broadcast('custBillSaved', { isSaveSuccess: false, moveToShipment: false, CustbillVoucher: $scope.VoucherType });

                       });
                }
            }
        };

        //#End Region  

        //////End of Region : Cust Bill Details /////////////////////

        $scope.ValidateGCCNumber = function () {
            $("#loadingScreen").show();

            apiService.get('Customs/BillOfLading/validateGCCNumber',
                    {
                        centerCode: $stateParams.centerCode,
                        jobNumber: $stateParams.jobNumber,
                        GCCNumber: $scope.CUSTBILL.GCCNumber
                    },
                     function (result) {
                         debugger;
                         var data = result.data.ResponseResult;
                         var msg = apiService.formatResponseMessage(data.Messages);

                         if (data) {
                             if (data.IsValid) {
                                 $scope.CUSTBILL.Country = data.Data.CountryCode ? data.Data.CountryCode + "     " : "";
                                 $scope.CUSTBILL.Country = $scope.CUSTBILL.Country + (data.Data.CountryEng ? data.Data.CountryEng + "     " : "");
                                 $scope.CUSTBILL.Country = $scope.CUSTBILL.Country + (data.Data.CountryArb ? data.Data.CountryArb : "");

                                 $scope.selectedOriginCountry = {};
                                 $scope.selectedOriginCountry.originalObject = {};
                                 $scope.selectedOriginCountry.originalObject.Code = data.Data.CountryCode;
                                 $scope.selectedOriginCountry.originalObject.EnglishName = data.Data.CountryEng;
                                 $scope.selectedOriginCountry.originalObject.ArabicName = data.Data.CountryArb;

                                 $scope.CUSTBILL.DestCountry = data.Data.DestCountryCode ? data.Data.DestCountryCode + "     " : "";
                                 $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountry + (data.Data.DestCountryEng ? data.Data.DestCountryEng + "     " : "");
                                 $scope.CUSTBILL.DestCountry = $scope.CUSTBILL.DestCountry + (data.Data.DestCountryArb ? data.Data.DestCountryArb : "");

                                 $scope.selectedDestCountry = {};
                                 $scope.selectedDestCountry.originalObject = {};
                                 $scope.selectedDestCountry.originalObject.Code = data.Data.DestCountryCode;
                                 $scope.selectedDestCountry.originalObject.EnglishName = data.Data.DestCountryEng;
                                 $scope.selectedDestCountry.originalObject.ArabicName = data.Data.DestCountryArb;
                                 $scope.IsValidGCCNumber = true;
                                 $("#loadingScreen").hide();
                                 modalSuccessShow(msg);
                                 return;
                             }
                             else if (!data.IsValid) {
                                 $scope.IsValidGCCNumber = false;
                                 $scope.CUSTBILL.Country = '';
                                 $scope.CUSTBILL.DestCountry = '';
                                 $scope.CUSTBILL.GCCNumber = '';
                                 $("#loadingScreen").hide();
                                 modalErrorShow(msg);
                                 return;
                             }
                         }
                         $("#loadingScreen").hide();

                     },

                   function (result) {
                       $("#loadingScreen").hide();
                       $scope.IsValidGCCNumber = false;
                       modalErrorShow("An Error has occurred while validating GCC Number!");
                   });
        }
        //#Region Inspection
        $scope.openInspection = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '../tpl/inspection.html',
                size: 'lg', //modal open size large
                backdrop: 'static',
                keyboard: false,
                controller: 'inspectionController'
            });
        }
        //#End Region    

        //#Region Inspection
        $scope.openSealDetails = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '../tpl/sealDetails.html',
                size: 'lg', //modal open size large
                backdrop: 'static',
                keyboard: false,
                controller: 'sealsController',
                resolve: {
                    parameters:
                function () {
                    return { jobNumber: $stateParams.jobNumber, centerCode: $stateParams.centerCode, custDataParameters: $scope.custDataParameters };
                }
                }
            });
        }
        //#End Region    

        $scope.voucherRadioClicked = function () {
            $scope.saveCUSTBillInformation(null,null,null,true);
        }

        $scope.$on('ValidateShipmnetAndInvoiceDone', function (event, args) {

            $scope.GetInvoiceData();
        });

        //This has been commented on 14/Jan/2019 as per Vini's suggestion to improve performance by removing auto save

        $scope.$on('ShouldSaveCustBill', function (event, args) {
            var isSaved = $scope.saveCUSTBillInformation(true, args.moveToShipment, args.validateClicked);
            //$rootScope.$broadcast('custBillSaved', { isSaveSuccess: isSaved, moveToShipment: args.moveToShipment, CustbillVoucher: $scope.VoucherType });
        });

        $scope.$on('refreshAfterSendPreclear', function (event) {
            $scope.GetInvoiceData();
        });

        $scope.openReleaseDate = function () {
            $timeout(function () {
                $("#relaseDateControl").trigger('click');
            });
        }

        getEmiratesLookupData();

        ///Logic added for populating center codes from server if localstorage center code is empty
        ///else populate from local storage which is being stored in transaction list screen 
        ///This logic has been implemented as part of performance fine tuning actvity on 18/Apr/2019
        var storedCenterCodes = $storage.get('storedCenterCodes');
        if (storedCenterCodes) {
            $scope.centerCodes = storedCenterCodes;
            if ($scope.centerCodes) {
                $scope.selectedCenterVal = $filter('filter')($scope.centerCodes, { Code: $stateParams.centerCode });
                $scope.selectedCenter = $scope.selectedCenterVal[0].Code ? $scope.selectedCenterVal[0].Code + "     " : "";
                $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].EnglishName ? $scope.selectedCenterVal[0].EnglishName + "     " : "");
                $scope.selectedCenter = $scope.selectedCenter + ($scope.selectedCenterVal[0].ArabicName ? $scope.selectedCenterVal[0].ArabicName : "");
                $scope.centerType = $scope.selectedCenterVal[0].CenterType;
            }
        }
        else {
            $scope.getCenterCodes();
        }
        ///////////Credit Customer Lookup Enhancement --------------

        $scope.searchCreditCustomerText = '';
        //function initializeSearchParameters() {
        //    $scope.searchParameter = {
        //        telephone: '',
        //        mobile: '',
        //        fileNumber: '',
        //        cityCode: '',
        //        addcCode: '',
        //        municipCode: '',
        //        poBox: '',
        //        categoryCode: '',
        //        importername: '',
        //        pageSize: 10,
        //        orderBy: '',
        //        pageNumber: 1,
        //        centerCode: $stateParams.centerCode
        //    };
        //}
        $scope.creditCustomerKeyDown = function (event) {
            if (event.key == 'F9') {
                //$scope.clearSearchFilters();
                $scope.openCreditCustomerLookup();
            }
        }
        //$scope.loadMoreRecords = function (newPageNo) {
        //    $scope.searchParameter.pageNumber = newPageNo;
        //    $scope.PopulateCreditCustomer();
        //}
        $scope.PopulateCreditCustomer = function (searchStr) {

            //Oil Companies look up changed to normal importer exporter lookup as per Business
            //$scope.stoppedSearch = false;
            //apiService.get('Customs/Lookup/GetOilCompanies',
            //{
            //    centerCode: $stateParams.centerCode,
            //    searchString: searchStr
            //},
            //function (results) {
            //    $scope.creditCustomers = results.data.ResponseResult.Data; //.slice(0, 10);
            //    $scope.stoppedSearch = true;
            //},
            //function error(response) {
            //    console.log("An Error has occurred while getting Lookup Data in Credit Customer");
            //    $scope.stoppedSearch = true;
            //});

            //if (searchStr && searchStr.length >= 3) {
                apiService.get('Customs/Lookup/ImporterExporter',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.creditCustomers = results.data.ResponseResult.Data;
                },
                function error(response) {
                    console.log("An Error has occurred while getting lookup Data -Credit Customer!", response);
                });
            //}
        }

        $scope.onCreditCustomerChange = function (searchStr) {
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageCreditCustomer = 1;
            $scope.PopulateCreditCustomer(searchStr);
        };


        $scope.openCreditCustomerLookup = function (item) {
            $scope.searchCreditCustomerText = '';
            $('#creditCustomerLookup').modal({
                backdrop: "static"
            });
            $('#searchCreditCustomerText').focus();
            $('#searchCreditCustomerText').select();
            $scope.onCreditCustomerChange($scope.searchCreditCustomerText);
            $("#creditCustomerLookup").off("keydown");
            $('#creditCustomerLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexCreditCustomer < $scope.creditCustomers.length - 1) {
                                $scope.rowIndexCreditCustomer++;
                                if ($scope.rowIndexCreditCustomer > 10 * $scope.creditCustomers - 1) {
                                    $scope.lookUpCurrentPageCreditCustomer++;
                                }
                                $scope.creditCustomerItemSelected = $scope.creditCustomers[$scope.rowIndexCreditCustomer];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexCreditCustomer > 0) {

                                if ($scope.rowIndexCreditCustomer == 10 * ($scope.lookUpCurrentPageCreditCustomer - 1)) {
                                    $scope.lookUpCurrentPageCreditCustomer--;
                                }
                                $scope.rowIndexCreditCustomer--;
                                $scope.creditCustomerItemSelected = $scope.creditCustomers[$scope.rowIndexCreditCustomer];
                            }
                            break;
                        case 13:
                            $scope.setCreditCustomer($scope.creditCustomerItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.setCreditCustomer = function (row) {
            $scope.CUSTBILL.CreditCustomer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            $scope.selectedCreditCustomer = {};
            $scope.selectedCreditCustomer.originalObject = row;
            $("#creditCustomerLookup").modal("hide");
            $('#CreditCust_value').focus();
        }

        $scope.$watch("searchCreditCustomerText", function () {
            if ($scope.searchCreditCustomerText)
                $scope.onCreditCustomerChange($scope.searchCreditCustomerText);
        });

        $scope.$watchCollection("CUSTBILL.CreditCustomer", function () {
            if ($scope.CUSTBILL && !($scope.CUSTBILL.CreditCustomer)) {
                $scope.selectedCreditCustomer = {};
                $scope.selectedCreditCustomer.originalObject = {};
                $scope.selectedCreditCustomer.originalObject.Code = null;
                $scope.selectedCreditCustomer.originalObject.EnglishName = null;
                $scope.selectedCreditCustomer.originalObject.ArabicName = null;
                $scope.selectedCreditCustomer.originalObject.CategoryCode = null;
            }
        });

        function GetCategoryCodes() {
            getIndexData('ImporterCategory', '', function (data) {
                $scope.categoryCodes = data;
                $("#selectCategory").select2();
            }, function () {
                apiService.get('Customs/Lookup/ImporterCategory',
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.categoryCodes = results.data.ResponseResult.Data;
                        storeData(results.data.ResponseResult.Data, 'ImporterCategory', '');
                        $("#selectCategory").select2();
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                )
            });
        }
        GetCategoryCodes();

        ///////////Remarks1 Lookup Enhancement --------------

        $scope.searchRemarks1Text = '';

        $scope.remarks1KeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openRemarks1Lookup();
            }
        }


        $scope.openRemarks1Lookup = function (item) {
            $scope.searchRemarks1Text = '';
            $('#remarks1Lookup').modal({
                backdrop: "static"
            });
            $('#searchRemarks1Text').focus();
            $('#searchRemarks1Text').select();
            $scope.onRemarks1Change($scope.searchRemarks1Text);
            $("#remarks1Lookup").off("keydown");
            $('#remarks1Lookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexRemarks1 < $scope.remarks1.length - 1) {
                                $scope.rowIndexRemarks1++;
                                if ($scope.rowIndexRemarks1 > 10 * $scope.remarks1 - 1) {
                                    $scope.remarks1CurrentPage++;
                                }
                                $scope.remarks1ItemSelected = $scope.remarks1[$scope.rowIndexRemarks1];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexRemarks1 > 0) {

                                if ($scope.rowIndexRemarks1 == 10 * ($scope.remarks1CurrentPage - 1)) {
                                    $scope.remarks1CurrentPage--;
                                }
                                $scope.rowIndexRemarks1--;
                                $scope.remarks1ItemSelected = $scope.remarks1[$scope.rowIndexRemarks1];
                            }
                            break;
                        case 13:
                            $scope.setRemarks1($scope.remarks1ItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.onRemarks1Change = function (searchStr) {
            $scope.rowIndexRemarks1 = 0;
            $scope.remarks1CurrentPage = 1;
            PopulateRemarks(searchStr, 1);
        }

        $scope.setRemarks1 = function (row) {

            $scope.CUSTBILL.Remarks1 = row ? row.RemarkArbName : '';
            $scope.selectedRemark1 = {};
            $scope.selectedRemark1.originalObject = row;
            $("#remarks1Lookup").modal("hide");
            $('#remarks1_value').focus();
            //$scope.invoice.$setDirty();
            $scope.invoiceRemarks.$setDirty();
        }

        $scope.$watch("searchRemarks1Text", function () {
            if ($scope.searchRemarks1Text)
                $scope.onRemarks1Change($scope.searchRemarks1Text);
        });


        ///////////Remarks2 Lookup Enhancement --------------

        $scope.searchRemarks2Text = '';

        $scope.remarks2KeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openRemarks2Lookup();
            }
        }

        function PopulateRemarks(searchStr, remarkId) {
            $scope.stoppedSearch = false;
            apiService.get('Customs/Lookup/Remarks',
            {
                centerCode: $stateParams.centerCode,
                searchString: searchStr
            },
            function (results) {
                $scope.remarksFull = results.data.ResponseResult.Data;
                if (remarkId == 1) {
                    $scope.remarks1 = angular.copy($scope.remarksFull);
                } else {
                    $scope.remarks2 = angular.copy($scope.remarksFull);
                }
                $scope.stoppedSearch = true;
            },
            function error(response) {
                console.log("An Error has occurred while getting Lookup Data in Remarks!");
                $scope.stoppedSearch = true;
            });
        }

        $scope.openRemarks2Lookup = function (item) {
            $scope.searchRemarks2Text = '';
            $('#remarks2Lookup').modal({
                backdrop: "static"
            });
            $('#searchRemarks2Text').focus();
            $('#searchRemarks2Text').select();
            $scope.onRemarks2Change($scope.searchRemarks2Text);
            $("#remarks2Lookup").off("keydown");
            $('#remarks2Lookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexRemarks2 < $scope.remarks2.length - 1) {
                                $scope.rowIndexRemarks2++;
                                if ($scope.rowIndexRemarks2 > 10 * $scope.remarks2 - 1) {
                                    $scope.remarks2CurrentPage++;
                                }
                                $scope.remarks2ItemSelected = $scope.remarks2[$scope.rowIndexRemarks2];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexRemarks2 > 0) {

                                if ($scope.rowIndexRemarks2 == 10 * ($scope.remarks2CurrentPage - 1)) {
                                    $scope.remarks2CurrentPage--;
                                }
                                $scope.rowIndexRemarks2--;
                                $scope.remarks2ItemSelected = $scope.remarks2[$scope.rowIndexRemarks2];
                            }
                            break;
                        case 13:
                            $scope.setRemarks2($scope.remarks2ItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.onRemarks2Change = function (searchStr) {
            $scope.rowIndexRemarks2 = 0;
            $scope.remarks2CurrentPage = 1;
            PopulateRemarks(searchStr, 2);
        }

        $scope.setRemarks2 = function (row) {

            $scope.CUSTBILL.Remarks2 = row ? row.RemarkArbName : '';
            $scope.selectedRemark2 = {};
            $scope.selectedRemark2.originalObject = row;
            $("#remarks2Lookup").modal("hide");
            $('#remarks2_value').focus();
            //$scope.invoice.$setDirty();
            $scope.invoiceRemarks.$setDirty();
        }

        //PopulateRemarks(); // Remarks look 

        $scope.$watch("searchRemarks2Text", function () {
            if ($scope.searchRemarks2Text)
                $scope.onRemarks2Change($scope.searchRemarks2Text);
        });

        ///Lookup Enhancements - Exit Port //////////
        $scope.searchExitPortText = '';

        $scope.exitPortKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openExitPortLookup();
            }
        }
        $scope.PopulateExitPort = function (searchStr) {
            $scope.stoppedSearch = false;
            apiService.get('Customs/Lookup/ExitPortList',
            {
                centerCode: $stateParams.centerCode,
                searchString: searchStr
            },
            function (results) {
                $scope.exitPortsFull = results.data.ResponseResult.Data;
                $scope.exitPorts = angular.copy($scope.exitPortsFull);
                $scope.stoppedSearch = true;
            },
            function error(response) {
                $scope.stoppedSearch = true;
                console.log("An Error has occurred while getting lookup Data ExitPort!");
            });
        }
        $scope.openExitPortLookup = function (item) {
            $scope.searchExitPortText = '';
            $('#exitPortLookup').modal({
                backdrop: "static"
            });
            $('#searchExitPortText').focus();
            $('#searchExitPortText').select();
            $scope.onExitPortChange($scope.searchExitPortText);
            $("#exitPortLookup").off("keydown");
            $('#exitPortLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexExitPort < $scope.exitPorts.length - 1) {
                                $scope.rowIndexExitPort++;
                                if ($scope.rowIndexExitPort > 10 * $scope.exitPorts - 1) {
                                    $scope.lookUpCurrentPageExitPort++;
                                }
                                $scope.exitPortItemSelected = $scope.exitPorts[$scope.rowIndexExitPort];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexExitPort > 0) {

                                if ($scope.rowIndexExitPort == 10 * ($scope.lookUpCurrentPageExitPort - 1)) {
                                    $scope.lookUpCurrentPageExitPort--;
                                }
                                $scope.rowIndexExitPort--;
                                $scope.exitPortItemSelected = $scope.exitPorts[$scope.rowIndexExitPort];
                            }
                            break;
                        case 13:
                            $scope.setExitPort($scope.exitPortItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.onExitPortChange = function (searchStr) {
            $scope.rowIndexExitPort = 0;
            $scope.lookUpCurrentPageExitPort = 1;
            $scope.PopulateExitPort(searchStr);
            //if ($scope.exitPortsFull) {
            //    $scope.exitPorts = $scope.exitPortsFull.filter(obj => {
            //        return obj.Code.toString().toLowerCase().includes($scope.searchExitPortText.toLowerCase()) || (obj.PortNameEnglish && obj.PortNameEnglish.toLowerCase().includes($scope.searchExitPortText.toLowerCase()))
            //            || (obj.PortNameArabic && obj.PortNameArabic.toLowerCase().includes($scope.searchExitPortText.toLowerCase()));
            //    });
            //}
        }

        $scope.setExitPort = function (row) {
            $scope.CUSTBILL.ExitPort = row.Code.toString() + "     " + (row.PortNameEnglish ? row.PortNameEnglish : '') + "     " + (row.PortNameArabic ? row.PortNameArabic : '');
            $scope.selectedExitPort = {};
            $scope.selectedExitPort.originalObject = row;
            $("#exitPortLookup").modal("hide");
            $('#EntryPoint_value').focus();
            $scope.searchExitPortText = '';
            $scope.InvalidExitPort = false;
        }

        //$scope.PopulateExitPort();

        $scope.$watch("searchExitPortText", function () {
            if ($scope.searchExitPortText)
                $scope.onExitPortChange($scope.searchExitPortText);
        });
        $scope.closeExitPorts = function () {
            $scope.searchExitPortText = '';
        }
        ///////////////////////////////////////////////
        //Lookup Enhancements :Mamar Phase 2
        //Generic Lookup

        $scope.setInvoiceLookupData = function (row, lookupId) {
            switch (lookupId) {
                case 'ShipmentFrom':
                    $scope.CUSTBILL.Country = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.selectedOriginCountry = {};
                    $scope.selectedOriginCountry.originalObject = row;
                      $('#EnglishCarAgents_value').focus();
                    break;
                case 'ShipmentTo':
                    $scope.CUSTBILL.DestCountry = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                    $scope.selectedDestCountry = {};
                    $scope.selectedDestCountry.originalObject = row;

                    $('#EnglishCarAgents_value').focus();
                    break;
            }
            $("#InvoiceFormLookUp").modal("hide");
        }

        $scope.populateLookupData = function (lookupId) {
            switch (lookupId) {
                case 'ShipmentFrom':
                    break;
                case 'ShipmentTo':
                    break;
            }
        }

        $scope.onInvoiceLookupSearhChange = function () {
            var searchText = $("#searchInvoiceLookupText").val().toLowerCase();
            $timeout(function () {
                switch ($scope.lookupId) {
                    case 'ShipmentFrom':
                        $scope.lookUpCurrentPage = 1;
                        if ($scope.country) {
                            $scope.lookUpData = $scope.country.filter(obj => {
                                return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText))
                                    || (obj.ArabicName && obj.ArabicName.toLowerCase().includes(searchText));
                            });
                        }
                        break;
                    case 'ShipmentTo':
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

        $scope.openInvoiceLookup = function (lookupId) {
            $("#searchInvoiceLookupText").val("");
            $timeout(function () {
                $scope.lookupId = lookupId;
                switch (lookupId) {
                    case 'ShipmentFrom':
                        $scope.lookUpTitle = $filter("translate")("ShipmentFrom");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                        $scope.lookUpData = $scope.country;
                        break;
                    case 'ShipmentTo':
                        $scope.lookUpTitle = $filter("translate")("ShipmentTo");
                        $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "English", Width: "" }];
                        $scope.lookUpData = $scope.country;
                        break;
                }

                $scope.searchLookupTextModel = '';
                $('#InvoiceFormLookUp').modal({
                    backdrop: "static"
                });
                $('#searchInvoiceLookupText').focus();
                $('#searchInvoiceLookupText').select();
                //$scope.onLookupSearhChange(lookupId);
                $('#InvoiceFormLookUp').off("keydown");
                $('#InvoiceFormLookUp').bind('keydown', function (event) {
                    $timeout(function () {
                        switch (event.keyCode) {
                            case 13:
                                $scope.setInvoiceLookupData(lookupId);
                                break;
                        }
                    });
                });
                $scope.lookUpCurrentPage = 1;
            });
        }

        $scope.invoiceLookupKeyDown = function (event, lookupId) {
            if (event.key == 'F9') {
                $scope.openInvoiceLookup(lookupId);
            }
        }

        //GenericLookup Methods End
        
    }]);