angular.module('mamarApp').controller('vehicleListController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$filter',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $filter) {

        $scope.$storage = $storage;

        $scope.centerCode = $stateParams.centerCode;
        $scope.jobNumber = $stateParams.jobNumber;
        $scope.billType = $stateParams.BillType;
        $scope.navigatedFromMenu = $stateParams.fromMenu;
        $scope.registrationEnabed = false;
        $scope.searchParams = {
            centerCode: $scope.centerCode,
            jobNumber: $scope.jobNumber,
            pageNumber: 1,
            pageSize: 10
        };
        $scope.totalCount = '';

        $scope.selectedVehicle = {};
        

        $scope.clearSearchFilters = function () {
            //$scope.InitSearchParams();
            //$scope.newVehicle.TruckNumber = '';
            //$scope.newVehicle.TruckNationality = '';
            //$scope.newVehicle.TruckType = '';
            //$scope.newVehicle.TruckDriver = '';
            //$scope.newVehicle.DriverNationality = '';
            $scope.GetVehicleList();
        }
        // GET VEHICLE LIST
        $scope.GetVehicleList = () => {
            $("#loadingScreen").show();
            apiService.get('Customs/Vehicle/GetVehicleList', $scope.searchParams, function (results) {
                $("#loadingScreen").hide();
                var result = results.data.ResponseResult;
                if (result.IsValid && result.Data != null && result.Data.Trucks) {
                    let increment = 0;
                    $scope.vehicleList = result.Data.Trucks;
                    $scope.vehicleList.map((data) =>
                    {
                        data.OldTruckNationality = data.TruckNationality;
                        data.OldTruckNumber = data.TruckNumber;
                        $scope.enabledEditButton[increment] = true; 
                        $scope.enabledDropDown[increment] = false;
                        $scope.VisibleDeleteButton[increment] = true;

                        $scope.enabledEdit[increment] = false;
                       
                        $scope.enabledRemove[increment] = false;
                        $scope.enabledSave[increment] = false;

                        
                        if ($stateParams.Status == 'Y') {
                            $scope.VisibleDeleteButton[increment] = false;
                            $scope.enabledEditButton[increment] = false;
                            $scope.enabledSave[increment] = false;
                            $scope.enabledRemove[increment] = false;
                            $scope.enabledCancel[increment] = false;
                            $scope.enabledPreClearn[increment] = false;
                            //$scope.VisibleDeleteButton[increment] = false;
                            //$scope.enabledEditButton[increment] = false;
                            //$scope.enabledSave[increment] = false;
                            //$scope.enabledRemove[increment] = false;
                            //$scope.enabledCancel[increment] = false;
                        }
                        else {
                            $scope.enabledPreClearn[increment] = true;
                            //$scope.enabledPreClearn[increment] = ;
                            //$scope.VisibleDeleteButton[increment] = true;
                            //$scope.enabledEditButton[increment] = true;

                            //$scope.enabledSave[increment] = true;
                            //$scope.enabledRemove[increment] = true;
                            //$scope.enabledCancel[increment] = true;
                        }
                        //$scope.enabledInputField[increment] = false;
                        increment++;
                    });
                    $scope.totalCount = result.Data.TotalTrucks;
                    if ($stateParams.Status == 'Y') {
                        $scope.Status = true;
                    }
                    else {
                        $scope.Status = false;
                    }
                    ////////// Add New Row
                    //var data = {
                    //    TruckNumber: "", TruckNationality: "", TruckType: "", OldTruckNationality: "", OldTruckNumber: "",
                    //    TruckDriver: "", DriverNationality: "", PermitNumber: "", disableEdit: false
                    //};

                    //if ($scope.vehicleList == undefined || $scope.vehicleList == null) {
                    //    $scope.vehicleList = [];
                    //}
                    //$scope.vehicleList.push(data);

                    //$scope.enabledEdit[$scope.vehicleList.length - 1] = false;
                    /////////
                }
            },
        function error(response) {
            $("#loadingScreen").hide();
            console.log(response);
        });
        }


        // load More Records
        $scope.loadMoreRecords =(newPageNo) => {
            $scope.searchParams.pageNumber = newPageNo;
            $scope.GetVehicleList();
        }

        // back to ShipmentDetails screen
        $scope.gotoShipmentDetails =() => {
            $state.go('shipmentAndInvoice', { centerCode: $scope.centerCode, jobNumber: $scope.jobNumber, tab: 'shipmentdetails', Status: $stateParams.Status },
                        { notify: true });
        }

        // open Vehicle Modal popup form
        $scope.openVehicleForm =  (selectedItem, action) => {
            $scope.selectedVehicle = angular.copy(selectedItem);
            $scope.action = action;
            $('#modalVehicle').modal({ backdrop: "static" });
        }

        // close Modal Popupe
        $scope.closeModalPopUp = function () {
            $scope.selectedVehicle = {};
            $('#modalVehicle').modal('hide');
        };

        $scope.addVehicle = () => {
            if ($scope.vehicleList == undefined || $scope.vehicleList == null) {
                $scope.vehicleList = [];
            }
            let isAdded = false;
            $scope.vehicleList.map((information) => {
                if (apiService.isNullOrEmptyOrUndefined(information.TruckNumber)
                    && apiService.isNullOrEmptyOrUndefined(information.TruckNationality)
                    && apiService.isNullOrEmptyOrUndefined(information.TruckType)
                    && apiService.isNullOrEmptyOrUndefined(information.TruckDriver)
                    && apiService.isNullOrEmptyOrUndefined(information.DriverNationality)
                    && apiService.isNullOrEmptyOrUndefined(information.PermitNumber)
                )
                {
                    isAdded = true;
                }
            });
            if (isAdded == true)
            {
                return;
            }
            var data = {
                TruckNumber: "", TruckNationality: "", TruckType: "", OldTruckNationality: "", OldTruckNumber:"",
                TruckDriver: "", DriverNationality: "", PermitNumber: "" ,disableEdit: false
            };

            if ($scope.vehicleList == undefined || $scope.vehicleList == null) {
                $scope.vehicleList = [];
            }

            if ($scope.vehicleList.length == 10) {
                $scope.vehicleList.pop();
            }
            else {

            }

            $scope.vehicleList.push(data);
            $scope.enabledEdit[$scope.vehicleList.length - 1] = true;
            $scope.enabledEditButton[$scope.vehicleList.length - 1] = false;
            $scope.enabledRemove[$scope.vehicleList.length - 1] = true;
            $scope.enabledCancel[$scope.vehicleList.length - 1] = false;
            $scope.enabledSave[$scope.vehicleList.length - 1] = true;
            $scope.VisibleDeleteButton[$scope.vehicleList.length - 1] = false;
            $scope.enabledDropDown[$scope.vehicleList.length - 1] = false;
            $scope.enabledPreClearn[$scope.vehicleList.length - 1] = true;
        }
        $scope.submitEmployee = function () {
            console.log("form submitted:" + angular.toJson($scope.empoyees));
        }
        // init
        $scope.init = () => {
            debugger;
            $scope.enabledEdit = [];
            $scope.enabledRemove = [];
            $scope.enabledCancel = [];
            $scope.enabledEditButton = [];
            $scope.enabledSave = [];
            $scope.VisibleDeleteButton = [];
            //$scope.enabledInputField = [];
            //$scope.OldTruckNationality = [];
            //$scope.OldTruckNumber = [];
            $scope.enabledDropDown = [];
            $scope.enabledPreClearn = [];
            $scope.GetVehicleList();
            $scope.Status = false;
            //if ($stateParams.Status == 'Y')
            //{
            //    $scope.Status = true;
            //}
        }

        $scope.CancelEdit = (index) => {
            $scope.enabledEdit[index] = false;
            $scope.enabledCancel[index] = false;
            $scope.enabledSave[index] = false;
            $scope.GetVehicleList();
        }

        $scope.SaveVehicleInformation = (index) => {
            var data = $scope.vehicleList[index];
            $scope.newVehicle = {
                CenterCode: $scope.centerCode,
                JobNumber: $scope.jobNumber,
                TruckNumber: data.TruckNumber,
                TruckNationality: data.TruckNationality,
                TruckType: data.TruckType,
                TruckDriver: data.TruckDriver,
                DriverNationality: data.DriverNationality,
                OldTruckNumber: data.OldTruckNumber,
                OldTruckNationality: data.OldTruckNationality,
                PermitNumber: data.PermitNumber,
            };

            if (!apiService.isNullOrEmptyOrUndefined(data.PermitNumber)) {
            }
            else {
                if (apiService.isNullOrEmptyOrUndefined($scope.newVehicle.TruckNumber)) {
                    modalErrorShow("Please enter Truck Number");
                    return;
                }
                else if (apiService.isNullOrEmptyOrUndefined($scope.newVehicle.TruckNationality)) {
                    modalErrorShow("Please enter Truck Nationality");
                    return;
                }
            }
            $("#loadingScreen").show();
            apiService.post('Customs/Vehicle/SaveVehicle','',$scope.newVehicle, function (results) {
                $("#loadingScreen").hide();
                var result = results.data.ResponseResult;
                if (result.IsValid) {
                    $scope.enabledEdit[index] = false;
                    $scope.enabledEditButton[index] = true;
                    $scope.enabledCancel[index] = false;
                    $scope.enabledRemove[index] = false;
                    $scope.enabledSave[index] = false;
                    $scope.enabledRemove[index] = false;
                    $('#successModal').modal('show');
                    $scope.vehicleList = [];
                    $scope.GetVehicleList();
                } else {
                    $("#loadingScreen").hide();
                    modalErrorShow(result.Messages);
                    console.log(result.Messages);
                }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    modalErrorShow(response);
                    console.log(response);
                });
        }
        $scope.edit = (index) => {
            var data = $scope.vehicleList[index];

            $scope.enabledEdit[index] = true;
            $scope.enabledCancel[index] = true;
            $scope.enabledRemove[index] = false;
            $scope.enabledDropDown[index] = false;
            //$scope.enabledInputField[index] = true;
            $scope.VisibleDeleteButton[index] = false;
            $scope.enabledEditButton[index] = false;
            $scope.enabledSave[index] = true;
            //SetTruckNationality(data);
        }
        $scope.Delete = function (index) {
            $scope.vehicleList.splice(index, 1);
            $scope.vehicleList = null;
            $scope.GetVehicleList();
           
        }

        $scope.DeleteVehicle = function (data) {
            $scope.VehicleData = data;
            $("#ConfirmDeleteModalPopup").modal("show");
        }
        $scope.deleteOkay = function () {
            $("#ConfirmDeleteModalPopup").modal("hide");
            $("#loadingScreen").show();
            $scope.VehicleData.CenterCode = $scope.centerCode;
            apiService.post('Customs/Vehicle/DeleteVehicle','', $scope.VehicleData, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = apiService.formatResponseMessage(response.Messages);
                if (response.IsValid) {
                    $('#successModal').modal('show');
                    $scope.vehicleList = [];
                    $scope.GetVehicleList();
                }
                else if (!response.IsValid) {
                    $scope.GetVehicleList();
                    modalErrorShow(msg);
                }
            },
                function (result) {
                    $("#loadingScreen").hide();
                    console.log("An Error has occurred!");
                    console.log(result);
                });
        }

        $scope.init();


        // LookUp
        $scope.truckNationalityChanged = (searchStr) => {
            if (searchStr) {
                $scope.validTruckNationality = true;
                apiService.get('Customs/Lookup/GetTruckNationality',
                    {
                        centerCode: $scope.centerCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.truckNationalities = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        console.log(response);
                    });
            }
        }

        function SetTruckNationality(searchStr) {
            if (searchStr) {
                $scope.validTruckNationality = true;
                apiService.get('Customs/Lookup/GetTruckNationality',
                    {
                        centerCode: $scope.centerCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.truckNationalities = results.data.ResponseResult.Data;
                        //row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        if ($scope.truckNationalities!=null && $scope.truckNationalities.length > 0) {
                            $scope.truckNationality = $scope.truckNationalities[0].Code.toString() + "     " + $scope.truckNationalities[0].EngName.toString() + "     " + $scope.truckNationalities[0].ArbName.toString();
                            }
                    },
                    function error(response) {
                        console.log(response);
                    });
            }
        }

        //

        //Navigate to Registration Details
        $scope.checkRegistrationEnabled = function (item, index,type) {
            $scope.registrationEnabed = false;
            if (item.TruckNumber, item.TruckNationality, item.TruckType, item.TruckDriver, item.DriverNationality) {
                $scope.registrationEnabed = true;
            }
            switch (type) {
                case 'TruckNationality':
                    $scope.vehicleList[index].TruckNationality = $filter('uppercase')($scope.vehicleList[index].TruckNationality);
                    break;
                case 'TruckType':
                    $scope.vehicleList[index].TruckType = $filter('uppercase')($scope.vehicleList[index].TruckType);
                    break;
                case 'TruckDriver':
                    $scope.vehicleList[index].TruckDriver = $filter('uppercase')($scope.vehicleList[index].TruckDriver);
                    break;
                case 'DriverNationality':
                    $scope.vehicleList[index].DriverNationality = $filter('uppercase')($scope.vehicleList[index].DriverNationality);
                    break;
            }
           
        }
        $scope.registerVehicle = function (item) {
            $state.go('vehicleRegistration', { centerCode: $scope.centerCode, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $scope.navigatedFromMenu, PermitNumber: item.PermitNumber });
        }
    }]);