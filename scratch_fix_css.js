const fs = require('fs');

let cssAppend = `
/* Hero Floating Badges */
.floating-badge {
  position: absolute;
  background: rgba(10, 21, 38, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  color: #fff;
  z-index: 10;
  animation: float-badge 3s ease-in-out infinite;
}

@keyframes float-badge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.badge-tl {
  top: 30px;
  left: -28px;
  border-radius: 999px;
  padding: 10px 14px;
  gap: 8px;
  animation-delay: 0s;
}

.badge-tr {
  top: 40px;
  right: -24px;
  border-radius: 999px;
  font-size: 13px;
  font-family: "Montserrat", "Poppins", sans-serif;
  font-weight: 800;
  padding: 10px 18px;
  animation-delay: 1.5s;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  animation: pulse-red 2s infinite;
  display: inline-block;
}

@keyframes pulse-red {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.badge-br {
  bottom: 40px;
  right: -32px;
  padding: 14px 18px;
  animation-delay: 0.75s;
}

.fb-col {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.fb-col strong {
  font-size: 15px;
  font-family: "Montserrat", "Poppins", sans-serif;
}
.fb-col small {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .floating-badge {
    display: none !important;
  }
}
`;

let stylesCss = fs.readFileSync('styles.css', 'utf8');
stylesCss = stylesCss.replace('.creator-photo-card{position:absolute;right:0;top:0;width:72%;height:440px;border-radius:32px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 40px 100px rgba(0,0,0,.45)}', '.creator-photo-card{position:absolute;right:0;top:0;width:72%;height:440px;z-index:2;}');

fs.writeFileSync('styles.css', stylesCss + '\n' + cssAppend);
console.log('Styles appended successfully');
