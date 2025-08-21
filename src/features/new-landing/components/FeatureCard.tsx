interface FeatureCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export function FeatureCard({
  title,
  description,
  imageUrl,
}: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-3 pb-3 sm:gap-4 sm:pb-4">
      <div
        className="aspect-video w-full rounded-lg bg-cover bg-center bg-no-repeat sm:rounded-xl"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      ></div>
      <div className="flex flex-col gap-2">
        <p className="text-sm leading-normal font-medium text-[#0e151b] sm:text-base">
          {title}
        </p>
        <p className="text-xs leading-normal font-normal text-[#4e7997] sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
