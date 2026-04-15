import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Paperclip, Send, Database,
  Activity, User, TrendingUp, PieChart, Layout, Cpu, LogOut, Globe,
  BarChart4, BrainCircuit, Globe2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import { auth, db, provider, storage } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const dict = {
  en: {
    welcome: "Welcome to Brainwavecopilot",
    subtitle: "A simple tool to analyze your business data.",
    loginBtn: "Login with Google",
    analyzing: "Analyzing...",
    uploadDataTitle: "Upload Data",
    uploadDataPrompt: "Upload your data file (CSV/Excel)",
    startChatInfo: "Please upload your sales data to begin.",
    btnSend: "Send",
    newAnalysis: "New Analysis",
    historyTitle: "Analysis History",
    activeSession: "Active Data Session",
    dataFilesTitle: "Data Files",
    noDataFiles: "No datasets loaded",
    languageMenu: "Language",
    logout: "Log Out",
    welcomeHeader: "Brainwavecopilot",
    welcomeDesc: "Upload your sales data here. Brainwavecopilot will look at your real data and answer your questions.",
    sugMarginDisplay: "Analyze Profit",
    sugMarginDesc: "Check profit vs cost",
    sugTrendDisplay: "Sales Trends",
    sugTrendDesc: "See future sales",
    sugItemsDisplay: "Top Items",
    sugItemsDesc: "Best selling products",
    sugAuditDisplay: "Quick Check",
    sugAuditDesc: "Review business health",
    placeholder: "Ask a question about your data...",
    previewRow: "Showing a preview of your data",
    aiThinking: "Consulting Brainwavecopilot...",
    userLabel: "You",
    mockLoginNotice: "Notice: Firebase keys are missing, using mock login.",
    error: "Error:",
    fileParsed: "parsed successfully. You can ask questions now.",
    errFile: "Error reading file. Please ensure it is a valid Excel or CSV file.",
    noDataChart: "I can't draw a chart with this data, but I can answer questions.",
    askUploadFirst: "Please upload a data file first.",
    distText: "Here is the split of",
    trendText: "Here is the trend for",
    openAiOffline: "Brainwavecopilot processing is currently offline. Please contact the administrator.",
    openAiError: "Brainwavecopilot Error: ",
    loadingAuth: "Connecting securely...",
    
    // Full Landing Page Content
    landingTitle: "Unlock Business Intelligence",
    landingSub: "Upload your exact retail data and let Brainwavecopilot create perfect strategies, spot unseen trends, and instantly optimize your margins.",
    feat1Title: "Instant Data Analytics",
    feat1Desc: "Drop your CSV files and instantly unlock beautiful revenue, profit, and item distribution charts rendered in real-time.",
    feat2Title: "Dedicated Strategic Insights",
    feat2Desc: "Our proprietary Brainwavecopilot engine specifically analyzes the mechanics of your sales and writes out actionable business advice.",
    feat3Title: "Bilingual Operations",
    feat3Desc: "Providing native interfaces natively in Swahili and English, tailored exactly to the East African market.",
    pricingHeader: "Simple, Transparent Pricing",
    pricingSub: "One fixed subscription to empower your entire sales network with Brainwavecopilot engine.",
    planName: "Pro Analytics",
    planPrice: "30,000",
    planCurrency: "TZS",
    planCycle: "per month",
    feat1: "Unlimited Dataset Uploads",
    feat2: "Advanced Recharts Visualizations",
    feat3: "Brainwavecopilot Strategy Reports",
    feat4: "Secure Firebase Cloud Storage",
    startBtn: "Get Started Now",
    footerText: "© 2026 Brainwavecopilot Intelligence. All rights reserved."
  },
  sw: {
    welcome: "Karibu Brainwavecopilot",
    subtitle: "Zana rahisi ya kuchambua data za biashara yako.",
    loginBtn: "Ingia kwa Google",
    analyzing: "Inachambua...",
    uploadDataTitle: "Weka Data",
    uploadDataPrompt: "Weka faili lako la data (Kama CSV au Excel)",
    startChatInfo: "Tafadhali weka data zako za mauzo ili kuanza.",
    btnSend: "Tuma",
    newAnalysis: "Uchambuzi Mpya",
    historyTitle: "Historia Yako",
    activeSession: "Kipindi Hiki",
    dataFilesTitle: "Faili Zilizowekwa",
    noDataFiles: "Hakuna data iliyowekwa",
    languageMenu: "Lugha",
    logout: "Toka",
    welcomeHeader: "Brainwavecopilot",
    welcomeDesc: "Weka faili lako la mauzo hapa. Brainwavecopilot itasoma data zako na kujibu maswali yako.",
    sugMarginDisplay: "Chambua Faida",
    sugMarginDesc: "Faida na gharama",
    sugTrendDisplay: "Mwenendo",
    sugTrendDesc: "Tazama mauzo yajayo",
    sugItemsDisplay: "Bidhaa Bora",
    sugItemsDesc: "Zinazonunuliwa zaidi",
    sugAuditDisplay: "Ukaguzi",
    sugAuditDesc: "Angalia afya ya biashara",
    placeholder: "Uliza swali lolote kuhusu data zako...",
    previewRow: "Tunaonyesha mistari michache kutoka kwenye data yako",
    aiThinking: "Brainwavecopilot inatafuta majibu...",
    userLabel: "Wewe",
    mockLoginNotice: "Taarifa: Mfumo unatumia akaunti ya majaribio usipo kamilisha usajili wake.",
    error: "Kuna hitilafu:",
    fileParsed: "limesomwa kikamilifu. Unaweza kuuliza maswali sasa.",
    errFile: "Kosa kusoma faili. Tafadhali hakikisha ni faili sahihi la Excel au CSV.",
    noDataChart: "Sipati namba za kuchora chati, lakini naweza kujibu maswali yako.",
    askUploadFirst: "Tafadhali weka faili la data kwanza kusudi nianze.",
    distText: "Huu ni mtawanyiko wa",
    trendText: "Huu ni mwenendo wa",
    openAiOffline: "Huduma za Brainwavecopilot ziko nje ya mtandao kwa sasa. Tafadhali wasiliana na utawala.",
    openAiError: "Kuna shida ikitoka mtandao wa Brainwavecopilot: ",
    loadingAuth: "Inaunganisha kwa usalama...",
    
    // Full Landing Page Content
    landingTitle: "Fumbua Siri za Biashara Yako",
    landingSub: "Weka data zako za mauzo na uruhusu Brainwavecopilot ikupe mikakati thabiti, igundue mienendo, na kukuongezea faida mara moja.",
    feat1Title: "Uchambuzi wa Data Papo Hapo",
    feat1Desc: "Tupia faili lako la CSV na uone chati nzuri za mapato na mtawanyiko wa bidhaa zako zikichambuliwa kwa sekunde.",
    feat2Title: "Uchambuzi wa Kimkakati",
    feat2Desc: "Brainwavecopilot inasoma kwa kina namba zako na kukuandikia ushauri halisi wa kibiashara unaoweza kuufanyia kazi mara moja.",
    feat3Title: "Mfumo wa Lugha Mbili",
    feat3Desc: "Uwezo wa kutumika kwa Kiswahili na Kiingereza, umetengenezwa maalum kuendana na soko letu la Afrika Mashariki.",
    pricingHeader: "Bei Rafiki na Wazi",
    pricingSub: "Malipo maalum ya kila mwezi yanayokupa uwezo wote unaohitaji kwa biashara yako kupitia Brainwavecopilot.",
    planName: "Uchambuzi Pro",
    planPrice: "30,000",
    planCurrency: "TZS",
    planCycle: "kwa mwezi",
    feat1: "Kusoma Data Bila Kikomo",
    feat2: "Michoro Imara (Charts Visuals)",
    feat3: "Ripoti za Kimkakati (Swahili)",
    feat4: "Hifadhi ya Mtandao ya Salama",
    startBtn: "Anza Sasa Hivi",
    footerText: "© 2026 Brainwavecopilot Intelligence. Haki zote zimehifadhiwa."
  }
};

