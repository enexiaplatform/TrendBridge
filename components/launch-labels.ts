const labels:Record<string,[string,string]>={
  exploring:["Exploring","Khám phá"],researching:["Researching","Nghiên cứu"],validating:["Validating","Kiểm chứng"],decision:["Ready for decision","Chờ quyết định"],paused:["Paused","Tạm dừng"],rejected:["Rejected","Không tiếp tục"],launched:["Launched","Đã ra mắt"],
  market:["Market","Thị trường"],competitor:["Competitor","Đối thủ"],customer:["Customer","Khách hàng"],supplier:["Supplier","Nguồn cung"],
  comparable:["Comparable","Cùng cấu hình"],partial:["Partial match","Phù hợp một phần"],excluded:["Excluded","Loại khỏi so sánh"],not_applicable:["Not applicable","Không áp dụng"],
  planned:["Planned","Đã lên kế hoạch"],running:["Running","Đang thực hiện"],passed:["Passed (user recorded)","Đạt (người dùng ghi)"],failed:["Failed","Không đạt"],stopped:["Stopped","Đã dừng"],
  ready:["Model complete","Đủ đầu vào mô hình"],incomplete:["Incomplete","Thiếu đầu vào"],stockout:["Infeasible stockout","Thiếu hàng, không khả thi"],out_of_range:["Amounts out of range","Số liệu vượt giới hạn"],
  continue:["Continue","Tiếp tục"],revise:["Revise","Điều chỉnh"],stop:["Stop","Dừng"],
};
export function launchLabel(value:string,vi:boolean){return labels[value]?.[vi?1:0]??value;}
