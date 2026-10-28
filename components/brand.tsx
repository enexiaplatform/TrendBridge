export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand brand-official ${inverse ? "brand-inverse" : ""}`} role="img" aria-label="TrendBridge">
      <span className="brand-symbol" aria-hidden />
      <span className="brand-wordmark" aria-hidden />
    </span>
  );
}
