angular.module('mamarApp').controller('eExemptionsController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'parameters', '$uibModalInstance','userAccountStorageFactory',
function ($scope, $rootScope, $http, $state, $stateParams, apiService, parameters, $uibModalInstance, userAccountStorageFactory) {
    $scope.eExemptions = [];
    $scope.totalCount = '';
    $scope.eExemptionRequestObject = {
        centerCode: parameters.centerCode,
        jobNumber: parameters.jobNumber,
        pageNumber: 1,
        pageSize: 10
    }

    // load More Records
    $scope.loadMoreRecords = function (newPageNo) {
        $scope.eExemptionRequestObject.pageNumber = newPageNo;
        $scope.PopulateData();
    }

    $scope.PopulateData = function () {
        $("#loadingScreen").show();
        apiService.get('Customs/Exemption/GetExemptions', $scope.eExemptionRequestObject, function (results) {
            var responseData = results.data.ResponseResult;
            $scope.existingExemptions = responseData.Data;
            $scope.totalCount = $scope.existingExemptions? $scope.existingExemptions[0].TotalCount:0;
            $scope.ResponseMessage = responseData.Message;
            $("#loadingScreen").hide();
        },
    function error(response) {
        $("#loadingScreen").hide();
        console.log(response);
    });
    }

    $scope.closeModal = function () {
        $uibModalInstance.close();
    }

    $scope.PrintExemption = function (ElaCode) {
        var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
        var targetaddrss = 'DocumentUpload/reportData?DocId=0ce954a0-7c52-4899-8c06-fc22f0aa707b';
        document.location.href = "../Home/DownloadExemptionReport?targetUrl=" + targetaddrss + "&UCode=" + userAccntInfo.UCode + "&CCode=" + userAccntInfo.CCode + "&ReportParameter=" + $stateParams.jobNumber + ";" + ElaCode + ";" + $stateParams.centerCode;
    };

    $scope.PopulateData();
}]);