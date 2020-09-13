angular.module('mamarApp').controller('pendingTransactionsController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$timeout', '$log',
		'userAccountStorageFactory',
		function($scope,
			$rootScope,
			$http,
			$state,
			$stateParams,
			apiService,
			$filter,
			$timeout,
			$log,
			userAccountStorageFactory) {

			//$scope.$parent.loading = true;
			$scope.transModes = [
				{ key: "M", value: "Sea Cargo شحن بحري" }, { key: "A", value: "Air Cargo شحن جوي" },
				{ key: "R", value: "Land Cargo شحن بري" }, { key: "Z", value: "Free Zone منطقة حرة" }
			];
			$scope.selectedTransMode = $scope.transModes[0].key;
			$scope.selectedCenterCode = '';
			$scope.selectedTab = 'Y';

			$scope.searchParams = {
				centerCode: '',
				jobNumber: '',
				startDate: '',
				endDate: '',
				pageNumber: 1,
				pageSize: 10
			};

			$scope.searchPendingBillsParams = angular.copy($scope.searchParams);
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


			// reset search params - jobNumber, startDate and endDate
			$scope.resetSearchFilters = function() {
				$scope.searchParams.jobNumber = $scope.searchPendingBillsParams.jobNumber = '';
				$scope.searchParams.startDate = $scope.searchPendingBillsParams.startDate = '';
				$scope.searchParams.endDate = $scope.searchPendingBillsParams.endDate = '';
			}

			// reset pageNo and pageSize
			$scope.resetPageVal = function() {
				$scope.searchParams.pageNumber = $scope.searchPendingBillsParams.pageNumber = 1;
				$scope.searchParams.pageSize = $scope.searchPendingBillsParams.pageSize = 10;
			}


			// Get Center Code LookUp
			$scope.getCenterCodes = function() {
				apiService.get('Customs/Lookup/CenterCodes',
					$scope.centerCodelookUpParams,
					function(results) {
						$scope.centerCodes = results.data.ResponseResult.Data;
						if ($scope.centerCodes) {
							var selectedCenter = $filter('filter')($scope.centerCodes,
								function(cenCode) { return (cenCode.Code == 'V') });
							$scope.selectedCenterCode = selectedCenter.length == 1
								? selectedCenter[0].Code
								: $scope.centerCodes.length > 0
								? $scope.centerCodes[0].Code
								: "";
							$scope.searchParams.centerCode = $scope.searchPendingBillsParams.centerCode =
								$scope.selectedCenterCode;
							$scope.onCenterCodeChanged();
						}
					},
					function error(response) {
						console.log('something went wrong in LoadLookupCentreCodes' + response);
					});
			}

			// on transport mode changed
			$scope.onModeChanged = function() {
				$scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
				$scope.getCenterCodes();
			}

			// on center code changed
			$scope.onCenterCodeChanged = function() {
				$scope.searchParams.centerCode = $scope.searchPendingBillsParams.centerCode = $scope.selectedCenterCode;
				$scope.resetSearchFilters();
				$scope.getAllPendingTrans($scope.selectedTab);
			}


			// init
			$scope.initPendingTrans = function() {
				if (!apiService.isNullOrEmptyOrUndefined($scope.selectedTransMode)) {
					$scope.getCenterCodes();
				}
			}

			// get yellow channel transactions
			$scope.getYellowChannelTrans = function() {
				if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCenterCode)) {
					$("#loadingScreen").show();
					apiService.get('Customs/PendingTransaction/GetYellowPendingTrans',
						$scope.searchParams,
						function(results) {
							$("#loadingScreen").hide();
							var data = results.data.ResponseResult.Data;
							if (data != null && data.PendingTransactions != null) {
								$scope.yellowChannelTransList = data.PendingTransactions;
								$scope.totalCount = data.PendingTransactions.length > 0
									? data.PendingTransactions[0].TotalCount
									: "";
							} else {
								$scope.yellowChannelTransList = [];
							}
						},
						function error(response) {
							$("#loadingScreen").hide();
							console.log(response);
						});
				}
			}

			// get pending transactions
			$scope.getPendingBills = function() {
				if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCenterCode)) {
					$("#loadingScreen").show();
					apiService.get('Customs/PendingTransaction/GetPendingBillTrans',
						$scope.searchPendingBillsParams,
						function(results) {
							$("#loadingScreen").hide();
							var data = results.data.ResponseResult.Data;
							if (data != null && data.BillTransactions != null) {
								$scope.pendingBills = data.BillTransactions;
								$scope.billsTotalCount = data.BillTransactions.length > 0
									? data.BillTransactions[0].TotalCount
									: "";
							} else {
								$scope.pendingBills = [];
							}
						},
						function error(response) {
							$("#loadingScreen").hide();
							console.log(response);
						});
				}
			}

			// get all pending trans by selectedTab
			$scope.getAllPendingTrans = function(selectedTab) {
				$scope.selectedTab = selectedTab;
				if (selectedTab == 'Y') {
					$scope.getYellowChannelTrans();
				} else if (selectedTab == 'P') {
					$scope.searchPendingBillsParams.jobNumber = angular.copy($scope.searchParams.jobNumber);
					$scope.searchPendingBillsParams.startDate = angular.copy($scope.searchParams.startDate);
					$scope.searchPendingBillsParams.endDate = angular.copy($scope.searchParams.endDate);
					$scope.getPendingBills();
				}
			}

			// on tab change
			$scope.onTabChanged = function(selectedTab) {
				$scope.resetSearchFilters();
				$scope.resetPageVal();
				$scope.yellowChannelTransList = [];
				$scope.pendingBills = [];
				$scope.getAllPendingTrans(selectedTab);
			}

			// validate start date and end date
			$scope.validateDateRange = function() {
				var isValidDate = true;
				if (!apiService.isNullOrEmptyOrUndefined($scope.searchParams.startDate) &&
					!apiService.isNullOrEmptyOrUndefined($scope.searchParams.endDate)) {
					var dtStart = apiService.formatDateObject($scope.searchParams.startDate);
					var dtEnd = apiService.formatDateObject($scope.searchParams.endDate);
					if (dtStart > dtEnd) {
						isValidDate = false;
					};
				}
				return isValidDate;
			}

			// get list of pending transactions by Search filters
			$scope.getPendingTransBySearch = function() {
				var isValidDate = $scope.validateDateRange();
				if (isValidDate) {
					$scope.resetPageVal();
					$scope.getAllPendingTrans($scope.selectedTab);
				} else {
					var errMsg = $filter('translate')('ErrInValidDate');
					modalErrorShow(errMsg);
				}

			}

			// load More Records
			$scope.loadMoreRecords = function(newPageNo) {
				$scope.searchParams.pageNumber = newPageNo;
				$scope.getAllPendingTrans($scope.selectedTab);
			}

			// load More Bills
			$scope.loadMoreBills = function(newPageNo) {
				$scope.searchPendingBillsParams.pageNumber = newPageNo;
				$scope.getAllPendingTrans($scope.selectedTab);
			}

			// process pending transactions
			$scope.processPendingTrans = function(jobNo, selectedTab) {
				var serviceUrl = selectedTab == 'Y'
					? 'Customs/Reporting/ProcessYellowChannel'
					: selectedTab == 'P'
					? 'Customs/Reporting/ProcessOtherChannel'
					: '';
				$("#loadingScreen").show();
				apiService.get(serviceUrl,
					{ centerCode: $scope.selectedCenterCode, jobNumber: jobNo },
					function(results) {
						$("#loadingScreen").hide();
						var data = results.data.ResponseResult;
						if (data.Data != null && data.Data.length > 0) {
							//print report
							apiService.printDocuments(data.Data);
						} else if (!data.IsValid) {
							var msg = data.Messages ? apiService.formatResponseMessageObject(data.Messages) : "Error";
							modalErrorShow(msg.eng + ' - ' + msg.arb);
						}
					},
					function error(response) {
						$("#loadingScreen").hide();
						console.log(response);
					});

			}

			// clear search filters and load default data
			$scope.clearSearchFilters = function() {
				$scope.resetSearchFilters();
				$scope.getAllPendingTrans($scope.selectedTab);
			}

			// watch selected tab change
			//$scope.$watch("selectedTab", function () {
			//    $scope.resetSearchFilters();
			//    $scope.resetPageVal();
			//    $scope.yellowChannelTransList = [];
			//    $scope.pendingBills = [];
			//});

			$scope.initPendingTrans();


		}
	]);