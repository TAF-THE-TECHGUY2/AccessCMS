// The CMS rich-text editor saves blank lines as `<p><br></p>`. Our templates
// already space paragraphs, so those blanks render as large gaps.
const EMPTY_PARAGRAPH = /<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;

export const stripEmptyParagraphs = (html) =>
  typeof html === "string" ? html.replace(EMPTY_PARAGRAPH, "") : html;
