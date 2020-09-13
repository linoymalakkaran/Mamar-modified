angular.module("mamarApp").controller("shipmentInDraftController", [
    "$scope",
    "$rootScope",
    "$state",
    "$stateParams",
    "$filter",
    "$timeout",
    "apiService",
    "$storage",
    "sharedModels",
    "$log",
    "$uibModal",
    "userAccountStorageFactory",
    "$translate",
    function (
        $scope,
        $rootScope,
        $state,
        $stateParams,
        $filter,
        $timeout,
        apiService,
        $storage,
        sharedModels,
        $log,
        $uibModal,
        userAccountStorageFactory,
        $translate
    ) {
        //Initialize
        $scope.Initialize = function () {
            $scope.$storage = $storage;
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            $scope.isConsolidatorAccount =
                userAccntInfo && userAccntInfo.CCode.includes("CONSOLIDATOR")
                    ? true
                    : false;
            $scope.doDetails = {};

            $scope.searchCargoAgentText = "";
            $scope.searchFreightCurrencyText = "";
            $scope.searchConsigneeText = "";

            resetValidations();

            $scope.selectedBillType = {};
            getShipmentDetails();

            $scope.PopulateCargoAgents();
            $scope.PopulateFreightCurrency();
            $scope.PopulateConsignees();
        };

        $scope.gototransactions = function () {
            //To maintain the shared model on page reload
            if (
                !sharedModels.transactionSearchModel &&
                localStorage.storedTransSearchModel
            ) {
                sharedModels.transactionSearchModel = JSON.parse(
                    localStorage.storedTransSearchModel
                );
            }
            if (sharedModels.transactionSearchModel) {
                sharedModels.transactionSearchModel.fromShipment = true;
            }
            if ($scope.isConsolidatorAccount) {
                $state.go("consolidatorManifestUpload");
            } else {
                $state.go(
                    "transactions",
                    {
                        transportMode:
                            sharedModels && sharedModels.transactionSearchModel
                                ? sharedModels.transactionSearchModel.TransportMode
                                : "M",
                    },
                    { reload: true, notify: true }
                );
            }
        };

        function getFormattedDoDetails(data) {
            $scope.doDetails = data;

            if ($scope.doDetails) {
                if (data.DODate) {
                    $scope.doDetails.doDate = $filter("date")(
                        new Date(data.DODate),
                        "dd/MM/yyyy"
                    );
                } else {
                    $scope.doDetails.doDate = $filter("date")(new Date(), "dd/MM/yyyy");
                }
                $scope.doDetails.doExpiryDate = data.DOExpiryDate
                    ? $filter("date")(new Date(data.DOExpiryDate), "dd/MM/yyyy")
                    : "";

                //Cargo Agent Lookup formatted Data
                $scope.manifestCargoAgent = $scope.doDetails.DOCargoAgentCode
                    ? $scope.doDetails.DOCargoAgentCode + "     "
                    : "";
                $scope.manifestCargoAgent =
                    $scope.manifestCargoAgent +
                    ($scope.doDetails.DOCargoAgentEngName
                        ? $scope.doDetails.DOCargoAgentEngName + "     "
                        : "");
                $scope.manifestCargoAgent =
                    $scope.manifestCargoAgent +
                    ($scope.doDetails.DOCargoAgentArbName
                        ? $scope.doDetails.DOCargoAgentArbName
                        : "");

                $scope.selectedCargoAgent = {};
                $scope.selectedCargoAgent.originalObject = {};

                $scope.selectedCargoAgent.originalObject.CargoAgentCode = $scope.doDetails
                    ? $scope.doDetails.DOCargoAgentCode
                    : null;
                $scope.selectedCargoAgent.originalObject.CargoAgentEngName = $scope.doDetails
                    ? $scope.doDetails.DOCargoAgentEngName
                    : null;
                $scope.selectedCargoAgent.originalObject.CargoAgentArbName = $scope.doDetails
                    ? $scope.doDetails.DOCargoAgentArbName
                    : null;

                //ManifestConsignee Lookup formatted Data
                $scope.manifestConsignee = $scope.doDetails.ImporterCode
                    ? $scope.doDetails.ImporterCode + "     "
                    : "";
                $scope.manifestConsignee =
                    $scope.manifestConsignee +
                    ($scope.doDetails.ImporterEngName
                        ? $scope.doDetails.ImporterEngName + "     "
                        : "");
                $scope.manifestConsignee =
                    $scope.manifestConsignee +
                    ($scope.doDetails.SAY_IMPORTER_ENG1
                        ? $scope.doDetails.SAY_IMPORTER_ENG1
                        : "");

                $scope.selectedConsignee = {};
                $scope.selectedConsignee.originalObject = {};
                $scope.selectedConsignee.originalObject.ImporterCode = $scope.doDetails
                    ? $scope.doDetails.ImporterCode
                    : null;
                $scope.selectedConsignee.originalObject.ImporterEngName = $scope.doDetails
                    ? $scope.doDetails.ImporterEngName
                    : null;
                $scope.selectedConsignee.originalObject.ImporterArbName = $scope.doDetails
                    ? $scope.doDetails.SAY_IMPORTER_ENG1
                    : null;

                //Freight Currency Lookup formatted Data
                $scope.manifestFreightCurrency = $scope.doDetails.CurrencyCode
                    ? $scope.doDetails.CurrencyCode + "     "
                    : "";
                $scope.manifestFreightCurrency =
                    $scope.manifestFreightCurrency +
                    ($scope.doDetails.CurrencyEng
                        ? $scope.doDetails.CurrencyEng + "     "
                        : "");
                $scope.manifestFreightCurrency =
                    $scope.manifestFreightCurrency +
                    ($scope.doDetails.CurrencyArb ? $scope.doDetails.CurrencyArb : "");

                $scope.selectedFreightCurrency = {};
                $scope.selectedFreightCurrency.originalObject = {};
                $scope.selectedFreightCurrency.originalObject.Code = $scope.doDetails
                    ? $scope.doDetails.CurrencyCode
                    : null;
                $scope.selectedFreightCurrency.originalObject.NameEnglish = $scope.doDetails
                    ? $scope.doDetails.CurrencyEng
                    : null;
                $scope.selectedFreightCurrency.originalObject.NameArabic = $scope.doDetails
                    ? $scope.doDetails.CurrencyArb
                    : null;
            }
        }

        function getShipmentDetails() {
            $scope.DONumber = "";

            $("#loadingScreen").show();

            var params = {
                centerCode: $stateParams.centerCode,
                doNumber: $stateParams.DoNumber,
                agentCode: $stateParams.AgentCode,
                vesselCode: "",
                voyageNumber: "",
                masterBL: "",
                houseBL: "",
                arrivalDate: "",
                billType: "",
            };
            if ($scope.isConsolidatorAccount) {
                $scope.manifestInformation = $storage.get("storedManifestInformation");
                var arrivalDate = $scope.manifestInformation.ArrivalDate
                    ? $filter("date")(
                        new Date($scope.manifestInformation.ArrivalDate),
                        "dd/MM/yyyy"
                    )
                    : "";
                params.vesselCode = $scope.manifestInformation.VesselCode
                    ? $scope.manifestInformation.VesselCode.trim()
                    : "";
                params.voyageNumber = $scope.manifestInformation.VoyageNumber;
                params.masterBL = $scope.manifestInformation.MasterBlNumber;
                params.houseBL = $scope.manifestInformation.HouseBlNumber;
                params.arrivalDate = arrivalDate;
                params.billType = $scope.manifestInformation.BillType;
            } else {
                if (typeof Storage !== "undefined" && localStorage.storedDoInfo) {
                    $scope.manifestInformation = JSON.parse(localStorage.storedDoInfo);
                    var arrivalDate = $scope.manifestInformation.ArrivalDate
                        ? $filter("date")(
                            new Date($scope.manifestInformation.ArrivalDate),
                            "dd/MM/yyyy"
                        )
                        : "";
                    params.vesselCode = $scope.manifestInformation.VesselCode
                        ? $scope.manifestInformation.VesselCode.trim()
                        : "";
                    params.voyageNumber = $scope.manifestInformation.VoyageNumber;
                    params.masterBL = $scope.manifestInformation.MasterBLNumber;
                    params.houseBL = $scope.manifestInformation.HouseBLNumber;
                    params.arrivalDate = arrivalDate;
                    params.billType = $scope.manifestInformation.BillType;
                }
            }

            apiService.get(
                "Customs/DeliveryOrder/ShipmentDetailByDO",
                params,
                function (results) {
                    var data = results.data.ResponseResult;
                    $log.log(data.data);

                    if (data && data.data && data.data.length > 0) {
                        $scope.status = "Draft";
                        $scope.statusARB = "مشروع";
                        $scope.DONumber = data.data[0].DONumber;

                        $scope.BillTypeCode = data.data[0].BillTypeCode;
                        $scope.BillTypeArbName = data.data[0].BillTypeArbName;
                        $scope.BillTypeEngName = data.data[0].BillTypeEngName;
                        $scope.selectedBillType.bill = {
                            Code: $scope.BillTypeCode,
                            NameArabic: $scope.BillTypeArbName,
                            NameEnglish: $scope.BillTypeEngName,
                        };

                        $scope.selectedBillTypeInitialData = angular.copy(
                            $scope.selectedBillType
                        );
                        $scope.CenterCode = data.data[0].CenterCode;
                        $scope.CenterNameEng = data.data[0].CenterNameEng;
                        $scope.CenterNameArb = data.data[0].CenterNameArb;

                        $scope.VoyageNumber = data.data[0].VoyageNumber;
                        $scope.VoyageArrivalDate = $filter("date")(
                            new Date(data.data[0].VoyageArrivalDate),
                            "dd/MM/yyyy"
                        );

                        $scope.DOCargoAgentCode = data.data[0].DOCargoAgentCode;
                        $scope.DOCargoAgentEngName = data.data[0].DOCargoAgentEngName;
                        $scope.DOCargoAgentArbName = data.data[0].DOCargoAgentArbName;

                        $scope.MasterBLNumber = data.data[0].MasterBLNumber;
                        $scope.HouseBLNumber = data.data[0].HouseBLNumber;

                        $scope.VesselCode = data.data[0].VesselCode;
                        $scope.VesselNameEng = data.data[0].VesselNameEng;
                        $scope.VesselNameArb = data.data[0].VesselNameArb;

                        $scope.CargoTypeCode = data.data[0].CargoTypeCode;
                        $scope.CargoTypeEng = data.data[0].CargoTypeEng;
                        $scope.CargoTypeArb = data.data[0].CargoTypeArb;

                        $scope.DODate = $filter("date")(
                            new Date(data.data[0].DODate),
                            "dd/MM/yyyy"
                        );

                        $scope.DOExpiryDate = $filter("date")(
                            new Date(data.data[0].DOExpiryDate),
                            "dd/MM/yyyy"
                        );
                        $scope.CONSIGNEE = data.data[0].CONSIGNEE;
                        $scope.Shipper = data.data[0].Shipper;
                        $scope.NotifyParty = data.data[0].NotifyParty;
                        $scope.NetWeight = data.data[0].NetWeight;
                        $scope.Volume = data.data[0].Volume;
                        $scope.Quantity = data.data[0].Quantity;
                        $scope.GrossWeight = data.data[0].GrossWeight;

                        $scope.UnitCode = data.data[0].UnitCode;
                        $scope.UnitNameEng = data.data[0].UnitNameEng;
                        $scope.UnitNameArb = data.data[0].UnitNameArb;

                        $scope.GoodDesc = data.data[0].GoodDesc;
                        $scope.DORemarks = data.data[0].DORemarks;
                        $scope.MarksNo = data.data[0].MarksNo;

                        $scope.PortNameEng = data.data[0].PortNameEng;
                        $scope.PortNameArb = data.data[0].PortNameArb;
                        $scope.PortCode = data.data[0].PortCode;

                        $scope.DraftComments = data.lastComment;

                        $scope.ImporterCode = data.data[0].ImporterCode;
                        $scope.ImporterEngName = data.data[0].ImporterEngName;

                        getFormattedDoDetails(data.data[0]);

                        sharedModels.ShipmentDraft = {
                            centerCode: $stateParams.centerCode,
                            HouseBLNumber: $scope.HouseBLNumber,
                            MasterBLNumber: $scope.MasterBLNumber,
                            VoyageNumber: $scope.VoyageNumber,
                            VoyageArrivalDate: $scope.VoyageArrivalDate,
                            VesselCode: $scope.VesselCode,
                            DoNumber: $stateParams.DoNumber,
                            AgentCode: $stateParams.AgentCode,
                            ShipmentDraftAgentCode: $stateParams.AgentCode,
                            BillTypeCode: $scope.BillTypeCode,
                        };
                        $log.info(sharedModels);
                    }

                    $("#loadingScreen").hide();
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    $log.log("" + response);
                    // console.log('' + response);
                    modalErrorShow($filter("translate")("ErroFetchingDataMsg"));
                }
            );
        }

        $scope.getContainersInDraft = function () {
            //$state.go('ContainerDraftList', { 'centerCode': $stateParams.centerCode, 'HouseBLNumber': $scope.HouseBLNumber, 'MasterBLNumber': $scope.MasterBLNumber, 'VoyageNumber': $scope.VoyageNumber, 'VoyageArrivalDate': $scope.VoyageArrivalDate, 'VesselCode': $scope.VesselCode, 'DoNumber': $stateParams.DoNumber, 'AgentCode': $stateParams.AgentCode});
            $state.go("ContainerDraftList");
        };

        $scope.ChasisDetailsInDraft = function () {
            //$state.go('ChassisDraftList', { 'centerCode': $stateParams.centerCode, 'HouseBLNumber': $scope.HouseBLNumber, 'MasterBLNumber': $scope.MasterBLNumber, 'VoyageNumber': $scope.VoyageNumber, 'AgentCode': $scope.DOCargoAgentCode, 'VoyageArrivalDate': $scope.VoyageArrivalDate, 'VesselCode': $scope.VesselCode, 'DoNumber': $stateParams.DoNumber, 'ShipmentDraftAgentCode': $stateParams.AgentCode });
            $state.go("ChassisDraftList");
        };

        $scope.SaveComments = function (data) {
            $("#loadingScreen").show();
            $scope.UpdateModel = {};

            $scope.UpdateModel.DONumber = $stateParams.DoNumber;
            $scope.UpdateModel.Comment = data;
            $scope.UpdateModel.CustomAgentCode = $stateParams.AgentCode;
            $scope.UpdateModel.CompanyCode = null;
            $scope.UpdateModel.UserCode = null;
            $scope.UpdateModel.CenterCode = $stateParams.centerCode;
            $scope.UpdateModel.BillTypeCode = sharedModels.ShipmentDraft.BillTypeCode;

            apiService.post(
                "Customs/Job/SendDOComment",
                "",
                $scope.UpdateModel,
                function (result) {
                    var data = result.data.ResponseResult;
                    $log.log(data);
                    if (data != null && data.IsValid == true) {
                        $("#saveSuccessModal").modal("show");
                    } else {
                        modalErrorShow(data.Message);
                    }
                    $("#loadingScreen").hide();
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    $log.log("" + response);
                    modalErrorShow($filter("translate")("ErroFetchingDataMsg"));
                }
            );
        };

        //Do Information Update for Consolidator Account : Mamar Ph2 Changes
        //#region Cargo Agents Lookup
        $scope.cargoAgentChanged = function (searchStr) {
            if (searchStr) {
                apiService.get(
                    "Customs/Lookup/CargoAgents",
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: searchStr,
                    },
                    function (results) {
                        $scope.cargoAgents = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        console.log(
                            "An Error has occurred while getting lookup Data in CargoAgents!"
                        );
                    }
                );
            }
        };
        //#endregion

        //#region Currency Lookup
        $scope.freightCurrencyChanged = function (searchStr) {
            if (searchStr) {
                apiService.get(
                    "Customs/Lookup/Currencies",
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: searchStr,
                    },
                    function (results) {
                        $scope.freightCurrencies = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        console.log(
                            "An Error has occurred while getting lookup Data in freightCurrencies!"
                        );
                    }
                );
            }
        };
        //#endregion

        //#region Importer / Exporter Lookup
        $scope.importerExporterChanged = function (searchStr) {
            if (searchStr) {
                apiService.get(
                    "Customs/Lookup/ImporterExporter",
                    {
                        centerCode: $stateParams.centerCode,
                        searchString: searchStr,
                    },
                    function (results) {
                        $scope.impotersExporters = results.data.ResponseResult.Data;
                    },
                    function error(response) {
                        console.log(
                            "An Error has occurred while getting lookup Data in impotersExporters!"
                        );
                    }
                );
            }
        };
        //#endregion

        function resetValidations() {
            $scope.validDoNumber = true;
            $scope.validDoDate = true;
            $scope.isValidDo = true;
            //$scope.IsValidCargoAgent = true;
            $scope.InvalidCargoAgent = false;
            $scope.IsValidFreightCurrency = true;
            $scope.InvalidFreightCurrency = false;
            //$scope.IsValidConsignee = true;
            $scope.InvalidConsignee = false;
            $scope.isValidDate = true;
        }

        function ValidateDoDetails() {
            $scope.validExpiryDate = false;
            $scope.InvalidCargoAgent = false;
            $scope.InvalidConsignee = false;
            $scope.InvalidFreightCurrency = false;
            $scope.validDoNumber =
                $scope.doDetails && $scope.doDetails.DONumber ? true : false;
            $scope.validDoDate =
                $scope.doDetails && $scope.doDetails.doDate ? true : false;

            ///Date Compare
            //$scope.validExpiryDate = fn_DateCompare($scope.doDetails.doDate, $scope.doDetails.doExpiryDate);
            ///
            var cargoAgent =
                $scope.selectedCargoAgent && $scope.selectedCargoAgent.originalObject
                    ? $scope.selectedCargoAgent.originalObject.CargoAgentCode +
                    ($scope.selectedCargoAgent.originalObject.CargoAgentEngName
                        ? $scope.selectedCargoAgent.originalObject.CargoAgentEngName
                        : "") +
                    ($scope.selectedCargoAgent.originalObject.CargoAgentArbName
                        ? $scope.selectedCargoAgent.originalObject.CargoAgentArbName
                        : "")
                    : "";
            if (
                !$scope.selectedCargoAgent ||
                (cargoAgent &&
                    $scope.manifestCargoAgent.replace(/\s/g, "") !=
                    cargoAgent.replace(/\s/g, ""))
            ) {
                $scope.InvalidCargoAgent = true;
            }

            //if (cargoAgent == 0 || $scope.manifestCargoAgent == '') {
            //    $scope.InvalidCargoAgent = true;
            //} else if (cargoAgent != 0 && $scope.manifestCargoAgent != '') {
            //    $scope.InvalidCargoAgent = false;
            //}

            var deliverToConsignee =
                $scope.selectedConsignee && $scope.selectedConsignee.originalObject
                    ? $scope.selectedConsignee.originalObject.ImporterCode +
                    ($scope.selectedConsignee.originalObject.ImporterEngName
                        ? $scope.selectedConsignee.originalObject.ImporterEngName
                        : "") +
                    ($scope.selectedConsignee.originalObject.ImporterArbName
                        ? $scope.selectedConsignee.originalObject.ImporterArbName
                        : "")
                    : "";
            if (
                !$scope.selectedConsignee ||
                (deliverToConsignee &&
                    $scope.manifestConsignee.replace(/\s/g, "") !=
                    deliverToConsignee.replace(/\s/g, ""))
            ) {
                $scope.InvalidConsignee = true;
            }
            //if (deliverToConsignee == 0 || $scope.manifestConsignee=='') {
            //    $scope.InvalidConsignee = true;
            //}
            //else if (deliverToConsignee != 0 && $scope.manifestConsignee != '') {
            //    $scope.InvalidConsignee = false;
            //}

            var freightCurrency =
                $scope.selectedFreightCurrency &&
                    $scope.selectedFreightCurrency.originalObject
                    ? $scope.selectedFreightCurrency.originalObject.Code +
                    $scope.selectedFreightCurrency.originalObject.NameEnglish +
                    $scope.selectedFreightCurrency.originalObject.NameArabic
                    : "";
            if (
                !$scope.selectedFreightCurrency ||
                (freightCurrency &&
                    $scope.manifestFreightCurrency.replace(/\s/g, "") !=
                    freightCurrency.replace(/\s/g, ""))
            ) {
                $scope.InvalidFreightCurrency = true;
            }
            //if (freightCurrency == 0 || $scope.manifestFreightCurrency=='')  {
            //    $scope.InvalidFreightCurrency = true;
            //}
            //else if (freightCurrency != 0 && $scope.manifestFreightCurrency != '') {
            //    $scope.InvalidFreightCurrency = false;
            //}

            if (
                !apiService.isNullOrEmptyOrUndefined($scope.doDetails.doExpiryDate) &&
                !apiService.isNullOrEmptyOrUndefined($scope.doDetails.doDate)
            ) {
                var dtStart = apiService.formatDateObject($scope.doDetails.doDate);
                var dtEnd = apiService.formatDateObject($scope.doDetails.doExpiryDate);
                if (dtStart > dtEnd) {
                    $scope.isValidDate = false;
                } else {
                    $scope.isValidDate = true;
                }
            }

            //if ($scope.doDetails && $scope.doDetails.FreightAmount) {
            //    $scope.IsValidFreightCurrency = $scope.manifestFreightCurrency ? true : false;
            //}&& !$scope.validExpiryDate
            $scope.isValidDo =
                $scope.validDoNumber &&
                    $scope.validDoDate &&
                    !$scope.InvalidCargoAgent &&
                    !$scope.InvalidConsignee &&
                    !$scope.InvalidFreightCurrency &&
                    $scope.isValidDate
                    ? true
                    : false;
        }
        $scope.saveDoInformation = function () {
            ValidateDoDetails();
            if ($scope.isValidDo) {
                $("#loadingScreen").show();

                var arrival =
                    $scope.doDetails && $scope.doDetails.VoyageArrivalDate
                        ? $filter("date")(
                            new Date($scope.doDetails.VoyageArrivalDate),
                            "MM/dd/yyyy"
                        )
                        : "";
                var doDate =
                    $scope.doDetails && $scope.doDetails.doDate
                        ? $filter("date")(
                            new Date(apiService.formatDateObject($scope.doDetails.doDate)),
                            "MM/dd/yyyy"
                        )
                        : "";
                var expiry =
                    $scope.doDetails && $scope.doDetails.doExpiryDate
                        ? $filter("date")(
                            new Date(
                                apiService.formatDateObject($scope.doDetails.doExpiryDate)
                            ),
                            "MM/dd/yyyy"
                        )
                        : "";

                var doInfo = {
                    CenterCode: $stateParams.centerCode,
                    Vessel: $scope.doDetails.VesselCode,
                    Arrival: arrival,
                    MasterBL: $scope.doDetails.MasterBLNumber,
                    HouseBL: $scope.doDetails.HouseBLNumber,
                    DoNumber: $scope.doDetails.DONumber,
                    DoDate: doDate,
                    ExpiryDate: expiry,
                    DeliverTo:
                        $scope.selectedConsignee && $scope.selectedConsignee.originalObject
                            ? $scope.selectedConsignee.originalObject.ImporterCode
                            : "",
                    FreightAmount: $scope.doDetails.FreightAmount,
                    Currency:
                        $scope.selectedFreightCurrency &&
                            $scope.selectedFreightCurrency.originalObject
                            ? $scope.selectedFreightCurrency.originalObject.Code
                            : "",
                    CargoAgentCode:
                        $scope.selectedCargoAgent &&
                            $scope.selectedCargoAgent.originalObject
                            ? $scope.selectedCargoAgent.originalObject.CargoAgentCode
                            : "",
                    CargoAgentEngName: "",
                    CargoAgentArbName: "",
                    VoyageNumber: $scope.doDetails.VoyageNumber,
                };

                apiService.post(
                    "Customs/Manifest/SaveDOInfo",
                    "",
                    doInfo,
                    function (result) {
                        $("#loadingScreen").hide();
                        var data = result.data.ResponseResult;
                        if (data) {
                            if (data.IsValid) {
                                $scope.DONumber = $scope.doDetails.DONumber;
                                $("#successModal").modal("show");
                                getShipmentDetails();
                            } else {
                                var errMsg = apiService.formatResponseMessage(data.Messages);
                                showErrorMessage(errMsg);
                            }
                        }
                    },
                    function (result) {
                        $("#loadingScreen").hide();
                    }
                );
            }
        };
        //Lookups
        //------------------------------------------------------//

        $scope.PopulateCargoAgents = function () {
            apiService.get(
                "Customs/Lookup/ManifestCargoAgents",
                {
                    centerCode: $stateParams.centerCode,
                    searchString: "",
                },
                function (results) {
                    $scope.cargoAgentsFull = results.data.ResponseResult.Data;
                    $scope.cargoAgents = angular.copy($scope.cargoAgentsFull);
                },
                function error(response) {
                    console.log(
                        "An Error has occurred while getting lookup Data in PopulateCargoAgents!"
                    );
                }
            );
        };

        $scope.openCargoAgentLookup = function (item) {
            $scope.searchCargoAgentText = "";
            $("#cargoAgentLookup").modal({
                backdrop: "static",
            });
            $("#searchCargoAgentText").focus();
            $("#searchCargoAgentText").select();
            $scope.onCargoAgentChange();
            $("#cargoAgentLookup").off("keydown");
            $("#cargoAgentLookup").bind("keydown", function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndex < $scope.cargoAgents.length - 1) {
                                $scope.rowIndex++;
                                if ($scope.rowIndex > 10 * $scope.cargoAgents - 1) {
                                    $scope.lookUpCurrentPage++;
                                }
                                $scope.cargoAgentItemSelected =
                                    $scope.cargoAgents[$scope.rowIndex];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndex > 0) {
                                if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
                                    $scope.lookUpCurrentPage--;
                                }
                                $scope.rowIndex--;
                                $scope.cargoAgentItemSelected =
                                    $scope.cargoAgents[$scope.rowIndex];
                            }
                            break;
                        case 13:
                            $scope.setCargoAgent($scope.cargoAgentItemSelected);
                            break;
                    }
                });
            });
        };

        $scope.onCargoAgentChange = function () {
            $scope.rowIndex = 0;
            $scope.lookUpCurrentPage = 1;
            if ($scope.cargoAgentsFull) {
                $scope.cargoAgents = $scope.cargoAgentsFull.filter((obj) => {
                    return (
                        obj.CargoAgentCode.toString()
                            .toLowerCase()
                            .includes($scope.searchCargoAgentText) ||
                        (obj.CargoAgentEngName &&
                            obj.CargoAgentEngName.toLowerCase().includes(
                                $scope.searchCargoAgentText.toLowerCase()
                            )) ||
                        (obj.CargoAgentArbName &&
                            obj.CargoAgentArbName.toLowerCase().includes(
                                $scope.searchCargoAgentText.toLowerCase()
                            ))
                    );
                });
            }
        };
        $scope.setCargoAgent = function (row) {
            $scope.manifestCargoAgent =
                row.CargoAgentCode.toString() +
                "     " +
                (row.CargoAgentEngName ? row.CargoAgentEngName : "") +
                "     " +
                (row.CargoAgentArbName ? row.CargoAgentArbName : "");
            $scope.selectedCargoAgent = {};
            $scope.selectedCargoAgent.originalObject = row;
            $("#cargoAgentLookup").modal("hide");
            $("#EnglishCargoAgents_value").attr("tabindex", "1");
            $("#EnglishCargoAgents_value").focus();
        };
        $scope.$watch("searchCargoAgentText", function () {
            $scope.onCargoAgentChange();
        });
        /// F9 key down event
        $scope.cargoAgentKeyDown = function (event, item) {
            if (event.key == "F9") {
                $scope.openCargoAgentLookup(item);
            }
        };
        //------------------------------------------------------//
        //------------------------------------------------------//
        $scope.PopulateFreightCurrency = function () {
            $scope.stoppedSearch = false;
            apiService.get(
                "Customs/Lookup/Currencies",
                {
                    centerCode: $stateParams.centerCode,
                    searchString: "",
                },
                function (results) {
                    $scope.freightCurrencyFull = results.data.ResponseResult.Data;
                    $scope.freightCurrencies = angular.copy($scope.freightCurrencyFull);
                    $scope.stoppedSearch = true;
                },
                function error(response) {
                    console.log(
                        "An Error has occurred while getting lookup Data in PopulateCargoAgents!"
                    );
                    $scope.stoppedSearch = true;
                }
            );
        };

        $scope.openFreightCurrencyLookup = function (item) {
            $scope.searchFreightCurrencyText = "";
            $("#freightCurrencyLookup").modal({
                backdrop: "static",
            });
            $("#searchFreightCurrencyText").focus();
            $("#searchFreightCurrencyText").select();
            $scope.onFreightCurrencyChange();

            $("#freightCurrencyLookup").off("keydown");
            $("#freightCurrencyLookup").bind("keydown", function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if (
                                $scope.rowIndexFreightCurrency <
                                $scope.freightCurrencyFull.length - 1
                            ) {
                                $scope.rowIndexFreightCurrency++;
                                if (
                                    $scope.rowIndexFreightCurrency >
                                    10 * $scope.freightCurrencyFull - 1
                                ) {
                                    $scope.lookUpCurrentPageFreightCurrency++;
                                }
                                $scope.freightCurrencyItemSelected =
                                    $scope.freightCurrencyFull[$scope.rowIndexFreightCurrency];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexFreightCurrency > 0) {
                                if (
                                    $scope.rowIndexFreightCurrency ==
                                    10 * ($scope.lookUpCurrentPageFreightCurrency - 1)
                                ) {
                                    $scope.lookUpCurrentPageFreightCurrency--;
                                }
                                $scope.rowIndexFreightCurrency--;
                                $scope.freightCurrencyItemSelected =
                                    $scope.freightCurrencyFull[$scope.rowIndexFreightCurrency];
                            }
                            break;
                        case 13:
                            $scope.setFreightCurrency($scope.freightCurrencyItemSelected);
                            break;
                    }
                });
            });
        };

        $scope.onFreightCurrencyChange = function () {
            $scope.rowIndexFreightCurrency = 0;
            $scope.lookUpCurrentPageFreightCurrency = 1;
            if ($scope.freightCurrencyFull) {
                $scope.freightCurrencies = $scope.freightCurrencyFull.filter((obj) => {
                    return (
                        obj.Code.toString()
                            .toLowerCase()
                            .includes($scope.searchFreightCurrencyText) ||
                        (obj.NameEnglish &&
                            obj.NameEnglish.toLowerCase().includes(
                                $scope.searchFreightCurrencyText.toLowerCase()
                            )) ||
                        (obj.NameArabic &&
                            obj.NameArabic.toLowerCase().includes(
                                $scope.searchFreightCurrencyText.toLowerCase()
                            ))
                    );
                });
            }
        };
        $scope.setFreightCurrency = function (row) {
            $scope.manifestFreightCurrency =
                row.Code.toString() +
                "     " +
                (row.NameEnglish ? row.NameEnglish : "") +
                "     " +
                (row.NameArabic ? row.NameArabic : "");
            $scope.selectedFreightCurrency = {};
            $scope.selectedFreightCurrency.originalObject = row;
            $("#freightCurrencyLookup").modal("hide");
            $("#FreightCurrencies_value").attr("tabindex", "4");
            $("#FreightCurrencies_value").focus();
        };
        $scope.$watch("searchFreightCurrencyText", function () {
            $scope.onFreightCurrencyChange();
        });
        /// F9 key down event
        $scope.freightCurrencyKeyDown = function (event, item) {
            if (event.key == "F9") {
                $scope.openFreightCurrencyLookup(item);
            }
        };
        //------------------------------------------------------//
        //------------------------------------------------------//
        $scope.PopulateConsignees = function () {
            apiService.get(
                "Customs/Lookup/ManifestImporters",
                {
                    centerCode: $stateParams.centerCode,
                    searchString: "",
                },
                function (results) {
                    $scope.consigneesFull = results.data.ResponseResult.Data;
                    $scope.consignees = angular.copy($scope.consigneesFull);
                },
                function error(response) {
                    console.log(
                        "An Error has occurred while getting lookup Data in PopulateConsignees!"
                    );
                }
            );
        };

        $scope.openConsigneeLookup = function (item) {
            $scope.searchConsigneeText = "";
            $("#consigneeLookup").modal({
                backdrop: "static",
            });
            $("#searchConsigneeText").focus();
            $("#searchConsigneeText").select();
            $scope.onConsigneeChange();
            $("#consigneeLookup").off("keydown");
            $("#consigneeLookup").bind("keydown", function (event) {
                $timeout(function () {
                    switch (event.keyCode) {
                        case 40:
                            if ($scope.rowIndexConsignee < $scope.consigneesFull.length - 1) {
                                $scope.rowIndexConsignee++;
                                if ($scope.rowIndexConsignee > 10 * $scope.consigneesFull - 1) {
                                    $scope.lookUpCurrentPageConsignee++;
                                }
                                $scope.consigneeItemSelected =
                                    $scope.consigneesFull[$scope.rowIndexConsignee];
                            }
                            break;
                        case 38:
                            if ($scope.rowIndexConsignee > 0) {
                                if (
                                    $scope.rowIndexConsignee ==
                                    10 * ($scope.lookUpCurrentPageConsignee - 1)
                                ) {
                                    $scope.lookUpCurrentPageConsignee--;
                                }
                                $scope.rowIndexConsignee--;
                                $scope.consigneeItemSelected =
                                    $scope.consigneesFull[$scope.rowIndexConsignee];
                            }
                            break;
                        case 13:
                            $scope.setConsignee($scope.consigneeItemSelected);
                            break;
                    }
                });
            });
        };

        $scope.onConsigneeChange = function () {
            $scope.rowIndexConsignee = 0;
            $scope.lookUpCurrentPageConsignee = 1;
            if ($scope.consigneesFull) {
                $scope.consignees = $scope.consigneesFull.filter((obj) => {
                    return (
                        obj.ImporterCode.toString()
                            .toLowerCase()
                            .includes($scope.searchConsigneeText) ||
                        (obj.ImporterEngName &&
                            obj.ImporterEngName.toLowerCase().includes(
                                $scope.searchConsigneeText.toLowerCase()
                            )) ||
                        (obj.ImporterArbName &&
                            obj.ImporterArbName.toLowerCase().includes(
                                $scope.searchConsigneeText.toLowerCase()
                            ))
                    );
                });
            }
        };
        $scope.setConsignee = function (row) {
            $scope.manifestConsignee =
                row.ImporterCode.toString() +
                "     " +
                (row.ImporterEngName ? row.ImporterEngName : "") +
                "     " +
                (row.ImporterArbName ? row.ImporterArbName : "");
            $scope.selectedConsignee = {};
            $scope.selectedConsignee.originalObject = row;
            $("#consigneeLookup").modal("hide");
            $("#ImporterExporter_value").attr("tabindex", "2");
            $("#ImporterExporter_value").focus();
        };
        $scope.$watch("searchConsigneeText", function () {
            $scope.onConsigneeChange();
        });
        /// F9 key down event
        $scope.manifestConsigneeKeyDown = function (event, item) {
            if (event.key == "F9") {
                $scope.openConsigneeLookup(item);
            }
        };
        //------------------------------------------------------//
        //Do Information Update for Consolidator Account : Mamar Ph2 Changes
        function fn_DateCompare(DateA, DateB) {
            var a1 = DateA.split("/");
            var b1 = DateB.split("/");
            var a = new Date(a1[1], a1[0], a1[2]);
            var b = new Date(b1[1], b1[0], b1[2]);

            var msDateA = Date.UTC(a.getFullYear(), a.getMonth() + 1, a.getDate());
            var msDateB = Date.UTC(b.getFullYear(), b.getMonth() + 1, b.getDate());

            if (parseFloat(msDateA) < parseFloat(msDateB)) return true;
            // lt  -1
            else if (parseFloat(msDateA) == parseFloat(msDateB)) return false;
            // eq  0
            else if (parseFloat(msDateA) > parseFloat(msDateB)) return false;
            // gt  1
            else return true; // error
        }

        //#region Bill Type Change CR
        $scope.changeBillType = () => {
            $scope.selectedBillType = angular.copy(
                $scope.selectedBillTypeInitialData
            );
            if ($scope.lookupBillTpResult && $scope.lookupBillTpResult.length > 0) {
                $("#changeBillTypeModal").modal({
                    backdrop: "static",
                });
                return;
            }
            $("#loadingScreen").show();
            var params = {
                centerCode: $stateParams.centerCode,
                billType: $scope.BillTypeCode,
            };

            apiService.get(
                "Customs/Lookup/BillTypeGrouping",
                params,
                function (results) {
                    if (
                        results &&
                        results.data &&
                        results.data.ResponseResult &&
                        results.data.ResponseResult.Data
                    ) {
                        $scope.lookupBillTpResult = results.data.ResponseResult.Data;
                        $("#changeBillTypeModal").modal({
                            backdrop: "static",
                        });
                    } else {
                        modalErrorShow($filter("translate")("ErrorBillType"));
                    }
                    $("#loadingScreen").hide();
                },
                function error(response) {
                    $("#loadingScreen").hide();
                    $log.log("" + response);
                    modalErrorShow($filter("translate")("ErrorBillType"));
                }
            );
        };
        //#endregion

        $scope.sendBillTypeChangeRequest = () => {
            if (
                $scope.selectedBillType &&
                $scope.selectedBillType.bill &&
                $scope.selectedBillType.bill.Code
            ) {
                $("#loadingScreen").show();
                // var currentUser = $scope.userAccntDetails.users.filter(
                //   (c) =>
                //     c.UserName.toLowerCase() ==
                //     $scope.userAccntDetails.userCode.toLowerCase()
                // )[0];
                var payload = {
                    // UserName: currentUser.UserName,
                    // Email: currentUser.Email,
                    CompanyCode: $scope.userAccntDetails.companyId,
                    VoyageNumber: $scope.VoyageNumber,
                    BillType: $scope.selectedBillType.bill.Code,
                    CustomRefNumber: $scope.DONumber,
                    HouseBLNumber: $scope.HouseBLNumber,
                    MasterBLNumber: $scope.MasterBLNumber,
                    Center: $stateParams.centerCode,
                };

                apiService.postQueryParams(
                    "Customs/Job/UpdateBillType",
                    "",
                    payload,
                    function (result) {
                        if (
                            result &&
                            result.data &&
                            result.data.ResponseResult &&
                            result.data.ResponseResult.IsValid &&
                            result.data.ResponseResult.Success
                        ) {
                            $("#changeBillTypeModal").modal("show");
                            modalSuccessShow($filter("translate")("SuccessMsgBillType"));
                            // let msg =
                            //   $scope.language.toLowerCase() === "en"
                            //     ? result.data.ResponseResult.MessageEng
                            //     : result.data.ResponseResult.MessageArb;
                            // modalSuccessShow(msg);
                        } else if (
                            result &&
                            result.data &&
                            result.data.ResponseResult &&
                            result.data.ResponseResult.IsValid &&
                            !result.data.ResponseResult.Success
                        ) {
                            let msg =
                                $scope.language.toLowerCase() === "en"
                                    ? result.data.ResponseResult.MessageEng
                                    : result.data.ResponseResult.MessageArb;
                            modalWarningConfirmShow(msg);
                        } else {
                            modalErrorShow($filter("translate")("UpdateErrorMsg"));
                        }
                        $("#loadingScreen").hide();
                        $("#changeBillTypeModal").modal("hide");
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        $log.log("" + response);
                        $("#changeBillTypeModal").modal("hide");
                        modalErrorShow($filter("translate")("UpdateErrorMsg"));
                    }
                );
            } else {
                $scope.IsBillTypeNotSelected = true;
                //modalErrorShow("Please select the bill type");
                return;
            }
        };

        //Page Load
        $scope.Initialize();
    },
]);
