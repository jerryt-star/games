import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Target, Award, RefreshCw, ChevronRight, 
  CheckCircle2, XCircle, Loader2, Maximize2, 
  HelpCircle, AlertTriangle, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight as ChevronRightIcon 
} from 'lucide-react';

import './index.css';

/**
 * 標本資料庫：定義 10 個顯微鏡觀察目標
 */
const SPECIMENS = [
  { 
    id: 1, 
    name: '蜜蜂的身體', 
    image: 'https://images.unsplash.com/photo-1589307303030-a3598501168f?q=80&w=1000&auto=format', 
    fact: '蜜蜂全身長滿了細細的毛，可以幫助它們黏住花粉並帶回蜂巢！', 
    targetFocus: 50,
    color: '#eab308'
  },
  { 
    id: 2, 
    name: '植物的細胞結構', 
    image: 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?q=80&w=1000&auto=format', 
    fact: '植物細胞看起來像一個個整齊排列的小格子，這些是生命的基本單位。', 
    targetFocus: 35,
    color: '#15803d'
  },
  { 
    id: 3, 
    name: '蝴蝶翅膀的紋路', 
    image: 'https://images.unsplash.com/photo-1551202282-35967073b404?q=80&w=1000&auto=format', 
    fact: '蝴蝶翅膀上蓋滿了像瓦片一樣的微小鱗片，讓它們擁有繽紛的色彩。', 
    targetFocus: 75,
    color: '#9333ea'
  },
  { 
    id: 4, 
    name: '蚊子的樣子', 
    image: 'https://images.unsplash.com/photo-1520625350020-5627622d100d?q=80&w=1000&auto=format', 
    fact: '蚊子的口器長得像細細的針，這讓它們可以吸食植物汁液或血液。', 
    targetFocus: 40,
    color: '#475569'
  },
  { 
    id: 5, 
    name: '海星的皮膚', 
    image: 'https://images.unsplash.com/photo-1545671913-b89a0129a784?q=80&w=1000&auto=format', 
    fact: '海星的皮膚上有許多微小的管足，幫助它們在海底慢慢移動。', 
    targetFocus: 65,
    color: '#f97316'
  },
  { 
    id: 6, 
    name: '細小的纖維', 
    image: 'https://images.unsplash.com/photo-1521676259650-675b5124269e?q=80&w=1000&auto=format', 
    fact: '在顯微鏡下，頭髮或纖維看起來像一根粗粗的繩子，表面有保護層。', 
    targetFocus: 25,
    color: '#44403c'
  },
  { 
    id: 7, 
    name: '螞蟻的頭部', 
    image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?q=80&w=1000&auto=format', 
    fact: '螞蟻有用來感知環境的觸角，還有強壯的大顎可以用來搬運東西。', 
    targetFocus: 85,
    color: '#7f1d1d'
  },
  { 
    id: 8, 
    name: '各種植物花粉', 
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1000&auto=format', 
    fact: '花粉的形狀各種各樣，有的像小刺球，有的像橄欖球，非常有趣。', 
    targetFocus: 45,
    color: '#facc15'
  },
  { 
    id: 9, 
    name: '透明的水中生物', 
    image: 'https://images.unsplash.com/photo-1543158283-e7ab9c5fe483?q=80&w=1000&auto=format', 
    fact: '一滴水裡可能住著許多透明的小生命，在顯微鏡下才會現身！', 
    targetFocus: 30,
    color: '#2563eb'
  },
  { 
    id: 10, 
    name: '真菌的孢子', 
    image: 'https://images.unsplash.com/photo-1635315804829-014c2b291461?q=80&w=1000&auto=format', 
    fact: '黴菌或真菌是由細細的絲組成的，是自然界中重要的分解者。', 
    targetFocus: 70,
    color: '#0d9488'
  },
];

