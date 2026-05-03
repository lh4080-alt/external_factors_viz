# External Factors Dashboard

Static visualization of Korean macro-theme strength signals.

- 30 macro themes × KOSPI200 benchmark
- Updated daily after market close (~16:30 KST)
- 3 panels: multi-line trend (rebase 100, period toggle), 4-period heatmap, z-score TOP/BOTTOM ranking

The data files in `data/` are JSON snapshots; the page is static HTML + ECharts (CDN).

## Local preview

```
python -m http.server 8080
# open http://localhost:8080/
```

## Updating data

Build pipeline lives in a separate private repository. Three JSON files
(`sector_timeseries.json`, `sector_heatmap.json`, `sector_ranking.json`)
are copied into `data/` and committed; GitHub Pages re-publishes on push.

## License

MIT
