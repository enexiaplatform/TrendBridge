# TrendBridge — nghiên cứu sản phẩm và kế hoạch nâng cấp

Ngày: 29/10/2026 · Trạng thái: đề xuất thực hiện, chưa triển khai redesign.

## 1. Kết luận và phạm vi bằng chứng

TrendBridge hiện có nền móng kỹ thuật cho preview, lưu report, entitlement, kịch bản tài chính và export. Tuy nhiên, trải nghiệm vẫn được tổ chức quanh form và các mục báo cáo hơn là một công việc kinh doanh hoàn chỉnh. Cần tổ chức lại sản phẩm quanh câu hỏi: **“Tôi có nên thử bán sản phẩm này ở thị trường này; cần kiểm chứng gì, bằng bao nhiêu vốn, trước khi đặt hàng?”**

Đây là đánh giá cấu trúc, nội dung và khả năng sản phẩm từ code hiện tại, DOM landing page và tài liệu chính thức của các sản phẩm tham chiếu. Không phải kiểm định khả dụng với khách hàng, không phải audit thị giác hoặc chứng nhận accessibility. Chưa đăng nhập dùng các tài khoản trả phí của đối thủ; các tính năng đối thủ bên dưới là tính năng họ công bố, không phải trải nghiệm đã trực tiếp kiểm chứng.

Nguồn local: commit `a6b53bf`; `components/landing.tsx`, `research-wizard.tsx`, `research-history.tsx`, `app-shell.tsx`, `validation-report.tsx`, `financial-scenarios.tsx`; `lib/research/{report,contract,manus,exports,server}.ts`; `docs/GLOBAL_RESEARCH.md`; CSS và các route dashboard/reports.

Giới hạn phiên khảo sát: dev server Turbopack dừng khi Windows chặn đọc một file sinh trong `.next`; thử webpack gặp lỗi bộ nhớ. Bản build có sẵn mở được landing và đọc được DOM bằng Chrome, nhưng hai cách chụp màn hình đều timeout. Không có screenshot nào được chấp nhận làm bằng chứng. Không thay đổi bảo vệ Windows, không sửa UI hoặc bật Manus để phục vụ khảo sát.

## 2. Vì sao trải nghiệm chưa đạt mức thương mại

| Bước | Tình trạng xác nhận từ source/DOM | Ảnh hưởng cần kiểm chứng với người dùng | Ưu tiên |
|---|---|---|---|
| 1. Landing | Lời hứa rộng về product intelligence; preview minh họa chủ yếu là cấu trúc, chưa cho thấy một quyết định kinh doanh cụ thể | Khó hiểu vì sao chọn TrendBridge thay cho nghiên cứu bằng AI phổ thông | P0 |
| 2. Nhập sản phẩm | Bước đầu có tên, URL, thị trường, kênh, ngôn ngữ, cấu hình và mô tả; URL chỉ lưu, chưa được đọc | Người dùng tưởng app đã hiểu link; phải tự biết nhiều thông tin trước khi nhận giá trị | P0 |
| 3. Nhập tài chính | Có bước riêng trước khi tạo snapshot; được để trống nhưng chưa có lối “bổ sung sau” rõ; validate cuối trả cả tên field kỹ thuật | Dễ bỏ cuộc hoặc nhập số đoán để đi tiếp | P0 |
| 4. Preview | `buildSnapshot()` luôn HOLD, evidence unavailable và cùng ba câu hỏi khái quát; lợi nhuận là tính từ đầu vào | Tính trung thực là điểm tốt, nhưng mức cá nhân hóa và phát hiện mới chưa đủ thuyết phục | P0 |
| 5. Report | Chín module và evidence ledger; Price sandbox và saved scenarios là hai khu riêng; KPI đầu trang lấy từ sandbox | Nhiều ngữ cảnh tính toán dễ gây nhầm số đang xem là gốc, nháp hay đã lưu; cấu trúc module chưa đồng nghĩa câu chuyện quyết định | P0 |
| 6. Unlock | Production chưa bán, test report chỉ là fixture, nguồn ngoài còn trống | Chưa có bằng chứng về chất lượng report thật hoặc lý do trả tiền; chưa được coi là sản phẩm nghiên cứu sẵn sàng bán | P0 |
| 7. Quay lại làm việc | Dashboard và Reports cùng dùng ResearchHistory; navigation có Operations cho mọi người; còn nội dung EN/VI pha trộn | Hai điểm đến trùng vai trò, thiếu bước tiếp theo và cảm giác workspace chuyên nghiệp | P1 |
| 8. Mobile/accessibility | CSS ẩn nhãn navigation và một số điểm đến; tab report chưa thể hiện điều khiển bằng phím mũi tên trong code | Cần kiểm tra khả năng tìm chức năng, focus, đọc bảng và đi hết flow trên điện thoại; chưa kết luận vi phạm từ source | P1 |

