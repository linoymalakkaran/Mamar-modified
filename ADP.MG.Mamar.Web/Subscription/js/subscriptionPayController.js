angular.module('mamarApp').controller('subscriptionPayController', ['$scope', '$http', '$filter', "$stateParams",
    function ($scope, $http, $filter, $stateParams) {
        $scope.onlineRefNo = $stateParams.onlineRefNo;
        $scope.status = $stateParams.status;

        $scope.downloadReport = function () {
            window.location.href = $Url.resolve('~/Subscription/DownloadReportReceipt?InvoiceNumber=' + $scope.onlineRefNo);
        };
        $scope.redirectToSubscription = function () {
            window.location = $Url.resolve('~/Home/Index#/subscription');
        };
        GetDataSubscriptionData($Url.resolve("subscription/SubscriptionStatus"), {}, null, function (result) {
            var response = JSON.parse(result.data.ResponseResult);
            if (response.payedProcess.includes("MMR_CLA") && response.subscriptionRequired && response.isGracePeriodOver) {
                setLocalStorage({ "subscriptionRequired": true, "EnableMenu": true });
            }
            else if (response.payedProcess.includes("MMR_CLA") && (response.subscriptionRequired || response.isRenewal)) {
                setLocalStorage({ "EnableMenu": true });
            }
            else {
                if (response.payedProcess.includes("MMR_CLA") && !response.subscriptionRequired)
                    setLocalStorage({ "EnableMenu": true });
            }

        }, function (error) {
            console.log(error);
        });
        function setLocalStorage(obj) {
           // localStorage.removeItem("subscribeObj");
            localStorage.setItem("subscribeObj", angular.toJson(obj));
        }
        function GetDataSubscriptionData(_targetUrl, _data, headerObject, success, failure) {
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
    }]);