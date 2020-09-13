angular.module('mamarApp').controller('PaymentController',
    ['$rootScope', '$scope', '$state', '$stateParams', '$uibModal', 'apiService', '$filter',
        function ($rootScope, $scope, $state, $stateParams, $uibModal, apiService, $filter) {
            $scope.selectedTabValue = '';
            //$scope.selectedTabValue = 'Statement';
            $scope.SelectedTab = function (SelectedTabs) {
                $scope.selectedTabValue = SelectedTabs;
            };
            $scope.onPageLoad = function (SelectedTabs) {
                $scope.selectedTabValue = SelectedTabs;
                angular.element(document.querySelector('.panel [data-action=collapse]')).click();
            };
            $rootScope.$on("CallMyDepositSlipControllerMethods", function (event, param1) {
                debugger;
                $scope.My2ControllerMethod(param1);
            });

            $scope.My2ControllerMethod = function (param1) {
                alert(param1);
            }
            $scope.onPageLoad($scope.selectedTabValue);


            $scope.transModes = [
               { key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
               { key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
            ];

            $scope.storedTransMode = localStorage.getItem("PaymentTransportMode");

            $scope.selectedTransMode = $scope.storedTransMode ? $scope.storedTransMode : $scope.transModes[0].key;

            $scope.storedPreferredCenter = localStorage.getItem("PaymentCenterCode");

          
            $scope.centerCodelookUpParams = {
                transportMode: $scope.selectedTransMode,
                searchString: ''
            };

            $scope.onCenterCodeChanged = function () {
                localStorage.setItem("PaymentCenterCode", $scope.selectedCenterCode);
                $scope.onPageLoad();
            }

            $scope.getCenterCodes = function () {
                apiService.get('Customs/Lookup/CenterCodes',
                    $scope.centerCodelookUpParams,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.centerCodes = results.data.ResponseResult.Data;
                           
                            if ($scope.centerCodes) {
                                if ($scope.storedPreferredCenter) {
                                    $scope.selectedCenterCode = $scope.storedPreferredCenter;
                                    $scope.onPageLoad();
                                }
                                else {
                                    var selectedCenter = $filter('filter')($scope.centerCodes,
                                        function (cenCode) {
                                            return (cenCode.Code == 'V')
                                        });


                                    $scope.selectedCenterCode = selectedCenter.length == 1 ? selectedCenter[0].Code : $scope.centerCodes.length > 0 ? $scope.centerCodes[0].Code : "";

                                   
                                    localStorage.setItem("PaymentCenterCode",$scope.selectedCenterCode);
                                }
                            }

                        } else {

                            $("#loadingScreen").hide();
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log('something went wrong in LoadLookupCentreCodes' + response);
                    });
            }

            $scope.$watch("selectedTransMode", function () {
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                localStorage.setItem("PaymentTransportMode", $scope.selectedTransMode);
                $scope.getCenterCodes();
            });


        }]);
