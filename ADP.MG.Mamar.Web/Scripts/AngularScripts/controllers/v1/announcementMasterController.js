angular.module('mamarApp').controller('announcementMasterController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$storage', '$filter', 'userAccountStorageFactory',
function ($scope, $rootScope, $http, $state, $stateParams, apiService, $storage, $filter, userAccountStorageFactory) {


    $scope.acceptFiles = '.pdf,.docx,.xlsx,.jpg,.xls,.doc,.jpeg,.tif,.png,.bmp,.txt,.tiff,.xps,.gif,.rtf,.csv';

    function _arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    $scope.$on("selectedFile", function (event, args) {
        if ($scope.acceptFiles.split(",").includes("." + args.file.name.split(".")[1])) {
            $scope.attachedFileName = args.file.name;
            $scope.filePresent = true;
            $scope.$apply();
            $scope.imageData = '';
            var fileList = args.file;
            var fileReader = new FileReader();
            if (fileReader && fileList) {
                fileReader.readAsArrayBuffer(fileList);
                fileReader.onload = function () {
                    $scope.imageData = fileReader.result;
                    $scope.byteArr = _arrayBufferToBase64($scope.imageData);
                };
            }
        }
        else {
            modalErrorShow("Attached document is invalid file");
        }

    });

    function getRoles() {
        $scope.announcement.role = '';
        if ($scope.announcementRoles.All) {
            $scope.announcement.role = 'All';
        }
        else if ($scope.announcementRoles.STOP) {
            $scope.announcement.role = 'STOP';
        }
        else if ($scope.announcementRoles.C && $scope.announcementRoles.A) {
            $scope.announcement.role = 'C,A';
        }
        else if ($scope.announcementRoles.C && $scope.announcementRoles.P) {
            $scope.announcement.role = 'C,P';
        }
        else if ($scope.announcementRoles.A && $scope.announcementRoles.P) {
            $scope.announcement.role = 'A,P';
        }
        else if ($scope.announcementRoles.A) {
            $scope.announcement.role = 'A';
        }
        else if ($scope.announcementRoles.P) {
            $scope.announcement.role = 'P';
        }
        else if ($scope.announcementRoles.C) {
            $scope.announcement.role = 'C';
        }
        
    }
     
    $scope.saveAnnouncement = function () {

        $scope.invalidStartDate = false;

        getRoles();

        if (!$scope.announcement.role) return;

        if (!$scope.startDate || !$scope.endDate) return;

        var strtTime = $("#startTimeData").val();
        var endTime = $("#endTimeData").val();

        $scope.announcement.startDate = $scope.startDate + ' ' + (strtTime ? strtTime : '00:00');
        $scope.announcement.endDate = $scope.endDate + ' ' + (endTime ? endTime : '00:00');

        if ($scope.announcement.startDate) {
            $scope.announcement.startDate = $filter('date')(new Date(apiService.formatDateTimeObject($scope.announcement.startDate)), "MM/dd/yyyy HH:mm");
        }
        if ($scope.announcement.endDate) {
            $scope.announcement.endDate = $filter('date')(new Date(apiService.formatDateTimeObject($scope.announcement.endDate)), "MM/dd/yyyy HH:mm");
        }

        if (moment($scope.announcement.endDate) <= moment($scope.announcement.startDate)) {
            $scope.invalidStartDate = true;
            return;
        }

        $scope.currentDate = $filter('date')(new Date, "MM/dd/yyyy HH:mm");

        if (moment($scope.announcement.startDate) < moment($scope.currentDate) || moment($scope.announcement.endDate) < moment($scope.currentDate)) {
            var dateerrmsg = $filter('translate')('PastDateErrMsg');
            modalErrorShow(dateerrmsg);
            return;
        }
        //Validation end

        if ($scope.attachedFileName)  
            $scope.announcement.fileName = $scope.attachedFileName;

        $scope.announcement.fileBytes = $scope.byteArr ? $scope.byteArr : '';

        if ($scope.mode == 'clone') {
            $scope.announcement.createdDate = new Date();
            $scope.announcement.id = '';
            if (!$scope.byteArr && $scope.prevAttachment)
                $scope.announcement.fileBytes = $scope.prevAttachment;
        }

        $("#loadingScreen").show();
        apiService.post('Customs/Announcement/AddUpdateAnnouncement', '', $scope.announcement, function (result) {
            $("#loadingScreen").hide();
            var response = result.data.ResponseResult;
            var msg = "Error in adding/updating announcements";
            if (response) {
                $scope.parameters.pageNumber = 1;
                $scope.getAllAnnouncements();
                $('#newAnnouncementModal').modal('hide');
                 
                var savedSuccessmsg = $filter('translate')('SavedSuccess');
                modalSuccessShow(savedSuccessmsg);
                //$('#successModal').modal('show');
            }
            else  {
                modalErrorShow(msg);
            }
        },
        function (result) {
            $("#loadingScreen").hide();
        });
    }

    $scope.stopAnnouncement = function (item) {
        initializeAnnouncement();
        $scope.announcement = angular.copy(item);
        $scope.announcement.role = 'STOP';

        if ($scope.announcement.startDate) {
            $scope.announcement.startDate = $filter('date')($scope.announcement.startDate, "MM/dd/yyyy HH:mm");
        }
        if ($scope.announcement.endDate) {
            $scope.announcement.endDate = $filter('date')($scope.announcement.endDate, "MM/dd/yyyy HH:mm");
        }

        $scope.announcement.updatedDate = new Date();
        $scope.announcement.fileBytes = $scope.announcement.fileBytes ? $scope.announcement.fileBytes : '';

        $("#loadingScreen").show();
        apiService.post('Customs/Announcement/AddUpdateAnnouncement', '', $scope.announcement, function (result) {
            $("#loadingScreen").hide();
            var response = result.data.ResponseResult;
            var msg = "Error in adding/updating announcements";
            if (response) {
                $scope.parameters.pageNumber = 1;
                $scope.getAllAnnouncements();
                $('#newAnnouncementModal').modal('hide');
                var successmsg = $filter('translate')('StopSuccessMsg');
                modalSuccessShow(successmsg);
            }
            else {
                modalErrorShow(msg);
            }
        },
        function (result) {
            $("#loadingScreen").hide();
        });
    }

    function showYesNoConfirmatioMessage(msg) {
        swal({
            title: '',
            text: msg,
            type: "success",
            confirmButtonColor: "#666",
            confirmButtonText: $filter('translate')('ok'),
            closeOnConfirm: true,
            showCancelButton: true,
            cancelButtonText: $filter('translate')('Cancel'),
            html: true
        },
        function (isConfirm) {
            if (isConfirm) {
                $scope.stopAnnouncement($scope.stopAnnouncementItem);
            }
        });
        //$("body").removeClass("stop-scrolling");
    }
     
    $scope.confirmStopAnnouncement = function (item) {
        $scope.stopAnnouncementItem = item;
        var confirmmsg = $filter('translate')('ConfirmStopMsg');
        showYesNoConfirmatioMessage(confirmmsg);
    }

    function resetAnnouncementRoles() {
        $scope.announcementRoles = {
            C: false,
            P: false,
            A: false,
            All: false,
            STOP: false
        }
    }

    $scope.checkChanged = function (item) {
        if (item == 'STOP') {
            $scope.announcementRoles.C = $scope.announcementRoles.A = $scope.announcementRoles.P = $scope.announcementRoles.All = false;
        }
        else if (item == 'All') {
            if ($scope.announcementRoles.All) {
                $scope.announcementRoles.C = $scope.announcementRoles.A = $scope.announcementRoles.P = true;
                $scope.announcementRoles.STOP = false;
            }
            else {
                $scope.announcementRoles.C = $scope.announcementRoles.A = $scope.announcementRoles.P = false;
                $scope.announcementRoles.STOP = false;
            }
        }
        else if ($scope.announcementRoles.C && $scope.announcementRoles.A && $scope.announcementRoles.P) {
            $scope.announcementRoles.All = true;
            $scope.announcementRoles.STOP = false;
        }
        else {
            $scope.announcementRoles.All = false;
            $scope.announcementRoles.STOP = false;
        }
    }


    function initializeAnnouncement() {
        $scope.announcement = {
            'id': '',
            'title': '',
            'messageA': '',
            'messageE': '',
            'fileName': '',
            'fileBytes': '',
            'messageCenter': '',
            'role': '',
            'startDate': '',
            'endDate': '',
            'createdDate': '',
            'updatedDate': '',
            'createdUser': '',
            'updatedUser': ''
        }
        $scope.startDate = '';
        $scope.endDate = '';
        $scope.announceendTime = '';
        $scope.announcestartTime = '';
        $scope.announceendTime = '';
        $scope.submitted = false;
        $scope.invalidStartDate = false;
        $scope.byteArr = '';
        $scope.attachedFileName = '';
        $scope.filePresent = false;
    }
    $scope.removeFileAnnounce = function (item) {
        item.fileName = '';
    }
    $scope.removeFile = function (item) {
        $scope.attachedFileName = '';
        $scope.byteArr = '';
        $scope.filePresent = false;
    }

    function getAnnouncementAttachment(recordid) {
        apiService.get('Customs/Announcement/GetAnnouncementAttachment', { 'Id': recordid }, function (results) {
            var resultData = results.data.ResponseResult;
            if (resultData != null && resultData.length > 0) {
                $scope.prevAttachment = resultData[0];
            }
        },
        function error(response) {
            console.log(response);
        });
    }

    $scope.openAnnouncementForm = function (item, mode) {
      
        initializeAnnouncement();
        resetAnnouncementRoles();
        $scope.mode = mode;

        if ($scope.mode == 'add')
        {
            $scope.announcement.createdDate = new Date();
            $scope.announcestartTime ='00:00';
            $scope.announceendTime = '00:00';
            $("#startTimeData").val('00:00');
            $("#endTimeData").val('00:00');
            $scope.announcement.startDate = '';
            $scope.announcement.endDate = '';
            $scope.announcement.role = '';
            $('#newAnnouncementModal').modal("show");
        }
        else {

            $scope.announcement = angular.copy(item);

            if ($scope.mode == 'clone' && item.fileName) {
                getAnnouncementAttachment(item.id);
            }

            if ($scope.announcement.startDate) {
                $scope.announcestartTime = $filter('date')($scope.announcement.startDate, "HH:mm");
                $scope.startDate = $filter('date')($scope.announcement.startDate, "dd/MM/yyyy");
            }
            if ($scope.announcement.endDate) {
                $scope.announceendTime = $filter('date')($scope.announcement.endDate, "HH:mm");
                $scope.endDate = $filter('date')($scope.announcement.endDate, "dd/MM/yyyy");
            }
            if ($scope.announcement && $scope.announcement.role) {

                    $scope.announcementRoles.C = $scope.announcement.role == 'C' ? true : false;
                    $scope.announcementRoles.A = $scope.announcement.role == 'A' ? true : false;
                    $scope.announcementRoles.P = $scope.announcement.role == 'P' ? true : false;

                    $scope.announcementRoles.All = ($scope.announcement.role.toLowerCase() == 'all' ? true : false);
                    if ($scope.announcementRoles.All) {
                        $scope.announcementRoles.C = $scope.announcementRoles.A = $scope.announcementRoles.P = true;
                    }

                    $scope.announcementRoles.STOP = $scope.announcement.role == 'STOP' ? true : false;
                    if ($scope.announcementRoles.STOP) {
                        $scope.announcementRoles.C = $scope.announcementRoles.A = $scope.announcementRoles.P = $scope.announcementRoles.All = false;
                    }

                    if ($scope.announcement.role == 'C,A') {
                        $scope.announcementRoles.C = true;
                        $scope.announcementRoles.A = true;
                    }
                    else if ($scope.announcement.role == 'C,P') {
                        $scope.announcementRoles.C = true;
                        $scope.announcementRoles.P = true;
                    }
                    else if ($scope.announcement.role == 'A,P') {
                        $scope.announcementRoles.A = true;
                        $scope.announcementRoles.P = true;
                    }


                    $scope.announcement.updatedDate = new Date();
                }
            
            $('#newAnnouncementModal').modal("show");
        }
    }

    $scope.downloadAnnouncementFile = function (recordid, fileName) {
        $("#loadingScreen").show();
        apiService.get('Customs/Announcement/GetAnnouncementAttachment', { 'Id': recordid }, function (results) {
            $("#loadingScreen").hide();
            var resultData = results.data.ResponseResult;
            if (resultData != null && resultData.length > 0) {
                apiService.printAnnoucementDocuments(resultData[0], fileName);
            }
            else {
                modalErrorShow(resultData.Messages);
            }

        },
        function error(response) {
            $("#loadingScreen").hide();
            console.log(response);
        });
    }

    $scope.loadMoreRecords = function (newPageNo) {
        $scope.parameters.pageNumber = newPageNo;
        $scope.getAllAnnouncements();
    }

    $scope.getAllAnnouncements = function () {
        $scope.currentDateandTime = $filter('date')(new Date(), "yyyy-MM-ddTHH:mm:ss");
        $("#loadingScreen").show();
        apiService.get('Customs/Announcement/GetAllAnnouncement', $scope.parameters,
            function (results) {
                $("#loadingScreen").hide();
                if (results && results.data && results.data.ResponseResult) {
                    $scope.customsAnnouncements = results.data.ResponseResult.announcements;
                    $scope.totalCount = results.data.ResponseResult.totalAnnouncements;
                }
            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log("An Error has occurred while getting customsAnnouncements!");
            }
        );
    }

    $scope.init = function () {

       // $scope.currentDateandTime = $filter('date')(new Date(), "yyyy-MM-ddTHH:mm:ss");
        $scope.announcement = {};
        $scope.parameters = {
            pageNumber: 1,
            pageSize: 10
        };
        $scope.getAllAnnouncements();

    }
    //On Load
    $scope.init();

    }]);

