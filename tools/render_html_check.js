const fs = require('fs');
const db = JSON.parse(fs.readFileSync('Personal Study/data/database.json', 'utf8'));
const note = db.notes.find(n => n.id === 'daily_text_2026_Septiembre');

// Extract markdownToRichHtml function from notes.js
const notesJs = fs.readFileSync('Personal Study/public/js/notes.js', 'utf8');
const fnCode = notesJs.substring(
  notesJs.indexOf('function markdownToRichHtml(md)'),
  notesJs.indexOf('function richHtmlToMarkdown(html)')
);

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const fullFn = new Function('escapeHtml', fnCode + '; return markdownToRichHtml;')(escapeHtml);
const html = fullFn(note.content);

// Find all classes in generated HTML
const classes = new Set();
const matches = html.matchAll(/class="([^"]+)"/g);
for (const m of matches) {
  classes.add(m[1]);
}
console.log('Classes found in rendered content:', Array.from(classes));

// Let's see HTML around Día 2:
const d2Idx = html.indexOf('DÍA 2');
console.log('HTML around DÍA 2:');
console.log(html.substring(d2Idx - 100, d2Idx + 400));
