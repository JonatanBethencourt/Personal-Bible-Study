const fs = require('fs');
const db = JSON.parse(fs.readFileSync('Personal Study/data/database.json', 'utf8'));
const note = db.notes.find(n => n.id === 'daily_text_2026_Septiembre');

console.log('--- CONTENT SLICE (chars 3400 to 4500) ---');
console.log(note.content.substring(3400, 4500));
