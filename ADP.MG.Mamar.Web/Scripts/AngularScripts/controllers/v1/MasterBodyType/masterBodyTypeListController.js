angular.module("mamarApp").controller("masterBodyTypeListController", [
  "$scope",
  "$rootScope",
  "$state",
  "$stateParams",
  "$filter",
  "apiService",
  "$uibModal",
  "sharedModels",
  "userAccountStorageFactory",
  "$log",
  "$storage",
  "$timeout",
  function (
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $filter,
    apiService,
    $uibModal,
    sharedModels,
    userAccountStorageFactory,
    $log,
    $storage,
    $timeout
  ) {
    //#region initialisation
    $scope.init = () => {
      $scope.$storage = $storage;
      $scope.transModes = apiService.getTransportModeList();
      $scope.selectedTransMode = $scope.transModes
        ? $scope.transModes[0].key
        : "";

      $scope.centerCodelookUpParams = {
        transportMode: $scope.selectedTransMode,
        searchString: "",
      };

      $scope.onModeChanged();
      initialiseSearch();
      $scope.clearSubBodyTypeSearchFilters();
      $scope.selectedRow = null;
    };

    $scope.BodyTypeSelected = function (index, row) {
      $scope.selectedRowIndex = index;
      $scope.selectedRow = row;
      $scope.clearSubBodyTypeSearchFilters();
      $scope.getBodySubTypeListBySearch();
    };

    $scope.clearSubBodyTypeSearchFilters = () => {
      $scope.searchSubParameter = {
        centerCode: $scope.selectedCenterCode,
        code: $scope.selectedRow ? $scope.selectedRow.Code : null,
        subCode: null,
        descEng: null,
        descArb: null,
        categoryCode: null,
        pageNumber: 1,
        pageSize: 10,
      };
      if (
        $scope.selectedCenterCode &&
        $scope.selectedRow &&
        $scope.selectedRow.Code
      ) {
        $scope.getBodySubTypeListBySearch();
      }
    };

    // Get Clearing Agent transaction List
    $scope.getBodySubTypeListBySearch = function () {
      if (!$scope.selectedRow) {
        showErrorMessage("Please select vehicle type first and try again...!");
        return false;
      }
      $scope.searchSubParameter.centerCode = $scope.selectedCenterCode;
      $scope.searchSubParameter.code = $scope.selectedRow.Code;
      //$scope.searchSubParameter.pageNumber =1;
      $("#loadingScreen").show();
      apiService.get(
        "Customs/MasterSearch/BodySubType",
        $scope.searchSubParameter,
        function (result) {
          $("#loadingScreen").hide();
          var response = result.data.ResponseResult;
          var msg = response.Messages
            ? apiService.formatResponseMessage(response.Messages)
            : "";
          if (response.IsValid) {
            $scope.subBodyTypeList = result.data.ResponseResult
              ? result.data.ResponseResult.Data
              : null;
            $scope.totalSubBodyTypeCount = $scope.subBodyTypeList
              ? $scope.subBodyTypeList[0].Total
              : null;
          } else if (!response.IsValid) {
            msg = msg != "" ? msg : "Error!";
            showErrorMessage(
              "Error while fetching the data...! Please try again."
            );
          }
        },
        function (result) {
          $("#loadingScreen").hide();
          console.log("An Error has occurred!");
          console.log(result);
        }
      );
    };

    $scope.loadMoreSubBodyTypeRecords = function (newpageNum) {
      $scope.searchSubParameter.pageNumber = newpageNum;
      $scope.getBodySubTypeListBySearch();
    };

    function initialiseSearch() {
      $scope.isValid = true;
      $scope.importer = "";
      $scope.searchParameter = {
        centerCode: $scope.selectedCenterCode,
        importerCode: "",
        code: "",
        descEng: "",
        descArb: "",
        agentCode: "",
        pageNumber: 1,
        pageSize: 10,
        };
       
    }

    $scope.clearSearchFilters = () => {
        initialiseSearch();
      $scope.searchParameter.pageNumber = 1;
      $scope.getBodyTypeListBySearch();
        
    };
    //#endregion

    //#region Lookup Methods
    //GET CENTER CODES
    $scope.getCenterCodes = () => {
      $("#loadingScreen").show();
      apiService.get(
        "Customs/Lookup/CenterCodes",
        $scope.centerCodelookUpParams,
        function (results) {
          $("#loadingScreen").hide();
          if (results.data.ResponseResult != "") {
            $scope.centerCodes = results.data.ResponseResult.Data;
            if ($scope.centerCodes) {
              var selectedCenter = $filter("filter")(
                $scope.centerCodes,
                function (cenCode) {
                  return cenCode.Code == "V";
                }
              );
              $scope.selectedCenterCode =
                selectedCenter.length == 1
                  ? selectedCenter[0].Code
                  : $scope.centerCodes.length > 0
                  ? $scope.centerCodes[0].Code
                  : "";

              $scope.onCenterCodeChanged();
            }
          }
        },
        function error(response) {
          $("#loadingScreen").hide();
          console.log(
            "something went wrong in LoadLookupCentreCodes" + response
          );
        }
      );
    };

    //importer lookup
    $scope.ImporterExporterChanged = function (searchStr) {
      if (searchStr) {
        apiService.get(
          "Customs/Lookup/ImporterExporter",
          {
            centerCode: $scope.selectedCenterCode,
            searchString: searchStr,
          },
          function (results) {
            $scope.importersExporters = results.data.ResponseResult.Data;
          },
          function error(response) {
            console.log(
              "An Error has occurred while getting lookup Data of Importer Exporter!"
            );
          }
        );
      }
    };
    //#endregion

    //#region Methods
    function validateSearch() {
      $scope.isValid = true;
      $scope.invalidImporter = false;
      var importerSelected = $scope.selectedImporterExporterCode
        ? $scope.selectedImporterExporterCode.originalObject.Code +
          $scope.selectedImporterExporterCode.originalObject.EnglishName +
          ($scope.selectedImporterExporterCode.originalObject.ArabicName
            ? $scope.selectedImporterExporterCode.originalObject.ArabicName
            : "")
        : "";
      if (
        $scope.importer &&
        (importerSelected == 0 ||
          $scope.importer.replace(/\s/g, "") !=
            importerSelected.replace(/\s/g, ""))
      ) {
        $scope.invalidImporter = true;
        $scope.isValid = false;
      }
      if (!$scope.invalidImporter)
        $scope.searchParameter.importerCode = $scope.selectedImporterExporterCode
          ? $scope.selectedImporterExporterCode.originalObject.Code
          : "";
    }

    $scope.getBodyTypeListBySearch = () => {
      //validateSearch();
      //if ($scope.isValid) {
      //$scope.bodyTypeList = null;
      //$scope.totalCount = 0;
      //$scope.searchParameter.pageSize = 1;
      $("#loadingScreen").show();
      apiService.get(
        "Customs/MasterSearch/BodyType",
        $scope.searchParameter,
        function (results) {
          $("#loadingScreen").hide();
          if (results && results.data && results.data.ResponseResult) {
            $scope.bodyTypeList = results.data.ResponseResult
              ? results.data.ResponseResult.Data
              : "";
            $scope.totalCount = $scope.bodyTypeList
              ? $scope.bodyTypeList[0].Total
              : 0;
            $scope.clearSubBodyTypeData();
          } else {
            modalErrorShow(
              result && result.Messages
                ? apiService.formatResponseMessage(result.Messages)
                : "No Records found!"
            );
          }
        },
        function error(response) {
          $("#loadingScreen").hide();
          console.log(response);
        }
      );
      //}
    };

    $scope.clearSubBodyTypeData = function () {
      $scope.subBodyTypeList = null;
      $scope.selectedRow = null;
      $scope.selectedRowIndex = null;
      $scope.clearSubBodyTypeSearchFilters();
    };

    $scope.loadMoreRecords = function (newPageNo) {
      $scope.searchParameter.pageNumber = newPageNo;
      $scope.selectedRow = null;
      $scope.selectedRowIndex = null;
      $scope.getBodyTypeListBySearch();
    };

    //#endregion

    //#region Navigation
    $scope.gotoLCDetails = () => {
      var selectedCenter = $filter("filter")($scope.centerCodes, function (
        cenCode
      ) {
        return cenCode.Code == $scope.selectedCenterCode;
      });
      var selectedCenterCodeDetails =
        selectedCenter && selectedCenter.length > 0
          ? selectedCenter[0].Code +
            " " +
            selectedCenter[0].EnglishName +
            " " +
            selectedCenter[0].ArabicName
          : "";
      $storage.set("LCCenterCode", selectedCenterCodeDetails);
      $state.go("lcDetails", { centerCode: $scope.selectedCenterCode });
    };
    //#endregion

    //#region on change event
    $scope.onModeChanged = function () {
      $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
      $scope.selectedMode = $scope.selectedTransMode;
      $scope.getCenterCodes();
      $scope.bodyTypeList = null;
    };

    $scope.onCenterCodeChanged = function () {
      initialiseSearch();
      $scope.searchParameter.centerCode = $scope.selectedCenterCode;
      $scope.bodyTypeList = null;
      $scope.clearSubBodyTypeData();
    };
    //#endregion

    $scope.init();
  },
]);
