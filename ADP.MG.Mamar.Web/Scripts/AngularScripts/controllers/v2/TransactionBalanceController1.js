angular.module('mamarApp').controller('TransactionBalanceController1',
	[
		'$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', 'sharedModels',
		'userAccountStorageFactory', '$timeout', '$log',
		function($scope,
			$rootScope,
			$state,
			$stateParams,
			$filter,
			apiService,
			$uibModal,
			sharedModels,
			userAccountStorageFactory,
			$timeout,
			$log) {

			try {
				$scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
			} catch (e) {
				$log.log('Failed to get user account details, error : ', e);
				$scope.isSuperUser = 'False';
			}

			$scope.selectedLanguage = $('#selLang :selected').text() == "Arabic"
				? 'ae'
				: $('#selLang :selected').text() == "English"
				? 'en'
				: 'en';
			$scope.centerCodeShipment = $stateParams.centerCode;
			//$scope.jobNoShipment = '';
			var billType = $stateParams.BillType;
			$scope.impExpCategory = $stateParams.ImporterExporterCode;
			$scope.pageNumber = 1;
			$scope.pageSize = 10;
			$scope.globalDisableFlag = $stateParams.globalDisableFlag == "view";


			$scope.parameters = [];

			$scope.closeModalPopUp = function() {
				$scope.initialiseChassisDetails();
				$('#chassisModal').modal('hide');
			};
			//#region Get/Load menthod during page load.
			$scope.GetChassisList = function() {
				$("#loadingScreen").show();
				var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
				var check = userAccntInfo.CCode.includes("CONSOLIDATOR");
				if (check == true) {
					$scope.ISConsolidate = true;
				} else {
					$scope.ISConsolidate = false;
				}
				apiService.get('Customs/MPayment/GetTransBalance',
					$scope.parameters,
					function(results) {
						//debugger;
						$scope.chassisList = results.data.ResponseResult.Data;
						console.log($scope.chassisList);
						$("#loadingScreen").hide();
						if ($scope.chassisList != null && $scope.chassisList.length > 0) {
							$scope.totalCount = $scope.chassisList[0].TotalCount;
						}
					},
					function error(response) {
						//console.log('something went wrong in GetChassisList' + response);
						$("#loadingScreen").hide();
					});
			}

			//Load Center Code
			$scope.LoadCenterCodes = function() {
				$scope.lkupCntrCodepm = {
					transportMode: '',
					searchString: ''
				};
				apiService.get('Customs/Lookup/CenterCodes',
					$scope.lkupCntrCodepm,
					function(results) {
						$scope.centerCodes = results.data.ResponseResult.Data;
						if ($scope.centerCodes) {
							var selectedCenter = $filter('filter')($scope.centerCodes,
								function(cenCode) { return (cenCode.Code == 'V') });
							$scope.selCenterCode = selectedCenter.length == 1
								? selectedCenter[0].Code
								: $scope.centerCodes.length > 0
								? $scope.centerCodes[0].Code
								: "";
							$scope.parameters = {
								centerCode: $scope.selCenterCode,
								pageNumber: 1,
								pageSize: 10,
							};
							$scope.GetChassisList();
						}
					},
					function error(response) {
						console.log('something went wrong in LoadLookupCentreCodes' + response);
					});
			}
			///
			$scope.GetSearchResult = function() {
				$scope.chassisList = {
				};
				$scope.pageNumber = 1;
				$scope.deleteSuccess = false;
				$scope.deleteFailed = false;
				$scope.parameters.searchString = $scope.searchString;
				$scope.GetChassisList();
			}
			// load More Records
			$scope.loadMoreRecords = function(newPageNo) {
				$scope.parameters.pageNumber = newPageNo;
				$scope.pageNumber = newPageNo;
				$scope.GetChassisList();
			}
			$scope.chassisNoChanged = function() {
				if (!$scope.parameters.searchString) {
					$scope.GetChassisList();
				}
			}

			$scope.Initialize = function() {
				// get Chassis list
				debugger;
				$scope.LoadCenterCodes();
			}

			$scope.DownloadGatePass = function(data) {
				$("#loadingScreen").show();
				$scope.gatePassParameter = {
					centerCode: data.Center
				}
				apiService.get('Customs/Reporting/GetTransBalanceReport',
					$scope.gatePassParameter,
					function(results) {
						$("#loadingScreen").hide();
						var resultData = results.data.ResponseResult;
						if (resultData.IsValid) {
							apiService.printDocuments(resultData.Data);
						} else {
							modalErrorShow(resultData.Messages);
						}
					},
					function error(response) {
						$("#loadingScreen").hide();
						console.log('Transaction Balance' + response);
					});
			}
			//Delete Chassis
			$scope.deleteConfirm = function(index) {
				$("#ConfirmDeleteModalPopup").modal("show");
				$scope.deleteRowIndex = index;
			}
			$scope.deleteOkay = function() {
				$("#loadingScreen").show();
				$scope.deleteSuccess = false;
				$scope.deleteFailed = false;
				$("#ConfirmDeleteModalPopup").modal("hide");
				var param = $scope.chassisList[$scope.deleteRowIndex];
				var data = {
					chassisNumber: param.ChassisNumber,
					centerCode: sharedModels.ShipmentDraft.centerCode,
					houseBLNumber: sharedModels.ShipmentDraft.HouseBLNumber,
					MasterBLNumber: sharedModels.ShipmentDraft.MasterBLNumber,
					voyageNumber: sharedModels.ShipmentDraft.VoyageNumber,
					vesselCode: sharedModels.ShipmentDraft.VesselCode
				}
				debugger;
				apiService.get('Customs/Manifest/DeleteChassis',
					data,
					function(result) {
						$("#loadingScreen").hide();
						var data = result.data.ResponseResult;
						if (data.IsValid) {
							$scope.pageNumber = 1;
							$scope.GetChassisList();
							$('#successModal').modal('show');
							$scope.closeModalPopUp();
						} else if (!data.IsValid) {
							modalErrorShow(msg);
						}
					},
					function(result) {
						$("#loadingScreen").hide();
						var msg = apiService.formatResponseMessage(response.Messages);
						modalErrorShow(msg);
					});
			}
			$scope.Initialize();

		}
	]
);