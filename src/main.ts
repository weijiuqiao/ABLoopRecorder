import YTPlayerAdaptor from './YTPlayerAdaptor';
import './style.css'
import playSvg from '/play_icon.svg';
import trashSvg from '/trash_icon.svg';
import YouTubeIframeLoader from 'youtube-iframe'
import gsap from 'gsap';
import { Loop, generateLrc } from './lyrcs';
// @ts-ignore
import parseLrc from 'parse.lrc';
// @ts-ignore
import LocaleConfig from './localizations'

import Waveform from './Waveform';
import * as DB from './db';

const FILE_INPUT = 'file_input';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/`
  <div id="container">
    <h2 id="page-title">AB Loop Recorder</h2>
    <div id="youtube-url">
      <input id='ytUrl' type="url" placeholder="YouTube video URL"  />
      <button id="btn-play-yt" type="submit" class="play"><img id="play_icon" src="${playSvg}"/></button>
    </div>
    <div class="input-file-container">
      <input id='${FILE_INPUT}' accept="audio/*,video/*,.lrc" type="file" style="margin:0.7em 0;">
      <p id='filename' style="float:right;font-size:0.8em;margin-right:1.2em"></p>
    </div>

    <div class="media">
    <div id="youtube"></div>
    <video id="video" controls playsinline></video>
    <audio id="audio" controls style="width:97%;display:none;" ></audio>
    </div>

    <div id="lyric" class="lyric">
      <button id="prevLoop">︿</button>
      <div id="lyric-ab">
        <input id="lyric-a" class="lyric-a" type="text" placeholder="A" value="0:11.495"/>
        <label>-</label>
        <input id="lyric-b" class="lyric-b" type="text" placeholder="B" value="20:11.495"/>
      </div>
      <button id="deleteLoop" class="play"><img class="delete-lyric" src='${trashSvg}'/></button>
      <input id="lyric-t" class="lyric-t" type="text" placeholder="..." value="this is insane"/>
      <p id='lyric-p' class='lyric-p'></p>
      <button id="playLoop" class="play lyric-play"><img class="play-lyric" src="${playSvg}"/></button>
      <button id="nextLoop">﹀</button>
    </div>
    <canvas id="waveform"></canvas>
    <div id="progress-container">
      <div id="progress-bar" class="progress-bar"></div>
    </div>

    <div class="controls">
      <button id='leftMeta'><svg version="1.1" id="bwd2" class='svg' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 99.73" style="enable-background:new 0 0 122.88 99.73" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><polygon class="st0" points="15.71,58.97 68.66,99.73 68.66,58 122.88,99.73 122.88,5.08 68.66,46.17 68.66,5.08 15.71,45.21 15.71,0 0,0 0,93.23 15.71,93.23 15.71,58.97"/></g></svg></button>
      <button id='left'><svg version="1.1" id="backward-icon" class='svg' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 100.11" style="enable-background:new 0 0 122.88 100.11" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><polygon class="st0" points="0,49.67 65.54,100.11 65.54,55.97 122.88,100.11 122.88,0 65.54,43.46 65.54,0 0,49.67"/></g></svg></button>
      <button id='center'><svg class='svg' id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 74.82"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>play-pause</title><path class="cls-1" d="M51.93,43.9c5.49-3.55,5.47-7.5,0-10.64L9,1.86C4.55-.94-.12.71,0,6.55L.18,68.23c.38,6.34,4,8.07,9.33,5.14L51.93,43.9ZM105.84,0h13.1a4,4,0,0,1,3.94,3.94V70.88a4,4,0,0,1-3.94,3.94h-13.1a4,4,0,0,1-3.94-3.94V3.94A4,4,0,0,1,105.84,0ZM71.94,0H85A4,4,0,0,1,89,3.94V70.88A4,4,0,0,1,85,74.82H71.94A4,4,0,0,1,68,70.88V3.94A4,4,0,0,1,71.94,0Z"/></svg></button>
      <button id='right'><svg version="1.1" class='svg' id="fwd" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 100.11" style="enable-background:new 0 0 122.88 100.11" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><polygon class="st0" points="122.88,49.67 57.34,100.11 57.34,55.97 0,100.11 0,0 57.34,43.46 57.34,0 122.88,49.67"/></g></svg></button>
      <button id='rightMeta'><svg version="1.1" id="fwd2" class='svg' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 96.93" style="enable-background:new 0 0 122.88 96.93" xml:space="preserve"><style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><polygon class="st0" points="107.61,0 122.88,0 122.88,90.62 107.61,90.62 107.61,54.67 52.7,96.93 52.7,56.37 0,96.93 0,4.93 52.7,44.87 52.7,4.93 107.61,46.55 107.61,0"/></g></svg></button>
      <br/>
      <button id='A'>A</button>
      <button id='B'>B</button>
      <button id='R' class=''><u>R</u>ecord</button>
      <button id='autoRecord'>Auto record</button>
      <br/>
      <button id='S'><u>S</u>ave loop</button>
      <button id='E'><u>E</u>dit loop</button>
      <button id='D'><u>D</u>ownload lyrics</button>
    </div>

    <p class="read-the-docs">
    ↑: previous loop. ↓: next loop. ⏎: play loop. ⌫: delete loop(long press trash icon to purge).
    <br/>All info stays locally on your computer. No data will be uploaded.
    <br/>Chrome or Firefox recommended. Source code at <a href="https://github.com/weijiuqiao/ABLoopRecorder">Github</a>.
    </p>
  </div>
`
const HIGHLIGHT = 'highlight';
const NOT_AUTO_RECORD = 'notAutoRecord';
const DISABLED = "disabled"

