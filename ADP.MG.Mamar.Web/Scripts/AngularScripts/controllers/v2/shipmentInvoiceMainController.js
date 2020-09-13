angular.module('mamarApp').controller('shipmentInvoiceMainController',
    ['$scope', '$state', '$stateParams', 'apiService', '$filter', 'sharedModels', '$rootScope', '$storage',
        function ($scope, $state, $stateParams, apiService, $filter, sharedModels, $rootScope, $storage) {
            $("#loadingScreen").show();
            $scope.$storage = $storage;
            $storage.set('globalDisableFlag', false);
            $storage.set('voucherFlag', false);
            //$rootScope.globalDisableFlag = false;
            $scope.tabToSelect = $scope.selectedTab = $stateParams.tab;
            //$scope.voucherFlag = null;
            $rootScope.$$listeners.shipmentSaved = [];
            $rootScope.$$listeners.custBillSaved = [];
            $scope.gototransactions = function ()
            {
                //To maintain the shared model on page reload
                if (!sharedModels.transactionSearchModel && localStorage.storedTransSearchModel) {
                    sharedModels.transactionSearchModel = JSON.parse(localStorage.storedTransSearchModel);
                }
                if (sharedModels.transactionSearchModel) {
                    sharedModels.transactionSearchModel.fromShipment = true;
                }
                //KSAFlag
                if (!apiService.isNullOrEmptyOrUndefined($stateParams.KSAFlag) && $stateParams.KSAFlag=='Y')
                {
                    $state.go('ksaCreateBill');
                }
                else {
                    $state.go("transactions", { transportMode: (sharedModels && sharedModels.transactionSearchModel) ? sharedModels.transactionSearchModel.TransportMode : 'M' }, { reload: true, notify: true });
                }
                
            };

            $scope.ValidateSuccess = false;


            $scope.jobNumber = $stateParams.jobNumber;
            $scope.ValidateRequestObject = {
                centerCode: $stateParams.centerCode,
                jobNumber: $stateParams.jobNumber,
                maqasa: "N",
                operationMode: "UPDATE"
            }

            $scope.ActionStatusRequestObject = {
                jobNumber: $stateParams.jobNumber,
                centerCode: $stateParams.centerCode
            }

            $scope.SendToAuthorityRequestObject = {
                CenterCode: $stateParams.centerCode,
                jobNumber: $stateParams.jobNumber
            }
            $scope.ShowHidePreclearance = function () {
                var vFlag = $storage.get('voucherFlag');
                if (vFlag == false) {
                    $scope.showPreClearance = true;
                    enableDisablePreClearance($scope.actionStatus);
                }
                else {
                    $scope.showPreClearance = false;
                }
            }
             
            //CCI Authority Modal
            $scope.showCCIAuthority = function () {
                $("#cciAuthorityModal").modal('show');
                $scope.cciLoader = true;
                var cciParams = {
                    centerCode: $stateParams.centerCode,
                    jobNumber: $stateParams.jobNumber
                };
                apiService.get('Customs/Invoice/CCIAuthority', cciParams, function (results) {
                    $scope.cciLoader = false;
                    var resultData = results.data.ResponseResult;
                    if (resultData && resultData.IsValid) {
                        $scope.cciAuthorities = resultData.Data;
                    }
                },
                function error(response) {
                    console.log(response);
                    $scope.cciLoader = false;
                });
            }
            $scope.closeCCIModalPopUp = () => {
                $("#cciAuthorityModal").modal('hide');
            }
            //CCI Authority Modal
            $scope.GetActionStatus = function (isFromClick) {
                if (isFromClick)
                    $("#loadingScreen").show();
                if ($scope.ActionStatusRequestObject.jobNumber) {
                    apiService.get('Customs/Invoice/ActionStatus', $scope.ActionStatusRequestObject, function (results) {
                        if (isFromClick)
                            $("#loadingScreen").hide();
                        var resultData = results.data.ResponseResult;
                        if (resultData.IsValid) {
                            $scope.actionStatus = resultData.Data[0];
                            $scope.AuthorityStatus = resultData.Data[0];
                            //parseAuthorityStatus(resultData.Data[0]);
                            $scope.ShowHidePreclearance();
                            $scope.ValidateSuccess = true;
                        }
                        else {
                            modalErrorShow(resultData.Messages);

                        }
                    },
                function error(response) {
                    if (isFromClick)
                        $("#loadingScreen").hide();
                    console.log(response);
                });
                }
            }

            $scope.validateClicked = function () {
                debugger;
                $scope.validating = true;
                $scope.tabToSelect = $scope.selectedTab;
                //This has been commented on 14/Jan/2019 as per Vini's suggestion to improve performance by removing auto save
                if (!$storage.get('globalDisableFlag') && !$storage.get('voucherFlag') && !$storage.get('isPcsSuperUser')) { //Save shipment or invoice background
                    if ($scope.selectedTab == 'shipmentdetails') {
                        $scope.$broadcast('ShouldSaveShipment', { moveToInvoice: false, validateClicked: true });
                    }
                    else {
                        $scope.$broadcast('ShouldSaveCustBill', { moveToShipment: false, validateClicked: true });
                    }
                }
                else {
                    $scope.selectedLanguage = $('#selLang :selected').text() == "Arabic" ? 'ae' : $('#selLang :selected').text() == "English" ? 'en' : 'en';
                    $scope.ValidateShipmnetAndInvoice(true);
                }
            }

            $scope.ValidateShipmnetAndInvoice = function (isFromClick) {
                if ($scope.ValidateRequestObject && $scope.ValidateRequestObject.jobNumber) {
                    if (isFromClick) {
                        $("#loadingScreen").show(); //Show loading only if user click validate
                        $scope.validating = false;
                    }
                    apiService.get('Customs/Invoice/Validate', $scope.ValidateRequestObject, function (results) {
                        var resultData = results.data.ResponseResult;
                        if (isFromClick) {
                            $("#loadingScreen").hide();

                            //var msg = apiService.formatResponseMessage(resultData.Messages);
                            var Response = resultData.Messages.split('|')[0] + '|' + resultData.Messages.split('|')[1];
                            const msg = apiService.formatResponseMessageObject(Response);
                            if (msg) {
                                if ($scope.language == 'en') {  //selectedLanguage
                                    if (resultData.IsValid) {

                                        if (msg['eng'].includes("OFFICIAL APPROVALS REQUIRED")) {
                                            showErrorMessage(msg['eng']);
                                        }
                                        else {
                                            showSuccessMessage(msg['eng']);
                                        }
                                    }
                                    else {

                                        showErrorMessage(msg['eng']);
                                    }
                                }
                                else {
                                    if (resultData.IsValid) {
                                        showSuccessMessage(msg['arb']);
                                    }
                                    else {
                                        showErrorMessage(msg['arb']);
                                    }
                                }
                            }
                            GetWarningMessage(resultData.Messages);
                        }
                        if (resultData.IsValid) {
                            if (isFromClick) {
                                $(".overlay-bottom").addClass('open');
                            }
                        }

                        $scope.GetActionStatus(isFromClick);

                        if ($scope.selectedTab != 'shipmentdetails') {
                           // $("#loadingChargeScreen").show();
                            $scope.$broadcast('ValidateShipmnetAndInvoiceDone', {});
                        }
                    },
                function error(response) {
                    if (isFromClick)
                        $("#loadingScreen").hide();
                    alert('something went wrong');
                    console.log(response);
                });
                }
            }

            function GetWarningMessage(data) {
                var information = data.split('|');
                let counter = 0;
                if (information.length > 2) {
                    $scope.Warning = [];
                    information[2].split('WarningMsgEng:')[1].split('#').filter(v => v != '').map((item) => {

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
                if ($scope.Warning.length > 0) {
                    WarningModalOnFormM($scope.Warning);
                }
            }
            $scope.confirmSend = function () {
                $('#confirmSendModalPopup').modal('hide');
                $("#loadingScreen").show();
                var sentMessage = $filter('translate')('SuccessfullySentTo');
                var serviceUrl = '';
                switch ($scope.Authority) {
                    case "ESMA": serviceUrl = "Customs/Approval/SendToESMA";
                        break;
                    case "MOFA": serviceUrl = "Customs/Approval/SendToMOFA";
                        break;
                    case "FANR": serviceUrl = "Customs/Approval/SendToFANR";
                        break;
                    case "IDB": serviceUrl = "Customs/Approval/SendToIDB";
                        break;
                    case "ADNOC": serviceUrl = "Customs/Approval/SendToOilCompany";
                        break;
                    case "FREEZONE": serviceUrl = "Customs/Approval/SendToFreeZone";
                        break;
                    case "ETIHAD": serviceUrl = "Customs/Approval/SendToEthihad";
                        break;
                    case "ADFCA": serviceUrl = "Customs/Approval/SendToADFCA";
                        break;
                    case "CUSTOMS": serviceUrl = "Customs/Approval/SendToCustom";
                        break;
                    case "MOEW": serviceUrl = "Customs/Approval/SendToMOEW";
                        break;
                }

                apiService.get(serviceUrl, $scope.SendToAuthorityRequestObject, function (results) {
                    $("#loadingScreen").hide();
                    var resultData = results.data.ResponseResult;
                    if (resultData.IsValid) {
                        if (resultData.Data.IsSent == 'N') {
                            modalErrorShow(resultData.Messages);
                        }
                        else {
                            $scope.Authority == 'ADNOC' ? $scope.Authority = 'OilCompany' : $scope.Authority;
                            var successMsg = sentMessage + " " + $filter('translate')($scope.Authority);
                            notifySuccessMessage(successMsg);
                        }
                    }
                    else {
                        modalErrorShow(resultData.Messages);
                    }
                    $(".overlay-bottom").removeClass('open');
                    $scope.GetActionStatus();
                    $scope.$broadcast('refreshAfterSendPreclear');
                },
            function error(response) {
                $("#loadingScreen").hide();
                alert('something went wrong');
                console.log(response);
            });
            }

            $scope.SendToAuthority = function (authority) {
                $scope.Authority = authority;
                $('#confirmSendModalPopup').modal('show');
            }

            //function parseAuthorityStatus(data) {
            //    $scope.AuthorityStatus = data;
            //    if (data.MOFA_STATUS || data.MOEW_STATUS || data.FREEZONES_STATUS || data.FANR_STATUS || data.ETIHAD_STATUS
            //        || data.ESMA_STATUS || data.CUSTOMS_STATUS || data.ADNOC_STATUS || data.ADFCA_STATUS || data.ZONE_STATUS) {
            //        //$rootScope.globalDisableFlag = true;
            //        $storage.set('globalDisableFlag', true);
            //    }
            //}

            function enableDisablePreClearance(data) {

                var anyBtnShow = false;
                var anyStatusPending = false;
                if (data) {
                    anyBtnShow = data.MOFA_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.MOEW_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.FREEZONES_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.FANR_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.ETIHAD_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.ESMA_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.CUSTOMS_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;
                    anyBtnShow = data.ADNOC_BTN_VISIBLE == 'SHOW' ? true : anyBtnShow;

                    anyStatusPending = (data.MOFA_STATUS == 'PENDING' || data.MOFA_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.MOEW_STATUS == 'PENDING' || data.MOEW_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.FREEZONES_STATUS == 'PENDING' || data.FREEZONES_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.FANR_STATUS == 'PENDING' || data.FANR_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.ETIHAD_STATUS == 'PENDING' || data.ETIHAD_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.ESMA_STATUS == 'PENDING' || data.ESMA_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.CUSTOMS_STATUS == 'PENDING' || data.CUSTOMS_STATUS == 'REJECTED') ? true : anyStatusPending;
                    anyStatusPending = (data.ADNOC_STATUS == 'PENDING' || data.ADNOC_STATUS == 'REJECTED') ? true : anyStatusPending;
                }
                if (anyBtnShow || anyStatusPending) {
                    $scope.showPreClearance = false;
                }

            }
            //Pre-Clerance
            $scope.PreClearance = function () {
                debugger;
                $("#loadingScreen").show();
                $scope.PreClearanceParameter = {
                    centerCode: $stateParams.centerCode,
                    jobNumber: $stateParams.jobNumber,
                    maqasa: "Y",
                    operationMode: "USER"
                }
                apiService.get('Customs/Invoice/Preclearance', $scope.PreClearanceParameter, function (results) {
                    $("#loadingScreen").hide();
                    var resultData = results.data.ResponseResult;

                    if (resultData) {
                        var Response = resultData.Messages.split('|')[0] + '|' + resultData.Messages.split('|')[1];
                        const msg = apiService.formatResponseMessageObject(Response);
                        //var msg = resultData.Messages ? apiService.formatResponseMessageObject(resultData.Messages) : "Error";
                        if (resultData.IsValid) {
                            var resultData = results.data.ResponseResult;
                            if (resultData && resultData.Data) {
                                apiService.printDocuments(resultData.Data); //Print Pre Clearance Certificates
                            }
                            var successMsg = $filter('translate')('PreClearanceSuccessMsg');
                            notifySuccessMessage(successMsg);
                            $scope.showPreClearance = false;
                            //$scope.$broadcast('RefreshShipmentDetails', {});
                            GetWarningMessage(resultData.Messages);
                            $scope.$broadcast('refreshAfterSendPreclear');
                        }
                        else {
                            if ($scope.language == 'en') {//language
                                if (resultData.IsValid) {
                                    showSuccessMessage(msg['eng']);
                                }
                                else {
                                    if (!apiService.isNullOrEmptyOrUndefined(msg['eng'])) {
                                        showErrorMessage(msg['eng']);
                                    }
                                    else {
                                        showErrorMessage('Some Error Occour');
                                    }
                                }
                            }
                            else {
                                if (resultData.IsValid) {
                                    showSuccessMessage(msg['arb']);
                                }
                                else {
                                    if (!apiService.isNullOrEmptyOrUndefined(msg['arb'])) {
                                        showErrorMessage(msg['arb']);
                                    }
                                    else {
                                        showErrorMessage('Some Error Occour');
                                    }
                                }
                            }
                            // notifyErrorMessage("Some Error Occour");
                            //notifyErrorMessage(msg['eng'] + '<br\>' + msg['arb']);
                        }
                        GetWarningMessage(resultData.Messages);
                        $scope.$broadcast('RefreshInvoiceDetails', {});
                    }
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log('Preclearance' + response);
                });
            }
            //End of Pre-Clerance

            //Load
            //$scope.GetActionStatus();

            $scope.shipmentClicked = function () {
                // $("#loadingScreen").show();
                if (!$storage.get('globalDisableFlag') || !$storage.get('voucherFlag') || !$storage.get('isPcsSuperUser')) {
                    $scope.tabToSelect = 'shipmentdetails';
                    $scope.$broadcast('ShouldSaveCustBill', { moveToShipment: true, validateClicked: false });
                }
                else {
                    $scope.selectedTab = 'shipmentdetails';
                }
            }

            $scope.invoiceClicked = function () {
                //$("#loadingScreen").show();
                //This has been commented on 14/Jan/2019 as per Vini's suggestion to improve performance by removing auto save
                if (!$storage.get('globalDisableFlag') || !$storage.get('voucherFlag') || !$storage.get('isPcsSuperUser')) {
                    $scope.tabToSelect = 'invoice';
                    $scope.$broadcast('ShouldSaveShipment', { moveToInvoice: true, validateClicked: false });
                }
                else {
                    $scope.selectedTab = 'invoice';
                }
            }

            //Now voucher Flag is being set from transaction list;
            //$rootScope.$on('voucherFlagChanged', function (event) {
            //    $scope.ShowHidePreclearance();
            //});
            $scope.$on('validateClickedWithFormChange', function (event, args) {
                $scope.ValidateShipmnetAndInvoice(true);
            });

            $scope.$on('invoiceTabClicked', function (event, args) {
                 $scope.selectedTab = 'invoice';
            });
            $scope.$on('shipmentTabClicked', function (event, args) {
                if (args.moveToShipment) {
                    $scope.selectedTab = 'shipmentdetails';
                }
                $("#loadingInvoiceScreen").hide();
                $("#loadingScreen").hide();
                //$("#loadingChargeScreen").hide();
                $(".modal-backdrop").hide();
            });

            $scope.$on('custBillSaved', function (event, args) {
                $scope.GetActionStatus();

                if (args.moveToShipment && (args.isSaveSuccess || ($storage.get('globalDisableFlag') || $storage.get('voucherFlag')))) {
                    $scope.selectedTab = 'shipmentdetails';
                }
                if (args.isSaveSuccess) {
                    if ($scope.validating) {
                        $scope.ValidateShipmnetAndInvoice(true);
                    }
                }
                $("#loadingInvoiceScreen").hide();
                $("#loadingScreen").hide();
               // $("#loadingChargeScreen").hide();
                $(".modal-backdrop").hide();
            });

            $scope.$on('shipmentSaved', function (event, args) {
                $scope.GetActionStatus();
                if (args.moveToInvoice && (args.isSaveSuccess || (($storage.get('globalDisableFlag') || $storage.get('voucherFlag'))))) {
                    $scope.selectedTab = 'invoice';
                }
                if (args.isSaveSuccess) {
                    if ($scope.validating) {
                        $scope.ValidateShipmnetAndInvoice(true);
                    }
                }
            });
             
            $scope.$on('invoiceDetailsSaved', function (event, data) {
                $scope.GetActionStatus();
            });
            $scope.GetActionStatus(false);//Added Get Action Status call on load
            //$scope.ValidateShipmnetAndInvoice(false);  //Disabling validate shipment on load as per Nagendra for performance;done on 17/April/2019

            $scope.$on('exemptionsSaved', function (event, data) {
                $scope.GetActionStatus();
            });

            $scope.populateHarmonized = function () {
                    getIndexData('hsCode', '', function (data) {
                    }, function () {
                        apiService.get('Customs/Lookup/HarmonizedCode',
                                                    {
                                                        centerCode: $stateParams.centerCode,
                                                        searchString: '',
                                                        jobNumber: $stateParams.jobNumber,
                                                        OriginType: ''
                                                    },
                                                    function (results) {
                                                        $scope.lookUpCurrentPage = 1;
                                                        $scope.harmonisedList = $scope.fullHarmonisedList = results.data.ResponseResult.Data;
                                                        $scope.HarmonizedRequired = false;
                                                        storeData(results.data.ResponseResult.Data, 'hsCode', '');
                                                    },
                                                    function error(response) {
                                                        console.log(response);
                                                    });
                    }); //Get local data or server
            }
            $scope.populateHarmonized();

        }]);