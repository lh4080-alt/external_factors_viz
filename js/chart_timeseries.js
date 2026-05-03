// Block 1 — multi-line trend with period toggle, rebase 100, optional EMA.
//
// Critical detail: EMA lines are rebased against the FIRST RAW CLOSE in the
// selected period, not their own first value. Otherwise EMA snaps to 100 and
// stops tracking the underlying close visually.

(function (global) {
  const COLORS = [
    "#7eb6ff",  // KOSPI200 (cool, neutral)
    "#ffae42",  // 반도체
    "#9b9bff",  // 2차전지
    "#2ca02c",  // dynamic-1 (top z)
    "#bcbd22",  // dynamic-2
  ];

  let chartInstance = null;
  let cachedData = null;
  let currentPeriod = "1Y";

  function lineLabel(line) {
    if (line.z_score == null) return line.name;
    const sign = line.z_score >= 0 ? "+" : "";
    return `${line.name} (z${sign}${line.z_score.toFixed(1)})`;
  }

  function buildSeriesForLine(line, idx, startIso, options) {
    const out = [];
    const raw = cachedData.series[line.id] || [];
    const slice = DateFilter.sliceFrom(raw, startIso);
    if (slice.length === 0) return out;

    const base = slice[0].close;
    const color = COLORS[idx % COLORS.length];
    const rebased = Rebase.rebaseSeries(slice);

    out.push({
      name: lineLabel(line),
      type: "line",
      data: rebased.map(d => [d.date, +d.value.toFixed(3)]),
      symbol: "none",
      smooth: false,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      z: 10 + idx,
    });

    const ema = (cachedData.ema || {})[line.id];
    if (ema) {
      if (options.ema5 && ema.ema5) {
        const r = Rebase.rebaseAgainst(DateFilter.sliceFrom(ema.ema5, startIso), base);
        if (r.length) out.push({
          name: `${line.name} EMA5`,
          type: "line",
          data: r.map(d => [d.date, +d.value.toFixed(3)]),
          symbol: "none",
          smooth: true,
          lineStyle: { width: 1, color, type: "dashed", opacity: 0.7 },
          itemStyle: { color },
          z: 5,
        });
      }
      if (options.ema20 && ema.ema20) {
        const r = Rebase.rebaseAgainst(DateFilter.sliceFrom(ema.ema20, startIso), base);
        if (r.length) out.push({
          name: `${line.name} EMA20`,
          type: "line",
          data: r.map(d => [d.date, +d.value.toFixed(3)]),
          symbol: "none",
          smooth: true,
          lineStyle: { width: 1, color, type: "dotted", opacity: 0.6 },
          itemStyle: { color },
          z: 4,
        });
      }
    }
    return out;
  }

  function render(period) {
    if (!cachedData || !chartInstance) return;
    currentPeriod = period;
    const startIso = DateFilter.startDate(period, cachedData.as_of);
    const opts = {
      ema5:  document.getElementById("ema5-toggle").checked,
      ema20: document.getElementById("ema20-toggle").checked,
    };

    const allLines = [...cachedData.fixed_lines, ...cachedData.dynamic_lines];
    const seriesArr = [];
    allLines.forEach((line, i) => {
      seriesArr.push(...buildSeriesForLine(line, i, startIso, opts));
    });

    chartInstance.setOption({
      backgroundColor: "transparent",
      textStyle: { color: "#ccc" },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        valueFormatter: (v) => v == null ? "—" : v.toFixed(2),
        backgroundColor: "#1f1f1f",
        borderColor: "#444",
        textStyle: { color: "#eee" },
      },
      legend: {
        top: 0,
        textStyle: { color: "#ccc", fontSize: 11 },
        data: seriesArr.map(s => s.name),
      },
      grid: { left: 50, right: 30, top: 60, bottom: 30 },
      xAxis: {
        type: "time",
        axisLine: { lineStyle: { color: "#555" } },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        scale: true,
        name: "Rebase 100",
        nameTextStyle: { color: "#888", fontSize: 11 },
        axisLine: { lineStyle: { color: "#555" } },
        splitLine: { lineStyle: { color: "#2a2a2a" } },
      },
      series: seriesArr,
    }, { notMerge: true });
  }

  async function init() {
    const data = await fetch("data/sector_timeseries.json", { cache: "no-cache" })
      .then(r => r.json());
    cachedData = data;
    const dom = document.getElementById("chart-timeseries");
    chartInstance = echarts.init(dom);
    render(currentPeriod);
    window.addEventListener("resize", () => chartInstance && chartInstance.resize());
    return data;
  }

  global.TimeseriesBlock = { init, render };
})(window);
