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

const initializeWavesurfer = () => {
    return WaveSurfer.create({
        container: document.querySelector("#waveform"),
        responsive: true,
        height: 80,
        //width: 50,
        waveColor: "indigo",
        progressColor: "purple",
        cursorColor: "navy",
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
    wavesurfer.clearRegions();
}

const skipForward = () => {
    wavesurfer.skip(+10);
}

/*const volumeIconChange = e => {
    if(volume = 0) volumeIcon.innerHTML = '<i class="fas fa-volume-mute fa"></i>';
    else if (volume > 0 && volume < 40) volumeIcon.innerHTML = '<i class="fas fa-volume-down fa"></i>';
    else volumeIcon.innerHTML = '<i class="fas fa-volume-up fa"></i>';
}*/

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
        document.getElementById("volumeIcon").className = "fas fa-volume-mute fa";
        //volumeIcon.innerHTML = '<i class="fas fa-volume-mute fa"></i>';
        volumeSlider.disabled = true;
    } else {
        volumeSlider.disabled = false;
        //volumeIcon.innerHTML = '<i class="fas fa-volume-up fa"></i>';
        document.getElementById("volumeIcon").className = "fas fa-volume-up fa";

    }
}

var audio = new Audio();
var playlist = ["Muse-Uprising.mp3", "PetulaClark-Downtown.mp3", "PetulaClark-CatInTheWindow.mp3", "WhoWillYouLove.mp3"];

const wavesurfer = initializeWavesurfer();
for (var i = 0; i < playlist.length; i++) {
    wavesurfer.load(playlist[i]);
    if (audio.ended === true)
        i++;
    if (i === 3) {
        i = 0;
    }
//wavesurfer.load("WhoWillYouLove.mp3");

    window.addEventListener("resize", function () {
        var currentProgress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
        const isPlaying = wavesurfer.isPlaying();
        wavesurfer.empty();
        wavesurfer.drawBuffer();
        wavesurfer.seekTo(currentProgress);
        if (isPlaying) wavesurfer.play();
    }, false);

    document.getElementById("fileinput").addEventListener('change', function (e) {
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
        interact: false,
        regions: [
            {
                start: 1,
                end: 3,
                loop: false,
                color: 'hsla(400, 100%, 30%, 0.5)'
            }, {
                start: 5,
                end: 7,
                loop: true,
                color: 'hsla(200, 50%, 70%, 0.4)',
                minLength: 1,
                drag: true
            }
        ],
        dragSelection: {
            slop: 5
        }

    })).initPlugin('regions');

    wavesurfer.on('ready', function () {
        wavesurfer.enableDragSelection({});
    });

    function loopIt(file_name,b,e){ // file_name is the name of the mp3
        wavesurfer.clearRegions();
        var region = wavesurfer.addRegion({
            start: b,
            end: e,
            loop: true
        });
        region.play();
        playButton.innerHTML='<i class="fas fa-pause fa-2x"></i>';
    }

    //loopIt("Muse-Uprising.mp3", 10, 60);
    //loopIt("Muse-Uprising.mp3", 100, 120);

    wavesurfer.on('region-click', function(region, e) {
        console.log(region.start);
        console.log(region.end);
        e.stopPropagation();
        //wavesurfer.play(region.start, region.end);
        loopIt("Muse-Uprising.mp3", region.start, region.end);

    });

    window.addEventListener("load", setVolumeFromLocalStorage);
    //volumeIcon.addEventListener("input", volumeIconChange);
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


    window.Playlist('', '');

    wavesurfer.on("finish", () => {
        playButton.innerHTML = '<i class="fas fa-play fa"></i>';
    })

    function downloadBlob(blob, filename) {
        var a = document.createElement('a');
        a.download = filename;
        a.href = blob;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function downloadResource(url) {
        filename = url.split('\\').pop().split('/').pop();
        fetch(url, {
            mode: 'no-cors'
        })
            .then(response => response.blob())
            .then(blob => {
                let blobUrl = window.URL.createObjectURL(blob);
                downloadBlob(blobUrl, filename);
            })
            .catch(e => console.error(e));
    }


}