import { getConfig } from "../store";
import { bookmark } from "./create";

async function getBookmark(bookmarkID: string): Promise<bookmark | null> {
  return await getConfig(`bookmarks.${bookmarkID}`);
}

async function getAllBookmarks(): Promise<Record<string, bookmark> | null> {
  return await getConfig("bookmarks");
}

async function getAllBookmarksArray(): Promise<bookmark[]> {
  const bookmarks = await getAllBookmarks();
  if (bookmarks) {
    return Object.values(bookmarks);
  }
  return [];
}

export { getBookmark, getAllBookmarks, getAllBookmarksArray };
