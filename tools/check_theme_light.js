const fs = require('fs');
const css = fs.readFileSync('Personal Study/public/css/style.css', 'utf8');

const regex = /body\.theme-light[^{]+\{([^}]+)\}/g;
let match;
while ((match = regex.exec(css)) !== null) {
  const full = match[0];
  if (full.includes('background') || full.includes('color') || full.includes('sheet') || full.includes('editor') || full.includes('paper')) {
    console.log(full.replace(/\s+/g, ' '));
  }
}
