export function parseDateInputToDate(value) {
  // value from <input type="date"> is "YYYY-MM-DD"
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function nightsBetween(checkIn, checkOut) {
  const ms = checkOut - checkIn;
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
}

export function isFutureDate(date) {
  const now = new Date();
  return date.getTime() > now.getTime();
}
