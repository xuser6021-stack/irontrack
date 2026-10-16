import { useState } from 'react'
import { S, P, fin, vol, nsets, fw, wd, kw, wu, r1, exById, lastSets, dstr, dl, day, uid } from '../lib/core.js'
import { commit, startTpl, finish } from '../lib/store.js'
import { Dur, Stat, num } from '../components.jsx'
import { History } from './Dashboard.jsx'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Logger({ ui, up, ask, timer, setTimer }) {
  const a = S.active
  const setField = (i, j, f, raw) => {
    const s = a.exs[i].sets[j], v = raw.trim() === '' ? null : num(raw)
    if (f === 'w') s.w = v == null ? null : kw(v); else s[f] = v == null ? null : Math.round(v)
    commit()
  }
  const doFinish = () => { const id = finish(); if (id) { up({ sum: id }); setTimer({ left: 0, run: false }) } }
  return <>
    <div className="sticky"><div><b>{a.name}</b><div className="mu"><Dur start={a.start} /> · {nsets(a)} sets done</div></div>
      <div className="row"><b className="big">{dstr(timer.left * 1000)}</b>
        <button className="sm" onClick={() => timer.run ? setTimer({ ...timer, run: false }) : setTimer({ left: timer.left || P().rest, run: true })}>{timer.run ? 'Pause' : 'Start rest'}</button>
        <button className="sm" onClick={() => setTimer({ left: 0, run: false })}>Reset</button></div></div>
    {a.exs.map((e, i) => {
      const pv = lastSets(e.ex, a.start), lib = exById(e.ex), db = lib && lib.equip === 'Dumbbells'
      const su = !e.dis && pv.length >= e.n && pv.every(s => s.r >= e.max) ? pv[0].w + (db ? 2 : 2.5) : null
      return <div className="card" key={e.ex + i}>
        <div className="row sp"><b>{e.name}</b><span className="tag">{e.n} × {e.min}–{e.max}</span></div>
        <div className="mu">{pv.length ? 'Last: ' + pv.map(s => r1(wd(s.w)) + '×' + s.r).join(', ') + ' ' + wu() : 'No previous data'}{db ? ' · ' + (P().dbMode === 'each' ? 'weight per dumbbell' : 'combined weight') : ''}</div>
        {su && <div className="card" style={{ background: 'var(--c2)' }}><span className="ac">Suggested next target (not a record):</span> all sets hit {e.max} reps last time. If technique was sound and effort right, try {fw(su)}.
          <div className="row"><button className="sm" onClick={() => { e.sets.forEach(s => { if (!s.done && s.type === 'work') s.w = su }); e.dis = true; commit() }}>Apply</button>
            <button className="sm" onClick={() => { e.dis = true; commit() }}>Dismiss</button></div></div>}
        <div className="set mu"><span /><span>{wu()}</span><span>reps{/Plank/.test(e.name) ? '/sec' : ''}</span><span>RIR</span><span /><span /></div>
        {e.sets.map((s, j) => <div className={'set ' + (s.done ? 'dn' : '')} key={s.id}>
          <button className="sm" title="Toggle warm-up" onClick={() => { s.type = s.type === 'warm' ? 'work' : 'warm'; commit() }}>{s.type === 'warm' ? 'W' : j + 1}</button>
          <input inputMode="decimal" aria-label="Weight" key={s.id + 'w' + s.w} defaultValue={s.w == null ? '' : r1(wd(s.w))} onBlur={x => setField(i, j, 'w', x.target.value)} />
          <input inputMode="numeric" aria-label="Reps" key={s.id + 'r' + s.r} defaultValue={s.r ?? ''} onBlur={x => setField(i, j, 'r', x.target.value)} />
          <input inputMode="numeric" aria-label="RIR" key={s.id + 'i' + s.rir} defaultValue={s.rir ?? ''} onBlur={x => setField(i, j, 'rir', x.target.value)} />
          <button className={'ok ' + (s.done ? 'on' : '')} aria-label="Complete set" onClick={() => { s.done = !s.done; if (s.done && !timer.run) setTimer({ left: P().rest, run: true }); commit() }}>✓</button>
          <button className="sm d" aria-label="Delete set" onClick={() => { e.sets.splice(j, 1); commit() }}>×</button></div>)}
        <div className="row">
          {[['+ Working set', 'work'], ['+ Warm-up', 'warm']].map(([t, ty]) => <button className="sm" key={ty} onClick={() => { const l = e.sets[e.sets.length - 1]; e.sets.push({ id: uid('st-'), w: l ? l.w : null, r: null, type: ty, done: false, rir: null }); commit() }}>{t}</button>)}</div>
      </div>
    })}
    <div className="card">
      <label>Session notes<textarea defaultValue={a.notes} onBlur={x => { a.notes = x.target.value; commit() }} /></label>
      <label>Perceived effort (1–10)<select defaultValue={a.effort} onChange={x => { a.effort = x.target.value; commit() }}><option value="">–</option>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n}>{n}</option>)}</select></label>
      <div className="row"><button className="p" onClick={() => nsets(a) ? doFinish() : ask('No sets are marked complete. Finish anyway?', doFinish)}>Finish workout</button>
        <button className="d" onClick={() => ask('Discard this unfinished workout? Logged sets will be lost.', () => { S.active = null; commit(); setTimer({ left: 0, run: false }) })}>Discard</button></div>
    </div></>
}

