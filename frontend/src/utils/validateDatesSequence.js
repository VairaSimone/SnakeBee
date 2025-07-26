// src/utils/validateDatesSequence.js
export function validateDatesSequence(events) {
  const order = ['pairing', 'ovulation', 'clutch', 'incubationStart', 'incubationEnd', 'birth'];
  const dates = events
    .filter(e => e.date)
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
    .map(e => ({ type: e.type, date: new Date(e.date) }));
  
  for (let i = 1; i < dates.length; i++) {
    if (dates[i].date < dates[i - 1].date) {
      return {
        valid: false,
        message: `La data di ${dates[i].type} (${dates[i].date.toLocaleDateString()}) è precedente a ${dates[i - 1].type} (${dates[i - 1].date.toLocaleDateString()})`
      };
    }
  }
  return { valid: true };
}
