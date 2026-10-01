import { useState } from 'react'
import { ArrowRight, BookOpen, Check, CircleHelp, Leaf, Music2, Sparkles } from 'lucide-react'

const SOURCES = {
  store: 'https://store.steampowered.com/app/1706510/Songs_of_Glimmerwick/',
  demo484: 'https://store.steampowered.com/news/app/1706510/view/711152269082494267',
  demo466: 'https://store.steampowered.com/news/app/1706510/view/515239886340494123',
  demo464: 'https://store.steampowered.com/news/app/1706510/view/515239886340490207',
} as const

type Route = 'cast' | 'practice'

const ROUTES = {
  cast: {
    title: 'Cast without chasing stars',
    intro: 'Choose this route when you want to use a song and keep moving. It is a reading of developer Demo notes, not a list of in-game button presses.',
    steps: [
      { title: 'Start with the songbook', text: 'The official game description pairs your flute with a songbook. Look at a song you have learned instead of relying on a guessed note sequence.' },
      { title: 'Try the first song', text: 'The developer names Song of Tilling as the first song in Demo 0.484. Treat it as a documented starting example, not a complete spell list.' },
      { title: 'Let the score go', text: 'Demo 0.466 says you do not need stars from the music minigame to cast spells. You can return to the performance challenge later.' },
    ],
  },
  practice: {
    title: 'Practice the music at your own pace',
    intro: 'Choose this route when learning the melody is part of the fun. The developer describes practice as optional, not a gate to magic.',
    steps: [
      { title: 'Find a place to rehearse', text: 'Demo 0.464 points players toward the practice rooms in the music classroom. It also notes that flute mode does not pause the clock outside that context.' },
      { title: 'Use the extra help', text: 'Demo 0.466 added extra help in the music minigame options. Check those settings if the timing feels difficult.' },
      { title: 'Repeat without a perfect-score target', text: 'Demo 0.484 made Song of Tilling easier and says songs improve with repeated attempts. You do not need to max out a song on the first try.' },
    ],
  },
} as const

const sourceLink = (href: string, label: string) => <a href={href} target="_blank" rel="noreferrer">{label} <ArrowRight size={14} aria-hidden="true" /></a>

