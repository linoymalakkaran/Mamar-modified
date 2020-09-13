angular.module('mamarApp').controller('consolidatorManifestUploadController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$filter', '$timeout','userAccountStorageFactory',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $filter, $timeout, userAccountStorageFactory) {

        $scope.$storage = $storage;
        $scope.IsHouseBL = true;
        $scope.IsMasterBL = false;

        //Navigation from List
        $scope.onRowClick = function (selectedRow) {
            $scope.selectedHouseBL = selectedRow;
        }
        $scope.showDoDetails = function (selectedRow) {
            if (selectedRow) {
                $storage.set('storedManifestInformation', selectedRow);
                var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) {
                    return (cenCode.Code == $scope.selCenterCode)
                });
                var selectedCenterCode = selectedCenter ? (selectedCenter[0].Code + ' ' + selectedCenter[0].EnglishName + ' ' + selectedCenter[0].ArabicName) : "";
                $storage.set('SubDOCenterCode', selectedCenterCode);
                $state.go('subDODetails', { 'centerCode': $scope.selCenterCode, 'agentCode': selectedRow.AgentCode, 'mode':'edit' });
            }
        }

        $scope.isHouseBL = function () {
            $scope.IsHouseBL = true;
            $scope.IsMasterBL = false;
        }
        $scope.isMasterBL = function () {
            $scope.IsHouseBL = false;
            $scope.IsMasterBL = true;
        }
        //Delete HBL List
        $scope.deleteConfirm = function (index) {
            $("#ConfirmDeleteConsolidatedModalPopup").modal("show");
            $scope.deleteRowIndex = index;
            $scope.cMasterBL = $scope.houseBLList[index].MasterBlNumber
            $scope.cHouseBL = $scope.houseBLList[index].HouseBlNumber

            $scope.masterBLDeleteMessage = '(' + $filter('translate')('masterBLDeleteMessagePart1') + ' - ' + $scope.cMasterBL + $filter('translate')('masterBLDeleteMessagePart2') + ')';
        }
        $scope.deleteOkay = function () {
            $("#loadingScreen").show();
            $scope.deleteSuccess = false;
            $scope.deleteFailed = false;
            $("#ConfirmDeleteConsolidatedModalPopup").modal("hide");

            var hbl = $scope.houseBLList[$scope.deleteRowIndex];
            var voyageArrivalDate = hbl.ArrivalDate ? $filter('date')((new Date(hbl.ArrivalDate)), 'dd/MM/yyyy') : '';
            var deleteHBLPayload = {
                centerCode: hbl.CenterCode,
                vesselCode: hbl.VesselCode,
                voyageNumber: hbl.VoyageNumber,
                masterBLNumber: hbl.MasterBlNumber,
                houseBLNumber: hbl.HouseBlNumber,
                arrivalDate: voyageArrivalDate
            };
            $scope.deleteMFParams = deleteHBLPayload;
            var deleteApiUrl = 'Customs/Manifest/DeleteHouseBL';
            if (!apiService.isNullOrEmptyOrUndefined($scope.IsMasterBL) && $scope.IsMasterBL) {
                deleteApiUrl = 'Customs/Manifest/DeleteMasterBL';
            }

            apiService.get(deleteApiUrl, deleteHBLPayload, function (result) {
                $("#loadingScreen").hide();
                var data = result.data.ResponseResult;
                //Manafath Changes
                if (data.IsValid)
                {
                    var deleteMFUrl = $scope.IsMasterBL ? '~/Manifest/DeleteMasterBL' : '~/Manifest/DeleteHouseBL';
                    var config = {
                        params: $scope.deleteMFParams
                    };
                    $http.get($Url.resolve(deleteMFUrl), config).then(function (result) {
                        console.log('success - delete mf details');
                    }, function (error) {
                        console.log('error - ' + error);
                    });
                }
                //end
                $scope.searchParams.pageNumber = 1;
                $scope.getHouseBLListBySearch();
                $('#successModal').modal('show');
            },
            function (result) {
                $("#loadingScreen").hide();
                var msg = apiService.formatResponseMessage(response.Messages);
                modalErrorShow(msg);
            });
        }
        //Delete HBL List

        //Lookup
        $scope.vesselTypeChanged = function (searchStr) {
            if (searchStr) {
                apiService.get('Customs/Lookup/Vessel',
                    {
                        centerCode: $scope.selCenterCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.vesselTypes = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        console.log(response);
                    });
            }
            else {
                $scope.vesselTypeObj.originalObject = "";
            }
        }
        $scope.SearchHBL = function () {
            $scope.searchParams.pageNumber = 1;
            $scope.getHouseBLListBySearch();
            $scope.selectedHouseBL = {
            };
        }
        $scope.loadMoreRecords = function (newPageNo) {
            $scope.searchParams.pageNumber = newPageNo;
            $scope.getHouseBLListBySearch();
            $scope.selectedHouseBL = {
            };
        }
        $scope.clearSearchFilters = function () {
            $scope.InitSearchParams();
            $scope.getHouseBLListBySearch();
        }
        function getSelectedVesselCode() {
            var searchParamsClone = Object.assign({}, $scope.searchParams);
            if ($scope.vesselTypeObj && $scope.vesselTypeObj.originalObject && $scope.vesselTypeObj.originalObject.Code) {
                searchParamsClone.vesselCode = $scope.vesselTypeObj.originalObject.Code;
            }
            return searchParamsClone;

        }
        $scope.getHouseBLListBySearch = function () {

            var searchParamsClone = getSelectedVesselCode();
            $("#loadingScreen").show();
            apiService.get('Customs/Manifest/GetHouseBL', searchParamsClone, function (results) {
                $("#loadingScreen").hide();
                var data = results.data.ResponseResult.Data;
                $scope.houseBLList = data ? data.HouseBls : '';
                $scope.totalCount = data ? data.TotalCount : '';

            },
           function error(response) {
               $("#loadingScreen").hide();
               console.log(response);
           });
        }
        $scope.centerCodeChanged = function () {
            $("#loadingScreen").hide();
            $scope.InitSearchParams();
            $scope.getHouseBLListBySearch();
            
        }
        $scope.LoadLookupCenterCodes = function () {
            apiService.get('Customs/Lookup/CenterCodes',
                $scope.cntrCodeLookupParams,
                function (results) {
                    $scope.centerCodes = results.data.ResponseResult.Data;
                    if ($scope.centerCodes) {

                        var selectedCenterBeforeNavigation = $storage.get('SubDOCenterCode');
                        selectedCenterBeforeNavigation = selectedCenterBeforeNavigation ? selectedCenterBeforeNavigation.split(" ")[0]:'';
                        selectedCenterBeforeNavigation = selectedCenterBeforeNavigation ? selectedCenterBeforeNavigation : 'V';

                        var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) {
                            return (cenCode.Code == selectedCenterBeforeNavigation)
                        });
                        $scope.selCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
                        $scope.centerCodeChanged();
                    }
                },
            function error(response) {
                console.log('something went wrong in LoadLookupCentreCodes' + response);
            });
        }
        $scope.InitSearchParams = function () {
            $scope.searchParams = {
                centerCode: $scope.selCenterCode,
                vesselCode: '',
                voyageNumber: '',
                masterBLNumber: '',
                houseBLNumber: '',
                arrivalDate: '',
                pageNumber: 0,
                pageSize: 10
            };
            $scope.vesselTypeObj = {};
            $scope.vesselTypeObj.originalObject = {};
            $scope.vesselTypeObj.originalObject.Code = '';
            $scope.vesselTypeObj.originalObject.EnglishName = '';
            $scope.vesselTypeObj.originalObject.ArabicName = '';
        }

        $scope.saveDOHBLInformation = function () {
            $("#loadingScreen").show();
            if (validateShipmentForm()) {
                $("#loadingScreen").hide();
            }
            else {
                $("#loadingScreen").hide();
                modalErrorShow('Please enter the required fields');
                return false;
            }

        }
        $scope.Init = function () {
            $("#loadingScreen").show();
            $scope.selectedHouseBL = {};
            $scope.houseBLList = [];
            $scope.selectedTransMode = 'M';//Manifest Upload is only for sea cargo
            $scope.cntrCodeLookupParams = {
                transportMode: $scope.selectedTransMode,
                searchString: ''
            };
            $scope.LoadLookupCenterCodes();
            $scope.InitSearchParams();
            $scope.IsValidagentDONumber = true;
            $scope.IsValidCargoAgent = true;
        }

        //Upload File 

        $scope.$on("selectedFile", function (event, args) {
            $("#loadingScreen").show();

            AddAttachment(args, args.file.name);
        });

        function AddAttachment(args, name) {
            var errormsg = "An Error has occurred while uploading Manifest file!"
            var serviceAttachInp = {};
            serviceAttachInp.CenterCode = $scope.selCenterCode;
            var fileAttach = apiService.postfile('Customs/Manifest/UploadManifest', '', args.file, serviceAttachInp, 'ManifestFile');
            fileAttach.then(function (results) {
                $("#loadingScreen").hide();
                if (results.data.ResponseCode == "405") {
                    modalErrorShow(JSON.parse(results.data.ResponseResult));
                    return;
                }
                if (results.data.ResponseResult == "") {
                    modalErrorShow(errormsg);
                    return;
                }
                var data = JSON.parse(results.data.ResponseResult);
                if (data.IsValid) {
                    var billType = data.Data ? data.Data.BillType : "";
                    apiService.sendManifestToBizTalk(args.file, $scope.selCenterCode, billType);
                    $scope.getHouseBLListBySearch();
                    $('#saveSuccessModal').modal('show');
                    return;
                }
                else {
                    modalErrorShow(data.Messages);
                }
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    modalErrorShow(errormsg);
                });
        }
        //Load
       // $scope.Init();


        //#region Cargo Agents Lookup
        $scope.CargoAgentChanged = function (searchStr) {
            if (!apiService.isNullOrEmptyOrUndefined(searchStr) && !apiService.isNullOrEmptyOrUndefined(searchStr)) {
                apiService.get('Customs/Lookup/CargoAgents',
                {
                    centerCode: $scope.selCenterCode,
                    searchString: searchStr
                },
                    function (results) {
                        $scope.cargoAgents = results.data.ResponseResult.Data;
                    },
                function error(response) {
                    modalErrorShow("An Error has occurred while getting lookup Data!");
                });
            }
        };
        //#endregion

        //#region Currency Lookup
        $scope.FreightCurrencyChanged = function (searchStr) {
            if (!apiService.isNullOrEmptyOrUndefined(searchStr) && !apiService.isNullOrEmptyOrUndefined(searchStr)) {
                apiService.get('Customs/Lookup/Currencies',
                {
                    centerCode: $scope.selCenterCode,
                    searchString: searchStr
                },
                    function (results) {
                        $scope.freightCurrencies = results.data.ResponseResult.Data;
                        $scope.IsValidagentDONumber = true;
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting lookup Data!");
                    });
            }
        };
        //#endregion

        //#region validation
        function validateShipmentForm() {
            debugger;
            var Check = true;
            //if (apiService.isNullOrEmptyOrUndefined($scope.manifest.agentDONumber)) {
            //    $scope.IsValidagentDONumber = false;
            //    Check = false;
            //    return Check;
            //}
            //else
            //{
            //    $scope.IsValidagentDONumber = true;
            //    Check = true;
            //}

            //if (apiService.isNullOrEmptyOrUndefined($scope.manifest.CargoAgent)) {
            //    $scope.IsValidCargoAgent = false;
            //    Check = false;
            //    return Check;
            //}
            //else {
            //    $scope.IsValidCargoAgent = true;
            //    Check = true;
            //}


            return Check;
        }
        //#end region

        //Add New Sub DO
        $scope.addNewManifest = () => {
            $storage.set('storedManifestInformation', '');
            $scope.userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) {
                return (cenCode.Code == $scope.selCenterCode)
            });
            var selectedCenterCode = selectedCenter ? (selectedCenter[0].Code + ' ' + selectedCenter[0].EnglishName + ' ' + selectedCenter[0].ArabicName) : "";
            $storage.set('SubDOCenterCode', selectedCenterCode);
            $state.go('subDODetails', { 'centerCode': $scope.selCenterCode, 'agentCode': $scope.userAccntInfo ? $scope.userAccntInfo.UCode : '', 'mode':'add' });
        }


        ///Announcement
        $scope.callOnLoadMethod = function () {
            $scope.initDashboard();
        }
        $scope.downloadAnnouncementFile = function (recordid, fileName) {
            $("#loadingScreen").show();
            apiService.get('Customs/Announcement/GetAnnouncementAttachment', { 'Id': recordid }, function (results) {
                $("#loadingScreen").hide();
                var resultData = results.data.ResponseResult;
                if (resultData != null && resultData.length > 0) {
                    apiService.printAnnoucementDocuments(resultData[0], fileName);
                }
                else {
                    modalErrorShow(resultData.Messages);
                }

            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }
        $scope.showAnnouncements = function () {
            $('#announcementConsolModal').modal("show");
        }

        $scope.getAnnouncements = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/Announcement/GetRoleBaseAnnouncement', $scope.announcementParams, function (results) {
                $("#loadingScreen").hide();
                if (results && results.data && results.data.ResponseResult) {
                    ///$scope.allannouncements = 
                    $scope.announcements = results.data.ResponseResult.announcements;
                    $scope.annoucementTotalCount = results.data.ResponseResult.totalAnnouncements;
                    if ($scope.announcements != null && $scope.announcements.length > 0) {
                        $scope.showAnnouncements();
                        $storage.set('announcemnetShownFlag', true); 
                    }
                    else {
                        $scope.initDashboard();
                    }
                }
                else {
                    $scope.initDashboard();
                }

            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                    $scope.initDashboard();
                });
        }
        $scope.loadMoreAnnouncementRecords = function (newPageNumber) {
            $scope.announcementParams = {
                pageNumber: newPageNumber,
                pageSize: 1
            };
            $scope.getAnnouncements();
        }
        // init page load
        $scope.initDashboard = function () {
            $scope.Init();
        }

        //On Load call annoucement service to get all the annoucements
        $scope.announcementParams = {
            pageNumber: 1,
            pageSize: 1
        };

        if (!$storage.get('announcemnetShownFlag')) {
            $scope.getAnnouncements();
        }
        else {
            $scope.initDashboard();
        }


       
    }]);