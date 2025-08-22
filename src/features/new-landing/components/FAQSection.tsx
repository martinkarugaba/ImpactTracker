const faqs = [
  {
    id: 1,
    question: "What is ImpactTrack?",
    answer:
      "ImpactTrack is an all-in-one platform designed for non-profits to manage participant tracking, training programs, and VSLA monitoring, helping them gain insights, optimize programs, and demonstrate their impact.",
  },
  {
    id: 2,
    question: "How does ImpactTrack help with participant tracking?",
    answer:
      "ImpactTrack is an all-in-one platform designed for non-profits to manage participant tracking, training programs, and VSLA monitoring, helping them gain insights, optimize programs, and demonstrate their impact.",
  },
  {
    id: 3,
    question: "Is there a free trial available?",
    answer:
      "ImpactTrack is an all-in-one platform designed for non-profits to manage participant tracking, training programs, and VSLA monitoring, helping them gain insights, optimize programs, and demonstrate their impact.",
  },
];

export function FAQSection() {
  return (
    <div className="flex w-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="w-full max-w-7xl">
        <h2 className="pt-5 pb-3 text-[22px] leading-tight font-bold tracking-[-0.015em] text-[#0e151b]">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3 pb-4">
          {faqs.map((faq, index) => (
            <details
              key={faq.id}
              className={`group flex flex-col rounded-xl bg-[#e7eef3] px-4 py-2 transition-all duration-300 ease-in-out hover:bg-[#dde7f0] ${
                index === 0 ? "open" : ""
              }`}
              open={index === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 transition-colors duration-200 hover:text-[#1678c7]">
                <p className="text-sm leading-normal font-medium text-[#0e151b]">
                  {faq.question}
                </p>
                <div
                  className="text-[#0e151b] transition-transform duration-300 ease-in-out group-open:rotate-180"
                  data-icon="CaretDown"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
              </summary>
              <div className="overflow-hidden transition-all duration-300 ease-in-out">
                <p className="animate-in slide-in-from-top-2 pb-2 text-sm leading-relaxed font-normal text-[#4e7997] duration-300">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
