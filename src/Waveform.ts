import { Loop } from "./lyrcs";

const scaleFactor = window.devicePixelRatio;

export default class Waveform {
  static interval = 0.02; // interval in seconds
  canvas: HTMLCanvasElement;
  ctx?: AudioContext;
  amplitudes: number[] = [];
  amplitudes2: number[] = [];
  numberOfChannels = 1;
  canvasCtx?: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;


    canvas.width = Math.ceil(canvas.clientWidth * scaleFactor);
    canvas.height = Math.ceil(canvas.clientHeight * scaleFactor);

    // canvas.style.width = `${canvas.width/2}px`;
    // canvas.style.height = `${canvas.height/2}px`;

    this.canvasCtx = this.canvas.getContext('2d') ?? undefined;
    this.canvasCtx?.scale(scaleFactor, scaleFactor);
    this.startAnimation = this.startAnimation.bind(this);
  }

  extract(file: File) {
    this.amplitudes.length = 0;
    this.amplitudes2.length = 0;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;

        if (!this.ctx) {
          const AudioContexty = window.AudioContext || (window as any).webkitAudioContext;
          this.ctx = new AudioContexty();
        }
        this.ctx.decodeAudioData(data as any, (buffer)=> {
            this.numberOfChannels = Math.min(buffer.numberOfChannels, 2);
            for (let channel = 0; channel < this.numberOfChannels; channel++) {
              const channelData = buffer.getChannelData(channel);

              const sampleRate = buffer.sampleRate; // get sample rate of audio data
              const samplesPerInterval = sampleRate * Waveform.interval; // calculate number of samples per interval

              for (let i = 0; i < channelData.length; i += samplesPerInterval) {
                let sum = 0;
                for (let j = 0; j < samplesPerInterval; j++) {
                  sum += Math.abs(channelData[i + j]);
                }
                const averageAmplitude = sum / samplesPerInterval;
                if (channel === 0) {
                  this.amplitudes.push(averageAmplitude);
                } else {
                  this.amplitudes2.push(averageAmplitude);
                }
              }
              this.draw({at: 0});
            }
          }, (e) => {
            console.error('Decode audio data error: ', e);
          })
      }

    reader.readAsArrayBuffer(file);
  }

  /**
   *
   * @param at second
   * @returns
   */
  lastAt = 0;
  targetAt: number = 0;
  loop?: Loop;
  hasEnd?: boolean;

  animateId?: number;
  stoppedAnimation = false;
  draw(pr:{at: number, loop?: Loop, hasEnd?: boolean, animate?: boolean, forceStop?:boolean}) {
    const animationFrameCount = 10
    if (pr.animate) {
      if (this.animateId !== undefined) cancelAnimationFrame(this.animateId);
      this.animateId = undefined;
      this.stoppedAnimation = true;

      this.targetAt = pr.at;
      this.stoppedAnimation = false;
      this.loop = pr.loop;
      this.hasEnd = pr.hasEnd;

      this.step = (this.targetAt - this.lastAt) / animationFrameCount; // 6 is frame count
      this.startAnimation();

    } else if (!pr.forceStop) {
      if (this.animateId !== undefined) {
        this.targetAt = pr.at;
        this.loop = pr.loop;
        this.hasEnd = pr.hasEnd;
        this.step = (this.targetAt - this.lastAt) / (pr.animate?animationFrameCount:3);
      } else {
        this._draw(pr.at, pr.loop, pr.hasEnd);
      }
    } else {
      if (this.animateId !== undefined) {
        cancelAnimationFrame(this.animateId);
        this.animateId = undefined;
        this.stoppedAnimation = true;
      }
      this._draw(pr.at, pr.loop, pr.hasEnd);
    }
  }

  step = 0;
  startAnimation() {
    let at;
    if (Math.abs(this.targetAt - this.lastAt) <= Math.abs(this.step) * 1.2) {
      at = this.targetAt;
      this.stoppedAnimation = true;
      this.animateId = undefined;
    } else {
      at = this.lastAt + this.step;
    }
    this.step *= 0.9;
    this._draw(at, this.loop, this.hasEnd);
    if (!this.stoppedAnimation) this.animateId = requestAnimationFrame(this.startAnimation);
  }

  _draw(at: number, loop?: Loop, hasEnd?: boolean) {
    const ctx = this.canvasCtx;
    if (!ctx) return;
    ctx.fillStyle = '#646cff';
    ctx.strokeStyle = 'red';
    ctx.globalAlpha = 1;

    if (this.amplitudes.length === 0) return;
    const cw = this.canvas.width / scaleFactor;
    const ch = this.canvas.height / scaleFactor;
    ctx.clearRect(0, 0, cw, ch);

    const maxBinCount = 200;
    const binWidth = cw / maxBinCount;
    const atIndex = at / Waveform.interval;

    const index = Math.floor(atIndex);
    const offsetLeft = -(atIndex - index) * binWidth;

    let startingIndex: number | undefined = undefined;
    let endingIndex: number | undefined = undefined;
    let startingX: number;
    let endingX: number;

    const mono = this.numberOfChannels === 1;
    const multiplier = 2;
    for (let i = 0; i < this.numberOfChannels; i++) {
      const amplitudes = i === 0 ? this.amplitudes : this.amplitudes2;
      let offset = 0;
      let x = cw / 2 + offsetLeft;
      const base = ch / 2;
      while (x >= 0 && offset < maxBinCount / 2 && (index - offset) >= 0 && (index - offset) < amplitudes.length) {
        const height = amplitudes[index - offset] * base * multiplier;
        if (mono) {
          ctx.fillRect(x, base - height, binWidth, height * 2);
        } else if (i === 0) {
          ctx.fillRect(x, base - height, binWidth, height);
        } else {
          ctx.fillRect(x, base, binWidth, height);
        }
        offset++;
        x -= binWidth;
      }
      startingIndex = offset === 0 ? index : index - offset + 1;
      startingX = offset === 0 ? x : x + binWidth;

      offset = 1;
      x = cw / 2 + offsetLeft + binWidth;
      const xLimit = cw - binWidth;
      while (x <= xLimit && offset < maxBinCount / 2 && (index + offset) < amplitudes.length) {
        const height = amplitudes[index + offset] * base * multiplier;
        if (mono) {
          ctx.fillRect(x, base - height, binWidth, height * 2);
        } else if (i === 0) {
          ctx.fillRect(x, base - height, binWidth, height);
        } else {
          ctx.fillRect(x, base, binWidth, height);
        }
        offset++;
        x += binWidth;
      }
      endingIndex = offset === 1 ? index + 1 : index + offset - 1;
      endingX = offset === 1 ? x : x - binWidth;
    }
    // draw vertical bar
    const offset = 0.2;
    ctx.lineWidth = offset * 2;
    ctx.beginPath();
    ctx.moveTo(cw / 2 - 0.5, offset);
    ctx.lineTo(cw / 2 - 0.5, ch - offset * 2);
    ctx.stroke();

    if (loop && startingIndex !== undefined && endingIndex !== undefined) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'black';

      const loopStartIdx = loop.start / Waveform.interval;

      if (loopStartIdx < startingIndex) {

      } else if (startingIndex === 0) {
        ctx.fillRect(0, 0, startingX! + loopStartIdx * binWidth, ch);
      } else {
        ctx.fillRect(0, 0, cw / 2 - (atIndex - loopStartIdx) * binWidth, ch);
      }

      if (!hasEnd) return;

      const loopEndIdx = loop.end / Waveform.interval;
      if (loopEndIdx > endingIndex) {
      } else if (endingIndex === this.amplitudes.length - 1) {
        const width = (cw - endingX!) + (endingIndex - loopEndIdx) * binWidth;
        ctx.fillRect(cw - width, 0, width, ch);
      } else {
        const width = cw / 2 - (loopEndIdx - atIndex) * binWidth;
        ctx.fillRect(cw - width, 0, width, ch);
      }
    }
    this.lastAt = at;

  }

}
