export default class YTPlayerAdaptor {
  ytPlayer?: any;
  YT: any;
  constructor(YT: any) {
    this.YT = YT;
  }


  set src(value: string) {
    try {
      this.ytPlayer?.destroy()
    } catch (e) {
    }

    const url = new URL(value);
    let vid;
    for (let [k, v] of url.searchParams) {
      if (k === "videoid" || k === "v") {
        vid = v;
        break;
      }
    }
    if (!vid) return;
    this.ytPlayer = new this.YT.Player("youtube", {
      videoId: vid,
      events: {
        "onStateChange": (e: any) => {
          console.log("state", e);
        },
        "onError": (e: any) => {
          console.log("youtube load error", e);
        }
      }
    })
  }

  play() {
    this.ytPlayer.playVideo();
  }

  pause() {
    this.ytPlayer.pauseVideo();
  }

  get paused() {
    return this.ytPlayer.getPlayerState() !== this.YT.PlayerState.PLAYING;
  }

  get currentTime() {
    return this.ytPlayer.getCurrentTime();
  }

  set currentTime(t) {
    this.ytPlayer.seekTo(t, true);
  }

  get playbackRate() {
    return this.ytPlayer.getPlaybackRate();
  }


}