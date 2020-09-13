angular.module("mamarApp").controller("materialsMasterController", [
  "$scope",
  "$rootScope",
  "$translate",
  "apiService",
  "$storage",
  "$stateParams",
  "sharedModels",
  "$state",
  "$filter",
  "$timeout",
  function (
    $scope,
    $rootScope,
    $translate,
    apiService,
    $storage,
    $stateParams,
    sharedModels,
    $state,
    $filter,
    $timeout
  ) {
    $scope.init = function () {
      $scope.$storage = $storage;
      $scope.languageSelected = $scope.language;
      $scope.materialList = [];
      $scope.materialSearchModel = {};
      $scope.totalCount = 0;
      $scope.isAddNew = false;
      $scope.materialSearchModel.JobNumber = $stateParams.jobNumber;
      $scope.searchPopUpModels = {
        searchOriginCountryText: "",
        materialIdSearchText: "",
        harmonizedSearchText: "",
        materialCategorySearchText: "",
      };
      $scope.editMaterialMaster = [];
      $scope.editMouseOver = [];
      $scope.selectedMaterialMaster = {};
      $scope.pageSize = 5;
      $scope.materialMasterList = [];
      //$scope.pageNumber = 1;

      $scope.setDefaultSearchParameters(1);
      $scope.PopulateHarmonizedLookup();
      $scope.GetMaterialCategoryList();
      $scope.PopulateOriginCountry();
      $scope.GetMaterialIdList();
      $scope.GetMaterialMasterList();
    };

    $scope.resetMaterialMasterAddOrEditedIndex = function (indexToReset) {
      $scope.editMaterialMaster = [];
      $scope.isAddNew = false;
      for (
        var index = 0;
        index <
        ($scope.materialMasterList ? $scope.materialMasterList.length : 0);
        index++
      ) {
        $scope.editMaterialMaster[
          $scope.materialMasterList[index].MaterialID
        ] = false;
      }
    };

    /* #region Material grid fn */

    $scope.openMaterialMasterForm = function (
      selectedItem,
      action,
      indexToEdit
    ) {
      $scope.resetMaterialMasterAddOrEditedIndex();
      if (action == "add") {
        $scope.InitializeMaterialMasterInline(true, null);
        $scope.isAddNew = true;
      } else if (action == "edit") {
        $scope.InitializeMaterialMasterInline(false, selectedItem);
        $scope.isAddNew = false;
        $scope.editMaterialMaster[selectedItem.MaterialID] = true;
      }
      $scope.action = action;
      $("#gridHarmCodeObjId").focus();
      return;
    };

    // call update method based on the action
    $scope.saveMaterialMaster = function (selectedItem, action, increment) {
      $("#loadingScreen").show();
      $scope.validateMaterialMasterForm(action);
      if ($scope.isValid) {
        $scope.saveOrUpdateMaterialMaster(action);
      } else {
        showErrorMessage("Please fill all the manadatory fields...!");
        //modalErrorShow("Please fill all the manadatory fields...!");
      }
      $("#loadingScreen").hide();
    };

    $scope.validateMaterialMasterForm = function () {
      $scope.isValid = true;

      if (!$scope.isAddNew) {
        if (!$scope.selectedMaterialMaster.MaterialID) {
          //$scope.InvalidMaterialID = true;
          $scope.MaterialIDRequired = true;
          $scope.isValid = false;
        } else {
          $scope.MaterialIDRequired = false;
        }
      }

      if (!$scope.selectedMaterialMaster.HarmCode) {
        //$scope.InvalidHarmonizedCode = false;
        $scope.HarmonizedCodeRequired = true;
        $scope.isValid = false;
      } else {
        $scope.HarmonizedCodeRequired = false;
      }

      if (!$scope.selectedMaterialMaster.Country) {
        $scope.CountryRequired = true;
        $scope.isValid = false;
      } else {
        $scope.CountryRequired = false;
      }

      if (!$scope.selectedMaterialMaster.MaterialNameArb) {
        $scope.MaterialNameArbRequired = true;
        $scope.isValid = false;
      } else {
        $scope.MaterialNameArbRequired = false;
      }

      if (!$scope.selectedMaterialMaster.MaterialNameEng) {
        $scope.MaterialNameEngRequired = true;
        $scope.isValid = false;
      } else {
        $scope.MaterialNameEngRequired = false;
      }

      // if (!$scope.selectedMaterialMaster.MaterialCategoryID) {
      //   //$scope.InvalidMaterialCategoryID = false;
      //   $scope.MaterialCategoryIDRequired = true;
      //   $scope.isValid = false;
      // } else {
      //   $scope.MaterialCategoryIDRequired = false;
      // }

      if (!$scope.selectedMaterialMaster.GoodsClassification) {
        //$scope.InvalidGoodsClassification = false;
        $scope.GoodsClassificationRequired = true;
        $scope.isValid = false;
      } else {
        $scope.GoodsClassificationRequired = false;
      }

      if (!$scope.selectedMaterialMaster.PermitNumber) {
        // $scope.InvalidPermitNumber = true;
        $scope.PermitNumberRequired = true;
        $scope.isValid = false;
      } else {
        $scope.PermitNumberRequired = false;
      }

      // if (!$scope.selectedMaterialMaster.MaterialWeight) {
      //   //$scope.InvalidMaterialWeight = true;
      //   $scope.MaterialWeightRequired = true;
      //   $scope.isValid = false;
      // }else{
      //  $scope.MaterialWeightRequired = false;
      // }

      // if (!$scope.selectedMaterialMaster.MaterialGrossWeight) {
      //   //$scope.InvalidMaterialGrossWeight = true;
      //   $scope.MaterialGrossWeightRequired = true;
      //   $scope.isValid = false;
      // }else{
      //  $scope.MaterialGrossWeightRequired = false;
      // }

      if (!$scope.selectedMaterialMaster.MaterialAmount) {
        // $scope.InvalidMaterialAmount = true;
        $scope.MaterialAmountRequired = true;
        $scope.isValid = false;
      } else {
        $scope.MaterialAmountRequired = false;
      }

      // if (!$scope.selectedMaterialMaster.CASNO) {
      //   // $scope.InvalidCaseNo = true;
      //   $scope.CaseNoRequired = true;
      //   $scope.isValid = false;
      // } else {
      //   $scope.CaseNoRequired = false;
      // }

      // if (!$scope.selectedMaterialMaster.UNNO) {
      //   //$scope.InvalidUno = true;
      //   $scope.UnoRequired = true;
      //   $scope.isValid = false;
      // } else {
      //   $scope.UnoRequired = false;
      // }

      // if (!$scope.selectedMaterialMaster.HazardClassID) {
      //   //$scope.InvalidHazardClassID = false;
      //   $scope.HazardClassIDRequired = true;
      //   $scope.isValid = false;
      // } else {
      //   $scope.HazardClassIDRequired = false;
      // }
    };

    // Initialize MaterialMaster Inline add or edit
    $scope.InitializeMaterialMasterInline = function (
      isAddNew,
      MaterialMaster
    ) {
      //reset all validation keys
      $scope.InvalidHarmonizedCode = false;
      $scope.HarmonizedCodeRequired = false;

      $scope.InvalidCountry = false;
      $scope.CountryRequired = false;

      $scope.MaterialNameArbRequired = false;
      $scope.MaterialNameEngRequired = false;
      $scope.InvalidMaterialID = false;
      $scope.MaterialIDRequired = false;

      $scope.InvalidMaterialCategoryID = false;
      $scope.MaterialCategoryIDRequired = false;

      $scope.InvalidGoodsClassification = false;
      $scope.GoodsClassificationRequired = false;

      $scope.InvalidPermitNumber = false;
      $scope.PermitNumberRequired = false;

      $scope.InvalidMaterialWeight = false;
      $scope.MaterialWeightRequired = false;

      $scope.InvalidMaterialGrossWeight = false;
      $scope.MaterialGrossWeightRequired = false;

      $scope.InvalidMaterialAmount = false;
      $scope.MaterialAmountRequired = false;

      $scope.InvalidCaseNo = false;
      $scope.CaseNoRequired = false;

      $scope.InvalidUno = false;
      $scope.UnoRequired = false;

      $scope.InvalidHazardClassID = false;
      $scope.HazardClassIDRequired = false;

      if (isAddNew) {
        $scope.selectedMaterialMaster = {
          HarmCode: null,
          MaterialID: null,
          MaterialNameEng: null,
          MaterialNameArb: null,
          GoodsClassification: null,
          Country: null,
          CountryDescEng: null,
          CountryDescArb: null,
          MaterialAmount: null,
          PermitNumber: null,
          MaterialCategoryID: null,
          RNUM: null,
          CaseNo: null,
          Uno: null,
          HazardClassID: null,
          MaterialWeight: null,
          MaterialGrossWeight: null,
        };
      } else {
        $scope.selectedMaterialMaster = angular.copy(MaterialMaster);
      }
    };

    // load More Records
    $scope.pageChangeHandler = function (newPageNo) {
      console.log("Page number: " + newPageNo);
      $scope.searchParameters.pageNumber = newPageNo;
      //$scope.setDefaultSearchParameters(newPageNo);
      $scope.GetMaterialMasterList();
    };

    // validate MaterialMasterNo format
    $scope.onMaterialMasterChanged = function (action) {
      $scope.isRequiredValid = true;
      //RecordToSave.MaterialMasterNumber

      if (action != "add") {
        if (
          !apiService.isNullOrEmptyOrUndefined(
            $scope.RecordToSave.MaterialMasterNumber
          )
        ) {
          $scope.isValidMaterialMasterNo = apiService.validateMaterialMasterNo(
            $scope.RecordToSave.MaterialMasterNumber
          );
        } else {
          $scope.isValidMaterialMasterNo = true;
        }
      } else {
        if (
          !apiService.isNullOrEmptyOrUndefined(
            $scope.RecordToSave.MaterialMasterNumber
          )
        ) {
          $scope.isValidMaterialMasterNo = apiService.validateMaterialMasterNo(
            $scope.RecordToSave.MaterialMasterNumber
          );
        } else {
          $scope.isValidMaterialMasterNo = true;
        }
      }
    };
    /* #endregion grid fn */

    /* #region Material search */

    $scope.setDefaultSearchParameters = function (pageNo) {
      $scope.searchParameters = {
        companyCode: null,
        userCode: null,
        centerCode: $stateParams.centerCode,
        //jobNumber: 16398751 || $stateParams.jobNumber,
        // serialNumber: 5763938 || $stateParams.serialNumber,
        jobNumber: $stateParams.jobNumber,
        serialNumber: $stateParams.serial,
        harmCode: null,
        materialID: null,
        goodsClassification: null,
        origin: null,
        materialAmount: null,
        permitNumber: null,
        materialNameEng: null,
        materialNameArb: null,
        materialCategoryID: null,
        casno: null,
        unno: null,
        hazardClassID: null,
        materialWeight: null,
        materialGrossWeight: null,
        pageNumber: pageNo ? pageNo : 1,
        pageSize: $scope.pageSize,
      };
    };

    $scope.searchMaterialMaster = function () {
      $scope.setDefaultSearchParameters(1);
      $scope.searchParameters.jobNumber = $stateParams.jobNumber;
      $scope.searchParameters.serialNumber = $stateParams.serial;
      $scope.centerCode = $stateParams.centerCode;

      $scope.searchParameters.harmCode = $scope.materialSearchModel
        .selectedHarmCodeObj
        ? $scope.materialSearchModel.selectedHarmCodeObj.HarmonizedCode
        : null;
      $scope.searchParameters.materialCategoryID = $scope.materialSearchModel
        .selectedMaterialCategoryObj
        ? $scope.materialSearchModel.selectedMaterialCategoryObj.CategoryID
        : null;
      $scope.searchParameters.origin = $scope.materialSearchModel
        .selectedSearchOrginCountry
        ? $scope.materialSearchModel.selectedSearchOrginCountry.Code
        : null;
      $scope.searchParameters.casno = $scope.materialSearchModel.CaseNo;
      $scope.searchParameters.materialID =
        $scope.materialSearchModel.MaterialID;
      $scope.searchParameters.unno = $scope.materialSearchModel.Uno;
      $scope.searchParameters.permitNumber =
        $scope.materialSearchModel.permitNumber;
      $scope.GetMaterialMasterList();
    };

    $scope.resetSearchForm = function () {
      $scope.materialSearchModel = {};
      $scope.materialSearchModel.JobNumber = $stateParams.jobNumber;
      $scope.setDefaultSearchParameters(1);
      $scope.GetMaterialMasterList();
    };

    $scope.GetMaterialMasterList = function () {
      $("#loadingScreen").show();
      apiService.post(
        "Customs/Invoice/MaterialList",
        "",
        $scope.searchParameters,
        function (results) {
          $("#loadingScreen").hide();
          if (
            results.data &&
            results.data.ResponseResult &&
            results.data.ResponseResult.Data &&
            results.data.ResponseResult.Data.MaterialList
          ) {
            //$scope.pageNumber = 1;
            $scope.materialMasterList =
              results.data.ResponseResult.Data.MaterialList;
            if (
              $scope.materialMasterList != null &&
              $scope.materialMasterList.length > 0
            ) {
              $scope.resetMaterialMasterAddOrEditedIndex();
              $scope.totalCount = $scope.materialMasterList[0].Total;
            }
          } else if (
            results.data &&
            results.data.ResponseResult &&
            results.data.ResponseResult.Data &&
            results.data.ResponseResult.Data.MaterialList == null
          ) {
            $scope.materialMasterList = [];
            $scope.resetMaterialMasterAddOrEditedIndex();
            $scope.totalCount = 0;
          } else {
            // modalErrorShow(
            //   "Error while fetching the search result...! Please contact admin."
            // );
            showErrorMessage(
              "Error while fetching the search result...! Please contact admin."
            );
          }
        },
        function error(response) {
          $("#loadingScreen").hide();
          alert("something went wrong");
          console.log(response);
        }
      );
    };
    /* #endregion Material search  */

    /* #region Material CRUD */
    $scope.saveOrUpdateMaterialMaster = function (action) {
      var DataTobeSave = $scope.getMaterialMasterToSave();
      apiService.post(
        "Customs/Invoice/SaveHazardMaterial",
        "",
        DataTobeSave,
        function (result) {
          $("#loadingScreen").hide();
          var response = result.data.ResponseResult;
          var msg = apiService.formatResponseMessage(response.Messages);
          if (response.IsValid) {
            //$scope.pageNumber = 1;
            // $scope.setDefaultSearchParameters(1);
            // $scope.GetMaterialMasterList();
            $scope.searchMaterialMaster();
            $scope.resetMaterialMasterAddOrEditedIndex();
            $("#successModal").modal("show");
          } else if (!response.IsValid) {
            showErrorMessage(msg);
            $("#loadingScreen").hide();
          }
          console.log(response);
        },
        function (result) {
          $("#loadingScreen").hide();
          showErrorMessage("An Error has occurred!");
          console.log("An Error has occurred!");
          console.log(result);
        }
      );
    };

    $scope.getMaterialMasterToSave = function () {
      var dataToSave = {
        companyCode: null,
        userCode: null,
        shipmentID: $stateParams.jobNumber,
        centerCode: $stateParams.centerCode,
        serialNumber: $stateParams.serial,
        harmCode: $scope.selectedMaterialMaster.HarmCode,
        materialID: $scope.selectedMaterialMaster.MaterialID,
        materialNameEng: $scope.selectedMaterialMaster.MaterialNameEng,
        materialNameArb: $scope.selectedMaterialMaster.MaterialNameArb,
        goodsClassification: $scope.selectedMaterialMaster.GoodsClassification,
        origin: $scope.selectedMaterialMaster.Country,
        materialAmount: $scope.selectedMaterialMaster.MaterialAmount,
        permitNumber: $scope.selectedMaterialMaster.PermitNumber,
        materialCategoryID: $scope.selectedMaterialMaster.MaterialCategoryID,
        casno: $scope.selectedMaterialMaster.CASNO,
        unno: $scope.selectedMaterialMaster.UNNO,
        hazardClassID: $scope.selectedMaterialMaster.HazardClassID,
        materialWeight: $scope.selectedMaterialMaster.MaterialWeight,
        materialGrossWeight: $scope.selectedMaterialMaster.MaterialGrossWeight,
        MaterialNameEng: $scope.selectedMaterialMaster.MaterialNameEng,
        MaterialNameArb: $scope.selectedMaterialMaster.MaterialNameArb,
      };
      return dataToSave;
    };
    /* #endregion Material CRUD */

    /* #region generl methods */

    $scope.lookupKeyDown = function (event, lookupId, mode, item) {
      if (event.key == "F9") {
        if (lookupId == "MaterialCategory") {
          $scope.openMaterialCategoryLookup(mode, item);
        } else if (lookupId == "HarmonizedCode") {
          $scope.openHarmonizeLookup(mode, item);
        } else if (lookupId == "OriginCountry") {
          $scope.openOriginCountryLookup(mode, item);
        } else if (lookupId == "MaterialId") {
          $scope.openMaterialIdLookup(mode, item);
        }
      }
    };

    $scope.$on("changeLanguage", function (event, args) {
      $scope.languageSelected = args.language;
    });

    $scope.gotoHazardousMaterialDetails = function () {
      $state.go("hazardousMaterialDetails", {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        serial: $stateParams.serial,
        CountryCode: $stateParams.CountryCode,
        hMaterialId: $stateParams.hMaterialId,
      });
    };
    /* #endregion generl methods */

    /* #region begin harmonized lookup Methods */
    // ---------------------------------------
    $scope.setInvoiceDetails = function () {
      if (
        sharedModels.invoiceDetails &&
        sharedModels.invoiceDetails.length > 0
      ) {
        $scope.invoiceData = sharedModels.invoiceDetails;
        if (typeof Storage !== "undefined") {
          localStorage.storedInvoiceData = JSON.stringify(
            sharedModels.invoiceDetails
          );
        }
      } else {
        $scope.invoiceData = JSON.parse(localStorage.storedInvoiceData);
      }
    };

    $scope.PopulateHarmonizedLookup = function () {
      $scope.setInvoiceDetails();
      $scope.harmonisedList = [];
      var flags = [],
        output = [],
        l = $scope.invoiceData.length,
        i;
      for (i = 0; i < l; i++) {
        if (flags[$scope.invoiceData[i].HarmonizedCode]) continue;
        flags[$scope.invoiceData[i].HarmonizedCode] = true;
        $scope.harmonisedList.push($scope.invoiceData[i]);
      }
      $scope.harmonisedListFiltered = angular.copy($scope.harmonisedList);
    };

    $scope.openHarmonizeLookup = function (mode, item) {
      $scope.harmonizeLookupMode = mode;
      $scope.harmonisedListFiltered = angular.copy($scope.harmonisedList);
      $scope.searchPopUpModels.harmonizedSearchText = "";
      $scope.SelectedHarmonizedRecord = item;
      $("#harmonizeLookup").modal({
        backdrop: "static",
      });
      $("#harmonizedSearchText").focus();
    };

    $scope.setHarmonized = function (row) {
      var selectedHarmCodeTitle =
        row.HarmonizedCode +
        " " +
        row.HarmonizeEngName +
        " " +
        row.HarmonizeArbName;

      if ($scope.harmonizeLookupMode == "search") {
        $("#searchHarmCodeObjId").focus();
        $scope.selectedHarmCodeSearchTitle = selectedHarmCodeTitle;
        $scope.materialSearchModel.selectedHarmCodeObj = row;
      } else {
        $("#gridHarmCodeObjId").focus();
        $scope.selectedHarmCodeTitle = selectedHarmCodeTitle;
        $scope.selectedMaterialMaster.HarmCode = row.HarmonizedCode;
      }

      $("#harmonizeLookup").modal("hide");
    };

    $scope.onHarmonizeChangeClientFilter = function () {
      $scope.rowIndex = 0;
      $scope.lookUpCurrentPage = 1;
      if ($scope.harmonisedList) {
        $scope.harmonisedListFiltered = $scope.harmonisedList.filter((obj) => {
          return (
            obj.HarmonizedCode.includes(
              $scope.searchPopUpModels.harmonizedSearchText
            ) ||
            (obj.HarmonizeEngName &&
              obj.HarmonizeEngName.toString()
                .toLowerCase()
                .includes($scope.searchPopUpModels.harmonizedSearchText)) ||
            (obj.HarmonizeArbName &&
              obj.HarmonizeArbName.toString()
                .toLowerCase()
                .includes($scope.searchPopUpModels.harmonizedSearchText))
          );
        });
      } else {
        $scope.PopulateHarmonizedLookup();
      }
      $scope.HarmonizedRequired = false;
    };

    $scope.setHarmonizedByCode = function (selectedCode, mode, item) {
      if (selectedCode) {
        var HarmonisedList = angular.copy($scope.harmonisedListFiltered);
        var index = HarmonisedList
          ? HarmonisedList.findIndex(
              (doc) =>
                doc.HarmonizedCode.toUpperCase() == selectedCode.toUpperCase()
            )
          : -1;
        if (index != -1) {
          if (mode == "search") {
            $scope.materialSearchModel.selectedHarmCodeObj = angular.copy(
              HarmonisedList[index]
            );
            $scope.InvalidHarmonizedCode = false;
          }
        } else {
          $scope.InvalidHarmonizedCode = true;
        }
      } else {
        if (mode == "search") {
          $scope.materialSearchModel.selectedHarmCodeObj = {};
        }
      }
    };
    // ----------------------------------------------------
    /* #endregion harmonized lookup Methods */

    /* #region start model popup fro material category Id */
    // ------------------------------------
    $scope.openMaterialIdLookup = function (mode, item) {
      $scope.SelectedMaterialIdRecord = item;
      //$scope.materialIdListFiltered = $scope.filterMaterialIdsByHarmCode();
      $scope.materialIdListFiltered = angular.copy($scope.materialIdList);
      $scope.searchPopUpModels.materialIdSearchText = "";
      $scope.materialIdMode = mode;
      $("#openMaterialIdLookup").modal({
        backdrop: "static",
      });
      $("#materialIdSearchText").focus();
    };

    $scope.filterMaterialIdsByHarmCode = function () {
      var materialIdList = [];
      var selectedHarmonisedList = $scope.harmonisedList;
      var unfilteredTypes = angular.copy($scope.materialIdList);

      if (selectedHarmonisedList && unfilteredTypes) {
        var hsCode =
          $scope.materialIdMode == "search"
            ? $scope.materialSearchModel.selectedHarmCodeObj.HarmonizedCode
            : $scope.selectedMaterialMaster.HarmCode;

        materialIdList = unfilteredTypes.filter(function (objFromA) {
          return !selectedHarmonisedList.find(function (objFromB) {
            return hsCode === objFromB.HarmonizedCode;
          });
        });
      } else {
        var materialIdList = unfilteredTypes;
      }
      return materialIdList;
    };

    $scope.GetMaterialIdList = function (searchStr) {
      apiService.get(
        "Customs/Lookup/MaterialType",
        {
          CenterCode: $stateParams.centerCode,
          searchString: searchStr,
          jobNumber: $stateParams.jobNumber,
        },
        function (results) {
          $scope.materialIdList = results.data.ResponseResult.Data;
          $scope.materialIdListFiltered = angular.copy($scope.materialIdList);
        },
        function error(response) {
          console.log(response);
        }
      );
      $scope.MaterialRequired = false;
    };

    $scope.filterMaterialIdRecordsClientSide = function () {
      $scope.materialIdListFiltered = $scope.materialIdList.filter((obj) => {
        return (
          obj.ScientificNameEng.toString()
            .toLowerCase()
            .includes(
              $scope.searchPopUpModels.materialIdSearchText
                .toString()
                .toLowerCase()
            ) ||
          obj.SubstanceID.toString().includes(
            $scope.searchPopUpModels.materialIdSearchText
          ) ||
          obj.ScientificNameArb.includes(
            $scope.searchPopUpModels.materialIdSearchText
          )
        );
      });
    };

    $scope.setMaterialIdByCode = function (selectedCode, mode, item) {
      if (selectedCode) {
        var materialIdList = angular.copy($scope.materialIdList);
        var index = materialIdList
          ? materialIdList.findIndex(
              (doc) =>
                doc.SubstanceID.toString().toUpperCase() ==
                selectedCode.toString().toUpperCase()
            )
          : -1;
        if (index != -1) {
          if (mode == "search") {
            $scope.materialSearchModel.selectedMaterialIdObj = angular.copy(
              materialIdList[index]
            );
            $scope.InvalidMaterialType = false;
          }
        } else {
          $scope.InvalidMaterialType = true;
        }
      } else {
        if (mode == "search") {
          $scope.materialSearchModel.selectedMaterialIdObj = {};
        }
      }
    };

    $scope.setMaterialId = function (row) {
      var selectedMaterialIdCombinedText =
        row.SubstanceID.toString() +
        "     " +
        (row.ScientificNameEng ? row.ScientificNameEng : "") +
        "     " +
        (row.ScientificNameArb ? row.ScientificNameArb : "");

      if ($scope.materialIdMode == "search") {
        $scope.selectedMaterialIdCombinedSearchTitle = selectedMaterialIdCombinedText;
        $scope.materialSearchModel.selectedMaterialIdObj = row;
      } else {
        $scope.selectedMaterialIdCombinedTitle = selectedMaterialIdCombinedText;
        $scope.selectedMaterialMaster.MaterialID = row.SubstanceID;
      }

      $scope.searchPopUpModels.materialIdSearchText = "";
      $("#openMaterialIdLookup").modal("hide");
    };
    // ------------------------------------
    /* #endregion end model popup fro material Id */

    /* #region  start model popup fro material category Type */
    // ------------------------------------
    $scope.openMaterialCategoryLookup = function (mode, item) {
      $scope.materialCategoryMode = mode;
      $scope.SelectedMaterialCategoryRecord = item;
      $scope.materialCategoryListFiltered = angular.copy(
        $scope.materialCategoryList
      );
      $scope.searchPopUpModels.materialCategorySearchText = "";
      $("#openMaterialCategoryLookup").modal({
        backdrop: "static",
      });
      $("#materialCategorySearchText").focus();
    };

    $scope.GetMaterialCategoryList = function (searchStr) {
      apiService.get(
        "Customs/Lookup/MaterialCategory",
        {
          centerCode: $stateParams.centerCode,
        },
        function (results) {
          $scope.materialCategoryListFiltered =
            results.data.ResponseResult.Data;
          $scope.materialCategoryList = angular.copy(
            results.data.ResponseResult.Data
          );
        },
        function error(response) {
          console.log(response);
        }
      );
      $scope.MaterialRequired = false;
    };

    $scope.filterMaterialCategoryRecordsClientSide = function () {
      $scope.materialCategoryListFiltered = $scope.materialCategoryList.filter(
        (obj) => {
          return (
            obj.CategoryDescEng.toString()
              .toLowerCase()
              .includes(
                $scope.searchPopUpModels.materialCategorySearchText
                  .toString()
                  .toLowerCase()
              ) ||
            obj.CategoryID.toString().includes(
              $scope.searchPopUpModels.materialCategorySearchText
            ) ||
            obj.CategoryDescArb.includes(
              $scope.searchPopUpModels.materialCategorySearchText
            )
          );
        }
      );
    };

    $scope.setMaterialCategoryByCode = function (selectedCode, mode, item) {
      if (selectedCode) {
        var materialCategoryList = angular.copy($scope.materialCategoryList);
        var index = materialCategoryList
          ? materialCategoryList.findIndex(
              (doc) =>
                doc.CategoryID.toString().toUpperCase() ==
                selectedCode.toString().toUpperCase()
            )
          : -1;
        if (index != -1) {
          if (mode == "search") {
            $scope.materialSearchModel.selectedMaterialCategoryObj = angular.copy(
              materialCategoryList[index]
            );
            $scope.InvalidMaterialType = false;
          }
        } else {
          $scope.InvalidMaterialType = true;
        }
      } else {
        if (mode == "search") {
          $scope.materialSearchModel.selectedMaterialCategoryObj = {};
        }
      }
    };

    $scope.setMaterialCategoryType = function (row) {
      var selectedSearchMaterialCategoryCombinedText =
        row.CategoryID.toString() +
        "     " +
        (row.CategoryDescEng ? row.CategoryDescEng : "") +
        "     " +
        (row.CategoryDescArb ? row.CategoryDescArb : "");

      if ($scope.materialCategoryMode == "search") {
        $scope.materialSearchModel.selectedMaterialCategoryObj = row;
        $scope.selectedMaterialCategoryCombinedSearchTitle = selectedSearchMaterialCategoryCombinedText;
        $("#searchMaterialCategoryId").focus();
      } else {
        $scope.selectedMaterialMaster.MaterialCategoryID = row.CategoryID;
        //$scope.selectedMaterialMaster.MaterialNameEng = row.CategoryDescEng;
        //$scope.selectedMaterialMaster.MaterialNameArb = row.CategoryDescArb;
        $scope.selectedMaterialCategoryCombinedTitle = selectedSearchMaterialCategoryCombinedText;
        $("#gridMaterialCategoryId").focus();
      }

      $("#openMaterialCategoryLookup").modal("hide");
    };
    // ------------------------------------
    /* #endregion end model popup fro material category */

    /* #region  start model popup for shipment countries */
    // ------------------------------------
    $scope.PopulateOriginCountry = function () {
      apiService.get(
        "Customs/Lookup/ShipmentCountries",
        {
          centerCode: $stateParams.centerCode,
          searchString: "",
        },
        function (results) {
          $scope.countryList = $scope.filterCountryByInvoiceCountries(
            results.data.ResponseResult.Data
          );
          $scope.origincountryListFiltered = angular.copy($scope.countryList);
        },
        function error(response) {}
      );
    };

    $scope.openOriginCountryLookup = function (mode, countryItem) {
      $scope.originCountryMode = mode;
      $scope.SelectedOriginCountryRecord = countryItem;
      $scope.origincountryListFiltered = angular.copy($scope.countryList);
      $scope.searchPopUpModels.searchOriginCountryText = "";
      $("#originCountryLookup").modal({
        backdrop: "static",
      });
      $("#searchOriginCountryText").focus();
      $("#searchOriginCountryText").select();
    };

    $scope.filterCountryByInvoiceCountries = function (unfilteredTypes) {
      var countryList = unfilteredTypes.filter(function (Obj) {
        return Obj.Code === $stateParams.CountryCode;
      });
      return countryList;
    };

    $scope.OriginCountryChangeFilterClientSide = function () {
      $scope.rowIndexOriginCountry = 0;
      $scope.lookUpCurrentPageOriginCountry = 1;
      if ($scope.countryList) {
        $scope.origincountryListFiltered = $scope.countryList.filter((obj) => {
          return (
            obj.Code.toString()
              .toLowerCase()
              .includes(
                $scope.searchPopUpModels.searchOriginCountryText
                  .toString()
                  .toLowerCase()
              ) ||
            (obj.EnglishName &&
              obj.EnglishName.toString()
                .toLowerCase()
                .includes(
                  $scope.searchPopUpModels.searchOriginCountryText
                    .toString()
                    .toLowerCase()
                )) ||
            (obj.ArabicName &&
              obj.ArabicName.toString()
                .toLowerCase()
                .includes(
                  $scope.searchPopUpModels.searchOriginCountryText
                    .toString()
                    .toLowerCase()
                ))
          );
        });
      }
    };

    $scope.setOriginCountry = function (row) {
      var selectedSearchOrginCountryCombinedText =
        row.Code.toString() +
        "     " +
        (row.EnglishName ? row.EnglishName : "") +
        "     " +
        (row.ArabicName ? row.ArabicName : "");

      if ($scope.originCountryMode == "search") {
        $scope.materialSearchModel.selectedSearchOrginCountry = row;
        $scope.selectedOrginCountryCombinedSearchTitle = selectedSearchOrginCountryCombinedText;
        $("#searchOrginCountryId").focus();
      } else {
        $scope.selectedMaterialMaster.Country = row.Code;
        $scope.selectedMaterialMaster.CountryDescEng = row.EnglishName;
        $scope.selectedMaterialMaster.CountryDescArb = row.ArabicName;
        $scope.selectedSearchOrginCountryCombinedTitle = selectedSearchOrginCountryCombinedText;
        $("#gridOrginCountryId").focus();
      }
      $("#originCountryLookup").modal("hide");
    };
    // ------------------------------------
    /* #endregion end model popup for shipment countries */

    $scope.init();
  },
]);
