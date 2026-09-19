import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, ArrowRight, Bot, Check, ChevronDown, ChevronRight, CircleDot, Code2, FileCode2, GitPullRequest, Github, Lightbulb, Menu, Play, Plus, Search, Settings2, ShieldCheck, Sparkles, TestTube2, X } from 'lucide-react'
import './styles.css'

const findings = [
  { level: 'critical', title: 'Race condition in balance update', file: 'services/ledger.ts', line: 48, body: 'Two concurrent requests can read the same balance before either transaction completes. This permits a double-spend under load.', tag: 'Correctness' },
  { level: 'warning', title: 'Missing input validation', file: 'api/transfers.ts', line: 22, body: 'The destination account id is accepted without validation. Invalid UUIDs pass through to the repository layer.', tag: 'Security' },
  { level: 'info', title: 'Error response loses context', file: 'services/ledger.ts', line: 71, body: 'The upstream error is replaced with a generic message, making incident triage harder.', tag: 'Reliability' },
]

const code = [
  ['41', 'export async function transfer(input: TransferInput) {'],
  ['42', '  const { from, to, amount } = input'],
  ['43', ''],
  ['44', '  const source = await accounts.findById(from)'],
  ['45', '  if (!source) throw new NotFoundError(\'Account not found\')'],
  ['46', ''],
  ['47', '  if (source.balance < amount) {'],
  ['48', '    throw new InsufficientFundsError()'],
  ['49', '  }'],
  ['50', ''],
  ['51', '  await accounts.debit(from, amount)'],
  ['52', '  await accounts.credit(to, amount)'],
  ['53', '  return { success: true }'],
  ['54', '}'],
]

function App() {
  const [active, setActive] = useState('Review')
  const [selected, setSelected] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tests, setTests] = useState(false)
  const runReview = () => { setReviewing(true); setTimeout(() => setReviewing(false), 900) }
  const finding = findings[selected]
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={17}/></div><span>prism<span className="brand-dot">.</span></span></div>
      <button className="workspace"><span className="avatar">A</span><span>acme-payments</span><ChevronDown size={15}/></button>
      <nav>
        {[[GitPullRequest,'Pull requests'],[Bot,'AI reviews'],[TestTube2,'Test suites'],[Settings2,'Settings']].map(([Icon,label]) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={()=>setActive(label)}><Icon size={18}/>{label}{label==='Pull requests'&&<span className="badge">3</span>}</button>)}
      </nav>
      <div className="sidebar-foot"><div className="usage"><div className="usage-row"><span>AI review credits</span><span>72%</span></div><div className="meter"><i/></div><small>72 of 100 this month</small></div><button className="user"><span className="avatar slate">JT</span><span><b>Jordan Tan</b><small>Developer</small></span><ChevronDown size={14}/></button></div>
    </aside>
    <main>
      <header><div className="crumb"><Github size={18}/><ChevronRight size={15}/><span>acme-payments</span><ChevronRight size={15}/><b>Pull requests</b></div><div className="header-actions"><button className="icon-button"><Search size={18}/></button><button className="icon-button"><CircleDot size={18}/></button><button className="new-button"><Plus size={16}/>New review</button></div></header>
      <section className="pr-head"><div><div className="eyebrow">PULL REQUEST #184</div><h1>Fix transfer validation and retry logic</h1><p><span className="open-dot"/> Open · <b>maya-chen</b> wants to merge 4 commits into <code>main</code> from <code>fix/transfer-safety</code></p></div><div className="pr-actions"><button className="secondary"><Github size={16}/> View on GitHub</button><button className="primary" onClick={runReview}>{reviewing ? <><span className="spinner"/> Reviewing…</> : <><Sparkles size={16}/> Run AI review</>}</button></div></section>
      <div className="tabs"><button className="tab">Overview</button><button className="tab active">AI review <span>3</span></button><button className="tab">Files changed <span>6</span></button><button className="tab">Checks <span className="passed">4</span></button></div>
      <div className="content-grid">
        <section className="findings-panel"><div className="section-title"><div><h2>Review findings</h2><p>3 issues found across 2 files</p></div><button className="filter"><Settings2 size={15}/> Filter</button></div><div className="summary"><ShieldCheck size={18}/><div><b>Review complete</b><span>Analyzed 6 files · 214 lines changed · 14s</span></div><button><ChevronDown size={16}/></button></div><div className="finding-list">{findings.map((item, i) => <button key={item.title} onClick={()=>setSelected(i)} className={'finding '+(selected===i?'selected':'')}><span className={'severity '+item.level}>{item.level==='critical'?<AlertTriangle size={16}/>:item.level==='warning'?<AlertTriangle size={16}/>:<Lightbulb size={16}/>}</span><span className="finding-copy"><span className="finding-head"><b>{item.title}</b><em>{item.tag}</em></span><small><FileCode2 size={13}/>{item.file}:{item.line}</small></span><ChevronRight size={16}/></button>)}</div></section>
        <section className="detail-panel"><div className="detail-header"><div><span className={'detail-level '+finding.level}>{finding.level}</span><h2>{finding.title}</h2><p><FileCode2 size={14}/>{finding.file} <span>·</span> Line {finding.line}</p></div><button className="close"><X size={18}/></button></div><div className="explanation"><div className="ai-label"><Bot size={15}/> PRISM ANALYSIS</div><p>{finding.body}</p></div><div className="code-card"><div className="code-top"><span><Code2 size={15}/> {finding.file}</span><span className="line-pill">{finding.line}</span></div><pre>{code.map(([num, text]) => <div className={num===String(finding.line)?'highlight':''} key={num}><span>{num}</span><code>{text}</code></div>)}</pre></div><div className="suggestion"><div className="suggestion-title"><Sparkles size={17}/><div><b>Suggested fix</b><span>Use a database transaction with row-level locking</span></div></div><div className="patch"><div><span className="minus">−</span><code>const source = await accounts.findById(from)</code></div><div><span className="plus">+</span><code>const source = await accounts.findForUpdate(from, tx)</code></div><div><span className="plus">+</span><code>await tx.commit()</code></div></div><div className="suggestion-actions"><button className="secondary" onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),1500)}}>{copied?<><Check size={15}/>Copied</>:<><Code2 size={15}/>Copy patch</>}</button><button className="primary"><ArrowRight size={15}/> Apply suggestion</button></div></div><div className="test-gen"><div><TestTube2 size={18}/><div><b>Generate regression test</b><p>Create a test that prevents this issue from returning.</p></div></div><button className={tests?'secondary generated':'test-button'} onClick={()=>setTests(!tests)}>{tests?<><Check size={16}/>Test generated</>:<><Play size={15}/>Generate test</>}</button></div></section>
      </div>
    </main>
  </div>
}
createRoot(document.getElementById('root')).render(<App />)
