type BrandLogoProps = {
  className?: string
  variant?: "black" | "white"
}

export function BrandLogo({ className, variant = "black" }: BrandLogoProps) {
  const fileName = variant === "white" ? "tropa-logo-white.png" : "tropa-logo-black.png"
  const classes = ["tropa-brand-logo", `tropa-brand-logo--${variant}`, className].filter(Boolean).join(" ")

  return (
    <img
      src={`/brand/${fileName}`}
      alt="Tropa"
      width={112}
      height={23}
      className={classes}
      decoding="async"
    />
  )
}
