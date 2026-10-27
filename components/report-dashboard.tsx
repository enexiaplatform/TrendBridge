"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Calculator, CheckCircle2, Download, ExternalLink, FileQuestion, Info, Plus, ShieldCheck } from "lucide-react";
import { calculateFinancials, formatVnd } from "@/lib/financial";

const initial = { sellingPrice: 99_000, purchaseCost: 35_000, logistics: 12_000, fulfillment: 0, packaging: 0, platformFeeRate: .2, paymentFeeRate: 0, advertising: 10_000, returnLossRate: 0, otherVariableCosts: 0 };
const tabs = ["Tổng quan", "Đối thủ", "Nhà cung cấp", "Tài chính", "Tín hiệu thị trường", "Rủi ro", "Chiến lược", "Nguồn bằng chứng"];

export function ReportDashboard() {
  const [input, setInput] = useState(initial);
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const output = useMemo(() => calculateFinancials(input), [input]);
  const sensitivity = useMemo(() => [69,79,89,99,109,119,129].map(k => {
    const o = calculateFinancials({ ...input, sellingPrice: k * 1000 });
    return { price: `${k}k`, profit: Math.round(o.contributionProfit) };
  }), [input]);

  const setNumber = (key: keyof typeof initial, raw: string) => setInput(v => ({ ...v, [key]: Math.max(0, Number(raw) || 0) }));
  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.text("TrendBridge AI - Product Validation", 18, 22);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
    ["Vacuum food storage container", `Revenue: ${formatVnd(output.revenue)}`, `Contribution profit: ${formatVnd(output.contributionProfit)}`, `Contribution margin: ${(output.contributionMargin*100).toFixed(2)}%`, `Break-even price: ${formatVnd(output.breakEvenPrice)}`, "Evidence note: market and supplier providers are not configured in this development report."].forEach((line,i)=>pdf.text(line,18,38+i*9));
    pdf.save("trendbridge-report-demo.pdf");
  };

  return <div className="page">
    <div className="page-title"><div><h1>Hộp bảo quản thực phẩm chân không</h1><p>Kịch bản QA minh họa · Việt Nam · Shopee · Cập nhật từ giả định người dùng</p></div><div className="actions"><button className="btn btn-outline" onClick={exportPdf}><Download size={16}/>Xuất PDF</button><Link className="btn btn-primary" href="/research/new"><Plus size={16}/>Phân tích sản phẩm mới</Link></div></div>
    <div className="kpi-grid">
      <section className="panel kpi verdict-kpi"><div className="kpi-label"><AlertTriangle size={15}/>Khuyến nghị</div><div className="kpi-value">TEST — Có điều kiện</div><div className="kpi-foot">Tài chính dương, nhưng chi phí nguồn cung và tuân thủ chưa được xác minh.</div></section>
      <section className="panel kpi"><div className="kpi-label"><Calculator size={15}/>Biên đóng góp <span className="data-tag tag-estimated">Ước tính</span></div><div className="kpi-value">{(output.contributionMargin*100).toFixed(2)}%</div><div className="kpi-foot">Dựa hoàn toàn trên giả định có thể chỉnh sửa bên dưới.</div></section>
      <section className="panel kpi"><div className="kpi-label"><ShieldCheck size={15}/>Giá hòa vốn <span className="data-tag tag-estimated">Ước tính</span></div><div className="kpi-value">{formatVnd(output.breakEvenPrice)}</div><div className="kpi-foot">Không bao gồm chi phí cố định và thuế chưa khai báo.</div></section>
      <section className="panel kpi"><div className="kpi-label"><Info size={15}/>Độ phủ bằng chứng</div><div className="kpi-value">Chưa đủ</div><div className="kpi-foot">0 nguồn thị trường · 0 nguồn cung · giả định tài chính do người dùng nhập.</div></section>
    </div>
    <div className="tabs" role="tablist">{tabs.map(tab=><button key={tab} role="tab" aria-selected={activeTab===tab} className={`tab ${activeTab===tab?"active":""}`} onClick={()=>setActiveTab(tab)}>{tab}</button>)}</div>
    {activeTab !== "Tổng quan" ? <ModuleState tab={activeTab}/> : <>
      <div className="analysis-grid">
        <section className="panel panel-pad"><div className="panel-title"><div><h2>Độ nhạy lợi nhuận theo giá bán</h2><p>Tự động tính lại — không gọi AI</p></div><span className="data-tag tag-estimated">Giả định</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={sensitivity} margin={{top:8,right:8,left:2,bottom:0}}><defs><linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#08a7c6" stopOpacity=".42"/><stop offset="1" stopColor="#08a7c6" stopOpacity=".03"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e4eaf1"/><XAxis dataKey="price" tick={{fontSize:10,fill:"#697991"}}/><YAxis tick={{fontSize:10,fill:"#697991"}} tickFormatter={v=>`${Math.round(v/1000)}k`}/><Tooltip formatter={(v)=>formatVnd(Number(v))}/><Area dataKey="profit" type="monotone" stroke="#0299bc" strokeWidth={2.5} fill="url(#profitFill)"/></AreaChart></ResponsiveContainer></div></section>
        <section className="panel panel-pad"><div className="panel-title"><div><h2>Phân bố giá cạnh tranh</h2><p>Chỉ hiển thị listing thực sự so sánh được</p></div><span className="data-tag tag-unavailable">Chưa khả dụng</span></div><div className="empty-state"><div><FileQuestion size={30}/><strong>Chưa có dữ liệu thị trường đã xác minh</strong><span>Cấu hình nhà cung cấp tìm kiếm hợp lệ để thu thập listing công khai. TrendBridge không dựng biểu đồ từ dữ liệu giả.</span></div></div></section>
        <section className="panel panel-pad"><div className="panel-title"><div><h2>Giả định tài chính</h2><p>Thay đổi đầu vào để kiểm tra kịch bản</p></div><span className="data-tag tag-estimated">Người dùng cung cấp</span></div><div className="field-grid">
          <NumberField label="Giá bán" value={input.sellingPrice} onChange={v=>setNumber("sellingPrice",v)}/><NumberField label="Giá mua" value={input.purchaseCost} onChange={v=>setNumber("purchaseCost",v)}/><NumberField label="Logistics" value={input.logistics} onChange={v=>setNumber("logistics",v)}/><NumberField label="Quảng cáo / đơn" value={input.advertising} onChange={v=>setNumber("advertising",v)}/><NumberField label="Phí nền tảng (%)" value={input.platformFeeRate*100} onChange={v=>setInput(x=>({...x,platformFeeRate:Math.min(1,(Number(v)||0)/100)}))}/><div className="field"><label>Lợi nhuận đóng góp</label><div style={{minHeight:44,display:"flex",alignItems:"center",fontWeight:800,color:output.contributionProfit>=0?"#098564":"#d13f4f"}}>{formatVnd(output.contributionProfit)}</div></div>
        </div></section>
        <section className="panel panel-pad"><div className="panel-title"><div><h2>Ma trận rủi ro</h2><p>Phân biệt bằng chứng, giả định và điểm chưa biết</p></div><span className="data-tag tag-risk">Cần xác minh</span></div><div className="risk-matrix"><div className="matrix"><span className="risk-point red" style={{left:"65%",top:"17%"}}><i/>Vật liệu & chất lượng</span><span className="risk-point" style={{left:"42%",top:"53%"}}><i/>Nguồn cung</span><span className="risk-point" style={{left:"16%",top:"74%"}}><i/>Tài chính</span></div><div className="risk-summary"><RiskRow n="1" title="Vật liệu tiếp xúc thực phẩm" text="Cần xác minh hồ sơ và công bố phù hợp."/><RiskRow n="2" title="Giá & MOQ nguồn cung" text="Chưa có báo giá hợp lệ."/><RiskRow n="3" title="Chi phí thu hút khách" text="Đang dùng giả định 10.000 ₫/đơn."/></div></div></section>
      </div>
      <section className="panel evidence-rail"><div><strong>Bằng chứng chi tiết</strong><div style={{fontSize:11,color:"#68788e",marginTop:3}}>Chưa có nguồn ngoài được cấu hình cho báo cáo phát triển này.</div></div><div className="evidence-counts"><span className="data-tag tag-verified">0 đã xác minh</span><span className="data-tag tag-estimated">5 giả định</span><span className="data-tag tag-unavailable">3 chưa khả dụng</span></div></section>
    </>}
  </div>;
}

