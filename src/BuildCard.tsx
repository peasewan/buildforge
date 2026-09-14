import { ArrowRight, Heart, Route, Shield, Sparkles, Swords } from 'lucide-react'

export type BuildCardIcon = 'holy' | 'protection' | 'retribution' | 'leveling' | 'pvp' | 'raid'

const icons = {
  holy: Sparkles,
  protection: Shield,
  retribution: Swords,
  leveling: Route,
  pvp: Swords,
  raid: Heart,
}

interface BuildCardProps {
  eyebrow: string
  title: string
  description?: string
  role?: string
  focus?: string
  href: string
  icon: BuildCardIcon
  compact?: boolean
  onOpen?: () => void
}

export default function BuildCard({ eyebrow, title, description, role, focus, href, icon, compact = false, onOpen }: BuildCardProps) {
  const Icon = icons[icon]
  return (
    <article className={`build-card ${compact ? 'compact' : ''}`}>
      <header><i><Icon size={compact ? 20 : 23} /></i><span>{eyebrow}</span></header>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {(role || focus) && <dl>{role && <div><dt>Role</dt><dd>{role}</dd></div>}{focus && <div><dt>Focus</dt><dd>{focus}</dd></div>}</dl>}
      <a href={href} onClick={onOpen}>{compact ? 'View Build' : 'Open Build'} <ArrowRight size={15} /></a>
    </article>
  )
}
