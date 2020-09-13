angular.module('mamarApp').controller('transactionHistoryController', ['$scope', '$rootScope', '$http', '$state', '$stateParams',
    function ($scope, $rootScope, $http, $state, $stateParams) {
        debugger;
        $scope.user = {};
        $scope.user.UserName = "test";
        $scope.user.Password = '';        
        console.log($scope.Title);

        $scope.SearchParams={
            
        };


        function searchJobs() {
            apiService.post("/", '', $scope.SearchParams, function (data) {

                if (data.data.StatusIsSuccessful) {
                    $scope.authError = "";

                    
                    $('#updateModel').modal('show');
                }
                else {
                    $scope.authError = JSON.parse(data.data.ResponseResult).Message;
                }
            }, function (error) {
                $scope.authError = JSON.parse(data.data.ResponseResult).Message;

            });
        }

    }]);