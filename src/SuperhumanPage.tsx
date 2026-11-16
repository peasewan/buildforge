import { useState } from 'react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { useFirstToolAdjustment } from './lib/useFirstToolAdjustment'

const styles = ['Dark Step', 'Electric', 'Water Kung Fu', 'Dragon Breath']
const cost = 3_000_000
const format = (amount: number) => amount.toLocaleString('en-US')
const whole = (text: string) => /^\d+$/.test(text) && Number.isSafeInteger(Number(text))

export default function SuperhumanPage() {
  const [sea, setSea] = useState('Second Sea')
  const [money, setMoney] = useState('0')
  const [levels, setLevels] = useState(styles.map(() => '0'))
  const record = useFirstToolAdjustment('blox_superhuman_used')
  const mastered = levels.filter(level => whole(level) && Number(level) >= 300).length
  const valid = whole(money) && levels.every(whole)
  const missingMoney = Math.max(0, cost - Number(money))
  const teacher = sea === 'Third Sea' ? 'Castle on the Sea' : 'Snow Mountain in the Second Sea'
  const ready = valid && mastered === 4 && !missingMoney && sea !== 'First Sea'
  return <div className="site-discovery stand-page superhuman-page"><DiscoveryHeader /><main className="sd-main">
    <header className="superhuman-intro"><p className="sd-kicker">Roblox / Blox Fruits</p><h1>Superhuman requirements checker</h1>
      <p>Reach 300 mastery in each of four fighting styles, then pay the Martial Arts Master $3,000,000. Enter the mastery shown on each style to see exactly what you still need.</p></header>
    <section className="stand-compare" aria-label="Superhuman checklist"><div className="stand-pair">
      <div className="stand-card"><h2>Your fighting styles</h2>
        <div className="arrow-inputs">{styles.map((style, index) => <label key={style}>{style} mastery
          <input type="number" min="0" step="1" value={levels[index]} aria-invalid={!whole(levels[index])}
            onChange={e => { const value = e.target.value; setLevels(previous => previous.map((level,i) => i === index ? value : level)); if (whole(value)) record('mastery') }} /></label>)}</div>
        <div className="arrow-inputs"><label>Money on hand ($)<input type="number" min="0" step="1" value={money} aria-invalid={!whole(money)} onChange={e => {setMoney(e.target.value); if (whole(e.target.value)) record('money')}} /></label>
          <label>Current sea<select value={sea} onChange={e => {setSea(e.target.value); record('sea')}}>{['First Sea','Second Sea','Third Sea'].map(s => <option key={s}>{s}</option>)}</select></label></div></div>
      <article className="stand-card superhuman-result" aria-live="polite"><h2>{ready ? 'Ready to learn Superhuman' : 'Your unlock checklist'}</h2>
        <p className="stand-meta">{mastered} of 4 styles at 300 mastery</p>
        <ul>{styles.map((style,i) => <li key={style}><span>{style}</span><strong>{!whole(levels[i]) ? 'Enter a whole number' : Number(levels[i]) >= 300 ? 'Ready' : (300 - Number(levels[i]))+' mastery to go'}</strong></li>)}
        <li><span>Lesson fee</span><strong>{!whole(money) ? 'Enter a whole amount' : missingMoney ? '$'+format(missingMoney)+' short' : 'Covered'}</strong></li></ul>
        <p>{sea === 'First Sea' ? 'The trainer is outside the First Sea. When you reach the Second Sea, visit Snow Mountain.' : 'Find the Martial Arts Master at '+teacher+'.'}</p>
        {!valid && <p>Use zero for a style you have yet to train. All entries must be nonnegative whole numbers.</p>}
      </article></div></section>
    <section className="stand-reading"><h2>Why the trainer still turns you away</h2>
      <p>Check each style separately. For example, 350 Dark Step, 300 Electric, 300 Water Kung Fu and 250 Dragon Breath still leaves 50 Dragon Breath mastery to train. Extra Dark Step levels do not fill that gap. Use the mastery on the style, rather than your character level or Melee stat.</p>
      <h2>Where to buy Superhuman</h2><p>In the Second Sea, look for the Martial Arts Master at Snow Mountain. In the Third Sea, visit the trainer at Castle on the Sea. The $3,000,000 is the Superhuman lesson fee. Budget separately for any prerequisite styles you still need to learn.</p>
      <p>Requirements checked November 16, 2026. <a href="https://blox-fruits.fandom.com/wiki/Superhuman">Superhuman unlock requirements</a> · <a href="https://bloxfruitswiki.org/wiki/martial-arts-master/">Martial Arts Master locations</a>.</p>
    </section></main><SiteFooter discovery links={[]} /></div>
}
