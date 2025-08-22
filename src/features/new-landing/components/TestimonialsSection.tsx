const testimonials = [
  {
    id: 1,
    title: "ImpactTrack has revolutionized our data management.",
    description:
      "With ImpactTrack, we've streamlined our participant tracking, leading to more efficient program delivery and better outcomes.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCySqmkc8J_3MQtmfdFBXZlisjgs3flPbIGZ-eqW4T8bYyn0eA0_rj2niBcQYyE09MTOOA0l_dFWHa_ADROh0usleGk7f0N6wV_cdbyL8ZW3Dx4-m38aD6IrnEXMEG4nZEaOc7HTgDc70__IPq5MZbi7clGaZLUbHBpnmMe9Dp8LGUgadOmbYpEcNI4WZMSGp96zs_2LaCbf7LgjnY1ICfoqIAgYkhBzOQD-BpzTpfvaUjFXuivULRNv4wdGhJ8crYgQqyz-IzLBMwA",
  },
  {
    id: 2,
    title: "The training management features are a game-changer.",
    description:
      "We can now easily plan, schedule, and monitor our training programs, ensuring effective knowledge transfer and improved participant performance.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpuIXPw8jnZc2DJVljlXYgzQtwD1nvm95NoCd9_Rdz2cr73GVQl8N8jvBtTr_WXGr46KkurLSWGxxJua42hQ_9o1VHqV9j8ijEV-MLH8LmtoIYZsfYNIJFy2IPFnzSiW4jFqkqTGNOWjXdmIPSP6BSO9bE0Z67ldvp6AC7tLB1mKnlJWUO8JlzV41p3kRO67-J2pyBelTn4xCJjwj2vvGYvJkjTsK8TiERbQMhbxBwqRSXMcyR9buuoR2m0uuc5BjJ3vDqkshX4SeU",
  },
  {
    id: 3,
    title: "VSLA monitoring is now seamless and efficient.",
    description:
      "ImpactTrack's VSLA monitoring tools have made it incredibly easy to track group performance and promote financial inclusion in the communities we serve.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiW7qj9ZfAVgO7QXweTpBxA0BgU0qRgsdvDIskCJepJMT1P40eZnjRoUxYpQHAD-UdG3fxEJbEFbmoFd83OyNLwNoun5WdCjeWA9u72ip7sRqdRd1e9CTyU0FtmLqgPnTOlUteWWfmf-14EkSVmnM45v48dQViNWjs602nNEwYbRqrqkrGs25NngBpE__HsNdmn9zGmeGtTvlheiYbFN9w-Zfxl5IJIbiPx6T5yZPk9rBgTmdD6zd1pcDwX-ndAomuZ8NIqlsjF5zd",
  },
];

export function TestimonialsSection() {
  return (
    <div className="flex w-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="w-full max-w-7xl">
        <h2 className="pt-5 pb-3 text-lg leading-tight font-bold tracking-[-0.015em] text-[#0e151b] sm:text-xl md:text-[22px]">
          Client Testimonials
        </h2>
        <div className="scrollbar-hide flex overflow-x-auto">
          <div className="flex min-w-full items-stretch gap-3 pb-4 sm:gap-4">
            {testimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="flex min-w-[280px] flex-1 flex-col gap-3 rounded-lg sm:min-w-[320px] sm:gap-4 md:min-w-60"
              >
                <div
                  className="flex aspect-square w-full flex-col rounded-lg bg-cover bg-center bg-no-repeat sm:rounded-xl"
                  style={{ backgroundImage: `url("${testimonial.imageUrl}")` }}
                ></div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm leading-normal font-medium text-[#0e151b] sm:text-base">
                    {testimonial.title}
                  </p>
                  <p className="text-xs leading-relaxed font-normal text-[#4e7997] sm:text-sm">
                    {testimonial.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
