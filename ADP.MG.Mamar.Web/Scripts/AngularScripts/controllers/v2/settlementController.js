angular.module('mamarApp').controller('settlementController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService','sharedModels', '$filter',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, sharedModels, $filter) {
        $scope.totalSettlementCount = 0;
        $scope.LoadLookupCenterCodes = function () {
            $scope.lkupCntrCodepm = {
                transportMode: 'M',
                searchString: ''
            };
            
        //    apiService.get('Customs/Lookup/CenterCodes',
        //        $scope.lkupCntrCodepm,
        //        function (results) {
        //            $scope.centerCodes = results.data.ResponseResult.Data;
        //            if ($scope.centerCodes) {
        //                var selectedCenter = $filter('filter')($scope.centerCodes, function (cenCode) { return (cenCode.Code == 'V') });
        //                $scope.selCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";
        //                $scope.PopulateObject();
        //                $scope.PopulateSettlementData();
        //            }
        //        },
        //    function error(response) {
        //        console.log('something went wrong in LoadLookupCentreCodes' + response);
        //    });
        }
        $scope.report = {
            centerCode: "V",
            vBSNumber: '',
        };
        $scope.loadMoreSettlemetsRecords = function (newPageNo) {
            $scope.mPaymentSettlementRequestObject.pageNumber = newPageNo;
            $scope.PopulateSettlementData();
        }

        $scope.PopulateSettlementData = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/MPayment/GetSettlements', $scope.mPaymentSettlementRequestObject, function (results) {
                $scope.settlements = results.data.ResponseResult.Data;
                if ($scope.settlements != null) {
                    $scope.totalSettlementCount = $scope.settlements[0].TotalCount;
                }
                $("#loadingScreen").hide();
            },
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
        }

        //$scope.LoadLookupCenterCodes();

        $scope.PopulateObject = function () {
            $scope.mPaymentSettlementRequestObject = {
                CenterCode: $scope.selectedCenterCode,// $scope.DefaultCenterCode,
                pageNumber: 1,
                pageSize: 10,
            }
        };

        $scope.oncenterCodeChanged = function () {
            $scope.PopulateObject();
            $scope.PopulateSettlementData();
        };

        $scope.downloadReport = function (selectedValue, VBSNumber) {
            $("#loadingScreen").show();
            if (selectedValue != '') {
                var serviceUrl = 'Customs/Reporting/' + selectedValue;
                $scope.report.centerCode = $scope.selectedCenterCode,// $scope.DefaultCenterCode;
                $scope.report.vBSNumber = VBSNumber;
                apiService.get(serviceUrl, $scope.report,
                    function (results) {
                        var data = results.data.ResponseResult;
                        if (data.Data != null && data.Data.length > 0) {
                            //print report
                            apiService.printDocuments(data.Data);
                            $("#loadingScreen").hide();
                        }
                        else if (!data.IsValid) {
                            $("#loadingScreen").hide();
                            var msg = data.Messages ? apiService.formatResponseMessageObject(data.Messages) : "Error";
                            modalErrorShow(msg.eng + ' - ' + msg.arb);
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });
            }
        }
        //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
        //    $scope.DefaultCenterCode = $scope.selectedCenterCode,// sharedModels.UserCenter[0].CenterCode;
        //    $scope.PopulateObject();
        //    $scope.PopulateSettlementData();
        //}
        //$scope.PopulateSettlementData();

        $scope.DefaultCenterCode = $scope.selectedCenterCode,// sharedModels.UserCenter[0].CenterCode;
        $scope.PopulateObject();
        $scope.PopulateSettlementData();

    }]);