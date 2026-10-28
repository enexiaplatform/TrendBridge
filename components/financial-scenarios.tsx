"use client";
import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { PublicRun } from "@/lib/research/report";
import { money } from "@/lib/global";
import { scenarioKeys, scenarioSchema, scenarioSnapshot, scenarioValues, type Scenario } from "@/lib/research/scenarios";
import { useLocale } from "./locale";

export function FinancialScenarios({ run, onSaved }: { run: PublicRun; onSaved: (run: PublicRun) => void }) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [fields, setFields] = useState(() => toFields(scenarioValues(run.input)));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const scenarios = run.scenarios ?? [];
  const format = (value: number | null) => money(value, run.input.currency, run.input.language === "vi" ? "vi-VN" : "en-US");
  const values = Object.fromEntries(scenarioKeys.map(key => [key, fields[key].trim() === "" ? null : Number(fields[key]) / (key === "platformFeeRate" ? 100 : 1)]));
  const parsed = scenarioSchema.safeParse({ id: editing ?? "00000000-0000-4000-8000-000000000000", name: name || "Draft", notes, values });
  let draft = null;
  try { if (parsed.success) draft = scenarioSnapshot(run.input, parsed.data).financials; } catch { /* Incomplete FX or invalid values stay unknown. */ }
  const rows = [
    { id: "baseline", name: t("Original inputs", "Đầu vào gốc"), notes: "", values: scenarioValues(run.input), financials: run.snapshot.financials },
    ...scenarios.map(s => ({ ...s, financials: scenarioSnapshot(run.input, s).financials })),
  ];
  const max = Math.max(1, ...rows.map(row => Math.abs(row.financials?.contributionProfit ?? 0)));
  const labels = {
    sellingPrice: t("Selling price", "Giá bán"), purchaseCost: t("Purchase cost", "Giá mua"),
    logistics: t("Shipping & fulfillment", "Vận chuyển & xử lý"), advertising: t("Acquisition cost / order", "Chi phí quảng cáo / đơn"),
    platformFeeRate: t("Platform fee (%)", "Phí nền tảng (%)"), fxRate: t("FX: selling per purchase currency", "Tỷ giá: tiền bán / tiền mua"),
  };
  function edit(scenario?: Scenario) {
    setEditing(scenario?.id ?? null); setName(scenario?.name ?? ""); setNotes(scenario?.notes ?? "");
    setFields(toFields(scenario?.values ?? scenarioValues(run.input))); setError(""); setMessage("");
  }
  async function persist(remove?: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = remove ? { id: remove, expectedUpdatedAt: run.updatedAt } : { id: editing ?? crypto.randomUUID(), name, notes, values, expectedUpdatedAt: run.updatedAt };
      const response = await fetch(`/api/research/${run.id}/scenarios`, { method: remove ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSaved(result); edit(); setMessage(remove ? t("Scenario removed.", "Đã xóa kịch bản.") : t("Scenario saved. It is now included in unlocked report exports.", "Đã lưu. Kịch bản sẽ có trong file xuất của báo cáo đã mở khóa."));
    } catch (e) { setError(e instanceof Error ? e.message : t("Could not save.", "Chưa thể lưu.")); }
    finally { setBusy(false); }
  }
  return <section className="panel panel-pad scenario-workspace" aria-labelledby="scenario-title">
    <div className="panel-title"><div><span className="report-eyebrow">{t("DECISION TOOLS", "CÔNG CỤ RA QUYẾT ĐỊNH")}</span><h2 id="scenario-title">{t("Compare your assumptions", "So sánh các giả định")}</h2><p>{t("Save up to five scenarios. All figures use your inputs; they are not market forecasts.", "Lưu tối đa 5 kịch bản. Mọi con số dùng đầu vào của bạn, chưa phải dự báo thị trường.")}</p></div><button className="btn btn-outline" type="button" onClick={() => edit()} disabled={busy}><Plus size={15}/>{t("New scenario", "Kịch bản mới")}</button></div>
    <div className="scenario-layout"><form onSubmit={e => { e.preventDefault(); void persist(); }} className="scenario-editor">
      <div className="field"><label htmlFor="scenario-name">{t("Scenario name", "Tên kịch bản")}</label><input id="scenario-name" required maxLength={60} value={name} placeholder={t("e.g. Higher acquisition cost", "VD: Chi phí quảng cáo tăng")} onChange={e => setName(e.target.value)}/></div>
      <div className="scenario-fields">{scenarioKeys.filter(key => key !== "fxRate" || run.input.costCurrency !== run.input.currency).map(key => <div className="field" key={key}><label htmlFor={`saved-${key}`}>{labels[key]} {key === "purchaseCost" ? `(${run.input.costCurrency})` : key === "platformFeeRate" || key === "fxRate" ? "" : `(${run.input.currency})`}</label><input id={`saved-${key}`} type="number" min={key === "fxRate" ? "0.000000001" : "0"} max={key === "platformFeeRate" ? "99" : key === "fxRate" ? "1000000000" : "1000000000000"} step="any" value={fields[key]} placeholder={t("Unknown", "Chưa biết")} onChange={e => setFields(current => ({ ...current, [key]: e.target.value }))}/></div>)}</div>
      <div className="field"><label htmlFor="scenario-notes">{t("Assumption & rationale", "Giả định & căn cứ")}</label><textarea id="scenario-notes" maxLength={500} rows={2} value={notes} placeholder={t("Why are these inputs different?", "Vì sao đầu vào này khác?")} onChange={e => setNotes(e.target.value)}/></div>
      <div className="scenario-draft"><span>{t("Draft contribution / unit", "Lợi nhuận nháp / sản phẩm")}</span><strong>{format(draft?.contributionProfit ?? null)}</strong></div>
      <p className="ds-note">{t("Blank means unknown. Currency and product scope follow the original report. Taxes, returns, packaging and fixed costs are excluded unless entered in costs.", "Để trống là chưa biết. Tiền tệ và phạm vi theo báo cáo gốc. Chưa gồm thuế, hoàn hàng, bao bì và chi phí cố định trừ khi đã nhập vào chi phí.")}</p>
      <button className="btn btn-primary" disabled={busy || run.id === "sample" || (!editing && scenarios.length >= 5)}><Save size={15}/>{busy ? t("Saving…", "Đang lưu…") : editing ? t("Save changes", "Lưu thay đổi") : t("Save scenario", "Lưu kịch bản")}</button>
      {run.id === "sample" && <p className="ds-note">{t("This is a public sample. Start your own research to save scenarios.", "Đây là mẫu công khai. Tạo nghiên cứu riêng để lưu kịch bản.")}</p>}
      {error && <p role="alert" className="notice">{error} <button className="btn btn-outline" type="button" onClick={() => window.location.reload()}>{t("Reload report", "Tải lại báo cáo")}</button></p>}
      {message && <p role="status" className="scenario-status">{message}</p>}
    </form><div className="scenario-comparison">
      <h3>{t("Contribution per unit", "Lợi nhuận trên sản phẩm")}</h3><p className="ds-note">{t("Saved scenarios only · zero is the center line", "Chỉ các kịch bản đã lưu · đường giữa là 0")}</p>
      <div className="scenario-chart" role="img" aria-label={t("Contribution comparison; exact figures in the table below", "So sánh lợi nhuận; số cụ thể trong bảng bên dưới")}>{rows.map(row => { const profit = row.financials?.contributionProfit; return <div className="scenario-chart-row" key={row.id}><span>{row.name}</span><div className="scenario-track"><i className={profit !== undefined && profit < 0 ? "negative" : "positive"} style={{ width: `${Math.abs(profit ?? 0) / max * 50}%`, left: profit !== undefined && profit < 0 ? `${50 - Math.abs(profit) / max * 50}%` : "50%" }}/></div><strong>{format(profit ?? null)}</strong></div>; })}</div>
      <div className="scenario-table-wrap"><table className="research-table"><caption>{t("Saved assumptions and modeled outcomes", "Giả định đã lưu và kết quả tính toán")}</caption><thead><tr><th>{t("Scenario", "Kịch bản")}</th><th>{t("Price", "Giá bán")}</th><th>{t("Contribution", "Lợi nhuận")}</th><th>{t("Margin", "Biên")}</th><th>{t("Break-even", "Hòa vốn")}</th><th>{t("Actions", "Thao tác")}</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><strong>{row.name}</strong><small>{row.notes}</small></td><td>{format(row.values.sellingPrice)}</td><td>{format(row.financials?.contributionProfit ?? null)}</td><td>{row.financials ? `${(row.financials.contributionMargin * 100).toFixed(2)}%` : "—"}</td><td>{format(row.financials?.breakEvenPrice ?? null)}</td><td>{row.id === "baseline" ? "—" : <div className="actions"><button type="button" className="btn btn-outline" disabled={busy} onClick={() => edit(row)}>{t("Edit", "Sửa")}</button><button type="button" className="btn btn-outline" disabled={busy} aria-label={`${t("Remove", "Xóa")} ${row.name}`} onClick={() => void persist(row.id)}><Trash2 size={14}/></button></div>}</td></tr>)}</tbody></table></div>
    </div></div>
  </section>;
}
function toFields(values: Scenario["values"]) {
  return Object.fromEntries(scenarioKeys.map(key => [key, values[key] === null ? "" : String(values[key]! * (key === "platformFeeRate" ? 100 : 1))])) as Record<typeof scenarioKeys[number], string>;
}
