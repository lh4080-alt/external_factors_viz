// Block 3 — z-score TOP/BOTTOM 10 as a paired HTML table.
// Pure DOM, no ECharts.

(function (global) {
  const fmt = {
    pct: (v) => v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
    z:   (v) => v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}`,
    int: (v) => v == null ? "—" : String(v),
  };

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => (
      {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]
    ));
  }

  function renderTable(elemId, items, isTop) {
    const rowClass = isTop ? "top" : "bottom";
    const head = `
      <tr>
        <th>이름</th>
        <th>z</th>
        <th>1D</th>
        <th>20D</th>
        <th>일수</th>
      </tr>`;
    const body = items.map(m => `
      <tr class="${rowClass}">
        <td>${escapeHtml(m.name)} <span class="id">${escapeHtml(m.id)}</span></td>
        <td class="metric">${fmt.z(m.z_score)}</td>
        <td class="metric">${fmt.pct(m.rate_1d)}</td>
        <td class="metric">${fmt.pct(m.rate_20d)}</td>
        <td class="dim">${fmt.int(m.days_in_top)}</td>
      </tr>`).join("");

    document.getElementById(elemId).innerHTML = `
      <h3>${isTop ? "TOP" : "BOTTOM"} ${items.length}</h3>
      <table><thead>${head}</thead><tbody>${body}</tbody></table>`;
  }

  async function init() {
    const data = await fetch("data/sector_ranking.json", { cache: "no-cache" })
      .then(r => r.json());
    renderTable("ranking-top",    data.top10    || [], true);
    renderTable("ranking-bottom", data.bottom10 || [], false);
    return data;
  }

  global.RankingBlock = { init };
})(window);
