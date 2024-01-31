<template>
  <div class="song-player__container">
    <audio
      :src="props.currentSong?.url"
      id="current-song"
      @ended="handleMoveToNextSong"
      @canplaythrough="playSong"
      @timeupdate="updateProgressBar"
    ></audio>
    <span class="audio-button play-button" @click="togglePlayButton">
      <PlayIcon v-if="!props.playing" />
      <PauseIcon v-else />
    </span>
    <span class="progress-bar">
      <progress
        :value="currentTime"
        :max="currentSongTime"
        @click="updateProgressBarOnClick"
        id="progress-bar"
      />
    </span>
    <span class="volume-container">
      <span class="volume-button" @click="toggleHasVolume">
        <VolumeIcon v-if="hasVolume" />
        <NoVolumeIcon v-else />
      </span>
      <input
        type="range"
        class="volume-slider"
        min="0"
        max="100"
        value="50"
        @input="changeVolume"
      />
    </span>
    <span
      class="audio-button random-button"
      @click="handleRandomizeSongs"
      :class="props.randomize ? 'active' : ''"
      :title="props.randomize ? 'unrandomize' : 'randomize'"
    >
      <RandomIcon />
    </span>
  </div>
</template>

<script setup lang="ts">
import RandomIcon from "@/icons/RandomIcon.vue";
import PlayIcon from "@/icons/PlayIcon.vue";
import PauseIcon from "@/icons/PauseIcon.vue";
import VolumeIcon from "@/icons/VolumeIcon.vue";
import NoVolumeIcon from "@/icons/NoVolumeIcon.vue";
import ISong from "@/interfaces/ISong";
import { defineProps, defineEmits, ref, Ref, watch, onMounted } from "vue";
const props = defineProps({
  currentSong: Object as () => ISong | null,
  playing: Boolean,
  randomize: Boolean,
});

const emits = defineEmits([
  "moveToNextSong",
  "setPlaying",
  "randomizeSongs",
  "setAudio",
  "setCurrentSecond",
]);

const handleMoveToNextSong = () => emits("moveToNextSong");
const handleRandomizeSongs = () => emits("randomizeSongs");

const volumeBar: Ref<HTMLInputElement | null> = ref(null);
let currentSongTime: Ref<number> = ref(0);
let currentTime: Ref<number> = ref(0);
let volume: Ref<number> = ref(50);
let volumePercent: Ref<string> = ref(volume.value + "%");
let hasVolume: Ref<boolean> = ref(true);
let playing: Ref<boolean> = ref(props.playing);
let audio: Ref<HTMLAudioElement | null> = ref(null);

onMounted(() => {
  audio.value = document.getElementById("current-song") as HTMLAudioElement;
  volumeBar.value = document.querySelector(".volume-slider");

  audio.value.volume = volume.value / 100;
  emits("setAudio", audio.value);
});

function togglePlayButton() {
  if (audio.value?.src !== "" && audio.value?.src !== null) {
    playing.value = !playing.value;
    emits("setPlaying", playing.value);
  } else {
    playing.value = false;
    emits("setPlaying", playing.value);
  }
}

async function playSong(e: Event) {
  audio.value = e.target as HTMLAudioElement;
  if (audio.value) {
    try {
      await audio.value?.play();
      playing.value = true;
      currentSongTime.value = audio.value.duration || 0;
    } catch (error) {
      //
    }
  }
  audio.value.removeEventListener("canplaythrough", playSong);
}

function changeVolume(e: Event) {
  const newVolume = Number((e.target as HTMLInputElement).value);

  volume.value = newVolume;

  if (audio.value) {
    audio.value.volume = newVolume / 100;
  }
}

function toggleHasVolume() {
  if (hasVolume.value) {
    hasVolume.value = false;
    volume.value = 0;
  } else {
    hasVolume.value = true;
    volume.value = 50;
  }
}

function updateProgressBar(e: Event) {
  audio.value = e.target as HTMLAudioElement;

  currentTime.value = audio.value.currentTime;

  emits("setCurrentSecond", currentTime.value);
}

function updateProgressBarOnClick(e: MouseEvent) {
  if (currentSongTime.value) {
    const progressBar: HTMLElement | null =
      document.getElementById("progress-bar");
    const clicX = e.offsetX;
    const barraAncho = progressBar?.clientWidth || 0;

    const audio: HTMLAudioElement | null = document.getElementById(
      "current-song"
    ) as HTMLAudioElement;

    const porcentajeClic = (clicX / barraAncho) * 100;
    const duracionTotal = audio.duration;
    const nuevaPosicion = (duracionTotal * porcentajeClic) / 100;

    audio.currentTime = nuevaPosicion;
  }
}

watch(
  playing,
  (isPlaying: boolean) => {
    emits("setPlaying", isPlaying);
    if (isPlaying) {
      try {
        audio.value?.play();
      } catch (e) {
        audio.value?.pause();
      }
    } else {
      audio.value?.pause();
    }
  },
  {
    deep: true,
  }
);

watch(
  () => props.playing,
  (newValue) => {
    playing.value = newValue;
  }
);

watch(
  volume,
  (newVolume) => {
    audio.value = document.getElementById("current-song") as HTMLAudioElement;

    volumePercent.value = newVolume + "%";
    audio.value.volume = newVolume / 100;

    emits("setAudio", audio);

    if (newVolume === 0) {
      hasVolume.value = false;
    } else {
      hasVolume.value = true;
    }
  },
  {
    deep: true,
  }
);

watch(
  currentSongTime,
  () => {
    emits("setAudio", audio.value);
  },
  { deep: true }
);
</script>

<style scoped>
.song-player__container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #333;
  color: #fff;
  padding: 8px;
  height: 70px;
}

.random-button {
  display: inline-block;
  height: 36px;
  aspect-ratio: 1;
  cursor: pointer;
  overflow: hidden;
}

.play-button {
  display: inline-block;
  height: 24px;
  aspect-ratio: 1;
  cursor: pointer;
}

.audio-button.active {
  box-shadow: inset 0 0 3px #000;
  color: red;
}

/* Audio bar */
audio::-webkit-media-controls-download-button {
  display: none !important;
}

.progress-bar {
  flex-grow: 1;
}

progress {
  width: 100%;
  accent-color: #000;
}

.volume-container {
  position: relative;
  display: inline-block;
  height: 24px;
}

.volume-button {
  height: 24px;
  aspect-ratio: 1;
  display: inline-block;
}

.volume-slider {
  position: absolute;
  width: 100px;
  height: 24px;
  top: 0;
  left: 0;
  transform: translate(-50px, -50px) rotate(270deg);
  transform-origin: top;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(
    to right,
    #000 0%,
    #000 v-bind(volumePercent),
    #333 v-bind(volumePercent),
    #333 100%
  );
  border: none;
  box-shadow: inset 0 0 3px #fff;
  margin: 0;
  outline: none;
  display: none;
}

.volume-container:hover .volume-slider {
  display: inline-block;
}

.volume-slider::-webkit-slider-thumb {
  visibility: hidden;
}
</style>
