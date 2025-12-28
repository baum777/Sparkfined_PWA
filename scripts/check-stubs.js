import fs from 'fs';
import path from 'path';

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scan(fullPath);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('TODO_STUB')) {
        console.error(`Found TODO_STUB in ${fullPath}`);
        process.exit(1);
      }
    }
  }
}

console.log('Scanning for TODO_STUB...');
try {
    scan('src');
    console.log('No stubs found.');
} catch (e) {
    console.error(e);
    process.exit(1);
}

