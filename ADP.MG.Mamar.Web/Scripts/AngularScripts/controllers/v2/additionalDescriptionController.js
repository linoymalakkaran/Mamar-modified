angular.module('mamarApp').controller('additionalDescriptionController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage','parameters', '$uibModalInstance',
function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, parameters, $uibModalInstance) {
    $scope.$storage = $storage;
    $scope.existingDescriptions = [];
    $scope.addingNew = false;
    $scope.closedNew = true;
    $scope.totalCount = '';
    //$scope.globalDisableFlag = parameters.globalDisableFlag;
    $scope.GoodsDescriptionRequestObject = {
        centerCode: parameters.centerCode,
        jobNumber: parameters.jobNumber,
        pageNumber: 1,
        pageSize: 10
    }

    $scope.Response = {
        Status: null,
        Message: ''
    }


    $scope.RecordToSave = {
        CenterCode: parameters.centerCode,
        JobNumber: parameters.jobNumber,
        SerialNumber: null,
        Description: ''
    }

    $scope.RecordToEdit = {};


    $scope.PopulateData = function () {
        apiService.get('Customs/GoodDesc/GetGoodDescList', $scope.GoodsDescriptionRequestObject, function (results) {
            $scope.existingDescriptions = results.data.ResponseResult.Data;
            $scope.totalCount =$scope.existingDescriptions ? $scope.existingDescriptions[0].TotalCount:0;
        },
    function error(response) {
        $("#loadingScreen").hide();
        console.log(response);
    });
    }

    // load More Records
    $scope.loadMoreRecords = function (newPageNo) {
        $scope.GoodsDescriptionRequestObject.pageNumber = newPageNo;
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
        $("#loadingScreen").show();
        $scope.isGoingToDelete = false;
        apiService.post('Customs/GoodDesc/DeleteGoodDesc', '', $scope.deletDescriptionRequestModel, function (result) {
            $("#loadingScreen").hide();
            $scope.Message = "DeleteSuccess";
            $scope.GoodsDescriptionRequestObject.pageNumber = 1;
            $scope.PopulateData();
        });
    }

    $scope.deleteDescription = function (descriptionModel) {
        $scope.Message = "";
        $scope.isGoingToDelete = true;
        $scope.deletDescriptionRequestModel = {
            centerCode: parameters.centerCode,
            jobNumber: parameters.jobNumber,
            SerialNumber: descriptionModel.SerialNumber,
            Description: descriptionModel.Description
        }
    }

    $scope.saveDescription = function () {
        $("#loadingScreen").show();
        apiService.post('Customs/GoodDesc/AddUpdateGoodDesc', '', $scope.RecordToSave, function (result) {
            $scope.Response = result.data.ResponseResult.Data;
            $scope.AddedSuccess = $scope.closeNew = true;
            $scope.addingNew = false;
            $scope.GoodsDescriptionRequestObject.pageNumber = 1;
            $scope.PopulateData();
            $("#loadingScreen").hide();
            $scope.RecordToSave.Description = '';
            $scope.Message = "SavedSuccess";
        },
        function error(response) {
            $("#loadingScreen").hide();
            console.log(response);
        });
    }

    $scope.updateDescription = function (descriptionModel) {
        $scope.RecordToUpdate = {
            centerCode: parameters.centerCode,
            jobNumber: parameters.jobNumber,
            SerialNumber: descriptionModel.SerialNumber,
            Description: descriptionModel.Description
        }

        $("#loadingScreen").show();
        apiService.post('Customs/GoodDesc/AddUpdateGoodDesc', '', $scope.RecordToUpdate, function (result) {
            $scope.GoodsDescriptionRequestObject.pageNumber = 1;
            $scope.PopulateData();
            $("#loadingScreen").hide();
            $scope.Message = "UpdateSuccess";
            $scope.closingEdit = false;
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log(response);
            });
    }

    $scope.PopulateData();
}]);