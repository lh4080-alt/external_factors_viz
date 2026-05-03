// Block 2 — 30 macros × 4 periods (1D/5D/20D/60D) heatmap.
// Sorted by z_score (desc) so strong macros surface to the top.

(function (global) {
  const PERIODS = [
    { label: "1D",  field: "rate_1d"  },
    { label: "5D",  field: "rate_5d"  },
    { label: "20D", field: "rate_20d" },
    { label: "60D", field: "rate_60d" },
  ];

  let chartInstance = null;

  function build(data) {
    const macros = (data.macros || []).slice();

    // Sort: z desc; nulls last; stable fallback by id.
    macros.sort((a, b) => {
      const az = a.z_score, bz = b.z_score;
      if (az == null && bz == null) return a.id.localeCompare(b.id);
      if (az == null) return 1;
      if (bz == null) return -1;
      return bz - az;
    });

    // ECharts heatmap expects [xIdx, yIdx, value]; '-' for nulls (rendered blank).
    const cells = [];
    macros.forEach((m, yIdx) => {
      PERIODS.forEach((p, xIdx) => {
        const v = m[p.field];
        cells.push([xIdx, yIdx, v == null ? "-" : Number(v.toFixed(2))]);
      });
    });

    const yLabels = macros.map(m => {
      const z = m.z_score == null ? "—" : (m.z_score >= 0 ? `+${m.z_score.toFixed(1)}` : m.z_score.toFixed(1));
      return `${m.id} ${m.name}  z${z}`;
    });

    return {
      backgroundColor: "transparent",
      textStyle: { color: "#ccc" },
      tooltip: {
        position: "top",
        backgroundColor: "#1f1f1f",
        borderColor: "#444",
        textStyle: { color: "#eee" },
        formatter: (p) => {
          const m = macros[p.data[1]];
          const period = PERIODS[p.data[0]].label;
          const v = p.data[2];
          const vStr = v === "-" ? "—" : `${v >= 0 ? "+" : ""}${v}%`;
          return `<b>${m.name}</b> ${m.id}<br>${period}: ${vStr}`;
        },
      },
      grid: { left: 220, right: 30, top: 30, bottom: 20 },
      xAxis: {
        type: "category",
        data: PERIODS.map(p => p.label),
        position: "top",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#ddd", fontSize: 12 },
        splitArea: { show: true },
      },
      yAxis: {
        type: "category",
        data: yLabels,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          fontFamily: '-apple-system, "Pretendard", sans-serif',
          fontSize: 11,
          color: "#ddd",
        },
        splitArea: { show: true },
      },
      visualMap: {
        min: -10,
        max: 10,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        textStyle: { color: "#888" },
        inRange: {
          color: ["#d62728", "#5a2b2b", "#242424", "#1f5a2c", "#2ca02c"],
        },
      },
      series: [{
        type: "heatmap",
        data: cells,
        label: {
          show: true,
          formatter: ({ data }) => data[2] === "-" ? "" : data[2].toFixed(1),
          color: "#fff",
          fontSize: 10,
        },
        emphasis: { itemStyle: { borderColor: "#fff", borderWidth: 1 } },
      }],
    };
  }

  async function init() {
    const data = await fetch("data/sector_heatmap.json", { cache: "no-cache" })
      .then(r => r.json());
    const dom = document.getElementById("chart-heatmap");
    chartInstance = echarts.init(dom);
    chartInstance.setOption(build(data));
    window.addEventListener("resize", () => chartInstance && chartInstance.resize());
    return data;
  }

  global.HeatmapBlock = { init };
})(window);