Những phần nên giữ: logo chính thức; palette navy–blue–cyan–teal; unknown khác zero; currency/market gắn với report; tính toán xác định; owner isolation; entitlement ở server; cấu trúc claim/source; export từ dữ liệu đã lưu; Manus chưa kích hoạt thì không dựng số liệu bên ngoài.

## 3. Các sản phẩm tham chiếu và bài học

Đây là nhóm tham chiếu chuyên sâu, không phải bảng xếp hạng “cao cấp nhất” đã được chứng minh độc lập. Mỗi sản phẩm có phạm vi và tài sản dữ liệu khác nhau.

| Sản phẩm | Điều công bố trong tài liệu chính thức | Áp dụng cho TrendBridge | Giới hạn không được đánh đồng |
|---|---|---|---|
| [Helium 10 Black Box](https://www.helium10.com/tools/product-research/black-box/) | Lọc listing theo tiêu chí thương mại, phân tích catalog đối thủ và xây shortlist | Từ nghiên cứu đến shortlist, lọc theo điều kiện kinh doanh và so sánh lựa chọn | Không thể suy ra TrendBridge có cùng dữ liệu listing hoặc quyền sử dụng dữ liệu |
| [Jungle Scout Opportunity Finder](https://www.junglescout.com/features/opportunity-finder/) | Nghiên cứu niche qua keyword, lịch sử giá/bán hàng/search, seasonality và Product Tracker | Thể hiện xu hướng theo thời gian, phạm vi so sánh và watchlist có mục đích | Doanh số ước tính của hãng không phải doanh số thật của mọi người bán |
| [Jungle Scout Supplier Database — phạm vi](https://support.junglescout.com/hc/en-us/articles/360019468773-Which-marketplaces-and-countries-does-the-Supplier-Database-support) | Database dựa trên hàng nhập vào Mỹ, không đồng nghĩa dữ liệu thương mại toàn cầu | Công bố coverage theo quốc gia, kênh và loại dữ liệu ngay tại kết quả | Có supplier reference không đồng nghĩa supplier đã được audit chất lượng |
| [Similarweb Shopper Intelligence](https://developers.similarweb.com/docs/ecommerce-dataset) | Dữ liệu category/brand/product, lịch sử và metric có định nghĩa, gồm product views, sales, conversion và keyword | Chart có thời gian, đơn vị, denominator, định nghĩa và so sánh cùng thị trường | Không suy doanh số từ review count hay nhãn “trending”; dữ liệu thương mại cần quyền truy cập/licensing |
| [Exploding Topics methodology](https://explodingtopics.com/methodology) | Kết hợp mô hình, dữ liệu lịch sử và phân tích con người; xét seasonality, volatility và growth pattern | Tách tín hiệu bền vững với spike, công bố phương pháp và tổ chức review | Human verification là quy trình họ công bố; không phải bảo đảm đúng tuyệt đối hoặc năng lực hiện có của TrendBridge |
| [AlphaSense research](https://www.alpha-sense.com/solutions/generative-ai-in-market-research/) | Citation tới đoạn nguồn, follow-up và Generative Grid so sánh nhiều tài liệu theo tiêu chí | Bấm nhận định để xem bằng chứng; bảng nghiên cứu tái dùng; câu hỏi tiếp theo gắn với phạm vi | Citation không tự chứng minh nội dung đúng; không mặc định Manus đọc được kho dữ liệu trả phí của họ |
| [Perplexity Projects](https://www.perplexity.ai/help-center/en/articles/10352961-what-are-projects) | Workspace lưu task, file, chỉ dẫn, công cụ và phân quyền để tiếp tục công việc | Mỗi cơ hội có hồ sơ nghiên cứu và lịch sử, không chỉ là một lần hỏi AI | Chỉ lấy nguyên tắc tổ chức công việc; chưa cần xây một app chat tổng quát |
| [Linear Views](https://linear.app/docs/custom-views), [Display options](https://linear.app/docs/display-options) | View lưu bộ lọc, cách hiển thị linh hoạt, thao tác phím | Workspace gọn, filter theo trạng thái, quick actions, ưu tiên tốc độ sử dụng lặp lại | Đây là tham chiếu interaction, không phải đối thủ nghiên cứu sản phẩm |

**Tổng hợp của nghiên cứu:** những khả năng đáng học là dữ liệu theo phạm vi, kiểm tra nguồn tại chỗ, so sánh có ngữ cảnh, hồ sơ làm việc liên tục và bước hành động tiếp theo. Không có căn cứ để kết luận chỉ đổi palette, thêm animation hay thêm module sẽ làm khách hàng trả tiền.

## 4. Định vị và giá trị sản phẩm

### Khách hàng đầu tiên — giả thuyết cần xác nhận

Chủ thương hiệu nhỏ, nhóm ecommerce và người vận hành sourcing đang đánh giá sản phẩm vật lý mới trước khi cam kết tồn kho. Ưu tiên người đã có nhu cầu kinh doanh cụ thể hơn nhóm chỉ tìm “winning product” ngẫu nhiên.

Thiết kế dữ liệu cho global từ đầu, nhưng pilot nên có phạm vi đủ kiểm chứng: chọn một thị trường/kênh chính và nhóm hàng tiêu dùng ít ràng buộc hơn sau khi phỏng vấn khách hàng. Mỹ + Amazon hoặc DTC là hai hướng cần so sánh; chưa chốt cả hai nếu thiếu nguồn. Những nhóm hàng có claim y tế, thực phẩm, mỹ phẩm hoặc yêu cầu an toàn phức tạp cần quy trình riêng trước khi hỗ trợ.

### Lời hứa đề xuất

**“Turn a product idea into a source-backed launch decision.”**

Một cơ hội phải trả lời được năm câu: bán cho ai; cạnh tranh với sản phẩm cấu hình nào; còn lợi nhuận sau chi phí nào; cần vốn và kiểm chứng gì; điều gì khiến nên dừng.

Giá trị trả phí đề xuất là một bộ quyết định có thể bàn giao: decision memo, comparison workbook, supplier/RFQ pack và validation plan. Lợi thế tích lũy nên đến từ chuẩn hóa cấu hình, liên kết bằng chứng, workflow và dữ liệu kết quả do khách tự ghi lại; không chỉ từ quyền gọi một AI provider.

### Kiểm tra giá trị trước khi mở rộng

- Phỏng vấn 10–12 khách hàng mục tiêu bằng một quyết định sản phẩm gần đây của họ; đo công cụ đang dùng, nguồn họ tin, thời gian, chi phí nghiên cứu và tài liệu cần bàn giao.
- Cho 5–8 người làm nhiệm vụ bằng prototype: xác định kết luận, mở bằng chứng, thay chi phí và tìm bước tiếp theo. Đây là nghiên cứu đề xuất, chưa thực hiện.
- Pilot có kiểm soát 10–20 case, gồm cấu hình thiếu, nguồn mâu thuẫn, không đủ dữ liệu và mô hình tài chính âm; có người đối chiếu nguồn độc lập với phần AI tạo.
- Kiểm tra willingness-to-pay và chi phí mỗi report đạt chuẩn trước khi định giá. Không lấy số trang báo cáo hoặc số token làm đơn vị giá trị.

## 5. UI/UX và design system đề xuất

Hướng thiết kế: **professional research workspace** — gọn, sáng, dễ đọc, ưu tiên bảng và bằng chứng. Logo và màu thương hiệu giữ nguyên. Navy dùng cho cấu trúc và chữ; cobalt cho tương tác chính; teal cho nhấn thương hiệu; màu cảnh báo tách khỏi màu trang trí.

| Lớp | Quyết định thiết kế | Tiêu chí nghiệm thu |
|---|---|---|
| Kiến trúc thông tin | Navigation chính: Workspace, New research, Library; billing/settings trong account menu; admin chỉ hiển thị đúng role. Compare thuộc workspace/case trước khi cần destination riêng | Mỗi điểm đến có công việc khác nhau, không còn Dashboard/Reports là cùng một màn hình |
| Typography | Một font UI có license thương mại và đủ glyph tiếng Việt; số dùng tabular numerals; type scale rõ cho title, section, body, caption | Đọc tốt ở desktop/mobile và 200% zoom; không dùng caption nhỏ cho kết luận quan trọng |
| Mật độ | Header gọn, ít panel trang trí; spacing theo hệ thống 4/8px; summary trước, detail mở theo yêu cầu | Người dùng nhìn thấy kết quả/bước tiếp theo mà không cuộn qua nhiều đoạn giới thiệu |
| Component | Button, field/error/helper, metric, table, source chip, evidence drawer, status, stepper, empty/error/loading, dialog và toast có cùng quy ước | Component gallery có mọi trạng thái; kiểm tra focus/disabled/error/loading và localization |
| Data visualization | Xu hướng có thời gian/phạm vi; giá so sánh có currency/pack; scenario có input/version. Không đủ dữ liệu thì hiển thị coverage, không dựng đường chart | Mọi chart có bảng tương đương; không mã hóa trạng thái chỉ bằng màu; số khớp export |
| Research reader | Summary ngắn → điều kiện ra quyết định → supporting evidence → công cụ. Desktop dùng nội dung và evidence drawer; mobile mở từng khối | Một nhận định → một thao tác tới nguồn, trích đoạn, ngày và giới hạn |
| Trạng thái | Phân biệt rõ nháp, đang nghiên cứu, cần bổ sung, hoàn thành, partial, failed, stale; demo là môi trường có nhãn riêng | Không hiện nút hứa tác vụ không khả dụng hoặc progress giả |
| Accessibility | Nhắm WCAG 2.2 AA; keyboard, focus, contrast, tên truy cập, bảng, form recovery; mobile target thực dụng 44px | Kiểm tra tự động và thủ công. 44px là mục tiêu thiết kế; không đánh đồng với mức tối thiểu 24px có ngoại lệ của WCAG 2.2 |

Cơ sở UX: [NN/g — progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/). Cơ sở accessibility: [W3C — WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/). Chưa có kết luận app hiện tại đạt hay không đạt toàn bộ tiêu chuẩn.

Trước khi code redesign: tạo ba hướng hình ảnh trên cùng ba màn hình trọng tâm, so sánh độ đọc, mật độ dữ liệu và mức phù hợp logo; chọn một hướng rồi mới triển khai. Không tạo ba app khác nhau.

## 6. Hành trình người dùng mục tiêu

1. **Hiểu giá trị.** Landing thể hiện một case và deliverable cụ thể, phạm vi dữ liệu, ví dụ nguồn, CTA rõ. Không dùng testimonial, logo đối tác hoặc metric thành công chưa có thật.
2. **Nhập ý tưởng nhanh.** Bắt đầu với tên/URL và thị trường. Ngôn ngữ theo lựa chọn UI; kênh và cấu hình hỏi bổ sung theo ngữ cảnh. Không bắt người mới biết CAC và incoterm. Lưu nháp và cho bổ sung kinh tế sau.
3. **Xác nhận app hiểu gì.** Product card phân biệt cấu hình đã đọc được, do người dùng nhập và còn thiếu. Nếu chưa có URL retrieval, nói rõ chưa đọc link; khi có thì cho xem và sửa thông tin trích xuất trước khi nghiên cứu.
4. **Nhận giá trị miễn phí.** Preview có phạm vi sản phẩm, một insight thật khi có bằng chứng, rủi ro trọng yếu đã phát hiện và bước tiếp theo. Chưa bật Manus thì trình bày đúng là calculator/scope check, không gọi kết quả là nghiên cứu thị trường.
5. **Hiểu trước khi unlock.** Nêu deliverable, coverage, thời điểm dữ liệu, giá, điều kiện partial/refund và ví dụ report; hiển thị rõ nội dung chưa khả dụng. Không che rủi ro an toàn trọng yếu sau paywall và không tạo đoạn “blurred” giả.
6. **Theo dõi nghiên cứu.** Hiển thị stage thực từ job: scoping, collecting, cross-checking, synthesizing, review; cho rời trang/quay lại, nhận yêu cầu bổ sung và retry an toàn. Chỉ hiển thị ETA khi có thống kê đủ tin cậy.
7. **Đọc và kiểm tra quyết định.** Brief dẫn đến bằng chứng; reviewer thấy được source, counter-evidence, thời điểm và điểm chưa chắc. Economics dùng một model thống nhất với scenario selector.
8. **Hành động và quay lại.** Lưu shortlist, tải RFQ/quote comparison, ghi kết quả sample/test, cập nhật giả định và tạo phiên bản quyết định mới; sau này thêm watchlist khi có dữ liệu và người dùng cần theo dõi lặp lại.

## 7. Free, paid và giá trị giữ chân

| Gói/khả năng | Mục đích | Nội dung đề xuất | Điều kiện |
|---|---|---|---|
| Free snapshot | Tạo first value thực | Scope check, một số phát hiện có nguồn nếu có; critical risks đã biết; calculator cơ bản; lưu cơ hội | Giới hạn lượt và chi phí công khai; khi AI tắt không bịa insight |
| Full validation, ưu tiên mua từng case khi pilot | Giải quyết quyết định trước tồn kho | Decision memo đầy đủ, comparable matrix, supplier references, economics và validation pack | Chỉ mở bán khi có report thật đạt chuẩn, entitlement/payment/recovery hoạt động |
| Monitoring subscription, giai đoạn sau | Giá trị sử dụng định kỳ | Refresh theo nguồn, change log, watchlist và cảnh báo thay đổi đáng kể | Cần chứng minh dữ liệu cập nhật và nhu cầu quay lại; chưa mặc định subscription là model phù hợp |
| Team, sau khi có nhu cầu | Chuyển giao và cộng tác | Role, comment, approval, shared case | Không đưa vào scope pilot đầu chỉ để đủ “enterprise features” |

Chưa đề xuất mức giá cụ thể: chưa có unit cost của report đạt chuẩn, willingness-to-pay, tỷ lệ incomplete/refund hoặc chi phí nguồn trả phí. Cần tính cả retry, review, lưu trữ, support và payment, không chỉ tiền gọi Manus.

## 8. Chuẩn report thống nhất: Decision Pack v2

UI chia theo câu hỏi công việc, dữ liệu gốc vẫn có schema version và các record có cấu trúc. Chuẩn mới phải có compatibility cho v1, không xóa report cũ.

| Phần | Nội dung bắt buộc | Output dùng được |
|---|---|---|
| 0. Scope & provenance | Sản phẩm/cấu hình/pack, market/channel, currency, thời gian nghiên cứu, coverage, version | Cover/summary và nhật ký phạm vi |
| 1. Decision brief | Bước đề xuất, 3 lý do quan trọng, rủi ro chặn, điều kiện đổi quyết định, evidence gaps | Một trang có thể bàn giao; hỗ trợ research more / run test / do not proceed thay vì kết luận cố định |
| 2. Demand & customer | Search/trend/review observations có thời gian và phương pháp; persona/JTBD gắn bằng chứng | Demand evidence map và customer pain summary |
| 3. Comparable products | Cấu hình, pack, giá, tiền tệ, ngày quan sát, similarity và lý do loại | Comparison grid lọc/sort/shortlist; không trộn sản phẩm không tương đương |
| 4. Sourcing | Supplier reference, exact configuration, MOQ, price basis, incoterm, lead time, chứng từ và các bước kiểm chứng còn thiếu | Shortlist, quote comparison và RFQ draft; listing không phải audited supplier |
| 5. Economics & capital | Landed costs có nguồn/giả định, FX, fees, returns/tax assumptions, margin, break-even, inventory cash exposure | Workbook và scenario; tax/duty ước tính cần market-specific source, không tư vấn chính xác khi thiếu căn cứ |
| 6. Differentiation & launch test | Positioning hypotheses, lựa chọn kênh, test budget, metric/pass/fail/stop | Experiment card hoặc kế hoạch 30 ngày với đầu ra và người phụ trách do khách xác nhận |
| 7. Risk & decision gates | Compliance/quality/supplier/claims/commercial risk, severity, unresolved blockers | Risk register và checklist trước sample/PO/launch |
| 8. Evidence & appendix | Citation ledger, snippet, scope, dates, contradiction, limitations, method và assumptions | Evidence export và khả năng truy ngược tới từng nhận định |

Mỗi nhận định phải trả lời: **nói gì → căn cứ nào → quan trọng thế nào → chưa biết gì → làm gì tiếp**. Report dài hơn chỉ được thêm khi trả lời thêm câu hỏi cần thiết.

Exports phải cùng dữ liệu/version với màn hình: decision memo PDF có layout in thật, workbook có data dictionary và controlled formulas, RFQ có chỗ cần khách xác nhận. Không xuất draft chưa lưu như thể đó là báo cáo chính thức. Không tự gửi liên hệ nhà cung cấp.

## 9. Manus và mức độ xác thực

[Manus API v2](https://open.manus.im/docs/v2/introduction) công bố task, follow-up, file và webhook; các năng lực này không thay thế việc kiểm định sự thật. Phiên nghiên cứu này chỉ đọc tài liệu, không gọi API trả phí hoặc bật live mode.

Luồng đề xuất: case/scope → research plan → durable job → Manus → artifact capture → normalize/deduplicate → evidence checks → deterministic calculations → quality review → immutable report version → authorized delivery.

Các lớp kiểm định:

1. **Schema:** đúng định dạng, đơn vị, currency, source IDs, thời gian, identity sản phẩm. Tái sử dụng contract hiện tại và bổ sung phiên bản, không bỏ để nhận văn bản tự do.
2. **Nguồn có thật và truy cập được:** URL, publisher, excerpt, thời điểm quan sát, phạm vi địa lý và product match; giữ bản trích xuất/hashes theo quyền sử dụng. Nguồn không truy cập được phải có trạng thái riêng, không gắn nhãn đã xác minh.
3. **Nguồn hỗ trợ nhận định:** kiểm tra excerpt/context thực sự hỗ trợ; một link hợp lệ không đủ. Các nguồn chép lại nhau không được tính là đối chiếu độc lập.
4. **Mâu thuẫn và coverage:** thể hiện dữ liệu thiếu/cũ/trái chiều; không làm mất cảnh báo trong summary. Không đặt chỉ tiêu phải đủ 10 supplier nếu chỉ tìm được 2 phù hợp.
5. **Tính toán:** engine tính từ input và provenance; AI không tự tạo arithmetic hoặc fill unknown bằng 0. Giá listing, quote thật, estimated sales và user assumption là các loại khác nhau.
6. **Review:** pilot có người kiểm tra độc lập những nhận định quyết định, citation và rủi ro trọng yếu. Tự động hóa chỉ được mở rộng sau khi so với bộ case đã adjudicate; việc AI thứ hai đồng ý không phải xác minh độc lập.

Trạng thái dữ liệu đề xuất: observed, supplier-quoted, user-provided, calculated, estimated, hypothesis, unavailable, stale, disputed. Đây là metadata bằng chứng; confidence của kết luận phải có rubric riêng, không đổi số nguồn thành một “điểm thành công” giả.

Tách bốn loại trạng thái: research job, report quality, payment/order, entitlement. Thanh toán thành công không được biến partial report thành validated. UI “ready” chỉ khi report version qua gate; job xong nhưng chất lượng thiếu phải trả partial/needs review theo chính sách đã công bố.

Vận hành bắt buộc trước live: private tasks, spend budget và timeout, waiting-for-input, bounded retry, webhook/poll reconciliation, idempotency, worker bền vững, cancellation policy, audit trail, chống SSRF/prompt injection khi đọc URL, upload scanning và quyền xóa dữ liệu. Kiểm tra DB/migrations hiện hành trước khi mở rộng schema; không tạo bảng trùng chỉ vì đổi giao diện.

**Global coverage là thuộc tính từng nguồn và từng module**, không phải chỉ dropdown quốc gia. Có thể cho phép mô hình tài chính ở một quốc gia trong khi research module chưa được hỗ trợ; phải nói rõ trước unlock.

## 10. Kế hoạch thực hiện theo thứ tự

Effort S/M/L là tương đối; không phải thời hạn đã cam kết. Timeline chỉ nên chốt sau khi chọn visual direction, nguồn dữ liệu và ngân sách review. Chặng 1–3 có thể thực hiện khi Manus còn tắt; chặng 4–5 có điều kiện riêng trước mở bán.

| Chặng | Công việc chính | Deliverable | Effort | Gate để đi tiếp |
|---|---|---|---|---|
| 1. Xác nhận định vị và UX | Interview script/case, market coverage, map journey, screen/content inventory; wireflow và ba visual directions cho Workspace, Intake, Decision brief | Product brief, scope pilot, prototype hướng chọn, report mẫu có nhãn demo | M | Biết khách mục tiêu, công việc cần giải quyết và lý do trả tiền; không cần xem tất cả các module để hiểu app |
| 2. Thiết kế lại trải nghiệm cốt lõi | Token/component states, shell/navigation, onboarding ngắn, draft recovery, field validation, empty/loading/error, EN/VI đầy đủ | Design system v2 và core journey chạy được bằng fixture rõ nhãn | L | 5–8 người làm được nhiệm vụ chính; không mất nháp khi back/reload; kiểm tra desktop/mobile/keyboard |
| 3. Decision workspace và tools | Report reader + evidence drawer, table interactions, hợp nhất sandbox/scenarios, case shortlist/next action, PDF/workbook đồng nhất | Decision Pack v2 và các record có version | L | Người dùng phân biệt gốc/nháp/saved; truy nguồn một thao tác; số UI/export khớp cùng version |
| 4. Research engine và quality | Durable jobs/Manus adapter, artifacts, evidence pipeline, market coverage, quality review console và failure recovery | Bộ report pilot thật được review và bộ benchmark có đáp án đối chiếu | L | Không có fabricated observation/critical unsupported claim trong bộ acceptance; lỗi được xử lý minh bạch; chi phí đo được |
| 5. Commercial pilot | Account ownership/recovery, source rights, payments+fulfillment/refund, privacy/terms, analytics và support | Pilot mở theo phạm vi; pricing được thử với khách mục tiêu | L | Có report thật đáng trả tiền, full money flow test, production owner isolation, latency/cost/quality được theo dõi |
| 6. Retention và scale | Refresh/diff/watchlist; compare multiple opportunities; team nếu có nhu cầu thực | Gói sử dụng định kỳ có giá trị đã đo | M–L | Có hành vi quay lại và nhu cầu theo dõi thật; không thêm tính năng chỉ để tăng số menu |

### Backlog cụ thể

| ID | Ưu tiên | Hạng mục | Phụ thuộc / bằng chứng hoàn thành |
|---|---|---|---|
| TB-01 | P0 | Product positioning + interview + coverage matrix | Chặng 1; giả thuyết và phản hồi ghi riêng |
| TB-02 | P0 | Ba hướng visual cho ba màn hình core; chọn một | TB-01; source/logo và states được dùng trong mock |
| TB-03 | P0 | Intake v2, skip economics, autosave, field-level recovery | TB-02; không mất dữ liệu khi back/reload; URL extraction bật theo capability |
| TB-04 | P0 | Case identity, report version và provenance model | TB-01; tái sử dụng store/schema đang có, migration plan có kiểm tra ledger |
| TB-05 | P0 | Decision brief + evidence drawer + quality states | TB-02/04; không còn universal verdict như thể là đánh giá cá nhân hóa |
| TB-06 | P0 | Manus job lifecycle, budgets, waiting/retry/reconciliation | TB-04 + API activation riêng; test không thu phí trước live |
| TB-07 | P0 | Evidence verification + reviewer workflow + benchmark | TB-04/06; adjudicated cases, unsupported/source-mismatch được chặn |
| TB-08 | P1 | Comparable grid + supplier references + customer evidence | TB-05/07; scope/currency/date/source bắt buộc, không ép đủ số hàng |
| TB-09 | P1 | Một economics workspace, scenario selector, input provenance | TB-04; baseline immutable, draft rõ, delta và unknown nhất quán |
| TB-10 | P1 | Branded PDF + workbook + RFQ/validation pack | TB-05/08/09; export/UI cùng report version, test Unicode và nhiều trang |
| TB-11 | P1 | Navigation/library, filters, archive và resume/next action | TB-02/04; dashboard và library có mục đích khác nhau; không lộ admin |
| TB-12 | P0 trước sale | Account recovery, entitlement/payment/refund, source rights và privacy | TB-06/07; pilot quality/cost đủ dữ liệu và production checks hoàn tất |
| TB-13 | P1 | Analytics + accessibility + global QA | Bắt đầu cùng TB-03, chốt trước TB-12; đủ các state/failure |
| TB-14 | P2 | Watchlist/diff/refresh; collaboration khi có nhu cầu | Sau pilot; freshness/data cost và retention đã đo |

## 11. Đo thành công và nghiệm thu

Các con số dưới đây là **mục tiêu thử nghiệm đề xuất**, không phải kết quả hiện tại hay benchmark ngành.

| Khía cạnh | Cách đo | Mục tiêu/gate ban đầu |
|---|---|---|
| Hiểu giá trị | Sau khi xem landing, khách diễn giải app giúp gì và được gì khi unlock | Ít nhất 4/5 người trong một vòng usability diễn giải đúng; chưa đủ để suy rộng thị trường |
| First value | Thời gian từ bắt đầu đến scope/preview hữu ích trong mode nhẹ | Mục tiêu median dưới 90 giây; đo riêng thời gian AI nghiên cứu sâu |
| Task success | Hoàn thành intake, tìm kết luận/nguồn, sửa scenario, tìm next action | Ít nhất 4/5 hoàn thành không cần người hướng dẫn; ghi rõ lỗi và lặp lại sau sửa |
| Trust | Tỷ lệ claim quyết định được nguồn thật hỗ trợ và source/config matching | Mọi claim được publish như observation đều có nguồn; không có lỗi critical đã biết trong acceptance set |
| Quality | Review độc lập các case đầy đủ, thiếu và mâu thuẫn | Có mẫu, rubric, kết quả review và cách xử lý lỗi; không chỉ “schema valid” |
| Economics | Chi phí thực mỗi report đạt chuẩn | Đo API/retry/review/data/support; đủ để định giá và tính gross margin |
| Conversion | preview → xem deliverable → bắt đầu unlock → payment → full report đạt chuẩn | Ghi funnel và cohort; chưa đặt tỷ lệ giả trước baseline |
| Retention | Quay lại case, bổ sung quote/test, cập nhật quyết định | Tìm bằng chứng giá trị lặp lại trước khi xây subscription/alerts |
| Technical trust | Storage/auth isolation, job recovery, failed payment, refund và report/export consistency | Có kiểm thử và bằng chứng trên đúng môi trường production; local CI không thay thế |
| Accessibility/global | Keyboard/screen reader, contrast, 200% zoom, 390/768/1440px; EN/VI, USD/VND/EUR, dates và long content | Không có blocker trong core tasks; không tuyên bố compliance chỉ từ screenshots |

Analytics đề xuất: `research_started`, `scope_confirmed`, `preview_ready`, `evidence_opened`, `scenario_saved`, `unlock_viewed`, `checkout_started`, `report_delivered`, `validation_action_recorded`, `report_revisited`. Không đưa nội dung sản phẩm chưa public hoặc quote nhạy cảm vào payload analytics mặc định.

## 12. Scope không làm trước

Không ưu tiên dark mode, animation dày, app mobile native, community, auto outreach, auto đặt hàng, số điểm “winning product” không hiệu chuẩn, social proof giả hoặc thêm mọi marketplace ngay lập tức. Chưa xây dashboard tài chính vận hành toàn doanh nghiệp. Các tính năng đó không giải quyết được khoảng trống nguồn dữ liệu và quyết định hiện tại.

## 13. Bước thực hiện đầu tiên

Đóng gói **Workspace → Intake → Decision brief** thành một prototype thống nhất, cùng một case demo được ghi nhãn và một chuẩn Decision Pack v2. Chọn visual direction trước khi thay code. Tiến hành kiểm tra với khách mục tiêu song song với chuẩn bị research quality; chưa bật Manus/thu tiền chỉ để làm bản demo trông hoàn thiện.

## 14. Nhật ký nguồn và giới hạn

Các URL trong tài liệu được đọc ngày 29/10/2026. Chỉ dùng tài liệu chính thức của hãng và NN/g/W3C làm căn cứ về tính năng/phương pháp; đây không phải bảo chứng độc lập cho marketing claims của hãng. Perplexity hiện dẫn tới tài liệu **Projects**, vì vậy không lấy tên cũ Spaces làm tên sản phẩm hiện tại. Không thu thập báo giá doanh nghiệp hoặc mua tài khoản đối thủ. Không có khảo sát khách hàng hay conversion baseline được thực hiện trong phiên này.

Ảnh: chưa có ảnh audit được chấp nhận do lỗi capture; thư mục `.artifacts/product-review-2026-10-29/` chỉ được chuẩn bị cho lần capture tiếp theo. Không dùng ảnh cũ để thay bằng chứng phiên hiện tại.
