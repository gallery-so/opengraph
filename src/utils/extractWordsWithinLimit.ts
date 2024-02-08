import { removeMarkdownStyling } from './removeMarkdownStyling';

export function extractWordsWithinLimit(inputString: string, charLimit: number = 160) {
  const words = inputString?.split(' ') ?? [];
  let result = [];
  let characterCount = 0;

  for (const word of words) {
    if (characterCount + word.length + result.length > charLimit) {
      break;
    }
    result.push(word);
    characterCount += word.length + 1; // Add 1 for the space
  }

  return result.join(' ');
}

export function truncateAndStripMarkdown(text: string, charLimit?: number) {
  const cleanText = removeMarkdownStyling(text ?? '');
  const truncatedText = extractWordsWithinLimit(cleanText, charLimit);
  return truncatedText ?? '';
}
