# TrendBridge v2 — từ nghiên cứu đến kế hoạch ra thị trường

Ngày nghiên cứu: 29/10/2026. Trạng thái: đặc tả sản phẩm và backlog đề xuất; chưa triển khai các module mới trong tài liệu này.

Cập nhật triển khai: các công cụ planning nội bộ đã được xây trong phiên tiếp theo. Xem [IMPLEMENTATION_V2.md](IMPLEMENTATION_V2.md) để phân biệt chức năng đã có, giới hạn pilot và các gate nghiên cứu/thanh toán/team chưa hoàn tất. Các mô tả khả năng đích dưới đây không phải tuyên bố toàn bộ đã triển khai.

Tài liệu này mở rộng kế hoạch ngày 29/10 bằng hai nhóm tham chiếu người dùng bổ sung: Metric và Apollo, cùng các công cụ business planning. Giữ hướng thiết kế 2 đã triển khai tại commit `8fb1bd9`; thay trọng tâm phát triển từ chỉnh giao diện sang năng lực sản phẩm. Các kết luận về TrendBridge bên dưới dựa trên source hiện tại, không phải audit UI/accessibility mới.

## 1. Quyết định sản phẩm

**TrendBridge giúp nhóm kinh doanh chọn cơ hội sản phẩm, kiểm chứng bằng chứng và chuyển thành kế hoạch launch có thể thực hiện, có mô hình vốn và điều kiện dừng.**

Luồng hoàn chỉnh: Discover → Shortlist → Research → Compare → Plan → Validate → Review.

Khách hàng pilot đề xuất: chủ thương hiệu và nhóm ecommerce nhỏ đánh giá sản phẩm vật lý mới. Một project có thể có nhiều cơ hội; một cơ hội có đúng phạm vi sản phẩm × thị trường × kênh. Hỗ trợ global qua cấu trúc dữ liệu và coverage công khai, không hứa cùng độ sâu cho mọi quốc gia.

Apollo là tham chiếu về cách dữ liệu dẫn tới công việc, không phải lý do biến TrendBridge thành công cụ gửi email hàng loạt. Business planning tập trung launch sản phẩm; chưa mở rộng sang kế toán hoặc lập kế hoạch mọi loại doanh nghiệp.

## 2. Nghiên cứu sản phẩm tham chiếu

Chỉ nghiên cứu trang sản phẩm/tài liệu công khai chính thức, chưa dùng tài khoản trả phí hoặc xác nhận độc lập độ chính xác dữ liệu của các hãng. Không đánh giá thị giác hay hiệu suất UI đối thủ từ mô tả website. Các tính năng dưới đây là hãng công bố; cột áp dụng là đề xuất của TrendBridge.

