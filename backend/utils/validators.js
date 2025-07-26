
/**
 * Controlla che le date siano in ordine cronologico:
 * pairingDate ≤ ovulationDate ≤ clutchDate ≤ incubationStart ≤ incubationEnd
 * @param {Object} dates
 * @param {string|Date} dates.pairingDate
 * @param {string|Date} [dates.ovulationDate]
 * @param {string|Date} [dates.clutchDate]
 * @param {string|Date} [dates.incubationStart]
 * @param {string|Date} [dates.incubationEnd]
 * @returns {string|null} Messaggio di errore se fuori sequenza, altrimenti null
 */
export function validateDatesSequence({
  ovulationDate,
  clutchDate,
  incubationStart,
  incubationEnd
}) {
  // converte in Date oggetti o stringhe
  const seq = [
    { name: 'ovulationDate',   date: ovulationDate   ? new Date(ovulationDate)   : null },
    { name: 'clutchDate',      date: clutchDate      ? new Date(clutchDate)      : null },
    { name: 'incubationStart', date: incubationStart ? new Date(incubationStart) : null },
    { name: 'incubationEnd',   date: incubationEnd   ? new Date(incubationEnd)   : null },
  ];

  let prev = null;
  for (const { name, date } of seq) {
    if (!date) continue;       // non ci sono altri date → esci
    if (isNaN(date.getTime())) {
      return `${name} non è una data valida`;
    }
    if (prev && date < prev.date) {
      return `${name} (${date.toISOString().split('T')[0]}) viene prima di ${prev.name} (${prev.date.toISOString().split('T')[0]})`;
    }
    prev = { name, date };
  }
  return null;
}
