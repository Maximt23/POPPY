// Fix script for admin.js - remove duplicate helper functions
const fs = require('fs');

let content = fs.readFileSync('admin/admin.js', 'utf8');
let lines = content.split('\n');

console.log('Total lines:', lines.length);

// Find line ranges for each function
const functionRanges = [];
const targetFunctions = ['loadSkills', 'loadPrompts', 'loadMarketplaceItems'];

for (let i = 0; i < lines.length; i++) {
  for (const fn of targetFunctions) {
    if (lines[i].includes(`async function ${fn}()`)) {
      // Find where this function ends
      let braceCount = 0;
      let startIdx = i;
      let endIdx = i;
      
      for (let j = i; j < lines.length; j++) {
        const line = lines[j];
        if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
        if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0 && j > i) {
          endIdx = j;
          break;
        }
      }
      
      functionRanges.push({
        name: fn,
        start: startIdx,
        end: endIdx,
        line: i + 1
      });
    }
  }
}

console.log('\nFound functions:');
functionRanges.forEach(r => {
  console.log(`  ${r.name} at line ${r.line} (lines ${r.start + 1}-${r.end + 1})`);
});

// Keep only the first occurrence of each function
const toRemove = [];
const seen = new Set();

for (const r of functionRanges) {
  if (seen.has(r.name)) {
    // Mark for removal - include 1 line before (the comment) and the function
    toRemove.push({ start: r.start - 1, end: r.end });
  } else {
    seen.add(r.name);
  }
}

if (toRemove.length > 0) {
  console.log('\nRemoving duplicates:');
  toRemove.forEach(r => {
    console.log(`  Lines ${r.start + 1}-${r.end + 1}`);
  });
  
  // Sort in reverse order so we can remove from end to start
  toRemove.sort((a, b) => b.start - a.start);
  
  for (const r of toRemove) {
    lines.splice(r.start, r.end - r.start + 1);
  }
  
  fs.writeFileSync('admin/admin.js', lines.join('\n'));
  console.log('\n✅ Removed duplicate functions');
  console.log('New line count:', lines.length);
} else {
  console.log('\nNo duplicates found');
}
