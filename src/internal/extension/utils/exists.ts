import { getExtension } from "../read";
/**
 * Check if the extension is part of the config file. It does not ensure that the extension is valid, not corrupted or desinstalled
 * @param id The Id of the extension
 */
export const doesExtensionExist = async (id: string): Promise<boolean> => {
  const extension = await getExtension(id);
  if (extension) return true;
  return false;
};
