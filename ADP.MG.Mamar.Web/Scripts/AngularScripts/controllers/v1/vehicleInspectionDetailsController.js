angular.module('mamarApp').controller('vehicleInspectionDetailsController',
    ['$scope', '$rootScope', '$state', '$stateParams', '$filter', '$timeout', 'apiService', '$uibModal', 'sharedModels', 'userAccountStorageFactory', '$storage',
        function ($scope, $rootScope, $state, $stateParams, $filter, $timeout, apiService, $uibModal, sharedModels, userAccountStorageFactory, $storage) {

            $scope.$storage = $storage;
        }
    ]
);