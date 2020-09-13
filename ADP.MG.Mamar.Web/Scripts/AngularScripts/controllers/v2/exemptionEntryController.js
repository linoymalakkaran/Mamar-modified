angular.module('mamarApp').controller('exemptionEntryController',
    ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$filter', 'apiService', '$storage', '$uibModal', '$uibModalInstance', 'exemptionEntryGroupInfoService', 'parameters',
function ($scope, $rootScope, $http, $state, $stateParams, $filter, apiService, $storage, $uibModal, $uibModalInstance, exemptionEntryGroupInfoService, parameters) {
    $scope.$storage = $storage;
    $scope.selectedLanguage = 'en';
    $scope.selectedExemptionModel = '';
    $scope.selectedMadeInModel = '';
    $scope.selectedMadeIn = {};
    $scope.selectedMadeIn.originalObject = {};
    $scope.selectedMadeIn.originalObject.GccCountCode = null;
    $scope.selectedMadeIn.originalObject.GccCountEngName = null;
    $scope.selectedMadeIn.originalObject.GccCountArbName = null;
    $scope.selectedexemptionCode = {};
    $scope.selectedexemptionCode.originalObject = {};
    $scope.selectedexemptionCode.originalObject.ExemptionCode = null;
    $scope.selectedexemptionCode.originalObject.ExemptionEngName = null;
    $scope.selectedexemptionCode.originalObject.ddlExemptionCode = null;
    $scope.IsValidExemptionEntry = true;
    $scope.IsValidGccNo = true;
    $scope.IsValidGCCNumber = true;
    $scope.showFields = true;
    $scope.Valid = true;
    //$scope.globalDisableFlag = parameters.globalDisableFlag;

    $scope.gccNo = '';
    $scope.IsValidExemptionCode = true;
    $scope.IsValidExemptionCountry = true;
    $scope.IsValidBillCIFAmount = true;
    $scope.IsValidStatCIFAmount = true;
    $scope.IsInvalidGCC = true;

    $scope.ExemptionInf = {
        Attrib1: null,
        Attrib2: null,
        Attrib3: null,
        Attrib4: null,
        Attrib5: null,
        Attrib6: null,
        Attrib7: null,
        Attrib8: null,
        Attrib9: null,
        Attrib10: null,
        Attrib11: null,
        Attrib12: null,
        Attrib13: null,
        Attrib14: null,
        CountryCode: null,
        CountryDesc: null,
        FirstEntryPoint: null,
        ID: null,
        Function: null,
        DutyAmount: null,
        BillNumber: null,
        Date: null,
        BillCIFAmount: null,
        StatNum: null,
        StatDate: null,
        StatCIFAmount: null,
        ErrorCode: 0,
        MessageArabic: null,
        ExemptionDescriptionArb: null,
        ExemptionDescriptionEng: null,
        ExemptionCode: null,
        CurrentYear: null,
        HeaderBillNumber: null,
        HeaderBillType: null,
        HeaderCenterCode: null,
        SerialNo: null
    }

    $scope.ExemptionInfoDetails = {
        CurrentYear: null,
        HeaderBillNumber: null,
        HeaderBillType: null,
        HeaderCenterCode: null,
        SerialNo: null
    }

    $scope.exemptionLookupKeyDown=function(event)
    {
        if (event.key == 'F9') {
            $scope.openExemptionLookup();
        }
    }

    $scope.ExemptionInfs = exemptionEntryGroupInfoService.getValue();
    function GetExemptionDetails() {
       
        if ($scope.ExemptionInfs.ExemptionCode != null) {
            $scope.selectedExemptionModel = $scope.ExemptionInfs.ExemptionCode + "  " + $scope.ExemptionInfs.ExemptionDescriptionEng + "  " + $scope.ExemptionInfs.ExemptionDescriptionArb;
            $scope.selectedexemptionCode.originalObject.ExemptionCode = $scope.ExemptionInfs.ExemptionCode;
            $scope.selectedexemptionCode.originalObject.ExemptionEngName = $scope.ExemptionInfs.ExemptionDescriptionEng;
            $scope.selectedexemptionCode.originalObject.ddlExemptionCode = $scope.ExemptionInfs.ExemptionDescriptionArb;

            //$scope.selectedMadeInModel = $scope.ExemptionInfs.CountCode + "  " + $scope.ExemptionInfs.CountEngName + "  " + $scope.ExemptionInfs.CountArbName;
            //$scope.selectedMadeIn.originalObject.GccCountCode = $scope.ExemptionInfs.CountCode;
            //$scope.selectedMadeIn.originalObject.GccCountEngName = $scope.ExemptionInfs.CountEngName;
            //$scope.selectedMadeIn.originalObject.GccCountArbName = $scope.ExemptionInfs.CountArbName;
            if ($scope.ExemptionInfs.CountryDesc != null) {
                var contryNames = $scope.ExemptionInfs.CountryDesc.split('-');
                $scope.selectedMadeIn.originalObject.GccCountCode = $scope.ExemptionInfs.CountryCode;
                $scope.selectedMadeIn.originalObject.GccCountEngName = contryNames[1];
                $scope.selectedMadeIn.originalObject.GccCountArbName = contryNames[0];
                $scope.selectedMadeInModel = $scope.ExemptionInfs.CountryCode + "  " + contryNames[1] + "  " + contryNames[0];
            }
            $scope.ExemptionInf.Attrib14 = $scope.ExemptionInfs.Attrib14;
            if ($scope.ExemptionInf.Attrib14 != '' && $scope.ExemptionInf.Attrib14 != null) {
                $scope.showFields = false;
                $scope.IsValidGccNo = true;
            }
            $scope.ExemptionInf.Attrib1 = $scope.ExemptionInfs.Attrib1;
            $scope.ExemptionInf.Attrib2 = $scope.ExemptionInfs.Attrib2;
            $scope.ExemptionInf.Attrib3 = $scope.ExemptionInfs.Attrib3;
            $scope.ExemptionInf.Attrib4 = $scope.ExemptionInfs.Attrib4;
            $scope.ExemptionInf.Attrib5 = $scope.ExemptionInfs.Attrib5;
            $scope.ExemptionInf.Attrib6 = $scope.ExemptionInfs.Attrib6;
            $scope.ExemptionInf.Attrib7 = $scope.ExemptionInfs.Attrib7;
            $scope.ExemptionInf.Attrib8 = $scope.ExemptionInfs.Attrib8;
            $scope.ExemptionInf.Attrib9 = $scope.ExemptionInfs.Attrib9;
            $scope.ExemptionInf.Attrib10 = $scope.ExemptionInfs.Attrib10;
            $scope.ExemptionInf.Attrib11 = $scope.ExemptionInfs.Attrib11;
            $scope.ExemptionInf.Attrib12 = $scope.ExemptionInfs.Attrib12;
            $scope.ExemptionInf.Attrib13 = $scope.ExemptionInfs.Attrib13;
            $scope.ExemptionInf.CountryCode = $scope.ExemptionInfs.CountryCode;
            $scope.ExemptionInf.CountryDesc = $scope.ExemptionInfs.CountryDesc;
            $scope.ExemptionInf.FirstEntryPoint = $scope.ExemptionInfs.FirstEntryPoint;
            $scope.ExemptionInf.ID = $scope.ExemptionInfs.ID;
            $scope.ExemptionInf.Function = $scope.ExemptionInfs.Function;
            $scope.ExemptionInf.DutyAmount = $scope.ExemptionInfs.DutyAmountExemption;
            $scope.ExemptionInf.BillNumber = $scope.ExemptionInfs.BillNumber;
            $scope.ExemptionInf.Date = $scope.ExemptionInfs.Date;
            $scope.ExemptionInf.BillCIFAmount = $scope.ExemptionInfs.BillCIFAmount;
            $scope.ExemptionInf.StatNum = $scope.ExemptionInfs.StatNum;
            $scope.ExemptionInf.StatDate = $scope.ExemptionInfs.StatDate;
            $scope.ExemptionInf.StatCIFAmount = $scope.ExemptionInfs.StatCIFAmount;
            $scope.ExemptionInf.ErrorCode = $scope.ExemptionInfs.ErrorCode;
            $scope.ExemptionInf.MessageArabic = $scope.ExemptionInfs.MessageArabic;
            $scope.ExemptionInfoDetails.CurrentYear = $scope.ExemptionInfs.CurrentYear;
            $scope.ExemptionInfoDetails.HeaderBillType = $scope.ExemptionInfs.CustBillType;
            $scope.ExemptionInfoDetails.HeaderBillNumber = $scope.ExemptionInfs.CustBillNumber;
            $scope.ExemptionInfoDetails.HeaderCenterCode = $scope.ExemptionInfs.CenterCode;
            $scope.ExemptionInfoDetails.SerialNo = $scope.ExemptionInfs.SerialNumber;
        }
        else {
            $scope.ExemptionInfoDetails.CurrentYear = $scope.ExemptionInfs.CurrentYear;
            $scope.ExemptionInfoDetails.HeaderBillType = $scope.ExemptionInfs.CustBillType;
            $scope.ExemptionInfoDetails.HeaderBillNumber = $scope.ExemptionInfs.CustBillNumber;
            $scope.ExemptionInfoDetails.HeaderCenterCode = $scope.ExemptionInfs.CenterCode;
            $scope.ExemptionInfoDetails.SerialNo = $scope.ExemptionInfs.SerialNumber;
        }
    }

    $scope.inputCountryChanged = function (searchStr) {
        $scope.selectedMadeInModel = searchStr;
        $scope.selectedMadeIn.originalObject = {};
        $scope.selectedMadeIn.originalObject.GccCountCode = null;
        $scope.selectedMadeIn.originalObject.GccCountEngName = null;
        $scope.selectedMadeIn.originalObject.GccCountArbName = null;
        $scope.showDiv = false;
        $scope.ExemptionInf.Attrib14 = '';
        $scope.showFields = true;
        if (!apiService.isNullOrEmptyOrUndefined(searchStr)) {
            $scope.IsValidExemptionCountry = true;
            $scope.IsValidGccNo = true;
        }
        if (!apiService.isNullOrEmptyOrUndefined(searchStr)) {
            apiService.get('Customs/Lookup/GCCCountries',
            {
                centerCode: $stateParams.centerCode,
                searchString: $scope.selectedMadeInModel,
            },
            function (results) {
                $scope.madeIn = results.data.ResponseResult.Data;
                $scope.showDiv = true;
            },
            function error(response) {
                console.log(response);
            });
        }
    };

    $scope.inputExemptionChanged = function (searchStr) {
        $scope.selectedExemptionModel = searchStr;
        $scope.selectedexemptionCode = {};
        $scope.selectedexemptionCode.originalObject = {};
        $scope.selectedexemptionCode.originalObject.ExemptionCode = null;
        $scope.selectedexemptionCode.originalObject.ExemptionEngName = null;
        $scope.selectedexemptionCode.originalObject.ddlExemptionCode = null;
        $scope.madeIn = null;
        $scope.selectedMadeInModel = '';
        $scope.selectedMadeIn = {};
        $scope.selectedMadeIn.originalObject = {};
        $scope.selectedMadeIn.originalObject.GccCountCode = null;
        $scope.selectedMadeIn.originalObject.GccCountEngName = null;
        $scope.selectedMadeIn.originalObject.GccCountArbName = null;
        $scope.ExemptionInf.Attrib14 = '';
        $scope.showFields = true;
        if (searchStr != "") {
            $scope.IsValidExemptionCode = true;
            $scope.IsValidExemptionCountry = true;
            $scope.IsValidGccNo = true;
        }
        Object.keys($scope.ExemptionInf)[0] = null;
        for (var key in $scope.ExemptionInf) {
            if ($scope.ExemptionInf.hasOwnProperty(key)) {
                $scope.ExemptionInf[key] = null;
            }
        }
        var s = $scope.ExemptionInf;
        if (!apiService.isNullOrEmptyOrUndefined($scope.selectedExemptionModel)) {
            apiService.get('Customs/Lookup/Exemption',
            {
                centerCode: $stateParams.centerCode,
                searchString: $scope.selectedExemptionModel,
                lookupType: 'Country'
            },
            function (results) {
                $scope.exemptionCode = results.data.ResponseResult.Data;
            },
            function error(response) {
                console.log(response);
            });
        }
    };

    $scope.closeModal = function () {
        $scope.ExemptionInfs = null;
        $uibModalInstance.close();
    }

    function validateExemptionCode() {
        $scope.IsValidExemptionCode = true;
        var exemptionSelected = ($scope.selectedexemptionCode && $scope.selectedexemptionCode.originalObject) ? $scope.selectedexemptionCode.originalObject.ExemptionCode + $scope.selectedexemptionCode.originalObject.ExemptionEngName + ($scope.selectedexemptionCode.originalObject.ExemptionArbName ? $scope.selectedexemptionCode.originalObject.ExemptionArbName : '') : '';
        if ($scope.selectedExemptionModel && (exemptionSelected == 0 || ($scope.selectedExemptionModel.replace(/\s/g, '') != exemptionSelected.replace(/\s/g, '')))) {
            $scope.IsValidExemptionCode = false;
        }
    }

    $scope.SaveexemptionEntry = function () {
        validateExemptionCode();
        if (!$scope.IsValidExemptionCode)
            return;

        $("#loadingScreen").show();
        var selectedExemptionModelss = $scope.selectedExemptionModel;
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && apiService.isNullOrEmptyOrUndefined($scope.selectedMadeIn)) {
            $scope.IsValidExemptionCountry = false;
            $("#loadingScreen").hide();
            return false;
        }
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && apiService.isNullOrEmptyOrUndefined($scope.selectedMadeIn.originalObject.GccCountCode)) {
            $scope.IsValidExemptionCountry = false;
            $("#loadingScreen").hide();
            return false;
        }
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && apiService.isNullOrEmptyOrUndefined($scope.ExemptionInf.Attrib14)) {
            $scope.IsValidGccNo = false;
            $("#loadingScreen").hide();
            return false;
        }
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && $scope.ExemptionInf.Attrib14.toString().length < 65) {
            $scope.IsValidGccNo = false;
            $("#loadingScreen").hide();
            return false;
        }
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && apiService.isNullOrEmptyOrUndefined($scope.ExemptionInf.BillCIFAmount) && apiService.isNullOrEmptyOrUndefined($scope.ExemptionInf.StatCIFAmount)) {
            $scope.IsValidBillCIFAmount = false;
            $scope.IsValidStatCIFAmount = false;
            $("#loadingScreen").hide();
            return false;
        }
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && apiService.isNullOrEmptyOrUndefined($scope.ExemptionInf.BillCIFAmount)) {
            $scope.IsValidBillCIFAmount = false;
            $("#loadingScreen").hide();
            return false;
        }
        if ($scope.selectedexemptionCode.originalObject.ExemptionCode == '33' && apiService.isNullOrEmptyOrUndefined($scope.ExemptionInf.StatCIFAmount)) {
            $scope.IsValidStatCIFAmount = false;
            $("#loadingScreen").hide();
            return false;
        }
        var selectCountryCodes = $scope.selectedMadeInModel;
        var exempCode = selectedExemptionModelss.split(' ');
        var countryCodes = selectCountryCodes.split(' ')
        $scope.ExemptionInf.centerCode = $stateParams.centerCode;
        $scope.ExemptionInf.ExemptionCode = exempCode[0];
        $scope.ExemptionInf.CountryCode = countryCodes[0];
        $scope.ExemptionInf.HeaderBillNumber = $scope.ExemptionInfoDetails.HeaderBillNumber;
        $scope.ExemptionInf.CurrentYear = $scope.ExemptionInfoDetails.CurrentYear;
        $scope.ExemptionInf.HeaderBillType = $scope.ExemptionInfoDetails.HeaderBillType;
        $scope.ExemptionInf.HeaderCenterCode = $stateParams.centerCode;//$scope.ExemptionInfoDetails.HeaderCenterCode;
        $scope.ExemptionInf.SerialNo = $scope.ExemptionInfoDetails.SerialNo;
        var ss = $scope.ExemptionInf;
        var d = JSON.stringify(ss);
        console.log(ss);
        console.log(JSON.stringify(ss));
        $scope.IsValidExemptionEntry = true;
        $scope.Valid = true;
        apiService.post('Customs/Invoice/AddUpdateExemptionInfo', '', $scope.ExemptionInf, function (result) {
            $("#loadingScreen").hide();
            $rootScope.$broadcast('exemptionsSaved', {});
            var response = result.data.ResponseResult;
            var msg = !apiService.isNullOrEmptyOrUndefined(response.Messages) ? apiService.formatResponseMessage(response.Messages) : "Exemption could not be updated";
            if (response.IsValid) {
                $scope.closeModal();
                $rootScope.$emit("RefreshInvoiceGroup", {});
                modalSuccessShow(msg);
            }
            else if (!response.IsValid) {
                modalErrorShow(msg);
            }
        },
           function (result) {
               $("#loadingScreen").hide();
               modalErrorShow("An Error has occurred while creating chassis job!" + result);
           });
    }
    $scope.GetSearchResult = function () {
        if (apiService.isNullOrEmptyOrUndefined($scope.ExemptionInf.Attrib14)) {
            $scope.IsValidGccNo = false;
            return false;
        }
        var lenght = $scope.ExemptionInf.Attrib14.toString().length;
        if (lenght < 65) {
            $scope.IsValidGccNo = false;
            return false;
        }
        else {

            $("#loadingScreen").show();
            var val = $scope.ExemptionInf.Attrib14;
            apiService.get('Customs/Invoice/GetGroupExemptionInfo',
            {
                centerCode: $stateParams.centerCode,
                exemptionCode: $scope.selectedexemptionCode.originalObject.ExemptionCode,
                gccNumber: $scope.ExemptionInf.Attrib14
            },
            function (results) {
                $("#loadingScreen").hide();
                if (results) {
                    $scope.ExemptionInf = results.data.ResponseResult.Data;
                    $scope.IsValidGCCNumber = true;
                    if ($scope.ExemptionInf) {

                        if ($scope.ExemptionInf.ErrorCode == 0 && !(results.data.ResponseResult.IsValid)) {
                            myEl = angular.element(document.querySelector('#isValidGCNumber'));
                            myEl.text($scope.ExemptionInf.MessageEnglish);
                            $scope.IsValidGCCNumber = false;
                            return false;
                        }
                        if ($scope.ExemptionInf.ErrorCode != 2) {
                            var contryNames = $scope.ExemptionInf.CountryDesc.split('-');
                            $scope.selectedMadeIn.originalObject.GccCountCode = $scope.ExemptionInf.CountryCode;
                            $scope.selectedMadeIn.originalObject.GccCountEngName = contryNames[1];
                            $scope.selectedMadeIn.originalObject.GccCountArbName = contryNames[0];
                            $scope.ExemptionInf.Attrib14 = val;
                            $scope.selectedMadeInModel = $scope.ExemptionInf.CountryCode + "  " + contryNames[1] + "  " + contryNames[0];
                            $scope.showFields = false;
                            $scope.IsValidGccNo = true;
                        }
                        else if ($scope.ExemptionInf.ErrorCode == 2) {
                            myEl = angular.element(document.querySelector('#isValidGCNumber'));
                            myEl.text($scope.ExemptionInf.MessageEnglish);
                            $scope.IsValidGCCNumber = false;
                            return false;
                        }
                    }
                }
            },
            function error(response) {
            });

        }
    }

    $scope.validateBillCIFAmount = function () {
        $scope.IsValidBillCIFAmount = true;
    }
    $scope.validateStatCIFAmount = function () {
        $scope.IsValidStatCIFAmount = true;
    }

    $scope.ValidateGccNo = function () {
        $scope.ExemptionInf.StatCIFAmount = null;
        $scope.ExemptionInf.BillCIFAmount = null;
        $scope.IsValidGccNo = true;
        $scope.showFields = true;
    }
    GetExemptionDetails();
   
    $scope.searchExemptionText = '';
    $scope.PopulateExemptions = function () {

        apiService.get('Customs/Lookup/Exemption',
            {
                centerCode: $stateParams.centerCode,
                searchString:''
            },
            function (results) {
                $scope.exemptionsFull = results.data.ResponseResult.Data;
                $scope.exemptions = angular.copy($scope.exemptionsFull);
            },
            function error(response) {
                console.log(response);
            });
    }

    $scope.$watch("searchExemptionText", function () {
        $scope.onExemptionChange();
    });

    //inputExemptionChanged
    $scope.openExemptionLookup = function (item) {
        $scope.searchExemptionText = '';
        $scope.recordToEdit = item;
        $('#exemptionLookup').modal({
            backdrop: "static"
        });
        $('#searchExemptionText').focus();
        //$('#searchExemptionText').select();
        $scope.onExemptionChange();
        // $("#exemptionLookup").off("keydown");
        //$('#exemptionLookup').bind('keydown', function (event) {
        //    console.log(event.keyCode);
        //    $timeout(function () {
        //        switch (event.keyCode) {
        //            case 40:
        //                if ($scope.rowIndex < $scope.exemptions.length - 1) {
        //                    $scope.rowIndex++;
        //                    if ($scope.rowIndex > 10 * $scope.lookUpCurrentPage - 1) {
        //                        $scope.lookUpCurrentPage++;
        //                    }
        //                    $scope.subSelected = $scope.harmonisedList[$scope.rowIndex];
        //                }
        //                break;
        //            case 38:
        //                if ($scope.rowIndex > 0) {

        //                    if ($scope.rowIndex == 10 * ($scope.lookUpCurrentPage - 1)) {
        //                        $scope.lookUpCurrentPage--;
        //                    }
        //                    $scope.rowIndex--;
        //                    $scope.harmonizedItemSelected = $scope.harmonisedList[$scope.rowIndex];
        //                }
        //                break;
        //            case 13:
        //                $scope.setHarmonized($scope.harmonizedItemSelected);
        //                break;
        //        }
        //    });
        //});
    }

    $scope.onExemptionChange = function () {
        $scope.rowIndex = 0;

        $scope.lookUpCurrentPage = 1;
        if ($scope.exemptionsFull) {
            $scope.exemptions = $scope.exemptionsFull.filter(obj => {
                return obj.ExemptionCode.toString().includes($scope.searchExemptionText) || (obj.ExemptionEngName && obj.ExemptionEngName.toLowerCase().includes($scope.searchExemptionText.toLowerCase()))
                    || (obj.ExemptionArbName && obj.ExemptionArbName.toLowerCase().includes($scope.searchExemptionText.toLowerCase()));
            });
        }
    }

    $scope.setExemption = function (row) {
        $scope.selectedExemptionModel = row.ExemptionCode.toString() + "     " + (row.ExemptionEngName ? row.ExemptionEngName : '') + "     " + (row.ExemptionArbName ? row.ExemptionArbName : '');

        $scope.selectedexemptionCode = {};
        $scope.selectedexemptionCode.originalObject = row;
        $("#exemptionLookup").modal("hide");
    }

    $scope.closeExemptionLookup=function()
    {
        $("#exemptionLookup").modal("hide");
    }

    $scope.PopulateExemptions();
}
    ]
);