export function removeMarkdownStyling(input: string) {
  // Remove links with the format [text](url)
  const linkRegex = /\[([^\]]+)\]\([^)]+\)/g;
  input = input.replace(linkRegex, '$1');

  // Remove inline code with backticks (`)
  const codeRegex = /`([^`]+)`/g;
  input = input.replace(codeRegex, '$1');

  // Remove bold text enclosed in double asterisks (**)
  const boldRegex = /\*\*([^*]+)\*\*/g;
  input = input.replace(boldRegex, '$1');

  // Remove italic text enclosed in single asterisks (*)
  const italicRegex = /\*([^*]+)\*/g;
  input = input.replace(italicRegex, '$1');

  return input;
}
