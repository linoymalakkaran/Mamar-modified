angular.module('mamarApp').controller('hscodeMasterController',
    [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter', 'apiService', '$uibModal', 'sharedModels','paginationService',
        'userAccountStorageFactory', '$log', '$storage', '$timeout', 'Excel',
        function ($scope,
            $rootScope,
            $state,
            $stateParams,
            $filter,
            apiService,
            $uibModal,
            sharedModels,
            paginationService,
            userAccountStorageFactory,
            $log, $storage, $timeout, Excel) {

            //#region Lookup Methods
            //GET CENTER CODES
            $scope.getCenterCodes = () => {
                apiService.get('Customs/Lookup/CenterCodes',
                    $scope.centerCodelookUpParams,
                    function (results) {
                        if (results.data.ResponseResult != "") {
                            $scope.centerCodes = results.data.ResponseResult.Data;
                            if ($scope.centerCodes) {
                                var selectedCenter = $filter('filter')($scope.centerCodes,
                                    function (cenCode) { return (cenCode.Code == 'V') });
                                $scope.selectedCenterCode = selectedCenter.length == 1
                                    ? selectedCenter[0].Code
                                    : $scope.centerCodes.length > 0
                                        ? $scope.centerCodes[0].Code
                                        : "";

                                $scope.onCenterCodeChanged();
                            }
                        }
                    },
                    function error(response) {
                        modalErrorShow('something went wrong in fetching centercodes : ' + response);
                    });
            }

            function populateHSCodes() {
                getIndexData('HSMaster', '', function (data) {
                    $scope.hsCodes = data;
                }, function () {
                    apiService.get('Customs/MasterSearch/HarmCode',
                        {
                            centerCode: $scope.selectedCenterCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.hsCodes = results.data.ResponseResult.Data;
                            storeData($scope.hsCodes, 'HSMaster', '');
                        },
                        function error(response) {
                          
                            console.log('Error in getting HS Code lookup data!');
                        });
                });
            }
            function populateSections() {
                getIndexData('Sections', '', function (data) {
                    $scope.sections = data;
                }, function () {
                    apiService.get('Customs/MasterSearch/SectionList',
                        {
                            centerCode: $scope.selectedCenterCode,
                            searchString: ''
                        },
                        function (results) {
                            $scope.sections = results.data.ResponseResult.Data;
                            storeData($scope.sections, 'Sections', '');
                        },
                        function error(response) {
                            console.log('Error in getting sections lookup data!');
                        });
                });
            }

            function populateChapters() {
                $scope.chapters = [];
                if ($scope.selectedSection && $scope.selectedSection.originalObject && $scope.selectedSection.originalObject.Code) {
                    $("#loadingScreen").show();
                    apiService.get('Customs/MasterSearch/ChapterList',
                        {
                            centerCode: $scope.selectedCenterCode,
                            sectionCode: $scope.selectedSection.originalObject.Code,
                            code: '',
                            description: ''
                        },
                        function (results) {
                            $("#loadingScreen").hide();
                            if (results && results.data) {
                                $scope.chapters = results.data.ResponseResult.Data;
                                $scope.chapterDisabled = false;
                            }
                        },
                        function error(response) {
                            console.log('Error in getting chapters lookup data!');
                        });
                }
            }

            //F9 Search
            $scope.setLookupData = function (row, lookupId) {
                switch (lookupId) {
                    case 'section':
                        $scope.section = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedSection = {};
                        $scope.selectedSection.originalObject = row;
                        $('#section_value').focus();
                        break;

                    case 'chapter':
                        $scope.chapter = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedChapter = {};
                        $scope.selectedChapter.originalObject = row;
                        $('#chapter_value').focus();
                        break;
                    case 'hsCode':
                        $scope.hsCode = row.Code.toString() + "     " + (row.EnglishName ? row.EnglishName : '') + "     " + (row.ArabicName ? row.ArabicName : '');
                        $scope.selectedHSCode = {};
                        $scope.selectedHSCode.originalObject = row;
                        $('#hsCode_value').focus();
                        break;
                }
                $("#genericLookUp").modal("hide");
            }

            $scope.onLookupSearhChange = function () {
                var searchText = $("#searchLookupText").val().toLowerCase();
                $timeout(function () {
                    switch ($scope.lookupId) {
                        case 'section':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.sections) {
                                $scope.lookUpData = $scope.sections.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText)) || (obj.ArabicName && obj.ArabicName.includes(searchText));
                                });
                            }
                            break;
                        case 'chapter':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.chapters) {
                                $scope.lookUpData = $scope.chapters.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText)) || (obj.ArabicName && obj.ArabicName.includes(searchText));
                                });
                            }
                            break;
                        case 'hsCode':
                            $scope.lookUpCurrentPage = 1;
                            if ($scope.hsCodes) {
                                $scope.lookUpData = $scope.hsCodes.filter(obj => {
                                    return obj.Code.toString().toLowerCase().includes(searchText) || (obj.EnglishName && obj.EnglishName.toLowerCase().includes(searchText)) || (obj.ArabicName && obj.ArabicName.includes(searchText));
                                });
                            }
                            break;

                    }
                });
            }

            $scope.openLookup = function (lookupId) {
                $('#searchLookupText').val("");
                $timeout(function () {
                    $scope.lookupId = lookupId;
                    switch (lookupId) {
                        case 'section':
                            $scope.lookUpTitle = $filter("translate")("Sections");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "Description", Width: "" }];
                            $scope.lookUpData = angular.copy($scope.sections);
                            break;
                        case 'chapter':
                            $scope.lookUpTitle = $filter("translate")("Chapters");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "Description", Width: "" }];
                            $scope.lookUpData = angular.copy($scope.chapters);
                            break;
                        case 'hsCode':
                            $scope.lookUpTitle = $filter("translate")("HSCode");
                            $scope.lookUpHeaders = [{ Text: "Code", Width: "100" }, { Text: "Description", Width: "" }];
                            $scope.lookUpData = angular.copy($scope.hsCodes);
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

            function resetChapter() {
                $scope.chapter = '';
                $scope.selectedChapter = {};
                $scope.selectedChapter.originalObject = {};
                $scope.chapterDisabled = true;
            }

            $scope.$watchCollection("selectedSection", function () {
                if ($scope.selectedSection && $scope.selectedSection.originalObject && $scope.selectedSection.originalObject.Code) {
                    $scope.invalidSection = false;
                    $scope.isChapterRequired = true;
                    populateChapters();
                    resetChapter();
                }
            });
            $scope.$watchCollection("selectedChapter", function () {
                if ($scope.selectedChapter && $scope.selectedChapter.originalObject && $scope.selectedChapter.originalObject.Code) {
                    $scope.isChapterRequired = false;
                }
            });
            //#region Methods
            function validateSearch() {

                $scope.isValid = true;
                $scope.invalidSection = false;
                $scope.invalidChapter = false;
                $scope.invalidHSCode = false;
               
                var sectionSelected = $scope.selectedSection
                    ? $scope.selectedSection.originalObject.Code +
                    $scope.selectedSection.originalObject.EnglishName +
                    ($scope.selectedSection.originalObject.ArabicName
                        ? $scope.selectedSection.originalObject.ArabicName
                        : '')
                    : '';
                if (($scope.section &&
                    (sectionSelected == 0 ||
                    ($scope.section.replace(/\s/g, '') != sectionSelected.replace(/\s/g, ''))))) {
                    $scope.invalidSection = true;
                    $scope.isValid = false;
                }

                var chapterSelected = $scope.selectedChapter
                    ? $scope.selectedChapter.originalObject.Code +
                    $scope.selectedChapter.originalObject.EnglishName +
                    ($scope.selectedChapter.originalObject.ArabicName
                        ? $scope.selectedChapter.originalObject.ArabicName
                        : '')
                    : '';
                if ( ($scope.chapter &&
                    (chapterSelected == 0 ||
                    ($scope.chapter.replace(/\s/g, '') != chapterSelected.replace(/\s/g, ''))))) {
                    $scope.invalidChapter = true;
                    $scope.isValid = false;
                }

                if ($scope.section && !$scope.invalidSection && !$scope.chapter) {
                    $scope.isChapterRequired = true;
                    $scope.isValid = false;
                }

                var hsCodeSelected = $scope.selectedHSCode
                    ? $scope.selectedHSCode.originalObject.Code +
                    $scope.selectedHSCode.originalObject.EnglishName +
                    ($scope.selectedHSCode.originalObject.ArabicName
                        ? $scope.selectedHSCode.originalObject.ArabicName
                        : '')
                    : '';
                if (($scope.hsCode &&
                    (hsCodeSelected == 0 ||
                    ($scope.hsCode.replace(/\s/g, '') != hsCodeSelected.replace(/\s/g, ''))))) {
                    $scope.invalidHSCode = true;
                    $scope.isValid = false;
                }

                //if (!$scope.invalidSection)
                //    $scope.searchParameter.sectionCode = $scope.selectedSection ? $scope.selectedSection.originalObject.Code : '';

                if (!$scope.invalidChapter)
                    $scope.searchParameter.chapterCode = $scope.selectedChapter ? ($scope.selectedChapter.originalObject.Code ? $scope.selectedChapter.originalObject.Code:'') : '';

                if (!$scope.invalidHSCode)
                    $scope.searchParameter.code = $scope.selectedHSCode ? ($scope.selectedHSCode.originalObject.Code ? $scope.selectedHSCode.originalObject.Code:'') : '';
            }
            $scope.getHSCodeListBySearch = () => {
                validateSearch();
                if ($scope.isValid) {
                    $("#loadingScreen").show();
                    apiService.get('Customs/MasterSearch/HSSystemList',  
                        $scope.searchParameter,
                        function (results) {
                            $("#loadingScreen").hide();
                            var result = results.data.ResponseResult;
                            if (result && result.IsValid) {
                                $scope.hsCodeList = result.Data ? result.Data : '';
                                $scope.totalCount = $scope.hsCodeList ? $scope.hsCodeList[0].Total : 0;
                            } else {
                                modalErrorShow((result && result.Messages) ? apiService.formatResponseMessage(result.Messages) : "No Records found!");
                            }
                        },
                        function error(response) {
                            console.log(response);
                        });
                }
            }
            $scope.loadMoreRecords = function (newPageNo) {
                $scope.searchParameter.pageNumber = newPageNo;
                $scope.getHSCodeListBySearch();
            }
            $scope.searchResult = () => {
                $scope.searchParameter.pageNumber = 1;
                $scope.getHSCodeListBySearch();
            }
            //#endregion

            //#region initialisation
            function initialiseSearch() {
                $scope.isValid = true;
                $scope.invalidSection = false;
                $scope.invalidChapter = false;
                $scope.invalidHSCode = false;

                $scope.section = '';
                $scope.hsCode = '';

                $scope.selectedSection = {};
                $scope.selectedSection.originalObject = {};

                resetChapter();
                
                $scope.selectedHSCode = {};
                $scope.selectedHSCode.originalObject = {};

                $scope.searchParameter = {
                    centerCode: $scope.selectedCenterCode,
                    chapterCode: '',
                    code: '',
                    description: '',
                    terrifDescription:'',
                    pageNumber: 1,
                    pageSize: 10
                };

                $scope.hsCodeList = [];
            }
            $scope.clearSearchFilters = () => {
                initialiseSearch();
            }
            $scope.init = () => {
                $("#loadingScreen").show();
                $scope.$storage = $storage;
                $scope.transModes = apiService.getTransportModeList();
                $scope.selectedTransMode = $scope.transModes ? $scope.transModes[0].key : '';
                $scope.centerCodelookUpParams = {
                    transportMode: $scope.selectedTransMode,
                    searchString: ''
                };
                $scope.onModeChanged();
                $scope.chapterDisabled = true;
                $scope.isChapterRequired = false;
            }
            //#endregion

            //#region on change event
            $scope.onModeChanged = function () {
                $scope.centerCodelookUpParams.transportMode = $scope.selectedTransMode;
                $scope.selectedMode = $scope.selectedTransMode;
                $scope.getCenterCodes();
                $scope.hsCodeList = null;
            }
            $scope.onCenterCodeChanged = function () {
                initialiseSearch();
                $scope.searchParameter.centerCode = $scope.selectedCenterCode;
                populateSections();
                populateHSCodes();
                $scope.hsCodeList = null;
              
                $scope.getHSCodeListBySearch();
            }

            //#endregion
            //On Page Load
            $scope.init();

        }
    ]);
