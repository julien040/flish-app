type Settings = {
  name: string;
  description: string;
  default: string | number | boolean;
  type: "string" | "number" | "boolean";
};

const schema: Record<string, Settings> = {
  showURLInSearchBar: {
    name: "Show URL in search bar with bookmarks",
    description: "When you open the bookmarks, show the url or not",
    default: true,
    type: "boolean",
  },
};

export default schema;
