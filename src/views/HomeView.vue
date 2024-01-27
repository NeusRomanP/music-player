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
        controls
        :src="currentSong?.url"
        id="current-song"
        @ended="moveToNextSong"
        @canplaythrough="playSong"
      ></audio>
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
import { ref, Ref } from "vue";
import ISong from "@/interfaces/ISong";
import { v4 as uuidv4 } from "uuid";
import RandomIcon from "@/components/RandomIcon.vue";

let songs: Ref<ISong[]> = ref([]);
let currentSong: Ref<ISong> | Ref<null> = ref(null);
let currentPosition: Ref<number> = ref(0);

let randomize: Ref<boolean> = ref(false);

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
}

function removeSong(id: string) {
  songs.value = songs.value.filter((song) => {
    return song.id !== id;
  });
}

function moveToNextSong() {
  currentSong.value = null;
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

async function playSong(e: Event) {
  const audio: HTMLAudioElement | null = e.target as HTMLAudioElement;
  if (audio) {
    try {
      await audio?.play();
    } catch (error) {
      //
    }
  }
  audio.removeEventListener("canplaythrough", playSong);
}

function randomizeSongs() {
  randomize.value = !randomize.value;
}
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
}

.random-button {
  display: inline-block;
  height: 36px;
  aspect-ratio: 1;
  cursor: pointer;
}

.audio-button.active {
  box-shadow: inset 0 0 3px #000;
  color: red;
}
</style>
