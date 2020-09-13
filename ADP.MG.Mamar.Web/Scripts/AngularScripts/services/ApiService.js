(function (mamarApp) {
    "use strict";

    mamarApp.factory("apiService", apiService);

    mamarApp.service("sharedModels", [
        function () {
            "use strict";

            // Shared Models
            this.invoiceDetails = {};
            this.ShipmentDraft = {};
            this.maqasaReExportSrchEntity = {};
            this.transactionSearchModel = null;
            //this.voucherFlag = true;
            this.Charges = [];
            this.shipmentHeader = {};
            this.UserCenter = null;
        },
    ]);

    mamarApp.factory("$storage", function ($window) {
        return {
            get: function (key) {
                var value = $window.localStorage[key];
                return value ? JSON.parse(value) : null;
            },
            set: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
        };
    });

    mamarApp.factory("Excel", function ($window) {
        var uri = "data:application/vnd.ms-excel;base64,",
            template =
                '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function (s) {
                return $window.btoa(unescape(encodeURIComponent(s)));
            },
            format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                });
            };
        return {
            tableToExcel: function (tableId, worksheetName) {
                var table = $(tableId),
                    ctx = { worksheet: worksheetName, table: table.html() },
                    href = uri + base64(format(template, ctx));
                return href;
            },
        };
    });

    apiService.$inject = [
        "$http",
        "$location",
        "$storage",
        "$state",
        "userAccountStorageFactory",
        "$q",
        "$cookies",
        "mamarAppConstants",
    ];

    function apiService(
        $http,
        $location,
        $storage,
        $state,
        userAccountStorageFactory,
        $q,
        $cookies,
        mamarAppConstants
    ) {
        //  $storage.set('voucherFlag', ($scope.CUSTBILL.VoucherFlag == 'Y' ? true : false));

        var service = {
            get: get,
            post: post,
            postQueryParams: postQueryParams,
            printDocuments: printDocuments,
            printAnnoucementDocuments: printAnnoucementDocuments,
            isNullOrEmptyOrUndefined: isNullOrEmptyOrUndefined,
            getJobListSearchCriteria: getJobListSearchCriteria,
            formatResponseMessage: formatResponseMessage,
            formatResponseMessageObject: formatResponseMessageObject,
            validateContainerNo: validateContainerNo,
            formatDateObject: formatDateObject,
            formatDateTimeObject: formatDateTimeObject,
            formatMMDDDateTimeObject: formatMMDDDateTimeObject,
            redirectToOtherService: redirectToOtherService,
            postfile: postfile,
            postChassisFile: postChassisFile,
            selfHostEIDGet: selfHostEIDGet,
            selfHostGet: selfHostGet,
            getClientName: getClientName,
            getTransportModeList: getTransportModeList,
            GetActionStatus: GetActionStatus,
            getPCSWeb: getPCSWeb,
            postAccount: postAccount,
            saveManifestDetailsToPcs: saveManifestDetailsToPcs,
            sendManifestToBizTalk: sendManifestToBizTalk,
            getSurvey: getSurvey,
            postSurvey: postSurvey
        };

        this.sharedData = {};
        this.sharedData.List = [];

        function validateAndUpdateExpiry(reqObject) {
            if (!reqObject || new Date(reqObject.Expiry) < new Date()) {
                if (reqObject) reqObject.RedirectUrl = window.location;
                $storage.set("reqObject", reqObject);
                window.location = $Url.resolve("~/Account/Logoff");
            }

            var expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 20);
            reqObject.Expiry = expiry;
            $storage.set("reqObject", reqObject);
        }

        function get(url, config, success, failure, isAsync) {
            //IsAsync True for big requests

            var obj = localStorage.getItem("subscribeObj");
            if (obj != undefined) {
                var objSubData = JSON.parse(obj);
                if (
                    objSubData.subscriptionRequired &&
                    objSubData.isGracePeriodOver &&
                    objSubData.payedProcess
                ) {
                    window.location = $Url.resolve("~/Home/Index#/subscription");
                    return;
                }
            }
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    config[key] =
                        typeof config[key] == "string"
                            ? config[key].toUpperCase()
                            : config[key];
                }
            }
            // $scope.loading = true;
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var data = {
                params: {
                    targetUrl: url,
                    data: config,
                },
            };

            var reqObject = $storage.get("reqObject");
            validateAndUpdateExpiry(reqObject);
            //,Authorization : 'Bearer ' + reqObject.Token
            var headers = {
                withCredentials: true,
                headers: {
                    UCode: userAccntInfo.UCode,
                    CCode: userAccntInfo.CCode,
                    version: mamarAppConstants.appVersion
                },
            };
            var params = config || config == " " ? $.param(config) : "";
            var fullUrl = reqObject.ApiUrl + "api/" + url + "?" + params;
            var response = {
                data: {
                    StatusIsSuccessful: true,
                    ErrorState: "",
                    ResponseCode: "",
                    ResponseResult: "",
                    DynamicResult: "",
                },
            };

            return $http.get(fullUrl, headers).then(
                function (result) {
                    response.data.ResponseResult = result.data;
                    success(response);
                    if (result.data.ResponseCode == "401") {
                        window.location = "/Account/login";
                    }
                },
                function (error) {
                    if (error.status == "401") {
                        //alert('error');
                        console.log("error in $http.get");
                        if (failure !== undefined && failure !== null) {
                            failure(error);
                        }
                    } else if (error.status == "403") {
                        //alert('error');
                        $("#loadingScreen").hide();
                        window.location = $Url.resolve("~/Home/Index#/subscription");
                    } else if (failure != null) {
                        console.log("error in $http.get");
                        failure(error);
                    }
                }
            );
        }
        function getPCSWeb(url, config, success, failure) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    config[key] =
                        typeof config[key] == "string"
                            ? config[key].toUpperCase()
                            : config[key];
                }
            }
            // $scope.loading = true;
            //var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var data = {
                params: {
                    targetUrl: url,
                    data: config,
                },
            };
            //userAccntInfo =  angular.toJson(userAccntInfo);
            // return $http.get($Url.resolve("~/Home/Get"), data).then(
            return $http.get($Url.resolve(mamarAppConstants.getPCSWebUrl), data).then(
                function (result) {
                    if (result.data.ResponseCode == "401") {
                        redirect($Url.resolve("~/Account/login"));
                        //window.location = "/Account/login";
                    }
                    if (result.data.isRedirect) {
                        // window.location = result.data.redirectUrl;
                        redirect(result.data.redirectUrl);
                        console.log("redirectFromApiService:" + result.data.redirectUrl);
                    } else {
                        if (result.data.StatusIsSuccessful) {
                            success(result);
                        }
                    }
                },
                function (error) {
                    if (error.status == "401") {
                        //alert('error');
                        console.log("error in $http.get");
                    } else if (failure != null) {
                        console.log("error in $http.get");
                        failure(error);
                    }
                }
            );
        }
        function getClientName(url, success, failure) {
            return $http.get($Url.resolve("~/Home/GetCleintComputerName"), null).then(
                function (result) {
                    console.log("api service client name : " + result);
                    success(result);
                },
                function (error) {
                    // console.log("api service client name error: " + error);
                    console.log(
                        "api service client name error: error while fetching data."
                    );
                    failure(error);
                }
            );
        }

        function jsonToQueryString(json) {
            return (
                "?" +
                Object.keys(json)
                    .map(function (key) {
                        return (
                            encodeURIComponent(key) + "=" + encodeURIComponent(json[key])
                        );
                    })
                    .join("&")
            );
        }

        function GetActionStatus(isFromClick, ActionStatusRequestObject) {
            var service = this;
            return $q(function (resolve, reject) {
                if (isFromClick) $("#loadingScreen").show();
                if (ActionStatusRequestObject.jobNumber) {
                    service.get(
                        "Customs/Invoice/ActionStatus",
                        ActionStatusRequestObject,
                        function (results) {
                            if (isFromClick) $("#loadingScreen").hide();
                            var resultData = results.data.ResponseResult;
                            if (resultData.IsValid) {
                                // $scope.actionStatus = resultData.Data[0];
                                // parseAuthorityStatus(resultData.Data[0]);
                                resolve(resultData.Data[0]);
                                //$scope.ShowHidePreclearance();
                                //$scope.ValidateSuccess = true;
                            } else {
                                reject(0);
                                // modalErrorShow(resultData.Messages);
                            }
                        },
                        function error(response) {
                            if (isFromClick) $("#loadingScreen").hide();
                            console.log(response);
                        }
                    );
                }
            });
        }

        //function parseAuthorityStatus(data) {
        //    $scope.AuthorityStatus = data;
        //    if (data.MOFA_STATUS || data.MOEW_STATUS || data.FREEZONES_STATUS || data.FANR_STATUS || data.ETIHAD_STATUS
        //        || data.ESMA_STATUS || data.CUSTOMS_STATUS || data.ADNOC_STATUS || data.ADFCA_STATUS || data.ZONE_STATUS || sharedModels.voucherFlag) {
        //        $rootScope.globalDisableFlag = true;
        //    }
        //}

        function post(url, targetType, data, success, failure, isAsync) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            //For upper case transformation of all input text
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (
                        (key == "File" &&
                            url == "Customs/ImporterExporter/AddUpdateAttachment") ||
                        (key == "Query" && url == "Customs/Lookup/RunGenericQuery") ||
                        (key == "ManifestFile" &&
                            url == "Customs/Manifest/UploadManifest") ||
                        (key == "fileBytes" &&
                            url == "Customs/Announcement/AddUpdateAnnouncement")
                    )
                        continue;
                    data[key] =
                        typeof data[key] == "string" ? data[key].toUpperCase() : data[key];
                    if (
                        key == "ReExportBillDatInfo" &&
                        url == "Customs/ReExport/CreateReExportCustBill"
                    ) {
                        for (var key1 in data[key]) {
                            data[key][key1] =
                                typeof data[key][key1] == "string"
                                    ? data[key][key1].toUpperCase()
                                    : data[key][key1];
                        }
                    }
                }
            }

            var reqObject = $storage.get("reqObject");
            validateAndUpdateExpiry(reqObject);
            //, Authorization: 'Bearer ' + reqObject.Token
            var headers = {
                withCredentials: true,
                headers: {
                    UCode: userAccntInfo.UCode,
                    version: mamarAppConstants.appVersion,
                    CCode: userAccntInfo.CCode,
                    version: mamarAppConstants.appVersion
                }
            };
            var fullUrl = reqObject.ApiUrl + "api/" + url;
            var response = {
                data: {
                    StatusIsSuccessful: true,
                    ErrorState: "",
                    ResponseCode: "",
                    ResponseResult: "",
                    DynamicResult: "",
                },
            };

            return $http.post(fullUrl, angular.toJson(data), headers).then(
                function (result) {
                    response.data.ResponseResult = result.data;

                    if (result.data.ResponseCode == "401") {
                        window.location = "/Account/login";
                    }
                    //if (result.data.isRedirect)
                    //    window.location = result.data.redirectUrl;
                    //else
                    success(response);
                },
                function (error) {
                    if (error.status == "401") {
                    } else if (failure != null) {
                        failure(error);
                    }
                }
            );
        }

        function postAccount(url, targetType, data, success, failure, isAsync) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var reqObject = $storage.get("reqObject");
            validateAndUpdateExpiry(reqObject);
            var headers = {
                withCredentials: true,
                headers: {
                    UCode: userAccntInfo.UCode,
                    CCode: userAccntInfo.CCode,
                    version: mamarAppConstants.appVersion
                }
            };
            var fullUrl = reqObject.ApiUrl + "api/" + url;
            var response = {
                data: {
                    StatusIsSuccessful: true,
                    ErrorState: "",
                    ResponseCode: "",
                    ResponseResult: "",
                    DynamicResult: "",
                },
            };

            return $http.post(fullUrl, angular.toJson(data), headers).then(
                function (result) {
                    response.data.ResponseResult = result.data;

                    if (result.data.ResponseCode == "401") {
                        window.location = "/Account/login";
                    }
                    success(response);
                },
                function (error) {
                    if (error.status == "401") {
                    } else if (failure != null) {
                        failure(error);
                    }
                }
            );
        }

        function postfile(url, targetType, gfile, attachData, fileProperty) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            return $http({
                url: $Url.resolve("~/HomeAsync/PostFile"),
                method: "POST",
                data: {
                    file: gfile,
                    UCode: userAccntInfo.UCode,
                    CCode: userAccntInfo.CCode,
                    ApiUrl: url,
                    aData: attachData,
                    aProperty: fileProperty,
                },
                headers: { "Content-Type": undefined },
                //prevents serializing payload.  don't do it.
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("file", data.file);
                    formData.append("UCode", data.UCode);
                    formData.append("CCode", data.CCode);
                    formData.append("ApiUrl", data.ApiUrl);
                    formData.append("aData", angular.toJson(data.aData));
                    formData.append("aProperty", data.aProperty);
                    return formData;
                },
            });
        }

        function postChassisFile(url, targetType, gfile, attachData, fileProperty) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            return $http({
                url: $Url.resolve("~/HomeAsync/PostChassisFile"),
                method: "POST",
                data: {
                    file: gfile,
                    UCode: userAccntInfo.UCode,
                    CCode: userAccntInfo.CCode,
                    ApiUrl: url,
                    aData: attachData,
                },
                headers: { "Content-Type": undefined },
                //prevents serializing payload.  don't do it.
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("file", data.file);
                    formData.append("UCode", data.UCode);
                    formData.append("CCode", data.CCode);
                    formData.append("ApiUrl", data.ApiUrl);
                    //formData.append("CenterCode", data.aData.CenterCode);
                    //formData.append("jobNumber", data.aData.jobNumber);
                    // formData.append("aData", angular.toJson(data.aData));
                    //formData.append("aProperty", data.aProperty);
                    return formData;
                },
            });
        }

        function sendManifestToBizTalk(manifestFile, centerCode, billType) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            return $http({
                url: $Url.resolve("~/Home/SendSubDOManifestToBizTalk"),
                method: "POST",
                data: {
                    manifestFile: manifestFile,
                    uCode: userAccntInfo.UCode,
                    cCode: userAccntInfo.CCode,
                    centerCode: centerCode,
                    billType: billType,
                },
                headers: { "Content-Type": undefined },
                transformRequest: function (data) {
                    var submitManifest = new FormData();
                    submitManifest.append("manifestFile", data.manifestFile);
                    submitManifest.append("uCode", data.uCode);
                    submitManifest.append("cCode", data.cCode);
                    submitManifest.append("centerCode", data.centerCode);
                    submitManifest.append("billType", data.billType);
                    return submitManifest;
                },
            });
        }

        // Manafath Integration Changes --> Save ManifestDetails to PCS DB --> START
        function saveManifestDetailsToPcs(url, data, config) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            data.CompanyCode = userAccntInfo.CCode;
            data.UserCode = userAccntInfo.UCode;
            var postUrl = $Url.resolve(url);

            return $http.post(postUrl, angular.toJson(data)).then(
                function (result) {
                    console.log("manifest saved to pcs");
                },
                function (error) {
                    console.log("error - while fetching data");
                    //console.log("error - " + error);
                }
            );
        }

        // END

        function isNullOrEmptyOrUndefined(value) {
            return !value;
        }

        function getJobListSearchCriteria(mode) {
            if (mode == "A") {
                return [
                    { id: "", name: "--Select--", arabic: "--الشحن--" },
                    {
                        id: "houseBLNumber",
                        name: "HAWB/Booking No",
                        arabic: "البوليصة الفرعية/رقم الموعد",
                    },
                    { id: "doNumber", name: "Do No", arabic: "رقم امر التسليم" },
                    { id: "jobNumber", name: "Job Number", arabic: "رقم المعاملة" },
                    {
                        id: "custBillNumber",
                        name: "Cust Bill No",
                        arabic: "رقم البيان الجمركي",
                    },
                    {
                        id: "containerNumber",
                        name: "Container No",
                        arabic: "رقم الحاوية",
                    },
                    { id: "chassisNumber", name: "Chassis No", arabic: "رقم الشاصي" },
                ];
            } else {
                return [
                    { id: "", name: "--Select--", arabic: "--الشحن--" },
                    {
                        id: "houseBLNumber",
                        name: "HBL/Booking No",
                        arabic: "البوليصة الفرعية/رقم الموعد",
                    },
                    { id: "doNumber", name: "Do No", arabic: "رقم امر التسليم" },
                    { id: "jobNumber", name: "Job Number", arabic: "رقم المعاملة" },
                    {
                        id: "custBillNumber",
                        name: "Cust Bill No",
                        arabic: "رقم البيان الجمركي",
                    },
                    {
                        id: "containerNumber",
                        name: "Container No",
                        arabic: "رقم الحاوية",
                    },
                    { id: "chassisNumber", name: "Chassis No", arabic: "رقم الشاصي" },
                ];
            }
        }
        function getTransportModeList() {
            return [
                { key: "M", value: "Sea Cargo شحن بحري" },
                { key: "A", value: "Air Cargo شحن جوي" },
                { key: "R", value: "Land Cargo شحن بري" },
                { key: "Z", value: "Free Zone منطقة حرة" },
            ];
        }
        function formatResponseMessage(strMsg) {
            var splitMsg = strMsg.split("|");
            var engMsg = splitMsg[0].replace("Eng:", "").trim();
            return engMsg.replace("...", "!");
        }
        function formatResponseMessageObject(strMsg) {
            var splitMsg = strMsg.split("|");
            var engMsg = splitMsg[0].replace("Eng:", "").trim();
            var arbMsg =
                splitMsg.length > 1 ? splitMsg[1].replace("Arb:", "").trim() : "";
            var msg = { eng: engMsg, arb: arbMsg };
            return msg;
        }
        function validateContainerNo(containerNo) {
            var regex = /[a-zA-Z]{4}\d{7}$/;
            return regex.test(containerNo);
        }

        //Print Multiple Documents
        function base64ToArrayBuffer(base64) {
            var binaryString = window.atob(base64);
            var binaryLen = binaryString.length;
            var bytes = new Uint8Array(binaryLen);
            for (var i = 0; i < binaryLen; i++) {
                var ascii = binaryString.charCodeAt(i);
                bytes[i] = ascii;
            }
            return bytes;
        }
        function saveByteArray(reportName, byte) {
            var bytes = new Uint8Array(byte);
            var blob = new Blob([bytes], { type: "application/pdf" });
            var link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            var fileName = reportName;
            link.download = fileName;
            link.click();
        }
        function printDocuments(data) {
            angular.forEach(data, function (item, index) {
                var sampleArr = base64ToArrayBuffer(item.content);
                saveByteArray(item.FileName, sampleArr);
            });
        }
        function printAnnoucementDocuments(byteArray, downloadfileName) {
            var blob = b64toBlob(byteArray, { type: "application/pdf" });
            //var bytes = new Uint8Array(byteArray);
            //var blob = new Blob([bytes], { type: "application/pdf" });
            var link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = downloadfileName;
            link.click();
        }

        /// converting from base64 to blob object
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || "";
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];
            for (
                var offset = 0;
                offset < byteCharacters.length;
                offset += sliceSize
            ) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }
        //Print Multiple Documents

        function formatDateObject(strDate) {
            var dateParts = strDate.split("/");
            var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            return dateObject;
        }

        function formatDateTimeObject(strDate) {
            var date = strDate.split(" ");
            var dateParts = date[0].split("/");
            var time = date[1].split(":");
            var hh = time[0];
            var min = time[1];
            var dateObject = new Date(
                dateParts[2],
                dateParts[1] - 1,
                dateParts[0],
                hh,
                min
            );
            return dateObject;
        }
        function formatMMDDDateTimeObject(strDate) {
            var date = strDate.split(" ");
            var dateParts = date[0].split("/");
            var time = date[1].split(":");
            var hh = time[0];
            var min = time[1];
            var dateObject = new Date(
                dateParts[2],
                dateParts[0] - 1,
                dateParts[1],
                hh,
                min
            );
            return dateObject;
        }

        //To redirect to other applications from mamar
        function redirectToOtherService(service, config, success, failure) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    config[key] =
                        typeof config[key] == "string"
                            ? config[key].toUpperCase()
                            : config[key];
                }
            }
            var data = {
                params: {
                    service: service,
                    data: config,
                },
            };
            return $http
                .get($Url.resolve("~/Home/RedirectToOtherService"), data)
                .then(
                    function (result) {
                        success(result);
                    },
                    function (error) {
                        if (error.status == "401") {
                            console.log("error in $http.get");
                        } else if (failure != null) {
                            console.log("error in $http.get");
                            failure(error);
                        }
                    }
                );
        }

        function selfHostEIDGet(url, param, success, failure) {
            //var selfhosturl = "http://localhost:6543/api/" + url;
            var selfhosturl = mamarAppConstants.localhostBaseApi;
            return $http.get(selfhosturl, param).then(
                function (result) {
                    if (result.data.ResponseCode == "401") {
                        window.location = "/Account/login";
                    }
                    if (result.data.isRedirect) {
                        //window.location = result.data.redirectUrl;
                        redirect(result.data.redirectUrl);
                        console.log("redirectFromApiService:" + result.data.redirectUrl);
                    } else {
                        if (result.data.StatusIsSuccessful) {
                            success(result);
                        }
                    }
                },
                function (error) {
                    if (error.status == "401") {
                        //alert('error');
                        console.log("error in $http.get");
                    } else if (failure != null) {
                        console.log("error in $http.get");
                        failure(error);
                    }
                }
            );
        }

        function selfHostGet(url, param, success, failure) {
            //var selfhosturl = "http://localhost:6543/api/" + url;
            var selfhosturl = mamarAppConstants.localhostBaseApi;
            return $http.get(selfhosturl, param).then(
                function (result) {
                    if (result.data.ResponseCode == "401") {
                        window.location = "/Account/login";
                    }
                    if (result.data.isRedirect) {
                        // window.location = result.data.redirectUrl;
                        redirect(result.data.redirectUrl);
                        console.log("redirectFromApiService:" + result.data.redirectUrl);
                    } else {
                        if (result.data.StatusIsSuccessful) {
                            success(result);
                        }
                    }
                },
                function (error) {
                    if (error.status == "401") {
                        //alert('error');
                        console.log("error in $http.get");
                    } else if (failure != null) {
                        console.log("error in $http.get");
                        failure(error);
                    }
                }
            );
        }

        function postQueryParams(
            url,
            targetType,
            params,
            success,
            failure,
            isAsync
        ) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var reqObject = $storage.get("reqObject");
            validateAndUpdateExpiry(reqObject);

            var headers = {
                withCredentials: true,
                headers: {
                    UCode: userAccntInfo.UCode,
                    CCode: userAccntInfo.CCode,
                    version: mamarAppConstants.appVersion
                }
            };

            var queryString = Object.keys(params)
                .map((key) => key + "=" + params[key])
                .join("&");
            var fullUrl = reqObject.ApiUrl + "api/" + url + "?" + queryString;
            var response = {
                data: {
                    StatusIsSuccessful: true,
                    ErrorState: "",
                    ResponseCode: "",
                    ResponseResult: "",
                    DynamicResult: "",
                },
            };

            return $http.post(fullUrl, "", headers).then(
                function (result) {
                    response.data.ResponseResult = result.data;

                    if (result.data.ResponseCode == "401") {
                        window.location = "/Account/login";
                    }
                    success(response);
                },
                function (error) {
                    if (error.status == "401") {
                    } else if (failure != null) {
                        failure(error);
                    }
                }
            );
        }

        function getSurvey(url, config, success, failure, isAsync) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            //var filter = "$filter=Type eq '" + config + "'" + 'and IsActive eq true';
            var reqObject = $storage.get("reqObject");
            if (reqObject && userAccntInfo) {
                var fullUrl = reqObject.MGSurveyApiUrl + "odata/" + url;
                var appName = reqObject.MGSurveyAppName;
                var appKey = reqObject.MGSurveyAppKey;
                var headers = {
                    headers: {
                        AppName: appName,
                        UserName: userAccntInfo.userCode,
                        AppKey: appKey,
                        version: mamarAppConstants.appVersion
                    }
                };
                var response = {
                    data: {
                        StatusIsSuccessful: true,
                        ErrorState: "",
                        ResponseCode: "",
                        ResponseResult: "",
                        DynamicResult: "",
                    },
                };

                return $http.get(fullUrl, headers).then(
                    function (result) {
                        if (result) {
                            response.data.ResponseResult = result.data;
                            success(response);
                        }
                    },
                    function (error) {
                        console.log("error in $http.getSurvey");
                        if (failure !== undefined && failure !== null) {
                            failure(error);
                        }
                    }
                );
            }
        }

        function postSurvey(url, data, success, failure, isAsync) {
            var userAccntInfo = userAccountStorageFactory.getUserAccntInfo();
            var reqObject = $storage.get("reqObject");
            if (reqObject && userAccntInfo) {
                var fullUrl = reqObject.MGSurveyApiUrl + url;
                var appName = reqObject.MGSurveyAppName;
                var appKey = reqObject.MGSurveyAppKey;
                var headers = {
                    headers: {
                        AppName: appName,
                        UserName: userAccntInfo.userCode,
                        AppKey: appKey,
                        version: mamarAppConstants.appVersion
                    }
                };
                var response = {
                    data: {
                        StatusIsSuccessful: true,
                        ErrorState: "",
                        ResponseCode: "",
                        ResponseResult: "",
                        DynamicResult: "",
                    }
                };

                data.UserName = userAccntInfo.userCode;
                data.CompanyName = userAccntInfo.companyName;
               
                return $http.post(fullUrl, angular.toJson(data), headers).then(
                    function (result) {
                        if (result) {
                            response.data.ResponseResult = result.data;
                            success(response);
                        }
                    },
                    function (error) {
                        if (error.status == "401") {
                            var err = error.status;
                        } else if (failure != null) {
                            failure(error);
                        }
                    }
                );
            }
        }

        return service;
    }
})(angular.module("mamarApp"));
