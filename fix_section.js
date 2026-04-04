// Delete the entire first CREATOR ANALYTICS section
const fs = require('fs');

const file = 'admin/admin.js';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

console.log('Original lines:', lines.length);

// Find the first CREATOR ANALYTICS section and delete until the second one
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    // Look for first CREATOR ANALYTICS (without MENU)
    if (lines[i].includes('CREATOR ANALYTICS') && !lines[i].includes('MENU') && startIdx === -1) {
        startIdx = i - 1; // include the // ═══ line before
        console.log('Found first section header at line', i + 1);
    }
    
    // Look for second CREATOR ANALYTICS MENU
    if (lines[i].includes('CREATOR ANALYTICS MENU') && endIdx === -1) {
        endIdx = i - 2; // delete up to blank line before
        console.log('Found second section header at line', i + 1);
        break;
    }
}

if (startIdx >= 0 && endIdx > startIdx) {
    console.log('Deleting from line', startIdx + 1, 'to', endIdx + 1);
    console.log('Total lines to delete:', endIdx - startIdx + 1);
    
    // Show what we're deleting
    console.log('First line to delete:', JSON.stringify(lines[startIdx]));
    console.log('Last line to delete:', JSON.stringify(lines[endIdx]));
    
    // Delete
    lines.splice(startIdx, endIdx - startIdx + 1);
    
    fs.writeFileSync(file, lines.join('\r\n'));
    console.log('Done! New total lines:', lines.length);
} else {
    console.log('Could not find section boundaries');
    console.log('startIdx:', startIdx, 'endIdx:', endIdx);
}
