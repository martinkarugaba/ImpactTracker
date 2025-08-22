export function HeroSection() {
  return (
    <div className="@container flex w-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="w-full max-w-7xl">
        <div className="p-2 sm:p-4">
          <div
            className="flex min-h-[320px] flex-col items-start justify-end gap-4 rounded-lg bg-cover bg-center bg-no-repeat px-4 pb-6 sm:min-h-[400px] sm:gap-6 sm:rounded-xl sm:pb-8 md:min-h-[480px] md:pb-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAsu3nxk-CjyGBsxz4YXnXQ8j-oSUJb8cllloF2GzDP4BNsiVjlJdTsxyMh3ROEnoclcDwdNvrezudWJx9HRPjFvCOmBJIHeBIhjPQ_b60tOEz8lAmMC1GgT2SzzwvaFsWnICp4lhKGnTjKOP-Sp6yDUQfF5ZyGQYgZTLqYlXhHX5xeUdSMyjZCmP6BeeMAe83gd3CadI1W-rAkMn0r9ltmLVfuR5YaEns1QlY4jLbGob5yUIa_ZCdLpnr7Tnn_H31F_8cqyUbrdIg7")',
            }}
          >
            <div className="flex flex-col gap-2 text-left sm:gap-3">
              <h1 className="text-2xl leading-tight font-black tracking-[-0.033em] text-white sm:text-3xl md:text-4xl lg:text-5xl">
                Track Your Impact, Amplify Your Mission
              </h1>
              <h2 className="max-w-[600px] text-sm leading-relaxed font-normal text-white sm:text-base">
                Empower your non-profit with ImpactTrack, the all-in-one
                platform for participant tracking, training management, and VSLA
                monitoring. Gain insights, optimize programs, and demonstrate
                your impact.
              </h2>
            </div>
            <button className="flex h-10 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#1991e6] px-4 text-sm leading-normal font-bold tracking-[0.015em] text-slate-50 transition-colors hover:bg-[#1678c7] sm:h-12 sm:min-w-[140px] sm:px-6 sm:text-base">
              <span className="truncate">Get Started</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
