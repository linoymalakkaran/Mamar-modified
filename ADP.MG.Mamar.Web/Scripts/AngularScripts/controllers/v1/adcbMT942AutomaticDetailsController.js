angular.module('mamarApp').controller('adcbMT942AutomaticDetailsController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', '$uibModalInstance', 'exemptionEntryGroupInfoService',
function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $uibModal, $uibModalInstance, exemptionEntryGroupInfoService) {

    $scope.selectedLanguage = 'en';
    $scope.mt942Details = {
        centerCode: 'V',
        seqenceNo: parseInt(exemptionEntryGroupInfoService.getSerialNo())
    };

    $scope.closeModal = function () {
        $uibModalInstance.close();
    }

    $scope.PopulateData = function () {
        debugger;
        apiService.get('Customs/MPayment/GetMT942Details', $scope.mt942Details, function (results) {
            $scope.documentInformationDetails = results.data.ResponseResult.Data[0];
        },
            function error(response) {
                console.log(response);
            });
    }
    $scope.PopulateData();

}]);