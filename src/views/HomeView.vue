<template>
  <div class="home">
    <div class="songs-info__container">
      <nav>
        <ul>
          <li>
            <input
              type="file"
              name="songs"
              multiple
              class="add-song"
              @change="addSongs"
            />
          </li>
        </ul>
      </nav>
      <div class="main-container">
        <aside class="aside">
          <h2>Song list</h2>
          <div v-for="sng in songs" :key="sng.id" class="song-container">
            <span @click="changeCurrentSong(sng.id)" class="song-name">
              {{ sng.file.name }}
            </span>
            <span class="remove-song__button" @click="removeSong(sng.id)">
              ❌
            </span>
          </div>
        </aside>
        <main class="main">
          <div>
            <h2>Song</h2>
            <div v-if="currentSong?.file.name">
              <h3>{{ currentSong?.file.name }}</h3>
              <p v-if="currentSongSecondStr && currentSongDuration">
                {{ currentSongSecondStr }} / {{ currentSongDuration }}
              </p>
            </div>
          </div>
          <div class="volume-intensity__container">
            <div class="volume-intensity__bar"></div>
          </div>
        </main>
      </div>
    </div>
    <AudioBar
      :currentSong="currentSong"
      :playing="playing"
      :randomize="randomize"
      @moveToNextSong="moveToNextSong"
      @setPlaying="setPlaying"
      @randomizeSongs="randomizeSongs"
      @setAudio="setAudio"
      @setCurrentSecond="setCurrentSecond"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, nextTick, watch, watchEffect } from "vue";
import ISong from "@/interfaces/ISong";
import { v4 as uuidv4 } from "uuid";
import AudioBar from "@/components/AudioBar.vue";

let audio: Ref<HTMLAudioElement | null> = ref(null);

let songs: Ref<ISong[]> = ref([]);
let currentSong: Ref<ISong> | Ref<null> = ref(null);
let currentPosition: Ref<number> = ref(0);
let currentSongSeconds: Ref<number> = ref(0);
let currentSongSecond: Ref<number> = ref(0);

let intensity: Ref<string> = ref("0%");
let currentSongDuration: Ref<string | null> = ref(null);
let currentSongSecondStr: Ref<string | null> = ref(null);

let randomize: Ref<boolean> = ref(false);
let playing: Ref<boolean> = ref(false);

let animationFrameId: number | null = null;

function setAudio(newValue: HTMLAudioElement) {
  audio.value = newValue;
  currentSongSeconds.value = newValue.duration;
}

function setCurrentSecond(newValue: number) {
  currentSongSecond.value = newValue;
}

function addSongs(e: Event) {
  if (
    e.target &&
    e.target instanceof HTMLInputElement &&
    e.target.value !== ""
  ) {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const song: ISong = {
          id: uuidv4(),
          file: files[i],
          url: URL.createObjectURL(files[i]),
        };
        songs.value.push(song);
      }
    }
    e.target.value = "";
  }
}

function changeCurrentSong(id: string) {
  currentSong.value =
    songs.value.find((song, index) => {
      if (song.id === id) {
        currentPosition.value = index;
      }
      return song.id === id;
    }) || null;

  setupAudio();
}

function removeSong(id: string) {
  songs.value = songs.value.filter((song) => {
    return song.id !== id;
  });
}

async function moveToNextSong() {
  const audio: HTMLAudioElement | null = document.getElementById(
    "current-song"
  ) as HTMLAudioElement;
  currentSong.value = null;
  audio.currentTime = 0;
  playing.value = false;
  if (!randomize.value) {
    if (currentPosition.value < songs.value.length - 1) {
      currentPosition.value++;
    } else {
      currentPosition.value = 0;
    }
  } else {
    currentPosition.value = Math.floor(Math.random() * songs.value.length);
  }
  currentSong.value =
    songs.value.find((song, index) => {
      return currentPosition.value === index;
    }) || null;
  nextTick(() => {
    playing.value = true;
  });
}

function setPlaying(value: boolean) {
  playing.value = value;
}

function randomizeSongs() {
  randomize.value = !randomize.value;
}

function setupAudio() {
  const audioContext = new window.AudioContext();
  const analyser = audioContext.createAnalyser();
  const audioElement = audio.value as HTMLAudioElement;

  try {
    const audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
  } catch (e) {
    //
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const updateVolume = () => {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
    intensity.value = Math.min(100, average) + "%";

    animationFrameId = requestAnimationFrame(updateVolume);
  };

  if (animationFrameId === null) {
    updateVolume();
  }
}

function parseTime(seconds: number) {
  let hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  let rest = seconds % 3600;
  let min = Math.floor(rest / 60)
    .toString()
    .padStart(2, "0");
  let sec = Math.floor(rest % 60)
    .toString()
    .padStart(2, "0");

  return hours !== "00" ? `${hours}:${min}:${sec}` : `${min}:${sec}`;
}

watch(
  [currentSongSeconds, currentSongSecond],
  ([totalSeconds, currentSecond]) => {
    if (totalSeconds && !Number.isNaN(totalSeconds)) {
      currentSongDuration.value = parseTime(totalSeconds);
    } else {
      currentSongDuration.value = null;
    }

    if (currentSecond && !Number.isNaN(currentSecond)) {
      currentSongSecondStr.value = parseTime(currentSecond);
    } else {
      currentSongSecondStr.value = null;
    }
  }
);
</script>

<style scoped>
.home {
  max-width: 1000px;
  width: 90%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 1;
  flex-grow: 1;
}
nav ul {
  list-style: none;
  padding: 0;
}

nav ul li {
  padding: 0;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  flex-grow: 1;
}

.aside,
.main {
  border: 1px solid #fff;
  border-radius: 8px;
  flex-grow: 1;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.aside {
  padding: 8px;
}

.song-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.song-container .song-name {
  text-align: left;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.volume-intensity__container {
  position: relative;
  width: 90%;
  flex-grow: 1;
}

.volume-intensity__bar {
  position: absolute;
  width: 100%;
  display: block;
  bottom: 0;
  background-color: #004;
  height: v-bind(intensity);
}

.songs-info__container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.main-container {
  height: 100%;
}

.add-song {
  color: transparent;
  cursor: pointer;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 5px;
  background-color: #f8f8f8;
}

.add-song::-webkit-file-upload-button {
  visibility: hidden;
}

.add-song::before {
  content: "Add song";
  width: 100%;
  display: inline-block;
  background-color: #000;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 10px 0px;
  cursor: pointer;
}

.add-song:hover::before {
  background-color: #004;
}

.remove-song__button {
  cursor: pointer;
}
</style>
