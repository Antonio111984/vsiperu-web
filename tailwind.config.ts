import type { Config } from "tailwindcss";

/**
 * Paleta y escalas de VSI. Los breakpoints `w****` son max-width:
 * replican exactamente los cortes del diseño original (1180 → 380).
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        azul: "#083B7A",
        "azul-osc": "#052B59",
        "azul-cl": "#0A4788",
        naranja: "#E47A24",
        "naranja-osc": "#CF6A18",
        wa: "#25D366",
        "wa-osc": "#1EB857",
        gris: "#F5F7FA",
        "gris-2": "#F9FAFC",
        "gris-3": "#F7F9FC",
        linea: "#E3E8EF",
        "linea-2": "#EDF1F6",
        texto: "#12233B",
        "texto-2": "#55637A",
        "texto-3": "#8494AB",
        "azul-tile": "#0A2F5C",
      },
      fontFamily: {
        head: ["var(--font-head)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1240px",
      },
      screens: {
        w1180: { max: "1180px" },
        w1024: { max: "1024px" },
        w900: { max: "900px" },
        w760: { max: "760px" },
        w640: { max: "640px" },
        w520: { max: "520px" },
        w380: { max: "380px" },
      },
      boxShadow: {
        header: "0 2px 18px rgba(8,59,122,.09)",
        cta: "0 8px 22px rgba(228,122,36,.28)",
        "cta-lg": "0 10px 26px rgba(228,122,36,.34)",
        "cta-sm": "0 6px 16px rgba(228,122,36,.28)",
        "wa-btn": "0 10px 26px rgba(37,211,102,.3)",
        "wa-modal": "0 10px 26px rgba(37,211,102,.32)",
        "wa-float": "0 10px 26px rgba(37,211,102,.42)",
        note: "0 18px 40px rgba(5,43,89,.32)",
        icon: "0 4px 16px rgba(5,43,89,.16)",
        menu: "0 18px 40px rgba(5,43,89,.18)",
        card: "0 10px 34px rgba(5,43,89,.07)",
        form: "0 30px 70px rgba(0,0,0,.28)",
        modal: "0 30px 80px rgba(0,0,0,.4)",
        avatar: "0 20px 50px rgba(0,0,0,.3)",
        "form-btn": "0 10px 24px rgba(228,122,36,.3)",
      },
      keyframes: {
        waPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37,211,102,.55)" },
          "50%": { boxShadow: "0 0 0 14px rgba(37,211,102,0)" },
        },
      },
      animation: {
        "wa-pulse": "waPulse 2.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
