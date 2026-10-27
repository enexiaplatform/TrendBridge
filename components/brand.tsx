export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="brand" style={{ color: inverse ? "white" : undefined }}>
      <span className="brand-mark" aria-hidden><i /><i /><i /></span>
      <span>TrendBridge <small style={{ fontWeight: 500, opacity: .58 }}>AI</small></span>
    </span>
  );
}
