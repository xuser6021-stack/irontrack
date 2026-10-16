import { S, P, fin, work, wd, wu, e1, day, dl, D, weeks, wkStart, rangeStart, exById } from '../lib/core.js'
import { Line, Bars } from '../components.jsx'

export default function Progress({ ui, up }) {
  const rs = rangeStart(ui.range), fs = fin().filter(s => day(s.start) >= rs)
  const bw = S.body.filter(b => b.w != null && b.date >= rs).sort((a, b) => a.date < b.date ? -1 : 1)
  let planned = 0; const st = ui.range ? D(rs) : D(fs[0] ? day(fs[0].start) : P().startDate)
  for (let d = new Date(st); d <= new Date(); d.setDate(d.getDate() + 1)) if (d >= D(P().startDate)) planned += S.templates.filter(t => t.day === (d.getDay() + 6) % 7).length
  const wl = weeks(8).map(w => ({ l: dl(w), v: fin().filter(s => wkStart(day(s.start)) === w).reduce((a, s) => a + s.exs.reduce((b, e) => b + work(e).length, 0), 0) }))
  const exs = [...new Set(fin().flatMap(s => s.exs.map(e => e.ex)))], cx = ui.ex || exs[0], pts = []
  fin().forEach(s => { const e = s.exs.find(x => x.ex === cx); if (!e || day(s.start) < rs) return; const w = work(e)
    if (w.length) pts.push({ x: s.start, l: dl(day(s.start)), top: Math.max(...w.map(x => x.w)), e: Math.max(0, ...w.map(x => e1(x.w, x.r) || 0)), v: w.reduce((a, x) => a + x.w * x.r, 0), r: Math.max(...w.map(x => x.r)) }) })
  return <><h1>Progress</h1>
    <div className="row" style={{ margin: '8px 0' }}>{[7, 30, 90, 0].map(r => <button key={r} className={'sm ' + (ui.range === r ? 'p' : '')} onClick={() => up({ range: r })}>{r ? r + ' days' : 'All time'}</button>)}</div>
    <div className="card"><b>Consistency</b><div className="mu">{fs.length} of {planned} scheduled sessions completed ({planned ? Math.min(100, Math.round(fs.length / planned * 100)) : 0}%) · {Math.max(0, planned - fs.length)} missed. Planned counts scheduled template days since your start date.</div></div>
    <h2>Body weight ({wu()})</h2><div className="card"><Line pts={bw.map(b => ({ x: +D(b.date), y: wd(b.w), l: dl(b.date) }))} /><p className="note">Daily entries. Day-to-day swings of 1–2 kg are normal and are not fat or muscle gain.</p></div>
    <h2>Working sets per week</h2><div className="card">{fin().length ? <Bars v={wl} /> : <p className="mu">No completed workouts yet.</p>}<p className="note">Counts completed working sets (warm-ups excluded), last 8 weeks, Monday start.</p></div>
    <h2>Exercise progression</h2><div className="card">{exs.length ? <>
      <select value={cx} onChange={e => up({ ex: e.target.value })}>{exs.map(id => <option key={id} value={id}>{(exById(id) || { name: id }).name}</option>)}</select>
      <h3>Top working weight ({wu()})</h3><Line pts={pts.map(p => ({ ...p, y: wd(p.top) }))} />
      <h3>Best reps in a set</h3><Line pts={pts.map(p => ({ ...p, y: p.r }))} fmt={v => v} />
      <h3>Estimated 1RM ({wu()}, estimate)</h3><Line pts={pts.filter(p => p.e).map(p => ({ ...p, y: wd(p.e) }))} />
      <h3>Working volume ({wu()})</h3><Line pts={pts.map(p => ({ ...p, y: wd(p.v) }))} fmt={v => Math.round(v)} />
      <p className="note">e1RM uses the Epley formula, weight × (1 + reps/30), only for sets of 1–10 reps. It is an estimate, not a test target. Volume is compared only within the same exercise.</p></>
      : <p className="mu">Complete workouts to see exercise trends.</p>}</div></>
}
