angular.module('mamarApp').controller('delegateDetailController',
    [
        '$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter', '$log', '$storage',
        'userAccountStorageFactory',
        function ($scope,
            $rootScope,
            $http,
            $state,
            $stateParams,
            apiService,
            sharedModels,
            $filter,
            $log,
            $storage,
            userAccountStorageFactory) {
            $scope.centerCode = $stateParams.centerCode;
            $scope.delegateNumber = $stateParams.delegateNumber;

            $scope.$storage = $storage;
            $storage.set('SelectedTransportModeDelegate', $stateParams.TransportMode);
            $storage.set('SelectedCenterCodeDelegate', $stateParams.centerCode);

            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

            //GetCitycodes();
            GetImportersExporters();
            GetCategoryCodes();
            $scope.IsValidImporter = true;
            $scope.IsValidRegDate = true;
            $scope.IsValidCity = true;
            $scope.IsValidPOBox = true;
            $scope.IsValidMobile = true;
            $scope.IsValidPhone = true;
            $scope.IsValidLicenceNo = true;
            $scope.isGoingToDelete = false;
            $scope.IsValid = $scope.delegateNumber == "" ? false : true;
            $scope.IsValidPEDate = true;
            $scope.acceptFiles = ".pdf,.docx,.xlsx,.jpg,.xls,.doc,.jpeg,.tif,.png,.bmp,.txt,.tiff,.xps,.gif,.rtf,.csv";

            $scope.attachmentListParam = {
                centerCode: $scope.centerCode,
                pageSize: 5,
                pageNumber: 1,
                delegateNumber: $scope.delegateNumber
            };
            GetDelegateAttachmentList();
            $scope.openAttachments = function (delegateNumber) {
                GetDelegateAttachmentList();
                $scope.Message = '';
                $('#attachments').modal({
                    backdrop: "static"
                });
            }
            //Download Document
            $scope.downloadDelegateDocument = function (gridItem) {
                $scope.Message = '';
                apiService.get('Customs/ImporterExporter/ViewDelegateAttachment',
                    {
                        centerCode: $stateParams.centerCode,
                        delegateNumber: gridItem.DelegateNumber,
                        serialNumber: gridItem.ID
                    },
                    function (results) {
                        var data = results.data.ResponseResult;
                        if (data.IsValid) {
                            var attachement = {};
                            var attachementList = [];
                            attachement.content = data.Data.Data;
                            attachement.FileName = gridItem.FilePath;
                            attachementList.push(attachement);
                            $("#loadingScreen").hide();
                            apiService.printDocuments(attachementList);
                            return;
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
            //Delete Document

            $scope.deleteDocument = function (gridItem) {
                $scope.Message = '';
                $scope.deleteDelegateDocument = gridItem;
                $scope.isGoingToDelete = true;
            }
            $scope.deleteOkay = function () {
                var gridItem = $scope.deleteDelegateDocument;
                apiService.get('Customs/ImporterExporter/DeleteDelegateAttachment',
                    {
                        centerCode: $stateParams.centerCode,
                        delegateNumber: gridItem.DelegateNumber,
                        serialNumber: gridItem.ID
                    },
                    function (results) {
                        var data = results.data.ResponseResult;
                        if (data.IsValid) {
                            $("#loadingScreen").hide();
                            GetDelegateAttachmentList()
                            $scope.Message = "DeleteSuccess";
                            return;
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            };

            $scope.$on("selectedFile",
                function (event, args) {

                    if ($scope.acceptFiles.split(",").includes("." + args.file.name.split(".")[1])) {
                        $("#loadingScreen").show();
                        AddAttachment(args, args.file.name);
                    } else {
                        modalErrorShow("Attached document is invalid file");
                    }

                });

            $scope.loadDelegateMoreRecords = function (newPageNo) {
                $scope.attachmentListParam.pageNumber = newPageNo;
                GetDelegateAttachmentList();
            }
            $scope.openCitycodes = function (event) {
                if (event == 'click' || event.key == 'F9') {
                    $scope.citycodesearch = "";
                    $('#Citycodes').modal({
                        backdrop: "static"
                    });
                }
            };
            $scope.openImportersExporters = function (event) {
                if (event == 'click' || event.key == 'F9') {
                    $scope.citycodesearch = "";
                    $scope.clearSearchFilters();
                    $('#importerExporterLookup').modal({
                        backdrop: "static"
                    });
                }
            };
            $scope.searchResults = function () {
                $scope.searchParameter.pageNumber = 1;
                $scope.PopulateImporterExporters();
            }

            function initializeSearchParameters() {
                $scope.searchParameter = {
                    telephone: '',
                    mobile: '',
                    fileNumber: '',
                    cityCode: '',
                    addcCode: '',
                    municipCode: '',
                    poBox: '',
                    categoryCode: '',
                    importername: '',
                    importerCode: '',
                    pageSize: 10,
                    orderBy: '',
                    pageNumber: 1,
                    centerCode: $stateParams.centerCode
                };
            }

            $scope.loadMoreRecords = function (newPageNo) {
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.PopulateImporterExporters();
            }
            $scope.PopulateImporterExporters = function () {
                $("#loadingScreen").show();
                apiService.get('Customs/ImporterExporter/GetImportExporter',
                    $scope.searchParameter,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.importersExporters = results.data.ResponseResult.Data;
                            if ($scope.importersExporters != null) {
                                $scope.totalCount = $scope.importersExporters[0].TotalCount;
                            }
                        }
                        $("#loadingScreen").hide();

                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
            $scope.clearSearchFilters = function () {
                initializeSearchParameters();
                $scope.importersExporters = '';
                $scope.totalCount = 0;
                //$scope.PopulateImporterExporters();
            }
            $scope.setImporterExporter = function (row) {
                if (typeof ($scope.delegateDetail) == "undefined") {
                    $scope.delegateDetail = {};
                }
                $scope.delegateDetail.ImporterCodeDesc = row.ImporterCode.toString() +
                    "     " +
                    (row.ImporterDescEng ? row.ImporterDescEng : '') +
                    "     " +
                    (row.ImporterDescArb ? row.ImporterDescArb : '');
                $scope.selectedImporterCode = {};
                $scope.selectedImporterCode.originalObject = row;
                $("#importerExporterLookup").modal("hide");
                $("#importerLookup_value").attr("tabindex", "1");
                $('#importerLookup_value').focus();
                $scope.importersExporters = null;
            }
            $scope.AddUpdateDelegate = function () {
                $("#loadingScreen").show();
                if (!ValidateAddUpdateDate()) return;
                AddUpdateDelegateViewModel();

                //Validation
                if (!apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.HouseBlNumber) ||
                    !apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.MasterBlNumber)) {
                    $scope.delegateDetail.FEndDate = '';
                    $scope.delegateDetail.FStartDate = '';
                    $scope.delegateDetail.EndDate = '';
                    $scope.delegateDetail.StartDate = '';
                }
                apiService.post('Customs/ImporterExporter/AddUpdateDeletegateImporter',
                    '',
                    $scope.delegateDetail,
                    function (result) {
                        var data = result.data.ResponseResult;
                        if (typeof (data.Data) !== "undefined" && data.Data.DelegateNumber) {
                            $scope.NewDelegateNumber = data.Data.DelegateNumber;
                            $scope.delegateDetail.DelegateNumber = $scope.NewDelegateNumber;
                            $scope.delegateNumber = $scope.NewDelegateNumber;
                            //if (data.IsValid)
                            //    GetDelegateDetail();
                        }

                        var msg = data.Messages; //apiService.formatResponseMessage

                        if (data) {
                            if (data.IsValid) {
                                if (typeof ($scope.delegateDetail) == "undefined") {
                                    $scope.delegateDetail = {};
                                }
                                $("#loadingScreen").hide();
                                $('#saveSuccessModal').modal('show');
                                if (!apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.HouseBlNumber) ||
                                    !apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.MasterBlNumber)) {
                                    $scope.delegateDetail.IsOpenFlag = true;
                                } else if (apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.FStartDate) ||
                                    apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.FEndDate)) {
                                    $scope.delegateDetail.IsOpenFlag = true;
                                } else if (!apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.FStartDate) &&
                                    !apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.FEndDate)) {
                                    $scope.delegateDetail.IsOpenFlag = false;
                                }
                                if (!apiService.isNullOrEmptyOrUndefined(data.Data.DelegateNumber) &&
                                    data.Data.DelegateNumber != '') {
                                    // $scope.IsAttachmentAllow = false;
                                    $scope.delegateNumber = data.Data.DelegateNumber;
                                    GetDelegateDetail();
                                    //$scope.IsApproved = false;
                                    //$scope.IsUpdated = false;
                                    $scope.IsAttachmentAllow = false;
                                }

                                return;
                            } else if (!data.IsValid) {
                                $("#loadingScreen").hide();
                                modalErrorShow(msg);
                                return;
                            }
                        }
                    },
                    function (result) {

                        modalErrorShow("An Error has occurred while adding the Delegate Data!");
                    });
            }


            $scope.setCityCode = function (row) {
                if (typeof ($scope.delegateDetail) == "undefined") {
                    $scope.delegateDetail = {};
                }
                $scope.delegateDetail.cityCodeDesc = row.CityCode.toString() +
                    "     " +
                    (row.CityEnglish ? row.CityEnglish : '') +
                    "     " +
                    (row.CityArabic ? row.CityArabic : '');
                $scope.selectedCityCode = {};
                $scope.selectedCityCode.originalObject = row;
                $("#Citycodes").modal("hide");
                $("#cityLookup_value").attr("tabindex", "9");
                $('#cityLookup_value').focus();
            }
            $scope.ValidateOpenPeriod = function (isOpenPeriod) {
                var data = $scope.delegateDetail;
                if (apiService.isNullOrEmptyOrUndefined(data)) {
                    return;
                }
                if (isOpenPeriod) {
                    if (!apiService.isNullOrEmptyOrUndefined(data.FEndDate)) {
                        data.FEndDate = "";
                    }
                    if (!apiService.isNullOrEmptyOrUndefined(data.FStartDate)) {
                        data.FStartDate = "";
                    }
                }
            }

            function ValidateAddUpdateDate() {

                var delegateModel = $scope.delegateDetail;
                $scope.IsValid = true;
                if (apiService.isNullOrEmptyOrUndefined(delegateModel)) {
                    modalErrorShow('Please enter the required fields');
                    $scope.IsValidImporter = false;
                    $scope.IsValidRegDate = false;
                    $scope.IsValidCity = false;
                    $scope.IsValidPOBox = false;
                    $scope.IsValidMobile = false;
                    $scope.IsValidPhone = false;
                    $scope.IsValidLicenceNo = false;
                    if (typeof ($scope.delegateDetail) == "undefined") {
                        $scope.delegateDetail = {};
                    }
                    $scope.delegateDetail.IsOpenFlag = false;
                    $scope.IsValidPeriodStart = false;
                    $scope.IsValidPeriodEnd = false;
                    $("#loadingScreen").hide();
                    return false;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.ImporterCodeDesc)) {
                    $scope.IsValidImporter = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidImporter = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.FRegistrationDate)) {
                    $scope.IsValidRegDate = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidRegDate = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.cityCodeDesc)) {
                    $scope.IsValidCity = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidCity = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.PoBox)) {
                    $scope.IsValidPOBox = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidPOBox = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.Mobile)) {
                    $scope.IsValidMobile = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidMobile = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.Phone)) {
                    $scope.IsValidPhone = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidPhone = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel) &&
                    apiService.isNullOrEmptyOrUndefined(delegateModel.LicenseNo)) {
                    $scope.IsValidLicenceNo = false;
                    $scope.IsValid = false;
                } else {
                    $scope.IsValidLicenceNo = true;
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel.FEndDate) &&
                    !apiService.isNullOrEmptyOrUndefined(delegateModel.FStartDate)) {
                    var IssuedDate = delegateModel.FStartDate;
                    var ExpiryDate = delegateModel.FEndDate;
                    //if (IssuedDate != null) {

                    if (!apiService.isNullOrEmptyOrUndefined(IssuedDate)) {
                        IssuedDate = moment(IssuedDate, 'DD/MM/YYYY').format();
                    }
                    if (!apiService.isNullOrEmptyOrUndefined(ExpiryDate)) {
                        ExpiryDate = moment(ExpiryDate, 'DD/MM/YYYY').format();
                    }
                    if (IssuedDate != null && ExpiryDate != null) {
                        $scope.DateIsValid = IssuedDate < ExpiryDate ? true : false;
                        if (!$scope.DateIsValid) {
                            $scope.IsValidPEDate = false;
                        } else {
                            $scope.IsValidPEDate = true;
                        }
                    }
                } else {
                    $scope.DateIsValid = true;
                }
                if (!$scope.IsValid || !$scope.DateIsValid) {
                    $("#loadingScreen").hide();
                    return;
                }
                return true;
            }

            function process(date) {
                var parts = date.split("/");
                return new Date(parts[2], parts[1] - 1, parts[0]);
            }

            function AddUpdateDelegateViewModel() {
                var delegateModel = $scope.delegateDetail;
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel.FRegistrationDate)) {
                    delegateModel.RegistrationDate =
                        $filter('date')(new Date(apiService.formatDateObject(delegateModel.FRegistrationDate)),
                            "MM/dd/yyyy");
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel.FStartDate)) {
                    delegateModel.StartDate =
                        $filter('date')(new Date(apiService.formatDateObject(delegateModel.FStartDate)), "MM/dd/yyyy");
                }
                if (!apiService.isNullOrEmptyOrUndefined(delegateModel.FEndDate)) {
                    delegateModel.EndDate =
                        $filter('date')(new Date(apiService.formatDateObject(delegateModel.FEndDate)), "MM/dd/yyyy");
                }
                delegateModel.OpenFlag = !delegateModel.IsOpenFlag || delegateModel.IsOpenFlag == undefined ? "N" : "Y";
                delegateModel.LicenseNumber = delegateModel.LicenseNo;
                if ($scope.selectedImporterCode != undefined) {
                    var lookupImporterCode = $scope.selectedImporterCode.originalObject;
                    if (!apiService.isNullOrEmptyOrUndefined(lookupImporterCode.ImporterCode)) {
                        delegateModel.ImporterCode = lookupImporterCode.ImporterCode;
                        delegateModel.ImporterEngName = lookupImporterCode.ImporterDescEng;
                        delegateModel.ImporterArbName = lookupImporterCode.ImporterDescArb;
                    } else {
                        delegateModel.ImporterCode = lookupImporterCode.Code;
                        delegateModel.ImporterEngName = lookupImporterCode.EnglishName;
                        delegateModel.ImporterArbName = lookupImporterCode.ArabicName;
                    }
                }
                if ($scope.selectedCityCode != undefined) {
                    delegateModel.City = $scope.selectedCityCode.originalObject.CityCode;
                }
                delegateModel.CenterCode = $scope.centerCode;
            }

            function GetCitycodes(searchStr) {
                apiService.get('Customs/Lookup/ImporterCities',
                    {
                        centerCode: $scope.centerCode,
                        searchString: ''
                    },
                    function (results) {

                        $scope.citycodes = results.data.ResponseResult.Data;

                        if (apiService.isNullOrEmptyOrUndefined($stateParams.delegateNumber)) {
                            if (typeof ($scope.delegateDetail) == "undefined") {
                                $scope.delegateDetail = {};
                            }
                            $scope.delegateDetail.cityCodeDesc = $scope.citycodes[0].CityCode.toString() +
                                "     " +
                                ($scope.citycodes[0].CityEnglish ? $scope.citycodes[0].CityEnglish : '') +
                                "     " +
                                ($scope.citycodes[0].CityArabic ? $scope.citycodes[0].CityArabic : '');
                            $scope.selectedCityCode = {};
                            $scope.selectedCityCode.originalObject = $scope.citycodes[0];
                            $("#Citycodes").modal("hide");
                            $("#cityLookup_value").attr("tabindex", "9");
                            $('#cityLookup_value').focus();
                        }
                        if ($scope.delegateNumber != undefined &&
                            $scope.delegateNumber != null &&
                            $scope.delegateNumber != "") {
                            $("#loadingScreen").show();
                            GetDelegateDetail();
                        }

                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
            }

            function GetImportersExporters(searchStr) {
                apiService.get('Customs/Lookup/ImporterExporter',
                    {
                        centerCode: $scope.centerCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.importersexporters = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
            }
            function GetCategoryCodes() {
                apiService.get('Customs/Lookup/ImporterCategory',
                    {
                        centerCode: $scope.centerCode,
                        searchString: ''
                    },
                    function (results) {
                        $scope.categoryCodes = results.data.ResponseResult.Data;
                        $("#selectCategory").select2();
                    },
                    function error(response) {
                        console.log("An Error has occurred while getting ImporterCategory lookup Data!");
                    }
                );
            }
            function GetDelegateDetail() {

                apiService.get('Customs/ImporterExporter/DelegateImporterDetail',
                    {
                        centerCode: $scope.centerCode,
                        DelegateNumber: $scope.delegateNumber
                    },
                    function (results) {

                        var cdelegateDetail = results.data.ResponseResult.Data.DelegateImporterDetails;
                        $scope.attachmentCount = results.data.ResponseResult.Data.TotalAttachmentsCount;
                        if (!apiService.isNullOrEmptyOrUndefined(cdelegateDetail)) {
                            assignDelegateViewModel(cdelegateDetail[0]);
                        }
                        $("#loadingScreen").hide();
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
            }

            function assignDelegateViewModel(cdelegateDetail) {

                cdelegateDetail.AgentDesc = cdelegateDetail.AgentCode +
                    " " +
                    cdelegateDetail.AgentEngName +
                    " " +
                    cdelegateDetail.AgentArbName;
                cdelegateDetail.ApproverDesc = cdelegateDetail.UserApproved == null
                    ? ""
                    : cdelegateDetail.UserApproved +
                    " " +
                    cdelegateDetail.ApproverEngName +
                    " " +
                    cdelegateDetail.ApproverArbName;
                cdelegateDetail.ModifiedUserDesc = cdelegateDetail.ModifiedUser == null
                    ? ""
                    : cdelegateDetail.ModifiedUser +
                    " " +
                    cdelegateDetail.ModifiedUserEng +
                    " " +
                    cdelegateDetail.ModifiedUserArb;
                cdelegateDetail.ModifiedDateFormated = cdelegateDetail.ModifiedDate == null
                    ? ""
                    : $filter('date')((new Date(cdelegateDetail.ModifiedDate)), "dd/MM/yyyy HH:mm");
                cdelegateDetail.ApprovedDateFormated = cdelegateDetail.ApprovedDate == null
                    ? ""
                    : $filter('date')((new Date(cdelegateDetail.ApprovedDate)), "dd/MM/yyyy");
                if ($scope.citycodes != undefined) {
                    var cindex = $scope.citycodes.findIndex(doc => doc.CityCode == cdelegateDetail.City);
                    if (cindex != -1) {
                        var cityco = $scope.citycodes[cindex];
                        cdelegateDetail.cityCodeDesc =
                            cityco.CityCode + " " + cityco.CityEnglish + " " + cityco.CityArabic;
                    }
                }
                cdelegateDetail.ImporterCodeDesc = cdelegateDetail.ImporterCode +
                    " " +
                    cdelegateDetail.ImporterEngName +
                    " " +
                    cdelegateDetail.ImporterArbName;
                cdelegateDetail.FRegistrationDate = cdelegateDetail.RegistrationDate == null
                    ? ""
                    : $filter('date')((new Date(cdelegateDetail.RegistrationDate)), "dd/MM/yyyy");
                cdelegateDetail.FStartDate = cdelegateDetail.StartDate == null
                    ? ""
                    : $filter('date')((new Date(cdelegateDetail.StartDate)), "dd/MM/yyyy");
                cdelegateDetail.FEndDate = cdelegateDetail.EndDate == null
                    ? ""
                    : $filter('date')((new Date(cdelegateDetail.EndDate)), "dd/MM/yyyy");
                cdelegateDetail.IsOpenFlag = cdelegateDetail.OpenFlag == 'Y';
                $scope.delegateDetail = cdelegateDetail;
                $scope.IsApproved = cdelegateDetail.Approved == null || cdelegateDetail.Approved == 'N' ? false : true;

                $scope.IsUpdated = false;
                // || $scope.delegateDetail.DoCode == 0
                //if (apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.DoCode)) {
                //    $scope.IsUpdated = false;
                // }//&& $scope.delegateDetail.DoCode != 0
                if (apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.DoCode)) {
                    $scope.IsUpdated = false;
                } else if (!apiService.isNullOrEmptyOrUndefined($scope.delegateDetail.DoCode) &&
                    $scope.delegateDetail.DoCode != '') {
                    $scope.IsUpdated = true;
                }

                if ($scope.IsApproved) {
                    $scope.IsUpdated = true;
                }

                //Attachment Options
                $scope.IsAttachment = false;
                if ($scope.IsApproved || $scope.IsUpdated) {
                    $scope.IsAttachment = true;
                }


            }

            function GetDelegateAttachmentList() {
                $scope.attachmentListParam.delegateNumber = $scope.delegateNumber;
                $("#loadingScreen").show();
                apiService.get('Customs/ImporterExporter/DelegateAttachments',
                    $scope.attachmentListParam,
                    function (results) {
                        $("#loadingScreen").hide();
                        $scope.delegateAttachmentList = results.data.ResponseResult.Data;
                        if ($scope.delegateAttachmentList != null) {
                            $scope.totalDelegateItem = $scope.delegateAttachmentList[0].TotalCount;
                        }

                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    }
                );
            }

            function AddAttachment(args, name) {

                var errormsg = "An Error has occurred while uploading file!"
                var serviceAttachInp = {};
                serviceAttachInp.CenterCode = $stateParams.centerCode;
                serviceAttachInp.DelegateNumber = $scope.delegateNumber;
                serviceAttachInp.FilePath = args.file.name;
                if (args.file.size > 4096000) {
                    $("#loadingScreen").hide();
                    modalErrorShow(
                        "Eng: File size is too big Please, File size should not be more than 4000K | Arb: حجم الملف كبير جدًا");
                    return;
                }
                var fileAttach = apiService.postfile('Customs/ImporterExporter/UploadDelegateAttachment',
                    '',
                    args.file,
                    serviceAttachInp,
                    'File');
                fileAttach.then(function (results) {
                    // $("#loadingScreen").hide();
                    if (results.data.ResponseCode == "405") {
                        modalErrorShow(results.data.ResponseResult);
                        return;
                    }
                    if (results.data.ResponseResult == "") {
                        modalErrorShow(errormsg);
                        return;
                    }
                    var data = JSON.parse(results.data.ResponseResult);
                    if (data.IsValid) {
                        GetDelegateAttachmentList();
                        $scope.Message = "SavedSuccess";
                        return;
                    } else {
                        modalErrorShow(data.Messages);
                    }
                },
                    function error(response) {
                        $("#loadingScreen").hide();
                        modalErrorShow(errormsg);
                    });
            }

            $scope.closeAttachmentPopup = function () {
                $("#loadingScreen").show();
                GetDelegateDetail();
            }
            $scope.Initialize = function () {


                if (!apiService.isNullOrEmptyOrUndefined($stateParams.TransportMode) &&
                    $stateParams.TransportMode == 'R') // Transport Mode = Land
                {
                    $scope.IsHAWB = true;
                    $scope.IsAWB = true
                } else {
                    $scope.IsHAWB = false;
                    $scope.IsAWB = false;
                }

                if (apiService.isNullOrEmptyOrUndefined($stateParams.delegateNumber)) {
                    GetCitycodes('ABU DHABI');
                    $scope.IsAttachmentAllow = true;
                } else {
                    GetCitycodes();
                    $scope.IsAttachmentAllow = false;
                }

            }
            $scope.Initialize();

            $scope.onCargoAgentChange = function (str) {


                if (!apiService.isNullOrEmptyOrUndefined(str)) {
                    if (!apiService.isNullOrEmptyOrUndefined(str)) {
                        GetImportersExporters(str);
                    }
                }
                //$scope.delegateDetail.ImporterCodeDesc = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                //$scope.rowindex = 0;
                //$scope.lookupcurrentpage = 1;
                //if ($scope.importersexporters) {
                //    $scope.importersexporters = $scope.importersexporters.filter(obj => {
                //        return obj.Code.tostring().tolowercase().includes($scope.str) || (obj.EnglishName && obj.EnglishName.tolowercase().includes($scope.str.tolowercase()))
                //            || (obj.EnglishName && obj.EnglishName.tolowercase().includes($scope.str.tolowercase()));
                //    });
                //}
            }
            $scope.onChangeImporter = function (str) {

                $scope.onCargoAgentChange(str);
            }


            /// F9 key down event
            $scope.cargoAgentKeyDown = function (event, item) {
                if (event.key == 'F9') {
                    $scope.openCargoAgentLookup(item);
                }
            }


        }
    ]);
