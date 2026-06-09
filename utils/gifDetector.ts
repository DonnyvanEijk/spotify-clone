const GIPHY_MEDIA = /https?:\/\/media\d*\.giphy\.com\/[^\s]+\.gif(\?[^\s]*)?/i;
const GIPHY_PAGE  = /https?:\/\/(?:www\.)?giphy\.com\/gifs\/(?:[^/\s]+-)?([a-zA-Z0-9]+)(?:\s|$)/i;
const DIRECT_GIF  = /https?:\/\/[^\s]+\.gif(\?[^\s]*)?/i;

export interface GifMatch {
  /** Direct URL to the .gif image */
  url: string;
  /** Message text with the GIF URL removed and trimmed */
  remainingText: string;
}

export function detectGif(content: string): GifMatch | null {
  // Giphy media URL (directly renderable)
  const mediaMatch = content.match(GIPHY_MEDIA);
  if (mediaMatch) {
    return {
      url: mediaMatch[0].split("?")[0], // drop query params for cleanliness
      remainingText: content.replace(mediaMatch[0], "").trim(),
    };
  }

  // Giphy page URL → derive media URL from the ID in the slug
  const pageMatch = content.match(GIPHY_PAGE);
  if (pageMatch) {
    const id = pageMatch[1];
    return {
      url: `https://media.giphy.com/media/${id}/giphy.gif`,
      remainingText: content.replace(pageMatch[0].trimEnd(), "").trim(),
    };
  }

  // Any direct .gif URL
  const directMatch = content.match(DIRECT_GIF);
  if (directMatch) {
    return {
      url: directMatch[0],
      remainingText: content.replace(directMatch[0], "").trim(),
    };
  }

  return null;
}
