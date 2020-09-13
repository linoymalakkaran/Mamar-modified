angular.module('mamarApp').controller('ataCarnetController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', 'parameters', '$uibModalInstance', '$filter',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, parameters, $uibModalInstance, $filter) {

        $scope.$storage = $storage;

        $scope.ATACarnetRequestObject = {
            centerCode: parameters.centerCode,
            jobNumber: parameters.jobNumber
        }

        $scope.PopulateData = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/ATACarnet/GetATACarnet', $scope.ATACarnetRequestObject, function (results) {
                $("#loadingScreen").hide();
                var responseData = results.data.ResponseResult;
                $scope.CarnetDetails = responseData.Data;
                $scope.ResponseMessage = responseData.Message;
                if ($scope.CarnetDetails) {
                    $scope.CarnetDetails.IssuedDate = $scope.CarnetDetails.IssuedDate ? $filter('date')($scope.CarnetDetails.IssuedDate, "dd/MM/yyyy") : '';
                    $scope.CarnetDetails.ValidUntilDate = $scope.CarnetDetails.ValidUntilDate ? $filter('date')($scope.CarnetDetails.ValidUntilDate, "dd/MM/yyyy") : '';
                    GetCountryLookUpFormattedData();
                    GetIndendedLookUpFormattedData();
                    $scope.carnetNumberExisting = $scope.CarnetDetails.ATACarnetNumber ? true : false;
                }
            },
        function error(response) {
            $("#loadingScreen").hide();
            console.log(response);
        });
        }

        //OnChange of Country
        $scope.$watch("selectedCountryModel", function () {
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedCountryModel)) {
                apiService.get('Customs/Lookup/GenericLookup',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: '',
                    lookupType: 'Country'
                },
                function (results) {
                    $scope.country = results.data.ResponseResult.Data;
                },
                function error(response) {
                    console.log(response);
                });
            }
        });

        //OnChange of Indended use
        $scope.$watch("selectedIndendedModel", function () {
            if (!apiService.isNullOrEmptyOrUndefined($scope.selectedIndendedModel)) {
                apiService.get('Customs/Lookup/IntendedGoods',
                {
                    centerCode: $stateParams.centerCode,
                    searchString: ''
                },
                function (results) {
                    $scope.indended = results.data.ResponseResult.Data;
                },
                function error(response) {
                    console.log(response);
                });
            }
        });

        function GetCountryLookUpFormattedData() {

            if (!apiService.isNullOrEmptyOrUndefined($scope.CarnetDetails)) {
                $scope.selectedCountryModel = $scope.CarnetDetails.CountryCode ? $scope.CarnetDetails.CountryCode + "     " : "";
                $scope.selectedCountryModel = $scope.selectedCountryModel + ($scope.CarnetDetails.CountryDescEng ? $scope.CarnetDetails.CountryDescEng + "     " : "");
                $scope.selectedCountryModel = $scope.selectedCountryModel + ($scope.CarnetDetails.CountryDescArb ? $scope.CarnetDetails.CountryDescArb : "");
            }
            $scope.selectedCountry = {};
            $scope.selectedCountry.originalObject = {};
            $scope.selectedCountry.originalObject.Code = $scope.CarnetDetails.CountryCode;
            $scope.selectedCountry.originalObject.EnglishName = $scope.CarnetDetails.CountryDescEng;
            $scope.selectedCountry.originalObject.ArabicName = $scope.CarnetDetails.CountryDescArb;
        }

        function GetIndendedLookUpFormattedData() {

            if (!apiService.isNullOrEmptyOrUndefined($scope.CarnetDetails)) {
                $scope.selectedIndendedModel = $scope.CarnetDetails.IntendedGoodsCode ? $scope.CarnetDetails.IntendedGoodsCode + "     " : "";
                $scope.selectedIndendedModel = $scope.selectedIndendedModel + ($scope.CarnetDetails.IntendedGoodsDescEng ? $scope.CarnetDetails.IntendedGoodsDescEng + "     " : "");
                $scope.selectedIndendedModel = $scope.selectedIndendedModel + ($scope.CarnetDetails.IntendedGoodsDescArb ? $scope.CarnetDetails.IntendedGoodsDescArb : "");
            }
            $scope.selectedIndended = {};
            $scope.selectedIndended.originalObject = {};
            $scope.selectedIndended.originalObject.CODE = $scope.CarnetDetails.IntendedGoodsCode;
            $scope.selectedIndended.originalObject.EngName = $scope.CarnetDetails.IntendedGoodsDescEng;
            $scope.selectedIndended.originalObject.ArbName = $scope.CarnetDetails.IntendedGoodsDescArb;
        }

        $scope.saveATACarnet = function () {
            $("#loadingScreen").show();
            ValidateForm();
            $scope.Message = "";
            if ($scope.isValid) {

                var issuedDate = ($scope.CarnetDetails && $scope.CarnetDetails.IssuedDate) ? $filter('date')(new Date(apiService.formatDateObject($scope.CarnetDetails.IssuedDate)), "MM/dd/yyyy") : '';
                var validUntilDate = ($scope.CarnetDetails && $scope.CarnetDetails.ValidUntilDate) ? $filter('date')(new Date(apiService.formatDateObject($scope.CarnetDetails.ValidUntilDate)), "MM/dd/yyyy") : '';

                var carnetDataToSave = {
                    CompanyCode: '',
                    CenterCode: parameters.centerCode,
                    UserCode: '',
                    JobNumber: parameters.jobNumber,
                    ATACarnetNumber: $scope.CarnetDetails.ATACarnetNumber,
                    ATAHolderAddress: $scope.CarnetDetails.ATAHolderAddress,
                    RepresentedBy: $scope.CarnetDetails.RepresentedBy,
                    CountryCode: $scope.selectedCountryModel && $scope.selectedCountry ? $scope.selectedCountry.originalObject.Code : '',
                    CountryDescEng: $scope.selectedCountryModel && $scope.selectedCountry ? $scope.selectedCountry.originalObject.EnglishName : '',
                    CountryDescArb: $scope.selectedCountryModel && $scope.selectedCountry ? $scope.selectedCountry.originalObject.ArabicName : '',
                    IntendedGoodsCode: $scope.selectedIndendedModel && $scope.selectedIndended ? $scope.selectedIndended.originalObject.CODE : '',
                    IntendedGoodsDescEng: $scope.selectedIndendedModel && $scope.selectedIndended ? $scope.selectedIndended.originalObject.EngName : '',
                    IntendedGoodsDescArb: $scope.selectedIndendedModel && $scope.selectedIndended ? $scope.selectedIndended.originalObject.ArbName : '',
                    IssuedDate: issuedDate,
                    IssuedBy: $scope.CarnetDetails.IssuedBy,
                    ValidUntilDate: validUntilDate
                }

                apiService.post('Customs/ATACarnet/AddUpdateATACarnet', '', carnetDataToSave, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = (response && response.Messages) ? apiService.formatResponseMessage(response.Messages) : '';
                    if (response.IsValid) {
                        $scope.isValid = true;
                        $scope.Message = "SavedSuccess";
                        $scope.PopulateData();
                    }
                    else
                    {
                        $scope.isValid = false;
                        $scope.Message = msg;
                    } 
                }
                ,
                function error(response) {
                    $("#loadingScreen").hide();
                    console.log(response);
                });
            }
            else {
                $scope.Message = "CorrectErrors";
                if ($scope.requiredFieldMissing)
                    $scope.Message = "RequiredFieldValidationMsg";
                $("#loadingScreen").hide();
            }
        }

        function ValidateForm() {
            $scope.isValid = true;
            $scope.requiredFieldMissing = false;
            if ($scope.CarnetDetails) {
                if (!$scope.CarnetDetails.ATACarnetNumber) {
                    $scope.requiredATACarnetNumber = true;
                    $scope.isValid = false;
                }
                else {
                    $scope.requiredATACarnetNumber = false;
                }
                if (!$scope.CarnetDetails.IssuedDate) {
                    $scope.requiredIssueDate = true;
                    $scope.isValid = false;
                }
                else {
                    $scope.requiredIssueDate = false;
                }
                if (!$scope.CarnetDetails.ValidUntilDate) {
                    $scope.requiredValidateDate = true;
                    $scope.isValid = false;
                }
                else {
                    $scope.requiredValidateDate = false;
                }

                if (!$scope.requiredIssueDate && !$scope.requiredValidateDate) {

                    var validity = apiService.formatDateObject($scope.CarnetDetails.ValidUntilDate);
                    var issueDate = apiService.formatDateObject($scope.CarnetDetails.IssuedDate);
                    var timeDiff = validity.getTime() - issueDate.getTime();
                    var diffDays = (validity.getTime() - issueDate.getTime()) / (1000 * 3600 * 24);

                    if (diffDays > 365) {
                        $scope.ValidityInvalid = true;
                        $scope.isValid = false;
                    }
                    else {
                        $scope.ValidityInvalid = false;
                    }

                    if (diffDays < 0) {
                        $scope.ValidityLessThanIssue = true;
                        $scope.isValid = false;
                    }
                    else {
                        $scope.ValidityLessThanIssue = false;
                    }
                }

                var countrySelected = $scope.selectedCountry ? $scope.selectedCountry.originalObject.Code + $scope.selectedCountry.originalObject.EnglishName + $scope.selectedCountry.originalObject.ArabicName : '';
                if ($scope.selectedCountryModel && (countrySelected == 0 || $scope.selectedCountryModel.replace(/\s/g, '') != countrySelected.replace(/\s/g, ''))) {
                    $scope.InvalidCountry = true;
                    $scope.isValid = false;
                }
                else {
                    $scope.InvalidCountry = false;
                }

                var indendedSelected = $scope.selectedIndended ? $scope.selectedIndended.originalObject.CODE + $scope.selectedIndended.originalObject.EngName + $scope.selectedIndended.originalObject.ArbName : '';
                if ($scope.selectedIndendedModel && (indendedSelected == 0 || $scope.selectedIndendedModel.replace(/\s/g, '') != indendedSelected.replace(/\s/g, ''))) {
                    $scope.InvalidIndended = true;
                    $scope.isValid = false;
                }
                else {
                    $scope.InvalidIndended = false;
                }
            }
            else
            {
                $scope.requiredFieldMissing = true;
                $scope.isValid = false;
                $("#loadingScreen").hide();
            }
        }

        $scope.closeModal = function () {
            $uibModalInstance.close();
        }

        var today = new Date();
        $scope.todaysDate = today;
        var tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        $scope.tomorrowDate = tomorrowDate;

        $scope.PopulateData();
    }]);