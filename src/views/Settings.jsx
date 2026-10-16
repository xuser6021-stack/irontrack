import { useState } from 'react'
import { S, fin, day } from '../lib/core.js'
import { importBackup, resetAll } from '../lib/store.js'
import { ProfileForm } from '../components.jsx'

const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"'
export default function Settings({ ask }) {
  const [bk, setBk] = useState(''), [err, setErr] = useState('')
  const csvW = () => 'date,workout,exercise,set_type,weight_kg,reps,rir,done\n' + fin().flatMap(s => s.exs.flatMap(e => e.sets.map(x => [day(s.start), s.name, e.name, x.type, x.w, x.r, x.rir, x.done].map(q).join(',')))).join('\n')
  const csvB = () => 'date,weight_kg,waist_cm,chest_cm,arm_cm,thigh_cm,hip_cm\n' + S.body.map(b => [b.date, b.w, b.waist, b.chest, b.arm, b.thigh, b.hip].map(v => v ?? '').join(',')).join('\n')
  const imp = () => {
    try { JSON.parse(bk); } catch { return setErr('Import rejected: this is not valid JSON. Your data was not changed.') }
    ask('Replace ALL current data with this backup?', () => { try { importBackup(bk); setErr('') } catch { setErr('Import rejected: this is not a valid IronTrack backup. Your data was not changed.') } })
  }
  return <><h1>Settings</h1><ProfileForm label="Save settings" />
    <h2>Backup &amp; data</h2><div className="card">
      <p className="mu">Data is stored only in this browser (localStorage). It is not synced and not secure authentication. Back it up regularly.</p>
      <div className="row"><button onClick={() => setBk(JSON.stringify(S, null, 1))}>Show JSON backup</button><button onClick={() => setBk(csvW())}>Workout CSV</button><button onClick={() => setBk(csvB())}>Body CSV</button>
        <button onClick={() => { const b = new Blob([bk || JSON.stringify(S, null, 1)], { type: 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'irontrack-' + day(Date.now()) + '.txt'; a.click() }}>Download text</button></div>
      <label>Backup / CSV text<textarea rows="6" value={bk} onChange={e => setBk(e.target.value)} /></label>
      <div className="err">{err}</div>
      <div className="row"><button onClick={imp}>Import JSON from box</button><button className="d" onClick={() => ask('Erase every workout, measurement and setting on this device?', resetAll)}>Reset all data</button></div></div></>
}
