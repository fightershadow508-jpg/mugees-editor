const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');
let lines = content.split(/\r?\n/);

const newLines = `      <div class="creator-photo-card" style="overflow:visible;">
        <div class="hero-image-wrap" style="position: relative; width: 100%; height: 100%; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); box-shadow: 0 40px 100px rgba(0,0,0,.45);">
          <img src="assets/images/hero-creator.webp" alt="Young creator editing content in a professional studio workspace" style="width:100%; height:100%; object-fit:cover;">
          <div class="photo-gradient"></div>
          <div class="mentor-label"><span class="live-dot"></span><div><strong>Learn with a clear system</strong><small>Classes, tasks, trends &amp; progress in one place</small></div></div>
        </div>
        
        <div class="floating-badge badge-tl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><polygon points="12 12 16 16 12 20 8 16 12 12"></polygon></svg>
        </div>
        
        <div class="floating-badge badge-tr">
          <span class="pulse-dot"></span> Live Class
        </div>

        <div class="floating-badge badge-br">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
          <div class="fb-col">
            <strong>+$500/week</strong>
            <small>Earnings</small>
          </div>
        </div>
      </div>`.split('\n');

// Find the index of '<div class="creator-photo-card">'
let startIndex = -1;
for(let i=0; i<lines.length; i++){
  if(lines[i].includes('<div class="creator-photo-card">')) {
    startIndex = i;
    break;
  }
}

if(startIndex > -1) {
  lines.splice(startIndex, 5, ...newLines);
  fs.writeFileSync('app.js', lines.join('\n'));
  console.log('Successfully replaced lines!');
} else {
  console.log('Failed to find start index');
}
