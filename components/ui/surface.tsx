export function Surface({ children, elevation = "base", className = "" }: { children: React.ReactNode; elevation?: "base" | "raised" | "floating"; className?: string }) {
  return <section className={`ds-surface ds-surface--${elevation} ${className}`.trim()}>{children}</section>;
}
