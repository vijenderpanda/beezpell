import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

/**
 * 7-Stage Word Journey State Machine
 * Stage 0: Memory Anchor (image + word)
 * Stage 1: Look (3s timer, vowels pink, consonants purple)
 * Stage 2: Forward Spelling (type or drag-drop)
 * Stage 3: Look Again (5-6s, only if reverse enabled)
 * Stage 4: Reverse Spelling (only if reverse enabled)
 * Stage 5: Syllables (pick syllable count)
 * Stage 6: Mind Map
 * Stage 7: Usage Sentences
 */

const ALL_STAGES = [
  'anchor',   // 0
  'look',     // 1
  'forward',  // 2
  'look2',    // 3 (conditional)
  'reverse',  // 4 (conditional)
  'syllables',// 5
  'mindmap',  // 6
  'usage',    // 7
];

function getStagesForLearner(learner) {
  const reverseEnabled = learner?.reverse_enabled && 
    (!learner?.learning_support) && 
    (learner?.age >= 8 || !learner?.age);

  if (reverseEnabled) return ALL_STAGES;
  // Skip stages 3 (look2) and 4 (reverse)
  return ['anchor', 'look', 'forward', 'syllables', 'mindmap', 'usage'];
}

export const useQuizStore = create((set, get) => ({
  sessionId: null,
  words: [],
  currentIndex: 0,
  currentStage: 'anchor',
  stages: ALL_STAGES,
  userInput: '',
  reverseInput: '',
  syllableGuess: null,
  forwardCorrect: false,
  reverseCorrect: false,
  results: [],
  xpEarned: 0,
  starsEarned: 0,
  startTime: null,
  stageStartTime: null,
  learner: null,
  guideName: '',

  _lastStepTime: 0,

  initQuiz: async (words, sourceType, storyId, tier, user, guideName) => {
    const stages = getStagesForLearner(user);

    let sessionId = null;
    try {
      const res = await axios.post('/api/quiz/session', {
        user_id: user.id,
        source_type: sourceType,
        story_id: storyId,
        tier,
        total_words: words.length
      });
      sessionId = res.data.id;
    } catch (err) {
      console.warn('Could not create quiz session:', err.message);
      sessionId = 'local-' + Date.now();
    }

    set({
      sessionId,
      words,
      currentIndex: 0,
      currentStage: stages[0],
      stages,
      userInput: '',
      reverseInput: '',
      syllableGuess: null,
      forwardCorrect: false,
      reverseCorrect: false,
      results: [],
      xpEarned: 0,
      starsEarned: 0,
      startTime: Date.now(),
      stageStartTime: Date.now(),
      learner: user,
      guideName: guideName || '',
    });
  },

  nextStage: () => {
    const now = Date.now();
    if (now - get()._lastStepTime < 150) return;
    set({ _lastStepTime: now });

    const { stages, currentStage, currentIndex, words } = get();
    const stageIdx = stages.indexOf(currentStage);

    if (stageIdx < stages.length - 1) {
      // Move to next stage for same word
      set({ currentStage: stages[stageIdx + 1], stageStartTime: Date.now() });
    } else {
      // All stages done for this word — move to next word or complete
      if (currentIndex < words.length - 1) {
        set({
          currentIndex: currentIndex + 1,
          currentStage: stages[0],
          userInput: '',
          reverseInput: '',
          syllableGuess: null,
          forwardCorrect: false,
          reverseCorrect: false,
          stageStartTime: Date.now(),
        });
      } else {
        set({ currentStage: 'complete' });
        get().finishQuiz();
      }
    }
  },

  setForwardResult: (input, correct) => {
    set({ userInput: input, forwardCorrect: correct });
    
    // If wrong, skip reverse stages (go to syllables)
    if (!correct) {
      const { stages } = get();
      const hasReverse = stages.includes('reverse');
      if (hasReverse) {
        // Remove look2 and reverse for this word
        const filtered = stages.filter(s => s !== 'look2' && s !== 'reverse');
        set({ stages: filtered });
      }
    }
  },

  setReverseResult: (input, correct) => {
    set({ reverseInput: input, reverseCorrect: correct });
  },

  setSyllableGuess: (guess) => {
    set({ syllableGuess: guess });
  },

  submitStageAttempt: async (stage, direction, userAnswer, correct, hintUsed = false) => {
    const { sessionId, words, currentIndex, xpEarned, starsEarned, stageStartTime } = get();
    const word = words[currentIndex];
    const timeTaken = stageStartTime ? Date.now() - stageStartTime : 3000;

    let xp = 0;
    let stars = 0;
    if (correct) {
      switch (stage) {
        case 'forward': xp += 10; stars += 1; break;
        case 'reverse': xp += 15; stars += 2; break;
        case 'syllables': xp += 5; break;
        case 'mindmap': xp += 5; break;
        case 'usage': xp += 5; break;
      }
      if (!hintUsed) xp += 3;
      // Speed bonus
      if (timeTaken < 5000) xp += 5;
      else if (timeTaken < 10000) xp += 2;
    }

    try {
      await axios.post('/api/quiz/attempt', {
        session_id: sessionId,
        word_list_id: word.id,
        stage,
        direction,
        user_answer: userAnswer || '',
        correct,
        hint_used: hintUsed,
        time_taken_ms: timeTaken,
      });
    } catch (err) {
      console.warn('Failed to submit attempt:', err.message);
    }

    set({
      xpEarned: xpEarned + xp,
      starsEarned: starsEarned + stars,
      results: [...get().results, { wordId: word.id, stage, correct, xp, timeTaken }],
    });
  },

  finishQuiz: async () => {
    const { sessionId, xpEarned, starsEarned, results, startTime, learner } = get();
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = results.filter(r => r.correct && r.stage === 'forward').length;
    const reverseCorrect = results.filter(r => r.correct && r.stage === 'reverse').length;

    try {
      await axios.post(`/api/quiz/session/${sessionId}/complete`, {
        xp_earned: xpEarned,
        stars_earned: starsEarned,
        duration_seconds: duration,
        correct_count: correctCount,
        forward_correct: correctCount,
        reverse_correct: reverseCorrect,
      });
    } catch (err) {
      console.warn('Failed to finish quiz:', err.message);
    }

    // Update user XP locally in authStore so UI reflects immediately
    if (learner?.id) {
      try {
        const currentLocalUser = useAuthStore.getState().user;
        if (currentLocalUser) {
          useAuthStore.setState({
            user: {
              ...currentLocalUser,
              xp: (currentLocalUser.xp || 0) + xpEarned,
              stars: (currentLocalUser.stars || 0) + starsEarned,
              streak_days: currentLocalUser.streak_days || 1
            }
          });
          // Also update local storage
          localStorage.setItem('beezpell_user', JSON.stringify(useAuthStore.getState().user));
        }
      } catch (err) {
        console.warn('Could not update local auth store', err);
      }
    }
  },
}));
