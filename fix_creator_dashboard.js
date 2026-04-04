// Fix script to remove empty showCreatorAnalytics function
const fs = require('fs');

const file = 'admin/admin.js';
let content = fs.readFileSync(file, 'utf8');

// Split by lines, handling both CRLF and LF
const lines = content.split(/\r?\n/);

console.log('Total lines:', lines.length);

// Always delete lines 6109 and 6110 (0-indexed: 6108 and 6109)
console.log('Line 6109 before:', JSON.stringify(lines[6108]));
console.log('Line 6110 before:', JSON.stringify(lines[6109]));

// Delete both lines regardless of content
lines.splice(6108, 2);

// Write back with CRLF (Windows standard)
fs.writeFileSync(file, lines.join('\r\n'));

console.log('Deleted lines 6109 and 6110');
console.log('New total lines:', lines.length);
