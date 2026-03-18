
const staffOptions = ["田中","佐藤","鈴木","高橋","上部"];
const initialStaff = [
  { id: 1, name: "田中", role: "ディレクター", email: "tanaka@design.co.jp", hoursPerDay: 8, skills: ["進行管理","クライアント対応"] },
  { id: 2, name: "佐藤", role: "デザイナー", email: "sato@design.co.jp", hoursPerDay: 8, skills: ["LP","バナー","UI"] },
  { id: 3, name: "鈴木", role: "イラストレーター", email: "suzuki@design.co.jp", hoursPerDay: 8, skills: ["イラスト","パッケージ"] },
  { id: 4, name: "高橋", role: "フロントエンド", email: "takahashi@design.co.jp", hoursPerDay: 8, skills: ["コーディング","レスポンシブ"] },
  { id: 5, name: "上部", role: "アシスタント", email: "uwabe@design.co.jp", hoursPerDay: 8, skills: ["進行補助","入稿"] },
];
const initialTemplates = [
  { id: 1, title: "ロゴデザイン基本", category: "ロゴデザイン", price: 150000, hours: 24, tasks: ["ヒアリング","ラフ作成","デザイン制作","修正対応","納品"] },
  { id: 2, title: "ウェブサイトデザイン", category: "ウェブデザイン", price: 500000, hours: 60, tasks: ["構成整理","ワイヤー","トップ制作","下層制作","レスポンシブ対応"] },
  { id: 3, title: "パッケージデザイン", category: "パッケージ", price: 300000, hours: 40, tasks: ["コンセプト設計","デザイン作成","展開案","入稿データ","確認"] },
  { id: 4, title: "広告バナー制作", category: "広告デザイン", price: 80000, hours: 12, tasks: ["構成確認","制作","リサイズ","最終確認"] },
];
function buildNotice(order){
  return `案件: ${order.projectName}\n顧客: ${order.client}\n担当: ${order.assignee}\n金額: ${Number(order.amount || 0).toLocaleString("ja-JP")}\n完了予定: ${order.finishDate || "未設定"}\nステータス: ${order.status}`;
}
function statusToJudge(status){ if(status==="納期NG") return "外注推奨"; if(status==="納品受信") return "納品受信"; return "社内対応"; }
function statusClass(status){ if(status==="納期OK") return "ok"; if(status==="納期NG") return "ng"; return "received"; }
function judgeClass(judge){ if(judge==="社内対応") return "internal"; if(judge==="外注推奨") return "outsource"; return "received"; }
function categoryClass(category){ if(category==="ロゴデザイン") return "category logo"; if(category==="ウェブデザイン") return "category web"; if(category==="パッケージ") return "category package"; return "category ad"; }
function outsourceStatusClass(status){ if(status==="依頼前") return "out-none"; if(status==="依頼済み") return "out-req"; if(status==="制作中") return "out-work"; if(status==="確認中") return "out-check"; return "ok"; }

function getDeadlineAlert(order){
  if(!order || !order.finishDate) return { label: "未設定", cls: "alert-muted" };
  if(order.status === "納品受信") return { label: "完了", cls: "alert-safe" };
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(order.finishDate + "T00:00:00");
  if(Number.isNaN(due.getTime())) return { label: "未設定", cls: "alert-muted" };
  const diffDays = Math.ceil((due - today) / 86400000);
  if(diffDays < 0) return { label: "期限超過", cls: "alert-danger" };
  if(diffDays === 0) return { label: "今日まで", cls: "alert-danger" };
  if(diffDays <= 3) return { label: "3日以内", cls: "alert-warn" };
  if(diffDays <= 7) return { label: "7日以内", cls: "alert-caution" };
  return { label: "余裕あり", cls: "alert-safe" };
}

function estimateHours(order){
  const title = String(order.projectName || "");
  const tpl = state.templates.find(t => title.includes(t.title) || t.title.includes(title));
  if(tpl) return Number(tpl.hours || 0);
  return Math.max(4, Math.round(Number(order.amount || 0) / 10000));
}
function estimateExternalCost(order){
  if(order.judge === "外注推奨" || order.outsourceStatus){
    return Math.round(Number(order.amount || 0) * 0.35);
  }
  return 0;
}
function estimateProfit(order){
  const laborCost = estimateHours(order) * 2500;
  const externalCost = estimateExternalCost(order);
  return Number(order.amount || 0) - laborCost - externalCost;
}
function profitClass(value){
  if(value < 30000) return "alert-danger";
  if(value < 80000) return "alert-warn";
  return "alert-safe";
}

const baseOrders = [
  { id: 1, projectName: "バナー制作", client: "A社", status: "納期OK", judge: "社内対応", amount: 50000, assignee: "田中", finishDate: "2026-03-25", notes: "初回制作。ロゴ位置は中央寄せ。", history: [], notice: "" },
  { id: 2, projectName: "LPデザイン", client: "B社", status: "納期NG", judge: "外注推奨", amount: 120000, assignee: "佐藤", finishDate: "2026-03-28", notes: "訴求文言の再確認が必要。", history: [], notice: "", outsourceStatus: "依頼済み", outsourceVendor: "外注デザイン社", outsourceMemo: "急ぎ案件", receivedDate: "" },
  { id: 3, projectName: "SNSキャンペーン画像", client: "チャッピー株式会社", status: "納品受信", judge: "納品受信", amount: 330000, assignee: "高橋", finishDate: "2026-03-20", notes: "納品済み。次回は同テイストで展開予定。", history: ["外注先より納品完了"], notice: "" },
];
const initialOrders = baseOrders.map(o => ({ ...o, notice: buildNotice(o) }));

const sampleClients = ["チャッピー株式会社","A社","B社","KKKスポーツ","日本商事","鳥取デザイン","山陰フーズ","未来企画","ブルースカイ","オレンジ不動産"];
const sampleProjects = ["Instagramバナー","採用LP","春キャンペーン画像","会社案内デザイン","商品パッケージ","イベントチラシ","コーポレートサイト改修","EC商品画像","ロゴリニューアル","SNS広告セット"];
const sampleStatuses = ["納期OK","納期OK","納期OK","納期NG","納品受信"];
const sampleVendors = ["外注デザイン社","スタジオ青","クリエイティブ工房","フリーランス田村","制作チームM"];

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";
}

function randomPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randomDate(startDayOffset, endDayOffset){
  const base = new Date(2026, 2, 1);
  const offset = Math.floor(Math.random() * (endDayOffset - startDayOffset + 1)) + startDayOffset;
  base.setDate(base.getDate() + offset);
  return base.toISOString().slice(0,10);
}
function buildSampleOrder(seed){
  const client = sampleClients[seed % sampleClients.length];
  const projectName = sampleProjects[(seed * 3) % sampleProjects.length] + " " + (seed + 1);
  const assignee = staffOptions[seed % staffOptions.length];
  const status = sampleStatuses[seed % sampleStatuses.length];
  const amount = 40000 + ((seed * 37) % 36) * 10000;
  const finishDate = randomDate(1, 45);
  const judge = statusToJudge(status);
  const order = {
    id: Date.now() + seed,
    client, projectName, amount, assignee, finishDate, status, judge,
    notes: "サンプル案件メモ",
    history: ["サンプル案件を追加しました"],
    outsourceStatus: judge === "外注推奨" ? randomPick(["依頼前","依頼済み","制作中"]) : "",
    outsourceVendor: judge === "外注推奨" ? randomPick(sampleVendors) : "",
    outsourceMemo: judge === "外注推奨" ? "サンプル外注案件" : "",
    receivedDate: status === "納品受信" ? randomDate(-15, -1) : "",
  };
  order.notice = buildNotice(order);
  return order;
}