function NumberField({label,value,onChange}:{label:string;value:number;onChange:(v:string)=>void}) { const id=useId(); return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type="number" min="0" value={value} onChange={e=>onChange(e.target.value)}/></div>; }
function RiskRow({n,title,text}:{n:string;title:string;text:string}) { return <div className="risk-summary-row"><div className="risk-index">{n}</div><div><strong>{title}</strong><span>{text}</span></div></div>; }

function ModuleState({tab}:{tab:string}) {
  const map:Record<string,{title:string;body:string;status:string}> = {
    "Đối thủ": {title:"Chưa có listing đối thủ hợp lệ",body:"Module sẵn sàng nhận dữ liệu từ adapter tìm kiếm. Chỉ các sản phẩm cùng cấu hình mới được đưa vào so sánh.",status:"Chưa cấu hình nguồn"},
    "Nhà cung cấp": {title:"Chưa có nguồn cung được xác minh",body:"Việc tìm thấy một listing không đồng nghĩa với xác minh danh tính hoặc kiểm toán chất lượng nhà cung cấp.",status:"Chưa cấu hình nguồn"},
    "Tài chính": {title:"Mô hình tài chính đang hoạt động",body:"Điều chỉnh giả định tại tab Tổng quan. Tất cả phép tính được thực hiện bằng engine xác định và kiểm thử tự động.",status:"Hoạt động"},
    "Tín hiệu thị trường": {title:"Không đủ dữ liệu đã xác minh",body:"Không có chuỗi thời gian hợp lệ để kết luận nhu cầu hoặc xu hướng. Không hiển thị search volume, GMV hay tăng trưởng giả.",status:"Không đủ dữ liệu"},
    "Rủi ro": {title:"Ba nhóm rủi ro cần xử lý",body:"Ưu tiên xác minh vật liệu tiếp xúc thực phẩm, báo giá/MOQ và chi phí thu hút khách hàng trước khi nhập hàng.",status:"Cần xác minh"},
    "Chiến lược": {title:"Giả thuyết khác biệt hóa sẽ xuất hiện tại đây",body:"Đề xuất chiến lược chỉ được tạo khi có đủ bằng chứng đầu vào và luôn được gắn nhãn là giả thuyết cần kiểm chứng.",status:"Chưa tạo"},
    "Nguồn bằng chứng": {title:"Sổ bằng chứng chưa có bản ghi ngoài",body:"Mỗi claim sẽ liên kết tới URL, thời điểm truy xuất, loại nguồn và giới hạn xác minh khi adapter được cấu hình.",status:"0 nguồn"},
  };
  const item=map[tab]; return <section className="panel panel-pad"><div className="panel-title"><div><h2>{tab}</h2><p>Trạng thái module trong môi trường phát triển</p></div><span className={`data-tag ${item.status==="Hoạt động"?"tag-verified":"tag-unavailable"}`}>{item.status}</span></div><div className="empty-state"><div>{item.status==="Hoạt động"?<CheckCircle2 size={32}/>:<FileQuestion size={32}/>}<strong>{item.title}</strong><span>{item.body}</span></div></div>{tab==="Nguồn bằng chứng"&&<a className="btn btn-outline" href="https://supabase.com/docs/guides/database/postgres/row-level-security" target="_blank" rel="noreferrer" style={{marginTop:14}}>Thiết kế lưu trữ có RLS <ExternalLink size={14}/></a>}</section>;
}
