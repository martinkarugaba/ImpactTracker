const detailedFeatures = [
  {
    id: 1,
    title: "Participant Tracking",
    description:
      "Manage participant data, track progress, and generate reports. Gain a holistic view of your beneficiaries and their engagement.",
  },
  {
    id: 2,
    title: "Training Management",
    description:
      "Manage participant data, track progress, and generate reports. Gain a holistic view of your beneficiaries and their engagement.",
  },
  {
    id: 3,
    title: "VSLA Monitoring",
    description:
      "Manage participant data, track progress, and generate reports. Gain a holistic view of your beneficiaries and their engagement.",
  },
];

export function DetailedFeaturesSection() {
  return (
    <>
      <h2 className="px-4 pt-5 pb-3 text-[22px] leading-tight font-bold tracking-[-0.015em] text-[#0e151b]">
        Detailed Feature Breakdown
      </h2>
      <div className="flex flex-col gap-3 p-4">
        {detailedFeatures.map((feature, index) => (
          <details
            key={feature.id}
            className={`group flex flex-col rounded-xl bg-[#e7eef3] px-4 py-2 ${
              index === 0 ? "open" : ""
            }`}
            open={index === 0}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-sm leading-normal font-medium text-[#0e151b]">
                {feature.title}
              </p>
              <div
                className="text-[#0e151b] group-open:rotate-180"
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
            <p className="pb-2 text-sm leading-normal font-normal text-[#4e7997]">
              {feature.description}
            </p>
          </details>
        ))}
      </div>
    </>
  );
}
