class SeekableVideoPlayer extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: 'open' });

      const template = document.getElementById('seekable-video-player-template');
      const templateContent = template.content.cloneNode(true);
      this.shadowRoot.appendChild(templateContent);

      this.canvas = this.shadowRoot.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.playPauseButton = this.shadowRoot.querySelector('.play-pause');
      this.seekBar = this.shadowRoot.querySelector('.seek-bar');

      this.video = document.createElement('video'); // Hidden video element for actual playback

      this.isPlaying = false;
      this.animationId = null;

      this.setupEventListeners();
    }

    static get observedAttributes() {
      return ['src', 'width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'src') {
        this.video.src = newValue;
        this.video.load(); // Start loading the new video
      } else if (name === 'width') {
        this.canvas.width = parseInt(newValue, 10);
        this.video.width = parseInt(newValue, 10);
      } else if (name === 'height') {
        this.canvas.height = parseInt(newValue, 10);
        this.video.height = parseInt(newValue, 10);
      }
    }

    connectedCallback() {
      // Set initial dimensions if not set via attributes
      if (!this.canvas.width) {
        this.canvas.width = 640;
        this.video.width = 640;
      }
      if (!this.canvas.height) {
        this.canvas.height = 360;
        this.video.height = 360;
      }
    }

    setupEventListeners() {
      this.playPauseButton.addEventListener('click', this.togglePlay.bind(this));
      this.seekBar.addEventListener('input', this.seek.bind(this));

      this.video.addEventListener('timeupdate', () => {
        // Update seek bar during playback
        if (this.video.duration > 0) {
          this.seekBar.value = (this.video.currentTime / this.video.duration) * 100;
        } else {
          this.seekBar.value = 0;
        }
      });
      this.video.addEventListener('ended', () => {
        this.pause();
        this.seekBar.value = 0;
        this.video.currentTime = 0; // Reset time to start
      });
      this.video.addEventListener('loadeddata', () => {
        this.seekBar.max = this.video.duration;
      });
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    play() {
      if (this.video.src) {
        this.video.play();
        this.isPlaying = true;
        this.playPauseButton.textContent = 'Pause';
        this.animationId = requestAnimationFrame(this.drawFrame.bind(this));
      }
    }

    pause() {
      this.video.pause();
      this.isPlaying = false;
      this.playPauseButton.textContent = 'Play';
      cancelAnimationFrame(this.animationId);
    }

    drawFrame() {
      if (!this.isPlaying) return; // Stop if paused

      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.animationId = requestAnimationFrame(this.drawFrame.bind(this));
    }

    seek() {
      const seekTime = this.video.duration * (this.seekBar.value / 100);
      this.video.currentTime = seekTime;
    }
  }

  customElements.define('seekable-video-player', SeekableVideoPlayer);