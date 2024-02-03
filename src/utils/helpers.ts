export function parseTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const rest = seconds % 3600;
  const min = Math.floor(rest / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(rest % 60)
    .toString()
    .padStart(2, "0");

  return hours !== "00" ? `${hours}:${min}:${sec}` : `${min}:${sec}`;
}
