import { S, P, fin, vol, nsets, fw, wd, wu, curW, goalPct, streak, wkStart, day, dl, weeks, work, D, today } from '../lib/core.js'
import { commit, startTpl } from '../lib/store.js'
import { Line, Bars, Stat } from '../components.jsx'

export const History = ({ list, ask }) => list.length ? list.map(s =>
  <div className="card row sp" key={s.id}><div><b>{s.name}</b>
    <div className="mu">{dl(day(s.start))} · {Math.round((s.end - s.start) / 60000)} min · {nsets(s)} sets · {fw(vol(s))}</div></div>
    <button className="sm d" onClick={() => ask('Delete this workout from history?', () => { S.sessions = S.sessions.filter(x => x.id !== s.id); commit() })}>Delete</button></div>)
  : <div className="card mu">No workouts yet. Start one to build your history.</div>

export default function Dashboard({ go, ask }) {
  const p = P(), h = new Date().getHours(), cur = curW(), fs = fin(), ws = wkStart(today())
  const thisW = fs.filter(s => wkStart(day(s.start)) === ws), planned = S.templates.filter(t => t.day != null).length
  const tw = Math.floor((Date.now() - D(p.startDate)) / 6048e5) + 1
  const tt = S.templates.find(t => t.day === (new Date().getDay() + 6) % 7)
  const prs = {}; fs.forEach(s => s.exs.forEach(e => work(e).forEach(x => { if (!prs[e.name] || x.w > prs[e.name].w) prs[e.name] = { w: x.w, r: x.r, d: day(s.start) } })))
  const pl = Object.entries(prs).sort((a, b) => b[1].w - a[1].w).slice(0, 5)
  const pr = S.food.filter(f => f.date === today()).reduce((a, f) => a + (+f.p || 0), 0)
  const wl = weeks(8).map(w => ({ l: dl(w), v: fs.filter(s => wkStart(day(s.start)) === w).length }))
  const bw = S.body.filter(b => b.w != null).sort((a, b) => a.date < b.date ? -1 : 1).map(b => ({ x: +D(b.date), y: wd(b.w), l: dl(b.date) }))
  const start = id => { startTpl(id); go('work') }
  return <>
    <h1>{h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}{p.name ? ', ' + p.name : ''}</h1>
    <p className="mu">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Training week {Math.max(1, tw)}</p>
    <div className="card row sp"><div><b>{S.active ? 'Workout in progress' : tt ? tt.name + ' is scheduled today' : 'No workout scheduled today'}</b>
      <div className="mu">{S.active ? S.active.name : 'Pick any day on the Workouts page.'}</div></div>
      {S.active ? <button className="p" onClick={() => go('work')}>Resume Workout</button>
        : tt ? <button className="p" onClick={() => start(tt.id)}>Start Workout</button> : <button className="p" onClick={() => go('work')}>Start Workout</button>}</div>
    <div className="grid">
      <Stat l="Current weight" v={fw(cur)} s={'Started ' + fw(p.startW)} />
      <Stat l="Target" v={fw(p.targetW)} s={fw(Math.abs(p.targetW - cur)) + ' to go'} />
      <Stat l="Change" v={(cur - p.startW >= 0 ? '+' : '') + fw(cur - p.startW)} s={'since ' + dl(p.startDate)} />
      <Stat l="Sessions this week" v={`${thisW.length} / ${planned}`} s="completed / planned" />
      <Stat l="Streak" v={streak() + ' sessions'} s="gaps of 1 rest day allowed" />
      <Stat l="Volume this week" v={fw(thisW.reduce((a, s) => a + vol(s), 0))} s="working sets, weight × reps" />
    </div>
    <div className="card"><div className="row sp"><b>Goal progress</b><span>{Math.round(goalPct())}%</span></div><div className="bar"><i style={{ width: goalPct() + '%' }} /></div></div>
    <div className="card"><b>Protein today</b> <span className="mu">{pr} g logged of {p.protein} g target</span><div className="bar"><i style={{ width: Math.min(100, pr / p.protein * 100) + '%' }} /></div></div>
    <h2>Body weight</h2><div className="card">{bw.length ? <Line pts={bw} /> : <p className="mu">Log your weight in Body Metrics to see the chart.</p>}</div>
    <h2>Workouts per week</h2><div className="card">{fs.length ? <Bars v={wl} /> : <p className="mu">Complete a workout to see weekly completion. Nothing is shown until you have real data.</p>}</div>
    <h2>Personal records</h2><div className="card">{pl.length ? pl.map(([n, v]) => <div className="row sp" key={n}><span>{n}</span><b>{fw(v.w)} × {v.r} <span className="mu">{dl(v.d)}</span></b></div>)
      : <p className="mu">Records appear after your first completed working sets. These are actual lifts, not estimates.</p>}</div>
    <h2>Recent workouts</h2><History list={fs.slice(-4).reverse()} ask={ask} />
  </>
}
