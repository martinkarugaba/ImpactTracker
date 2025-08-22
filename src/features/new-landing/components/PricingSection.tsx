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
    <div className="flex w-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="w-full max-w-7xl">
        <h2 className="pt-5 pb-4 text-[22px] leading-tight font-bold tracking-[-0.015em] text-[#0e151b]">
          Pricing Plans
        </h2>
        <div className="grid grid-cols-1 gap-4 pb-4 lg:grid-cols-3">
          {pricingPlans.map(plan => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-xl p-6 transition-colors ${
                plan.popular
                  ? "bg-[#0B4F82] text-white"
                  : "bg-[#e7eef3] text-[#0e151b]"
              }`}
            >
              <div className="text-center">
                <h3
                  className={`text-xl font-bold ${
                    plan.popular ? "text-white" : "text-[#0e151b]"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="py-4">
                  <span
                    className={`text-4xl font-bold ${
                      plan.popular ? "text-white" : "text-[#0e151b]"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-base ${
                      plan.popular ? "text-white/80" : "text-[#4e7997]"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 pb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        plan.popular ? "text-white" : "text-green-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={`text-sm leading-relaxed ${
                        plan.popular ? "text-white/90" : "text-[#4e7997]"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-xl px-4 py-3 font-medium transition-colors ${
                  plan.popular
                    ? "bg-white text-[#0B4F82] hover:bg-gray-100"
                    : "bg-[#0B4F82] text-white hover:bg-[#094068]"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
