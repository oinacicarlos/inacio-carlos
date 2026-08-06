type BrandLogoProps = {
  className?: string
  variant?: "black" | "white"
}

export function BrandLogo({ className, variant = "black" }: BrandLogoProps) {
  const classes = ["tropa-brand-logo", `tropa-brand-logo--${variant}`, className].filter(Boolean).join(" ")

  return <span className={classes}>Tropa</span>
}
