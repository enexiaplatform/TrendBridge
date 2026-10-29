"use client";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/global";
import type { ResearchInput } from "@/lib/research/contract";

export default function ContributionChart({ rows, currency, locale }: { rows: { name: string; profit: number }[]; currency: ResearchInput["currency"]; locale: string }) {
  const max = Math.max(1, ...rows.map(row => Math.abs(row.profit)));
  const min = Math.min(0, ...rows.map(row => row.profit));
  return <div className="wb-chart" aria-hidden="true"><ResponsiveContainer width="100%" height={250} minWidth={1} initialDimension={{width:600,height:250}}><BarChart accessibilityLayer={false} data={rows} margin={{ top: 26, right: 16, bottom: 10, left: 8 }} barCategoryGap="30%">
    <CartesianGrid vertical={false} stroke="#edf1f6"/>
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#526788", fontSize: 12 }} interval={0} tickFormatter={value => String(value).length > 23 ? `${String(value).slice(0, 21)}…` : String(value)}/>
    <YAxis domain={[Math.min(-max * .45, min * 1.3), max * 1.3]} axisLine={false} tickLine={false} tick={{ fill: "#6d809b", fontSize: 12 }} width={70} tickFormatter={value => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)}/>
    <ReferenceLine y={0} stroke="#94a4b9"/>
    <Tooltip formatter={value => money(Number(value), currency, locale)} cursor={{ fill: "#f4f8fc" }}/>
    <Bar dataKey="profit" name="Contribution" maxBarSize={126} radius={[2, 2, 0, 0]} label={{ position: "top", fill: "#002b67", fontSize: 12, formatter: (value: unknown) => money(Number(value), currency, locale) }}>{rows.map((row, index) => <Cell key={index} fill={row.profit < 0 ? "#bd5145" : "#00a5a7"}/>)}</Bar>
  </BarChart></ResponsiveContainer></div>;
}
