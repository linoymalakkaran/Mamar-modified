angular.module('mamarApp').controller('TransExpCourierWayBillDetailsController',
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
		    //$("#loadingScreen").show();
            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

			$scope.refNum = $stateParams.refNum;
            $scope.selectedCenterCode = $stateParams.centerCode;
            $scope.CreatedUser = $stateParams.CreatedUser;
            $scope.isNew = false;

            $scope.getCourierDetail = () => {
	            $("#loadingScreen").show();
				apiService.get('Customs/ImporterExporter/ExpressCourierDetail',
					{
						CenterCode: $scope.selectedCenterCode,
                        ReferenceNumber: $scope.refNum,
                        CreatedUser: $scope.CreatedUser
					},
					(results) => {
						var expressCourierDetail = results.data.ResponseResult.Data;
						if (!apiService.isNullOrEmptyOrUndefined(expressCourierDetail)) {
							$scope.assignCourierViewModel(expressCourierDetail);
						}
						$("#loadingScreen").hide();
					},
					function error(err) {
						$("#loadingScreen").hide();
						modalErrorShow("An Error has occurred while getting Data!");
						$log.log('Error occurred during details fetch', err);
					}
				);
			}

            $scope.assignCourierViewModel = (expressCourierDetail) =>
            {
                $("#loadingScreen").show();
                $log.log('Data coming from the services', expressCourierDetail);
                $scope.courierCode = expressCourierDetail.ExpCourierCode;
                $scope.selectedExpressAgent = expressCourierDetail.AgentImpCode.toString() +
                    "     " +
                    (expressCourierDetail.AgentEngName ? expressCourierDetail.AgentEngName : '') +
                    "     " +
                    (expressCourierDetail.AgentArbName ? expressCourierDetail.AgentArbName : '');
                var row =
                    {
                        AgentCode:expressCourierDetail.AgentImpCode,
                        AgentDescEng:expressCourierDetail.AgentEngName,
                        AgentDescArb:expressCourierDetail.AgentArbName
                    };
                
                $scope.selectedExpressAgentObj = {};
                $scope.selectedExpressAgentObj.originalObject = row;

                var CourierCenter = {
                    ExpressCenterCode: expressCourierDetail.CourierCenterCode,
                    ExpressCenterEng: expressCourierDetail.CourierCenterNameEng,
                    ExpressCenterArb: expressCourierDetail.CourierCenterNameArb
                }

                $scope.selectedCourierCenter = expressCourierDetail.CourierCenterCode.toString() +
                    "     " +
                    (expressCourierDetail.CourierCenterNameEng ? expressCourierDetail.CourierCenterNameEng : '') +
                    "     " +
                    (expressCourierDetail.CourierCenterNameArb ? expressCourierDetail.CourierCenterNameArb : '');
                $scope.selectedCourierCenterObj = {};
                $scope.selectedCourierCenterObj.originalObject = CourierCenter;


                var CourierCreatedUser = {
                    CreatedUser: expressCourierDetail.CreatedUser,
                    CreaterUserEng: expressCourierDetail.CreaterUserEng,
                    CreaterUserArb: expressCourierDetail.CreaterUserArb
                }

                $scope.selectedCourierCreatedUser = expressCourierDetail.CreatedUser.toString() +
                    "     " +
                    (expressCourierDetail.CreaterUserEng ? expressCourierDetail.CreaterUserEng : '') +
                    "     " +
                    (expressCourierDetail.CreaterUserArb ? expressCourierDetail.CreaterUserArb : '');

                $scope.selectedCourierCreatedUserObj = {};
                $scope.selectedCourierCreatedUserObj.originalObject = CourierCreatedUser;
                $scope.CourierCreatedDate = $filter('date')((new Date(expressCourierDetail.CreatedDate)), "dd/MM/yyyy HH:mm");//expressCourierDetail.CreatedDate;

                $scope.CreatedUser = expressCourierDetail.CreatedUser;
                $scope.CreaterUserEng = expressCourierDetail.CreaterUserEng;
                $scope.CreaterUserArb = expressCourierDetail.CreaterUserArb;
                $scope.CourierAgentFlag = expressCourierDetail.CourierAgentFlag;
                $("#loadingScreen").hide();
                if ($scope.CourierAgentFlag == "N") {
                    $scope.IsDisableInput = false;
                }
                else
                {
                    $scope.IsDisableInput = true;
                }

                //CreatedUser: $scope.selectedCourierCreatedUserObj.originalObject.AgCode,
                //    CreaterUserEng: $scope.selectedCourierCreatedUserObj.originalObject.AgDescEng,
                //        CreaterUserArb: $scope.selectedCourierCreatedUserObj.originalObject.AgDescArb,
                //                            CreatedUser: $scope.selectedCourierCreatedUserObj.originalObject.AgCode,
                //                                CreaterUserEng: $scope.selectedCourierCreatedUserObj.originalObject.AgDescEng,
                //                                    CreaterUserArb: $scope.selectedCourierCreatedUserObj.originalObject.AgDescArb,
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
                    debugger;
					$scope.openExpressAgentLookup();
				}
			}
            $scope.PopulateExpressAgents = function (searchStr) {
                $scope.stoppedSearch = true;
				apiService.get('Customs/Lookup/GetExpressAgents',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function (results) {
						$scope.expressAgentsFull = results.data.ResponseResult.Data;
						$scope.expressAgents = angular.copy($scope.expressAgentsFull);
						$scope.stoppedSearch = false;
						//$("#loadingScreen").hide();
					},
					function error(err) {
					    $log.log('Error while calling Express Agents Lookup', err);
					    $scope.stoppedSearch = false;
					    //$("#loadingScreen").hide();
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
			$scope.setExpressAgent = function (row) {
			    if (row) {
			        $scope.selectedExpressAgent = (row.AgentCode? row.AgentCode.toString():'') +
                        "     " +
                        (row.AgentDescEng ? row.AgentDescEng : '') +
                        "     " +
                        (row.AgentDescArb ? row.AgentDescArb : '');
			    }
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
			$scope.PopulateCourierCenters = function(searchStr) {
				apiService.get('Customs/Lookup/GetExpressCenters',
					{
						centerCode: $scope.selectedCenterCode,
						searchString: searchStr
					},
					function(results) {
						debugger;
						$scope.courierCenterCodesFull = results.data.ResponseResult.Data;
						$scope.courierCenterCodes = angular.copy($scope.courierCenterCodesFull);
					},
					function error(err) {
						$log.log('Error occurred on get courier center lookup', err);
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
                if (event.key == 'F9')
                {
                    $scope.openExpressCreatedUserLookup();
                }
            }
            $scope.PopulateExpressCreatedUser = function (searchStr) {
                apiService.get('Customs/Lookup/GetExpressCreatedUser',
                    {
                        centerCode: $scope.selectedCenterCode,
                        searchString: searchStr
                    },
                    function (results) {
                        $scope.expressCreatedUserFull = results.data.ResponseResult.Data;
                        $scope.expressCreatedUser = angular.copy($scope.expressCreatedUserFull);
                    },
                    function error(err) {
                        $log.log('Error while calling Created User Lookup', err);
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
            $scope.Initialize = function () {
                debugger;
                $scope.courierCode = '';
                $scope.CourierCreatedDate = '';
                $scope.IsDisableInput = false;
                $scope.expressAgentItemSelected = '';
                if (!apiService.isNullOrEmptyOrUndefined($scope.refNum)
                    && !apiService.isNullOrEmptyOrUndefined($scope.selectedCenterCode)
                    && !apiService.isNullOrEmptyOrUndefined($scope.CreatedUser)) {
                    $scope.isNew = true;
                    $scope.getCourierDetail();
                } else {
                    $scope.selectedCourierCenter = $scope.selectedCenterCode + ' ' + $stateParams.CenterEnglishName + ' ' + $stateParams.CenterArabicName;
                    var CourierCenter = {
                        ExpressCenterCode: '',
                        ExpressCenterEng: '',
                        ExpressCenterArb: ''
                    }
                    $scope.CenterArabicName = $stateParams.CenterArabicName;
                    $scope.CenterEnglishName = $stateParams.CenterEnglishName;

                    $scope.selectedCourierCenterObj = {};
                    $scope.selectedCourierCenterObj.originalObject = CourierCenter;
                }
                $scope.PopulateExpressAgents();
            }
            $scope.Initialize();


            /// Save & Edit -- START
            $scope.SaveExpressCourierInformation = () => {
                debugger;
                if (apiService.isNullOrEmptyOrUndefined($scope.selectedExpressAgent))
                {
                    modalErrorShow("Please enter Agent information");
                    return;
                }
                //else if (apiService.isNullOrEmptyOrUndefined($scope.selectedCourierCenter)) {
                //    modalErrorShow("Please enter Center Code");
                //    return;
                //}
                //else if (apiService.isNullOrEmptyOrUndefined($scope.selectedCourierCreatedUser)) {
                //    modalErrorShow("Please enter Courier Created User");
                //    return;
                //}
                else if (apiService.isNullOrEmptyOrUndefined($scope.courierCode)) {
                    modalErrorShow("Please enter HAWB/MAWB");
                    return;
                }
                $scope.Courier = {
                    AgentImpCode: $scope.selectedExpressAgentObj.originalObject.AgentCode,
                    AgentEngName: $scope.selectedExpressAgentObj.originalObject.AgentDescEng,
                    AgentArbName: $scope.selectedExpressAgentObj.originalObject.AgentDescArb,
                    ExpCourierCode: $scope.courierCode,

                    CourierCenterCode: $scope.selectedCourierCenterObj.originalObject.ExpressCenterCode,
                    CourierCenterNameEng: $scope.selectedCourierCenterObj.originalObject.ExpressCenterEng,
                    CourierCenterNameArb: $scope.selectedCourierCenterObj.originalObject.ExpressCenterArb,

                    CreatedUser: $scope.CreatedUser,
                    CreaterUserEng: $scope.CreaterUserEng,
                    CreaterUserArb: $scope.CreaterUserArb,
                    ReferenceNumber: $scope.refNum,
                    CenterCode: $scope.selectedCenterCode
                };
                $("#loadingScreen").show();
                apiService.post('Customs/ImporterExporter/AddUpdateCourierInfo', '', $scope.Courier, function (results) {
                    $("#loadingScreen").hide();
                    var result = results.data.ResponseResult;
                    if (result.IsValid)
                    {
                        $scope.refNum = result.Data.ReferenceNumber;
                      
                        $('#successModal').modal('show');
                    } else {
                        $("#loadingScreen").hide();
                        modalErrorShow(result.Messages);
                        console.log(result.Messages);
                    }
                },
                    function error(response) {
                        $("#loadingScreen").hide();
                        modalErrorShow(response);
                        console.log(response);
                    });
            }

            /// SAVE & END --END
		}
	]);