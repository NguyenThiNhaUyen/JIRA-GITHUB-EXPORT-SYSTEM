const fs = require('fs');
const path = require('path');

const directoryPaths = [
  'd:\\ki7\\SWD\\JIRA-GITHUB-EXPORT-SYSTEM\\apps\\web\\src\\pages',
  'd:\\ki7\\SWD\\JIRA-GITHUB-EXPORT-SYSTEM\\apps\\web\\src\\components'
];

const replacements = [
  { regex: /\brounded-\[?\w+\]?\b/g, replace: 'rounded-md' },
  { regex: /\bshadow-\w+(-\d+)?(\/\d+)?\b/g, replace: 'shadow-sm' },
  { regex: /\bshadow-\[[^\]]+\]\b/g, replace: '' },
  { regex: /\bbg-gradient-to-\w+\b/g, replace: '' },
  { regex: /\bfrom-\w+-\d+\b/g, replace: '' },
  { regex: /\bto-\w+-\d+\b/g, replace: '' },
  { regex: /\bvia-\w+-\d+\b/g, replace: '' },
  { regex: /\banimate-in\b/g, replace: '' },
  { regex: /\bfade-in(-\d+)?\b/g, replace: '' },
  { regex: /\bslide-\w+(-\w+)?(-\d+)?\b/g, replace: '' },
  { regex: /\bzoom-in(-\d+)?\b/g, replace: '' },
  { regex: /\bduration-\d+\b/g, replace: '' },
  { regex: /\bfont-black\b/g, replace: 'font-semibold' },
  { regex: /\bfont-display\b/g, replace: '' },
  { regex: /\btracking-widest\b/g, replace: '' },
  { regex: /\btracking-\[0\.2em\]\b/g, replace: '' },
  { regex: /\btracking-tighter\b/g, replace: 'tracking-tight' },
  { regex: /\bbg-white\/10\b/g, replace: '' },
  { regex: /\bbbackdrop-blur-\w+\b/g, replace: '' },
  { regex: /\bborder-0\b/g, replace: 'border' },
  { regex: /\brounded-full\b/g, replace: 'rounded-md' },
  { regex: /\bbg-\w+\/50\b/g, replace: '' },
  { regex: /\bh-16\b/g, replace: 'h-10' },
  { regex: /\bh-14\b/g, replace: 'h-10' },
  { regex: /\bh-12\b/g, replace: 'h-10' },
  { regex: /\bh-11\b/g, replace: 'h-9' },
  { regex: /\bpx-12\b/g, replace: 'px-4' },
  { regex: /\bpx-8\b/g, replace: 'px-4' },
  { regex: /\bpy-10\b/g, replace: 'py-4' },
  { regex: /\bpy-8\b/g, replace: 'py-4' },
  { regex: /\bpy-6\b/g, replace: 'py-3' },
  { regex: /\bpx-10\b/g, replace: 'px-6' },
  { regex: /\bbg-teal-600\b/g, replace: 'bg-primary' },
  { regex: /\btext-teal-600\b/g, replace: 'text-primary' },
  { regex: /\border-teal-100\b/g, replace: 'border-border' },
];

function flattenClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Flattened: ${filePath}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      flattenClasses(fullPath);
    }
  }
}

directoryPaths.forEach(processDirectory);
console.log('Finished flattening UI.');
