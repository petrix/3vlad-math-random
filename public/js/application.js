var drumSet = document.querySelector('#drumSet');
var btnPlay = document.querySelector('#btnPlay');
var btnGenRandom = document.querySelector('#btnRandom');
var bpmInput = document.querySelector('#bpm');
var gridRows = document.querySelector('#gridRows');
var gridColumns = document.querySelector('#gridColumns');
var columns = gridColumns.value;
var rows = gridRows.value;
var playbackMode = false;
var instrumentsStyle = document.querySelector('[data="instrumentsStyle"]');
kickArr = [];
var instrumentsList = ['KICK', 'SNARE', 'HI-HAT', 'CRASH', 'RIDE', 'COW-BELL', 'TOM-1', 'TOM-2', 'SPLASH'];
var audioCtx;
var primaryTone = null;
var primaryGain = null;
var secondaryTone;
var outputGain = null;

function makeAudioCtx() {
    try {
        AudioContext = window.AudioContext || window.webkitAudioContext;
        if (audioCtx == undefined) {
            audioCtx = audioCtx || new AudioContext();
            outputGain = audioCtx.createGain();
            outputGain.gain.value = 0.5;
            outputGain.connect(audioCtx.destination);
        }
    } catch (e) {
        // console.warn('Web Audio API is not supported in this browser');
    }
}
makeAudioCtx();



function generateRandom() {
    kickArr = [];
    drumSet.innerHTML = '';
    instrumentsStyle.innerHTML = '';

    for (let x = 0; x < gridRows.value; x++) {
        const rowElem = document.createElement('div');
        rowElem.classList.add(instrumentsList[x] + '-set');
        const spanElem = document.createElement('span');
        spanElem.innerHTML = instrumentsList[x];
        rowElem.appendChild(spanElem);
        const section = document.createElement('section');
        for (let i = 0; i < gridColumns.value; i++) {
            const element = document.createElement('div');
            var rnd = mathRandom();
            if (x == 0) {
                kickArr.push(rnd);
                if (rnd) {
                    element.classList.add(instrumentsList[x] + '-active');
                }
            } else if (x == 1 && !kickArr[i] && rnd) {
                element.classList.add(instrumentsList[x] + '-active');
            } else if (x > 1 && rnd) {
                element.classList.add(instrumentsList[x] + '-active');
            }
            section.appendChild(element);
        }
        console.log(kickArr);
        rowElem.appendChild(section);
        drumSet.appendChild(rowElem);
        instrumentsStyle.innerHTML += `
        .${instrumentsList[x]}-set > section > div{border: 2px solid hsl(${(x*30+180)%360}deg 50% 40% / 80%)}
        .${instrumentsList[x]}-set section div.${instrumentsList[x]}-active{background-color: hsl(${x*30}deg 50% 40% / 80%)}`
    }
}
generateRandom();

var interval;
clearInterval(interval);
var startPos = 0;

function startSet() {
    btnPlay.classList.add('playing');
    playbackMode = true;
    btnPlay.value = 'PAUSE';
    clearInterval(interval);
    startPos = 0;
    interval = setInterval(function () {
        for (let iii = 0; iii < gridRows.value; iii++) {
            document.querySelector("#drumSet").childNodes[iii].childNodes.item(1).childNodes.forEach(item => item.classList.remove('active'));
        }
        for (let iii = 0; iii < gridRows.value; iii++) {
            document.querySelector("#drumSet").childNodes[iii].childNodes.item(1).childNodes[startPos].classList.add('active');
        }
        if (startPos % gridColumns.value <= 0) {
            primaryTone = audioCtx.createOscillator();
            primaryGain = audioCtx.createGain();
            primaryTone.connect(primaryGain);
            primaryTone.type = 'triangle';
            primaryGain.connect(outputGain);
            primaryTone.start(0);
            primaryGain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
        } else {
            primaryTone = audioCtx.createOscillator();
            primaryGain = audioCtx.createGain();
            primaryTone.connect(primaryGain);
            primaryTone.type = 'triangle';
            primaryTone.frequency.value = 300;
            primaryGain.connect(outputGain);
            primaryTone.start(0);
            primaryGain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);

        }
        startPos++;
        startPos %= gridColumns.value;

    }, 60 * 1000 / bpmInput.value);
}
btnGenRandom.onclick = function () {
    generateRandom();
}
btnPlay.onclick = function () {
    if (!playbackMode) {
        startSet();
    } else {
        pushStop();
    }

}
bpmInput.addEventListener('change', () => {
    if (playbackMode) {
        startSet();
    }
});
gridRows.addEventListener('change', () => {
    pushStop();
    if (gridRows.value < 2) {
        gridRows.value = 2;
    }
    generateRandom();
});
gridColumns.addEventListener('change', () => {
    pushStop();
    if (gridColumns.value < 5) {
        gridColumns.value = 5;
    }
    generateRandom();
})

function pushStop() {
    btnPlay.classList.remove('playing');
    clearInterval(interval);
    playbackMode = false;
    btnPlay.value = 'PLAY';
}

function mathRandom() {
    return Math.round(Math.random());
}

document.addEventListener('keyup', keybHandler, false);

function keybHandler(event) {
    var keyPush = event.code.toUpperCase();
    console.log(keyPush);
    switch (keyPush) {
        case 'SPACE':
            if (!playbackMode) {
                startSet();
            } else {
                pushStop();
            }
            break;
        case 'ENTER':
            generateRandom();
            // if (!playbackMode) {
                // startSet();
            // } else {
                // pushStop();
            // }
            break;

        default:
            break;
    }
}