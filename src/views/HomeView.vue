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
          <h3>Song list</h3>
          <div v-for="sng in songs" :key="sng.id">
            <span @click="changeCurrentSong(sng.id)">{{ sng.file.name }}</span>
            <span class="remove-song__button" @click="removeSong(sng.id)">
              ❌
            </span>
          </div>
        </aside>
        <main class="main">
          <h2>Song</h2>
        </main>
      </div>
    </div>
    <div class="song-player__container">
      <audio
        :src="currentSong?.url"
        id="current-song"
        @ended="moveToNextSong"
        @canplaythrough="playSong"
        @timeupdate="updateProgressBar"
      ></audio>
      <span class="audio-button play-button" @click="togglePlayButton">
        <PlayIcon v-if="!playing" />
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
      <span
        class="audio-button random-button"
        @click="randomizeSongs"
        :class="randomize ? 'active' : ''"
        :title="randomize ? 'unrandomize' : 'randomize'"
      >
        <RandomIcon />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import ISong from "@/interfaces/ISong";
import { v4 as uuidv4 } from "uuid";
import RandomIcon from "@/components/RandomIcon.vue";
import PlayIcon from "@/components/PlayIcon.vue";
import PauseIcon from "@/components/PauseIcon.vue";

let songs: Ref<ISong[]> = ref([]);
let currentSong: Ref<ISong> | Ref<null> = ref(null);
let currentPosition: Ref<number> = ref(0);
let currentSongTime: Ref<number> = ref(0);
let currentTime: Ref<number> = ref(0);

let randomize: Ref<boolean> = ref(false);
let playing: Ref<boolean> = ref(false);

let isSongClicked: Ref<boolean> = ref(false);

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
  isSongClicked.value = true;
  currentSong.value =
    songs.value.find((song, index) => {
      if (song.id === id) {
        currentPosition.value = index;
      }
      return song.id === id;
    }) || null;
}

function updateProgressBar(e: Event) {
  const audio: HTMLAudioElement | null = e.target as HTMLAudioElement;

  currentTime.value = audio.currentTime;
}

function removeSong(id: string) {
  songs.value = songs.value.filter((song) => {
    return song.id !== id;
  });
}

function moveToNextSong() {
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
}

function togglePlayButton() {
  const audio: HTMLAudioElement | null = document.getElementById(
    "current-song"
  ) as HTMLAudioElement;

  if (audio.src !== "" && audio.src !== null) {
    playing.value = !playing.value;
  } else {
    playing.value = false;
  }
}

async function playSong(e: Event) {
  const audio: HTMLAudioElement | null = e.target as HTMLAudioElement;
  if (audio) {
    try {
      if (isSongClicked.value) {
        await audio?.play();
        playing.value = true;
        isSongClicked.value = false;
      }
      currentSongTime.value = audio.duration || 0;
    } catch (error) {
      //
    }
  }
  audio.removeEventListener("canplaythrough", playSong);
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

function randomizeSongs() {
  randomize.value = !randomize.value;
}

watch(playing, (isPlaying) => {
  const audio: HTMLAudioElement | null = document.getElementById(
    "current-song"
  ) as HTMLAudioElement;
  if (isPlaying) {
    audio.play();
  } else {
    audio.pause();
  }
});
</script>

<style scoped>
.home {
  max-width: 1000px;
  width: 90%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
}

.aside,
.main {
  border: 1px solid black;
  border-radius: 8px;
}

.songs-info__container {
  flex-shrink: 1;
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

.song-player__container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #333;
  color: #fff;
}

.random-button {
  display: inline-block;
  height: 36px;
  aspect-ratio: 1;
  cursor: pointer;
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

progress {
  accent-color: #000;
}
</style>
