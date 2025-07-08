/**
 * Shuffles an array or scrambles a string.
 * @param {Array|string} input - The array or string to shuffle/scramble.
 * @returns {Array|string} The shuffled array or scrambled string.
 */
export const shuffle = (input) => {
  if (Array.isArray(input)) {
    const array = [...input]; // Create a shallow copy to avoid modifying the original
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  } else if (typeof input === 'string') {
    return shuffle(input.split('')).join('');
  } else {
    throw new Error("Input must be an array or a string.");
  }
};
