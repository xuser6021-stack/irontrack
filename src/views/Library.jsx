import { useState } from 'react'
import { S, uid } from '../lib/core.js'
import { commit } from '../lib/store.js'

export default function Library() {
  const [L, setL] = useState({ q: '', muscle: '', equip: '', cat: '', type: '', fav: false })
  const set = (k, v) => setL({ ...L, [k]: v })
  const opts = k => [...new Set(S.exercises.map(e => e[k]).filter(Boolean))].sort()
  const list = S.exercises.filter(e => (!L.q || e.name.toLowerCase().includes(L.q.toLowerCase())) && ['muscle', 'equip', 'cat', 'type'].every(k => !L[k] || e[k] === L[k]) && (!L.fav || e.fav))
  const add = ev => {
    ev.preventDefault(); const F = Object.fromEntries(new FormData(ev.target)), n = F.name.trim()
    if (!n || S.exercises.some(e => e.name.toLowerCase() === n.toLowerCase())) return
    S.exercises.push({ id: uid('ex-'), name: n, muscle: F.muscle, sec: '', equip: F.equip, cat: F.cat, type: F.type, range: F.range, fav: false, custom: true, note: F.note })
    commit(); ev.target.reset()
  }
  return <><h1>Exercise Library</h1>
    <div className="card"><input type="search" placeholder="Search exercises" value={L.q} onChange={e => set('q', e.target.value)} />
      <div className="grid" style={{ marginTop: 8 }}>{[['muscle', 'Muscle'], ['equip', 'Equipment'], ['cat', 'Category'], ['type', 'Type']].map(([k, n]) =>
        <select key={k} aria-label={n} value={L[k]} onChange={e => set(k, e.target.value)}><option value="">{n}</option>{opts(k).map(v => <option key={v}>{v}</option>)}</select>)}</div>
      <label style={{ marginTop: 8 }}><input type="checkbox" checked={L.fav} onChange={e => set('fav', e.target.checked)} style={{ width: 'auto', minHeight: 0 }} /> Favorites only</label></div>
    {list.map(e => <div className="card" key={e.id}><div className="row sp"><b>{e.name}</b>
      <button className="sm" aria-label="Favorite" onClick={() => { e.fav = !e.fav; commit() }}>{e.fav ? '★' : '☆'}</button></div>
      {[e.muscle, e.equip, e.cat, e.type, e.range + ' reps'].map(t => <span className="tag" key={t}>{t}</span>)}
      {e.sec && <div className="mu">Also works: {e.sec}</div>}{e.note && <div className="mu">{e.note}</div>}</div>)}
    {!list.length && <div className="card mu">No exercises match.</div>}
    <h2>Add custom exercise</h2>
    <form className="card" onSubmit={add}><label>Name<input name="name" required /></label>
      <div className="grid"><label>Primary muscle<input name="muscle" required /></label><label>Equipment<input name="equip" required /></label>
        <label>Category<select name="cat"><option>push</option><option>pull</option><option>legs</option><option>core</option></select></label>
        <label>Type<select name="type"><option>compound</option><option>isolation</option></select></label>
        <label>Rep range<input name="range" defaultValue="8-12" /></label></div>
      <label>Instructions / media link (optional)<textarea name="note" /></label><button className="p">Add exercise</button></form></>
}
