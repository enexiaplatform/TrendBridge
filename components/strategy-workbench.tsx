"use client";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  ArrowRight,
  Target,
  Layers,
  Route,
  Info,
  Pencil,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { useLocale } from "./locale";
import { money } from "@/lib/global";
import {
  channelForecast,
  type Strategy,
  type Segment,
  type Competitor,
  type Channel,
  type Play,
} from "@/lib/strategy/model";
import type { Evidence } from "@/lib/launch/model";
import {
  ChannelCharts,
  CompetitiveMap,
  RolloutChart,
  SegmentMap,
  SignalChart,
} from "./strategy-charts";

function Text({
  label,
  value,
  onChange,
  long = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  long?: boolean;
}) {
  return (
    <label className="lw-field">
      {label}
      {long ? (
        <textarea
          maxLength={800}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          maxLength={120}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
function NumberField({
  label,
  value,
  onChange,
  rate = false,
  min = 0,
  max,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  rate?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <label className="lw-field">
      {label}
      <input
        type="number"
        min={min}
        max={rate ? 100 : max}
        step="any"
        value={
          value === null ? "" : Number((value * (rate ? 100 : 1)).toFixed(8))
        }
        onChange={(e) =>
          onChange(
            e.target.value === ""
              ? null
              : Number(e.target.value) / (rate ? 100 : 1),
          )
        }
      />
    </label>
  );
}
function Sources({
  ids,
  onChange,
  evidence,
  vi,
}: {
  ids: string[];
  onChange: (ids: string[]) => void;
  evidence: Evidence[];
  vi: boolean;
}) {
  return (
    <details open className="si-sources">
      <summary>
        {vi ? "Liên kết bằng chứng" : "Link supporting evidence"} · {ids.length}
      </summary>
      <p>
        {vi
          ? "Liên kết không xác nhận nội dung đã được kiểm chứng. Thêm nguồn ở Evidence & comparables."
          : "A link is not independent verification. Add records under Evidence & comparables."}
      </p>
      {evidence.length ? (
        evidence.map((e) => (
          <label className="lw-check" key={e.id}>
            <input
              type="checkbox"
              checked={ids.includes(e.id)}
              onChange={(x) =>
                onChange(
                  x.target.checked
                    ? [...ids, e.id]
                    : ids.filter((id) => id !== e.id),
                )
              }
            />
            <span>
              {e.title}
              <small>
                {e.observedOn} · {e.limitations}
              </small>
            </span>
          </label>
        ))
      ) : (
        <p>
          {vi
            ? "Chưa có nguồn. Giữ kết luận ở trạng thái giả thuyết."
            : "No source records yet. Keep conclusions as hypotheses."}
        </p>
      )}
      {evidence
        .filter((e) => ids.includes(e.id))
        .map((e) => (
          <article key={e.id}>
            <a href={e.url} target="_blank" rel="noreferrer">
              {e.title}
            </a>
            <p>{e.excerpt}</p>
            <small>{e.limitations}</small>
          </article>
        ))}
    </details>
  );
}

export default function StrategyWorkbench({
  mode,
  value: s,
  onChange: change,
  evidence,
  currency,
}: {
  mode: "intelligence" | "gtm";
  value: Strategy;
  onChange: (s: Strategy) => void;
  evidence: Evidence[];
  currency: string;
}) {
  const { t, language } = useLocale(),
    vi = language === "vi",
    fmt = (n: number | null) =>
      n === null
        ? t("Unknown", "Chưa biết")
        : money(n, currency, vi ? "vi-VN" : "en-US");
  const [segmentId, setSegmentId] = useState(s.segments[0]?.id ?? ""),
    [competitorId, setCompetitorId] = useState(s.competitors[0]?.id ?? ""),
    [channelId, setChannelId] = useState(s.channels[0]?.id ?? ""),
    [sensitivity, setSensitivity] = useState(1);
  const [marketView, setMarketView] = useState("segments"),
    [gtmView, setGtmView] = useState("channels"),
    [inspector, setInspector] = useState("summary");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setInspector("summary");
  }, [mode]);
  useEffect(() => {
    if (
      inspector !== "edit" ||
      !window.matchMedia("(max-width: 800px)").matches
    )
      return;
    const panel = root.current?.querySelector<HTMLElement>(".pd-inspector"),
      previous = document.activeElement as HTMLElement | null;
    if (!panel) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const controls = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary",
        ),
      ).filter((el) => el.getClientRects().length > 0);
    panel.querySelector<HTMLElement>("input,textarea,select")?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setInspector("summary");
      }
      if (event.key !== "Tab") return;
      const nodes = controls(),
        first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    panel.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = overflow;
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
      panel.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [inspector]);
  const segment = s.segments.find((r) => r.id === segmentId) ?? s.segments[0],
    competitor =
      s.competitors.find((r) => r.id === competitorId) ?? s.competitors[0],
    channel = s.channels.find((r) => r.id === channelId) ?? s.channels[0];
  const target = s.segments.find((r) => r.id === s.positioning.segmentId),
    f = channel ? channelForecast(channel, sensitivity) : null;
  const channelTarget = s.segments.find((r) => r.id === channel?.segmentId);
  const updateSegment = (patch: Partial<Segment>) =>
    change({
      ...s,
      segments: s.segments.map((r) =>
        r.id === segment?.id ? { ...r, ...patch } : r,
      ),
    });
  const updateCompetitor = (patch: Partial<Competitor>) =>
    change({
      ...s,
      competitors: s.competitors.map((r) =>
        r.id === competitor?.id ? { ...r, ...patch } : r,
      ),
    });
  const updateChannel = (patch: Partial<Channel>) =>
    change({
      ...s,
      channels: s.channels.map((r) =>
        r.id === channel?.id ? { ...r, ...patch } : r,
      ),
    });
  const updatePlay = (id: string, patch: Partial<Play>) =>
    change({
      ...s,
      plays: s.plays.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  const segmentLocked =
    !!segment &&
    (s.positioning.segmentId === segment.id ||
      s.channels.some((r) => r.segmentId === segment.id));
  const sourceRows = [
      ...s.segments,
      ...s.competitors,
      ...s.channels,
      ...s.signal.points,
    ],
    linked = sourceRows.filter((r) => r.sourceIds.length).length;
  function addSegment() {
    const id = crypto.randomUUID();
    change({
      ...s,
      segments: [
        ...s.segments,
        {
          id,
          name: "",
          profile: "",
          problem: "",
          trigger: "",
          alternatives: "",
          customers: null,
          annualSpend: null,
          urgency: null,
          accessibility: null,
          sourceIds: [],
        },
      ],
    });
    setSegmentId(id);
    setInspector("edit");
  }
  function addCompetitor() {
    const id = crypto.randomUUID();
    change({
      ...s,
      competitors: [
        ...s.competitors,
        {
          id,
          name: "",
          kind: "direct",
          configuration: "",
          price: null,
          jobFit: null,
          strengths: "",
          gaps: "",
          sourceIds: [],
        },
      ],
    });
    setCompetitorId(id);
    setInspector("edit");
  }
  function addChannel() {
    const id = crypto.randomUUID();
    change({
      ...s,
      channels: [
        ...s.channels,
        {
          id,
          name: "",
          segmentId: s.positioning.segmentId,
          budget: null,
          cpc: null,
          leadRate: null,
          winRate: null,
          revenuePerCustomer: null,
          contributionPerCustomer: null,
          hypothesis: "",
          sourceIds: [],
        },
      ],
    });
    setChannelId(id);
    setInspector("edit");
  }
  function addSignal() {
    let date = new Date();
    for (let i = 0; i < 12; i++) {
      const month = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - i, 1),
      )
        .toISOString()
        .slice(0, 7);
      if (!s.signal.points.some((p) => p.month === month)) {
        change({
          ...s,
          signal: {
            ...s.signal,
            points: [...s.signal.points, { month, value: null, sourceIds: [] }],
          },
        });
        return;
      }
    }
  }

  const selectSegment = (id: string) => {
    setSegmentId(id);
    setInspector("summary");
  };
  const selectCompetitor = (id: string) => {
    setCompetitorId(id);
    setInspector("summary");
  };
  const selectChannel = (id: string) => {
    setChannelId(id);
    setInspector("summary");
  };
  const inspectorTabs = (
    <div
      className="pd-inspector-tabs"
      role="group"
      aria-label={t("Detail view", "Nội dung chi tiết")}
    >
      {[
        ["summary", t("Overview", "Tổng quan")],
        ["edit", t("Edit", "Chỉnh sửa")],
        ["sources", t("Evidence", "Bằng chứng")],
      ].map(([id, label]) => (
        <button
          key={id}
          aria-pressed={inspector === id}
          onClick={() => setInspector(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const inspectorFooter =
    inspector !== "summary" ? (
      <footer>
        <button
          className="btn btn-outline"
          onClick={() => setInspector("summary")}
        >
          <X size={15} />
          {inspector === "edit"
            ? t("Done editing", "Xong chỉnh sửa")
            : t("Back to overview", "Về tổng quan")}
        </button>
        <small>
          {t(
            "Changes are in your workspace draft.",
            "Thay đổi nằm trong bản nháp workspace.",
          )}
        </small>
      </footer>
    ) : null;
  return (
    <div ref={root} className="si-root pd-workspace">
      <div className="pd-context">
        <nav
          className="pd-views"
          aria-label={t("Analysis views", "Góc nhìn phân tích")}
        >
          {(mode === "intelligence"
            ? [
                ["segments", t("Customer segments", "Phân khúc")],
                ["competition", t("Competition", "Cạnh tranh")],
                ["signals", t("Market signals", "Tín hiệu")],
              ]
            : [
                ["channels", t("Channel economics", "Hiệu quả kênh")],
                ["positioning", t("Positioning & offer", "Định vị & đề xuất")],
                ["rollout", t("Launch roadmap", "Lộ trình triển khai")],
              ]
          ).map(([id, label]) => (
            <button
              key={id}
              aria-pressed={
                (mode === "intelligence" ? marketView : gtmView) === id
              }
              onClick={() => {
                mode === "intelligence" ? setMarketView(id) : setGtmView(id);
                setInspector("summary");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <details className="pd-method">
          <summary>
            <Info size={14} />
            {t("Inputs & assumptions", "Đầu vào & giả định")}
          </summary>
          <div>
            <strong>
              {t("Evidence, not certainty", "Bằng chứng, chưa phải xác nhận")}
            </strong>
            <p>
              {t(
                "No live market feed or AI verification. Linked sources are user-supplied and have not been independently verified. Blank values mean unknown.",
                "Chưa có dữ liệu live hoặc AI xác minh. Nguồn do người dùng nhập, chưa được xác minh độc lập. Để trống là chưa biết.",
              )}
            </p>
            <span>
              {linked} / {sourceRows.length}{" "}
              {t("records linked to sources", "bản ghi có liên kết nguồn")}
            </span>
          </div>
        </details>
      </div>
      {mode === "intelligence" && marketView === "segments" && (
        <div className="pd-analysis">
          <section className="pd-canvas">
            <div className="pd-title">
              <div>
                <span className="si-eyebrow">MARKET INTELLIGENCE</span>
                <h2>
                  {t(
                    "Compare customer segments.",
                    "So sánh các phân khúc khách hàng.",
                  )}
                </h2>
                <p>
                  {t(
                    "Find an urgent need, then inspect the buyer behind it.",
                    "Tìm nhu cầu cấp thiết, rồi xem người mua phía sau.",
                  )}
                </p>
              </div>
              <button
                className="btn btn-outline"
                disabled={s.segments.length >= 8}
                onClick={addSegment}
              >
                <Plus size={15} />
                {t("Add segment", "Thêm phân khúc")}
              </button>
            </div>
            <SegmentMap
              rows={s.segments}
              selected={segment?.id ?? ""}
              onSelect={selectSegment}
              vi={vi}
            />
            <div className="pd-table-title">
              <h3>{t("Customer segments", "Phân khúc khách hàng")}</h3>
              <span>
                {s.segments.length} {t("segments", "phân khúc")}
              </span>
            </div>
            <div className="pd-table-scroll">
              <table className="pd-table">
                <caption className="sr-only">
                  {t(
                    "Segment assumptions, not market size",
                    "Giả định phân khúc, không phải quy mô thị trường",
                  )}
                </caption>
                <thead>
                  <tr>
                    <th>{t("Segment", "Phân khúc")}</th>
                    <th>{t("Urgency", "Cấp thiết")} / 5</th>
                    <th>{t("Accessibility", "Tiếp cận")} / 5</th>
                    <th>{t("Sources", "Nguồn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {s.segments.map((r, i) => (
                    <tr key={r.id} data-selected={segment?.id === r.id}>
                      <td>
                        <button
                          className="pd-row-select"
                          aria-pressed={segment?.id === r.id}
                          onClick={() => selectSegment(r.id)}
                        >
                          <span className="pd-row-index">{i + 1}</span>
                          {r.name || t("Unnamed segment", "Chưa đặt tên")}
                          {s.positioning.segmentId === r.id && (
                            <span className="pd-icp">ICP</span>
                          )}
                        </button>
                      </td>
                      <td>{r.urgency ?? "—"}</td>
                      <td>{r.accessibility ?? "—"}</td>
                      <td>
                        {r.sourceIds.length}
                        <ChevronRight size={13} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!s.segments.length && (
              <p className="si-empty">
                {t(
                  "Add your first segment to compare buyers.",
                  "Thêm phân khúc đầu tiên để so sánh người mua.",
                )}
              </p>
            )}
            <details className="si-editor">
              <summary>
                {t(
                  "Define the market and boundaries",
                  "Định nghĩa thị trường và giới hạn",
                )}
              </summary>
              <Text
                long
                label={t(
                  "Market definition: category, buyer, geography, exclusions",
                  "Định nghĩa: ngành hàng, người mua, địa lý, phần loại trừ",
                )}
                value={s.marketDefinition}
                onChange={(marketDefinition) =>
                  change({ ...s, marketDefinition })
                }
              />
            </details>
          </section>
          <aside
            className={`pd-inspector ${inspector !== "summary" ? "pd-inspector-editing" : ""}`}
            aria-label={t(
              "Selected segment details",
              "Chi tiết phân khúc đang chọn",
            )}
          >
            <header>
              <span className="si-eyebrow">
                {t("SELECTED SEGMENT", "PHÂN KHÚC ĐANG CHỌN")}
              </span>
              <h3>
                {segment?.name || t("Select a segment", "Chọn phân khúc")}
              </h3>
              {inspectorTabs}
            </header>
            <div className="pd-inspector-body">
              {segment && inspector === "summary" && (
                <>
                  <button
                    className="btn btn-teal pd-primary"
                    onClick={() =>
                      change({
                        ...s,
                        positioning: {
                          ...s.positioning,
                          segmentId: segment.id,
                        },
                      })
                    }
                  >
                    {s.positioning.segmentId === segment.id
                      ? t("Selected as target ICP", "Đã chọn làm ICP")
                      : t("Use as target ICP", "Chọn làm ICP mục tiêu")}
                    <ArrowRight size={16} />
                  </button>
                  <p className="pd-lead">
                    {segment.profile ||
                      t(
                        "Add the buyer context for this segment.",
                        "Thêm bối cảnh người mua cho phân khúc.",
                      )}
                  </p>
                  <dl className="pd-attributes">
                    <dt>{t("Need / problem", "Nhu cầu / vấn đề")}</dt>
                    <dd>{segment.problem || "—"}</dd>
                    <dt>{t("Buying trigger", "Tác nhân mua")}</dt>
                    <dd>{segment.trigger || "—"}</dd>
                    <dt>{t("Current alternative", "Giải pháp hiện tại")}</dt>
                    <dd>{segment.alternatives || "—"}</dd>
                  </dl>
                  <div className="pd-score-pair">
                    <div>
                      <span>{t("Urgency", "Cấp thiết")}</span>
                      <strong>
                        {segment.urgency ?? "—"}
                        <small> / 5</small>
                      </strong>
                    </div>
                    <div>
                      <span>{t("Accessibility", "Tiếp cận")}</span>
                      <strong>
                        {segment.accessibility ?? "—"}
                        <small> / 5</small>
                      </strong>
                    </div>
                  </div>

                  <div className="pd-evidence-summary">
                    <FileText size={17} />
                    <div>
                      <strong>
                        {segment.sourceIds.length}{" "}
                        {t("linked sources", "nguồn liên kết")}
                      </strong>
                      <p>
                        {t(
                          "Ratings are planning assumptions, not verified demand.",
                          "Điểm là giả định kế hoạch, chưa xác minh nhu cầu.",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    className="pd-link"
                    onClick={() => setInspector("edit")}
                  >
                    <Pencil size={14} />
                    {t("Edit segment", "Chỉnh phân khúc")}
                  </button>
                </>
              )}
              {segment && inspector === "edit" && (
                <div className="pd-edit-fields">
                  <div className="lw-fields">
                    <Text
                      label={t("Segment name", "Tên phân khúc")}
                      value={segment.name}
                      onChange={(name) => updateSegment({ name })}
                    />
                    <Text
                      long
                      label={t(
                        "Ideal customer profile / context",
                        "Hồ sơ khách hàng lý tưởng / bối cảnh",
                      )}
                      value={segment.profile}
                      onChange={(profile) => updateSegment({ profile })}
                    />
                    <Text
                      long
                      label={t(
                        "Job, pain or unmet need",
                        "Công việc, vấn đề, nhu cầu chưa đáp ứng",
                      )}
                      value={segment.problem}
                      onChange={(problem) => updateSegment({ problem })}
                    />
                    <Text
                      long
                      label={t("Buying trigger", "Tác nhân mua hàng")}
                      value={segment.trigger}
                      onChange={(trigger) => updateSegment({ trigger })}
                    />
                    <Text
                      long
                      label={t(
                        "Current alternatives",
                        "Giải pháp thay thế hiện tại",
                      )}
                      value={segment.alternatives}
                      onChange={(alternatives) =>
                        updateSegment({ alternatives })
                      }
                    />
                    <NumberField
                      label={t(
                        "Problem urgency (1–5, assessed)",
                        "Mức cấp thiết (1–5, tự đánh giá)",
                      )}
                      min={1}
                      max={5}
                      value={segment.urgency}
                      onChange={(urgency) => updateSegment({ urgency })}
                    />
                    <NumberField
                      label={t(
                        "Accessibility (1–5, assessed)",
                        "Khả năng tiếp cận (1–5, tự đánh giá)",
                      )}
                      min={1}
                      max={5}
                      value={segment.accessibility}
                      onChange={(accessibility) =>
                        updateSegment({ accessibility })
                      }
                    />
                    <NumberField
                      label={t(
                        "Relevant customer population (assumption)",
                        "Số khách hàng phù hợp (giả định)",
                      )}
                      value={segment.customers}
                      onChange={(customers) => updateSegment({ customers })}
                    />
                    <NumberField
                      label={`${t("Annual category spend / customer", "Chi ngành hàng / khách / năm")} (${currency})`}
                      value={segment.annualSpend}
                      onChange={(annualSpend) => updateSegment({ annualSpend })}
                    />
                  </div>
                  <p>
                    {t(
                      "Population and spend are assumptions, may overlap across segments and are not summed into market size.",
                      "Số khách và mức chi là giả định, có thể trùng giữa phân khúc và không được tự cộng thành quy mô thị trường.",
                    )}
                  </p>
                  <Sources
                    ids={segment.sourceIds}
                    onChange={(sourceIds) => updateSegment({ sourceIds })}
                    evidence={evidence}
                    vi={vi}
                  />
                  <button
                    className="btn btn-outline"
                    disabled={segmentLocked}
                    onClick={() =>
                      change({
                        ...s,
                        segments: s.segments.filter((r) => r.id !== segment.id),
                      })
                    }
                  >
                    {t("Remove selected segment", "Bỏ phân khúc đang chọn")}
                  </button>
                  {segmentLocked && (
                    <small>
                      {t(
                        "Unlink this segment from positioning and channels before removal.",
                        "Bỏ liên kết khỏi định vị và kênh trước khi xóa.",
                      )}
                    </small>
                  )}
                </div>
              )}
              {segment && inspector === "sources" && (
                <Sources
                  ids={segment.sourceIds}
                  onChange={(sourceIds) => updateSegment({ sourceIds })}
                  evidence={evidence}
                  vi={vi}
                />
              )}
            </div>
            {inspectorFooter}
          </aside>
        </div>
      )}
      {mode === "intelligence" && marketView === "competition" && (
        <div className="pd-analysis">
          <section className="pd-canvas">
            <div className="pd-title">
              <div>
                <span className="si-eyebrow">COMPETITIVE INTELLIGENCE</span>
                <h2>
                  {t(
                    "Compare the alternatives.",
                    "So sánh các giải pháp thay thế.",
                  )}
                </h2>
                <p>
                  {t(
                    "Match configuration before comparing price.",
                    "So cấu hình tương đương trước khi so giá.",
                  )}
                </p>
              </div>
              <button
                className="btn btn-outline"
                disabled={s.competitors.length >= 12}
                onClick={addCompetitor}
              >
                <Plus size={15} />
                {t("Add alternative", "Thêm giải pháp")}
              </button>
            </div>
            <CompetitiveMap
              rows={s.competitors}
              selected={competitor?.id ?? ""}
              onSelect={selectCompetitor}
              currency={currency}
              vi={vi}
            />
            <div className="pd-table-scroll">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>{t("Alternative", "Giải pháp")}</th>
                    <th>
                      {t("Price / unit", "Giá / sản phẩm")} ({currency})
                    </th>
                    <th>{t("Job fit", "Đáp ứng")} / 5</th>
                    <th>{t("Sources", "Nguồn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {s.competitors.map((r) => (
                    <tr key={r.id} data-selected={competitor?.id === r.id}>
                      <td>
                        <button
                          className="pd-row-select"
                          aria-pressed={competitor?.id === r.id}
                          onClick={() => selectCompetitor(r.id)}
                        >
                          {r.name || "—"}
                        </button>
                      </td>
                      <td>{fmt(r.price)}</td>
                      <td>{r.jobFit ?? "—"}</td>
                      <td>{r.sourceIds.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <aside
            className="pd-inspector"
            aria-label={t(
              "Selected alternative details",
              "Chi tiết giải pháp đang chọn",
            )}
          >
            <header>
              <span className="si-eyebrow">
                {t("SELECTED ALTERNATIVE", "GIẢI PHÁP ĐANG CHỌN")}
              </span>
              <h3>
                {competitor?.name ||
                  t("Select an alternative", "Chọn giải pháp")}
              </h3>
              {inspectorTabs}
            </header>
            <div className="pd-inspector-body">
              {competitor && inspector === "summary" && (
                <>
                  <strong className="si-big-number">
                    {fmt(competitor.price)}
                  </strong>
                  <p>{competitor.configuration || "—"}</p>
                  <dl className="pd-attributes">
                    <dt>{t("Strengths", "Thế mạnh")}</dt>
                    <dd>{competitor.strengths || "—"}</dd>
                    <dt>
                      {t("Gaps / open questions", "Khoảng trống / câu hỏi mở")}
                    </dt>
                    <dd>{competitor.gaps || "—"}</dd>
                  </dl>
                  <button
                    className="pd-link"
                    onClick={() => setInspector("edit")}
                  >
                    <Pencil size={14} />
                    {t("Edit alternative", "Chỉnh giải pháp")}
                  </button>
                </>
              )}
              {competitor && inspector === "edit" && (
                <div className="pd-edit-fields">
                  <div className="lw-fields">
                    <Text
                      label={t("Alternative name", "Tên giải pháp")}
                      value={competitor.name}
                      onChange={(name) => updateCompetitor({ name })}
                    />
                    <label className="lw-field">
                      {t("Competition type", "Loại cạnh tranh")}
                      <select
                        value={competitor.kind}
                        onChange={(e) =>
                          updateCompetitor({
                            kind: e.target.value as Competitor["kind"],
                          })
                        }
                      >
                        <option value="direct">
                          {t("Direct", "Trực tiếp")}
                        </option>
                        <option value="indirect">
                          {t("Indirect", "Gián tiếp")}
                        </option>
                        <option value="alternative">
                          {t(
                            "Alternative / workaround",
                            "Thay thế / cách xử lý hiện tại",
                          )}
                        </option>
                      </select>
                    </label>
                    <NumberField
                      label={`${t("Comparable price / unit", "Giá so sánh / sản phẩm")} (${currency})`}
                      value={competitor.price}
                      onChange={(price) => updateCompetitor({ price })}
                    />
                    <NumberField
                      label={t(
                        "Job fit (1–5, assessed)",
                        "Đáp ứng nhu cầu (1–5, tự đánh giá)",
                      )}
                      min={1}
                      max={5}
                      value={competitor.jobFit}
                      onChange={(jobFit) => updateCompetitor({ jobFit })}
                    />
                    <Text
                      long
                      label={t(
                        "Configuration and normalization limits",
                        "Cấu hình và giới hạn quy đổi",
                      )}
                      value={competitor.configuration}
                      onChange={(configuration) =>
                        updateCompetitor({ configuration })
                      }
                    />
                    <Text
                      long
                      label={t("Strengths", "Thế mạnh")}
                      value={competitor.strengths}
                      onChange={(strengths) => updateCompetitor({ strengths })}
                    />
                    <Text
                      long
                      label={t(
                        "Gaps and open questions",
                        "Khoảng trống và câu hỏi mở",
                      )}
                      value={competitor.gaps}
                      onChange={(gaps) => updateCompetitor({ gaps })}
                    />
                  </div>
                  <Sources
                    ids={competitor.sourceIds}
                    onChange={(sourceIds) => updateCompetitor({ sourceIds })}
                    evidence={evidence}
                    vi={vi}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      change({
                        ...s,
                        competitors: s.competitors.filter(
                          (r) => r.id !== competitor.id,
                        ),
                      })
                    }
                  >
                    {t("Remove selected alternative", "Bỏ giải pháp đang chọn")}
                  </button>
                </div>
              )}
              {competitor && inspector === "sources" && (
                <Sources
                  ids={competitor.sourceIds}
                  onChange={(sourceIds) => updateCompetitor({ sourceIds })}
                  evidence={evidence}
                  vi={vi}
                />
              )}
            </div>
            {inspectorFooter}
          </aside>
        </div>
      )}
      {mode === "intelligence" && marketView === "signals" && (
        <div className="pd-full-canvas">
          <section className="si-section">
            <div className="si-section-title">
              <div>
                <span>03 / {t("MARKET SIGNALS", "TÍN HIỆU THỊ TRƯỜNG")}</span>
                <h3>
                  {t(
                    "Track a comparable metric over time.",
                    "Theo dõi một chỉ số nhất quán qua các kỳ.",
                  )}
                </h3>
              </div>
            </div>
            <SignalChart signal={s.signal} vi={vi} />
            <p>
              {s.signal.definition ||
                t(
                  "Define the metric, scope, unit and collection method before treating it as a market signal.",
                  "Định nghĩa chỉ số, phạm vi, đơn vị và cách thu thập trước khi dùng làm tín hiệu thị trường.",
                )}
            </p>
            <details className="si-editor">
              <summary>
                {t(
                  "Edit signal definition and observations",
                  "Chỉnh định nghĩa và các kỳ quan sát",
                )}
              </summary>
              <div className="lw-fields">
                <Text
                  label={t("Metric name", "Tên chỉ số")}
                  value={s.signal.metric}
                  onChange={(metric) =>
                    change({ ...s, signal: { ...s.signal, metric } })
                  }
                />
                <Text
                  label={t("Metric unit", "Đơn vị chỉ số")}
                  value={s.signal.unit}
                  onChange={(unit) =>
                    change({ ...s, signal: { ...s.signal, unit } })
                  }
                />
                <Text
                  long
                  label={t(
                    "Definition, scope and collection method",
                    "Định nghĩa, phạm vi và cách thu thập",
                  )}
                  value={s.signal.definition}
                  onChange={(definition) =>
                    change({ ...s, signal: { ...s.signal, definition } })
                  }
                />
              </div>
              <button
                className="btn btn-outline"
                disabled={s.signal.points.length >= 12}
                onClick={addSignal}
              >
                <Plus size={15} />
                {t("Add month", "Thêm kỳ tháng")}
              </button>
              {s.signal.points.map((p, i) => (
                <div className="si-observation" key={i}>
                  <div className="lw-fields">
                    <label className="lw-field">
                      {t("Observation month", "Tháng quan sát")}
                      <input
                        type="month"
                        value={p.month}
                        max={new Date().toISOString().slice(0, 7)}
                        onChange={(e) =>
                          change({
                            ...s,
                            signal: {
                              ...s.signal,
                              points: s.signal.points.map((r, j) =>
                                j === i ? { ...r, month: e.target.value } : r,
                              ),
                            },
                          })
                        }
                      />
                    </label>
                    <NumberField
                      label={`${t("Observed value", "Giá trị quan sát")} (${s.signal.unit || "—"})`}
                      value={p.value}
                      onChange={(value) =>
                        change({
                          ...s,
                          signal: {
                            ...s.signal,
                            points: s.signal.points.map((r, j) =>
                              j === i ? { ...r, value } : r,
                            ),
                          },
                        })
                      }
                    />
                  </div>
                  <Sources
                    ids={p.sourceIds}
                    onChange={(sourceIds) =>
                      change({
                        ...s,
                        signal: {
                          ...s.signal,
                          points: s.signal.points.map((r, j) =>
                            j === i ? { ...r, sourceIds } : r,
                          ),
                        },
                      })
                    }
                    evidence={evidence}
                    vi={vi}
                  />
                  <button
                    className="si-text-button"
                    onClick={() =>
                      change({
                        ...s,
                        signal: {
                          ...s.signal,
                          points: s.signal.points.filter((_, j) => j !== i),
                        },
                      })
                    }
                  >
                    {t("Remove month", "Bỏ kỳ tháng")}
                  </button>
                </div>
              ))}
            </details>
            <details className="si-data">
              <summary>{t("View signal data", "Xem dữ liệu tín hiệu")}</summary>
              <div className="lw-table">
                <table>
                  <caption>
                    {s.signal.metric ||
                      t("Monthly observations", "Quan sát theo tháng")}{" "}
                    · {s.signal.unit}
                  </caption>
                  <thead>
                    <tr>
                      <th>{t("Month", "Tháng")}</th>
                      <th>{t("Value", "Giá trị")}</th>
                      <th>
                        {t(
                          "Evidence IDs / hypothesis if absent",
                          "ID nguồn / giả thuyết nếu trống",
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...s.signal.points]
                      .sort((a, b) => a.month.localeCompare(b.month))
                      .map((p) => (
                        <tr key={p.month}>
                          <td>{p.month}</td>
                          <td>{p.value ?? t("Missing", "Thiếu")}</td>
                          <td>
                            {p.sourceIds.join(", ") ||
                              t(
                                "Unlinked / assumption",
                                "Chưa liên kết / giả định",
                              )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        </div>
      )}
      {mode === "gtm" && gtmView === "channels" && (
        <div className="pd-analysis">
          <section className="pd-canvas">
            <div className="pd-title">
              <div>
                <span className="si-eyebrow">GO-TO-MARKET STRATEGY</span>
                <h2>
                  {t(
                    "Test your route to revenue.",
                    "Kiểm chứng đường đi đến doanh thu.",
                  )}
                </h2>
                <p>
                  {t(
                    "Compare modeled acquisition outcomes before scaling.",
                    "So sánh kết quả thu hút theo mô hình trước khi mở rộng.",
                  )}
                </p>
              </div>
              <button
                className="btn btn-outline"
                disabled={s.channels.length >= 8}
                onClick={addChannel}
              >
                <Plus size={15} />
                {t("Add channel", "Thêm kênh")}
              </button>
            </div>
            <div className="si-controls">
              <label>
                {t("Inspect channel", "Kênh đang xem")}
                <select
                  value={channel?.id ?? ""}
                  onChange={(e) => selectChannel(e.target.value)}
                >
                  {!s.channels.length && (
                    <option value="">{t("No channels", "Chưa có kênh")}</option>
                  )}
                  {s.channels.map((r, i) => (
                    <option value={r.id} key={r.id}>
                      {r.name || `${t("Channel", "Kênh")} ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className="si-sensitivity"
                role="group"
                aria-label={t(
                  "Conversion sensitivity",
                  "Độ nhạy tỷ lệ chuyển đổi",
                )}
              >
                {[
                  [0.7, t("Conservative", "Thận trọng")],
                  [1, t("Base inputs", "Đầu vào gốc")],
                  [1.3, t("Upside", "Tích cực")],
                ].map(([n, label]) => (
                  <button
                    key={n}
                    aria-pressed={sensitivity === n}
                    onClick={() => setSensitivity(Number(n))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="si-caption">
              {t(
                "What-if conversion rates: 0.7× / 1× / 1.3× (capped at 100%). Not confidence intervals.",
                "Tỷ lệ chuyển đổi nếu-thì: 0,7× / 1× / 1,3× (tối đa 100%). Không phải khoảng tin cậy.",
              )}
            </p>
            <div className="si-stat-strip four">
              <div>
                <span>{t("Planned spend", "Ngân sách giả định")}</span>
                <strong>{fmt(channel?.budget ?? null)}</strong>
              </div>
              <div>
                <span>{t("Modeled customers", "Khách theo mô hình")}</span>
                <strong>{f?.customers ?? "—"}</strong>
              </div>
              <div>
                <span>{t("Modeled CAC", "CAC theo mô hình")}</span>
                <strong>{fmt(f?.cac ?? null)}</strong>
              </div>
              <div>
                <span>{t("Net contribution", "Đóng góp sau thu hút")}</span>
                <strong className={(f?.contribution ?? 0) < 0 ? "si-loss" : ""}>
                  {fmt(f?.contribution ?? null)}
                </strong>
              </div>
            </div>
            <ChannelCharts
              rows={s.channels}
              selected={channel?.id ?? ""}
              onSelect={selectChannel}
              multiplier={sensitivity}
              currency={currency}
              vi={vi}
            />
            <div className="pd-table-title">
              <h3>{t("Channel comparison", "So sánh kênh")}</h3>
            </div>
            <div className="pd-table-scroll">
              <table className="pd-table">
                <caption className="sr-only">
                  {t(
                    "Independent modeled channel scenarios",
                    "Kịch bản kênh độc lập theo mô hình",
                  )}
                </caption>
                <thead>
                  <tr>
                    <th>{t("Channel", "Kênh")}</th>
                    <th>{t("Customers", "Khách hàng")}</th>
                    <th>CAC ({currency})</th>
                    <th>
                      {t("Contribution", "Đóng góp")} ({currency})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {s.channels.map((r) => {
                    const v = channelForecast(r, sensitivity);
                    return (
                      <tr key={r.id} data-selected={channel?.id === r.id}>
                        <td>
                          <button
                            className="pd-row-select"
                            aria-pressed={channel?.id === r.id}
                            onClick={() => selectChannel(r.id)}
                          >
                            {r.name || "—"}
                          </button>
                        </td>
                        <td>{v.customers ?? "—"}</td>
                        <td>{fmt(v.cac)}</td>
                        <td
                          className={(v.contribution ?? 0) < 0 ? "si-loss" : ""}
                        >
                          {fmt(v.contribution)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <details className="si-editor">
              <summary>
                {t(
                  "Set the acquisition cohort and revenue horizon",
                  "Đặt cohort thu hút và kỳ doanh thu",
                )}
              </summary>
              <Text
                label={t(
                  "Cohort and revenue horizon",
                  "Cohort và kỳ doanh thu",
                )}
                value={s.horizon ?? ""}
                onChange={(horizon) => change({ ...s, horizon })}
              />
              <p>
                {t(
                  "Define whether revenue is from a first order, contract period or another stated window. Keep it consistent across scenarios.",
                  "Ghi rõ doanh thu từ đơn đầu, kỳ hợp đồng hoặc một khoảng thời gian xác định. Dùng nhất quán giữa các kịch bản.",
                )}
              </p>
            </details>
            <p className="si-caption">
              {t("Cohort / revenue horizon: ", "Cohort / kỳ doanh thu: ")}
              {s.horizon ||
                t(
                  "Not defined — set it before interpreting channel economics.",
                  "Chưa định nghĩa — hãy đặt trước khi diễn giải hiệu quả kênh.",
                )}
            </p>
            {channelTarget?.id !== s.positioning.segmentId && channelTarget && (
              <p className="si-scope-note">
                {t(
                  "The selected channel targets ",
                  "Kênh đang chọn hướng tới ",
                )}
                {channelTarget.name}
                {t(
                  ". Revisit the positioning promise for this segment.",
                  ". Cần rà lại lời hứa định vị cho phân khúc này.",
                )}
              </p>
            )}
          </section>
          <aside
            className="pd-inspector"
            aria-label={t(
              "Selected channel details",
              "Chi tiết kênh đang chọn",
            )}
          >
            <header>
              <span className="si-eyebrow">
                {t("SELECTED CHANNEL", "KÊNH ĐANG CHỌN")}
              </span>
              <h3>{channel?.name || t("Select a channel", "Chọn kênh")}</h3>
              {inspectorTabs}
            </header>
            <div className="pd-inspector-body">
              {channel && inspector === "summary" && (
                <>
                  <p className="pd-lead">
                    {channel.hypothesis ||
                      t(
                        "Define a bounded channel hypothesis.",
                        "Định nghĩa giả thuyết kênh có giới hạn.",
                      )}
                  </p>
                  <dl className="pd-attributes">
                    <dt>{t("Target segment", "Phân khúc mục tiêu")}</dt>
                    <dd>
                      {channelTarget?.name || t("Not selected", "Chưa chọn")}
                    </dd>
                    <dt>{t("Budget", "Ngân sách")}</dt>
                    <dd>{fmt(channel.budget)}</dd>
                    <dt>{t("Cost / visit", "Chi phí / truy cập")}</dt>
                    <dd>{fmt(channel.cpc)}</dd>
                    <dt>{t("Visit → lead", "Truy cập → lead")}</dt>
                    <dd>
                      {channel.leadRate === null
                        ? "—"
                        : `${(channel.leadRate * 100).toFixed(2)}%`}
                    </dd>
                    <dt>{t("Lead → customer", "Lead → khách")}</dt>
                    <dd>
                      {channel.winRate === null
                        ? "—"
                        : `${(channel.winRate * 100).toFixed(2)}%`}
                    </dd>
                    <dt>{t("Revenue / customer", "Doanh thu / khách")}</dt>
                    <dd>{fmt(channel.revenuePerCustomer)}</dd>
                    <dt>
                      {t(
                        "Contribution before acquisition / customer",
                        "Đóng góp trước thu hút / khách",
                      )}
                    </dt>
                    <dd>{fmt(channel.contributionPerCustomer)}</dd>
                  </dl>
                  <button
                    className="btn btn-teal pd-primary"
                    onClick={() => setInspector("edit")}
                  >
                    <Pencil size={15} />
                    {t("Edit channel assumptions", "Chỉnh giả định kênh")}
                  </button>
                  <p className="si-caption">
                    {t(
                      "Modeled outcomes, not observed demand. Each channel is an independent scenario.",
                      "Kết quả mô hình, chưa phải nhu cầu quan sát. Mỗi kênh là kịch bản độc lập.",
                    )}
                  </p>
                </>
              )}
              {channel && inspector === "edit" && (
                <div className="pd-edit-fields">
                  <div className="lw-fields">
                    <Text
                      label={t("Channel name", "Tên kênh")}
                      value={channel.name}
                      onChange={(name) => updateChannel({ name })}
                    />
                    <label className="lw-field">
                      {t("Target segment", "Phân khúc mục tiêu")}
                      <select
                        value={channel.segmentId ?? ""}
                        onChange={(e) =>
                          updateChannel({ segmentId: e.target.value || null })
                        }
                      >
                        <option value="">
                          {t("Not selected", "Chưa chọn")}
                        </option>
                        {s.segments.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name || "—"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <NumberField
                      label={`${t("Test budget", "Ngân sách thử")} (${currency})`}
                      value={channel.budget}
                      onChange={(budget) => updateChannel({ budget })}
                    />
                    <NumberField
                      label={`${t("Effective cost / visit (> 0)", "Chi phí hiệu dụng / lượt truy cập (> 0)")} (${currency})`}
                      min={0.000001}
                      value={channel.cpc}
                      onChange={(cpc) => updateChannel({ cpc })}
                    />
                    <NumberField
                      label={t("Visit → lead (%)", "Truy cập → lead (%)")}
                      rate
                      value={channel.leadRate}
                      onChange={(leadRate) => updateChannel({ leadRate })}
                    />
                    <NumberField
                      label={t("Lead → customer (%)", "Lead → khách hàng (%)")}
                      rate
                      value={channel.winRate}
                      onChange={(winRate) => updateChannel({ winRate })}
                    />
                    <NumberField
                      label={`${t("Revenue / acquired customer", "Doanh thu / khách thu hút")} (${currency})`}
                      value={channel.revenuePerCustomer}
                      onChange={(revenuePerCustomer) =>
                        updateChannel({ revenuePerCustomer })
                      }
                    />
                    <NumberField
                      label={`${t("Contribution / customer before acquisition", "Đóng góp / khách trước thu hút")} (${currency})`}
                      min={-1e10}
                      value={channel.contributionPerCustomer}
                      onChange={(contributionPerCustomer) =>
                        updateChannel({ contributionPerCustomer })
                      }
                    />
                    <Text
                      long
                      label={t(
                        "Channel hypothesis and limitations",
                        "Giả thuyết và giới hạn của kênh",
                      )}
                      value={channel.hypothesis}
                      onChange={(hypothesis) => updateChannel({ hypothesis })}
                    />
                  </div>
                  <p>
                    {t(
                      "Use the same cohort and revenue horizon for all channel inputs. Contribution must include product, fulfillment, fees and other variable costs, but exclude this acquisition budget. This model does not overwrite your launch cash assumptions.",
                      "Dùng cùng cohort và kỳ doanh thu cho mọi đầu vào kênh. Đóng góp đã trừ sản phẩm, fulfillment, phí và chi phí biến đổi khác nhưng chưa trừ ngân sách thu hút này. Mô hình không tự sửa giả định dòng tiền triển khai.",
                    )}
                  </p>
                  <Sources
                    ids={channel.sourceIds}
                    onChange={(sourceIds) => updateChannel({ sourceIds })}
                    evidence={evidence}
                    vi={vi}
                  />
                  <button
                    className="btn btn-outline"
                    disabled={s.plays.some((r) => r.channelId === channel.id)}
                    onClick={() =>
                      change({
                        ...s,
                        channels: s.channels.filter((r) => r.id !== channel.id),
                      })
                    }
                  >
                    {t(
                      "Remove channel (unlink launch plays first)",
                      "Bỏ kênh (bỏ liên kết công việc trước)",
                    )}
                  </button>
                </div>
              )}
              {channel && inspector === "sources" && (
                <Sources
                  ids={channel.sourceIds}
                  onChange={(sourceIds) => updateChannel({ sourceIds })}
                  evidence={evidence}
                  vi={vi}
                />
              )}
            </div>
            {inspectorFooter}
          </aside>
        </div>
      )}
      {mode === "gtm" && gtmView === "positioning" && (
        <div className="pd-full-canvas">
          <section className="si-section">
            <div className="si-section-title">
              <div>
                <span>
                  01 / {t("POSITIONING & OFFER", "ĐỊNH VỊ & ĐỀ XUẤT")}
                </span>
                <h3>
                  {t(
                    "One buyer. A clear promise. A reason to believe.",
                    "Một nhóm khách. Lời hứa rõ. Lý do để tin.",
                  )}
                </h3>
              </div>
            </div>
            <div
              className="si-route"
              aria-label={t(
                "Schematic route to market",
                "Sơ đồ đường đi ra thị trường",
              )}
            >
              {[
                [t("TARGET ICP", "ICP MỤC TIÊU"), target?.name],
                [t("VALUE PROMISE", "LỜI HỨA GIÁ TRỊ"), s.positioning.promise],
                [t("CHANNEL TEST", "THỬ NGHIỆM KÊNH"), channel?.name],
                [
                  t("DECISION GATE", "ĐIỀU KIỆN QUYẾT ĐỊNH"),
                  s.plays.find((p) => p.channelId === channel?.id)?.gate,
                ],
              ].map(([label, text], i) => (
                <div key={label}>
                  <span>
                    0{i + 1} / {label}
                  </span>
                  <strong>{text || t("Not defined", "Chưa định nghĩa")}</strong>
                  {i < 3 && <ArrowRight aria-hidden size={18} />}
                </div>
              ))}
            </div>
            <p className="si-caption">
              {t(
                "Schematic strategy links, not proven causality. Channel selection changes the route shown here.",
                "Liên kết chiến lược mang tính sơ đồ, không xác nhận quan hệ nhân quả. Đổi kênh để xem đường đi tương ứng.",
              )}
            </p>
            <details className="si-editor">
              <summary>
                {t("Edit positioning and offer", "Chỉnh định vị và đề xuất")}
              </summary>
              <label className="lw-field">
                {t("Target ICP", "ICP mục tiêu")}
                <select
                  value={s.positioning.segmentId ?? ""}
                  onChange={(e) =>
                    change({
                      ...s,
                      positioning: {
                        ...s.positioning,
                        segmentId: e.target.value || null,
                      },
                    })
                  }
                >
                  <option value="">{t("Not selected", "Chưa chọn")}</option>
                  {s.segments.map((r) => (
                    <option value={r.id} key={r.id}>
                      {r.name || "—"}
                    </option>
                  ))}
                </select>
              </label>
              <div className="lw-fields">
                {(
                  [
                    [
                      "category",
                      t(
                        "Category / frame of reference",
                        "Ngành hàng / khung tham chiếu",
                      ),
                    ],
                    [
                      "promise",
                      t("Customer promise", "Lời hứa với khách hàng"),
                    ],
                    [
                      "difference",
                      t("Meaningful difference", "Khác biệt có ý nghĩa"),
                    ],
                    [
                      "proof",
                      t(
                        "Reasons to believe / evidence still needed",
                        "Lý do để tin / bằng chứng còn thiếu",
                      ),
                    ],
                    [
                      "objection",
                      t("Main buying objection", "Rào cản mua hàng chính"),
                    ],
                    [
                      "offer",
                      t("Offer, price and terms", "Đề xuất, giá và điều kiện"),
                    ],
                  ] as const
                ).map(([key, label]) => (
                  <Text
                    key={key}
                    long
                    label={label}
                    value={s.positioning[key]}
                    onChange={(value) =>
                      change({
                        ...s,
                        positioning: { ...s.positioning, [key]: value },
                      })
                    }
                  />
                ))}
              </div>
            </details>
            <div className="si-positioning">
              <div>
                <span>{t("DIFFERENCE TO TEST", "KHÁC BIỆT CẦN THỬ")}</span>
                <p>{s.positioning.difference || "—"}</p>
              </div>
              <div>
                <span>{t("PROOF STILL NEEDED", "BẰNG CHỨNG CẦN CÓ")}</span>
                <p>{s.positioning.proof || "—"}</p>
              </div>
              <div>
                <span>{t("OFFER & TERMS", "ĐỀ XUẤT & ĐIỀU KIỆN")}</span>
                <p>{s.positioning.offer || "—"}</p>
              </div>
            </div>
          </section>
        </div>
      )}
      {mode === "gtm" && gtmView === "rollout" && (
        <div className="pd-full-canvas">
          <section className="si-section">
            <div className="si-section-title">
              <div>
                <span>
                  03 / {t("LAUNCH OPERATING PLAN", "KẾ HOẠCH TRIỂN KHAI")}
                </span>
                <h3>
                  {t(
                    "Give every launch play an owner and a gate.",
                    "Mỗi công việc có người phụ trách và điều kiện quyết định.",
                  )}
                </h3>
              </div>
              <button
                className="btn btn-outline"
                disabled={s.plays.length >= 12}
                onClick={() =>
                  change({
                    ...s,
                    plays: [
                      ...s.plays,
                      {
                        id: crypto.randomUUID(),
                        title: "",
                        phase: "discover",
                        startWeek: 1,
                        endWeek: 2,
                        owner: "",
                        channelId: null,
                        gate: "",
                        status: "planned",
                      },
                    ],
                  })
                }
              >
                <Plus size={15} />
                {t("Add launch play", "Thêm công việc triển khai")}
              </button>
            </div>
            <RolloutChart rows={s.plays} vi={vi} />
            <div className="si-play-list">
              {s.plays.map((r, i) => (
                <article key={r.id}>
                  <span className="si-play-number">{i + 1}</span>
                  <div>
                    <strong>
                      {r.title ||
                        t("Untitled launch play", "Công việc chưa đặt tên")}
                    </strong>
                    <small>
                      {t("Week", "Tuần")} {r.startWeek}–{r.endWeek} ·{" "}
                      {r.owner || t("Owner not assigned", "Chưa phân công")} ·{" "}
                      {r.status}
                    </small>
                    <p>
                      {r.gate ||
                        t(
                          "Decision gate not defined",
                          "Chưa định nghĩa điều kiện quyết định",
                        )}
                    </p>
                    <details className="si-editor">
                      <summary>
                        {t("Edit launch play", "Chỉnh công việc")}
                      </summary>
                      <div className="lw-fields">
                        <Text
                          label={t(
                            "Launch play title",
                            "Tên công việc triển khai",
                          )}
                          value={r.title}
                          onChange={(title) => updatePlay(r.id, { title })}
                        />
                        <Text
                          label={t("Owner", "Phụ trách")}
                          value={r.owner}
                          onChange={(owner) => updatePlay(r.id, { owner })}
                        />
                        <label className="lw-field">
                          {t("Phase", "Giai đoạn")}
                          <select
                            value={r.phase}
                            onChange={(e) =>
                              updatePlay(r.id, {
                                phase: e.target.value as Play["phase"],
                              })
                            }
                          >
                            {[
                              ["discover", t("Discover", "Khám phá")],
                              ["validate", t("Validate", "Kiểm chứng")],
                              ["launch", t("Launch", "Triển khai")],
                              [
                                "scale",
                                t("Scale decision", "Quyết định mở rộng"),
                              ],
                            ].map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="lw-field">
                          {t("Linked channel", "Kênh liên kết")}
                          <select
                            value={r.channelId ?? ""}
                            onChange={(e) =>
                              updatePlay(r.id, {
                                channelId: e.target.value || null,
                              })
                            }
                          >
                            <option value="">
                              {t("Not linked", "Chưa liên kết")}
                            </option>
                            {s.channels.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name || "—"}
                              </option>
                            ))}
                          </select>
                        </label>
                        <NumberField
                          label={t("Start week (1–13)", "Tuần bắt đầu (1–13)")}
                          min={1}
                          max={13}
                          value={r.startWeek}
                          onChange={(n) =>
                            updatePlay(r.id, {
                              startWeek: n ?? 1,
                              endWeek: Math.max(n ?? 1, r.endWeek),
                            })
                          }
                        />
                        <NumberField
                          label={t("End week (1–13)", "Tuần kết thúc (1–13)")}
                          min={r.startWeek}
                          max={13}
                          value={r.endWeek}
                          onChange={(n) =>
                            updatePlay(r.id, { endWeek: n ?? r.startWeek })
                          }
                        />
                        <label className="lw-field">
                          {t("Status", "Trạng thái")}
                          <select
                            value={r.status}
                            onChange={(e) =>
                              updatePlay(r.id, {
                                status: e.target.value as Play["status"],
                              })
                            }
                          >
                            <option value="planned">
                              {t("Planned", "Đã lên kế hoạch")}
                            </option>
                            <option value="running">
                              {t("Running", "Đang chạy")}
                            </option>
                            <option value="done">
                              {t(
                                "Done (user recorded)",
                                "Hoàn tất (người dùng ghi nhận)",
                              )}
                            </option>
                          </select>
                        </label>
                        <Text
                          long
                          label={t(
                            "Decision gate / success and stop criteria",
                            "Điều kiện quyết định / đạt và dừng",
                          )}
                          value={r.gate}
                          onChange={(gate) => updatePlay(r.id, { gate })}
                        />
                      </div>
                      <button
                        className="btn btn-outline"
                        onClick={() =>
                          change({
                            ...s,
                            plays: s.plays.filter((p) => p.id !== r.id),
                          })
                        }
                      >
                        {t("Remove launch play", "Bỏ công việc")}
                      </button>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
