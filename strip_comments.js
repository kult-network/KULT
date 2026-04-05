const fs = require('fs');
const path = require('path');
function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) {
      if(f !== 'node_modules' && f !== '.git') walkDir(p, cb);
    } else cb(p);
  });
}
const strip = (s) => s.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<![:"'`])\/\/.*$/gm, '').replace(/^[ \t]*\n/gm, '');
['/Users/tanvi/Desktop/kult/frontend/src', '/Users/tanvi/Desktop/kult/backend'].forEach(d => {
  walkDir(d, f => {
    if(!f.endsWith('.js') && !f.endsWith('.jsx')) return;
    try {
      const c = fs.readFileSync(f, 'utf8');
      const s = strip(c);
      if(c !== s) { fs.writeFileSync(f, s); console.log("Cleaned " + f); }
    } catch(e) {}
  });
});
