const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

const badStats = `<div class="stats-row"><div class="stats-panel" style="padding: 32px 24px; border-radius: 24px;">
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

const cleanStats = `<div class="stats-row"><div class="stats-panel premium-stats">
<div class="stat">
  <svg width="34" height="34" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
  <strong class="stat-big-val">2</strong>
  <span class="stat-lbl">Core training tracks</span>
</div>
<div class="stat">
  <svg width="34" height="34" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
  <strong class="stat-big-val">Recorded</strong>
  <span class="stat-lbl">Video lectures & live Q&A</span>
</div>
<div class="stat">
  <svg width="34" height="34" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  <strong class="stat-big-val">Weekly</strong>
  <span class="stat-lbl">Creator trend updates</span>
</div>
<div class="stat">
  <svg width="34" height="34" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  <strong class="stat-big-val">1:1</strong>
  <span class="stat-lbl">Personal student dashboard</span>
</div>
</div></div>`;

appJs = appJs.replace(badStats, cleanStats);
fs.writeFileSync('app.js', appJs);

let stylesCss = fs.readFileSync('styles.css', 'utf8');
const newCss = `
/* Premium Stats Override */
.premium-stats {
  padding: 32px 24px !important;
  border-radius: 24px !important;
}
.premium-stats .stat {
  border-right: 1px solid #e5e7eb !important;
  padding: 0 28px !important;
}
.premium-stats .stat:last-child {
  border-right: 0 !important;
}
.stat-icon {
  margin-bottom: 14px;
}
.stat-big-val {
  font-size: 42px !important;
  font-weight: 900 !important;
  line-height: 1.1 !important;
  margin-bottom: 4px;
  color: #111827 !important;
}
.stat-lbl {
  font-size: 15px !important;
  font-weight: 500 !important;
}

@media(max-width:980px) {
  .premium-stats .stat:nth-child(2) { border-right: 0 !important; }
  .premium-stats .stat:nth-child(-n+2) { border-bottom: 1px solid #e5e7eb !important; }
}
@media(max-width:640px) {
  .premium-stats .stat { border-right: 0 !important; border-bottom: 1px solid #e5e7eb !important; }
  .premium-stats .stat:last-child { border-bottom: 0 !important; }
}
`;
fs.writeFileSync('styles.css', stylesCss + newCss);

console.log('Fixed CSS responsivness!');