function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatYen(n){ return "¥" + Number(n || 0).toLocaleString("ja-JP"); }
function sameDay(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function buildMonthCells(year, month){
  const start = new Date(year, month, 1), end = new Date(year, month+1, 0), cells = [];
  for(let i=0;i<start.getDay();i++) cells.push(null);
  for(let d=1; d<=end.getDate(); d++) cells.push(new Date(year, month, d));
  while(cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function extractFieldsFromText(text){
  const cleaned = text.replace(/\s+/g, " ").trim();
  let client = "", projectName = "", amount = "", finishDate = "";
  const clientPatterns = [/(?:顧客名|クライアント名|発注者|御社名|会社名)\s*[:：]?\s*([^\n\r]{2,40})/i,/([^\s]{2,30}株式会社)/,/([^\s]{2,30}有限会社)/];
  const projectPatterns = [/(?:案件名|件名|プロジェクト名|制作物|タイトル)\s*[:：]?\s*([^\n\r]{2,60})/i,/(?:依頼内容|内容)\s*[:：]?\s*([^\n\r]{2,60})/i];
  const amountPatterns = [/(?:金額|予算|見積|見積額|請求額)\s*[:：]?\s*¥?\s*([0-9,]{3,})/i,/¥\s*([0-9,]{3,})/];
  const datePatterns = [/(?:納期|完了予定日|納品日|希望納期)\s*[:：]?\s*(20[0-9]{2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/i,/(20[0-9]{2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/];
  for(const p of clientPatterns){ const m = cleaned.match(p); if(m&&m[1]){ client=m[1].trim(); break; } }
  for(const p of projectPatterns){ const m = cleaned.match(p); if(m&&m[1]){ projectName=m[1].trim(); break; } }
  for(const p of amountPatterns){ const m = cleaned.match(p); if(m&&m[1]){ amount=m[1].replace(/,/g,""); break; } }
  for(const p of datePatterns){ const m = cleaned.match(p); if(m&&m[1]){ finishDate=m[1].replace(/\./g,"-").replace(/\//g,"-"); break; } }
  return { client, projectName, amount, finishDate };
}

function SideNav({ currentPage, setCurrentPage }){
  const items = [["dashboard","ダッシュボード"],["orders","受注管理"],["notifications","通知履歴"],["customers","顧客管理"],["staff","スタッフ管理"],["templates","テンプレート管理"],["calendar","日程カレンダー"],["outsource","外注管理"]];
  return `<aside class="sidebar"><div class="brand">デザインマネージャー</div><div class="brand-sub">クリエイティブ管理</div><div class="nav">${items.map(([k,l])=>`<button class="${currentPage===k?'active':''}" onclick="setPage('${k}')">${l}</button>`).join("")}</div><div class="version">デザインマネージャー 公開版 v2.4</div></aside>`;
}

const state = {
  currentPage: "dashboard",
  orders: initialOrders,
  staff: initialStaff,
  templates: initialTemplates,
  query: "",
  assigneeFilter: "all",
  statusFilter: "all",
  sortMode: "dueAsc",
  selectedOrderId: null,
  createOpen: false,
  createErrors: {},
  pdfLoading: false,
  prefillTemplateId: null,
  createForm: { client:"", projectName:"", amount:"80000", assignee:staffOptions[0], finishDate:"2026-03-31", status:"納期OK", notes:"", sourceFileName:"" },
  calendarMonth: { year: 2026, month: 2 },
  selectedCalendarDate: null,
  calendarQuickEditId: null,
  staffEditorOpen: false,
  editingStaffId: null,
  templateEditorOpen: false,
  editingTemplateId: null,
  outsourceEditorId: null,
  notifications: [
    { id: 1, time: "2026-03-18 09:00", type: "案件登録", target: "SNSキャンペーン画像", message: "新規案件が登録されました。" },
    { id: 2, time: "2026-03-18 09:10", type: "ステータス変更", target: "LPデザイン", message: "ステータスが納期NGに更新されました。" },
    { id: 3, time: "2026-03-18 09:20", type: "外注更新", target: "LPデザイン", message: "外注状況が依頼済みに更新されました。" },
  ],
};


function logNotification(type, target, message){
  const stamp = new Date();
  const y = stamp.getFullYear();
  const m = String(stamp.getMonth()+1).padStart(2, "0");
  const d = String(stamp.getDate()).padStart(2, "0");
  const hh = String(stamp.getHours()).padStart(2, "0");
  const mm = String(stamp.getMinutes()).padStart(2, "0");
  state.notifications = [{
    id: Date.now(),
    time: `${y}-${m}-${d} ${hh}:${mm}`,
    type, target, message
  }, ...state.notifications];
}

function exportMonthlyReport(){
  const currentMonth = "2026-03";
  const monthlyOrders = state.orders.filter(o => String(o.finishDate || "").startsWith(currentMonth));
  const totalCount = monthlyOrders.length;
  const totalAmount = monthlyOrders.reduce((s,o)=>s+Number(o.amount||0),0);
  const receivedCount = monthlyOrders.filter(o=>o.status==="納品受信").length;
  const ngCount = monthlyOrders.filter(o=>o.status==="納期NG").length;
  const outsourceCount = monthlyOrders.filter(o=>o.judge==="外注推奨" || o.outsourceStatus).length;
  const totalProfit = monthlyOrders.reduce((s,o)=>s+estimateProfit(o),0);
  const totalExternal = monthlyOrders.reduce((s,o)=>s+estimateExternalCost(o),0);

  const customerMap = new Map();
  monthlyOrders.forEach(o=>{
    const key = o.client || "未設定";
    if(!customerMap.has(key)) customerMap.set(key, { client:key, count:0, amount:0 });
    const item = customerMap.get(key);
    item.count += 1;
    item.amount += Number(o.amount||0);
  });
  const customerRows = [...customerMap.values()].sort((a,b)=>b.amount-a.amount).slice(0,5);

  const staffRows = state.staff.map(s=>({
    name:s.name,
    count: monthlyOrders.filter(o=>o.assignee===s.name).length,
    hours: monthlyOrders.filter(o=>o.assignee===s.name).reduce((sum,o)=>sum+estimateHours(o),0),
  })).sort((a,b)=>b.count-a.count || b.hours-a.hours);

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>月次レポート_${currentMonth}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:32px}
.wrap{max-width:1100px;margin:0 auto}
h1{font-size:30px;margin:0 0 8px}
.sub{color:#64748b;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:18px}
.label{font-size:12px;color:#64748b;margin-bottom:8px}
.value{font-size:28px;font-weight:800}
.section{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:20px;margin-top:20px}
h2{font-size:18px;margin:0 0 14px}
.row{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid #eef2f7}
.row:first-child{border-top:none;padding-top:0}
.small{font-size:12px;color:#64748b}
.badge{display:inline-flex;padding:5px 10px;border-radius:999px;background:#f5f3ff;color:#6d28d9;font-size:12px;font-weight:700}
@media print{body{padding:0}.section,.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="wrap">
  <h1>デザインマネージャー 月次レポート</h1>
  <div class="sub">${currentMonth} の集計レポート</div>

  <div class="grid">
    <div class="card"><div class="label">受注件数</div><div class="value">${totalCount}</div></div>
    <div class="card"><div class="label">受注総額</div><div class="value">${formatYen(totalAmount)}</div></div>
    <div class="card"><div class="label">納品受信件数</div><div class="value">${receivedCount}</div></div>
    <div class="card"><div class="label">納期NG件数</div><div class="value">${ngCount}</div></div>
    <div class="card"><div class="label">外注案件数</div><div class="value">${outsourceCount}</div></div>
    <div class="card"><div class="label">推定利益</div><div class="value">${formatYen(totalProfit)}</div></div>
    <div class="card"><div class="label">外注想定コスト</div><div class="value">${formatYen(totalExternal)}</div></div>
    <div class="card"><div class="label">推定総工数</div><div class="value">${monthlyOrders.reduce((s,o)=>s+estimateHours(o),0)}h</div></div>
  </div>

  <div class="section">
    <h2>顧客別上位</h2>
    ${customerRows.length===0 ? `<div class="small">データなし</div>` : customerRows.map((c,i)=>`
      <div class="row">
        <div>
          <div><strong>${i+1}. ${esc(c.client)}</strong></div>
          <div class="small">案件数: ${c.count}件</div>
        </div>
        <div><span class="badge">${formatYen(c.amount)}</span></div>
      </div>
    `).join("")}
  </div>

  <div class="section">
    <h2>担当者別件数 / 工数</h2>
    ${staffRows.map(s=>`
      <div class="row">
        <div>
          <div><strong>${esc(s.name)}</strong></div>
          <div class="small">案件数: ${s.count}件</div>
        </div>
        <div><span class="badge">${s.hours}h</span></div>
      </div>
    `).join("")}
  </div>

  <div class="section">
    <h2>案件一覧</h2>
    ${monthlyOrders.length===0 ? `<div class="small">データなし</div>` : monthlyOrders.sort((a,b)=>String(a.finishDate||"").localeCompare(String(b.finishDate||""))).map(o=>`
      <div class="row">
        <div>
          <div><strong>${esc(o.projectName)}</strong></div>
          <div class="small">${esc(o.client)} / ${esc(o.assignee)} / 納期: ${esc(o.finishDate || "未設定")}</div>
        </div>
        <div><span class="badge">${formatYen(o.amount)}</span></div>
      </div>
    `).join("")}
  </div>
</div>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monthly_report_${currentMonth}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
function setPage(page){ state.currentPage = page; render(); }
function openCreate(prefillTemplateId=null){
  state.prefillTemplateId = prefillTemplateId;
  state.createOpen = true;
  state.createErrors = {};
  if(prefillTemplateId){
    const tpl = state.templates.find(t => t.id === prefillTemplateId);
    state.createForm = { client:"", projectName:tpl?.title || "", amount:String(tpl?.price || 80000), assignee:staffOptions[0], finishDate:"2026-03-31", status:"納期OK", notes:"", sourceFileName:"" };
  } else {
    state.createForm = { client:"", projectName:"", amount:"80000", assignee:staffOptions[0], finishDate:"2026-03-31", status:"納期OK", notes:"", sourceFileName:"" };
  }
  render();
}
function closeCreate(){ state.createOpen = false; render(); }
function openOrder(id){ state.selectedOrderId = id; render(); }
function closeOrder(){ state.selectedOrderId = null; render(); }
function openStaffEditor(id=null){ state.staffEditorOpen = true; state.editingStaffId = id; render(); }
function closeStaffEditor(){ state.staffEditorOpen = false; state.editingStaffId = null; render(); }
function openTemplateEditor(id=null){ state.templateEditorOpen = true; state.editingTemplateId = id; render(); }
function closeTemplateEditor(){ state.templateEditorOpen = false; state.editingTemplateId = null; render(); }
function openOutsourceEditor(id){ state.outsourceEditorId = id; render(); }
function closeOutsourceEditor(){ state.outsourceEditorId = null; render(); }
function openCalendarQuickEdit(id){ state.calendarQuickEditId = id; render(); }
function closeCalendarQuickEdit(){ state.calendarQuickEditId = null; render(); }

function renderDashboard(){
  const totalAmount = state.orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const activeCount = state.orders.filter((o) => o.status !== "納品受信").length;
  const ngCount = state.orders.filter((o) => o.status === "納期NG").length;
  const receivedCount = state.orders.filter((o) => o.status === "納品受信").length;
  const recentOrders = state.orders.slice(0, 5);
  const currentMonth = "2026-03";
  const monthlyOrders = state.orders.filter((o) => String(o.finishDate || "").startsWith(currentMonth));
  const monthlyCount = monthlyOrders.length;
  const monthlyAmount = monthlyOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const nearDueOrders = [...state.orders]
    .filter((o) => o.status !== "納品受信")
    .sort((a,b)=>String(a.finishDate||"9999-99-99").localeCompare(String(b.finishDate||"9999-99-99")))
    .slice(0,5);
  const outsourceCount = state.orders.filter((o) => o.judge === "外注推奨" || o.outsourceStatus).length;
  const staffSummary = state.staff.map((m) => ({ name:m.name, count: state.orders.filter((o)=>o.assignee===m.name).length }));
  const statusTotal = Math.max(state.orders.length, 1);
  const okCount = state.orders.filter((o) => o.status === "納期OK").length;
  const weekDanger = state.orders.filter((o) => o.status !== "納品受信" && (o.finishDate || "") <= "2026-03-21").length;
  const weekWarn = state.orders.filter((o) => o.status !== "納品受信" && (o.finishDate || "") > "2026-03-21" && (o.finishDate || "") <= "2026-03-25").length;
  const weekSafe = state.orders.filter((o) => o.status !== "納品受信" && (o.finishDate || "") > "2026-03-25").length;

  const barRow = (label, value, max, cls="") => `
    <div class="bar-row">
      <div class="bar-head"><span>${label}</span><strong>${value}</strong></div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${Math.min(max ? (value / max) * 100 : 0, 100)}%"></div></div>
    </div>`;

  const moneyBars = (() => {
    const months = [
      { label: "1月", amount: Math.round(totalAmount * 0.42) },
      { label: "2月", amount: Math.round(totalAmount * 0.61) },
      { label: "3月", amount: monthlyAmount || Math.round(totalAmount * 0.64) },
    ];
    const maxAmount = Math.max(...months.map(m => m.amount), 1);
    return months.map(m => `
      <div class="bar-row">
        <div class="bar-head"><span>${m.label}</span><strong>${formatYen(m.amount)}</strong></div>
        <div class="bar-track"><div class="bar-fill info" style="width:${(m.amount / maxAmount) * 100}%"></div></div>
      </div>`).join("");
  })();

  return `
  <div class="page-head"><div><div class="page-title">ダッシュボード</div><div class="page-sub">案件の概要と進捗状況</div></div><div class="top-actions"><button class="btn primary" onclick="exportMonthlyReport()">月次レポート出力</button><div class="card" style="padding:14px 18px;font-weight:700;color:#6d3df5;">チャッピー株式会社</div></div></div>
  <div class="stat-grid">
    ${statCard("すべてのプロジェクト", state.orders.length, "登録済み")}
    ${statCard("進行中", activeCount, "アクティブ")}
    ${statCard("納期NG", ngCount, "要対応")}
    ${statCard("納品受信", receivedCount, "完了扱い")}
    ${statCard("受注総額", formatYen(totalAmount), "累計")}
    ${statCard("スタッフ", state.staff.length, "登録人数")}
  </div>
  <div class="stat-grid-4" style="margin-top:16px">
    ${statCard("今月の受注件数", monthlyCount, "2026年3月")}
    ${statCard("今月の受注金額", formatYen(monthlyAmount), "2026年3月")}
    ${statCard("外注案件数", outsourceCount, "候補含む")}
    ${statCard("納期近い案件", nearDueOrders.length, "未完了のみ")}
  </div>
  <div class="grid-3" style="margin-top:16px">
    <div class="card"><div style="font-weight:700;margin-bottom:14px">最近の受注</div>${recentOrders.map(o=>`<div class="list-item"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><div style="font-weight:700">${esc(o.client)} / ${esc(o.projectName)}</div><div class="help" style="margin-top:6px">担当: ${esc(o.assignee)} ・ 納期: ${esc(o.finishDate||"未設定")}</div></div><div class="badges">${(() => { const a = getDeadlineAlert(o); return `<span class="alert-chip ${a.cls}">${a.label}</span>`; })()}<span class="badge ${statusClass(o.status)}">${esc(o.status)}</span><span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span></div></div></div>`).join("")}</div>
    <div class="card"><div style="font-weight:700;margin-bottom:14px">納期が近い案件</div>${nearDueOrders.length===0?`<div class="help">対象案件はありません。</div>`:nearDueOrders.map(o=>`<div class="list-item"><div style="font-weight:700">${esc(o.projectName)}</div><div class="help" style="margin-top:6px">${esc(o.client)} / ${esc(o.finishDate||"未設定")}</div></div>`).join("")}</div>
    <div class="card"><div style="font-weight:700;margin-bottom:14px">担当者別件数</div>${staffSummary.map(s=>`<div class="list-item" style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:700">${esc(s.name)}</div><div>${s.count}件</div></div>`).join("")}</div>
  </div>
  <div class="grid-3" style="margin-top:16px">
    <div class="bar-card">
      <div class="bar-title">今週の納期バー</div>
      ${barRow("今日〜3日以内", weekDanger, Math.max(activeCount, 1), "danger")}
      ${barRow("4〜7日以内", weekWarn, Math.max(activeCount, 1), "warn")}
      ${barRow("8日以降", weekSafe, Math.max(activeCount, 1), "ok")}
      <div class="compact-note">未完了案件を納期の近さで可視化しています。</div>
    </div>
    <div class="bar-card">
      <div class="bar-title">月別売上バー</div>
      ${moneyBars}
      <div class="compact-note">発表用デモとして月別イメージを表示しています。</div>
    </div>
    <div class="bar-card">
      <div class="bar-title">案件ステータス比率バー</div>
      ${barRow("納期OK", okCount, statusTotal, "ok")}
      ${barRow("納期NG", ngCount, statusTotal, "danger")}
      ${barRow("納品受信", receivedCount, statusTotal, "info")}
      <div class="compact-note">案件全体の状態をひと目で把握できます。</div>
    </div>
  </div>
  <div class="metric-grid" style="margin-top:16px">
    <div class="metric-box">
      <div class="metric-label">推定総工数</div>
      <div class="metric-value">${state.orders.reduce((s,o)=>s+estimateHours(o),0)}h</div>
      <div class="metric-sub">テンプレート工数 + 金額ベース推定</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">進行中工数</div>
      <div class="metric-value">${state.orders.filter(o=>o.status!=="納品受信").reduce((s,o)=>s+estimateHours(o),0)}h</div>
      <div class="metric-sub">未完了案件の想定工数</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">推定総利益</div>
      <div class="metric-value">${formatYen(state.orders.reduce((s,o)=>s+estimateProfit(o),0))}</div>
      <div class="metric-sub">売上 - 人件費 - 外注費(推定)</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">外注想定コスト</div>
      <div class="metric-value">${formatYen(state.orders.reduce((s,o)=>s+estimateExternalCost(o),0))}</div>
      <div class="metric-sub">外注候補案件の推定費用</div>
    </div>
  </div>`;
}
function statCard(title, value, sub){ return `<div class="card"><div class="stat-label">${title}</div><div class="stat-value">${esc(value)}</div><div class="stat-sub">${esc(sub)}</div></div>`; }

function filteredOrders(){
  let list = state.orders.filter((o) => {
    const textMatch = [String(o.id), o.projectName, o.client, o.assignee, o.status].join(" ").toLowerCase().includes(state.query.toLowerCase());
    const assigneeMatch = state.assigneeFilter === "all" ? true : o.assignee === state.assigneeFilter;
    const statusMatch = state.statusFilter === "all" ? true : o.status === state.statusFilter;
    return textMatch && assigneeMatch && statusMatch;
  });
  list = [...list].sort((a,b)=>{
    if(state.sortMode === "dueAsc") return String(a.finishDate||"9999-99-99").localeCompare(String(b.finishDate||"9999-99-99"));
    if(state.sortMode === "dueDesc") return String(b.finishDate||"0000-00-00").localeCompare(String(a.finishDate||"0000-00-00"));
    if(state.sortMode === "amountDesc") return Number(b.amount||0) - Number(a.amount||0);
    if(state.sortMode === "amountAsc") return Number(a.amount||0) - Number(b.amount||0);
    return 0;
  });
  return list;
}
function addSampleOrders(count){
  const existingKeys = new Set(state.orders.map(o => `${o.client}-${o.projectName}`));
  const next = []; let seed = 0;
  while(next.length < count && seed < 500){
    const sample = buildSampleOrder(seed + state.orders.length + next.length);
    const key = `${sample.client}-${sample.projectName}`;
    if(!existingKeys.has(key)){ existingKeys.add(key); next.push(sample); }
    seed += 1;
  }
  state.orders = [...next, ...state.orders];
  next.forEach(o => logNotification("案件登録", o.projectName, `サンプル案件を追加しました。`));
  render();
}
function exportCsv(){
  const rows = filteredOrders();
  const headers = ["ID","案件","顧客","金額","担当","完了予定","ステータス","判定"];
  const data = [headers, ...rows.map(o => [o.id,o.projectName,o.client,o.amount,o.assignee,o.finishDate||"",o.status,o.judge])];
  const csv = data.map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "orders_filtered_export.csv"; a.click();
  URL.revokeObjectURL(url);
}

function renderOrders(){
  const orders = filteredOrders();
  const totalAmount = orders.reduce((sum,o)=>sum+Number(o.amount||0),0);
  return `
  <div class="page-head"><div><div class="page-title">受注管理 V3.1</div><div class="page-sub">一覧ステータス変更・詳細編集・通知文面更新・履歴管理</div></div><div class="top-actions"><div class="card" style="padding:14px 18px">表示案件合計: <strong>${formatYen(totalAmount)}</strong></div><button class="btn soft" onclick="addSampleOrders(1)">サンプル1件</button><button class="btn soft" onclick="addSampleOrders(10)">サンプル10件</button><button class="btn soft" onclick="addSampleOrders(30)">サンプル30件</button><button class="btn" onclick="exportCsv()">CSV出力</button><button class="btn primary" onclick="openCreate()">新規案件追加</button></div></div>
  <div class="card">
    <div class="grid-2">
      <input placeholder="案件名・顧客・担当者・ステータスで検索" value="${esc(state.query)}" oninput="state.query=this.value;render()">
      <div></div>
    </div>
    <div class="stat-grid-4" style="margin-top:12px">
      <select onchange="state.assigneeFilter=this.value;render()"><option value="all">担当者: すべて</option>${staffOptions.map(n=>`<option value="${n}" ${state.assigneeFilter===n?'selected':''}>${n}</option>`).join("")}</select>
      <select onchange="state.statusFilter=this.value;render()"><option value="all">ステータス: すべて</option>${["納期OK","納期NG","納品受信"].map(s=>`<option value="${s}" ${state.statusFilter===s?'selected':''}>${s}</option>`).join("")}</select>
      <select onchange="state.sortMode=this.value;render()"><option value="dueAsc" ${state.sortMode==="dueAsc"?"selected":""}>納期が近い順</option><option value="dueDesc" ${state.sortMode==="dueDesc"?"selected":""}>納期が遅い順</option><option value="amountDesc" ${state.sortMode==="amountDesc"?"selected":""}>金額が高い順</option><option value="amountAsc" ${state.sortMode==="amountAsc"?"selected":""}>金額が低い順</option></select>
      <button class="btn" onclick="state.query='';state.assigneeFilter='all';state.statusFilter='all';state.sortMode='dueAsc';render()">フィルター解除</button>
    </div>
  </div>
  <div class="table"><div class="table-head" style="grid-template-columns:.6fr 1.3fr 1fr .8fr .7fr .9fr .9fr 1fr 1fr .8fr"><div>ID</div><div>案件</div><div>顧客</div><div>金額</div><div>工数</div><div>利益</div><div>完了予定</div><div>締切アラート</div><div>ステータス</div><div>操作</div></div>
  ${orders.length===0?`<div style="padding:50px;text-align:center;color:#94a3b8">一致する案件がありません</div>`:orders.map(o=>`<div class="table-row" style="grid-template-columns:.6fr 1.3fr 1fr .8fr .7fr .9fr .9fr 1fr 1fr .8fr"><div><strong>${o.id}</strong></div><div><strong>${esc(o.projectName)}</strong>${o.notes ? `<div class="help" style="margin-top:4px">メモあり</div>` : ""}</div><div>${esc(o.client)}</div><div>${formatYen(o.amount)}</div><div>${estimateHours(o)}h</div><div><span class="alert-chip ${profitClass(estimateProfit(o))}">${formatYen(estimateProfit(o))}</span></div><div>${esc(o.finishDate || "未設定")}</div><div>${(() => { const a = getDeadlineAlert(o); return `<span class="alert-chip ${a.cls}">${a.label}</span>`; })()}</div><div><select class="${statusClass(o.status)}" onchange="updateStatus(${o.id}, this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join("")}</select></div><div><button class="btn" onclick="openOrder(${o.id})">開く</button></div></div>`).join("")}
  </div>${renderOrderModal()}`;
}
function updateStatus(id,status){
  state.orders = state.orders.map(o=>{
    if(o.id!==id) return o;
    const updated = {...o,status,judge:statusToJudge(status)};
    logNotification("ステータス変更", o.projectName, `ステータスが${status}に更新されました。`);
    return {...updated, notice:buildNotice(updated), history:[...(o.history||[]),`ステータス変更: ${status}`]};
  });
  render();
}
function renderOrderModal(){
  const order = state.orders.find(o => o.id === state.selectedOrderId);
  if(!order) return "";
  const historyHtml = (order.history||[]).length ? order.history.map(h=>`<div class="history-item">${esc(h)}</div>`).join("") : `<div class="help">履歴なし</div>`;
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeOrder()"><div class="modal"><div class="modal-grid">
  <div><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px"><div><h3 style="margin:0 0 6px">案件編集</h3><div class="help">案件情報を編集して保存できます</div></div><div class="help">ID: ${order.id}</div></div>
    <input value="${esc(order.projectName)}" oninput="patchOrder('projectName', this.value)"><div style="height:8px"></div>
    <input value="${esc(order.client)}" oninput="patchOrder('client', this.value)"><div style="height:8px"></div>
    <input value="${esc(order.amount)}" oninput="patchOrder('amount', this.value.replace(/[^0-9]/g,''))"><div style="height:8px"></div>
    <select onchange="patchOrder('assignee', this.value)">${staffOptions.map(n=>`<option ${order.assignee===n?'selected':''}>${n}</option>`).join("")}</select><div style="height:8px"></div>
    <input type="date" value="${esc(order.finishDate||"")}" oninput="patchOrder('finishDate', this.value)"><div style="height:8px"></div>
    <select class="${statusClass(order.status)}" onchange="patchOrder('status', this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${order.status===s?'selected':''}>${s}</option>`).join("")}</select><div style="height:8px"></div><div><div class="help" style="margin-bottom:6px">案件メモ</div><textarea oninput="patchOrder('notes', this.value)">${esc(order.notes || "")}</textarea></div>
    <div class="top-actions" style="margin-top:16px"><button class="btn primary" onclick="saveOrder()">保存する</button><button class="btn" onclick="duplicateOrder()">複製する</button><button class="btn danger" onclick="deleteOrder()">削除する</button><button class="btn" onclick="closeOrder()">閉じる</button></div></div>
  <div><div style="font-weight:700;margin-bottom:10px">通知文面プレビュー</div><div class="notice-box">${esc(buildNotice(order))}</div><div style="font-weight:700;margin:16px 0 10px">工数 / 利益</div><div class="notice-box">推定工数: ${estimateHours(order)}h\n推定利益: ${formatYen(estimateProfit(order))}\n外注想定コスト: ${formatYen(estimateExternalCost(order))}</div><div style="font-weight:700;margin:16px 0 10px">締切アラート</div><div>${(() => { const a = getDeadlineAlert(order); return `<span class="alert-chip ${a.cls}">${a.label}</span>`; })()}</div><div style="font-weight:700;margin:16px 0 10px">案件メモ</div><div class="notice-box">${esc(order.notes || "メモなし")}</div><div style="font-weight:700;margin:16px 0 10px">現在の判定</div><div class="badge ${judgeClass(statusToJudge(order.status))}">${statusToJudge(order.status)}</div></div>
  <div><div style="font-weight:700;margin-bottom:10px">変更履歴</div><div class="history-box">${historyHtml}</div></div>
  </div></div></div>`;
}
function patchOrder(key,val){ state.orders = state.orders.map(o=>o.id===state.selectedOrderId?{...o,[key]:val}:o);  }
function saveOrder(){
  state.orders = state.orders.map(o=>{
    if(o.id!==state.selectedOrderId) return o;
    const next = {...o, judge: statusToJudge(o.status)};
    next.notice = buildNotice(next);
    const history = [...(o.history||[])];
    history.push("案件情報を保存しました");
    if ((o.notes || "") !== (next.notes || "")) {
      history.push("案件メモを更新しました");
      logNotification("メモ更新", next.projectName, "案件メモが更新されました。");
    }
    logNotification("案件更新", next.projectName, "案件情報が保存されました。");
    next.history = history;
    return next;
  });
  render();
}
function duplicateOrder(){
  const order = state.orders.find(o=>o.id===state.selectedOrderId); if(!order) return;
  state.orders = [{...order,id:Date.now(),history:[...(order.history||[]),"案件を複製しました"]}, ...state.orders];
  render();
}
function deleteOrder(){ state.orders = state.orders.filter(o=>o.id!==state.selectedOrderId); state.selectedOrderId = null; render(); }



function notificationTypeClass(type){
  if(type === "案件登録") return "alert-safe";
  if(type === "ステータス変更") return "alert-warn";
  if(type === "外注更新") return "alert-caution";
  if(type === "メモ更新") return "alert-muted";
  return "alert-safe";
}
function renderNotifications(){
  const total = state.notifications.length;
  const today = state.notifications.filter(n => n.time.startsWith("2026-03-18")).length;
  const statusCount = state.notifications.filter(n => n.type === "ステータス変更").length;
  const memoCount = state.notifications.filter(n => n.type === "メモ更新").length;
  return `
  <div class="page-head">
    <div><div class="page-title">通知履歴</div><div class="page-sub">案件更新やステータス変更の履歴を確認</div></div>
    <div class="top-actions"><div class="card" style="padding:14px 18px;font-weight:700;">通知件数: ${total}件</div></div>
  </div>
  <div class="stat-grid-4">
    ${statCard("総通知件数", total, "全履歴")}
    ${statCard("本日の通知", today, "当日分")}
    ${statCard("ステータス変更", statusCount, "更新通知")}
    ${statCard("メモ更新", memoCount, "編集通知")}
  </div>
  <div class="card" style="margin-top:16px">
    <div style="font-weight:700;margin-bottom:14px">通知一覧</div>
    ${state.notifications.length===0 ? `<div class="help">通知履歴はありません。</div>` : state.notifications.map(n => `
      <div class="list-item">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <span class="alert-chip ${notificationTypeClass(n.type)}">${esc(n.type)}</span>
              <strong>${esc(n.target)}</strong>
            </div>
            <div style="margin-top:8px">${esc(n.message)}</div>
            <div class="help" style="margin-top:6px">${esc(n.time)}</div>
          </div>
        </div>
      </div>
    `).join("")}
  </div>`;
}

function renderCustomers(){
  const map = new Map();
  state.orders.forEach(o => {
    const key = o.client || "未設定";
    if(!map.has(key)){
      map.set(key, { client:key, count:0, amount:0, active:0, lastDue:"", orders:[] });
    }
    const item = map.get(key);
    item.count += 1;
    item.amount += Number(o.amount || 0);
    if(o.status !== "納品受信") item.active += 1;
    if((o.finishDate || "") > (item.lastDue || "")) item.lastDue = o.finishDate || "";
    item.orders.push(o);
  });
  const customers = [...map.values()].sort((a,b)=>b.amount-a.amount || b.count-a.count || a.client.localeCompare(b.client));
  const totalCustomers = customers.length;
  const topAmount = customers[0] ? customers[0].amount : 0;
  const totalAmount = customers.reduce((s,c)=>s+c.amount,0);

  return `
  <div class="page-head">
    <div><div class="page-title">顧客管理</div><div class="page-sub">顧客ごとの案件状況と累計受注を確認</div></div>
    <div class="top-actions"><div class="card" style="padding:14px 18px;font-weight:700;">顧客数: ${totalCustomers}社</div></div>
  </div>
  <div class="stat-grid-4">
    ${statCard("登録顧客数", totalCustomers, "取引先")}
    ${statCard("累計受注総額", formatYen(totalAmount), "全顧客合計")}
    ${statCard("進行中顧客数", customers.filter(c=>c.active>0).length, "未完了案件あり")}
    ${statCard("最大顧客売上", formatYen(topAmount), "トップ顧客")}
  </div>
  <div class="grid-2" style="margin-top:16px">
    <div class="card">
      <div style="font-weight:700;margin-bottom:14px">顧客別ランキング</div>
      ${customers.length===0 ? `<div class="help">顧客データがありません。</div>` : customers.map((c,i)=>`
        <div class="list-item">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div>
              <div style="font-weight:700">${i+1}. ${esc(c.client)}</div>
              <div class="help" style="margin-top:6px">案件数: ${c.count}件 ・ 進行中: ${c.active}件 ・ 最終納期: ${esc(c.lastDue || "未設定")}</div>
            </div>
            <div style="font-weight:800">${formatYen(c.amount)}</div>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="card">
      <div style="font-weight:700;margin-bottom:14px">顧客別案件一覧</div>
      ${customers.length===0 ? `<div class="help">顧客データがありません。</div>` : customers.map(c=>`
        <div class="list-item">
          <div style="font-weight:700;margin-bottom:10px">${esc(c.client)}</div>
          ${c.orders.slice().sort((a,b)=>String(a.finishDate||"").localeCompare(String(b.finishDate||""))).map(o=>{
            return `<div class="detail-item" style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap">
                <div>
                  <div style="font-weight:700">${esc(o.projectName)}</div>
                  <div class="help" style="margin-top:4px">金額: ${formatYen(o.amount)} ・ 担当: ${esc(o.assignee)} ・ 納期: ${esc(o.finishDate || "未設定")}</div>
                </div>
                <div class="badges">
                  <span class="badge ${statusClass(o.status)}">${esc(o.status)}</span>
                  <span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span>
                </div>
              </div>
            </div>`;
          }).join("")}
        </div>
      `).join("")}
    </div>
  </div>`;
}

function renderStaff(){
  return `<div class="page-head"><div><div class="page-title">スタッフ管理</div><div class="page-sub">担当者の役割と稼働状況</div></div><button class="btn primary" onclick="openStaffEditor()">スタッフ追加</button></div>
  <div class="staff-grid">${state.staff.map(member=>{ const load = state.orders.filter(o=>o.assignee===member.name && o.status!=="納品受信").reduce((sum,o)=>sum+Math.max(Math.round(Number(o.amount||0)/10000),4),0); const percent = Math.min(Math.round(load/40*100),100); return `<div class="card"><div style="display:flex;justify-content:space-between;gap:12px"><div><div style="font-size:18px;font-weight:800">${esc(member.name)}</div><div class="help" style="margin-top:4px">${esc(member.role)}</div></div><div class="badge ok">稼働中</div></div><div class="help" style="margin-top:14px">${esc(member.email)}</div><div style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:8px"><span>想定稼働</span><span>${load}時間</span></div><div class="progress"><div style="width:${percent}%"></div></div></div><div class="chips">${(member.skills||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div><div class="top-actions" style="margin-top:14px"><button class="btn" onclick="openStaffEditor(${member.id})">編集</button><button class="btn danger" onclick="deleteStaff(${member.id})">削除</button></div></div>`; }).join("")}</div>${renderStaffModal()}`;
}
function renderStaffModal(){
  if(!state.staffEditorOpen) return "";
  const member = state.editingStaffId ? state.staff.find(s=>s.id===state.editingStaffId) : {name:"",role:"デザイナー",email:"",hoursPerDay:8,skills:[""]};
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeStaffEditor()"><div class="modal" style="width:min(820px,100%)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px"><div><h3 style="margin:0 0 6px">スタッフ編集</h3><div class="help">スタッフ情報を追加・編集できます</div></div><button class="btn" onclick="closeStaffEditor()">閉じる</button></div>
  <div class="grid-2">
    <div><div class="help" style="margin-bottom:6px">名前</div><input value="${esc(member.name||"")}" oninput="patchStaff('name', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">役職</div><input value="${esc(member.role||"")}" oninput="patchStaff('role', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">メール</div><input value="${esc(member.email||"")}" oninput="patchStaff('email', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">1日稼働時間</div><input type="number" value="${esc(member.hoursPerDay||8)}" oninput="patchStaff('hoursPerDay', this.value)"></div>
    <div style="grid-column:1/-1"><div class="help" style="margin-bottom:6px">スキル（1行に1つ）</div><textarea oninput="patchStaffSkills(this.value)">${esc((member.skills||[]).join('\n'))}</textarea></div>
  </div>
  <div class="top-actions" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeStaffEditor()">キャンセル</button><button class="btn primary" onclick="saveStaff()">保存する</button></div></div></div>`;
}
function patchStaff(key,val){
  if(state.editingStaffId){
    state.staff = state.staff.map(s=>s.id===state.editingStaffId?{...s,[key]:key==="hoursPerDay"?Number(val||0):val}:s);
  }else{
    state._draftStaff = state._draftStaff || {name:"",role:"デザイナー",email:"",hoursPerDay:8,skills:[""]};
    state._draftStaff[key] = key==="hoursPerDay"?Number(val||0):val;
  }
  render();
}
function patchStaffSkills(text){
  if(state.editingStaffId){
    state.staff = state.staff.map(s=>s.id===state.editingStaffId?{...s,skills:text.split("\n")}:s);
  }else{
    state._draftStaff = state._draftStaff || {name:"",role:"デザイナー",email:"",hoursPerDay:8,skills:[""]};
    state._draftStaff.skills = text.split("\n");
  }
  render();
}
function saveStaff(){
  if(state.editingStaffId){
    state.staff = state.staff.map(s=>s.id===state.editingStaffId?{...s,skills:(s.skills||[]).map(x=>String(x).trim()).filter(Boolean)}:s);
  }else{
    const d = state._draftStaff || {name:"",role:"デザイナー",email:"",hoursPerDay:8,skills:[""]};
    if(!d.name || !d.name.trim()) return;
    state.staff = [{...d,id:Date.now(),skills:(d.skills||[]).map(x=>String(x).trim()).filter(Boolean)}, ...state.staff];
    delete state._draftStaff;
  }
  closeStaffEditor();
}
function deleteStaff(id){ state.staff = state.staff.filter(s=>s.id!==id); render(); }

function renderTemplates(){
  return `<div class="page-head"><div><div class="page-title">テンプレート管理</div><div class="page-sub">制作テンプレートの一覧と標準工数</div></div><button class="btn primary" onclick="openTemplateEditor()">テンプレート追加</button></div>
  <div class="template-grid">${state.templates.map(t=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div style="font-size:18px;font-weight:800">${esc(t.title)}</div><div class="${categoryClass(t.category)} badge" style="margin-top:8px">${esc(t.category)}</div></div><div style="text-align:right" class="help"><div>${formatYen(t.price)}</div><div style="margin-top:4px">${t.hours}時間</div></div></div><div style="margin-top:14px">${(t.tasks||[]).map(task=>`<div class="task-item">${esc(task)}</div>`).join("")}</div><div class="top-actions" style="margin-top:14px"><button class="btn primary" onclick="openCreate(${t.id})">このテンプレートで案件作成</button><button class="btn" onclick="openTemplateEditor(${t.id})">編集</button><button class="btn danger" onclick="deleteTemplate(${t.id})">削除</button></div></div>`).join("")}</div>${renderTemplateModal()}`;
}
function renderTemplateModal(){
  if(!state.templateEditorOpen) return "";
  const tpl = state.editingTemplateId ? state.templates.find(t=>t.id===state.editingTemplateId) : {title:"",category:"ロゴデザイン",price:80000,hours:12,tasks:[""]};
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeTemplateEditor()"><div class="modal" style="width:min(820px,100%)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px"><div><h3 style="margin:0 0 6px">テンプレート編集</h3><div class="help">テンプレート情報を追加・編集できます</div></div><button class="btn" onclick="closeTemplateEditor()">閉じる</button></div>
  <div class="grid-2">
    <div><div class="help" style="margin-bottom:6px">テンプレート名</div><input value="${esc(tpl.title||"")}" oninput="patchTemplate('title', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">カテゴリ</div><select onchange="patchTemplate('category', this.value)">${["ロゴデザイン","ウェブデザイン","パッケージ","広告デザイン"].map(c=>`<option ${tpl.category===c?'selected':''}>${c}</option>`).join("")}</select></div>
    <div><div class="help" style="margin-bottom:6px">価格</div><input type="number" value="${esc(tpl.price||0)}" oninput="patchTemplate('price', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">標準工数</div><input type="number" value="${esc(tpl.hours||0)}" oninput="patchTemplate('hours', this.value)"></div>
    <div style="grid-column:1/-1"><div class="help" style="margin-bottom:6px">作業項目（1行に1つ）</div><textarea oninput="patchTemplateTasks(this.value)">${esc((tpl.tasks||[]).join('\n'))}</textarea></div>
  </div>
  <div class="top-actions" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeTemplateEditor()">キャンセル</button><button class="btn primary" onclick="saveTemplate()">保存する</button></div></div></div>`;
}
function patchTemplate(key,val){
  if(state.editingTemplateId){
    state.templates = state.templates.map(t=>t.id===state.editingTemplateId?{...t,[key]:(key==="price"||key==="hours")?Number(val||0):val}:t);
  }else{
    state._draftTemplate = state._draftTemplate || {title:"",category:"ロゴデザイン",price:80000,hours:12,tasks:[""]};
    state._draftTemplate[key] = (key==="price"||key==="hours")?Number(val||0):val;
  }
  render();
}
function patchTemplateTasks(text){
  if(state.editingTemplateId){
    state.templates = state.templates.map(t=>t.id===state.editingTemplateId?{...t,tasks:text.split("\n")}:t);
  }else{
    state._draftTemplate = state._draftTemplate || {title:"",category:"ロゴデザイン",price:80000,hours:12,tasks:[""]};
    state._draftTemplate.tasks = text.split("\n");
  }
  render();
}
function saveTemplate(){
  if(state.editingTemplateId){
    state.templates = state.templates.map(t=>t.id===state.editingTemplateId?{...t,tasks:(t.tasks||[]).map(x=>String(x).trim()).filter(Boolean)}:t);
  }else{
    const d = state._draftTemplate || {title:"",category:"ロゴデザイン",price:80000,hours:12,tasks:[""]};
    if(!d.title || !d.title.trim()) return;
    state.templates = [{...d,id:Date.now(),tasks:(d.tasks||[]).map(x=>String(x).trim()).filter(Boolean)}, ...state.templates];
    delete state._draftTemplate;
  }
  closeTemplateEditor();
}
function deleteTemplate(id){ state.templates = state.templates.filter(t=>t.id!==id); render(); }

function renderCalendar(){
  const {year, month} = state.calendarMonth;
  const cells = buildMonthCells(year, month);
  const weekdays = ["日","月","火","水","木","金","土"];
  const today = new Date();
  const ordersForDate = (date) => state.orders.filter(order => { const d = new Date(order.finishDate); return !Number.isNaN(d.getTime()) && sameDay(d, date); });
  const selectedOrders = state.selectedCalendarDate ? ordersForDate(new Date(state.selectedCalendarDate)) : [];
  return `<div class="page-head"><div><div class="page-title">日程カレンダー</div><div class="page-sub">完了予定日ベースの月間表示</div></div></div>
  <div class="calendar-wrap"><div class="card"><div class="calendar-header"><button class="btn" onclick="changeMonth(-1)">前月</button><div style="font-size:20px;font-weight:800">${year}年 ${month+1}月</div><button class="btn" onclick="changeMonth(1)">次月</button></div><div class="calendar-grid">${weekdays.map(d=>`<div class="weekday">${d}</div>`).join("")}${cells.map(cell=>{ if(!cell) return `<div class="day empty"></div>`; const dayOrders = ordersForDate(cell); return `<button class="day ${sameDay(cell,today)?'today':''}" onclick="selectCalendarDate('${cell.toISOString()}')"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px"><span style="font-weight:700">${cell.getDate()}</span>${dayOrders.length?`<small class="chip" style="padding:4px 8px">${dayOrders.length}件</small>`:""}</div><div>${dayOrders.slice(0,3).map(o=>`<div class="detail-item ${statusClass(o.status)}" style="padding:6px 8px;font-size:11px;margin-bottom:6px"><div style="font-weight:700">${esc(o.projectName)}</div><div>${esc(o.assignee)}</div></div>`).join("")}</div></button>`; }).join("")}</div></div>
  <div class="card"><div style="font-weight:700;margin-bottom:14px">日付クリック詳細</div>${!state.selectedCalendarDate?`<div class="help">カレンダーの日付をクリックすると、その日の案件が表示されます。</div>`: selectedOrders.length===0?`<div class="help">${new Date(state.selectedCalendarDate).toLocaleDateString('ja-JP')} の案件はありません。</div>`: selectedOrders.map(o=>`<div class="detail-item"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><div style="font-weight:700">${esc(o.projectName)}</div><div class="help" style="margin-top:6px">顧客: ${esc(o.client)} / 担当: ${esc(o.assignee)}</div></div><button class="btn primary" onclick="openCalendarQuickEdit(${o.id})">この案件を編集</button></div><div class="badges" style="margin-top:10px">${(() => { const a = getDeadlineAlert(o); return `<span class="alert-chip ${a.cls}">${a.label}</span>`; })()}<span class="badge ${statusClass(o.status)}">${esc(o.status)}</span><span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span></div></div>`).join("")}</div></div>${renderCalendarQuickEditModal()}`;
}
function changeMonth(delta){ let {year, month} = state.calendarMonth; month += delta; if(month<0){month=11;year-=1} if(month>11){month=0;year+=1} state.calendarMonth={year,month}; render(); }
function selectCalendarDate(iso){ state.selectedCalendarDate = iso; render(); }
function renderCalendarQuickEditModal(){
  if(!state.calendarQuickEditId) return "";
  const order = state.orders.find(o=>o.id===state.calendarQuickEditId); if(!order) return "";
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeCalendarQuickEdit()"><div class="modal" style="width:min(820px,100%)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px"><div><h3 style="margin:0 0 6px">日程から案件編集</h3><div class="help">担当者・完了予定日・ステータスをその場で変更できます</div></div><button class="btn" onclick="closeCalendarQuickEdit()">閉じる</button></div>
  <div class="grid-2">
    <div><div class="help" style="margin-bottom:6px">案件名</div><input value="${esc(order.projectName)}" readonly></div>
    <div><div class="help" style="margin-bottom:6px">顧客名</div><input value="${esc(order.client)}" readonly></div>
    <div><div class="help" style="margin-bottom:6px">担当者</div><select onchange="patchCalendar('assignee', this.value)">${staffOptions.map(n=>`<option ${order.assignee===n?'selected':''}>${n}</option>`).join("")}</select></div>
    <div><div class="help" style="margin-bottom:6px">完了予定日</div><input type="date" value="${esc(order.finishDate||"")}" oninput="patchCalendar('finishDate', this.value)"></div>
    <div style="grid-column:1/-1"><div class="help" style="margin-bottom:6px">ステータス</div><select class="${statusClass(order.status)}" onchange="patchCalendar('status', this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${order.status===s?'selected':''}>${s}</option>`).join("")}</select></div>
  </div>
  <div class="notice-box" style="margin-top:16px">${esc(buildNotice(order))}</div>
  <div class="top-actions" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeCalendarQuickEdit()">キャンセル</button><button class="btn primary" onclick="saveCalendar()">保存する</button></div></div></div>`;
}
function patchCalendar(key,val){ state.orders = state.orders.map(o=>o.id===state.calendarQuickEditId?{...o,[key]:val,judge:key==="status"?statusToJudge(val):o.judge}:o); render(); }
function saveCalendar(){
  state.orders = state.orders.map(o=>o.id===state.calendarQuickEditId?{...o,notice:buildNotice(o),history:[...(o.history||[]),"カレンダーから案件を更新しました"]}:o);
  const target = state.orders.find(o=>o.id===state.calendarQuickEditId);
  if(target) logNotification("案件更新", target.projectName, "カレンダーから案件情報を更新しました。");
  closeCalendarQuickEdit();
}

function renderOutsource(){
  const outs = state.orders.filter(o => o.judge === "外注推奨" || o.status === "納期NG" || o.outsourceStatus);
  const receivedCount = state.orders.filter(o => o.status === "納品受信").length;
  const total = outs.reduce((s,o)=>s+Number(o.amount||0),0);
  const requestedCount = outs.filter(o => (o.outsourceStatus || "依頼前") !== "依頼前").length;
  return `<div class="page-head"><div><div class="page-title">外注管理</div><div class="page-sub">外注候補案件の確認と受信管理</div></div></div>
  <div class="stat-grid-4">${statCard("外注候補件数", outs.length, "")}${statCard("外注候補合計金額", formatYen(total), "")}${statCard("受信済み件数", receivedCount, "")}${statCard("依頼済み件数", requestedCount, "")}</div>
  <div style="margin-top:16px">${outs.length===0?`<div class="card help">現在、外注候補案件はありません。</div>`: outs.map(o=>`<div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800">${esc(o.projectName)}</div><div class="help" style="margin-top:6px">顧客: ${esc(o.client)} / 担当: ${esc(o.assignee)}</div><div class="help" style="margin-top:6px">金額: ${formatYen(o.amount)} / 完了予定: ${esc(o.finishDate||"未設定")}</div><div class="help" style="margin-top:6px">外注先: ${esc(o.outsourceVendor||"未設定")} / 受信日: ${esc(o.receivedDate||"未設定")}</div></div><div class="badges"><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span><span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span><span class="badge ${outsourceStatusClass(o.outsourceStatus||"依頼前")}">${esc(o.outsourceStatus||"依頼前")}</span></div></div>${o.outsourceMemo?`<div class="detail-item" style="margin-top:12px">${esc(o.outsourceMemo)}</div>`:""}<div class="top-actions" style="margin-top:14px"><button class="btn">指示書を見る</button><button class="btn" onclick="openOutsourceEditor(${o.id})">外注情報を編集</button><button class="btn primary" onclick="markReceived(${o.id})">納品受信にする</button></div></div>`).join("")}</div>${renderOutsourceModal()}`;
}
function markReceived(id){
  state.orders = state.orders.map(o=>{
    if(o.id!==id) return o;
    const next = {...o,status:"納品受信",judge:"納品受信",outsourceStatus:"納品受信",receivedDate:new Date().toISOString().slice(0,10),history:[...(o.history||[]),"外注案件を納品受信に変更"]};
    logNotification("外注更新", o.projectName, "外注案件を納品受信に変更しました。");
    next.notice = buildNotice(next);
    return next;
  });
  render();
}
function renderOutsourceModal(){
  if(!state.outsourceEditorId) return "";
  const order = state.orders.find(o=>o.id===state.outsourceEditorId); if(!order) return "";
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeOutsourceEditor()"><div class="modal" style="width:min(820px,100%)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px"><div><h3 style="margin:0 0 6px">外注案件編集</h3><div class="help">外注先・依頼状況・受信日を管理できます</div></div><button class="btn" onclick="closeOutsourceEditor()">閉じる</button></div>
  <div class="grid-2">
    <div><div class="help" style="margin-bottom:6px">案件名</div><input value="${esc(order.projectName)}" readonly></div>
    <div><div class="help" style="margin-bottom:6px">顧客名</div><input value="${esc(order.client)}" readonly></div>
    <div><div class="help" style="margin-bottom:6px">外注先</div><input value="${esc(order.outsourceVendor||"")}" oninput="patchOutsource('outsourceVendor', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">依頼状況</div><select onchange="patchOutsource('outsourceStatus', this.value)">${["依頼前","依頼済み","制作中","確認中","納品受信"].map(s=>`<option ${(order.outsourceStatus||"依頼前")===s?'selected':''}>${s}</option>`).join("")}</select></div>
    <div><div class="help" style="margin-bottom:6px">受信日</div><input type="date" value="${esc(order.receivedDate||"")}" oninput="patchOutsource('receivedDate', this.value)"></div>
    <div><div class="help" style="margin-bottom:6px">完了予定日</div><input type="date" value="${esc(order.finishDate||"")}" oninput="patchOutsource('finishDate', this.value)"></div>
    <div style="grid-column:1/-1"><div class="help" style="margin-bottom:6px">外注メモ</div><textarea oninput="patchOutsource('outsourceMemo', this.value)">${esc(order.outsourceMemo||"")}</textarea></div>
  </div>
  <div class="top-actions" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeOutsourceEditor()">キャンセル</button><button class="btn primary" onclick="saveOutsource()">保存する</button></div></div></div>`;
}
function patchOutsource(key,val){ state.orders = state.orders.map(o=>o.id===state.outsourceEditorId?{...o,[key]:val}:o); render(); }
function saveOutsource(){
  state.orders = state.orders.map(o=>{
    if(o.id!==state.outsourceEditorId) return o;
    const next = {...o};
    if(next.outsourceStatus==="納品受信"){ next.status="納品受信"; next.judge="納品受信"; }
    next.notice = buildNotice(next);
    next.history = [...(next.history||[]),"外注情報を更新しました"];
    logNotification("外注更新", next.projectName, "外注情報を更新しました。");
    return next;
  });
  closeOutsourceEditor();
}

async function handlePdfUpload(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  state.pdfLoading = true; state.createForm.sourceFileName = file.name; render();
  try{
    if(!window.pdfjsLib) throw new Error("pdfjsLib not found");
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for(let p=1; p<=pdf.numPages; p++){
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      text += content.items.map(i=>i.str).join(" ") + "\n";
    }
    const fields = extractFieldsFromText(text);
    state.createForm.client = fields.client || state.createForm.client;
    state.createForm.projectName = fields.projectName || state.createForm.projectName;
    state.createForm.amount = fields.amount || state.createForm.amount;
    state.createForm.finishDate = fields.finishDate || state.createForm.finishDate;
  }catch(e){
    alert("PDFの読み込みに失敗しました。文字が入ったPDFか確認してください。");
  }finally{
    state.pdfLoading = false; render();
  }
}
function renderCreateModal(){
  if(!state.createOpen) return "";
  const f = state.createForm, e = state.createErrors;
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeCreate()"><div class="modal" style="width:min(860px,100%)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px"><div><h3 style="margin:0 0 6px">新規案件追加</h3><div class="help">顧客名と案件名を先に入れると進めやすいです。PDFを添付すると候補を自動入力します。</div></div><button class="btn" onclick="closeCreate()">閉じる</button></div>
  <div class="upload-box"><div style="font-weight:700;margin-bottom:6px">PDF発注書を読み込む</div><div class="help">PDFの中の文字から、顧客名・案件名・金額・完了予定日の候補を自動入力します。</div><div style="margin-top:10px"><input type="file" accept="application/pdf" onchange="handlePdfUpload(event)"></div>${state.pdfLoading?`<div class="help" style="margin-top:8px">PDFを読み込み中...</div>`:""}${f.sourceFileName?`<div class="file-pill">${esc(f.sourceFileName)}</div>`:""}</div>
  <div class="grid-2" style="margin-top:16px">
    <div><div class="help" style="margin-bottom:6px">顧客名 *</div><input value="${esc(f.client)}" oninput="patchCreate('client', this.value)">${e.client?`<div class="error">${esc(e.client)}</div>`:""}</div>
    <div><div class="help" style="margin-bottom:6px">案件名 *</div><input value="${esc(f.projectName)}" oninput="patchCreate('projectName', this.value)">${e.projectName?`<div class="error">${esc(e.projectName)}</div>`:""}</div>
    <div><div class="help" style="margin-bottom:6px">金額 *</div><input inputmode="numeric" value="${esc(f.amount)}" oninput="patchCreate('amount', this.value.replace(/[^0-9]/g,''))">${e.amount?`<div class="error">${esc(e.amount)}</div>`:""}</div>
    <div><div class="help" style="margin-bottom:6px">担当者</div><select onchange="patchCreate('assignee', this.value)">${staffOptions.map(n=>`<option ${f.assignee===n?'selected':''}>${n}</option>`).join("")}</select></div>
    <div><div class="help" style="margin-bottom:6px">完了予定日 *</div><input type="date" value="${esc(f.finishDate)}" oninput="patchCreate('finishDate', this.value)">${e.finishDate?`<div class="error">${esc(e.finishDate)}</div>`:""}</div>
    <div><div class="help" style="margin-bottom:6px">ステータス</div><select class="${statusClass(f.status)}" onchange="patchCreate('status', this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join("")}</select></div>
  </div>
  <div style="margin-top:16px"><div class="help" style="margin-bottom:6px">案件メモ</div><textarea oninput="patchCreate('notes', this.value)">${esc(f.notes || "")}</textarea></div>
  <div class="notice-box" style="margin-top:16px"><div style="font-weight:700;margin-bottom:8px">通知文面プレビュー</div>${esc(buildNotice({...f, amount:Number(f.amount||0)}))}</div>
  <div class="top-actions" style="justify-content:space-between;margin-top:16px"><div class="help">* は必須項目です</div><div class="top-actions"><button class="btn" onclick="closeCreate()">キャンセル</button><button class="btn primary" onclick="createOrder()">追加する</button></div></div></div></div>`;
}
function patchCreate(key,val){ state.createForm[key] = val; if(state.createErrors[key]) delete state.createErrors[key];  }
function validateCreate(){
  const e = {};
  const f = state.createForm;
  if(!f.client.trim()) e.client = "顧客名は必須です";
  if(!f.projectName.trim()) e.projectName = "案件名は必須です";
  if(!String(f.amount).trim() || Number(f.amount) <= 0) e.amount = "金額を正しく入力してください";
  if(!f.finishDate) e.finishDate = "完了予定日は必須です";
  state.createErrors = e;
  return Object.keys(e).length === 0;
}
function createOrder(){
  if(!validateCreate()){ render(); return; }
  const f = state.createForm;
  const next = { id: Date.now(), client:f.client, projectName:f.projectName, amount:Number(f.amount||0), assignee:f.assignee, finishDate:f.finishDate, status:f.status, judge:statusToJudge(f.status), notes:f.notes || "", history:["新規案件を追加しました"], outsourceStatus:"依頼前" };
  next.notice = buildNotice(next);
  state.orders = [next, ...state.orders];
  logNotification("案件登録", next.projectName, "新規案件が登録されました。");
  closeCreate();
}

function renderPage(){
  if(state.currentPage==="dashboard") return renderDashboard();
  if(state.currentPage==="orders") return renderOrders();
  if(state.currentPage==="notifications") return renderNotifications();
  if(state.currentPage==="customers") return renderCustomers();
  if(state.currentPage==="staff") return renderStaff();
  if(state.currentPage==="templates") return renderTemplates();
  if(state.currentPage==="calendar") return renderCalendar();
  return renderOutsource();
}
function render(){
  document.getElementById("app").innerHTML = `<div class="layout">${SideNav({ currentPage: state.currentPage, setCurrentPage: setPage })}<main class="main">${renderPage()}</main>${renderCreateModal()}</div>`;
}
render();
