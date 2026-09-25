const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Fix Header Menu
appJs = appJs.replace(/>Recorded Lectures & Weekly Live Q&A</g, '>Curriculum<');

// 2. Update Hero Image Badge
const oldBadge = `<div class="floating-badge badge-tr">
    <span class="pulse-dot"></span> Live Class
  </div>`;
const newBadge = `<div class="floating-badge badge-tr">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    Weekly Q&amp;A
  </div>`;

// Since formatting might differ slightly due to my previous regex, I'll use regex for the badge
const badgeRegex = /<div class="floating-badge badge-tr">[\s\S]*?Live Class\s*<\/div>/;
appJs = appJs.replace(badgeRegex, newBadge);


// 3. Redesign Stats/Feature Banner
const oldStats = `<div class="stats-row"><div class="stats-panel"><div class="stat"><strong>2</strong><span>Core training tracks</span></div><div class="stat"><strong>Live</strong><span>Practical instructor sessions</span></div><div class="stat"><strong>Weekly</strong><span>Creator trend updates</span></div><div class="stat"><strong>1:1</strong><span>Personal student dashboard</span></div></div></div>`;

const newStats = `<div class="stats-row"><div class="stats-panel" style="padding: 32px 24px; border-radius: 24px;">
<div class="stat" style="border-right: 1px solid #e5e7eb; padding: 0 28px;">
  <svg width="34" height="34" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:14px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
  <strong style="font-size:42px; font-weight:900; line-height:1.1; margin-bottom:4px; color:#111827;">2</strong>
  <span style="font-size:15px; font-weight:500;">Core training tracks</span>
</div>
<div class="stat" style="border-right: 1px solid #e5e7eb; padding: 0 28px;">
  <svg width="34" height="34" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:14px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
  <strong style="font-size:42px; font-weight:900; line-height:1.1; margin-bottom:4px; color:#111827;">Recorded</strong>
  <span style="font-size:15px; font-weight:500;">Video lectures & live Q&A</span>
</div>
<div class="stat" style="border-right: 1px solid #e5e7eb; padding: 0 28px;">
  <svg width="34" height="34" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:14px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  <strong style="font-size:42px; font-weight:900; line-height:1.1; margin-bottom:4px; color:#111827;">Weekly</strong>
  <span style="font-size:15px; font-weight:500;">Creator trend updates</span>
</div>
<div class="stat" style="border-right: none; padding: 0 28px;">
  <svg width="34" height="34" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:14px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  <strong style="font-size:42px; font-weight:900; line-height:1.1; margin-bottom:4px; color:#111827;">1:1</strong>
  <span style="font-size:15px; font-weight:500;">Personal student dashboard</span>
</div>
</div></div>`;

appJs = appJs.replace(oldStats, newStats);

fs.writeFileSync('app.js', appJs);

let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/>Recorded Lectures & Weekly Live Q&A</g, '>Curriculum<');
fs.writeFileSync('index.html', indexHtml);

console.log('Successfully updated app.js and index.html');
