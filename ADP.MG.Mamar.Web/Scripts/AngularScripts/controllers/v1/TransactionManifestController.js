angular.module('mamarApp').controller('TransactionManifestController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$log',
		'userAccountStorageFactory', '$filter',
		function($scope,
			$rootScope,
			$http,
			$state,
			$stateParams,
			apiService,
			sharedModels,
			$log,
			userAccountStorageFactory,
			$filter) {

			try {
				$scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
			} catch (e) {
				$log.log('Failed to get user account details, error : ', e);
				$scope.isSuperUser = 'False';
			}

			//Event -- Begin
			$scope.onModeChanged = function() {
				$scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
				$scope.selectedMode = $scope.selectedTransMode;
				$scope.getCenterCodes();
				$scope.transactionManifest = null;
			};
			$scope.onCenterCodeChanged = function() {
				initialiseSearch();
				$scope.searchParameter.centerCode = $scope.selectedCenterCode;
				$scope.transactionManifest = null;
			};
			$scope.getTransactionManifestDetails = function(pagenum) {
				$scope.searchParameter.pageNumber = pagenum;
				if (pagenum == 1) {
					$scope.isAddNewDisable = false;
					$scope.seal = null;
				}
				$("#loadingScreen").show();
				apiService.get('Customs/Manifest/GetManifestTransaction',
					$scope.searchParameter,
					function(results) {
						$("#loadingScreen").hide();
						if (results.data.ResponseResult != "") {
							var result = results.data.ResponseResult;
							$scope.transactionManifest = result.Data;
							if (result.IsValid) {
								if ($scope.transactionManifest.SealDetail) {
									$scope.isShowTransactionManifest = true;
								} else {
									$("#txtJobnumber").focus();
								}
								if ($scope.transactionManifest.SealList) {
									$scope.totalCount = $scope.transactionManifest.SealList[0].TotCount;
									$.each($scope.transactionManifest.SealList,
										function(index, value) {
											value.CreatedDate = $filter('date')(new Date(value.CreatedDate),
												"dd/MM/yyyy HH:mm:ss");
										});
								}

							} else {
								modalErrorShow(result.Messages);
							}
						}

					},
					function error(response) {
						$("#loadingScreen").hide();
						console.log('something went wrong' + response);
					});
			};
			$scope.addSeal = function() {
				$scope.isAddNewDisable = true;
				var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
				$scope.seal = {
					JobNumber: $scope.searchParameter.jobNumber,
					SNo: null,
					SealNumber: null,
					UserCreated: userAccntInfo.CCode.split("-")[1].trim(),
					CreatedDate: $filter('date')(new Date(), "dd/MM/yyyy HH:mm:ss")
				};
			};

			$scope.loadMoreRecords = function(newPageNo) {
				$scope.deleteSeal();
				$scope.getTransactionManifestDetails(newPageNo);
			};
			$scope.saveSeal = function(seal) {
				$("#loadingScreen").show();
				var saveParameter = {
					CenterCode: $scope.searchParameter.centerCode,
					JobNumber: seal.JobNumber,
					SealNumber: seal.SealNumber
				};
				apiService.post('Customs/Manifest/AddSealInfo',
					'',
					saveParameter,
					function(results) {
						$("#loadingScreen").hide();
						var result = results.data.ResponseResult;
						if (result.IsValid) {
							$('#successModal').modal('show');
							$scope.getTransactionManifestDetails(1);
							$scope.isAddNewDisable = false;
						} else {
							modalErrorShow(result.Messages);
						}
					},
					function error(response) {
						$("#loadingScreen").hide();
						console.log('something went wrong' + response);
					});
			};
			$scope.deleteSeal = function() {
				$scope.isAddNewDisable = false;
				$scope.seal = null;
			};

			//Event -- End

			//Lookup -- Begin

			$scope.getCenterCodes = () => {
				apiService.get('Customs/Lookup/CenterCodes',
					$scope.centerCodelookUpParams,
					function(results) {
						if (results.data.ResponseResult != "") {
							$scope.centerCodes = results.data.ResponseResult.Data;
							if ($scope.centerCodes) {
								var selectedCenter = $filter('filter')($scope.centerCodes,
									function(cenCode) { return (cenCode.Code == 'V') });
								$scope.selectedCenterCode = selectedCenter.length == 1
									? selectedCenter[0].Code
									: $scope.centerCodes.length > 0
									? $scope.centerCodes[0].Code
									: "";
								$scope.onCenterCodeChanged();
							}
						} else {
							$("#loadingScreen").hide();
						}
					},
					function error(response) {
						$("#loadingScreen").hide();
						console.log('something went wrong in LoadLookupCentreCodes' + response);
					});
			};
			//Lookup -- End

			function initialiseSearch() {
				$scope.isShowTransactionManifest = false;
				$scope.isSaveDisable = true;
				$scope.isAddNewDisable = false;
				$scope.searchParameter = {
					centerCode: '',
					jobNumber: '',
					pageNumber: 0,
					pageSize: 10
				};
			};

			$scope.init = () => {

				$scope.transModes = apiService.getTransportModeList();
				$scope.selectedTransMode = $scope.transModes ? $scope.transModes[0].key : '';
				$scope.centerCodelookUpParams = {
					transportMode: $scope.selectedTransMode,
					searchString: ''
				};

				$scope.onModeChanged();
			};

			//on Load 
			$scope.init();
		}
	]);