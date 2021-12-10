export const htmlRegex = {
  htmlTag:
    /\s*<\s*([a-zA-Z0-9-_]+)((\s*[a-zA-Z0-9-_]*[:@]?[a-zA-Z0-9-_]+="[a-zA-Z0-9-_]*")*)\s*>((\s*.+\s*)+)<\/[a-zA-Z0-9-_]+>\s*/gm,
  htmlSelfClosingTag:
    /^\s*<[a-zA-Z0-9-_]+(\s[a-zA-Z0-9-_]*[:@]?[a-z]+="[a-z]+")*\/>\s*$/gm,
};
