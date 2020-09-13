angular.module('mamarApp').controller('depositSlipController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$uibModal',
		'exemptionEntryGroupInfoService', 'sharedModels', '$filter', '$log', 'userAccountStorageFactory',
		function ($scope,
			$rootScope,
			$http,
			$state,
			$stateParams,
			apiService,
			$uibModal,
			exemptionEntryGroupInfoService,
			sharedModels,
			$filter,
			$log,
			userAccountStorageFactory) {
		    $scope.totalCount = 0;

		    try {
		        $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
		    } catch (e) {
		        $log.log('Failed to get user account details, error : ', e);
		        $scope.isSuperUser = 'False';
		    }

		    $scope.LoadLookupCenterCodes = function () {
		        $scope.lkupCntrCodepm = {
		            transportMode: 'M',
		            searchString: ''
		        };
		        //apiService.get('Customs/Lookup/CenterCodes',
		        //	$scope.lkupCntrCodepm,
		        //	function(results) {
		        //		$scope.centerCodes = results.data.ResponseResult.Data;
		        //		if ($scope.centerCodes) {
		        //			var selectedCenter = $filter('filter')($scope.centerCodes,
		        //				function(cenCode) { return (cenCode.Code == 'V') });
		        //			$scope.selCenterCode = selectedCenter.length == 1
		        //				? selectedCenter[0].Code
		        //				: $scope.centerCodes.length > 0
		        //				? $scope.centerCodes[0].Code
		        //				: "";
		        //			$scope.PopulateObject();
		        //			$scope.PopulateData();
		        //		}
		        //	},
		        //	function error(response) {
		        //		console.log('something went wrong in LoadLookupCentreCodes' + response);
		        //	});
		    }
		    //$scope.report = {
		    //	centerCode: "V",
		    //	depositType: '',
		    //	aADSSerial: 0,
		    //};

		    $scope.report = {
		        centerCode: $scope.selectedTransMode,
		        depositType: '',
		        aADSSerial: 0,
		    };


		    $scope.PopulateObject = function () {
		        $scope.mDepositSlipRequestObject = {
		            CenterCode: $scope.DefaultCenterCode,
		            pageNumber: 1,
		            pageSize: 10,
		        }
		    }
		    $scope.$on('depositSlipAdd',
				function () {
				    $scope.loadMoreRecords(1);
				});
		    $scope.loadMoreRecords = function (newPageNo) {

		        $scope.mDepositSlipRequestObject.pageNumber = newPageNo;
		        $scope.PopulateData();
		    }

		    $scope.PopulateData = function () {
		        $("#loadingScreen").show();
		        apiService.get('Customs/MPayment/GetADCBDepositSlips',
					$scope.mDepositSlipRequestObject,
					function (results) {
					    $scope.depositSlips = results.data.ResponseResult.Data;
					    if ($scope.depositSlips != null) {
					        $scope.totalCount = $scope.depositSlips[0].TotalCount;
					    }
					    $("#loadingScreen").hide();
					},
					function error(response) {
					    $("#loadingScreen").hide();
					    console.log(response);
					});
		    }

		    $scope.openDepositInformation = function (value, serialnumber) {
		        exemptionEntryGroupInfoService.setValue(value);
		        exemptionEntryGroupInfoService.setSerialNo(serialnumber);
		        var modalInstance = $uibModal.open({
		            templateUrl: '../tpl/depositInformation.html',
		            size: 'lg', //modal open size large
		            backdrop: 'static',
		            keyboard: false,
		            controller: 'depositInformationController',
		            //resolve: {
		            //    parameters:
		            //       function () {
		            //           return { jobNumber: $stateParams.jobNumber, centerCode: $stateParams.centerCode, };
		            //       }
		            //}
		        });
		    }


		    $scope.centerCodeChanged = function () {
		        $scope.PopulateObject();
		        $scope.PopulateData();
		    };
		    //$scope.LoadLookupCenterCodes();
		    // $scope.PopulateData();

		    //if (sharedModels.UserCenter != null && sharedModels.UserCenter.length > 0) {
		    //	$scope.DefaultCenterCode = sharedModels.UserCenter[0].CenterCode;
		    //	$scope.PopulateObject();
		    //	$scope.PopulateData();
		    //}

		    $scope.DefaultCenterCode = $scope.selectedCenterCode;
		    $scope.PopulateObject();
		    $scope.PopulateData();

		    $scope.downloadReport = function (selectedValue, depositType, aADSSerial) {
		        $("#loadingScreen").show();
		        if (selectedValue != '') {
		            var serviceUrl = 'Customs/Reporting/' + selectedValue;
		            $scope.report.centerCode = $scope.DefaultCenterCode;
		            $scope.report.depositType = depositType;
		            $scope.report.aADSSerial = parseInt(aADSSerial);

		            apiService.get(serviceUrl,
						$scope.report,
						function (results) {
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

		}
	]);