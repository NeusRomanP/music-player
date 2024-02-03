<template>
  <div class="song-player__container">
    <audio
      :src="store.state.currentSong?.url"
      id="current-song"
      @ended="handleMoveToNextSong"
      @canplaythrough="playSong"
      @timeupdate="updateProgressBar"
    ></audio>
    <span class="audio-button play-button" @click="togglePlayButton">
      <PlayIcon v-if="!store.state.playing" />
      <PauseIcon v-else />
    </span>
    <span class="progress-bar">
      <div
        class="progress-bar-tooltip"
        v-if="showTooltip"
        :style="{ left: tooltipX + '%' }"
      >
        {{ parseTime(tooltipValue) }}
      </div>
      <progress
        @mousemove="displayTime"
        @mouseleave="showTooltip = false"
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
      @click="store.commit('setRandomize', !store.state.randomize)"
      :class="store.state.randomize ? 'active' : ''"
      :title="store.state.randomize ? 'unrandomize' : 'randomize'"
    >
      <RandomIcon />
    </span>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref, Ref, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { parseTime } from "@/utils/helpers";
import RandomIcon from "@/icons/RandomIcon.vue";
import PlayIcon from "@/icons/PlayIcon.vue";
import PauseIcon from "@/icons/PauseIcon.vue";
import VolumeIcon from "@/icons/VolumeIcon.vue";
import NoVolumeIcon from "@/icons/NoVolumeIcon.vue";

const emits = defineEmits(["moveToNextSong", "setAudio", "setCurrentSecond"]);

const handleMoveToNextSong = () => emits("moveToNextSong");

const store = useStore();

const volumeBar: Ref<HTMLInputElement | null> = ref(null);
let currentSongTime: Ref<number> = ref(0);
let currentTime: Ref<number> = ref(0);
let volume: Ref<number> = ref(50);
let volumePercent: Ref<string> = ref(volume.value + "%");
let hasVolume: Ref<boolean> = ref(true);
let audio: Ref<HTMLAudioElement | null> = ref(null);
const showTooltip: Ref<boolean> = ref(false);
const tooltipX: Ref<number> = ref(0);
const tooltipValue: Ref<number> = ref(0);

onMounted(() => {
  audio.value = document.getElementById("current-song") as HTMLAudioElement;
  volumeBar.value = document.querySelector(".volume-slider");

  audio.value.volume = volume.value / 100;
  emits("setAudio", audio.value);
});

function togglePlayButton() {
  if (audio.value?.src !== "" && audio.value?.src !== null) {
    store.commit("setPlaying", !store.state.playing);
  } else {
    store.commit("setPlaying", false);
  }
}

async function playSong(e: Event) {
  audio.value = e.target as HTMLAudioElement;
  if (audio.value) {
    try {
      await audio.value?.play();
      store.commit("setPlaying", true);
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
  if (currentSongTime.value && audio.value) {
    const progressBar: HTMLElement | null =
      document.getElementById("progress-bar");
    const clicX = e.offsetX;
    const barWidth = progressBar?.clientWidth || 0;

    const clickPercent = (clicX / barWidth) * 100;
    const totalDuration = audio.value.duration;
    const newPosition = (totalDuration * clickPercent) / 100;

    audio.value.currentTime = newPosition;
  }
}

function displayTime(e: MouseEvent) {
  if (currentSongTime.value && audio.value) {
    const progressBar: HTMLElement | null =
      document.getElementById("progress-bar");
    const clicX = e.offsetX;
    const barWidth = progressBar?.clientWidth || 0;

    const positionPercent = (clicX / barWidth) * 100;
    const totalDuration = audio.value.duration || 0;
    const timeValue = (totalDuration * positionPercent) / 100;

    tooltipX.value = positionPercent;

    tooltipValue.value = timeValue;
    showTooltip.value = true;
  }
}

watch(
  () => store.state.playing,
  (isPlaying: boolean) => {
    if (isPlaying) {
      try {
        audio.value?.play();
      } catch (e) {
        audio.value?.pause();
      }
    } else {
      audio.value?.pause();
    }
  }
);

watch(volume, (newVolume) => {
  audio.value = document.getElementById("current-song") as HTMLAudioElement;

  volumePercent.value = newVolume + "%";
  audio.value.volume = newVolume / 100;

  emits("setAudio", audio);

  if (newVolume === 0) {
    hasVolume.value = false;
  } else {
    hasVolume.value = true;
  }
});

watch(currentSongTime, () => {
  emits("setAudio", audio.value);
});
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
  position: relative;
}

.progress-bar-tooltip {
  background: #000;
  padding: 4px 8px;
  border: 1px solid #000;
  box-shadow: inset 0 0 3px #fff;
  position: absolute;
  top: 0;
  transform: translate(-50%, -100%);
  z-index: 1;
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
