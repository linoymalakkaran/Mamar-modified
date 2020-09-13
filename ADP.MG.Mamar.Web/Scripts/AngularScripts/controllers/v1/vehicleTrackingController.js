angular.module('mamarApp').controller('vehicleTrackingController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$timeout',
		'$log', 'userAccountStorageFactory',
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

			try {
				$scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
			} catch (e) {
				$log.log('Failed to get user account details, error : ', e);
				$scope.isSuperUser = 'False';
			}

			//METHODS
			$scope.showRegistrationDetails = (permitDetails) => {
				$state.go('vehiclePermitDetails',
					{
						centerCode: $scope.selectedCenterCode,
						plateNumber: permitDetails.PlateNo,
						plateColor: permitDetails.PlateColor,
						plateCategory: permitDetails.PlateCategory,
						plateOrigin: permitDetails.PlateOrigin,
						PermitNo: permitDetails.PlateReferenceNumber
					},
					{ notify: true });
			}
			$scope.clearSearchFilters = () => {
				$scope.onCenterCodeChanged();
			}
			$scope.loadMoreRecords = function(newPageNo) {
				$scope.searchParameter.pageNumber = newPageNo;
				$scope.GetVehicleTracking();
			}

			function getSearchParameter() {
				if ($scope.selectedPlateColorObj && $scope.selectedPlateColorObj.originalObject) {
					$scope.searchParameter.PlateColor = $scope.selectedPlateColorObj.originalObject.Code
						? $scope.selectedPlateColorObj.originalObject.Code
						: '';
				}
				if ($scope.selectedPlateOriginObj && $scope.selectedPlateOriginObj.originalObject) {
					$scope.searchParameter.PlateOrigin = $scope.selectedPlateOriginObj.originalObject.Code
						? $scope.selectedPlateOriginObj.originalObject.Code
						: '';
				}
				if ($scope.selectedPlateCategoryObj && $scope.selectedPlateCategoryObj.originalObject) {
				    $scope.searchParameter.PlateCategory = $scope.selectedPlateCategoryObj.originalObject.CategoryCode
						? $scope.selectedPlateCategoryObj.originalObject.CategoryCode
						: '';
				}

			}

			function validateSearch() {
				$scope.isValid = true;
				if ($scope.searchParameter) {
					$scope.invalidMandatoryFields =
						(!$scope.searchParameter.PermitNumber && !$scope.searchParameter.PlateNumber) ? true : false;
					$scope.isValid = $scope.invalidMandatoryFields ? false : true;
				}
				var plateColorSelected = $scope.selectedPlateColorObj
					? $scope.selectedPlateColorObj.originalObject.Code +
					$scope.selectedPlateColorObj.originalObject.EngName +
					($scope.selectedPlateColorObj.originalObject.ArbName
						? $scope.selectedPlateColorObj.originalObject.ArbName
						: '')
					: '';
				if (($scope.selectedPlateColor &&
				(plateColorSelected == 0 ||
					($scope.selectedPlateColor.replace(/\s/g, '') != plateColorSelected.replace(/\s/g, ''))))) {
					$scope.invalidPlateColor = true;
					$scope.isValid = false;
				} else {
					$scope.invalidPlateColor = false;
				}

				var plateOriginSelected = $scope.selectedPlateOriginObj
					? $scope.selectedPlateOriginObj.originalObject.Code +
					($scope.selectedPlateOriginObj.originalObject.CountryEngName
						? $scope.selectedPlateOriginObj.originalObject.CountryEngName
						: '') +
					($scope.selectedPlateOriginObj.originalObject.CountryArbName
						? $scope.selectedPlateOriginObj.originalObject.CountryArbName
						: '')
					: '';
				if (($scope.selectedPlateOrigin &&
				(plateOriginSelected == 0 ||
					($scope.selectedPlateOrigin.replace(/\s/g, '') != plateOriginSelected.replace(/\s/g, ''))))) {
					$scope.invalidPlateOrigin = true;
					$scope.isValid = false;
				} else {
					$scope.invalidPlateOrigin = false;
				}

				var plateCategorySelected = $scope.selectedPlateCategoryObj
					? $scope.selectedPlateCategoryObj.originalObject.CategoryCode +
					$scope.selectedPlateCategoryObj.originalObject.CategoryEngName +
					($scope.selectedPlateCategoryObj.originalObject.CategoryArbName
						? $scope.selectedPlateCategoryObj.originalObject.CategoryArbName
						: '')
					: '';
				if (($scope.selectedPlateCategory &&
				(plateCategorySelected == 0 ||
					($scope.selectedPlateCategory.replace(/\s/g, '') != plateCategorySelected.replace(/\s/g, ''))))) {
					$scope.invalidPlateCategory = true;
					$scope.isValid = false;
				} else {
					$scope.invalidPlateCategory = false;
				}

			}

			//GET VEHICLE TRACKING LIST
			$scope.GetVehicleTracking = () => {
				validateSearch();
				if ($scope.isValid) {
					$scope.vehicleTrackingList = null;
					$scope.totalCount = 0;
					getSearchParameter();
					$("#loadingScreen").show();
					apiService.get('Customs/Vehicle/GetPermitList',
						$scope.searchParameter,
						function(results) {
							$("#loadingScreen").hide();
							var result = results.data.ResponseResult;
							if (result.IsValid && result.Data != null && result.Data.VehiclePermits) {
								$scope.vehicleTrackingList = result.Data.VehiclePermits;
								$scope.totalCount = result.Data.VehiclePermits[0].TotCount;
							} else {
                                modalErrorShow("No Records found!");//(result && result.Messages) ? result.Messages : "No Records found!");
							}
						},
						function error(response) {
							$("#loadingScreen").hide();
							console.log(response);
						});
				}
			}
			//GET CENTER CODES
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
			}

			//************************  EVENTS  ************************//
			$scope.onSearchButtonClick = () => {
				$scope.searchParameter.pageNumber = 1;
				$scope.GetVehicleTracking();
			}
			$scope.onModeChanged = function() {
				$scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
				$scope.selectedMode = $scope.selectedTransMode;
				$scope.getCenterCodes();
				$scope.vehicleTrackingList = null;
			}
			$scope.onCenterCodeChanged = function() {
				initialiseSearch();
				$scope.searchParameter.centerCode = $scope.selectedCenterCode;
				$scope.vehicleTrackingList = null;
			}
			$scope.downloadPermitNumber = function(permitNumber) {
				apiService.get('Customs/Vehicle/PrintPermit',
					{ centerCode: $scope.selectedCenterCode, PermitNumber: permitNumber },
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
						console.log('something went wrong' + response);
					});
			}
			//************************  EVENTS  ************************//

			///LOOKUP
			// GET PLATE ORIGIN LIST
			$scope.onPlateOriginChange = function(searchStr) {
				$scope.PopulatePlateOrigins(searchStr);
				$scope.rowIndex = 0;
				$scope.lookUpCurrentPagePlateOrigin = 1;
				if ($scope.plateOriginsFull) {
					$scope.plateOrigins = $scope.plateOriginsFull.filter(obj => {
						return obj.Code.toString().toLowerCase().includes($scope.searchPlateOriginText.toLowerCase()) ||
							(obj.CountryEngName &&
								obj.CountryEngName.toLowerCase()
								.includes($scope.searchPlateOriginText.toLowerCase())) ||
							(obj.CountryArbName &&
								obj.CountryArbName.toLowerCase().includes($scope.searchPlateOriginText.toLowerCase()));
					});
				}
			}
			$scope.searchPlateOriginText = '';

			$scope.plateOriginKeyDown = function(event) {
				if (event.key == 'F9') {
					$scope.openPlateOriginLookup();
				}
			}

			$scope.PopulatePlateOrigins = function(searchStr) {
				apiService.get('Customs/Lookup/UNCountries',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function(results) {
						$scope.plateOriginsFull = results.data.ResponseResult.Data;
						$scope.plateOrigins = angular.copy($scope.plateOriginsFull);
					},
					function error(response) {
						console.log(response);
					});
			}

			$scope.openPlateOriginLookup = function(item) {
				$scope.searchPlateOriginText = '';
				$('#plateOriginLookup').modal({
					backdrop: "static"
				});
				$('#searchPlateOriginText').focus();
				$('#searchPlateOriginText').select();
				$scope.onPlateOriginChange();
				$("#plateOriginLookup").off("keydown");
				$('#plateOriginLookup').bind('keydown',
					function(event) {
						$timeout(function() {
							switch (event.keyCode) {
							case 40:
								if ($scope.rowIndex < $scope.plateOrigins.length - 1) {
									$scope.rowIndex++;
									if ($scope.rowIndex > 10 * $scope.plateOrigins - 1) {
										$scope.lookUpCurrentPagePlateOrigin++;
									}
									$scope.plateOriginItemSelected = $scope.plateOrigins[$scope.rowIndex];
								}
								break;
							case 38:
								if ($scope.rowIndex > 0) {

									if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateOrigin - 1)) {
										$scope.lookUpCurrentPagePlateOrigin--;
									}
									$scope.rowIndex--;
									$scope.plateOriginItemSelected = $scope.plateOrigins[$scope.rowIndex];
								}
								break;
							case 13:
								$scope.setPlateOrigin($scope.plateOriginItemSelected);
								break;
							}
						});
					});
			}
			$scope.setPlateOrigin = function(row) {
				$scope.selectedPlateOrigin = row.Code.toString() +
					"     " +
					(row.CountryEngName ? row.CountryEngName : '') +
					"     " +
					(row.CountryArbName ? row.CountryArbName : '');
				$scope.selectedPlateOriginObj = {};
				$scope.selectedPlateOriginObj.originalObject = row;
				$("#plateOriginLookup").modal("hide");
			}
			$scope.$watch("searchPlateOriginText",
				function() {
					$scope.onPlateOriginChange($scope.searchPlateOriginText);
				});

			// GET PLATE CATEGORY LIST
			$scope.onPlateCatChange = function(searchStr) {
				$scope.PopulatePlateCategorys(searchStr);
				$scope.rowIndex = 0;
				$scope.lookUpCurrentPagePlateCategory = 1;
				if ($scope.plateCategorysFull) {
					$scope.plateCategorys = $scope.plateCategorysFull.filter(obj => {
						return obj.CategoryCode.toString().toLowerCase()
							.includes($scope.searchPlateCategoryText.toLowerCase()) ||
							(obj.CategoryEngName &&
								obj.CategoryEngName.toLowerCase().includes($scope.searchPlateCategoryText.toLowerCase())
							) ||
							(obj.CategoryArbName &&
								obj.CategoryArbName.toLowerCase()
								.includes($scope.searchPlateCategoryText.toLowerCase()));
					});
				}
			}
			$scope.searchPlateCategoryText = '';

			$scope.plateCategoryKeyDown = function(event) {
				if (event.key == 'F9') {
					$scope.openPlateCategoryLookup();
				}
			}

			$scope.PopulatePlateCategorys = function (searchStr) {
			    $scope.stoppedSearch = false;
				apiService.get('Customs/Lookup/PlateCategories',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function (results) {
					    $scope.stoppedSearch = true;
						$scope.plateCategorysFull = results.data.ResponseResult.Data;
						$scope.plateCategorys = angular.copy($scope.plateCategorysFull);
					},
					function error(response) {
					    console.log(response);
					    $scope.stoppedSearch = true;
					});
			};

			$scope.openPlateCategoryLookup = function(item) {
				$scope.searchPlateCategoryText = '';
				$('#plateCategoryLookup').modal({
					backdrop: "static"
				});
				$('#searchPlateCategoryText').focus();
				$('#searchPlateCategoryText').select();
				$scope.onPlateCatChange();
				$("#plateCategoryLookup").off("keydown");
				$('#plateCategoryLookup').bind('keydown',
					function(event) {
						$timeout(function() {
							switch (event.keyCode) {
							case 40:
								if ($scope.rowIndex < $scope.plateCategorys.length - 1) {
									$scope.rowIndex++;
									if ($scope.rowIndex > 10 * $scope.plateCategorys - 1) {
										$scope.lookUpCurrentPagePlateCategory++;
									}
									$scope.plateCategoryItemSelected = $scope.plateCategorys[$scope.rowIndex];
								}
								break;
							case 38:
								if ($scope.rowIndex > 0) {

									if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateCategory - 1)) {
										$scope.lookUpCurrentPagePlateCategory--;
									}
									$scope.rowIndex--;
									$scope.plateCategoryItemSelected = $scope.plateCategorys[$scope.rowIndex];
								}
								break;
							case 13:
								$scope.setPlateCategory($scope.plateCategoryItemSelected);
								break;
							}
						});
					});
			}
			$scope.setPlateCategory = function(row) {
				$scope.selectedPlateCategory = row.CategoryCode.toString() +
					"     " +
					(row.CategoryEngName ? row.CategoryEngName : '') +
					"     " +
					(row.CategoryArbName ? row.CategoryArbName : '');
				$scope.selectedPlateCategoryObj = {};
				$scope.selectedPlateCategoryObj.originalObject = row;
				$("#plateCategoryLookup").modal("hide");
			}
			$scope.$watch("searchPlateCategoryText",
				function() {
					$scope.onPlateCatChange($scope.searchPlateCategoryText);
				});
			// GET PLATE COLOR LIST
			$scope.onPlateColorChange = function(searchStr) {
				$scope.PopulatePlateColors(searchStr);
				$scope.rowIndex = 0;
				$scope.lookUpCurrentPagePlateColor = 1;
				if ($scope.plateColorsFull) {
					$scope.plateColors = $scope.plateColorsFull.filter(obj => {
						return obj.Code.toString().toLowerCase().includes($scope.searchPlateColorText.toLowerCase()) ||
							(obj.EngName &&
								obj.EngName.toLowerCase().includes($scope.searchPlateColorText.toLowerCase())) ||
							(obj.ArbName &&
								obj.ArbName.toLowerCase().includes($scope.searchPlateColorText.toLowerCase()));
					});
				}
			}
			$scope.searchPlateColorText = '';
			$scope.plateColorKeyDown = function(event) {
				if (event.key == 'F9') {
					$scope.openPlateColorLookup();
				}
			}
			$scope.PopulatePlateColors = function(searchStr) {
				apiService.get('Customs/Lookup/PlateColors',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function(results) {
						$scope.plateColorsFull = results.data.ResponseResult.Data;
						$scope.plateColors = angular.copy($scope.plateColorsFull);
					},
					function error(response) {
						console.log(response);
					});
			}

			$scope.openPlateColorLookup = function(item) {
				$scope.searchPlateColorText = '';
				$('#plateColorLookup').modal({
					backdrop: "static"
				});
				$('#searchPlateColorText').focus();
				$('#searchPlateColorText').select();
				$scope.onPlateColorChange();
				$("#plateColorLookup").off("keydown");
				$('#plateColorLookup').bind('keydown',
					function(event) {
						$timeout(function() {
							switch (event.keyCode) {
							case 40:
								if ($scope.rowIndex < $scope.plateColors.length - 1) {
									$scope.rowIndex++;
									if ($scope.rowIndex > 10 * $scope.plateColors - 1) {
										$scope.lookUpCurrentPagePlateColor++;
									}
									$scope.plateColorItemSelected = $scope.plateColors[$scope.rowIndex];
								}
								break;
							case 38:
								if ($scope.rowIndex > 0) {

									if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPagePlateColor - 1)) {
										$scope.lookUpCurrentPagePlateColor--;
									}
									$scope.rowIndex--;
									$scope.plateColorItemSelected = $scope.plateColors[$scope.rowIndex];
								}
								break;
							case 13:
								$scope.setPlateColor($scope.plateColorItemSelected);
								break;
							}
						});
					});
			}
			$scope.setPlateColor = function(row) {
				$scope.selectedPlateColor = row.Code.toString() +
					"     " +
					(row.EngName ? row.EngName : '') +
					"     " +
					(row.ArbName ? row.ArbName : '');
				$scope.selectedPlateColorObj = {};
				$scope.selectedPlateColorObj.originalObject = row;
				$("#plateColorLookup").modal("hide");
			}
			$scope.$watch("searchPlateColorText",
				function() {
					$scope.onPlateColorChange($scope.searchPlateColorText);
				});

			///LOOKUP
			////////******************************** PAGE LOAD & INITIALIZATION *************************//
			function initialiseSearch() {
				$scope.isValid = true;
				$scope.invalidMandatoryFields = false;

				$scope.selectedPlateColor = '';
				$scope.selectedPlateOrigin = '';
				$scope.selectedPlateCategory = '';

				$scope.selectedPlateColorObj = {};
				$scope.selectedPlateColorObj.originalObject = {};
				$scope.selectedPlateOriginObj = {};
				$scope.selectedPlateOriginObj.originalObject = {};
				$scope.selectedPlateCategoryObj = {};
				$scope.selectedPlateCategoryObj.originalObject = {};

				$scope.searchParameter = {
					centerCode: '',
					PlateNumber: '',
					PlateColor: '',
					PlateCategory: '',
					PlateOrigin: '',
					PermitNumber: '',
					pageNumber: 1,
					pageSize: 10,
					CenterOpen: '',
					CenterClose: '',
					dateOpen: '',
					dateClose: '',
					ownerName: ''
				};
			}

			$scope.init = () => {

				$scope.transModes = apiService.getTransportModeList();
				$scope.selectedTransMode = $scope.transModes ? $scope.transModes[0].key : '';
				$scope.centerCodelookUpParams = {
					transportMode: $scope.selectedTransMode,
					searchString: ''
				};
				$scope.onModeChanged();
			}

			//on Load 
			$scope.init();
		}
	]);