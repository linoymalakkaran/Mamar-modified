angular.module('mamarApp').controller('depositInformationController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', '$uibModalInstance', 'exemptionEntryGroupInfoService', 'sharedModels',
        function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $uibModal, $uibModalInstance, exemptionEntryGroupInfoService, sharedModels) {

            $scope.selectedLanguage = 'en';
            $scope.selectedImporterExporterCode = {};
            $scope.selectedImporterExporterCode.originalObject = {};
            $scope.selectedImporterExporterCode.originalObject.Code = null;
            $scope.selectedImporterExporterCode.originalObject.EnglishName = null;
            $scope.selectedImporterExporterCode.originalObject.ArabicName = null;
            $scope.selectedImporterExporterCode.originalObject.CategoryCode = null;
            $scope.depositMode = true;
            $scope.IsValidAmount = true;
            $scope.IsValidDepositorName = true;
            $scope.IsValidStatementNo = true;
            $scope.IsValidADSDate = true;
            $scope.IsValidBankBranch = true;
            $scope.IsValidBranchOfCheque = true;
            $scope.IsValidChequeNo = true;
            $scope.IsValidChequeDate = true;
            $scope.IsValidBankOfCheque = true;
            $scope.IsValidtotalAmount = true;
            $scope.addDetailObj = exemptionEntryGroupInfoService.getValue();
            $scope.enableDisable = false;
            $scope.BankAccountNos = null;
            if ($scope.addDetailObj == 'edit') {
                $scope.enableDisable = true;
            }
            $scope.serial = {
                centerCode: 'V',
                SerialNo: parseInt(exemptionEntryGroupInfoService.getSerialNo())
            };
            $scope.customer = {
                centerCode: 'V'
            };

            $scope.documentInformation = {
                CenterCode: 'V',
                ADSDate: null,
                BankBranch: null,
                ImporterNumber: null,
                BankAccountNo: null,
                BankAccountName: null,
                StatementNo: null,
                Amount: null,
                DepositType: 'CASH',
                Denomin1000: null,
                Denomin500: null,
                Denomin200: null,
                Denomin100: null,
                Denomin50: null,
                Denomin20: null,
                Denomin10: null,
                Denomin5: null,
                DenominCoins: null,
                ADSSum: null,
                ChequeDate: null,
                ChequeNo: null,
                BankOfCheque: null,
                BranchOfCheque: null,
                DepositorName: null,
                TelephoneNo: null,
                PrintFlag: 'N',
            };

            $scope.closeModal = function () {
                $scope.ExemptionInfs = null;
                $uibModalInstance.close();
            }

            $scope.inputDepositTypeChanged = function (selected) {
                if (selected == 'CASH') {
                    $scope.depositMode = true;
                    $scope.documentInformation.ChequeDate = null;
                    $scope.documentInformation.ChequeNo = null;
                    $scope.documentInformation.BankOfCheque = null;
                    $scope.documentInformation.BranchOfCheque = null;
                    $scope.documentInformation.BankBranch = null;
                }
                else {
                    $scope.depositMode = false;
                    $scope.documentInformation.Denomin1000 = null;
                    $scope.documentInformation.Denomin500 = null;
                    $scope.documentInformation.Denomin200 = null;
                    $scope.documentInformation.Denomin100 = null;
                    $scope.documentInformation.Denomin50 = null;
                    $scope.documentInformation.Denomin20 = null;
                    $scope.documentInformation.Denomin10 = null;
                    $scope.documentInformation.Denomin5 = null;
                    $scope.documentInformation.DenominCoins = null;
                    $scope.documentInformation.ADSSum = null;
                }
            };

            $scope.PopulateData = function () {
                $scope.serial.centerCode = $scope.DefaultCenterCode;
                apiService.get('Customs/MPayment/GetDepositSlipDetails', $scope.serial, function (results) {
                    $scope.documentInformation = results.data.ResponseResult.Data[0];
                },
                    function error(response) {
                        console.log(response);
                    });
            }

            $scope.GetImporterandAccountDetails = function () {
                $("#loadingScreen").show();
                $scope.customer.centerCode = $scope.DefaultCenterCode;
                apiService.get('Customs/MPayment/GetCustomerAccountInfo', $scope.customer, function (results) {
                    $("#loadingScreen").hide();
                    $scope.importerDetails = results.data.ResponseResult.Data;
                    $scope.documentInformation.ImporterNumber = $scope.importerDetails.ImpCode;
                    $scope.BankAccountNos = $scope.importerDetails.CustomerType + "--" + $scope.importerDetails.BankAccountNo;
                    $scope.documentInformation.BankAccountNo = $scope.importerDetails.BankAccountNo;
                    $scope.CustomerTypes = $scope.importerDetails.CustomerType;
                    if ($scope.CustomerTypes == 'Postpaid' && $scope.addDetailObj == 'add') {
                        $scope.GetunpaidStaements();
                    }
                },
                    function error(response) {
                        console.log(response);
                    });
            }

            $scope.GetunpaidStaements = function () {
                if ($scope.CustomerTypes == 'Postpaid') {
                    $scope.StatementDetails = {
                        centerCode: $scope.DefaultCenterCode,
                        ImporterCode: parseInt($scope.documentInformation.ImporterNumber)
                    };
                    apiService.get('Customs/MPayment/GetUnPaidStatements', $scope.StatementDetails, function (results) {
                        $scope.unpaidStatements = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        console.log(response);
                    });
                }
            }

            $scope.data = {
                selectedOption: ''
            };

            $scope.GetStatementAmount = function (value) {

                $scope.IsValidStatementNo = true;
                $scope.IsValidAmount = true;
                $scope.documentInformation.Amount = parseInt(($scope.data.selectedOption.StatementAmount));
                $scope.documentInformation.StatementNo = parseInt(($scope.data.selectedOption.StatementNumber));
                $scope.totalAmount();
            }
            function validateDepositEntry() {
                $scope.isValidDepositEntry = true;
                $scope.IsValidAmount = (!$scope.documentInformation.Amount || ($scope.documentInformation.Amount && $scope.documentInformation.Amount < 1)) ? false : true;
                $scope.IsValidDepositorName = $scope.documentInformation.DepositorName ? true : false;
                $scope.IsValidStatementNo = ($scope.CustomerTypes == 'Postpaid' && !$scope.data.selectedOption) ? false : true;
                $scope.IsValidADSDate = $scope.documentInformation.ADSDate ? true : false;
                if ($scope.documentInformation.DepositType == 'CHEQUE') {
                    $scope.IsValidBankBranch = $scope.documentInformation.BankBranch ? true : false;
                    $scope.IsValidBranchOfCheque = $scope.documentInformation.BranchOfCheque ? true : false;
                    $scope.IsValidChequeNo = $scope.documentInformation.ChequeNo ? true : false;
                    $scope.IsValidChequeDate = $scope.documentInformation.ChequeDate ? true : false;
                    $scope.IsValidBankOfCheque = $scope.documentInformation.BankOfCheque ? true : false;
                }
                if ($scope.documentInformation.DepositType == "CASH") {
                    $scope.IsValidBankBranch = $scope.documentInformation.BankBranch ? true : false;
                    if ($scope.documentInformation.ADSSum != $scope.documentInformation.Amount) {
                        $scope.IsValidtotalAmount = false;
                    }
                    else {
                        $scope.IsValidtotalAmount = true;
                    }
                }

                if (!($scope.IsValidAmount && $scope.IsValidDepositorName && $scope.IsValidStatementNo && $scope.IsValidADSDate && $scope.IsValidBankBranch
                    && $scope.IsValidBranchOfCheque && $scope.IsValidChequeNo && $scope.IsValidChequeDate && $scope.IsValidBankOfCheque && $scope.IsValidtotalAmount)) {
                    $scope.isValidDepositEntry = false;
                }

            }
            $scope.SaveDepositEntry = function () {

                //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Amount)) {
                //    $("#loadingScreen").hide();
                //    $scope.IsValidAmount = false;
                //    return false;
                //}
                //if ($scope.documentInformation.Amount < 1) {
                //    $("#loadingScreen").hide();
                //    $scope.IsValidAmount = false;
                //    return false;
                //}
                //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.DepositorName)) {
                //    $("#loadingScreen").hide();
                //    $scope.IsValidDepositorName = false;
                //    return false;
                //}
                //if ($scope.CustomerTypes == 'Postpaid') {
                //    if (apiService.isNullOrEmptyOrUndefined($scope.data.selectedOption)) {
                //        $("#loadingScreen").hide();
                //        $scope.IsValidStatementNo = false;
                //        return false;
                //    }
                //}
                //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.ADSDate)) {
                //    $("#loadingScreen").hide();
                //    $scope.IsValidADSDate = false;
                //    return false;
                //}
                //if ($scope.documentInformation.DepositType == 'CHEQUE') {
                //    //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.BankBranch)) {
                //    //    $("#loadingScreen").hide();
                //    //    $scope.IsValidBankBranch = false;
                //    //    return false;
                //    //}
                //    //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.BranchOfCheque)) {
                //    //    $("#loadingScreen").hide();
                //    //    $scope.IsValidBranchOfCheque = false;
                //    //    return false;
                //    //}
                //    //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.ChequeNo)) {
                //    //    $("#loadingScreen").hide();
                //    //    $scope.IsValidChequeNo = false;
                //    //    return false;
                //    //}
                //    //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.ChequeDate)) {
                //    //    $("#loadingScreen").hide();
                //    //    $scope.IsValidChequeDate = false;
                //    //    return false;
                //    //}
                //    //if (apiService.isNullOrEmptyOrUndefined($scope.documentInformation.BankOfCheque)) {
                //    //    $("#loadingScreen").hide();
                //    //    $scope.IsValidBankOfCheque = false;
                //    //    return false;
                //    //}
                //}

                //if ($scope.documentInformation.DepositType == "CASH") {
                //    if ($scope.documentInformation.ADSSum != $scope.documentInformation.Amount) {
                //        $("#loadingScreen").hide();
                //        $scope.IsValidtotalAmount = false;
                //        return false;
                //    }
                //}

                validateDepositEntry();
                if (!$scope.isValidDepositEntry)
                    return;


                var calAmount = 0;
                $scope.documentInformation.CenterCode = $scope.DefaultCenterCode;
                $scope.objDeposit = {};
                $scope.objDeposit = angular.copy($scope.documentInformation);
                $scope.objDeposit.ADSDate = $filter('date')(new Date(apiService.formatDateObject($scope.objDeposit.ADSDate)), "MM/dd/yyyy");
                if ($scope.documentInformation.DepositType == 'CHEQUE') {
                    $scope.objDeposit.ChequeDate = $filter('date')(new Date(apiService.formatDateObject($scope.objDeposit.ChequeDate)), "MM/dd/yyyy");
                }
                $("#loadingScreen").show();
                apiService.post('Customs/MPayment/AddDepositSlip', '', $scope.objDeposit, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Exemption could not be updated";
                    if (response.IsValid) {

                        $scope.closeModal();
                        //$scope.parentmethod();
                        $("#loadingScreen").hide();
                        $rootScope.$broadcast('depositSlipAdd');
                    }
                    else if (!response.IsValid) {
                        modalErrorShow(msg);
                    }
                },
                   function (result) {
                       $("#loadingScreen").hide();
                       modalErrorShow("An Error has occurred while adding deposit slip!" + result);
                   });
            }


            $scope.totalAmount = function () {
                $scope.documentInformation.ADSSum = 0;
                var flag = true;
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin1000) && $scope.documentInformation.Denomin1000 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin1000 * 1000);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin500) && $scope.documentInformation.Denomin500 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin500 * 500);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin200) && $scope.documentInformation.Denomin200 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin200 * 200);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin100) && $scope.documentInformation.Denomin100 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin100 * 100);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin50) && $scope.documentInformation.Denomin50 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin50 * 50);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin20) && $scope.documentInformation.Denomin20 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin20 * 20);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin10) && $scope.documentInformation.Denomin10 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin10 * 10);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Denomin5) && $scope.documentInformation.Denomin5 > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + ($scope.documentInformation.Denomin5 * 5);
                    flag = false;
                }
                if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.DenominCoins) && $scope.documentInformation.DenominCoins > 0) {
                    $scope.documentInformation.ADSSum = $scope.documentInformation.ADSSum + parseInt($scope.documentInformation.DenominCoins);
                    flag = false;
                }
                if (flag) {
                    if (!apiService.isNullOrEmptyOrUndefined($scope.documentInformation.Amount) && $scope.documentInformation.Amount > 0) {
                        $scope.documentInformation.ADSSum = $scope.documentInformation.Amount;
                    }
                }
            }
            $scope.removeValidation = function (value) {

                if (value == 'DepositorName') {
                    $scope.IsValidDepositorName = true;
                }
                else if (value == 'BankBranch') {
                    $scope.IsValidBankBranch = true;
                }
                else if (value == 'BranchOfCheque') {
                    $scope.IsValidBranchOfCheque = true;
                }
                else if (value == 'ChequeNo') {
                    $scope.IsValidChequeNo = true;
                }
                else if (value == 'ChequeDate') {
                    $scope.IsValidChequeDate = true;
                }
                else if (value == 'BankOfCheque') {
                    $scope.IsValidBankOfCheque = true;
                }
            }

            $scope.parentmethod = function () {
                $rootScope.$emit("CallMyDepositSlipControllerMethod", { message: 'in My Controller 2' });
            }

            //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
            //  $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
            $scope.DefaultCenterCode = localStorage.getItem("PaymentCenterCode"); //$scope.selectedCenterCode;
            if ($scope.addDetailObj == 'add') {
                $scope.GetImporterandAccountDetails();
            }
            else {
                $scope.GetImporterandAccountDetails();
                $scope.PopulateData();
            }
            //  }


        }]);