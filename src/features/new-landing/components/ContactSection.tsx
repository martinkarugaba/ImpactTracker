export function ContactSection() {
  return (
    <>
      <h2 className="px-4 pt-5 pb-3 text-[22px] leading-tight font-bold tracking-[-0.015em] text-[#0e151b]">
        Contact Us
      </h2>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex min-w-40 flex-1 flex-col">
          <input
            placeholder="Your Email"
            className="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-[#e7eef3] p-4 text-base leading-normal font-normal text-[#0e151b] placeholder:text-[#4e7997] focus:border-none focus:ring-0 focus:outline-0"
            value=""
          />
        </label>
      </div>
      <div className="flex justify-start px-4 py-3">
        <button className="flex h-10 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#1991e6] px-4 text-sm leading-normal font-bold tracking-[0.015em] text-slate-50">
          <span className="truncate">Submit</span>
        </button>
      </div>
    </>
  );
}
