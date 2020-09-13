angular.module('mamarApp').controller('vehiclePermitDetailsController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$timeout',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $filter, $timeout) {

        $scope.gotoVehicleTracking = () => {
            $state.go('vehicleTracking', {},{ notify: true });
        }
        function bindData()
        {
            $scope.plateOrigin = $scope.searchParameter.plateOrigin + ' ' + ($scope.permitDetails.PlateOriginEng ? $scope.permitDetails.PlateOriginEng : '') + ' ' + ($scope.permitDetails.PlateOriginArb ? $scope.permitDetails.PlateOriginArb : '');
            $scope.plateColor = $scope.searchParameter.plateColor + ' ' + ($scope.permitDetails.PlateColorEng ? $scope.permitDetails.PlateColorEng : '') + ' ' + ($scope.permitDetails.PlateColorArb ? $scope.permitDetails.PlateColorArb : '');
            $scope.plateCategory = $scope.searchParameter.plateCategory + ' ' + ($scope.permitDetails.PlateCategoryEng ? $scope.permitDetails.PlateCategoryEng : '') + ' ' + ($scope.permitDetails.PlateCategoryArb ? $scope.permitDetails.PlateCategoryArb : '');
            $scope.vehicleCategory = $scope.permitDetails.VehicleCategoryCode + ' ' + ($scope.permitDetails.VehicleCategoryEng ? $scope.permitDetails.VehicleCategoryEng : '') + ' ' + ($scope.permitDetails.VehicleCategoryArb ? $scope.permitDetails.VehicleCategoryArb : '');
            $scope.vehicleColor = ($scope.permitDetails.CarColorCode ? $scope.permitDetails.CarColorCode : '') + ' ' + ($scope.permitDetails.CarColoEng ? $scope.permitDetails.CarColoEng : '') + ' ' + ($scope.permitDetails.CarColorArb ? $scope.permitDetails.CarColorArb : '');
            $scope.ownerNationality = ($scope.permitDetails.OwnerNationality ? $scope.permitDetails.OwnerNationality : '') + ' ' + ($scope.permitDetails.OwnerNationalityEng ? $scope.permitDetails.OwnerNationalityEng : '') + ' ' + ($scope.permitDetails.OwnerNationalityArb ? $scope.permitDetails.OwnerNationalityArb : '');
            $scope.vehicleType = ($scope.permitDetails.VehicleCode ? $scope.permitDetails.VehicleCode : '') + ' ' + ($scope.permitDetails.VehicleTypeEng ? $scope.permitDetails.VehicleTypeEng : '') + ' ' + ($scope.permitDetails.VehicleType ? $scope.permitDetails.VehicleType : '');
            $scope.destCountryOpen = ($scope.permitDetails.DestCountryOpen ? $scope.permitDetails.DestCountryOpen : '') + ' ' + ($scope.permitDetails.DestCountryOpenEng ? $scope.permitDetails.DestCountryOpenEng : '') + ' ' + ($scope.permitDetails.DestCountryOpenArb ? $scope.permitDetails.DestCountryOpenArb : '');
            $scope.driverNationalityOpen = ($scope.permitDetails.DriverNatOpen ? $scope.permitDetails.DriverNatOpen : '') + ' ' + ($scope.permitDetails.DriverNatOpenEng ? $scope.permitDetails.DriverNatOpenEng : '') + ' ' + ($scope.permitDetails.DriverNatOpenArb ? $scope.permitDetails.DriverNatOpenArb : '');
            $scope.destCountryClose = ($scope.permitDetails.DestCountryClose ? $scope.permitDetails.DestCountryClose : '') + ' ' + ($scope.permitDetails.DestCountryCloseEng ? $scope.permitDetails.DestCountryCloseEng : '') + ' ' + ($scope.permitDetails.DestCountryCloseArb ? $scope.permitDetails.DestCountryCloseArb : '');
            $scope.driverNationalityClose = ($scope.permitDetails.DriverNatClose ? $scope.permitDetails.DriverNatClose : '') + ' ' + ($scope.permitDetails.DriverNationalityEng ? $scope.permitDetails.DriverNationalityEng : '') + ' ' + ($scope.permitDetails.DriverrNationalityArb ? $scope.permitDetails.DriverrNationalityArb : '');
            $scope.centerOpen = ($scope.permitDetails.CenterOpen ? $scope.permitDetails.CenterOpen : '') + ' ' + ($scope.permitDetails.CenterOpenEng ? $scope.permitDetails.CenterOpenEng : '') + ' ' + ($scope.permitDetails.CenterOpenArb ? $scope.permitDetails.CenterOpenArb : '');
            $scope.centerClose = ($scope.permitDetails.CenterClose ? $scope.permitDetails.CenterClose : '') + ' ' + ($scope.permitDetails.CenterCloseEng ? $scope.permitDetails.CenterCloseEng : '') + ' ' + ($scope.permitDetails.CenterCloseArb ? $scope.permitDetails.CenterCloseArb : '');

            $scope.carExpiryDate = ($scope.permitDetails.CarExpiryDate ? $filter('date')($scope.permitDetails.CarExpiryDate, "dd/MM/yyyy") : '');
            $scope.dateOpen = ($scope.permitDetails.DateOpen ? $filter('date')($scope.permitDetails.DateOpen, "dd/MM/yyyy") : '');
            $scope.carDate = ($scope.permitDetails.CarDate ? $filter('date')($scope.permitDetails.CarDate, "dd/MM/yyyy") : '');
            $scope.carDateClose = ($scope.permitDetails.CarDateClose ? $filter('date')($scope.permitDetails.CarDateClose, "dd/MM/yyyy") : '');
            $scope.carDriverDateClose = ($scope.permitDetails.CarDriverDateClose ? $filter('date')($scope.permitDetails.CarDriverDateClose, "dd/MM/yyyy") : '');
            $scope.auditorDateOpen = ($scope.permitDetails.AuditorDateOpen ? $filter('date')($scope.permitDetails.AuditorDateOpen, "dd/MM/yyyy HH:mm:ss") : '');
            $scope.auditorDateClose = ($scope.permitDetails.AuditorDateClose ? $filter('date')($scope.permitDetails.AuditorDateClose, "dd/MM/yyyy HH:mm:ss") : '');

            $scope.plateNo = $stateParams.plateNumber ? ($stateParams.plateNumber).replace("%", "/") : '';

        }

        $scope.getPermitDetails = () => {
            $("#loadingScreen").show();
            apiService.get('Customs/Vehicle/RegisterVehicleDetail', $scope.searchParameter, function (results) {
                $("#loadingScreen").hide();
                var result = results.data.ResponseResult;
                if (result.IsValid && result.Data) {
                    var res = result.Data.VehicleDetail;
                    $scope.permitDetails = res ? res[0] : '';
                    bindData();
                }
                else {
                    modalErrorShow(result.Messages);
                }
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log(response);
            });
        }
        $scope.init = function () {
    
            $scope.searchParameter =
            {
                centerCode: $stateParams.centerCode,
                plateNumber: $stateParams.plateNumber,
                plateColor: $stateParams.plateColor,
                plateCategory: $stateParams.plateCategory,
                plateOrigin: $stateParams.plateOrigin,
                PermitNo: $stateParams.PermitNo
            }
            $scope.permitDetails = {};
            $scope.getPermitDetails();
        }
        // init
        $scope.init();

    }]);