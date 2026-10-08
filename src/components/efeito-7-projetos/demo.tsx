import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X, ExternalLink, Code2, Play, FileText } from "lucide-react";

// ── Project data ─────────────────────────────────────────────────────────────
interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  tags: string[];
  accentHex: string;
  featured?: boolean;
  liveUrl?: string;
  codeUrl?: string;
  docUrl?: string;
  demo?: { role: string; user: string; pass: string }[];
  scrubTitle: { top: string; bottom: string };
  frameCount: number;
  frameUrl: (i: number) => string;
}

// Adicione aqui os seus projetos (veja a interface Project acima) e reative a
// seção em src/App.jsx. Capas ficam em /public/projects/.
const PROJECTS: Project[] = [];

// ── Expanded Card ─────────────────────────────────────────────────────────────
// Componente expandido que usa layoutId para transição fluida a partir do card
function ExpandedProjectCard({
  project,
  onClose,
  onPlay,
}: {
  project: Project;
  onClose: () => void;
  onPlay: (project: Project) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevenir rolagem da página por baixo da modal (incluindo Lenis)
  useEffect(() => {
    // 1. Bloquear o scroll nativo
    document.body.style.overflow = "hidden";

    // 2. Prevenir eventos de wheel e touch que sobem para o window (essencial para parar o Lenis)
    const preventScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInsideScrollable = target.closest(".scrollable-modal-content");
      if (isInsideScrollable) {
        // Se estiver rolando dentro da modal, não impede a rolagem interna, mas para a propagação
        e.stopPropagation();
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    // Fechar ao pressionar Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
    >
      {/* Backdrop escuro com desfoque de alta fidelidade */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Container Principal Expandido com Layout Compartilhado */}
      <motion.div
        layoutId={`card-container-${project.id}`}
        className="relative w-full max-w-4xl bg-[#f3ebe6] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] z-10"
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Lado Esquerdo: Imagem Cover com efeito glow dinâmico */}
        <div className="relative w-full md:w-1/2 h-56 md:h-auto overflow-hidden">
          <motion.img
            layoutId={`card-image-${project.id}`}
            src={project.cover}
            alt={project.title}
            className="w-full h-full object-cover"
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Degradê cinematográfico para fundir com o fundo preto */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#f3ebe6] via-[#f3ebe6]/40 to-transparent" />
          
          {/* Ambient Glow com a cor de destaque do projeto */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${project.accentHex} 0%, transparent 60%)`,
            }}
          />
        </div>

        {/* Lado Direito: Detalhes do Projeto com Scrollbar Otimizada */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-hidden">
          
          {/* Div com scroll para o conteúdo de texto */}
          <div 
            data-lenis-prevent
            className="scrollable-modal-content overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <motion.h3
                  layoutId={`card-title-${project.id}`}
                  className="text-2xl md:text-3xl font-display text-white tracking-tight leading-tight"
                >
                  {project.title}
                </motion.h3>
                <motion.p
                  layoutId={`card-subtitle-${project.id}`}
                  className="text-sm font-code text-[#d9a1ae] mt-1"
                >
                  {project.subtitle}
                </motion.p>
              </div>

              {/* Botão de Fechar */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Linha colorida do tema */}
            <div
              className="h-[2px] w-12 my-6 rounded-full"
              style={{ backgroundColor: project.accentHex }}
            />

            {/* Descrição e detalhes técnicos */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-white/65 text-sm md:text-base leading-relaxed"
            >
              <p>
                {project.description}
              </p>
            </motion.div>

            {/* Lista de Tags */}
            <motion.div
              layoutId={`card-tags-${project.id}`}
              className="flex flex-wrap gap-2 mt-6"
            >
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-code border border-white/10 text-white/55 bg-white/[0.04]"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Acesso de demonstração — recrutador entra e explora a plataforma */}
            {project.demo && project.demo.length > 0 && (
              <div
                className="mt-6 rounded-xl border p-4"
                style={{ borderColor: `${project.accentHex}33`, background: `${project.accentHex}0d` }}
              >
                <div className="mb-3 flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.18em] text-[#d9a1ae]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.accentHex }} />
                  Acesso de demonstração — entre e explore
                </div>
                <div className="space-y-2">
                  {project.demo.map((d) => (
                    <div key={d.role} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-code text-xs">
                      <span className="text-white/40">{d.role}</span>
                      <span className="text-white/80 break-all select-all">{d.user}</span>
                      <span className="text-white/25">·</span>
                      <span className="text-white/55 break-all select-all">{d.pass}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-white/10"
          >
            {/* Botão de Transição Cinematográfica */}
            <button
              onClick={() => onPlay(project)}
              className="cta-sheen relative group w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-code text-xs font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-95"
              style={{
                backgroundColor: project.accentHex,
                boxShadow: `0 8px 30px ${project.accentHex}30`,
              }}
            >
              <Play className="h-3.5 w-3.5 fill-white animate-pulse" />
              <span>
                {project.liveUrl
                  ? "VER PROJETO AO VIVO"
                  : project.docUrl
                    ? "VER DOCUMENTO DO PROJETO"
                    : "DEMO EM BREVE"}
              </span>
              
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>

            {/* Links de navegação externa */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              {project.codeUrl && (
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-code"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Code2 className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-code"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
              {project.docUrl && (
                <a
                  href={project.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-code"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-4 w-4" />
                  Documento
                </a>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// ── Card Compacto ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  // Scroll-driven entrance: the card grows + fades in as it rises into view.
  // Lives on a WRAPPER (not the layoutId article) so the expand projection
  // never fights the scroll transform.
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "center 62%"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);

  return (
    <motion.div ref={wrapRef} style={{ scale, opacity }} className="will-change-transform">
    <motion.article
      layoutId={`card-container-${project.id}`}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-[#f3ebe6] border ${
        project.featured ? "border-[#b86b7e]/40" : "border-white/[0.07]"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Abrir projeto ${project.title}`}
    >
      {/* Imagem de Capa */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          layoutId={`card-image-${project.id}`}
          src={project.cover}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f3ebe6] via-[#f3ebe6]/20 to-transparent" />

        {/* Selo de destaque — só nos melhores projetos */}
        {project.featured && (
          <div
            className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-code text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
            style={{
              color: "#bcd2ff",
              borderColor: `${project.accentHex}55`,
              background: `${project.accentHex}1f`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.accentHex }} />
            Destaque
          </div>
        )}
        
        {/* Glow temático no hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${project.accentHex} 0%, transparent 70%)` }}
        />

        {/* Ícone de Play centralizado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ebe6]/70 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
          >
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="relative p-5">
        {/* Detalhe superior colorido */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${project.accentHex}66, transparent)` }}
        />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <motion.h3 
              layoutId={`card-title-${project.id}`}
              className="text-lg font-bold text-white leading-tight"
            >
              {project.title}
            </motion.h3>
            <motion.p 
              layoutId={`card-subtitle-${project.id}`}
              className="text-xs text-[#d9a1ae] font-code mt-0.5"
            >
              {project.subtitle}
            </motion.p>
          </div>
          <div className="flex gap-2 shrink-0 mt-0.5">
            {project.codeUrl && (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ver código"
              >
                <Code2 className="h-3.5 w-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ver site ao vivo"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {project.docUrl && (
              <a
                href={project.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ver documento do projeto"
              >
                <FileText className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Resumo/Descrição */}
        <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <motion.div 
          layoutId={`card-tags-${project.id}`}
          className="flex flex-wrap gap-1.5 mb-4"
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-code border border-white/10 text-white/50 bg-white/[0.03]"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <div className="flex items-center gap-2 text-[10px] text-white/40 group-hover:text-[#d9a1ae] transition-colors duration-300 font-code">
          <Play className="h-2.5 w-2.5" />
          <span>Ver detalhes do projeto</span>
        </div>
      </div>
    </motion.article>
    </motion.div>
  );
}

// ── Seção Principal ────────────────────────────────────────────────────────────
export default function ProjetosHeroScrub() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [transitionProject, setTransitionProject] = useState<Project | null>(null);
  const [fallbackProject, setFallbackProject] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Click → open the REAL project. The cinematic overlay plays as a quick
  // flourish while the live site opens in a NEW TAB, so the recruiter keeps the
  // portfolio open and can actually browse the project.
  const handlePlay = (project: Project) => {
    // Live site when there is one; otherwise the project document (e.g. the GS).
    const url = project.liveUrl ?? project.docUrl;
    if (!url) {
      // Nothing public to open yet → graceful note instead.
      setFallbackProject(project.title);
      return;
    }
    // window.open runs INSIDE the click gesture → never popup-blocked.
    const win = window.open(url, "_blank", "noopener,noreferrer");
    setTransitionProject(project); // brief cinematic flourish
    if (!win) {
      // If a browser still blocks the popup, fall back to a same-tab redirect
      // so the user always reaches the project.
      setTimeout(() => {
        window.location.href = url;
      }, 900);
    }
  };

  // The overlay dismisses itself once its reveal finishes (the tab is already
  // open). No next/router here — this is a Vite SPA and the live project is an
  // external URL, so we open it directly instead of routing to an internal page.
  const endTransition = () => {
    setTransitionProject(null);
    setActiveProject(null);
  };

  return (
    <section className="w-full bg-[#faf6f2] px-5 py-16 sm:px-6 sm:py-20">
      {/* Notificador de Transição de Rota (Simulação local) */}
      <AnimatePresence>
        {fallbackProject && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 left-6 z-[100001] bg-[#f3ebe6] border border-[#b86b7e]/40 px-6 py-4 rounded-2xl shadow-xl flex flex-col gap-1 sm:left-auto sm:max-w-sm"
          >
            <div className="flex items-center gap-2 text-[#d9a1ae] text-[10px] font-code font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b86b7e] animate-ping" />
              DEMO AO VIVO EM BREVE
            </div>
            <p className="text-white text-sm font-medium mt-1">
              O demo de <span className="font-code text-[#c9a99a]">{fallbackProject}</span> ainda está sendo preparado.
            </p>
            <p className="text-white/50 text-[11px] leading-normal mt-1">
              Enquanto isso, role o card aberto para ver os detalhes técnicos do projeto.
            </p>
            <button
              onClick={() => setFallbackProject(null)}
              className="mt-3 text-left text-xs text-white/40 hover:text-white transition-colors underline font-code w-fit"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de Transição Cinematográfica Fullscreen */}
      <AnimatePresence>
        {transitionProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Efeito Zoom e Blur no conteúdo de transição */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              // ⬇️ The reveal finishing IS the cue to navigate — this is the
              // "await the animation, then route" handoff (no setTimeout guess).
              onAnimationComplete={endTransition}
              className="text-center px-6 z-10"
            >
              <span className="font-code text-xs uppercase tracking-[0.45em] text-[#d9a1ae] block mb-4 animate-pulse">
                {transitionProject.liveUrl ? "Abrindo projeto ao vivo" : "Abrindo documento do projeto"}
              </span>
              <h1 className="font-display text-4xl md:text-6xl text-white tracking-tight mb-2">
                {transitionProject.title}
              </h1>
              <p className="text-white/50 font-code text-sm max-w-md mx-auto">
                {transitionProject.subtitle}
              </p>

              {/* Barra de progresso linear ambientada */}
              <div className="w-48 h-[1px] bg-white/10 mx-auto mt-8 relative overflow-hidden rounded-full border border-white/10">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#b86b7e] to-transparent"
                />
              </div>
            </motion.div>

            {/* Grid de linhas cinemáticas e Glow focal */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${transitionProject.accentHex} 0%, transparent 60%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Headline cinemática — fica FIXA no topo da seção enquanto os cards
          deslizam por trás (sticky + backdrop-blur). */}
      <div className="relative z-20 mx-auto mb-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-[#faf6f2]/80 px-5 py-5 backdrop-blur-md sm:px-7 sm:py-6"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#b86b7e]/25 bg-[#b86b7e]/10 px-3 py-1 font-code text-[11px] text-[#d9a1ae]">
            <Play className="h-3 w-3 fill-none" />
            Casos selecionados
          </div>
          <h2
            className="font-display tracking-tight text-white"
            style={{ fontSize: "clamp(1.35rem, 4.6vw, 2.5rem)", lineHeight: 1.06 }}
          >
            Projetos reais — de clientes{" "}
            <span className="text-[#c9a99a]">a desafios da faculdade.</span>
          </h2>
        </motion.div>
      </div>

      {/* Grade de Projetos — destaques primeiro, depois os demais */}
      <div className="max-w-5xl mx-auto">
        {/* Em destaque */}
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-[#b86b7e]" />
          <span className="font-code text-[11px] uppercase tracking-[0.3em] text-[#d9a1ae]">
            Em destaque
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.filter((p) => p.featured).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setActiveProject(project)}
            />
          ))}
        </div>

        {/* Mais projetos */}
        <div className="mt-16 mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-white/20" />
          <span className="font-code text-[11px] uppercase tracking-[0.3em] text-white/45">
            Mais projetos — clientes & FIAP
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.filter((p) => !p.featured).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setActiveProject(project)}
            />
          ))}
        </div>
      </div>

      {/* Detalhes Expandidos (Modal com Shared Layout) */}
      <AnimatePresence>
        {activeProject && (
          <ExpandedProjectCard
            key={activeProject.id}
            project={activeProject}
            onClose={handleClose}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
