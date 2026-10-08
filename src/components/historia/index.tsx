import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import RevealSpotlight from '@/components/efeito-8-revelar/reveal-spotlight';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────
//  SUAS FOTOS (retrato ao lado da história)
//  Os dois arquivos ficam em /public/reveal/. Para usar as suas fotos, basta
//  substituir esses arquivos mantendo os mesmos nomes (ou trocar os caminhos).
//  Hoje são placeholders (iniciais "GB") — troque pelas suas fotos.
//    1ª imagem → PRETO E BRANCO (aparece em repouso)
//    2ª imagem → COLORIDA       (revelada sob o ponteiro / dedo)
// ─────────────────────────────────────────────────────────────────────────
const FOTO_PB = '/reveal/gaby-pb.jpg';
const FOTO_COLOR = '/reveal/gaby-color.jpg';

const CHAPTERS = [
  {
    num: '01',
    year: '2022',
    keyword: 'LÓGICA',
    kicker: '// os primeiros códigos na ETEC',
    body: 'Comecei no Ensino Médio Integrado ao Técnico em Desenvolvimento de Sistemas da ETEC de Itaquaquecetuba. Para ir além da sala de aula, fiz o curso de Java da EACH-USP (USP Leste) e os cursos de Lógica de Programação e Projetos Ágeis com Scrum da DIO. Foi ali que aprendi a pensar como dev.',
    tags: ['Java', 'Lógica', 'Scrum', 'ETEC'],
    accent: '#ff4d9d',
  },
  {
    num: '02',
    year: '2023',
    keyword: 'PESSOAS',
    kicker: '// atendimento e suporte no CNA',
    body: 'Meu primeiro emprego foi como Assistente Administrativo no CNA Itaim Paulista. Entre atendimento ao cliente e apoio administrativo, também cuidava do suporte básico à rede e aos equipamentos da unidade. Aprendi a ouvir quem está do outro lado — e a resolver o problema dela.',
    tags: ['Atendimento', 'Suporte', 'Redes', 'CNA'],
    accent: '#c77dff',
  },
  {
    num: '03',
    year: '2025',
    keyword: 'HELP DESK',
    kicker: '// sistemas críticos no Hospital BP',
    body: 'Entrei no Hospital BP como Aprendiz de Service Desk, em Gestão de Acessos e Monitoria, e fui efetivada como Técnica em Help Desk Júnior. Hoje dou suporte a TOTVS, TASY e RIS/PACS, enquanto curso Análise e Desenvolvimento de Sistemas na FIAP — o próximo passo é levar essa visão ao desenvolvimento.',
    tags: ['Hospital BP', 'TOTVS', 'TASY', 'FIAP'],
    accent: '#fbeef4',
  },
] as const;

// Font geometry: Boldonse line-height 0.88 — container matches so y:±100% = one full slot.
// Keep container slightly generous (1.1×) to avoid cap-height clipping on any OS.
// Mobile floor kept low (1.85rem) so wide 10-char words like AUTODIDATA/CONSTRUTOR
// fit on a 320–375px screen without the whitespace-nowrap line clipping.
const KW_FS = 'clamp(1.5rem, 6.2vw, 6.8rem)';
const KW_H  = 'clamp(1.7rem, 6.9vw, 7.5rem)'; // 1.1 × KW_FS

const EASE_IN  = [0.16, 1, 0.3, 1]    as const;
const EASE_OUT = [0.4,  0, 0.6, 1]    as const;

// Cada tag tem a sua cor (mesma linguagem da seção Skills); cai para o accent
// do capítulo se a tag não estiver no mapa.
const TAG_COLORS: Record<string, string> = {
  'Java': '#ff8fc4',
  'Lógica': '#c77dff',
  'Scrum': '#f0abfc',
  'ETEC': '#fb7185',
  'Atendimento': '#ff4d9d',
  'Suporte': '#fdba74',
  'Redes': '#d8b4fe',
  'CNA': '#c4b5fd',
  'Hospital BP': '#fda4af',
  'TOTVS': '#f9a8d4',
  'TASY': '#e879f9',
  'FIAP': '#ff4d9d',
};

// As tags sobem em cascata, coloridas, quando o capítulo entra na tela.
const TAGS_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};
const TAG_POP: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.7 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 380, damping: 18, mass: 0.6 },
  },
};

