import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { useAuthStore } from '../store/authStore';
import { LetterBox } from '../components/LetterBox';
import { Button } from '../components/Button';
import DragDropSpelling from '../components/DragDropSpelling';
import { Volume2, Sparkles, ChevronRight, ArrowLeft, CornerDownLeft, RotateCcw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Quiz = () => {
  const words = useQuizStore(s => s.words);
  const currentIndex = useQuizStore(s => s.currentIndex);
  const currentStage = useQuizStore(s => s.currentStage);
  const xpEarned = useQuizStore(s => s.xpEarned);
  const starsEarned = useQuizStore(s => s.starsEarned);
  const nextStage = useQuizStore(s => s.nextStage);
  const setForwardResult = useQuizStore(s => s.setForwardResult);
  const setReverseResult = useQuizStore(s => s.setReverseResult);
  const setSyllableGuess = useQuizStore(s => s.setSyllableGuess);
  const submitStageAttempt = useQuizStore(s => s.submitStageAttempt);
  const initQuiz = useQuizStore(s => s.initQuiz);
  const forwardCorrect = useQuizStore(s => s.forwardCorrect);
  const learner = useQuizStore(s => s.learner);

  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [localInput, setLocalInput] = useState('');
  const [timer, setTimer] = useState(100);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const inputRef = useRef(null);
  const timerTransitioned = useRef(false);

  const word = words[currentIndex];
  const targetWord = word?.word || '';
  const isDragDrop = learner?.drag_drop_mode || (learner?.age && learner.age < 8);

  useEffect(() => {
    if (!words.length && location.state?.words) {
      initQuiz(location.state.words, location.state.sourceType, location.state.storyId, location.state.tier, user, location.state.guideName);
    }
  }, []);

  useEffect(() => { setLocalInput(''); setShowFeedback(false); setFeedbackCorrect(false); }, [currentIndex, currentStage]);

  useEffect(() => {
    if ((currentStage === 'forward' || currentStage === 'reverse') && !isDragDrop) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [currentStage, currentIndex]);

  useEffect(() => {
    if (currentStage !== 'look' && currentStage !== 'look2') return;
    const duration = currentStage === 'look' ? 3000 : 5500;
    timerTransitioned.current = false;
    setTimer(100);
    const interval = setInterval(() => { setTimer(prev => Math.max(0, prev - (100 / (duration / 50)))); }, 50);
    const timeout = setTimeout(() => { if (!timerTransitioned.current) { timerTransitioned.current = true; nextStage(); } }, duration);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [currentStage, currentIndex]);

  const speak = useCallback(() => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(targetWord);
    u.rate = 0.85; u.lang = 'en-IN';
    window.speechSynthesis.speak(u);
  }, [targetWord]);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (value.length <= targetWord.length) setLocalInput(value);
  };

  const submitForward = () => {
    const correct = localInput.toLowerCase() === targetWord.toLowerCase();
    setForwardResult(localInput, correct);
    submitStageAttempt('forward', 'forward', localInput, correct);
    setFeedbackCorrect(correct); setShowFeedback(true);
  };

  const submitReverse = () => {
    const reverseWord = targetWord.split('').reverse().join('');
    const correct = localInput.toLowerCase() === reverseWord.toLowerCase();
    setReverseResult(localInput, correct);
    submitStageAttempt('reverse', 'reverse', localInput, correct);
    setFeedbackCorrect(correct); setShowFeedback(true);
  };

  const handleDragDropComplete = (answer, correct) => {
    if (currentStage === 'forward') { setForwardResult(answer, correct); submitStageAttempt('forward', 'forward', answer, correct); }
    else { setReverseResult(answer, correct); submitStageAttempt('reverse', 'reverse', answer, correct); }
    setFeedbackCorrect(correct); setShowFeedback(true);
  };

  const handleSyllableSelect = (count) => {
    const correct = count === (word.syllable_count || 1);
    setSyllableGuess(count);
    submitStageAttempt('syllables', 'forward', String(count), correct);
    setFeedbackCorrect(correct); setShowFeedback(true);
  };

  const continueFn = () => { setShowFeedback(false); setLocalInput(''); nextStage(); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && localInput.length > 0) {
      e.preventDefault();
      if (currentStage === 'forward') submitForward();
      else if (currentStage === 'reverse') submitReverse();
    }
  };

  if (!word) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-pulse"><div className="text-5xl mb-4">🐝</div><p className="text-gray-400 font-medium">Preparing your word journey...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background overflow-hidden safe-bottom">
      {/* Header — responsive */}
      <header className="app-header">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 touch-target flex items-center justify-center"><ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="stat-pill bg-amber-light"><Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber" /><span className="text-amber">{xpEarned} XP</span></div>
          <div className="stat-pill bg-purple-light"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple" /><span className="text-purple">{starsEarned} ⭐</span></div>
          <div className="text-gray-400 font-bold text-xs sm:text-sm">{currentIndex + 1}/{words.length}</div>
        </div>
      </header>

      {/* Stage dots — responsive */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 px-4">
        {useQuizStore.getState().stages.map((s, i) => (
          <div key={s} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
            s === currentStage ? 'bg-primary scale-125' : useQuizStore.getState().stages.indexOf(currentStage) > i ? 'bg-primary opacity-40' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <main className="flex flex-col items-center justify-center px-4 sm:px-6 pb-8 sm:pb-12">
        <AnimatePresence mode="wait">

          {/* ANCHOR */}
          {currentStage === 'anchor' && (
            <motion.div key={`anchor-${currentIndex}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-center w-full max-w-lg">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">{word.memory_anchor || '✨'}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-2">Get Ready!</h2>
              <p className="text-gray-400 mb-2 text-sm sm:text-base">Remember this image — it'll help you remember the word</p>
              {word.definition && <p className="text-base sm:text-lg text-gray-500 italic mb-6 sm:mb-8">"{word.definition}"</p>}
              <Button onClick={() => { speak(); nextStage(); }} className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg gap-2">
                Show Me the Word <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* LOOK / LOOK AGAIN */}
          {(currentStage === 'look' || currentStage === 'look2') && (
            <motion.div key={`look-${currentIndex}-${currentStage}`} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:1.1}} className="text-center w-full max-w-lg">
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">
                {currentStage === 'look' ? 'Stage 1 · Look carefully' : 'Stage 3 · Look again!'}
              </p>
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-[0.05em] mb-4 sm:mb-6 break-all">
                {targetWord.split('').map((l, i) => (
                  <span key={i} className={/^[aeiou]$/i.test(l) ? 'text-pink-500' : 'text-purple-400'}>{l}</span>
                ))}
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 font-medium mb-3 sm:mb-4">{word.phonetic}</p>
              <div className="flex justify-center mb-4 sm:mb-6">
                <button onClick={speak} className="flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-full font-bold text-sm touch-target">
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </div>
              <div className="w-48 sm:w-64 mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-75" style={{width: `${timer}%`}} />
              </div>
              <p className="text-xs text-gray-300 mt-2">{currentStage === 'look' ? '3 seconds' : '5 seconds'} to memorize</p>
            </motion.div>
          )}

          {/* FORWARD */}
          {currentStage === 'forward' && !showFeedback && (
            <motion.div key={`forward-${currentIndex}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-lg text-center">
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Stage 2 · Spell the word</p>
              <div className="flex justify-center mb-4 sm:mb-6">
                <button onClick={speak} className="flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all touch-target">
                  <Volume2 className="w-4 h-4" /> Listen Again
                </button>
              </div>
              {word.example_sentence && (
                <p className="text-sm sm:text-lg text-gray-400 italic mb-4 sm:mb-6 px-2">" {word.example_sentence.replace(new RegExp(targetWord, 'gi'), '______')} "</p>
              )}
              {isDragDrop ? (
                <DragDropSpelling targetWord={targetWord} onComplete={handleDragDropComplete} />
              ) : (
                <>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 mb-4 sm:mb-6">
                    {targetWord.split('').map((l, i) => (
                      <LetterBox key={i} letter={localInput[i] || ''} status={localInput[i] ? 'typed' : i === localInput.length ? 'active' : 'empty'} isVowel={'aeiou'.includes(l.toLowerCase())} />
                    ))}
                  </div>
                  <div className="flex justify-center mb-4">
                    <input ref={inputRef} type="text" value={localInput} onChange={handleInputChange} onKeyDown={handleKeyDown}
                      autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      placeholder="Type the word..." className="w-full max-w-sm px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl text-center font-mono tracking-widest rounded-2xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light bg-white" />
                  </div>
                  {localInput.length > 0 && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                      <Button onClick={submitForward} className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg gap-2">Check <CornerDownLeft className="w-5 h-5" /></Button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* REVERSE */}
          {currentStage === 'reverse' && !showFeedback && (
            <motion.div key={`reverse-${currentIndex}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-lg text-center">
              <p className="text-xs sm:text-sm font-bold text-purple uppercase tracking-widest mb-2">Stage 4 · Reverse Spelling</p>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Spell <span className="font-bold text-gray-600">{targetWord}</span> <span className="text-purple font-bold">backwards!</span></p>
              <div className="flex justify-center mb-4 sm:mb-6">
                <button onClick={speak} className="flex items-center gap-2 px-4 py-2 bg-purple-light text-purple rounded-full font-bold text-sm touch-target"><Volume2 className="w-4 h-4" /> Listen</button>
              </div>
              {isDragDrop ? (
                <DragDropSpelling targetWord={targetWord.split('').reverse().join('')} onComplete={handleDragDropComplete} />
              ) : (
                <>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 mb-4 sm:mb-6">
                    {targetWord.split('').map((_, i) => (
                      <LetterBox key={i} letter={localInput[i] || ''} status={localInput[i] ? 'typed' : i === localInput.length ? 'active' : 'empty'} />
                    ))}
                  </div>
                  <div className="flex justify-center mb-4">
                    <input ref={inputRef} type="text" value={localInput} onChange={handleInputChange}
                      onKeyDown={(e) => { if (e.key === 'Enter' && localInput.length > 0) { e.preventDefault(); submitReverse(); }}}
                      autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      placeholder="Type it backwards..." className="w-full max-w-sm px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl text-center font-mono tracking-widest rounded-2xl border-2 border-purple-200 focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple-light bg-white" />
                  </div>
                  {localInput.length > 0 && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                      <Button onClick={submitReverse} className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg gap-2 bg-purple hover:bg-purple-dark"><RotateCcw className="w-5 h-5" /> Check Reverse</Button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* SYLLABLES */}
          {currentStage === 'syllables' && !showFeedback && (
            <motion.div key={`syllables-${currentIndex}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center w-full max-w-lg">
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Stage 5 · Syllables</p>
              <h1 className="text-4xl sm:text-6xl font-bold mb-2">{targetWord}</h1>
              <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">How many syllables does this word have?</p>
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                {[1, 2, 3, 4, 5].map(n => (
                  <motion.button key={n} whileTap={{scale:0.9}} onClick={() => handleSyllableSelect(n)}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-gray-200 text-xl sm:text-2xl font-bold text-gray-700 hover:border-primary hover:bg-primary-light hover:text-primary transition-all shadow-sm touch-target">
                    {n}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* MIND MAP */}
          {currentStage === 'mindmap' && (
            <motion.div key={`mindmap-${currentIndex}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center w-full max-w-lg">
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Stage 6 · Word Connections</p>
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{word.memory_anchor || '✨'}</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{targetWord}</h2>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-card mb-6 text-left space-y-3">
                <div><span className="text-xs font-bold text-gray-400 uppercase">Definition</span><p className="text-gray-700 text-sm sm:text-base">{word.definition}</p></div>
                <div><span className="text-xs font-bold text-gray-400 uppercase">Phonetic</span><p className="text-gray-700 font-mono text-sm sm:text-base">{word.phonetic}</p></div>
                <div><span className="text-xs font-bold text-gray-400 uppercase">Syllables</span><p className="text-gray-700 text-sm sm:text-base">{word.syllables} ({word.syllable_count})</p></div>
                <div><span className="text-xs font-bold text-gray-400 uppercase">Reverse</span><p className="text-gray-700 font-mono text-sm sm:text-base">{word.reverse_word || targetWord.split('').reverse().join('')}</p></div>
              </div>
              <Button onClick={nextStage} className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg">Continue <ChevronRight className="w-5 h-5" /></Button>
            </motion.div>
          )}

          {/* USAGE */}
          {currentStage === 'usage' && (
            <motion.div key={`usage-${currentIndex}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center w-full max-w-lg">
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Stage 7 · In Context</p>
              <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">{word.memory_anchor || '📖'}</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{targetWord}</h2>
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl italic text-gray-600 leading-relaxed">
                  "{word.example_sentence || `The word "${targetWord}" is used in many stories.`}"
                </p>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">Say it out loud: <strong>{targetWord}, {targetWord}, {targetWord}</strong></p>
              <Button onClick={nextStage} className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg gap-2">
                {currentIndex < words.length - 1 ? 'Next Word →' : 'Finish Journey 🏆'}
              </Button>
            </motion.div>
          )}

          {/* FEEDBACK */}
          {showFeedback && (
            <motion.div key={`feedback-${currentIndex}-${currentStage}`} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center w-full max-w-lg">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring', damping:10}} className="text-5xl sm:text-7xl mb-4 sm:mb-6">
                {feedbackCorrect ? '🎉' : '💪'}
              </motion.div>
              <h2 className={`text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 ${feedbackCorrect ? 'text-success' : 'text-coral'}`}>
                {feedbackCorrect ? '✨ Brilliant!' :
                  currentStage === 'syllables' ? `It's ${word.syllable_count} syllable${word.syllable_count > 1 ? 's' : ''}: ${word.syllables}` :
                  `The spelling is: ${currentStage === 'reverse' ? targetWord.split('').reverse().join('') : targetWord}`
                }
              </h2>
              {feedbackCorrect && <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">+{currentStage === 'reverse' ? '15' : currentStage === 'forward' ? '10' : '5'} XP</p>}
              <Button onClick={continueFn} className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg">Continue</Button>
            </motion.div>
          )}

          {/* COMPLETE */}
          {currentStage === 'complete' && (
            <motion.div key="complete" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center w-full max-w-lg">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring', damping:8}} className="text-6xl sm:text-8xl mb-6 sm:mb-8">🏆</motion.div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">Journey Complete!</h1>
              <p className="text-xl sm:text-2xl text-gray-500 mb-8 sm:mb-12">Amazing work today.</p>
              <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card text-center flex-1 max-w-[160px]">
                  <div className="text-primary text-3xl sm:text-5xl font-bold">+{xpEarned}</div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-2">XP EARNED</div>
                </div>
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card text-center flex-1 max-w-[160px]">
                  <div className="text-amber text-3xl sm:text-5xl font-bold">+{starsEarned}</div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-2">STARS</div>
                </div>
              </div>
              <Button onClick={() => navigate(-1)} variant="secondary" className="px-8 sm:px-10">Back to Home</Button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default Quiz;
