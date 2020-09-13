//var subscriptionApp = angular.module('subscriptionApp', ['ngSanitize', 'angularUtils.directives.dirPagination']);

angular.module('mamarApp').controller('subscriptionController', ['$scope', '$http', '$filter', 'userAccountStorageFactory', '$state',
    function ($scope, $http, $filter, userAccountStorageFactory,$state) {
        //Subscription Begin
        $scope.subLaterText = $filter("translate")("SubscribeLater");
        $scope.isAdmin = false;
        $scope.subStartDate = null;
        $scope.isEnablePay = false;
        $scope.isReport = false;
        reset();
        $scope.isHeaderMenu = true;
        $scope.subscriptionTextCompany = "Subscribe";
        $scope.isPaylater = false;
        $scope.lstPageData = [5, 10, 20, 30];
      
        $scope.initialGetSubscriptionRequired = function () {
            resetPaymentData();
            GetData($Url.resolve("subscription/SubscriptionStatus"), {}, null, function (result) {
                $scope.SubscriptionData = JSON.parse(result.data.ResponseResult);
                $scope.isSubscriptionRequired = $scope.SubscriptionData.subscriptionRequired;
                if ($scope.SubscriptionData.lastSubscriptionStart != null)
                    $scope.subStartDate = new Date($scope.SubscriptionData.lastSubscriptionStart);
                if ($scope.SubscriptionData.lastSubscriptionEnd != null)
                    $scope.subEndDate = new Date($scope.SubscriptionData.lastSubscriptionEnd);
                $scope.isAdmin = $scope.SubscriptionData.isSuperUser;
                $scope.searchParam.UCID = $scope.isAdmin ? "" : $scope.SubscriptionData.ucid;
                $scope.payOnlineText = $filter("translate")("PayOnline");
                if ($scope.SubscriptionData.isRenewal) {
                    $scope.buttonSubscribeText = $filter("translate")("Renew");
                    $scope.subLaterText = $filter("translate")("RenewLater");
                }
                else
                    $scope.buttonSubscribeText = $filter("translate")("Subscribe");


                $scope.getSubscriptionData();
                //if ($scope.isSubscriptionRequired) {
                GetSubscriptionDetail();
                // GetConfigData();
                //}

            }, function (error) {
                console.log(error);
            });
        };
        $scope.initialGetSubscriptionRequired(event);
        $scope.rotateCard = function (id) {
            //$scope.isSubscriptionRequired = true;
            $(".hover").removeClass("hover");
            var $card = $('#' + event.target.id).closest('.card-container');
            $card.addClass('hover');
            $scope.subLaterText = $filter("translate")("PayLater");
            $scope.isPaylater = true;
        }

        $scope.chequeDateKeyPress = function (e) {
            e.preventDefault();
        }

        $scope.payLater = function (user) {
            if (user != 'admin') {
                if (!$scope.isPaylater) {
                    if (!$scope.isPaylater && ((!$scope.SubscriptionData.isGracePeriodOver && ($scope.SubscriptionData.subscriptionRequired)) ||
                        ($scope.SubscriptionData.subscriptionRequired && $scope.SubscriptionData.isGracePeriodOver))) {
                        $('#subscribe_later').modal({
                            backdrop: "static"
                        });
                    }
                    else {
                        $scope.isSubscriptionRequired = null;
                        redirectDashBoard();
                    }
                }
                else {
                    $scope.isSubscriptionRequired = null;
                    redirectDashBoard();
                }
            }
            else {
                $scope.isSubscriptionRequired = null;
                redirectDashBoard();
            }
            $scope.isHeaderMenu = false;
            return;
        }
        $scope.payLaterOK = function () {
            $scope.isSubscriptionRequired = null;
            $('#subscribe_later').modal("hide");
            redirectDashBoard();
        }
        function redirectDashBoard() {
           // var data = userAccountStorageFactory.getUserAccntInfo();
           // window.location = data.accounts.length == 1 ? data.CCode.toUpperCase().contains("CONSOLIDATOR") ? $Url.resolve('~/Home/ConsolidatedIndex#/consolidatorManifestUpload') : $Url.resolve('~/Home/Index#/dashboard') : $Url.resolve('~/Home/Index');
            $state.go("dashboard");
        }
        function GetSubscriptionDetail() {
            GetData($Url.resolve("subscription/subscriptiontariffs"), {}, null, function (result) {
                var response = JSON.parse(result.data.ResponseResult);
                $scope.subscriptionContent = $filter('filter')(response.data, function (tarrifs) { return (tarrifs.status) });;
                //if ($scope.isSubscriptionRequired) {

                angular.forEach($scope.subscriptionContent, function (value, key) {
                    value.vatDescriptions = value.description1.replace(/(\r\n|\n|\r)/g, "<br />").split("<br />").slice(0, 2);
                    value.unlimitedAccessDesc = value.description2.replace(/(\r\n|\n|\r)/g, "<br />").split("<br />").slice(0, 1);
                    value.vatDescriptionsArb = value.description1Arb.replace(/(\r\n|\n|\r)/g, "<br />").split("<br />").slice(0, 2);
                    value.unlimitedAccessDescArb = value.description2Arb.replace(/(\r\n|\n|\r)/g, "<br />").split("<br />").slice(0, 1);

                    value.vatamt = (value.fee * 5) / 100;
                });



            }, function (error) {
                console.log(error);
            });
        }
       
        function GetType(type) {
            var iType;
            switch (type.toLocaleLowerCase()) {
                case 'weekly':
                    iType = "Week";
                    break;
                case 'monthly':
                    iType = "Month";
                    break;
                case 'annual':
                    iType = "Annual";
                    break;
                default:
                    iType = type;

            }
            return iType;

        }

       

        $("#repCustomerName").on('change', function (e) {
            if (e.added) {
                $scope.searchParam.UCID = e.added.ucid;
            }
        });
        $('#subCustomerName').on('change', function (e) {
            $scope.selectedCompany = {};
            $scope.selectedCompany = e.added;
            $scope.subscribeCompany = {};
            resetPaymentData();
            if ($scope.selectedCompany.ucid && $scope.selectedCompany.ucid.trim() != "") {
                GetData($Url.resolve("subscription/SubscriptionStatus"), {}, $scope.selectedCompany, function (result) {
                    $scope.subscribeCompany = JSON.parse(result.data.ResponseResult);
                    if ($scope.subscribeCompany.isRenewal)
                        $scope.subscriptionTextCompany = "Renew";
                    else
                        $scope.subscriptionTextCompany = "Subscribe";

                    if ($scope.subscribeCompany.subscriptionRequired || $scope.subscribeCompany.isRenewal) {
                        $scope.isEnablePay = true;
                    }
                    else if ($scope.subscribeCompany.payedProcess.length) {
                        $scope.isEnablePay = false;
                        $scope.message = "This company is already subscribed.";
                        $('#messagePopup').modal({
                            backdrop: "static"
                        });

                    }
                    else {
                        $scope.isEnablePay = false;
                        $scope.message = "The selected company does not have any paid services and hence subscription is not applicable.";
                        $('#messagePopup').modal({
                            backdrop: "static"
                        });
                    }
                }, function (error) {
                });

            }
            else {
                $scope.isEnablePay = false;
                $scope.message = "You cannot subscribe for this company.<br>For further assistance, please contact <b>mgservice.desk@maqta.ae</b>. Also you can reach us <b>@ 800 10 20 30</b>";
                $scope.$apply();
                $('#messagePopup').modal({
                    backdrop: "static"
                });
            }

        });


        $scope.onClickChequePayment = function () {
            var dtToday = new Date();
            var month = dtToday.getMonth() + 1;
            var day = dtToday.getDate();
            var year = dtToday.getFullYear();
            if (month < 10)
                month = '0' + month.toString();
            if (day < 10)
                day = '0' + day.toString();
            var maxDate = year + '-' + month + '-' + day;
            $('#chequeDate').attr('max', maxDate);
            if ($scope.paymentData.ChequePayment) {
                $scope.payOnlineText = "Pay";
                if ($scope.paymentData.ChequeNo && $scope.paymentData.ChequeDate && $scope.paymentData.ChequeBankName) {
                    $scope.isEnablePay = true;
                }
                else {
                    $scope.isEnablePay = false;
                }
            }
            else {
                resetPaymentData();
                $scope.payOnlineText = "Pay Online";
                $scope.isEnablePay = true;
            }
        }
        function enabledisablePaybutton() {
            if ($scope.paymentData.ChequePayment) {
                $scope.payOnlineText = "Pay";
                if ($scope.paymentData.ChequeNumber && $scope.paymentData.ChequeDate && $scope.paymentData.BankName) {
                    $scope.isEnablePay = true;
                }
                else {
                    $scope.isEnablePay = false;
                }
            }
            else {
                $scope.payOnlineText = "Pay Online";
            }
            $scope.$apply();
        }
        //Subscription Micro Service Begin
        function GetData(_targetUrl, _data, headerObject, success, failure) {
            var data = {
                params: {
                    targetUrl: _targetUrl,
                    data: _data
                }
            }
            if (headerObject) {
                data.headers = {
                    '_selected_company_': JSON.stringify({ 'CompanyID': headerObject.id, 'UCID': headerObject.ucid })
                };
            }
            $http.get($Url.resolve('~/Subscription/Get'), data)
                .then(function (result) {
                    success(result);

                }, function (error) {

                    failure(error);
                });
        }
        function postData(url, targetType, data, success, failure) {

            var ApiModel = {
                ApiUrl: url,
                TargetType: targetType,
                Data: angular.toJson(data)
            }
            return $http.post($Url.resolve('~/Subscription/Post'), ApiModel)
                .then(function (result) {
                    success(result);
                }, function (error) {
                    if (failure != null) {
                        failure(error);
                    }
                });
        };

        //Subscription Micro Service End

        //SubscriptionPayment
        //{
        //    public long CompanyId { get; set; }
        //    public string UCID { get; set; }
        //    public string UserName { get; set; }
        //    public double Amount { get; set; }
        //    public bool ShouldAddVat { get; set; }
        //    public string RevenueCode { get; set; }
        //    public string Description { get; set; }
        //    public bool IsSuperUser { get; set; }
        //}

        function resetPaymentData() {
            $scope.paymentData = {
                CompanyId: 0,
                UCID: '',
                UserName: '',
                Amount: '',
                ShouldAddVat: false,
                RevenueCode: '',
                Description: '',
                IsSuperUser: false,
                ChequePayment: false,
                ChequeDate: new Date()
            };

        }
        $scope.Pay = function (type) {
            var index = $scope.subscriptionContent.findIndex(doc => doc.id == type);

            var data = $scope.subscriptionContent[index];

            //Payment object
            var subData = $scope.SubscriptionData;
            $scope.paymentData.Amount = data.fee;
            $scope.paymentData.Description = "Maqta services " + data.name;
            $scope.paymentData.RevenueCode = data.revenueCode;
            $scope.paymentData.ShouldAddVat = data.isVAT;
            $scope.paymentData.CategoryType = data.categoryCode;
            $scope.paymentData.CategoryValue = data.categoryValue;
            $scope.paymentData.IsSuperUser = subData.isSuperUser;
            $scope.paymentData.SubscriptionType = data.id;


            if (subData.isSuperUser) {
                $scope.paymentData.UCID = $scope.selectedCompany.ucid;
                $scope.paymentData.CompanyId = $scope.selectedCompany.id;
                $scope.paymentData.IsRenewal = $scope.subscribeCompany.isRenewal;
            }
            else {
                $scope.paymentData.UCID = subData.ucid;
                $scope.paymentData.IsRenewal = subData.isRenewal;

            }
            if (new Date($scope.paymentData.ChequeDate) >= new Date()) {
                $scope.message = "Cheque date should not be future date.";
                $('#messagePopup').modal({
                    backdrop: "static"
                });
                return false;
            }
            $("#loadingScreen").show();
            $.ajax({
                url: $Url.resolve("~/Subscription/MamarPay"),
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    if (data.failed) {
                        //var message = data.message ? data.message : "Some error occured.";
                        $("#loadingScreen").hide();
                        $scope.message = "Something Went Wrong";
                        if (data.paymentStatus == "success") {
                            $scope.message = "This company is already subscribed.";
                        }
                        else if (data.paymentStatus == "inprogress") {
                            $scope.message = "Your payment is under process.";
                        }
                        //else if (data.message == "failure") {
                        //    $scope.message = "Your payment is failure. Kindly contact administrator";
                        //}
                        $scope.$apply();
                        $('#messagePopup').modal({
                            backdrop: "static"
                        });
                    }
                    else {
                        $("#loadingScreen").hide();
                        $('#payfformwrp').html(data);
                        $("html, body").animate({
                            scrollTop: 0
                        }, 1000);
                        $("#frmPost").submit();
                    }
                }, failure: function (data) {
                    $("#loadingScreen").hide();
                },
                data: JSON.stringify($scope.paymentData)
            });

            //Subscription End 
        }
        $scope.mainManu = function () {
            if ($scope.isReport) {
                $scope.buttonText = $filter("translate")("Subscription");
                $scope.isReport = false;
            }
            else {
                $scope.buttonText = $filter("translate")("Paymentadvice");
                $scope.isReport = true;
            }
        };

        $scope.downloadReport = function (item, type) {
            if (type == 'paymentadvice') {
                window.location.href = $Url.resolve('~/Subscription/DownloadReport?InvoiceNumber=' + item.subscriptionNo);
            }
            else if (type == 'receipt') {
                window.location.href = $Url.resolve('~/Subscription/DownloadReportReceipt?InvoiceNumber=' + item.paymentRefNumber);
            }
            return false;
        };

        $scope.fromDateValidate = function () {
            if ($scope.searchParam.FromDate) {
                var dtToday = $scope.searchParam.FromDate;
                if ($scope.searchParam.FromDate > $scope.searchParam.ToDate) {
                    $scope.searchParam.ToDate = $scope.searchParam.FromDate;
                }
                var month = dtToday.getMonth() + 1;
                var day = dtToday.getDate();
                var year = dtToday.getFullYear();
                if (month < 10)
                    month = '0' + month.toString();
                if (day < 10)
                    day = '0' + day.toString();
                var maxDate = year + '-' + month + '-' + day;

                $('#toDate').attr('min', maxDate);
            }
            else {
                $('#toDate').removeAttr('min');
                $scope.searchParam.ToDate = $scope.searchParam.FromDate;
            }
        };
        //document.querySelector("#toDate,#fromDate").addEventListener("keydown", function (e) {
        //    //if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        //    e.preventDefault();
        //    //}
        //}, false);

        $scope.fromDateValidate();
        $scope.totalCount = 0;

        $scope.loadMoreRecords = function (newPageNumber) {
            $scope.searchParam.PageNumber = newPageNumber;
           $scope.getSubscriptionData();
        }
        $scope.getReportData = function () {
            $scope.searchParam.PageNumber = 0;
            if (($scope.searchParam.FromDate && $scope.searchParam.ToDate) || ($scope.searchParam.SubscriptionNo) || ($scope.searchParam.PaymentRefNo) || ( $scope.searchParam.UCID)) {
                if (!$scope.searchParam.ToDate) {
                    $scope.searchParam.FromDate = null;
                }
                $scope.getSubscriptionData();
            }
            else {

                $scope.message = "At least one field must be selected";
                $('#messagePopup').modal({
                    backdrop: "static"
                });

            }
        }
        $scope.getSubscriptionData = function () {
            $scope.searchParam.PageSize = 5;
            var FromDate = null, ToDate = null;
            if ($scope.searchParam.FromDate) {
                var fDate = $scope.searchParam.FromDate;
                var tDate = $scope.searchParam.ToDate;
                FromDate = (fDate.getDate() < 10 ? ("0" + fDate.getDate()) : (fDate.getDate())) + "/" + (parseInt(fDate.getMonth() + 1) < 10 ? ("0" + parseInt(fDate.getMonth() + 1)) : parseInt(fDate.getMonth() + 1)) + "/" + fDate.getFullYear();
                ToDate = (tDate.getDate() < 10 ? ("0" + tDate.getDate()) : (tDate.getDate())) + "/" + (parseInt(tDate.getMonth() + 1) < 10 ? ("0" + parseInt(tDate.getMonth() + 1)) : parseInt(tDate.getMonth() + 1)) + "/" + tDate.getFullYear();
            }
            var inputParam = angular.copy($scope.searchParam);
            inputParam.FromDate = FromDate;
            inputParam.ToDate = ToDate;
            postData("subscription/paidsubscriptions", "", inputParam, function (result) {
                var response = JSON.parse(result.data.ResponseResult);
                if (response.status) {
                    if (response.data) {
                        
                        $scope.subReport = response.data.length == 0 ? null : response.data;
                        $scope.totalCount = response.data.length > 0 ? $scope.subReport[0].totalCount : 0;
                        if ($scope.totalCount > 0 && $scope.isAdmin) {
                            ReassignCompanyData();
                        }
                        //if (response.data.length) {
                        //    GetTrarrifType();
                        //}
                    }
                }
            }, function (error) {
                console.log(error);
            });
        };
        $scope.clearSearch = function () {
            reset();
            $scope.getSubscriptionData();
        };
        function ReassignCompanyData() {
            var companyIds = [];
            angular.forEach($scope.subReport, function (value, key) {
                if (!companyIds.includes(value.ucid)) {
                    companyIds.push(value.ucid);
                }
            });
            $http.post($Url.resolve('~/Subscription/GetCompanywithName'), companyIds)
                .then(function (result) {
                    angular.forEach($scope.subReport, function (value, key) {
                        value.companyName = $filter('filter')(result.data, function (company) { return (company.UCID == value.ucid) })[0].EnglishName;
                    });
                }, function (error) {
                });
        }
        function GetTrarrifType() {
            angular.forEach($scope.subReport, function (value, key) {
                var index = $scope.subscriptionContent.findIndex(doc => doc.id == value.subscriptionType);
                var data = $scope.subscriptionContent[index];
                value.subscriptionTypeText = data.name;
            });
            
        }
        function reset() {
            $scope.searchParam = {
                "FromDate": new Date(),
                "ToDate": new Date(),
                "PageSize": 5,
                "PageNumber": 1,
                "SubscriptionNo": "",
                "PaymentRefNo": "",
                "UCID": ""
            };
            if ($scope.SubscriptionData) {
                $scope.searchParam.UCID = $scope.isAdmin ? "" : $scope.SubscriptionData.ucid;
            }
            if ($scope.isAdmin) {
                $("#repCustomerName").select2("val", "");
            }
        }


        //Maqta service Begin
        $scope.showMaqtaService = function () {
            $scope.searchParam.PageSize = 10;
            GetData($Url.resolve("subscription/Maqtaservices"), {}, null, function (result) {
                $scope.items = JSON.parse(result.data.ResponseResult).data;
                $scope.totalCount = $scope.items.length;
            }, function (error) {
                console.log(error);
            });
            $('#maqtaServicePopup').modal({
                backdrop: "static"
            });
        }

        $scope.$watch("language", function () {
            if ($scope.SubscriptionData != undefined) {
                if ($scope.SubscriptionData.isRenewal) {
                    $scope.buttonSubscribeText = $filter("translate")("Renew");
                    $scope.subLaterText = $filter("translate")("RenewLater");
                }
                else if ($scope.isPaylater) {
                    $scope.subLaterText = $filter("translate")("PayLater");
                }
                else {
                    $scope.buttonSubscribeText = $filter("translate")("Subscribe");
                    $scope.subLaterText = $filter("translate")("SubscribeLater");
                }
            }
        });
        //Maqta service End
    }]);

//subscriptionApp.directive('onlyDigitsInput', function () {
//    return {
//        require: 'ngModel',
//        link: function (scope, element, attr, ngModelCtrl) {
//            function fromUser(text) {
//                var transformedInput = text.replace(/[^0-9]/g, '');;
//                if (transformedInput !== text) {
//                    ngModelCtrl.$setViewValue(transformedInput);
//                    ngModelCtrl.$render();
//                }
//                return transformedInput;
//            }
//            ngModelCtrl.$parsers.push(fromUser);
//        }
//    };
//});


