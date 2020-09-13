angular.module('mamarApp').controller('queryShortageDetailsController',
    [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', 'sharedModels',
        'userAccountStorageFactory', '$log', '$storage',
        function ($scope,
            $rootScope,
            $state,
            $stateParams,
            $filter,
            apiService,
            $uibModal,
            sharedModels,
            userAccountStorageFactory,
            $log, $storage) {
             
            //#region Methods

            var LoadLookupBillType = function () {
                var opt = {};
                opt.Code = '';
                opt.NameEnglish = '--Select--';
                opt.NameArabic = '--الشحن--';

                $scope.lkBillTypeParameter = {
                    centerCode: $scope.centerCode,
                    searchString: ''
                };
                getIndexData('billTypes', $scope.selCenterCode, function (data) {
                    $scope.lookupBillTpResult = data;

                    if ($scope.lookupBillTpResult) {
                        $scope.lookupBillTpResult.unshift(opt);
                    }

                }, function () {
                    apiService.get('Customs/Lookup/BillTypes', $scope.lkBillTypeParameter, function (results) {

                        $scope.lookupBillTpResult = angular.copy(results.data.ResponseResult.Data);
                        storeData(results.data.ResponseResult.Data, 'billTypes', $scope.selCenterCode);
                        if ($scope.lookupBillTpResult) {
                            $scope.lookupBillTpResult.unshift(opt);
                        }
                    },
                        function error(response) {
                            console.log(response);
                        })
                });
            }

            var LoadLookupVoucherType = function () {
                $scope.lkVoucherTypeParameter = {
                    centerCode: $scope.centerCode,
                    searchString: ''
                };
                getIndexData('voucherTypes', $scope.centerCode, function (data) {
                    $scope.lookupVoucherTpResult = data;
                }, function () {
                    apiService.get('Customs/Lookup/VoucherType', $scope.lkVoucherTypeParameter, function (results) {
                        $scope.lookupVoucherTpResult = angular.copy(results.data.ResponseResult.Data);
                        storeData(results.data.ResponseResult.Data, 'voucherTypes', $scope.centerCode);
                    },
                    function error(response) {
                        console.log(response);
                    })
                });
            }

            function bindQueryShortageDetails() {
              
                if ($scope.qsDetails.IssueDate != null) {
                    $scope.qsIssueDate = $filter('date')((new Date($scope.qsDetails.IssueDate)), "dd/MM/yyyy");
                }
                if ($scope.qsDetails.VHIssueDate != null) {
                    $scope.vhIssueDate = $filter('date')((new Date($scope.qsDetails.VHIssueDate)), "dd/MM/yyyy");
                }

                $scope.vhType = $scope.qsDetails.VHType ? parseInt($scope.qsDetails.VHType) : '';
            }

            $scope.getQSDetails = () => {
                $("#loadingScreen").show();
                apiService.get('Customs/Invoice/ShortageBillDetail',
                    { centerCode: $scope.centerCode, serialNumber: $scope.serialNumber },
                    function (results) {
                        $("#loadingScreen").hide();
                        var result = (results && results.data) ? results.data.ResponseResult : null;
                        if (result && result.IsValid) {
                            $scope.qsDetails = result.Data;
                            if ($scope.qsDetails) {
                                bindQueryShortageDetails();
                            }

                        } else {
                            modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No Details found!");
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
            $scope.payDutyShortage = () => {
                if ($scope.qsDetails) {
                    $("#loadingScreen").show();
                    apiService.post('Customs/Invoice/PayShortageBillDuty', '',
                        { centerCode: $scope.centerCode, serialNumber: parseInt($scope.serialNumber), dutyAmount: $scope.qsDetails.OPAmount ? parseFloat($scope.qsDetails.OPAmount) : 0},
                        function (results) {
                            $("#loadingScreen").hide();
                            var resultData = (results && results.data) ? results.data.ResponseResult : null;

                            var response = resultData ? resultData.Messages.split('|')[0] + '|' + resultData.Messages.split('|')[1] : '';
                            const msg = apiService.formatResponseMessageObject(response);

                            if (result && result.IsValid) {
                                if (resultData && resultData.Data) {
                                    apiService.printDocuments(resultData.Data); //Print Shortge Bill Payment details
                                    var successMsg = $filter('translate')('payDutyShortageSuccessMsg');
                                    notifySuccessMessage(successMsg);
                                }
                                else {
                                    modalErrorShow(msg ? msg : "Sorry! Some error occurred while downloading the receipt");
                                }

                            }
                            else {
                                modalErrorShow(msg ? msg : "Sorry! Some error occurred while paying the duty shortage");
                            }
                        },
                        function error(response) {
                            $("#loadingScreen").hide();
                            console.log(response);
                        });
                }
            }
            //#endregion

            //#region initialisation
            $scope.init = () => {
                $scope.$storage = $storage;
                $scope.centerCode = $stateParams.centerCode;
                $scope.serialNumber = $stateParams.serialNumber;
                LoadLookupBillType();
                LoadLookupVoucherType();
                $scope.getQSDetails();

            }
            //#endregion

            //On Page Load
            $scope.init();

        }
    ]);
