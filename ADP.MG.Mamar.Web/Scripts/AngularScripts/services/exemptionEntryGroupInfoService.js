mamarApp.factory('exemptionEntryGroupInfoService', function () {
    var exemptEntryGroup = '';
    var SerialNumber = '';
    return {
        setValue: setValue,
        getValue: getValue,
        setSerialNo: setSerialNo,
        getSerialNo: getSerialNo,
    };
    function setValue(obj) {
        debugger;
        exemptEntryGroup = obj;
    }
    function getValue() {
        return exemptEntryGroup;
    }
    function setSerialNo(obj) {
        debugger;
        SerialNumber = obj;
    }
    function getSerialNo() {
        return SerialNumber;
    }
})