import { useState, useEffect } from 'react'
import { S, P } from './lib/core.js'
import { useStore } from './lib/store.js'
import { ProfileForm, Confirm } from './components.jsx'
import Dashboard from './views/Dashboard.jsx'
import Workouts from './views/Workouts.jsx'
import Library from './views/Library.jsx'
import Progress from './views/Progress.jsx'
import Body from './views/Body.jsx'
import Nutrition from './views/Nutrition.jsx'
import Settings from './views/Settings.jsx'
import { getSaveErr } from './lib/core.js'

const NAV = [['dash', 'Dashboard', 'Home'], ['work', 'Workouts', 'Train'], ['lib', 'Exercise Library', 'Library'], ['prog', 'Progress', 'Stats'], ['body', 'Body Metrics', 'Body'], ['nut', 'Nutrition', 'Food'], ['set', 'Settings', 'Setup']]

export default function App() {
  useStore()
  const [ui, setUi] = useState({ page: 'dash', range: 30, edit: null, sum: null, ex: '' })
  const [timer, setTimer] = useState({ left: 0, run: false })
  const [dlg, setDlg] = useState(null)
  const up = patch => setUi(u => ({ ...u, ...patch }))
  const go = page => up({ page, sum: null, edit: null })
  const ask = (msg, fn) => setDlg({ msg, fn })

  useEffect(() => {
    if (!timer.run) return
    const i = setInterval(() => setTimer(t => {
      if (t.left <= 1) { try { navigator.vibrate && navigator.vibrate([200, 100, 200]) } catch { } return { left: 0, run: false } }
      return { ...t, left: t.left - 1 }
    }), 1000)
    return () => clearInterval(i)
  }, [timer.run])

  const th = P().theme === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : P().theme
  useEffect(() => { document.documentElement.dataset.theme = th })

  if (!S.onboarded) return <main><h1 className="ac">IronTrack</h1>
    <p className="mu">Confirm your profile and goal. Everything can be changed later in Settings. No account is needed; data stays on this device.</p>
    <ProfileForm label="Start tracking" /></main>

  const props = { ui, up, go, ask, timer, setTimer }
  const pages = { dash: Dashboard, work: Workouts, lib: Library, prog: Progress, body: Body, nut: Nutrition, set: Settings }
  const Page = pages[ui.page]
  return <div id="app">
    <nav><div className="logo">IronTrack</div>{NAV.map(n => <button key={n[0]} className={ui.page === n[0] ? 'on' : ''} onClick={() => go(n[0])}><span className="l">{n[1]}</span><span className="s">{n[2]}</span></button>)}</nav>
    <main>
      {S.active && ui.page !== 'work' && <div className="banner"><span>Workout in progress: {S.active.name}</span><button onClick={() => go('work')}>Resume</button></div>}
      {getSaveErr() && <div className="card err">{getSaveErr()}</div>}
      <Page {...props} />
    </main>
    {dlg && <Confirm msg={dlg.msg} onNo={() => setDlg(null)} onYes={() => { const f = dlg.fn; setDlg(null); f && f() }} />}
  </div>
}
