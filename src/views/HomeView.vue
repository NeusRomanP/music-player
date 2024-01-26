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
      <audio controls :src="currentSong?.url" id="current-song"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import ISong from "@/interfaces/ISong";
import { v4 as uuidv4 } from "uuid";

let songs: Ref<ISong[]> = ref([]);
let currentSong: Ref<ISong> | Ref<null> = ref(null);

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
        console.log(songs.value);
      }
    }
    e.target.value = "";
  }
}

function changeCurrentSong(id: string) {
  currentSong.value =
    songs.value.find((song) => {
      return song.id === id;
    }) || null;
}

function removeSong(id: string) {
  songs.value = songs.value.filter((song) => {
    return song.id !== id;
  });
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  flex-shrink: 1;
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
</style>
