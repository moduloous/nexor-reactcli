const fs = require('fs');
let text = fs.readFileSync('medicines.json', 'utf16le');
if (text.charCodeAt(0) === 0xFEFF) {
  text = text.slice(1);
}
const data = JSON.parse(text);
const regex = /BRUF|DOL|NIM|COMB|SUMO|CALPOL|CROCIN|ZERODOL|MEFT|FLEXON|ULTRACET|DICLO|ACECLO|IBU|PARA|ACETA|MOL/i;
const painkillers = data.filter(m => m.name.match(regex) && m.dosage_form === 'Tablet');
console.log(painkillers.map(m => m.name).slice(0, 50).join('\n'));
