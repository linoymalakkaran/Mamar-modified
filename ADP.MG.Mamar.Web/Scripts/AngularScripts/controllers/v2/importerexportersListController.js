angular.module('mamarApp').controller('importerexportersListController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter', '$log',
		'userAccountStorageFactory',
		function($scope,
			$rootScope,
			$http,
			$state,
			$stateParams,
			apiService,
			sharedModels,
			$filter,
			$log,
			userAccountStorageFactory) {
			$scope.transModes = [
				{ key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
				{ key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
			];
			$scope.selectedTransMode = $scope.transModes[0].key;

			$scope.centerCodelookUpParams = {
				transportMode: $scope.selectedTransMode,
				searchString: ''
			};

			try {
				$scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
			} catch (e) {
				$log.log('Failed to get user account details, error : ', e);
				$scope.isSuperUser = 'False';
			}

			function InitialiseSearch() {
				$scope.searchParameter = {
					telephone: '',
					mobile: '',
					fax: '',
					email: '',
					fileNumber: '',
					cityCode: '',
					addcCode: '',
					municipCode: '',
					poBox: '',
					importerCode: '',
					categoryCode: '',
                    importername: '',
                    uaeId:'',
					vatTrn: '',
					pageSize: 10,
					orderBy: '',
					pageNumber: 1,
					searchString: ''
				};
			}

			function ResetPageNumber() {
				$scope.searchParameter.pageNumber = 1;
			}

			// init
			$scope.initPendingTrans = function() {
				$("#loadingScreen").show();
				InitialiseSearch();
				if (!apiService.isNullOrEmptyOrUndefined($scope.selectedTransMode)) {
					$scope.getCenterCodes();


				}
			}
			$scope.loadMoreRecords = function(newPageNo) {
				$scope.searchParameter.pageNumber = newPageNo;
				$scope.PopulateData();
			}
			$scope.onModeChanged = function() {
				$scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
				$scope.selectedMode = $scope.selectedTransMode;
				$scope.getCenterCodes();
				$scope.importerExporterData = null;
			}
			$scope.onCenterCodeChanged = function() {
				InitialiseSearch();
				$scope.searchParameter.centerCode = $scope.selectedCenterCode;
				// $scope.PopulateData();
				$scope.importerExporterData = null;
			}

			$scope.getCenterCodes = function() {
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
								$scope.centerCode = $scope.selectedCenterCode;
								if (typeof $scope.searchParameter == "undefined") {
									$scope.searchParameter = {};
								}
								$scope.searchParameter.centerCode = $scope.selectedCenterCode;
								$scope.onCenterCodeChanged();
								GetCategoryCodes();
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

			function GetCategoryCodes() {
				apiService.get('Customs/Lookup/ImporterCategory',
					{
						centerCode: $scope.centerCode,
						searchString: ''
					},
					function(results) {
						$scope.categoryCodes = results.data.ResponseResult.Data;
						$("#selectCategory").select2();
					},
					function error(response) {
						modalErrorShow("An Error has occurred while getting lookup Data!");
					}
				);
			}

			//$scope.categoryCodeChanged = function () {
			//    console.log($scope.searchParameter.categoryCodeDesc);
			//}
			$scope.PopulateData = function() {
				$("#loadingScreen").show();
				apiService.get('Customs/ImporterExporter/GetImportExporter',
					$scope.searchParameter,
					function(results) {
						if (results.data.ResponseResult != "") {
							$scope.importerExporterData = results.data.ResponseResult.Data;
							if ($scope.importerExporterData != null) {
								$scope.totalCount = $scope.importerExporterData[0].TotalCount;
							}
						}
						$("#loadingScreen").hide();

					},
					function error(err) {
						$("#loadingScreen").hide();
						$log.log(err);
					});
			}
			$scope.clearSearchFilters = function() {
				InitialiseSearch();
				$scope.searchParameter.centerCode = $scope.selectedCenterCode;
				$scope.PopulateData();
			}
			$scope.searchResults = function() {
				if (typeof $scope.searchParameter == "undefined") {
					$scope.searchParameter = {};
				}
				$scope.searchParameter.pageNumber = 1;
				$scope.PopulateData();
			}
			$scope.getCenterCodes();

		}
	]);