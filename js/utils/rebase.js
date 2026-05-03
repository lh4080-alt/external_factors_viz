// rebase100 — normalize a series so its first data point starts at 100.
//
// Two flavors:
//   rebaseSeries(rawSlice)      -> [{date, value}], for series.{date,close}
//   rebaseAgainst(rawSlice, ema)-> [{date, value}], for ema.{date,value}
//
// The second form is critical: an EMA line must be rebased against the
// underlying raw close at startDate, NOT the first EMA value. Otherwise
// the EMA visually "snaps" to 100 and stops tracking the raw line.

(function (global) {
  function rebaseSeries(slice) {
    if (!slice || slice.length === 0) return [];
    const base = slice[0].close;
    if (!base || base <= 0) return [];
    return slice.map(d => ({ date: d.date, value: (d.close / base) * 100 }));
  }

  function rebaseAgainst(emaSlice, base) {
    if (!emaSlice || emaSlice.length === 0 || !base || base <= 0) return [];
    return emaSlice.map(d => ({ date: d.date, value: (d.value / base) * 100 }));
  }

  global.Rebase = { rebaseSeries, rebaseAgainst };
})(window);