function Summary({ ui, up }) {
  const s = S.sessions.find(x => x.id === ui.sum); if (!s) return null
  const d = s.prevVol != null && s.prevVol > 0 ? (vol(s) - s.prevVol) / s.prevVol * 100 : null
  return <><h1 className="ac">Workout complete</h1><div className="card"><b>{s.name}</b>
    <div className="grid" style={{ marginTop: 8 }}><Stat l="Duration" v={dstr(s.end - s.start)} /><Stat l="Sets done" v={nsets(s)} /><Stat l="Working volume" v={fw(vol(s))} />
      <Stat l={'vs last ' + s.name} v={d == null ? '–' : (d >= 0 ? '+' : '') + r1(d) + '%'} /></div>
    {s.prs && s.prs.length ? <><h3>New personal records</h3>{s.prs.map(x => <div key={x}>{x}</div>)}</> : <p className="mu">No new weight records this time.</p>}
    {s.notes && <p>{s.notes}</p>}</div><button className="p" onClick={() => up({ sum: null })}>Done</button></>
}

function EditTpl({ ui, up, ask }) {
  const t = S.templates.find(x => x.id === ui.edit); if (!t) return null
  const mv = (i, d) => { const k = i + d; if (k < 0 || k >= t.items.length) return;[t.items[i], t.items[k]] = [t.items[k], t.items[i]]; commit() }
  return <><div className="row sp"><h1>Edit template</h1><button onClick={() => up({ edit: null })}>Close</button></div>
    <p className="mu">Changes apply to future workouts only. Logged sessions keep their own copy.</p>
    <div className="card"><label>Name<input defaultValue={t.name} onBlur={e => { t.name = e.target.value.trim() || t.name; commit() }} /></label>
      <label>Day<select value={t.day ?? ''} onChange={e => { t.day = e.target.value === '' ? null : +e.target.value; commit() }}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}<option value="">Unscheduled</option></select></label></div>
    {t.items.map((it, i) => <div className="card" key={it.ex + i}><b>{(exById(it.ex) || {}).name || it.ex}</b>
      <div className="row">{[['n', 'Sets'], ['min', 'Min reps'], ['max', 'Max reps']].map(([k, l]) => <label style={{ flex: 1 }} key={k}>{l}
        <input inputMode="numeric" key={k + it[k]} defaultValue={it[k]} onBlur={e => { it[k] = Math.max(1, Math.round(num(e.target.value) || 1)); commit() }} /></label>)}</div>
      <div className="row"><button className="sm" onClick={() => mv(i, -1)}>↑</button><button className="sm" onClick={() => mv(i, 1)}>↓</button>
        <button className="sm d" onClick={() => { t.items.splice(i, 1); commit() }}>Remove</button></div></div>)}
    <div className="card"><label>Add exercise<select value="" onChange={e => { if (e.target.value) { t.items.push({ ex: e.target.value, n: 3, min: 8, max: 12 }); commit() } }}>
      <option value="">Choose…</option>{S.exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label></div>
    <button className="d" onClick={() => ask('Delete this template? Past workouts are kept.', () => { S.templates = S.templates.filter(x => x.id !== t.id); up({ edit: null }); commit() })}>Delete template</button></>
}

export default function Workouts(props) {
  const { ui, up, ask } = props
  if (S.active) return <Logger {...props} />
  if (ui.sum) return <Summary {...props} />
  if (ui.edit) return <EditTpl {...props} />
  return <><h1>Workouts</h1><p className="mu">Tap Start to load a template. Edit any day to match how you train.</p>
    {S.templates.map(t => <div className="card" key={t.id}><div className="row sp"><div><b>{t.name}</b>
      <div className="mu">{t.day == null ? 'Unscheduled' : DAYS[t.day]} · {t.items.length} exercises</div></div>
      <div className="row"><button className="sm" onClick={() => up({ edit: t.id })}>Edit</button><button className="p" onClick={() => startTpl(t.id)}>Start</button></div></div></div>)}
    <button onClick={() => { const n = { id: uid('tp-'), name: 'Custom workout', day: null, items: [] }; S.templates.push(n); commit(); up({ edit: n.id }) }}>+ New template</button>
    <div className="card mu">Sunday is rest. Optional recovery: easy walking or stretching.</div>
    <h2>History</h2><History list={fin().reverse()} ask={ask} /></>
}
