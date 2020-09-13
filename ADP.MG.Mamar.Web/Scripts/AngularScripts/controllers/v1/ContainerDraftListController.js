angular.module('mamarApp').controller('ContainerDraftListController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', 'sharedModels', '$log', 'userAccountStorageFactory',
        function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, sharedModels, $log, userAccountStorageFactory)
        {
            $scope.$storage = $storage;
        //debugger;
        $scope.totalCount = '';
        //$scope.parameters = {
        //    centerCode: $stateParams.centerCode,
        //            pageNumber: 1,
        //            pageSize: 10,
        //    houseBLNumber: $stateParams.HouseBLNumber,
        //    MasterBLNumber: $stateParams.MasterBLNumber,
        //    voyageNumber: $stateParams.VoyageNumber,
        //    agentCode: $stateParams.AgentCode,
        //   // ArrivalDate: $stateParams.VoyageArrivalDate,
        //    vesselCode: $stateParams.VesselCode,
        //    doCenterCode: $stateParams.centerCode,
        //    searchString: ''
        //};
        $scope.parameters = {
            centerCode: sharedModels.ShipmentDraft.centerCode,
            pageNumber: 1,
            pageSize: 10,
            houseBLNumber: sharedModels.ShipmentDraft.HouseBLNumber,
            MasterBLNumber: sharedModels.ShipmentDraft.MasterBLNumber,
            voyageNumber: sharedModels.ShipmentDraft.VoyageNumber,
            agentCode: sharedModels.ShipmentDraft.AgentCode,
            vesselCode: sharedModels.ShipmentDraft.VesselCode,
            doCenterCode: sharedModels.ShipmentDraft.centerCode,
            searchString: ''
        };
        $scope.selectedContainer = {};
        $scope.containerList = [];
        $scope.isEditable = false;

        // search Container
        $scope.searchContainer = function () {
            $scope.parameters.pageNumber = 1;
            $scope.parameters.searchString = $scope.searchString;
            $scope.GetContainerList();
        }
        // reset selected container row
        $scope.reset = function () {
            $scope.selectedContainer = {};
            $scope.isValidContainerNo = true;
            $scope.isRequiredValid = true;
        };

        // load More Records
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.parameters.pageNumber = newPageNo;
            $scope.GetContainerList();
        }

        // search By Default
        $scope.searchByDefault = function () {
            if (apiService.isNullOrEmptyOrUndefined($scope.searchString)) {
                $scope.parameters.pageNumber = 1;
                $scope.parameters.searchString = $scope.searchString;
                $scope.GetContainerList();
            }
        }
        
        // validate containerNo format
        $scope.onContainerChanged = function () {
            $scope.isRequiredValid = true;
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedContainer.ContainerNumber)) {
                $scope.isValidContainerNo = apiService.validateContainerNo($scope.selectedContainer.ContainerNumber);
            }
            //else if ($scope.selectedContainer.ContainerNumber == "") { $scope.isValidContainerNo = false; }
            else { $scope.isValidContainerNo = true; }
        }

        $scope.GetContainerList = function () {
            $log.info(sharedModels);
            $("#loadingScreen").show();
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var check = userAccntInfo.CCode.includes("CONSOLIDATOR");
            if (check == true) {
                $scope.ISConsolidate = true;
            }
            else {
                $scope.ISConsolidate = false;
            }
            apiService.get('Customs/BillOfLading/GetDOContainers', $scope.parameters, function (results) {
                $("#loadingScreen").hide();
                $scope.containerList = results.data.ResponseResult.Data;
                if ($scope.containerList != null && $scope.containerList.length > 0) {
                    $scope.totalCount = $scope.containerList[0].TotalCount;
                }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    alert('something went wrong');
                    console.log(response);
                });
        }

        $scope.ShipmentDraftDetails = function () {
           // $state.go('shipmentInDraft', { 'centerCode': $stateParams.centerCode, 'DoNumber': $stateParams.DoNumber, 'AgentCode': $stateParams.AgentCode });
            $state.go('shipmentInDraft', { 'centerCode': sharedModels.ShipmentDraft.centerCode, 'DoNumber': sharedModels.ShipmentDraft.DoNumber, 'AgentCode': sharedModels.ShipmentDraft.AgentCode });
        };

        $scope.Initialize = function () {
            // get container list
                $scope.GetContainerList();
        }
        $scope.searchContainer = function () {
            $scope.parameters.pageNumber = 1;
            $scope.parameters.searchString = $scope.searchString;
            $scope.GetContainerList();
        }

        // open container Modal popup form
        $scope.openContainerForm = function (selectedItem, action) {
            $scope.selectedContainer = angular.copy(selectedItem);
            $scope.action = action;
            $('#modalContainer').modal({ backdrop: "static" });
        }

        // close Modal Popup
        $scope.closeModalPopUp = function () {
            $scope.reset();
            $('#modalContainer').modal('hide');
        };

            //Delete Container
            $scope.deleteConfirm = function (index) {
                $("#ConfirmDeleteModalPopup").modal("show");
                $scope.deleteRowIndex = index;
            }
            $scope.deleteOkay = function () {
                $("#loadingScreen").show();
                $scope.deleteSuccess = false;
                $scope.deleteFailed = false;
                $("#ConfirmDeleteModalPopup").modal("hide");
                var param = $scope.containerList[$scope.deleteRowIndex];
                var data = {
                    containerNumber: param.ContainerNumber,
                    centerCode: sharedModels.ShipmentDraft.centerCode,
                    houseBLNumber: sharedModels.ShipmentDraft.HouseBLNumber,
                    MasterBLNumber: sharedModels.ShipmentDraft.MasterBLNumber,
                    voyageNumber: sharedModels.ShipmentDraft.VoyageNumber,
                    vesselCode: sharedModels.ShipmentDraft.VesselCode
                }
                debugger;
                    apiService.get('Customs/Manifest/DeleteContainer', data, function (result) {
                    $("#loadingScreen").hide();
                     var data = result.data.ResponseResult;
                        if (data.IsValid) {
                            $scope.pageNumber = 1;
                            $scope.GetContainerList();
                            $('#successModal').modal('show');
                            $scope.closeModalPopUp();
                        }
                        else if (!data.IsValid) {
                            modalErrorShow(msg);
                        }
                },
                    function (result) {
                        $("#loadingScreen").hide();
                        var msg = apiService.formatResponseMessage(response.Messages);
                        modalErrorShow(msg);
                    });
            }


        $scope.Initialize();
        }
    ]);