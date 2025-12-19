import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  PenTool, 
  PlusCircle, 
  Brain, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  User,
  Activity,
  XCircle
} from 'lucide-react';

// --- Constants & Questions ---
const PASS_THRESHOLD = 0.8;

const QUALIFICATION_QUIZ = [
  { id: 1, text: "Do you often struggle with academic tasks despite putting in significant effort?", options: ["Never", "Rarely", "Sometimes", "Often"], correctWeight: [0, 1, 2, 3] },
  { id: 2, text: "Do you experience frustration when trying to read or write?", options: ["Never", "Rarely", "Sometimes", "Often"], correctWeight: [0, 1, 2, 3] },
  { id: 3, text: "Have teachers or parents previously mentioned concerns about your learning pace?", options: ["No", "Unsure", "Yes"], correctWeight: [0, 1, 3] },
  { id: 4, text: "Do you feel you have specific strengths in areas like art, sports, or music despite academic struggles?", options: ["No", "Sometimes", "Yes"], correctWeight: [0, 1, 3] },
  { id: 5, text: "Are you interested in identifying potential learning patterns to improve your study methods?", options: ["No", "Maybe", "Yes"], correctWeight: [0, 1, 3] },
];

const DISABILITY_TESTS = {
  dyslexia: {
    title: "Dyslexia Screening",
    description: "Focuses on reading, spelling, and phonological processing.",
    questions: [
      { text: "Do you find yourself rereading sentences multiple times to understand them?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you struggle to pronounce long or unfamiliar words?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "When reading, do letters or words ever appear to move or blur?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you find it difficult to summarize a story you just read?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you have difficulty remembering sequences like the days of the week or months?", options: ["Never", "Sometimes", "Often", "Always"] }
    ]
  },
  dysgraphia: {
    title: "Dysgraphia Screening",
    description: "Focuses on handwriting, fine motor skills, and spatial organization.",
    questions: [
      { text: "Does your hand get tired or cramp quickly when writing?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you struggle to stay within the lines when writing on paper?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Is your handwriting difficult for others (or yourself) to read later?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you find it hard to organize your thoughts on paper even if you know what to say?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you omit letters or words frequently when writing sentences?", options: ["Never", "Sometimes", "Often", "Always"] }
    ]
  },
  dyscalculia: {
    title: "Dyscalculia Screening",
    description: "Focuses on number sense, arithmetic, and mathematical reasoning.",
    questions: [
      { text: "Do you find it difficult to estimate costs or tell how much change you should get?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you struggle to remember basic math facts like multiplication tables?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Is it difficult for you to judge distances or speeds?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you still use your fingers to count for simple addition or subtraction?", options: ["Never", "Sometimes", "Often", "Always"] },
      { text: "Do you find it hard to read analog clocks or manage time effectively?", options: ["Never", "Sometimes", "Often", "Always"] }
    ]
  }
};

// --- Components ---

const ProgressBar = ({ current, total }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
    <div 
      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
      style={{ width: `${(current / total) * 100}%` }}
    ></div>
  </div>
);

const ResultCard = ({ score, total, onReset }) => {
  const percentage = (score / (total * 3)) * 100;
  let status = { label: "Low", color: "text-green-600", bg: "bg-green-50", desc: "Your responses suggest a low probability of significant symptoms in this area." };
  
  if (percentage > 70) {
    status = { label: "High", color: "text-red-600", bg: "bg-red-50", desc: "Your responses suggest a high probability of symptoms. We recommend consulting a professional specialist." };
  } else if (percentage > 35) {
    status = { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50", desc: "Your responses suggest a moderate probability of symptoms. Monitoring and support may be helpful." };
  }

  return (
    <div className={`p-8 rounded-2xl border-2 ${status.bg} text-center shadow-lg animate-in fade-in zoom-in duration-500`}>
      <Activity className={`w-16 h-16 mx-auto mb-4 ${status.color}`} />
      <h2 className="text-2xl font-bold mb-2">Screening Result</h2>
      <div className={`text-4xl font-black mb-4 ${status.color}`}>
        {status.label} Probability
      </div>
      <p className="text-gray-700 mb-8 max-w-md mx-auto leading-relaxed">
        {status.desc}
      </p>
      <button 
        onClick={onReset}
        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedDisability, setSelectedDisability] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUser({ name: formData.get('username') || 'User' });
    setView('qualify');
  };

  const handleQualifyAnswer = (index) => {
    const newAnswers = [...answers, index];
    if (currentQuestion < QUALIFICATION_QUIZ.length - 1) {
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalPossible = QUALIFICATION_QUIZ.reduce((acc, q) => acc + Math.max(...q.correctWeight), 0);
      const userScore = newAnswers.reduce((acc, ansIndex, qIndex) => acc + QUALIFICATION_QUIZ[qIndex].correctWeight[ansIndex], 0);
      
      if (userScore / totalPossible >= PASS_THRESHOLD) {
        setView('home');
      } else {
        setView('not-qualified');
      }
      setAnswers([]);
      setCurrentQuestion(0);
    }
  };

  const startTest = (key) => {
    setSelectedDisability(key);
    setView('test');
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleTestAnswer = (optionIndex) => {
    const newAnswers = [...answers, optionIndex];
    if (currentQuestion < DISABILITY_TESTS[selectedDisability].questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const score = newAnswers.reduce((acc, val) => acc + val, 0);
      setTestResult({ score, total: DISABILITY_TESTS[selectedDisability].questions.length });
      setView('result');
    }
  };

  const logout = () => {
    setUser(null);
    setView('login');
    setAnswers([]);
    setCurrentQuestion(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      {view !== 'login' && view !== 'not-qualified' && (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Brain className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">LDSS <span className="text-indigo-600">Portal</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <button 
              onClick={logout}
              className="text-slate-500 hover:text-red-600 transition-colors p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      )}

      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {view === 'login' && (
          <div className="flex flex-col items-center justify-center pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-indigo-600 p-5 rounded-3xl mb-6 shadow-xl shadow-indigo-200">
              <Brain className="text-white w-12 h-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight">LD Support System</h1>
            <p className="text-slate-500 mb-10 text-center max-w-sm">Empowering learning through intelligent knowledge-based screening.</p>
            
            <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Username or ID</label>
                  <input 
                    name="username"
                    required
                    type="text" 
                    placeholder="Enter your student ID"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Access Key</label>
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Enter Portal
                </button>
              </div>
              <p className="mt-6 text-center text-xs text-slate-400">
                Course: ISP543 Concept Knowledge Based Systems
              </p>
            </form>
          </div>
        )}

        {view === 'qualify' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Pre-Screening Assessment</h2>
              <p className="text-slate-500">Please answer these few questions to determine your eligibility for specific testing.</p>
            </div>
            
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
              <ProgressBar current={currentQuestion + 1} total={QUALIFICATION_QUIZ.length} />
              <div className="mb-8">
                <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase mb-2 block">Question {currentQuestion + 1} of {QUALIFICATION_QUIZ.length}</span>
                <h3 className="text-2xl font-semibold leading-snug">{QUALIFICATION_QUIZ[currentQuestion].text}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {QUALIFICATION_QUIZ[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQualifyAnswer(idx)}
                    className="group flex justify-between items-center p-5 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-indigo-900">{option}</span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'not-qualified' && (
          <div className="flex flex-col items-center justify-center pt-12 animate-in fade-in zoom-in duration-500">
            <div className="bg-red-100 p-6 rounded-full mb-6">
              <XCircle className="text-red-600 w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4">Status: Not Qualified</h2>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md text-center">
              <p className="text-slate-600 mb-8 leading-relaxed">
                Based on your responses, this specific support system might not be necessary for you at this time. Your initial screening score does not indicate a critical need for in-depth learning disability testing.
              </p>
              <button 
                onClick={() => setView('login')}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-1 bg-indigo-600 rounded-full"></div>
              <div>
                <h2 className="text-3xl font-bold">Welcome, {user?.name}</h2>
                <p className="text-slate-500">Select an area to begin your specialized screening assessment.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { key: 'dyslexia', title: 'Dyslexia', icon: <BookOpen />, color: 'bg-blue-500', text: 'Struggles with reading, spelling, and word recognition.' },
                { key: 'dysgraphia', title: 'Dysgraphia', icon: <PenTool />, color: 'bg-emerald-500', text: 'Challenges with handwriting and spatial organization.' },
                { key: 'dyscalculia', title: 'Dyscalculia', icon: <PlusCircle />, color: 'bg-orange-500', text: 'Difficulty understanding numbers and math symbols.' }
              ].map((item) => (
                <div 
                  key={item.key}
                  className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => startTest(item.key)}
                >
                  <div className={`${item.color} p-4 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(item.icon, { size: 32 })}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-grow">{item.text}</p>
                  <button className="w-full py-3 bg-slate-50 text-slate-700 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Start Test
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-indigo-50 rounded-3xl flex items-start gap-4 border border-indigo-100">
              <AlertCircle className="text-indigo-600 w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-indigo-900 mb-1">Important Note</h4>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  These screenings are based on self-reported symptoms and logic from standard diagnostic criteria. They are designed for educational guidance and do not constitute a clinical medical diagnosis.
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'test' && selectedDisability && (
          <div className="animate-in fade-in duration-500">
            <button 
              onClick={() => setView('home')}
              className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight className="rotate-180 w-5 h-5 mr-1" />
              Back to Dashboard
            </button>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{DISABILITY_TESTS[selectedDisability].title}</h2>
                <p className="text-slate-500">{DISABILITY_TESTS[selectedDisability].description}</p>
              </div>
              
              <ProgressBar 
                current={currentQuestion + 1} 
                total={DISABILITY_TESTS[selectedDisability].questions.length} 
              />

              <div className="mb-10">
                <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase mb-2 block">Assessment {currentQuestion + 1} / 5</span>
                <h3 className="text-2xl font-semibold leading-snug">
                  {DISABILITY_TESTS[selectedDisability].questions[currentQuestion].text}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DISABILITY_TESTS[selectedDisability].questions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTestAnswer(idx)}
                    className="p-5 text-center bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 rounded-2xl font-semibold transition-all hover:shadow-lg active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'result' && testResult && (
          <div className="max-w-xl mx-auto">
             <ResultCard 
                score={testResult.score} 
                total={testResult.total} 
                onReset={() => setView('home')} 
             />
             
             <div className="mt-8 space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <CheckCircle2 className="text-indigo-500 w-6 h-6" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Category</p>
                    <p className="font-semibold capitalize">{selectedDisability}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <Activity className="text-indigo-500 w-6 h-6" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Severity Score</p>
                    <p className="font-semibold">{testResult.score} out of {testResult.total * 3}</p>
                  </div>
                </div>
             </div>
          </div>
        )}

      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>© 2024 Knowledge Based Systems Implementation Project</p>
        <p>Developed for ISP543 Course Portfolio</p>
      </footer>
    </div>
  );
}