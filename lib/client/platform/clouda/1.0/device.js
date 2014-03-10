var deviceSettings = ripple('deviceSettings'),
    devices = ripple('devices'),
    geolocation = ripple('platform/w3c/1.0/geolocation'),
    device = devices.getCurrentDevice(),
    camera = ripple('ui/plugins/camera'),
    event = ripple('event');
    // event = ripple('event'),
    // _success;

// event.on("ConnectionChanged", function () {
    // return _success && _success(deviceSettings.retrieve("NetworkStatus.connectionType"));
// });

function getImageDimens(url,callback){
    var image = new Image();
    image.onload = function(){
        callback({
            width:this.width,
            height:this.height
        });
    };
    image.src = url;
}

function getBase64Image(url) {
    var img = new Image();
    img.src = url;
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function getBase64ImageList(filelist){
    var list = [];
    for(var i in list){
         list.push(getBase64Image(window.webkitURL.createObjectURL(list[i])));
    }
    return list;
}

function getVideoDimensAndDuration(url,callback){
    var video = document.createElement("video");
    video.style.position = 'absolute';
    video.style.visibility = 'hidden';
    document.getElementsByTagName("body")[0].appendChild(video);
    video.onloadedmetadata = function(){
        callback&&callback({
            width:this.getBoundingClientRect().width,
            height:this.getBoundingClientRect().height,
            duration:this.duration
        });
        this.parentNode.removeChild(video);
    };
    video.src=url;

}

function generateMediaFile(file,type,detail,callback){
    var url = window.webkitURL.createObjectURL(file);
    var file = {
        name:file['name'],
        fullPath:url,
        type:file['type'],
        lastModifiedDate:file['lastModifiedDate'],
        size:file['size']
    };
    if(detail){
        if(type == _self.MEDIA_TYPE.IMAGE){
            file.duration = 0;
            getImageDimens(url,function(dimens){
                file.width = dimens.width;
                file.height = dimens.height;
                callback(file);
            });
        }else if(type == _self.MEDIA_TYPE.VIDEO){
            getVideoDimensAndDuration(url,function(s){
                file.width = s.width;
                file.height = s.height;
                file.duration = s.duration;
                callback(file);
            });
        }

    }else{
        callback(file);
    }

}

function generateMediaFileList(filelist,type,detail,callback){
    var medialist = [];
    function _callback(media){
        medialist.push(media);
        if(medialist.length == filelist.length){
            callback(medialist);
        }
    }
    for(var i in filelist){
        var file = filelist[i];
        generateMediaFile(file,type,detail,_callback);
    }
}


_self = module.exports = {
    connection:{
        get:function(options){
            options.onsuccess && options.onsuccess(deviceSettings.retrieve("NetworkStatus.connectionType"));
        }
    },
    device:{
        getUuid:function(options){
            options.onsuccess && options.onsuccess(device.uuid);
        },
        getSysVersion:function(options){
            options.onsuccess && options.onsuccess(device.osVersion);
        },
        getDeviceModelName:function(options){
            options.onsuccess && options.onsuccess(device.name);
        },
        getScreenSize:function(options){
            options.onsuccess && options.onsuccess(device.screen);
        }
    },
    fs:{
        post:function(options){

        }
    },
    globalization:{
        getlocale:function(options){
            options.onsuccess && options.onsuccess(deviceSettings.retrieve("globalization.locale"));
        }
    },
    geolocation:{
        get:function(options){
            geolocation.getCurrentPosition(options.onsuccess,options.onfail);
        }
    },
    MEDIA_TYPE:{
        IMAGE:1,
        VIDEO:2
    },
    MEDIA_FORMAT:{
        FILE:1,
        BASE64:2
    },
    MEDIA_SOURCE:{
        CAMERA:1,
        ALBUM:2
    },
    media:{
        captureMedia:function(options){
            options.mediaType = options.mediaType || _self.MEDIA_TYPE.IMAGE;
            options.format = options.format || _self.MEDIA_FORMAT.FILE;
            options.details = options.details || false;
            options.source = options.source||_self.MEDIA_SOURCE.CAMERA;
            if(options.mediaType == _self.MEDIA_TYPE.IMAGE){
                event.once("captured-image", function (filelist) {
                    if(options.format == _self.MEDIA_FORMAT.FILE){
                        generateMediaFileList(filelist,_self.MEDIA_TYPE.IMAGE,options.details,options.onsuccess);
                    }else if(options.format == _self.MEDIA_FORMAT.BASE64){
                        options.onsuccess(getBase64ImageList(filelist));
                    }

                });
                camera.show("image",options.source===_self.MEDIA_SOURCE.ALBUM);
            }else if(options.mediaType == _self.MEDIA_TYPE.VIDEO){
                event.once("captured-video", function (filelist) {
                    generateMediaFileList(filelist,_self.MEDIA_TYPE.VIDEO,options.details,options.onsuccess);

                });
                camera.show("video",options.source===_self.MEDIA_SOURCE.ALBUM);
            }
        }
    },

    CONNECTION_STATUS:{
        UNKNOWN:-1,
        NONE:0,
        WIFI:2,
        CELL_2G:3,
        CELL_3G:4,
        CELL_4G:5,
        CELL:6,
        ETHERNET:1
    }
};

