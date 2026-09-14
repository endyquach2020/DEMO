
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Upload, 
  Loader2, 
  Target, 
  User, 
  CheckCircle2, 
  Split, 
  Pencil, 
  Lightbulb,
  ChevronRight,
  CircleHelp
} from 'lucide-react';
import { Lesson, GameMode } from './types.ts';
import { INITIAL_LESSONS } from './services/mockData.ts';
import { pdfToImages } from './services/pdfService.ts';
import { processPdfWithGemini } from './services/geminiService.ts';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.LY_THUYET);
  const [studentName, setStudentName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean; msg: string }>>({});

  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];

  const refreshMath = useCallback(() => {
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
      (window as any).MathJax.typesetPromise().catch((err: any) => console.error(err));
    }
  }, []);

  useEffect(() => {
    refreshMath();
    setFeedback({});
    setUserAnswers({});
  }, [currentLessonId, gameMode, lessons, refreshMath]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const images = await pdfToImages(file);
      const newLessons = await processPdfWithGemini(images);
      if (newLessons && newLessons.length > 0) {
        setLessons(prev => [...prev, ...newLessons]);
        setCurrentLessonId(newLessons[0].id);
        setGameMode(GameMode.LY_THUYET);
      } else {
        alert("Không thể trích xuất nội dung từ PDF. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xử lý PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const checkMcq = (qIdx: number, selected: string, correct: string) => {
    const isCorrect = selected === correct;
    setFeedback(prev => ({ 
      ...prev, 
      [`mcq-${qIdx}`]: { 
        correct: isCorrect, 
        msg: isCorrect ? "Chính xác! 🎉" : `Chưa đúng. Đáp án: ${correct}` 
      } 
    }));
    setUserAnswers(prev => ({ ...prev, [`mcq-${qIdx}`]: selected }));
  };

  const checkTrueFalse = (qIdx: number, sIdx: number, userVal: boolean, correctVal: boolean) => {
    const isCorrect = userVal === correctVal;
    setFeedback(prev => ({ 
      ...prev, 
      [`tf-${qIdx}-${sIdx}`]: { 
        correct: isCorrect, 
        msg: isCorrect ? "Đúng!" : "Sai!" 
      } 
    }));
    setUserAnswers(prev => ({ ...prev, [`tf-${qIdx}-${sIdx}`]: userVal }));
  };

  const checkFillBlank = (qIdx: number, userVal: string, correctVal: string) => {
    const isCorrect = userVal.trim().toLowerCase() === correctVal.trim().toLowerCase();
    setFeedback(prev => ({ 
      ...prev, 
      [`fill-${qIdx}`]: { 
        correct: isCorrect, 
        msg: isCorrect ? "Giỏi quá! ✨" : `Đáp án đúng là: ${correctVal}` 
      } 
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-[#00695c] text-white p-4 shadow-xl flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md">
            <BookOpen className="text-white" size={28} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight hidden sm:block">Bài tập Toán 6</h1>
          <h1 className="text-xl font-bold sm:hidden">Toán 6</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-[#00897b] hover:bg-[#00796b] px-4 py-2 rounded-2xl transition-all flex items-center gap-2 shadow-lg border border-white/20">
            <Upload size={20} />
            <span className="hidden md:inline font-semibold">Tải sách PDF</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
          <div className="bg-white/10 p-2 rounded-full border border-white/20 hidden sm:block">
            <User size={20} />
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {isUploading && (
          <div className="fixed inset-0 bg-teal-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-25"></div>
                <Loader2 className="animate-spin text-teal-600 relative" size={64} />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-900">AI đang học bài...</p>
                <p className="text-teal-600 mt-2">Chúng mình đang chuyển nội dung sách thành bài tập cho bạn nhé!</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Dashboard Area */}
        <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-teal-900/5 border border-teal-50 flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-teal-600">
              <div className="w-8 h-1 bg-teal-600 rounded-full"></div>
              <span className="text-sm font-bold uppercase tracking-widest">Đang học chương trình</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              {currentLesson.title}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:items-center">
             <div className="relative group flex-1 sm:w-64">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 transition-colors group-focus-within:text-teal-600" size={20} />
                <input 
                  type="text" 
                  placeholder="Học sinh: Nhập tên em..." 
                  className="w-full pl-12 pr-4 py-4 bg-teal-50/50 border-2 border-teal-100 rounded-3xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-teal-900 font-semibold"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
             </div>
             <div className="relative sm:w-72">
               <select 
                className="w-full appearance-none bg-teal-600 text-white pl-6 pr-12 py-4 rounded-3xl font-bold focus:outline-none shadow-lg hover:bg-teal-700 transition-all cursor-pointer"
                value={currentLessonId}
                onChange={(e) => setCurrentLessonId(Number(e.target.value))}
               >
                 {lessons.map(l => (
                   <option key={l.id} value={l.id} className="text-slate-800 bg-white">{l.title}</option>
                 ))}
               </select>
               <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" size={24} />
             </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
             <ModeCard 
               active={gameMode === GameMode.TRAC_NGHIEM} 
               onClick={() => setGameMode(GameMode.TRAC_NGHIEM)}
               color="purple"
               icon={<CheckCircle2 size={32} />}
               title="Trắc nghiệm"
               desc="Chọn 1 đáp án đúng"
             />
             <ModeCard 
               active={gameMode === GameMode.DUNG_SAI} 
               onClick={() => setGameMode(GameMode.DUNG_SAI)}
               color="orange"
               icon={<Split size={32} />}
               title="Đúng hay Sai?"
               desc="Kiểm tra các phát biểu"
             />
             <ModeCard 
               active={gameMode === GameMode.DIEN_SO} 
               onClick={() => setGameMode(GameMode.DIEN_SO)}
               color="blue"
               icon={<Pencil size={32} />}
               title="Trả lời ngắn"
               desc="Tự điền kết quả"
             />
             <ModeCard 
               active={gameMode === GameMode.LY_THUYET} 
               onClick={() => setGameMode(GameMode.LY_THUYET)}
               color="emerald"
               icon={<Lightbulb size={32} />}
               title="Lý thuyết"
               desc="Tóm tắt kiến thức"
             />
          </div>

          {/* Main Question Display */}
          <div className="lg:col-span-9 bg-white rounded-[40px] p-6 md:p-10 shadow-2xl shadow-teal-900/5 border border-slate-50 min-h-[600px] flex flex-col">
            {gameMode === GameMode.LY_THUYET && (
              <div className="prose prose-teal max-w-none text-slate-700 math-content flex-1">
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 mb-6 flex items-center gap-4">
                   <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg">
                     <Lightbulb size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold m-0 text-emerald-900">Góc ôn tập kiến thức</h3>
                     <p className="text-emerald-700 m-0 text-sm">Cùng xem qua các định nghĩa và ví dụ quan trọng nhất nhé!</p>
                   </div>
                </div>
                <div className="px-2" dangerouslySetInnerHTML={{ __html: currentLesson.raw_html }} />
              </div>
            )}

            {gameMode === GameMode.TRAC_NGHIEM && (
              <div className="space-y-10 flex-1">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                  <div className="bg-purple-600 text-white p-2 rounded-xl">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Thử thách Trắc nghiệm</h3>
                </div>
                {currentLesson.sections.trac_nghiem.length === 0 ? (
                   <p className="text-slate-400 italic text-center py-10">Phần này đang được cập nhật...</p>
                ) : currentLesson.sections.trac_nghiem.map((q, idx) => (
                  <div key={idx} className="space-y-6">
                    <div className="flex items-start gap-4">
                      <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-2xl font-bold text-sm whitespace-nowrap mt-1">Câu {idx + 1}</span>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed math-content">{q.question}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 md:ml-16">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[`mcq-${idx}`] === opt;
                        const result = feedback[`mcq-${idx}`];
                        const labels = ['A', 'B', 'C', 'D'];
                        
                        let btnStyle = "group relative flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left font-bold math-content ";
                        if (isSelected) {
                          btnStyle += result?.correct 
                            ? "bg-green-50 border-green-500 text-green-900 shadow-lg shadow-green-100" 
                            : "bg-red-50 border-red-500 text-red-900 shadow-lg shadow-red-100";
                        } else {
                          btnStyle += "bg-white border-slate-100 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md text-slate-700";
                        }

                        return (
                          <button key={oIdx} onClick={() => checkMcq(idx, opt, q.answer)} className={btnStyle} disabled={!!result}>
                            <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isSelected ? (result?.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 text-slate-500 group-hover:bg-purple-200 group-hover:text-purple-700'}`}>
                              {labels[oIdx]}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {feedback[`mcq-${idx}`] && (
                      <div className={`ml-0 md:ml-16 mt-4 p-5 rounded-[24px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${feedback[`mcq-${idx}`].correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {feedback[`mcq-${idx}`].correct ? '✅' : '❌'}
                        {feedback[`mcq-${idx}`].msg}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {gameMode === GameMode.DUNG_SAI && (
              <div className="space-y-10 flex-1">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                  <div className="bg-orange-600 text-white p-2 rounded-xl">
                    <Split size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Đúng hay Sai?</h3>
                </div>
                {currentLesson.sections.dung_sai.map((q, idx) => (
                  <div key={idx} className="space-y-6">
                    <div className="flex items-start gap-4">
                      <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-2xl font-bold text-sm whitespace-nowrap mt-1">Câu {idx + 1}</span>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed math-content">{q.question}</p>
                    </div>
                    <div className="space-y-3 ml-0 md:ml-16">
                      {q.statements.map((s, sIdx) => {
                        const fb = feedback[`tf-${idx}-${sIdx}`];
                        const userVal = userAnswers[`tf-${idx}-${sIdx}`];
                        const labels = ['a', 'b', 'c', 'd', 'e'];
                        
                        return (
                          <div key={sIdx} className="group bg-slate-50/50 p-5 rounded-[28px] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white hover:shadow-md hover:border-orange-100">
                            <div className="flex items-start gap-4 flex-1">
                               <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:border-orange-200 group-hover:text-orange-500">{labels[sIdx]}</span>
                               <span className="math-content font-semibold text-slate-700 pt-0.5">{s.text}</span>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => checkTrueFalse(idx, sIdx, true, s.isCorrect)}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl font-bold transition-all shadow-sm ${userVal === true ? (fb?.correct ? 'bg-green-600 text-white scale-105' : 'bg-red-600 text-white scale-105') : 'bg-white text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-600'}`}
                                disabled={fb !== undefined}
                              >Đúng</button>
                              <button 
                                onClick={() => checkTrueFalse(idx, sIdx, false, s.isCorrect)}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl font-bold transition-all shadow-sm ${userVal === false ? (fb?.correct ? 'bg-green-600 text-white scale-105' : 'bg-red-600 text-white scale-105') : 'bg-white text-slate-600 border border-slate-200 hover:border-red-400 hover:text-red-600'}`}
                                disabled={fb !== undefined}
                              >Sai</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {gameMode === GameMode.DIEN_SO && (
              <div className="space-y-10 flex-1">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                  <div className="bg-blue-600 text-white p-2 rounded-xl">
                    <Pencil size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Trả lời ngắn</h3>
                </div>
                {currentLesson.sections.dien_so.map((q, idx) => (
                  <div key={idx} className="space-y-6">
                    <div className="flex items-start gap-4">
                      <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-2xl font-bold text-sm whitespace-nowrap mt-1">Câu {idx + 1}</span>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed math-content">{q.question}</p>
                    </div>
                    <div className="ml-0 md:ml-16 flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        placeholder="Em hãy viết kết quả..." 
                        className="bg-slate-50 border-2 border-slate-200 p-4 rounded-[20px] focus:outline-none focus:border-blue-500 focus:bg-white w-full sm:w-80 text-lg font-bold text-slate-700 transition-all shadow-inner"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') checkFillBlank(idx, (e.target as HTMLInputElement).value, q.answer);
                        }}
                        disabled={!!feedback[`fill-${idx}`]}
                      />
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] font-bold shadow-lg shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                          checkFillBlank(idx, input, q.answer);
                        }}
                        disabled={!!feedback[`fill-${idx}`]}
                      >Kiểm tra ngay</button>
                    </div>
                    {feedback[`fill-${idx}`] && (
                      <div className={`ml-0 md:ml-16 mt-4 p-5 rounded-[24px] font-bold flex items-center gap-3 animate-in zoom-in-95 duration-300 ${feedback[`fill-${idx}`].correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {feedback[`fill-${idx}`].correct ? '🌟' : '💡'}
                        {feedback[`fill-${idx}`].msg}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-10 text-center bg-white border-t border-slate-100">
        <div className="flex justify-center gap-6 mb-4">
           <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600"><Target size={20} /></div>
           <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600"><BookOpen size={20} /></div>
           <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600"><CheckCircle2 size={20} /></div>
        </div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">© 2024 MathAI Grade 6 • Vietnam Curriculum</p>
      </footer>
    </div>
  );
};

interface ModeCardProps {
  active: boolean;
  onClick: () => void;
  color: 'purple' | 'orange' | 'blue' | 'emerald';
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const ModeCard: React.FC<ModeCardProps> = ({ active, onClick, color, icon, title, desc }) => {
  const configs = {
    purple: { bg: 'bg-purple-600', text: 'text-white', shadow: 'shadow-purple-100', hover: 'hover:border-purple-300', inactive: 'bg-purple-50 text-purple-700' },
    orange: { bg: 'bg-orange-500', text: 'text-white', shadow: 'shadow-orange-100', hover: 'hover:border-orange-300', inactive: 'bg-orange-50 text-orange-700' },
    blue: { bg: 'bg-blue-600', text: 'text-white', shadow: 'shadow-blue-100', hover: 'hover:border-blue-300', inactive: 'bg-blue-50 text-blue-700' },
    emerald: { bg: 'bg-emerald-600', text: 'text-white', shadow: 'shadow-emerald-100', hover: 'hover:border-emerald-300', inactive: 'bg-emerald-50 text-emerald-700' },
  };

  const c = configs[color];

  return (
    <button 
      onClick={onClick}
      className={`group p-6 rounded-[32px] flex items-center gap-6 transition-all transform border-2 text-left game-card ${active ? `${c.bg} ${c.text} ${c.shadow} scale-[1.03] border-transparent shadow-2xl` : `bg-white border-slate-100 ${c.hover} shadow-sm shadow-slate-200/50`}`}
    >
      <div className={`p-4 rounded-2xl transition-all ${active ? 'bg-white/20' : c.inactive}`}>
        {icon}
      </div>
      <div>
        <h4 className={`font-extrabold text-lg leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
        <p className={`text-xs font-bold mt-1 uppercase tracking-tight opacity-70`}>{desc}</p>
      </div>
    </button>
  );
};

export default App;
