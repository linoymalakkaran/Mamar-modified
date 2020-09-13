angular.module('mamarApp').controller('subDOContainerListController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', '$timeout', '$http', 'apiService', '$storage', '$log', 'userAccountStorageFactory',
        function ($scope, $rootScope, $http, $state, $stateParams, $filter, $timeout, $http, apiService, $storage, $log, userAccountStorageFactory) {

            $scope.$storage = $storage;

            //Edit
            function resetEditedIndex() {
                $scope.editContainer = [];
                angular.forEach($scope.containerList, function (value, key) {
                    $scope.editContainer[value.ContainerNumber] = false;
                });
            }

            $scope.editContainerDetails = function (container) {
                $scope.savedSuccess = false;
                resetEditedIndex();
                $scope.editContainer[container.ContainerNumber] = true;
                $scope.RecordToSave = container;
                $scope.addNew = false;
            }

            //Delete
            $scope.deleteContainer = function (index) {
                $scope.deleteIndex = index;
                $("#ConfirmDeleteModalPopup").modal("show");
            }
            // delete container Okay
            $scope.deleteOkay = function () {
                $("#ConfirmDeleteModalPopup").modal("hide");
                $("#loadingScreen").show();
                var param = $scope.containerList[$scope.deleteIndex];
                var manifestInformation = $storage.get('storedManifestInformation');
                var data = {};
                if (manifestInformation) {
                    data = {
                        containerNumber: param.ContainerNumber,
                        centerCode: $stateParams.centerCode,
                        houseBLNumber: manifestInformation.HouseBlNumber,
                        MasterBLNumber: manifestInformation.MasterBlNumber,
                        voyageNumber: manifestInformation.VoyageNumber,
                        vesselCode: manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : ''
                    }
                    $scope.deleteContainerParams = data;
                }
                apiService.get('Customs/Manifest/DeleteContainer', data, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = apiService.formatResponseMessage(response.Messages);
                    if (response.IsValid) {
                        //Manafath Changes
                        var config = {
                            params: $scope.deleteContainerParams
                        };
                        $http.get($Url.resolve('~/Manifest/DeleteMFContainer'), config).then(function (result) {
                            console.log('success - delete conatiner');
                        }, function (error) {
                            console.log('error - ' + error);
                        });
                        //end


                        if ($scope.containerList.length == 1) {
                            $scope.parameters.pageNumber = 1;
                        }
                        getContainerList();
                        $('#successModal').modal('show');
                    }
                    else if (!response.IsValid) {
                        modalErrorShow(msg);
                    }
                },
                function (result) {
                    $("#loadingScreen").hide();
                    console.log("An Error has occurred!");
                    console.log(result);
                });
            }

            //Add /Edit Container
            $scope.addNewContainer = () => {
                $scope.addNew = true;
                resetEditedIndex();
            }

            //Search
            $scope.searchContainer = function () {
                getContainerList();
            }
            // validate containerNo format
            $scope.onContainerChanged = function () {
                if ($scope.RecordToSave && $scope.RecordToSave.ContainerNumber) {
                    $scope.isValidContainerNo = apiService.validateContainerNo($scope.RecordToSave.ContainerNumber);
                    $scope.isRequiredValid = true;
                }
                else {
                    $scope.isRequiredValid = false;
                }
            }

            CheckFormat = (Format) => {
                var regex = /^(?!\.?$)\d{0,12}(\.\d{0,3})?$/;
                return regex.test(Format);
            }
            //Validation
            $scope.validateWeightMeasureFormat = () => {

                $scope.mesaureInvalidFormat = false;
                $scope.weightInvalidFormat = false;

                if ($scope.RecordToSave && $scope.RecordToSave.Measure && !CheckFormat($scope.RecordToSave.Measure)) {
                    $scope.mesaureInvalidFormat = true;
                }
                if ($scope.RecordToSave && $scope.RecordToSave.Weight && !CheckFormat($scope.RecordToSave.Weight)) {
                    $scope.weightInvalidFormat = true;
                }
            }

            function validateContainerDetails() {
                $scope.isValid = true;
                $scope.onContainerChanged();
                $scope.validateWeightMeasureFormat();
                if (!$scope.isRequiredValid || !$scope.isValidContainerNo || $scope.mesaureInvalidFormat || $scope.weightInvalidFormat) {
                    $scope.isValid = false;
                }
            }

            //Save Container
            $scope.saveContainer = function (container) {
                validateContainerDetails();

                var manifestInformation = $storage.get('storedManifestInformation');
                if (manifestInformation) {
                    var arrivalDate = manifestInformation.ArrivalDate ? $filter('date')((new Date(manifestInformation.ArrivalDate)), 'dd/MM/yyyy') : manifestInformation.arrivalDate;
                    $scope.RecordToSave.CenterCode = $stateParams.centerCode;
                    $scope.RecordToSave.MasterBLNumber = manifestInformation.MasterBlNumber;
                    $scope.RecordToSave.HouseBLNumber = manifestInformation.HouseBlNumber;
                    $scope.RecordToSave.VoyageNumber = manifestInformation.VoyageNumber;
                    $scope.RecordToSave.VesselCode = manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : '';
                    $scope.RecordToSave.ETADate = arrivalDate;
                    $scope.RecordToSave.Mode = $scope.addNew ? 'I' : 'U';
                }

                if ($scope.isValid) {
                    $("#loadingScreen").show();
                    apiService.post('Customs/Manifest/AddUpdateMContainer', '', $scope.RecordToSave, function (result) {
                        $("#loadingScreen").hide();
                        var response = result.data.ResponseResult;
                        var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Invoice details could not be added/updated";
                        if (response.IsValid) {
                            $scope.addNew = false;
                            //Manafath Integration Changes --> Save to PCS DB
                            apiService.saveManifestDetailsToPcs('~/Manifest/AddUpdateMFContainer', $scope.RecordToSave, '');

                            $scope.RecordToSave = {};
                            if (container)
                                $scope.editContainer[container.ContainerNumber] = false;
                            getContainerList();
                            $scope.savedSuccess = true;
                            $timeout(function () {
                                $scope.savedSuccess = false;
                            }, 4000);
                        }
                        else if (!response.IsValid) {
                            modalErrorShow(msg);
                        }
                    },
                    function (result) {
                        $("#loadingScreen").hide();
                        modalErrorShow("An Error has occurred while adding/updating Container details. " + result);
                    });
                }
            }

            //Key Down events
            $scope.onKeyDownContainerList = function ($event) {
                if ($event.keyCode == 13) {
                    $scope.saveContainer();
                }
            };

            $scope.cancelContainerSave = (container) => {
                $scope.addNew = false;
                $scope.isRequiredValid = true;
                $scope.isValidContainerNo = true;
                $scope.RecordToSave = {};
                if (container)
                    $scope.editContainer[container.ContainerNumber] = false;
            }
            //Go back to Sub DO Details
            $scope.backtoSubDoDetails = () => {
                $scope.cancelContainerSave();
                $state.go('subDODetails', { 'centerCode': $stateParams.centerCode, 'agentCode': $stateParams.agentCode, 'mode': 'edit' });
            }

            // load More Records
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.parameters.pageNumber = newPageNo;
                getContainerList();
            }
            //Get Container List
            function getContainerList() {
                var manifestInformation = $storage.get('storedManifestInformation');
                if (manifestInformation) {
                    $scope.parameters.houseBLNumber = manifestInformation.HouseBlNumber;
                    $scope.parameters.MasterBLNumber = manifestInformation.MasterBlNumber;
                    $scope.parameters.voyageNumber = manifestInformation.VoyageNumber;
                    $scope.parameters.vesselCode = manifestInformation.VesselCode ? manifestInformation.VesselCode.trim() : '';
                }
                $("#loadingScreen").show();
                apiService.get('Customs/BillOfLading/GetDOContainers', $scope.parameters, function (results) {
                    $("#loadingScreen").hide();
                    $scope.containerList = results.data.ResponseResult.Data;
                    if ($scope.containerList != null && $scope.containerList.length > 0) {
                        $scope.totalCount = $scope.containerList[0].TotalCount;
                    }
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    $log.log(response);
                });
            }

            function resetSearchParams() {
                $scope.parameters = {
                    centerCode: $stateParams.centerCode,
                    pageNumber: 1,
                    pageSize: 10,
                    houseBLNumber: '',
                    MasterBLNumber: '',
                    voyageNumber: '',
                    agentCode: $stateParams.agentCode,
                    vesselCode: '',
                    doCenterCode: $stateParams.centerCode,
                    searchString: ''
                };
            }

            //Load
            $scope.init = () => {
                $scope.addNew = false;
                $scope.editRow = !$scope.addNew;
                $scope.RecordToSave = {};
                $scope.isValidContainerNo = true;
                $scope.isRequiredValid = true;
                $scope.mesaureInvalidFormat = false;
                $scope.weightInvalidFormat = false;
                $scope.clearanceFlag = $stateParams.ClearanceFlag;
                resetSearchParams();
                getContainerList();
            }

            $scope.init();
        }
    ]);