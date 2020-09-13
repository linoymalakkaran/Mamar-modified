angular.module('mamarApp').controller('dashboardController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'apiService', '$filter', '$storage',
    function ($scope, $rootScope, $http, $state, $stateParams, apiService, $filter, $storage) {

        $scope.$storage = $storage;

        var line_zoom_element = document.getElementById('line_zoom');
        var columns_stacked_element = document.getElementById('columns_stacked');
        var bars_basic_element = document.getElementById('bars_basic');

        // init options for cargo volume line chart
        $scope.chartCargoVolOptions = {
            // Define colors
            color: ['#0092ff', "#d74e67", "#009688"],

            // Global text styles
            textStyle: {
                fontFamily: 'Roboto, Arial, Verdana, sans-serif',
                fontSize: 13
            },

            // Chart animation duration
            animationDuration: 750,

            // Setup grid
            grid: {
                left: 0,
                right: 40,
                top: 35,
                bottom: 0,
                containLabel: true
            },

            // Add legend
            legend: {
                data: [],
                itemHeight: 8,
                itemGap: 20
            },

            // Add tooltip
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.75)',
                padding: [10, 15],
                textStyle: {
                    fontSize: 13,
                    fontFamily: 'Roboto, sans-serif'
                }
            },

            // Horizontal axis
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLabel: {
                    color: '#333'
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }],

            // Vertical axis
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value} ',
                    color: '#333'
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: ['#eee']
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.1)', 'rgba(0,0,0,0.01)']
                    }
                }
            }],

            // Add series
            series: []
        };

        // init options for customs declaration summary - columns stacked chart
        $scope.chartCustomDecOptions = {
            color: ['#2ec7c9', '#b6a2de', '#5ab1ef'],
            textStyle: {
                fontFamily: 'Roboto, Arial, Verdana, sans-serif',
                fontSize: 8
            },
            animationDuration: 750,
            grid: {
                left: 0,
                right: 10,
                top: 35,
                bottom: 0,
                containLabel: true
            },
            legend: {
                data: [],
                itemHeight: 8,
                itemGap: 8
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.75)',
                padding: [10, 15],
                textStyle: {
                    fontSize: 13,
                    fontFamily: 'Roboto, sans-serif'
                },
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(0,0,0,0.025)'
                    }
                }
            },
            xAxis: [{
                type: 'category',
                data: ['Export', 'Import', 'Re-Export', 'Transit-In'],
                axisLabel: {
                    color: '#333'
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }

                }
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    color: '#333'
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }

                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.1)', 'rgba(0,0,0,0.01)']
                    }
                }
            }],
            series: []
        };

        // init options for appointment summary - bar chart
        $scope.chartAppointmentSummaryOptions = {
            textStyle: {
                fontFamily: 'Roboto, Arial, Verdana, sans-serif',
                fontSize: 13
            },
            animationDuration: 750,
            grid: {
                left: 0,
                right: 30,
                top: 35,
                bottom: 0,
                containLabel: true
            },
            legend: {
                data: [],
                itemHeight: 8,
                itemGap: 20,
                textStyle: {
                    padding: [0, 5]
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.75)',
                padding: [10, 15],
                textStyle: {
                    fontSize: 13,
                    fontFamily: 'Roboto, sans-serif'
                },
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(0,0,0,0.025)'
                    }
                }
            },
            xAxis: [{
                type: 'value',
                boundaryGap: [0, 0.01],
                axisLabel: {
                    color: '#333'
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#eee',
                        type: 'dashed'
                    }
                }
            }],
            yAxis: [{
                type: 'category',
                data: ['Summary'],
                axisLabel: {
                    color: '#333'                   
                }, 
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#eee']
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.1)', 'rgba(0,0,0,0.015)']
                    }
                }
            }],
            series: []
        };

        // Populate Cargo Volume Chart
        $scope.PopulateCargoVolChart = function (data) {
            if (line_zoom_element) {
                var legendData = [];
                var seriesData = [];
                angular.forEach(data, function (value, key) {
                    legendData.unshift(value.Type);
                    seriesData.unshift({
                        'name': value.Type, 'type': 'line', 'smooth': true, 'symbolSize': 6,
                        'itemStyle': { 'normal': { 'borderWidth': 2 } }, 'data': value.MonthVolume ? value.MonthVolume.split(','):0
                    });
                });

                $scope.chartCargoVolOptions.legend.data = legendData;
                $scope.chartCargoVolOptions.series = seriesData;

                // Initialize chart
                var line_zoom = echarts.init(line_zoom_element);
                line_zoom.setOption($scope.chartCargoVolOptions);
            }
        }

        // Populate Customs Declaration Summary Chart
        $scope.PopulateCustomsDecChart = function (data) {
            if (columns_stacked_element) {
                var legendData = [];
                var seriesData = [];
                angular.forEach(data, function (value, key) {
                    legendData.push(value.Type);
                    seriesData.push({
                        'name': value.Type, 'type': 'bar', 'data': value.MonthVol.split(',')
                    });
                });

                $scope.chartCustomDecOptions.legend.data = legendData;
                $scope.chartCustomDecOptions.series = seriesData;

                // Initialize chart
                var columns_stacked = echarts.init(columns_stacked_element);
                columns_stacked.setOption($scope.chartCustomDecOptions);
            }
        }

        // Populate Appointment Summary Chart
        $scope.PopulateAppointmentSummaryChart = function (data) {
            //if (bars_basic_element) {
            //    var bars_basic = echarts.init(bars_basic_element);
            //    bars_basic.setOption($scope.chartTransportOrderOptions);
            //}
            if (bars_basic_element) {
                var legendData = [];
                var seriesData = [];
                angular.forEach(data, function (value, key) {
                    legendData.push(value.appointmentType);
                    seriesData.push({
                        'name': value.appointmentType, 'type': 'bar', 'data': [value.appointmentCount]
                    });
                }); 
                $scope.chartAppointmentSummaryOptions.legend.data = legendData;
                $scope.chartAppointmentSummaryOptions.series = seriesData;
                
                // Initialize chart
                var bars_basic = echarts.init(bars_basic_element);
                bars_basic.setOption($scope.chartAppointmentSummaryOptions);
            }
        }

        // init get params
        $scope.params = {
            centerCode: ''
        }

        // Get Cargo Volume
        $scope.GetCargoVolumeData = function () {
            //$("#loadingScreen").show();
            $("#chartCargoVol").show();
            apiService.get('Customs/Dashboard/CargoVolume', '', function (results) {
                //$scope.GetCustomsDecSummary();
                var data = results.data.ResponseResult.Data;
                if (data != null) {
                    $("#chartCargoVol").hide();
                    $scope.PopulateCargoVolChart(data);
                }
                else {
                    $("#chartCargoVol").hide();
                }

            },
        function error(response) {
            $("#chartCargoVol").hide();
            console.log(response);
            // $scope.GetCustomsDecSummary();
        });
        }

        // Get Customs Declaration Summary
        $scope.GetCustomsDecSummary = function () {
            $("#chartDecSummary").show();
            apiService.get('Customs/Dashboard/DeclarationSummary', '', function (results) {
                //$("#loadingScreen").hide();
                var data = results.data.ResponseResult.Data;
                if (data != null) {
                    $("#chartDecSummary").hide();
                    $scope.PopulateCustomsDecChart(data);
                }
                else { $("#chartDecSummary").hide(); }

            },
        function error(response) {
            $("#chartDecSummary").hide();
            console.log(response);
            //$("#loadingScreen").hide();
        });
        }

        // Get Appointment Summary
        $scope.GetAppointmentSummary = function () {
            $("#chartTOSummary").show();
            apiService.get('Customs/Dashboard/AppointmentSummary', '', function (results) {
                if (results && results.data) {
                    var data = results.data.ResponseResult;
                    if (data != null) {
                        $("#chartTOSummary").hide();
                        $scope.PopulateAppointmentSummaryChart(data);
                    }
                    else { $("#chartTOSummary").hide(); }
                }

            },
            function error(response) {
                $("#chartTOSummary").hide();
                console.log(response);
            });
        }

        //Redirect to PCS/Kizad from Mamar
        $scope.RedirectToOtherService = function (service) {
            //$("#loadingScreen").show();

            //Temp fix for demo
            //var url = 'http://10.0.131.21/MAMAR/Web/Home';
            //if(service == 'transport')
            //{
            //    url = 'http://10.0.131.21/MAMAR/Web/TransportOrder/TransportOrder/Index#/transportdashboard';
            //}
            //else if (service == 'appointment')
            //{
            //    url = 'http://10.0.131.21/MAMAR/Web/Appointment/TruckVisitAppointment/Index#/appointment';
            //}
            //else if (service == 'kizad')
            //{
            //    url = 'http://10.0.131.21/MAMAR/eServices/Home/Index#/kizad/app/dashboard/';
            //}
            //window.open(url);

            apiService.redirectToOtherService(service, '', function (results) {
                //$("#loadingScreen").hide();
                if (service == 'epassApp') {
                    window.location.href = results.data;
                }
                else {
                    window.open(results.data);
                }
            },
            function error(response) {
                //$("#loadingScreen").hide();
                console.log(response);
            });
        }
        $scope.RedirectToTransaction = function (mode) {
            if (localStorage.getItem("subscribeObj") != undefined) {
                var obj = JSON.parse(localStorage.getItem("subscribeObj"));
                $scope.subscriptionRequired = obj.subscriptionRequired;
            }
            if ($scope.subscriptionRequired != undefined && $scope.subscriptionRequired) {
                $state.go('subscription');
            }
            else {
                $state.go('transactions', { 'transportMode': mode });

            }
        }

        $scope.callOnLoadMethod = function () {
            $scope.initDashboard();
        }
        $scope.downloadAnnouncementFile = function (recordid, fileName) {
            $("#loadingScreen").show();
            apiService.get('Customs/Announcement/GetAnnouncementAttachment', { 'Id': recordid}, function (results) {
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
        $scope.showAnnouncements = function () {
            $('#announcementModal').modal('show');
        }
        
        $scope.getAnnouncements = function () {
            $("#loadingScreen").show();
            apiService.get('Customs/Announcement/GetRoleBaseAnnouncement', $scope.announcementParams, function (results) {
                $("#loadingScreen").hide();
                if (results && results.data && results.data.ResponseResult) {
                    ///$scope.allannouncements = 
                    $scope.announcements = results.data.ResponseResult.announcements;
                    $scope.annoucementTotalCount = results.data.ResponseResult.totalAnnouncements;
                    if ($scope.announcements != null && $scope.announcements.length > 0) {
                        $scope.showAnnouncements();
                        $storage.set('announcemnetShownFlag', true); 
                    }
                    else {
                        $scope.initDashboard();
                    }
                }
                else {
                    $scope.initDashboard();
                }

            },
            function error(response) {
                $("#loadingScreen").hide();
                console.log(response);
                $scope.initDashboard();
            });
        }
        $scope.loadMoreAnnouncementRecords = function (newPageNumber) {
            $scope.announcementParams = {
                pageNumber: newPageNumber,
                pageSize: 1
            };
            $scope.getAnnouncements();
        }
        // init page load
        $scope.initDashboard = function () {
            $scope.GetCargoVolumeData();
            $scope.GetCustomsDecSummary();
            $scope.GetAppointmentSummary();
        }

        //On Load call annoucement service to get all the annoucements
        $scope.announcementParams = {
            pageNumber: 1,
            pageSize: 1
        };

      
        if (!$storage.get('announcemnetShownFlag')) {
            $scope.getAnnouncements();
        }
        else {
            $scope.initDashboard();
        }

    }]);