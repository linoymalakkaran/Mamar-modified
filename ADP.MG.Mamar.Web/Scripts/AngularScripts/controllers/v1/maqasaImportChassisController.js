angular.module('mamarApp').controller('maqasaImportChassisController',
['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', '$uibModalInstance', 'exemptionEntryGroupInfoService',
function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $uibModal, $uibModalInstance, exemptionEntryGroupInfoService) {
    $scope.parameters = {
        centerCode: 'V',
        pageNumber: 1,
        pageSize: 3,
        jobNumber: '12582934',
        searchString: ''
    };
    $scope.SelectedValues = [];
    $scope.selectedChassis = [];
    $scope.selectedChassisList = exemptionEntryGroupInfoService.getChassisValue();
    $scope.selectChassisList = exemptionEntryGroupInfoService.getChassisValue();
    if ($scope.selectChassisList != null) {
        if ($scope.selectChassisList.importedChassis != null) {
            angular.forEach($scope.selectChassisList.importedChassis, function (value, key) {
                value.isChecked = true;
                $scope.selectedChassis.push(value);
            });
        }
    } 
    $scope.GetChassisList = function (flag) {
        $scope.loading = true;
        apiService.get('Customs/Chassis/GetChassisDetail', $scope.parameters, function (results) {
            $scope.loading = false;            
            $scope.chassisList = results.data.ResponseResult.Data;
            if ($scope.selectedChassis != null) {
                angular.forEach($scope.selectedChassis, function (value, key) {
                    angular.forEach($scope.chassisList, function (values, key) {
                        if (values.ChassisNumber == value.ChassisNumber) {
                            var index = $scope.chassisList.findIndex(x=>x.ChassisNumber === values.ChassisNumber)
                            $scope.chassisList[index].isChecked = true;
                        }
                    });
                });
            }
            if ($scope.chassisList != null && $scope.chassisList.length > 0) {
                $scope.totalCountChassis = $scope.chassisList[0].TotalCount
            } 
        },
    function error(response) {
        $scope.loading = false;
        console.log(response);
    });
    }  
    $scope.closeModal = function () {
        $scope.ExemptionInfs = null;
        $uibModalInstance.close();
    }

    $scope.toggleCheckBox = function (item) {
        $scope.newData = false;
        $scope.isloadData = false;
        $scope.chkvalue = false;
        $scope.newData = true;
        if ($scope.selectedChassis != null && $scope.selectedChassis.length > 0) {
            angular.forEach($scope.selectedChassis, function (value, key) {
                if (value.ChassisNumber == item.ChassisNumber) {
                    if (item.isChecked == false) {
                        $scope.Indexs = $scope.selectedChassis.findIndex(x=>x.ChassisNumber === value.ChassisNumber);
                        $scope.selectedChassis.splice($scope.Indexs, 1);
                        $scope.newData = false;
                    }
                }
            });
        }
        if ((($scope.selectedChassis == null || $scope.selectedChassis.length == 0) || $scope.newData == true) && item.isChecked == true) {
            item.isChecked = true;
            $scope.selectedChassis.push(item);
        }
    };

    $scope.loadMoreRecords = function (newPageNo) {
        $scope.parameters.pageNumber = newPageNo;
        $scope.GetChassisList(false);
    }
    $scope.SaveSelectedChassis = function () {

        $scope.selectChassis = $scope.selectedChassis;
        $scope.closeModal();
        $rootScope.$emit("CallToMaqasaCreateBillForChassis", { importedChassis: $scope.selectChassis });
    }
    $scope.GetChassisList(true);

}]);