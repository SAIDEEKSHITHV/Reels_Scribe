import { FormatOptions } from '../types';

export const formatCaption = (text: string, options: FormatOptions): string => {
  let processed = text;

  if (options.removeHashtags) {
    // Regex to remove hashtags (e.g., #instagram)
    processed = processed.replace(/#[a-zA-Z0-9_]+/g, '');
  }

  if (options.removeMentions) {
    // Regex to remove mentions (e.g., @user)
    processed = processed.replace(/@[a-zA-Z0-9_.]+/g, '');
  }

  if (options.removeBlankLines) {
    // Regex to replace multiple newlines with a single newline, and trim lines
    processed = processed.replace(/\n\s*\n/g, '\n').trim();
  }

  // Final cleanup of extra spaces that might result from removals
  return processed.replace(/ +/g, ' ').trim();
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const downloadAsTxt = (text: string, filename: string = 'caption.txt') => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
