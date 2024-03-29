<template>
  <div class="home">
    <div class="songs-info__container">
      <header>
        <ul>
          <li>
            <input
              type="file"
              accept="audio/*"
              name="songs"
              multiple
              class="add-song"
              @change="addSongs"
            />
          </li>
        </ul>
      </header>
      <div class="main-container">
        <aside class="aside">
          <h2>Song list</h2>
          <div class="songs__container">
            <div class="songs__inner-container">
              <div
                v-for="sng in store.state.songs"
                :key="sng.id"
                class="song-container"
              >
                <div class="song-name__container">
                  <span
                    class="song-name"
                    :title="sng.file.name"
                    @click="changeCurrentSong(sng.id)"
                  >
                    {{ sng.file.name }}
                  </span>
                </div>
                <span class="remove-song__button" @click="removeSong(sng.id)">
                  ❌
                </span>
              </div>
            </div>
          </div>
        </aside>
        <main class="main">
          <div>
            <h2>Song</h2>
            <div v-if="store.state.currentSong?.file.name">
              <h3>{{ store.state.currentSong?.file.name }}</h3>
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
      @moveToNextSong="moveToNextSong"
      @setAudio="setAudio"
      @setCurrentSecond="setCurrentSecond"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, nextTick, watch } from "vue";
import { useStore } from "vuex";
import ISong from "@/interfaces/ISong";
import { v4 as uuidv4 } from "uuid";
import AudioBar from "@/components/AudioBar.vue";
import { parseTime } from "@/utils/helpers";

const store = useStore();

let audio: Ref<HTMLAudioElement | null> = ref(null);

let currentPosition: Ref<number> = ref(0);
let currentSongSeconds: Ref<number> = ref(0);
let currentSongSecond: Ref<number> = ref(0);

let intensity: Ref<string> = ref("0%");
let currentSongDuration: Ref<string | null> = ref(null);
let currentSongSecondStr: Ref<string | null> = ref(null);

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
        if (files[i].type.includes("audio")) {
          const song: ISong = {
            id: uuidv4(),
            file: files[i],
            url: URL.createObjectURL(files[i]),
          };
          store.commit("addSong", song);
        }
      }
    }
    e.target.value = "";
  }
}

function changeCurrentSong(id: string) {
  const songs = store.state.songs;
  const newSong =
    songs.find((song: ISong, index: number) => {
      if (song.id === id) {
        currentPosition.value = index;
      }
      return song.id === id;
    }) || null;

  store.commit("setCurrentSong", newSong);

  setupAudio();
}

function removeSong(id: string) {
  const songs = store.state.songs;
  const newSongs = songs.filter((song: ISong) => {
    if (song.id === id && id === store.state.currentSong?.id) {
      store.commit("setCurrentSong", null);
      store.commit("setPlaying", false);
    }
    return song.id !== id;
  });
  store.commit("setSongs", newSongs);
}

async function moveToNextSong() {
  const songs = store.state.songs;
  store.commit("setCurrentSong", null);
  if (audio.value) {
    audio.value.currentTime = 0;
  }
  store.commit("setPlaying", false);
  if (!store.state.randomize) {
    if (currentPosition.value < songs.length - 1) {
      currentPosition.value++;
    } else {
      currentPosition.value = 0;
    }
  } else {
    currentPosition.value = Math.floor(Math.random() * songs.length);
  }
  const newSong =
    songs.find((song: ISong, index: number) => {
      return currentPosition.value === index;
    }) || null;

  store.commit("setCurrentSong", newSong);
  nextTick(() => {
    store.commit("setPlaying", true);
  });
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
  height: 100dvh;
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
  display: flex;
  gap: 16px;
  flex-grow: 1;
  overflow: auto;
}

.aside,
.main {
  border: 1px solid #fff;
  border-radius: 8px;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.aside {
  width: 300px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 0px);
}

.songs__container {
  flex-grow: 1;
  max-height: 100%;
  max-height: fit-content;
  padding: 8px;
  overflow: hidden;
}

.songs__inner-container {
  height: 100%;
  overflow: auto;
}

.song-container {
  display: flex;
  padding-right: 8px;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.song-container .song-name__container {
  flex-grow: 1;
  width: 100px;
  padding-block: 8px;
  cursor: pointer;
}

.song-container .song-name {
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: block;
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
  max-height: calc(100% - 86px);
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

@media (max-width: 600px) {
  .main-container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 200px auto;
  }

  .main-container .aside {
    width: 100%;
  }

  .song-container .song-name {
    width: 100px;
  }
}

/* ScrollBar */
::-webkit-scrollbar {
  width: 12px;
  border-radius: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #666;
  border-radius: 12px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #000;
  box-shadow: inset 0 0 3px #fff;
  width: 8px;
  border-radius: 8px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #004;
  box-shadow: inset 0 0 3px #fff;
}
</style>
