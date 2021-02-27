(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'
/*eslint-env browser */

module.exports = {
  /**
   * Create a <style>...</style> tag and add it to the document head
   * @param {string} cssText
   * @param {object?} options
   * @return {Element}
   */
  createStyle: function (cssText, options) {
    var container = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style')
    options = options || {}
    style.type = 'text/css'
    if (options.href) {
      style.setAttribute('data-href', options.href)
    }
    if (style.sheet) { // for jsdom and IE9+
      style.innerHTML = cssText
      style.sheet.cssText = cssText
    }
    else if (style.styleSheet) { // for IE8 and below
      style.styleSheet.cssText = cssText
    }
    else { // for Chrome, Firefox, and Safari
      style.appendChild(document.createTextNode(cssText))
    }
    if (options.prepend) {
      container.insertBefore(style, container.childNodes[0]);
    } else {
      container.appendChild(style);
    }
    return style
  }
}

},{}],2:[function(require,module,exports){
var css = "@import url(./css/bender-bold.css);*{box-sizing:border-box;font-family:'Bender-Bold'}body{padding:0;margin:0 auto;width:100%;height:100vh;background:radial-gradient(circle, dimgray 0%, #000a0a 100%);display:flex;flex-direction:column;justify-content:center;align-items:center}input,button{text-decoration:none;background:none;border:none}.active::before{content:\"\";position:absolute;width:100%;height:100%;padding:10px;border-radius:10px;overflow:hidden;background-color:#0005 !important}article#drumSet{display:flex;flex-direction:column}article#drumSet>div{display:flex;flex-direction:row;justify-content:center;align-items:center;height:100px}article#drumSet>div>span{font-size:30px;width:150px}article#drumSet>div>section{display:flex;flex-direction:row}article#drumSet>div>section>div{width:5vw;height:100px;border-radius:10px;position:relative;overflow:hidden}div.controls>input{font-size:30px;width:150px;position:relative}div.controls>#btnPlay{border-radius:10px;overflow:hidden;background-color:darkgreen}div.controls>#btnPlay.playing{background-color:darkmagenta}\n"
module.exports = require('scssify').createStyle(css, {})
},{"scssify":1}],3:[function(require,module,exports){
require('scssify');

require('../css/main.scss');

var app = require('./application');
},{"../css/main.scss":2,"./application":4,"scssify":1}],4:[function(require,module,exports){
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
            }else if (x == 1 && !kickArr[i] && rnd){
                element.classList.add(instrumentsList[x] + '-active');
            }else if (x > 1 && rnd){
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
  
    switch (keyPush) {
        case 'SPACE':
              if (!playbackMode) {
                startSet();
              } else {
                pushStop();
              }
              break;
    
        default:
            break;
    }
}
},{}]},{},[3]);
