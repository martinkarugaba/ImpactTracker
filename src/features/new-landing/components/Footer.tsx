export function Footer() {
  return (
    <footer className="flex justify-center">
      <div className="flex max-w-6xl flex-1 flex-col">
        <footer className="@container flex flex-col gap-4 px-4 py-6 text-center sm:gap-6 sm:px-5 sm:py-8 md:py-10">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 @[480px]:justify-around">
            <a
              className="min-w-32 text-sm leading-normal font-normal text-[#4e7997] transition-colors hover:text-[#1991e6] sm:min-w-40 sm:text-base"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="min-w-32 text-sm leading-normal font-normal text-[#4e7997] transition-colors hover:text-[#1991e6] sm:min-w-40 sm:text-base"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="min-w-32 text-sm leading-normal font-normal text-[#4e7997] transition-colors hover:text-[#1991e6] sm:min-w-40 sm:text-base"
              href="#"
            >
              Contact Us
            </a>
          </div>
          <p className="text-sm leading-normal font-normal text-[#4e7997] sm:text-base">
            © 2024 ImpactTrack. All rights reserved.
          </p>
        </footer>
      </div>
    </footer>
  );
}
