const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Copy Updates: Replace "Live Classes" globally (case sensitive)
// Wait, to be safe against case variations, I'll use regex.
appJs = appJs.replace(/>Live Classes</g, '>Recorded Lectures & Weekly Live Q&A<');
appJs = appJs.replace(/'🎥 Live Classes'/g, "'🎥 Recorded Lectures & Weekly Live Q&A'");
appJs = appJs.replace(/<h1>Live Classes<\/h1>/g, '<h1>Recorded Lectures & Weekly Live Q&A</h1>');
appJs = appJs.replace(/'Live Classes'/g, "'Recorded Lectures & Weekly Live Q&A'");
appJs = appJs.replace(/Live Classes & Recordings/g, 'Recorded Lectures & Weekly Live Q&A');

// 2. Add '24/7 WhatsApp Support' and 'Lifetime Access' to features section
// Original: 
// <div class=\"fs-checklist\"><div class=\"fs-check\"><span class=\"fs-check-icon\">📹</span><span>Structured recorded modules</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">🎙️</span><span>Weekly Q&amp;A support session</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">💬</span><span>WhatsApp group support</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">📊</span><span>Dashboard, earnings &amp; payment tracking</span></div></div>
let newChecklist = `<div class=\\"fs-checklist\\"><div class=\\"fs-check\\"><span class=\\"fs-check-icon\\">📹</span><span>Structured recorded modules</span></div><div class=\\"fs-check\\"><span class=\\"fs-check-icon\\">🎙️</span><span>Weekly Q&amp;A support session</span></div><div class=\\"fs-check\\"><span class=\\"fs-check-icon\\">💬</span><span>24/7 WhatsApp Support</span></div><div class=\\"fs-check\\"><span class=\\"fs-check-icon\\">⏳</span><span>Lifetime Access</span></div><div class=\\"fs-check\\"><span class=\\"fs-check-icon\\">📊</span><span>Dashboard, earnings &amp; payment tracking</span></div></div>`;

// Note: In app.js it is escaped: <div class=\"fs-checklist\">
// It is better to regex replace the checklist.
let regexChecklist = /<div class=\\"fs-checklist\\">.*?<\/div><\/div>/;
appJs = appJs.replace(regexChecklist, newChecklist);

// Wait, the backslashes might be tricky. Let's just find "WhatsApp group support"
appJs = appJs.replace('<span>WhatsApp group support</span>', '<span>24/7 WhatsApp Support</span></div><div class=\\"fs-check\\"><span class=\\"fs-check-icon\\">⏳</span><span>Lifetime Access</span>');

// 3. Update RBAC Logic
// In bindForms(), find the signup block.
/*
Original signup logic:
const {data,error}=await supabase.auth.signUp({email,password:pw}); if(error||!data){toast('Signup failed.');return} const s={id:uid('ST'),...
*/
const signupReplace = `const {data,error}=await supabase.auth.signUp({email,password:pw}); if(error||!data){toast('Signup failed.');return} await supabase.from('profiles').insert([{ id: data.user?.id || uid('ST'), email: email, name: String(fd.get('name')).trim(), role: 'student', phone: String(fd.get('phone')).trim() }]); const s={id:data.user?.id || uid('ST'),`;

appJs = appJs.replace(`const {data,error}=await supabase.auth.signUp({email,password:pw}); if(error||!data){toast('Signup failed.');return} const s={id:uid('ST'),`, signupReplace);

// Let's also ensure login logic properly fetches the role. It already does:
// const { data: prof, error: profErr } = await supabase.from('profiles').select('*').ilike('email', email).single();
// if(prof.role==='admin' || ...){ state.session={role:'admin'}; ... }
// This is already exactly what the user asked for. 

fs.writeFileSync('app.js', appJs);
console.log('AppJS updated with copy changes and RBAC logic.');
