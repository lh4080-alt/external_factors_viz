// Period -> startDate (ISO YYYY-MM-DD).
// Inputs are ISO strings; output is also ISO. Calendar math (not trading-day),
// matches user expectation of "1 month ago" being a calendar offset.

(function (global) {
  function startDate(period, asOfIso) {
    const end = new Date(asOfIso + "T00:00:00");
    if (period === "YTD") {
      return `${end.getUTCFullYear()}-01-01`;
    }
    const map = { "1M": -1, "3M": -3, "6M": -6, "1Y": -12 };
    const months = map[period];
    if (months === undefined) return asOfIso;
    end.setUTCMonth(end.getUTCMonth() + months);
    return end.toISOString().slice(0, 10);
  }

  function sliceFrom(series, startIso) {
    if (!series || series.length === 0) return [];
    return series.filter(d => d.date >= startIso);
  }

  global.DateFilter = { startDate, sliceFrom };
})(window);
