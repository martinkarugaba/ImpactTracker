const pricingPlans = [
  {
    id: 1,
    name: "Basic",
    price: "Free",
    period: "/month",
    buttonText: "Get Started",
    popular: false,
    features: ["Up to 100 participants", "Basic reporting", "Email support"],
  },
  {
    id: 2,
    name: "Standard",
    price: "$49",
    period: "/month",
    buttonText: "Choose Plan",
    popular: true,
    features: [
      "Up to 500 participants",
      "Advanced reporting",
      "Priority email support",
    ],
  },
  {
    id: 3,
    name: "Premium",
    price: "$99",
    period: "/month",
    buttonText: "Choose Plan",
    popular: false,
    features: [
      "Unlimited participants",
      "Custom reporting",
      "Dedicated support",
    ],
  },
];

export function PricingSection() {
  return (
    <>
      <h2 className="px-4 pt-5 pb-3 text-lg leading-tight font-bold tracking-[-0.015em] text-[#0e151b] sm:text-xl md:text-[22px]">
        Pricing
      </h2>
      <div className="grid grid-cols-1 gap-4 px-4 py-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {pricingPlans.map(plan => (
          <div
            key={plan.id}
            className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#d0dde7] bg-slate-50 p-4 sm:rounded-xl sm:p-6"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h1 className="text-sm leading-tight font-bold text-[#0e151b] sm:text-base">
                  {plan.name}
                </h1>
                {plan.popular && (
                  <p className="rounded-lg bg-[#1991e6] px-2 py-1 text-center text-xs leading-normal font-medium tracking-[0.015em] text-slate-50 sm:rounded-xl sm:px-3 sm:py-[3px]">
                    Most Popular
                  </p>
                )}
              </div>
              <p className="flex items-baseline gap-1 text-[#0e151b]">
                <span className="text-2xl leading-tight font-black tracking-[-0.033em] text-[#0e151b] sm:text-3xl md:text-4xl">
                  {plan.price}
                </span>
                <span className="text-sm leading-tight font-bold text-[#0e151b] sm:text-base">
                  {plan.period}
                </span>
              </p>
            </div>
            <button className="flex h-10 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#e7eef3] px-4 text-sm leading-normal font-bold tracking-[0.015em] text-[#0e151b] transition-colors hover:bg-[#d0dde7] sm:rounded-xl">
              <span className="truncate">{plan.buttonText}</span>
            </button>
            <div className="flex flex-col gap-2">
              {plan.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-2 text-xs leading-normal font-normal text-[#0e151b] sm:gap-3 sm:text-[13px]"
                >
                  <div
                    className="flex-shrink-0 text-[#0e151b]"
                    data-icon="Check"
                    data-size="20px"
                    data-weight="regular"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="sm:h-5 sm:w-5"
                    >
                      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
