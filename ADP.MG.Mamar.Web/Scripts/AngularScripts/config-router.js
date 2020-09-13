`use strict`;
angular.module(`mamarApp`).config([
    `$stateProvider`,
    `$urlRouterProvider`,
    `$locationProvider`,
    `JQ_CONFIG`,
    `MODULE_CONFIG`,
    `appVersionConfiguration`,
    `mamarAppConstants`,
    function (
        $stateProvider,
        $urlRouterProvider,
        $locationProvider,
        JQ_CONFIG,
        MODULE_CONFIG,
        appVersionConfiguration,
        mamarAppConstants
    ) {
        if (window.location.href.indexOf(`subscription`) != -1) {
            $urlRouterProvider.otherwise(`/subscription`);
        } else if (window.location.href.indexOf(`Home/Index`) != -1) {
            $urlRouterProvider.otherwise(`/changeAccount/N`);
        } else if (window.location.href.indexOf(`Home/GMSDashboard`) != -1) {
            $urlRouterProvider.otherwise(`/gmsdashboard`);
        } else if (window.location.href.indexOf(`Home/ConsolidatedIndex`) != -1) {
            $urlRouterProvider.otherwise(`/consolidatorManifestUpload`);
        } else if (
            window.location.href.toLowerCase().indexOf(`account/userindex`) != -1
        ) {
            //window.location = window.location.href + '/account/userindex';
        } else {
            //$urlRouterProvider.otherwise('login');
            //if (window.location.href.indexOf(`account/login`) == -1 || window.location.href) {
            //    window.location = window.location.href + '/account/login';
            //}
        }

        this.appVersion = mamarAppConstants.appVersion;
        this.templateVersion = appVersionConfiguration[this.appVersion].tpl.version;
        this.controllerVersion = appVersionConfiguration[this.appVersion].ctrl.version;
        this.controllerBaseUrl = `../Scripts/AngularScripts/Controllers/${this.appVersion}`;
        //this.templateBaseUrl = `../tpl/${this.appVersion}`;
        this.templateBaseUrl = `../tpl`;
        this.appRouteUrlBase = `${this.appVersion}`;


        $stateProvider
            .state(`transactions`, {
                url: `/transactions/{transportMode}`,
                templateUrl: `${this.templateBaseUrl}/createJob.html`,
                controller: `createJobController`,
                resolve: load([
                    `${this.controllerBaseUrl}/createJobController.js`,
                ]),
            })
            .state(`agentTransactionReport`, {
                url: `/agentTransactionReport`,
                templateUrl: `${this.templateBaseUrl}/agentTransactionReport.html`,
                controller: `agentTransactionReportController`,
                resolve: load([
                    `../Scripts/libs/assets/alasql.min.js`,
                    `../Scripts/libs/assets/xlsx.core.min.js`,
                    `${this.controllerBaseUrl}/agentTransactionReportController.js`,
                ]),
            })
            //new survey added
            .state(`survey`, {
                url: `/survey`,
                templateUrl: `${this.templateBaseUrl}/survey.html`,
                controller: `surveyController`,
                resolve: load([
                    `${this.controllerBaseUrl}/surveyController.js`,
                ]),
            })
            .state(`containers`, {
                url: `/containers/{centerCode}/{jobNumber}`,
                templateUrl: `${this.templateBaseUrl}/containerList.html`,
                controller: `containerListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/containerListController.js`,
                ]),
            })
            .state(`shipmentAndInvoice`, {
                url:
                    `/shipmentDetails/{centerCode}/{jobNumber}/{tab}/{Status}/{KSAFlag}`,
                templateUrl: `${this.templateBaseUrl}/shipmentAndInvoice.html`,
                controller: `shipmentInvoiceMainController`,
                resolve: load([
                    `${this.controllerBaseUrl}/ataCarnetController.js`,
                    `${this.controllerBaseUrl}/eExemptionsController.js`,
                    `${this.controllerBaseUrl}/additionalDescriptionController.js`,
                    `${this.controllerBaseUrl}/shipmentDetailsController.js`,
                    `${this.controllerBaseUrl}/shipmentInvoiceMainController.js`,
                    `${this.controllerBaseUrl}/invoiceDetailsController.js`,
                    `${this.controllerBaseUrl}/invoiceGrpnDetailsController.js`,
                    `${this.controllerBaseUrl}/chargesController.js`,
                    `${this.controllerBaseUrl}/exemptionEntryController.js`,
                    `${this.controllerBaseUrl}/inspectionController.js`,
                    `${this.controllerBaseUrl}/sealsController.js`,
                ]),
            })
            .state(`chassisList`, {
                url:
                    `/chassisList/{centerCode}/{jobNumber}/{BillType}/{ImporterExporterCode}`,
                templateUrl: `${this.templateBaseUrl}/chassisList.html`,
                controller: `chassisListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/chassisListController.js`,
                ]),
            })
            .state(`maqasaReExport`, {
                url: `/maqasaReExport`,
                templateUrl: `${this.templateBaseUrl}/maqasaReExport.html`,
                controller: `maqasaReExportController`,
                resolve: load([
                    `${this.controllerBaseUrl}/maqasaReExportController.js`,
                ]),
            })
            .state(`maqasaCreateBill`, {
                url: `/maqasaCreateBill/{centerCode}/{transportMode}`,
                templateUrl: `${this.templateBaseUrl}/MaqasaCreateBill.html`,
                controller: `MaqasaCreateBillController`,
                resolve: load([
                    `${this.controllerBaseUrl}/MaqasaCreateBillController.js`,
                ]),
            })
            .state(`hazardousMaterials`, {
                url:
                    `/hazardousMaterials/{centerCode}/{jobNumber}/{serial}/{CountryCode}`,
                templateUrl: `${this.templateBaseUrl}/hazardousMaterial.html`,
                controller: `hazardousMaterialController`,
                resolve: load([
                    `${this.controllerBaseUrl}/hazardousMaterialController.js`,
                ]),
            })
            .state(`hazardousMaterialDetails`, {
                url:
                    `/hazardousMaterialDetails/{centerCode}/{jobNumber}/{serial}/{CountryCode}/{hMaterialId}`,
                templateUrl: `${this.templateBaseUrl}/hazardousMaterialDetails.html`,
                controller: `hazardousMaterialDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/hazardousMaterialDetailsController.js`,
                ]),
            })
            .state(`materialsMaster`, {
                url:
                    `/materialsMaster/{centerCode}/{jobNumber}/{serial}/{CountryCode}/{hMaterialId}`,
                templateUrl: `${this.templateBaseUrl}/MaterialMaster/materialsMaster.html`,
                controller: `materialsMasterController`,
                resolve: load([
                    `${this.controllerBaseUrl}/materialsMasterController.js`,
                ]),
            })
            .state(`mPayment`, {
                url: `/mPayment`,
                templateUrl: `${this.templateBaseUrl}/Payment.html`,
                controller: `PaymentController`,
                resolve: load([
                    `${this.controllerBaseUrl}/PaymentController.js`,
                    `${this.controllerBaseUrl}/mPaymentController.js`,
                    `${this.controllerBaseUrl}/settlementController.js`,
                    `${this.controllerBaseUrl}/depositController.js`,
                    `${this.controllerBaseUrl}/facilityController.js`,
                    `${this.controllerBaseUrl}/depositSlipController.js`,
                    `${this.controllerBaseUrl}/accountInformationController.js`,
                    `${this.controllerBaseUrl}/depositInformationController.js`,
                    `${this.controllerBaseUrl}/prepaidController.js`,
                    `${this.controllerBaseUrl}/postPaidController.js`,
                    `${this.controllerBaseUrl}/adcbMT942AutomaticDetailsController.js`,
                ]),
            })
            .state(`pendingTransactions`, {
                url: `/pendingTransactions`,
                templateUrl: `${this.templateBaseUrl}/pendingTransactions.html`,
                controller: `pendingTransactionsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/pendingTransactionsController.js`,
                ]),
            })
            .state(`dashboard`, {
                url: `/dashboard`,
                templateUrl: `${this.templateBaseUrl}/dashboard.html`,
                controller: `dashboardController`,
                resolve: load([
                    `${this.controllerBaseUrl}/dashboardController.js`,
                ]),
            })
            .state(`vehicleList`, {
                url:
                    `/vehicles/{centerCode}/{jobNumber}/{BillType}/{fromMenu}/{Status}`,
                templateUrl: `${this.templateBaseUrl}/vehicleList.html`,
                controller: `vehicleListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/vehicleListController.js`,
                ]),
            })
            .state(`vehicleInspectionDetails`, {
                url: `/vehicleInspectionDetails/{GateLocataion}/{ReferenceNumber}`,
                templateUrl: `${this.templateBaseUrl}/vehicleInspectionDetails.html`,
                controller: `vehicleInspectionDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/vehicleInspectionDetailsController.js`,
                ]),
            })
            .state(`vehicleRegistration`, {
                url:
                    `/vehicleRegistration/{centerCode}/{jobNumber}/{BillType}/{fromMenu}/{PermitNumber}/{Type}`,
                templateUrl: `${this.templateBaseUrl}/vehicleRegistration.html`,
                controller: `vehicleRegistrationController`,
                resolve: load([
                    `${this.controllerBaseUrl}/vehicleRegistrationController.js`,
                ]),
            })
            .state(`gmsdashboard`, {
                url: `/gmsdashboard`,
                templateUrl: `${this.templateBaseUrl}/GMS/gmsDashboard.html`,
                controller: `gmsDashboardController`,
                resolve: load([
                    `${this.controllerBaseUrl}/GMS/gmsDashboardController.js`,
                ]),
            })
            .state(`gmsreports`, {
                url: `/gmsreports`,
                templateUrl: `${this.templateBaseUrl}/GMS/gmsReports.html`,
                controller: `gmsReportsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/GMS/gmsReportsController.js`,
                ]),
            })
            .state(`shipmentInDraft`, {
                url: `/shipmentInDraft/{centerCode}/{DoNumber}/{AgentCode}`,
                templateUrl: `${this.templateBaseUrl}/shipmentInDraft.html`,
                controller: `shipmentInDraftController`,
                resolve: load([
                    `${this.controllerBaseUrl}/shipmentInDraftController.js`,
                ]),
            })
            .state(`changeAccount`, {
                url: `/changeAccount/{isNavigated}`,
                templateUrl: `${this.templateBaseUrl}/switchUserAccount.html`,
                controller: `switchUserAccountController`,
                resolve: load([
                    `${this.controllerBaseUrl}/switchUserAccountController.js`,
                ]),
            })
            .state(`ContainerDraftList`, {
                //url: '/ContainerDraftList/{centerCode}/{HouseBLNumber}/{MasterBLNumber}/{VoyageNumber}/{VoyageArrivalDate}/{VesselCode}/{DoNumber}/{AgentCode}',
                url: `/ContainerDraftList`,
                templateUrl: `${this.templateBaseUrl}/ContainerDraftList.html`,
                controller: `ContainerDraftListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/ContainerDraftListController.js`,
                ]),
            })
            .state(`TransactionBalanceList`, {
                url: `/TransactionBalanceList`,
                templateUrl: `${this.templateBaseUrl}/TransactionBalanceList.html`,
                controller: `TransactionBalanceController1`,
                resolve: load([
                    `${this.controllerBaseUrl}/TransactionBalanceController1.js`,
                ]),
            })
            .state(`ChassisDraftList`, {
                url: `/ChassisDraftList`,
                //url: '/ChassisDraftList/{centerCode}/{HouseBLNumber}/{MasterBLNumber}/{VoyageNumber}/{AgentCode}/{VoyageArrivalDate}/{VesselCode}/{DoNumber}/{ShipmentDraftAgentCode}',
                templateUrl: `${this.templateBaseUrl}/ChassisDraftList.html`,
                controller: `ChassisDraftListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/ChassisDraftListController.js`,
                ]),
            })
            .state(`TransactionManifest`, {
                url: `/TransactionManifest`,
                //url: '/ChassisDraftList/{centerCode}/{HouseBLNumber}/{MasterBLNumber}/{VoyageNumber}/{AgentCode}/{VoyageArrivalDate}/{VesselCode}/{DoNumber}/{ShipmentDraftAgentCode}',
                templateUrl: `${this.templateBaseUrl}/TransactionManifest.html`,
                controller: `TransactionManifestController`,
                resolve: load([
                    `${this.controllerBaseUrl}/TransactionManifestController.js`,
                ]),
            })
            .state(`vehicleTracking`, {
                url: `/vehicleTracking`,
                templateUrl: `${this.templateBaseUrl}/vehicleTracking.html`,
                controller: `vehicleTrackingController`,
                resolve: load([
                    `${this.controllerBaseUrl}/vehicleTrackingController.js`,
                ]),
            })
            .state(`VehicleRegistrationTrailer`, {
                url:
                    `/VehicleRegistrationTrailer/{centerCode}/{PermitNumber}/{jobNumber}/{BillType}/{fromMenu}`,
                //url: '/{centerCode}/{jobNumber}/{BillType}/{fromMenu}/{PermitNumber}
                templateUrl: `${this.templateBaseUrl}/VehicleRegistrationTrailer.html`,
                controller: `VehicleRegistrationTrailerController`,
                resolve: load([
                    `${this.controllerBaseUrl}/VehicleRegistrationTrailerController.js`,
                ]),
            })
            .state(`importerexportersList`, {
                url: `/importerexportersList`,
                templateUrl: `${this.templateBaseUrl}/importerexporterList.html`,
                controller: `importerexportersListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/importerexportersListController.js`,
                ]),
            })
            .state(`importerexportersRegistration`, {
                url: `/importerexportersRegistration/{centerCode}/{importerCode}`,
                templateUrl: `${this.templateBaseUrl}/importerexporterRegistration.html`,
                controller: `importerexporterRegistrationController`,
                resolve: load([
                    `${this.controllerBaseUrl}/importerexporterRegistrationController.js`,
                ]),
            })
            .state(`DelegateList`, {
                url: `/DelegateList`,
                templateUrl: `${this.templateBaseUrl}/DelegateList.html`,
                controller: `DelegateListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/DelegateListController.js`,
                ]),
            })
            .state(`consolidatorManifestUpload`, {
                url: `/consolidatorManifestUpload`,
                templateUrl: `${this.templateBaseUrl}/consolidatorManifestUpload.html`,
                controller: `consolidatorManifestUploadController`,
                resolve: load([
                    `${this.controllerBaseUrl}/consolidatorManifestUploadController.js`,
                ]),
            })
            //.state(`setUserCredentials`,
            //    {
            //        url: '/setUserCredentials/{oid}',
            //        templateUrl: '../tpl/setUserCredentials.html',
            //    })
            .state(`delegateDetail`, {
                url: `/delegateDetail/{centerCode}/{delegateNumber}/{TransportMode}`,
                templateUrl: `${this.templateBaseUrl}/delegateDetail.html`,
                controller: `delegateDetailController`,
                resolve: load([
                    `${this.controllerBaseUrl}/delegateDetailController.js`,
                ]),
            })
            .state(`vehiclePermitDetails`, {
                url:
                    `/vehiclePermitDetails/{centerCode}/{plateNumber}/{plateColor}/{plateCategory}/{plateOrigin}/{PermitNo}`,
                templateUrl: `${this.templateBaseUrl}/vehiclePermitDetails.html`,
                controller: `vehiclePermitDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/vehiclePermitDetailsController.js`,
                ]),
            })
            .state(`UserManagement`, {
                url: `/UserManagement`,
                templateUrl: `${this.templateBaseUrl}/UserManagement.html`,
                controller: `UserManagementController`,
                resolve: load([
                    `${this.controllerBaseUrl}/UserManagementController.js`,
                ]),
            })
            .state(`AnnouncementMaster`, {
                url: `/Announcements`,
                templateUrl: `${this.templateBaseUrl}/announcementMaster.html`,
                controller: `announcementMasterController`,
                resolve: load([
                    `${this.controllerBaseUrl}/announcementMasterController.js`,
                ]),
            })
            .state(`transExpCourierWayBillList`, {
                url: `/transexpcourierwaybilllist`,
                templateUrl: `${this.templateBaseUrl}/TransExpCourierWayBillList.html`,
                controller: `TransExpCourierWayBillListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/TransExpCourierWayBillListController.js`,
                ]),
            })
            .state(`transExpCourierWayBillDetail`, {
                url:
                    `/transexpcourierwaybilldetail/{refNum}/{centerCode}/{CreatedUser}/{CenterArabicName}/{CenterEnglishName}`,
                templateUrl: `${this.templateBaseUrl}/TransExpCourierWayBillDetails.html`,
                controller: `TransExpCourierWayBillDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/TransExpCourierWayBillDetailsController.js`,
                ]),
            })
            .state(`subscription`, {
                url: `/subscription`,
                templateUrl: `../Subscription/Views/Subscription.html`,
                controller: `subscriptionController`,
                resolve: load([`../Subscription/js/subscriptionController.js`]),
            })
            .state(`subscriptionPaymentResponse`, {
                url: `/subscriptionPaymentResponse/{onlineRefNo}/{status}`,
                templateUrl: `../Subscription/Views/PaymentResponse.html`,
                controller: `subscriptionPayController`,
                resolve: load([`../Subscription/js/subscriptionPayController.js`]),
            })
            .state(`AdminRecord`, {
                url: `/AdminRecord`,
                templateUrl: `${this.templateBaseUrl}/AdminRecord.html`,
                controller: `AdminRecordController`,
                resolve: load([
                    `${this.controllerBaseUrl}/AdminRecordController.js`,
                ]),
            })
            .state(`ksaCreateBill`, {
                url: `/ksaCreateBill`,
                templateUrl: `${this.templateBaseUrl}/ksaCreateBill.html`,
                controller: `ksaCreateBillController`,
                resolve: load([
                    `${this.controllerBaseUrl}/ksaCreateBillController.js`,
                ]),
            })
            .state(`ksaBillInDraft`, {
                url: `/ksaBillInDraft/{centerCode}/{ID}`,
                templateUrl: `${this.templateBaseUrl}/ksaBillInDraft.html`,
                controller: `ksaBillInDraftController`,
                resolve: load([
                    `${this.controllerBaseUrl}/ksaBillInDraftController.js`,
                ]),
            })
            .state(`subDODetails`, {
                url: `/subDODetails/{centerCode}/{agentCode}/{mode}`,
                templateUrl: `${this.templateBaseUrl}/subDODetails.html`,
                controller: `subDODetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/subDODetailsController.js`,
                ]),
            })
            .state(`subDOContainerDetails`, {
                url: `/subDOContainer/{centerCode}/{agentCode}/{ClearanceFlag}`,
                templateUrl: `${this.templateBaseUrl}/subDOContainerList.html`,
                controller: `subDOContainerListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/subDOContainerListController.js`,
                ]),
            })
            .state(`subDOChassisDetails`, {
                url: `/subDOChassis/{centerCode}/{agentCode}/{ClearanceFlag}`,
                templateUrl: `${this.templateBaseUrl}/subDOChassisList.html`,
                controller: `subDOChassisListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/subDOChassisListController.js`,
                ]),
            })
            .state(`noBillExitCert`, {
                url: `/noBillExitCert`,
                templateUrl: `${this.templateBaseUrl}/noBillExitCertDetails.html`,
                controller: `noBillExitCertDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/noBillExitCertDetailsController.js`,
                ]),
            })
            .state(`shortCustManifestDetail`, {
                url: `/shortCustManifestDetail/{transportMode}/{centerCode}`,
                templateUrl: `${this.templateBaseUrl}/shortCustomManifestDetail.html`,
                controller: `shortCustomManifestDetailController`,
                resolve: load([
                    `${this.controllerBaseUrl}/shortCustomManifestDetailController.js`,
                ]),
            })
            .state(`shortCustManifestList`, {
                url: `/shortCustManifestList`,
                templateUrl: `${this.templateBaseUrl}/shortCustomManifestList.html`,
                controller: `shortCustManifestListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/shortCustomManifestListController.js`,
                ]),
            })
            .state(`clearingAgentActivityList`, {
                url: `/clearingAgentActivityList`,
                templateUrl: `${this.templateBaseUrl}/clearingAgentActivityList.html`,
                controller: `clearingAgentActivityListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/clearingAgentActivityListController.js`,
                ]),
            })
            .state(`lcList`, {
                url: `/lcList`,
                templateUrl: `${this.templateBaseUrl}/LetterOfCredit/lcList.html`,
                controller: `lcListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/LetterOfCredit/lcListController.js`,
                ]),
            })
            .state(`lcDetails`, {
                url: `/lcDetails/{centerCode}`,
                templateUrl: `${this.templateBaseUrl}/LetterOfCredit/lcDetails.html`,
                controller: `lcDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/LetterOfCredit/lcDetailsController.js`,
                ]),
            })
            .state(`lcSettle`, {
                url: `/lcSettle/{centerCode}/{importer}`,
                templateUrl: `${this.templateBaseUrl}/LetterOfCredit/lcSettle.html`,
                controller: `lcSettleController`,
                resolve: load([
                    `${this.controllerBaseUrl}/LetterOfCredit/lcSettleController.js`,
                ]),
            })
            .state(`queryShortageList`, {
                url: `/queryShortage`,
                templateUrl: `${this.templateBaseUrl}/QueryShortage/queryShortageList.html`,
                controller: `queryShortageListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/QueryShortage/queryShortageListController.js`,
                ]),
            })
            .state(`queryShortageDetails`, {
                url: `/queryShortageDetails/{centerCode}/{serialNumber}`,
                templateUrl: `${this.templateBaseUrl}/QueryShortage/queryShortageDetails.html`,
                controller: `queryShortageDetailsController`,
                resolve: load([
                    `${this.controllerBaseUrl}/QueryShortage/queryShortageDetailsController.js`,
                ]),
            })
            .state(`harmonisedCodes`, {
                url: `/harmonisedCodes`,
                templateUrl: `${this.templateBaseUrl}/MasterSearch/hscodeMaster.html`,
                controller: `hscodeMasterController`,
                resolve: load([
                    `${this.controllerBaseUrl}/MasterSearch/hscodeMasterController.js`,
                ]),
            })
            .state(`masterBodyTypeList`, {
                url: `/masterBodyTypeList`,
                templateUrl: `${this.templateBaseUrl}/MasterBodyType/MasterBodyTypeList.html`,
                controller: `masterBodyTypeListController`,
                resolve: load([
                    `${this.controllerBaseUrl}/MasterBodyType/masterBodyTypeListController.js`,
                ]),
            });
        function load(srcs, callback) {
            return {
                deps: [
                    `$ocLazyLoad`,
                    `$q`,
                    function ($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        var promise = false;
                        srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                        if (!promise) {
                            promise = deferred.promise;
                        }
                        angular.forEach(srcs, function (src) {
                            promise = promise.then(function () {
                                if (JQ_CONFIG[src]) {
                                    return $ocLazyLoad.load(JQ_CONFIG[src]);
                                }
                                angular.forEach(MODULE_CONFIG, function (module) {
                                    if (module.name == src) {
                                        name = module.name;
                                    } else {
                                        name = src;
                                    }
                                });
                                return $ocLazyLoad.load(name);
                            });
                        });
                        deferred.resolve();
                        return callback
                            ? promise.then(function () {
                                return callback();
                            })
                            : promise;
                    },
                ],
            };
        }
    },
]);
