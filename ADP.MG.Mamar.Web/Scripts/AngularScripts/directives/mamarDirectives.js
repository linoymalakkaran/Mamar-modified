var mamarApp = angular.module("mamarApp");

// only digits
mamarApp.directive("onlyNumbers", function () {
  return {
    restrict: "A",
    require: "?ngModel",
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        if (inputValue == undefined) return "";
        var transformedInput = inputValue.replace(/[^0-9]/g, "");
        if (transformedInput !== inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });
    },
  };
});

mamarApp.directive("onlyDigits", function () {
  return {
    require: "ngModel",
    restrict: "A",
    link: function (scope, element, attr, ctrl) {
      function inputValue(val) {
        if (val) {
          var digits = val.replace(/[^0-9]/g, "");

          if (digits !== val) {
            ctrl.$setViewValue(digits);
            ctrl.$render();
          }
          return parseInt(digits, 10);
        }
        return undefined;
      }
      ctrl.$parsers.push(inputValue);
    },
  };
});

// valid Numbers - positive, negative and decimals
mamarApp.directive("validNumber", function () {
  return {
    require: "?ngModel",
    link: function (scope, element, attrs, ngModelCtrl) {
      element.on("keydown", function (event) {
        var isPaste = false;
        if (
          (event.keyCode == 17 || event.keyCode == 91) &&
          (event.keyCode == 86 || event.keyCode == 67 || event.keyCode == 88)
        ) {
          isPaste = true;
          console.log("paste");
        } else {
          var keyCode = [];
          if (attrs.allowNegative == "true") {
            keyCode = [
              8,
              9,
              36,
              35,
              37,
              39,
              46,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              109,
              110,
              173,
              190,
              189,
              17,
              86,
              67,
              88,
            ];
          } else {
            var keyCode = [
              8,
              9,
              36,
              35,
              37,
              39,
              46,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              110,
              173,
              190,
              17,
              86,
              67,
              88,
            ];
          }

          if (attrs.allowDecimal == "false") {
            var index = keyCode.indexOf(190);
            if (index > -1) {
              keyCode.splice(index, 1);
            }
          }

          if ($.inArray(event.which, keyCode) == -1 && !isPaste)
            event.preventDefault();
          else {
            var oVal = ngModelCtrl.$modelValue || "";
            if (
              $.inArray(event.which, [109, 173]) > -1 &&
              oVal.indexOf("-") > -1
            )
              event.preventDefault();
            else if (
              $.inArray(event.which, [110, 190]) > -1 &&
              oVal.indexOf(".") > -1
            )
              event.preventDefault();
          }
        }
      });
      //.on('blur', function () {
      //    if (element.val() == '' || parseFloat(element.val()) == 0.0 || element.val() == '-') {
      //        ngModelCtrl.$setViewValue('0.00');
      //    }
      //    else if (attrs.allowDecimal == "false") {
      //        ngModelCtrl.$setViewValue(element.val());
      //    }
      //    else {
      //        if (attrs.decimalUpto) {
      //            var fixedValue = parseFloat(element.val()).toFixed(attrs.decimalUpto);
      //        }
      //        else { var fixedValue = parseFloat(element.val()).toFixed(2); }
      //        ngModelCtrl.$setViewValue(fixedValue);
      //    }
      //    ngModelCtrl.$render();
      //    scope.$apply();
      //});

      ngModelCtrl.$parsers.push(function (text) {
        var oVal = ngModelCtrl.$modelValue;
        var nVal = ngModelCtrl.$viewValue;
        // nVal = nVal == 0 ? "" : nVal;
        if (parseFloat(nVal) != nVal) {
          if (nVal === null || nVal === undefined || nVal == "" || nVal == "-")
            oVal = nVal;

          ngModelCtrl.$setViewValue(oVal);
          ngModelCtrl.$render();
          return oVal;
        } else {
          var decimalCheck = nVal.split(".");

          if (!angular.isUndefined(decimalCheck[0])) {
            if (attrs.preDecimalUpto)
              decimalCheck[0] = decimalCheck[0].slice(0, attrs.preDecimalUpto);

            nVal = decimalCheck[0];
          }

          if (!angular.isUndefined(decimalCheck[1])) {
            if (attrs.decimalUpto)
              decimalCheck[1] = decimalCheck[1].slice(0, attrs.decimalUpto);
            else decimalCheck[1] = decimalCheck[1].slice(0, 2);

            nVal = nVal + "." + decimalCheck[1];
          }

          ngModelCtrl.$setViewValue(nVal);
          ngModelCtrl.$render();
          return nVal;
        }
      });

      //ngModelCtrl.$formatters.push(function (text) {
      //    debugger;
      //    if (text == '0' || text == null && attrs.allowDecimal == "false") return '0';
      //    else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto == undefined) return '0.00';
      //    else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) return parseFloat(0).toFixed(attrs.decimalUpto);
      //    else if (attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) return parseFloat(text).toFixed(attrs.decimalUpto);
      //    else return parseFloat(text).toFixed(2);
      //});
    },
  };
});

