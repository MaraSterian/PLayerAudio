const fastRewind = document.querySelector("#fastRewind");
const playButton = document.querySelector("#playButton");
const stopButton = document.querySelector("#stop");
const fastForward = document.querySelector("#fastForward");
const waveform = document.querySelector("#waveform");
const volumeIcon = document.querySelector("#volumeIcon");
const volumeSlider = document.querySelector("#volumeSlider");
const pbrSlider = document.querySelector("#pbrSlider");
const pbrValue = document.querySelector("#pbr-value");
const currentTime = document.querySelector("#currentTime");
const totalDuration = document.querySelector("#totalDuration");

let volume;


//var RegionsPlugin = window.WaveSurfer.regions;


const initializeWavesurfer = () => {
    return WaveSurfer.create({
        container: document.querySelector("#waveform"),
        responsive: true,
        height: 80,
        //width: 50,
        waveColor: "indigo",
        progressColor: "purple",
        cursorColor: "navy",

        /*plugins: [
            WaveSurfer.markers.create({
                markers: [
                    {
                        time: 5.5,
                        label: "V1",
                        color: '#ff990a'
                    },
                    {
                        time: 10,
                        label: "V2",
                        color: '#00ffcc',
                        position: 'top'
                    }
                ]
            })
        ]*/

        /*backend: 'MediaElement',
        plugins: [
            window.WaveSurfer.regions.create({
                regionsMinLength: 2,
                regions: [
                    {
                        start: 1,
                        end: 3,
                        loop: false,
                        color: 'hsla(400, 100%, 30%, 0.5)'
                    }, {
                        start: 5,
                        end: 7,
                        loop: false,
                        color: 'hsla(200, 50%, 70%, 0.4)',
                        minLength: 1,
                        drag:true
                    }
                ],
                dragSelection: {
                    slop: 5
                }
            })
        ]*/
    })
}



const skipBackward = () => {
    wavesurfer.skip(-10);
}

const togglePlay = () => {
    wavesurfer.playPause();
    const isPlaying = wavesurfer.isPlaying();
    if (isPlaying) {
        playButton.innerHTML='<i class="fas fa-pause fa-2x"></i>';
    } else {
        playButton.innerHTML='<i class="fas fa-play fa-2x"></i>';
    }
}

const stopPlay = () => {
    wavesurfer.stop();
    playButton.innerHTML='<i class="fas fa-play fa-2x"></i>';
}

const skipForward = () => {
    wavesurfer.skip(+10);
}

const volumeIconChange = e => {
    if(volume = 0) volumeIcon.innerHTML = '<i class="fas fa-volume-mute fa"></i>';
    else if (volume > 0 && volume < 40) volumeIcon.innerHTML = '<i class="fas fa-volume-down fa"></i>';
    else volumeIcon.innerHTML = '<i class="fas fa-volume-up fa"></i>';
}

const handleVolumeChange = e => {
    volume = e.target.value / 100;
    wavesurfer.setVolume(volume);
    localStorage.setItem("audio-player-volume", volume);
}

const setVolumeFromLocalStorage = () => {
    volume = 50;
    //const volume = localStorage.getItem("audio-player-volume") * 100 || 50;
    volumeSlider.value = volume;
}

function outputUpdateVol(vol) {
    document.querySelector('#volumeOutput').value = vol + "%";
}

const handlePbrChange = e => {
    const pbr = e.target.value;
    wavesurfer.setPlaybackRate(pbr);
    pbrValue.innerHTML = pbr;
    localStorage.setItem("audio-player-pbr", pbr);
}

const setPbrFromLocalStorage = () => {
    const pbr = localStorage.getItem("audio-player-prb")  || 1;
    pbrSlider.value = pbr;
    pbrValue.innerHTML = pbr;
}

function outputUpdatePbr(pbRate) {
    document.querySelector('#pbrOutput').value = pbRate + "x";
}

const formatTimecode = seconds => {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}

