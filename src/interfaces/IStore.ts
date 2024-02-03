import ISong from "./ISong";

export default interface IStore {
  songs: ISong[];
  currentSong: ISong | null;
  playing: boolean;
  randomize: boolean;
}
