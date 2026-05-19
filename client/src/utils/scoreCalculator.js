export function computeScore(uomType, target, achievement, targetDate, actualDate) {
  switch (uomType) {
    case 'min':
      return target === 0 ? 0 : Math.min((achievement || 0) / target, 1) * 100;
    case 'max':
      return achievement === 0 ? 100 : Math.min(target / (achievement || 1), 1) * 100;
    case 'timeline':
      if (!actualDate || !targetDate) return 0;
      return new Date(actualDate) <= new Date(targetDate) ? 100 : 0;
    case 'zero':
      return (achievement || 0) === 0 ? 100 : 0;
    default:
      return 0;
  }
}
