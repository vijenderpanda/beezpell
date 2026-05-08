const LEVELS = [
  { level: 1, title: 'Learner', xp: 0 },
  { level: 2, title: 'Reader', xp: 150 },
  { level: 3, title: 'Speller', xp: 400 },
  { level: 4, title: 'Word Seeker', xp: 900 },
  { level: 5, title: 'Story Explorer', xp: 1800 },
  { level: 6, title: 'Lexicon Hero', xp: 3500 },
  { level: 7, title: 'Word Wizard', xp: 6500 },
  { level: 8, title: 'Grand Curator', xp: 11000 },
];

function getLevel(xp) {
  let currentLevel = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xp) {
      currentLevel = l;
    } else {
      break;
    }
  }
  return currentLevel;
}

const XP_REWARDS = {
  CORRECT_FORWARD: 10,
  NO_HINT_BONUS: 5,
  CORRECT_REVERSE: 15,
  REVERSE_WHEN_FORWARD_WRONG: 20,
  PERFECT_SESSION: 50,
  WORD_MASTERED: 25,
  DAILY_PRACTICE: 15,
  STREAK_BONUS_PER_DAY: 10,
  NUMBER_WORD_CORRECT: 10,
  SPEED_BONUS_UNDER_3S: 10,
};

module.exports = { LEVELS, getLevel, XP_REWARDS };
