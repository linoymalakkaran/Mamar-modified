angular.module('mamarApp').controller('indexController',
    ['$scope', '$rootScope', '$translate', 'apiService', '$state', '$filter',
        'userAccountStorageFactory', '$storage', 'mamarAppConstants','appVersionConfiguration',
        function ($scope, $rootScope, $translate, apiService, $state, $filter,
            userAccountStorageFactory, $storage, mamarAppConstants, appVersionConfiguration) {

            $scope.$storage = $storage;
            $rootScope.appVersion = mamarAppConstants.appVersion;
            $rootScope.templateVersion = appVersionConfiguration[$rootScope.appVersion].tpl.version;

            $scope.userAccntDetails = userAccountStorageFactory.getUserAccntInfo();
            $scope.showbar = false;
            var thisPage = 1;
            var progress = 0;


            /////////////////////////// SignalR Pre clearance //////////////////////////////////////
            //Print Preclearance report
            var printPreClearanceCertificates = function (centerCode, jobNumber) {
                $("#loadingScreen").show();
                $scope.printParameter = {
                    centerCode: centerCode,
                    jobNumber: jobNumber,
                    printValidation: 'N'
                };
                apiService.get('Customs/Reporting/PreclearanceReport', $scope.printParameter, function (results) {
                    $("#loadingScreen").hide();
                    var resultData = results.data.ResponseResult;
                    if (resultData.IsValid) {
                        apiService.printDocuments(resultData.Data);
                    }
                    else {
                        modalErrorShow(resultData.Messages);
                    }
                },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log('Preclearance' + response);
                    });
            }

            function showDownloadLink(msg, jobNumber, centerCode) {
                swal({
                    title: '',
                    text: msg,
                    type: "success",
                    confirmButtonColor: "#666",
                    confirmButtonText: $filter('translate')('PrintPreclearance'),
                    closeOnConfirm: true,
                    showCancelButton: true,
                    cancelButtonText: $filter('translate')('Cancel'),
                    html: true
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            printPreClearanceCertificates(centerCode, jobNumber, false);
                        }
                    });
            }
            function GetWarningMessage(data) {
                var information = data.split('|');
                let counter = 0;
                if (information.length > 2) {
                    $scope.Warning = [];
                    information[2].split('WarningMsgEng:')[1].split('#').filter(v => v != '').map((item) => {
                        let weather = {
                            ID: counter,
                            Warning: item
                        }
                        if (!apiService.isNullOrEmptyOrUndefined(weather.Warning)) {
                            $scope.Warning.push(Object.assign(weather));
                            counter++;
                        }
                    });
                }
                if ($scope.Warning.length > 0) {
                    WarningModalOnFormM($scope.Warning);
                }
            }

            //var mamrHubConnection = $.connection.mamarHub;
            //$.connection.hub.start();
            //if (mamrHubConnection != undefined) {
            //    mamrHubConnection.client.preclearResponse = function (user, results, jobNumber, centerCode) {
            //        debugger;
            //        if (results) {
            //            if (results.IsValid) {
            //                //if (results.Data) {
            //                //    apiService.printDocuments(results.Data); //Print Pre Clearance Certificates
            //                //}
            //                var successMsg = $filter('translate')('PreClearanceSuccessMsg');
            //                notifySuccessMessage(successMsg);
            //                showDownloadLink(successMsg, jobNumber, centerCode);
            //                //var downloadBtnName = $filter('translate')('PrintPreclearance');
            //                //toastr.success(successMsg + jobNumber + '\n' + '<br/>' + '\n' + '&nbsp;<a onclick="printPreClearanceCertificates(' + centerCode + ',' + jobNumber + ')">' + downloadBtnName + '</a>');
            //                GetWarningMessage(results.Messages);

            //            }
            //            else {
            //                var Response = results.Messages.split('|')[0] + '|' + results.Messages.split('|')[1];
            //                const msg = apiService.formatResponseMessageObject(Response);

            //                if ($scope.language == 'en') {//language
            //                    if (!apiService.isNullOrEmptyOrUndefined(msg['eng'])) {
            //                        toastr.error('Preclearance failed for job : ' + jobNumber + '\n' + '<br/>' + '\n' + msg['eng']);
            //                    }
            //                    else {
            //                        toastr.error('some error occurred in preclearance process');
            //                    }
            //                }
            //                else {
            //                    if (!apiService.isNullOrEmptyOrUndefined(msg['arb'])) {
            //                        toastr.error('Preclearance failed for job - ' + jobNumber + '\n' + msg['arb']);
            //                    }
            //                    else {
            //                        toastr.error('some error occurred in preclearance process');
            //                    }
            //                }
            //                GetWarningMessage(results.Messages);
            //            }
            //        }
            //        $scope.$broadcast('refreshAfterSendPreclear');
            //        $scope.$broadcast('RefreshInvoiceDetails', {});
            //    }
            //}

            /////////////////////////// SignalR Pre clearance //////////////////////////////////////

            function feedbackValidate(validateTill) {
                var status = true;
                var elements = $("input[name ^='qans']:checked");

                for (var i = 0; i < elements.length; i++) {


                    if (i == 7) {
                        if (!$('#msQans_17').prop('checked') && !$('#msQans_27').prop('checked') && !$('#msQans_37').prop('checked')) {
                            $("#validationmsg_" + i).css("display", "block");
                            status = false;
                        }
                        else {
                            $("#validationmsg_" + i).css("display", "none");
                        }
                    }

                    //var countYes = elements.length == 12 ? 10 : (elements.length == 13 ? 11 : 12);
                    //if (i == countYes) {
                    //    if (elements[i].value == 'No') {
                    //        var comment1 = $("#msQfeed_" + (countYes-1)).val();
                    //        if (!comment1) {
                    //            $("#validationmsg_" + (countYes -1)).css("display", "block");
                    //            status = false;
                    //        }
                    //        else {
                    //            $("#validationmsg_" + (countYes-1)).css("display", "none");
                    //        }
                    //    }
                    //}
                    if (elements[i].value == 'No') {
                        var comment1 = $("#msQfeed_" + elements[i].id.substring(8)).val();
                        if (!comment1) {
                            $("#validationmsg_" + elements[i].id.substring(8)).css("display", "block");
                            status = false;
                        }
                        else {
                            $("#validationmsg_" + elements[i].id.substring(8)).css("display", "none");
                        }
                    }
                    else if (elements[i].value <= 2) {
                        var count = i;
                        if (elements.length == 13 && i > 7) {
                            count = i - 1;
                        }
                        else if (elements.length == 14 && i > 7) {
                            count = i - 2;
                        }
                        var comment = $("#msQfeed_" + count).val();
                        if (!comment) {
                            $("#validationmsg_" + count).css("display", "block");
                            status = false;
                        }
                        else {
                            $("#validationmsg_" + count).css("display", "none");
                        }
                    }

                    if (i == validateTill) {
                        break;
                    }
                }

                return status;
            }
            $scope.goNext = function () {
                $("#MSnextBtn").blur();
                $scope.showbar = true;
                var validationResult = true;

                var elements = $("input[name ^='qans']:checked");
                var num = 9;
                var numlast = 12;
                if (thisPage == 3 && elements.length > 12) {
                    num = elements.length == 13 ? 10 : 11;
                }
                if (thisPage > 3 && elements.length > 12) {
                    numlast = elements.length == 13 ? 13 : 14;
                }
                var validateTill = thisPage == 2 ? 4 : (thisPage == 3 ? num : numlast);

                if (thisPage == 1) {
                    validationResult = true;
                }
                else {
                    if ($scope.questions && $scope.questions.length == 8) {
                        validationResult = true;
                    }
                    else {
                        validationResult = feedbackValidate(validateTill);
                    }
                }
                if (validationResult) {
                    if ((thisPage == 3 && $scope.questions.length > 8) || (thisPage == 2 && $scope.questions && $scope.questions.length == 8)) {
                        $("#MSnextBtn").attr("disabled", true);
                        $("#MSsubmitBtn").css("display", "inline");
                    }

                    if (thisPage == 1) {
                        $("#MSbackBtn").css("display", "inline");
                    }
                    var currentPage = $(".Msactive");

                    if ($scope.questions && $scope.questions.length == 8 && thisPage == 3) {
                        currentPage.next().next().addClass("Msactive");
                        $("#surveyPageNo").css("display", "none");
                    }
                    else {
                        currentPage.next().addClass("Msactive");
                    }

                    currentPage.removeClass("Msactive");

                    //increase page number 
                    thisPage += 1;
                    $("#MsPageNumber").text(thisPage);



                    //increase progress bar

                    progress += 25;
                    $("#MsPbar").css("width", progress + "%");

                    if ($scope.questions && $scope.questions.length == 8 && thisPage == 4) {
                        progress = 100;
                        $("#MsPbar").css("width", progress + "%");
                    }

                }

            }

            /**
                * Method to go to prevouis page
                */
            $scope.goBack = function () {
                debugger;
                var elements = $("input[name ^='qans']:checked");
                var num = 9;
                var numlast = 12;
                if (thisPage == 3 && elements.length > 12) {
                    num = elements.length == 13 ? 10 : 11;
                }
                if (thisPage > 3 && elements.length > 12) {
                    numlast = elements.length == 13 ? 13 : 14;
                }
                var validateTill = thisPage == 2 ? 4 : (thisPage == 3 ? num : numlast);

                if (thisPage == 1) {
                    validationResult = true;
                }
                else {
                    if ($scope.questions && $scope.questions.length == 8) {
                        validationResult = true;
                    }
                    else {
                        validationResult = feedbackValidate(validateTill);
                    }
                }
                if (validationResult) {
                    var currentPage = $(".Msactive");

                    currentPage.prev().addClass("Msactive");

                    currentPage.removeClass("Msactive");

                    //decrease page number 
                    thisPage -= 1;
                    $("#MsPageNumber").text(thisPage);

                    //increase progress bar
                    progress -= 20;
                    $("#MsPbar").css("width", progress + "%");

                    if (thisPage == 1) {
                        $scope.showbar = false;
                        $("#MSbackBtn").css("display", "none");
                    }

                    if (thisPage == 3 || (thisPage == 2 && $scope.questions && $scope.questions.length == 8)) {
                        $("#MSnextBtn").attr("disabled", false);
                        $("#MSsubmitBtn").css("display", "none");
                    }
                }
            }

            $scope.submitAnswers = function () {
                debugger;
                var elements = $("input[name ^='qans']:checked");
                var validationResult = true;
                if ($scope.questions && $scope.questions.length == 8) {
                    validationResult = true;
                }
                else {
                    validationResult = feedbackValidate(elements.length);
                }

                if (!validationResult)
                    return;

                var q1Id = $("#msQId_0").val();
                //var q1Answer = $("#msQans_0").val();
                var q1Answer = $("input[name='qans0']:checked").val();
                var q1feed = $("#msQfeed_0").val();

                var q2Id = $("#msQId_1").val();
                var q2Answer = $("input[name='qans1']:checked").val();
                var q2feed = $("#msQfeed_1").val();


                var q3Id = $("#msQId_2").val();
                var q3Answer = $("input[name='qans2']:checked").val();
                var q3feed = $("#msQfeed_2").val();

                var q4Id = $("#msQId_3").val();
                var q4Answer = $("input[name='qans3']:checked").val();
                var q4feed = $("#msQfeed_3").val();

                var q5Id = $("#msQId_4").val();
                var q5Answer = $("input[name='qans4']:checked").val();
                var q5feed = $("#msQfeed_4").val();

                var q6Id = $("#msQId_5").val();
                var q6Answer = $("input[name='qans5']:checked").val();
                var q6feed = $("#msQfeed_5").val();

                var q7Id = $("#msQId_6").val();
                var q7Answer = $("input[name='qans6']:checked").val();
                var q7feed = $("#msQfeed_6").val();

                var q8Id = '';
                var q8Answer = '';
                var q8feed = '';

                if (elements && elements.length == 7) {
                    q8Id = $("#msQId_7").val();
                    q8Answer = $("input[name='qans7']:checked").val();
                    q8feed = $("#feedback_7").val();
                }
                else {
                    q8Id = $("#msQId_7").val();
                    q8feed = null;
                    q8Answer = '';
                    if ($('#msQans_17').prop('checked')) {
                        q8Answer = $('#msQans_17').attr('value');
                    }
                    if ($('#msQans_27').prop('checked')) {
                        q8Answer = q8Answer + ',' + $('#msQans_27').attr('value');
                    }
                    if ($('#msQans_37').prop('checked')) {
                        q8Answer = q8Answer + ',' + $('#msQans_37').attr('value');
                    }

                    var q9Id = $("#msQId_8").val();
                    var q9Answer = $("input[name='qans8']:checked").val();
                    var q9feed = $("#msQfeed_8").val();

                    var q10Id = $("#msQId_9").val();
                    var q10Answer = $("input[name='qans9']:checked").val();
                    var q10feed = $("#msQfeed_9").val();

                    var q11Id = $("#msQId_10").val();
                    var q11Answer = $("input[name='qans10']:checked").val();
                    var q11feed = $("#msQfeed_10").val();

                    var q12Id = $("#msQId_11").val();
                    var q12Answer = $("input[name='qans11']:checked").val();
                    var q12feed = $("#msQfeed_11").val();

                    var q13Id = $("#msQId_12").val();
                    var q13Answer = null;

                    var q13feed = $("#msQfeed_12").val();
                }

                if (elements && elements.length == 7) {
                    $scope.answers = [
                        {
                            "questionId": Number(q1Id),
                            "surveyRating": q1Answer,
                            "feedbackComments": q1feed
                        },
                        {
                            "questionId": Number(q2Id),
                            "surveyRating": q2Answer,
                            "feedbackComments": q2feed
                        },
                        {
                            "questionId": Number(q3Id),
                            "surveyRating": q3Answer,
                            "feedbackComments": q3feed
                        },
                        {
                            "questionId": Number(q4Id),
                            "surveyRating": q4Answer,
                            "feedbackComments": q4feed
                        },
                        {
                            "questionId": Number(q5Id),
                            "surveyRating": q5Answer,
                            "feedbackComments": q5feed
                        },
                        {
                            "questionId": Number(q6Id),
                            "surveyRating": q6Answer,
                            "feedbackComments": q6feed
                        },
                        {
                            "questionId": Number(q7Id),
                            "surveyRating": q7Answer,
                            "feedbackComments": q7feed
                        },
                        {
                            "questionId": Number(q8Id),
                            "surveyRating": q8Answer,
                            "feedbackComments": q8feed
                        }
                    ];
                }
                else {

                    $scope.answers = [
                        {
                            "questionId": Number(q1Id),
                            "surveyRating": q1Answer,
                            "feedbackComments": q1feed
                        },
                        {
                            "questionId": Number(q2Id),
                            "surveyRating": q2Answer,
                            "feedbackComments": q2feed
                        },
                        {
                            "questionId": Number(q3Id),
                            "surveyRating": q3Answer,
                            "feedbackComments": q3feed
                        },
                        {
                            "questionId": Number(q4Id),
                            "surveyRating": q4Answer,
                            "feedbackComments": q4feed
                        },
                        {
                            "questionId": Number(q5Id),
                            "surveyRating": q5Answer,
                            "feedbackComments": q5feed
                        },
                        {
                            "questionId": Number(q6Id),
                            "surveyRating": q6Answer,
                            "feedbackComments": q6feed
                        },
                        {
                            "questionId": Number(q7Id),
                            "surveyRating": q7Answer,
                            "feedbackComments": q7feed
                        },
                        {
                            "questionId": Number(q8Id),
                            "surveyRating": q8Answer,
                            "feedbackComments": q8feed
                        },
                        {
                            "questionId": Number(q9Id),
                            "surveyRating": q9Answer,
                            "feedbackComments": q9feed
                        }
                        ,
                        {
                            "questionId": Number(q10Id),
                            "surveyRating": q10Answer,
                            "feedbackComments": q10feed
                        }
                        ,
                        {
                            "questionId": Number(q11Id),
                            "surveyRating": q11Answer,
                            "feedbackComments": q11feed
                        }
                        ,
                        {
                            "questionId": Number(q12Id),
                            "surveyRating": q12Answer,
                            "feedbackComments": q12feed
                        }
                        ,
                        {
                            "questionId": Number(q13Id),
                            "surveyRating": q13Answer,
                            "feedbackComments": q13feed
                        }
                    ];
                }
                $("#loadingScreen").show();
                apiService.post('Customs/CustomerSurvey/SaveCustomerFeedback', '', $scope.answers, function (result) {
                    $("#loadingScreen").hide();
                    var response = result.data.ResponseResult;
                    var msg = "Error in adding/updating Survey";
                    if (response) {
                        $("#Mspage5").append("<h2 class='thanks'>Thank you!</h2>");
                        $scope.goNext();

                        $("#MSbackBtn").css("display", "none");
                        $("#MSnextBtn").css("display", "none");
                        $("#MSsubmitBtn").css("display", "none");
                    }
                    else {
                        modalErrorShow(msg);
                    }
                },
                    function (result) {
                        $("#loadingScreen").hide();
                    });

            };

            function bindData() {
                // remove active class from all pages
                $(".Mspage").removeClass("Msactive");
                // add active class to first page 
                $("#Mspage1").addClass("Msactive");

                //get current page
                $("#MsPageNumber").text(thisPage);

                // put the progress bar value
                $("#MsPbar").css("width", progress + "%");

                //hide back button
                $("#MSbackBtn").css("display", "none");

                //hide submit button
                $("#MSsubmitBtn").css("display", "none");

                if ($scope.questions && $scope.questions[0].id)

                    for (var i = 0; i < $scope.questions.length; i++) {
                        var index = i + 1;
                        if (i <= 4) {

                            if ($scope.questions[i].question.toLowerCase().includes('how often')) {
                                $("#Mspage2").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='Monthly' checked='checked' > <span>Monthly</span></label>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='Weekly' > <span>Weekly</span></label>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='Daily' > <span>Daily</span></label>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='I dont Use' > <span>I don't Use</span></label>" +
                                    "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please select any one</label>"
                                );
                            }
                            else {
                                $("#Mspage2").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='1' onchange='changeRange(this)' > <span>1</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='2' onchange='changeRange(this)' > <span>2</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='3' onchange='changeRange(this)' > <span>3</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '4' + i + "' type ='radio' class='Msinputrange' value='4' onchange='changeRange(this)' > <span>4</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '5' + i + "' type ='radio' class='Msinputrange' value='5' onchange='changeRange(this)' checked='checked' > <span>5</span></label>" +
                                    "<textarea maxlength='1000' id='msQfeed_" + i + "' class='form-control MsFeedback'></textarea>" +
                                    "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please add comment</label>"
                                );
                            }
                        }

                        if (i > 4 && i <= 8) {
                            if ($scope.questions[i].question.includes('Which system would you prefer to use if all services were combined under a single Platform')) {
                                $("#Mspage3").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='MAMAR' checked='checked'  > <span>MAMAR</span></label>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='DHABI' > <span>DHABI</span></label>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='TAMM'  > <span>TAMM</span></label>" +
                                    "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please select any one service</label>"
                                );
                            }
                            else if ($scope.questions[i].question.toLowerCase().includes('suggestions')) {
                                $("#Mspage3").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                    "<textarea id='feedback_" + i + "' maxlength='1000' class='form-control' style='width:90%'></textarea>");
                            }
                            else if ($scope.questions[i].question.includes('How do you rate MAMAR services')) {
                                $("#Mspage3").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='1' onchange='changeRange(this)' > <span>1</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='2' onchange='changeRange(this)' > <span>2</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='3' onchange='changeRange(this)' > <span>3</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '4' + i + "' type ='radio' class='Msinputrange' value='4' onchange='changeRange(this)' > <span>4</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '5' + i + "' type ='radio' class='Msinputrange' value='5' onchange='changeRange(this)' checked='checked' > <span>5</span></label>" +
                                    "<textarea maxlength='1000' id='msQfeed_" + i + "' class='form-control MsFeedback'></textarea>" +
                                    "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please add comment</label>"
                                );
                            }
                            else {
                                if (i == 7) {
                                    $("#Mspage3").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                        "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                        "<label class='mr-20'><input name='qans1" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='CreditCard' onchange='changeRange(this)' checked='checked' onclick='clickCheckBox(this)'> <span>Credit Card</span></label>" +
                                        "<label class='mr-20'><input name='qans2" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='BankTransfer' onchange='changeRange(this)' onclick='clickCheckBox(this)'> <span>Bank Transfer</span></label>" +
                                        "<label class='mr-20'><input name='qans3" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='eWallet' onchange='changeRange(this)' onclick='clickCheckBox(this)'> <span>ewallet</span></label>" +
                                        "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please select any payment method</label>"
                                    );
                                }
                                else {
                                    $("#Mspage3").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                        "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +

                                        "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='1' onchange='changeRange(this)' >  <span class='mr-5'>1</span></label>" +
                                        "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='2' onchange='changeRange(this)' > <span class='mr-5'>2</span></label>" +
                                        "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='3' onchange='changeRange(this)' > <span class='mr-5'>3</span></label>" +
                                        "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '4' + i + "' type ='radio' class='Msinputrange' value='4' onchange='changeRange(this)' > <span class='mr-5'>4</span></label>" +
                                        "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '5' + i + "' type ='radio' class='Msinputrange' value='5' onchange='changeRange(this)' checked='checked'> <span class='mr-5'>5</span></label>" +

                                        "<textarea maxlength='1000' id='msQfeed_" + i + "' class='form-control MsFeedback'></textarea>" +
                                        "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please add comment</label>");
                                }
                            }
                        }

                        if (i > 8) {

                            if (i == 12) {
                                $("#Mspage4").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +
                                    "<textarea maxlength='1000' id='msQfeed_" + i + "' class='form-control'></textarea>");
                            }
                            else if (i == 10) {
                                $("#Mspage4").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +

                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='Yes' onchange='changeRange(this)' checked='checked' > <span>Yes</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='No' onchange='changeRange(this)' > <span>No</span></label>" +

                                    "<textarea maxlength='1000' id='msQfeed_" + i + "' class='form-control'></textarea>" +
                                    "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please add comment</label>");
                            }
                            else {
                                $("#Mspage4").append("<p class='mt-20'>" + index + ". " + $scope.questions[i].question + "</p>" +
                                    "<input id='msQId_" + i + "' type='hidden' value='" + $scope.questions[i].id + "'>" +

                                    "<label class='mr-20'><input name='qans" + i + "' id='msQans_" + '1' + i + "' type ='radio' class='Msinputrange' value='1' onchange='changeRange(this)' > <span>1</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '2' + i + "' type ='radio' class='Msinputrange' value='2' onchange='changeRange(this)' > <span>2</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '3' + i + "' type ='radio' class='Msinputrange' value='3' onchange='changeRange(this)' > <span>3</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '4' + i + "' type ='radio' class='Msinputrange' value='4' onchange='changeRange(this)' > <span>4</span></label>" +
                                    "<label class='mr-20'><input  name='qans" + i + "' id='msQans_" + '5' + i + "' type ='radio' class='Msinputrange' value='5' onchange='changeRange(this)' checked='checked'><span>5</span></label>" +


                                    "<textarea maxlength='1000' id='msQfeed_" + i + "' class='form-control MsFeedback'></textarea>" +
                                    "<label id='validationmsg_" + i + "' class='validation-error-label' style='display:none;'>Please add comment</label>");
                            }

                        }

                    }


            }

            function getSurveyQuestions() {
                resetSurveyStatus();
                apiService.get('Customs/CustomerSurvey/GetSurveyQuestions', {}, function (results) {
                    var resultData = results.data.ResponseResult;
                    if (resultData) {
                        $scope.questions = resultData;
                        $('#MSsurveyModal').modal({ backdrop: 'static', keyboard: false });
                        bindData();
                    }
                },
                    function error(response) {
                        console.log(response);
                    });
            }

            function populateSurveyQuestions() {
                apiService.get('Customs/CustomerSurvey/IsSurveyRequired', {}, function (results) {
                    var resultData = results.data.ResponseResult;
                    if (resultData) {
                        getSurveyQuestions();
                    }
                },
                    function error(response) {
                        console.log(response);
                    });
            }

            $scope.init = () => {
                populateSurveyQuestions();

                if ($scope.userAccntDetails.isPCSSuperUser == "True") {
                    $scope.PCSSuperUser = true;
                } else {
                    $scope.PCSSuperUser = false;
                }

                if ($scope.userAccntDetails.queryManagerEnabled == true) {
                    $scope.QueryManagerEnabled = true;
                } else {
                    $scope.QueryManagerEnabled = false;
                }

                $scope.IsAuthorizedUserForMenu = true;
                if ($scope.userAccntDetails.isAuthorizedUser == true) {
                    $scope.IsAuthorizedUserForUserManagement = true;

                }
                else {
                    $scope.IsAuthorizedUserForUserManagement = false;

                }
                if ($scope.IsAuthorizedUserForUserManagement == true &&
                    $scope.userAccntDetails
                    && $scope.userAccntDetails.accounts.length == 0) {
                    $scope.IsAuthorizedUserForMenu = false;
                    window.location = $Url.resolve('~/Home/Index#/UserManagement');
                }
                //else
                //{
                //    if ($scope.IsAuthorizedUserForUserManagement == true && $scope.userAccntDetails.accounts.length==0)
                //    {
                //        window.location = $Url.resolve('~/Home/Index#/UserManagement');
                //    }
                //}
            }

            $scope.init();
            $scope.Title = "I am in indexController";
            $scope.language = 'en';

            $scope.languages = [
                { Code: "en", Name: "English" },
                { Code: "ae", Name: "عربي" }
            ];
            $scope.centreCodes = [];
            $scope.$parent.lang = $scope.language;
            $scope.$parent.dir = "ltr";
            $("#loadingScreen").show();


            // initialize transport modes array
            //$scope.transportModes = ['M','A','R'];
            $scope.transportModesEng = [{ key: "M", value: "Sea Cargo" }, { key: "A", value: "Air Cargo" }, { key: "R", value: "Land Cargo" }, { key: "F", value: "Free Zone" }];
            $scope.transportModesArb = [{ key: "M", value: "شحن بحري" }, { key: "A", value: "شحن جوي" }, { key: "R", value: "شحن بري" }, { key: "F", value: "منطقة حرة" }];



            // set default transport Modes as Sea
            $scope.selectedMode = $scope.selectedModeEng = $scope.transportModesEng[0].key;
            $scope.selectedModeArb = $scope.transportModesArb[0].key;

            $scope.switchLanguage = function () {
                $translate.use($scope.language);
                $scope.$broadcast('changeLanguage', { language: $scope.language });
                $scope.$parent.dir = $scope.language == 'ae' ? "rtl" : "ltr";
                $scope.$parent.lang = $scope.language;
            };

            // on transport mode change
            $scope.onTransportModeChange = function () {
                if ($scope.language == 'en') { $scope.selectedMode = $scope.selectedModeEng; }
                else if ($scope.language == 'ae') { $scope.selectedMode = $scope.selectedModeArb; }
                $scope.$broadcast('transportModeChange', { selectedMode: $scope.selectedMode });
            }

            $scope.switchIndexByUser = function () {
                if ($scope.userAccntDetails && $scope.userAccntDetails.CCode) {
                    if ($scope.userAccntDetails.CCode.contains('CONSOLIDATOR')) {
                        if (window.location.href.indexOf("Home/ConsolidatedIndex") == -1) {
                            page = "consolidatorManifestUpload";
                            window.location = $Url.resolve('~/Home/ConsolidatedIndex#/consolidatorManifestUpload');
                        }
                    }
                }
                else {
                    if ($scope.IsAuthorizedUserForUserManagement == true &&
                        $scope.userAccntDetails
                        && $scope.userAccntDetails.accounts.length == 0) {

                    }
                    else {
                        window.location = $Url.resolve('~/');
                    }

                }
            }

            //user Account change event emitted from child controller
            $scope.$on('userAccountChanged', function (event, data) {
                $scope.userAccntDetails = data;
                $scope.switchIndexByUser();
                //$scope.userAccntDetails.CCode = data.CCode;
            });

            $scope.validateSubscription = function () {
                if ($scope.subscriptionRequired != undefined && $scope.subscriptionRequired) {
                    window.location = $Url.resolve("~/Home/Index#/subscription");
                }
            }

            if (!angular.fromJson(localStorage.getItem("isNavigatedFromLogin"))) {
                $scope.switchIndexByUser();
            }
            if (localStorage.getItem("subscribeObj") != undefined) {
                var obj = JSON.parse(localStorage.getItem("subscribeObj"));
                $scope.subscriptionRequired = obj.subscriptionRequired;
                $scope.EnableMenu = obj.EnableMenu;
            }


            //#region MG Survey

            //Get
            function getSurvey() {
                $("#loadingScreen").show();
                apiService.getSurvey('form/GetSurvey', '', function (results) {
                    $("#loadingScreen").hide();
                    if (results && results.data && results.data.ResponseResult) {
                        var resultData = results.data.ResponseResult;
                        $scope.formId = resultData.Id;
                        $rootScope.form = resultData.Schema;
                        $scope.settings = {
                            buttonSettings: { showCancel: false }
                        };

                        $scope.surveyTitle = resultData.Name ? resultData.Name : 'Mamar Survey';
                        //$scope.displayMode = resultData.Schema ? resultData.Schema.display : 'form';
                        if ($rootScope.form) {
                            let myIframe = document.getElementById('surveyFrame');
                            let resultObj = {
                                event: 'surveyData',
                                form: $rootScope.form
                            }
                            setTimeout(function () {
                                myIframe.contentWindow.postMessage(JSON.stringify(resultObj), "*");
                                var x = document.getElementById("surveyFrame");
                                if (x && x.contentDocument) {
                                    var z = x.contentDocument.getElementsByClassName("container");
                                    if (z && z.length > 0) {
                                        z[0].style.maxWidth = "100%";
                                    }
                                }

                            }, 1000);
                            //myIframe.contentWindow.postMessage(JSON.stringify(resultObj), location.origin);
                            resetSurveyStatus();
                            $('#mamarsurvey').modal({ backdrop: 'static', keyboard: false });
                        }
                    }
                },
                    function error(response) {
                        $("#loadingScreen").hide();
                        console.log('Get MG Survey' + response);
                    });
            }

            //function getSurvey() {
            //    $("#loadingScreen").show();
            //    apiService.getSurvey('form', 'Custom control', function (results) {
            //        //apiService.getSurvey('form', 'Mamar', function (results) {
            //        $("#loadingScreen").hide();
            //        var resultData = results.data.ResponseResult;
            //        $scope.formId = (resultData && resultData.value && resultData.value[0]) ? resultData.value[0].Id : '0';
            //        $rootScope.form = (resultData && resultData.value && resultData.value[0]) ? resultData.value[0].Schema : '';
            //        $scope.surveyTitle = (resultData && resultData.value && resultData.value[0]) ? resultData.value[0].Name : 'Mamar Survey';
            //        $scope.displayMode = (resultData && resultData.value && resultData.value[0]) ? resultData.value[0].Schema && resultData.value[0].Schema.display : 'form';
            //        if ($rootScope.form) {
            //            Formio.createForm(document.getElementById('formio'), $rootScope.form);
            //            $('#mamarsurvey').modal({ backdrop: 'static', keyboard: false });
            //        }
            //    },
            //    function error(response) {
            //        $("#loadingScreen").hide();
            //        console.log('Get MG Survey' + response);
            //    });
            //}

            getSurvey();

            function prepareSubmissionJson(data) {
                $scope.submissiondata = angular.copy($rootScope.form);
                for (var key of Object.keys(data)) {
                    angular.forEach($scope.submissiondata.components, function (value1, key1) {
                        for (var ikey of Object.keys(value1)) {
                            if (value1[ikey] === key) {
                                var ss = '';
                            }
                            else if (ikey === 'components') {

                                var nestedarr = value1[ikey];

                                angular.forEach(nestedarr, function (valuei, keyi) {
                                    for (var jkey of Object.keys(valuei)) {
                                        if (valuei[jkey] == key) {
                                            nestedarr[keyi].defaultValue = data[key];
                                        }
                                        else if (jkey === 'components') {
                                            var nestedarr2 = valuei[jkey];

                                            angular.forEach(nestedarr2, function (valuej, keyj) {
                                                for (var kkey of Object.keys(valuej)) {
                                                    if (valuej[kkey] == key) {
                                                        nestedarr2[keyj].defaultValue = data[key];
                                                    }
                                                    else if (kkey === 'components') {
                                                        var nestedarr3 = valuej[kkey];
                                                        angular.forEach(nestedarr3, function (valuel, keyl) {
                                                            for (var lkey of Object.keys(valuel)) {
                                                                if (valuel[lkey] == key) {
                                                                    nestedarr3[keyl].defaultValue = data[key];
                                                                }
                                                                else if (lkey === 'components') {
                                                                    var nestedarr4 = valuel[lkey];
                                                                }

                                                            }
                                                        });

                                                    }

                                                }
                                            });

                                        }

                                    }
                                })
                            }
                        }
                    });
                }

                $scope.submissiondata.FormId = $scope.formId;
            }

            //Post  
            //$scope.$on('formSubmit', function (err, data) {

            //    event.preventDefault();
            //    //prepareSubmissionJson(data.data); //note required

            //    $scope.submissiondata = {};
            //    $scope.submissiondata.Data = data.data;
            //    $scope.submissiondata.FormId = $scope.formId;

            //    apiService.postSurvey('surveyresponse', $scope.submissiondata, function (result) {
            //        $("#loadingScreen").hide();
            //        var response = result.data.ResponseResult;
            //        //$('#mamarsurvey').modal('hide');
            //    },
            //    function (result) {
            //        $("#loadingScreen").hide();
            //    });
            //});

            //listen survey submission iframe event
            window.addEventListener("message", function (e) {
                if (e.data) {
                    var submissionDataObj = JSON.parse(e.data);
                    if (submissionDataObj && submissionDataObj.event === "formioSubmit") {
                        formioSubmit(submissionDataObj.submissiondata);
                    }
                }
            }, false);

            function resetSurveyStatus() {
                $scope.submissionSuccess = false;
                $scope.submissionfailed = false;
                $scope.submissionfailedMessage = "";
            }

            function formioSubmit(submissiondata) {
                if ($scope.PCSSuperUser) {
                    $scope.submissionSuccess = false;
                    $scope.submissionfailed = true;
                    $scope.submissionfailedMessage = "Sorry! Survey cannot be submitted on super user profile";
                    $scope.$apply();
                }
                else {
                    if (submissiondata && submissiondata.data) {
                        submissiondata.FormId = $scope.formId;
                        apiService.postSurvey('surveyresponse', submissiondata, function (result) {
                            $("#loadingScreen").hide();
                            //var response = result.data.ResponseResult;
                            $scope.submissionSuccess = true;
                            //$('#mamarsurvey').modal('hide');
                        },
                            function (result) {
                                $("#loadingScreen").hide();
                                $scope.submissionfailed = true;
                                $scope.submissionfailedMessage = "Sorry! Survey could not be submitted due to some server error";
                            });
                    }
                }
            }

            //#endregion

            $("#loadingScreen").hide();
            $("#loadingChargeScreen").hide();
        }]);