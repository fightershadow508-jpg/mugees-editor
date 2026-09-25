const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(/>Live Classes</g, '>Recorded Lectures & Weekly Live Q&A<');

fs.writeFileSync('index.html', indexHtml);
console.log('index.html updated.');