window.onload = () => {
  new App();
}

enum State {
  NoMedia = "NoMedia",
  Loaded = "Loaded",
  A = "A",
  Looping = "Looping",
}

enum Op {
  A = "A", B = "B", R = "R", S = "S", E = "E", D = "D",
  Left = "Left", LeftMeta = "LeftMeta",
  Right = "Right", RightMeta = "RightMeta",
}


class App {
  video = document.getElementById("video") as HTMLVideoElement;
  audio = document.getElementById("audio") as HTMLAudioElement;
  ytUrl = document.getElementById('ytUrl') as HTMLInputElement;

  btnPlayYT = document.getElementById('btn-play-yt')!;

  btnA = document.getElementById("A")!;
  btnB = document.getElementById("B")!;
  btnR = document.getElementById("R")!;
  btnAutoRecord = document.getElementById("autoRecord")!;
  btnS = document.getElementById("S")!;
  btnD = document.getElementById("D")!;
  btnE = document.getElementById("E")!;
  btnLeft = document.getElementById("left")!;
  btnRight = document.getElementById("right")!;
  btnCenter = document.getElementById("center")!;
  btnLeftMeta = document.getElementById("leftMeta")!;
  btnRightMeta = document.getElementById("rightMeta")!;

  /** lyric */
  btnPrevLoop = document.getElementById("prevLoop")!;
  btnNextLoop = document.getElementById("nextLoop")!;
  btnPlayLoop = document.getElementById("playLoop")!;
  btnDeleteLoop = document.getElementById("deleteLoop")!;

  progress = document.getElementById('progress-bar')!;

  cardLyrics = document.getElementById("lyric")!;
  lyricA = document.getElementById("lyric-a")! as HTMLInputElement;
  lyricB = document.getElementById("lyric-b")! as HTMLInputElement;
  lyricP = document.getElementById("lyric-p")!;
  lyricDelete = document.getElementById("deleteLoop")!;
  lyricText = document.getElementById("lyric-t")! as HTMLInputElement;
  lyricPlay = document.getElementById("playLoop")!;
  lyricPrev = document.getElementById("prevLoop")!;
  lyricNext = document.getElementById("nextLoop")!;

  inputFile = document.getElementById(FILE_INPUT) as HTMLInputElement;

  isAutoRecord = localStorage.getItem(NOT_AUTO_RECORD) !== `${true}`;
  canRecord = true;
  isRecording = false;
  state = State.NoMedia;

  filename?: string = localStorage.getItem("filename") ?? undefined;

  loops: Loop[] = [];
  loopIndex = 0;
  currentLoop: Loop = {
    start: 0,
    end: 0,
    content: "",
  }
  private _waveform?: Waveform;
  get waveform() {
    if (!this._waveform)
      this._waveform = new Waveform(document.getElementById("waveform") as HTMLCanvasElement);
    return this._waveform;
  }

