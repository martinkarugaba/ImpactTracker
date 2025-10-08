import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(221.2 83.2% 53.3%)", // Primary blue color
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