const toggleMute = () => {
    wavesurfer.toggleMute();
    const isMuted = wavesurfer.getMute();
    if (isMuted) {
        volumeIcon.innerHTML = '<i class="fas fa-volume-mute fa"></i>';
        volumeSlider.disabled = true;
    } else {
        volumeSlider.disabled = false;
        volumeIcon.innerHTML = '<i class="fas fa-volume-up fa"></i>';
    }
}



const wavesurfer = initializeWavesurfer();
wavesurfer.load("WhoWillYouLove.mp3");

window.addEventListener("resize", function(){
    var currentProgress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
    const isPlaying = wavesurfer.isPlaying();
    wavesurfer.empty();
    wavesurfer.drawBuffer();
    wavesurfer.seekTo(currentProgress);
    if (isPlaying) wavesurfer.play();
}, false);

document.getElementById("fileinput").addEventListener('change', function(e){
    var file = this.files[0];
    stopPlay();

    if (file) {
        var reader = new FileReader();

        reader.onload = function (evt) {
            // Create a Blob providing as first argument a typed array with the file buffer
            var blob = new window.Blob([new Uint8Array(evt.target.result)]);

            // Load the blob into Wavesurfer
            wavesurfer.loadBlob(blob);
        };

        reader.onerror = function (evt) {
            console.error("An error ocurred reading the file: ", evt);
        };

        // Read File as an ArrayBuffer
        reader.readAsArrayBuffer(file);
        //showFile(); //todo
    }
}, false);

var RegionsPlugin = window.WaveSurfer.regions;

wavesurfer.addPlugin(RegionsPlugin.create({
    container: document.querySelector('#waveform'),
    regionsMinLength: 2,
    regions: [
        {
            start: 1,
            end: 3,
            loop: false,
            color: 'hsla(400, 100%, 30%, 0.5)'
        }, {
            start: 5,
            end: 7,
            loop: false,
            color: 'hsla(200, 50%, 70%, 0.4)',
            minLength: 1,
            drag:true
        }
    ],
    dragSelection: {
        slop: 5
    }
})).initPlugin('regions');

window.addEventListener("load", setVolumeFromLocalStorage);
volumeIcon.addEventListener("input", volumeIconChange);
//window.addEventListener("load", setPbrFromLocalStorage);
fastRewind.addEventListener("click", skipBackward);
playButton.addEventListener("click", togglePlay);
stopButton.addEventListener("click", stopPlay);
fastForward.addEventListener("click", skipForward);
volumeIcon.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", handleVolumeChange);
pbrSlider.addEventListener("input", handlePbrChange);


//wavesurfer.addPlugin(WaveSurfer.regions());
//wavesurfer.initPlugin('regions');

wavesurfer.on("ready", () => {
    wavesurfer.setVolume(volumeSlider.value / 100);
    const duration = wavesurfer.getDuration();
    totalDuration.innerHTML = formatTimecode(duration);

    wavesurfer.enableDragSelection({});

    var timeline = Object.create(WaveSurfer.Timeline);
    timeline.init({
        wavesurfer: wavesurfer,
        container: '#timeline'
    });

    /*wavesurfer.addRegion({
        start: 2, // time in seconds
        end: 5, // time in seconds
        color: 'hsla(0,0%,0%,0.1)'
    });*/

})

wavesurfer.on("audioprocess", () => {
    const time = wavesurfer.getCurrentTime();
    currentTime.innerHTML = formatTimecode(time);
})

wavesurfer.on("ready", function() {
    // Add a couple of pre-defined regions
    wavesurfer.addRegion({
        id: 1,
        start: 2, // time in seconds
        end: 5, // time in seconds
        color: "hsla(100, 100%, 30%, 0.1)",
        drag: false,
        resize: false
    });

    wavesurfer.addRegion({
        id: 2,
        start: 28,
        end: 36,
        color: "hsla(400, 100%, 30%, 0.1)",
        drag: false,
        resize: false
    });
    wavesurfer.regions.list[1].update({ resize: "true" , drag: "true" });
    wavesurfer.regions.list[2].update({ resize: "true" , drag: "true" });
});

window.Playlist('','');

wavesurfer.on("finish", () => {
    playButton.innerHTML='<i class="fas fa-play fa"></i>';
})



