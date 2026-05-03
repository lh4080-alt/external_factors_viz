// Entry point — loads all 3 blocks in parallel, then wires up the UI controls.

document.addEventListener("DOMContentLoaded", async () => {
  const setStatus = (txt) => {
    const el = document.getElementById("as-of");
    if (el) el.textContent = txt;
  };

  setStatus("loading…");
  try {
    const [tsData] = await Promise.all([
      TimeseriesBlock.init(),
      HeatmapBlock.init(),
      RankingBlock.init(),
    ]);
    setStatus(`as of ${tsData.as_of}`);
  } catch (err) {
    console.error(err);
    setStatus(`load error: ${err.message}`);
    return;
  }

  // Period toggle.
  const toggleButtons = document.querySelectorAll(".period-toggle button");
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      toggleButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      TimeseriesBlock.render(btn.dataset.period);
    });
  });

  // EMA checkboxes.
  ["ema5-toggle", "ema20-toggle"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => {
      const active = document.querySelector(".period-toggle button.active");
      TimeseriesBlock.render(active ? active.dataset.period : "1Y");
    });
  });
});