mamarApp.directive("validNumberWithComma", function () {
  return {
    require: "?ngModel",
    link: function (scope, element, attrs, ngModelCtrl) {
      element.on("keydown", function (event) {
        var isPaste = false;
        if (
          (event.keyCode == 17 || event.keyCode == 91) &&
          (event.keyCode == 86 || event.keyCode == 67 || event.keyCode == 88)
        ) {
          isPaste = true;
          console.log("paste");
        } else {
          var keyCode = [];
          if (attrs.allowNegative == "true") {
            keyCode = [
              8,
              9,
              36,
              35,
              37,
              39,
              46,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              109,
              110,
              173,
              190,
              189,
              17,
              86,
              67,
              88,
            ];
          } else {
            var keyCode = [
              8,
              9,
              36,
              35,
              37,
              39,
              46,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              110,
              173,
              190,
              17,
              86,
              67,
              88,
            ];
          }

          if (attrs.allowDecimal == "false") {
            var index = keyCode.indexOf(190);
            if (index > -1) {
              keyCode.splice(index, 1);
            }
          }

          if ($.inArray(event.which, keyCode) == -1 && !isPaste)
            event.preventDefault();
          else {
            var oVal = ngModelCtrl.$modelValue || "";
            if (
              $.inArray(event.which, [109, 173]) > -1 &&
              oVal.indexOf("-") > -1
            )
              event.preventDefault();
            else if (
              $.inArray(event.which, [110, 190]) > -1 &&
              oVal.indexOf(".") > -1
            )
              event.preventDefault();
          }
        }
      });
      //.on('blur', function () {
      //    if (element.val() == '' || parseFloat(element.val()) == 0.0 || element.val() == '-') {
      //        ngModelCtrl.$setViewValue('0.00');
      //    }
      //    else if (attrs.allowDecimal == "false") {
      //        ngModelCtrl.$setViewValue(element.val());
      //    }
      //    else {
      //        if (attrs.decimalUpto) {
      //            var fixedValue = parseFloat(element.val()).toFixed(attrs.decimalUpto);
      //        }
      //        else { var fixedValue = parseFloat(element.val()).toFixed(2); }
      //        ngModelCtrl.$setViewValue(fixedValue);
      //    }
      //    ngModelCtrl.$render();
      //    scope.$apply();
      //});

      ngModelCtrl.$parsers.push(function (text) {
        var oVal = ngModelCtrl.$modelValue;
        var nVal = ngModelCtrl.$viewValue;
        // nVal = nVal == 0 ? "" : nVal;
        nVal = nVal.replace(new RegExp(",", "g"), "");
        if (parseFloat(nVal) != nVal) {
          if (nVal === null || nVal === undefined || nVal == "" || nVal == "-")
            oVal = nVal;

          ngModelCtrl.$setViewValue(oVal);
          ngModelCtrl.$render();
          return oVal;
        } else {
          var decimalCheck = nVal.split(".");

          if (!angular.isUndefined(decimalCheck[0])) {
            if (attrs.preDecimalUpto)
              decimalCheck[0] = decimalCheck[0].slice(0, attrs.preDecimalUpto);

            nVal = decimalCheck[0];
          }

          if (!angular.isUndefined(decimalCheck[1])) {
            if (attrs.decimalUpto)
              decimalCheck[1] = decimalCheck[1].slice(0, attrs.decimalUpto);
            else decimalCheck[1] = decimalCheck[1].slice(0, 2);

            nVal = nVal + "." + decimalCheck[1];
          }

          ngModelCtrl.$setViewValue(nVal);
          ngModelCtrl.$render();
          return nVal;
        }
      });

      //ngModelCtrl.$formatters.push(function (text) {
      //    debugger;
      //    if (text == '0' || text == null && attrs.allowDecimal == "false") return '0';
      //    else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto == undefined) return '0.00';
      //    else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) return parseFloat(0).toFixed(attrs.decimalUpto);
      //    else if (attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) return parseFloat(text).toFixed(attrs.decimalUpto);
      //    else return parseFloat(text).toFixed(2);
      //});
    },
  };
});