export default function App() {
  const [gameState, setGameState] = useState('start'); 
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // 顯微鏡視覺參數控制
  const [focus, setFocus] = useState(20);
  const [zoomLevel, setZoomLevel] = useState(25); 
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // 系統交互與載入狀態
  const [isInteracting, setIsInteracting] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(null); 
  
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const currentSpecimen = questions[currentIndex];

  const currentOptions = useMemo(() => {
    if (!currentSpecimen) return [];
    const others = SPECIMENS
      .filter(s => s.name !== currentSpecimen.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map(s => s.name);
    return [currentSpecimen.name, ...others].sort();
  }, [currentSpecimen]);

  const actualScale = useMemo(() => 1.0 + (zoomLevel / 100) * 3.5, [zoomLevel]);

  useEffect(() => {
    if (gameState === 'playing' && currentSpecimen) {
      setImgLoading(true);
      const timer = setTimeout(() => setImgLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, gameState, currentSpecimen]);

  const startGame = () => {
    const shuffled = [...SPECIMENS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setScore(0);
    resetView();
    setGameState('playing');
  };

  const resetView = () => {
    setFocus(20);
    setZoomLevel(20);
    setPosition({ x: (Math.random() - 0.5) * 150, y: (Math.random() - 0.5) * 150 });
    setShowFeedback(null);
    setIsInteracting(false);
  };

  const isAligned = useMemo(() => {
    if (!currentSpecimen || imgLoading) return false;
    const focusDiff = Math.abs(focus - currentSpecimen.targetFocus);
    const posDiff = Math.sqrt(position.x ** 2 + position.y ** 2);
    // 判斷邏輯：對焦準確且標本在圓心附近
    return focusDiff < 18 && posDiff < 250 && zoomLevel > 25;
  }, [focus, position, zoomLevel, currentSpecimen, imgLoading]);

  const handleNext = (correct) => {
    if (correct) {
      setScore(s => s + 10);
      setShowFeedback('correct');
    } else {
      setShowFeedback('wrong');
    }
    setTimeout(() => {
      if (currentIndex < 9) {
        setCurrentIndex(i => i + 1);
        resetView();
      } else {
        setGameState('result');
      }
    }, 2000);
  };

  const handleStart = (e) => {
    if (showFeedback) return;
    setIsInteracting(true);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    lastTouchRef.current = { x, y };
  };

  const handleMove = (e) => {
    if (!isInteracting || showFeedback) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = x - lastTouchRef.current.x;
    const dy = y - lastTouchRef.current.y;
    setPosition(prev => ({ x: prev.x + dx / actualScale, y: prev.y + dy / actualScale }));
    lastTouchRef.current = { x, y };
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen w-full bg-sky-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-lg w-full border-[8px] border-sky-300">
          <Search className="w-16 h-16 text-sky-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black text-sky-900 mb-6 tracking-tight text-center">小小生物學家</h1>
          <p className="text-lg md:text-xl text-sky-700 mb-8 font-bold text-center">準備好探索微觀世界了嗎？</p>
          <button 
            onClick={startGame} 
            className="w-full bg-sky-500 hover:bg-sky-600 text-white text-2xl font-black py-5 rounded-full shadow-[0_8px_0_rgb(3,105,161)] active:translate-y-1 active:shadow-none transition-all"
          >
            開始探險！
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen w-full bg-indigo-50 flex items-center justify-center p-4 text-center font-sans">
        <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border-[8px] border-indigo-300 max-w-md w-full">
          <Award className={`w-32 h-32 mx-auto mb-6 ${score >= 80 ? 'text-yellow-400' : 'text-slate-300'} drop-shadow-xl`} />
          <h2 className="text-3xl font-black text-indigo-900 mb-4 text-center">探險任務完成</h2>
          <p className="text-xl text-indigo-700 mb-8 font-bold text-center">總得分：<span className="text-6xl font-black text-indigo-600 ml-2">{score}</span></p>
          <button 
            onClick={startGame} 
            className="w-full bg-indigo-500 text-white text-xl font-black py-5 rounded-full shadow-[0_8px_0_rgb(67,56,202)] active:translate-y-1 transition-all"
          >
            再次挑戰
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* 左側：顯微鏡視野區域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[400px]">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
          <div className="bg-black/60 px-4 py-2 rounded-full border border-sky-400 text-sm font-bold">
            標本: {currentIndex + 1} / 10
          </div>
          <div className="bg-black/60 px-4 py-2 rounded-full border border-yellow-400 text-sm font-bold text-yellow-400">
            分數: {score}
          </div>
        </div>

        {/* 顯微鏡圓形鏡頭 */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] flex-shrink-0">
          <div 
            className="absolute inset-0 rounded-full bg-black border-[10px] md:border-[16px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden cursor-move flex items-center justify-center"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={() => setIsInteracting(false)}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={() => setIsInteracting(false)}
            style={{ touchAction: 'none' }}
          >
            {imgLoading && (
              <div className="z-20 flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
                <p className="font-bold text-sky-200">樣本載入中...</p>
              </div>
            )}

            {currentSpecimen && (
              <img 
                src={currentSpecimen.image}
                alt="生物樣本"
                className="w-[180%] h-auto max-w-none transition-all duration-300 pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${actualScale})`,
                  filter: `blur(${Math.min(Math.abs(focus - currentSpecimen.targetFocus) / 4, 15)}px)`,
                  opacity: imgLoading ? 0 : 1
                }}
              />
            )}

            {showFeedback && (
              <div className={`absolute inset-0 z-30 flex items-center justify-center ${showFeedback === 'correct' ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                {showFeedback === 'correct' ? <CheckCircle2 size={100} className="text-white drop-shadow-lg" /> : <XCircle size={100} className="text-white drop-shadow-lg" />}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full pointer-events-none border-2 border-white/10 shadow-inner"></div>
        </div>

        {/* 下方控制台 */}
        <div className="mt-8 w-full max-w-md space-y-4 px-2">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between mb-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
              <span>放大倍率</span><span>{Math.round(actualScale * 10)}X</span>
            </div>
            <input 
              type="range" min="0" max="100" value={zoomLevel} 
              onChange={(e) => setZoomLevel(Number(e.target.value))} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" 
            />
          </div>
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between mb-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <span>調節對焦</span><span>{focus}</span>
            </div>
            <input 
              type="range" min="0" max="100" value={focus} 
              onChange={(e) => setFocus(Number(e.target.value))} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400" 
            />
          </div>
        </div>
      </div>

      {/* 右側：任務資訊與答題區 */}
      <div className="w-full lg:w-96 bg-slate-800 p-6 md:p-8 flex flex-col border-t-4 lg:border-t-0 lg:border-l-4 border-black/20 overflow-y-auto">
        <h2 className="text-2xl font-black text-sky-400 mb-6 flex items-center gap-3">
          <Target className="w-7 h-7" /> 觀察任務板
        </h2>
        
        <div className="bg-slate-700/50 p-6 rounded-3xl grow flex flex-col shadow-inner border border-white/5">
          <p className="text-xl font-bold mb-6 text-slate-100 leading-relaxed text-center lg:text-left">
            {isAligned ? '✨ 看到了！這是什麼生物？' : '調整縮放與對焦直到畫面清晰，並將標本移至鏡頭中央...'}
          </p>
          
          {isAligned ? (
            <div className="space-y-3">
              {currentOptions.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleNext(opt === currentSpecimen.name)} 
                  className="w-full text-left bg-slate-600 hover:bg-sky-500 p-4 rounded-2xl font-black text-lg transition-all border-b-4 border-black/40 active:translate-y-1 active:border-b-0 flex justify-between items-center group"
                >
                  {opt} <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-600 flex items-center justify-center opacity-30">
                <Search size={32} />
              </div>
              <p className="text-sm font-bold italic text-center">
                小撇步：<br/>
                1. 拖動畫面尋找標本。<br/>
                2. 使用下方拉桿調整清晰度。
              </p>
            </div>
          )}
        </div>

        {showFeedback === 'correct' && (
          <div className="mt-6 p-5 bg-sky-900/40 rounded-2xl border border-sky-400/30 animate-in zoom-in">
            <h4 className="text-sky-300 font-bold mb-1 flex items-center gap-2 text-sm"><Award size={16}/> 生物百科</h4>
            <p className="text-sm italic text-sky-100 leading-relaxed text-center">「{currentSpecimen.fact}」</p>
          </div>
        )}

        <button 
          onClick={resetView} 
          className="mt-8 text-slate-500 hover:text-slate-300 text-xs flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-colors"
        >
          <RefreshCw size={12} /> 重置標本位置
        </button>
      </div>
    </div>
  );
}