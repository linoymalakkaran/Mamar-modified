angular.module('mamarApp').controller('chargesController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$anchorScroll', '$location', 'sharedModels', '$timeout',
function ($scope, $rootScope, $http, $state, $stateParams, apiService, $anchorScroll, $location, sharedModels, $timeout) {
    $scope.languageSelected = $scope.language;
    $scope.custBillData = {};
    $scope.totalCount = 0;
    $scope.chargesLoader = false;
    $scope.savedSuccess = false;
    // $scope.english = true;
    $scope.custBillChargesRequestObject = {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber
    }

    $scope.RecordToEdit = {};
    $scope.$watch("selectedChargeType", function () {
        $scope.RecordToEdit.Amount = $scope.selectedChargeType && $scope.selectedChargeType.originalObject ? $scope.selectedChargeType.originalObject.Amount : null;
    });

    $scope.PopulateData = function () {
        $scope.chargesLoader = true;
        $('#chBar').css({ 'width': '85%' });
        apiService.get('Customs/Invoice/GetCustBillCharges', $scope.custBillChargesRequestObject, function (results) {
            $('#chBar').css({ 'width': '95%' });
            //$("#loadingChargeScreen").hide();
            $scope.chargesLoader = false;
           // toastr.clear();
            var responseData = results.data.ResponseResult;
            $scope.custBillData = responseData.Data;
            if ($scope.custBillData) {
                $scope.fullCharges = angular.copy($scope.custBillData.Charges);
                if (!$scope.custBillData.IsShowPass) {
                    $scope.custBillData.Charges = $scope.custBillData.Charges.filter(function (obj) {
                        return obj.Type !== 'PAS';
                    });
                }
                if (!$scope.custBillData.IsStorage) {
                    $scope.custBillData.Charges = $scope.custBillData.Charges.filter(function (obj) {
                        return obj.Type !== 'STG';
                    });
                }
                $scope.INSToMockSave = $scope.custBillData.Charges.filter(function (obj) {
                    return obj.Type == 'INS';
                });

                if ($scope.$parent.CUSTBILL.CustBillType == 'E' || $scope.$parent.CUSTBILL.CustBillType == 'R') {
                    $scope.custBillData.Charges = $scope.custBillData.Charges.filter(function (obj) {
                        return obj.Type !== 'INS';
                    });
                }

                sharedModels.Charges = $scope.custBillData.Charges;
            }
            $scope.ResponseMessage = responseData.Message;
            $("#progressCharge").hide();

        },
    function error(response) {
        $scope.chargesLoader = false;
        // $("#loadingChargeScreen").hide();
        console.log(response);
        $("#progressCharge").hide();
    });
    }

    $scope.addingNew = function () {
        $scope.addingNewRow = true;
        $scope.selectedChargeTypeModel = null;
        $scope.selectedChargeType = null;
        $scope.RecordToEdit = {};
        $scope.clearMessages();
    }

    $scope.closingNew = function () {
        $scope.closingNewRow = true;
        $scope.clearMessages();
    }

    $scope.ClearAllFlags = function () {
        $scope.closingEditRow = false;
        $scope.closingNewRow = false;
        $scope.addingNewRow = false;

    }

    $scope.clearMessages = function () {
        $scope.savedSuccess = false;
    }

    $scope.editRow = function (row) {
        $scope.editingRow = true;
        $scope.RecordToEdit = angular.copy(row);
        $scope.existingAmount = row.Amount;
        $scope.clearMessages();
    }

    $scope.closingEdit = function () {
        $scope.editDeposit = false;
        if ($scope.RecordToEdit.Amount != $scope.existingAmount) {
            $scope.closingEditRow = true;
        }
        else {
            $scope.editingRow = false;
            $scope.RecordToEdit = {};
        }
        $scope.clearMessages();
    }

    $scope.discardEdited = function () {
        $scope.editDeposit = false;
        $scope.closingEditRow = false;
        $scope.editingRow = false;
        $scope.RecordToEdit = {};
        $scope.clearMessages();
    }

    $scope.closedNew = function () {
        $scope.closedNewRow = true;
        $scope.addingNewRow = false;
        $scope.clearMessages();
    }


    $scope.saveCharges = function (isUpdate, isBackGround) {

        // $("#loadingScreen").show();
        $scope.chargesLoader = true;
        $scope.UpdateModel = {};

        if (!isUpdate) {
            $scope.RecordToEdit.Type = $scope.selectedChargeType.originalObject.ChargeCode;
            $scope.RecordToEdit.DescEng = $scope.selectedChargeType.originalObject.ChargeEngName;
            $scope.RecordToEdit.DescArb = $scope.selectedChargeType.originalObject.ChargeArbName;
        }

        $scope.UpdateModel.CompanyCode = null;
        $scope.UpdateModel.UserCode = null;
        $scope.UpdateModel.CenterCode = $stateParams.centerCode;
        $scope.UpdateModel.JobNumber = $stateParams.jobNumber;
        $scope.RecordToEdit.Amount = $scope.RecordToEdit.Amount ? $scope.RecordToEdit.Amount : 0;

        if ($scope.RecordToEdit.IsFixedCharges) {
            var fixedCharges = $scope.fullCharges.filter(obj => {
                return obj.IsFixedCharges === true;
            });

            var theChargeToUpdate = fixedCharges.filter(obj => {
                return obj.Type === $scope.RecordToEdit.Type;
            });

            theChargeToUpdate[0].Amount = $scope.RecordToEdit.Amount;
            $scope.UpdateModel.Charges = fixedCharges;
        }
        else {
            $scope.RecordToEdit.IsFixedCharges = false;
            $scope.UpdateModel.Charges = [$scope.RecordToEdit];
        }

        //Validation
        $scope.InvalidChargeType = false;

        if (!isUpdate) {
            var selectedChargeType = $scope.selectedChargeType && $scope.selectedChargeType.originalObject ? $scope.selectedChargeType.originalObject.ChargeEngName : '';

            if (selectedChargeType == 0 || $scope.selectedChargeTypeModel.replace(/\s/g, '') != selectedChargeType.replace(/\s/g, '')) {
                $scope.InvalidChargeType = true;
            }
            else {
                $scope.InvalidChargeType = false;
            }
        }

        if (!$scope.InvalidChargeType) {
            apiService.post('Customs/Invoice/AddUpdateCharges', '', $scope.UpdateModel, function (result) {
                $scope.chargesLoader = false;
                $scope.Response = result.data.ResponseResult.Data;
                $scope.ClearAllFlags();
                $scope.PopulateData();
                // $("#loadingScreen").hide();

                $scope.RecordToEdit = {};
                if (!isBackGround) {
                    $scope.savedSuccess = $scope.closeNew = true;
                    $scope.Message = isUpdate ? "UpdateSuccess" : "SavedSuccess";
                }
            },
            function error(response) {
                // $("#loadingScreen").hide();
                $scope.chargesLoader = false;
                console.log(response);
            });
        }
        else {
            //$("#loadingScreen").hide();
            $scope.chargesLoader = false;
        }
    }

    $scope.deleteConfirmed = function () {
        //$("#loadingScreen").show();
        $scope.chargesLoader = true;
        $scope.isGoingToDelete = false;
        $scope.deletChargeRequestModel = {
            centerCode: $stateParams.centerCode,
            jobNumber: $stateParams.jobNumber,
            CompanyCode: null,
            UserCode: null,
            Charges: [$scope.deletChargeModel]
        };

        // $scope.deletChargeRequestModel
        apiService.post('Customs/Invoice/DeleteCharges', '', $scope.deletChargeRequestModel, function (result) {
            // $("#loadingScreen").hide();
            $scope.chargesLoader = false;
            $scope.Message = "DeleteSuccess";
            $scope.ClearAllFlags();
            $scope.savedSuccess = true;
            $scope.PopulateData();
        });
    }

    $scope.deleteCharge = function (row) {
        $scope.clearMessages();
        $scope.isGoingToDelete = true;
        $scope.deletChargeModel = angular.copy(row);
        $scope.deletChargeModel.centerCode = $stateParams.centerCode;
        $scope.deletChargeModel.jobNumber = $stateParams.jobNumber;
        $scope.gotoAnchor("confirmDelete");
    }

    $scope.gotoAnchor = function (divId) {

        if ($location.hash() !== divId) {
            // set the $location.hash to `newHash` and
            // $anchorScroll will automatically scroll to it
            $location.hash(divId);
        } else {
            // call $anchorScroll() explicitly,
            // since $location.hash hasn't changed
            $anchorScroll();
        }
    };

    //$scope.PopulateData();

    $scope.$on('changeLanguage', function (event, args) {
        $scope.languageSelected = args.language;
    });

    $scope.$on('custBillSaved', function (event, args) {
        //During voucher Type change , getcharges method was getting called twice
        //one call from custbillSaved after update cust bill info
        //and another call was from CustBillRetreived from getInvoice.
        //So removed one server call here if its from voucher type click event
        if (args.voucherRadioClicked) {
            //toastr.clear();
            //toastr.warning('Please note that the charges is being updated and will be loaded soon...', 'Charges Warning');
            $("#progressCharge").show();
            $('#chBar').css({ 'width': '65%' });
            $scope.chargesLoader = true;
            return;
        }

        if (args.isSaveSuccess) {
            $scope.VoucherNumber = args.CustbillVoucher;
            $scope.PopulateData();
        }
    });

    $scope.$on('custBillRetrieved', function (event, args) {
        $('#chBar').css({ 'width': '75%' });
        $scope.VoucherNumber = args.CustbillVoucher;
        $scope.PopulateData();
    });

    $scope.$on('editINS', function (event, args) {
        $scope.VoucherToUpdate = args.Voucher;
    });

    $scope.$on('invoiceDetailsSaved', function (event, data) {
        $scope.PopulateData();
    });
    $scope.$on('exemptionsSaved', function (event, data) {
        $scope.PopulateData();
    });

    ///////////////////////////////////////////////
    ///Lookup Enhancements - Shipment Destination //////////
    $scope.searchChargeText = '';

    $scope.chargeKeyDown = function (event) {
        if (event.key == 'F9') {
            $scope.openChargeLookup();
        }
    }
    $scope.PopulateChargeType = function (searchStr) {
        $scope.stoppedSearch = false;
        getIndexData('ChargesType', '', function (data) {
            $scope.unfilteredTypes = data;
            $scope.stoppedSearch = true;
        }, function () {
            apiService.get('Customs/Lookup/ChargesType',
               {
                   CenterCode: $stateParams.centerCode,
                   searchString: $scope.selectedChargeTypeModel
               },
            function (results) {
                $scope.unfilteredTypes = results.data.ResponseResult.Data;
                $scope.stoppedSearch = true;
            },
            function error(response) {
                $scope.stoppedSearch = true;
                console.log("An Error has occurred while getting lookup Data Charge!");
            });
        });
    }
    $scope.openChargeLookup = function (item) {
        //------filter out already used charge types from the available type
        var currentCharges = $scope.custBillData.Charges;
        if (currentCharges && $scope.unfilteredTypes) {
            $scope.chargeType = $scope.unfilteredTypes.filter(function (objFromA) {
                return !currentCharges.find(function (objFromB) {
                    return objFromA.ChargeCode === objFromB.Type;
                })
            });
        }
        else {
            $scope.chargeType = $scope.unfilteredTypes;
        }

        $scope.chargesFull = angular.copy($scope.chargeType);
        $scope.charges = angular.copy($scope.chargesFull);
        //------------------------------------------------

        $scope.searchChargeText = '';
        $('#chargeLookup').modal({
            backdrop: "static"
        });
        $('#searchChargeText').focus();
        $('#searchChargeText').select();
        $scope.onChargeChange();
        $("#chargeLookup").off("keydown");
        $('#chargeLookup').bind('keydown', function (event) {
            $timeout(function () {
                switch (event.keyCode) {
                    case 40:
                        if ($scope.rowIndexCharge < $scope.charges.length - 1) {
                            $scope.rowIndexCharge++;
                            if ($scope.rowIndexCharge > 10 * $scope.charges - 1) {
                                $scope.lookUpCurrentPageCharge++;
                            }
                            $scope.chargeItemSelected = $scope.charges[$scope.rowIndexCharge];
                        }
                        break;
                    case 38:
                        if ($scope.rowIndexCharge > 0) {

                            if ($scope.rowIndexCharge == 10 * ($scope.lookUpCurrentPageCharge - 1)) {
                                $scope.lookUpCurrentPageCharge--;
                            }
                            $scope.rowIndexCharge--;
                            $scope.chargeItemSelected = $scope.charges[$scope.rowIndexCharge];
                        }
                        break;
                    case 13:
                        $scope.setCharge($scope.chargeItemSelected);
                        break;
                }
            });
        });
    }

    $scope.onChargeChange = function () {
        $scope.rowIndexCharge = 0;
        $scope.lookUpCurrentPageCharge = 1;
        if ($scope.chargesFull) {
            $scope.charges = $scope.chargesFull.filter(obj => {
                return obj.ChargeCode.toString().toLowerCase().includes($scope.searchChargeText.toLowerCase()) || (obj.ChargeEngName && obj.ChargeEngName.toLowerCase().includes($scope.searchChargeText.toLowerCase()))
                    || (obj.ChargeArbName && obj.ChargeArbName.toLowerCase().includes($scope.searchChargeText.toLowerCase()));
            });
        }
    }

    $scope.setCharge = function (row) {
        $scope.selectedChargeTypeModel = row ? row.ChargeEngName : '';
        $scope.selectedChargeType = {};
        $scope.selectedChargeType.originalObject = row;
        $("#chargeLookup").modal("hide");
        $('#ddlChargeType_value').focus();
        $scope.searchChargeText = '';
        $scope.InvalidChargeType = false;
    }

    $scope.$watch("searchChargeText", function () {
        $scope.onChargeChange();
    });
    $scope.closeCharges = function () {
        $scope.searchChargeText = '';
    }
    $scope.PopulateChargeType("");
    ///////////////////////////////////////////////
}]);