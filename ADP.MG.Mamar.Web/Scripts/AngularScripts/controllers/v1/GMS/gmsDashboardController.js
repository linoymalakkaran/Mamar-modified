angular.module('mamarApp').controller('gmsDashboardController', ['$scope', '$rootScope', '$translate', 'apiService', '$state', '$filter', '$anchorScroll', '$location', '$interval',
    function ($scope, $rootScope, $translate, apiService, $state, $filter, $anchorScroll, $location, $interval) {
        $("#overlay").hide();
        $anchorScroll.yOffset = 200;

        $scope.Initialize = function () {
            $scope.searchParamsPosting = {
                pageNo: 1,
                pageSize: 20,
                daystoretrieve: null,
                containerNumber: "",
                customsStatus: "",
                inspectionDetails: "",
                plateNumber: "",
                terminal: "",
                frieghtKind: "",
                category: "",
                fromDT: "",
                toDT: ""
            };

            $scope.searchParams = {
                pageNo: 1,
                pageSize: 20,
                daystoretrieve: null,
                containerNumber: "",
                customsStatus: "",
                inspectionDetails: "",
                plateNumber: "",
                terminal: "",
                frieghtKind: "",
                category: "",
                fromDT: "",
                toDT: ""
            };
            $scope.getAllContainers();
        }
        $scope.show = [];

        $scope.Category = [{ name: '-Select-', id: '' }, { name: 'IMP', id: 'IMP' }, { name: 'EXP', id: 'EXP' }, { name: 'STRGE', id: 'STRGE' }];
        $scope.CustomsStatus = [{ name: '-Select-', id: '' }, { name: 'HOLD', id: 'HOLD' }, { name: 'RELEASE', id: 'RELEASE' }, { name: 'NA', id: 'NA' }];
        $scope.InspectionStatus = [{ name: '-Select-', id: '' }, { name: 'Release', id: 'RELEASE' }, { name: 'Release for Inspection', id: 'RELEASE FOR INSPECTION' }, { name: 'Release- Customs Inspection', id: 'RELEASE - CUSTOMS INSPECTION' }];
        $scope.Terminal = [{ name: '-Select-', id: '' }, { name: 'ADT', id: 'ADT' }];
        $scope.FrieghtKind = [{ name: '-Select-', id: '' }, { name: 'Full', id: 'FCL' }, { name: 'Empty', id: 'MTY' }];

        $scope.getAllContainers = function (isBackGround) {

            var param = { gmsDashboardSearchFilter: $scope.searchParamsPosting };
            if (!isBackGround)
                $("#loadingScreen").show();
            apiService.post('Customs/Dashboard/SearchContainerReleaseStatus', '',
                param,
                function (results) {
                    $("#loadingScreen").hide();
                    $scope.ContainerData = results.data.ResponseResult.ServiceResponse.Content;
                    $scope.totalCount = $scope.ContainerData && $scope.ContainerData.length > 0 ? $scope.ContainerData[0].totalRows : 0;
                },
            function error(response) {
                $("#loadingScreen").hide();
                console.log('something went wrong in LoadLookupCentreCodes' + response);
            });
        }

        $scope.selectContainer = function (container, indexvar) {
            $scope.selectedContainer = container;
            $scope.selectedIndex = indexvar;
            $("#overlay").show();

            gotoAnchor('details' + (indexvar));
            $scope.show[indexvar] = true;

        }

        $scope.Search = function () {
            $scope.searchParamsPosting = angular.copy($scope.searchParams);
            $scope.getAllContainers(true);
        }

        $scope.closeDetails = function () {
            $scope.show[$scope.selectedIndex] = false;
            $scope.selectedContainer = {};
            $scope.selectedIndex = -1;
            $("#overlay").hide();

        }

        var gotoAnchor = function (divId) {
            if ($location.hash() !== divId) {
                $location.hash(divId);
            } else {
                $anchorScroll();
            }
        };

        $scope.formatDate = function (date) {
            if (date) {
                var dt = date.split(' ');
                var d = dt[0].split('-');
                return d[2] + "/" + d[1] + "/" + d[0] + " " + dt[1];
            }
        };

        
        $scope.setTimer = function () {
            $scope.timeOutVar = $interval(function () {
                $scope.getAllContainers(true);
            }, 60000);
        }
        $scope.$on("$destroy", function (event) {
            $interval.cancel($scope.timeOutVar);
        });
        $scope.Initialize();
        $scope.setTimer();

    }]);