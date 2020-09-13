angular.module('mamarApp').controller('VehicleRegistrationTrailerController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$timeout', '$anchorScroll', '$location',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $filter, $timeout, $anchorScroll,$location) {
        $scope.centerCode = $stateParams.centerCode;
        $scope.registrationEnabed = false;
        $scope.searchParams = {
            centerCode: $stateParams.centerCode,//'G',
            PermitNumber: $stateParams.PermitNumber,//'40021336',
            pageNumber: 1,
            pageSize: 10
        };
        $scope.totalCount = '';
        $scope.selectedVehicle = {};
        $anchorScroll.yOffset = -750;
        var gotoAnchor = function (divId) {
            debugger;
            if ($location.hash() !== divId) {
                $location.hash(divId);
            } else {
                $anchorScroll();
            }
        };
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
            apiService.get('Customs/Vehicle/GetTrailerList', $scope.searchParams, function (results) {
                var result = results.data.ResponseResult;
                if (result.IsValid && result.Data != null && result.Data.VehicleTrailers) {
                    let increment = 0;
                    $scope.vehicleList = result.Data.VehicleTrailers;
                    $scope.vehicleList.map((data) => {
                        data.Trailer = data.TrailerColor + ' ' + data.TrailerColorArb + ' ' + data.TrailerColorEng;
                        data.selectedVehicleCategory = data.VehicleCategoryCode + ' ' + data.VehicleCategoryDecArb + ' ' + data.VehicleCategoryDescEng;
                        data.selectedVehicleType = data.VehicleCode + ' ' + data.VehicleDescArb + ' ' + data.VehicleDescEng;

                        if (!apiService.isNullOrEmptyOrUndefined(data.CenterOpen)
                            && !apiService.isNullOrEmptyOrUndefined(data.CenterOpenEng)) {
                            data.CenterO = data.CenterOpen + ' ' + data.CenterOpenArb + ' ' + data.CenterOpenEng;
                        }
                        if (!apiService.isNullOrEmptyOrUndefined(data.CenterClose)
                            && !apiService.isNullOrEmptyOrUndefined(data.CenterCloseArb)) {
                            data.CenterC = data.CenterClose + ' ' + data.CenterCloseArb + ' ' + data.CenterCloseEng;
                        }

                        if (!apiService.isNullOrEmptyOrUndefined(data.AuditorUserClose)
                            && !apiService.isNullOrEmptyOrUndefined(data.AuditorUserCloseArb)) {
                            data.AuditorUserC = data.AuditorUserClose + ' ' + data.AuditorUserCloseArb + ' ' + data.AuditorUserCloseEng;
                        }


                        if (!apiService.isNullOrEmptyOrUndefined(data.AuditorUserOpen)
                            && !apiService.isNullOrEmptyOrUndefined(data.AuditorUserOpenArb)) {
                            data.AuditorUserO = data.AuditorUserOpen + ' ' + data.AuditorUserOpenArb;// + ' ' + data.VehicleDescEng;
                        }

                        data.Close = data.FlagClose == 'N' ? false : true;
                        data.Open = data.FlagOpen == 'Y' ? true : false;
                        // Button
                        $scope.enabledEditButton[increment] = true;
                        $scope.enabledDropDown[increment] = false;
                        $scope.VisibleDeleteButton[increment] = true;
                        $scope.enabledRemove[increment] = false;
                        $scope.enabledSave[increment] = false;
                        $scope.enableTrailerNumber[increment] = false;
                        $scope.IsShow[increment] = true; //New Added
                        //Button End



                        $scope.enabledEdit[increment] = false;
                        increment++;
                    });
                    if ($scope.vehicleList.length > 0) {
                        $scope.totalCount = $scope.vehicleList[0].TotCount;
                    }

                    console.log($scope.vehicleList);
                    $("#loadingScreen").hide();
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
                   
                    //if (apiService.isNullOrEmptyOrUndefined($stateParams.PermitNumber)) {
                    //    $scope.GetPermitNumber();
                    //}
                    //else {
                    //    //$stateParams.PermitNumber
                    //    $("#loadingScreen").hide();
                    //    $scope.searchParams.PermitNumber = $stateParams.PermitNumber;
                    //}
                }
                else {
                    $("#loadingScreen").hide();
                    //if (apiService.isNullOrEmptyOrUndefined($stateParams.PermitNumber)) {
                    //    $scope.GetPermitNumber();
                    //}
                    //else {
                    //    $("#loadingScreen").hide();
                    //    $scope.searchParams.PermitNumber = $stateParams.PermitNumber;
                    //}
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
            //$state.go('shipmentAndInvoice', { centerCode: $scope.centerCode, jobNumber: $scope.jobNumber, tab: 'shipmentdetails', Status: $stateParams.Status },
            //            { notify: true });
            $state.go("vehicleRegistration", { 'centerCode': $scope.centerCode, 'PermitNumber': $stateParams.PermitNumber, 'jobNumber': $stateParams.jobNumber, 'BillType': $stateParams.BillType, 'fromMenu': $stateParams.fromMenu, 'Type': 'VehicleTrailer' });
            //, 'IsJobNumberVisible': $scope.IsJobNumberVisible

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
        $scope.rowCount = 0;
        $scope.addVehicle = () =>
        {
            debugger;

            $scope.AddingNew = true;
            $scope.RecordToSave = {};

            //AddingNew
            //if ($scope.vehicleList == undefined || $scope.vehicleList == null) {
            //    $scope.vehicleList = [];
            //}
            //let isAdded = false;
            //$scope.vehicleList.map((information) => {
            //    if (apiService.isNullOrEmptyOrUndefined(information.TruckNumber)
            //        && apiService.isNullOrEmptyOrUndefined(information.TruckNationality)
            //        && apiService.isNullOrEmptyOrUndefined(information.TruckType)
            //        && apiService.isNullOrEmptyOrUndefined(information.TruckDriver)
            //        && apiService.isNullOrEmptyOrUndefined(information.DriverNationality)
            //        && apiService.isNullOrEmptyOrUndefined(information.PermitNumber)
            //    )
            //    {
            //        isAdded = true;
            //    }
            //});
            //if (isAdded == true)
            //{
            //    return;
            //}
            //var data = {
            //    ChassisNumber: "", Trailer: "", Trailers:"", selectedVehicleType: "", selectedVehicleCategory1:"", VehicleType: "", VehicleCategory: "", Open: false, disableEdit: false, Close: false, TrailerSerialNo: "", TrailerNo:""
            //};

            //if ($scope.vehicleList == undefined || $scope.vehicleList == null) {
            //    $scope.vehicleList = [];
            //}

            //if ($scope.vehicleList.length == 10) {
            //    $scope.vehicleList.pop();
            //    //$scope.vehicleList.shift();
            //}
            //else {

            //}

            ////var RowC = 0;

            //$scope.enabledCheckBox[$scope.vehicleList.length - 1] = true;
            ////$scope.enabledCheckBox[RowC] = true;
            

            //$scope.vehicleList.push(data);
            ////$scope.vehicleList.unshift(data);

            ////$scope.enabledEdit[RowC] = true;
            ////$scope.enabledEditButton[RowC] = false;
            ////$scope.enabledRemove[RowC] = true;
            ////$scope.enabledCancel[RowC] = false;
            ////$scope.enabledSave[RowC] = true;
            ////$scope.VisibleDeleteButton[RowC] = false;
            ////$scope.enabledDropDown[RowC] = false;
            ////$scope.enableTrailerNumber[RowC] = false;
            ////$scope.rowCount = RowC;




            //$scope.enabledEdit[$scope.vehicleList.length - 1] = true;
            //$scope.enabledEditButton[$scope.vehicleList.length - 1] = false;
            //$scope.enabledRemove[$scope.vehicleList.length - 1] = true;
            //$scope.enabledCancel[$scope.vehicleList.length - 1] = false;
            //$scope.enabledSave[$scope.vehicleList.length - 1] = true;
            //$scope.VisibleDeleteButton[$scope.vehicleList.length - 1] = false;
            //$scope.enabledDropDown[$scope.vehicleList.length - 1] = false;
            //$scope.enableTrailerNumber[$scope.vehicleList.length - 1] = false;
            //$scope.rowCount = $scope.vehicleList.length - 1;

            //$scope.selectedVehicleCategory1 = '';
            //$scope.Trailer = '';
            //$scope.selectedVehicleType = '';
                          
            //var id = '';// 'ddlVehicleCategory[0]';
            //if ($scope.rowCount == 0) {
            //    id ='ddlVehicleCategory[0]'; }
            //if ($scope.rowCount == 1) { id = 'ddlVehicleCategory[1]';}
            //if ($scope.rowCount == 2) { id = 'ddlVehicleCategory[2]';}
            //if ($scope.rowCount == 3) { id = 'ddlVehicleCategory[3]';}
            //if ($scope.rowCount == 4) { id = 'ddlVehicleCategory[4]'; }
            //if ($scope.rowCount == 5) { id = 'ddlVehicleCategory[5]';}
            //if ($scope.rowCount == 6) { id = 'ddlVehicleCategory[6]';}
            //if ($scope.rowCount == 7) { id = 'ddlVehicleCategory[7]';}
            //if ($scope.rowCount == 8) { id = 'ddlVehicleCategory[8]';}
            //if ($scope.rowCount == 9) { id = 'ddlVehicleCategory[9]';}

            //gotoAnchor(id);

        }
        $scope.submitEmployee = function () {
            console.log("form submitted:" + angular.toJson($scope.empoyees));
        }
        // init
        $scope.init = () => {
            $scope.IsShow=[];
            $scope.IsJobNumberVisible = false;
            $scope.enableTrailerNumber = [];
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
            $scope.enabledCheckBox=[];
            $scope.GetVehicleList();
            $scope.selectedVehicleType = '';
            $scope.selectedVehicleCategory = '';
            $scope.Trailer = '';
            $scope.selectedVehicleType = '';

            $scope.selectedVehicleCategoryObj1 = [];
            $scope.selectedVehicleCategoryObj = {};
            $scope.selectedVehicleCategoryObj.originalObject = {};
            $scope.selectedVehicleCategoryObj.originalObject.Code = null;
            $scope.selectedVehicleCategoryObj.originalObject.EngName = null;
            $scope.selectedVehicleCategoryObj.originalObject.ArbName = null;

           
        }

        $scope.GetPermitNumber = () =>
        {
            $("#loadingScreen").show();
            apiService.get('Customs/Vehicle/GetPermitNumber',
                {
                    centerCode: $scope.centerCode
                },
                function (results) {
                    var data = results.data.ResponseResult;
                    if (data.IsValid) {
                        $stateParams.PermitNumber = data.Data.PermitNumber;
                        $scope.searchParams.PermitNumber = data.Data.PermitNumber;
                        $scope.IsJobNumberVisible = true;
                    }
                    else {
                        modalWarningShow(data.MessageEnglish);
                    }
                },
                function error(response) {
                    modalErrorShow(response);
                    console.log(response);
                });
            $("#loadingScreen").hide();
        }

        $scope.hideResults = function (data) {
            debugger;
        }

        // GET VEHICLE CATEGORY LIST
        $scope.onVehicleCatChange = function (searchStr)
        {
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleCategory = 1;
            $scope.PopulateVehicleCategorys(searchStr, false);
            return $scope.vehicleCategorys;
        }
        $scope.PopulateVehicleCategorys = function (searchStr, loadCategory)
        {
            apiService.get('Customs/Lookup/VehicleCategories',
                {
                    centerCode:$scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.vehicleCategoryList = results.data.ResponseResult.Data;
                    if (loadCategory && $scope.vehicleCategoryList) {//When selecting the vehicle type, the corresponding category has to be selected as default.
                        var row = $scope.vehicleCategoryList.filter(x => x.Code == searchStr)
                        if (row && row.length > 0) {
                            $scope.setVehicleCategory(row[0]);
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                });
        }
        // GET VEHICLE TYPE LIST
        $scope.onVehicleTypeChange = function (searchStr) {
            $scope.PopulateVehicleTypes(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleType = 1;
            if ($scope.vehicleTypesFull) {
                $scope.vehicleTypes = $scope.vehicleTypesFull;
                return $scope.vehicleTypes;
                //$scope.vehicleTypes = $scope.vehicleTypesFull.filter(obj => {
                //    return obj.Code.toString().toLowerCase().includes($scope.searchVehicleTypeText.toLowerCase())
                //        || (obj.EngName && obj.EngName.toLowerCase().includes($scope.searchVehicleTypeText.toLowerCase()))
                //        || (obj.ArbName && obj.ArbName.toLowerCase().includes($scope.searchVehicleTypeText.toLowerCase()));
                //});
            }
        }
        $scope.PopulateVehicleTypes = function (searchStr) {
            apiService.get('Customs/Lookup/VehicleTypes',
                {
                    centerCode: $scope.centerCode,
                    searchString: searchStr
                },
                function (results) {
                    $scope.vehicleTypesFull = results.data.ResponseResult.Data;
                    $scope.vehicleTypes = angular.copy($scope.vehicleTypesFull);

                    if ($scope.selectedVehicleTypeObj && $scope.selectedVehicleTypeObj.originalObject) {
                        $scope.PopulateVehicleCategorys($scope.selectedVehicleTypeObj.originalObject.VCTCode, true);
                    }
                },
                function error(response) {
                    console.log(response);
                });
        }

        $scope.$watch("searchVehicleTypeText", function () {
            debugger;
            $scope.onVehicleTypeChange($scope.searchVehicleTypeText);
        });
        $scope.$watch("selectedVehicleTypeObj", function () {
            debugger;
            if ($scope.selectedVehicleTypeObj && $scope.selectedVehicleTypeObj.originalObject) {
                $scope.PopulateVehicleCategorys($scope.selectedVehicleTypeObj.originalObject.VCTCode, true);
            }
        });

        $scope.selectedVehicleTypeObj1 = function (selected) {
            debugger;
            if (!apiService.isNullOrEmptyOrUndefined(selected)) {
                $scope.VehicleType = selected.title;
                $scope.selectedVehicleType = selected.title;
                $scope.PopulateVehicleCategorys(selected.description.VCTCode, true);
            }
            console.log(selected);
        };

        //
        $scope.$watch("TrailerCategoriesText", function () {
            debugger;
            $scope.onTrailerCategoriesChange($scope.TrailerCategoriesText);
        });
        $scope.onTrailerCategoriesChange = function (searchStr) {
            $scope.PopulateTrailerCategories(searchStr, false);
            return $scope.TrailerCategoriesList;
        }
        $scope.PopulateTrailerCategories = function (searchStr) {
            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr,
                    lookupType: 'Color'
                },
                function (results) {
                    $scope.TrailerCategoriesList = results.data.ResponseResult.Data;
                    if ($scope.TrailerCategoriesList)
                    {
                        //var row = $scope.TrailerCategoriesList.filter(x => x.Code == searchStr)
                        ////if (row && row.length > 0) {
                        ////    $scope.setVehicleCategory(row[0]);
                        ////}
                        $scope.plateColorsFull = results.data.ResponseResult.Data;
                        $scope.plateColors = angular.copy($scope.plateColorsFull);
                    }
                },
                function error(response) {
                    console.log(response);
                });
        }


        $scope.setVehicleCategory = function (row)
        {
            $scope.RecordToSave.selectedVehicleCategory1 = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            $("#vehicleCategoryLookup").modal("hide");
            //$scope.selectedVehicleCategory1 = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            //$timeout(function () {
            //    debugger;
            //    $scope.selectedVehicleCategory1 = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            //    $("#vehicleCategoryLookup").modal("hide");
            //});
            //var data = $scope.vehicleList[$scope.rowCount];
            //data.VehicleCategory = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            //$scope.vehicleList[$scope.rowCount].VehicleCategory = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.ArbName ? row.ArbName : '');
            ////var sdadsa = $scope.vehicleList[rowCount];
            
        }


        $scope.CancelEdit = (index) => {
            $scope.AddingNew = false;
            //$scope.enabledEdit[index] = false;
            $scope.enabledCancel[index] = false;
            //$scope.enabledSave[index] = false;
            $scope.GetVehicleList();
        }
        $scope.SaveVehicleInformation = (index) => {
            debugger;
            var data = '';

            if (apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.ChassisNumber)) {
                modalErrorShow("Please enter Chassis Number");
                return;
            }
            else if (apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.Trailer)) {
                modalErrorShow("Please enter Trailer");
                return;
            }
            else if (apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.selectedVehicleCategory1)) {
                modalErrorShow("Please enter Vehicle Category");
                return;
            }
            else if (apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.TrailerNo)) {
                modalErrorShow("Please enter Trailer Number");
                return;
            }
            else if (apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.selectedVehicleType)) {
                modalErrorShow("Please enter Vehicle Type");
                return;
            }

            if (!apiService.isNullOrEmptyOrUndefined(index)) {
                data = $scope.vehicleList[index];
            }
            else {
                data.TrailerSerialNo = null;
            }
            $scope.newVehicle = {
                TrailerColor: $scope.RecordToSave.Trailer.split(' ')[0],
                VehicleCategoryCode: $scope.RecordToSave.selectedVehicleCategory1.split(' ')[0],//data.selectedVehicleCategory.split(' ')[0],
                VehicleCode: $scope.RecordToSave.selectedVehicleType.split(' ')[0],
                PermitNumber: $scope.searchParams.PermitNumber,
                ChassisNumber: $scope.RecordToSave.ChassisNumber,
                CenterCode: $scope.searchParams.centerCode,
                TrailerSerialNo: data.TrailerSerialNo,
                TrailerNo: $scope.RecordToSave.TrailerNo
            };

            
            //TrailerNo
            $("#loadingScreen").show();
            apiService.post('Customs/Vehicle/SaveTrailerInfo','',$scope.newVehicle, function (results) {
                $("#loadingScreen").hide();
                var result = results.data.ResponseResult;
                if (result.IsValid) {
                    $scope.enabledEdit[index] = false;
                    $scope.enabledEditButton[index] = true;
                    $scope.enabledCancel[index] = false;
                    $scope.enabledRemove[index] = false;
                    $scope.enabledSave[index] = false;
                    $scope.enabledRemove[index] = false;
                    $scope.enabledCheckBox[index] = false;
                    $('#successModal').modal('show');
                    $scope.vehicleList = [];
                    $scope.AddingNew = false;
                    $scope.RecordToSave = {};
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
        $scope.edit = (index, item) => {
            var data = $scope.vehicleList[index];
            $scope.IsShow[index] = false;
            $scope.RecordToSave = {};

            $scope.RecordToSave.ChassisNumber = item.ChassisNumber;
            $scope.RecordToSave.Trailer = item.Trailer;
            $scope.RecordToSave.TrailerNo = item.TrailerNo;
            $scope.RecordToSave.selectedVehicleCategory1 = item.selectedVehicleCategory;
            $scope.RecordToSave.selectedVehicleType = item.selectedVehicleType;



            $scope.selectedVehicleCategory1 = item.selectedVehicleCategory;
            $scope.Trailer = item.Trailer;
            $scope.selectedVehicleType = item.selectedVehicleType;
            $scope.enabledEdit[index] = true;
            $scope.enabledCancel[index] = true;
            $scope.enabledRemove[index] = false;
            $scope.enabledDropDown[index] = false;
            //$scope.enabledInputField[index] = true;
            $scope.VisibleDeleteButton[index] = false;
            $scope.enabledEditButton[index] = false;
            $scope.enabledSave[index] = true;
            $scope.enabledCheckBox[index] = true;
            $scope.enableTrailerNumber[$scope.vehicleList.length - 1] = true;
            //SetTruckNationality(data);
        }
        $scope.Delete = function (index) {
            
            $scope.vehicleList.splice(index, 1);
            $scope.vehicleList = null;
            $scope.GetVehicleList();
            $scope.enabledCheckBox[index] = false;
        }
        $scope.DeleteVehicle = function (data) {
            debugger;
            $scope.VehicleData = data;
            $("#ConfirmDeleteModalPopup").modal("show");
        }
        $scope.deleteOkay = function () {
            debugger;
            $("#ConfirmDeleteModalPopup").modal("hide");
            $("#loadingScreen").show();
            $scope.VehicleData.CenterCode = $scope.centerCode;
            $scope.VehicleData.JobNumber = $stateParams.jobNumber;
            //$scope.VehicleData =
            //{
            //    TrailerColor: $scope.RecordToSave.Trailer.split(' ')[0],
            //    VehicleCategoryCode: $scope.RecordToSave.selectedVehicleCategory1.split(' ')[0],//data.selectedVehicleCategory.split(' ')[0],
            //    VehicleCode: $scope.RecordToSave.selectedVehicleType.split(' ')[0],
            //    PermitNumber: $scope.searchParams.PermitNumber,
            //    ChassisNumber: $scope.RecordToSave.ChassisNumber,
            //    CenterCode: $scope.searchParams.centerCode,
            //    JobNumber: $scope.searchParams.jobNumber,
            //    TrailerSerialNo: data.TrailerSerialNo,
            //    TrailerNo: $scope.RecordToSave.TrailerNo
            //};

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


        //Navigate to Registration Details
        $scope.checkRegistrationEnabled = function (item, index,type) {
            $scope.registrationEnabed = false;
            return;
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
            $state.go('vehicleRegistration', { centerCode: $scope.centerCode, jobNumber: $scope.jobNumber, BillType: $scope.billType, fromMenu: $scope.navigatedFromMenu });
        }

        //F9 Implementation

        $scope.vehicleTypeKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openVehicleTypeLookup();
            }
        }
        $scope.openVehicleTypeLookup = function (item) {
            $scope.searchVehicleTypeText = '';
            $('#vehicleTypeLookup').modal({
                backdrop: "static"
            });
            $('#searchVehicleTypeText').focus();
            $('#searchVehicleTypeText').select();
            $scope.onVehicleTypeChange();
            $("#vehicleTypeLookup").off("keydown");
            $('#vehicleTypeLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.vehicleTypes.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.vehicleTypes - 1) {
                                    $scope.lookUpCurrentPageVehicleType++;
                                }
                                $scope.vehicleTypeItemSelected = $scope.vehicleTypes[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageVehicleType - 1)) {
                                    $scope.lookUpCurrentPageVehicleType--;
                                }
                                $scope.rowIndex--;
                                $scope.vehicleTypeItemSelected = $scope.vehicleTypes[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setVehicleType($scope.vehicleTypeItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setVehicleType = function (row) {
         

            $scope.RecordToSave.selectedVehicleType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.VCTDescArb ? row.VCTDescArb : '');
            $("#vehicleTypeLookup").modal("hide");
            $scope.PopulateVehicleCategorys(row.VCTCode, true);
            //$scope.selectedVehicleType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.VCTDescArb ? row.VCTDescArb : '');
            //$timeout(function () {
            //    debugger;
            //    $scope.selectedVehicleType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.VCTDescArb ? row.VCTDescArb : '');
            //    $("#vehicleTypeLookup").modal("hide");

            //    var data = $scope.vehicleList[$scope.rowCount];
            //    data.VehicleType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.VCTDescArb ? row.VCTDescArb : '');
            //    data.selectedVehicleType = data.VehicleType
            //    $scope.vehicleList[$scope.rowCount].VehicleType = data.VehicleType;
            //    $scope.vehicleList[$scope.rowCount].selectedVehicleType = data.VehicleType;
            //});
            //$scope.PopulateVehicleCategorys(row.VCTCode, true);
            //var data = $scope.vehicleList[$scope.rowCount];
            //data.VehicleType = row.Code.toString() + "     " + (row.EngName ? row.EngName : '') + "     " + (row.VCTDescArb ? row.VCTDescArb : '');
            //data.selectedVehicleType = data.VehicleType
            //$scope.vehicleList[$scope.rowCount].VehicleType = data.VehicleType;
            //$scope.vehicleList[$scope.rowCount].selectedVehicleType = data.VehicleType;
        };

        $scope.PressDownTrailer = function (event) {
            if (event.key == 'F9') {
                $scope.openTrailerLookup();
            }
        }

        $scope.openTrailerLookup = function (item) {
           
            $scope.searchPlateColorText = '';
            $('#plateColorLookup').modal({
                backdrop: "static"
            });
            $('#TrailerCategoriesText').focus();
            $('#TrailerCategoriesText').select();
            $scope.PopulateTrailerCategories();
            $("#plateColorLookup").off("keydown");
            $('#plateColorLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.plateColors.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.plateColors - 1) {
                                    $scope.lookUpCurrentPagePlateColor++;
                                }
                                $scope.plateColorItemSelected = $scope.plateColors[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateColor - 1)) {
                                    $scope.lookUpCurrentPagePlateColor--;
                                }
                                $scope.rowIndex--;
                                $scope.plateColorItemSelected = $scope.plateColors[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setPlateColor($scope.plateColorItemSelected);
                            break;
                    }
                });
            });
        }
        $scope.setPlateColor = function (row)
        {
            $scope.RecordToSave.Trailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            $("#plateColorLookup").modal("hide");
            //$scope.Trailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            //$scope.SelectTrailorColors = $scope.Trailer;
            //var data = $scope.vehicleList[$scope.rowCount];
            //$scope.SelectedTrailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            //data.Trailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            //$scope.vehicleList[$scope.rowCount].Trailer = data.Trailer;
            //$scope.vehicleList[$scope.rowCount].Trailers = data.Trailer;

            //$timeout(function () {
            //    debugger;
            //    $scope.Trailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            //    $scope.SelectTrailorColors = $scope.Trailer;
            //    var data = $scope.vehicleList[$scope.rowCount];
            //    data.Trailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            //    $scope.vehicleList[$scope.rowCount].Trailer = data.Trailer;
            //    $scope.vehicleList[$scope.rowCount].Trailers = data.Trailer;
            //    $scope.SelectedTrailer = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
            //    $("#plateColorLookup").modal("hide");
            //});
            
        }
        // GET PLATE COLOR LIST
        $scope.PopulateTrailerCategories = function (searchStr) {
            
            //$scope.PopulateVehicleTypes(searchStr);

            apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: searchStr,
                    lookupType: 'Color'
                },
                function (results) {
                    $scope.TrailerCategoriesList = results.data.ResponseResult.Data;
                    if ($scope.TrailerCategoriesList) {
                        $scope.plateColorsFull = results.data.ResponseResult.Data;
                        $scope.plateColors = angular.copy($scope.plateColorsFull);

                        $scope.rowIndex = 0;
                        $scope.lookUpCurrentPagePlateColor = 1;
                        //if ($scope.TrailerCategoriesList) {
                        //    $scope.plateColors = $scope.plateColorsFull.filter(obj => {
                        //        return obj.Code.toString().toLowerCase().includes($scope.TrailerCategoriesText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.TrailerCategoriesText.toLowerCase()))
                        //            || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.TrailerCategoriesText.toLowerCase()));
                        //    });
                        //}

                    }
                },
                function error(response) {
                    console.log(response);
                });
           
        }

        $scope.vehicleCategoryKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openVehicleCategoryLookup();
            }
            //else if (event.keyCode == 9) {
            //    event.preventDefault();
            //    apiService.get('Customs/Lookup/VehicleCategories',
            //        {
            //            centerCode: $scope.centerCode,
            //            searchString: $scope.selectedVehicleCategory
            //        },
            //        function (results) {
            //            var vType = results.data.ResponseResult.Data;
            //            if (vType != null) {
            //                $scope.selectedVehicleCategoryEnglish = vType[0].EngName;
            //                $scope.selectedVehicleCategoryArabic = vType[0].ArbName;
            //                $("#txtVehicleColor").focus();
            //                $scope.selectedVehicleCategoryObj = {};
            //                $scope.selectedVehicleCategoryObj.originalObject = vType[0];
            //            }
            //            else {
            //                $scope.selectedVehicleCategoryEnglish = "";
            //                $scope.selectedVehicleCategoryArabic = "";
            //            }
            //        },
            //        function error(response) {
            //            console.log(response);
            //        });
            //}
        }
        $scope.openVehicleCategoryLookup = function (item) {
            $scope.searchVehicleCategoryText = '';
            $('#vehicleCategoryLookup').modal({
                backdrop: "static"
            });
            $('#searchVehicleCategoryText').focus();
            $('#searchVehicleCategoryText').select();
            $scope.onVehicleCatChange();
            $("#vehicleCategoryLookup").off("keydown");
            $('#vehicleCategoryLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.vehicleCategorys.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.vehicleCategorys - 1) {
                                    $scope.lookUpCurrentPageVehicleCategory++;
                                }
                                $scope.vehicleCategoryItemSelected = $scope.vehicleCategorys[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageVehicleCategory - 1)) {
                                    $scope.lookUpCurrentPageVehicleCategory--;
                                }
                                $scope.rowIndex--;
                                $scope.vehicleCategoryItemSelected = $scope.vehicleCategorys[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setVehicleCategory($scope.vehicleCategoryItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.$watch("searchVehicleCategoryText", function () {
            $scope.onVehicleCatChange($scope.searchVehicleCategoryText);
        });

        $scope.SelectTrailorColors = function (selected)
        {
            if (!apiService.isNullOrEmptyOrUndefined(selected)) {
                $scope.Trailer = selected.title;
                $scope.SelectedTrailer = selected.title;
            }
        };
        $scope.SelectTrailorColors = function (selected) {
            if (!apiService.isNullOrEmptyOrUndefined(selected)) {
                $scope.Trailer = selected.title;
                $scope.SelectedTrailer = selected.title;
            }
        };
        $scope.selectedVehicleCategoryObj = function (selected) {
            debugger;
            if (!apiService.isNullOrEmptyOrUndefined(selected)) {
                $scope.selectedVehicleCategory1 = selected.title;
                $scope.selectedVehicleCategoryObj = selected.title;
            }
        };
        

        // GET VEHICLE COLOR LIST
        $scope.onVehicleColorChange = function (searchStr) {
            $scope.PopulateTrailerCategories(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleColor = 1;
            if ($scope.plateColorsFull) {
                $scope.vehicleColors = $scope.plateColorsFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()))
                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()));
                });
            }
        }

        $scope.vehicleCategoryKeyDown = function (event) {
            if (event.key == 'F9') {
                $scope.openVehicleCategoryLookup();
            }
            //else if (event.keyCode == 9) {
            //    event.preventDefault();
            //    apiService.get('Customs/Lookup/VehicleCategories',
            //        {
            //            centerCode: $scope.centerCode,
            //            searchString: $scope.selectedVehicleCategory
            //        },
            //        function (results) {
            //            var vType = results.data.ResponseResult.Data;
            //            if (vType != null) {
            //                $scope.selectedVehicleCategoryEnglish = vType[0].EngName;
            //                $scope.selectedVehicleCategoryArabic = vType[0].ArbName;
            //                $("#txtVehicleColor").focus();
            //                $scope.selectedVehicleCategoryObj = {};
            //                $scope.selectedVehicleCategoryObj.originalObject = vType[0];
            //            }
            //            else {
            //                $scope.selectedVehicleCategoryEnglish = "";
            //                $scope.selectedVehicleCategoryArabic = "";
            //            }
            //        },
            //        function error(response) {
            //            console.log(response);
            //        });
            //}
        }
        $scope.openVehicleCategoryLookup = function (item) {
            $scope.searchVehicleCategoryText = '';
            $('#vehicleCategoryLookup').modal({
                backdrop: "static"
            });
            $('#searchVehicleCategoryText').focus();
            $('#searchVehicleCategoryText').select();
            $scope.onVehicleCatChange();
            $("#vehicleCategoryLookup").off("keydown");
            $('#vehicleCategoryLookup').bind('keydown', function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.vehicleCategorys.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.vehicleCategorys - 1) {
                                    $scope.lookUpCurrentPageVehicleCategory++;
                                }
                                $scope.vehicleCategoryItemSelected = $scope.vehicleCategorys[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {

                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageVehicleCategory - 1)) {
                                    $scope.lookUpCurrentPageVehicleCategory--;
                                }
                                $scope.rowIndex--;
                                $scope.vehicleCategoryItemSelected = $scope.vehicleCategorys[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setVehicleCategory($scope.vehicleCategoryItemSelected);
                            break;
                    }
                });
            });
        }

        $scope.$watch("searchVehicleCategoryText", function () {
            debugger;
            $scope.onVehicleCatChange($scope.searchVehicleCategoryText);
        });

        $scope.SelectTrailorColors = function (selected)
        {
            debugger;
            if (!apiService.isNullOrEmptyOrUndefined(selected)) {
                $scope.Trailer = selected.title;
                $scope.SelectedTrailer = selected.title;
                $rootScope.$broadcast('angucomplete-alt:clearSearch','ddlTrailerCategories');
            }
        };
        //$scope.SelectTrailorColors = function (selected) {
        //    debugger;
        //    if (!apiService.isNullOrEmptyOrUndefined(selected)) {
        //        $scope.Trailer = selected.title;
        //        $scope.SelectedTrailer = selected.title;
        //    }
        //};
        $scope.selectedVehicleCategoryObj = function (selected) {
            debugger;
            if (!apiService.isNullOrEmptyOrUndefined(selected)) {
                $scope.selectedVehicleCategory1 = selected.title;
                $scope.selectedVehicleCategoryObj = selected.title;
            }
        };
        

        // GET VEHICLE COLOR LIST
        $scope.onVehicleColorChange = function (searchStr) {
            $scope.PopulateTrailerCategories(searchStr);
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPageVehicleColor = 1;
            if ($scope.plateColorsFull) {
                $scope.vehicleColors = $scope.plateColorsFull.filter(obj => {
                    return obj.Code.toString().toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()))
                        || (obj.ArabicName && obj.ArabicName.toLowerCase().includes($scope.searchVehicleColorText.toLowerCase()));
                });
            }
        }

        //$scope.$on('angucomplete-alt:clearSearch', function (event, args) {
        //    debugger;
        //    if (scope.id == args.target) {
        //        scope.searchStr = null;
        //        clearResults();
        //    }
        //});

    }]);