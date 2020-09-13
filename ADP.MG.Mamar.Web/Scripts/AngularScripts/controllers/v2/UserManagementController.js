angular.module("mamarApp").controller("UserManagementController", [
  "$scope",
  "$rootScope",
  "$state",
  "$stateParams",
  "$filter",
  "apiService",
  "$storage",
  "$uibModal",
  "userAccountStorageFactory",
  "$timeout",
  "$anchorScroll",
  "$location",
  function (
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $filter,
    apiService,
    $storage,
    $uibModal,
    userAccountStorageFactory,
    $timeout,
    $anchorScroll,
    $location
  ) {
    $scope.$storage = $storage;
    $scope.centerCodeShipment = $stateParams.centerCode;
    $scope.jobNoShipment = $stateParams.jobNumber;

    $scope.pageNumber = 1;
    $scope.pageSize = 10;
    $scope.parameters = {
      centerCode: $scope.centerCodeShipment,
      pageNumber: 1,
      pageSize: 10,
      jobNumber: $scope.jobNoShipment,
      searchString: "",
    };
    $scope.IsHideDetails = true;

    $scope.CancelDetails = () => {
      $scope.IsHideDetails = true;
      clear();
      $scope.selectedclients = [];
    };
    //$("#UnRegisterUser").focus();
    //$anchorScroll.yOffset = -950;

    $scope.AddNewUser = () => {
      $scope.IsHideDetails = false;
      $scope.IsDisableForm = false;
      $scope.selectedclients = [];
      clear();
      $scope.getUserAccountInfo();
      $scope.IsEnable = false;
      //$("#UnRegisterUser").focus();
      //$anchorScroll.yOffset = -950;
      $scope.GenderSelected = {
        course: "Female",
      };
      $scope.SaveParameters.Status = true;
      //sdocument.getElementById('MTransDetails').scrollIntoView();
    };

    $scope.setClickedRow = function (mySelectedItems) {
      debugger;
      $scope.getUserAccountInfo(mySelectedItems);
    };

    AssigningValue = (mySelectedItems) => {
      debugger;
      $scope.IsHideDetails = false;
      if (!apiService.isNullOrEmptyOrUndefined(mySelectedItems)) {
        var Sgender = mySelectedItems.Gender.toUpperCase();

        $scope.selectedRowNum = mySelectedItems.RowNumber;
        $scope.selectedDO = mySelectedItems.DONumber;
        $scope.selectedDORecord = mySelectedItems;
        if (Sgender == "MALE") {
          $scope.GenderSelected = {
            course: "Male",
          };
        } else if (Sgender == "FEMALE") {
          $scope.GenderSelected = {
            course: "Female",
          };
        }

        $scope.SaveParameters.FirstName = mySelectedItems.FName;
        $scope.SaveParameters.LastName = mySelectedItems.LName;
        $scope.SaveParameters.MobileNo = mySelectedItems.MobileNumber;
        $scope.SaveParameters.Phone = mySelectedItems.PhoneNumber;
        $scope.SaveParameters.Email = mySelectedItems.Email;

        $scope.SaveParameters.UseroId = mySelectedItems.UseroId;

        if (mySelectedItems.Status && mySelectedItems.Status == "Active") {
          $scope.SaveParameters.Status = true;
        } else {
          $scope.SaveParameters.Status = false;
        }
        $scope.SaveParameters.UserName = mySelectedItems.UserName;
        $scope.IsEnable = true;
        //
      } else {
        $scope.selectedDORecord = {};
      }
      var Cacahe = JSON.parse(localStorage.getItem("userAccountDetails"));
      if (
        mySelectedItems &&
        Cacahe.userCode
          .toUpperCase()
          .contains(mySelectedItems.UserName.toUpperCase())
      ) {
        $scope.IsDisableForm = true;
        $scope.IsEnable = false;
      } else {
        $scope.IsDisableForm = false;
      }
    };
    //#region Get/Load menthod during page load.
    $scope.GetRegisterUserList = function () {
      $("#loadingScreen").show();
      apiService.get(
        "Customs/Job/GetAccountInfo",
        $scope.parameters,
        function (results) {
          //debugger;
          $scope.chassisList = results.data.ResponseResult.Data;
          $("#loadingScreen").hide();
          if ($scope.chassisList != null && $scope.chassisList.length > 0) {
            $scope.totalCount = $scope.chassisList[0].TotalCount;
          }
        },
        function error(response) {
          //console.log('something went wrong in GetChassisList' + response);
          $("#loadingScreen").hide();
        }
      );
    };
    $scope.getUserAccountInfo = function (mySelectedItems) {
      if (!apiService.isNullOrEmptyOrUndefined(mySelectedItems)) {
        $scope.searchParams = {
          userName: mySelectedItems.UserName,
        };
      }
      let counter = 0;
      $("#loadingScreen").show();
      debugger;
      apiService.get(
        "Customs/Job/GetAccountInfo",
        $scope.searchParams,
        function (results) {
          var data = ($scope.userAccntDetails = results.data.ResponseResult);
          if (data != null) {
            $scope.MaqtaListedUser = data.users;

            $scope.MaqtaListedUser.map((item) => {
              if (item.Status == true) {
                item.Status = "Active";
              } else {
                item.Status = "InActive";
              }
            });
            $scope.totalCount = data.users.length;

            $scope.availableclients = ConvertStringToObject(
              data.unRegisteredAccounts
            );

            $location.hash("UnRegisterUser");
            $anchorScroll();
            if (!apiService.isNullOrEmptyOrUndefined(data.userAccounts)) {
              $scope.selectedclients = ConvertStringToObject(data.userAccounts);
              AssigningValue(mySelectedItems);
            }
            $("#loadingScreen").hide();
            //if (data && data.accounts != null && data.accounts.length > 0)
            //{
            //    $scope.MaqtaListedUser = data.users;
            //    $scope.totalCount = data.users.length;

            //    $scope.availableclients=ConvertStringToObject(data.unRegisteredAccounts);

            //    $location.hash('UnRegisterUser');
            //    $anchorScroll();
            //    if (!apiService.isNullOrEmptyOrUndefined(data.userAccounts))
            //    {
            //        $scope.selectedclients = ConvertStringToObject(data.userAccounts);
            //        AssigningValue(mySelectedItems);
            //    }
            //    $("#loadingScreen").hide();
            //}
            //else
            //{
            //    //if (data.profiles.split(',').includes('CUSTINT')) {
            //    //    window.location = $Url.resolve('~/Home/GMSDashboard');
            //    //}
            //    //else {
            //    //    modalErrorShow("Not an authorized user");
            //    //}
            //
            //}
          } else {
            modalErrorShow("No Data Found!");
            $("#loadingScreen").hide();
          }
        },
        function error(response) {
          modalErrorShow(response);
          console.log(response);
          $("#loadingScreen").hide();
        }
      );
    };

    $scope.GetSearchResult = function () {
      $scope.chassisList = {};
      $scope.pageNumber = 1;
      $scope.deleteSuccess = false;
      $scope.deleteFailed = false;
      $scope.GetChassisList();
    };
    // load More Records
    $scope.loadMoreRecords = function (newPageNo) {
      $scope.pageNumber = newPageNo;
      $scope.getUserAccountInfo();
    };

    $scope.init = () => {
      $scope.SaveParameters = {
        FirstName: "",
        LastName: "",
        Email: "",
        MobileNo: "",
        Phone: "",
        Gender: "",
      };

      var apiUrl = document.getElementById("apiurl").innerText;
      console.log(apiUrl);

      $scope.GenderSelected = "";
      $scope.getUserAccountInfo();
      $scope.searchParams = {
        userName: "",
      };
      $("#UserAccountDetailsCode").hide();
    };

    clear = () => {
      $scope.SaveParameters = {
        FirstName: "",
        LastName: "",
        Email: "",
        MobileNo: "",
        Phone: "",
        Gender: "",
      };
      $scope.GenderSelected.course = "";
      $scope.searchParams.userName = "";
    };
    $scope.init();

    $scope.RadioChange = function (s) {
      debugger;
      $scope.GenderSelected = {
        course: s,
      };
    };
    $scope.selectedRow = null; // initialize our variable to null
    $scope.setClickedRowColor = function (index, mySelectedItems) {
      //function that sets the value of selectedRow to current index
      $scope.selectedRow = index;
      $scope.getUserAccountInfo(mySelectedItems);
    };
    //Save
    $scope.SaveUserInformation = function () {
      var apiUrl = document.getElementById("apiurl").innerText;
      if (!$scope.SaveParameters.FirstName) {
        modalErrorShow("Please enter FirstName");
        return;
      } else if (!$scope.SaveParameters.LastName) {
        modalErrorShow("Please enter LastName");
        return;
      } else if (!$scope.SaveParameters.Email) {
        modalErrorShow("Please enter Email");
        return;
      }
      //  //ValidateFreeText
      else if (
        $scope.SaveParameters.FirstName &&
        !ValidateFreeText($scope.SaveParameters.FirstName)
      ) {
        modalErrorShow("Special Characters are not allow  in FirstName");
        return;
      } else if (
        $scope.SaveParameters.LastName &&
        !ValidateFreeText($scope.SaveParameters.LastName)
      ) {
        modalErrorShow("Special Characters are not allow  in LastName");
        return;
      }
      //else if (!$scope.GenderSelected.course) {
      //    modalErrorShow("Please select Gender");
      //    return;
      //}

      if ($scope.SaveParameters.Status == true) {
        if ($scope.selectedclients.length == 0) {
          modalErrorShow("Please select Company!");
          return;
        }
      }

      if (
        $scope.SaveParameters.Email &&
        !ValidateEmail($scope.SaveParameters.Email)
      ) {
        modalErrorShow("Email Format Incorrect !");
        return;
      }

      $("#loadingScreen").show();

      // var link = window.location.host + '/Account/UserIndex#/setUserCredentials';
      //console.log(EmailURL());
      $scope.NewUser = {
        FName: $scope.SaveParameters.FirstName,
        LName: $scope.SaveParameters.LastName,
        Email: $scope.SaveParameters.Email,
        MobileNumber: $scope.SaveParameters.MobileNo,
        PhoneNumber: $scope.SaveParameters.Phone,
        Gender: null, //$scope.GenderSelected.course
        Status: !$scope.SaveParameters.Status
          ? false
          : $scope.SaveParameters.Status,
        UseroId: !$scope.SaveParameters.UseroId
          ? null
          : $scope.SaveParameters.UseroId,
        UserName: !$scope.SaveParameters.UserName
          ? null
          : $scope.SaveParameters.UserName,
        Accounts: ConvertToString($scope.selectedclients),
        CredentialLink: apiUrl + "/account/userindex#",
      };
      $scope.searchParams.userName = "";
      console.log(JSON.stringify($scope.NewUser));
      apiService.post(
        "Customs/Job/RegisterUser",
        "",
        $scope.NewUser,
        function (result) {
          $("#loadingScreen").hide();
          var response = result.data.ResponseResult;
          if (response.IsValid) {
            $("#successModal").modal("show");
            console.log(response);
            clear();
            $scope.IsHideDetails = true;
            $scope.availableclients = [];
            $scope.getUserAccountInfo();
          } else if (!response.IsValid) {
            modalErrorShow(response.Message);
          }
        },
        function (result) {
          $("#loadingScreen").hide();
          //console.log("An Error has occurred while creating chassis job!" + result);
          modalErrorShow(result);
        }
      );
    };

    //#region
    // START MOVEABLE MULTIPLE SELECTION BOX

    function ValidateFreeText(input) {
      var isValid = false;
      var regex = /^[a-zA-Z0-9\s]*$/;
      isValid = regex.test(input);
      return isValid;
    }
    function EmailURL() {
      debugger;
      let url = window.location.host;
      let filePath = "/account/userindex#";
      var pathInformation = window.location.pathname.split("Mamar"); //pathname.split('Mamar');
      if (pathInformation.length == 1) {
        // Local
        url += "/account/userindex#";
      } else if (pathInformation.length == 3) {
        // QA

        url += "/MamarPh2/Mamar" + "/account/userindex#";
      } else if (pathInformation.length == 2) {
        // STAGING
        url += "/Mamar" + "/account/userindex#";
      }
      return url;
    }

    ValidateEmail = (mail) => {
      debugger;
      if (!apiService.isNullOrEmptyOrUndefined(mail)) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
          return true;
        }
      }
      return false;
    };
    ConvertStringToObject = (data) => {
      let counter = 0;
      var infor = [];
      data.map((item) => {
        let weather = {
          id: counter,
          name: item,
        };
        if (!apiService.isNullOrEmptyOrUndefined(weather.name)) {
          infor.push(Object.assign(weather));
          counter++;
        }
      });
      return infor;
    };
    ConvertToString = (data) => {
      let counter = 0;
      $scope.ListRegister = [];
      debugger;
      data.map((item) => {
        let weather = {
          id: counter,
          name: item,
        };
        if (!apiService.isNullOrEmptyOrUndefined(weather.name.name)) {
          $scope.ListRegister.push(weather.name.name);
        }
      });
      return $scope.ListRegister;
    };

    $scope.available = [];
    $scope.selected = [];

    $scope.moveItem = function (items, from, to, Action) {
      angular.forEach(items, function (item) {
        if (!Action.contains("Remove")) {
          var companyCode = item.name.split("-")[0].trim();
          var data = to.filter((t) => t.name.contains(companyCode));
          var idx = from.indexOf(item);
          if (data.length == 0) {
            from.splice(idx, 1);
            to.push(item);
          } else {
            modalErrorShow(
              "Add operation is not allowed since New Mamar user cannot  be mapped to multiple clearing agent codes"
            );
          }
        } else {
          var idx = from.indexOf(item);
          from.splice(idx, 1);
          to.push(item);
        }
      });

      // clear selection
      $scope.available = "";
      $scope.selected = "";
    };

    $scope.$on("$destroy", function handler() {
      $("#UserAccountDetailsCode").show();
    });

    $scope.moveAll = function (from, to) {
      angular.forEach(from, function (item) {
        to.push(item);
      });
      from.length = 0;
    };

    $scope.selectedclients = [];
    $scope.availableclients = [];

    //// Link Customs Account
    $scope.openLinkCustomsAccountWindow = () => {
      clear();
      $scope.selectedRow = {};
      $scope.IsHideDetails = true;
      $scope.SaveParameters = {};
      $scope.submitted = false;
      $scope.isValid = true;
      $scope.customsCompanyCode = $scope.customsPassword = "";
      $scope.invalidCredentials = false;
      $scope.serverError = false;
      $("#customsMappingModal").modal({
        backdrop: "static",
      });
    };

    $scope.closeModalPopUp = () => {
      $("#customsMappingModal").modal("hide");
    };

    $scope.linkCustomsAccount = () => {
      $scope.invalidCredentials = false;
      $scope.serverError = false;
      $scope.isValid =
        $scope.customsCompanyCode && $scope.customsPassword ? true : false;
      if ($scope.isValid) {
        var customAccount = {
          accountName: $scope.customsCompanyCode.toUpperCase(),
          password: $scope.customsPassword,
        };
        $("#loadingScreen").show();
        debugger;
        apiService.postAccount(
          "Customs/Job/LinkCustomAccount",
          "",
          customAccount,
          function (result) {
            debugger;
            $("#loadingScreen").hide();
            var response = result.data.ResponseResult;
            if (response.IsValid) {
              $scope.customsCompanyCode = $scope.customsPassword = "";
              $("#successModal").modal("show");
              $("#customsMappingModal").modal("hide");
              $scope.getUserAccountInfo();
            } else {
              $scope.invalidCredentials = true;
            }
          },
          function error(response) {
            $("#loadingScreen").hide();
            $scope.serverError = true;
            $scope.serverErrorMessage = $filter("translate")(
              response.statusText
            );
          }
        );
      }
    };
    //// End Link Customs Account
  },
]);
