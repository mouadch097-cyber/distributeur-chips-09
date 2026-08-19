const fs = require('fs');
const path = require('path');

const FORBIDDEN_WORDS = [
  'lorem ipsum',
  'john doe',
  'jane doe',
  'example.com',
  'demo company',
  'fake company',
  'test company',
  'sample product',
  'foo bar',
  'dummy data',
  'fake driver',
  'fake customer',
  'fake order',
];

const SCAN_DIRS = ['src', 'prisma'];
let violations = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDir(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
      for (const word of FORBIDDEN_WORDS) {
        if (content.includes(word)) {
          console.warn(`[WARNING] Found forbidden pattern "${word}" in: ${fullPath}`);
          violations++;
        }
      }
    }
  }
}

console.log('--- Scanning Codebase for Forbidden Demo & Placeholder Data ---');
SCAN_DIRS.forEach((d) => {
  const full = path.join(__dirname, '..', d);
  if (fs.existsSync(full)) scanDir(full);
});

if (violations === 0) {
  console.log('✔ AUDIT PASSED: Zero forbidden demo words or fake company data detected.');
} else {
  console.log(`✖ AUDIT FAILED: ${violations} forbidden patterns found.`);
}
