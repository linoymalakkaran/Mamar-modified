angular.module('mamarApp').controller('inspectionController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$uibModalInstance', 'userAccountStorageFactory',
function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $uibModalInstance, userAccountStorageFactory) {

    $scope.$storage = $storage;

    $scope.existingInspections = [];
    $scope.addingNew = false;
    $scope.totalCount = '';
    $scope.Pagination = {
       pageNumber: 1,
       pageSize: 10    
    }
    debugger
    $scope.InspectionRequestObject = {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber
    }

    $scope.Response = {
        Status: null,
        Message: ''
    }


    $scope.RecordToSave = {
        CompanyCode:'',
        UserCode:'',  
        CenterCode: $stateParams.centerCode,
        JobNumber: $stateParams.jobNumber,
        OldRefereneNumber: null,
        ReferenceNumber: ''
    }

    $scope.RecordToEdit = {};


    $scope.PopulateData = function () {    
        $("#loadingScreen").show();
        apiService.get('Customs/Invoice/GetInspectionList', $scope.InspectionRequestObject, function (results) {
            $("#loadingScreen").hide();
            $scope.existingInspections = results.data.ResponseResult.Data;
            if($scope.existingInspections){
            $scope.totalCount = $scope.existingInspections.length;
             }
              else
                   $scope.totalCount = 0;


           if($scope.totalCount>0){
               angular.forEach($scope.existingInspections, function (value, key) {                
                   $scope.existingInspections[key].SerialNumber = $scope.existingInspections[key].ReferenceNumber;
               });

           var begin = (($scope.Pagination.pageNumber - 1) * $scope.Pagination.pageSize);
                          var  end = begin + $scope.Pagination.pageSize;
                        $scope.existingInspections = $scope.existingInspections.slice(begin, end); 
           }
},
    function error(response) {
        $("#loadingScreen").hide();
         modalErrorShow("An Error has occurred while getting inspection list Data!");    
    });
    }

    // load More Records
    $scope.loadMoreRecords = function (newPageNo) {
        $scope.Pagination.pageNumber = newPageNo;
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
        apiService.post('Customs/Invoice/DelteInspection', '', $scope.deleteInspectionRequestModel, function (result) {
            var msg = result.data.ResponseResult.Messages;
            $("#loadingScreen").hide();
            $scope.Message = msg;
            $scope.Pagination.pageNumber = 1;
            $scope.PopulateData();
        });
    }

    $scope.deleteInspection = function (inspectionModel) {
        $scope.Message = "";
        $scope.isGoingToDelete = true;
        $scope.deleteInspectionRequestModel = {
            CompanyCode:'',
            UserCode:'',
            CenterCode: $stateParams.centerCode,
            JobNumber: $stateParams.jobNumber,
            OldRefereneNumber: null,
            ReferenceNumber: inspectionModel.ReferenceNumber
        }
    }

    

    $scope.saveInspection = function () {
        $("#loadingScreen").show();
        apiService.post('Customs/Invoice/AddInspection', '', $scope.RecordToSave, function (result) {
            $scope.Response = result.data.ResponseResult.Data;
            var msg = result.data.ResponseResult.Messages;
            var IsValid = result.data.ResponseResult.IsValid;
            $scope.AddedSuccess = $scope.closeNew = true;
            $scope.addingNew = false;
            $scope.Pagination.pageNumber = 1;
            $scope.PopulateData();
            $("#loadingScreen").hide();
            $scope.RecordToSave.ReferenceNumber = ''; 
            $scope.Message = msg;
            $scope.IsValid = IsValid;
        },
        function error(response) {
            $("#loadingScreen").hide();
            modalErrorShow("An Error has occurred while adding inspection!"); 
        });
    }

    $scope.updateInspection = function (inspectionModel) {
        $scope.RecordToUpdate = { 
            CompanyCode:'',
            UserCode:'',  
            CenterCode: $stateParams.centerCode,
            JobNumber: $stateParams.jobNumber,
            OldRefereneNumber: inspectionModel.SerialNumber,
            ReferenceNumber: inspectionModel.ReferenceNumber
        }

        $("#loadingScreen").show();
        apiService.post('Customs/Invoice/UpdateInspection', '', $scope.RecordToUpdate, function (result) {
           var msg = result.data.ResponseResult.Messages;
           var IsValid = result.data.ResponseResult.IsValid;
            $scope.Pagination.pageNumber = 1;
            $scope.PopulateData();
            $("#loadingScreen").hide();
            $scope.Message = msg;
            $scope.IsValid = IsValid;
            $scope.closingEdit = false;
            },
            function error(response) {
                $("#loadingScreen").hide();
                modalErrorShow("An Error has occurred while updating inspection Data!"); 
            });
    }

    $scope.PrintInspection = function (val) {
         var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
         var targetaddrss = 'DocumentUpload/reportData?DocId=0ce954a0-7c52-4899-8c06-fc22f0aa707b';
         document.location.href = "../Home/DownloadInspectionReports?targetUrl=" + targetaddrss + "&UCode=" + userAccntInfo.UCode + "&CCode=" + userAccntInfo.CCode + "&ReportParameter=" + $stateParams.jobNumber + ";" + val;
    };

    $scope.PopulateData();
}]);