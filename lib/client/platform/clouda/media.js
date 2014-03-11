var audioContext;

var sourceNode;
var analyserNode;
var javascriptNode;
var playbackSourceNode;
var audioStream;
var array = [];

var craicAudioContext = (function() {
    return window.webkitAudioContext || window.AudioContext;
})();

var getMedia = (navigator.mozGetUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);

try {
    audioContext = new craicAudioContext();

} catch(e) {
    alert('Web Audio API is not supported in this browser');
}

function setupAudioNodes(stream) {
    var sampleSize = 1024;
    // number of samples to collect before analyzing FFT
    // decreasing this gives a faster sonogram, increasing it slows it down
    audioStream = stream;

    // The nodes are:  sourceNode -> analyserNode -> javascriptNode -> destination

    // create an audio buffer source node
    sourceNode = audioContext.createMediaStreamSource(audioStream);

    // Set up the javascript node - this uses only one channel - i.e. a mono microphone
    javascriptNode = audioContext.createJavaScriptNode(sampleSize, 1, 1);

    // setup the analyser node
    analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0.0;
    analyserNode.fftSize = 1024;
    // must be power of two

    // connect the nodes together
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    // optional - connect input to audio output (speaker)
    // This will echo your input back to your speakers - Beware of Feedback !!
    // sourceNode.connect(audioContext.destination);

    // allocate the array for Frequency Data
    array = new Uint8Array(analyserNode.frequencyBinCount);
}

try {
    navigator.webkitGetUserMedia({
        audio : true
    }, setupAudioNodes, onError);

} catch (e) {
    alert('webkitGetUserMedia threw exception :' + e);
}

function onError(e) {
    console.error(e);
}

var MEDIA_STATUS = {
    NONE : 0,
    STARTING : 1,
    RUNNING : 2,
    PAUSED : 3,
    STOPPED : 4
};

function Media(url) {
    var audio = document.createElement("video");
    audio.src = url;
    var status = MEDIA_STATUS.NONE;
    var recording = null;
    var audioBufferNode = null;
    var audioBuffer = null;
    function addSampleToRecording(inputBuffer) {
        var currentBuffer = inputBuffer.getChannelData(0);

        if (recording == null) {
            // handle the first buffer
            recording = currentBuffer;
        } else {
            // allocate a new Float32Array with the updated length
            newlen = recording.length + currentBuffer.length;
            var newBuffer = new Float32Array(newlen);
            newBuffer.set(recording, 0);
            newBuffer.set(currentBuffer, recording.length);
            recording = newBuffer;
        }
    }

    var loaded = false;


    this.onloadedmetadata = function(callback) {
        if(loaded){
            callback();
        }else{
            audio.addEventListener("loadedmetadata", function(){
                callback();
                loaded = true;
            }, false);
        }
        // audio.addEventListener("loadedmetadata", callback, false);
    };

    this.getStatus = function() {
        return status;
    };

    this.getDuration = function(){
        return audio.duration;
    };

    this.getCurrentPosition = function(){
        return audio.currentTime;
    };

    this.play = function() {
        audio.play();
        status = MEDIA_STATUS.RUNNING;
    };
    this.pause = function() {
        audio.pause();
        status = MEDIA_STATUS.PAUSED;
    };
    this.stop = function() {
        audio.pause();
        audio.currentTime = 0;
        status = MEDIA_STATUS.STOPPED;
    };
    this.startRecord = function() {
        javascriptNode.onaudioprocess = function(e) {
            addSampleToRecording(e.inputBuffer);
        };
    };
    this.stopRecord = function() {
        javascriptNode.onaudioprocess = null;
    };
    this.playRecord = function() {
        if (recording != null) {
            // create the Buffer from the recording
            audioBuffer = audioContext.createBuffer(1, recording.length, audioContext.sampleRate);
            audioBuffer.getChannelData(0).set(recording, 0);

            // create the Buffer Node with this Buffer
            audioBufferNode = audioContext.createBufferSource();
            audioBufferNode.buffer = audioBuffer;
            console.log('recording buffer length ' + audioBufferNode.buffer.length.toString());

            // connect the node to the destination and play the audio
            audioBufferNode.connect(audioContext.destination);
            audioBufferNode.noteOn(0);
        }
    };
}

_self = module.exports = {

    Media : Media,
    MEDIA_STATUS : MEDIA_STATUS

};
