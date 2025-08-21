export function CTASection() {
  return (
    <div className="@container">
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-10 text-center @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
        <div className="flex max-w-[720px] flex-col gap-4">
          <h1 className="tracking-light text-[32px] leading-tight font-bold text-[#0e151b] @[480px]:text-4xl @[480px]:leading-tight @[480px]:font-black @[480px]:tracking-[-0.033em]">
            See ImpactTrack in Action
          </h1>
          <p className="text-base leading-normal font-normal text-[#0e151b]">
            Schedule a personalized demo to explore how ImpactTrack can
            transform your non-profit's operations.
          </p>
        </div>
        <div className="flex justify-center">
          <button className="flex h-10 min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#1991e6] px-6 text-sm leading-normal font-bold tracking-[0.015em] text-slate-50 transition-colors hover:bg-[#1678c7] @[480px]:h-12 @[480px]:px-8 @[480px]:text-base @[480px]:leading-normal @[480px]:font-bold @[480px]:tracking-[0.015em]">
            <span className="truncate">Request a Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
