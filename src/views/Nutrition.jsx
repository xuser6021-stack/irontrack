import { S, P, today, iso, uid } from '../lib/core.js'
import { commit } from '../lib/store.js'
import { num } from '../components.jsx'

const Row = ({ n, v, g, u }) => <div className="card"><div className="row sp"><b>{n}</b><span>{v} / {g ? g + u : 'no target'}{g ? <span className="mu"> ({Math.max(0, Math.round(g - v))}{u} left)</span> : null}</span></div>{g ? <div className="bar"><i style={{ width: Math.min(100, v / g * 100) + '%' }} /></div> : null}</div>

export default function Nutrition() {
  const p = P(), t = S.food.filter(f => f.date === today()), s = k => t.reduce((a, f) => a + (+f[k] || 0), 0), wt = S.water[today()] || 0
  const days = {}; S.food.filter(f => f.date >= iso(new Date(Date.now() - 6 * 864e5))).forEach(f => days[f.date] = (days[f.date] || 0) + (+f.p || 0))
  const dv = Object.values(days)
  const add = e => { e.preventDefault(); const F = Object.fromEntries(new FormData(e.target))
    S.food.push({ id: uid('fd-'), date: today(), name: F.name.trim(), qty: F.qty, kcal: num(F.kcal) || 0, p: num(F.p) || 0, c: num(F.c) || 0, f: num(F.f) || 0 }); commit(); e.target.reset() }
  const water = d => { S.water[today()] = Math.max(0, wt + d); commit() }
  return <><h1>Nutrition</h1><Row n="Protein" v={Math.round(s('p'))} g={p.protein} u=" g" /><Row n="Calories" v={Math.round(s('kcal'))} g={p.cal || 0} u=" kcal" />
    <div className="grid"><div className="card"><div className="mu">Carbs</div><b>{Math.round(s('c'))} g</b></div><div className="card"><div className="mu">Fat</div><b>{Math.round(s('f'))} g</b></div>
      <div className="card"><div className="mu">7-day protein avg</div><b>{dv.length ? Math.round(dv.reduce((a, v) => a + v) / dv.length) + ' g' : '–'}</b></div></div>
    <div className="card row sp"><span><b>Water</b> {wt} ml</span><span className="row"><button className="sm" onClick={() => water(250)}>+250</button><button className="sm" onClick={() => water(-250)}>−250</button></span></div>
    <form className="card" onSubmit={add}><div className="grid"><label>Food / meal<input name="name" required /></label><label>Qty (e.g. 2 eggs)<input name="qty" /></label>
      {[['kcal', 'Calories'], ['p', 'Protein g'], ['c', 'Carbs g'], ['f', 'Fat g']].map(([k, l]) => <label key={k}>{l}<input name={k} inputMode="decimal" /></label>)}</div>
      <button className="p">Add food</button><p className="note">Values are whatever you enter and are estimates. Set your calorie target in Settings and adjust it from your weight trend.</p></form>
    {t.map(f => <div className="card row sp" key={f.id}><div><b>{f.name}</b> <span className="mu">{f.qty}</span><div className="mu">~{f.kcal || 0} kcal · P {f.p || 0} · C {f.c || 0} · F {f.f || 0}</div></div>
      <button className="sm d" onClick={() => { S.food = S.food.filter(x => x.id !== f.id); commit() }}>Delete</button></div>)}
    {!t.length && <div className="card mu">Nothing logged today.</div>}</>
}