function BWLogo({ size = 32 }) {
  return (
    <div style={{
      width: size,
      height: size,
      backgroundColor: '#38bdf8',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0f172a',
      fontSize: size * 0.45,
      lineHeight: 1
    }}>
      <span className="bw-logo">BW</span>
    </div>
  );
}

function LandingPage({ onLogin, lang, setLang }) {
  const [loading, setLoading] = useState(false);
  const t = dict[lang];

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code === "auth/invalid-api-key") {
         alert(t.mockLoginNotice);
         setTimeout(() => {
           onLogin({ uid: 'test-user', displayName: t.userLabel });
         }, 1000);
      } else {
         alert(t.error + " " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BWLogo size={36} />
          <span style={{ fontWeight: '800', fontSize: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>Brainwavecopilot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#1e293b', padding: '0.35rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.25rem' }}>
            <button onClick={() => setLang('en')} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', borderRadius: '6px', background: lang === 'en' ? '#38bdf8' : 'transparent', color: lang === 'en' ? '#000' : '#94a3b8', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>EN</button>
            <button onClick={() => setLang('sw')} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', borderRadius: '6px', background: lang === 'sw' ? '#38bdf8' : 'transparent', color: lang === 'sw' ? '#000' : '#94a3b8', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>SW</button>
          </div>
          <button style={{ padding: '0.75rem 2rem', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }} onClick={handleGoogleLogin}>
            Log In
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, width: '100%' }}>
        {/* Hero Section */}
        <div className="landing-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '2.5rem', border: '1px solid rgba(56,189,248,0.2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Activity size={16} /> Powered by Live Intelligence
          </div>
          <h1 className="landing-title">{t.landingTitle}</h1>
          <p className="landing-sub">{t.landingSub}</p>
          
          <button className="google-btn" onClick={handleGoogleLogin} disabled={loading} style={{ maxWidth: '320px', margin: '0 auto', padding: '1.25rem', fontSize: '1.1rem', boxShadow: '0 10px 40px rgba(56,189,248,0.25)', borderRadius: '12px' }}>
            {loading ? <div className="spinner"></div> : <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t.startBtn}
            </>}
          </button>
        </div>

        {/* Features Three-Column Grid */}
        <div style={{ backgroundColor: '#0B1120' }}>
          <div className="landing-features-grid">
            <div className="feature-box">
               <div className="feature-icon-wrapper"><BarChart4 size={28} /></div>
               <h3 className="feature-title">{t.feat1Title}</h3>
               <p className="feature-desc">{t.feat1Desc}</p>
            </div>
            <div className="feature-box">
               <div className="feature-icon-wrapper"><BrainCircuit size={28} /></div>
               <h3 className="feature-title">{t.feat2Title}</h3>
               <p className="feature-desc">{t.feat2Desc}</p>
            </div>
            <div className="feature-box">
               <div className="feature-icon-wrapper"><Globe2 size={28} /></div>
               <h3 className="feature-title">{t.feat3Title}</h3>
               <p className="feature-desc">{t.feat3Desc}</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.5px' }}>{t.pricingHeader}</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.15rem', marginBottom: '3rem' }}>{t.pricingSub}</p>

          <div className="pricing-card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: '#38bdf8', color: '#000', fontSize: '0.8rem', fontWeight: 900, padding: '0.5rem 1.75rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 10px rgba(56,189,248,0.3)' }}>
              Recommended
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>{t.planName}</h3>
            <div className="pricing-amount">
              {t.planPrice}
            </div>
            <div className="pricing-cycle" style={{ marginBottom: '2.5rem' }}>
              {t.planCurrency} {t.planCycle}
            </div>
            
            <ul className="pricing-features">
              <li>{t.feat1}</li>
              <li>{t.feat2}</li>
              <li>{t.feat3}</li>
              <li>{t.feat4}</li>
            </ul>

            <button style={{ width: '100%', padding: '1.25rem', background: '#fff', color: '#000', fontWeight: '800', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginTop: '1rem' }} onClick={handleGoogleLogin}>
              {t.startBtn}
            </button>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        {t.footerText}
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [lang, setLang] = useState('sw');
  const t = dict[lang];

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [data, setData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [files, setFiles] = useState([]);
  const [sessionId, setSessionId] = useState(() => Date.now().toString());
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Keep users logged in after refresh
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (messages.length === 0 && user) {
       setMessages([{ id: 1, role: 'ai', text: t.startChatInfo, type: 'text' }]);
    }
  }, [user, lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (user && db) {
      try {
        const q = query(collection(db, 'users', user.uid, 'chats'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
           const dbMessages = snapshot.docs
             .map(doc => ({ id: doc.id, ...doc.data() }))
             .filter(msg => msg.sessionId === sessionId);
           
           if(dbMessages.length > 0) {
             setMessages(dbMessages);
           } else {
             setMessages([]);
           }
        }, (error) => {
           console.warn("Firestore Rules Blocked Activity:", error.message);
        });
        return () => unsubscribe();
      } catch (err) {}
    }
  }, [user, sessionId]);

  const saveMessageToFirestore = async (msgObj) => {
    if (user && db) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'chats'), { ...msgObj, sessionId, createdAt: new Date() });
      } catch (e) {}
    }
  };

  const addMessage = (msgObj) => {
    setMessages(prev => [...prev, msgObj]);
    saveMessageToFirestore(msgObj);
  };

  if (authChecking) {
    return <div className="flex-center" style={{ height: '100vh', background: '#0f172a', color: 'white', flexDirection: 'column' }}>
      <div className="spinner mb-4" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', width: '32px', height: '32px' }}></div>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>{t.loadingAuth}</p>
    </div>;
  }

  if (!user) {
    return <LandingPage onLogin={setUser} lang={lang} setLang={setLang} />;
  }

  const handleLogout = async () => {
    try { await signOut(auth); } catch(e){}
    setUser(null);
    setMessages([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    if (user && storage) {
      try {
        const fileRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
      } catch (uploadError) {
        console.error("Storage upload error:", uploadError);
      }
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        setData(jsonData);
        setFiles(prev => [file.name, ...prev]);
        setIsUploading(false);

        addMessage({
          id: Date.now(),
          role: 'ai',
          text: `**${file.name}** ${t.fileParsed}`,
          type: 'data_preview',
          payload: jsonData.slice(0, 5)
        });
      } catch (err) {
        setIsUploading(false);
        addMessage({ id: Date.now(), role: 'ai', text: t.errFile, type: 'text' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchOpenAIInsight = async (queryText, dataset) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'weka_api_key_hapa') {
      return t.openAiOffline;
    }

    let summaryText = "No dataset given.";
    if (dataset && dataset.length > 0) {
      const keys = Object.keys(dataset[0]).join(", ");
      const sample = JSON.stringify(dataset.slice(0, 3));
      summaryText = `User uploaded a data file with columns: ${keys}. Here is a sample: ${sample}.`;
    }
    
    try {
      const languageInstruction = lang === 'sw' 
        ? "You MUST answer the user in simple Tanzanian Swahili (Kiswahili). Be a helpful business advisor." 
        : "You MUST answer in English. Be a helpful business advisor.";
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", 
          messages: [
            { role: "system", content: `${languageInstruction} Context: ${summaryText}` },
            { role: "user", content: queryText }
          ]
        })
      });

      if (!response.ok) {
         throw new Error(response.statusText);
      }
      const json = await response.json();
      return json.choices[0].message.content;
    } catch (e) {
       return t.openAiError + e.message;
    }
  };

  const generateRealAnalysis = (queryText, dataset) => {
    if (!dataset || dataset.length === 0) {
      return { type: 'text', payload: null };
    }

    const keys = Object.keys(dataset[0]);
    const xKey = keys.find(k => /date|day|jina|tarehe|name|item|product|category|id|sku/i.test(k)) || keys[0];
    const yKeys = keys.filter(k => typeof dataset[0][k] === 'number' || !isNaN(parseFloat(dataset[0][k])));
    
    if (yKeys.length === 0) {
      return { type: 'text', payload: null };
    }

    const yCategory = yKeys[0];
    let chartData = dataset.slice(0, 15).map((row, i) => {
      let obj = { name: row[xKey] ? String(row[xKey]).substring(0, 15) : `Item ${i+1}` };
      obj[yCategory] = parseFloat(row[yCategory]) || 0;
      return obj;
    });

    if (queryText.includes('faida') || queryText.includes('profit') || queryText.includes('category') || queryText.includes('margin') || queryText.includes('items') || queryText.includes('audit')) {
      return { type: 'chart', payload: { chartType: 'bar', chartData, dataKeys: [yCategory] } };
    } else {
      return { type: 'chart', payload: { chartType: 'area', chartData, dataKeys: [yCategory] } };
    }
  };

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const text = textOverride || inputText;
    if (!text.trim()) return;

    addMessage({ id: Date.now(), role: 'user', text: text, type: 'text' });
    
    const queryText = text.toLowerCase();
    setInputText('');
    setIsThinking(true);

    try {
      let chartDecision = generateRealAnalysis(queryText, data);
      let aiText = await fetchOpenAIInsight(text, data);
      
      setIsThinking(false);
      addMessage({
         id: Date.now() + 1,
         role: 'ai',
         text: aiText,
         type: chartDecision.payload ? chartDecision.type : 'text',
         payload: chartDecision.payload
      });
      
    } catch(err) {
      setIsThinking(false);
      addMessage({ id: Date.now() + 2, role: 'ai', text: t.error + " " + err.message, type: 'text' });
    }
  };

  const quickActions = [
    { title: t.sugMarginLine || "margin", display: t.sugMarginDisplay, desc: t.sugMarginDesc, icon: <Layout size={18} /> },
    { title: t.sugTrendLine || "trend", display: t.sugTrendDisplay, desc: t.sugTrendDesc, icon: <TrendingUp size={18} /> },
    { title: t.sugItemsLine || "items", display: t.sugItemsDisplay, desc: t.sugItemsDesc, icon: <PieChart size={18} /> },
    { title: t.sugAuditLine || "audit", display: t.sugAuditDisplay, desc: t.sugAuditDesc, icon: <Cpu size={18} /> }
  ];

  return (
    <div className="app-layout relative">
      <aside className="sidebar">
        <div className="sidebar-header">
          <BWLogo size={24} />
          <div className="logo-text">Brainwavecopilot</div>
        </div>

        <button className="new-analysis-btn" onClick={() => {
           const newSession = Date.now().toString();
           setSessionId(newSession);
           setMessages([{ id: Date.now(), role: 'ai', text: t.startChatInfo, type: 'text', sessionId: newSession }]);
           setData(null);
           setFiles([]);
           if (user && db) {
             try { addDoc(collection(db, 'users', user.uid, 'chats'), { id: Date.now(), role: 'ai', text: t.startChatInfo, type: 'text', sessionId: newSession, createdAt: new Date() }); } catch(e){}
           }
        }}>
          <Plus size={16} />
          {t.newAnalysis}
        </button>

        <div className="sidebar-content">
          <div className="nav-group-label">{t.historyTitle}</div>
          <div className="nav-link active">
            <Activity size={16} />
            {t.activeSession}
          </div>

          <div className="nav-group-label mt-6">{t.dataFilesTitle}</div>
          {files.map((f, i) => (
            <div key={i} className="nav-link">
              <Database size={16} />
              {f.length > 20 ? f.substring(0, 17) + '...' : f}
            </div>
          ))}
          {!files.length && <div className="px-4 text-[10px] text-[#64748b]">{t.noDataFiles}</div>}
        </div>

        <div className="mt-auto p-2 border-t border-[rgba(255,255,255,0.05)]">
           <div className="nav-link cursor-pointer flex justify-between" onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}>
             <div className="flex items-center gap-3"><Globe size={14} /> {t.languageMenu}</div>
             <div className="text-[10px] bg-[#38bdf8] text-[#0f172a] px-1.5 rounded font-bold">{lang.toUpperCase()}</div>
          </div>
          <div className="nav-link text-red-400 cursor-pointer" onClick={handleLogout}>
            <LogOut size={14} />
             {t.logout}
          </div>
        </div>
      </aside>

      <main className="main-workspace">
        <div className="chat-container">
          <div className="chat-thread">
            {messages.length === 1 && (
              <div className="empty-state-hero text-center">
                <h1>{t.welcomeHeader}</h1>
                <p>{t.welcomeDesc}</p>
                <div className="quick-actions">
                  {quickActions.map((action, i) => (
                    <button key={i} className="action-card" onClick={() => handleSendMessage(null, action.title)}>
                      <div className="text-[#38bdf8] mb-3">{action.icon}</div>
                      <div className="action-title">{action.display}</div>
                      <div className="action-desc">{action.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="message-row">
                <div className={`avatar-container ${msg.role}`}>
                  {msg.role === 'ai' ? 'BW' : <User size={16} />}
                </div>
                <div className="message-body">
                  <div className="message-role-label">
                    {msg.role === 'ai' ? 'Brainwavecopilot' : user.displayName || t.userLabel}
                  </div>
                  <div className="message-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  
                  {msg.type === 'data_preview' && (
                    <div className="data-table-card">
                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              {Object.keys(msg.payload[0] || {}).map(k => <th key={k}>{k}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.payload.map((row, i) => (
                              <tr key={i}>
                                {Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-2 text-center text-[10px] text-[#64748b] bg-[#0f172a]">
                        {t.previewRow}
                      </div>
                    </div>
                  )}

                  {msg.type === 'chart' && (
                    <div className="chart-card">
                      <ResponsiveContainer width="100%" height={300}>
                        {msg.payload.chartType === 'area' ? (
                          <AreaChart data={msg.payload.chartData}>
                            <defs>
                              <linearGradient id="proGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                            <Area type="monotone" name={msg.payload.dataKeys[0]} dataKey={msg.payload.dataKeys[0]} stroke="#38bdf8" fill="url(#proGlow)" strokeWidth={2} />
                          </AreaChart>
                        ) : (
                          <BarChart data={msg.payload.dataKeys[0] ? msg.payload.chartData : []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                            {msg.payload.dataKeys[0] && <Bar name={msg.payload.dataKeys[0]} dataKey={msg.payload.dataKeys[0]} fill="#38bdf8" radius={[2, 2, 0, 0]} barSize={50} />}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="message-row">
                <div className="avatar-container ai">BW</div>
                <div className="message-body">
                  <div className="message-role-label">{t.aiThinking}</div>
                  <div className="dots-container">
                    <div className="dot" style={{ animationDelay: '0s' }}></div>
                    <div className="dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="dot" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="input-section relative" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="input-bar-container">
            <button className="icon-button" onClick={() => fileInputRef.current?.click()} title={t.uploadDataTitle}>
              <Paperclip size={20} />
            </button>

            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" />
            
            <textarea 
              className="text-input ml-2"
              rows="2"
              placeholder={t.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            
            <button className="icon-button send-button" onClick={handleSendMessage} disabled={!inputText.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
