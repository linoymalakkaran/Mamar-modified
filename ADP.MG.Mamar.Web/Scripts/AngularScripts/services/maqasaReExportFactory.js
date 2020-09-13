mamarApp.factory('maqasaReExportFactory', function () {

    var maqasaSearchEntity = {};
    maqasaSearchEntity.Bills = [];

    return {
        setMaqasaSrchEntity: setMaqasaSrchEntity,
        getMaqasaSrchEntity: getMaqasaSrchEntity
    };

    function setMaqasaSrchEntity(entity) {
        maqasaSearchEntity = entity;
    }

    function getMaqasaSrchEntity() {
        return maqasaSearchEntity;
    }
})