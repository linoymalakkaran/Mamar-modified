mamarApp.factory('userAccountStorageFactory', function () {

    var userAccountInfo = {};

    return {
        setUserAccntInfo: setUserAccntInfo,
        getUserAccntInfo: getUserAccntInfo
    };

    function setUserAccntInfo(userData) {
        if (window.localStorage && userData) {
            //Local Storage to add Data  
            
            localStorage.setItem("userAccountDetails", angular.toJson(userData));
        }
        userAccountInfo = userData;
    }

    function getUserAccntInfo() {
        //Get data from Local Storage  
        userAccountInfo = angular.fromJson(localStorage.getItem("userAccountDetails"));
        return userAccountInfo ? userAccountInfo : {};
    }
})