var deviceSettings = ripple('deviceSettings');
    // event = ripple('event'),
    // _success;

// event.on("ConnectionChanged", function () {
    // return _success && _success(deviceSettings.retrieve("NetworkStatus.connectionType"));
// });

_self = module.exports = {
    connection:{
        get:function(options){
            options.onsuccess && options.onsuccess(deviceSettings.retrieve("NetworkStatus.connectionType"));
        }
    },
    CONNECTION_STATUS:{
        UNKNOWN:0,
        NONE:1,
        WIFI:2,
        CELL_2G:3,
        CELL_3G:4,
        CELL_4G:5,
        CELL:6,
        ETHERNET:7
    }
};

