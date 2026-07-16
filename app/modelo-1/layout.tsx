import type { Metadata } from "next"
import "./hously.css"

export const metadata: Metadata = {
  title: "Hously — Modern Architecture Experience",
  description:
    "We design spaces that elevate living. A refined architectural experience where form, light, and intention meet.",
}

export default function Modelo1Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
