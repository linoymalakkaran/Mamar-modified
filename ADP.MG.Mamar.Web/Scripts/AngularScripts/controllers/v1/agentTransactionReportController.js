angular.module("mamarApp").controller("agentTransactionReportController", [
  "$scope",
  "$rootScope",
  "$http",
  "$state",
  "$stateParams",
  "$filter",
  "apiService",
  "$storage",
  "sharedModels",
  "$timeout",
  "$window",
  "Excel",
  function (
    $scope,
    $rootScope,
    $http,
    $state,
    $stateParams,
    $filter,
    apiService,
    $storage,
    sharedModels,
    $timeout,
    $window,
    Excel
  ) {
    $scope.init = function () {
      $scope.$storage = $storage;
      $scope.Importer = "";
      $scope.selectedCenterCode = "A";

      // Get Center Codes List based on transport mode
      $scope.transModes = [
        { key: "M", value: "Sea Cargo شحن بحري" },
        { key: "A", value: "Air Cargo شحن جوي" },
        { key: "R", value: "Land Cargo شحن بري" },
        { key: "Z", value: "Free Zone منطقة حرة" },
      ];

      $scope.selectedTransMode = $scope.transModes[0].key;
      $scope.centerCodelookUpParams = {
        transportMode: $scope.selectedTransMode,
        searchString: "",
      };

      $scope.searchParams = {
        centerCode: $scope.selectedCenterCode,
        fromDate: "",
        toDate: "",
        jobNumber: "",
        billNumber: "",
        billType: "",
        importerExporter: "",
        pageNumber: 1,
        pageSize: 10,
      };

      $scope.invalidFromDate = false;
      $scope.invalidToDate = false;
      $scope.getCenterCodes();
    };

    $scope.ImporterExporterChanged = function (searchStr) {
      if (searchStr) {
        apiService.get(
          "Customs/Lookup/ImporterExporter",
          {
            centerCode: $scope.selectedCenterCode,
            searchString: searchStr,
          },
          function (results) {
            console.log(results.data.ResponseResult.Data);
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

    var LoadLookupBillType = function () {
      var opt = {};
      opt.Code = "";
      opt.NameEnglish = "--Select--";
      opt.NameArabic = "--الشحن--";

      $scope.lkBillTypeParameter = {
        centerCode: $scope.selectedCenterCode,
        searchString: "",
      };

      getIndexData(
        "billTypes",
        $scope.selectedCenterCode,
        function (data) {
          $scope.lookupBillTpResult = data;

          if ($scope.lookupBillTpResult) {
            $scope.lookupBillTpResult.unshift(opt);
          }
        },
        function () {
          $("#loadingScreen").show();
          apiService.get(
            "Customs/Lookup/BillTypes",
            $scope.lkBillTypeParameter,
            function (results) {
              $("#loadingScreen").hide();
              $scope.lookupBillTpResult = angular.copy(
                results.data.ResponseResult.Data
              );
              storeData(
                results.data.ResponseResult.Data,
                "billTypes",
                $scope.selectedCenterCode
              );
              if ($scope.lookupBillTpResult) {
                $scope.lookupBillTpResult.unshift(opt);
              }
            },
            function error(response) {
              $("#loadingScreen").hide();
              console.log(response);
            }
          );
        }
      );
    };

    $scope.downloadActivityLogData = function () {
      $scope.searchParamsDownload = angular.copy($scope.searchParams);
      $scope.searchParamsDownload.pageSize = $scope.totalCount;
      $scope.searchParamsDownload.pageNumber = 1;
      apiService.get(
        "Customs/Job/AgentTransactionList",
        $scope.searchParamsDownload,
        function (result) {
          var response = result.data.ResponseResult;
          var msg = response.Messages
            ? apiService.formatResponseMessage(response.Messages)
            : "";
          if (response.IsValid) {
            $scope.clearingAgentTransactionCompleeteList = result.data
              .ResponseResult
              ? result.data.ResponseResult.Data
              : null;
          } else if (!response.IsValid) {
            msg = msg != "" ? msg : "Error!";
            console.log(msg);
            showErrorMessage(
              "Error while fetching the data... Please try again."
            );
          }
        },
        function (result) {
          console.log("An Error has occurred!");
          console.log(result);
        }
      );
    };

    $scope.exportToExcel = function () {
      alasql
        .promise(
          `SELECT 
        JobNumber as JOB_NUMBER,
        DODate as DO_DATE,
        BillDate as BILL_DATE,
        CUSTOMER as SHIPPER,
        ImporterCode as IMPORTER_CODE,
        ImporterDescEng as IMPORTER_DESCRIPTION_ENGLISH,
        ImporterDescArb as IMPORTER_DESCRIPTION_ARABIC,
        GoodsDescription as GOODS_DESCRIPTION,
        BillType as BILL_TYPE,
        BillNumber as BILL_NUMBER,
        BillYear as BILL_YEAR,
        DOCreatedUser as DO_CREATED_USER 
        INTO XLSX("AGENT_TRANSACTION_REPORT.xlsx",{headers:true}) FROM ?`,
          [$scope.clearingAgentTransactionCompleeteList]
        )
        .then(function (res) {
          console.log(res); // output depends on mydata.xls
        })
        .catch(function (err) {
          console.log("Does the file exists? there was an error:", err);
        });
    };

    $scope.getCenterCodes = function () {
      $("#loadingScreen").show();
      apiService.get(
        "Customs/Lookup/CenterCodes",
        $scope.centerCodelookUpParams,
        function (results) {
          $("#loadingScreen").hide();
          if (results.data.ResponseResult != "") {
            $scope.centerCodes = results.data.ResponseResult.Data;
            if ($scope.centerCodes) {
              var custManifestCenter = $storage.get("shortCustomCenterCode");
              var customCenterCode = custManifestCenter
                ? custManifestCenter[0].Code
                : "V";

              var selectedCenter = $filter("filter")(
                $scope.centerCodes,
                function (cenCode) {
                  return cenCode.Code == customCenterCode;
                }
              );
              $scope.selectedCenterCode =
                selectedCenter.length == 1
                  ? selectedCenter[0].Code
                  : $scope.centerCodes.length > 0
                  ? $scope.centerCodes[0].Code
                  : "";
              $scope.searchParams.centerCode = $scope.selectedCenterCode;
              $scope.onCenterCodeChanged();
            }
          } else {
            $("#loadingScreen").hide();
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

    // on transport mode changed
    $scope.onModeChanged = function () {
      $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
      $scope.getCenterCodes();
      $scope.resetSearchFilters();
    };

    // on center code changed
    $scope.onCenterCodeChanged = function () {
      $scope.searchParams.centerCode = $scope.selectedCenterCode;
      if ($scope.searchParams.centerCode) {
        LoadLookupBillType();
        $scope.resetSearchFilters();
      } else {
        $timeout(function () {
          LoadLookupBillType();
          $scope.resetSearchFilters();
        });
      }
    };

    // Get Search Results
    $scope.getSearchResult = function () {
      $scope.invalidFromDate = false;
      $scope.invalidToDate = false;
      $scope.invalidStartToDate = false;
      $scope.searchParams.pageNumber = 1;

      $scope.invalidFromDate = $scope.searchParams.fromDate ? false : true;
      $scope.invalidToDate = $scope.searchParams.toDate ? false : true;

      // var selectedImporter =
      //   $scope.Importer &&
      //   $scope.selectedImporterExporterCode &&
      //   $scope.selectedImporterExporterCode.originalObject
      //     ? $scope.selectedImporterExporterCode.originalObject.Code +
      //       $scope.selectedImporterExporterCode.originalObject.EnglishName +
      //       $scope.selectedImporterExporterCode.originalObject.ArabicName
      //     : "";
      // if (
      //   $scope.Importer.replace(/\s/g, "") !=
      //   selectedImporter.replace(/\s/g, "")
      // ) {
      //   $scope.invalidImporter = true;
      // }

      if (
        $scope.searchParams.fromDate &&
        $scope.searchParams.toDate &&
        $scope.searchParams.toDate < $scope.searchParams.fromDate
      ) {
        $scope.invalidStartToDate = true;
      }

      if (
        $scope.invalidFromDate ||
        $scope.invalidToDate ||
        $scope.invalidStartToDate
      ) {
        return;
      } else {
        getClearingAgentTransactionList();
      }
    };

    // Reset Search Filters
    $scope.resetSearchFilters = function () {
      $scope.invalidFromDate = false;
      $scope.invalidToDate = false;

      //reset date pickers to current date
      var date = new Date();
      $("input.pickadate").each(function(){
        let picker = $(this).pickadate("picker");
        picker.set("select", date);
      });

      $scope.searchParams = {
        centerCode: $scope.selectedCenterCode,
        fromDate: "",
        toDate: "",
        jobNumber: "",
        billNumber: "",
        billType: "",
        importerExporter: "",
        pageNumber: 1,
        pageSize: 10,
      };

      $scope.clearingAgentTransactionList = null;
      $scope.clearingAgentTransactionCompleeteList = null;
      $scope.Importer = "";
      $scope.selectedImporterExporterCode = {};
    };

    $scope.getImporterExporterCode = function () {
      if (
        $scope.selectedImporterExporterCode &&
        $scope.selectedImporterExporterCode.originalObject &&
        $scope.selectedImporterExporterCode.originalObject.Code
      ) {
        return $scope.selectedImporterExporterCode.originalObject.Code;
      } else {
        return null;
      }
    };

    // Get Clearing Agent transaction List
    function getClearingAgentTransactionList() {
      $scope.searchParams.importerExporter = $scope.getImporterExporterCode();
      $("#loadingScreen").show();
      apiService.get(
        "Customs/Job/AgentTransactionList",
        $scope.searchParams,
        function (result) {
          $("#loadingScreen").hide();
          var response = result.data.ResponseResult;
          var msg = response.Messages
            ? apiService.formatResponseMessage(response.Messages)
            : "";
          if (response.IsValid) {
            $scope.clearingAgentTransactionList = result.data.ResponseResult
              ? result.data.ResponseResult.Data
              : null;
            $scope.totalCount = $scope.clearingAgentTransactionList
              ? $scope.clearingAgentTransactionList[0].TotalCount
              : null;
            if ($scope.totalCount > $scope.searchParams.pageSize) {
              $scope.downloadActivityLogData();
            } else {
              $scope.clearingAgentTransactionCompleeteList =
                $scope.clearingAgentTransactionList;
            }
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
    }

    // load More Records
    $scope.loadMoreRecords = function (newPageNo) {
      if ($scope.searchParams.fromDate && $scope.searchParams.toDate) {
        $scope.searchParams.pageNumber = newPageNo;
        getClearingAgentTransactionList();
      }
    };

    $scope.init();
  },
]);
