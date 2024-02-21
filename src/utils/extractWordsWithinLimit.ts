import { removeMarkdownStyling } from './removeMarkdownStyling';

function customUnescape(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&cent;/g, '¢')
    .replace(/&pound;/g, '£')
    .replace(/&yen;/g, '¥')
    .replace(/&euro;/g, '€')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™');
}

export const CHAR_LENGTH_ONE_LINE = 160;
export const CHAR_LENGTH_TWO_LINE = 330;

export function extractWordsWithinLimit(text: string, charLimit: number = CHAR_LENGTH_ONE_LINE) {
  const words = text?.split(' ') ?? [];
  let result = [];
  let characterCount = 0;

  for (const word of words) {
    if (characterCount + word.length + result.length > charLimit) {
      break;
    }
    result.push(word);
    characterCount += word.length + 1; // Add 1 for the space
  }

  let truncatedText = result.join(' ').trim();

  if (truncatedText?.length > 0) {
    if (truncatedText.length < text.length) {
      return truncatedText + '...';
    }
    return truncatedText;

    // TODO(rohan): improve logic here
    // return first word if first word length > charLimit
  } else if (words?.[0]?.length > 0) {
    if (words[0].length === charLimit) {
      return words[0];
    }

    return words[0].slice(0, charLimit - 3) + '...';
  }

  return truncatedText;
}

export function truncateAndStripMarkdown(text: string, charLimit?: number) {
  const sanitizedText = customUnescape(text);
  const cleanText = removeMarkdownStyling(sanitizedText ?? '');
  const truncatedText = extractWordsWithinLimit(cleanText, charLimit);
  return truncatedText ?? '';
}
