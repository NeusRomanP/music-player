import ISong from "@/interfaces/ISong";
import IStore from "@/interfaces/IStore";
import { createStore } from "vuex";

export default createStore<IStore>({
  state: {
    songs: [],
    currentSong: null,
    playing: false,
    randomize: false,
  },
  mutations: {
    setSongs(state, songs: ISong[]) {
      state.songs = songs;
    },
    addSong(state, song: ISong) {
      state.songs.push(song);
    },
    setCurrentSong(state, song: ISong | null) {
      state.currentSong = song;
    },
    setPlaying(state, playing: boolean) {
      state.playing = playing;
    },
    setRandomize(state, randomize: boolean) {
      state.randomize = randomize;
    },
  },
});
