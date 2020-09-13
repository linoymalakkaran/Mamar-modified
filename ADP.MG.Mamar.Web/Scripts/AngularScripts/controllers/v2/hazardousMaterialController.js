angular.module("mamarApp").controller("hazardousMaterialController", [
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
    paginationService
  ) {
    $scope.init = function () {
      $scope.$storage = $storage;
      $scope.languageSelected = $scope.language;
      $scope.hazardousMaterials = [];
      $scope.RecordToEdit = {};
      $scope.totalCount = 0;
      $scope.hazardousMaterialsRequestObject = {
        CenterCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        SerialNumber: $stateParams.serial,
        CountryCode: $stateParams.CountryCode,
      };
      $scope.PopulateData();
    };

    $scope.gotoInvoiceDetails = function () {
      $storage.remove("materialItemData");
      $state.go("shipmentAndInvoice", {
        transportMode: $stateParams.transportMode,
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        tab: "invoice",
      });
    };

    $scope.$on("changeLanguage", function (event, args) {
      $scope.languageSelected = args.language;
    });

    $scope.editHazardous = function (hazardousMaterialModel) {
      $storage.set("materialItemData", hazardousMaterialModel);
      $scope.GoToHazardousMaterialDetails(hazardousMaterialModel.MaterialID);
    };

    $scope.GoToHazardousMaterialDetails = function (hMaterialId) {
      $state.go("hazardousMaterialDetails", {
        centerCode: $stateParams.centerCode,
        jobNumber: $stateParams.jobNumber,
        serial: $stateParams.serial,
        CountryCode: $stateParams.CountryCode,
        hMaterialId: hMaterialId,
      });
    };

    $scope.PopulateData = function () {
      $("#loadingScreen").show();
      apiService.get(
        "Customs/Invoice/GetHazardousList",
        $scope.hazardousMaterialsRequestObject,
        function (results) {
          var responseData = results.data.ResponseResult;
          $scope.hazardousMaterials = responseData.Data;
          //$scope.totalCount = $scope.hazardousMaterials[0].TotalCount;
          $scope.ResponseMessage = responseData.Message;
          $("#loadingScreen").hide();
        },
        function error(response) {
          $("#loadingScreen").hide();
          console.log(response);
        }
      );
    };

    $scope.deleteHazardous = function (deletingRowData) {
      $("#ConfirmDeleteModalPopup").modal("show");
      $scope.deleteModelObject = {
        AdditionalInbfo: null,
        Amount: deletingRowData.Amount,
        CenterCode: $stateParams.centerCode,
        ComID: deletingRowData.CommID,
        CompanyCode: null,
        CountryCode: deletingRowData.CountryCode,
        GoodsClasssification: deletingRowData.GoodsClassification,
        Gross: deletingRowData.Gross,
        MaterialID: deletingRowData.MaterialID,
        MaterialDescription: "",
        HarmonizedCode: deletingRowData.HarmonizedCode,
        JobNumber: $stateParams.jobNumber,
        SerialNumber: $stateParams.serial,
        UserCode: null,
        Weight: deletingRowData.Weight,
        PermitNumber: deletingRowData.PermitNumber,
      };
    };

    $scope.deleteOkay = function () {
      $scope.deleteSuccess = false;
      $scope.deleteFailed = false;
      $("#ConfirmDeleteModalPopup").modal("hide");
      $("#loadingScreen").show();
      apiService.post(
        "Customs/Invoice/DeleteHazardousItem",
        "",
        $scope.deleteModelObject,
        function (result) {
          $("#loadingScreen").hide();
          var response = result.data.ResponseResult;
          var msg = apiService.formatResponseMessage(response.Messages);
          if (response.IsValid) {
            $scope.PopulateData();
            $("#successModal").modal("show");
          } else {
            modalErrorShow(msg);
          }
        },
        function (result) {
          $("#loadingScreen").hide();
          $scope.deleteFailed = false;
        }
      );
    };

    $scope.init();
  },
]);
