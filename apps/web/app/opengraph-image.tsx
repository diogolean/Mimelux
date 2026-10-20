import { ImageResponse } from "next/og";

export const alt = "Patrocino — perto de quem inspira";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stem =
  "M7 5.2h9.4c4.35 0 7.15 2.55 7.15 6.35s-2.8 6.35-7.15 6.35H11.35V26.8H7V5.2zm4.35 3.35v6h4.85c1.95 0 3.15-1.1 3.15-2.95s-1.2-2.95-3.15-2.95H11.35z";
const heart =
  "M23.5 18.35c.98-1.22 2.9-1.26 3.9-.04.78.94.82 2.28.12 3.24L23.5 26.05l-4.02-4.5c-.7-.96-.66-2.3.12-3.24 1-1.22 2.92-1.18 3.9.04z";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#0C0D14",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 168,
            height: 168,
            borderRadius: 40,
            background: "#F6F4FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 48,
          }}
        >
          <svg width="116" height="116" viewBox="0 0 32 32">
            <path fill="#181725" fillRule="evenodd" d={stem} />
            <path fill="#62D4C8" d={heart} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, letterSpacing: -4, color: "#F6F4FF" }}>
            <span style={{ fontWeight: 500 }}>Patro</span>
            <span style={{ fontWeight: 600, color: "#C0B5FF" }}>cino</span>
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 32, color: "#AAA7B8" }}>
            perto de quem inspira
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 22, letterSpacing: 4, color: "#62D4C8" }}>
            PATROCINO.COM
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
