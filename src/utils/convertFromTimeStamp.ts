export function convertFromTimestamp(ts: number) {
    let d = new Date(ts);
    let hours = String(d.getUTCHours()).padStart(2, "0");
    let mins = String(d.getUTCMinutes()).padStart(2, "0");

    return `${hours}:${mins}`;
}
