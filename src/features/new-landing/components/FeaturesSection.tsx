import { FeatureCard } from "./FeatureCard";

const features = [
  {
    id: 1,
    title: "Participant Tracking",
    description:
      "Easily manage participant data, track progress, and generate reports. Gain a holistic view of your beneficiaries and their engagement.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbyLvrQUEqzWL7PeKm2l845IvM14wTzw0isCixEl-Y4o8cstQJB6pJvIts1pQeAVXF0emUEztUXA8oQvzok2cErTmY9H3BCoita6AwzoCbxmRWymoSr_H2ApXsqsAc__hsD7Fbcee43BTr_BmmScLx-HGGxeZQmtcPOl9sMIn_KRd-QUOlBwnX86uiQbIXClO8uukuUd9MMRIp0chjUy6s99Z9UyNvz5HugNnTgRXMP6n9OVgb8XLnGPnyIBOp5LoWLDvlzTmNUYDd",
  },
  {
    id: 2,
    title: "Training Management",
    description:
      "Plan, schedule, and monitor training programs. Track attendance, assess participant performance, and ensure effective knowledge transfer.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDK2mUpRq0Lw7TXN0JikTo7pM6Tn57_yEYoycvDoyGxCMIdNwPQwwfiucDeQiLP-ydSDCEYTQEOj4EKKR_L7B5w9W9FqEFxOE89e2VLx_tASVfL_h5K8yw0Po6BKOaiaHkNsAc6SlO34IuXwv5AGKgjJAERYSLxQz3t7vsJ0JcKbdogCKcZufgk_TMn0jJKE3-ctt01r6givzZlnmO08UOugvwpnAeBUFmBeWVnE6sFT_dokXIvYwo6Sqqbbob-eQbiIQ1M0dBx5xhx",
  },
  {
    id: 3,
    title: "VSLA Monitoring",
    description:
      "Monitor Village Savings and Loan Associations (VSLAs) with ease. Track group performance, manage transactions, and promote financial inclusion.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAM1_my4BOsxO0XKnFr-ytpbpe10RNc8KI38JBm0cfQ3rTh6-x0c7cXZqkdv8DKmThRByyRuk9dE67Mg4VkeU0eWCOfJ7YTpwz_0bVuPVyOCCpRNVPalnDZBYTIkblM1B0RENZyYLETZ6FENVloTvqO_HHTHCHwWXv6VfXl_6mdfvxMpKeKwNZ9yrWY28hQiKv9coI8-4Zp44JMFk3t-f3nUP2vDeM7FG23HVvS4CaTZgbUZzXVUkl1LZa9DD4SdDW12XmcV3OM3Os3",
  },
];

export function FeaturesSection() {
  return (
    <div className="@container flex w-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8 md:gap-10 md:py-10">
          <div className="flex flex-col gap-3 sm:gap-4">
            <h1 className="tracking-light max-w-[720px] text-2xl leading-tight font-bold text-[#0e151b] sm:text-3xl md:text-4xl">
              Key Features
            </h1>
            <p className="max-w-[720px] text-sm leading-relaxed font-normal text-[#0e151b] sm:text-base">
              ImpactTrack offers a comprehensive suite of tools to streamline
              your operations and maximize your impact.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map(feature => (
              <FeatureCard key={feature.id} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
