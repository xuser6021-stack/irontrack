
const K='irontrack.v1',pad=n=>String(n).padStart(2,'0');
const uid=p=>p+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,today=()=>iso(new Date()),D=s=>new Date(s+'T00:00:00');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-'),r1=v=>Math.round(v*10)/10,day=ms=>iso(new Date(ms));
const X=`Barbell bench press|Chest|Triceps, front delts|Barbell|push|compound|6-10
Incline dumbbell press|Chest|Shoulders, triceps|Dumbbells|push|compound|8-12
Seated dumbbell shoulder press|Shoulders|Triceps|Dumbbells|push|compound|8-12
Dumbbell lateral raise|Shoulders||Dumbbells|push|isolation|12-15
Rope triceps pushdown|Triceps||Cable|push|isolation|10-15
Overhead cable triceps extension|Triceps||Cable|push|isolation|10-15
Lat pulldown|Back|Biceps|Cable|pull|compound|8-12
Seated cable row|Back|Biceps, rear delts|Cable|pull|compound|8-12
Chest-supported row|Back|Biceps, rear delts|Machine|pull|compound|8-12
Reverse pec deck|Rear delts|Upper back|Machine|pull|isolation|12-15
Dumbbell biceps curl|Biceps|Forearms|Dumbbells|pull|isolation|10-15
Hammer curl|Biceps|Forearms|Dumbbells|pull|isolation|10-15
Leg press|Quads|Glutes|Machine|legs|compound|8-12
Dumbbell Romanian deadlift|Hamstrings|Glutes|Dumbbells|legs|compound|8-12
Leg extension|Quads||Machine|legs|isolation|10-15
Seated leg curl|Hamstrings||Machine|legs|isolation|10-15
Standing calf raise|Calves||Machine|legs|isolation|12-20
Plank|Core||Bodyweight|core|isolation|30-45 sec
Machine chest press|Chest|Triceps|Machine|push|compound|8-12
Machine shoulder press|Shoulders|Triceps|Machine|push|compound|10-12
Cable lateral raise|Shoulders||Cable|push|isolation|12-15
Lat pulldown (alternate grip)|Back|Biceps|Cable|pull|compound|8-12
Single-arm cable row (per side)|Back|Biceps|Cable|pull|compound|10-12
EZ-bar curl|Biceps|Forearms|EZ bar|pull|isolation|10-12
Incline dumbbell curl|Biceps||Dumbbells|pull|isolation|10-15
Goblet squat|Quads|Glutes|Dumbbells|legs|compound|8-12
Hip thrust machine|Glutes|Hamstrings|Machine|legs|compound|8-12
Lying leg curl|Hamstrings||Machine|legs|isolation|10-15
Seated calf raise|Calves||Machine|legs|isolation|12-20
Dead bug (per side)|Core||Bodyweight|core|isolation|8-12`.split('\n').map(l=>{const a=l.split('|');return{id:'ex-'+slug(a[0]),name:a[0],muscle:a[1],sec:a[2],equip:a[3],cat:a[4],type:a[5],range:a[6],fav:false,custom:false,note:''}});
const T=[['Push A',0,'Barbell bench press:3:6:10;Incline dumbbell press:3:8:12;Seated dumbbell shoulder press:2:8:12;Dumbbell lateral raise:2:12:15;Rope triceps pushdown:2:10:15;Overhead cable triceps extension:2:10:15'],
['Pull A',1,'Lat pulldown:3:8:12;Seated cable row:3:8:12;Chest-supported row:2:10:12;Reverse pec deck:2:12:15;Dumbbell biceps curl:2:10:15;Hammer curl:2:10:15'],
['Legs A',2,'Leg press:3:8:12;Dumbbell Romanian deadlift:3:8:12;Leg extension:2:10:15;Seated leg curl:2:10:15;Standing calf raise:3:12:20;Plank:3:30:45'],
['Push B',3,'Incline dumbbell press:3:8:12;Machine chest press:3:8:12;Machine shoulder press:2:10:12;Cable lateral raise:3:12:15;Rope triceps pushdown:2:10:15;Overhead cable triceps extension:2:10:15'],
['Pull B',4,'Lat pulldown (alternate grip):3:8:12;Chest-supported row:3:8:12;Single-arm cable row (per side):2:10:12;Reverse pec deck:2:12:15;EZ-bar curl:2:10:12;Incline dumbbell curl:2:10:15'],
['Legs B',5,'Goblet squat:3:8:12;Hip thrust machine:3:8:12;Lying leg curl:3:10:15;Leg extension:2:12:15;Seated calf raise:3:12:20;Dead bug (per side):3:8:12']]
.map(t=>({id:'tp-'+slug(t[0]),name:t[0],day:t[1],items:t[2].split(';').map(s=>{const a=s.split(':');return{ex:'ex-'+slug(a[0].replace(/ \(per side\)| \(alternate grip\)/,m=>m)),n:+a[1],min:+a[2],max:+a[3]}})}));
const mk=()=>({v:1,onboarded:false,profile:{name:'',age:18,height:175,startW:54,targetW:60,startDate:today(),targetDate:iso(new Date(Date.now()+150*864e5)),units:'metric',theme:'dark',rest:90,protein:100,cal:0,rate:0.25,dbMode:'each',exp:'About 2 months back in the gym'},exercises:JSON.parse(JSON.stringify(X)),templates:JSON.parse(JSON.stringify(T)),sessions:[],active:null,body:[],food:[],water:{}});
const valid=o=>o&&typeof o==='object'&&o.v===1&&o.profile&&typeof o.profile==='object'&&['exercises','templates','sessions','body','food'].every(k=>Array.isArray(o[k]))&&o.exercises.every(e=>e&&e.id&&e.name)&&o.templates.every(t=>t&&t.id&&Array.isArray(t.items))&&o.sessions.every(s=>s&&s.id&&Array.isArray(s.exs)&&s.exs.every(e=>Array.isArray(e.sets)))&&o.body.every(b=>b&&b.id&&/^\d{4}-\d\d-\d\d$/.test(b.date))&&o.food.every(f=>f&&f.id&&/^\d{4}-\d\d-\d\d$/.test(f.date));
function load(){try{const o=JSON.parse(localStorage.getItem(K));if(valid(o))return Object.assign(mk(),o,{profile:Object.assign(mk().profile,o.profile),water:o.water||{}})}catch(e){}return mk()}
let S=load();let saveErr='';export const getSaveErr=()=>saveErr;export const replaceS=o=>{S=o};
function save(){try{localStorage.setItem(K,JSON.stringify(S));saveErr=''}catch(e){saveErr='Could not save: browser storage is unavailable or full.'}}
const P=()=>S.profile,imp=()=>P().units==='imperial',wd=k=>imp()?k*2.20462:k,kw=v=>imp()?v/2.20462:v,ld=c=>imp()?c/2.54:c,kl=v=>imp()?v*2.54:v;
const wu=()=>imp()?'lb':'kg',lu=()=>imp()?'in':'cm',fw=k=>k==null||isNaN(k)?'–':r1(wd(k))+' '+wu(),fl=c=>c==null?'–':r1(ld(c))+' '+lu();
const exById=id=>S.exercises.find(e=>e.id===id),fin=()=>S.sessions.filter(s=>s.end).sort((a,b)=>a.start-b.start);
const work=e=>e.sets.filter(s=>s.type==='work'&&s.done&&s.r>0),vol=s=>s.exs.reduce((a,e)=>a+work(e).reduce((b,x)=>b+(x.w||0)*x.r,0),0),nsets=s=>s.exs.reduce((a,e)=>a+e.sets.filter(x=>x.done).length,0);
const wkStart=ds=>{const d=D(ds);d.setDate(d.getDate()-(d.getDay()+6)%7);return iso(d)};
const e1=(w,r)=>r>=1&&r<=10&&w>0?w*(1+r/30):null;
const lastSets=(exId,before)=>{const l=fin().filter(s=>s.start<before).reverse();for(const s of l){const e=s.exs.find(x=>x.ex===exId);if(e&&work(e).length)return work(e)}return[]};
const curW=()=>{const b=S.body.filter(x=>x.w!=null).sort((a,b)=>a.date<b.date?-1:1);return b.length?b[b.length-1].w:P().startW};
const goalPct=()=>{const{startW:a,targetW:t}=P(),c=curW();if(a===t)return c===t?100:0;return Math.max(0,Math.min(100,(c-a)/(t-a)*100))};
function streak(){const ds=[...new Set(fin().map(s=>day(s.start)))].sort().reverse();if(!ds.length)return 0;const g=(a,b)=>Math.round((D(a)-D(b))/864e5);if(g(today(),ds[0])>2)return 0;let n=1;for(let i=1;i<ds.length&&g(ds[i-1],ds[i])<=2;i++)n++;return n}
const dstr=ms=>{const s=Math.floor(ms/1000);return(s>=3600?Math.floor(s/3600)+':':'')+pad(Math.floor(s/60)%60)+':'+pad(s%60)};
/* charts */
function line(pts,fmt=v=>r1(v)){if(!pts.length)return'<p class="mu">No data in this range yet.</p>';const W=320,H=130,p=30;let xs=pts.map(a=>a.x),ys=pts.map(a=>a.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);if(y0===y1){y0-=1;y1+=1}if(x0===x1)x1=x0+1;
const gx=v=>p+(v-x0)/(x1-x0)*(W-p-10),gy=v=>H-22-(v-y0)/(y1-y0)*(H-36);
return`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img"><text x="0" y="12">${fmt(y1)}</text><text x="0" y="${H-24}">${fmt(y0)}</text><polyline points="${pts.map(a=>gx(a.x).toFixed(1)+','+gy(a.y).toFixed(1)).join(' ')}"/>${pts.map(a=>`<circle cx="${gx(a.x).toFixed(1)}" cy="${gy(a.y).toFixed(1)}" r="3"><title>${esc(a.l)}: ${fmt(a.y)}</title></circle>`).join('')}<text x="${p}" y="${H-5}">${esc(pts[0].l)}</text><text x="${W-10}" y="${H-5}" text-anchor="end">${esc(pts[pts.length-1].l)}</text></svg>`}
function bars(v,fmt=x=>x){const W=320,H=120,m=Math.max(...v.map(a=>a.v),1),w=(W-20)/v.length;return`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img">${v.map((a,i)=>{const h=a.v/m*(H-40);return`<rect x="${10+i*w+4}" y="${H-24-h}" width="${w-8}" height="${Math.max(h,a.v?2:0)}" rx="3"><title>${esc(a.l)}: ${fmt(a.v)}</title></rect><text x="${10+i*w+w/2}" y="${H-12}" text-anchor="middle">${esc(a.l)}</text><text x="${10+i*w+w/2}" y="${H-28-h}" text-anchor="middle">${a.v?fmt(a.v):''}</text>`}).join('')}</svg>`}
const dl=s=>D(s).toLocaleDateString(undefined,{day:'numeric',month:'short'});
const weeks=n=>{const o=[],d=D(wkStart(today()));for(let i=n-1;i>=0;i--){const x=new Date(d);x.setDate(x.getDate()-7*i);o.push(iso(x))}return o};
const rangeStart=r=>r?iso(new Date(Date.now()-r*864e5)):'0000-00-00';

export {S,D,K,P,T,X,bars,curW,day,dl,dstr,e1,esc,exById,fin,fl,fw,goalPct,imp,iso,kl,kw,lastSets,ld,line,load,lu,mk,nsets,pad,r1,rangeStart,save,slug,streak,today,uid,valid,vol,wd,weeks,wkStart,work,wu};
