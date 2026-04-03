const fs = require('fs');

// Read files
const adminContent = fs.readFileSync('admin/admin.js', 'utf8');
const functionsContent = fs.readFileSync('admin/functions-to-add.js', 'utf8');

// Find insertion point
const insertPoint = adminContent.indexOf('main().catch');

if (insertPoint === -1) {
    console.error('ERROR: Could not find main().catch');
    process.exit(1);
}

// Create new content
const newContent = adminContent.slice(0, insertPoint) + functionsContent + '\n' + adminContent.slice(insertPoint);

// Write back
fs.writeFileSync('admin/admin.js', newContent);

// Verify
const verify = fs.readFileSync('admin/admin.js', 'utf8');
console.log('✓ Functions added!');
console.log('Has launchCodePuppy:', verify.includes('async function launchCodePuppy'));
console.log('Has listSkills:', verify.includes('async function listSkills'));
console.log('Has importProject:', verify.includes('async function importProject'));
