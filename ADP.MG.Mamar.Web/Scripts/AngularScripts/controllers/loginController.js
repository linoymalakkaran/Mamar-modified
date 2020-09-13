angular.module("mamarApp").controller("LoginController", [
    "$scope",
    "$rootScope",
    "$http",
    "$state",
    "$stateParams",
    "apiService",
    "$storage",
    "$filter",
    "userAccountStorageFactory",
    function (
        $scope,
        $rootScope,
        $http,
        $state,
        $stateParams,
        apiService,
        $storage,
        $filter,
        userAccountStorageFactory
    ) {
        localStorage.clear(); //Clear all local storage
        deleteIndexDB(); //deleting old mamar indexdb
        createIndexDB();
        $scope.$storage = $storage;
        $scope.user = { UserName: "", Password: "", RememberMe: false };
        $scope.isValidUserName = $scope.isValidPassword = $scope.isValidUser = true;
        $scope.errRequiredUsername = $scope.errRequiredPassword = "";
        $scope.userAccntDetails = {};

        // validate username & password - required fields
        $scope.validateUser = function () {
            $scope.isValidUserName = apiService.isNullOrEmptyOrUndefined(
                $scope.user.UserName
            )
                ? false
                : true;
            $scope.isValidPassword = apiService.isNullOrEmptyOrUndefined(
                $scope.user.Password
            )
                ? false
                : true;
        };

        // reset error
        $scope.resetErrors = function () {
            $scope.authError = $scope.errRequiredUsername = $scope.errRequiredPassword =
                "";
        };
        function getCookie(name) {
            // Split cookie string and get all individual name=value pairs in an array
            var cookieArr = document.cookie.split(";");
            // Loop through the array elements
            for (var i = 0; i < cookieArr.length; i++) {
                var cookiePair = cookieArr[i].split("=");
                /* Removing whitespace at the beginning of the cookie name and compare it with the given string */
                if (name === cookiePair[0].trim()) {
                    // Decode the cookie value and return
                    return decodeURIComponent(cookiePair[1]);
                }
            } // Return null if not found
            return null;
        }
        // login click
        $scope.login = function () {
            $scope.validateUser();
            if ($scope.isValidUserName && $scope.isValidPassword) {
                $scope.loading = true;
                $scope.authError = "";
                var apiUrl = document.getElementById("apiurl").value;
                var mgSurveyApiURL = document.getElementById("mgSurveyApiurl").value;
                var mgSurveyAppName = document.getElementById("mgSurveyAppName").value;
                var mgSurveyAppKey = document.getElementById("mgSurveyAppKey").value;

                var header = { withCredentials: true };
                $http
                    .post(apiUrl + "api/token/SetAuthCookie", $scope.user, header)
                    .then(
                        function (response) {
                            $scope.user.Token = response.data;
                            var expiry = new Date();
                            expiry.setMinutes(expiry.getMinutes() + 30);
                            var reqObject = $storage.get("reqObject");
                            var redirectUrl =
                                reqObject && reqObject.RedirectUrl ? reqObject.RedirectUrl : "";
                            $storage.set("reqObject", {
                                ApiUrl: apiUrl,
                                MGSurveyApiUrl: mgSurveyApiURL,
                                MGSurveyAppName: mgSurveyAppName,
                                MGSurveyAppKey: mgSurveyAppKey,
                                Expiry: expiry,
                                RedirectUrl: ""
                            });

                            $http.post($Url.resolve("~/Account/Login"), $scope.user).then(
                                function (response) {
                                    //$scope.loading = false;
                                    if (
                                        !response.data.Success &&
                                        response.data.Message == "INVALIDUSER"
                                    ) {
                                        $scope.loading = false;
                                        $scope.isValidUser = false;
                                        console.log("NOT SUCCESS - " + response.data.Success);
                                        $scope.authError = "Invalid Username or Password !"; //$filter('translate')('ErrInvalidUser');
                                    } else {
                                        //$scope.loading = false;
                                        console.log("SUCCESS - " + response.data.Success);
                                        var reqObject = $storage.get("reqObject");
                                        // reqObject.Token = response.data.Token;
                                        $storage.set("reqObject", reqObject);
                                        $scope.getUserAccountInfo(redirectUrl);
                                    }
                                },
                                function (x) {
                                    $scope.loading = false;
                                    console.log(x.data);
                                }
                            );
                        },
                        function (x) {
                            $scope.loading = false;
                            if ((x.status = "401")) {
                                $scope.isValidUser = false;
                                $scope.authError = "Invalid Username or Password !"; //$filter('translate')('ErrInvalidUser');
                            }
                        }
                    );
            } else {
                $scope.errRequiredUsername = !$scope.isValidUserName
                    ? "Username is required !"
                    : "";
                $scope.errRequiredPassword = !$scope.isValidPassword
                    ? "Password is required !"
                    : "";
                return false;
            }
        };

        function autoLogin() {
            // var isAutoLogin = getCookie("loggedIn");
            var username = document.getElementById("username").value;
            if (username !== undefined && username !== null && username.length > 0) {
                // hide login form ui
                var loginPageContent = document.getElementById("loginPageContent");
                if (loginPageContent !== undefined && loginPageContent !== null) {
                    loginPageContent.style.display = "none";
                }
                $scope.authError = "";
                var apiUrl = document.getElementById("apiurl").value;
                var expiry = new Date();
                expiry.setMinutes(expiry.getMinutes() + 30);
                var reqObject = $storage.get("reqObject");
                var redirectUrl =
                    reqObject && reqObject.RedirectUrl ? reqObject.RedirectUrl : "";
                $storage.set("reqObject", {
                    ApiUrl: apiUrl,
                    Expiry: expiry,
                    RedirectUrl: "",
                });
                $scope.getUserAccountInfo(redirectUrl);
            }
        }

        // GET USER ACCOUNT DETAILS
        $scope.getUserAccountInfo = function (redirectUrl) {
            $scope.loading = true;
            apiService.get(
                "Customs/Job/GetAccountInfo",
                "",
                function (results) {
                    var data = ($scope.userAccntDetails = results.data.ResponseResult);
                    if (data != null) {
                        $scope.loading = false;
                        if (data && data.accounts != null && data.accounts.length > 0) {
                            data.CCode = data.accounts[0].pValue;
                            data.UCode = data.accounts[0].pKey;
                            userAccountStorageFactory.setUserAccntInfo(data);
                            localStorage.setItem(
                                "isNavigatedFromLogin",
                                angular.toJson(true)
                            );
                            $storage.set(
                                "isPcsSuperUser",
                                data.isPCSSuperUser == "True" ? true : false
                            ); //store superUser Flag
                            $storage.set("isPrivateCompany", data.isPrivateCompany); //store private company Flag

                            $scope.getSubscriptionData(redirectUrl, data);
                        } else {
                            if (data.profiles.split(",").includes("CUSTINT")) {
                                window.location = $Url.resolve("~/Home/GMSDashboard");
                            } else if (data.isAuthorizedUser) {
                                localStorage.setItem(
                                    "userAccountDetails",
                                    angular.toJson(data)
                                );
                                window.location = $Url.resolve("~/Home/Index#/UserManagement");
                            } else {
                                var loginForm = document.getElementById("loginPageContent");
                                if (loginForm !== null && loginForm.style.display === "none") {
                                    loginForm.style.display = "block";
                                }
                                alert("Not an authorized user");
                            }
                        }

                        $storage.set("announcemnetShownFlag", false);
                    } else {
                        $scope.loading = false;
                        var loginPageContent = document.getElementById("loginPageContent");
                        if (
                            loginPageContent !== null &&
                            loginPageContent.style.display === "none"
                        ) {
                            loginPageContent.style.display = "block";
                        }
                    }
                },
                function error(response) {
                    $scope.loading = false;
                    var loginPageContent = document.getElementById("loginPageContent");
                    if (
                        loginPageContent !== null &&
                        loginPageContent.style.display === "none"
                    ) {
                        loginPageContent.style.display = "block";
                    }
                    console.log(response);
                }
            );
        };

        $scope.getSubscriptionData = function (redirectUrl, data) {
            var subscriptionEnabled = document.getElementById("subscriptionEnabled")
                .value;
            if (subscriptionEnabled == "true") {
                $http.get($Url.resolve("~/Account/GetSubscriptionData"), {}).then(
                    function (result) {
                        if (!result.data.StatusIsSuccessful) {
                            redirectMamar(redirectUrl, data);
                        } else {
                            var response = JSON.parse(result.data.ResponseResult);
                            if (
                                response.payedProcess.includes("MMR_CLA") &&
                                response.subscriptionRequired &&
                                response.isGracePeriodOver
                            ) {
                                redirectSubscription(data);
                                setSubscriptionData({
                                    subscriptionRequired: true,
                                    EnableMenu: true,
                                });
                            } else if (
                                response.payedProcess.includes("MMR_CLA") &&
                                (response.subscriptionRequired || response.isRenewal)
                            ) {
                                setSubscriptionData({ EnableMenu: true });
                                redirectSubscription(data);
                            } else {
                                if (
                                    response.payedProcess.includes("MMR_CLA") &&
                                    !response.subscriptionRequired
                                )
                                    setSubscriptionData({ EnableMenu: true });
                                redirectMamar(redirectUrl, data);
                            }
                        }
                    },
                    function (error) {
                        console.log(error);
                    }
                );
            } else {
                redirectMamar(redirectUrl, data);
            }
        };
        function setSubscriptionData(obj) {
            localStorage.setItem("subscribeObj", angular.toJson(obj));
        }
        function redirectSubscription(data) {
            var indexPage =
                data.accounts.length == 1
                    ? data.CCode.toUpperCase().contains("CONSOLIDATOR")
                        ? "ConsolidatedIndex"
                        : "Index"
                    : "Index";
            window.location = $Url.resolve("~/Home/" + indexPage + "#/subscription");
        }
        function redirectMamar(redirectUrl, data) {
            if (redirectUrl) {
                window.location = redirectUrl.href;
            } else {
                window.location =
                    data.accounts.length == 1
                        ? data.CCode.toUpperCase().contains("CONSOLIDATOR")
                            ? $Url.resolve(
                                "~/Home/ConsolidatedIndex#/consolidatorManifestUpload"
                            )
                            : $Url.resolve("~/Home/Index#/dashboard")
                        : $Url.resolve("~/Home/Index");
            }
        }
        autoLogin();

        //   apiService.redirectFn();
    },
]);