export default function HistoriaSection() {
  const trackRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null); // left rail fill
  const accentRef   = useRef<HTMLDivElement>(null); // keyword underline
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const n = CHAPTERS.length;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;

        // Left rail — direct DOM, no re-render
        if (progressRef.current) {
          progressRef.current.style.height = `${p * 100}%`;
        }

        // Compute current chapter here (avoids stale closure on idx)
        const next    = Math.min(n - 1, Math.floor(p * n));
        // Local progress 0→1 within the current chapter
        const chLocal = Math.min(1, p * n - next);
        if (accentRef.current) {
          accentRef.current.style.transform = `scaleX(${chLocal})`;
        }

        setIdx((prev) => (prev !== next ? next : prev));
      },
    });

    return () => st.kill();
  }, []);

  // Reset underline bar when chapter index changes
  useEffect(() => {
    if (accentRef.current) accentRef.current.style.transform = 'scaleX(0)';
  }, [idx]);

  const ch = CHAPTERS[idx];

  return (
    <div ref={trackRef} className="relative bg-[#0f070b]" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0f070b]">

        {/* Ambient chapter glow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`glow-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(58% 58% at 74% 52%, ${ch.accent}1c 0%, transparent 68%)`,
            }}
          />
        </AnimatePresence>

        {/* Giant watermark number */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 select-none font-display text-white leading-none"
          style={{ fontSize: '32vw', bottom: '-0.05em', opacity: 0.045 }}
        >
          {ch.num}
        </span>

        {/* ── Left progress rail ── */}
        <div className="absolute left-6 top-0 bottom-0 hidden md:flex flex-col items-center py-14 z-30">
          <div className="relative flex-1 w-px bg-white/[0.10]">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 w-full"
              style={{ height: '0%', background: ch.accent, transition: 'background 0.7s' }}
            />
          </div>
          <div className="flex flex-col gap-3 mt-5">
            {CHAPTERS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === idx ? 1.7 : 1,
                  backgroundColor: i === idx ? ch.accent : 'rgba(255,255,255,0.18)',
                }}
                transition={{ duration: 0.4 }}
                className="h-1.5 w-1.5 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* ── Chapter content ── */}
        <div className="relative h-full flex flex-col justify-center pl-6 pr-5 md:pl-24 md:pr-10 max-w-[88rem] mx-auto">

          {/* Year · kicker · counter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`meta-${idx}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_IN } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.26 } }}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 md:mb-7"
            >
              <span className="font-code text-[11px] tracking-[0.45em] text-white/35 tabular-nums">
                {ch.year}
              </span>
              <span className="hidden h-px w-10 shrink-0 bg-white/[0.18] sm:block" />
              <span className="font-code text-[11px] tracking-widest" style={{ color: ch.accent }}>
                {ch.kicker}
              </span>
              <span className="ml-auto hidden sm:block font-code text-[11px] tracking-widest text-white/[0.18]">
                {ch.num}&thinsp;/&thinsp;0{CHAPTERS.length}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* ── Keyword reveal — slides up from below ── */}
          <div
            className="overflow-hidden relative"
            style={{ height: KW_H }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={`kw-${idx}`}
                initial={{ y: '104%' }}
                animate={{ y: '0%', transition: { duration: 0.74, ease: EASE_IN } }}
                exit={{ y: '-104%', transition: { duration: 0.44, ease: EASE_OUT } }}
                className="absolute bottom-[0.05em] inset-x-0 font-display text-[#fbeef4] whitespace-nowrap"
                style={{
                  fontSize: KW_FS,
                  lineHeight: '0.95',
                  textShadow: `0 0 120px ${ch.accent}28`,
                }}
              >
                {ch.keyword}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Accent underline — grows with scroll progress within the chapter */}
          <div className="relative mt-4 mb-6 md:mt-5 md:mb-9" style={{ height: '2px' }}>
            <div className="absolute inset-0 bg-white/[0.08]" />
            <div
              ref={accentRef}
              className="absolute inset-0 origin-left"
              style={{
                background: ch.accent,
                transform: 'scaleX(0)',
                transition: 'background 0.7s',
              }}
            />
          </div>

          {/* Body row: chapter text (cycles) sits beside the portrait (persistent) */}
          <div className="flex flex-row items-center gap-4 sm:gap-7 md:gap-12 lg:gap-16">

            {/* ── Left: body text + tags + code — re-animates each chapter ── */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`body-${idx}`}
                  initial={{ opacity: 0, y: 30, filter: 'blur(14px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.68, delay: 0.1, ease: EASE_IN } }}
                  exit={{ opacity: 0, y: -14, filter: 'blur(8px)', transition: { duration: 0.3 } }}
                  className="flex flex-col gap-5 md:gap-6"
                >
                  <p className="max-w-xl font-editorial text-base italic leading-snug text-white/[0.60] sm:text-xl md:text-[1.35rem]">
                    {ch.body}
                  </p>
                  {/* Skill / trait tags — coloridas, sobem em cascata ao aparecer */}
                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={TAGS_STAGGER}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  >
                    {ch.tags.map((tag) => {
                      const c = TAG_COLORS[tag] ?? ch.accent;
                      return (
                        <motion.span
                          key={tag}
                          variants={TAG_POP}
                          whileHover={{ y: -3, scale: 1.06 }}
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-code text-[10px] uppercase tracking-[0.25em]"
                          style={{
                            color: c,
                            borderColor: `${c}66`,
                            background: `${c}14`,
                            boxShadow: `0 6px 20px -10px ${c}80`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: c, boxShadow: `0 0 8px ${c}` }}
                          />
                          {tag}
                        </motion.span>
                      )
                    })}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Right: the reveal portrait — stays put as the chapters change ── */}
            {/* Mobile: a compact column beside the text. md+: sized by available
                viewport HEIGHT (not width) so it grows on tall screens yet never
                clips inside the pinned 100vh frame on short laptops. */}
            <figure className="m-0 w-[48%] max-w-[210px] shrink-0 sm:max-w-[250px] md:w-[min(420px,48vh)] md:max-w-none">
              <RevealSpotlight
                bwSrc={FOTO_PB}
                colorSrc={FOTO_COLOR}
                alt="Gabriely Bonfim Silva"
                hint="passe o mouse · arraste o dedo"
              />
              <figcaption className="mt-3 font-code text-[10px] uppercase tracking-[0.3em] text-white/30">
                preto &amp; branco&nbsp;&nbsp;⇄&nbsp;&nbsp;cor
              </figcaption>
            </figure>
          </div>

          {/* Scroll hint — first chapter only */}
          {idx === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.1, duration: 0.7 } }}
              className="absolute bottom-10 left-6 md:bottom-12 md:left-24 font-code text-[10px] uppercase tracking-[0.45em] text-white/[0.22]"
            >
              role para continuar
            </motion.p>
          )}
        </div>

        {/* Bottom fade into next section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f070b] to-transparent" />
      </div>
    </div>
  );
}
