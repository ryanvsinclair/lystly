import Link from "next/link";

const MARK = {
  white: "/brand/lystly-white.png",
  black: "/brand/lystly-black.png",
};

export function SiteLogo({ href = "/", className = "site-logo", tone = "auto" }) {
  return (
    <Link className={className} href={href} aria-label="Lystly">
      <span className="site-mark">
        {tone === "auto" ? (
          <>
            <img className="site-mark-on-dark" src={MARK.white} alt="" />
            <img className="site-mark-on-light" src={MARK.black} alt="" />
          </>
        ) : (
          <img src={MARK[tone] || MARK.white} alt="" />
        )}
      </span>
    </Link>
  );
}
