angular.module('mamarApp').controller('gmsReportsController', ['$scope', '$rootScope', '$translate', 'apiService', '$state', '$filter','$http',
    function ($scope, $rootScope, $translate, apiService, $state, $filter,$http) {
        $("#overlay").hide();
        $scope.fromDate = null;
        $scope.endDate = null;
        $scope.Initialize=function()
        {
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

            $scope.fromDate = null;
            $scope.endDate = null;

            $scope.getAllContainers();
        }


        

        $scope.Category = [{ name: '-Select-', id: '' }, { name: 'IMP', id: 'IMP' }, { name: 'EXP', id: 'EXP' }, { name: 'STRGE', id: 'STRGE' }];
        $scope.CustomsStatus = [{ name: '-Select-', id: '' }, { name: 'HOLD', id: 'HOLD' }, { name: 'RELEASE', id: 'RELEASE' }];
        $scope.InspectionStatus = [{ name: '-Select-', id: '' }, { name: 'Release', id: 'RELEASE' }, { name: 'Release for Inspection', id: 'RELEASE FOR INSPECTION' }, { name: 'Release- Customs Inspection', id: 'RELEASE - CUSTOMS INSPECTION' }];
        $scope.Terminal = [{ name: '-Select-', id: '' }, { name: 'ADT', id: 'ADT' }];
        $scope.FrieghtKind = [{ name: '-Select-', id: '' }, { name: 'Full', id: 'FCL' }, { name: 'Empty', id: 'MTY' }];

        $scope.getAllContainers = function () {
            $("#loadingScreen").show();
            var param = { gmsDashboardSearchFilter: $scope.searchParams };
            if ($scope.fromDate) {
                var d = $scope.fromDate.split('/')
                param.gmsDashboardSearchFilter.fromDT = d[2] + "-" + d[1] + "-" + d[0] + " " + "00:00:00";
            }
            if ($scope.endDate) {
                var d = $scope.endDate.split('/')
                param.gmsDashboardSearchFilter.toDT = d[2] + "-" + d[1] + "-" + d[0] + " " + "23:59:59";
            }
            apiService.post('Customs/Dashboard/SearchContainerReleaseReport', '',
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

        $scope.downloadExcel = function () {
            $("#loadingScreen").show();
            var param = { gmsDashboardSearchFilter: $scope.searchParams };
            document.location.href = "../Home/DownloadExcelGMSStatusReport?obj=" + JSON.stringify(param);
            $("#loadingScreen").hide();
        }

        $scope.downloadPDF = function () {
            $("#loadingScreen").show();
            var param = { gmsDashboardSearchFilter: $scope.searchParams };
            document.location.href = "../Home/DownloadPDFGMSStatusReport?obj=" + JSON.stringify(param);
            $("#loadingScreen").hide();
        }

        $scope.formatDate = function (date) {
            if (date) {
                var dt = date.split(' ');
                var d = dt[0].split('-');
                return d[2] + "/" + d[1] + "/" + d[0] + " " + dt[1];
            }
        };

        $scope.Initialize();
        
    }]);