  recordedAudio?: HTMLAudioElement;
  constructor() {
    this.setAutoRecord(this.isAutoRecord);
    // this.loadYTPlayer();
    this.setOnclicks();
    this.setEvents();
    this.setKeyInput();
    this.initState();
    this.retrieveLoops();
    this.retrieveMedia();
    this.localize();

    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || typeof MediaRecorder === 'undefined') {
      this.canRecord = false;
      this.setAutoRecord(false);
      this.btnAutoRecord.setAttribute(DISABLED, 'true');
      this.isAutoRecord = false;
      setTimeout(() => {
        alert(this.recordingUnSupported)
      }, 600);
    } else {
      this.recordedAudio = new Audio();
    }
  }

  setOnclicks() {
    this.btnPlayYT.onclick = () => {
      this.btnPlayYT.blur();
      document.getElementById("youtube")!.style.display = "inherit";
      if (this.ytPlayer) this.ytPlayer.src = this.ytUrl.value;
      this.pause();
      this.stopLooping();
      this.activePlayer = this.ytPlayer;
      this.video.style.display = 'none';
      this.audio.style.display = 'none';
      document.getElementById('waveform')!.style.height = '0';
      document.getElementById('filename')!.innerText = '';
      this.filename = "YouTube_video";
      this.updateState(State.Loaded);
    }
    this.btnA.onclick = () => {
      this.btnA.blur();
      this.pressA();
    }
    this.btnB.onclick = () => {
      this.btnB.blur();
      this.pressB();
    }
    this.btnR.onclick = () => {
      this.btnR.blur();
      this.pressR();
    }
    this.btnAutoRecord.onclick = () => {
      this.btnAutoRecord.blur();
      this.setAutoRecord(!this.isAutoRecord);
    }
    this.btnS.onclick = () => {
      this.btnS.blur();
      this.pressS();
    }
    this.btnE.onclick = () => {
      this.btnE.blur();
      this.pressE();
    }
    this.btnD.onclick = () => {
      this.btnD.blur();
      this.pressD();
    }
    this.btnLeft.onclick = () => {
      this.btnLeft.blur();
      this.pressBtnLeft();
    }
    this.btnLeftMeta.onclick = () => {
      this.btnLeftMeta.blur();
      this.pressBtnLeft(true);
    }
    this.btnCenter.onclick = () => {
      this.btnCenter.blur();
      this.pressPlayPause();
    }
    this.btnRight.onclick = () => {
      this.btnRight.blur();
      this.pressBtnRight();
    }
    this.btnRightMeta.onclick = () => {
      this.btnRightMeta.blur();
      this.pressBtnRight(true);
    }
    this.btnPrevLoop.onclick = () => {
      this.btnPrevLoop.blur();
      this.pressBtnUp();
    }
    this.btnNextLoop.onclick = () => {
      this.btnNextLoop.blur();
      this.pressBtnDown();
    }
    this.btnPlayLoop.onclick = () => {
      this.btnPlayLoop.blur();
      this.pressLoopPlay();
    }

    this.setDeleteLongPress();
  }

  pressTimer?: number;
  longPress = false;
  setDeleteLongPress() {
    let button = this.btnDeleteLoop;

    button.addEventListener('mousedown', () => {
      this.pressTimer = window.setTimeout(() => {
        this.longPress = true;
        if (confirm("Delete all loops?")) {
          this.loops.length = 0;
          this.updateLyricCard();
          DB.removeAllLoops();
        }
      }, 1000);
    });

    button.addEventListener('mouseup', () => {
      clearTimeout(this.pressTimer);
    });

    button.addEventListener('mouseleave', () => {
      clearTimeout(this.pressTimer);
    });

    button.addEventListener('touchstart', () => {
      this.pressTimer = window.setTimeout(() => {
        this.longPress = true;
        if (confirm("Delete all loops?")) {
          this.loops.length = 0;
          this.updateLyricCard();
          DB.removeAllLoops();
        }
      }, 1000);
    });

    button.addEventListener('touchend', () => {
      clearTimeout(this.pressTimer);
    });

    button.addEventListener('click', (event) => {
      if (this.longPress) {
        event.preventDefault();
        this.longPress = false;
      } else {
        this.btnDeleteLoop.blur();
        this.pressLoopDelete();
      }
    });

  }

  setAutoRecord(isAuto: boolean) {
    this.isAutoRecord = isAuto;
    if (isAuto) {
      this.btnAutoRecord.classList.add(HIGHLIGHT);
    } else {
      this.btnAutoRecord.classList.remove(HIGHLIGHT);
    }
    localStorage.setItem(NOT_AUTO_RECORD, `${!isAuto}`)
  }

  lyricAPreviousValue?: number;
  setEvents() {
    this.onMediaLoaded = this.onMediaLoaded.bind(this);
    this.onLoadError = this.onLoadError.bind(this);
    this.video.addEventListener("progress", this.onMediaLoaded);
    this.video.addEventListener("error", this.onLoadError);
    this.audio.addEventListener("error", this.onLoadError);

    this.startDrawing = this.startDrawing.bind(this);
    this.stopDrawing = this.stopDrawing.bind(this);
    this._startLooping = this._startLooping.bind(this);

    this.video.onmousedown = eve => eve.preventDefault();
    this.audio.onmousedown = eve => eve.preventDefault();

    // Local media
    this.inputFile.addEventListener("change", () => {
      this.inputFile.blur();

      let file = this.inputFile.files?.[0];
      if (!file) return;
      let filename = file.name;
      this.filename = filename.split('.').slice(0, -1).join('.');
      localStorage.setItem("filename", this.filename);
      let extension = filename.split('.').pop()?.toLowerCase();
      if (extension === "lrc") {
        let reader = new FileReader();
        reader.onload = (event) => {
          let content = event.target?.result;
          if (content) {
            const lrc = parseLrc(content);
            this.insertLrc(lrc);
          }
        };
        reader.readAsText(file);
        return;
      }

      if (file.size / 1000000 < 50) {
        DB.saveMedia(file);
      } else {
        DB.removeMedia();
      }
      document.getElementById('filename')!.innerText = "";
      this.waveform.extract(this.inputFile.files![0]);
      this.video.src = URL.createObjectURL(this.inputFile.files![0]);
    });

    this.lyricText.addEventListener('input', () => {
      this.currentShowingLoop.content = this.lyricText.value;
    })

    this.lyricText.addEventListener('change', () => {
      DB.updateLoop(this.currentShowingLoop);
    })

    this.lyricA.addEventListener('input', () => {
      const parsed = Number(this.lyricA.value);
      if (!Number.isNaN(parsed)) {
        this.currentShowingLoop.start = parsed;
      }
    })

    this.lyricA.addEventListener('change', () => {
      if (Number.isNaN(Number(this.lyricA.value))) return;
      if (this.lyricAPreviousValue !== undefined) {
        DB.deleteSaveLoop(this.lyricAPreviousValue, this.currentShowingLoop);
      } else {
        DB.saveLoop(this.currentShowingLoop);
      }
      this.lyricAPreviousValue = Number(this.lyricA.value);
    })

    this.lyricB.addEventListener('input', () => {
      const parsed = Number(this.lyricB.value);
      if (!Number.isNaN(parsed)) {
        this.currentShowingLoop.end = parsed;
      }
    })

    this.lyricB.addEventListener('change', () => {
      DB.saveLoop(this.currentShowingLoop);
    })

  }

  get currentShowingLoop() {
    this.loopIndex = Math.min(this.loopIndex, this.loops.length - 1);
    return this.loops[this.loopIndex];
  }

  ytPlayer?: YTPlayerAdaptor;
  loadYTPlayer() {
    if (!this.ytPlayer) {
      YouTubeIframeLoader.load((YT) => {
        this.ytPlayer = new YTPlayerAdaptor(YT);
        const container = document.getElementById("youtube-url")!;
        container.style.height = 'auto';
        container.style.visibility = 'visible';
      });
    }
  }

  setKeyInput() {
    document.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (active?.nodeName === 'INPUT') {
        switch (e.key) {
          case 'Enter':
          case 'Escape': (active as any).blur(); break;
          default: break;
        }
        if (active.id !== FILE_INPUT) return;
      }
      if (e.key == ' ' && e.target == document.body) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'a': this.pressA(); break;
        case 'b': this.pressB(); break;
        case 'r': this.pressR(); break;
        case 's': this.pressS(); break;
        case 'e': this.pressE(); break;
        case 'd': this.pressD(); break;
        case ' ': this.pressPlayPause(); break;
        case 'ArrowLeft': this.pressBtnLeft(e.shiftKey); break;
        case 'ArrowRight': this.pressBtnRight(e.shiftKey); break;
        case 'ArrowUp': this.pressBtnUp(); break;
        case 'ArrowDown': this.pressBtnDown(); break;
        case 'Enter': this.pressLoopPlay(); break;
        case 'Backspace': this.pressLoopDelete(); break;
      };
    })
  }
  activePlayer?: HTMLVideoElement | HTMLAudioElement | YTPlayerAdaptor;
  onMediaLoaded() {
    const yt = document.getElementById("youtube");
    if (yt) {
      yt.style.display = 'none';
      document.getElementById('waveform')!.style.height = '';
    }
    this.pause();
    this.stopLooping();
    if (this.video.duration > 0 && this.video.videoWidth === 0) {
      //audio
      this.audio.src = this.video.src;
      this.audio.style.display = "inherit";
      this.video.style.display = "none";
      this.activePlayer = this.audio;
    } else if (this.video.duration > 0) {
      this.video.style.display = "inherit";
      this.audio.style.display = "none";
      this.activePlayer = this.video;
    }
    this.updateState(State.Loaded);
    this.inputFile.blur();
  }

  onLoadError(e: any) {
    alert(this.cannotPlayMediaAt + ` ${e.srcElement.currentSrc}`);
    this.activePlayer = undefined;
  }

  pressTimeouts: { [key: string]: number } = {};
  pressEffect(element: HTMLElement) {
    if ((element.attributes as any)[DISABLED]) {
      return;
    }
    clearTimeout(this.pressTimeouts[element.id]);
    element.classList.add(HIGHLIGHT);
    this.pressTimeouts[element.id] = setTimeout(() => {
      element.classList.remove(HIGHLIGHT);
    }, 100);
    return true;
  }

  pressA() {
    if (this.pressEffect(this.btnA))
      this.operate(Op.A);
  }

  pressB() {
    this.pressEffect(this.btnB) && this.operate(Op.B);
  }

  pressR() {
    this.pressEffect(this.btnR) && this.operate(Op.R);
  }

  pressS() {
    this.pressEffect(this.btnS) && this.operate(Op.S);
  }

  pressD() {
    this.pressEffect(this.btnD) && this.operate(Op.D);
  }
  pressE() {
    // this.pressEffect(this.btnE) && this.operate(Op.E);
    this.pressEffect(this.btnE) && this.fireEOp();

  }

  pressBtnLeft(isMeta: boolean = false) {
    this.pressEffect(isMeta ? this.btnLeftMeta : this.btnLeft) &&
      this.seek(isMeta ? Op.LeftMeta : Op.Left);

  }

  pressBtnRight(isMeta: boolean = false) {
    this.pressEffect(isMeta ? this.btnRightMeta : this.btnRight) &&
      this.seek(isMeta ? Op.RightMeta : Op.Right);

  }

  pressPlayPause() {
    this.pressEffect(this.btnCenter) &&
      this.playPause();
  }

  pressBtnUp() {
    if (this.loops.length === 0) return;
    this.pressEffect(this.btnPrevLoop);
    if (this.loopIndex > 0) {
      this.loopIndex--;
      this.updateLyricCard();
    }
  }

  pressBtnDown() {
    if (this.loops.length === 0) return;
    this.pressEffect(this.btnNextLoop);
    if (this.loopIndex < this.loops.length - 1) {
      this.loopIndex++;
      this.updateLyricCard();
    }
  }

  pressLoopPlay() {
    if (this.loops.length === 0) return;
    this.pressEffect(this.btnPlayLoop);
    const showing = this.currentShowingLoop;
    this.currentLoop = {
      start: showing.start,
      end: showing.end,
      content: "",
    }
    this.updateState(State.Looping);
    this.audioBlob = undefined;
    if (this.recordedAudio && this.recordedAudio.paused) {
      if (this.activePlayer?.paused) {
        this.play();
      }
    } else if (!this.recordedAudio) {
      if (this.activePlayer?.paused) {
        this.play();
      }
    }
    this.startLooping();
  }

  pressLoopDelete() {
    this.loopIndex = Math.min(this.loops.length - 1, Math.max(0, this.loopIndex));
    const deleted = this.loops.splice(this.loopIndex, 1);
    this.updateLyricCard();
    DB.deleteLoop(deleted[0]);
  }

  playPause() {
    if (this.isRecording || !this.activePlayer) return;
    if (this.audioBlob && this.recordedAudio) {
      if (!this.recordedAudio.paused) {
        this.recordedAudio.pause();
        return;
      } else if (this.activePlayer.currentTime >= this.currentLoop.end) {
        this.recordedAudio.play();
        return;
      }
    }

    if (document.activeElement === this.activePlayer) {
      this.activePlayer.blur();
    }
    if (this.activePlayer.paused) {
      this.play();
      if (this.state === State.Looping) {
        this.startLooping();
      }
    } else {
      this.pause()
    }
  }

  seek(op: Op) {
    switch (op) {
      case Op.Left: this.activePlayer!.currentTime -= 1; break;
      case Op.LeftMeta: this.activePlayer!.currentTime -= 5; break;
      case Op.Right: this.activePlayer!.currentTime += 1; break;
      case Op.RightMeta: this.activePlayer!.currentTime += 5; break;
    }
    if (this.state === State.Looping) {
      this.activePlayer!.currentTime = Math.min(this.currentLoop.end, Math.max(this.currentLoop.start, this.activePlayer!.currentTime))
    }
    this.drawOneFrame({ animate: true });
  }

  get YTactive() {
    return this.activePlayer === this.ytPlayer;
  }

  play() {
    this.activePlayer?.play();
    if (!this.YTactive && this.activePlayer) {
      this.stoppedDrawing = false;
      this.startDrawing();
    }
  }

  pause() {
    this.activePlayer?.pause();
    if (!this.YTactive && this.activePlayer) {
      this.stopDrawing();
    }
  }

  insertLrc(lrc: any) {
    if (this.loops.length === 0 || confirm("Replace saved loops?")) {
      this.loops.length !== 0 && DB.removeAllLoops();
      this.loops.length = 0;
      for (let i = 0; i < lrc.lrcArray.length; i++) {
        const info = lrc.lrcArray[i];
        const next = lrc.lrcArray[i + 1];
        this.loops.push({
          start: Number(info.timestamp),
          end: Number(next?.timestamp ?? info.timestamp),
          content: info.lyric
        })
      }
      DB.saveLoops(this.loops);
      this.updateLyricCard();
    }
  }

  retrieveLoops() {
    DB.retrieveLoops(loops => {
      this.loops = loops;
      this.updateLyricCard();
    });
  }

  retrieveMedia() {
    DB.retreiveMedia()
      .then((blob) => {
        if (!blob) return;
        this.waveform.extract(blob as File);
        this.video.src = URL.createObjectURL(blob as File);
        let filename = (blob as File).name;
        this.filename = filename.split('.').slice(0, -1).join('.');
        document.getElementById('filename')!.innerText = filename;
      })
  }
  /*** State */
  initState() {
    this.updateLyricCard();

    this.btnLeftMeta.setAttribute(DISABLED, 'true');
    this.btnLeft.setAttribute(DISABLED, 'true');
    this.btnCenter.setAttribute(DISABLED, 'true');
    this.btnRightMeta.setAttribute(DISABLED, 'true');
    this.btnRight.setAttribute(DISABLED, 'true');

    [this.btnA, this.btnB, this.btnR, this.btnS].forEach((b) => {
      b.setAttribute(DISABLED, 'true');
    })
  }

  stError(state: State) {
    console.error(`update state from ${this.state} to ${state}`)
  }
  updateState(state: State) {
    switch (this.state) {
      case State.NoMedia:
        switch (state) {
          case State.Loaded: this.updateToLoaded(); break;
          case State.Looping: break;
          default: this.stError(state);
        }
        break;
      case State.Loaded:
        switch (state) {
          case State.Loaded: break;
          case State.A: this.updateToAState(); break;
          case State.Looping: this.updateToLoopState(); break;
          default: this.stError(state);
        }
        break;
      case State.A:
        switch (state) {
          case State.Looping: this.updateToLoopState(); break;
          default: this.stError(state);
        }
        break;
      case State.Looping:
        switch (state) {
          case State.Loaded: this.stopLooping(); this.updateToLoaded(); break;
          case State.Looping: break;
          default: this.stError(state);
        }
        break;
      default: this.stError(state);
    }
    this.state = state;
  }

  updateToLoaded() {
    [this.btnLeft, this.btnLeftMeta, this.btnCenter, this.btnRight, this.btnRightMeta, this.btnA].forEach(b => {
      b.removeAttribute(DISABLED);
    });
    this.btnA.textContent = "A";
    [this.btnS, this.btnR].forEach(b => b.setAttribute(DISABLED, 'true'))
  }

  updateToAState() {
    [this.btnB].forEach(b => {
      b.removeAttribute(DISABLED);
    })
    this.canRecord && this.btnR.removeAttribute(DISABLED);
  }

  updateToLoopState() {
    this.btnB.setAttribute(DISABLED, 'true');
    [this.btnA, this.btnS, this.btnLeft, this.btnCenter, this.btnLeftMeta, this.btnRight, this.btnRightMeta]
      .forEach(b => b.removeAttribute(DISABLED));
    this.canRecord && this.btnR.removeAttribute(DISABLED);
    this.btnA.textContent = "Abort";
  }

  updateToRecording() {
    this.initState();
  }


  updateLyricCard() {
    // Show/hide card
    if (this.loops.length > 0 && this.cardLyrics.style.visibility === "hidden") {
      this.cardLyrics.style.visibility = "visible";
      this.cardLyrics.style.height = 'auto';
      this.cardLyrics.style.margin = '1em 0 0.5em 0';
    } else if (this.loops.length === 0 && this.cardLyrics.style.visibility !== "hidden") {
      this.cardLyrics.style.visibility = "hidden";
      this.cardLyrics.style.height = '0';
      this.cardLyrics.style.margin = '0';
    }
    if (this.loops.length > 0) {
      this.btnD.removeAttribute(DISABLED);
      this.btnE.removeAttribute(DISABLED);
    } else {
      this.btnD.setAttribute(DISABLED, "true");
      this.btnE.setAttribute(DISABLED, "true");
    }

    if (this.loops.length === 0) return;

    if (this.loopIndex >= this.loops.length) {
      this.loopIndex = this.loops.length - 1;
    }
    const loop = this.loops[this.loopIndex]

    this.lyricAPreviousValue = loop.start;
    this.lyricA.value = `${loop.start}`;
    this.lyricB.value = `${loop.end}`;
    this.lyricText.value = `${loop.content}`;

    if (this.loopIndex === 0) {
      this.btnPrevLoop.setAttribute(DISABLED, 'true');
    } else {
      this.btnPrevLoop.removeAttribute(DISABLED);
    }

    if (this.loopIndex === this.loops.length - 1) {
      this.btnNextLoop.setAttribute(DISABLED, 'true');
    } else {
      this.btnNextLoop.removeAttribute(DISABLED);
    }

    this.lyricP.innerText = `${this.loopIndex + 1}/${this.loops.length}`;

  }


  /** operation */
  opError(op: Op) {
    console.error(`Operate ${op} on ${this.state}`);
  }
  operate(op: Op) {
    switch (this.state) {
      case State.NoMedia:
        switch (op) {
          case Op.D: this.fireDOp(); break;
          default: this.opError(op);
        }
        break;
      case State.Loaded:
        switch (op) {
          case Op.A: this.updateState(State.A); this.fireAOp(); break;
          default: this.opError(op);
        }
        break;
      case State.A:
        switch (op) {
          case Op.A: this.fireAOp(); break;
          case Op.B: this.updateState(State.Looping); this.fireBOp(!this.isAutoRecord); this.isAutoRecord && this.fireROp(); break;
          case Op.R: this.updateState(State.Looping); this.fireBOp(false); this.fireROp(); break;
          default: this.opError(op);
        }
        break;
      case State.Looping:
        switch (op) {
          case Op.A: this.stopLooping(); this.updateState(State.Loaded); this.abortAB(); break;
          case Op.R: this.fireROp(); break;
          case Op.S: this.fireSOp(); break;
          case Op.E: this.fireEOp(); break;
          case Op.D: this.fireDOp(); break;
          default: this.opError(op);
        }
        break;
      default: this.opError(op);
    }
  }

  fireAOp() {
    this.play()
    this.currentLoop.start = Math.round(this.activePlayer!.currentTime * 100000) / 100000;
    this.audioBlob = undefined;
  }

  fireBOp(startLooping: boolean = true) {
    this.currentLoop.end = Math.round(this.activePlayer!.currentTime * 100000) / 100000;
    startLooping && this.startLooping();
  }

  fireROp() {
    if (this.currentLoop.end - this.currentLoop.start < 0.5) return;
    this.stopLooping();
    this.activePlayer!.currentTime = this.currentLoop.end;
    this.pause();
    this.updateToRecording();
    this.drawOneFrame({ time: this.currentLoop.end });
    this.isRecording = true;
    this.recordAudio(() => {
      this.isRecording = false;
      this.updateToLoopState();
      this.startPlayingRecording();
    })
  }

  fireSOp() {
    // Insert loop
    for (let i = 0; i < this.loops.length; i++) {
      const loop = this.loops[i];
      if (loop.start > this.currentLoop.start) break;
      if (loop.start === this.currentLoop.start && loop.end === this.currentLoop.end) {
        this.btnS.setAttribute(DISABLED, "true");
        return;
      }
    }
    this.loops.push(this.currentLoop);
    DB.saveLoop(this.currentLoop);
    this.lyricAPreviousValue = this.currentLoop.start;

    this.loops.sort((a, b) => { return a.start - b.start })
    this.loopIndex = this.loops.indexOf(this.currentLoop);
    this.currentLoop = {
      start: this.currentLoop.start,
      end: this.currentLoop.end,
      content: '',
    }
    this.updateLyricCard();
    this.btnS.setAttribute(DISABLED, "true");
    this.fireEOp();
  }

  fireDOp() {
    generateLrc(this.loops, this.filename ?? "ABLoopRecorder");
  }

  fireEOp() {
    setTimeout(() => {
      this.lyricText.focus();
    }, 500);
  }

  abortAB() {
    this.audioBlob = undefined;
    this.drawOneFrame();
  }

  audioBlob?: Blob;
  animation = {
    value: 0
  }
  recordAudio(completion: () => void) {
    this.audioBlob = undefined;
    this.recordedAudio?.pause();

    const speed = this.activePlayer?.playbackRate ?? 1;

    let recorder: MediaRecorder;
    let audioBlobs: Blob[] = [];
    let stream: MediaStream;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(streamIn => {
        stream = streamIn;
        recorder = new MediaRecorder(stream);
        audioBlobs.length = 0;
        recorder.addEventListener("dataavailable", e => {
          audioBlobs.push(e.data);
        })
        recorder.start();
      }).then(() => {
        //start recording
        const duration = (this.currentLoop.end - this.currentLoop.start) / speed * 1000 + 500;
        gsap.killTweensOf(this.animation);
        this.progress.style.transition = "all 0.02s";
        gsap.to(this.animation, {
          value: 100,
          onUpdate: () => {
            this.progress.style.width = `${this.animation.value}%`
          },
          duration: duration / 1000,
        })
        setTimeout(() => {
          //stop recording
          let mimeType = recorder.mimeType;
          recorder.addEventListener("stop", () => {
            this.audioBlob = new Blob(audioBlobs, { type: mimeType });
            this.recordedAudio!.src = URL.createObjectURL(this.audioBlob);
            completion();
          }, { once: true });
          gsap.killTweensOf(this.animation);
          this.animation.value = 0;
          this.progress.style.transition = "all 0.2s";
          this.progress.style.width = '0%';
          recorder.stop();
          stream.getTracks().forEach(t => t.stop());
        }, duration);
      }).catch(error => {
        alert(this.errorAlert + ` ${error.message}`);
        completion();
      })
  }

  /** loop */
  loopingId?: number;
  stoppedLooping = false;
  startLooping() {
    this.stoppedLooping = false;
    this._startLooping();
  }

  _startLooping() {
    if (this.activePlayer && !this.activePlayer.paused && this.activePlayer.currentTime >= this.currentLoop.end) {
      if (this.audioBlob && this.recordedAudio) {
        this.stopLooping();
        this.activePlayer.currentTime = this.currentLoop.end;
        this.pause();
        this.startPlayingRecording();
      } else {
        this.activePlayer.currentTime = this.currentLoop.start;
      }
    } else if (this.activePlayer && this.activePlayer.currentTime < this.currentLoop.start) {
      this.activePlayer.currentTime = this.currentLoop.start;
    }
    if (!this.stoppedLooping) this.loopingId = requestAnimationFrame(this._startLooping);
  }

  startPlayingRecording() {
    if (this.recordedAudio) this.recordedAudio.currentTime = 0;
    this.recordedAudio?.play();

    this.recordedAudio?.addEventListener("ended", () => {
      if (this.activePlayer) {
        if (this.state === State.Looping) {
          this.activePlayer.currentTime = this.currentLoop.start;
          this.play();
          this.startLooping();
        } else if (!this.isRecording) {
          this.play();
        }
      }
    }, { once: true });
  }

  stopLooping() {
    this.loopingId && cancelAnimationFrame(this.loopingId);
    this.loopingId = undefined;
    this.stoppedLooping = true;
  }

  animationId?: number;
  stoppedDrawing = false;
  startDrawing() {
    this.drawOneFrame({ forceStop: this.state === State.A });
    if (!this.stoppedDrawing) this.animationId = requestAnimationFrame(this.startDrawing);
  }

  drawOneFrame(pr: { time?: number, animate?: boolean, forceStop?: boolean } = {}) {
    if (this.activePlayer && this.activePlayer !== this.ytPlayer) {
      const loop = (this.state === State.Looping || this.state === State.A) ? this.currentLoop : undefined;
      this.waveform.draw({
        at: pr.time ?? this.activePlayer.currentTime,
        loop,
        hasEnd: this.state !== State.A,
        animate: pr.animate,
        forceStop: pr.forceStop,
      });
    }
  }

  stopDrawing() {
    this.drawOneFrame();
    this.animationId && cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
    this.stoppedDrawing = true;
  }

  /** localization */
  recordingUnSupported = "Recording feature not supported by browser.";
  cannotPlayMediaAt = "Cannot play media at:";
  errorAlert = "Error:"
  localize() {
    const cfg = LocaleConfig[navigator.language.toLowerCase()];
    if (!cfg) return;
    document.documentElement.lang = navigator.language;
    if (cfg.title) document.getElementById("page-title")!.innerText = cfg.title;
    if (cfg.ytUrlPlaceholder) this.ytUrl.placeholder = cfg.ytUrlPlaceholder;
    if (cfg.btnR) this.btnR.innerHTML = cfg.btnR;
    if (cfg.btnAutoRecord) this.btnAutoRecord.innerHTML = cfg.btnAutoRecord;
    if (cfg.btnS) this.btnS.innerHTML = cfg.btnS;
    if (cfg.btnE) this.btnE.innerHTML = cfg.btnE;
    if (cfg.btnD) this.btnD.innerHTML = cfg.btnD;
    if (cfg.docs) document.getElementsByClassName("read-the-docs")[0].innerHTML = cfg.docs;
    if (cfg.recordingUnSupported) this.recordingUnSupported = cfg.recordingUnSupported;
    if (cfg.cannotPlayMediaAt) this.cannotPlayMediaAt = cfg.cannotPlayMediaAt;
    if (cfg.error) this.errorAlert = cfg.error;

  }

}