angular.module('mamarApp').controller('containerListController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage) {
        $scope.$storage = $storage;
        var jobNumber = $stateParams.jobNumber;
        var centerCode = $stateParams.centerCode;
        //var selectedMode = $stateParams.selectedMode;
        $scope.totalCount = '';
        $scope.jobNumber = jobNumber;
        $scope.isValidContainerNo = true;
        $scope.isRequiredValid = true;
        //$scope.globalDisableFlag = $stateParams.globalDisableFlag == "view";
        $scope.acceptFiles = ".xlsx,.xls";
        $scope.parameters = {
            centerCode: centerCode,
            pageNumber: 1,
            pageSize: 10,
            jobNumber: jobNumber,
            searchString: ''
        };

        $scope.selectedContainer = {};
        $scope.containerList = [];
        $scope.isEditable = false;
        $scope.newContainer = {
            'JobNumber': jobNumber,
            'ContainerNumber': '',
            'SealNumber': '',
            'Size': '',
            'Service': '',
            'Weight': '',
            'Measure': '',
            'Remarks': '',
            'Channel': '',
            'RowNumber': 0,
            'CenterCode': centerCode
        };

        $scope.GetContainerList = function () {
            debugger;
            $("#loadingScreen").show();
            apiService.get('Customs/BillOfLading/GetContainers', $scope.parameters, function (results) {
                $("#loadingScreen").hide();
                let increment = 0;
                $scope.containerList = results.data.ResponseResult.Data;
                if ($scope.containerList != null && $scope.containerList.length > 0)
                {
                    $scope.containerList.map((data) => {
                        $scope.enabledEdit[increment] = false;
                        increment++;
                    });
                    $scope.totalCount = $scope.containerList[0].TotalCount;
                }
            },
        function error(response) {
            $("#loadingScreen").hide();
            alert('something went wrong');
            console.log(response);
        });
        }

        // get container list
        $scope.GetContainerList();

        // search Container
        $scope.searchContainer = function () {
            $scope.parameters.pageNumber = 1;
            $scope.parameters.searchString = $scope.searchString;
            $scope.GetContainerList();
        }

        // init
        $scope.init = () => {
            debugger;
            $scope.enabledEdit = [];
        }
        $scope.init();
        // open container Modal popup form
        $scope.openContainerForm = function (selectedItem, action, increment)
        {
            // $scope.containerList
            
            if (action == 'add')
            {
                $scope.AddingNew = true;
                $scope.RecordToSave = {};
                //$scope.selectedContainer = {};
            }
            else if (action == 'edit')
            {
                $scope.AddingNew = false;
                $scope.enabledEdit[increment] = true;   
                $scope.selectedContainer = angular.copy(selectedItem);
            }
           
            $scope.action = action;
            //$('#modalContainer').modal({ backdrop: "static" });
        }

        // close Modal Popup
        $scope.closeModalPopUp = function (index)
        {
            debugger;
            //$scope.reset();
            //$('#modalContainer').modal('hide');
            $scope.AddingNew = false;
            $scope.RecordToSave = {};
            $scope.selectedContainer = {};
            $scope.isValidContainerNo = true;
            $scope.isRequiredValid = true;
            $scope.enabledEdit[index] = false;
        };

        // call add/update method based on the action
        $scope.saveContainer = function (selectedItem, action, increment) {
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedContainer.ContainerNumber)
                || !apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.ContainerNumber))
            {
                if ($scope.isValidContainerNo) {
                    $scope.isRequiredValid = true;
                    if (action == 'add') {
                        selectedItem.jobNumber = $stateParams.jobNumber;
                        selectedItem.RowNumber = $scope.selectedContainer.RowNumber;
                        selectedItem.Channel = $scope.selectedContainer.Channel;
                        selectedItem.CenterCode = $stateParams.centerCode;
                        $scope.addContainer(selectedItem);
                    }
                    if (action == 'edit') {
                        $scope.updateContainer();
                    }
                }
                else
                {
                    modalErrorShow("Container Number format is incorrecct!");
                }
            }
            else {
                $scope.isRequiredValid = false;
                return false;
            }
            
        }

        CheckFormat = (Format) =>
        {
            var regex = /^(?!\.?$)\d{0,12}(\.\d{0,3})?$/;
            return regex.test(Format);
        }
        // add container
        $scope.addContainer = function (addContainer) {
            $("#loadingScreen").show();
            var DataTobeSave = addContainer;
           // $("#loadingScreen").hide();
            //
            if (!apiService.isNullOrEmptyOrUndefined(DataTobeSave.Measure) && !CheckFormat(DataTobeSave.Measure))
            {
                modalErrorShow("Measure value format is incorrect!");
                $("#loadingScreen").hide();
                return;
            } else if (!apiService.isNullOrEmptyOrUndefined(DataTobeSave.Weight) && !CheckFormat(DataTobeSave.Weight))
            {
                modalErrorShow("Weight value format is incorrect!");
                $("#loadingScreen").hide();
                return;
            }
            //
            apiService.post('Customs/BillOfLading/AddContainer', '', DataTobeSave, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = apiService.formatResponseMessage(response.Messages);
                if (response.IsValid) {
                    $scope.parameters.pageNumber = 1;
                    $scope.GetContainerList();
                    $scope.closeModalPopUp();
                    $('#successModal').modal('show');
                    //modalSuccessShow(msg);
                }
                else if (!response.IsValid) {
                    modalErrorShow(msg);
                    $("#loadingScreen").hide();
                }
                console.log(response);
            },
                function (result) {
                    $("#loadingScreen").hide();
                    console.log("An Error has occurred!");
                    console.log(result);
                });
        }

        // update container
        $scope.updateContainer = function () {
            $("#loadingScreen").show();
            $scope.selectedContainer.centerCode = centerCode;

            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedContainer.Measure) && !CheckFormat($scope.selectedContainer.Measure)) {
                modalErrorShow("Measure value format is incorrect!");
                $("#loadingScreen").hide();
                return;
            } else if (!apiService.isNullOrEmptyOrUndefined($scope.selectedContainer.Weight) && !CheckFormat($scope.selectedContainer.Weight)) {
                modalErrorShow("Weight value format is incorrect!");
                $("#loadingScreen").hide();
                return;
            }

            apiService.post('Customs/BillOfLading/UpdateContainer', '', $scope.selectedContainer, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = apiService.formatResponseMessage(response.Messages);
                if (response.IsValid) {
                    $scope.GetContainerList();
                    $scope.closeModalPopUp();
                    $('#successModal').modal('show');
                    //modalSuccessShow(msg);
                }
                else if (!response.IsValid) {
                    modalErrorShow(msg);
                }
                console.log(response);
            },
                function (result) {
                    $("#loadingScreen").hide();
                    console.log("An Error has occurred!");
                    console.log(result);
                });
        }

        // reset selected container row
        $scope.reset = function () {
            $scope.selectedContainer = {};
            $scope.isValidContainerNo = true;
            $scope.isRequiredValid = true;
        };

        // delete confirm
        $scope.deleteConfirm = function (index) {
            $scope.deleteIndex = index;
            $("#ConfirmDeleteModalPopup").modal("show");
        }

        // delete container Okay
        $scope.deleteOkay = function () {
            $("#ConfirmDeleteModalPopup").modal("hide");
            $("#loadingScreen").show();
            var container = $scope.containerList[$scope.deleteIndex];
            container.centerCode = centerCode;
            apiService.post('Customs/BillOfLading/DeleteContainer', '', container, function (result) {
                $("#loadingScreen").hide();
                var response = result.data.ResponseResult;
                var msg = apiService.formatResponseMessage(response.Messages);
                if (response.IsValid) {
                    if ($scope.containerList.length == 1) {
                        $scope.parameters.pageNumber = 1;
                    }
                    $scope.GetContainerList();
                    $('#successModal').modal('show');
                    //modalSuccessShow(msg);
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

        // load More Records
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.parameters.pageNumber = newPageNo;
            $scope.GetContainerList();
        }

        // back to ShipmentDetails screen
        $scope.gotoShipmentDetails = function () {
            $state.go('shipmentAndInvoice', { centerCode: centerCode, jobNumber: jobNumber,tab:'shipmentdetails' },
                        { notify: true });
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
        $scope.onContainerChanged = function (action) {
            $scope.isRequiredValid = true;
            //RecordToSave.ContainerNumber

            if (action != 'add')
            {
                if (!apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.ContainerNumber)) {
                    $scope.isValidContainerNo = apiService.validateContainerNo($scope.RecordToSave.ContainerNumber);
                }
                else { $scope.isValidContainerNo = true; }
            }
            else
            {
                if (!apiService.isNullOrEmptyOrUndefined($scope.RecordToSave.ContainerNumber)) {
                    $scope.isValidContainerNo = apiService.validateContainerNo($scope.RecordToSave.ContainerNumber);
                }
                else { $scope.isValidContainerNo = true; }
            }
        }

        // CONTAINER BULK UPLOAD --> START

        function AddAttachment(args, name) {
            var containerErrorValidation = '';
            var containerErrorValidationWarning = [];
            $('#ChassisErrordivResults').empty();
            var errormsg = "An Error has occurred while uploading file!"
            var serviceAttachInp = {};
            serviceAttachInp.CenterCode = $stateParams.centerCode;
            serviceAttachInp.jobNumber = $stateParams.jobNumber;
            serviceAttachInp.FilePath = args.file.name;
            if (args.file.size > 10485760) {
                $("#loadingScreen").hide();
                $(".toast-info").hide();
                modalErrorShow("Eng: File size is too big Please, File size should not be more than 10mb | Arb: حجم الملف كبير جدًا");
                return;
            }
            var fileAttach = apiService.postfile('Customs/BillOfLading/BulkUploadContainer', '', args.file, serviceAttachInp, 'Container');
            fileAttach.then(function (results) {
                $(".toast-info").hide();
                if (results.data.ResponseCode == "405") {
                    modalErrorShow(results.data.ResponseResult);
                    return;
                }
                if (results.data.ResponseResult == "") {
                    modalErrorShow(errormsg);
                    return;
                }
                if (results.data.IsError) {
                    containerErrorValidation = '';
                    containerErrorValidation = "<table class='table table - bordered' border='1'>";
                    for (a = 0; a < results.data.Response.split('&#10;').length; a++) {
                        let weather =
                            {
                                Warning: results.data.Response.split('&#10;')[a]
                            }

                        if (!isNullOrEmptyOrUndefined(weather.Warning)) {
                            containerErrorValidation += "<tr><td><i class='fa fa - warning' style='font - size: 20px'>" + weather.Warning + "</i></td></tr>";
                            containerErrorValidationWarning.push(Object.assign(weather.Warning));
                        }
                    }

                    containerErrorValidation += "</table>";
                    $('#ChassisErrordivResults').append(containerErrorValidation);
                    $('#ChassisErrorModalOnForm').modal('show');

                    return;
                }
                var data = JSON.parse(results.data.ResponseResult);
                if (data.isValid != "false") {
                    $scope.Message = "Your file is being uploaded.";
                    $scope.GetContainerList();
                    showSuccessMessage($scope.Message);
                    return;
                }
                else {
                    console.log(data.messages);
                    return;
                }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    $(".toast-info").hide();
                    modalErrorShow(errormsg);
                });

        }


        $scope.$on("selectedFile", function (event, args) {

            if ($scope.acceptFiles.split(",").includes("." + args.file.name.split(".")[1])) {
                // $("#loadingScreen").show();
                toastr.info('', "Upload in progress <i class='icon-spinner2 spinner position-center pull-right'></i>");
                AddAttachment(args, args.file.name);
                $scope.Message = "Your file is in progress, will inform you once it gets Done";
                showSuccessMessage($scope.Message);
            }
            else {
                modalErrorShow("Attached document is invalid file");
            }

        });

        // CONTAINER BULK UPLOAD --> END

    }]);