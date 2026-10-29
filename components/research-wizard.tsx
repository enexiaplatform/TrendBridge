"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { currencies, markets } from "@/lib/global";
import { researchInputSchema } from "@/lib/research/contract";
import { emptyIntakeDraft, intakeDraftKey, restoreIntakeDraft, type IntakeDraft } from "@/lib/research/draft";
import { useLocale } from "./locale";

type DraftField = Exclude<keyof IntakeDraft, "version">;
export function ResearchWizard() {
  const router = useRouter(); const { t } = useLocale(); const key = useRef<string | null>(null);
  const [data, setData] = useState(emptyIntakeDraft);
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [fields, setFields] = useState<Record<string, string>>({});
  const [marketNotice, setMarketNotice] = useState("");
  const [draftStatus, setDraftStatus] = useState<"none" | "saved" | "restored" | "unavailable">("none");
  useEffect(() => {
    try { const saved = restoreIntakeDraft(localStorage.getItem(intakeDraftKey)); if (saved) { setData(saved); setDraftStatus("restored"); } } catch { setDraftStatus("unavailable"); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      if (data.name || data.reference || data.description || data.configuration) { localStorage.setItem(intakeDraftKey, JSON.stringify(data)); setDraftStatus(current => current === "restored" ? current : "saved"); }
      else localStorage.removeItem(intakeDraftKey);
    } catch { setDraftStatus("unavailable"); }
  }, [data, ready]);
  function change<K extends DraftField>(field: K, value: IntakeDraft[K]) { key.current = null; setData(current => ({ ...current, [field]: value })); setFields(current => ({ ...current, [field]: "" })); if (draftStatus === "restored") setDraftStatus("saved"); }
  function marketChange(code: IntakeDraft["market"]) {
    key.current = null; const market = markets[code];
    const hasAmounts = [data.sellingPrice, data.purchaseCost, data.logistics, data.advertising, data.platformFeeRate].some(value => value.trim() !== "");
    setData(current => hasAmounts ? { ...current, market: code, channel: market.channels[0] } : { ...current, market: code, channel: market.channels[0], currency: market.currency, costCurrency: market.currency, fxRate: "" });
    setMarketNotice(hasAmounts ? t(`Existing amounts and currencies are preserved (${data.currency} / ${data.costCurrency}). Review them for your new market.`, `Các khoản tiền và tiền tệ được giữ nguyên (${data.currency} / ${data.costCurrency}). Hãy xem lại cho thị trường mới.`) : ""); setFields({});
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setFields({});
    const { version: _, reportLanguage, ...payload } = data;
    const number = (value: string) => value.trim() === "" ? null : Number(value);
    const parsed = researchInputSchema.safeParse({ ...payload, language: reportLanguage, fxRate: number(data.fxRate), sellingPrice: number(data.sellingPrice), purchaseCost: number(data.purchaseCost), logistics: number(data.logistics), advertising: number(data.advertising), platformFeeRate: data.platformFeeRate.trim() === "" ? null : Number(data.platformFeeRate) / 100 });
    if (!parsed.success) {
      const messages: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        messages[field] = field === "name" ? t("Enter at least two characters.", "Nhập ít nhất 2 ký tự.") : field === "reference" ? t("Use a complete HTTPS link, or leave it blank.", "Dùng link HTTPS đầy đủ hoặc để trống.") : field === "fxRate" ? t("Provide a positive FX rate for the purchase currency, or leave purchase cost unknown.", "Nhập tỷ giá dương cho tiền giá mua, hoặc để trống giá mua.") : t("Check this value. Costs must be nonnegative; platform fee must be between 0 and 99%.", "Kiểm tra giá trị. Chi phí không âm; phí nền tảng từ 0 đến 99%.");
      }
      setFields(messages); setError(t("Please check the highlighted fields below.", "Vui lòng kiểm tra các ô được đánh dấu bên dưới.")); return;
    }
    setBusy(true); key.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key.current }, body: JSON.stringify(parsed.data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      try { localStorage.removeItem(intakeDraftKey); } catch { /* The saved server report is authoritative. */ }
      router.push(`/reports/${result.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : t("Could not save. Your draft remains here.", "Chưa thể lưu. Bản nháp vẫn còn ở đây.")); setBusy(false); }
  }
  function field(field: DraftField, label: string, numeric = false, placeholder = "") {
    return <div className="field"><label htmlFor={`intake-${field}`}>{label}</label><input id={`intake-${field}`} type={numeric ? "number" : "text"} step={numeric ? "any" : undefined} min={numeric ? field === "fxRate" ? "0.000000001" : 0 : undefined} max={numeric ? field === "platformFeeRate" ? 99 : field === "fxRate" ? 1e9 : 1e12 : undefined} maxLength={field === "name" ? 160 : field === "reference" ? 2000 : 500} value={data[field]} placeholder={placeholder} onChange={e => change(field, e.target.value)} aria-invalid={!!fields[field]} aria-describedby={fields[field] ? `error-${field}` : undefined}/>{fields[field] && <span id={`error-${field}`} className="wb-field-error">{fields[field]}</span>}</div>;
  }
  const costError = ["fxRate", "sellingPrice", "purchaseCost", "logistics", "advertising", "platformFeeRate"].some(key => fields[key]);
  return <div className="wb-page"><Link className="wb-back" href="/dashboard"><ArrowLeft size={15}/>{t("Case workspace", "Workspace sản phẩm")}</Link><div className="wb-intake"><form onSubmit={submit} className="wb-intake-form" noValidate aria-label={t("New product research", "Nghiên cứu sản phẩm mới")}>
    <h1>{t("Start with one product.", "Bắt đầu từ một sản phẩm.")}</h1><p className="wb-description">{t("Choose where you want to sell. We'll organize the scope and show what still needs to be validated. Add costs when you know them.", "Chọn thị trường bạn muốn bán. App sẽ hệ thống phạm vi và chỉ rõ điều cần kiểm chứng. Bổ sung chi phí khi bạn biết.")}</p>
    {error && <p role="alert" className="notice">{error}</p>}
    {marketNotice && <p role="status" className="notice">{marketNotice}</p>}
    {field("name", t("Product name", "Tên sản phẩm"), false, t("e.g. Insulated travel mug", "Ví dụ: Ly giữ nhiệt du lịch"))}
    <div className="wb-two-fields"><div className="field"><label htmlFor="intake-market">{t("Target market", "Thị trường đích")}</label><select id="intake-market" value={data.market} onChange={e => marketChange(e.target.value as IntakeDraft["market"])}>{Object.entries(markets).map(([code, market]) => <option key={code} value={code}>{market.name}</option>)}</select></div><div className="field"><label htmlFor="intake-channel">{t("Sales channel", "Kênh bán")}</label><select id="intake-channel" value={data.channel} onChange={e => change("channel", e.target.value)}>{markets[data.market].channels.map(channel => <option key={channel}>{channel}</option>)}</select></div></div>
    <details className="wb-intake-optional" open={!!fields.reference || !!fields.configuration || undefined}><summary>{t("Add a reference or specifications", "Bổ sung tham chiếu hoặc cấu hình")} <small>{t("Optional", "Tùy chọn")}</small></summary>{field("reference", t("Reference link", "Link tham chiếu"), false, "https://…")}<p className="wb-caption">{t("Your link is saved as context. Its contents are not retrieved or verified yet.", "Link được lưu làm ngữ cảnh. Nội dung chưa được truy xuất hay xác minh.")}</p>{field("configuration", t("Product configuration", "Cấu hình sản phẩm"), false, t("Material, capacity, pack size, accessories…", "Vật liệu, dung tích, số lượng bộ, phụ kiện…"))}<div className="field"><label htmlFor="intake-description">{t("Description or restrictions", "Mô tả hoặc hạn chế")}</label><textarea id="intake-description" value={data.description} maxLength={3000} onChange={e => change("description", e.target.value)} rows={3}/></div></details>
    <details className="wb-intake-optional" open={costError || undefined}><summary>{t("Add cost assumptions", "Bổ sung giả định chi phí")} <small>{t("Optional · you can do this later", "Tùy chọn · có thể làm sau")}</small></summary><p className="wb-caption">{t("All costs are per unit. Leave unknown amounts blank; zero means you explicitly expect no cost. Existing amounts keep their currencies when you change market; review them for the new scope.", "Chi phí theo mỗi sản phẩm. Để trống khoản chưa biết; số 0 nghĩa là xác nhận không có chi phí. Đổi thị trường vẫn giữ nguyên tiền tệ và các khoản đã nhập; hãy kiểm tra lại cho phạm vi mới.")}</p><div className="wb-two-fields"><div className="field"><label htmlFor="intake-currency">{t("Selling currency", "Tiền bán")}</label><select id="intake-currency" value={data.currency} onChange={e => change("currency", e.target.value as IntakeDraft["currency"])}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></div><div className="field"><label htmlFor="intake-cost-currency">{t("Purchase currency", "Tiền giá mua")}</label><select id="intake-cost-currency" value={data.costCurrency} onChange={e => change("costCurrency", e.target.value as IntakeDraft["costCurrency"])}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></div></div>{data.costCurrency !== data.currency && field("fxRate", `1 ${data.costCurrency} = ? ${data.currency}`, true)}<div className="wb-two-fields">{field("sellingPrice", `${t("Selling price", "Giá bán")} (${data.currency})`, true)}{field("purchaseCost", `${t("Purchase cost", "Giá mua")} (${data.costCurrency})`, true)}{field("logistics", `${t("Shipping & fulfillment", "Vận chuyển & xử lý")} (${data.currency})`, true)}{field("advertising", `${t("Acquisition / order", "Quảng cáo / đơn")} (${data.currency})`, true)}{field("platformFeeRate", `${t("Marketplace fee", "Phí nền tảng")} (%)`, true)}</div></details>
    <div className="field"><label htmlFor="intake-language">{t("Report language", "Ngôn ngữ báo cáo")}</label><select id="intake-language" value={data.reportLanguage} onChange={e => change("reportLanguage", e.target.value as IntakeDraft["reportLanguage"])}><option value="en">English</option><option value="vi">Tiếng Việt</option></select></div>
    <button className="btn btn-primary wb-intake-submit" disabled={busy || !ready}>{busy ? t("Saving your snapshot…", "Đang lưu preview…") : t("Create my free snapshot", "Tạo preview miễn phí")}<ArrowRight size={16}/></button><p className="wb-caption">{t("No card required. This preview includes scope checks and input-based calculations. External research is not active.", "Không cần thẻ. Preview gồm kiểm tra phạm vi và tính toán theo đầu vào. Nghiên cứu bên ngoài chưa kích hoạt.")}</p>
    <div className="wb-draft-status" role="status">{draftStatus === "restored" ? <><Check size={14}/>{t("Your draft was restored from this device.", "Đã khôi phục bản nháp từ thiết bị này.")}</> : draftStatus === "saved" ? <><Check size={14}/>{t("Draft saved on this device.", "Đã lưu nháp trên thiết bị này.")}</> : draftStatus === "unavailable" ? t("Browser draft storage is unavailable. Keep this page open until saved.", "Không thể lưu nháp trình duyệt. Giữ trang mở tới khi lưu thành công.") : t("Your draft will stay on this device until you submit it.", "Bản nháp được giữ trên thiết bị tới khi bạn gửi.")}</div>
  </form><aside className="wb-intake-aside"><h2>{t("A clearer first decision", "Bước đầu rõ ràng hơn")}</h2><p>{t("One product, one market and a practical path to the next check.", "Một sản phẩm, một thị trường và hướng kiểm chứng tiếp theo.")}</p><ul><li>{t("Define the exact product you want to sell.", "Xác định sản phẩm bạn muốn bán.")}</li><li>{t("Understand the economics you can calculate today.", "Hiểu mô hình tài chính có thể tính hôm nay.")}</li><li>{t("See the evidence you still need before ordering.", "Thấy bằng chứng cần có trước khi nhập hàng.")}</li></ul><Link className="btn btn-outline" href="/reports/sample">{t("Explore a sample workspace", "Xem workspace mẫu")}<ArrowRight size={15}/></Link><div className="wb-intake-summary"><h3>{t("Your research scope", "Phạm vi nghiên cứu")}</h3><dl><dt>{t("Product", "Sản phẩm")}</dt><dd>{data.name || t("Not defined yet", "Chưa xác định")}</dd><dt>{t("Market & channel", "Thị trường & kênh")}</dt><dd>{markets[data.market].name} / {data.channel}</dd><dt>{t("Currency", "Tiền tệ")}</dt><dd>{data.currency}</dd></dl></div></aside></div></div>;
}
