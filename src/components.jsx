import { useState, useEffect } from 'react'
import { line, bars, dstr, P, S, wd, ld, kw, kl, wu, lu, r1, imp } from './lib/core.js'
import { commit } from './lib/store.js'

export const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) || n < 0 ? null : n }
// line()/bars() return SVG strings built only from the user's own numeric data and escaped labels
export const Line = ({ pts, fmt }) => <div dangerouslySetInnerHTML={{ __html: line(pts, fmt) }} />
export const Bars = ({ v, fmt }) => <div dangerouslySetInnerHTML={{ __html: bars(v, fmt) }} />
export const Stat = ({ l, v, s }) => <div className="card"><div className="mu">{l}</div><div className="big">{v}</div><div className="mu">{s}</div></div>
export function Dur({ start }) {
  const [, t] = useState(0)
  useEffect(() => { const i = setInterval(() => t(x => x + 1), 1000); return () => clearInterval(i) }, [])
  return <span>{dstr(Date.now() - start)}</span>
}
export function Confirm({ msg, onYes, onNo }) {
  return <div className="modal"><div className="card" role="dialog" aria-modal="true"><p>{msg}</p>
    <div className="row"><button className="d" onClick={onYes}>Confirm</button><button onClick={onNo}>Cancel</button></div></div></div>
}
const Fld = ({ l, n, v, t = 'text' }) => <label>{l}<input name={n} type={t} defaultValue={v} step={t === 'number' ? 'any' : undefined} /></label>
const Sel = ({ l, n, o, v }) => <label>{l}<select name={n} defaultValue={v}>{o.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select></label>

export function ProfileForm({ label, onSave }) {
  const p = P()
  const submit = e => {
    e.preventDefault()
    const F = Object.fromEntries(new FormData(e.target)), u = F.units === 'imperial'
    const cw = v => u ? v / 2.20462 : v, cl = v => u ? v * 2.54 : v, n = (v, d) => { const x = num(v); return x == null ? d : x }
    Object.assign(p, { units: F.units, theme: F.theme, dbMode: F.dbMode, name: F.name.trim(), exp: F.exp,
      startDate: F.startDate || p.startDate, targetDate: F.targetDate || p.targetDate, age: n(F.age, p.age),
      height: cl(n(F.height, ld(p.height))), startW: cw(n(F.startW, wd(p.startW))), targetW: cw(n(F.targetW, wd(p.targetW))),
      rate: cw(n(F.rate, .25)), rest: Math.max(10, n(F.rest, 90)), protein: n(F.protein, 100), cal: n(F.cal, 0) })
    S.onboarded = true; commit(); onSave && onSave()
  }
  return <form className="card" onSubmit={submit} key={p.units}>
    <div className="grid">
      <Fld l="Name" n="name" v={p.name} /><Fld l="Age" n="age" v={p.age} t="number" />
      <Sel l="Units" n="units" o={[['metric', 'kg / cm'], ['imperial', 'lb / in']]} v={p.units} />
      <Fld l={`Height (${lu()})`} n="height" v={r1(ld(p.height))} t="number" />
      <Fld l={`Start weight (${wu()})`} n="startW" v={r1(wd(p.startW))} t="number" />
      <Fld l={`Target weight (${wu()})`} n="targetW" v={r1(wd(p.targetW))} t="number" />
      <Fld l="Start date" n="startDate" v={p.startDate} t="date" /><Fld l="Target date" n="targetDate" v={p.targetDate} t="date" />
      <Fld l={`Target gain / week (${wu()})`} n="rate" v={r1(wd(p.rate) * 100) / 100} t="number" />
      <Fld l="Default rest (sec)" n="rest" v={p.rest} t="number" /><Fld l="Protein target (g)" n="protein" v={p.protein} t="number" />
      <Fld l="Calorie target (kcal, 0 = none)" n="cal" v={p.cal} t="number" />
      <Sel l="Dumbbell weight means" n="dbMode" o={[['each', 'One dumbbell'], ['total', 'Combined']]} v={p.dbMode} />
      <Sel l="Theme" n="theme" o={[['dark', 'Dark'], ['light', 'Light'], ['system', 'System']]} v={p.theme} />
    </div>
    <Fld l="Training experience" n="exp" v={p.exp} />
    <button className="p">{label}</button>
  </form>
}
