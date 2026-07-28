export function BlogCover({
  src,
  alt,
  size = "card",
}: {
  src: string
  alt: string
  size?: "card" | "hero"
}) {
  return (
    <div className={`blog-cover blog-cover--${size}`}>
      <img src={src} alt={alt} loading={size === "hero" ? "eager" : "lazy"} />
    </div>
  )
}
