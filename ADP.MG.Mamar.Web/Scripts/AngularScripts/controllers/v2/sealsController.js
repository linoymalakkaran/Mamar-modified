angular.module('mamarApp').controller('sealsController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$uibModalInstance', 'parameters', '$timeout',
function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $uibModalInstance, parameters, $timeout) {
    $scope.$storage = $storage;
    $scope.existingSeals = [];
    $scope.EditingRecord = [];
    $scope.addingNew = false;
    $scope.closedNew = true;
    $scope.totalCount = '';
    $scope.invalidSeal = false;
    //$scope.globalDisableFlag = parameters.globalDisableFlag;
    $scope.custDataParameters = parameters.custDataParameters;
    $scope.SealsRequestObject = {
        centerCode: parameters.centerCode,
        jobNumber: parameters.jobNumber,
        pageNumber: 1,
        pageSize: 10
    }

    $scope.Response = {
        Status: null,
        Message: ''
    }


    $scope.RecordToEdit = {
        companyCode: null,
        userCode: null,
        SealNumber: '',
        centerCode: parameters.centerCode,
        JobNumber: parameters.jobNumber,
        OldSealNumber: '',
    }


    $scope.PopulateData = function () {
        $("#loadingScreen").show();
        apiService.get('Customs/Invoice/GetCustBillInfo', $scope.custDataParameters, function (results) {
            $("#loadingScreen").hide();
            var data = results.data.ResponseResult.Data;
            if (data.CustomBillInfo != null) {
                $scope.SealInfo = data.SealInfo;
            }
        },
    function error(response) {
        // $("#loadingScreen").hide();
        console.log(response);
    });
    }

    // load More Records
    $scope.loadMoreRecords = function (newPageNo) {
        $scope.SealsRequestObject.pageNumber = newPageNo;
        $scope.PopulateData();
    }

    $scope.closeModal = function () {
        $uibModalInstance.close();
    }

    $scope.closingEditMode = function () {
        $scope.closingEdit = true;
        $scope.Message = '';
    }

    $scope.deleteConfirmed = function () {

        $scope.Message = '';
        $scope.isGoingToDelete = false;
        $scope.addingNew = false;
        $scope.closingNew = false;
        $("#loadingScreen").show();
        $scope.isGoingToDelete = false;
        apiService.post('Customs/BillOfLading/DeleteSeal', '', $scope.deleteSealRequestModel, function (result) {
            $("#loadingScreen").hide();
            $scope.Message = "DeleteSuccess";
            $scope.SealsRequestObject.pageNumber = 1;
            $scope.PopulateData();
        });

    }

    $scope.deleteSeal = function (deleteModel) {
        $scope.Response = {};
        $scope.Message = "";
        $scope.isGoingToDelete = true;
        $scope.deleteSealRequestModel = {
            userCode: null,
            companyCode: null,
            centerCode: parameters.centerCode,
            jobNumber: deleteModel.JobNumber,
            SealNumber: deleteModel.SealNumber,
            OldSealNumber: null
        }
    }

    $scope.editClick = function (sealModel) {
        $scope.Response = {};
        $scope.closedEdit = false;
        $scope.Message = '';
        $scope.RecordToEdit.OldSealNumber = sealModel.SealNumber;
        $scope.RecordToEdit.SealNumber = sealModel.SealNumber;
        $scope.EditingRecord[sealModel.SealNumber] = true;
    }

    $scope.saveSeal = function (isEdit) {
        if (!$scope.invalidSeal) {
            $("#loadingScreen").show();
            $scope.RecordToEdit.SealNumber = $scope.selectedSeal.originalObject.SealNumber;
            apiService.post('Customs/BillOfLading/AddUpdateSeal', '', $scope.RecordToEdit, function (result) {
                $scope.Response = result.data.ResponseResult;
                $scope.closeNew = true;
                $scope.addingNew = false;
                $scope.SealsRequestObject.pageNumber = 1;
                $scope.PopulateData();
                $("#loadingScreen").hide();
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log(response);
            });
        }
    }

    $scope.AddNewClick = function () {
        $scope.Response = {};
        $scope.RecordToEdit.SealNumber = '';
        $scope.RecordToEdit.OldSealNumber = null;
        $scope.addingNew = true;
        $scope.closingNew = false;
        $scope.closedNew = false;
        $scope.Message = '';
        $scope.selectedSealModel = '';
        $scope.selectedSeal = null;
    }

    $scope.discardEdit = function () {
        $scope.closingEdit = false;
        $scope.closedEdit = true;
        $scope.RecordToEdit.SerialNumber = 0;
        $scope.RecordToEdit.SealNumber = '';
        $scope.PopulateData();
    }

    $scope.ClearAllFlags = function () {
        $scope.closingEditRow = false;
        $scope.closingNewRow = false;
        $scope.addingNewRow = false;

    }

    //$scope.onSealNumberChange = function (searchStr) {
    //    $scope.selectedSealModel = searchStr;

    //    if (!apiService.isNullOrEmptyOrUndefined($scope.selectedSealModel)) {
    //        apiService.get('Customs/Lookup/Seals',
    //        {
    //            CenterCode: $stateParams.centerCode,
    //            searchString: $scope.selectedSealModel
    //        },
    //        function (results) {
    //            var currentSeals = $scope.SealInfo;
    //            var unfilteredSeals = results.data.ResponseResult.Data;

    //            if (currentSeals && unfilteredSeals) {
    //                $scope.SealLookupData = unfilteredSeals.filter(function (objFromA) {
    //                    return !currentSeals.find(function (objFromB) {
    //                        return objFromA.SealNumber === objFromB.SealNumber;
    //                    })
    //                });
    //            }
    //            else {
    //                $scope.SealLookupData = unfilteredSeals;
    //            }
    //        },
    //        function error(response) {
    //            console.log(response);
    //        });
    //    }
    //}



    $scope.PopulateData();

    ///////////Seal Lookup Enhancement --------------

    $scope.searchSealText = '';

    $scope.sealKeyDown = function (event) {
        if (event.key == 'F9') {
            $scope.openSealLookup();
        }
    }

    $scope.PopulateSeal = function () {
        apiService.get('Customs/Lookup/Seals',
        {
            CenterCode: $stateParams.centerCode,
            searchString: $scope.selectedSealModel
        },
        function (results) {
            var currentSeals = $scope.SealInfo;
            var unfilteredSeals = results.data.ResponseResult.Data;
            if (currentSeals && unfilteredSeals) {
                $scope.sealsFull = unfilteredSeals.filter(function (objFromA) {
                    return !currentSeals.find(function (objFromB) {
                        return objFromA.SealNumber === objFromB.SealNumber;
                    })
                });
            }
            else {
                $scope.sealsFull = unfilteredSeals;
            }
            $scope.seals = angular.copy($scope.sealsFull);
        },
        function error(response) {
            console.log("An Error has occurred while getting lookup Data seal!");
        });
    }


    $scope.openSealLookup = function (item) {
        $scope.searchSealText = '';
        $('#sealLookup').modal({
            backdrop: "static"
        });
        $('#searchSealText').focus();
        $('#searchSealText').select();
        $scope.onSealChange();
        $("#sealLookup").off("keydown");
        $('#sealLookup').bind('keydown', function (event) {
            $timeout(function () {
                switch (event.keyCode) {
                    case 40:
                        if ($scope.rowIndexSeal < $scope.seals.length - 1) {
                            $scope.rowIndexSeal++;
                            if ($scope.rowIndexSeal > 10 * $scope.seals - 1) {
                                $scope.sealCurrentPage++;
                            }
                            $scope.sealItemSelected = $scope.seals[$scope.rowIndexSeal];
                        }
                        break;
                    case 38:
                        if ($scope.rowIndexSeal > 0) {

                            if ($scope.rowIndexSeal == 10 * ($scope.sealCurrentPage - 1)) {
                                $scope.sealCurrentPage--;
                            }
                            $scope.rowIndexSeal--;
                            $scope.sealItemSelected = $scope.seals[$scope.rowIndexSeal];
                        }
                        break;
                    case 13:
                        $scope.setSeal($scope.sealItemSelected);
                        break;
                }
            });
        });
    }

    $scope.onSealChange = function () {
        $scope.rowIndexSeal = 0;
        $scope.sealCurrentPage = 1;
        if ($scope.sealsFull) {
            $scope.seals = $scope.sealsFull.filter(obj => {
                return obj.SealNumber.toString().toLowerCase().includes($scope.searchSealText.toLowerCase());
            });
        }
    }

    $scope.setSeal = function (row) {
        $scope.selectedSealModel = row.SealNumber.toString();
        $scope.selectedSeal = {};
        $scope.selectedSeal.originalObject = row;
        $("#sealLookup").modal("hide");
        $('#seal_value').focus();
    }

    $scope.PopulateSeal();
    $scope.$watch("selectedSealModel", function () {
        $scope.invalidSeal = false;
        if( ($scope.selectedSeal && $scope.selectedSeal.originalObject) && ($scope.selectedSealModel != $scope.selectedSeal.originalObject.SealNumber))
        {
            $scope.invalidSeal = true;
        }

    });
    $scope.$watch("searchSealText", function () {
        $scope.onSealChange();
    });

}]);