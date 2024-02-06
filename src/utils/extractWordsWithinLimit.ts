export function extractWordsWithinLimit(inputString: string) {
  const words = inputString?.split(' ') ?? [];
  let result = [];
  let characterCount = 0;

  for (const word of words) {
    if (characterCount + word.length + result.length > 160) {
      break;
    }
    result.push(word);
    characterCount += word.length + 1; // Add 1 for the space
  }

  return result.join(' ');
}
