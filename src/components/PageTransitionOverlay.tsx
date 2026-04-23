type PageTransitionOverlayProps = {
  visible: boolean;
  label?: string;
};

export default function PageTransitionOverlay({
  visible,
  label = "Competition workspace",
}: PageTransitionOverlayProps) {
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-50 grid place-items-center bg-stone-100 px-6 text-stone-950 transition duration-300 ease-out ${
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <section className="splash-enter flex w-full max-w-sm flex-col items-center text-center">
        <div className="splash-mark grid h-14 w-14 place-items-center rounded-md bg-stone-950 text-lg font-semibold text-white shadow-[0_18px_60px_rgba(28,25,23,0.12)]">
          AI
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-normal">
          AI 竞品分析工具
        </h1>
        <p className="mt-2 text-sm text-stone-500">{label}</p>
        <div
          aria-label="Loading next workspace"
          role="progressbar"
          className="mt-8 h-px w-44 overflow-hidden bg-stone-300"
        >
          <div className="splash-progress h-full origin-left bg-stone-950" />
        </div>
      </section>
    </div>
  );
}
