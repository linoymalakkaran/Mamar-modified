angular.module('mamarApp').controller('lcDetailsController',
    [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter', '$timeout', 'apiService', '$uibModal', 'sharedModels', 'paginationService',
        'userAccountStorageFactory', '$log', '$storage',
        function ($scope,
            $rootScope,
            $state,
            $stateParams,
            $filter,
            $timeout,
            apiService,
            $uibModal,
            sharedModels,
            paginationService,
            userAccountStorageFactory,
            $log, $storage) {

            $scope.issueDateChanged = (lcIssueDate) => {

                $scope.lcStartDate = angular.copy(lcIssueDate);
                if (lcIssueDate) {
                    var issuedDate = new Date($filter('date')(new Date(apiService.formatDateObject(lcIssueDate)), "MM/dd/yyyy"));
                    issuedDate.setFullYear(issuedDate.getFullYear() + 1);
                    issuedDate.setDate(issuedDate.getDate());
                    $scope.lcExpiryDate = $filter('date')((new Date(issuedDate)), "dd/MM/yyyy");
                    $scope.lcEndDate = angular.copy($scope.lcExpiryDate);

                }
            }

            function validateExpiryDate() {
                var lcIssDate = $scope.lcIssueDate ? $filter('date')(new Date(apiService.formatDateObject($scope.lcIssueDate)), "MM/dd/yyyy") : '';
                var lcExpiryDate = $scope.lcExpiryDate ? $filter('date')(new Date(apiService.formatDateObject($scope.lcExpiryDate)), "MM/dd/yyyy") : '';
                if (lcIssDate && lcExpiryDate) {
                    $scope.validIssueDate = true;
                    if (moment(lcIssDate) > moment(lcExpiryDate)) {
                        $scope.validIssueDate = false;
                        $scope.isValidRenewal = !$scope.validIssueDate ? false : $scope.isValidRenewal;
                    }
                }
            }
            $scope.expiryDateChanged = (lcExpDate) => {
                $scope.lcEndDate = angular.copy(lcExpDate);
                validateExpiryDate();
            }
            //#region Lookup Methods
            function loadBankList() {
                getIndexData('BankList', '', function (data) {
                    $scope.bankList = data;
                }, function () {
                    apiService.get('Customs/LetterOfCredit/BankList',
                        {
                            centerCode: $stateParams.centerCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.bankList = results.data.ResponseResult.Data;
                            storeData(results.data.ResponseResult.Data, 'BankList', '');
                        },
                        function error(response) {
                            modalErrorShow("An Error has occurred while getting bank list!");
                        }
                    )
                });
            }
            //GenericLookup Methods
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'bank':
                        $scope.bankDetails.bankCode = row.BankCode;
                        $scope.bankDetails.bankName = row.BankName;
                        $('#bankCode_value').focus();
                        break;
                }
                $("#genericLookUp").modal("hide");
            }

            $scope.lookupTabOut = (code, lookupId) => {
                switch (lookupId) {
                    case 'bank':
                        $scope.lookupData = angular.copy($scope.bankList);
                        break;
                }
                var selectedLookupRecord =
                    $filter('filter')($scope.lookupData, function (selCode) {
                        return (selCode.BankCode.toString() == code.toString())
                    });

                switch (lookupId) {
                    case 'bank':
                        $scope.bankDetails.bankCode = (selectedLookupRecord && selectedLookupRecord.length > 0) ? selectedLookupRecord[0].BankCode : '';
                        $scope.bankDetails.bankName = (selectedLookupRecord && selectedLookupRecord.length > 0) ? selectedLookupRecord[0].BankName : '';
                        break;
                }
            }
            //#endregion

            //#region Methods

            function setRenewalHistoryParams() {
                $scope.renewHistoryParam =
                    {
                        centerCode: $scope.centerCode,
                        importerCode: $scope.importerSelected,
                        pageNumber: 1,
                        pageSize: 10
                    };
            }

            function getRenewalHistory() {
                $("#loadingScreen").show();
                apiService.get('Customs/LetterOfCredit/RenewalHistory', $scope.renewHistoryParam,
                    function (results) {
                        $("#loadingScreen").hide();
                        var result = (results && results.data) ? results.data.ResponseResult : null;
                        if (result && result.IsValid && result.Data) {
                            $scope.lcRenewalsHistory = result.Data.RenewalHistory;
                            $scope.renewalCount = ($scope.lcRenewalsHistory && $scope.lcRenewalsHistory.length > 0) ? $scope.lcRenewalsHistory[0].TOT_COUNT : 0;
                        } else {
                            modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No History found!");
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });

            }

            $scope.loadMoreHistoryRecords = function (newPageNo) {
                $scope.renewHistoryParam.pageNumber = newPageNo;
                getRenewalHistory();
            }

            $scope.lcRenewalsClicked = () => {
                $scope.selectedTab = 'lcRenewals';
                $scope.validIssueDate = true;
                setRenewalHistoryParams();
                getRenewalHistory();
                $scope.lcRenewalDetails = {};
            }

            $scope.lcDetailsClicked = () => {
                $scope.selectedTab = 'lcDetails';
                resetLCDetails();
                $scope.getLCDetails();
            }

            $scope.gotoLCList = () => {
                $state.go('lcList', {});
            }

            $scope.gotoSettle = () => {
                $state.go('lcSettle', { centerCode: $scope.centerCode, importer: $scope.importerSelected });
            }

            $scope.openLookup = function (lookupId) {
                $('#searchLookupText').val("");
                $timeout(function () {
                    $scope.lookupId = lookupId;
                    switch (lookupId) {
                        case 'bank':
                            $scope.lookUpTitle = $filter("translate")("Bank");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "Description", Width: "" }];
                            $scope.lookUpData = angular.copy($scope.bankList);
                            break;
                    }

                    $scope.searchLookupTextModel = '';
                    $('#genericLookUp').modal({
                        backdrop: "static"
                    });
                    $('#searchLookupText').focus();
                    $('#searchLookupText').select();
                    //$scope.onLookupSearhChange(lookupId);
                    $('#genericLookUp').off("keydown");
                    $('#genericLookUp').bind('keydown', function (event) {
                        $timeout(function () {
                            switch (event.keyCode) {
                                case 13:
                                    $scope.lookupTabOut(lookupId);
                                    break;
                            }
                        });
                    });
                    //Page was not resetting back to 1; so explicitly called 'setCurrentPage(1)'
                    if (paginationService.isRegistered("lookUpPager")) {
                        paginationService.setCurrentPage("lookUpPager", 1);
                    }
                    $scope.lookUpCurrentPage = 1;
                });
            }

            $scope.lookupKeyDown = function (event, lookupId) {
                if (event.key == 'F9') {
                    $scope.openLookup(lookupId);
                }
            }

            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'bank':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.bankList) {

                                $scope.lookUpData = $scope.bankList.filter(obj => {
                                    return obj.BankCode.toString().toLowerCase().includes(searchText) || (obj.BankName && obj.BankName.toLowerCase().includes(searchText));
                                });
                            }
                            break;
                    }
                });
            }

            function bindLCDetails() {
                $scope.bankDetails.bankCode = angular.copy($scope.lcDetails.MLC_BANK_CODE);
                $scope.bankDetails.bankName = angular.copy($scope.lcDetails.TXT_LC_BANK_NAME);
                $scope.lcIssueDate = $filter('date')((new Date($scope.lcDetails.MLC_ISS_DATE)), "dd/MM/yyyy");
                $scope.lcExpiryDate = $filter('date')((new Date($scope.lcDetails.MLC_EXP_DATE)), "dd/MM/yyyy");
                $scope.lcStartDate = $filter('date')((new Date($scope.lcDetails.MLC_START_DATE)), "dd/MM/yyyy");
                $scope.lcEndDate = $filter('date')((new Date($scope.lcDetails.MLC_END_DATE)), "dd/MM/yyyy");
                $scope.importerSelected = angular.copy($scope.lcDetails.MLC_IMP_CODE);

                $scope.stopFlag = angular.copy($scope.lcDetails.MLC_STOP_FLAG) == 'Y' ? true : false;
                $scope.transitFlag = angular.copy($scope.lcDetails.MLC_TRANSIT_ONLY) == 'Y' ? true : false;
            }

            $scope.getLCDetails = () => {
                $("#loadingScreen").show();
                apiService.get('Customs/LetterOfCredit/ControlDetail',
                    { centerCode: $scope.centerCode, searchString: '' },
                    function (results) {
                        $("#loadingScreen").hide();
                        var result = (results && results.data) ? results.data.ResponseResult : null;
                        if (result && result.IsValid) {
                            $scope.lcDetails = result.Data;
                            if ($scope.lcDetails) {
                                bindLCDetails();
                            }

                        } else {
                            modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No Details found!");
                        }
                    },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log(response);
                    });

            }

            function resetLCDetails() {
                $scope.lcDetails = {};
                $scope.bankDetails = { bankCode: '', bankName: '' };
                $scope.lcIssueDate = '';
                $scope.lcExpiryDate = '';
            }

            $scope.openAttachments = function () {
                $('#attachmentModal').modal('show');
            }

            $scope.openAttachmentUri = function (isAdd) {
                apiService.get('Customs/DeliveryOrder/DirectAttachmentToken',
                    {
                        centerCode: $scope.centerCode,
                        jobNumber: $scope.importerSelected,
                        attachmentFlag: isAdd ? 'Add' : 'VIEWONLY'
                    },
                    function (results) {
                        var data = results.data.ResponseResult.Data;
                        var uri = "https://archive.dof.ae/Mamar/DofDocServlet.dof?accept_ut=true&ut=" + data;
                        window.open(uri, 'newwindow', 'width=1200,height=650'); return false;
                    },
                    function error(response) {
                        modalErrorShow("An Error has occurred while getting Data!");
                    });

            }

            $scope.transitFlagClick = (checked) => {
                $scope.lcDetails.MLC_TRANSIT_ONLY = checked ? 'Y' : 'N';
            }
            $scope.stopFlagClick = (checked) => {
                $scope.lcDetails.MLC_STOP_FLAG = checked ? 'Y' : 'N';
            }

            function setRenewalDetails() {
                 
                $scope.lcRenewalDetails =
                    {
                        centerCode: $scope.centerCode,
                        importerCode: $scope.importerSelected,
                        lcAmount: $scope.lcDetails.MLC_LC_AMOUNT,
                        lcBalance: $scope.lcDetails.MLC_LC_BALANCE,
                        lcStartDate: $scope.lcStartDate,
                        lcEndDate: $scope.lcEndDate,
                        lcNumber: $scope.lcDetails.MLC_LC_NUMBER,
                        lcIssueDate: $scope.lcIssueDate,
                        lcExpiryDate: $scope.lcExpiryDate,
                        lcRemarks: $scope.lcDetails.MLC_REMARKS,
                        lcStopFlag: $scope.lcDetails.MLC_STOP_FLAG == 'Y' ? 'Y' : 'N',
                        lcBankCode: $scope.bankDetails.bankCode,
                        lcCreatedUser: '',
                        lcCreatedDate: '',
                        lcModifyUser: '',
                        lcModifyDate: '',
                        lcTransitOnly: $scope.lcDetails.MLC_TRANSIT_ONLY == 'Y' ? 'Y' : 'N',
                        dueAmount: $scope.lcDetails.DUE_AMT
                    }
            }

            function validateRenewal() {
                $scope.isValidRenewal = true;
                $scope.isValidRenewal = $scope.lcDetails.MLC_LC_BALANCE ? true : $scope.isValidRenewal;
                $scope.isValidRenewal = $scope.lcDetails.DUE_AMT ? true : $scope.isValidRenewal;
                $scope.isValidRenewal = $scope.lcIssueDate ? true : $scope.isValidRenewal;
                $scope.isValidRenewal = $scope.lcExpiryDate ? true : $scope.isValidRenewal;
                $scope.isValidRenewal = $scope.bankDetails.bankCode ? true : $scope.isValidRenewal;

                validateExpiryDate();
            }

            function resetRenewalDetails() {
                resetLCDetails();
                $scope.getLCDetails();
                setRenewalHistoryParams();
                getRenewalHistory();
            }

            $scope.renewLC = () => {
                setRenewalDetails();
                validateRenewal();
                if ($scope.isValidRenewal) {
                    $("#loadingScreen").show();
                    apiService.post('Customs/LetterOfCredit/SaveLCRenewal', '',
                        $scope.lcRenewalDetails,
                        function (results) {
                            $("#loadingScreen").hide();
                            var result = results.data.ResponseResult;
                            if (result && result.IsValid) {
                                showSuccessMessage(result.Messages);
                                resetRenewalDetails();
                            } else {
                                modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No Records found!");
                            }
                        },
                        function error(response) {
                            $("#loadingScreen").hide();
                            console.log(response);
                        });
                }
            }
            //#endregion

            //#region initialisation
            $scope.init = () => {
                $scope.$storage = $storage;
                $scope.selectedTab = 'lcDetails';
                $scope.centerCode = $stateParams.centerCode;
                $scope.validIssueDate = true;
                loadBankList();
                resetLCDetails();
                $scope.getLCDetails();
            }
            //#endregion

            //On Page Load
            $scope.init();

        }
    ]);
