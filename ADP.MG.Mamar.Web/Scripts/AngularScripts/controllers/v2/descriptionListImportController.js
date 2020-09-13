angular.module('mamarApp').controller('descriptionListImportController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', '$uibModalInstance', 'exemptionEntryGroupInfoService',
function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $uibModal, $uibModalInstance, exemptionEntryGroupInfoService) {
    $scope.parameters = {
        centerCode: 'V',
        //pageNumber: 1,
        //pageSize: 10,
        jobNumber: '12582934'
    };
    debugger;
    $scope.selectedDescription = [];
    $scope.selectedDescriptionList = exemptionEntryGroupInfoService.getDescriptionValue();
    if ($scope.selectedDescriptionList != null) {
        if ($scope.selectedDescriptionList.importedDescription != null) {
            angular.forEach($scope.selectedDescriptionList.importedDescription, function (value, key) {
                value.isChecked = true;
                $scope.selectedDescription.push(value);
            });
        }
    }
    $scope.GetDescriptionList = function () {
        $scope.loading = true;
        apiService.get('Customs/ReExport/GetReExportCargos', $scope.parameters, function (results) {
            $scope.loading = false;
            $scope.descriptionList = results.data.ResponseResult.Data;
            if ($scope.selectedDescriptionList && $scope.selectedDescriptionList.importedDescription) {
                angular.forEach($scope.selectedDescription, function (value, key) {
                    angular.forEach($scope.selectedDescriptionList.importedDescription, function (values, key) {
                        if (values.SerialNumber == value.SerialNumber) {
                            var index = $scope.descriptionList.findIndex(x=>x.SerialNumber === values.SerialNumber)
                            $scope.descriptionList[index].isChecked = true;
                        }
                    });
                });
            }

            if ($scope.descriptionList != null && $scope.descriptionList.length > 0) {
                $scope.totalCountChassis = $scope.descriptionList[0].TotalCount;
            }
        },
    function error(response) {
        $scope.loading = false;
        console.log(response);
    });
    }

    $scope.GetDescriptionList();

    $scope.closeModal = function () {
        $scope.ExemptionInfs = null;
        $uibModalInstance.close();
    }

    $scope.toggleCheckBox = function (item) {
        $scope.newData = true;
        debugger;
        if ($scope.selectedDescription != null && $scope.selectedDescription.length > 0) {
            angular.forEach($scope.selectedDescription, function (value, key) {
                if (value.SerialNumber == item.SerialNumber) {
                    if (item.isChecked == false) {
                        $scope.Index = $scope.selectedDescription.findIndex(x=>x.SerialNumber === value.SerialNumber);
                        $scope.selectedDescription.splice($scope.Index, 1);
                        $scope.newData = false;
                    }
                }
            });
        }
        if ((($scope.selectedDescription == null || $scope.selectedDescription.length == 0) || $scope.newData == true) && item.isChecked == true) {
            item.isChecked = true;
            $scope.selectedDescription.push(item);
        }
    };



    $scope.SaveSelectedDescription = function () {
        $scope.closeModal();
        $rootScope.$emit("CallToMaqasaCreateBillForDescription", { importedDescription: $scope.selectedDescription });
    }
}]);