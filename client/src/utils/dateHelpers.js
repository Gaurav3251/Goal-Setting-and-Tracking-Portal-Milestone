export function getActivePhase(cycle) {
  const today = new Date();
  if (today >= new Date(cycle.q4_opens)) return 'Q4';
  if (today >= new Date(cycle.q3_opens)) return 'Q3';
  if (today >= new Date(cycle.q2_opens)) return 'Q2';
  if (today >= new Date(cycle.q1_opens)) return 'Q1';
  if (today >= new Date(cycle.goal_setting_opens)) return 'GOAL_SETTING';
  return 'NOT_STARTED';
}
