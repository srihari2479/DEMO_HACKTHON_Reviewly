import fs from 'fs';
import path from 'path';

const filePath = 'C:/Users/umr87/Downloads/HACKTHON/frontend/node_modules/lucide-react/dist/esm/lucide-react.mjs';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Match any lines containing "github" case-insensitive
  const matches = content.match(/export.*hub.*/gi);
  console.log("Matching exports:");
  if (matches) {
    matches.slice(0, 15).forEach(m => console.log(m));
  } else {
    console.log("No matches found.");
  }
} else {
  console.log("File not found.");
}
