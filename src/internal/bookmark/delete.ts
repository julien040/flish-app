import { deleteConfig } from "../store";
import { getBookmark } from "./read";

async function deleteBookmark(bookmarkID: string): Promise<void> {
  //Check if the bookmark exists
  const bookmark = getBookmark(bookmarkID);
  if (!bookmark) {
    throw new Error(`Bookmark ${bookmarkID} does not exist`);
  }
  await deleteConfig(`bookmarks.${bookmarkID}`);
}

export default deleteBookmark;
