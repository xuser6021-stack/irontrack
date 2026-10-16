// Tiny external store: core.js holds the data (S) and persists to localStorage.
// Components call commit() after mutating S; useStore() re-renders them.
import { useSyncExternalStore } from 'react'
import { S, save, uid, exById, lastSets, fin, work, vol, P, fw, replaceS, mk, valid } from './core.js'
let ver = 0
const subs = new Set()
export const commit = () => { save(); ver++; subs.forEach(f => f()) }
export const useStore = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => ver)

export function startTpl(tid) {
  if (S.active) return
  const t = S.templates.find(x => x.id === tid); if (!t) return
  const now = Date.now()
  S.active = { id: uid('ws-'), tpl: t.id, name: t.name, start: now, end: null, notes: '', effort: '',
    exs: t.items.map(it => { const ex = exById(it.ex), pv = lastSets(it.ex, now)
      return { ex: it.ex, name: ex ? ex.name : it.ex, n: it.n, min: it.min, max: it.max, dis: false,
        sets: Array.from({ length: it.n }, (_, i) => ({ id: uid('st-'), w: pv.length ? (pv[i] || pv[pv.length - 1]).w : null, r: null, type: 'work', done: false, rir: null })) } }) }
  commit()
}
export function finish() {
  const a = S.active; if (!a || S.sessions.some(s => s.id === a.id)) return null
  const prev = fin().filter(s => s.tpl === a.tpl).pop()
  a.end = Date.now(); a.prs = []
  a.exs.forEach(e => {
    const best = Math.max(0, ...work(e).map(s => s.w || 0))
    const pr = Math.max(0, ...fin().flatMap(s => s.exs.filter(x => x.ex === e.ex).flatMap(x => work(x).map(y => y.w || 0))))
    if (best > 0 && pr > 0 && best > pr) a.prs.push(`${e.name}: ${fw(best)}`)
  })
  a.prevVol = prev ? vol(prev) : null
  S.sessions.push(a); S.active = null; commit(); return a.id
}
export function importBackup(raw) {
  const o = JSON.parse(raw); if (!valid(o)) throw new Error('invalid')
  replaceS(Object.assign(mk(), o, { profile: Object.assign(mk().profile, o.profile), water: o.water || {} })); commit()
}
export function resetAll() { const n = mk(); n.onboarded = true; replaceS(n); commit() }
export { P }