export default function GlimmerwickSpellcastingPage() {
  const [route, setRoute] = useState<Route>('cast')
  const chosen = ROUTES[route]

  return <div className="gs-site">
    <header className="gs-header"><a className="gs-brand" href="/">BuildForge<span>Tools</span></a><nav aria-label="Glimmerwick navigation"><a href="/songs-of-glimmerwick">Garden Planner</a><a href="/songs-of-glimmerwick-first-days">First Days</a><a href="/">All tools</a></nav></header>
    <main data-surface="glimmerwick-spellcasting">
      <section className="gs-hero" aria-labelledby="gs-title">
        <div className="gs-hero-copy"><p className="gs-kicker"><Music2 size={16} aria-hidden="true" /> A LITTLE MAGIC, AT YOUR PACE</p><h1 id="gs-title">Songs of Glimmerwick <span>Spellcasting Guide</span></h1><p className="gs-lede">Songs are spells in Glimmerwick. If the music challenge feels like a barrier, the developer’s Demo updates make an important distinction: using magic and earning performance stars are separate goals.</p><div className="gs-meta"><span>Released Sep 30, 2026</span><span>Evidence reviewed Oct 1, 2026</span><span>Demo mechanics; launch details under review</span></div><a className="gs-primary" href="#choose-route">Choose your route <ArrowRight size={16} aria-hidden="true" /></a></div>
        <div className="gs-hero-art" aria-hidden="true"><div className="gs-art-orbit gs-art-orbit-outer"/><div className="gs-art-orbit gs-art-orbit-inner"/><div className="gs-art-center"><Music2 size={66}/></div><span className="gs-art-note gs-art-note-a">♪</span><span className="gs-art-note gs-art-note-b">♫</span><span className="gs-art-note gs-art-note-c">♪</span><div className="gs-art-caption">A song can be a spell<br/>without a perfect score.</div></div>
      </section>

      <section className="gs-answer" aria-labelledby="gs-answer-title"><div className="gs-answer-icon"><Check size={25} aria-hidden="true" /></div><div><p className="gs-kicker">THE SHORT ANSWER</p><h2 id="gs-answer-title">Do stars matter for casting?</h2><p>According to the developer’s Demo 0.466 update, <strong>you do not need stars to cast spells</strong>. Stars are part of the music minigame; the update added a tutorial to make this distinction clear. We have not independently checked every spell in the release build.</p></div>{sourceLink(SOURCES.demo466, 'Developer update 0.466')}</section>

      <section className="gs-choice" id="choose-route" aria-labelledby="gs-choice-title"><div className="gs-section-head"><p className="gs-kicker">PICK THE EXPERIENCE YOU WANT</p><h2 id="gs-choice-title">There is more than one way to play</h2><p>This choice changes only the guidance shown here; it does not connect to your game or change its settings.</p></div>
        <div className="gs-switch" role="group" aria-label="Spellcasting approach"><button type="button" aria-label="Just cast" aria-pressed={route === 'cast'} onClick={() => setRoute('cast')}><Sparkles size={19} aria-hidden="true" /><strong>Just cast</strong><span>I want to use songs without treating the score as a requirement.</span></button><button type="button" aria-label="Practice first" aria-pressed={route === 'practice'} onClick={() => setRoute('practice')}><Music2 size={19} aria-hidden="true" /><strong>Practice first</strong><span>I enjoy the music challenge and want a calmer place to learn.</span></button></div>
        <section className="gs-route" role="region" aria-label="Your spellcasting route" aria-live="polite"><div className="gs-route-head"><span>YOUR ROUTE</span><h3>{chosen.title}</h3><p>{chosen.intro}</p></div><ol>{chosen.steps.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol></section>
      </section>

      <section className="gs-explainer" aria-labelledby="gs-explainer-title"><div className="gs-section-head"><p className="gs-kicker">ONE DOCUMENTED STARTING POINT</p><h2 id="gs-explainer-title">What we can say about Song of Tilling</h2></div><div className="gs-explainer-grid"><article><span className="gs-number">01</span><h3>It is the first song</h3><p>The developer calls Song of Tilling the first song in Demo 0.484. That gives a source-backed starting point for learning how music and magic meet.</p></article><article><span className="gs-number">02</span><h3>The early difficulty changed</h3><p>That same Demo update made the first song a little easier to improve the minigame’s difficulty ramp. Older Demo footage may show different timing.</p></article><article><span className="gs-number">03</span><h3>The minigame is optional</h3><p>The developer says players can largely skip the music minigame. You can practice because you enjoy it, not because a high score is required to cast.</p></article></div><p className="gs-source-line">Source: {sourceLink(SOURCES.demo484, 'Developer update 0.484')}</p></section>

      <section className="gs-evidence" aria-labelledby="gs-evidence-title"><div className="gs-section-head"><p className="gs-kicker">FACTS AND LIMITS</p><h2 id="gs-evidence-title">What this guide is based on</h2></div><div className="gs-evidence-grid"><article><BookOpen size={23} aria-hidden="true"/><span>OFFICIAL STORE</span><h3>Flute, songbook and spell songs</h3><p>The store page says music is the way spells are cast, and describes a flute and songbook as the player’s companions. Songs support gardening and exploration.</p>{sourceLink(SOURCES.store, 'Official Steam page')}</article><article><Music2 size={23} aria-hidden="true"/><span>DEMO UPDATE 0.466</span><h3>Stars are not a casting gate</h3><p>The developer added a tutorial clarifying that stars in the music minigame are not needed to cast. The update also mentions extra help in options.</p>{sourceLink(SOURCES.demo466, 'Read update 0.466')}</article><article><Leaf size={23} aria-hidden="true"/><span>DEMO UPDATE 0.464</span><h3>Practice rooms exist</h3><p>The developer directs players to practice rooms in the music classroom and distinguishes flute mode from menus that pause the clock.</p>{sourceLink(SOURCES.demo464, 'Read update 0.464')}</article></div><p className="gs-limit"><CircleHelp size={18} aria-hidden="true"/><span>This is a beginner decision aid, <strong>not a complete song catalog</strong> or a melody transcription. These developer statements describe Demo versions; we have not verified all launch controls, song locations or scoring effects.</span></p></section>

      <section className="gs-faq" aria-labelledby="gs-faq-title"><p className="gs-kicker">QUICK QUESTIONS</p><h2 id="gs-faq-title">Before you play another song</h2><details><summary>Do I have to earn a star before a spell works?</summary><p>Demo 0.466 says no stars are required to cast. For a specific song, check what the released game says about learning and selecting it; we do not document every unlock here.</p></details><details><summary>Is Song of Tilling the only song?</summary><p>No. The developer calls it the first song, while the official Steam page describes songs for gardening and exploration. We do not have a reviewed launch catalog.</p></details><details><summary>Can I skip the music minigame?</summary><p>In Demo 0.484 the developer says players can largely skip it. That describes the performance challenge, not every lesson or story step; this guide does not promise a quest skip.</p></details></section>

      <section className="gs-related" aria-labelledby="gs-related-title"><div><p className="gs-kicker">KEEP EXPLORING</p><h2 id="gs-related-title">Your next Glimmerwick stop</h2></div><div className="gs-related-links"><a href="/songs-of-glimmerwick"><Leaf size={19} aria-hidden="true"/><span><strong>Garden Planner</strong><small>Track planting and harvest observations.</small></span><ArrowRight size={17} aria-hidden="true"/></a><a href="/songs-of-glimmerwick-first-days"><BookOpen size={19} aria-hidden="true"/><span><strong>First Days</strong><small>Find your footing at the academy.</small></span><ArrowRight size={17} aria-hidden="true"/></a></div></section>
    </main><footer className="gs-footer"><div><a className="gs-brand" href="/">BuildForge<span>Tools</span></a><p>An independent player resource. Not affiliated with Eastshade Studios.</p></div><nav aria-label="Site information"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav></footer>
  </div>
}
