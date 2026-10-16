import { useState } from 'react'
import { S, P, wd, kw, kl, wu, lu, fw, fl, curW, goalPct, today, iso, D, dl, uid } from '../lib/core.js'
import { commit } from '../lib/store.js'
import { Line, Stat, num } from '../components.jsx'

export default function Body({ ask }) {
  const [err, setErr] = useState('')
  const p = P(), b = [...S.body].sort((a, b) => a.date < b.date ? -1 : 1), w = b.filter(x => x.w != null), c = curW()
  const ago = n => iso(new Date(Date.now() - n * 864e5))
  const last7 = w.filter(x => x.date >= ago(7)), avg = last7.length ? last7.reduce((a, x) => a + x.w, 0) / last7.length : null
  let est = 'Not enough data yet. At least 4 weigh-ins across 10+ days are needed.'
  const r28 = w.filter(x => x.date >= ago(28))
  if (r28.length >= 4 && (D(r28[r28.length - 1].date) - D(r28[0].date)) / 864e5 >= 10) {
    const xs = r28.map(x => (D(x.date) - D(r28[0].date)) / 864e5), ys = r28.map(x => x.w), mx = xs.reduce((a, v) => a + v) / xs.length, my = ys.reduce((a, v) => a + v) / ys.length
    const sl = xs.reduce((a, v, i) => a + (v - mx) * (ys[i] - my), 0) / xs.reduce((a, v) => a + (v - mx) ** 2, 0)
    est = sl * (p.targetW - c) > 0 ? `At the recent trend (${fw(sl * 7)}/week), target around ${dl(iso(new Date(Date.now() + (p.targetW - c) / sl * 864e5)))} — a rough estimate.` : 'Recent trend is flat or moving away from target.'
  }
  const r14 = w.filter(x => x.date >= ago(14)), h = Math.floor(r14.length / 2)
  const warn = p.targetW > p.startW && r14.length >= 4 && r14.slice(h).reduce((a, x) => a + x.w, 0) / (r14.length - h) <= r14.slice(0, h).reduce((a, x) => a + x.w, 0) / h
  const submit = e => {
    e.preventDefault(); const F = Object.fromEntries(new FormData(e.target))
    const o = { w: num(F.w), waist: num(F.waist), chest: num(F.chest), arm: num(F.arm), thigh: num(F.thigh), hip: num(F.hip) }
    if (Object.values(o).every(v => v == null)) return setErr('Enter at least one measurement.')
    setErr(''); const c2 = { w: o.w == null ? null : kw(o.w) }; ['waist', 'chest', 'arm', 'thigh', 'hip'].forEach(m => c2[m] = o[m] == null ? null : kl(o[m]))
    const ex = S.body.find(x => x.date === F.date); if (ex) Object.assign(ex, c2); else S.body.push({ id: uid('bm-'), date: F.date, ...c2 })
    commit()
  }
  return <><h1>Body Metrics</h1>
    <div className="grid"><Stat l="Weekly average" v={fw(avg)} s="last 7 days" /><Stat l="Remaining" v={fw(Math.max(0, p.targetW - c))} s={Math.round(goalPct()) + '% of goal'} /><Stat l="Target gain rate" v={fw(p.rate)} s="per week (set in Settings)" /></div>
    <div className="card mu">{est}</div>
    {warn && <div className="card">Weight has not risen over the last two weeks. Before changing anything, check food intake, weigh-in consistency (same time, same conditions) and recovery. Day-to-day changes are mostly water, and gained weight is not guaranteed to be all muscle.</div>}
    <h2>Log measurements</h2>
    <form className="card" onSubmit={submit}><div className="grid">
      <label>Date<input type="date" name="date" defaultValue={today()} max={today()} required /></label>
      <label>Weight ({wu()})<input name="w" inputMode="decimal" /></label>
      {[['waist', 'Waist'], ['chest', 'Chest'], ['arm', 'Upper arm'], ['thigh', 'Thigh'], ['hip', 'Hip, optional']].map(([k, l]) => <label key={k}>{l} ({lu()})<input name={k} inputMode="decimal" /></label>)}</div>
      <div className="err">{err}</div><button className="p">Save entry</button><p className="note">Blank fields stay blank. Saving a date that already exists updates that entry.</p></form>
    <div className="card"><Line pts={w.map(x => ({ x: +D(x.date), y: wd(x.w), l: dl(x.date) }))} /></div>
    {b.length > 1 && <div className="card"><b>First vs latest</b><div className="mu">{[['w', 'Weight', fw], ['waist', 'Waist', fl], ['chest', 'Chest', fl], ['arm', 'Arm', fl], ['thigh', 'Thigh', fl]].map(([k, n, f]) => { const v = b.filter(x => x[k] != null); return v.length > 1 ? <div key={k}>{n}: {f(v[0][k])} → {f(v[v.length - 1][k])}</div> : null })}</div></div>}
    <h2>Entries</h2>{[...b].reverse().map(x => <div className="card row sp" key={x.id}><div><b>{dl(x.date)}</b>
      <div className="mu">{fw(x.w)} · waist {fl(x.waist)} · chest {fl(x.chest)} · arm {fl(x.arm)} · thigh {fl(x.thigh)}{x.hip != null ? ' · hip ' + fl(x.hip) : ''}</div></div>
      <button className="sm d" onClick={() => ask('Delete this entry?', () => { S.body = S.body.filter(y => y.id !== x.id); commit() })}>Delete</button></div>)}
    {!b.length && <div className="card mu">No entries yet.</div>}</>
}
