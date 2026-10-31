"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  channelForecast,
  monthlySignal,
  type Channel,
  type Competitor,
  type Play,
  type Segment,
  type Strategy,
} from "@/lib/strategy/model";

function Frame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: (width: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(600),
    id = useId();
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, Math.round(entry.contentRect.width))),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <figure className="si-figure" aria-labelledby={id}>
      <figcaption id={id}>
        {title}
        <small>{description}</small>
      </figcaption>
      <div ref={ref} className="si-chart">
        {children(width)}
      </div>
    </figure>
  );
}
const compact = (v: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
function Grid({
  width,
  height = 250,
  xMin = 0,
  xMax,
  yMin = 0,
  yMax,
  xLabel,
  yLabel,
}: {
  width: number;
  height?: number;
  xMin?: number;
  xMax: number;
  yMin?: number;
  yMax: number;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <g className="si-grid">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line
            x1={48 + t * (width - 70)}
            x2={48 + t * (width - 70)}
            y1={36}
            y2={height - 42}
          />
          <line
            x1={48}
            x2={width - 22}
            y1={height - 42 - t * (height - 78)}
            y2={height - 42 - t * (height - 78)}
          />
          <text x={39} y={height - 38 - t * (height - 78)} textAnchor="end">
            {compact(yMin + t * (yMax - yMin))}
          </text>
          <text x={48 + t * (width - 70)} y={height - 24} textAnchor="middle">
            {compact(xMin + t * (xMax - xMin))}
          </text>
        </g>
      ))}
      <text x={(width + 26) / 2} y={height - 3} textAnchor="middle">
        {xLabel}
      </text>
      <text x={48} y={15}>
        {yLabel}
      </text>
    </g>
  );
}
function Mark({
  x,
  y,
  label,
  name,
  selected,
  onSelect,
}: {
  x: number;
  y: number;
  label: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={name}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={selected ? "si-mark selected" : "si-mark"}
    >
      <title>{name}</title>
      <circle cx={x} cy={y} r={22} fill="transparent" />
      <circle cx={x} cy={y} r={selected ? 11 : 8} />
      <text x={x} y={y + 4} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
export function SegmentMap({
  rows,
  selected,
  onSelect,
  vi,
}: {
  rows: Segment[];
  selected: string;
  onSelect: (id: string) => void;
  vi: boolean;
}) {
  const points = rows.filter(
    (r) =>
      r.urgency !== null &&
      Number.isInteger(r.urgency) &&
      r.urgency >= 1 &&
      r.urgency <= 5 &&
      r.accessibility !== null &&
      Number.isInteger(r.accessibility) &&
      r.accessibility >= 1 &&
      r.accessibility <= 5,
  );
  return (
    <Frame
      title={vi ? "Bản đồ ưu tiên phân khúc" : "Segment priority map"}
      description={
        vi
          ? "Đánh giá giả định 1–5. Kích thước điểm không biểu thị quy mô thị trường."
          : "Assessed ratings, 1–5. Equal-sized points do not represent market size."
      }
    >
      {(width) => (
        <>
          <svg
            width="100%"
            height={250}
            viewBox={`0 0 ${width} 250`}
            role="img"
            aria-label={
              vi
                ? "Ma trận khả năng tiếp cận và mức cấp thiết"
                : "Accessibility versus problem urgency"
            }
          >
            <Grid
              width={width}
              xMin={1}
              xMax={5}
              yMax={5}
              yMin={1}
              xLabel={vi ? "Khả năng tiếp cận →" : "Accessibility →"}
              yLabel={vi ? "Mức cấp thiết" : "Problem urgency"}
            />
            {points.map((p) => {
              const x = 48 + ((p.accessibility! - 1) / 4) * (width - 70),
                y = 208 - ((p.urgency! - 1) / 4) * 172;
              return (
                <g key={p.id}>
                  <Mark
                    x={x}
                    y={y}
                    label={String(rows.indexOf(p) + 1)}
                    name={`${p.name}: ${p.accessibility}/5, ${p.urgency}/5`}
                    selected={selected === p.id}
                    onSelect={() => onSelect(p.id)}
                  />
                  {width > 420 && (
                    <text
                      x={x}
                      y={y - 18}
                      textAnchor={
                        x > width * 0.75 ? "end" : x < 100 ? "start" : "middle"
                      }
                      className="si-point-label"
                    >
                      {p.name.length > 25 ? p.name.slice(0, 24) + "…" : p.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {!points.length && (
            <p className="si-empty">
              {vi
                ? "Thêm phân khúc và hai đánh giá để hiện bản đồ."
                : "Add a segment and both ratings to plot the map."}
            </p>
          )}
          <div className="si-key">
            {rows.map((r, i) => (
              <button
                key={r.id}
                aria-pressed={selected === r.id}
                onClick={() => onSelect(r.id)}
              >
                <b>{i + 1}</b>
                {r.name || (vi ? "Chưa đặt tên" : "Unnamed segment")}
              </button>
            ))}
          </div>
        </>
      )}
    </Frame>
  );
}
export function CompetitiveMap({
  rows,
  selected,
  onSelect,
  currency,
  vi,
}: {
  rows: Competitor[];
  selected: string;
  onSelect: (id: string) => void;
  currency: string;
  vi: boolean;
}) {
  const points = rows.filter(
      (r) =>
        r.price !== null &&
        Number.isFinite(r.price) &&
        r.price >= 0 &&
        r.price <= 1e10 &&
        r.jobFit !== null &&
        Number.isInteger(r.jobFit) &&
        r.jobFit >= 1 &&
        r.jobFit <= 5,
    ),
    max = Math.max(1, ...points.map((r) => r.price!)) * 1.15;
  return (
    <Frame
      title={
        vi
          ? "Bản đồ giá và mức đáp ứng nhu cầu"
          : "Price is only one side of the competitive story."
      }
      description={`${vi ? "Giá mỗi sản phẩm cùng cấu hình; đánh giá nhu cầu 1–5 do bạn nhập." : "Comparable unit price; job-fit ratings 1–5 are user assessments."} ${currency}.`}
    >
      {(width) => (
        <>
          <svg
            width="100%"
            height={250}
            viewBox={`0 0 ${width} 250`}
            role="img"
            aria-label={
              vi ? "Giá theo mức đáp ứng nhu cầu" : "Price versus job fit"
            }
          >
            <Grid
              width={width}
              xMax={max}
              yMax={5}
              yMin={1}
              xLabel={`${vi ? "Giá / sản phẩm" : "Price / unit"} (${currency}) →`}
              yLabel={vi ? "Đáp ứng nhu cầu" : "Job fit"}
            />
            {points.map((p) => (
              <Mark
                key={p.id}
                x={48 + (p.price! / max) * (width - 70)}
                y={208 - ((p.jobFit! - 1) / 4) * 172}
                label={String(rows.indexOf(p) + 1)}
                name={`${p.name}: ${p.price} ${currency}, ${p.jobFit}/5`}
                selected={selected === p.id}
                onSelect={() => onSelect(p.id)}
              />
            ))}
          </svg>
          {!points.length && (
            <p className="si-empty">
              {vi
                ? "Chưa có đủ giá và đánh giá để vẽ điểm."
                : "No alternatives with both a price and fit rating yet."}
            </p>
          )}
          <div className="si-key">
            {rows.map((r, i) => (
              <button
                key={r.id}
                aria-pressed={selected === r.id}
                onClick={() => onSelect(r.id)}
              >
                <b>{i + 1}</b>
                {r.name || (vi ? "Chưa đặt tên" : "Unnamed alternative")}
              </button>
            ))}
          </div>
        </>
      )}
    </Frame>
  );
}
export function SignalChart({
  signal,
  vi,
}: {
  signal: Strategy["signal"];
  vi: boolean;
}) {
  const rows = monthlySignal(signal),
    max = Math.max(1, ...(rows ?? []).map((p) => p.value ?? 0)) * 1.1;
  return (
    <Frame
      title={
        signal.metric ||
        (vi ? "Tín hiệu theo tháng" : "A monthly signal, with its gaps intact.")
      }
      description={`${signal.unit || (vi ? "Chưa định nghĩa đơn vị" : "Unit not defined")} · ${vi ? "Thiếu dữ liệu không được nội suy. Không phải dự báo." : "Missing months are not interpolated. This is not a forecast."}`}
    >
      {(width) => (
        <>
          {rows && rows.length > 0 ? (
            <svg
              width="100%"
              height={230}
              viewBox={`0 0 ${width} 230`}
              role="img"
              aria-label={signal.metric}
            >
              {[0, 0.5, 1].map((t) => (
                <g className="si-grid" key={t}>
                  <line
                    x1={48}
                    x2={width - 24}
                    y1={183 - t * 145}
                    y2={183 - t * 145}
                  />
                  <text x={40} y={187 - t * 145} textAnchor="end">
                    {compact(t * max)}
                  </text>
                </g>
              ))}
              {rows.map((p, i) => {
                const x =
                    48 + (i / Math.max(1, rows.length - 1)) * (width - 76),
                  y = 183 - ((p.value ?? 0) / max) * 145,
                  previous = rows[i - 1],
                  previousX =
                    48 +
                    ((i - 1) / Math.max(1, rows.length - 1)) * (width - 76);
                return (
                  <g key={p.month}>
                    {p.value !== null &&
                      previous?.value !== null &&
                      previous?.value !== undefined && (
                        <line
                          x1={previousX}
                          y1={183 - (previous.value / max) * 145}
                          x2={x}
                          y2={y}
                          stroke="#009b9b"
                          strokeWidth={2.5}
                        />
                      )}{" "}
                    {p.value !== null ? (
                      <>
                        <circle cx={x} cy={y} r={4.5} fill="#009b9b" />
                        {(rows.length <= (width > 550 ? 12 : 6) ||
                          i % Math.ceil(rows.length / 4) === 0) && (
                          <text
                            x={x}
                            y={y - 11}
                            textAnchor="middle"
                            className="si-value"
                          >
                            {compact(p.value)}
                          </text>
                        )}
                      </>
                    ) : (
                      <text
                        x={x}
                        y={185}
                        textAnchor="middle"
                        className="si-value"
                      >
                        ?
                      </text>
                    )}
                    {(i % Math.ceil(rows.length / (width > 550 ? 6 : 3)) ===
                      0 ||
                      i === rows.length - 1) && (
                      <text
                        x={x}
                        y={210}
                        textAnchor="middle"
                        className="si-axis-text"
                      >
                        {p.month}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          ) : (
            <p className="si-empty">
              {rows === null
                ? vi
                  ? "Kiểm tra kỳ, giá trị và giới hạn chuỗi 36 tháng."
                  : "Check periods, values and the 36-month series limit."
                : vi
                  ? "Thêm quan sát có kỳ và đơn vị để hiện tín hiệu."
                  : "Add dated observations and a unit to see the signal."}
            </p>
          )}
        </>
      )}
    </Frame>
  );
}
export function ChannelCharts({
  rows,
  selected,
  onSelect,
  multiplier,
  currency,
  vi,
}: {
  rows: Channel[];
  selected: string;
  onSelect: (id: string) => void;
  multiplier: number;
  currency: string;
  vi: boolean;
}) {
  const current = rows.find((r) => r.id === selected) ?? rows[0],
    f = current ? channelForecast(current, multiplier) : null;
  const calculated = rows.map((r) => ({
      row: r,
      f: channelForecast(r, multiplier),
    })),
    max = Math.max(
      1,
      ...calculated.map((r) => Math.abs(r.f.contribution ?? 0)),
    );
  return (
    <div className="si-chart-pair">
      <Frame
        title={
          vi
            ? "Từ lượt truy cập đến khách hàng"
            : "Trace one acquisition cohort."
        }
        description={
          current
            ? `${current.name} · ${vi ? "Tỷ lệ đầu vào" : "Input rates"}: ${current.leadRate === null ? "—" : (Math.min(1, current.leadRate * multiplier) * 100).toFixed(1) + "%"} → ${current.winRate === null ? "—" : (Math.min(1, current.winRate * multiplier) * 100).toFixed(1) + "%"}`
            : vi
              ? "Chọn hoặc thêm kênh"
              : "Select or add a channel"
        }
      >
        {(width) => (
          <>
            {f?.status === "modeled" ? (
              <svg
                width="100%"
                height={220}
                viewBox={`0 0 ${width} 220`}
                role="img"
                aria-label={
                  vi ? "Phễu chuyển đổi giả định" : "Modeled acquisition funnel"
                }
              >
                {[
                  [vi ? "Lượt truy cập" : "Visits", f.visits],
                  [vi ? "Lead" : "Leads", f.leads],
                  [vi ? "Khách hàng" : "Customers", f.customers],
                ].map(([label, value], i) => (
                  <g key={label}>
                    <text x={0} y={28 + i * 62} className="si-axis-text">
                      {label}
                    </text>
                    <rect
                      x={0}
                      y={38 + i * 62}
                      width={Math.max(
                        0,
                        (Number(value) / Math.max(1, f.visits!)) * (width - 65),
                      )}
                      height={17}
                      rx={3}
                      fill={i === 2 ? "#009b9b" : "#1e68c9"}
                      opacity={0.5 + i * 0.25}
                    />
                    <text
                      x={width - 4}
                      y={52 + i * 62}
                      textAnchor="end"
                      className="si-value"
                    >
                      {Number(value).toLocaleString()}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <p className="si-empty">
                {vi
                  ? "Cần ngân sách, chi phí truy cập và cả hai tỷ lệ chuyển đổi hợp lệ."
                  : "Add budget, cost per visit and both valid conversion rates."}
              </p>
            )}
          </>
        )}
      </Frame>
      <Frame
        title={
          vi
            ? "Đóng góp sau chi phí thu hút"
            : "Which channel clears its acquisition spend?"
        }
        description={`${currency} · ${vi ? "Đóng góp trước thu hút × khách hàng − ngân sách. Các kênh là kịch bản độc lập." : "Pre-acquisition contribution × customers − budget. Independent channel scenarios."}`}
      >
        {(width) => (
          <>
            {calculated.length ? (
              <svg
                width="100%"
                height={Math.max(200, calculated.length * 65 + 20)}
                viewBox={`0 0 ${width} ${Math.max(200, calculated.length * 65 + 20)}`}
                role="img"
                aria-label={
                  vi
                    ? "So sánh đóng góp theo kênh"
                    : "Modeled channel contribution comparison"
                }
              >
                {calculated.map(({ row, f }, i) => {
                  const half = (width - 100) / 2,
                    center = half + 10,
                    value = f.contribution;
                  return (
                    <g
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      aria-label={row.name}
                      aria-pressed={selected === row.id}
                      onClick={() => onSelect(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(row.id);
                        }
                      }}
                    >
                      <rect
                        x={0}
                        y={i * 65}
                        width={width}
                        height={61}
                        rx={4}
                        fill={selected === row.id ? "#eef6ff" : "transparent"}
                      />
                      <text x={8} y={i * 65 + 18} className="si-axis-text">
                        {row.name.slice(0, width < 450 ? 23 : 42) || `${i + 1}`}
                      </text>
                      <line
                        x1={center}
                        x2={center}
                        y1={i * 65 + 25}
                        y2={i * 65 + 49}
                        stroke="#9eafc3"
                      />
                      {value !== null && (
                        <rect
                          x={
                            value < 0
                              ? center - (Math.abs(value) / max) * half
                              : center
                          }
                          y={i * 65 + 30}
                          width={(Math.abs(value) / max) * half}
                          height={12}
                          fill={value < 0 ? "#b24b3e" : "#009b9b"}
                          rx={2}
                        />
                      )}
                      <text
                        x={width - 8}
                        y={i * 65 + 43}
                        textAnchor="end"
                        className="si-value"
                      >
                        {value === null ? "—" : compact(value)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <p className="si-empty">
                {vi
                  ? "Thêm kênh để so sánh các kịch bản."
                  : "Add channels to compare their modeled outcomes."}
              </p>
            )}
          </>
        )}
      </Frame>
    </div>
  );
}
export function RolloutChart({ rows, vi }: { rows: Play[]; vi: boolean }) {
  const valid = rows.filter(
    (r) =>
      Number.isInteger(r.startWeek) &&
      Number.isInteger(r.endWeek) &&
      r.startWeek >= 1 &&
      r.endWeek >= r.startWeek &&
      r.endWeek <= 13,
  );
  return (
    <Frame
      title={
        vi
          ? "Lộ trình triển khai 13 tuần"
          : "A thirteen-week path from discovery to a scale decision."
      }
      description={
        vi
          ? "Tuần tương đối, không phải ngày cam kết. Xem gate và người phụ trách ở bảng."
          : "Relative weeks, not committed dates. Inspect owners and decision gates in the table."
      }
    >
      {(width) => (
        <>
          {valid.length ? (
            <svg
              width="100%"
              height={valid.length * 42 + 55}
              viewBox={`0 0 ${width} ${valid.length * 42 + 55}`}
              role="img"
              aria-label={
                vi ? "Lộ trình 13 tuần" : "Thirteen-week rollout schedule"
              }
            >
              {Array.from({ length: 13 }, (_, i) => (
                <g key={i} className="si-grid">
                  <line
                    x1={34 + (i / 13) * (width - 45)}
                    x2={34 + (i / 13) * (width - 45)}
                    y1={20}
                    y2={valid.length * 42 + 30}
                  />
                  {(width > 500 || i % 3 === 0) && (
                    <text
                      x={34 + ((i + 0.5) / 13) * (width - 45)}
                      y={14}
                      textAnchor="middle"
                    >
                      {i + 1}
                    </text>
                  )}
                </g>
              ))}
              {valid.map((r, i) => (
                <g key={r.id}>
                  <text x={5} y={i * 42 + 44} className="si-axis-text">
                    {rows.indexOf(r) + 1}
                  </text>
                  <rect
                    x={34 + ((r.startWeek - 1) / 13) * (width - 45)}
                    y={i * 42 + 28}
                    width={((r.endWeek - r.startWeek + 1) / 13) * (width - 45)}
                    height={25}
                    rx={4}
                    fill={
                      r.status === "done"
                        ? "#009b9b"
                        : r.status === "running"
                          ? "#155fbe"
                          : "#d8e6f7"
                    }
                  />
                  <title>
                    {r.title}: {r.startWeek}–{r.endWeek}; {r.owner}; {r.gate}
                  </title>
                </g>
              ))}
            </svg>
          ) : (
            <p className="si-empty">
              {vi
                ? "Thêm công việc, người phụ trách và điều kiện quyết định."
                : "Add a launch play, an owner and a decision gate."}
            </p>
          )}
        </>
      )}
    </Frame>
  );
}
