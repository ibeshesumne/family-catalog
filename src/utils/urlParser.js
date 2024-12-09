// src/utils/urlParser.js

/**
 * Truncates a URL to a maximum length for display purposes.
 * @param {string} url - The URL to truncate.
 * @param {number} maxLength - The maximum length of the displayed URL.
 * @returns {string} - The truncated URL.
 */
export const truncateUrl = (url, maxLength = 30) => {
  if (url.length <= maxLength) return url;
  return `${url.substring(0, maxLength)}...`;
};

/**
 * Parses a string containing URLs or Markdown-style links into HTML links.
 * Supports plain URLs and Markdown-style `[Text](URL)` links.
 * @param {string} description - The input string to parse.
 * @returns {string} - The string with URLs converted to HTML links.
 */
export const parseDescription = (description) => {
  if (typeof description !== "string") {
    description = String(description).trim(); // Ensure input is a string
  }

  // Regex for Markdown-style links: [Text](URL)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  // Regex for plain URLs (not wrapped in Markdown-style links)
  const urlRegex = /(?<!["'>])\bhttps?:\/\/[^\s<>()]+\b/g;

  // Replace Markdown-style links with inline HTML links
  let parsedDescription = description.replace(markdownLinkRegex, (match, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-link">${text}</a>`;
  });

  // Replace plain URLs with truncated inline HTML links
  parsedDescription = parsedDescription.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-link">${truncateUrl(url)}</a>`;
  });

  // Replace newline characters with <br> tags for proper text formatting
  return parsedDescription.replace(/\n/g, "<br>");
};
