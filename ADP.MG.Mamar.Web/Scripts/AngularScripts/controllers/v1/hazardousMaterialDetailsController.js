angular.module("mamarApp").controller("hazardousMaterialDetailsController", [
  "$scope",
  "$rootScope",
  "$translate",
  "apiService",
  "$storage",
  "$stateParams",
  "sharedModels",
  "$state",
  "$filter",
  "paginationService",
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
    paginationService,
    $timeout
  ) {
    $scope.init = function () {
      $scope.$storage = $storage;
      $scope.languageSelected = $scope.language;
      $scope.hazardousMaterials = [];
      $scope.RecordToEdit = {};
      $scope.setInvoiceDetails();
      $scope.PopulateHarmonizedLookup();
      $scope.isEditing = $stateParams.hMaterialId ? true : false;
      if ($scope.isEditing) {
        //need to fetch from api
        $scope.materialItemData = $storage.get("materialItemData");
        $scope.editHazardous($scope.materialItemData);
      }
      $scope.stateParams = {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        serial: $stateParams.serial,
        CountryCode: $stateParams.CountryCode,
        hMaterialId: $stateParams.hMaterialId,
      };
    };

    $scope.getDisableStatus = function () {
      if (
        $scope.selectedHarmCodeObj &&
        $scope.selectedHarmCodeObj.originalObject &&
        !angular.equals({ originalObject: {} }, $scope.selectedHarmCodeObj)
      ) {
        return true;
      } else {
        return false;
      }
    };

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

    var clearErrorMessages = function () {
      $scope.HarmonizedCodeRequired = false;
      $scope.InvalidMaterialType = false;
      $scope.deleteSuccess = false;
      $scope.deleteFailed = false;
      $scope.MaterialRequired = false;
      $scope.InvalidMaterialType = false;
      $scope.GoodsClassificationRequired = false;
      $scope.PermitNumberRequired = false;
    };

    $scope.filterMaterialRecordsClientSide = function () {
      $scope.materialTypeFiltered = $scope.materialType.filter((obj) => {
        return (
          obj.ScientificNameEng.toLowerCase().includes(
            $scope.searchText.toLowerCase()
          ) ||
          obj.SubstanceID.toString().includes($scope.searchText) ||
          obj.ScientificNameArb.includes($scope.searchText)
        );
      });
    };

    $scope.onMaterialTypeChange = function (searchStr) {
      if (!$scope.isEditing) {
        // $scope.InvalidMaterialType=true;
        $scope.selectedMaterialTypeModel = searchStr;

        apiService.get(
          "Customs/Lookup/MaterialType",
          {
            CenterCode: $stateParams.centerCode,
            searchString: $scope.selectedMaterialTypeModel,
            jobNumber: $stateParams.jobNumber,
            harmonizedCode:
              $scope.selectedHarmCodeObj.originalObject.ShortHarmCode,
          },
          function (results) {
            $scope.materialType = results.data.ResponseResult.Data;

            var currentMaterials = $scope.hazardousMaterials;
            var unfilteredTypes = results.data.ResponseResult.Data;

            if (currentMaterials && unfilteredTypes) {
              $scope.materialType = unfilteredTypes.filter(function (objFromA) {
                return !currentMaterials.find(function (objFromB) {
                  return (
                    objFromA.CommNameId === objFromB.CommID &&
                    $scope.RecordToEdit.HarmonizedCode ===
                      objFromB.HarmonizedDescription
                  );
                });
              });
            } else {
              $scope.materialType = unfilteredTypes;
            }

            $scope.materialTypeFiltered = angular.copy($scope.materialType);
          },
          function error(response) {
            console.log(response);
          }
        );
        $scope.MaterialRequired = false;
      }
    };

    $scope.harmonizedCodeChanged = function (searchStr) {
      if (!$scope.isEditing) {
        //$scope.InvalidHarmonizedCode = true;
        $scope.harmonizedCodes = $scope.HarmonizedLookUpData;
        $scope.HarmonizedCodeRequired = false;
      }
    };

    $scope.$watch("selectedHarmCodeObj", function () {
      if (!$scope.isEditing) {
        var aggregateAmount = (aggregateWeight = aggregateGross = 0);
        if (
          $scope.selectedHarmCodeObj &&
          $scope.selectedHarmCodeObj.originalObject
        ) {
          $scope.RecordToEdit.HarmonizedCode =
            $scope.selectedHarmCodeObj.originalObject.HarmonizedCode;
          var invoiceCollection = $scope.invoiceData.filter((obj) => {
            return (
              obj.HarmonizedCode ===
              $scope.selectedHarmCodeObj.originalObject.HarmonizedCode
            );
          });

          invoiceCollection.forEach(function (element) {
            aggregateAmount += element.Amount;
            aggregateWeight += element.NetWeight;
            aggregateGross += element.GrossWeight;
          });

          $scope.InvalidHarmonizedCode = false;
        }

        $scope.RecordToEdit.Amount = aggregateAmount;
        $scope.RecordToEdit.Weight = aggregateWeight;
        $scope.RecordToEdit.Gross = aggregateGross;
        $scope.RecordToEdit.CountryCode = $stateParams.CountryCode;
      } else {
        $scope.selectedHarmCode = "";
      }
    });

    $scope.$watch("selectedMaterialType", function () {
      if (!$scope.isEditing) {
        $scope.RecordToEdit.ComID =
          $scope.selectedMaterialType &&
          $scope.selectedMaterialType.originalObject
            ? $scope.selectedMaterialType.originalObject.CommNameId
            : null;
        $scope.RecordToEdit.MaterialID =
          $scope.selectedMaterialType &&
          $scope.selectedMaterialType.originalObject
            ? $scope.selectedMaterialType.originalObject.SubstanceID
            : null;
        $scope.RecordToEdit.MaterialDescription =
          $scope.selectedMaterialType &&
          $scope.selectedMaterialType.originalObject
            ? $scope.selectedMaterialType.originalObject.ScientificNameEng
            : null;
        $scope.InvalidMaterialType = false;
      }
    });

    $scope.setMaterialType = function (row) {
      $scope.RecordToEdit.ComID = row.CommNameId;
      $scope.RecordToEdit.MaterialID = row.SubstanceID;
      $scope.RecordToEdit.MaterialDescription = row.ScientificNameEng;
      $scope.ConcatenatedMaterial =
        row.SubstanceID +
        "--" +
        row.ScientificNameEng +
        "--" +
        row.ScientificNameArb;
      $("#materialLookup").modal("hide");
    };

    $scope.editHazardous = function (hazardousMaterialModel) {
      clearObjects();
      $scope.savedSuccess = false;
      clearErrorMessages();
      $scope.isEditing = true;
      $scope.RecordToEdit = {
        Amount: hazardousMaterialModel.Amount,
        CenterCode: $stateParams.centerCode,
        ComID: hazardousMaterialModel.CommID,
        CompanyCode: null,
        CountryCode: hazardousMaterialModel.CountryCode,
        GoodsClasssification: hazardousMaterialModel.GoodsClassification,
        Gross: hazardousMaterialModel.Gross,
        HarmonizedCode: hazardousMaterialModel.HarmonizedDescription,
        JobNumber: $stateParams.jobNumber,
        MaterialDescription: hazardousMaterialModel.MaterialNameEng,
        MaterialID: hazardousMaterialModel.MaterialID,
        PermitNumber: hazardousMaterialModel.PermitNumber,
        SerialNumber: $stateParams.serial,
        UserCode: null,
        Weight: hazardousMaterialModel.Weight,
      };

      var selectedItem = $scope.invoiceData.filter((obj) => {
        return (
          obj.HarmonizedCode === hazardousMaterialModel.HarmonizedDescription
        );
      })[0];

      $scope.selectedHarmCodeObj.originalObject = selectedItem;

      $scope.ConcatenatedHarmonized =
        selectedItem.HarmonizeCodeShort +
        "--" +
        selectedItem.HarmonizeEngName +
        "--" +
        selectedItem.HarmonizeArbName;

      $scope.ConcatenatedMaterial =
        hazardousMaterialModel.MaterialID +
        "--" +
        hazardousMaterialModel.MaterialNameEng +
        "--" +
        hazardousMaterialModel.MaterialNameArb;
    };

    $scope.saveHazardousMaterial = function () {
      $scope.Message = "";
      $scope.RecordToEdit.CompanyCode = null;
      $scope.RecordToEdit.UserCode = null;
      $scope.RecordToEdit.CenterCode = $stateParams.centerCode;
      $scope.RecordToEdit.JobNumber = $stateParams.jobNumber;
      $scope.RecordToEdit.SerialNumber = $stateParams.serial;
      ValidateForm();
      if ($scope.isValid) {
        $("#loadingScreen").show();
        apiService.post(
          $scope.isEditing
            ? "Customs/Invoice/UpdateHazardousItem"
            : "Customs/Invoice/AddHazardousItem",
          "",
          $scope.RecordToEdit,
          function (result) {
            var response = result.data.ResponseResult;
            var msg = apiService.formatResponseMessage(response.Messages);
            $("#loadingScreen").hide();
            if (response.IsValid) {
              $scope.Message = $scope.isEditing ? "UpdateSuccess" : msg; //"SavedSuccess";
              $scope.GoToHazardousMaterial();
              //$("#successModal").modal("show");
            } else {
              showErrorMessage(msg);
            }
          },
          function error(response) {
            $("#loadingScreen").hide();
            console.log(response);
          }
        );
        //clearObjects();
      } else {
        $scope.Message = "CorrectErrors";
      }
    };

    var clearObjects = function () {
      $scope.RecordToEdit = {};
      $scope.selectedHarmCode = null;
      $scope.selectedHarmCodeObj = {};
      $scope.selectedMaterialTypeModel = null;
      $scope.selectedMaterialType = {};
      $scope.ConcatenatedMaterial = "";
    };

    $scope.openMaterialLookup = function () {
      $("#materialLookup").modal({
        backdrop: "static",
      });
      $("#searchText").focus();
      $scope.onMaterialTypeChange("");
    };

    $scope.PopulateHarmonizedLookup = function () {
      $scope.HarmonizedLookUpData = [];
      var flags = [],
        output = [],
        l = $scope.invoiceData.length,
        i;
      for (i = 0; i < l; i++) {
        if (flags[$scope.invoiceData[i].HarmonizedCode]) continue;
        flags[$scope.invoiceData[i].HarmonizedCode] = true;
        $scope.HarmonizedLookUpData.push($scope.invoiceData[i]);
      }
      angular.forEach($scope.HarmonizedLookUpData, function (key, value) {
        key.Code = key.HarmonizedCode;
        key.NameEnglish = key.HarmonizeEngName;
        key.NameArabic = key.HarmonizeArbName;
      });
    };

    function ValidateForm() {
      $scope.isValid = true;
      if (!$scope.RecordToEdit.PermitNumber) {
        $scope.PermitNumberRequired = true;
        $scope.isValid = false;
      } else {
        $scope.PermitNumberRequired = false;
      }

      if (!$scope.RecordToEdit.GoodsClasssification) {
        $scope.GoodsClassificationRequired = true;
        $scope.isValid = false;
      } else {
        $scope.GoodsClassificationRequired = false;
      }

      if (!$scope.isEditing) {
        if ($scope.RecordToEdit.MaterialID) {
          $scope.MaterialRequired = false;
        } else {
          $scope.MaterialRequired = true;
          $scope.isValid = false;
        }

        if ($scope.selectedHarmCode) {
          var selectedHarmCodeString =
            $scope.selectedHarmCodeObj &&
            $scope.selectedHarmCodeObj.originalObject
              ? $scope.selectedHarmCodeObj.originalObject.HarmonizeCodeShort +
                $scope.selectedHarmCodeObj.originalObject.HarmonizeEngName +
                $scope.selectedHarmCodeObj.originalObject.HarmonizeArbName
              : "";
          if (
            selectedHarmCodeString == 0 ||
            $scope.selectedHarmCode.replace(/\s/g, "") !=
              selectedHarmCodeString.replace(/\s/g, "")
          ) {
            $scope.InvalidHarmonizedCode = true;
            $scope.isValid = false;
          } else {
            $scope.InvalidHarmonizedCode = false;
          }
          $scope.HarmonizedCodeRequired = false;
        } else {
          $scope.HarmonizedCodeRequired = true;
          $scope.isValid = false;
        }
      }
    }

    $scope.$on("changeLanguage", function (event, args) {
      $scope.languageSelected = args.language;
    });

    //GenericLookup Methods
    $scope.setLookupData = function (row, lookupId) {
      switch (lookupId) {
        case "HarmonizedCode":
          $scope.selectedHarmCode =
            row.HarmonizeCodeShort.toString() +
            "     " +
            (row.HarmonizeEngName ? row.HarmonizeEngName : "") +
            "     " +
            (row.HarmonizeArbName ? row.HarmonizeArbName : "");
          $scope.selectedHarmCodeObj = {};
          $scope.selectedHarmCodeObj.originalObject = row;
          $("#harmonizedLookup_value").focus();
          break;
      }
      $("#genericLookUp").modal("hide");
    };

    $scope.populateLookupData = function (lookupId) {
      switch (lookupId) {
        case "HarmonizedCode":
          break;
      }
    };

    $scope.onLookupSearhChange = function () {
      var searchText = $("#searchLookupText").val().toLowerCase();
      switch ($scope.lookupId) {
        case "HarmonizedCode":
          $scope.lookUpCurrentPage = 1;
          if ($scope.HarmonizedLookUpData) {
            $scope.lookUpData = $scope.HarmonizedLookUpData.filter((obj) => {
              return (
                obj.HarmonizeCodeShort.toString()
                  .toLowerCase()
                  .includes(searchText) ||
                (obj.HarmonizeEngName &&
                  obj.HarmonizeEngName.toLowerCase().includes(searchText)) ||
                (obj.HarmonizeArbName &&
                  obj.HarmonizeArbName.toLowerCase().includes(searchText))
              );
            });
          }
          break;
      }
    };

    $scope.openLookup = function (lookupId) {
      $("#searchLookupText").val("");
      $scope.lookupId = lookupId;
      switch (lookupId) {
        case "HarmonizedCode":
          $scope.lookUpTitle = $filter("translate")("HarmonizedCode");
          $scope.lookUpHeaders = [
            { Text: "Code", Width: "100" },
            { Text: "English", Width: "" },
          ];
          $scope.lookUpData = $scope.HarmonizedLookUpData;
          break;
      }

      $scope.searchLookupTextModel = "";
      $("#genericLookUp").modal({
        backdrop: "static",
      });
      $("#searchLookupText").focus();
      $("#searchLookupText").select();
      //$scope.onLookupSearhChange(lookupId);
      $("#genericLookUp").off("keydown");
      $("#genericLookUp").bind("keydown", function (event) {
        $timeout(function () {
          switch (event.keyCode) {
            case 13:
              $scope.setLookupData(lookupId);
              break;
          }
        });
      });
      //Page was not resetting back to 1; so explicitly called 'setCurrentPage(1)'
      if (paginationService.isRegistered("lookUpPager")) {
        paginationService.setCurrentPage("lookUpPager", 1);
      }
      $scope.lookUpCurrentPage = 1;
    };

    $scope.lookupKeyDown = function (event, lookupId) {
      if (event.key == "F9") {
        $scope.openLookup(lookupId);
      }
    };

    $scope.GoToHazardousMaterial = function () {
      $storage.remove("materialItemData");
      $state.go("hazardousMaterials", {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        serial: $stateParams.serial,
        CountryCode: $stateParams.CountryCode,
      });
    };

    $scope.GoToMaterialMaster = function () {
      $state.go("materialsMaster", {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        serial: $stateParams.serial,
        CountryCode: $stateParams.CountryCode,
        hMaterialId: $stateParams.hMaterialId,
      });
    };

    $scope.init();
  },
]);
