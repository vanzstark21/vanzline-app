const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const target = `<div>Ketik kata kunci pencarian, atau <b>Paste langsung Link/URL YouTube</b> (Bisa untuk Offline/Netlify)</div>`;
const replace = `<div>Ketik kata kunci pencarian lagu/video, atau paste Link/URL YouTube.</div>`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
