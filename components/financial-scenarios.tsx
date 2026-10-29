"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import type { PublicRun } from "@/lib/research/report";
import { money } from "@/lib/global";
import { scenarioKeys, scenarioSchema, scenarioSnapshot, scenarioValues, type Scenario } from "@/lib/research/scenarios";
import { useLocale } from "./locale";

const ContributionChart = dynamic(() => import("./contribution-chart"), { ssr: false, loading: () => <div className="wb-chart-loading" aria-hidden="true"/> });
export function FinancialScenarios({ run, onSaved, onNext, active = true }: { run: PublicRun; onSaved: (run: PublicRun) => void; onNext: () => void; active?: boolean }) {
  const { t, language } = useLocale();
  const scenarios = run.scenarios ?? [];
  const initial = run.id === "sample" ? scenarios[0] : undefined;
  const [editing, setEditing] = useState<string | null>(initial?.id ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [fields, setFields] = useState(() => toFields(initial?.values ?? scenarioValues(run.input)));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const format = (value: number | null) => money(value, run.input.currency, language === "vi" ? "vi-VN" : "en-US");
  const percent = (value: number) => new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const values = Object.fromEntries(scenarioKeys.map(key => [key, fields[key].trim() === "" ? null : Number(fields[key]) / (key === "platformFeeRate" ? 100 : 1)]));
  const displayValues = Object.fromEntries(scenarioKeys.map(key => { const value = values[key]; const max = key === "platformFeeRate" ? .99 : key === "fxRate" ? 1e9 : 1e12; return [key, value === null || !Number.isFinite(value) || value < 0 || value > max || (key === "fxRate" && value === 0) ? null : value]; })) as Scenario["values"];
  const parsed = scenarioSchema.safeParse({ id: editing ?? "00000000-0000-4000-8000-000000000000", name: name.trim() || t("New scenario", "Kịch bản mới"), notes, values });
  let draft = null;
  try { if (parsed.success) draft = scenarioSnapshot(run.input, parsed.data).financials; } catch { /* Missing FX stays unknown. */ }
  const selected = scenarios.find(s => s.id === editing);
  const original = selected?.values ?? scenarioValues(run.input);
  const dirty = scenarioKeys.some(key => values[key] !== original[key]) || name !== (selected?.name ?? "") || notes !== (selected?.notes ?? "");
  const rows = [
    { id: "baseline", name: t("Original inputs", "Đầu vào gốc"), values: scenarioValues(run.input), financials: run.snapshot.financials, draft: false },
    ...scenarios.filter(s => !(dirty && s.id === editing)).map(s => ({ ...s, financials: scenarioSnapshot(run.input, s).financials, draft: false })),
    ...(dirty ? [{ id: "draft", name: name.trim() || t("New scenario", "Kịch bản mới"), values: displayValues, financials: draft, draft: true }] : []),
  ];
  const labels = { sellingPrice: t("Selling price", "Giá bán"), purchaseCost: t("Purchase cost", "Giá mua"), logistics: t("Shipping and fulfillment", "Vận chuyển & xử lý"), advertising: t("Acquisition cost", "Chi phí quảng cáo"), platformFeeRate: t("Marketplace fee", "Phí nền tảng"), fxRate: t("FX: selling per purchase currency", "Tỷ giá: tiền bán / tiền mua") };
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
      onSaved(result); edit(); setMessage(remove ? t("Scenario removed.", "Đã xóa kịch bản.") : t("Saved. Unlocked exports include this scenario.", "Đã lưu. File xuất của báo cáo đã mở khóa sẽ gồm kịch bản này."));
    } catch (e) { setError(e instanceof Error ? e.message : t("Could not save.", "Chưa thể lưu.")); }
    finally { setBusy(false); }
  }
  const chartRows = rows.filter(row => row.financials !== null).map(row => ({ name: row.name + (row.draft ? t(" (draft)", " (nháp)") : ""), profit: row.financials!.contributionProfit }));
  return <div className="wb-economics" aria-labelledby="economics-title">
    <section className="wb-economics-main">
      <h2 id="economics-title">{t("What happens if your acquisition costs rise?", "Điều gì xảy ra khi chi phí quảng cáo tăng?")}</h2>
      <p className="wb-description">{t("Compare contribution, margin and break-even before you commit to inventory. Change the inputs to explore your own scenarios.", "So sánh lợi nhuận, biên đóng góp và hòa vốn trước khi nhập hàng. Thay đầu vào để thử các kịch bản của bạn.")}</p>
      <div className="wb-scenario-toolbar"><div className="wb-segments" role="group" aria-label={t("Select a scenario", "Chọn kịch bản")}><button aria-pressed={!editing} onClick={() => edit()} disabled={busy}>{t("Original inputs", "Đầu vào gốc")}</button>{scenarios.map(s => <button key={s.id} aria-pressed={editing === s.id} onClick={() => edit(s)} disabled={busy}>{s.name}</button>)}</div><button type="submit" form="scenario-inputs" className="btn btn-primary" disabled={busy || run.id === "sample" || (!editing && scenarios.length >= 5)}>{busy ? t("Saving…", "Đang lưu…") : t("Save scenario", "Lưu kịch bản")}</button></div>
      <div className="wb-table-scroll"><table className="wb-comparison"><caption className="sr-only">{t("Scenario assumptions and outcomes", "Giả định và kết quả kịch bản")}</caption><thead><tr><th>{t("Scenario", "Kịch bản")}</th><th>{t("Selling price", "Giá bán")}<small>({run.input.currency})</small></th><th>{t("Acquisition", "Quảng cáo")}<small>({run.input.currency})</small></th><th>{t("Contribution", "Lợi nhuận")}<small>({run.input.currency})</small></th><th>{t("Margin", "Biên")}<small>(%)</small></th><th>{t("Break-even", "Hòa vốn")}<small>({run.input.currency})</small></th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className={row.draft ? "wb-draft-row" : undefined}><th scope="row">{row.name}{row.draft && <small>{t("Unsaved draft", "Nháp chưa lưu")}</small>}</th><td>{format(row.values.sellingPrice)}</td><td>{format(row.values.advertising)}</td><td className={row.financials ? row.financials.contributionProfit < 0 ? "wb-negative" : "wb-positive" : undefined}>{format(row.financials?.contributionProfit ?? null)}</td><td className={row.financials ? row.financials.contributionProfit < 0 ? "wb-negative" : "wb-positive" : undefined}>{row.financials ? percent(row.financials.contributionMargin) : "—"}</td><td>{format(row.financials?.breakEvenPrice ?? null)}</td></tr>)}</tbody></table></div>
      <p className="wb-caption">{t("Currency", "Tiền tệ")}: {run.input.currency} <span> | </span>{t("User assumptions, not market forecasts. Unsaved drafts are excluded from exports.", "Giả định của bạn, chưa phải dự báo thị trường. File xuất không gồm nháp chưa lưu.")}</p>
      <h3 className="wb-chart-heading">{t("Contribution comparison", "So sánh lợi nhuận")} <span>({run.input.currency} {t("per unit", "mỗi sản phẩm")})</span></h3>
      {chartRows.length ? active && <ContributionChart rows={chartRows} currency={run.input.currency} locale={language === "vi" ? "vi-VN" : "en-US"}/> : <div className="wb-chart-empty"><h3>{t("Your cost picture is still incomplete", "Bạn chưa có đủ thông tin chi phí")}</h3><p>{t("Add price, purchase cost, shipping, acquisition and fee to see a comparison. Blank amounts stay unknown.", "Bổ sung giá bán, giá mua, vận chuyển, quảng cáo và phí để so sánh. Khoản để trống vẫn là chưa biết.")}</p></div>}
      {chartRows.length < rows.length && <p className="wb-caption">{t("Scenarios with missing inputs are shown in the table and omitted from the chart.", "Kịch bản thiếu đầu vào vẫn có trong bảng, nhưng chưa được vẽ trên biểu đồ.")}</p>}
    </section>
    <aside className="wb-input-inspector"><form id="scenario-inputs" onSubmit={e => { e.preventDefault(); void persist(); }}>
      <h2>{t("Scenario inputs", "Đầu vào kịch bản")}</h2><p className="wb-description">{t("Edit your assumptions. Costs are per unit; an empty field means unknown.", "Chỉnh giả định của bạn. Chi phí theo mỗi sản phẩm; để trống là chưa biết.")}</p>
      {scenarioKeys.filter(key => key !== "sellingPrice" && (key !== "fxRate" || run.input.costCurrency !== run.input.currency)).map(key => <div className="field" key={key}><label htmlFor={`saved-${key}`}>{labels[key]} ({key === "platformFeeRate" ? "%" : key === "purchaseCost" ? run.input.costCurrency : key === "fxRate" ? `${run.input.currency}/${run.input.costCurrency}` : run.input.currency})</label><input id={`saved-${key}`} type="number" min={key === "fxRate" ? "0.000000001" : "0"} max={key === "platformFeeRate" ? "99" : key === "fxRate" ? "1000000000" : "1000000000000"} step="any" value={fields[key]} placeholder={t("Unknown", "Chưa biết")} onChange={e => setFields(current => ({ ...current, [key]: e.target.value }))}/></div>)}
      <p className="wb-model-note">{t("Taxes, returns, packaging and fixed costs are excluded unless entered in your costs. FX is your assumption, not a live rate.", "Chưa gồm thuế, hoàn hàng, bao bì và chi phí cố định trừ khi đã gộp vào đầu vào. Tỷ giá do bạn giả định, chưa phải tỷ giá trực tiếp.")}</p>
      <div className="wb-next-card"><span>{t("BEFORE ORDERING STOCK", "TRƯỚC KHI NHẬP HÀNG")}</span><h3>{t("Confirm landed costs and test demand", "Xác nhận tổng chi phí và thử nhu cầu")}</h3><p>{t("Turn the gaps in this model into a focused validation checklist.", "Chuyển khoảng trống của mô hình thành checklist kiểm chứng.")}</p><button type="button" className="btn btn-teal" onClick={onNext}>{t("Open validation plan", "Mở kế hoạch kiểm chứng")}<ArrowRight size={16}/></button></div>
      <details className="wb-scenario-details" open={run.id !== "sample" || undefined}><summary>{t("Price, name & rationale", "Giá bán, tên & căn cứ")}</summary><div className="field"><label htmlFor="saved-sellingPrice">{labels.sellingPrice} ({run.input.currency})</label><input id="saved-sellingPrice" type="number" min="0" max="1000000000000" step="any" value={fields.sellingPrice} onChange={e => setFields(current => ({ ...current, sellingPrice: e.target.value }))}/></div><div className="field"><label htmlFor="scenario-name">{t("Scenario name", "Tên kịch bản")}</label><input id="scenario-name" required maxLength={60} value={name} onChange={e => setName(e.target.value)}/></div><div className="field"><label htmlFor="scenario-notes">{t("Assumption & rationale", "Giả định & căn cứ")}</label><textarea id="scenario-notes" rows={2} value={notes} maxLength={500} onChange={e => setNotes(e.target.value)}/></div><div className="wb-save-actions"><button type="button" className="btn btn-outline" onClick={() => { edit(); setName(t("New scenario", "Kịch bản mới")); }} disabled={busy || (run.id !== "sample" && scenarios.length >= 5)}><Plus size={15}/>{t("New scenario", "Kịch bản mới")}</button>{editing && run.id !== "sample" && <button type="button" className="btn btn-outline" aria-label={t("Remove selected scenario", "Xóa kịch bản đã chọn")} disabled={busy} onClick={() => void persist(editing)}><Trash2 size={16}/></button>}</div></details>
      {run.id === "sample" && <p className="wb-caption">{t("Public sample. Start your own research to save changes.", "Mẫu công khai. Tạo nghiên cứu riêng để lưu thay đổi.")}</p>}
      {error && <div role="alert" className="notice">{error}<button className="btn btn-outline" type="button" onClick={() => window.location.reload()}>{t("Reload report", "Tải lại báo cáo")}</button></div>}{message && <p role="status" className="wb-save-status">{message}</p>}
    </form></aside>
  </div>;
}
function toFields(values: Scenario["values"]) { return Object.fromEntries(scenarioKeys.map(key => [key, values[key] === null ? "" : String(values[key]! * (key === "platformFeeRate" ? 100 : 1))])) as Record<typeof scenarioKeys[number], string>; }
