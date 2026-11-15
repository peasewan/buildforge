import { importAtlas } from './importAtlas'
import data from './comparison.json'
type Side = {name:string; stats:string[]; kind:string; points:number; links:string[]}
type Row = {id:string; state:string; before:Side|null; after:Side|null}
const nodes:Row[] = data.nodes
const byId = new Map(nodes.map(n => [n.id,n]))
const el = <T extends HTMLElement>(id:string) => document.getElementById(id) as T
const ids = el<HTMLTextAreaElement>('ids'), query = el<HTMLInputElement>('query'), filter = el<HTMLSelectElement>('filter')
const tag = (name:string, text:string) => {const e=document.createElement(name); e.textContent=text; return e}
function card(n:Row, selectable:boolean) {
  const d=document.createElement('details'), a=n.before, b=n.state==='Retained'?a:n.after
  d.append(tag('summary', (b?.name ?? a!.name)+' · #'+n.id+' · '+n.state))
  if(a && b && n.state==='Changed'){
    const delta:string[]=[]
    if(a.name!==b.name)delta.push('Name changed')
    if(a.kind!==b.kind)delta.push('Type changed')
    if(JSON.stringify(a.stats)!==JSON.stringify(b.stats))delta.push('Effect text changed')
    if(a.points!==b.points)delta.push('Granted points changed')
    const lost=a.links.filter(id=>!b.links.includes(id)), gained=b.links.filter(id=>!a.links.includes(id))
    if(lost.length)delta.push('Lost links: '+lost.join(', '))
    if(gained.length)delta.push('New links: '+gained.join(', '))
    d.append(tag('p',delta.join(' · ')))
  }
  const cols=document.createElement('div');cols.className='cols'
  for(const [label,s] of [['3.29.1',a],['3.30.0',b]] as const) {
    const box=document.createElement('div');box.className='col';box.append(tag('small',label))
    if(!s) box.append(tag('p','No node at this ID.'))
    else {box.append(tag('p',s.kind+' · '+s.name));for(const v of s.stats)box.append(tag('p',v));if(s.points)box.append(tag('p','Grants passive points: '+s.points));box.append(tag('small','Direct links: '+(s.links.join(', ')||'None')))}
    cols.append(box)
  }
  d.append(cols)
  if(selectable && a){const btn=tag('button','Add to my check');btn.className='quiet';btn.onclick=()=>{el('import-status').textContent='';const set=new Set(tokens());set.add(n.id);ids.value=[...set].join(', ');check()};d.append(btn)}
  return d
}
function tokens(){return [...new Set(ids.value.trim().split(/[\s,;]+/).filter(Boolean))]}
function check(){
 const found:Row[]=[],bad:string[]=[]
 for(const id of tokens()){const n=byId.get(id);if(n?.before)found.push(n);else bad.push(id)}
 const selected = new Set(found.map(n => n.id))
 const lost = found.flatMap(n => {
   const afterLinks = n.state === 'Retained' ? n.before!.links : n.after?.links ?? []
   return n.before!.links.filter(other => selected.has(other) && Number(other) > Number(n.id) && !afterLinks.includes(other))
     .map(other => n.before!.name + ' (#' + n.id + ') ↔ ' + byId.get(other)!.before!.name + ' (#' + other + ')')
 })
 const links = el('lost-links')
 links.replaceChildren()
 if (found.length) {
   links.append(tag('h3', lost.length + ' lost direct ' + (lost.length === 1 ? 'link' : 'links') + ' between selected nodes'))
   if (lost.length) {
     const list = document.createElement('ul')
     list.append(...lost.map(pair => tag('li', pair)))
     const detail = document.createElement('details')
     detail.append(tag('summary', 'Show affected pairs'), list)
     links.append(detail, tag('p', 'These selected pairs shared an edge in 3.29. Check other paths in the new planner before rerouting.'))
   }
 }
 el('selection').replaceChildren(...found.map(n=>card(n,false)))
 el('summary').textContent=found.length||bad.length?['Retained','Changed','Removed'].map(k=>found.filter(n=>n.state===k).length+' '+k.toLowerCase()).join(' · ')+(bad.length?' | Not in the 3.29 standard tree: '+bad.join(', '):''):'No allocation checked yet.'
}
let limit=20
function browse(){
 const q=query.value.trim().toLowerCase(); const matches=nodes.filter(n=>(filter.value==='All'||n.state===filter.value)&&(!q||n.id===q||[n.before,n.after].some(s=>s&&[s.name,...s.stats].join(' ').toLowerCase().includes(q))))
 el('count').textContent=matches.length+' matching nodes · showing '+Math.min(limit,matches.length)
 el('list').replaceChildren(...matches.slice(0,limit).map(n=>card(n,true)));el('more').hidden=limit>=matches.length
}
el('more').onclick=()=>{limit+=20;browse()};query.oninput=filter.onchange=()=>{limit=20;browse()}
const urlInput = el<HTMLInputElement>('atlas-url')
el('import-form').onsubmit = event => {
  event.preventDefault()
  try {
    const result = importAtlas(urlInput.value)
    ids.value = result.ids.join(', ')
    check()
    el('import-status').textContent = 'Imported ' + result.ids.length + ' unique IDs. ' + (result.patch ? 'Link version ' + result.patch + '.' : 'Unversioned link evaluated against 3.29.1.')
  } catch (error) {
    el('import-status').textContent = (error as Error).message
  }
}
urlInput.oninput = () => { el('import-status').textContent = '' }
el('check').onclick=check;ids.oninput=()=>{el('lost-links').replaceChildren();el('import-status').textContent='';el('summary').textContent='Check allocation to update results.';el('selection').replaceChildren()}
el('example').onclick=()=>{el('import-status').textContent='';ids.value=['Changed','Removed','Retained'].map(s=>s==='Changed'?'2378':nodes.find(n=>n.state===s)!.id).join(', ');check()}
el('reset').onclick=()=>{ids.value='';urlInput.value='';el('import-status').textContent='';check()};browse()
