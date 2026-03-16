const fs = require('fs');

const file = process.argv[2];

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regex to match conflict markers:
    // <<<<<<< HEAD ... ======= ... >>>>>>> origin
    // Keep group 2 (origin)
    const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> (origin|.*?)\r?\n/g;
    
    const newContent = content.replace(regex, '$2');
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Resolved: ' + file);
    }
}
