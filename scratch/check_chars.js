const fs = require('fs');
const content = fs.readFileSync('a:\\AhorraFlow\\client\\src\\index.css', 'utf8');

for (let i = 0; i < content.length; i++) {
  const code = content.charCodeAt(i);
  if (code > 127 || code < 32 && code !== 10 && code !== 13 && code !== 9) {
    console.log(`Strange character at index ${i}: code ${code} (${content[i]})`);
  }
}
console.log('Finished check.');
