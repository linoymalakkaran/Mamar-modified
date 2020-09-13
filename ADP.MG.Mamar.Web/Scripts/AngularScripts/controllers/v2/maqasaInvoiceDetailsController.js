angular.module('mamarApp').controller('maqasaInvoiceDetailsController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', '$uibModalInstance', 'exemptionEntryGroupInfoService',
function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $uibModal, $uibModalInstance, exemptionEntryGroupInfoService) {
    $scope.parameters = {
        centerCode: 'V',
       // pageNumber: 1,
       // pageSize: 10,
        jobNumber: '12582847',
        gccYear: $scope.$parent.maqasaSrchEntity.gccYear
        //searchString: ''
    };

    $scope.SelectedValues = [];
    //$scope.selectedContainers = [];
    //$scope.SelectedContainersList = exemptionEntryGroupInfoService.getConatinersValue();
    //$scope.SelectContainersList = exemptionEntryGroupInfoService.getConatinersValue();
    //if ($scope.SelectContainersList != null) {
    //    if ($scope.SelectContainersList.selectedContainerss != null) {
    //        angular.forEach($scope.SelectContainersList.selectedContainerss, function (value, key) {
    //            value.isChecked = true;
    //            $scope.selectedContainers.push(value);
    //        });
    //    }
    //}

    $scope.GetInvoiceList = function (flag) {
        $scope.loading = true;
        apiService.get('Customs/ReExport/GetReExportInvoices', $scope.parameters, function (results) {
            $scope.loading = false;
            $scope.containerList = results.data.ResponseResult.Data;
            if ($scope.selectedContainers != null) {
                angular.forEach($scope.selectedContainers, function (value, key) {
                    angular.forEach($scope.containerList, function (values, key) {
                        if (values.ContainerNumber == value.ContainerNumber) {
                            var index = $scope.containerList.findIndex(x=>x.ContainerNumber === values.ContainerNumber)
                            $scope.containerList[index].isChecked = true;
                        }
                    });
                });
            }
            if ($scope.containerList != null && $scope.containerList.length > 0) {
                $scope.totalCount = $scope.containerList[0].TotalCount
            }
        },
    function error(response) {
        $scope.loading = false;
        alert('something went wrong');
        console.log(response);
    });
    }

    $scope.closeModal = function () {
        $scope.ExemptionInfs = null;
        $uibModalInstance.close();
    }

    $scope.toggleCheckBox = function (item, flag, checked) {
        $scope.newData = false;
        debugger;
        $scope.isloadData = false;
        $scope.chkvalue = false;
        $scope.newData = true;
        if ($scope.selectedContainers != null && $scope.selectedContainers.length > 0) {
            angular.forEach($scope.selectedContainers, function (value, key) {
                if (value.ContainerNumber == item.ContainerNumber) {
                    if (item.isChecked == false) {
                        $scope.Indexs = $scope.selectedContainers.findIndex(x=>x.ContainerNumber === value.ContainerNumber);
                        $scope.selectedContainers.splice($scope.Indexs, 1);
                        $scope.newData = false;
                    }
                }
            });
        }
        if ((($scope.selectedContainers == null || $scope.selectedContainers.length == 0) || $scope.newData == true) && item.isChecked == true) {
            item.isChecked = true;
            $scope.selectedContainers.push(item);
        }
    };

    $scope.loadMoreRecords = function (newPageNo) {
        debugger;
        $scope.parameters.pageNumber = newPageNo;
        $scope.GetContainerList(false);
    }

    $scope.SaveselectedContainers = function () {
        $scope.selectContainers = $scope.selectedContainers;
        $scope.closeModal();
        $rootScope.$emit("CallToParentMethod", { selectedContainerss: $scope.selectContainers });
    }

    $scope.GetContainerList(true);
}]);