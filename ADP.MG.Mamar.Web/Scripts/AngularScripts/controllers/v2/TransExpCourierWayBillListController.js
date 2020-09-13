angular.module('mamarApp').controller('TransExpCourierWayBillListController',
	[
		'$scope', '$rootScope', '$state', '$stateParams', '$filter', '$timeout', 'apiService', '$uibModal',
		'sharedModels', 'userAccountStorageFactory', '$storage', '$log',
		function($scope,
			$rootScope,
			$state,
			$stateParams,
			$filter,
			$timeout,
			apiService,
			$uibModal,
			sharedModels,
			userAccountStorageFactory,
			$storage,
			$log) {
            
            //Get Super User flag
		    try {
		        $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
		    } catch (e) {
		        $log.log('Failed to get user account details, error : ', e);
		        $scope.isSuperUser = 'False';
		    }

			$scope.searchParams = {
				CenterCode: '',
				CourierCenterCode: '',
				CourierCode: '',
				CourierAgentCode: '',
				StartDate: '',
                EndDate: '',
                CreatedUser:'',
				Pagenumber: 1,
				PageSize: 10
			};

			$scope.expressCourierList = [];
			$scope.totalCount = '';


			try {
				$scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
			} catch (e) {
				$log.log('Failed to get user account details, error : ', e);
				$scope.isSuperUser = 'False';
			}

			// Get Center Code LookUp
			$scope.getCenterCodes = () => {
				$scope.centerCodelookUpParams = {
					transportMode: $scope.selectedTransMode,
					searchString: ''
				};
				$("#loadingScreen").show();
				apiService.get('Customs/Lookup/CenterCodes',
					$scope.centerCodelookUpParams,
					(results) => {
					    $("#loadingScreen").hide();
						$scope.centerCodes = results.data.ResponseResult.Data;
                        if ($scope.centerCodes) {
                            debugger;
							var selectedCenter = $filter('filter')($scope.centerCodes,
                                (cenCode) => { return (cenCode.Code == 'A') });
							$scope.selectedCenterCode = selectedCenter.length === 1
								? selectedCenter[0].Code
								: $scope.centerCodes.length > 0
								? $scope.centerCodes[0].Code
								: "";
                            $scope.searchParams.CenterCode = $scope.selectedCenterCode;

                            var selectedCenterCodes = $filter('filter')($scope.centerCodes,
                                (cenCode) => { return (cenCode.Code == 'A') });

                            $scope.CenterCode = selectedCenterCodes[0].Code;
                            $scope.CenterArabicName = selectedCenterCodes[0].ArabicName;
                            $scope.CenterEnglishName = selectedCenterCodes[0].EnglishName;

                            //$scope.onCenterCodeChanged();
                            //$scope.getPendingTrans();
						}
					},
					(err) => {
					    $("#loadingScreen").hide();
						$log.log('something went wrong in LoadLookupCentreCodes', err);
					});
			}

            $scope.onCenterCodeChanged = () => {
                debugger;
                $scope.searchParams.CenterCode = $scope.selectedCenterCode;
                var selectedCenterCodes = $filter('filter')($scope.centerCodes,
                    (cenCode) => { return (cenCode.Code == $scope.searchParams.CenterCode) });

                $scope.CenterCode = selectedCenterCodes[0].Code;
                $scope.CenterArabicName = selectedCenterCodes[0].ArabicName;
                $scope.CenterEnglishName = selectedCenterCodes[0].EnglishName;

				$scope.clearSearchFilters();
			}

			// reset search params - jobNumber, startDate and endDate
            $scope.clearSearchFilters = () => {
                $scope.selectedCourierCenter= '';
                $scope.selectedExpressAgent = '';
                $scope.selectedCourierCreatedUser = '';
                $scope.searchParams.CourierAgentCode = '';

                $scope.selectedCourierCenter = '';
                 
                $scope.selectedExpressAgent=''
                $scope.selectedCourierCreatedUser = '';
                

				$scope.searchParams = {
					CenterCode: $scope.selectedCenterCode,
					CourierCenterCode: '',
					CourierCode: '',
					CourierAgentCode: '',
					StartDate: '',
					EndDate: '',
					Pagenumber: 1,
                    PageSize: 10
				};

                //$scope.getPendingTrans();
				$scope.expressCourierList = [];
			}
		    // validate start date and end date
            function validateDateRange() {
                $scope.isValidDate = true;
                if ($scope.searchParams.StartDate && $scope.searchParams.EndDate) {
                    var dtStart = apiService.formatDateObject($scope.searchParams.StartDate);
                    var dtEnd = apiService.formatDateObject($scope.searchParams.EndDate);
                    if (dtStart > dtEnd) {
                        $scope.isValidDate = false;
                    };
                }
            }
            $scope.getPendingTrans = (data) => {
                
                if (data != false) {
                    $scope.getSearchParameter();
                }
                validateDateRange();
                if (!$scope.isValidDate) {
                    var errMsg = $filter('translate')('ErrInValidDate');
                    modalErrorShow(errMsg);
                    return;
                }

                $("#loadingScreen").show();
				$log.log('Center Code', $scope.searchParams);
				apiService.get('Customs/ImporterExporter/ExpressCourier',
					$scope.searchParams,
					(results) => {
						$("#loadingScreen").hide();
                        if (results.data.ResponseResult.IsValid == true) 
                        {
                            $scope.expressCourierList = [];
                            $scope.expressCourierList = results.data.ResponseResult.Data;
                            $scope.expressCourierList.map((item) =>
                            {
                                item.CenterCodeDescribtion = item.CenterCode + " " + item.CenterNameEng + " " + item.CenterName; 
                            });

                            if ($scope.expressCourierList != null) {
                                $scope.totalCount = $scope.expressCourierList[0].TotalCount;
                            }
                        }
                        else {
                            modalErrorShow(results.data.ResponseResult.Messages);
                            $scope.expressCourierList = [];
                            $("#loadingScreen").hide();
                        }
					},
					(err) => {
					    $scope.expressCourierList = [];
						$("#loadingScreen").hide();
						$log.log('Error occurred while getting express courier list', err);
					});
			};

			// load More Records
            $scope.loadMoreRecords = (newPageNo) => {
                $scope.searchParams.Pagenumber = newPageNo;//Pagenumber
                $scope.getPendingTrans();
			}
            $scope.getSearchResult = () =>
            {
                $scope.searchParams.Pagenumber = 1; 
                $scope.getPendingTrans();
            }
			// go to the details page
			$scope.goToDetailsPage = (item) => {
				$state.go('transExpCourierWayBillDetail',
					{
                        refNum: item.RerferenceNumber,
                        centerCode: $scope.selectedCenterCode,
                        CreatedUser: item.CreatedUser
					},
					{ notify: true });
			}

			//$scope.getCenterCodes();

			$scope.getSearchParameter = () => {
				debugger;
                if ($scope.selectedCourierCenterObj && $scope.selectedCourierCenterObj.originalObject && !apiService.isNullOrEmptyOrUndefined($scope.selectedCourierCenter))
                {
					$scope.searchParams.CourierCenterCode =
						$scope.selectedCourierCenterObj.originalObject.ExpressCenterCode
						? $scope.selectedCourierCenterObj.originalObject.ExpressCenterCode
						: '';
                }
                if ($scope.selectedExpressAgentObj && $scope.selectedExpressAgentObj.originalObject && !apiService.isNullOrEmptyOrUndefined($scope.selectedExpressAgent))
                {
					$scope.searchParams.CourierAgentCode = $scope.selectedExpressAgentObj.originalObject.AgentCode
						? $scope.selectedExpressAgentObj.originalObject.AgentCode
						: '';
                }

                if ($scope.selectedCourierCreatedUserObj && $scope.selectedCourierCreatedUserObj.originalObject && !apiService.isNullOrEmptyOrUndefined($scope.selectedCourierCreatedUser))
                {
                    $scope.searchParams.CreatedUser = $scope.selectedCourierCreatedUserObj.originalObject.AgCode;
                }

			}

			// Agent Code changes - START //
			//#region
			$scope.onExpressAgentChange = function(searchStr) {
				$scope.PopulateExpressAgents(searchStr);
				$scope.rowIndex = 0;
				$scope.lookUpCurrentPageExpressAgent = 1;
				if ($scope.expressAgentsFull) {
					$scope.expressAgents = $scope.expressAgentsFull.filter(obj => {
						return obj.AgentCode.toString().toLowerCase()
							.includes($scope.searchExpressAgentText.toLowerCase()) ||
							(obj.AgentDescEng &&
								obj.AgentDescEng.toLowerCase().includes($scope.searchExpressAgentText.toLowerCase())) ||
							(obj.AgentDescArb &&
								obj.AgentDescArb.toLowerCase().includes($scope.searchExpressAgentText.toLowerCase()));
					});
				}
			}
			$scope.searchExpressAgentText = '';
			$scope.expressAgentKeyDown = function(event) {
				if (event.key == 'F9') {
					$scope.openExpressAgentLookup();
				}
			}
			$scope.PopulateExpressAgents = function (searchStr) {
			    $scope.stoppedSearch = false;
				apiService.get('Customs/Lookup/GetExpressAgents',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function (results) {
						$scope.expressAgentsFull = results.data.ResponseResult.Data;
						$scope.expressAgents = angular.copy($scope.expressAgentsFull);
						$scope.stoppedSearch = true;
					},
					function error(err) {
					    $scope.stoppedSearch = true;
						$log.log('Error while calling Express Agents Lookup', err);
					});
			}

			$scope.openExpressAgentLookup = function(item) {
				$scope.searchExpressAgentText = '';
				$('#expressAgentLookup').modal({
					backdrop: "static"
				});
				$('#searchExpressAgentText').focus();
				$('#searchExpressAgentText').select();
				$scope.onExpressAgentChange();
				$("#expressAgentLookup").off("keydown");
				$('#expressAgentLookup').bind('keydown',
					function(event) {
						$timeout(function() {
							switch (event.keyCode) {
							case 40:
								if ($scope.rowIndex < $scope.expressAgents.length - 1) {
									$scope.rowIndex++;
									if ($scope.rowIndex > 10 * $scope.expressAgents - 1) {
										$scope.lookUpCurrentPageExpressAgent++;
									}
									$scope.expressAgentItemSelected = $scope.expressAgents[$scope.rowIndex];
								}
								break;
							case 38:
								if ($scope.rowIndex > 0) {

									if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageExpressAgent - 1)) {
										$scope.lookUpCurrentPageExpressAgent--;
									}
									$scope.rowIndex--;
									$scope.expressAgentItemSelected = $scope.expressAgents[$scope.rowIndex];
								}
								break;
							case 13:
								$scope.setExpressAgent($scope.expressAgentItemSelected);
								break;
							}
						});
					});
			}
			$scope.setExpressAgent = function(row) {
				$scope.selectedExpressAgent = row.AgentCode.toString() +
					"     " +
					(row.AgentDescEng ? row.AgentDescEng : '') +
					"     " +
					(row.AgentDescArb ? row.AgentDescArb : '');
				$scope.selectedExpressAgentObj = {};
				$scope.selectedExpressAgentObj.originalObject = row;
				$("#expressAgentLookup").modal("hide");
			}
			$scope.$watch("searchExpressAgentText",
				function() {
					$scope.onExpressAgentChange($scope.searchExpressAgentText);
				});
			//#endregion
			// Agent Code changes - END //

			// Courier Center Lookup - START //
			//#region
			$scope.onCourierCenterChange = function(searchStr) {
				$scope.PopulateCourierCenters(searchStr);
				$scope.rowIndex = 0;
				$scope.lookUpCurrentPageCourierCenter = 1;
				if ($scope.courierCenterCodesFull) {
					$scope.courierCenterCodes = $scope.courierCenterCodesFull.filter(obj => {
						return obj.ExpressCenterCode.toString().toLowerCase()
							.includes($scope.searchCourierCenterText.toLowerCase()) ||
							(obj.ExpressCenterEng &&
								obj.ExpressCenterEng.toLowerCase()
								.includes($scope.searchCourierCenterText.toLowerCase())) ||
							(obj.ExpressCenterArb &&
								obj.ExpressCenterArb.toLowerCase()
								.includes($scope.searchCourierCenterText.toLowerCase()));
					});
				}
			}
			$scope.searchCourierCenterText = '';
			$scope.courierCenterKeyDown = function(event) {
				if (event.key == 'F9') {
					$scope.openCourierCenterLookup();
				}
			}
			$scope.PopulateCourierCenters = function (searchStr) {
			    $scope.stoppedSearch = false;
				apiService.get('Customs/Lookup/GetExpressCenters',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function(results) {
						$scope.courierCenterCodesFull = results.data.ResponseResult.Data;
						$scope.courierCenterCodes = angular.copy($scope.courierCenterCodesFull);
						$scope.stoppedSearch = true;
					},
					function error(err) {
					    $log.log('Error occurred on get courier center lookup', err);
					    $scope.stoppedSearch = true;
					});
			}

			$scope.openCourierCenterLookup = function(item) {
				$scope.searchCourierCenterText = '';
				$('#courierCenterLookup').modal({
					backdrop: "static"
				});
				$('#searchCourierCenterText').focus();
				$('#searchCourierCenterText').select();
				$scope.onCourierCenterChange();
				$("#courierCenterLookup").off("keydown");
				$('#courierCenterLookup').bind('keydown',
					function(event) {
						$timeout(function() {
							switch (event.keyCode) {
							case 40:
								if ($scope.rowIndex < $scope.courierCenterCodes.length - 1) {
									$scope.rowIndex++;
									if ($scope.rowIndex > 10 * $scope.courierCenterCodes - 1) {
										$scope.lookUpCurrentPageCourierCenter++;
									}
									$scope.courierCenterItemSelected = $scope.courierCenterCodes[$scope.rowIndex];
								}
								break;
							case 38:
								if ($scope.rowIndex > 0) {

									if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageCourierCenter - 1)) {
										$scope.lookUpCurrentPageCourierCenter--;
									}
									$scope.rowIndex--;
									$scope.courierCenterItemSelected = $scope.courierCenterCodes[$scope.rowIndex];
								}
								break;
							case 13:
								$scope.setCourierCenter($scope.courierCenterItemSelected);
								break;
							}
						});
					});
			}
			$scope.setCourierCenter = function(row) {
				$scope.selectedCourierCenter = row.ExpressCenterCode.toString() +
					"     " +
					(row.ExpressCenterEng ? row.ExpressCenterEng : '') +
					"     " +
					(row.ExpressCenterArb ? row.ExpressCenterArb : '');
				$scope.selectedCourierCenterObj = {};
				$scope.selectedCourierCenterObj.originalObject = row;
				$("#courierCenterLookup").modal("hide");
			}
			$scope.$watch("searchCourierCenterText",
				function() {
					$scope.onCourierCenterChange($scope.searchCourierCenterText);
				});
			//#endregion
			// Courier Center Lookup - END //

            ///
            //Created User - START //
            //#region
            $scope.onExpressCreatedUserChange = function (searchStr) {
                $scope.PopulateExpressCreatedUser(searchStr);
                $scope.rowIndex = 0;
                $scope.lookUpCurrentPageExpressCreatedUser = 1;
                if ($scope.expressCreatedUserFull) {
                    $scope.expressCreatedUser = $scope.expressCreatedUserFull.filter(obj => {
                        return obj.AgCode.toString().toLowerCase()
                            .includes($scope.searchExpressCreatedUserText.toLowerCase()) ||
                            (obj.AgDescEng &&
                                obj.AgDescEng.toLowerCase().includes($scope.searchExpressCreatedUserText.toLowerCase())) ||
                            (obj.AgDescArb &&
                                obj.AgDescArb.toLowerCase().includes($scope.searchExpressCreatedUserText.toLowerCase()));
                    });
                }
            }
            $scope.searchExpressCreatedUserText = '';
            $scope.expressCreatedUserKeyDown = function (event) {
                if (event.key == 'F9') {
                    $scope.openExpressCreatedUserLookup();
                }
            }
            $scope.PopulateExpressCreatedUser = function (searchStr) {
                $scope.stoppedSearch = false;
                apiService.get('Customs/Lookup/GetExpressCreatedUser',
                    {
                        centerCode: $scope.selectedCenterCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.expressCreatedUserFull = results.data.ResponseResult.Data;
                        $scope.expressCreatedUser = angular.copy($scope.expressCreatedUserFull);
                        $scope.stoppedSearch = true;
                    },
                    function error(err) {
                        $log.log('Error while calling Created User Lookup', err);
                        $scope.stoppedSearch = true;
                    });
            }

            $scope.openExpressCreatedUserLookup = function (item) {
                $scope.searchExpressCreatedUserText = '';
                $('#expressCreatedUserLookup').modal({
                    backdrop: "static"
                });
                $('#searchExpressCreatedUserText').focus();
                $('#searchExpressCreatedUserText').select();
                $scope.onExpressCreatedUserChange();
                $("#expressCreatedUserLookup").off("keydown");
                $('#expressCreatedUserLookup').bind('keydown',
                    function (event) {
                        $timeout(function () {
                            switch (event.keyCode) {
                                case 40:
                                    if ($scope.rowIndex < $scope.expressCreatedUser.length - 1) {
                                        $scope.rowIndex++;
                                        if ($scope.rowIndex > 10 * $scope.expressCreatedUser - 1) {
                                            $scope.lookUpCurrentPageExpressCreatedUser++;
                                        }
                                        $scope.expressCreatedUserItemSelected = $scope.expressCreatedUser[$scope.rowIndex];
                                    }
                                    break;
                                case 38:
                                    if ($scope.rowIndex > 0) {

                                        if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPageExpressCreatedUser - 1)) {
                                            $scope.lookUpCurrentPageExpressCreatedUser--;
                                        }
                                        $scope.rowIndex--;
                                        $scope.expressCreatedUserItemSelected = $scope.expressCreatedUser[$scope.rowIndex];
                                    }
                                    break;
                                case 13:
                                    $scope.setExpressCreatedUser($scope.expressCreatedUserItemSelected);
                                    break;
                            }
                        });
                    });
            }
            $scope.setExpressCreatedUser = function (row) {
                $scope.selectedCourierCreatedUser = row.AgCode.toString() +
                    "     " +
                    (row.AgDescEng ? row.AgDescEng : '') +
                    "     " +
                    (row.AgDescArb ? row.AgDescArb : '');
                $scope.selectedCourierCreatedUserObj = {};
                $scope.selectedCourierCreatedUserObj.originalObject = row;
                $("#expressCreatedUserLookup").modal("hide");
            }
            //searchExpressCreatedUserText
            $scope.$watch("searchExpressCreatedUserText",
                function () {
                    $scope.onExpressCreatedUserChange($scope.searchExpressCreatedUserText);
                });
			//#endregion
            //Created User -  END
            ///
         

            // DELETE Courier Way Bill -- START
            $scope.DeleteVehicle = function (data) {
                debugger;
                $scope.CourierData = data;
                $("#ConfirmDeleteModalPopup").modal("show");
            }
            $scope.deleteOkay = function () {
                debugger;
                $("#ConfirmDeleteModalPopup").modal("hide");
                $("#loadingScreen").show();
                $scope.DeleteCourierInfoParams = {
                    CenterCode: $scope.selectedCenterCode,
                    ReferenceNumber: $scope.CourierData.RerferenceNumber
                };
                //Delete Courier
               
                //
                $log.log('Center Code', $scope.searchParams);
                apiService.get('Customs/ImporterExporter/DeleteCourierInfo',
                    $scope.DeleteCourierInfoParams,
                    (results) => {
                        $("#loadingScreen").hide();
                        if (results.data.ResponseResult.IsValid == true)//(results.data.ResponseResult != "")
                        {
                            $('#successModal').modal('show');
                            $scope.getPendingTrans();
                        }
                        else {
                            modalErrorShow(results.data.ResponseResult.Messages);
                        }
                    },
                    (err) => {
                        $("#loadingScreen").hide();
                        $log.log('Error occurred while getting express courier list', err);
                    });
            }
		    // DELETE Courier Way Bill -- END

		    ////Initialization /////////////////

            function init() {
                $scope.courierCenterItemSelected = '';
                $scope.expressCreatedUserItemSelected = '';
                $scope.expressAgentItemSelected = '';
                $scope.isValidDate = true;
                $scope.getCenterCodes();
            }

            init();
		    ////Initialization /////////////////

            //$scope.DeleteVehicle = function (data) {
            //    $scope.VehicleData = data;
            //    $("#ConfirmDeleteModalPopup").modal("show");
            //}
            //$scope.deleteOkay = function () {
            //    $("#ConfirmDeleteModalPopup").modal("hide");
            //    $("#loadingScreen").show();
            //    $scope.VehicleData.CenterCode = $scope.centerCode;
            //    apiService.post('Customs/Vehicle/DeleteVehicle', '', $scope.VehicleData, function (result) {
            //        $("#loadingScreen").hide();
            //        var response = result.data.ResponseResult;
            //        var msg = apiService.formatResponseMessage(response.Messages);
            //        if (response.IsValid) {
            //            $('#successModal').modal('show');
            //            $scope.vehicleList = [];
            //            $scope.GetVehicleList();
            //        }
            //        else if (!response.IsValid) {
            //            $scope.GetVehicleList();
            //            modalErrorShow(msg);
            //        }
            //    },
            //        function (result) {
            //            $("#loadingScreen").hide();
            //            console.log("An Error has occurred!");
            //            console.log(result);
            //        });
            //}
		}
	]);