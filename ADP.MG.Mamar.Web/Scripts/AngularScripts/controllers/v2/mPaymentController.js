angular.module('mamarApp').controller('mPaymentController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', '$log', 'apiService', 'sharedModels', '$filter',
		'userAccountStorageFactory',
		function($scope,
			$rootScope,
			$http,
			$state,
			$stateParams,
			$log,
			apiService,
			sharedModels,
			$filter,
			userAccountStorageFactory) {
			$scope.existingDescriptions = [];
			$scope.addingNew = false;
			$scope.totalCount = 0;
			$scope.selectedImporterExporterCode = {};
			$scope.selectedImporterExporterCode.originalObject = {};
			$scope.selectedImporterExporterCode.originalObject.Code = null;
			$scope.selectedImporterExporterCode.originalObject.EnglishName = null;
			$scope.selectedImporterExporterCode.originalObject.ArabicName = null;
			$scope.selectedImporterExporterCode.originalObject.CategoryCode = null;
			$scope.ImporterCode = 0;

			try {
				$scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
			} catch (e) {
				$log.log('Failed to get user account details, error : ', e);
				$scope.isSuperUser = 'False';
			}

			$scope.report = {
				centerCode: '',
				importerCode: 0,
				statementNo: 0,
				statementDate: null,
				statementExp: null
			};

			$scope.mPaymentRequestObject = {
				CenterCode: '',
				pageNumber: 1,
				pageSize: 10,
			}
			$scope.userCenter = {
				centerCode: "V"
			}

			$scope.parseDate = function(input) {
				var a = Date.parse(input);
				var c = $filter('date')(new Date(Date.parse(input)), 'yyyy');
				return parseInt(a) < 0 && c === '0001' ? false : true;
			}

			$scope.GetDefaultCenterCode = function() {
				apiService.get('Customs/Lookup/GetDefaultCenterCode',
					$scope.userCenter,
					function(results) {
						sharedModels.UserCenter = results.data.ResponseResult.Data;
						if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
						    $scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
						    $scope.DefaultCenterCode = $scope.selectedCenterCode;
							$scope.ImporterCode = sharedModels.UserCenter[0].ImpCode;
							$scope.PopulateData();
						}
					},
					function error(response) {
						modalErrorShow("An Error has occurred while getting lookup Data!");
					});
			};

			$scope.loadMoreRecords = function(newPageNo) {

				$scope.mPaymentRequestObject.pageNumber = newPageNo;
				$scope.PopulateData();
			}
			$scope.PopulateData = function() {
			    $("#loadingScreen").show();
			    $scope.DefaultCenterCode = $scope.selectedCenterCode;
				$scope.mPaymentRequestObject.CenterCode = $scope.DefaultCenterCode;
				apiService.get('Customs/MPayment/GetFacilityStatements',
					$scope.mPaymentRequestObject,
					function(results) {
						$scope.facilityStatements = results.data.ResponseResult.Data;
						if ($scope.facilityStatements != null) {
							$scope.totalCount = $scope.facilityStatements[0].TotalCount;
						}
						$("#loadingScreen").hide();
					},
					function error(response) {
						$("#loadingScreen").hide();
						console.log(response);
					});
			}

			//$scope.$watch("selectedTransMode", function () {
			//    localStorage.setItem("ReExportTransMode_" + $scope.userAccntInfo.CCode, $scope.selectedTransMode);
			//    $scope.storedPreferredCenter = localStorage.getItem("ReExportCenterCode_" + $scope.selectedTransMode + '_' + $scope.userAccntInfo.CCode);
			//    $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
			//    $scope.getCenterCodes();
			//    resetCheckDataParameters();
			//    clearData();
			//});

			

			$scope.PrepareFacilityStatement = function() {
			    $("#loadingScreen").show();
			    $scope.DefaultCenterCode = $scope.selectedCenterCode;
				$scope.userCenter.centerCode = $scope.DefaultCenterCode;
				apiService.get('Customs/MPayment/GetPrepareFacilityStatement',
					$scope.userCenter,
					function(result) {
						// $("#loadingScreen").hide();
						var response = result.data.ResponseResult;

						if (response.IsValid) {
							$("#loadingScreen").hide();
						} else if (!response.IsValid) {
							$("#loadingScreen").hide();
						}
					},
					function(result) {
						$("#loadingScreen").hide();

					});
			}


			//$scope.ImporterExporterChanged = function (searchStr) {
			//    if (!apiService.isNullOrEmptyOrUndefined(searchStr)) {
			//        apiService.get('Customs/Lookup/ImporterExporter',
			//        {
			//            centerCode: $scope.DefaultCenterCode,
			//            searchString: searchStr
			//        },
			//        function (results) {
			//            $scope.impotersExporters = results.data.ResponseResult.Data; //.slice(0, 10);
			//        },
			//        function error(response) {
			//            modalErrorShow("An Error has occurred while getting lookup Data!");
			//        });
			//    }
			//};

			$scope.downloadReport = function(selectedValue, ImpCode, StatementNumber, StatementDate, StatementExp) {
				$("#loadingScreen").show();
				if (selectedValue != '') {
					var serviceUrl = 'Customs/Reporting/' + selectedValue;
				    //$scope.report.centerCode = 'V';
					$scope.DefaultCenterCode = $scope.selectedCenterCode;
					$scope.report.centerCode = $scope.DefaultCenterCode;
					$scope.report.importerCode = parseInt(ImpCode);
					$scope.report.statementNo = parseInt(StatementNumber);
					if (selectedValue == 'GetFacilityStatementReport' ||
						selectedValue == 'GetFacilityStatementChargesReport') {
						$scope.report.statementDate = StatementDate;
						$scope.report.statementExp = StatementExp;
					}
					apiService.get(serviceUrl,
						$scope.report,
						function(results) {
							var data = results.data.ResponseResult;
							if (data.Data != null && data.Data.length > 0) {
								//print report
								apiService.printDocuments(data.Data);
								$("#loadingScreen").hide();
							} else if (!data.IsValid) {
								$("#loadingScreen").hide();
								var msg = data.Messages
									? apiService.formatResponseMessageObject(data.Messages)
									: "Error";
								modalErrorShow(msg.eng + ' - ' + msg.arb);
							}
						},
						function error(response) {
							$("#loadingScreen").hide();
							console.log(response);
						});
				}
			}
			//$scope.PopulateData();

			$scope.GetDefaultCenterCode();

			
		}
	]);