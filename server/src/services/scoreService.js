export function computeScore(uomType, target, achievement, targetDate, actualDate) {
  let score = 0;
  switch (uomType) {
    case 'min':
      score = target === 0 ? 0 : Math.min((achievement || 0) / target, 1);
      break;
    case 'max':
      score = achievement === 0 ? 1 : Math.min(target / (achievement || 1), 1);
      break;
    case 'timeline':
      if (!actualDate || !targetDate) score = 0;
      else score = new Date(actualDate) <= new Date(targetDate) ? 1 : 0;
      break;
    case 'zero':
      score = (achievement || 0) === 0 ? 1 : 0;
      break;
    default:
      score = 0;
  }
  return Math.round(score * 100);
}