| Tham chiếu | Khả năng được công bố | Cách áp dụng cụ thể | Phụ thuộc và giới hạn |
|---|---|---|---|
| [Metric](https://metric.vn/) | Nghiên cứu ngành hàng, xu hướng, đối thủ; nghiên cứu chuyên sâu và đầu ra Excel/PDF/dashboard | Market Explorer có scope rõ, drill-down từ ngành hàng tới tập sản phẩm so sánh; lưu kết quả vào project | Dữ liệu của Metric không mặc nhiên được dùng lại. Chưa có thỏa thuận API, coverage hay license nào được xác nhận |
| [Apollo Data](https://www.apollo.io/product/b2b-data) | Tìm/lọc dữ liệu doanh nghiệp, enrichment và tín hiệu; refresh bản ghi | Search → saved list → entity detail → next action; bộ lọc lưu được và trạng thái cập nhật rõ | Không hứa contact database hay buying intent tương đương Apollo; B2B target accounts là nhánh sau pilot |
| [Apollo Workspace](https://www.apollo.io/product/workspace) | Danh sách, hàng đợi công việc, hướng dẫn hành động và analytics trong workspace | Một opportunity có owner, giai đoạn, evidence gaps và việc tiếp theo; kết quả test quay lại cập nhật quyết định | Chưa làm outreach tự động, dialer hay CRM tổng quát |
| [LivePlan Market Research](https://www.liveplan.com/features/market-research) | TAM/SAM/SOM, khách hàng, đối thủ và benchmark nối vào kế hoạch | Nghiên cứu thành các giả định có thể sửa và dẫn nguồn trong plan, thay vì bài viết tách rời | Hãng nêu giới hạn nguồn công khai/paywall và dữ liệu theo địa lý. TrendBridge cần công bố giới hạn tương tự theo khả năng thực tế |
| [LivePlan Cash Flow](https://www.liveplan.com/features/cash-flow-forecast) | Dự báo tiền, scenario và so sánh kế hoạch với thực tế | Launch cash planner theo tháng: tiền nhập hàng, tiền thu về, vốn thấp nhất và thiếu hụt | Không thể thay cash flow bằng contribution × sản lượng; cần thời điểm thanh toán và tồn kho |
| [Upmetrics](https://upmetrics.co/) | Plan builder, forecast liên kết, pitch deck, canvas và cộng tác | Plan gồm các block có cấu trúc; sửa số liệu cập nhật bảng, biểu đồ và narrative; deck lấy cùng phiên bản | Chỉ lấy nguyên tắc liên kết; chưa hứa báo cáo đủ chuẩn vay vốn hay bộ ba báo cáo kế toán |
| [Similarweb Market Intelligence](https://www.similarweb.com/corp/web/market-intelligence/) | Custom market, vùng địa lý, demand và cạnh tranh | Người dùng định nghĩa competitive set và lưu view theo thị trường; so sánh đúng scope và kỳ | Share of traffic không phải market share doanh thu. [Market Overview](https://support.similarweb.com/hc/en-us/articles/12269351504029-Market-Overview) nêu tập top 100 websites cho các metric của phần đó |
| [Jungle Scout Opportunity Finder](https://www.junglescout.com/features/opportunity-finder/) | Tìm niche, bộ lọc keyword, chuỗi thời gian, seasonality và chuyển sản phẩm vào tracker | Opportunity shortlist; phân biệt tăng dài hạn với mùa vụ; lưu từ khám phá sang theo dõi | Không sao chép proprietary score; không dựng chuỗi lịch sử hoặc doanh số khi chưa có dữ liệu |
| [Exploding Topics methodology](https://explodingtopics.com/methodology) | Phát hiện trend bằng dữ liệu/mô hình, phân tích con người và nhóm chủ đề | Trend card phải có nguồn, cửa sổ thời gian, lý do nổi lên, khả năng mùa vụ và hạn chế | Human review là quy trình hãng mô tả; không được coi là quy trình hiện có hoặc bảo đảm của TrendBridge |

Kết luận của nghiên cứu: lợi thế sản phẩm nằm ở dữ liệu có ngữ cảnh, đối tượng làm việc được lưu, công cụ ra quyết định và vòng lặp kết quả. Một giao diện dashboard đẹp hoặc một report dài không thay thế được các năng lực này.

## 3. Khoảng trống đã xác nhận từ source

| Năng lực | TrendBridge hiện có | Khoảng trống thực chất |
|---|---|---|
| Cơ hội | Một validation run cho một đầu vào; Library tìm báo cáo | Chưa có project/shortlist nhiều cơ hội, tiêu chí chọn và quyết định có lịch sử |
| Thị trường | Module/claim có schema; fixture nguồn rỗng | Chưa có tập dữ liệu demand/category có thể truy vấn, lịch sử, cohort hay market explorer thật |
| Đối thủ/nguồn cung | Typed arrays và source references | Chưa có workflow thu thập, chuẩn hóa, loại mẫu lệch và cập nhật bảng từ nguồn thực |
| AI | Adapter Manus dormant, không route nào gọi live | Chưa có job lifecycle và pipeline chất lượng sẵn sàng giao cho khách |
| Tài chính | Contribution, margin, hòa vốn, tối đa năm scenario và export | Chưa có startup budget, tồn kho, tiền theo tháng, vốn cần trước launch hoặc actuals |
| Kế hoạch | Experiments có hypothesis/method/pass/stop trong report | Chưa có record thực thi, hạn, owner, kết quả, bằng chứng và quyết định sau test |
| Monetization | Entitlement server, fixture unlock, export gating | Chưa có bộ nghiên cứu đạt chuẩn để bán hoặc fulfillment thanh toán thật |

Source kiểm tra: `lib/research/{contract,report,manus}.ts`, `components/{research-history,validation-report,financial-scenarios}.tsx` và tài liệu hệ thống hiện có. Unknown/zero, ownership, server entitlement và original inputs phải tiếp tục được bảo vệ.

## 4. Các module cần xây và tiêu chí chấp nhận

### A. Opportunity Workspace — nơi chọn việc đáng làm

Project chứa nhiều opportunity, có list/board, trạng thái Exploring / Researching / Validating / Ready for decision / Paused / Rejected / Launched. Stage là workflow, không tự đại diện chất lượng bằng chứng. Mỗi card có thị trường, kênh, cấu hình, vốn người dùng dự kiến, thiếu dữ liệu gì và việc tiếp theo.

Tính năng: lưu opportunity từ case hiện tại, thêm ý tưởng, shortlist, filter/sort lưu được, archive có khôi phục, note quyết định có tác giả/thời gian. Đổi thị trường tạo scope riêng, không sửa âm thầm nguồn của case cũ.

Nghiệm thu: lưu/tải lại/đổi owner isolation; mọi case cũ vẫn mở được; không nhân đôi chỉ vì reload; một quyết định có rationale và evidence references. Không cần gọi AI để tạo hoặc tổ chức cơ hội.

### B. Research Studio & Market Explorer — tìm cơ hội có căn cứ

Hai đầu vào: (1) đã có sản phẩm/link, (2) khám phá từ ngành hàng/keyword và điều kiện kinh doanh. URL chỉ được coi là đã đọc sau khi thật sự truy xuất và kiểm tra đúng sản phẩm. Người dùng xác nhận scope trước nghiên cứu sâu.

Market view: country/channel/category/period, coverage, nguồn, định nghĩa metric. Chỉ hiển thị metric có dữ liệu: price distribution, sampled listing mix, demand signals, seasonality hoặc concentration khi mẫu/denominator đủ nghĩa. Cho drill-down tới record nguồn; trạng thái unavailable giải thích cách bổ sung.

Nghiệm thu: không hiển thị mẫu listing thành toàn thị trường; không suy doanh số từ review; cảnh báo sample lệch; không mix kỳ/ngành/currency. V1 dùng dữ liệu người dùng nhập hoặc nghiên cứu theo case; khám phá toàn catalog chỉ bật khi đã có nguồn và quyền dùng.

### C. Competitor & Customer Intelligence — biết nên khác ở đâu

Bảng listing có pack size, vật liệu/cấu hình, brand/seller, giá gốc/khuyến mại, tiền tệ, shipping đã gồm hay chưa, ngày quan sát, source và nhãn comparable/partial/excluded kèm lý do. Chuẩn hóa đơn giá khi có đủ dữ liệu. Người dùng sửa phân loại và lưu rationale.

Customer evidence gồm pain-point clusters, đoạn review, số bản ghi trong mẫu, khoảng thời gian, ngôn ngữ và bias. Phân biệt phản hồi khách của người dùng với review công khai. Proposed persona luôn là hypothesis trừ phần quan sát được dẫn chứng.

Đầu ra: comparable grid, positioning hypotheses, câu hỏi phỏng vấn và concept-test brief. Nghiệm thu: claim click được tới excerpt; giữ bằng chứng mâu thuẫn; một vài review không được mô tả thành tỷ lệ của toàn bộ khách hàng.

### D. Sourcing & Channel Map — biến research thành danh sách làm việc

Supplier references, quote records và RFQ pack; giá indicative khác quote, listing khác xác minh danh tính/audit. Quote có MOQ, quantity tier, currency, incoterm, expiry, sample/lead time, payment terms và người nhập. Quote được liên kết vào financial assumption nhưng chỉ cập nhật sau khi người dùng chọn chấp nhận.

Nhánh B2B sau pilot: target company/distributor list theo ICP, lý do phù hợp, website chính thức, coverage và nhiệm vụ tiếp cận. Không tạo contact cá nhân/intent giả; draft outreach có thể tải về, chưa tự gửi.

### E. Launch Financial Planner — biết cần bao nhiêu vốn

Giữ unit economics hiện tại và thêm đủ biến: packaging, payment/fulfillment fees, return loss, duty/tax theo giả định, chi phí setup và fixed costs. V1 chưa tự tính nghĩa vụ thuế/pháp lý quốc tế.

Mô hình 12 tháng từ giả định người dùng: opening cash, opening stock, lượng mua/bán, thời điểm đặt cọc/thanh toán, delivery lag, payout delay, acquisition spend, returns, operating costs. Chi phí đã được gộp phải có quy tắc loại trừ để không đếm hai lần. Chi tiết theo tháng trước, tổng quan sau.

Đầu ra: contribution vs operating result, cash balance, minimum cash, funding gap, inventory/stockout và sensitivity. Không gọi bảng cash launch là bộ báo cáo tài chính đầy đủ.

Nghiệm thu: tồn đầu + nhập - bán - write-off = tồn cuối; không bán vượt hàng khả dụng trừ khi bật preorder có quy tắc; tồn cuối tiền = tồn đầu + thu - chi; procurement cash không tự động thành COGS cùng kỳ; trả hàng/refund có dòng riêng, tránh trừ trùng doanh thu và return loss. Thiếu assumption trọng yếu làm kết quả incomplete, không tự điền zero.

Base/upside/downside là giả định, không phải xác suất hay forecast từ AI. Negative cash không bị làm tròn thành zero. Formula engine xác định và test độc lập; Manus chỉ đề xuất assumption có nhãn, không tính tổng tiền.

### F. Business Plan & Launch Pack — đầu ra có thể bàn giao

Plan editor theo block: decision summary; target customer/problem; market scope/size; alternatives/comparable set; offer/positioning; channels/acquisition tests; supply/operations; launch budget/cash; risks; milestones/decision gates. Mỗi block có draft/reviewed/stale và source/assumption references.

TAM/SAM/SOM chỉ tính khi định nghĩa population, spend, filters và reach assumptions; lưu công thức, đơn vị và khoảng bất định. SOM không mặc định lấy 1% TAM. Kế hoạch doanh thu phải kiểm tra capacity, budget và distribution reach. Cho kết quả unavailable khi chưa có số hợp lý.

Đổi assumption làm invalidation có chọn lọc các block phụ thuộc; người dùng xem diff và chấp nhận narrative mới. Không lặng lẽ overwrite phần đã biên tập. Export PDF/HTML, workbook và executive slides sau khi kiểm tra cùng plan/report version.

Nghiệm thu: sửa giá/CAC cập nhật bảng và đánh dấu narrative cần review; export có scope, version, assumption date và source appendix; dữ liệu riêng tư không tự xuất vào share công khai.

### G. Validation & Monitoring — lý do quay lại

Task có owner, due date, trạng thái, hypothesis, cap ngân sách, pass/stop criteria, kết quả thực tế và evidence attachment/reference. Ghi quyết định Continue / Revise / Stop sau test, có rationale. Không tự kết luận pass từ câu trả lời AI.

Monitoring chỉ bật cho scope có nguồn refresh: quan sát mới → diff → phát hiện thay đổi đáng kể → đề xuất review. Hiển thị lần kiểm tra thành công gần nhất, stale và refresh failed. Không dựng alert giả hoặc lẫn lỗi thu thập với biến động thị trường.

V1 nhập actuals thủ công/CSV có validation; API integrations sau. Trước khi tạo lời nhắc/automation thật phải có cấu hình của khách trong sản phẩm; tài liệu này không tạo automation.

## 5. Trải nghiệm và cấu trúc ứng dụng

Giữ navigation toàn cục gọn: Workspace / Library, New research là action. Discover chỉ thành điểm đến chính khi có tập dữ liệu sử dụng được. Trong một project, tổ chức Opportunity list và Compare; trong một opportunity, tiếp tục Overview / Research / Economics / Next steps. Business Plan là deliverable/editor trong case, không thêm hàng loạt menu rỗng.

Overview trả lời: decision state, evidence strengths/gaps, vốn/cash assumptions, rủi ro chặn và next action. Research dùng view bảng tương tác có scope toolbar, detail drawer và source inspector. Next steps chứa công việc có thể ghi kết quả, thay danh sách lời khuyên tĩnh.

Các states bắt buộc cho mỗi module: chưa có đầu vào, chưa có nguồn, có dữ liệu nhưng partial, đang chạy, failed/retry, stale, ready, locked và không hỗ trợ thị trường. Không có một badge “confidence 95%” chung cho mọi thứ.

## 6. Free → unlock: bán đầu ra nào

| Mức | Giá trị được nhận | Điều kiện |
|---|---|---|
| Free snapshot | Scope chuẩn hóa, unit calculator, vài finding thực có nguồn khi research nhẹ hoạt động, rủi ro đầu tiên, outline cá nhân hóa và gaps | Trước activation chỉ là input preview, không gọi là market research. Finding free cũng phải đạt chuẩn dẫn nguồn như paid |
| Decision Pack | Nghiên cứu sâu, competitive/customer tables, source appendix, risk/validation plan và export có version | Chỉ bán scope hỗ trợ và giao được report đạt tiêu chuẩn; nêu đầu ra/giới hạn trước unlock |
| Launch Workspace | Plan editor, cash planner, quote/test tracking, quản lý nhiều cơ hội | Giá trị trả tiền là dùng lại và cập nhật, không chỉ thêm độ dài report |
| Monitoring / team | Refresh, diff, collaboration và usage controls | Sau khi có nguồn ổn định, nhu cầu lặp lại và unit economics đo được |

Chưa chốt giá tiền hoặc credits. Đo chi phí data + Manus + retry + verification + support trước. Nếu thiếu nguồn, báo partial và cơ chế xử lý rõ, không đẩy khách qua paywall chỉ để thấy unavailable. Claim nào đã hiện trong preview thì nguồn/giới hạn hỗ trợ claim đó cũng xem được. Nội dung locked phải bị chặn ở server, không gửi full rồi blur.

## 7. Kiến trúc thông tin và chất lượng dữ liệu

Không sửa v1 run thành một object khổng lồ chứa mọi thứ. Kiểm tra storage/schema/ledger thực tế trước thiết kế migration. Các đối tượng đề xuất (chưa phải bảng đã tạo): Project, Opportunity, ResearchRun/ReportVersion, EntityRecord, SourceObservation, AssumptionSet, LaunchPlanVersion, ExperimentResult và DecisionEvent. Mỗi loại cần owner, version và quyền truy cập nhất quán.

Quan hệ gốc: source observation → claim → assumption/decision → plan block → experiment → result. Quan sát mới không xóa lịch sử quyết định cũ. Report snapshot được pin vào plan/export; cập nhật yêu cầu review, không tự đổi report khách đã mua.

Source observation cần URL/publisher, retrievedAt, observedAt, country/channel/configuration, metric definition/unit, excerpt, extraction/reviewer status, limitations và quyền sử dụng. Bản ghi upload của khách phải phân biệt user-supplied, confidential và public; chưa xác thực chỉ vì được upload.

Quality states: unreviewed / structurally valid / source checked / contradiction flagged / stale / rejected. Source checked nghĩa kiểm tra hỗ trợ claim và scope, không bảo đảm publisher đúng tuyệt đối. Independent corroboration phải kiểm tra các nguồn không chỉ sao chép cùng một bài.

### Manus sau này

Provider tiếp tục tắt theo yêu cầu hiện tại. Trước activation phải xác minh lại API chính thức; không coi adapter dormant là integration hoàn chỉnh.

Pipeline đề xuất: scope confirmation → task theo module → structured output → schema/domain validation → source retrieval/matching → contradiction/quality review → immutable report version → publish. Có job id, idempotency, cost cap, cancellation, retry/backoff, timeout, reconciliation và status thật. Không giả phần trăm tiến độ.

Trước pilot, acceptance set gồm nguồn thiếu, sai cấu hình, duplicated source, nguồn mâu thuẫn, stale data, prompt injection, ngoại tệ và loss scenario. Chặn publish observation không có hỗ trợ; có unresolved không tự đồng nghĩa job failed. Tính toán và chất lượng số liệu thuộc TrendBridge, không ủy quyền toàn bộ cho văn bản AI.

## 8. Thứ tự thực hiện và Definition of Done

Các đợt dưới đây là thứ tự phạm vi, không phải cam kết thời gian; estimate sau khi chốt nguồn, khảo sát khách và migration design. Có thể làm engine/test khi provider vẫn tắt.

| Đợt | Phạm vi giao được | Dependency | Nghiệm thu |
|---|---|---|---|
| 1 — workflow sử dụng được | Opportunity shortlist/compare từ case hiện có; decision notes; validation tasks và ghi kết quả | Store/version/ownership design; không cần Manus | Hai cơ hội khác nhau so sánh được scope/unknowns; lưu/reload; kết quả test đổi decision có lịch sử; owner isolation |
| 2 — kế hoạch vốn | Expanded unit economics + 12-month cash engine + scenarios + workbook | Assumption schema, deterministic oracle | Kiểm thử độc lập inventory/cash/return/delay; UI/export parity; thiếu input không ra cash giả |
| 3 — plan liên kết | Structured business plan editor và export versioned; dùng dữ liệu nhập tay/case có sẵn | Đợt 1/2 và report dependencies | Sửa assumption → dependent blocks stale; người dùng review diff; export cùng version |
| 4 — nghiên cứu thật | Data-source pilot, competitor/customer grids, Manus lifecycle và verification | Nguồn hợp lệ, API activation riêng, benchmark/reviewer | Case thật đúng scope, source-backed, partial/failure recovery và cost evidence; không dùng fixture làm acceptance |
| 5 — thương mại | Free research nhẹ, preview/unlock, payment fulfillment/refund, delivery tracking | Quality/cost pilot đủ chuẩn và production auth/storage | Thanh toán/idempotency/refund/entitlement kiểm tra trên đúng môi trường; khách nhận đúng pack/version |
| 6 — khám phá và quay lại | Market Explorer có dataset, saved views, watchlist, refresh/diff, team | Data rights/coverage, demand lặp lại | Không mix scopes/periods; cảnh báo stale; đo retention thực, không đếm chỉ số vanity |

**Checkpoint đầu tiên nên xây ngay:** hai opportunity → bảng so sánh → chọn một giả thuyết → ghi kết quả test → lưu decision. Đây là năng lực mới khách có thể dùng trong khi Manus chưa bật. Không gọi checkpoint này là Market Explorer có dữ liệu toàn thị trường.

## 9. Đo giá trị thay vì đếm module

- First useful decision: khách xác định được điều cần kiểm chứng và lý do shortlist, không chỉ tạo report.
- Task completion: so sánh hai cơ hội; mở bằng chứng; tìm tháng thiếu tiền; ghi test và đổi quyết định.
- Research quality: observation có hỗ trợ, mismatch, contradiction và stale được review trên acceptance set; không dùng số lượng citation làm proxy duy nhất.
- Plan usefulness: tỷ lệ assumption được khách điều chỉnh, test thực sự ghi kết quả, case quay lại review.
- Commercial: pack đạt chuẩn được giao, chi phí mỗi pack, willingness-to-pay, refund lý do chất lượng. Chưa có baseline thì chưa đặt conversion/retention giả.
- Instrument event IDs và entity/version references; không gửi nội dung sản phẩm bí mật hoặc quote riêng tư vào analytics mặc định.

## 10. Giới hạn phiên nghiên cứu này

Không mua dữ liệu, kích hoạt API, gửi outreach, tạo tác vụ định kỳ, thay schema production hoặc mở thu phí. Chưa làm phỏng vấn/usability với khách. Kết quả là feature blueprint có phạm vi, dependency và acceptance criteria để triển khai; không phải tuyên bố các tính năng v2 đã hoạt động. Tài liệu nguồn chính thức được đọc trong phiên, không sử dụng số liệu quảng cáo làm benchmark đã kiểm chứng.
