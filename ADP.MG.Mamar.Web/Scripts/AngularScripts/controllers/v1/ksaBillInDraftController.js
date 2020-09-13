angular.module('mamarApp').controller('ksaBillInDraftController',
    [
        '$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter', '$log',
        'userAccountStorageFactory', '$timeout',
        function ($scope,
            $rootScope,
            $http,
            $state,
            $stateParams,
            apiService,
            sharedModels,
            $filter,
            $log,
            userAccountStorageFactory,$timeout)
        {

            try {
                $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
            } catch (e) {
                $log.log('Failed to get user account details, error : ', e);
                $scope.isSuperUser = 'False';
            }

            // init
            $scope.init = () => {
                debugger;
                InitialiseSearch();
                PopulateData();
                // $stateParams.ID
                // $stateParams.centerCode
            }
            $scope.init();

            function InitialiseSearch() {
                $scope.searchParameter =
                    {
                    ID: $stateParams.ID,//'CSA20190305005067',
                    CenterCode: $stateParams.centerCode//'V'
                };
            }
            function PopulateData()  {
                $("#loadingScreen").show();
                apiService.get('Customs/Invoice/KSABillDetail',
                    $scope.searchParameter,
                    function (results)
                    {
                        if (results.data.ResponseResult != "") {
                            $scope.HeaderInformation = results.data.ResponseResult.Data.ksaBillHeader;
                            $scope.GroupInformation = results.data.ResponseResult.Data.ksaBillGroups;
                        }
                        $("#loadingScreen").hide();

                    },
                    function error(err) {
                        $("#loadingScreen").hide();
                        $log.log(err);
                    });
            }

            $scope.selectedRow = null;  // initialize our variable to null
            $scope.setClickedRowColor = function (index, mySelectedItems) {  //function that sets the value of selectedRow to current index
                $scope.selectedRow = index;
                $scope.getUserChildDetails(mySelectedItems);
            }
            $scope.setClickedRow = function (mySelectedItems) {
                debugger;
                $scope.getUserChildDetails(mySelectedItems);
            };

            $scope.getUserChildDetails = function (mySelectedItems) {
                if (!apiService.isNullOrEmptyOrUndefined(mySelectedItems))
                {
                    $scope.searchParams = {
                        ID: $scope.searchParameter.ID,
                        CenterCode: $scope.searchParameter.CenterCode,
                        SeqNumber: mySelectedItems.SeqNumber
                    };
                }
                else
                {
                    return;
                }
                let counter = 0;
                $("#loadingScreen").show();
                debugger;
                apiService.get('Customs/Invoice/KSAGroupDetail', $scope.searchParams, function (results) {
                    var data = $scope.userAccntDetails = results.data.ResponseResult;
                    if (data != null)
                    {
                        $scope.ChildDetails = data.Data;
                        $("#loadingScreen").hide();
                    }
                    else {
                        modalErrorShow("No Data Found!");
                        $("#loadingScreen").hide();
                    }
                },
                    function error(response) {
                        modalErrorShow(response);
                        console.log(response);
                        $("#loadingScreen").hide();
                    });
            }
          

            /// LookUP implementation
            $scope.onImporterKSAChange = function (searchStr) {
                $scope.PopulateImportKSA(searchStr);
                $scope.rowIndex = 0;
                $scope.lookUpCurrentPageExpressAgent = 1;
                if ($scope.expressAgentsFull) {
                    $scope.expressAgents = $scope.expressAgentsFull.filter(obj => {
                        return obj.ImporterCode.toString().toLowerCase()
                            .includes($scope.searchExpressAgentText.toLowerCase()) ||
                            (obj.ImporterEng &&
                            obj.ImporterEng.toLowerCase().includes($scope.searchExpressAgentText.toLowerCase())) ||
                            (obj.ImporterArb &&
                            obj.ImporterArb.toLowerCase().includes($scope.searchExpressAgentText.toLowerCase()));
                    });
                }
            }
            $scope.openImporterKSALookup = function (item) {
                $scope.searchExpressAgentText = '';
                $('#expressAgentLookup').modal({
                    backdrop: "static"
                });
                $('#searchExpressAgentText').focus();
                $('#searchExpressAgentText').select();
                $scope.onImporterKSAChange();
                $("#expressAgentLookup").off("keydown");
                $('#expressAgentLookup').bind('keydown',
                    function (event) {
                        $timeout(function () {
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
                                    $scope.setImportKSA($scope.expressAgentItemSelected);
                                    break;
                            }
                        });
                    });
            }
            $scope.searchExpressAgentText = '';
            $scope.ImportKSAKeyDown = function (event) {
                if (event.key == 'F9') {
                    debugger;
                    $scope.openImporterKSALookup();
                }
            }
            $scope.PopulateImportKSA = function (searchStr) {
                $scope.stoppedSearch = true;
                apiService.get('Customs/Lookup/GetKSAImporter',
                    {
                        centerCode: $stateParams.centerCode,
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
            $scope.setImportKSA = function (row)
            {
                
                if (row)
                {
                    $scope.selectedExpressAgent = (row.ImporterCode ? row.ImporterCode.toString() : '') +
                        "     " +
                        (row.ImporterEng ? row.ImporterEng : '') +
                        "     " +
                        (row.ImporterArb ? row.ImporterArb : '');
                    ValidationImporterCode(row.ImporterCode);
                }
                //$scope.selectedExpressAgentObj = {};
                //$scope.selectedExpressAgentObj.originalObject = row;
                $("#expressAgentLookup").modal("hide");
            }
            $scope.$watch("searchExpressAgentText",
                function () {
                    $scope.onImporterKSAChange($scope.searchExpressAgentText);
                });

            $scope.selectedExpressAgentObj = function (selected)
            {
                //alert(selected.description.ImporterCode);
                console.log(selected.description.ImporterCode);
                ValidationImporterCode(selected.description.ImporterCode);
            };
            ///

            ValidationImporterCode = (Code) =>
            {
                $("#loadingScreen").show();
                apiService.get('Customs/Invoice/ValidateKSADelImporter',
                    {
                        centerCode: $stateParams.centerCode,
                        ImporterCode: Code
                    },
                    function (results) {
                        $scope.ValidationInformation = results.data.ResponseResult.Data;
                        $scope.ValidationStatus = results.data.ResponseResult.IsValid;
                        if (results.data.ResponseResult.IsValid)
                        {
                            if (apiService.isNullOrEmptyOrUndefined($scope.HeaderInformation))
                            {
                                $scope.HeaderInformation = {};
                            }
                            $scope.HeaderInformation.AgentCode = $scope.ValidationInformation.AgentCode;
                            $("#loadingScreen").hide();
                        }
                        else
                        {
                            if (apiService.isNullOrEmptyOrUndefined($scope.HeaderInformation))
                            {
                                $scope.HeaderInformation = {};
                            }
                            $scope.HeaderInformation.AgentCode = '';
                            $("#loadingScreen").hide();
                            showErrorMessage(results.data.ResponseResult.Messages);
                        }
                    },
                    function error(err) {
                        $log.log('Error while calling Express Agents Lookup', err);
                        $scope.stoppedSearch = false;
                        //$("#loadingScreen").hide();
                    });
            }


           

            $scope.CreateKSABill = () =>
            {
                $('#KSABILLDraftconfirmSendModalPopup').modal('hide');
                let BillType = '';
                if (apiService.isNullOrEmptyOrUndefined($scope.selectedExpressAgent))
                {
                    showErrorMessage("Importer Code Require!");
                    return;
                }
                $("#loadingScreen").show();

                if ($scope.HeaderInformation.FinalCountryCode == "120")
                {
                    BillType = 'I';
                }
                else
                {
                    BillType = 'T';
                }
                apiService.get('Customs/Invoice/CreateKSABill',
                    {
                        centerCode: $stateParams.centerCode,
                        ImporterCode: $scope.selectedExpressAgent.split(' ')[0],
                        ID: $stateParams.ID,
                        billType: BillType
                    },
                    function (results) {
                        $("#loadingScreen").hide();
                        if (results.data.ResponseResult.IsValid)
                        {
                            //results.data.ResponseResult.Data.JobCode
                            $scope.RecieveJobNumber = results.data.ResponseResult.Data.JobCode;
                            $('#KSABILLsuccessModal p.alert-success').html(results.data.ResponseResult.Messages + '\n' +  'JobNumber:  ' + results.data.ResponseResult.Data.JobCode);
                            $('#KSABILLsuccessModal').modal('show');

                           // modalSuccessShow(results.data.ResponseResult.Messages + '   ' + results.data.ResponseResult.Data.JobCode);
                           // $('#successModal').modal('show');
                           // 
                        }
                        else {
                            $("#loadingScreen").hide();
                            showErrorMessage(results.data.ResponseResult.Messages);
                        }
                    },
                    function error(err) {
                        $log.log('Error while calling Express Agents Lookup', err);
                        $scope.stoppedSearch = false;
                        //$("#loadingScreen").hide();
                    });
            }

            //
            // $state.go('shipmentAndInvoice', { 'centerCode': $scope.selCenterCode, 'jobNumber': item.JobNumber, 'tab': 'shipmentdetails', 'KSAFlag': 'Y' });
            $scope.WarningKSABill = () =>
            {
                if (apiService.isNullOrEmptyOrUndefined($scope.selectedExpressAgent))
                {
                    showErrorMessage("Importer Code Require!");
                    return;
                }
                if (!$scope.ValidationStatus)
                {
                    $('#KSABILLDraftconfirmSendModalPopup').modal('show');
                }
                else {
                    $scope.CreateKSABill();
                }
            }
            $scope.NavigateToKSABill = (data) =>
            {
                debugger;
                $('#KSABILLsuccessModal').modal('hide');

                if (data == true)
                {
                    $state.go('shipmentAndInvoice', { 'centerCode': $stateParams.centerCode, 'jobNumber': $scope.RecieveJobNumber, 'tab': 'shipmentdetails', 'KSAFlag': 'Y' });
                }
                else
                {
                    $state.go('ksaCreateBill');
                }
            }


            function modalErrorShow(msg) {
                $('#KSABILLErrorModal p.alert-danger').html(msg);
                $('#KSABILLErrorModal').modal('show');
            }
        }
    ]);