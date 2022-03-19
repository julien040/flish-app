import { setConfig } from "../store";
import { nanoid } from "nanoid";
import captureEvent from "../analytics";

interface bookmark {
  bookmarkID: string;
  name: string;
  url: string;
  icon: string;
}
/**
 * A function that retrieve an icon for a given url
 * @param url -
 * @returns An URL which redirect to the favicon of the given URL
 */
function generateDefaultIconLink(url: string): string {
  const domain = url.split("/")[2] ?? "";
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
}

/**
 * Create a bookmark and save it to the config store
 * @param  {string} name - The title of the bookmark. Used as the searchable name in the search bar
 * @param  {string} url - Absolute URL to be bookmarked
 */
async function createBookmark(
  name: string,
  url: string,
  icon?: string
): Promise<void> {
  try {
    const bookmarkID = nanoid();
    // verify that the url is valid
    new URL(url);
    const bookmark: bookmark = {
      bookmarkID,
      name,
      url,
      icon: icon ?? generateDefaultIconLink(url),
    };
    await setConfig(`bookmarks.${bookmarkID}`, bookmark);
    captureEvent("Bookmark created", {
      name: name,
      url: url,
    });
  } catch (error) {
    console.error(error);
  }
}

export { createBookmark, bookmark, generateDefaultIconLink };
