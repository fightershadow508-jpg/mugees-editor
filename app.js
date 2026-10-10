import { supabase } from './supabase-client.js';
let dbLessons=null; // shared lesson cache (Supabase). null=not loaded yet
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = (v='') => String(v).replace(/[&<>'"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n||0));
const uid = (p='ID') => `${p}-${Math.random().toString(36).slice(2,7).toUpperCase()}${Date.now().toString().slice(-3)}`;
const todayISO = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const niceDate = (d=todayISO()) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'});

const demoState = {
  session:null,
  students:[
    {
      id:'ST-1048',name:'Zain Ali',avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',email:'zain@mugheeseditor.pk',password:'',phone:'0300 1234567',status:'Active Creator',program:'Hypic + CapCut',joinDate:'2026-08-14',
      today:8.75,week:66.79,month:223.21,lifetime:650.00,available:500.00,pending:0,paid:150.00,attendance:91,progress:82,tasksDone:16,tasksTotal:20,trendParticipation:11,performance:'Very Good',
      payoutMethod:'JazzCash',payoutAccount:'0300 1234567',city:'Lahore',bio:'Learning creator workflows and short-form content systems.'
    },
    {
      id:'ST-1052',name:'Ayesha Noor',avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',email:'ayesha@mugheeseditor.pk',password:'',phone:'0312 5550099',status:'Active Creator',program:'TikTok Growth + Hypic',joinDate:'2026-08-22',
      today:6.43,week:47.32,month:174.64,lifetime:650.00,available:500.00,pending:0,paid:150.00,attendance:96,progress:88,tasksDone:18,tasksTotal:20,trendParticipation:16,performance:'Excellent',
      payoutMethod:'Easypaisa',payoutAccount:'0312 5550099',city:'Islamabad',bio:'Short-form creator focused on face-led trend education.'
    }
  ],
  courses:[
    {id:'C-101',title:'TikTok Growth & Content Creation',type:'Live + Recorded',lessons:8,progressBy:{'ST-1048':82,'ST-1052':91},desc:'Filters, effects, hooks, lighting, CapCut editing, growth strategy and transition into value-led content.',cover:'tiktok',modules:['Account & Profile Setup','Trending Filters & Effects','Strong Hooks','CapCut Free Editing','Lighting & Framing','Posting & Analytics','Voice Content Transition','Personal Brand Expansion']},
    {id:'C-202',title:'Hypic + CapCut Creator Program',type:'Live + Weekly Updates',lessons:10,progressBy:{'ST-1048':67,'ST-1052':74},desc:'Face and faceless workflows, trend execution, reusable editing systems and future creator-app onboarding.',cover:'creator',modules:['Program Overview','Account Setup','Trend Research','Face Content Workflow','Faceless Workflow','CapCut Editing','Hypic Workflow','Upload Checklist','Common Mistakes','Weekly Opportunity Updates']}
  ],
  classes:[
    {id:'CL-201',title:'TikTok Filters: Hook + Creator Layout',trainer:'Mughees',date:'2026-10-16',time:'8:00 PM',batch:'TikTok Batch 01',status:'Upcoming',link:'#'},
    {id:'CL-202',title:'Hypic Trend Workflow — Live Practical',trainer:'Mughees',date:'2026-10-19',time:'8:30 PM',batch:'Creator Batch 02',status:'Upcoming',link:'#'},
    {id:'CL-190',title:'CapCut Editing: Fast Mobile Workflow',trainer:'Mughees',date:'2026-09-18',time:'8:00 PM',batch:'Creator Batch 02',status:'Recorded',link:'#'}
  ],
  trends:[
    {id:'TR-1',program:'TikTok',title:'AI Portrait Filter — Face + Center Layout',added:'2026-09-22',difficulty:'Easy',status:'New'},
    {id:'TR-2',program:'Hypic',title:'Cinematic Photo Motion Template',added:'2026-09-21',difficulty:'Easy',status:'New'},
    {id:'TR-3',program:'CapCut',title:'Beat Cut + Spotlight Reveal',added:'2026-09-19',difficulty:'Medium',status:'Active'}
  ],
  earnings:[
    {id:'E-1',studentId:'ST-1048',date:'2026-09-23',program:'Hypic',amount:8.75,note:'Approved creator payout credit'},
    {id:'E-2',studentId:'ST-1048',date:'2026-09-18',program:'CapCut',amount:17.50,note:'Approved creator payout credit'},
    {id:'E-3',studentId:'ST-1048',date:'2026-09-14',program:'Hypic',amount:25.00,note:'Approved creator payout credit'},
    {id:'E-4',studentId:'ST-1052',date:'2026-09-23',program:'TikTok Creator',amount:6.43,note:'Approved creator payout credit'},
    {id:'E-5',studentId:'ST-1048',date:'2026-09-20',program:'TikTok Creator',amount:15.54,note:'Approved creator payout credit'},
    {id:'E-6',studentId:'ST-1048',date:'2026-09-02',program:'Hypic',amount:156.42,note:'Approved creator payout credit'},
    {id:'E-7',studentId:'ST-1048',date:'2026-08-14',program:'Creator Program',amount:436.08,note:'Approved creator payout credit'},
    {id:'E-8',studentId:'ST-1052',date:'2026-08-22',program:'Creator Program',amount:448.57,note:'Approved creator payout credit'}
  ],
  withdrawals:[
    {id:'WD-1081',studentId:'ST-1048',date:'2026-09-14',amount:25.00,method:'JazzCash',account:'0300 1234567',status:'Paid',paidDate:'2026-09-14',reference:'JC-582914'},
    {id:'WD-1039',studentId:'ST-1048',date:'2026-09-07',amount:35.00,method:'Easypaisa',account:'0300 1234567',status:'Paid',paidDate:'2026-09-07',reference:'EP-414229'}
  ],
  notifications:[
    {id:'N-1',studentId:'ST-1048',date:'2026-09-23',title:'New earnings added',body:'A new approved earning has been added to your account.',read:false},
    {id:'N-2',studentId:'ST-1048',date:'2026-09-22',title:'New TikTok trend',body:'AI Portrait Filter tutorial is now available in Trend Updates.',read:false},
    {id:'N-3',studentId:'ST-1048',date:'2026-09-18',title:'Recording uploaded',body:'CapCut Editing: Fast Mobile Workflow recording is available.',read:true}
  ],
  programs:[
    {id:'PG-1',name:'Hypic Creator Workflow',code:'HY',desc:'Face and faceless creator workflows, trend execution and weekly updates.',status:'Active'},
    {id:'PG-2',name:'CapCut Creator Workflow',code:'CC',desc:'Mobile editing, creator layouts and repeatable content systems.',status:'Active'},
    {id:'PG-3',name:'TikTok Growth',code:'TT',desc:'Hooks, filters, lighting, posting and analytics workflows.',status:'Active'}
  ],
  supportMessages:[
    {id:'SUP-2', studentId:'ST-1048', topic:'Course / Class', message:'Where can I find the recorded CapCut class from last week?', reply:'It is now available in the Curriculum tab under the Upcoming classes section.', date:'2026-09-22', status:'Resolved'},
    {id:'SUP-1', studentId:'ST-1048', topic:'Earnings / Payout', message:'Hi, my latest Hypic payment is still not showing up?', reply:'', date:'2026-09-24', status:'Pending'}
  ],
  contactMessages:[],
  admin:{email:'admin@mugheeseditor.pk',password:'',name:'Platform Admin'},
  settings:{brand:'Mughees Editor',supportEmail:'support@mugheeseditor.pk',supportWhatsApp:'+92 300 0000000',weeklyUpdateText:'Creator earning updates are posted after the latest partner/program report becomes available.'},
  adminControls:{showLeaderboard:true,showTrends:true,showWithdrawals:true},
  unreadCounts:{trends: 2, adminSupport: 1}
};
let activeSupportTicket = null;
const SCHEMA_VERSION = 3;

// Merge demo student accounts into saved state, preserving other fields
function mergeDemoAccounts(saved) {
  const demoStudents = demoState.students;
  const merged = (saved?.students || []).map(s => {
    const demo = demoStudents.find(d => d.id === s.id);
    if (demo) {
      // enforce canonical email/password, keep other fields
      return { ...s, email: demo.email, password: demo.password };
    }
    return s;
  });
  // add any missing demo students
  demoStudents.forEach(d => {
    if (!merged.find(s => s.id === d.id)) merged.push(d);
  });
  return merged;
}

function loadState() {
  try {
    const saved = localStorage.getItem('me_creator_state_v2');
    if (saved) {
      const x = JSON.parse(saved);
      const students = mergeDemoAccounts(x);
      const admin = demoState.admin; // canonical admin credentials
      const settings = { ...demoState.settings, ...(x.settings || {}) };
      return { ...demoState, ...x, students, admin, settings };
    }
  } catch (e) {}
  return structuredClone(demoState);
}
let state=loadState();
let dashView='overview';
let adminView='overview';
function save(){localStorage.setItem('me_creator_state_v2',JSON.stringify(state));}
function resetDemo(){localStorage.removeItem('me_creator_state_v2');state=structuredClone(demoState);save();location.hash='#/';render();toast('Local data reset.');}
function currentStudent(){return state.students.find(s=>s.id===state.session?.studentId) || state.students[0];}
function earningSummary(studentId){
  const rows=state.earnings.filter(e=>e.studentId===studentId);
  const now=new Date(todayISO()+'T23:59:59');
  const sumSince=days=>rows.filter(e=>{const d=new Date(e.date+'T12:00:00');return (now-d)<=days*86400000 && d<=now;}).reduce((a,e)=>a+Number(e.amount||0),0);
  const today=rows.filter(e=>e.date===todayISO()).reduce((a,e)=>a+Number(e.amount||0),0);
  return {today,week:sumSince(7),month:sumSince(30),lifetime:rows.reduce((a,e)=>a+Number(e.amount||0),0)};
}
function notify(studentId,title,body){state.notifications.unshift({id:uid('N'),studentId,date:todayISO(),title,body,read:false});const s=state.students.find(x=>x.id===studentId);if(s){if(!s.unreadCounts)s.unreadCounts={studentAlerts:0};s.unreadCounts.studentAlerts=(s.unreadCounts.studentAlerts||0)+1;}save();}
function toast(msg){const el=document.createElement('div');el.className='toast';el.textContent=msg;$('#toastRoot').append(el);setTimeout(()=>el.remove(),3200);}

// ── EMAIL NOTIFICATION ALERT (Anti-Scam Record) ─────────────────────────────
// Sends withdrawal details to admin via Formspree/EmailJS placeholder.
// Replace the URL with your actual Formspree or EmailJS endpoint.
async function sendWithdrawalEmailAlert(student, amount) {
  const payload = {
    studentName: student.name,
    studentEmail: student.email,
    studentId: student.id,
    avatarUrl: student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff&rounded=true`,
    requestedAmount: money(amount),
    payoutMethod: student.payoutMethod || 'Not set',
    payoutAccount: student.payoutAccount || 'Not set',
    requestDate: niceDate(),
    message: `Withdrawal request: ${student.name} (${student.id}) requested ${money(amount)} via ${student.payoutMethod || 'N/A'} to account ${student.payoutAccount || 'N/A'}.`
  };
  try {
    await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('[WithdrawalAlert] Email notification sent for', student.name, money(amount));
  } catch (err) {
    console.warn('[WithdrawalAlert] Failed to send email notification:', err);
    // Non-blocking — withdrawal still proceeds even if email fails
  }
}

const icons={
  learn:'📚',live:'🎥',trend:'🔥',earn:'💰',growth:'📈',edit:'✂️',light:'💡',phone:'📱',bell:'🔔',wallet:'👛',shield:'🛡️',chart:'📊'
};

function heroCTAs(){
  if(state.session?.role==='student'){
    return `<div class="hero-actions"><a class="btn primary" href="#/dashboard">Go to Dashboard</a><a class="btn ghost" href="#/courses">Explore Courses</a></div>`;
  }else if(state.session?.role==='admin'){
    return `<div class="hero-actions"><a class="btn primary" href="#/admin">Admin Dashboard</a><a class="btn ghost" href="#/">View Website</a></div>`;
  }
  return `<div class="hero-actions"><button class="btn primary" data-action="open-signup">Start Learning</button><button class="btn ghost" data-action="open-login">Student Login</button></div>`;
}

function headerHero(){return `
<section class="hero premium-hero">
  <div class="hero-grid">
    <div class="hero-copy">
      <span class="eyebrow"><span class="dot"></span> Creator skills • Live mentorship • Personal dashboard</span>
      <h1>Build creator skills.<br><span class="gradient-text">Turn progress into opportunity.</span></h1>
      <p>A premium learning platform for TikTok growth, CapCut, Hypic and modern creator workflows — with live classes, trend updates, progress tracking and a private dashboard.</p>
      ${heroCTAs()}
      <div class="hero-proof">
        <div class="proof-faces"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Creator"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Creator"><img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&q=80" alt="Creator"></div>
        <div><strong>Practical creator community</strong><small>Live training • Weekly opportunities • Personal dashboard</small></div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="creator-photo-card" style="overflow:visible;">
        <div class="hero-image-wrap" style="position: relative; width: 100%; height: 100%; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); box-shadow: 0 40px 100px rgba(0,0,0,.45);">
          <img src="assets/images/hero-creator.webp" alt="Young creator editing content in a professional studio workspace" style="width:100%; height:100%; object-fit:cover;">
          <div class="photo-gradient"></div>
          <div class="mentor-label"><span class="live-dot"></span><div><strong>Learn with a clear system</strong><small>Classes, tasks, trends &amp; progress in one place</small></div></div>
        </div>\n
        <div class="floating-badge badge-tl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><polygon points="12 12 16 16 12 20 8 16 12 12"></polygon></svg>
        </div>
        
        <div class="floating-badge badge-tr">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    Weekly Q&amp;A
  </div>

        <div class="floating-badge badge-br">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
          <div class="fb-col">
            <strong>+$500/week</strong>
            <small>Earnings</small>
          </div>
        </div>
        
      </div>
      <div class="hero-platform-stats">
        <div class="hps-card hps-wide">
          <span class="hps-icon">📚</span>
          <div class="hps-body"><strong class="hps-value">4</strong><span class="hps-label">Creator Skill Tracks</span><small class="hps-sub">TikTok · CapCut · Hypic · Editing</small></div>
        </div>
        <div class="hps-card">
          <span class="hps-icon">🎥</span>
          <div class="hps-body"><strong class="hps-value">Weekly</strong><span class="hps-label">Live Sessions</span></div>
        </div>
        <div class="hps-card">
          <span class="hps-icon">⏰</span>
          <div class="hps-body"><strong class="hps-value">24/7</strong><span class="hps-label">Learning Access</span></div>
        </div>
        <div class="hps-card hps-accent">
          <span class="hps-icon">🔥</span>
          <div class="hps-body"><strong class="hps-value">Live</strong><span class="hps-label">Trend Updates</span><small class="hps-sub">Fresh creator opportunities</small></div>
        </div>
      </div>
    </div>
  </div>
</section>`}

function homePage(){return `${headerHero()}
<div class="stats-row"><div class="stats-panel premium-stats">
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
  <strong class="stat-big-val">$500+/month</strong>
  <span class="stat-lbl">Potential earnings target</span>
</div>
<div class="stat">
  <svg width="34" height="34" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  <strong class="stat-big-val">1:1</strong>
  <span class="stat-lbl">Personal student dashboard</span>
</div>
</div></div>
<section class="section"><div class="section-head"><span class="kicker">What students learn</span><h2>Start with growth. Build real creator skills.</h2><p>The platform stays focused: first students learn a repeatable TikTok growth workflow, then they use the same editing and presentation skills across creator programs and future apps.</p></div><div class="cards"><div class="card"><div class="icon-tile">${icons.growth}</div><h3>TikTok Growth</h3><p>Filters, effects, hooks, framing, lighting, posting and analytics — taught as a practical system.</p></div><div class="card"><div class="icon-tile">${icons.edit}</div><h3>CapCut Editing</h3><p>Fast mobile editing without requiring CapCut Pro: cuts, text, pacing, overlays and clean creator layouts.</p></div><div class="card"><div class="icon-tile">${icons.trend}</div><h3>Creator Programs</h3><p>Hypic, CapCut and future apps can be added from the admin panel without rebuilding the website.</p></div></div></section>
<section class="section alt"><div class="inner"><div class="section-head"><span class="kicker">Courses</span><h2>Two clear learning paths</h2><p>No confusing affiliate bundles. Students join training, attend live classes, watch recordings and follow updates inside their own account.</p></div><div class="cards">${state.courses.map(courseCard).join('')}</div></div></section>
<section class="section"><div class="section-head"><span class="kicker">How it works</span><h2>A simple student journey</h2></div><div class="steps"><div class="step"><span class="step-num">01</span><h3>Create Account</h3><p>Each student gets a private profile and personal dashboard.</p></div><div class="step"><span class="step-num">02</span><h3>Learn Live</h3><p>Join scheduled classes, watch recordings and complete practical tasks.</p></div><div class="step"><span class="step-num">03</span><h3>Follow Trends</h3><p>New TikTok, Hypic, CapCut and future-app updates appear inside the dashboard.</p></div><div class="step"><span class="step-num">04</span><h3>Track Progress</h3><p>Performance, approved earnings, available balance and payments stay organized in one place.</p></div></div></section>
<section class="section alt"><div class="inner"><div class="program-grid"><div class="program-feature"><span class="kicker" style="color:#a7f3ff">Future-ready system</span><h3>Add the next creator app without rebuilding the platform.</h3><p>Admin can publish a new program, tutorials, eligibility notes and trend updates from one control panel. Students see new opportunities in the same familiar dashboard.</p><div class="chip-row"><span class="chip">Hypic</span><span class="chip">CapCut</span><span class="chip">TikTok</span><span class="chip">Future Apps</span></div></div><div class="program-list">${state.trends.map(t=>`<div class="program-item"><div class="left"><div class="program-logo">${t.program.slice(0,2)}</div><div><strong>${esc(t.program)}</strong><small style="display:block;color:#7b8798;margin-top:3px">${esc(t.title)}</small></div></div><span class="tag ${t.status==='New'?'green':''}">${esc(t.status)}</span></div>`).join('')}</div></div></div></section>
<section class="section"><div class="section-head"><span class="kicker">Live training</span><h2>Class, recording, notes — all connected</h2></div><div class="live-grid">${state.classes.slice(0,2).map(c=>`<div class="live-card"><span class="live-badge">UPCOMING</span><h3 style="margin-top:14px">${esc(c.title)}</h3><p style="color:#6e7a8d">${niceDate(c.date)} · ${esc(c.time)} · ${esc(c.trainer)}</p><button class="btn primary" data-action="open-signup">Join the platform</button></div>`).join('')}</div></section>
<section class=\"feature-promo-banner\"><div class=\"fpb-inner\"><span class=\"fpb-pulse\"></span><span class=\"fpb-text\">🎓 Recorded lessons now available — <strong>start learning today</strong></span><span class=\"fpb-arrow\">→</span></div></section><section class=\"feature-section\"><div class=\"fs-inner\"><div class=\"fs-left\"><span class=\"fs-eyebrow\">✨ Premium Creator Learning</span><h2 class=\"fs-heading\">Learn creator skills in a more <span class=\"gradient-text\">organized, structured</span> way.</h2><p class=\"fs-para\">Students get one premium workspace for recorded lessons, weekly Q&amp;A support, WhatsApp community, creator trends, progress tracking, approved earnings and payment history — all in one place.</p><div class=\"fs-checklist\"><div class=\"fs-check\"><span class=\"fs-check-icon\">📹</span><span>Structured recorded modules</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">🎙️</span><span>Weekly Q&amp;A support session</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">💬</span><span>24/7 WhatsApp Support</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">⏳</span><span>Lifetime Access</span></div><div class=\"fs-check\"><span class=\"fs-check-icon\">📊</span><span>Dashboard, earnings &amp; payment tracking</span></div></div><div class=\"fs-ctas\">${heroCTAs()}</div></div><div class=\"fs-right\"><div class=\"fs-img-wrap\"><img src=\"assets/images/feature-creator.webp\" alt=\"Student learning creator skills in a premium dark workspace\" class=\"fs-main-img\"><div class=\"fs-img-overlay\"></div></div><div class=\"fsc fsc-top-left\"><span class=\"fsc-icon\">📹</span><div><strong>Recorded Lessons</strong><small>Learn at your own pace</small></div></div><div class=\"fsc fsc-top-right\"><span class=\"fsc-icon\">🔥</span><div><strong>Creator Trends</strong><small>Weekly updates</small></div></div><div class=\"fsc fsc-bottom\"><div class=\"fsc-row\"><span class=\"fsc-pill fsc-pill-violet\">🎥 4 Skill Tracks</span><span class=\"fsc-pill fsc-pill-cyan\">⏰ 24/7 Access</span><span class=\"fsc-pill fsc-pill-green\">💬 WhatsApp Support</span></div><div class=\"fsc-progress-card\"><div class=\"fsc-pc-head\"><span>Your progress</span><strong>82%</strong></div><div class=\"fsc-bar\"><div class=\"fsc-bar-fill\" style=\"width:82%\"></div></div><small>TikTok Growth Track</small></div></div></div></div></section><section class=\"section alt\"><div class=\"inner\"><div class=\"section-head\"><span class=\"kicker\">Trust &amp; clarity</span><h2>Built around training, not referrals.</h2><p>The student dashboard is designed around course progress, creator performance, recorded lessons, weekly Q&amp;A, trend updates and approved payout credits. There is no referral tree or affiliate-sales dashboard.</p></div></div></section>`}

function courseCard(c){return `<div class="card course-card"><div class="course-cover ${c.cover}"><div><span class="pill" style="background:rgba(255,255,255,.15);color:#fff">${esc(c.type)}</span><h3 style="margin:10px 0 0">${esc(c.title)}</h3></div></div><div class="course-body"><div class="course-meta"><span>${c.lessons} modules</span><span>Practical track</span></div><p>${esc(c.desc)}</p><a class="btn primary" href="#/courses" style="margin-top:16px">View Curriculum</a></div></div>`}

function pageHero(title,desc,chips=[]){return `<section class="page-hero"><div class="inner"><div class="chip-row">${chips.map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div><h1>${title}</h1><p>${desc}</p></div></section>`}

function coursesPage(){return `${pageHero('Courses built for practical creators.','Focused training paths with live classes, recordings, tasks and weekly creator updates.',['Live classes','Recordings','Practical tasks'])}<section class="section"><div class="cards">${state.courses.map(c=>`<div class="card course-card"><div class="course-cover ${c.cover}"><div><span class="pill" style="background:rgba(255,255,255,.15);color:#fff">${esc(c.type)}</span><h3 style="margin:10px 0 0">${esc(c.title)}</h3></div></div><div class="course-body"><p>${esc(c.desc)}</p><ul class="feature-list">${c.modules.map(m=>`<li>${esc(m)}</li>`).join('')}</ul><button class="btn primary" data-action="open-signup" style="margin-top:18px">Join & Access Dashboard</button></div></div>`).join('')}</div></section>`}

function programsPage(){return `${pageHero('Creator Programs','A modular program area for Hypic, CapCut, TikTok workflows and any new creator app you add later.',['Admin-manageable','Future-ready','Trend-driven'])}<section class="section"><div class="program-grid"><div class="program-feature"><span class="kicker" style="color:#a7f3ff">Current programs</span><h3>One dashboard. Multiple creator opportunities.</h3><p>Students do not need separate accounts for every training track. Admin can assign programs to each student and publish new lessons or trend updates as the ecosystem changes.</p></div><div class="program-list">${(state.programs||[]).map(p=>`<div class="program-item"><div class="left"><div class="program-logo">${esc(p.code||p.name.slice(0,2).toUpperCase())}</div><div><strong>${esc(p.name)}</strong><small style="display:block;color:#7b8798">${esc(p.desc)}</small></div></div><span class="tag green">${esc(p.status||'Active')}</span></div>`).join('')}</div></div></section>`}

function livePage(){return `${pageHero('Recorded Lectures & Weekly Live Q&A','Students see upcoming sessions, join links and recordings from their own dashboard.',['Zoom/Meet ready','Attendance','Recordings'])}<section class="section"><div class="live-grid">${state.classes.map(c=>`<div class="live-card"><span class="tag ${c.status==='Upcoming'?'orange':'green'}">${esc(c.status)}</span><h3 style="margin-top:14px">${esc(c.title)}</h3><p style="color:#6e7a8d">${niceDate(c.date)} · ${esc(c.time)}</p><p><strong>Trainer:</strong> ${esc(c.trainer)}<br><strong>Batch:</strong> ${esc(c.batch)}</p><button class="btn primary" data-action="open-signup">Student Login Required</button></div>`).join('')}</div></section>`}

function howPage(){return `${pageHero('How the platform works','A simple flow your client, admin team and students can understand at a glance.',['No affiliate system','Admin-controlled data','Private dashboards'])}<section class="section"><div class="steps"><div class="step"><span class="step-num">01</span><h3>Student signs up</h3><p>A private account is created. The student only sees their own courses, classes, performance and approved balance.</p></div><div class="step"><span class="step-num">02</span><h3>Admin assigns training</h3><p>Admin assigns TikTok Growth, Hypic, CapCut or a future creator program.</p></div><div class="step"><span class="step-num">03</span><h3>Student learns & creates</h3><p>Live classes, recordings, trend updates and practical creator tasks are delivered inside the dashboard.</p></div><div class="step"><span class="step-num">04</span><h3>Admin updates account</h3><p>Admin manages performance and adds approved payout credits. The student receives an automatic notification.</p></div></div></section><section class="section alt"><div class="inner"><div class="cards"><div class="card"><div class="icon-tile">💰</div><h3>Approved balance</h3><p>The student-facing balance is the amount approved and available for payout. Internal source calculations remain an administrative record.</p></div><div class="card"><div class="icon-tile">🏦</div><h3>Withdrawal request</h3><p>Students can request payout through JazzCash, Easypaisa, SadaPay, NayaPay or bank transfer.</p></div><div class="card"><div class="icon-tile">✅</div><h3>Admin marks paid</h3><p>After payment is sent, Admin records a reference and the transaction appears in the student's payment history.</p></div></div></div></section>`}

function faqPage(){const qs=[['Is this an affiliate or referral platform?','No. The platform is designed around training, creator programs, classes, performance tracking and managed payout credits.'],['Does every student get a separate dashboard?','Yes. Every account has its own private data, course progress, performance, classes, trends, balance and payment history.'],['Can new apps be added later?','Yes. Admin can add new creator programs and publish trend updates without redesigning the core website.'],['How are earnings shown?','The dashboard shows approved payout credits/available balance assigned to the student. It is not a public statement of the platform’s gross receipts or partner accounting.'],['Which payout methods are supported?','Supported payout methods include JazzCash, Easypaisa, SadaPay, NayaPay and bank transfer. USD balances can be settled through the configured payout workflow and applicable conversion process.'],['Are earnings guaranteed?','No. Earnings can vary by activity, third-party program rules, eligibility, performance and availability. The site should never promise guaranteed income.']];return `${pageHero('Frequently Asked Questions','Clear answers for students before they join.',['Training','Dashboard','Payouts'])}<section class="section"><div class="faq-list">${qs.map((q,i)=>`<div class="faq"><button data-faq="${i}"><span>${esc(q[0])}</span><span>+</span></button><div class="answer">${esc(q[1])}</div></div>`).join('')}</div></section>`}

function contactPage(){return `${pageHero('Contact & Support','Use this section for admissions, technical help and student support.',['Admissions','Technical support','Account help'])}<section class="section"><div class="contact-grid"><div class="card dark"><span class="kicker" style="color:#a7f3ff">Support</span><h2 style="font-size:36px">Need help?</h2><p>Use the official channels below for admissions, account help and payout support.</p><ul class="feature-list" style="margin-top:24px"><li style="color:#c5d3e5">Email: ${esc(state.settings.supportEmail)}</li><li style="color:#c5d3e5">WhatsApp: ${esc(state.settings.supportWhatsApp)}</li><li style="color:#c5d3e5">Support hours: set by Admin</li></ul></div><form class="form-card" id="contactForm"><div class="field"><label>Name</label><input required name="name" placeholder="Your name"></div><div class="field"><label>Email</label><input required type="email" name="email" placeholder="you@example.com"></div><div class="field"><label>Message</label><textarea required name="message" rows="6" placeholder="How can we help?"></textarea></div><button class="btn primary" type="submit">Send Message</button><p class="micro" style="margin-top:12px;color:#7b8798">Your message will be saved to the support inbox.</p></form></div></section>`}

const legalPages={
  terms:{title:'Terms & Conditions',intro:'These draft terms are a launch-ready starting point, but should be reviewed by a qualified lawyer for your exact company, country, tax and payout arrangements.',sections:[['1. Platform purpose','Mughees Editor provides educational content, live classes, recordings, creator-program information, student performance tools and account-based payout records. The platform is not an employment agency, investment product or guaranteed-income scheme.'],['2. Accounts','Students must provide accurate information, protect login credentials and use only their own account. Admin may suspend accounts for fraud, abuse, impersonation, payment misuse or serious policy violations.'],['3. Courses and third-party apps','Course material may discuss TikTok, CapCut, Hypic or other tools. Third-party features, eligibility and program rules can change without notice. Students are responsible for complying with those platforms’ terms.'],['4. Earnings shown in the dashboard','Amounts shown as Approved Earnings or Available Balance are payout credits approved for the student account. They are not necessarily the same as gross revenue, partner receipts or other internal accounting amounts. Any material student-facing fees or conditions must be disclosed in the applicable policy before they are applied.'],['5. Payouts','Payouts are processed using supported methods and are subject to verification, fraud checks, provider availability and the Payout Policy. Never share OTPs or account passwords with staff.'],['6. No income guarantee','Training, trends and creator programs do not guarantee views, followers, acceptance into third-party programs or any specific income.'],['7. Intellectual property','Course videos, notes, branding and platform materials may not be copied, resold or redistributed without permission.'],['8. Changes','We may update courses, schedules, supported programs and platform features. Material policy changes should be communicated to users.']]},
  privacy:{title:'Privacy Policy',intro:'This policy describes the information the platform may collect and how it is handled.',sections:[['Information we collect','Account identity and contact details, course activity, attendance, performance records, payout-method details, withdrawal records, device/security data and support communications.'],['How information is used','To provide accounts and courses, schedule classes, manage student support, maintain performance records, process payout requests, prevent fraud and improve platform reliability.'],['Financial information','Store only the minimum payout information required. Do not store wallet PINs, OTPs, card CVVs or online banking passwords. Sensitive production data should be encrypted and access-controlled.'],['Sharing','Data may be shared with service providers necessary to operate the platform, such as hosting, email, analytics, live-class or payout providers, subject to appropriate agreements.'],['Retention and security','The platform uses defined retention periods, backups, access controls and security practices appropriate to the deployed service.'],['Your choices','Users should be able to request correction of inaccurate profile information and contact support about privacy requests, subject to applicable law.']]},
  'payout-policy':{title:'Payout Policy',intro:'This page defines what the dashboard balance means and how payout requests are handled.',sections:[['Approved Earnings','Student dashboards display amounts approved as payout credits for that student. The amount shown as Available Balance is the amount currently eligible to be requested, subject to account verification and any clearly disclosed conditions.'],['Supported methods','The platform may support JazzCash, Easypaisa, SadaPay, NayaPay and bank transfer. Availability can vary by account and provider.'],['Request process','The student selects a supported method, confirms account details and submits a request. The amount is reserved while the request is pending.'],['Processing','The platform aims to process valid requests promptly, but timing can vary due to verification, provider delays, holidays, technical issues or compliance checks. Do not promise a guaranteed timeline unless operations can consistently meet it.'],['Failed or rejected payouts','If a request is rejected or fails, the reserved amount should return to the student’s available balance unless there is a documented account restriction.'],['Transparency','Any fee, adjustment or condition that changes the amount a student is entitled to receive should be disclosed before the student confirms a withdrawal.']]},
  'refund-policy':{title:'Refund Policy',intro:'This policy explains how refund requests are handled for enrollment and digital access.',sections:[['Course enrollment','If you charge for enrollment, state the refund window clearly before payment. Avoid “no refund” wording unless it is lawful and appropriate for your delivery model.'],['Digital access','If substantial digital content or recordings are unlocked immediately, explain how that affects refund eligibility under applicable law.'],['Duplicate or failed payments','Duplicate charges and confirmed payment errors should be investigated and corrected.'],['How to request','Provide a support email, required information and a reasonable review timeline.']]},
  'earnings-policy':{title:'Earnings & Balance Policy',intro:'This policy separates student-visible approved payout credits from internal partner/platform accounting.',sections:[['Student-visible amount','The student dashboard shows Approved Earnings, Available Balance and Total Paid. These are the amounts credited to the student account by Admin.'],['Internal records','The platform may maintain separate internal records for partner reports, source receipts, operational costs or other accounting. Those internal records are not presented as student-owned balances.'],['Updates','Creator earning updates may be added after the relevant program report becomes available. Update timing can vary.'],['Corrections','If an approved credit was entered incorrectly, corrections should be logged with a reason and users should be notified when the correction materially changes their balance.'],['No guarantee','Historical earnings, examples or dashboard screenshots do not guarantee future earnings.']]},
  'earnings-disclaimer':{title:'Earnings Disclaimer',intro:'Creator and social-media outcomes vary substantially. This disclaimer should remain visible wherever earning examples are used.',sections:[['No guaranteed results','We do not guarantee views, followers, virality, third-party program approval, recurring work or a specific earning amount.'],['Third-party dependency','Creator opportunities may depend on external apps and programs that can change eligibility, rates, availability, policies or geographic access.'],['Examples','Screenshots, case studies and demonstrations are examples only and should be accurately labeled as demo, historical or representative where applicable.'],['Student responsibility','Students remain responsible for following platform rules, content policies, copyright requirements and applicable laws.']]},
  'community-guidelines':{title:'Community Guidelines',intro:'Keep live classes and student groups useful, respectful and safe.',sections:[['Respect','No harassment, threats, hate, bullying or targeted abuse.'],['Privacy','Do not share another student’s personal data, payout details, private messages or login information without permission.'],['Content integrity','Do not submit stolen work, impersonate another creator or intentionally violate third-party platform rules.'],['Class behavior','Avoid spam, disruptive behavior and unauthorized recording or redistribution of paid/private lessons.'],['Enforcement','Warnings, temporary restrictions or suspension may be used depending on severity.']]}
};
function legalPage(key){const p=legalPages[key];return `<div class="legal-wrap"><span class="kicker">Mughees Editor · Legal</span><h1>${esc(p.title)}</h1><div class="legal-callout">Draft for product design purposes. Have a qualified local lawyer review the final version before taking real payments or processing real creator payouts.</div><p style="margin-top:24px">${esc(p.intro)}</p>${p.sections.map(s=>`<h2>${esc(s[0])}</h2><p>${esc(s[1])}</p>`).join('')}<p class="micro" style="margin-top:35px">Last updated: ${niceDate()}</p></div>`}

function authHTML(tab='login'){
 if(tab==='login')return `<h2>Welcome back</h2><p style="color:#64748b;margin-bottom:22px;">Login to your student or admin account.</p><form id="loginForm"><div class="field"><label>Email</label><input required type="email" name="email" placeholder="you@example.com"></div><div class="field"><label>Password</label><div class="pw-wrap" style="position:relative;"><input required type="password" name="password" id="login_pw" placeholder="••••••••"><button type="button" class="eye-btn" data-action="toggle-eye" data-target="login_pw" aria-label="Show/hide password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div></div><a href="#" data-action="open-forgot-password" class="forgot-link" style="display:block;margin:6px 0 20px;color:#3b82f6;text-align:right;font-size:0.85rem;font-weight:600;">Forgot password?</a><button class="btn primary" style="width:100%" type="submit">Login</button></form>`;
 return `<h2>Create student account</h2><p style="color:#64748b;margin-bottom:22px;">Create your account to access courses, classes, progress and earnings.</p><form id="signupForm"><div class="field"><label>Full name</label><input required name="name" placeholder="Your name"></div><div class="field"><label>Profile picture (optional)</label><div style="display:flex;align-items:center;gap:12px;"><img id="signup_avatar_preview" alt="" style="display:none;width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.15);"><input type="file" name="avatar" id="signup_avatar" accept="image/*"></div></div><div class="field"><label>Email</label><input required type="email" name="email" id="signup_email" placeholder="you@example.com"></div><div class="field"><label>Network Provider</label><select required name="network"><option value="">Select Network</option><option>Jazz</option><option>Zong</option><option>Telenor</option><option>Ufone</option><option>Warid</option><option>SCOM</option></select></div><div class="field"><label>Phone</label><input required name="phone" id="signup_phone" placeholder="03XXXXXXXXX" maxlength="11" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,11)" pattern="[0-9]{11}" title="Enter exactly 11 digits"></div><div class="field"><label>ID Card Number (CNIC)</label><input required name="cnic" placeholder="XXXXX-XXXXXXX-X" maxlength="15" oninput="let v=this.value.replace(/[^0-9]/g,''); if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5); if(v.length>13)v=v.slice(0,13)+'-'+v.slice(13); this.value=v.slice(0,15);"/></div><div class="field"><label>Password</label><div class="pw-wrap" style="position:relative;"><input required minlength="8" type="password" name="password" id="signup_pw" placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"><button type="button" class="eye-btn" data-action="toggle-eye" data-target="signup_pw" aria-label="Show/hide password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div><div class="pw-strength weak" id="signup_strength"><div class="pw-strength-bars"><span></span><span></span><span></span></div><span class="pw-text">Weak</span></div></div><div class="field"><label>Program</label><select name="program" required><option value="">Choose your plan</option><option>TikTok Growth</option><option>Hypic + CapCut + Dreamina</option><option>TikTok Growth + Hypic + CapCut + Dreamina</option></select></div><button class="btn primary" style="width:100%;margin-top:12px;" type="submit">Create Account</button></form>`;
}

function openAuth(tab='login'){
 if(state.session?.role==='student'){closeModals();location.hash='#/dashboard';render();return;}
 if(state.session?.role==='admin'){closeModals();location.hash='#/admin';render();return;}
 $('#authModal').classList.add('open');$('#authModal').setAttribute('aria-hidden','false');$$('[data-auth-tab]').forEach(b=>b.classList.toggle('active',b.dataset.authTab===tab));$('#authBody').innerHTML=authHTML(tab);bindForms();
}

function openForgotPassword(){
  $('#authModal').classList.add('open');
  $('#authModal').setAttribute('aria-hidden','false');
  $('#authBody').innerHTML = `<h2>Reset password</h2><p style="color:#64748b;margin-bottom:22px;">Enter your email to receive a reset link.</p><form id="forgotPasswordForm"><div class="field"><label>Email</label><input required type="email" name="email" placeholder="you@example.com"></div><button class="btn primary" style="width:100%;margin-top:12px;" type="submit">Send Reset Email</button></form>`;
  bindForms();
}

function openResetPassword(){
  $('#authModal').classList.add('open');
  $('#authModal').setAttribute('aria-hidden','false');
  $('#authBody').innerHTML = `<h2>Set new password</h2><p style="color:#64748b;margin-bottom:22px;">Enter a new password (minimum 8 characters).</p><form id="resetPasswordForm"><div class="field"><label>New Password</label><div class="pw-wrap" style="position:relative;"><input required minlength="8" type="password" name="password" id="rp_pw" placeholder="Minimum 8 characters"><button type="button" class="eye-btn" data-action="toggle-eye" data-target="rp_pw" aria-label="Show/hide password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div><div class="pw-strength weak" id="rp_strength"><div class="pw-strength-bars"><span></span><span></span><span></span></div><span class="pw-text">Weak</span></div></div><div class="field"><label>Confirm Password</label><div class="pw-wrap" style="position:relative;"><input required minlength="8" type="password" name="confirm" id="rp_cf" placeholder="Confirm new password"><button type="button" class="eye-btn" data-action="toggle-eye" data-target="rp_cf" aria-label="Show/hide password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div></div><p id="rp_err" style="color:#ef4444;font-size:13px;margin:0 0 12px"></p><button class="btn primary" style="width:100%" type="submit">Update Password</button></form>`;
  bindForms();
}
function closeModals(){$$('.modal').forEach(m=>m.classList.remove('open'));}

function sparkline(values) {
  const w=620, h=220, p=25, max=Math.max(...values), min=Math.min(...values), range=Math.max(1, max-min);
  const coords = values.map((v,i) => [p+i*((w-2*p)/(values.length-1)), h-p-((v-min)/range)*(h-2*p)]);
  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for(let i=0; i<coords.length-1; i++) {
    const [x0,y0] = coords[i];
    const [x1,y1] = coords[i+1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const areaD = d + ` L ${coords[coords.length-1][0]} ${h-p} L ${coords[0][0]} ${h-p} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const y = p + ratio * (h - 2*p);
    return `<line x1="${p}" y1="${y}" x2="${w-p}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4 4"/>`;
  }).join('');
  return `<svg class="earn-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8b5cf6" stop-opacity=".45"/>
        <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8b5cf6"/>
        <stop offset="1" stop-color="#22d3ee"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    ${gridLines}
    <path d="${areaD}" fill="url(#area)" stroke="none"/>
    <path d="${d}" fill="none" stroke="url(#line)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${coords.map(([x,y], i) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#0d192a" stroke="#a78bfa" stroke-width="2" style="cursor:pointer;" filter="url(#glow)"><title>${values[i]}</title></circle>`).join('')}
  </svg>`;
}

function studentSidebar(s){
  const ac = state.adminControls || { showLeaderboard: true, showTrends: true, showWithdrawals: true };
  const uc = state.unreadCounts || { trends: 0, adminSupport: 0 };
  let items=[['overview','🏠 Dashboard'],['courses','📚 My Courses'],['assignments','📝 Assignments'],['live','🎥 Curriculum']];
  if(ac.showTrends) items.push(['trends','🔥 Trends']);
  items.push(['performance','📊 Performance'],['earnings','💰 Earnings']);
  if(ac.showLeaderboard) items.push(['leaderboard','🏆 Leaderboard']);
  if(ac.showWithdrawals) items.push(['withdraw','🏦 Withdraw'],['payments','🧾 Payments']);
  items.push(['notifications','🔔 Notifications'],['profile','👤 Profile'],['support','💬 Support']);
  const storedAvatar = localStorage.getItem('userAvatar');
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&rounded=true`;
  const avatarImg = storedAvatar || s.avatar || fallbackUrl;
  const alerts = s.unreadCounts?.studentAlerts || 0;
  return `<aside class="sidebar"><div class="side-profile side-profile-rich"><img id="headerAvatar" src="${esc(avatarImg)}" alt="Profile" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1);"><div><strong>${esc(s.name)}</strong><div style="margin-top:5px"><span class="role-badge role-student">Student</span></div></div></div><div class="side-nav">${items.map(([id,l])=>`<button class="${dashView===id?'active':''}" data-dash="${id}" style="display:flex;justify-content:space-between;align-items:center;"><span>${l}</span>${id==='trends' && uc.trends>0?`<span class="nav-badge">${uc.trends}</span>`:id==='notifications' && alerts>0?`<span class="nav-badge">${alerts}</span>`:''}</button>`).join('')}<button data-action="logout">↩ Logout</button></div></aside>`
}


window.loadEarnings = async function(sId) {
  try {
    const { data, error } = await supabase.from('earnings').select('*').eq('student_id', sId);
    if (!error && data) {
      const fetched = data.map(d => ({ amount: Number(d.amount), date: d.date || (d.created_at ? d.created_at.split('T')[0] : todayISO()), program: d.program || 'Creator Program', studentId: sId }));
      state.earnings = state.earnings.filter(e => e.studentId !== sId).concat(fetched);
      save();
      if (route() === 'dashboard' && currentStudent()?.id === sId) {
         const dashContent = document.getElementById('dashContent');
         if(dashContent) { dashContent.innerHTML = studentView(currentStudent()); bindGlobal(); }
      }
    }
  } catch(e) { console.error('Earnings fetch error:', e); /* Fail gracefully, original zero state remains */ }
};

function studentDashboard(){if(!state.session||state.session.role!=='student'){openAuth('login');location.hash='#/';return homePage()}const s=currentStudent(); loadEarnings(s.id); return `<div class="dashboard-page"><div class="dashboard-shell">${studentSidebar(s)}<section class="dashboard-main" id="dashContent">${studentView(s)}</section></div></div>`}
function studentView(s){
 if(dashView==='courses') return studentCourses(s); if(dashView==='assignments') return studentAssignments(s);
 if(dashView==='live') return studentLive(s);
 if(dashView==='trends') return studentTrends(s);
 if(dashView==='performance') return studentPerformance(s);
 if(dashView==='earnings') return studentEarnings(s);
 if(dashView==='leaderboard') return studentLeaderboard(s);
 if(dashView==='withdraw') return studentWithdraw(s);
 if(dashView==='payments') return studentPayments(s);
 if(dashView==='notifications') return studentNotifications(s);
 if(dashView==='profile') return studentProfile(s);
 if(dashView==='support') return studentSupport(s);
 const myE=state.earnings.filter(e=>e.studentId===s.id).slice(0,4);const myN=state.notifications.filter(n=>n.studentId===s.id).filter(n=>!n.read).length;const totals=earningSummary(s.id);
 const ac = state.adminControls || { showLeaderboard: true, showTrends: true, showWithdrawals: true };
 return `<div class="dash-top"><div><h1>Welcome back, ${esc(s.name.split(' ')[0])} 👋</h1><p style="display:flex;align-items:center;gap:8px;margin:6px 0 0"><span class="role-badge role-student">Student</span> <span style="color:#8fa1b8">${esc(s.program)}</span></p></div><div class="dash-actions"><button class="btn light" data-dash="notifications">🔔 ${myN}</button>${ac.showWithdrawals?`<button class="btn primary" data-dash="withdraw">Withdraw</button>`:''}</div></div>
 <div class="dash-card-grid"><div class="dash-card"><small>Today's Earnings</small><strong>${money(totals.today)}</strong><div class="delta">Approved payout credit</div></div><div class="dash-card"><small>Last 7 Days</small><strong>${money(totals.week)}</strong><div class="delta">Recent activity</div></div><div class="dash-card"><small>Last 30 Days</small><strong>${money(totals.month)}</strong><div class="delta">Rolling total</div></div><div class="dash-card"><small>Total Earnings</small><strong>${money(totals.lifetime)}</strong><div class="delta">Approved history</div></div></div>
 <div class="dash-card-grid" style="margin-top:14px"><div class="dash-card"><small>Available Balance</small><strong style="color:#059669">${money(s.available)}</strong><div class="delta">Available to request</div></div><div class="dash-card"><small>Pending Balance</small><strong style="color:#d97706">${money(s.pending||0)}</strong><div class="delta">Awaiting admin review</div></div><div class="dash-card"><small>Total Paid</small><strong>${money(s.paid)}</strong><div class="delta">Completed payouts</div></div><div class="dash-card"><small>Performance</small><strong>${esc(s.performance)}</strong><div class="delta">Attendance ${s.attendance}%</div></div></div>
 <div class="dashboard-grid"><div class="panel"><div class="panel-head"><h3>Earning activity</h3><div class="tabs" id="chartTabs"><button data-range="1W">1W</button><button class="active" data-range="1M">1M</button><button data-range="3M">3M</button><button data-range="1Y">1Y</button></div></div><div id="chartContainer">${sparkline([12,20,15,31,28,41,36,56,49,62,58,71])}</div></div><div class="panel"><div class="panel-head"><h3>Next live class</h3><span class="tag orange">Upcoming</span></div>${nextClassCard()}</div></div>
 <div class="dashboard-grid"><div class="panel"><div class="panel-head"><h3>Recent earnings</h3><button class="btn small light" data-dash="earnings">View all</button></div><div class="list">${myE.map(e=>`<div class="list-item"><div class="meta"><strong>${esc(e.program)}</strong><small>${niceDate(e.date)}</small></div><span class="amount green">+ ${money(e.amount)}</span></div>`).join('')||'<div class="empty">No earnings yet.</div>'}</div></div>${ac.showTrends?`<div class="panel"><div class="panel-head"><h3>Latest trends</h3><button class="btn small light" data-dash="trends">View</button></div><div class="list">${state.trends.slice(0,3).map(t=>`<div class="list-item"><div class="meta"><strong>${esc(t.program)}</strong><small>${esc(t.title)}</small></div><span class="tag ${t.status==='New'?'green':''}">${esc(t.status)}</span></div>`).join('')}</div></div>`:''}</div>`
}
function nextClassCard(){const c=state.classes.find(x=>x.status==='Upcoming')||state.classes[0];return `<h3 style="margin:6px 0">${esc(c.title)}</h3><p style="color:#728096">${niceDate(c.date)} · ${esc(c.time)}<br>${esc(c.trainer)} · ${esc(c.batch)}</p><button class="btn primary" data-action="class-detail" data-id="${c.id}">Open Class</button>`}
window.playLesson = function(id) {
  state.currentLessonId = id;
  render();
};
window.setSpeed=function(r,btn){const v=document.getElementById('lessonVideo');if(v)v.playbackRate=r;document.querySelectorAll('[data-speed]').forEach(b=>{const on=parseFloat(b.getAttribute('data-speed'))===r;b.classList.toggle('primary',on);b.classList.toggle('light',!on);});};
window.toggleFullscreen=function(){const v=document.getElementById('lessonVideo');if(!v)return;if(document.fullscreenElement){document.exitFullscreen();}else if(v.requestFullscreen)v.requestFullscreen();else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();};
window.videoEnded=function(id){toast('🎬 Video finished! Tap "Mark as Complete" below.');const b=document.querySelector('[data-action="toggle-complete-lesson"]');if(b){b.style.boxShadow='0 0 0 3px rgba(139,92,246,.5)';b.scrollIntoView({behavior:'smooth',block:'nearest'});}};
window.saveNotes = function(id) {
  if(!state.studentNotes) state.studentNotes = {};
  state.studentNotes[id] = document.getElementById('lessonNotes').value;
  save();
  toast('✅ Notes Saved!');
};

function studentCourses(s){
  if(dbLessons===null){loadLessons();return `<div class="subpage-head"><div><h1>My Courses</h1><p style="color:#748195">Loading lessons…</p></div></div>`;} const _lessons=(dbLessons!==null)?dbLessons:(state.curriculum||[]); if(_lessons.length === 0) {
    return `<div class="subpage-head"><div><h1>My Courses</h1><p style="color:#748195">No video lessons available yet.</p></div></div>`;
  }
  if(!state.studentNotes) state.studentNotes = {};
  if(!s.completedLessons) s.completedLessons = [];
  
  const playingId = state.currentLessonId || _lessons[0].id;
  const current = _lessons.find(l=>l.id===playingId) || _lessons[0];
  const notes = state.studentNotes[current.id] || '';
  const isCompleted = s.completedLessons.includes(current.id);
  const total = _lessons.length;
  const comp = s.completedLessons.length;
  const progress = Math.round((comp/total)*100) || 0;

  return `<div class="subpage-head"><div><h1>My Courses</h1><p style="color:#748195">Progress: ${progress}% complete</p></div></div>
  <div style="display:flex; gap:20px; flex-wrap:wrap;">
    <div style="flex: 1 1 600px; display:flex; flex-direction:column; gap:16px;">
       <div style="background:#000; border-radius:12px; overflow:hidden; aspect-ratio:16/9;">
         ${current.kind==='file'
         ?`<video id="lessonVideo" src="${current.url}" controls playsinline preload="metadata" onended="videoEnded('${current.id}')" style="width:100%;height:100%;background:#000;"></video>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
              <span style="color:#8fa1b8;font-size:13px;">▶ Speed:</span>
              ${[0.5,0.75,1,1.25,1.5,2].map(r=>`<button class="btn small ${r===1?'primary':'light'}" data-speed="${r}" onclick="setSpeed(${r},this)">${r}x</button>`).join('')}
              <button class="btn small light" onclick="toggleFullscreen()" style="margin-left:auto;">⛶ Fullscreen</button>
            </div>`
         :`<iframe src="${current.url}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`}
       </div>
       <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
         <div>
           <h2 style="margin:0; font-size:20px; color:#edf5ff;">${esc(current.title)}</h2>
           <p style="margin:4px 0 0; color:#8fa1b8; font-size:14px;">${esc(current.module)}</p>
         </div>
         <button class="btn ${isCompleted ? 'light' : 'primary'}" data-action="toggle-complete-lesson" data-id="${current.id}">
            ${isCompleted ? '✅ Completed' : 'Mark as Complete'}
         </button>
       </div>
       <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
         <h3 style="margin:0 0 12px; color:#edf5ff; font-size:16px;">📝 My Notes</h3>
         <textarea id="lessonNotes" placeholder="📝 Write your notes here..." style="width:100%; height:120px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; color:#e2e8f0; font-family:inherit; resize:vertical; outline:none; transition:border-color 0.2s;" onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">${esc(notes)}</textarea>
         <button class="btn primary" style="margin-top:12px;" onclick="saveNotes('${current.id}')">Save Notes</button>
       </div>
    </div>
    <div style="flex: 0 0 300px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; height:fit-content; max-height:800px; overflow-y:auto;">
       <h3 style="margin:0 0 16px; color:#edf5ff;">Curriculum</h3>
       <div style="display:flex; flex-direction:column; gap:8px;">
         ${_lessons.map(l=>{
           const active = l.id === current.id;
           const done = s.completedLessons.includes(l.id);
           return `<div onclick="playLesson('${l.id}')" style="cursor:pointer; padding:12px; border-radius:8px; background:${active?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.02)'}; border:1px solid ${active?'#8b5cf6':'rgba(255,255,255,0.05)'}; transition:background 0.2s;">
             <div style="display:flex; justify-content:space-between; align-items:center;">
               <strong style="color:${active?'#c4b5fd':'#e2e8f0'}; font-size:14px;">${esc(l.title)}</strong>
               ${done?'<span style="color:#34d399; font-size:12px;">✅</span>':''}
             </div>
             <p style="margin:4px 0 0; font-size:12px; color:#8fa1b8;">${esc(l.module)} · ${esc(l.duration)}</p>
           </div>`;
         }).join('')}
       </div>
    </div>
  </div>`;
}
function studentLive(){return `<div class="subpage-head"><div><h1>Curriculum</h1><p style="color:#748195">Upcoming sessions and previous recordings.</p></div></div><div class="live-grid">${state.classes.map(c=>`<div class="live-card"><span class="tag ${c.status==='Upcoming'?'orange':'green'}">${esc(c.status)}</span><h3 style="margin-top:14px">${esc(c.title)}</h3><p style="color:#748195">${niceDate(c.date)} · ${esc(c.time)}<br>${esc(c.trainer)} · ${esc(c.batch)}</p><button class="btn primary" data-action="class-detail" data-id="${c.id}">${c.status==='Upcoming'?'Join Class':'Watch Recording'}</button></div>`).join('')}</div>`}
function studentTrends(){return `<div class="subpage-head"><div><h1>Trend Updates</h1><p style="color:#748195">New creator trends published by Admin.</p></div></div><div class="cards">${state.trends.map(t=>`<div class="card"><div style="display:flex;justify-content:space-between"><span class="pill">${esc(t.program)}</span><span class="tag ${t.status==='New'?'green':''}">${esc(t.status)}</span></div><h3 style="margin-top:16px">${esc(t.title)}</h3><p>Difficulty: ${esc(t.difficulty)} · Added ${niceDate(t.added)}</p><button class="btn primary" data-action="trend-detail" data-id="${t.id}">View Tutorial</button></div>`).join('')}</div>`}

function studentLeaderboard(s) {
  // Real ranking: all students sorted by total earnings (lifetime) - dynamic!
  const ranked = (state.students||[]).map(st=>({
    name: st.name, avatar: st.avatar, lifetime: Number(st.lifetime||0),
    isMe: s && st.id===s.id
  })).sort((a,b)=>b.lifetime-a.lifetime);

  const medal = ['🥇','🥈','🥉'];
  const badge = i => i===0?'👑 Champion': i===1?'🥈 Runner-up': i===2?'🥉 3rd Place': '#'+(i+1);
  const rankColor = i => i===0?'#f59e0b': i===1?'#94a3b8': i===2?'#cd7c2f':'#8b5cf6';
  const avatarFor = u => u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff&rounded=true`;

  return `
    <div class="subpage-head">
      <div>
        <h1 style="color:#edf5ff;">🏆 Leaderboard</h1>
        <p style="color:#8fa1b8;">Ranked by total earnings — higher earnings, higher rank!</p>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:20px; box-shadow:0 8px 32px rgba(0,0,0,0.2); max-width:720px;">
      <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr>
          <th style="background:rgba(139,92,246,0.15);color:#a78bfa;padding:11px 14px;text-align:left;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Rank</th>
          <th style="background:rgba(139,92,246,0.15);color:#a78bfa;padding:11px 14px;text-align:left;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Student</th>
          <th style="background:rgba(139,92,246,0.15);color:#a78bfa;padding:11px 14px;text-align:right;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Earnings</th>
        </tr></thead>
        <tbody>
          ${ranked.length===0?'<tr><td colspan="3" style="padding:20px;text-align:center;color:#8fa1b8;">No students yet.</td></tr>':ranked.map((u,idx)=>`
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);${u.isMe?'background:rgba(139,92,246,0.12);':''}">
              <td style="padding:10px 14px;"><span style="font-weight:800;color:${rankColor(idx)};font-size:14px;">${idx<3?medal[idx]+' ':''}${badge(idx)}</span></td>
              <td style="padding:10px 14px;"><div style="display:flex;align-items:center;gap:10px;"><img src="${avatarFor(u)}" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid rgba(139,92,246,0.4);"><span style="color:#e2e8f0;font-weight:600;font-size:14px;">${esc(u.name)}${u.isMe?' <span style="font-size:11px;color:#a78bfa;">(you)</span>':''}</span></div></td>
              <td style="padding:10px 14px;text-align:right;font-weight:800;color:#34d399;font-size:14px;">${money(u.lifetime)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      </div>
    </div>`;
}
function studentPerformance(s){return `<div class="subpage-head"><div><h1>Performance</h1><p style="color:#748195">Your learning and participation summary.</p></div></div><div class="dash-card-grid"><div class="dash-card"><small>Course Progress</small><strong>${s.progress}%</strong><div class="progress" style="margin-top:9px"><i style="width:${s.progress}%"></i></div></div><div class="dash-card"><small>Attendance</small><strong>${s.attendance}%</strong><div class="progress" style="margin-top:9px"><i style="width:${s.attendance}%"></i></div></div><div class="dash-card"><small>Tasks Completed</small><strong>${s.tasksDone}/${s.tasksTotal}</strong><div class="delta">Practical assignments</div></div><div class="dash-card"><small>Trend Participation</small><strong>${s.trendParticipation}</strong><div class="delta">Creator updates completed</div></div></div><div class="dashboard-grid"><div class="panel"><h3>Performance level</h3><h2 style="font-size:44px;margin:18px 0 8px">${esc(s.performance)}</h2><p style="color:#748195">This score combines course progress, attendance, tasks and trend participation.</p></div><div class="panel"><h3>Recommended next step</h3><p style="color:#748195">Complete the next live class, finish any pending tasks and review the latest creator trend tutorial.</p><button class="btn primary" data-dash="trends">Open Trends</button></div></div>`}
function studentEarnings(s){const rows=state.earnings.filter(e=>e.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));const totals=earningSummary(s.id);return `<div class="subpage-head"><div><h1>Earnings</h1><p style="color:#748195">Approved payout credits assigned to your account.</p></div><button class="btn primary" data-dash="withdraw">Withdraw</button></div><div class="dash-card-grid"><div class="dash-card"><small>Available Balance</small><strong style="color:#059669">${money(s.available)}</strong></div><div class="dash-card"><small>Pending Balance</small><strong style="color:#d97706">${money(s.pending||0)}</strong></div><div class="dash-card"><small>Total Paid</small><strong>${money(s.paid)}</strong></div><div class="dash-card"><small>Total Earnings</small><strong>${money(totals.lifetime)}</strong></div></div><div class="panel" style="margin-top:16px"><div class="notice">Dashboard earnings are approved payout credits. See the Earnings & Balance Policy for what this amount means.</div><div class="table-wrap" style="margin-top:13px"><table class="table"><thead><tr><th>Date</th><th>Program</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.map(e=>`<tr><td>${niceDate(e.date)}</td><td>${esc(e.program)}</td><td class="amount green">${money(e.amount)}</td><td><span class="tag green">Approved</span></td></tr>`).join('')}</tbody></table></div></div>`}
function studentWithdraw(s){
  if(s.kyc?.status !== 'Verified') {
    return `<div class="subpage-head"><div><h1>Withdraw</h1><p style="color:#748195">Request your available approved balance.</p></div></div><div class="panel" style="text-align:center; padding:40px 20px;"><div style="font-size:48px; margin-bottom:16px;">🔒</div><h2>Withdrawals Locked</h2><p style="color:#8fa1b8; margin-top:10px; max-width:400px; margin-left:auto; margin-right:auto;">Complete KYC identity verification in your profile before requesting withdrawals.</p><button class="btn primary" style="margin-top:24px;" data-dash="profile">Go to Profile</button></div>`;
  }
  return `<div class="subpage-head"><div><h1>Withdraw</h1><p style="color:#748195">Request your available approved balance.</p></div></div><div class="dash-card-grid" style="margin-bottom:18px"><div class="dash-card"><small>Available Balance</small><strong style="color:#059669">${money(s.available)}</strong><div class="delta">Available to request</div></div><div class="dash-card"><small>Pending Balance</small><strong style="color:#d97706">${money(s.pending||0)}</strong><div class="delta">Awaiting admin review</div></div><div class="dash-card"><small>Total Withdrawn</small><strong>${money(s.paid)}</strong><div class="delta">Completed payouts</div></div></div><div class="dashboard-grid"><form class="panel" id="withdrawForm"><div class="panel-head"><h3>New withdrawal request</h3><span class="tag green">${money(s.available)} available</span></div><div class="field"><label>Amount</label><input required type="number" name="amount" min="50" step="0.01" placeholder="50.00"></div><div class="field"><label>Payout method</label><select name="method" id="payoutMethod"><option>JazzCash</option><option>Easypaisa</option><option>SadaPay</option><option>NayaPay</option><option>Bank Transfer</option></select></div><div class="field"><label>Account Holder Name / Title</label><input required name="accountName" value="${esc(s.accountName||'')}" placeholder="Enter account title"></div><div class="field"><label>Account / IBAN / mobile number</label><input required name="account" value="${esc(s.payoutAccount||'')}" placeholder="Enter payout account"></div><div class="notice">Only request a payout to an account you control. Your dashboard balance is displayed in USD; local-wallet settlement may be converted during processing. Never share wallet PINs, OTPs or banking passwords.</div><button class="btn primary" style="margin-top:14px;width:100%" type="submit">Request Withdrawal</button></form><div class="panel"><h3>Supported methods</h3><div class="bank-grid" style="margin-top:14px"><div class="bank-option"><span class="bank-logo jazz">JC</span><strong>JazzCash</strong></div><div class="bank-option"><span class="bank-logo easy">EP</span><strong>Easypaisa</strong></div><div class="bank-option"><span class="bank-logo sada">SD</span><strong>SadaPay</strong></div><div class="bank-option"><span class="bank-logo naya">NP</span><strong>NayaPay</strong></div><div class="bank-option"><span class="bank-logo bank">PK</span><strong>Bank Transfer</strong></div></div><p style="color:#748195;margin-top:18px">${esc(state.settings.weeklyUpdateText)}</p></div></div>`
}
function studentPayments(s){const rows=state.withdrawals.filter(w=>w.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));return `<div class="subpage-head"><div><h1>Payment History</h1><p style="color:#748195">Withdrawal requests and completed payments.</p></div></div><div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Request Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead><tbody>${rows.map(w=>`<tr><td>${esc(w.id)}</td><td>${niceDate(w.date)}</td><td>${money(w.amount)}</td><td>${esc(w.method)}</td><td><span class="tag ${w.status==='Paid'?'green':w.status==='Rejected'?'red':'orange'}">${esc(w.status)}</span></td><td>${esc(w.reference||'—')}</td></tr>`).join('')||'<tr><td colspan="6">No payment history.</td></tr>'}</tbody></table></div></div>`}
function studentNotifications(s){const rows=state.notifications.filter(n=>n.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));return `<div class="subpage-head"><div><h1>Notifications</h1><p style="color:#748195">Earnings, trends, classes and payment updates.</p></div><button class="btn light" data-action="mark-notifications">Mark all read</button></div><div class="list">${rows.map(n=>`<div class="notif-item${n.read?'':' notif-unread'}"><div class="meta"><strong>${esc(n.title)}</strong><small>${niceDate(n.date)} · ${esc(n.body)}</small></div>${n.read?'':'<span class="notif-badge">New</span>'}</div>`).join('')||'<div class="empty">No notifications.</div>'}</div>`}
function studentProfile(s){
  const storedAvatar = localStorage.getItem('userAvatar');
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&rounded=true`;
  const currentAvatar = storedAvatar || s.avatar || fallbackUrl;
  return `<div class="subpage-head"><div><h1>Profile</h1><p style="color:#748195">Your account and payout details.</p></div></div>
<div class="panel" style="margin-bottom:20px;">
  <h3 style="margin-bottom:15px; color:#edf5ff;">Profile Picture</h3>
  <div style="display:flex; align-items:center; gap:20px;">
    <img id="profilePreview" src="${currentAvatar}" alt="Your avatar" style="width:72px; height:72px; border-radius:50%; border:3px solid rgba(139,92,246,0.5); object-fit:cover; flex-shrink:0;">
    <div>
      <label for="avatarUpload" style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; background:linear-gradient(135deg,#7c3aed,#22d3ee); color:#fff; font-weight:700; font-size:13px; padding:10px 20px; border-radius:999px; box-shadow:0 4px 18px rgba(124,58,237,0.4); transition:opacity .2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
        📤 Upload Photo
        <input type="file" id="avatarUpload" accept="image/*" style="display:none;">
      </label>
      <p style="color:#8fa1b8; font-size:12px; margin-top:8px;">Recommended: Square image, max 2MB.</p>
    </div>
  </div>
</div>
<form class="panel" id="profileForm"><div class="profile-grid"><div class="field"><label>Full name</label><input name="name" value="${esc(s.name)}"></div><div class="field"><label>Email</label><input name="email" value="${esc(s.email)}" disabled></div><div class="field"><label>Phone</label><input name="phone" value="${esc(s.phone)}"></div><div class="field"><label>ID Card Number (CNIC)</label><input name="cnic" value="${esc(s.cnic||'')}" disabled></div><p style="color:#8fa1b8; font-size:12px; margin-top:8px;">To update your ID, please contact Admin support.</p><div class="field"><label>City</label><input name="city" value="${esc(s.city||'')}"></div><div class="field"><label>Preferred payout method</label><select name="payoutMethod">${['JazzCash','Easypaisa','SadaPay','NayaPay','Bank Transfer'].map(x=>`<option ${s.payoutMethod===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Payout account</label><input name="payoutAccount" value="${esc(s.payoutAccount||'')}"></div></div><div class="field"><label>About</label><textarea name="bio" rows="4">${esc(s.bio||'')}</textarea></div><button class="btn primary" type="submit">Save Profile</button></form>
<div class="panel" style="margin-top:20px;">
  <h3 style="margin-bottom:15px; color:#edf5ff;">Identity Verification (KYC)</h3>
  <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
    <p style="color:#8fa1b8; font-size:13px; margin-bottom:15px;">Upload a clear photo of your Government ID (CNIC, B-Form, or Student ID) to verify your account and unlock withdrawals. Minimum withdrawal is $50.</p>
    <div style="margin-bottom:15px;">
      <span style="font-size:13px; font-weight:600; color:#cbd5e1;">Status:</span>
      <span class="tag ${s.kyc?.status === 'Verified' ? 'green' : s.kyc?.status === 'Pending' ? 'orange' : 'red'}" style="margin-left:8px;">${s.kyc?.status || 'Unverified'}</span>
    </div>
    ${s.kyc?.status === 'Verified' ? `<p style="color:#10b981; font-size:13px; font-weight:600;">Your identity is verified. You can request withdrawals.</p>` : s.kyc?.status === 'Pending' ? `<p style="color:#f59e0b; font-size:13px; font-weight:600;">Your document is under review by the admin.</p>` : `
    <form id="kycForm">
      <div class="field">
        <label>Official Document Number</label>
        <input required name="docNumber" id="kycDocNumber" value="${esc(s.kyc?.docNumber||'')}" placeholder="e.g., 33100-1234567-1" maxlength="15" oninput="let v=this.value.replace(/[^0-9]/g,''); if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5); if(v.length>13)v=v.slice(0,13)+'-'+v.slice(13); this.value=v.slice(0,15);">
      </div>
      <div class="field">
        <label>Upload ID Photo</label>
        <input required type="file" accept="image/*" id="kycDoc" style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; width:100%; color:#e2e8f0; font-size:13px; border:1px solid rgba(255,255,255,0.1);">
      </div>
      <button class="btn primary" type="submit" style="width:100%;">Submit Document</button>
    </form>`}
  </div>
</div>`
}
function studentSupport(s=currentStudent()){
  const tickets=(state.supportMessages||[]).filter(x=>x.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="subpage-head"><div><h1>Support</h1><p style="color:#748195">Get help with your account, classes or payout request.</p></div></div>
  <div class="dashboard-grid">
    <form class="panel" id="supportForm">
      <h3>Create Support Ticket</h3>
      <div class="field"><label>Topic</label><select name="topic"><option>Account Help</option><option>Course / Class</option><option>Earnings / Payout</option><option>Technical Issue</option></select></div>
      <div class="field"><label>Message</label><textarea required name="message" rows="5" placeholder="Describe your issue clearly"></textarea></div>
      <button class="btn primary" type="submit">Submit Ticket</button>
    </form>
    <div>
      <div class="panel" style="margin-bottom:20px;">
        <h3>Support & safety</h3>
        <p style="color:#748195;margin:10px 0;">Email: ${esc(state.settings.supportEmail)}<br>WhatsApp: ${esc(state.settings.supportWhatsApp)}</p>
        <div class="notice">Support will never ask for your PIN, OTP, CVV or password.</div>
      </div>
      <h3 style="margin-bottom:12px; margin-top:24px;">Your Previous Queries</h3>
      <div class="ticket-list">
        ${tickets.map(t=>`
          <div class="ticket-card ${t.status==='Resolved'?'resolved':''}" style="cursor:default">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <strong>${esc(t.topic)}</strong><span class="tag ${t.status==='Resolved'?'green':'orange'}">${esc(t.status)}</span>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:6px;font-size:14px;margin-bottom:10px;border-left:3px solid #3b82f6">${esc(t.message)}</div>
            ${t.reply ? `
              <small style="color:#8b5cf6;display:block;margin-bottom:4px">Admin Reply</small>
              <div style="background:rgba(139,92,246,0.1);padding:10px;border-radius:6px;font-size:14px;border-left:3px solid #8b5cf6">${esc(t.reply)}</div>
            ` : ''}
          </div>
        `).join('')||'<div class="empty">No support tickets yet.</div>'}
      </div>
    </div>
  </div>`;
}

function adminSidebar(){
  if(!state.unreadCounts) state.unreadCounts = { trends: 0, adminSupport: 0, withdrawals: 0, kyc: 0, approvals: 0 };
  const uc = state.unreadCounts;
  const items=[['overview','🏠 Overview'],['students','👥 Students'],['approvals','✅ Approvals'],['kyc','🆔 KYC Approvals'],['curriculum','📤 Video Upload'],['assignments','📝 Assignments'],['courses','📚 Courses'],['live','🎥 Curriculum'],['programs','🧩 Programs'],['trends','🔥 Trends'],['earnings','💰 Earnings'],['withdrawals','🏦 Withdrawals'],['notifications','🔔 Notify'],['support','💬 Support'],['settings','⚙️ Settings']];
  return `<aside class="sidebar"><div class="side-profile"><strong>${esc(state.admin.name)}</strong><div style="margin-top:5px"><span class="role-badge role-admin">Admin</span></div></div><div class="side-nav">${items.map(([id,l])=>`<button class="${adminView===id?'active':''}" data-admin="${id}" style="display:flex;justify-content:space-between;align-items:center;"><span>${l}</span>${id==='support' && uc.adminSupport>0?`<span class="nav-badge">${uc.adminSupport}</span>`:id==='withdrawals' && uc.withdrawals>0?`<span class="nav-badge">${uc.withdrawals}</span>`:id==='kyc' && uc.kyc>0?`<span class="nav-badge">${uc.kyc}</span>`:id==='approvals' && uc.approvals>0?`<span class="nav-badge">${uc.approvals}</span>`:''}</button>`).join('')}<button data-action="logout">↩ Logout</button></div></aside>`
}
function adminDashboard(){if(!state.session||state.session.role!=='admin'){openAuth('login');location.hash='#/';return homePage()}return `<div class="dashboard-page"><div class="dashboard-shell">${adminSidebar()}<section class="dashboard-main" id="adminContent">${adminPanel()}</section></div></div>`}
function adminPanel(){
 if(adminView==='students') return adminStudents(); if(adminView==='approvals') return adminApprovals(); if(adminView==='kyc') return adminKYC(); if(adminView==='curriculum') return adminCurriculum(); if(adminView==='assignments') return adminAssignments(); if(adminView==='courses') return adminCourses(); if(adminView==='live') return adminLive(); if(adminView==='programs') return adminPrograms(); if(adminView==='trends') return adminTrends(); if(adminView==='earnings') return adminEarnings(); if(adminView==='withdrawals') return adminWithdrawals(); if(adminView==='notifications') return adminNotify(); if(adminView==='support') return adminSupport(); if(adminView==='settings') return adminSettings();
 const pending=state.withdrawals.filter(w=>w.status==='Pending').length,totalPaid=state.withdrawals.filter(w=>w.status==='Paid').reduce((a,b)=>a+b.amount,0);
 const totalRevenue = state.students.reduce((sum, s) => sum + (Number(s.lifetime) || 0), 0);
 const activeSubs = state.students.filter(s => s.status !== 'Suspended').length;
 return `<div class="admin-banner"><span class="kicker" style="color:#a7f3ff">Admin Control Center</span><h1 style="margin:8px 0 6px">Mughees Editor Platform</h1><p>Manage students, classes, programs, approved earnings, payout requests and notifications.</p></div><div class="admin-stats"><div class="dash-card"><small>Total Students</small><strong>${state.students.length}</strong></div><div class="dash-card"><small>Active Subscriptions</small><strong>${activeSubs}</strong></div><div class="dash-card"><small>Total Revenue</small><strong>${money(totalRevenue)}</strong></div><div class="dash-card"><small>Pending Withdrawals</small><strong>${pending}</strong></div></div><div class="dashboard-grid"><div class="panel"><div class="panel-head"><h3>Students</h3><button class="btn small light" data-admin="students">Manage</button></div><div class="list">${state.students.map(s=>`<div class="list-item"><div class="meta"><strong>${esc(s.name)}</strong><small>@${esc(s.name).toLowerCase().replace(/\s+/g,'')}${s.id.slice(-3)} · ${esc(s.program)}</small></div><span class="amount green">${money(s.available)}</span></div>`).join('')}</div></div><div class="panel"><div class="panel-head"><h3>Upcoming classes</h3><button class="btn small light" data-admin="live">Manage</button></div><div class="list">${state.classes.filter(c=>c.status==='Upcoming').map(c=>`<div class="list-item"><div class="meta"><strong>${esc(c.title)}</strong><small>${niceDate(c.date)} · ${esc(c.time)}</small></div></div>`).join('')}</div></div></div>`
}
async function notifyEmail(type,userId){try{await fetch('https://ijsvpdraigzvxeeuedzd.supabase.co/functions/v1/notify',{method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_FlaAOinEJSeHyLTEaEAJrQ_QR_N3dBe'},body:JSON.stringify({type,userId})});}catch(e){}}
let pendingApprovals=[];
async function loadApprovals(){try{const{data,error}=await supabase.from('profiles').select('id,email,name,phone,network').eq('status','pending');if(!error)pendingApprovals=data||[];}catch(e){pendingApprovals=[];} state.unreadCounts.approvals=pendingApprovals.length; save(); const abtn=document.querySelector('.side-nav button[data-admin="approvals"]'); if(abtn){let b=abtn.querySelector('.nav-badge'); if(pendingApprovals.length>0){if(!b){b=document.createElement('span');b.className='nav-badge';abtn.appendChild(b);} b.textContent=pendingApprovals.length;} else if(b)b.remove();} if(adminView==='approvals'){const c=$('#adminContent');if(c)c.innerHTML=adminApprovals();bindForms();}}
function adminApprovals(){return `<div class="subpage-head"><div><h1>Pending Approvals</h1><p style="color:#748195">New signups waiting for admin access.</p></div><button class="btn small light" data-action="refresh-approvals">↻ Refresh</button></div><div class="panel">${pendingApprovals.length===0?'<div class="empty" style="padding:20px;">No pending requests. 🎉</div>':`<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Network</th><th>Requested</th><th>Actions</th></tr></thead><tbody>${pendingApprovals.map(p=>`<tr><td><strong>${esc(p.name||'—')}</strong></td><td>${esc(p.email)}</td><td>${esc(p.phone||'—')}</td><td>${esc(p.network||'—')}</td><td>—</td><td><button class="btn small primary" data-action="approve-user" data-id="${p.id}">Approve</button> <button class="btn small danger" data-action="reject-user" data-id="${p.id}">Reject</button></td></tr>`).join('')}</tbody></table></div>`}</div>`}
function adminStudents(){
  return `<div class="subpage-head">
    <div><h1>Manage Users</h1><p style="color:#748195">User management and access control.</p></div>
  </div>
  <div class="panel">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Profile</th><th>Name</th><th>Join Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${state.students.map(s=>{
            const storedAvatar=(s.id===state.session?.studentId)?localStorage.getItem('userAvatar'):null;
            const fallbackUrl=`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&rounded=true`;
            const avatarImg=storedAvatar||s.avatar||fallbackUrl;
            const isSuspended=s.status==='Suspended';
            return `<tr>
              <td><img src="${avatarImg}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1);"></td>
              <td><strong>${esc(s.name)}</strong><br><small style="color:#8fa1b8">@${esc(s.name).toLowerCase().replace(/\s+/g,'')}${s.id.slice(-3)}</small></td>
              <td>${niceDate(s.joinDate)}</td>
              <td><span class="tag ${isSuspended?'red':'green'}">${esc(s.status||'Active Creator')}</span></td>
              <td>
                <button class="btn small primary" data-action="edit-user" data-id="${s.id}">Edit</button> 
                <button class="btn small orange" data-action="suspend-user" data-id="${s.id}">${isSuspended?'Activate':'Suspend'}</button> 
                <button class="btn small danger" data-action="delete-user" data-id="${s.id}">Delete</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
function adminKYC(){
  const pending = state.students.filter(s => s.kyc?.status === 'Pending');
  return `<div class="subpage-head"><div><h1>KYC Approvals</h1><p style="color:#748195">Review and approve student identity documents.</p></div></div>
  <div class="panel">
    ${pending.length === 0 ? '<div class="empty">No pending KYC requests.</div>' : `
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Student</th><th>Document Info</th><th>Action</th></tr></thead>
        <tbody>
          ${pending.map(s => {
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&rounded=true`;
            const avatarImg = s.avatar || fallbackUrl;
            const shortId = '@' + s.name.toLowerCase().replace(/\s+/g, '') + s.id.slice(-3);
            return `<tr>
              <td>
                <div style="display:flex;align-items:center;gap:12px;">
                  <img src="${avatarImg}" onerror="this.onerror=null; this.src='${fallbackUrl}';" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1);">
                  <div><strong>${esc(s.name)}</strong><br><small style="color:#8fa1b8">${shortId}</small></div>
                </div>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:6px;font-size:13px; margin-bottom:6px;"><strong>ID Card #:</strong> ${esc(s.kyc.docNumber)} <span title="Strictly Confidential - End-to-End Encrypted" style="color:#10b981;cursor:help;font-size:13px;">🛡️</span></div>
                <div data-action="view-kyc-doc" data-url="${s.kyc.docUrl}" style="display:inline-block; border:1px solid rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; cursor:zoom-in;">
                  <img src="${s.kyc.docUrl}" style="height:60px; width:90px; object-fit:cover; display:block;">
                </div>
              </td>
              <td>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <button class="btn small kyc-approve" data-action="approve-kyc" data-id="${s.id}">Approve</button>
                  <button class="btn small kyc-reject" data-action="reject-kyc" data-id="${s.id}">Reject</button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    `}
  </div>`;
}
async function loadLessons(){try{const{data,error}=await supabase.from('lessons').select('*').order('created_at',{ascending:false});if(!error)dbLessons=(data||[]).map(l=>({id:l.id,title:l.title,module:l.description||'',url:l.video_url,kind:l.kind||'embed',duration:l.duration_minutes?l.duration_minutes+' min':''}));}catch(e){if(dbLessons===null)dbLessons=[];}
 if(adminView==='curriculum'){const c=$('#adminContent');if(c){c.innerHTML=adminCurriculum();bindForms();}}
 if(typeof dashView!=='undefined'&&dashView==='courses'&&route()==='dashboard'){const d=$('#dashContent');if(d){try{d.innerHTML=studentView(currentStudent());bindGlobal();}catch(e){}}}}
function adminCurriculum(){
  if(!state.curriculum) state.curriculum = [];
  return `<div class="subpage-head"><div><h1>Video Upload</h1><p style="color:#748195">Upload recordings or add YouTube/Vimeo links — lessons appear for all students.</p></div></div>
  <div class="panel">
    <div class="panel-head"><h3>Add New Video Lesson</h3></div><p class="micro" style="padding:0 20px;color:#748195;">Upload a recording or paste a YouTube/Vimeo link — lessons appear for all students instantly.</p>
    <form id="addLessonForm" style="display:flex; flex-direction:column; gap:12px; padding:20px;">
       <div class="field"><label>Lesson Title</label><input name="title" required placeholder="e.g. Intro to Video Editing"></div>
       <div class="field"><label>Module / Chapter Name</label><input name="module" required placeholder="e.g. Module 1: Basics"></div>
       <div class="field"><label>Option A — Upload recording (video file)</label><input type="file" name="videofile" id="lesson_videofile" accept="video/*"><p class="micro" style="color:#748195;margin-top:6px;">MP4 recommended. If you choose a file, the URL field below is ignored.</p></div><div class="field"><label>Option B — Video URL (YouTube/Vimeo embed)</label><input name="url" id="lesson_url" placeholder="https://www.youtube.com/embed/..."></div>
       <div class="field"><label>Duration (minutes)</label><input name="duration" required inputmode="numeric" placeholder="e.g. 10"></div>
       <button class="btn primary" type="submit">Add Lesson</button>
    </form>
  </div>
  <div class="panel" style="margin-top:20px;">
    <div class="panel-head"><h3>Existing Lessons</h3></div>
    <div class="list">
       ${(dbLessons!==null?dbLessons:state.curriculum).length===0?'<div class="empty" style="padding:20px;">No lessons uploaded yet.</div>' : (dbLessons!==null?dbLessons:state.curriculum).map(l=>`<div class="list-item" style="justify-content:space-between"><div class="meta"><strong>${esc(l.title)}</strong><small>${esc(l.module)} · ${esc(l.duration||'')} ${l.kind==='file'?'· 📤':'· 🔗'}</small></div><button class="btn small light" data-action="delete-lesson" data-id="${l.id}" style="color:#ef4444; border-color:#ef4444;">Delete</button></div>`).join('')}
    </div>
  </div>`;
}
// ── ASSIGNMENTS ──
let dbAssignments = null;
async function loadAssignments(){
  try{
    const {data,error} = await supabase.from('assignments').select('*').eq('status','active').order('created_at',{ascending:false});
    dbAssignments = error ? [] : (data || []);
  }catch(e){ dbAssignments = []; }
  if(adminView==='assignments'){const c=document.getElementById('adminContent'); if(c){c.innerHTML=adminAssignments(); bindGlobal(); bindForms();}}
}
function adminAssignments(){
  if(dbAssignments===null){loadAssignments();return `<div class="subpage-head"><div><h1>Assignments</h1><p style="color:#748195">Loading…</p></div></div>`;}
  const list = dbAssignments||[];
  return `<div class="subpage-head"><div><h1>📝 Assignments</h1><p style="color:#748195">Create assignments for students and review submissions.</p></div></div>
  <div class="dashboard-grid"><form class="panel" id="addAssignmentForm"><h3>New Assignment</h3>
    <div class="field"><label>Title</label><input required name="title" placeholder="e.g. CapCut Transitions Practice"></div>
    <div class="field"><label>Description / Instructions</label><textarea required name="description" rows="4" placeholder="What should the student do?"></textarea></div>
    <div class="field"><label>Deadline (optional)</label><input type="date" name="deadline"></div>
    <button class="btn primary" type="submit">Publish Assignment</button></form>
  <div class="panel"><h3>Published (${list.length})</h3><div class="list" style="margin-top:14px">
    ${list.length===0?'<div class="empty">No assignments yet.</div>':list.map(a=>`<div class="list-item"><div class="meta"><strong>${esc(a.title)}</strong><small>${a.deadline?'Deadline: '+niceDate(a.deadline):'No deadline'} · <a href="#" data-action="view-submissions" data-id="${a.id}" style="color:#8b5cf6;">View submissions</a> | <a href="#" data-action="delete-assignment" data-id="${a.id}" style="color:#ef4444;">Delete</a></small></div></div>`).join('')}
  </div></div></div>
  <div class="panel" id="submissionsPanel" style="margin-top:16px;display:none;"><h3>Submissions</h3><div id="submissionsList"><div class="empty">Select "View submissions" on an assignment.</div></div></div>`;
}
async function loadSubmissions(assignmentId){
  const panel=document.getElementById('submissionsPanel'), listEl=document.getElementById('submissionsList');
  if(panel)panel.style.display='block';
  if(listEl)listEl.innerHTML='<div class="empty">Loading submissions…</div>';
  try{
    const {data,error}=await supabase.from('assignment_submissions').select('*,profiles!assignment_submissions_student_id_fkey(name,email)').eq('assignment_id',assignmentId).order('submitted_at',{ascending:false});
    if(error)throw error;
    if(listEl)listEl.innerHTML=(data||[]).length===0?'<div class="empty">No submissions yet.</div>':`<div class="list">${data.map(s=>`<div class="list-item"><div class="meta"><strong>${esc(s.profiles?.name||'Student')}</strong><small>${esc(s.profiles?.email||'')} · ${new Date(s.submitted_at).toLocaleString()}</small><p style="margin:8px 0 0;color:#c4b5fd;">${esc(s.submission_text||'')}</p>${s.submission_url?`<a href="${esc(s.submission_url)}" target="_blank" style="color:#8b5cf6;font-size:13px;">🔗 View link</a>`:''}</div><span class="tag green">${esc(s.status)}</span></div>`).join('')}</div>`;
    if(panel)panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(e){ if(listEl)listEl.innerHTML='<div class="empty">Failed to load: '+esc(e.message)+'</div>'; }
}
function studentAssignments(s){
  if(dbAssignments===null){loadAssignments();return `<div class="subpage-head"><div><h1>Assignments</h1><p style="color:#748195">Loading…</p></div></div>`;}
  const list=dbAssignments||[];
  const sub=(s.assignmentSubs||{});
  return `<div class="subpage-head"><div><h1>📝 Assignments</h1><p style="color:#748195">Complete and submit your assignments.</p></div></div>
  ${list.length===0?'<div class="empty">No assignments yet. Check back soon!</div>':`<div class="cards" style="grid-template-columns:1fr;">${list.map(a=>{
    const done=sub[a.id];
    return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:start;"><h3 style="margin:0;">${esc(a.title)}</h3>${done?'<span class="tag green">✅ Submitted</span>':a.deadline?'<span class="tag orange">Due: '+niceDate(a.deadline)+'</span>':''}</div>
    <p style="color:#8fa1b8;margin:10px 0;">${esc(a.description||'')}</p>
    ${done?`<div class="notice">Submitted on ${new Date(done.submitted_at).toLocaleString()}</div>`:
    `<form data-assignment-form="${a.id}" style="margin-top:12px;"><div class="field"><label>Your answer / work description</label><textarea name="stext" rows="3" required placeholder="Describe what you did…"></textarea></div><div class="field"><label>Link (optional — video/post URL)</label><input name="surl" placeholder="https://…"></div><button class="btn primary" type="submit">Submit Assignment</button></form>`}
    </div>`;}).join('')}</div>`}`;
}
async function loadMySubmissions(){
  try{
    const uid=await getUid(); if(!uid)return;
    const {data}=await supabase.from('assignment_submissions').select('assignment_id,submitted_at').eq('student_id',uid);
    const s=currentStudent(); if(s){s.assignmentSubs={}; (data||[]).forEach(r=>s.assignmentSubs[r.assignment_id]=r); save();}
    if(dashView==='assignments'){const d=document.getElementById('dashContent'); if(d){d.innerHTML=studentView(currentStudent()); bindGlobal();}}
  }catch(e){}
}

function adminCourses(){return `<div class="subpage-head"><div><h1>Courses</h1><p style="color:#748195">Manage curriculum, modules and student learning paths.</p></div></div><div class="cards">${state.courses.map(c=>`<div class="card"><span class="pill">${c.lessons} modules</span><h3 style="margin-top:14px">${esc(c.title)}</h3><p>${esc(c.desc)}</p><ul class="feature-list">${c.modules.map(m=>`<li>${esc(m)}</li>`).join('')}</ul><button class="btn light" data-action="edit-course" data-id="${c.id}">Edit Course</button></div>`).join('')}</div>`}
function adminLive(){return `<div class="subpage-head"><div><h1>Curriculum</h1><p style="color:#748195">Schedule classes and publish recordings.</p></div><button class="btn primary" data-action="add-class">+ Add Class</button></div><div class="panel"><table class="table"><thead><tr><th>Class</th><th>Date</th><th>Time</th><th>Trainer</th><th>Status</th></tr></thead><tbody>${state.classes.map(c=>`<tr><td>${esc(c.title)}</td><td>${niceDate(c.date)}</td><td>${esc(c.time)}</td><td>${esc(c.trainer)}</td><td><span class="tag ${c.status==='Upcoming'?'orange':'green'}">${esc(c.status)}</span></td></tr>`).join('')}</tbody></table></div>`}
function adminPrograms(){return `<div class="subpage-head"><div><h1>Creator Programs</h1><p style="color:#748195">Manage current programs and add future creator apps.</p></div><button class="btn primary" data-action="add-program">+ Add Program</button></div><div class="cards">${(state.programs||[]).map(p=>`<div class="card"><div class="icon-tile">${esc(p.code||p.name.slice(0,2).toUpperCase())}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><span class="tag green">${esc(p.status||'Active')}</span></div>`).join('')}</div>`}
function adminTrends(){return `<div class="subpage-head"><div><h1>Trend Updates</h1><p style="color:#748195">Publish trends and notify students.</p></div><button class="btn primary" data-action="add-trend">+ Add Trend</button></div><div class="panel"><table class="table"><thead><tr><th>Program</th><th>Trend</th><th>Added</th><th>Difficulty</th><th>Status</th></tr></thead><tbody>${state.trends.map(t=>`<tr><td>${esc(t.program)}</td><td>${esc(t.title)}</td><td>${niceDate(t.added)}</td><td>${esc(t.difficulty)}</td><td><span class="tag ${t.status==='New'?'green':''}">${esc(t.status)}</span></td></tr>`).join('')}</tbody></table></div>`}
function adminEarnings(){return `<div class="subpage-head"><div><h1>Earnings Management</h1><p style="color:#748195">Add student-visible approved payout credits. Optional source/accounting notes remain Admin-only.</p></div></div><div class="dashboard-grid"><form class="panel" id="addEarningForm"><h3>Add approved earning</h3><div class="field"><label>Student</label><select name="studentId">${state.students.map(s=>`<option value="${s.id}">${esc(s.name)} (@${esc(s.name).toLowerCase().replace(/\s+/g,'')}${s.id.slice(-3)})</option>`).join('')}</select></div><div class="field"><label>Program</label><select name="program"><option>Hypic</option><option>CapCut</option><option>TikTok Creator</option><option>Future App</option></select></div><div class="field"><label>Approved payout credit (student-visible)</label><input required type="number" min="0.01" step="0.01" name="amount" placeholder="25.00"></div><div class="field"><label>Earning date</label><input type="date" name="edate" id="earning_date"></div><div class="field"><label>Source gross / partner report (Admin-only, optional)</label><input type="number" min="0" step="0.01" name="internalGross" placeholder="Internal record only"></div><div class="field"><label>Internal note</label><textarea name="note" rows="3" placeholder="Weekly creator report"></textarea></div><button class="btn primary" type="submit">Add Earning & Notify Student</button></form><div class="panel"><h3>Recent credits</h3><div class="list" style="margin-top:14px">${state.earnings.slice().reverse().slice(0,8).map(e=>{const s=state.students.find(x=>x.id===e.studentId);return `<div class="list-item"><div class="meta"><strong>${esc(s?.name||e.studentId)} · ${esc(e.program)}</strong><small>${niceDate(e.date)}</small></div><span class="amount green">${money(e.amount)}</span></div>`}).join('')}</div></div></div>`}
function adminWithdrawals(){
  const pending=state.withdrawals.filter(w=>w.status==='Pending').sort((a,b)=>b.date.localeCompare(a.date));
  const processed=state.withdrawals.filter(w=>w.status!=='Pending').sort((a,b)=>b.date.localeCompare(a.date));
  const totalPendingAmt=pending.reduce((a,w)=>a+w.amount,0);

  const verifyCards = pending.map(w=>{
    const s=state.students.find(x=>x.id===w.studentId);
    const storedAvatar=(s?.id===state.session?.studentId)?localStorage.getItem('userAvatar'):null;
    const fallbackUrl=`https://ui-avatars.com/api/?name=${encodeURIComponent(s?.name||'User')}&background=random&color=fff&rounded=true`;
    const avatarImg=storedAvatar||s?.avatar||fallbackUrl;
    const searchableText = `${(s?.name||'').toLowerCase()} ${(s?.email||'').toLowerCase()} ${(s?.id||w.studentId).toLowerCase()} ${w.id.toLowerCase()}`;
    return `<div class="wd-verify-card pending-wd-card" data-search="${esc(searchableText)}">
      <div class="wd-verify-header">
        <span class="tag orange">Pending Verification</span>
        <span class="wd-verify-id">${esc(w.id)}</span>
      </div>
      <div class="wd-verify-body">
        <div class="wd-verify-identity">
          <img class="wd-verify-avatar" src="${esc(avatarImg)}" onerror="this.onerror=null; this.src='${fallbackUrl}';" alt="${esc(s?.name||'Student')}">
          <div class="wd-verify-info">
            <strong class="wd-verify-name">${esc(s?.name||'Unknown')}</strong>
            <span class="wd-verify-detail">🆔 ${esc(s?.id||w.studentId)}</span>
            <span class="wd-verify-detail">✉️ ${esc(s?.email||'N/A')}</span>
          </div>
        </div>
        <div class="wd-verify-amount-box">
          <small>Requested Amount</small>
          <strong class="wd-verify-amount">${money(w.amount)}</strong>
        </div>
      </div>
      <div class="wd-verify-details">
        <div class="wd-verify-detail-item" style="grid-column: span 2; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; margin-bottom: 4px;">
          <small>Account Title</small>
          <strong style="display:block; margin-top:2px; color:#a7f3ff; font-size:14px; text-transform:uppercase;">${esc(w.accountName||'N/A')}</strong>
        </div>
        <div class="wd-verify-detail-item">
          <small>Payment Method</small>
          <strong>${esc(w.method)}</strong>
        </div>
        <div class="wd-verify-detail-item">
          <small>Account Number</small>
          <strong>${esc(w.account)}</strong>
        </div>
        <div class="wd-verify-detail-item">
          <small>Request Date</small>
          <strong>${niceDate(w.date)}</strong>
        </div>
        <div class="wd-verify-detail-item">
          <small>Available Balance</small>
          <strong>${money(s?.available||0)}</strong>
        </div>
      </div>
      <div class="wd-verify-actions">
        <button class="btn primary" data-action="pay-withdrawal" data-id="${w.id}">✅ Approve & Mark Paid</button>
        <button class="btn danger" data-action="reject-withdrawal" data-id="${w.id}">❌ Reject & Return</button>
      </div>
    </div>`;
  }).join('');

  const historyRows = processed.map(w=>{
    const s=state.students.find(x=>x.id===w.studentId);
    return `<tr>
      <td>${esc(s?.name||w.studentId)}</td>
      <td>${money(w.amount)}</td>
      <td>${esc(w.method)}</td>
      <td>${niceDate(w.date)}</td>
      <td><span class="tag ${w.status==='Paid'?'green':'red'}">${esc(w.status)}</span></td>
      <td>${esc(w.reference||'—')}</td>
    </tr>`;
  }).join('');

  return `<div class="subpage-head">
    <div><h1>🏦 Withdrawals</h1><p style="color:#748195">Deep identity verification for every pending withdrawal request.</p></div>
  </div>
  <div class="dash-card-grid" style="margin-bottom:20px">
    <div class="dash-card"><small>Pending Requests</small><strong style="color:#d97706">${pending.length}</strong></div>
    <div class="dash-card"><small>Pending Amount</small><strong style="color:#d97706">${money(totalPendingAmt)}</strong></div>
    <div class="dash-card"><small>Total Processed</small><strong>${processed.length}</strong></div>
    <div class="dash-card"><small>Total Paid Out</small><strong style="color:#059669">${money(processed.filter(w=>w.status==='Paid').reduce((a,w)=>a+w.amount,0))}</strong></div>
  </div>
  ${pending.length>0 ? `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;"><h3 style="color:#e2e8f0; margin:0;">🔍 Pending Verification (${pending.length})</h3><input type="text" id="withdrawSearch" placeholder="Search by Name, Email, or ID..." style="padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white; width: 300px;" onkeyup="filterWithdrawals(this.value)"></div><div class="wd-verify-grid">${verifyCards}</div>` : '<div class="panel" style="text-align:center;padding:40px"><h3 style="color:#8fa1b8">✅ No pending withdrawal requests</h3><p style="color:#748195">All withdrawal requests have been processed.</p></div>'}
  ${processed.length>0 ? `<h3 style="color:#e2e8f0;margin:28px 0 14px">📋 Processed History</h3><div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Reference</th></tr></thead><tbody>${historyRows}</tbody></table></div></div>` : ''}`;
}
function adminNotify(){return `<div class="subpage-head"><div><h1>Send Notification</h1><p style="color:#748195">Message one student or all students.</p></div></div><form class="panel" id="notifyForm"><div class="field"><label>Recipient</label><select name="studentId"><option value="all">All Students</option>${state.students.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>Title</label><input required name="title" placeholder="New trend added"></div><div class="field"><label>Message</label><textarea required name="body" rows="4" placeholder="Your message"></textarea></div><button class="btn primary" type="submit">Send Notification</button></form>`}
function adminSupport(){
  const rows=(state.supportMessages||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  let selected = rows.find(x => x.id === activeSupportTicket) || rows[0];
  if(!selected && rows.length > 0) { selected = rows[0]; activeSupportTicket = selected.id; }
  return `<div class="subpage-head"><div><h1>Support Inbox</h1><p style="color:#748195">Review and reply to student support tickets.</p></div></div>
  <div class="support-layout">
    <div class="ticket-list">
      ${rows.map(t=>{
        const st=state.students.find(s=>s.id===t.studentId);
        return `<div class="ticket-card ${t.id===selected?.id?'active':''} ${t.status==='Resolved'?'resolved':''}" data-action="select-ticket" data-id="${t.id}">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><strong>${esc(st?.name||t.studentId)}</strong><span class="tag ${t.status==='Resolved'?'green':'orange'}">${esc(t.status)}</span></div>
          <small style="color:#a0aec0;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.topic)} - ${esc(t.message)}</small>
        </div>`;
      }).join('')||'<div class="empty">No support tickets.</div>'}
    </div>
    <div class="panel ticket-detail">
      ${selected ? `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:12px;margin-bottom:12px;">
          <h3 style="margin:0">${esc(selected.topic)}</h3>
          ${selected.status !== 'Resolved' ? `<button class="btn small primary" data-action="resolve-ticket" data-id="${selected.id}">Mark as Resolved</button>` : `<span class="tag green">Resolved</span>`}
        </div>
        <div style="margin-bottom:20px;">
          <small style="color:#a0aec0;display:block;margin-bottom:4px">${esc(state.students.find(s=>s.id===selected.studentId)?.name||'Student')} • ${niceDate(selected.date)}</small>
          <div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:8px;border-left:3px solid #3b82f6;">${esc(selected.message)}</div>
        </div>
        ${selected.reply ? `
        <div style="margin-bottom:20px;">
          <small style="color:#8b5cf6;display:block;margin-bottom:4px;text-align:right">Admin Reply</small>
          <div style="background:rgba(139,92,246,0.1);padding:12px;border-radius:8px;border-right:3px solid #8b5cf6;text-align:right;">${esc(selected.reply)}</div>
        </div>
        ` : ''}
        ${selected.status !== 'Resolved' ? `
        <form id="replySupportForm" style="margin-top:20px;">
          <input type="hidden" name="ticketId" value="${selected.id}">
          <textarea required name="replyText" rows="4" placeholder="Type your reply here..." style="margin-bottom:10px"></textarea>
          <button class="btn primary" type="submit">Send Reply</button>
        </form>
        ` : '<p style="color:#a0aec0;text-align:center;font-style:italic">This ticket has been resolved. No further replies can be added.</p>'}
      ` : '<div class="empty">Select a ticket to view details.</div>'}
    </div>
  </div>`;
}
function adminSettings(){
  const ac = state.adminControls || { showLeaderboard: true, showTrends: true, showWithdrawals: true };
  return `<div class="subpage-head"><div><h1>Settings</h1><p style="color:#748195">Manage brand and support settings.</p></div><button class="btn danger" data-action="reset-demo">Reset Local Data</button></div>
<form class="panel" id="settingsForm"><div class="field"><label>Brand name</label><input name="brand" value="${esc(state.settings.brand)}"></div><div class="field"><label>Support email</label><input name="supportEmail" value="${esc(state.settings.supportEmail)}"></div><div class="field"><label>Support WhatsApp</label><input name="supportWhatsApp" value="${esc(state.settings.supportWhatsApp)}"></div><div class="field"><label>Weekly update wording</label><textarea name="weeklyUpdateText" rows="3">${esc(state.settings.weeklyUpdateText)}</textarea></div><button class="btn primary" type="submit">Save Settings</button><p class="micro" style="margin-top:12px;color:#748195">Sensitive settings should be protected with role-based access and audit logging in the live deployment.</p></form>
<form class="panel" id="adminControlsForm" style="margin-top:16px;">
  <h3 style="margin-bottom:8px">Platform Settings (Student UI)</h3>
  <div class="field" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.05);">
    <label style="font-size:14px; color:#cdd5e7; margin:0;">Show Leaderboard</label>
    <label class="switch"><input type="checkbox" name="showLeaderboard" ${ac.showLeaderboard?'checked':''}><span class="slider"></span></label>
  </div>
  <div class="field" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.05);">
    <label style="font-size:14px; color:#cdd5e7; margin:0;">Show Trends</label>
    <label class="switch"><input type="checkbox" name="showTrends" ${ac.showTrends?'checked':''}><span class="slider"></span></label>
  </div>
  <div class="field" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; margin-bottom:12px;">
    <label style="font-size:14px; color:#cdd5e7; margin:0;">Show Withdrawals</label>
    <label class="switch"><input type="checkbox" name="showWithdrawals" ${ac.showWithdrawals?'checked':''}><span class="slider"></span></label>
  </div>
  <button class="btn primary" type="submit">Save Platform Settings</button>
</form>`
}

function editUserModal(id){const s=state.students.find(x=>x.id===id);if(!s)return;$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal">×</button><h2>Edit User</h2><form id="editUserForm"><input type="hidden" name="id" value="${s.id}"><div class="field"><label>Name</label><input required name="name" value="${esc(s.name)}"></div><div class="field"><label>Email</label><input required name="email" value="${esc(s.email)}"></div><div class="field"><label>Program</label><input required name="program" value="${esc(s.program)}"></div><button class="btn primary" style="margin-top:14px;width:100%" type="submit">Save Changes</button></form>`;$('#genericModal').classList.add('open');bindForms();}
function deleteUser(id){if(confirm('Are you sure you want to delete this user?')){state.students=state.students.filter(x=>x.id!==id);save();render();toast('User deleted.');}}
function toggleUserSuspend(id){const s=state.students.find(x=>x.id===id);if(s){s.status=s.status==='Suspended'?'Active Creator':'Suspended';save();render();toast('User status updated.');}}

function showStudentModal(id){const s=state.students.find(x=>x.id===id);if(!s)return;const totals=earningSummary(s.id);$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal">×</button><h2>${esc(s.name)}</h2><p style="color:#748195">${esc(s.id)} · ${esc(s.status)}</p><div class="profile-grid"><div class="profile-box"><small>Program</small><strong>${esc(s.program)}</strong></div><div class="profile-box"><small>Available</small><strong>${money(s.available)}</strong></div><div class="profile-box"><small>Progress</small><strong>${s.progress}%</strong></div><div class="profile-box"><small>Attendance</small><strong>${s.attendance}%</strong></div><div class="profile-box"><small>Total Earnings</small><strong>${money(totals.lifetime)}</strong></div><div class="profile-box"><small>Total Paid</small><strong>${money(s.paid)}</strong></div></div><div class="notice" style="margin-top:14px">Admin can manage credits, withdrawals, courses and notifications from the main admin sections.</div>`;$('#genericModal').classList.add('open');}
function addClassModal(){$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal">×</button><h2>Add Live Class</h2><form id="classForm"><div class="field"><label>Title</label><input required name="title"></div><div class="field"><label>Trainer</label><input required name="trainer" value="Mughees"></div><div class="field"><label>Date</label><input required type="date" name="date"></div><div class="field"><label>Time</label><input required name="time" placeholder="8:00 PM"></div><div class="field"><label>Batch</label><input required name="batch" placeholder="Creator Batch 03"></div><div class="field"><label>Meeting / Recording URL (optional)</label><input type="url" name="link" placeholder="https://..."></div><button class="btn primary" type="submit">Create Class</button></form>`;$('#genericModal').classList.add('open');bindForms();}
function addTrendModal(){$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal">×</button><h2>Add Trend Update</h2><form id="trendForm"><div class="field"><label>Program</label><select name="program"><option>TikTok</option><option>Hypic</option><option>CapCut</option><option>Future App</option></select></div><div class="field"><label>Trend title</label><input required name="title"></div><div class="field"><label>Difficulty</label><select name="difficulty"><option>Easy</option><option>Medium</option><option>Advanced</option></select></div><button class="btn primary" type="submit">Publish & Notify</button></form>`;$('#genericModal').classList.add('open');bindForms();}
function addProgramModal(){$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal">×</button><h2>Add Creator Program</h2><p style="color:#748195">Create a new creator program and publish it across the platform.</p><form id="programForm"><div class="field"><label>Program name</label><input required name="name" placeholder="New Creator App"></div><div class="field"><label>Description</label><textarea required name="desc" rows="4"></textarea></div><button class="btn primary" type="submit">Save Program</button></form>`;$('#genericModal').classList.add('open');bindForms();}
function showInfoModal(title,body,actions=''){$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal" aria-label="Close">×</button><h2>${esc(title)}</h2>${body}${actions}`;$('#genericModal').classList.add('open');bindGlobal();}
function showClassDetail(id){const c=state.classes.find(x=>x.id===id);if(!c)return;showInfoModal(c.title,`<p class="muted-copy">${niceDate(c.date)} · ${esc(c.time)} · ${esc(c.trainer)}</p><div class="profile-box"><small>Batch</small><strong>${esc(c.batch)}</strong></div><p class="muted-copy" style="margin-top:14px">${c.status==='Upcoming'?'Your class details are ready. When a meeting link is published, it will open from this screen.':'This session is marked as recorded. Add the recording URL from Admin to open it directly.'}</p>`,c.link&&c.link!=='#'?`<a class="btn primary" target="_blank" rel="noopener" href="${esc(c.link)}">${c.status==='Upcoming'?'Join Session':'Watch Recording'}</a>`:'');}
function showCourseDetail(id){const c=state.courses.find(x=>x.id===id);if(!c)return;showInfoModal(c.title,`<p class="muted-copy">${esc(c.desc)}</p><div class="module-stack">${c.modules.map((m,i)=>`<div class="module-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(m)}</strong></div>`).join('')}</div>`);}
function showTrendDetail(id){const t=state.trends.find(x=>x.id===id);if(!t)return;showInfoModal(t.title,`<p class="muted-copy">${esc(t.program)} · ${esc(t.difficulty)} · ${niceDate(t.added)}</p><div class="notice">Use this trend as a structured practice task. Review the hook, edit, caption and publishing checklist before posting.</div>`);}
function editCourseModal(id){const c=state.courses.find(x=>x.id===id);if(!c)return;$('#genericModalBody').innerHTML=`<button class="modal-close" data-action="close-modal">×</button><h2>Edit Course</h2><form id="courseEditForm"><input type="hidden" name="id" value="${esc(c.id)}"><div class="field"><label>Title</label><input required name="title" value="${esc(c.title)}"></div><div class="field"><label>Description</label><textarea required name="desc" rows="4">${esc(c.desc)}</textarea></div><div class="field"><label>Modules (one per line)</label><textarea required name="modules" rows="7">${esc(c.modules.join('\n'))}</textarea></div><button class="btn primary" type="submit">Save Course</button></form>`;$('#genericModal').classList.add('open');bindForms();}
function resolveTicket(id){const t=(state.supportMessages||[]).find(x=>x.id===id);if(!t)return;t.status='Resolved';notify(t.studentId,'Support ticket resolved',`Your ${t.topic} ticket has been marked resolved.`);save();render();toast('Support ticket resolved.');}
function payWithdrawal(id){const w=state.withdrawals.find(x=>x.id===id);if(!w||w.status!=='Pending'){toast('This withdrawal has already been processed.');return;}const ref=prompt('Enter payment reference / transaction ID:',`PAY-${Date.now().toString().slice(-6)}`);if(ref===null)return;w.status='Paid';w.paidDate=todayISO();w.reference=ref||'Recorded';const s=state.students.find(x=>x.id===w.studentId);if(s){s.pending=Math.max(0,(s.pending||0)-w.amount);s.paid+=w.amount;notify(s.id,'Withdrawal approved',`Your withdrawal of ${money(w.amount)} has been approved and paid.`)}save();render();toast('Withdrawal approved and marked paid.');}
function approveKYC(id){const s=state.students.find(x=>x.id===id);if(s&&s.kyc){s.kyc.status='Verified';notify(s.id,'KYC Approved','Your identity has been verified. You can now request withdrawals.');save();render();toast('KYC approved.');}}
function rejectKYC(id){const s=state.students.find(x=>x.id===id);if(s&&s.kyc){s.kyc.status='Unverified';delete s.kyc.docUrl;notify(s.id,'KYC Rejected','Your document was unclear or invalid. Please re-upload a valid ID.');save();render();toast('KYC rejected.');}}
function rejectWithdrawal(id){const w=state.withdrawals.find(x=>x.id===id);if(!w||w.status!=='Pending'){toast('This withdrawal has already been processed.');return;}if(!confirm('Reject this withdrawal and return the reserved amount to the student balance?'))return;w.status='Rejected';const s=state.students.find(x=>x.id===w.studentId);if(s){s.pending=Math.max(0,(s.pending||0)-w.amount);s.available+=w.amount;notify(s.id,'Withdrawal rejected',`Your withdrawal request of ${money(w.amount)} was rejected. Funds returned to balance.`)}save();render();toast('Withdrawal rejected and balance restored.');}

function bindForms(){
 bindPasswordStrength("signup_pw", "signup_strength");
 bindPasswordStrength("rp_pw", "rp_strength");
 const sav=$('#signup_avatar'); if(sav)sav.onchange=()=>{const f=sav.files[0],pv=$('#signup_avatar_preview'); if(!f||!pv)return; if(f.size>2*1024*1024){toast('Photo must be under 2MB.');sav.value='';return;} const r=new FileReader(); r.onload=()=>{pv.src=r.result;pv.style.display='block';}; r.readAsDataURL(f);};

 const login=$('#loginForm'); if(login)login.onsubmit=async e=>{e.preventDefault();const fd=new FormData(login),email=String(fd.get('email')).trim(),pw=String(fd.get('password')); const {data,error}=await supabase.auth.signInWithPassword({email,password:pw}); if(error){toast('Invalid email or password.');return;} if(!data.session){toast('Please check your email to confirm your account, then login.');return;} const { data: prof, error: profErr } = await supabase.from('profiles').select('*').ilike('email', email).single(); if(profErr || !prof){toast('Student record not found. Contact support: '+state.settings.supportEmail+'.');await supabase.auth.signOut();return;} if(prof.status==='pending'){toast('⏳ Your account is pending admin approval.');await supabase.auth.signOut();return;} if(prof.status==='suspended'){toast('Your account has been suspended. Contact support: '+state.settings.supportEmail+'.');await supabase.auth.signOut();return;} if(prof.status==='rejected'){toast('Your signup request was not approved. Contact support: '+state.settings.supportEmail+'.');await supabase.auth.signOut();return;} if(prof.role==='admin' || email.toLowerCase()===state.admin.email.toLowerCase()){state.session={role:'admin'}; save(); closeModals(); location.hash='#/admin'; render(); loadApprovals(); loadLessons(); return;} let s=state.students.find(x=>x.email.toLowerCase()===email.toLowerCase()); if(!s){s={id:prof.id||uid('ST'),name:prof.name||prof.full_name||email.split('@')[0],avatar:prof.avatar_url||'',email:email.toLowerCase(),password:'',phone:prof.phone||'',status:'Active Student',program:'Creator Program',joinDate:todayISO(),today:0,week:0,month:0,lifetime:650.00,available:500.00,pending:0,paid:150.00,attendance:100,progress:0,tasksDone:0,tasksTotal:20,trendParticipation:0,performance:'New',payoutMethod:'JazzCash',payoutAccount:'',city:'',bio:''}; state.students.push(s);} state.session={role:'student',studentId:s.id}; save(); closeModals(); location.hash='#/dashboard'; render(); loadLessons(); };
 const signup=$('#signupForm'); if(signup)signup.onsubmit=async e=>{e.preventDefault();const fd=new FormData(signup),email=String(fd.get('email')).trim().toLowerCase(),pw=String(fd.get('password')),phone=String(fd.get('phone')).trim(),network=String(fd.get('network')).trim(); const emailRx=/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/; if(!emailRx.test(email)){toast('❌ Invalid email format. Please use a valid email address.');const el=document.getElementById('signup_email');if(el){el.style.borderColor='#ef4444';el.focus();}return;} if(phone.length!==11||!/^[0-9]{11}$/.test(phone)){toast('❌ Phone number must be exactly 11 digits (e.g. 03001234567).');const el=document.getElementById('signup_phone');if(el){el.style.borderColor='#ef4444';el.focus();}return;} if(!network||network==='Select Network'){toast('❌ Please select your Network Provider.');return;} if(checkPasswordStrength(pw)!=='strong'){toast('❌ Password too weak. Use 8+ chars with uppercase, number, and special character (@$!%*?&).');return;} if(state.students.some(x=>x.email.toLowerCase()===email)){toast('An account with this email already exists.');return;} const {data,error}=await supabase.auth.signUp({email,password:pw}); if(error){toast('Signup failed: '+(error.message||'Unknown error'));return;} if(!data.user){toast('Please check your email to confirm your account, then login.');closeModals();openAuth('login');return;} let avatar_url=null; const avatarFile=fd.get('avatar'); if(avatarFile&&avatarFile.size>0){const ext=(String(avatarFile.name).split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg'; const apath=data.user.id+'.'+ext; const {error:upErr}=await supabase.storage.from('avatars').upload(apath,avatarFile,{upsert:true,contentType:avatarFile.type}); if(upErr){toast('Photo upload failed: '+upErr.message+'. Continuing without photo.');} else {avatar_url=supabase.storage.from('avatars').getPublicUrl(apath).data.publicUrl;}} const {error:profErr}=await supabase.from('profiles').upsert([{id:data.user.id,email,name:String(fd.get('name')).trim(),role:'student',status:'pending',phone,network,cnic:String(fd.get('cnic')).trim(),avatar_url}],{onConflict:'id'}); if(profErr){toast('Account created but profile save failed: '+profErr.message+'. Contact support: '+state.settings.supportEmail+'.');return;} notifyEmail('new_signup',data.user.id); await supabase.auth.signOut(); closeModals(); location.hash='#/'; render(); toast('✅ Account created! Your account is pending admin approval.'); };
 const w=$('#withdrawForm'); if(w)w.onsubmit=e=>{e.preventDefault();const s=currentStudent(),fd=new FormData(w),amt=Number(fd.get('amount')),method=String(fd.get('method')),accountName=String(fd.get('accountName')).trim(),account=String(fd.get('account')).trim();if(!amt||amt<50){toast('Minimum withdrawal amount is $50.');return}if(s.kyc?.status!=='Verified'){toast('Complete KYC identity verification before withdrawing.');return}if(amt>s.available){toast('Requested amount exceeds your available balance.');return}if(!accountName){toast('Enter account holder name.');return}if(!account){toast('Enter your payout account.');return}s.available=Math.round((s.available-amt)*100)/100;s.pending=Math.round(((s.pending||0)+amt)*100)/100;s.accountName=accountName;s.payoutMethod=method;s.payoutAccount=account;state.withdrawals.unshift({id:uid('WD'),studentId:s.id,date:todayISO(),amount:amt,method,accountName,account,status:'Pending',paidDate:'',reference:''});if(!state.unreadCounts)state.unreadCounts={trends:0,adminSupport:0,withdrawals:0};state.unreadCounts.withdrawals=(state.unreadCounts.withdrawals||0)+1;notify(s.id,'Withdrawal submitted',`${money(amt)} withdrawal request is pending admin review. Amount moved to pending balance.`);sendWithdrawalEmailAlert(s,amt);save();dashView='payments';render();toast('Withdrawal request submitted. Amount moved to pending balance.');};
 const pf=$('#profileForm');if(pf)pf.onsubmit=e=>{e.preventDefault();const s=currentStudent(),fd=new FormData(pf);['name','phone','city','payoutMethod','payoutAccount','bio'].forEach(k=>s[k]=String(fd.get(k)||''));save();toast('Profile saved.');render();};
 const kycForm=$('#kycForm'); if(kycForm)kycForm.onsubmit=e=>{e.preventDefault();const s=currentStudent(),fd=new FormData(kycForm),docNumber=String(fd.get('docNumber')).trim();const fileInput=document.getElementById('kycDoc');if(!/^\d{5}-\d{7}-\d{1}$/.test(docNumber)){toast('Please enter a valid 13-digit ID Card Number with dashes (e.g., XXXXX-XXXXXXX-X).');return;}if(!fileInput.files[0]){toast('Upload an ID photo.');return;}const reader=new FileReader();reader.onload=function(event){s.kyc={status:'Pending',docUrl:event.target.result,docNumber};if(!state.unreadCounts)state.unreadCounts={trends:0,adminSupport:0,withdrawals:0,kyc:0};state.unreadCounts.kyc=(state.unreadCounts.kyc||0)+1;save();toast('KYC document submitted for review.');render();};reader.readAsDataURL(fileInput.files[0]);};
 const uploadInput=document.getElementById('avatarUpload');const previewImg=document.getElementById('profilePreview');if(uploadInput&&previewImg){uploadInput.addEventListener('change',function(e){const file=e.target.files[0];if(file){const reader=new FileReader();reader.onload=function(event){const dataUrl=event.target.result;previewImg.src=dataUrl;localStorage.setItem('userAvatar',dataUrl);const headerAvatar=document.getElementById('headerAvatar');if(headerAvatar)headerAvatar.src=dataUrl;};reader.readAsDataURL(file);}});}
 const ef=$('#addEarningForm');if(ef)ef.onsubmit=e=>{e.preventDefault();const fd=new FormData(ef),sid=String(fd.get('studentId')),amt=Number(fd.get('amount')),program=String(fd.get('program')),s=state.students.find(x=>x.id===sid);if(!s||!amt)return;state.earnings.unshift({id:uid('E'),studentId:sid,date:todayISO(),program,amount:amt,note:String(fd.get('note')||''),internalGross:Number(fd.get('internalGross')||0)});s.lifetime=Number(s.lifetime||0)+amt;s.available+=amt;notify(sid,'New earnings added',`${money(amt)} has been added to your approved account balance.`);save();render();toast('Earning added and student notified.');};
 const nf=$('#notifyForm');if(nf)nf.onsubmit=e=>{e.preventDefault();const fd=new FormData(nf),sid=String(fd.get('studentId')),title=String(fd.get('title')),body=String(fd.get('body'));if(sid==='all')state.students.forEach(s=>notify(s.id,title,body));else notify(sid,title,body);save();toast('Notification sent.');nf.reset();};
 const sf=$('#settingsForm');if(sf)sf.onsubmit=e=>{e.preventDefault();const fd=new FormData(sf);['brand','supportEmail','supportWhatsApp','weeklyUpdateText'].forEach(k=>state.settings[k]=String(fd.get(k)||''));save();toast('Settings saved.');};
 const acf=$('#adminControlsForm');if(acf)acf.onsubmit=e=>{e.preventDefault();const fd=new FormData(acf);state.adminControls={showLeaderboard:fd.get('showLeaderboard')==='on',showTrends:fd.get('showTrends')==='on',showWithdrawals:fd.get('showWithdrawals')==='on'};save();toast('Platform settings saved.');};
 const euf=$('#editUserForm');if(euf)euf.onsubmit=e=>{e.preventDefault();const fd=new FormData(euf),s=state.students.find(x=>x.id===String(fd.get('id')));if(s){s.name=String(fd.get('name')).trim();s.email=String(fd.get('email')).trim();s.program=String(fd.get('program')).trim();save();closeModals();render();toast('User updated.');}};
 const sup=$('#supportForm');if(sup)sup.onsubmit=e=>{e.preventDefault();const fd=new FormData(sup),st=currentStudent();state.supportMessages=state.supportMessages||[];state.supportMessages.unshift({id:uid('SUP'),studentId:st.id,topic:String(fd.get('topic')),message:String(fd.get('message')),reply:'',date:todayISO(),status:'Pending'});state.unreadCounts=state.unreadCounts||{trends:0,adminSupport:0};state.unreadCounts.adminSupport++;save();render();toast('Support ticket submitted.');};
 const rsf=$('#replySupportForm');if(rsf)rsf.onsubmit=e=>{e.preventDefault();const fd=new FormData(rsf),id=String(fd.get('ticketId')),t=(state.supportMessages||[]).find(x=>x.id===id);if(t){t.reply=String(fd.get('replyText'));t.status='Resolved';save();render();toast('Reply sent and ticket resolved.');}};
 const cef=$('#courseEditForm');if(cef)cef.onsubmit=e=>{e.preventDefault();const fd=new FormData(cef),c=state.courses.find(x=>x.id===String(fd.get('id')));if(!c)return;c.title=String(fd.get('title')).trim();c.desc=String(fd.get('desc')).trim();c.modules=String(fd.get('modules')).split('\n').map(x=>x.trim()).filter(Boolean);c.lessons=c.modules.length;save();closeModals();render();toast('Course updated.');};
 const cf=$('#classForm');if(cf)cf.onsubmit=e=>{e.preventDefault();const fd=new FormData(cf);state.classes.unshift({id:uid('CL'),title:String(fd.get('title')),trainer:String(fd.get('trainer')),date:String(fd.get('date')),time:String(fd.get('time')),batch:String(fd.get('batch')),status:'Upcoming',link:String(fd.get('link')||'#')});state.students.forEach(s=>notify(s.id,'New live class scheduled',`${String(fd.get('title'))} is scheduled for ${niceDate(String(fd.get('date')))}.`));save();closeModals();render();toast('Class added and students notified.');};
 const tf=$('#trendForm');if(tf)tf.onsubmit=e=>{e.preventDefault();const fd=new FormData(tf),t={id:uid('TR'),program:String(fd.get('program')),title:String(fd.get('title')),added:todayISO(),difficulty:String(fd.get('difficulty')),status:'New'};state.trends.unshift(t);state.students.forEach(s=>notify(s.id,'New creator trend',`${t.program}: ${t.title}`));save();closeModals();render();toast('Trend published and students notified.');};
 const prf=$('#programForm');if(prf)prf.onsubmit=e=>{e.preventDefault();const fd=new FormData(prf),name=String(fd.get('name')).trim(),desc=String(fd.get('desc')).trim();state.programs=state.programs||[];state.programs.push({id:uid('PG'),name,desc,code:name.slice(0,2).toUpperCase(),status:'Active'});save();closeModals();render();toast('Program added.');};
 // ── AI Overview (lazy-loaded, safe - no boot call) ──
let GEMINI_API_KEY = '';
let _geminiLoading = null;
async function loadGeminiKey(){
  if(GEMINI_API_KEY) return GEMINI_API_KEY;
  if(_geminiLoading) return _geminiLoading;
  _geminiLoading = (async()=>{
    try{
      const{data}=await supabase.from('app_settings').select('value').eq('key','gemini_api_key').maybeSingle();
      if(data&&data.value) GEMINI_API_KEY=data.value;
    }catch(e){}
    return GEMINI_API_KEY;
  })();
  return _geminiLoading;
}
async function aiGenerate(prompt){
  const key = await loadGeminiKey();
  if(!key) throw new Error('AI key not configured');
  const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key='+key,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
  });
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text) throw new Error('No AI response');
  return text.trim();
}
window.generateAIOverview = async function(){
  const form=document.getElementById('addLessonForm');
  const titleEl=form?.querySelector('[name="title"]');
  const descEl=form?.querySelector('[name="description"]');
  const ovEl=form?.querySelector('[name="overview"]');
  const btn=document.getElementById('ai_gen_btn');
  const title=titleEl?.value.trim()||'', desc=descEl?.value.trim()||'';
  if(!title){toast('Pehle lesson ka title likhen.');return;}
  if(btn){btn.disabled=true;btn.textContent='⏳ Generating…';}
  try{
    const text=await aiGenerate(`Write a concise lecture overview (100-150 words) in simple English for a video lesson titled "${title}". ${desc?`Topic: "${desc}". `:''}Include what the student will learn and 3-4 key concepts as bullet points. Friendly tone.`);
    if(ovEl) ovEl.value=text;
    toast('✅ AI overview generated!');
  }catch(e){ toast('AI failed: '+e.message); }
  if(btn){btn.disabled=false;btn.textContent='🤖 Generate with AI';}
};
const alf=$('#addLessonForm');if(alf)alf.onsubmit=async e=>{e.preventDefault();const fd=new FormData(alf);const title=String(fd.get('title')).trim(),module=String(fd.get('module')).trim(),duration=String(fd.get('duration')).trim();const vf=fd.get('videofile');let url=String(fd.get('url')||'').trim(),kind='embed';
 if(vf&&vf.size>0){if(vf.size>500*1024*1024){toast('Video must be under 500MB.');return;} toast('⏳ Uploading video, please wait...');const ext=(String(vf.name).split('.').pop()||'mp4').toLowerCase().replace(/[^a-z0-9]/g,'')||'mp4';const fpath=Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;const {error:upErr}=await supabase.storage.from('lesson-videos').upload(fpath,vf,{contentType:vf.type||'video/mp4'}); if(upErr){toast('Upload failed: '+upErr.message);return;} url=supabase.storage.from('lesson-videos').getPublicUrl(fpath).data.publicUrl; kind='file';}
 if(!url){toast('Please upload a video file or paste a video URL.');return;}
 const mins=parseInt(String(duration).replace(/[^0-9]/g,''))||0; const {error:insErr}=await supabase.from('lessons').insert([{title,description:module,video_url:url,kind,duration_minutes:mins,status:'published',overview:String(fd.get('overview')||'').trim()||null}]); if(insErr){toast('Could not save lesson: '+insErr.message);return;}
 toast('✅ Lesson published for all students!'); loadLessons();};
 const contact=$('#contactForm');if(contact)contact.onsubmit=e=>{e.preventDefault();const fd=new FormData(contact);state.contactMessages=state.contactMessages||[];state.contactMessages.unshift({id:uid('MSG'),name:String(fd.get('name')),email:String(fd.get('email')),message:String(fd.get('message')),date:todayISO()});save();contact.reset();toast('Message submitted to support.');};
const fp=$('#forgotPasswordForm');if(fp)fp.onsubmit=async e=>{e.preventDefault();const fd=new FormData(fp),email=String(fd.get('email')).trim().toLowerCase();const {data,error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:'https://mugees-editor.vercel.app/?reset=1'});if(error){toast(error.message||'Failed to send reset email');}else{toast('Password reset email sent');closeModals();}};
const rp=$('#resetPasswordForm');if(rp)rp.onsubmit=async e=>{e.preventDefault();const fd=new FormData(rp),pw=String(fd.get('password')),cp=String(fd.get('confirm'));if(pw.length<8){var er=document.getElementById('rp_err');if(er)er.textContent='Password must be at least 8 characters.';toast('Password must be at least 8 characters.');return;}if(pw!==cp){var er=document.getElementById('rp_err');if(er)er.textContent='Passwords do not match.';toast('Passwords do not match.');return;}var er=document.getElementById('rp_err');if(er)er.textContent='';const {data,error}=await supabase.auth.updateUser({password:pw});if(error){toast(error.message||'Failed to reset password');}else{toast('Password updated');closeModals();openAuth('login');}};
  document.querySelectorAll('[data-action="toggle-eye"]').forEach(function(btn){
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var targetId = btn.getAttribute('data-target');
      var inp = document.getElementById(targetId);
      if(!inp) return;
      var isVisible = inp.type !== 'password';
      inp.type = isVisible ? 'password' : 'text';
      btn.style.color = isVisible ? '#94a3b8' : '#8b5cf6';
      var svg = btn.querySelector('svg');
      if(svg){
        if(isVisible){
          svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        } else {
          svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        }
      }
    });
  });
}

function bindGlobal(){
  // Only call bindForms — all click delegation is handled by the permanent
  // document-level listener below so it survives DOM re-renders.
  bindForms();
}

function syncHeader(){
   const actions=$('.nav-actions'); if(!actions)return;
 const mobileMenu=$('#mobileMenu');
 if(state.session?.role==='student'){
   actions.innerHTML=`<button class="icon-btn mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false">☰</button><a class="btn ghost" href="#/dashboard" id="headerDashBtn">Dashboard</a>`;
   if(mobileMenu) mobileMenu.innerHTML=`<a href="#/" data-route="home">Home</a><a href="#/courses" data-route="courses">Courses</a><a href="#/programs" data-route="programs">Creator Programs</a><a href="#/live" data-route="live">Curriculum</a><button class="mobile-nav-btn" data-dash="overview" id="mobileDashBtn">Dashboard</button><a href="#/how-it-works" data-route="how-it-works">How It Works</a><a href="#/faq" data-route="faq">FAQ</a><button class="mobile-nav-btn" data-dash="leaderboard" id="mobileLeaderboardBtn">🏆 Leaderboard</button><button class="mobile-nav-btn" data-dash="notifications" id="mobileNotifBtn">🔔 Notifications</button><button class="mobile-nav-btn" data-dash="profile" id="mobileProfileBtn">👤 Profile</button><button class="mobile-nav-btn mobile-logout-btn" data-action="logout" id="mobileLogoutBtn">↩ Logout</button>`;
 }else if(state.session?.role==='admin'){
   actions.innerHTML=`<button class="icon-btn mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false">☰</button><a class="btn ghost" href="#/admin" id="headerAdminBtn">Admin Dashboard</a>`;
   if(mobileMenu) mobileMenu.innerHTML=`<a href="#/" data-route="home">Home</a><a href="#/courses" data-route="courses">Courses</a><a href="#/programs" data-route="programs">Creator Programs</a><a href="#/live" data-route="live">Curriculum</a><button class="mobile-nav-btn" data-admin="overview" id="mobileAdminBtn">Admin Dashboard</button><a href="#/how-it-works" data-route="how-it-works">How It Works</a><a href="#/faq" data-route="faq">FAQ</a><a href="#/contact" data-route="contact">Contact</a><button class="mobile-nav-btn mobile-logout-btn" data-action="logout" id="mobileAdminLogoutBtn">↩ Logout</button>`;
 }else{
   actions.innerHTML=`<button class="icon-btn mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false">☰</button><button class="btn ghost" data-action="open-login" id="headerLoginBtn">Login</button><button class="btn primary" data-action="open-signup" id="headerJoinBtn">Join Now</button>`;
   if(mobileMenu) mobileMenu.innerHTML=`<a href="#/" data-route="home">Home</a><a href="#/courses" data-route="courses">Courses</a><a href="#/programs" data-route="programs">Creator Programs</a><a href="#/live" data-route="live">Curriculum</a><a href="#/how-it-works" data-route="how-it-works">How It Works</a><a href="#/faq" data-route="faq">FAQ</a><a href="#/contact" data-route="contact">Contact</a><button class="mobile-nav-btn" data-action="open-login" id="mobileLoginBtn">Login</button><button class="mobile-nav-btn mobile-join-btn" data-action="open-signup" id="mobileJoinBtn">Join Now</button>`;
 }
  // active classes sync moved to render()
  // Directly bind mobile menu buttons NOW after HTML injection
  bindMobileMenu();
}

// ── DIRECT MOBILE MENU EVENT BINDING ──────────────────────────────────────────
// Called every time syncHeader() rebuilds the mobile menu HTML.
// Attaches click AND touchstart directly to each element — no delegation.
function bindMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  if (!menu) return;
  var allItems = menu.querySelectorAll('a, button');
  allItems.forEach(function(el) {
    function handler(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      // Prevent double-fire from touch+click
      if (el._mobileHandled) return;
      el._mobileHandled = true;
      setTimeout(function() { el._mobileHandled = false; }, 400);
      // Close the menu immediately
      menu.classList.remove('open');
      // Determine what this element should do
      var dashTarget = el.getAttribute('data-dash');
      var adminTarget = el.getAttribute('data-admin');
      var actionTarget = el.getAttribute('data-action');
      var hrefTarget = el.getAttribute('href');
      if (dashTarget) {
        dashView = dashTarget;
        if(dashTarget==='courses')loadLessons();
        if (route() !== 'dashboard') { location.hash = '#/dashboard'; }
        render();
      } else if (adminTarget) {
        adminView = adminTarget;
        if (route() !== 'admin') { location.hash = '#/admin'; }
        render();
      } else if (actionTarget === 'logout') {
        if (window.supabase && supabase.auth) {
          supabase.auth.signOut().then(function() {
            state.session = null; save(); dashView = 'overview'; adminView = 'overview';
            location.hash = '#/'; render();
          });
        } else {
          state.session = null; save(); dashView = 'overview'; adminView = 'overview';
          location.hash = '#/'; render();
        }
      } else if (actionTarget === 'open-login') {
        setTimeout(function() { openAuth('login'); }, 50);
      } else if (actionTarget === 'open-signup') {
        setTimeout(function() { openAuth('signup'); }, 50);
      } else if (hrefTarget && hrefTarget !== '#') {
        location.hash = hrefTarget;
      }
    }
    el.addEventListener('click', handler, { passive: false });
    el.addEventListener('touchstart', handler, { passive: false });
  });
}
function route(){const r=(location.hash||'#/').replace(/^#\//,'').split('?')[0];return r||'home'}
function render(){syncHeader();const r=route();const app=$('#app');$('#year').textContent=new Date().getFullYear();$('#siteFooter').classList.toggle('hidden',r==='dashboard'||r==='admin');let html='';switch(r){case'home':html=homePage();break;case'courses':html=coursesPage();break;case'programs':html=programsPage();break;case'live':html=livePage();break;case'how-it-works':html=howPage();break;case'faq':html=faqPage();break;case'contact':html=contactPage();break;case'dashboard':html=studentDashboard();break;case'admin':html=adminDashboard();break;case'terms':case'privacy':case'payout-policy':case'refund-policy':case'earnings-policy':case'earnings-disclaimer':case'community-guidelines':html=legalPage(r);break;default:html=`${pageHero('Page not found','The page you requested does not exist.')}<section class="section"><a class="btn primary" href="#/">Back Home</a></section>`}app.innerHTML=html;try{bindGlobal();}catch(e){console.warn('bindGlobal error:',e);}window.scrollTo({top:0,behavior:'instant'});syncActiveLinks();}
function syncActiveLinks(){
  const r=route();
  // Clear ALL active classes across desktop sidebar, desktop nav, and mobile menu
  document.querySelectorAll(
    '.sidebar a, .sidebar button, .side-nav button, .desktop-nav a, #mobileMenu a, #mobileMenu button, .mobile-nav-btn'
  ).forEach(el => el.classList.remove('active'));

  // Apply active class to matching anchor links (desktop nav + mobile menu)
  document.querySelectorAll('.sidebar a, .desktop-nav a, #mobileMenu a').forEach(el => {
    const href = el.getAttribute('href');
    if (!href) return;
    if (href === '#/' + r || (r === 'home' && href === '#/')) {
      el.classList.add('active');
    }
  });

  // Apply active class to matching dashboard tab buttons (sidebar + mobile menu)
  document.querySelectorAll('.side-nav button[data-dash], #mobileMenu button[data-dash], .mobile-nav-btn[data-dash]').forEach(el => {
    if (el.dataset.dash === dashView && r === 'dashboard') {
      el.classList.add('active');
    }
  });

  // Apply active class to matching admin tab buttons (sidebar + mobile menu)
  document.querySelectorAll('.side-nav button[data-admin], #mobileMenu button[data-admin], .mobile-nav-btn[data-admin]').forEach(el => {
    if (el.dataset.admin === adminView && r === 'admin') {
      el.classList.add('active');
    }
  });
}

window.addEventListener('click', e => { if (e.target.closest('#mobileMenu a, #mobileMenu button, .mobile-menu a, .mobile-menu button')) { const mm = document.getElementById('mobileMenu'); if (mm) mm.classList.remove('open'); } });
window.addEventListener('hashchange',()=>{$('#mobileMenu').classList.remove('open');render();});
window.addEventListener('mousedown',e=>{if(e.target.classList.contains('modal'))closeModals();});
render();
// Listen for Supabase auth state changes for password recovery
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    openResetPassword();
  }
});
// On page load, if URL contains reset query, open reset password modal
if (new URLSearchParams(location.search).has('reset')) {
  supabase.auth.getSession().then(function(res) {
    if (res.data && res.data.session) {
      openResetPassword();
    } else {
      $('#authModal').classList.add('open');
      $('#authModal').setAttribute('aria-hidden','false');
      $('#authBody').innerHTML = '<h2>Invalid reset link</h2><p style="color:#728096">This password reset link is invalid or has expired. Please request a new one.</p><a href="#" data-action="open-forgot-password" style="color:#3b82f6">Request a new reset email</a>';
      bindGlobal();
    }
  });
}

function checkPasswordStrength(pw) {
  var hasLower   = /[a-z]/.test(pw);
  var hasUpper   = /[A-Z]/.test(pw);
  var hasNumber  = /\d/.test(pw);
  var hasSpecial = /[@$!%*?&]/.test(pw);
  var hasLength  = pw.length >= 8;
  var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if(strongRegex.test(pw)) return 'strong';
  var metCount = [hasLower, hasUpper, hasNumber, hasSpecial, hasLength].filter(Boolean).length;
  if(metCount >= 3 && hasLength) return 'medium';
  return 'weak';
}
function bindPasswordStrength(inputId, indicatorId) {
  const input = document.getElementById(inputId);
  const ind = document.getElementById(indicatorId);
  if(!input || !ind) return;
  input.addEventListener('input', e => {
    const s = checkPasswordStrength(e.target.value);
    ind.className = 'pw-strength ' + s;
    const txt = ind.querySelector('.pw-text');
    const labelMap = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };
    if(txt) txt.textContent = labelMap[s] || s.charAt(0).toUpperCase() + s.slice(1);
  });
}


// ─── PERMANENT EVENT DELEGATION ──────────────────────────────────────────────
// Attached ONCE to document — survives all DOM re-renders caused by render().
document.addEventListener('click', async e => {

  // ── 1. BULLETPROOF MOBILE NAV PRIORITY HANDLER ────────────────────────────
  const mobileBtn = e.target.closest('#mobileMenu button, #mobileMenu a, .mobile-nav-btn');
  // Exclude the hamburger toggle button itself from this block
  if (mobileBtn && !e.target.closest('.mobile-menu-btn')) {
    e.preventDefault(); // Stop default behavior
    
    // Close the menu immediately
    const menuContainer = document.getElementById('mobileMenu');
    if(menuContainer) menuContainer.classList.remove('open');
    
    // Execute the action (route or dashView change)
    const dashTarget = mobileBtn.getAttribute('data-dash');
    const adminTarget = mobileBtn.getAttribute('data-admin');
    const hrefTarget = mobileBtn.getAttribute('href');
    const actionTarget = mobileBtn.getAttribute('data-action');
    
    if (dashTarget) {
      dashView = dashTarget;
      if (route() !== 'dashboard') { location.hash = '#/dashboard'; render(); } else { render(); }
    } else if (adminTarget) {
      adminView = adminTarget;
      if (route() !== 'admin') { location.hash = '#/admin'; render(); } else { render(); }
    } else if (actionTarget === 'logout' || mobileBtn.innerText.toLowerCase().includes('logout')) {
      if (window.supabase && supabase.auth) {
        supabase.auth.signOut().then(() => {
          state.session = null; save(); dashView = 'overview'; adminView = 'overview';
          location.hash = '#/'; render();
        });
      } else {
        state.session = null; save(); dashView = 'overview'; adminView = 'overview';
        location.hash = '#/'; render();
      }
    } else if (actionTarget === 'open-login') {
      $('#authModal').classList.add('open');
      openAuth('login');
    } else if (actionTarget === 'open-signup') {
      $('#authModal').classList.add('open');
      openAuth('signup');
    } else if (hrefTarget && hrefTarget !== '#') {
      window.location.hash = hrefTarget;
    }
    return; // Stop further execution
  }

  // ── Mobile menu toggle ────────────────────────────────────────────────────
  const menuBtn = e.target.closest('.mobile-menu-btn');
  if (menuBtn) {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      const open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    }
    return;
  }

  // ── Chart filter tabs ─────────────────────────────────────────────────────
  const chartBtn = e.target.closest('#chartTabs button');
  if (chartBtn) {
    const parent = chartBtn.parentElement;
    if (parent) {
      parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    }
    chartBtn.classList.add('active');
    const r = chartBtn.dataset.range;
    const data = r==='1W' ? [12,15,14,20,18,25,28] :
                 r==='3M' ? [20,30,25,40,45,60,55,70,85,80,95,110] :
                 r==='1Y' ? [50,60,45,80,95,120,110,140,160,180,170,210] :
                 [12,20,15,31,28,41,36,56,49,62,58,71];
    const cc = document.getElementById('chartContainer');
    if (cc) cc.innerHTML = sparkline(data);
    return;
  }

  // ── Sidebar / dashboard nav (data-dash) ───────────────────────────────────
  const dashEl = e.target.closest('.side-nav [data-dash], .dash-top [data-dash], .dashboard-page [data-dash], #mobileMenu [data-dash], .mobile-menu [data-dash]');
  if (dashEl) {
    const d = dashEl.dataset.dash;
    if (d === 'trends' && state.unreadCounts?.trends > 0) { state.unreadCounts.trends = 0; save(); }
    if (d === 'notifications' && state.session?.role === 'student') { const s = currentStudent(); if(s.unreadCounts?.studentAlerts > 0) { s.unreadCounts.studentAlerts = 0; save(); } }
    dashView = d;
    if(d==='assignments'){loadAssignments(); loadMySubmissions();}
    const mm = document.getElementById('mobileMenu');
    if (mm) mm.classList.remove('open');
    if (route() !== 'dashboard') { location.hash = '#/dashboard'; render(); } else { render(); }
    return;
  }

  // ── Admin sidebar nav (data-admin) ────────────────────────────────────────
  const adminEl = e.target.closest('.side-nav [data-admin], .dashboard-page [data-admin], #mobileMenu [data-admin], .mobile-menu [data-admin]');
  if (adminEl) {
    const d = adminEl.dataset.admin;
    if (d === 'support' && state.unreadCounts?.adminSupport > 0) { state.unreadCounts.adminSupport = 0; save(); }
    if (d === 'withdrawals' && state.unreadCounts?.withdrawals > 0) { state.unreadCounts.withdrawals = 0; save(); }
    if (d === 'kyc' && state.unreadCounts?.kyc > 0) { state.unreadCounts.kyc = 0; save(); }
    adminView = d;
    if(d==='approvals')loadApprovals();
    if(d==='curriculum')loadLessons();
    if(d==='assignments')loadAssignments();
    const mm = document.getElementById('mobileMenu');
    if (mm) mm.classList.remove('open');
    if (route() !== 'admin') { location.hash = '#/admin'; render(); } else { render(); }
    return;
  }

  // ── Auth modal tabs (data-auth-tab) ───────────────────────────────────────
  const authTabEl = e.target.closest('[data-auth-tab]');
  if (authTabEl) {
    openAuth(authTabEl.dataset.authTab);
    return;
  }

  // ── FAQ accordions (data-faq) ─────────────────────────────────────────────
  const faqEl = e.target.closest('[data-faq]');
  if (faqEl) {
    const faqItem = faqEl.closest('.faq');
    if (faqItem) faqItem.classList.toggle('open');
    return;
  }

  // ── Password eye toggle ───────────────────────────────────────────────────
  const eyeEl = e.target.closest('[data-action="toggle-eye"]');
  if (eyeEl) {
    const t = document.getElementById(eyeEl.dataset.target);
    if (t) t.type = t.type === 'password' ? 'text' : 'password';
    return;
  }

  // ── Generic data-action buttons ───────────────────────────────────────────
  const actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    if(actionEl.tagName==='A')e.preventDefault();
    const a = actionEl.dataset.action;
    const id = actionEl.dataset.id;
    if (a === 'toggle-eye') return; // handled above
    if (a === 'open-login')           { openAuth('login'); return; }
    if (a === 'open-signup')          { openAuth('signup'); return; }
    if(a==='approve-user'){const pid=actionEl.dataset.id;const{error:apErr}=await supabase.from('profiles').update({status:'approved'}).eq('id',pid);if(apErr){toast('Approve failed: '+apErr.message);return;}toast('✅ User approved!');notifyEmail('approved',pid);loadApprovals();return;}
    if(a==='reject-user'){if(!confirm('Reject this signup request?'))return;const pid=actionEl.dataset.id;const{error:rjErr}=await supabase.from('profiles').update({status:'rejected'}).eq('id',pid);if(rjErr){toast('Reject failed: '+rjErr.message);return;}toast('Request rejected.');notifyEmail('rejected',pid);loadApprovals();return;}
    if(a==='refresh-approvals'){loadApprovals();return;}
    if (a === 'open-forgot-password') { openForgotPassword(); return; }
    if (a === 'close-modal')          { closeModals(); return; }
    if (a === 'logout') {
      state.session = null; save(); dashView = 'overview'; adminView = 'overview';
      const menu = document.getElementById('mobileMenu');
      if (menu) menu.classList.remove('open');
      location.hash = '#/'; render(); return;
    }
    if (a === 'mark-notifications') {
      const s = currentStudent();
      state.notifications.forEach(n => { if (n.studentId === s.id) n.read = true; });
      save(); render(); return;
    }
    if (a === 'view-student')       { showStudentModal(id); return; }
    if (a === 'edit-user')          { editUserModal(id); return; }
    if (a === 'suspend-user')       { toggleUserSuspend(id); return; }
    if (a === 'delete-user')        { deleteUser(id); return; }
    if (a === 'add-class')          { addClassModal(); return; }
    if (a === 'add-trend')          { addTrendModal(); return; }
    if (a === 'add-program')        { addProgramModal(); return; }
    if (a === 'pay-withdrawal')     { payWithdrawal(id); return; }
    if (a === 'reject-withdrawal')  { rejectWithdrawal(id); return; }
    if (a === 'approve-kyc')        { approveKYC(id); return; }
    if (a === 'reject-kyc')         { rejectKYC(id); return; }
    if (a === 'view-kyc-doc')       { $('#genericModalBody').innerHTML = `<button class="modal-close" data-action="close-modal" aria-label="Close">×</button><img src="${actionEl.dataset.url}" style="width:100%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);">`; $('#genericModal').classList.add('open'); return; }
    if (a === 'resolve-ticket')     { resolveTicket(id); return; }
    if (a === 'select-ticket')      { activeSupportTicket = id; render(); return; }
    if (a === 'class-detail')       { showClassDetail(id); return; }
    if (a === 'course-detail')      { showCourseDetail(id); return; }
    if (a === 'trend-detail')       { showTrendDetail(id); return; }
    if (a === 'edit-course')        { editCourseModal(id); return; }
    if (a === 'reset-demo')         { if (confirm('Reset all local data?')) resetDemo(); return; }
    if (a === 'delete-lesson')      { if(!confirm('Delete this lesson?'))return; const {error:delErr}=await supabase.from('lessons').delete().eq('id',id); if(delErr){toast('Delete failed: '+delErr.message);return;} toast('Lesson deleted.'); loadLessons(); return; }
    if (a === 'ai-overview') {
      const btn=el, res=document.getElementById('ai_ov_result'), txt=document.getElementById('ai_ov_text');
      const title=btn.getAttribute('data-title')||'', mod=btn.getAttribute('data-module')||'';
      btn.disabled=true; btn.textContent='⏳ Generating…';
      (async()=>{
        try{
          const text=await aiGenerate(`Write a concise lecture overview (100-150 words) in simple English for a video lesson titled "${title}". ${mod?`Topic: "${mod}". `:''}Include what the student will learn and 3-4 key concepts as bullet points. Friendly tone.`);
          if(txt)txt.textContent=text; if(res)res.style.display='block';
        }catch(e){ toast('AI failed: '+e.message); }
        btn.disabled=false; btn.textContent='🤖 AI Lecture Overview';
      })();
      return;
    }
    if (a === 'toggle-complete-lesson') {
      const s = currentStudent();
      if(!s.completedLessons) s.completedLessons = [];
      if(s.completedLessons.includes(id)) {
        s.completedLessons = s.completedLessons.filter(x=>x!==id);
        toast('Marked as incomplete.');
      } else {
        s.completedLessons.push(id);
        toast('✅ Lesson completed!');
      }
      save(); render(); return;
    }
  }
});

window.filterWithdrawals = function(q) {
  const query = q.toLowerCase().trim();
  document.querySelectorAll('.pending-wd-card').forEach(card => {
    if(!query || card.dataset.search.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
};

