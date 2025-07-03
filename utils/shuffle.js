export function shuffle(input) {
  const array = Array.isArray(input) ? [...input] : input.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return Array.isArray(input) ? array : array.join("");
}