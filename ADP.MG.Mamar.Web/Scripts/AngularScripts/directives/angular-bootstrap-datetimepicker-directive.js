'use strict';

angular.module('datetimepicker', [])

  .provider('datetimepicker', function () {
      var default_options = {};

      this.setOptions = function (options) {
          default_options = options;
      };

      this.$get = function () {
          return {
              getOptions: function () {
                  return default_options;
              }
          };
      };
  })

  .directive('datetimepicker', ['$timeout', 'datetimepicker',
    function ($timeout, datetimepicker) {
        return {
            require: '?ngModel',
            restrict: 'AE',
            scope: {
                minDate: '@',
                maxDate: '@',
                datetimepickerOptions: '@',
                useCurrent: '@'
            },
            link: function ($scope, $element, $attrs, ngModelCtrl) {
                var passed_in_options = $scope.$eval($attrs.datetimepickerOptions);
                var default_options = new Object();

                if ($scope.minDate != undefined && $scope.minDate !== "")
                    default_options.minDate = new Date($scope.minDate.replace(/"/g, ''));

                if ($scope.maxDate != undefined && $scope.maxDate !== "")
                    default_options.maxDate = new Date($scope.maxDate.replace(/"/g, ''));

                if ($scope.useCurrent != undefined && $scope.useCurrent !== "")
                    default_options.useCurrent = ($scope.useCurrent === 'true');

                var options = jQuery.extend({}, default_options, passed_in_options);

                $element
                  .on('dp.change', function (e) {
                      if (ngModelCtrl) {
                          $timeout(function () {
                              ngModelCtrl.$setViewValue(e.target.value);
                          });
                      }
                  })
                  .datetimepicker(options);

                function setPickerValue() {
                    var date = options.defaultDate || null;

                    if (ngModelCtrl && ngModelCtrl.$viewValue) {
                        date = ngModelCtrl.$viewValue;
                    }

                    $element
                      .data('DateTimePicker')
                      .date(date);
                }

                if (ngModelCtrl) {
                    ngModelCtrl.$render = function () {
                        setPickerValue();
                    };
                }

                setPickerValue();
            }
        };
    }
  ]);