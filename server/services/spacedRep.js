function sm2Update({ interval_days, ease_factor, repetitions }, quality) {
  // quality: 0=fail+hint, 1=fail, 3=correct+hint, 4=correct, 5=correct+fast
  
  let new_ease_factor = ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  new_ease_factor = Math.max(1.3, new_ease_factor);

  let new_repetitions = repetitions;
  let new_interval_days = interval_days;

  if (quality < 3) {
    new_repetitions = 0;
    new_interval_days = 1;
  } else {
    if (new_repetitions === 0) {
      new_interval_days = 1;
    } else if (new_repetitions === 1) {
      new_interval_days = 6;
    } else {
      new_interval_days = Math.round(interval_days * new_ease_factor);
    }
    new_repetitions++;
  }

  const next = new Date();
  next.setDate(next.getDate() + new_interval_days);
  
  const mastered = new_repetitions >= 3 && new_interval_days >= 21;

  return {
    interval_days: new_interval_days,
    ease_factor: new_ease_factor,
    repetitions: new_repetitions,
    next_review: next.toISOString(),
    mastered
  };
}

function resultToQuality(correct, hintUsed, timeTakenMs, avgTimeMs) {
  if (!correct && !hintUsed) return 1;
  if (!correct) return 0;
  if (correct && hintUsed) return 3;
  if (timeTakenMs < avgTimeMs * 0.6) return 5;
  return 4;
}

module.exports = { sm2Update, resultToQuality };
