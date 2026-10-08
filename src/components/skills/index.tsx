import { motion, useReducedMotion, type Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────
//  Minhas habilidades (baseado no CV + o que uso de fato).
//  Cada skill tem uma cor própria — ao entrar na tela, sobem numa onda
//  escalonada, coloridas, com glow. Skills "muted" (soft skills / idiomas)
//  usam um estilo neutro para criar hierarquia.
//  Para editar: adicione/remova itens abaixo. Cor opcional = chip neutro.
// ─────────────────────────────────────────────────────────────────────────
type Skill = { name: string; color?: string }
type Group = { label: string; muted?: boolean; skills: Skill[] }

const GROUPS: Group[] = [
  {
    label: 'Desenvolvimento',
    skills: [
      { name: 'Java', color: '#ff8fc4' },
      { name: 'Lógica de Programação', color: '#c77dff' },
    ],
  },
  {
    label: 'Sistemas corporativos',
    skills: [
      { name: 'TOTVS', color: '#f9a8d4' },
      { name: 'TASY (Java e HTML5)', color: '#e879f9' },
      { name: 'RIS/PACS', color: '#fda4af' },
    ],
  },
  {
    label: 'Suporte & Infra',
    skills: [
      { name: 'Troubleshooting', color: '#fdba74' },
      { name: 'Análise de Incidentes', color: '#ff4d9d' },
      { name: 'Gestão de Acessos', color: '#d8b4fe' },
      { name: 'Suporte a Hardware e Software', color: '#f0abfc' },
    ],
  },
  {
    label: 'Metodologias',
    skills: [
      { name: 'Scrum', color: '#fb7185' },
      { name: 'Métodos Ágeis', color: '#c4b5fd' },
    ],
  },
  {
    label: 'Cursos',
    muted: true,
    skills: [
      { name: 'Java — EACH-USP · 19,5 h' },
      { name: 'Lógica de Programação — DIO · 4 h' },
      { name: 'Projetos Ágeis com Scrum — DIO · 2 h' },
      { name: 'Marketing Digital — Google Ateliê Digital · 40 h' },
    ],
  },
  {
    label: 'Idiomas',
    muted: true,
    skills: [
      { name: 'Português · Nativo' },
      { name: 'Inglês · Básico' },
      { name: 'Coreano · Básico' },
    ],
  },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
}

// Each item rises from below, pops with a spring, and resolves out of blur.
const item: Variants = {
  hidden: { opacity: 0, y: 46, scale: 0.78, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 17,
      mass: 0.6,
      opacity: { duration: 0.35, ease: 'easeOut' },
      filter: { duration: 0.5, ease: 'easeOut' },
    },
  },
}

function Chip({ name, color }: Skill) {
  if (!color) {
    return (
      <motion.span
        variants={item}
        whileHover={{ y: -4, scale: 1.04 }}
        className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 font-code text-sm tracking-wide text-white/70"
      >
        {name}
      </motion.span>
    )
  }
  return (
    <motion.span
      variants={item}
      whileHover={{ y: -6, scale: 1.07 }}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-code text-sm tracking-wide sm:text-[15px]"
      style={{
        color,
        borderColor: `${color}66`,
        background: `${color}14`,
        boxShadow: `0 8px 30px -10px ${color}73, inset 0 0 0 1px ${color}1f`,
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
      {name}
    </motion.span>
  )
}

export default function SkillsShowcase() {
  const reduce = useReducedMotion()
  return (
    <section className="relative overflow-hidden bg-[#0f070b] px-6 pb-28 pt-2 md:pb-36">
      {/* colorful ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-6 h-80 w-80 rounded-full opacity-[0.13] blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff4d9d, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-8 h-80 w-80 rounded-full opacity-[0.12] blur-3xl"
        style={{ background: 'radial-gradient(circle, #c77dff, transparent 70%)' }}
      />

      <motion.div
        variants={reduce ? undefined : container}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
        className="relative mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-3"
      >
        {GROUPS.flatMap((g, gi) => [
          <motion.div
            key={g.label}
            variants={item}
            className={`w-full ${gi === 0 ? '' : 'mt-7'} ${g.muted ? 'mt-10 border-t border-white/[0.06] pt-10' : ''}`}
          >
            <span className="font-code text-[11px] uppercase tracking-[0.32em] text-white/40">{g.label}</span>
          </motion.div>,
          ...g.skills.map((s) => <Chip key={`${g.label}-${s.name}`} {...s} />),
        ])}
      </motion.div>
    </section>
  )
}
