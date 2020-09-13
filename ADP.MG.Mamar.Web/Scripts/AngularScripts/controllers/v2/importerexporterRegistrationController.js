angular.module('mamarApp').controller('importerexporterRegistrationController',
	[
		'$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', 'sharedModels', '$filter', '$log',
		'userAccountStorageFactory',
		function ($scope, $rootScope, $http, $state, $stateParams, apiService, sharedModels, $filter, $log, userAccountStorageFactory) {

		    $scope.centerCode = $stateParams.centerCode;
		    $scope.importerCode = $stateParams.importerCode;
		    $scope.ImporterCodeTemp = null;
		    $scope.docSerialNumber = null;
		    $scope.isSaveDisabled = true;
		    $scope.isTradeActiveFlag = false;
		    $scope.isNew = false;
		    $scope.formValidation = {};
		    $scope.acceptFiles = ".pdf,.docx,.xlsx,.jpg,.xls,.doc,.jpeg,.tif,.png,.bmp,.txt,.tiff,.xps,.gif,.rtf,.csv";

		    try {
		        $scope.isSuperUser = userAccountStorageFactory.getUserAccntInfo().isPCSSuperUser;
		    } catch (e) {
		        $log.log('Failed to get user account details, error : ', e);
		        $scope.isSuperUser = 'False';
		    }

		    //Look up methods - Page Load
		    initializeObject();
		    TradeActivityChange();
		    CategoryChanged();
		    GetCitycodes();
		    GetImportGroupCode();
		    GetNationalities();
		    GetImporterDetail();

		    //Center Code
		    apiService.get('Customs/Lookup/CenterCodes',
				{
				    transportMode: $scope.selectedMode,
				    searchString: ''
				},
				function (results) {
				    $scope.centerCodes = results.data.ResponseResult.Data;
				    if ($scope.centerCodes) {
				        $scope.selectedCenterVal =
							$filter('filter')($scope.centerCodes, { Code: $stateParams.centerCode });
				        $scope.selectedCenter = $scope.selectedCenterVal[0].Code
							? $scope.selectedCenterVal[0].Code + "     "
							: "";
				        $scope.selectedCenter = $scope.selectedCenter +
						($scope.selectedCenterVal[0].EnglishName
							? $scope.selectedCenterVal[0].EnglishName + "     "
							: "");
				        $scope.selectedCenter = $scope.selectedCenter +
							($scope.selectedCenterVal[0].ArabicName ? $scope.selectedCenterVal[0].ArabicName : "");
				        $scope.centerType = $scope.selectedCenterVal[0].CenterType;
				        sharedModels.shipmentHeader.selectedCenter = $scope.selectedCenter;
				    }
				},
				function error(response) {
				    modalErrorShow("An Error has occurred while getting lookup Data!");
				}
			);

		    $scope.checkisNullOrEmptyOrUndefined = function (val) {
		        if (apiService.isNullOrEmptyOrUndefined(val))
		            return true;
		        else
		            return false;
		    };
		    $scope.downLoadDocument = function (id) {
		        var attachements = $scope.ImpExpDetail.ImporterAttachments;
		        var attachement = $filter('filter')(attachements, { SerialNumber: id });

		        attachement[0].FileName = attachement[0].FilePath;
		        apiService.get('Customs/ImporterExporter/ViewAttachment',
					{
					    centerCode: $stateParams.centerCode,
					    importerCode: attachement[0].ImporterCode,
					    SerialNumber: id
					},
					function (results) {
					    var data = results.data.ResponseResult;
					    if (data.IsValid) {
					        attachement[0].content = data.Data.Data;
					        $("#loadingScreen").hide();
					        apiService.printDocuments(attachement);
					        return;
					    }
					},
					function error(response) {
					    $("#loadingScreen").hide();
					    console.log(response);
					});

		    }
		    $scope.AddUpdateImporterExporter = function () {

		        if ($scope.ImpExpDetail.ImporterDetailModel.ImporterCode == null ||
					$scope.ImpExpDetail.ImporterDetailModel.ImporterCode == "") {
		            $scope.ImpExpDetail.ImporterDetailModel.ImporterCode = null;
		            $scope.ImpExpDetail.ImporterDetailModel.RowID = null;
		        }
		        
		        $scope.ImpExpDetail.ImporterDetailModel.ImporterCenterCode = $scope.centerCode;
		        $scope.ImpExpDetail.ImporterDetailModel.CenterCode = $scope.centerCode;
		        $scope.ImpExpDetail.ImporterDetailModel.VATTrans =
					$scope.ImpExpDetail.ImporterDetailModel.VATTransNumber;
		        $scope.ImpExpDetail.ImporterDetailModel.ExciseTrans =
					$scope.ImpExpDetail.ImporterDetailModel.ExciseTrransNumber;

		        if (!apiService.isNullOrEmptyOrUndefined($scope.adccExpiry)) {
		            $scope.ImpExpDetail.ImporterDetailModel.AdccExpiry =
						$filter('date')(new Date(apiService.formatDateObject($scope.adccExpiry)), "MM/dd/yyyy");
		        }
		        if (!apiService.isNullOrEmptyOrUndefined($scope.municipExpiry)) {
		            $scope.ImpExpDetail.ImporterDetailModel.MunicipExpiry =
						$filter('date')(new Date(apiService.formatDateObject($scope.municipExpiry)), "MM/dd/yyyy");
		        }

		        if ($scope.selectedCategoryObj.originalObject.CategoryCode != null) {
		            $scope.ImpExpDetail.ImporterDetailModel.CategoryCode =
						$scope.selectedCategoryObj.originalObject.CategoryCode;
		            $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeEngName =
						$scope.selectedCategoryObj.originalObject.CategoryEngName;
		            $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeArbName =
						$scope.selectedCategoryObj.originalObject.CategoryArbName;
		        }
		        if ($scope.selectedNationalityObj.originalObject.NationalityCode != null) {
		            $scope.ImpExpDetail.ImporterDetailModel.City =
						$scope.selectedNationalityObj.originalObject.NationalityCode;
		            $scope.ImpExpDetail.ImporterDetailModel.CityEnglish =
						$scope.selectedNationalityObj.originalObject.NationalityEngName;
		            $scope.ImpExpDetail.ImporterDetailModel.CityArabic =
						$scope.selectedNationalityObj.originalObject.NationalityArbName;
		        }
		        if ($scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode == '2') {
		            $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'Y';
		        } else {
		            $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'N';
		        }
		        $scope.ImpExpDetail.ImporterDetailModel.ImporterCodeTemp = $scope.ImporterCodeTemp;
		        if (!$scope.ImporterCodeTemp) {
		            $("#loadingScreen").hide();
		            modalErrorShow(
						"Eng: Attachment is mandatory for Importer/Exporter Registration | Arb: المرفق إلزامي لتسجيل المستورد / المصدّر");
		            return;
		        }

		        $("#loadingScreen").show();
		       
		        apiService.post('Customs/ImporterExporter/AddUpdateImporter',
					'',
					$scope.ImpExpDetail.ImporterDetailModel,
					function (result) {
					    var data = result.data.ResponseResult;
					    if (typeof (data.Data) !== "undefined" && data.Data.ImporterCode) {
					        $scope.NewImporterCode = data.Data.ImporterCode;
					        $scope.ImpExpDetail.ImporterDetailModel.ImporterCode = $scope.NewImporterCode;
					        $scope.importerCode = $scope.NewImporterCode;
					        if (data.IsValid)
					            GetImporterDetail();
					    }

					    var msg = data.Messages; //apiService.formatResponseMessage

					    if (data) {
					        if (data.IsValid) {
					            $("#loadingScreen").hide();
					            $('#saveSuccessModal').modal('show');
					            return;
					        } else if (!data.IsValid) {
					            $("#loadingScreen").hide();
					            modalErrorShow(msg);
					            return;
					        }
					    }
					},
					function (result) {
					    $("#loadingScreen").hide();
					    modalErrorShow("An Error has occurred while adding the importer /exporter Data!");
					});
		    }
		    $scope.SetIEFlag = function (id, value) {
		        $scope.ImpExpDetail.ImporterDetailModel[id] = value ? 'Y' : 'N';
		        if (id == 'Nationality') {
		            $scope.NationalityLabel = value ? 'CityCode' : 'EmaraCity'
		            if (value) {
		                var idx = $scope.citycodes.findIndex(doc => doc.CityCode ==
							$scope.ImpExpDetail.ImporterDetailModel.CityCode);
		                if (idx != -1) {
		                    $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = $scope.citycodes[idx].CityEnglish;
		                    $scope.ImpExpDetail.ImporterDetailModel.CityArabic = $scope.citycodes[idx].CityArabic;
		                } else {
		                    $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = "";
		                    $scope.ImpExpDetail.ImporterDetailModel.CityArabic = "";
		                }
		            } else {
		                var idx = $scope.nationalities.findIndex(doc => doc.NationalityCode ==
							$scope.ImpExpDetail.ImporterDetailModel.City);
		                if (idx != -1) {
		                    $scope.ImpExpDetail.ImporterDetailModel.CityEnglish =
								$scope.nationalities[idx].NationalityEngName;
		                    $scope.ImpExpDetail.ImporterDetailModel.CityArabic =
								$scope.nationalities[idx].NationalityArbName;
		                } else {
		                    $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = "";
		                    $scope.ImpExpDetail.ImporterDetailModel.CityArabic = "";
		                }
		            }
		        }
		    }
		    $scope.SetTradeFlag = function (ActivityCode, value) {
		        var tradeIndex = $scope.TradeActivityTypes.findIndex(doc => doc.ActivityCode == ActivityCode);
		        $scope.TradeActivityTypes[tradeIndex].ActiveFlag = value ? 'Y' : 'N';
		    }
		    $scope.AddTradeActivity = function (code) {
		        var tradeIndex = $scope.TradeActivityTypes.findIndex(doc => doc.ActivityCode == code);
		        var activity = {};

		        activity.ActivityCode = $scope.TradeActivityTypes[tradeIndex].ActivityCode;
		        activity.ActivityEngName = $scope.TradeActivityTypes[tradeIndex].ActivityEnglish;
		        activity.ActivityArbName = $scope.TradeActivityTypes[tradeIndex].ActivityArabic;
		        activity.ActiveFlag = "Y";

		        if ($scope.ImpExpDetail.ImporterActivities == null) {
		            $scope.ImpExpDetail.ImporterActivities = [];
		        }
		        var tradeActiIndex = $scope.ImpExpDetail.ImporterActivities.findIndex(doc => doc.ActivityCode == code);

		        if (tradeActiIndex == -1) {
		            if ($scope.ImpExpDetail.ImporterActivities == null)
		                $scope.ImpExpDetail.ImporterActivities = [];
		            $scope.ImpExpDetail.ImporterActivities.push(activity);
		            var serviceTradeActivity = {};
		            serviceTradeActivity.centerCode = $stateParams.centerCode;
		            serviceTradeActivity.ImporterCode = $scope.importerCode;
		            serviceTradeActivity.ActivityCode = code;
		            serviceTradeActivity.ActiveFlag = activity.ActiveFlag;
		            apiService.post('Customs/ImporterExporter/AddUpdateActivity',
						'',
						serviceTradeActivity,
						function (results) {
						    var data = results.data.ResponseResult;
						    if (!data.IsValid) {
						        modalErrorShow(data.Messages);
						    }

						},
						function error(response) {
						    modalErrorShow("An Error has occurred while adding Activity Data!");
						}
					);
		        }
		        $scope.ActivityCode = "";
		        $('#activityModal').hide();

		    }
		    $scope.UpdateCategory = function (CategoryCode, isPopup) {
		        if (CategoryCode.length >= 3) {
		            if (CategoryCode != '' && CategoryCode != undefined) {
		                var cindex =
							$scope.categoryCode.findIndex(doc => doc.CategoryCode.toUpperCase() ==
								CategoryCode.toUpperCase());
		                if (cindex != -1) {
		                    var cCat = $scope.categoryCode[cindex];
		                    if (cCat.CategoryCode == "EXP" ||
								cCat.CategoryCode == "OIL" ||
								cCat.CategoryCode == "PVT" ||
								cCat.CategoryCode == "MED" ||
								cCat.CategoryCode == "DIP") {
		                        modalErrorShow(
									"Eng:INAVLID VALUE Contact System Administrator |Arb:القيمة المدخلة غير صحيحة يرجى مراجعة مشرف النظام");
		                        $("#txtcategoryCode").focus();
		                        return;
		                    } else if (cCat.CategoryCode == "LFA") {
		                        modalErrorShow(
									"Eng:INAVLID VALUE Contact Importer Regsitration |Arb:القيمة المدخلة غير صحيحة مراجعة مكتب تسجيل الشركات");
		                        $("#txtcategoryCode").focus();
		                        return;
		                    }
		                    $scope.ImpExpDetail.ImporterDetailModel.CategoryCode = cCat.CategoryCode;
		                    $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeEngName = cCat.CategoryEngName;
		                    $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeArbName = cCat.CategoryArbName;
		                    $scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode = cCat.CategoryGroupCode;
		                    $scope.formValidation.invalidCategory = false;
		                    $scope.isSaveDisabled = false;

		                } else {
		                    $scope.formValidation.invalidCategory = true;
		                    $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeEngName = "";
		                    $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeArbName = "";
		                    $scope.isSaveDisabled = true;
		                    $("#txtcategoryCode").focus();
		                }
		                if (isPopup) {
		                    $("#categoryModal").modal("hide");
		                }
		                ChangeLabelName();
		                SetNullHiddenField();
		            } else {
		                $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeEngName = "";
		                $scope.ImpExpDetail.ImporterDetailModel.CategoryCodeArbName = "";
		            }
		        }
		    }
		    $scope.$on("selectedFile",
				function (event, args) {

				    //var reader = new FileReader();
				    //reader.onload = function (e) {
				    //    $scope.encoded_file = btoa(e.target.result.toString());
				    //};
				    //reader.readAsBinaryString(args.file);

				    if ($scope.acceptFiles.split(",").includes("." + args.file.name.split(".")[1])) {
				        $("#loadingScreen").show();
				        AddAttachment(args, args.file.name);
				    } else {
				        modalErrorShow("Attached document is invalid file");
				    }
				});
		    $scope.ShowTradeActivityPopup = function (event) {
		        if (event == 'click' || event.key == 'F9') {
		            $scope.tradesearch = "";
		            if (!$('#activityModal').hasClass('in')) {
		                $("#activityModal").show();
		            }
		        }
		    }
		    $scope.closeTradeActivity = function () {
		        $('#activityModal').modal({
		            show: 'false'
		        });
		    };
		    $scope.ShowCategoryPopup = function (event) {
		        if (event == 'click' || event.key == 'F9') {
		            $scope.categorysearch = "";
		            $('#categoryModal').modal({
		                backdrop: "static"
		            });
		        }
		    }
		    $scope.closeCategoryPopup = function () {
		        $('#categoryModal').modal({
		            show: 'false'
		        });
		    };
		    $scope.ShowCityCodePopup = function (event) {
		        if (event == 'click' || event.key == 'F9') {
		            $scope.citycodesearch = "";
		            $('#CityCodeModal').modal({
		                backdrop: "static"
		            });
		        }
		    };
		    $scope.closecityCodePopup = function () {
		        $('#CityCodeModal').modal({
		            show: 'false'
		        });
		    };
		    $scope.AddCitycode = function (cityCode, isPopup) { //integer
		        if (cityCode != '' && cityCode != undefined) {
		            var cindex = $scope.citycodes.findIndex(doc => doc.CityCode == cityCode);
		            if (cindex != -1) {
		                var cityco = $scope.citycodes[cindex];
		                $scope.ImpExpDetail.ImporterDetailModel.CityCode = cityco.CityCode;
		                $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = cityco.CityEnglish;
		                $scope.ImpExpDetail.ImporterDetailModel.CityArabic = cityco.CityArabic;
		                $scope.formValidation.invalidNationality = false;
		            } else {
		                $scope.formValidation.invalidNationality = true;
		                $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = "";
		                $scope.ImpExpDetail.ImporterDetailModel.CityArabic = "";
		                $scope.isSaveDisabled = true;
		            }
		            if (isPopup) {
		                $("#CityCodeModal").modal("hide");
		            }
		            ChangeLabelName();
		        } else {
		            $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = "";
		            $scope.ImpExpDetail.ImporterDetailModel.CityArabic = "";
		        }
		    }
		    $scope.ShowImportGroupPopup = function (event) {
		        if (event == 'click' || event.key == 'F9') {
		            $scope.importgroupsearch = "";
		            $('#ImportGroupModal').modal({
		                backdrop: "static"
		            });
		        }
		    };
		    $scope.closeImportGroupPopup = function () {
		        $('#ImportGroupModal').modal({
		            show: 'false'
		        });
		    };
		    $scope.AddImportGroup = function (groupcode, isPopup) {
		        if (groupcode != '' && groupcode != undefined) {
		            var gindex = $scope.importGroupcodes.findIndex(doc => doc.GroupID == groupcode);
		            if (gindex != -1) {
		                var impgCode = $scope.importGroupcodes[gindex];
		                $scope.ImpExpDetail.ImporterDetailModel.ImpGroupCode = impgCode.GroupID;
		                $scope.ImpExpDetail.ImporterDetailModel.ImporterGroupEngName = impgCode.GroupEnglish;
		                $scope.ImpExpDetail.ImporterDetailModel.ImporterGroupArbName = impgCode.GroupArabic;
		                $scope.formValidation.invalidImpgCode = false;
		                $scope.isSaveDisabled = false;
		            } else {
		                $scope.formValidation.invalidImpgCode = true;
		                $scope.ImpExpDetail.ImporterDetailModel.ImporterGroupEngName = "";
		                $scope.ImpExpDetail.ImporterDetailModel.ImporterGroupArbName = "";
		                $scope.isSaveDisabled = true;
		            }
		            if (isPopup) {
		                //$('#ImportGroupModal').modal({
		                //    backdrop: "static"
		                //});
		                $("#ImportGroupModal").modal("hide");
		            }
		            ChangeLabelName();
		        } else {
		            $scope.ImpExpDetail.ImporterDetailModel.ImporterGroupEngName = "";
		            $scope.ImpExpDetail.ImporterDetailModel.ImporterGroupArbName = "";
		        }
		    }
		    $scope.ShowNationalityPopup = function (event) {
		        if (event == 'click' || event.key == 'F9') {
		            $scope.nationalitysearch = "";
		            $('#NationalityModal').modal({
		                backdrop: "static"
		            });
		        }
		    };
		    $scope.closeNationalityPopup = function () {
		        $('#NationalityModal').modal({
		            show: 'false'
		        });
		    };
		    $scope.AddNationality = function (national, isPopup) { //Text
		        if (national != '' && national != undefined) {
		            var cindex =
						$scope.nationalities.findIndex(doc => doc.NationalityCode.toUpperCase() ==
							national.toUpperCase());
		            if (cindex != -1) {
		                var nationality = $scope.nationalities[cindex];
		                $scope.ImpExpDetail.ImporterDetailModel.City = nationality.NationalityCode;
		                $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = nationality.NationalityEngName;
		                $scope.ImpExpDetail.ImporterDetailModel.CityArabic = nationality.NationalityArbName;
		                $scope.formValidation.invalidNationality = false;
		                $scope.isSaveDisabled = false;
		            } else {
		                $scope.formValidation.invalidNationality = true;
		                $scope.isSaveDisabled = true;
		                $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = "";
		                $scope.ImpExpDetail.ImporterDetailModel.CityArabic = "";
		            }
		            if (isPopup) {
		                $("#NationalityModal").modal("hide");
		            }
		        } else {
		            $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = "";
		            $scope.ImpExpDetail.ImporterDetailModel.CityArabic = "";
		        }
		    }
		    $scope.deleteConfimDocument = function (index) {
		        $scope.deleteIndex = index;
		        $scope.deleteType = 'document';
		        $("#ConfirmDeleteModalPopup").modal("show");
		    }
		    $scope.deleteConfimActivity = function (index) {
		        $scope.deleteIndex = index;
		        $("#ConfirmDeleteModalPopup").modal("show");
		    }
		    $scope.deleteOkay = function () {
		        $("#ConfirmDeleteModalPopup").modal("hide");
		        if ($scope.deleteType == 'document') {
		            deleteDocument($scope.deleteIndex);
		        } else {
		            deleteTradeActivities($scope.deleteIndex);
		        }
		    };

		    $scope.ReadEIDPersonalData = function () {
		        $("#loadingScreen").show();
		        apiService.selfHostGet("eidreader/GetPersonalData",
					null,
					function (result) {
					    $("#loadingScreen").hide();
					    var data = result.data;
					    $scope.ImpExpDetail.ImporterDetailModel.UAEID = data.EID;
					},
					function error(response) {
					    if (response.status == -1) {
					        modalErrorDownloadShow(
								"Its seems Emirates ID Reader is not yet installed, To install please click download button and install");
					    } else {
					        modalErrorShow("An Error has occurred while reading the Emirates ID");
					    }
					    //status -1  - not installed 
					    //status 500 - card not inserted 
					    $("#loadingScreen").hide();
					});
		    };
		    $scope.downloadEIDSetup = function () {
		        window.location = $Url.resolve('~/Home/DownLoadEIDSetup');
		        $('#errorModalDownload').modal('hide');
		    };

		    // Javascript Method - Begin
		    function TradeActivityChange(searchStr) {
		        apiService.get('Customs/Lookup/ActivityTypes',
					{
					    centerCode: $stateParams.centerCode,
					    searchString: ''
					},
					function (results) {
					    $scope.TradeActivityTypes = results.data.ResponseResult.Data;
					    angular.forEach($scope.TradeActivityTypes,
							function (value, key) {
							    value.ActiveFlag = 'N';
							});
					},
					function error(response) {
					    modalErrorShow("An Error has occurred while getting lookup Data!");
					}
				);
		    }

		    function initializeObject() {
		        $scope.selectedCategoryObj = {};
		        $scope.selectedCategoryObj.originalObject = {};
		        $scope.selectedCategoryObj.originalObject.CategoryCode = null;
		        $scope.selectedCategoryObj.originalObject.CategoryEngName = null;
		        $scope.selectedCategoryObj.originalObject.CategoryArbName = null;

		        $scope.selectedNationalityObj = {};
		        $scope.selectedNationalityObj.originalObject = {};
		        $scope.selectedNationalityObj.originalObject.NationalityCode = null;
		        $scope.selectedNationalityObj.originalObject.NationalityEngName = null;
		        $scope.selectedNationalityObj.originalObject.NationalityArbName = null;
		        //ADCC_COD Descriptioin
		        ChangeLabelName();

		    }

		    function GetImporterDetail() {
		        if (typeof $scope.importerCode == "undefined" ||
					$scope.importerCode == null ||
					$scope.importerCode == '') {
		            // $("#otherControls").hide();
		            $scope.ImpExpDetail = {};
		            $scope.ImpExpDetail.ImporterDetailModel = {};
		            $scope.isNew = true;
		        } else if ($scope.importerCode != '') {
		            $scope.isNew = false;
		            $scope.isSaveDisabled = false;
		            $("#otherControls").show();
		            $("#loadingScreen").show();
		            apiService.get('Customs/ImporterExporter/GetImporterDetail',
						{
						    centercode: $stateParams.centerCode,
						    importercode: $scope.importerCode
						},
						function (results) {
						    if (results.data.ResponseResult != "") {
						        $scope.ImpExpDetail = results.data.ResponseResult.Data;

						        if (!apiService.isNullOrEmptyOrUndefined($scope.ImpExpDetail.ImporterDetailModel
									.AdccExpiry)) {
						            $scope.adccExpiry =
										$filter('date')((new Date($scope.ImpExpDetail.ImporterDetailModel.AdccExpiry)),
											"dd/MM/yyyy");
						        }
						        if (!apiService.isNullOrEmptyOrUndefined($scope.ImpExpDetail.ImporterDetailModel
									.MunicipExpiry)) {
						            $scope.municipExpiry =
										$filter('date')(
											(new Date($scope.ImpExpDetail.ImporterDetailModel.MunicipExpiry)),
											"dd/MM/yyyy");
						        }
						        if ($scope.ImpExpDetail.ImporterDetailModel.Nationality == "Y" &&
									typeof ($scope.citycodes) !== "undefined") {
						            var idx = $scope.citycodes.findIndex(doc => doc.CityCode ==
										$scope.ImpExpDetail.ImporterDetailModel.CityCode);
						            if (idx != -1) {
						                $scope.ImpExpDetail.ImporterDetailModel.CityEnglish =
											$scope.citycodes[idx].CityEnglish;
						                $scope.ImpExpDetail.ImporterDetailModel.CityArabic =
											$scope.citycodes[idx].CityArabic;
						            }
						        }
						        var createdName =
									typeof ($scope.ImpExpDetail.ImporterDetailModel.UserCreatedName) == "undefined"
										? ""
										: $scope.ImpExpDetail.ImporterDetailModel.UserCreatedName
						        var modifiedname =
									typeof ($scope.ImpExpDetail.ImporterDetailModel.UserModifiedName) == "undefined"
										? ""
										: $scope.ImpExpDetail.ImporterDetailModel.UserModifiedName
						        var auditorname =
									typeof ($scope.ImpExpDetail.ImporterDetailModel.CustomAuditorName) == "undefined"
										? ""
										: $scope.ImpExpDetail.ImporterDetailModel.CustomAuditorName
						        var teleEx =
									(typeof ($scope.ImpExpDetail.ImporterDetailModel.TeleEx) == "undefined" ||
											$scope.ImpExpDetail.ImporterDetailModel.TeleEx == null)
										? ""
										: $scope.ImpExpDetail.ImporterDetailModel.TeleEx;
						        $scope.CreatedBy = $scope.ImpExpDetail.ImporterDetailModel.CreatedBy + " " + createdName
						        $scope.ModifyUser =
									$scope.ImpExpDetail.ImporterDetailModel.ModifyUser + " " + modifiedname;
						        $scope.AuditorName = teleEx + " " + auditorname;
						        if (!apiService.isNullOrEmptyOrUndefined($scope.ImpExpDetail.ImporterDetailModel
									.CreatedDate)) {
						            $scope.ImpExpDetail.ImporterDetailModel.CreatedDate =
										$filter('date')((new Date($scope.ImpExpDetail.ImporterDetailModel.CreatedDate)),
											"dd/MM/yyyy HH:mm");
						        }
						        if (!apiService.isNullOrEmptyOrUndefined($scope.ImpExpDetail.ImporterDetailModel
									.ModifyDate)) {
						            $scope.ImpExpDetail.ImporterDetailModel.ModifyDate =
										$filter('date')((new Date($scope.ImpExpDetail.ImporterDetailModel.ModifyDate)),
											"dd/MM/yyyy HH:mm");
						        }
						        if (!apiService.isNullOrEmptyOrUndefined($scope.ImpExpDetail.ImporterDetailModel
									.PaymentDate)) {
						            $scope.ImpExpDetail.ImporterDetailModel.PaymentDate =
										$filter('date')((new Date($scope.ImpExpDetail.ImporterDetailModel.PaymentDate)),
											"dd/MM/yyyy HH:mm");
						        }
						        if (!apiService.isNullOrEmptyOrUndefined($scope.ImpExpDetail.ImporterDetailModel
									.RenewPayDate)) {
						            $scope.ImpExpDetail.ImporterDetailModel.RenewPayDate =
										$filter('date')(
											(new Date($scope.ImpExpDetail.ImporterDetailModel.RenewPayDate)),
											"dd/MM/yyyy HH:mm");
						        }

						        $scope.ImpExpDetail.ImporterDetailModel.AttachmentCount =
									$scope.ImpExpDetail.ImporterActivities != null
									? $scope.ImpExpDetail.ImporterActivities.length
									: 0;
						        $scope.ImpExpDetail.ImporterDetailModel.ActivityCount =
									$scope.ImpExpDetail.ImporterAttachments != null
									? $scope.ImpExpDetail.ImporterAttachments.length
									: 0;
						    }
						    ChangeLabelName();
						    checkboxModelChanged();
						    $("#loadingScreen").hide();

						},
						function error(response) {
						    $("#loadingScreen").hide();
						    console.log(response);
						});
		        }

		    }

		    function AddAttachment(args, name) {
		        var serviceAttachInp = {};
		        serviceAttachInp.centerCode = $stateParams.centerCode;
		        if (!$scope.ImpExpDetail.ImporterDetailModel.ImporterCode)
		            serviceAttachInp.ImporterCode = $scope.ImporterCodeTemp;
		        else
		        {
		            serviceAttachInp.ImporterCode = $scope.ImpExpDetail.ImporterDetailModel.ImporterCode;
		        }
		        serviceAttachInp.FilePath = name;
		        serviceAttachInp.Description = name.split('.').pop();
		        serviceAttachInp.FileLength = args.file.size;
		        if (args.file.size > 4194304) {
		            $("#loadingScreen").hide();
		            modalErrorShow(
						"Eng: File size is too big Please, File size should not be more than 4000K | Arb: حجم الملف كبير جدًا");
		            return;
		        }
		        var fileAttach = apiService.postfile('Customs/ImporterExporter/AddUpdateAttachment',
					'',
					args.file,
					serviceAttachInp,
					'File');

		        fileAttach.then(function (results) {
		            $("#loadingScreen").hide();
		            if (results.data.ResponseResult == "") {
		                modalErrorShow("An Error has occurred while uploading the document!");
		                return;
		            }
		            var data = JSON.parse(results.data.ResponseResult);
		            if (data.IsValid) {
		                $scope.ImporterCodeTemp = data.Data.ImporterCodeTemp;
		                $('#saveSuccessModal').modal('show');
		                if (data.Messages.split('|')[0] != undefined &&
                            data.Messages.split('|')[0].split("...")[1] != undefined)
		                    serviceAttachInp.SerialNumber = data.Messages.split('|')[0].split("...")[1]
                                .replace("INSERTED SUCCESSFULLY", '').trim();
		                serviceAttachInp.File = null;
		                if ($scope.ImpExpDetail.ImporterAttachments == null) {
		                    $scope.ImpExpDetail.ImporterAttachments = [];
		                }
		                serviceAttachInp.ImporterCode = $scope.ImporterCodeTemp;
		                $scope.ImpExpDetail.ImporterAttachments.push(serviceAttachInp);
		            } else {
		                modalErrorShow(data.Messages);
		            }
		        },
					function error(response) {
					    $("#loadingScreen").hide();
					    modalErrorShow("An Error has occurred while uploading the document!");
					});
		    }

		    function ChangeLabelName() {
		        if (typeof $scope.ImpExpDetail != "undefined" &&
					$scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode == "3") {
		            $scope.AdccCodelabel = "DriverLicense";
		            $scope.MunicipalityCodeLabel = "PassportID";
		            $scope.NationalityLabel = "Nationality";
		            $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'N';

		        } else {
		            $scope.AdccCodelabel = "AdccCode";
		            $scope.MunicipalityCodeLabel = "MunicipalityCode";
		            $scope.NationalityLabel = "Nationality";
		            if (typeof $scope.ImpExpDetail != "undefined" &&
						$scope.ImpExpDetail.ImporterDetailModel.CategoryCode == 'LFA') {
		                $scope.AdccCodelabel = "EstFile ";
		                $scope.MunicipalityCodeLabel = "IndustrialLic";
		            } else if (typeof $scope.ImpExpDetail != "undefined" &&
					($scope.ImpExpDetail.ImporterDetailModel.CategoryCode == 'GEN' ||
						$scope.ImpExpDetail.ImporterDetailModel.CategoryCode == 'VEH')) {
		                $scope.NationalityLabel = "Country";
		                $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'Y';
		            }
		            if (typeof $scope.ImpExpDetail != "undefined" &&
						$scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode == "1") {
		                $scope.NationalityLabel = "EmaraCity";
		                $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'N';
		            } else if (typeof $scope.ImpExpDetail != "undefined" &&
						$scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode == "2") {
		                $scope.NationalityLabel = "CityCode";
		                $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'Y';
		                $scope.ImpExpDetail.ImporterDetailModel.IsNationality = true;
		                $scope.ImpExpDetail.ImporterDetailModel.FACILITY_FLG = 'Y';
		                $scope.ImpExpDetail.ImporterDetailModel.IsShowInBill = true;
		            } else if (typeof $scope.ImpExpDetail != "undefined" &&
						$scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode == "4") {
		                $scope.NationalityLabel = "Country";
		                $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'N';
		            }
		            else if (typeof $scope.ImpExpDetail != "undefined" &&
                       $scope.ImpExpDetail.ImporterDetailModel.CategoryGroupCode == "5") {
		                $scope.NationalityLabel = "Nationality";
		                $scope.ImpExpDetail.ImporterDetailModel.Nationality = 'Y';
		            }
		        }
		    }

		    function SetNullHiddenField() {
		        var importObject = $scope.ImpExpDetail.ImporterDetailModel;
		        importObject.CityEnglish = null;
		        importObject.CityArabic = null;
		        importObject.CityCode = null;
		        importObject.City = null;
		        if (importObject.CategoryGroupCode == "1") {
		            importObject.MunicipCode = null;
		            $scope.municipExpiry = null;
		            importObject.ImpGroupCode = null;
		            importObject.ImporterGroupEngName = null;
		            importObject.ImporterGroupArbName = null;
		            importObject.OwnerName = null;
		            importObject.AdccCode = null;
		            $scope.adccExpiry = null;
		        } else if (importObject.CategoryGroupCode == "3") {
		            importObject.ImporterAddress = null;
		            importObject.Fax = null;
		            importObject.Email = null;
		            importObject.ImpGroupCode = null;
		            importObject.ImporterGroupEngName = null;
		            importObject.ImporterGroupArbName = null;
		            importObject.OwnerName = null;
		        } else if (importObject.CategoryGroupCode == "4") {
		            importObject.MunicipCode = null;
		            $scope.municipExpiry = null;
		            importObject.ImpGroupCode = null;
		            importObject.ImporterGroupEngName = null;
		            importObject.ImporterGroupArbName = null;
		            importObject.AdccCode = null;
		            $scope.adccExpiry = null;
		        } else if (importObject.CategoryGroupCode == "5") {
		            importObject.ImporterAddress = null;
		            importObject.MunicipCode = null;
		            $scope.municipExpiry = null;
		            importObject.ImpGroupCode = null;
		            importObject.ImporterGroupEngName = null;
		            importObject.ImporterGroupArbName = null;
		            importObject.AdccCode = null;
		            $scope.adccExpiry = null;
		        }
		    }

		    function checkboxModelChanged() {
		        if ($scope.ImpExpDetail.ImporterDetailModel.ShowINBill == 'Y')
		            $scope.ImpExpDetail.ImporterDetailModel.IsShowInBill = true;
		        else
		            $scope.ImpExpDetail.ImporterDetailModel.IsShowInBill = false;

		        if ($scope.ImpExpDetail.ImporterDetailModel.DepositExempt == 'Y')
		            $scope.ImpExpDetail.ImporterDetailModel.IsDepositExempt = true;
		        else
		            $scope.ImpExpDetail.ImporterDetailModel.IsDepositExempt = false;

		        if ($scope.ImpExpDetail.ImporterDetailModel.Communication == 'Y')
		            $scope.ImpExpDetail.ImporterDetailModel.IsCommunication = true;
		        else
		            $scope.ImpExpDetail.ImporterDetailModel.IsCommunication = false;

		        if ($scope.ImpExpDetail.ImporterDetailModel.QueryFlag == 'Y')
		            $scope.ImpExpDetail.ImporterDetailModel.IsQueryFlag = true;
		        else
		            $scope.ImpExpDetail.ImporterDetailModel.IsQueryFlag = false;

		        if ($scope.ImpExpDetail.ImporterDetailModel.ExemptBillCharges == 'Y')
		            $scope.ImpExpDetail.ImporterDetailModel.IsExemptBillCharges = true;
		        else
		            $scope.ImpExpDetail.ImporterDetailModel.IsExemptBillCharges = false;

		        if ($scope.ImpExpDetail.ImporterDetailModel.AllowUpdateManifest == 'Y')
		            $scope.ImpExpDetail.ImporterDetailModel.IsAllowUpdateManifest = true;
		        else
		            $scope.ImpExpDetail.ImporterDetailModel.IsAllowUpdateManifest = false;

		    }

		    function CategoryChanged(searchStr) {
		        apiService.get('Customs/Lookup/ImporterCategory',
					{
					    centerCode: $stateParams.centerCode,
					    searchString: ''
					},
					function (results) {
					    $scope.categoryCode = results.data.ResponseResult.Data;
					},
					function error(response) {
					    modalErrorShow("An Error has occurred while getting lookup Data!");
					}
				);
		    }

		    function GetCitycodes(searchStr) {
		        apiService.get('Customs/Lookup/ImporterCities',
					{
					    centerCode: $stateParams.centerCode,
					    searchString: ''
					},
					function (results) {
					    $scope.citycodes = results.data.ResponseResult.Data;
					    if ($scope.ImpExpDetail.ImporterDetailModel.Nationality == "Y" &&
							typeof ($scope.citycodes) !== "undefined") {
					        var idx = $scope.citycodes.findIndex(doc => doc.CityCode ==
								$scope.ImpExpDetail.ImporterDetailModel.CityCode);
					        if (idx != -1) {
					            $scope.ImpExpDetail.ImporterDetailModel.CityEnglish = $scope.citycodes[idx].CityEnglish;
					            $scope.ImpExpDetail.ImporterDetailModel.CityArabic = $scope.citycodes[idx].CityArabic;
					        }
					    }
					    //GetImporterDetail();
					},
					function error(response) {
					    modalErrorShow("An Error has occurred while getting lookup Data!");
					}
				);
		    }

		    function GetImportGroupCode(searchStr) {
		        apiService.get('Customs/Lookup/ImporterGroups',
					{
					    centerCode: $stateParams.centerCode,
					    searchString: ''
					},
					function (results) {
					    $scope.importGroupcodes = results.data.ResponseResult.Data;
					},
					function error(response) {
					    modalErrorShow("An Error has occurred while getting lookup Data!");
					}
				);
		    }

		    function GetNationalities(searchStr) {
		        apiService.get('Customs/Lookup/ImporterNationality',
					{
					    centerCode: $stateParams.centerCode,
					    searchString: ''
					},
					function (results) {
					    $scope.nationalities = results.data.ResponseResult.Data;
					},
					function error(response) {
					    modalErrorShow("An Error has occurred while getting lookup Data!");
					}
				);
		    }

		    function deleteDocument(id) {
		        $("#loadingScreen").show();
		        var DownloadIndex = $scope.ImpExpDetail.ImporterAttachments.findIndex(doc => doc.SerialNumber == id);

		        var deleteDocument = $scope.ImpExpDetail.ImporterAttachments.splice(DownloadIndex, 1);

		        apiService.get('Customs/ImporterExporter/DeleteAttachment',
					{
					    centerCode: $stateParams.centerCode,
					    importerCode: deleteDocument[0].ImporterCode,
					    SerialNumber: deleteDocument[0].SerialNumber
					},
					function (results) {
					    var data = results.data.ResponseResult;
					    if (data.IsValid) {
					        $("#loadingScreen").hide();
					        $('#saveSuccessModal').modal('show');
					        return;
					    }
					},
					function error(response) {
					    $("#loadingScreen").hide();
					    console.log(response);
					});
		    }

		    function deleteTradeActivities(code) {

		        var DownloadIndex = $scope.ImpExpDetail.ImporterActivities.findIndex(doc => doc.ActivityCode == code);
		        //if (DownloadIndex == 0 && $scope.ImpExpDetail.ImporterActivities.length == 1) {
		        //    $scope.ImpExpDetail.ImporterActivities = [];
		        //}
		        var deleteActivity = $scope.ImpExpDetail.ImporterActivities.splice(DownloadIndex, 1);
		        deleteActivity[0].centerCode = $stateParams.centerCode;
		        deleteActivity[0].ImporterCode = $scope.importerCode;
		        apiService.post('Customs/ImporterExporter/DeleteActivity',
					'',
					deleteActivity[0],
					function (results) {
					    var data = results.data.ResponseResult;
					    if (data.IsValid) {
					        $("#loadingScreen").hide();
					        $('#saveSuccessModal').modal('show');
					        return;
					    }
					},
					function error(response) {
					    modalErrorShow("An Error has occurred while deleting the activity Data!");
					}
				);
		    }

		    // Javascript Method - End
		}

	]);