//To convert the input to upper case
mamarApp.directive("capitalize", function () {
  return {
    require: "ngModel",
    link: function (scope, element, attrs, modelCtrl) {
      var capitalize = function (inputValue) {
        if (angular.isUndefined(inputValue)) return;

        var capitalized = inputValue.toUpperCase();
        if (capitalized !== inputValue) {
          modelCtrl.$setViewValue(capitalized);
          modelCtrl.$render();
        }
        return capitalized;
      };
      modelCtrl.$parsers.push(capitalize);
      capitalize(scope[attrs.ngModel]); // capitalize initial value
    },
  };
});

mamarApp.directive("restrictSpecialChars", function () {
  function link(scope, elem, attrs, ngModel) {
    ngModel.$parsers.push(function (viewValue) {
      var reg = /^[a-zA-Z0-9]*$/;
      if (viewValue.match(reg)) {
        return viewValue;
      }
      var transformedValue = ngModel.$modelValue;
      ngModel.$setViewValue(transformedValue);
      ngModel.$render();
      return transformedValue;
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    link: link,
  };
});

mamarApp.directive("restrictSpace", function () {
  return {
    restrict: "A",

    link: function ($scope, $element) {
      $element.bind("input", function () {
        $(this).val($(this).val().replace(/ /g, ""));
      });
    },
  };
});

//Focusing
mamarApp.directive("focusOnCondition", [
  "$timeout",
  function ($timeout) {
    var checkDirectivePrerequisites = function (attrs) {
      if (!attrs.focusOnCondition && attrs.focusOnCondition != "") {
        throw "FocusOnCondition missing attribute to evaluate";
      }
    };

    return {
      restrict: "A",
      link: function (scope, element, attrs, ctrls) {
        checkDirectivePrerequisites(attrs);

        scope.$watch(attrs.focusOnCondition, function (
          currentValue,
          lastValue
        ) {
          if (currentValue == true) {
            $timeout(function () {
              element.focus();
            });
          }
        });
      },
    };
  },
]);

mamarApp.directive("jqdatepicker", function () {
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, element, attrs, ngModelCtrl) {
      element.datetimepicker({
        minView: "month",
        autoclose: true,
        format: "mm/dd/yyyy",
        startDate: attrs.startdate,
        endDate: attrs.enddate,
      });
    },
  };
});
//Allow - _ . @@
mamarApp.directive("restrictSpecialCharsUsername", function () {
  function link(scope, elem, attrs, ngModel) {
    ngModel.$parsers.push(function (viewValue) {
      var reg = /^[a-zA-Z0-9.@_-]*$/;
      if (viewValue.match(reg)) {
        return viewValue;
      }
      var transformedValue = ngModel.$modelValue;
      ngModel.$setViewValue(transformedValue);
      ngModel.$render();
      return transformedValue;
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    link: link,
  };
});
//Allows special characters '-' and '_'
mamarApp.directive("restrictSpecialCharsExclude", function () {
  function link(scope, elem, attrs, ngModel) {
    ngModel.$parsers.push(function (viewValue) {
      var reg = /^[a-zA-Z0-9_-]*$/;
      if (viewValue.match(reg)) {
        return viewValue;
      }
      var transformedValue = ngModel.$modelValue;
      ngModel.$setViewValue(transformedValue);
      ngModel.$render();
      return transformedValue;
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    link: link,
  };
});
mamarApp.directive("allowComma", function () {
  function link(scope, elem, attrs, ngModel) {
    ngModel.$parsers.push(function (viewValue) {
      var reg = /^[a-zA-Z0-9,]*$/;
      if (viewValue.match(reg)) {
        return viewValue;
      }
      var transformedValue = ngModel.$modelValue;
      ngModel.$setViewValue(transformedValue);
      ngModel.$render();
      return transformedValue;
    });
  }

  return {
    restrict: "A",
    require: "ngModel",
    link: link,
  };
});
mamarApp.directive("preventTypingGreater", function () {
  return {
    link: function (scope, element, attributes) {
      var oldVal = null;
      element.on("keydown keyup", function (e) {
        if (
          Number(element.val()) > Number(attributes.max) &&
          e.keyCode != 46 && // delete
          e.keyCode != 8 // backspace
        ) {
          e.preventDefault();
          element.val(oldVal);
        } else {
          oldVal = Number(element.val());
        }
      });
    },
  };
});

mamarApp.directive("uploadFiles", function () {
  return {
    scope: true, //create a new scope
    link: function (scope, el, attrs) {
      el.bind("click change", function (event) {
        var files = event.target.files;

        if (event.type === "click") {
          el.val(null); // clear input
          return;
        }
        //iterate files since 'multiple' may be specified on the element
        if (files.length > 0)
          for (var i = 0; i < files.length; i++) {
            scope.$emit("selectedFile", {
              file: files[i],
              docType: attrs.docType,
            });
          }
        else {
          scope.$emit("cancelSelectedFile", {
            attachmentid: attrs.attachmentId,
          });
        }
      });
    },
  };
});

// only digits
mamarApp.directive("mobileNumbers", function () {
  return {
    restrict: "A",
    require: "?ngModel",
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        if (inputValue == undefined) return "";
        var transformedInput = inputValue.replace(/[^0-9+-]/g, "");
        if (transformedInput !== inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });
    },
  };
});
mamarApp.directive("otherPrefix", function () {
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, element, attrs, controller) {
      function ensureOtherPrefix(value) {
        var prefix = "OTHER";
        if (
          value &&
          !/^OTHER/.test(value.toUpperCase()) &&
          prefix.indexOf(value.toUpperCase()) !== 0
        ) {
          var prefixVal = "OTHER - " + value;
          controller.$setViewValue(prefixVal);
          controller.$render();
          return prefixVal;
        } else if (
          value &&
          value.length == prefix.length + 1 &&
          value.toUpperCase().indexOf(prefix) == 0
        ) {
          var prefixVal = prefix + " - " + value.substring(prefix.length);
          controller.$setViewValue(prefixVal);
          controller.$render();
          return prefixVal;
        } else return value;
      }
      controller.$formatters.push(ensureOtherPrefix);
      controller.$parsers.splice(0, 0, ensureOtherPrefix);
    },
  };
});


mamarApp.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
              //Also remove . and , so its gives a cleaner result.
              if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                lastspace = lastspace - 1;
              }
              value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});