import { clsx} from "clsx"
import { twMerge } from "tailwind-merge"
import showdown from "showdown"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function serializeDiagram(diagram) {
  // Trim leading/trailing whitespace
  let trimmed = diagram.trim();

  // Normalize newlines (in case of mixed line endings)
  let normalizedNewlines = trimmed.replace(/\r\n|\r|\n/g, '\n');

  // Determine if it's a class diagram
  const isClassDiagram = normalizedNewlines.startsWith('classDiagram');

  if (isClassDiagram) {
    // For class diagrams, we want to keep double quotes
    // Just remove any extra spaces at the start of lines and compress multiple spaces
    return normalizedNewlines.replace(/^ +/gm, '').replace(/ +/g, ' ');
  } else {
    // For other diagrams (like flowcharts), replace double quotes with single quotes
    return normalizedNewlines
      .replace(/"/g, "'")
      .replace(/^ +/gm, '')
      .replace(/ +/g, ' ');
  }
}

export const markDownToHtml = (markDown)=>{
  const converter = new showdown.Converter();
  const html = converter.makeHtml(markDown);
  return html;
}

