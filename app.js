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
const initialOrders = [
  { id: 1, projectName: "バナー制作", client: "A社", status: "納期OK", judge: "社内対応", amount: 50000, assignee: "田中", finishDate: "2026-03-25", history: [], notice: "" },
  { id: 2, projectName: "LPデザイン", client: "B社", status: "納期NG", judge: "外注推奨", amount: 120000, assignee: "佐藤", finishDate: "2026-03-28", history: [], notice: "" },
  { id: 3, projectName: "SNSキャンペーン画像", client: "チャッピー株式会社", status: "納品受信", judge: "納品受信", amount: 330000, assignee: "高橋", finishDate: "2026-03-20", history: ["外注先より納品完了"], notice: "" },
].map(o => ({ ...o, notice: buildNotice(o) }));

let state = {
  currentPage: "dashboard",
  orders: load("orders", initialOrders),
  staff: load("staff", initialStaff),
  templates: load("templates", initialTemplates),
  query: "",
  selectedOrderId: null,
  createOpen: false,
  createErrors: {},
  pdfLoading: false,
  createForm: {
    client: "",
    projectName: "",
    amount: "80000",
    assignee: staffOptions[0],
    finishDate: "2026-03-31",
    status: "納期OK",
    sourceFileName: "",
    extractedText: "",
  },
  calendarMonth: { year: 2026, month: 2 },
  selectedCalendarDate: null,
};

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";
}

function load(key, fallback){ try{ const raw = localStorage.getItem("cm-public-v21-" + key); return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; } }
function persist(){ localStorage.setItem("cm-public-v21-orders", JSON.stringify(state.orders)); localStorage.setItem("cm-public-v21-staff", JSON.stringify(state.staff)); localStorage.setItem("cm-public-v21-templates", JSON.stringify(state.templates)); }
function buildNotice(order){ return `案件: ${order.projectName}\n顧客: ${order.client}\n担当: ${order.assignee}\n金額: ${Number(order.amount || 0).toLocaleString("ja-JP")}\n完了予定: ${order.finishDate || "未設定"}\nステータス: ${order.status}`; }
function statusToJudge(status){ if(status === "納期NG") return "外注推奨"; if(status === "納品受信") return "納品受信"; return "社内対応"; }
function statusClass(status){ if(status === "納期OK") return "ok"; if(status === "納期NG") return "ng"; return "received"; }
function judgeClass(judge){ if(judge === "社内対応") return "internal"; if(judge === "外注推奨") return "outsource"; return "received"; }
function categoryClass(category){ if(category === "ロゴデザイン") return "category logo"; if(category === "ウェブデザイン") return "category web"; if(category === "パッケージ") return "category package"; return "category ad"; }
function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatYen(n){ return "¥" + Number(n || 0).toLocaleString("ja-JP"); }
function setPage(page){ state.currentPage = page; render(); }
function openOrder(id){ state.selectedOrderId = id; render(); }
function closeOrder(){ state.selectedOrderId = null; render(); }
function openCreate(){ state.createOpen = true; render(); }
function closeCreate(){ state.createOpen = false; state.createErrors = {}; render(); }

function renderNav(){
  const items = [["dashboard","ダッシュボード"],["orders","受注管理"],["staff","スタッフ管理"],["templates","テンプレート管理"],["calendar","日程カレンダー"],["outsource","外注管理"]];
  return `<aside class="sidebar"><div class="brand">デザインマネージャー</div><div class="brand-sub">クリエイティブ管理</div><div class="nav">${items.map(([k,l])=>`<button class="${state.currentPage===k?'active':''}" onclick="setPage('${k}')">${l}</button>`).join("")}</div><div class="version">デザインマネージャー 公開版 v2.2</div></aside>`;
}
function statCard(title,val,sub){ return `<div class="card"><div class="stat-label">${title}</div><div class="stat-value">${esc(val)}</div><div class="stat-sub">${sub}</div></div>`; }
function renderDashboard(){
  const totalAmount = state.orders.reduce((s,o)=>s+Number(o.amount||0),0);
  const active = state.orders.filter(o=>o.status!=="納品受信").length;
  const ng = state.orders.filter(o=>o.status==="納期NG").length;
  const received = state.orders.filter(o=>o.status==="納品受信").length;
  const recent = state.orders.slice().sort((a,b)=>String(b.finishDate).localeCompare(String(a.finishDate))).slice(0,5);
  return `<div class="page-head"><div><div class="page-title">ダッシュボード</div><div class="page-sub">案件の概要と進捗状況</div></div><div class="card" style="padding:14px 18px;font-weight:700;color:#6d3df5;">チャッピー株式会社</div></div>
    <div class="stat-grid">${statCard("すべてのプロジェクト", state.orders.length, "登録済み")}${statCard("進行中", active, "アクティブ")}${statCard("納期NG", ng, "要対応")}${statCard("納品受信", received, "完了扱い")}${statCard("受注総額", formatYen(totalAmount), "累計")}</div>
    <div class="grid-2" style="margin-top:16px"><div class="card"><div style="font-weight:700;margin-bottom:14px">最近の受注</div>${recent.map(o=>`<div class="recent-item"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><div style="font-weight:700">${esc(o.client)} / ${esc(o.projectName)}</div><div class="muted" style="margin-top:6px">担当: ${esc(o.assignee)} ・ 納期: ${esc(o.finishDate || "未設定")}</div></div><div class="badges"><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span><span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span></div></div></div>`).join("")}</div>
    <div class="card"><div style="font-weight:700;margin-bottom:14px">運用設定</div><div class="setting-item">会社名: チャッピー株式会社</div><div class="setting-item">通知文面の自動生成: ON</div><div class="setting-item">外注自動判定: ON</div><div class="setting-item">LINE通知文生成: ON</div><div class="setting-item">スタッフ数: ${state.staff.length}人</div></div></div>`;
}
function renderOrders(){
  const q = state.query.toLowerCase();
  const filtered = state.orders.filter(o => [o.id,o.projectName,o.client,o.assignee,o.status].join(" ").toLowerCase().includes(q));
  const totalAmount = filtered.reduce((s,o)=>s+Number(o.amount||0),0);
  return `<div class="page-head"><div><div class="page-title">受注管理 V3.1</div><div class="page-sub">一覧ステータス変更・詳細編集・通知文面更新・履歴管理</div></div><div class="top-actions"><div class="card" style="padding:14px 18px">表示案件合計: <strong>${formatYen(totalAmount)}</strong></div><button class="btn primary" onclick="openCreate()">新規案件追加</button></div></div>
    <div class="card"><div class="search-row"><input placeholder="案件名・顧客・担当者・ステータスで検索" value="${esc(state.query)}" oninput="state.query=this.value;render()"></div></div>
    <div class="table"><div class="table-head"><div>ID</div><div>案件</div><div>顧客</div><div>金額</div><div>担当</div><div>完了予定</div><div>ステータス</div><div>操作</div></div>
      ${filtered.length===0?`<div style="padding:50px;text-align:center;color:#94a3b8">一致する案件がありません</div>`:filtered.map(o=>`<div class="table-row"><div><strong>${o.id}</strong></div><div><strong>${esc(o.projectName)}</strong></div><div>${esc(o.client)}</div><div>${formatYen(o.amount)}</div><div>${esc(o.assignee)}</div><div>${esc(o.finishDate || "未設定")}</div><div><select class="${statusClass(o.status)}" onchange="updateStatus(${o.id}, this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join("")}</select></div><div><button class="btn" onclick="openOrder(${o.id})">開く</button></div></div>`).join("")}
    </div>`;
}
function renderStaff(){
  return `<div class="page-head"><div><div class="page-title">スタッフ管理</div><div class="page-sub">担当者の役割と稼働状況</div></div></div>
    <div class="staff-grid">${state.staff.map(member=>{ const load = state.orders.filter(o=>o.assignee===member.name && o.status!=="納品受信").reduce((sum,o)=>sum+Math.max(Math.round(Number(o.amount||0)/10000),4),0); const percent = Math.min(Math.round(load/40*100),100); return `<div class="card"><div style="display:flex;justify-content:space-between;gap:12px"><div><div style="font-size:18px;font-weight:800">${esc(member.name)}</div><div class="muted" style="margin-top:4px">${esc(member.role)}</div></div><div class="badge ok">稼働中</div></div><div class="muted" style="margin-top:14px">${esc(member.email)}</div><div style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:8px"><span>想定稼働</span><span>${load}時間</span></div><div class="progress"><div style="width:${percent}%"></div></div></div><div class="chips">${member.skills.map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div></div>`; }).join("")}</div>`;
}
function renderTemplates(){
  return `<div class="page-head"><div><div class="page-title">テンプレート管理</div><div class="page-sub">制作テンプレートの一覧と標準工数</div></div></div>
    <div class="template-grid">${state.templates.map(t=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div style="font-size:18px;font-weight:800">${esc(t.title)}</div><div class="${categoryClass(t.category)} badge" style="margin-top:8px">${esc(t.category)}</div></div><div style="text-align:right" class="muted"><div>${formatYen(t.price)}</div><div style="margin-top:4px">${t.hours}時間</div></div></div><div style="margin-top:14px">${t.tasks.map(task=>`<div class="task-item">${esc(task)}</div>`).join("")}</div></div>`).join("")}</div>`;
}
function sameDay(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function buildMonthCells(year, month){ const start = new Date(year, month, 1), end = new Date(year, month+1, 0), cells = []; for(let i=0;i<start.getDay();i++) cells.push(null); for(let d=1; d<=end.getDate(); d++) cells.push(new Date(year, month, d)); while(cells.length % 7 !== 0) cells.push(null); return cells; }
function renderCalendar(){
  const {year, month} = state.calendarMonth;
  const cells = buildMonthCells(year, month);
  const weekdays = ["日","月","火","水","木","金","土"];
  const today = new Date();
  const ordersForDate = (date) => state.orders.filter(order => { const d = new Date(order.finishDate); return !Number.isNaN(d.getTime()) && sameDay(d, date); });
  const selectedOrders = state.selectedCalendarDate ? ordersForDate(new Date(state.selectedCalendarDate)) : [];
  return `<div class="page-head"><div><div class="page-title">日程カレンダー</div><div class="page-sub">完了予定日ベースの月間表示</div></div></div>
    <div class="calendar-wrap"><div class="card"><div class="calendar-header"><button class="btn" onclick="changeMonth(-1)">前月</button><div style="font-size:20px;font-weight:800">${year}年 ${month+1}月</div><button class="btn" onclick="changeMonth(1)">次月</button></div><div class="calendar-grid">${weekdays.map(d=>`<div class="weekday">${d}</div>`).join("")}${cells.map((cell, idx)=>{ if(!cell) return `<div class="day empty"></div>`; const dayOrders = ordersForDate(cell); return `<button class="day ${sameDay(cell,today)?'today':''}" onclick="selectCalendarDate('${cell.toISOString()}')"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px"><span style="font-weight:700">${cell.getDate()}</span>${dayOrders.length?`<small class="chip" style="padding:4px 8px">${dayOrders.length}件</small>`:""}</div><div>${dayOrders.slice(0,3).map(o=>`<div class="detail-item ${statusClass(o.status)}" style="padding:6px 8px;font-size:11px;margin-bottom:6px"><div style="font-weight:700">${esc(o.projectName)}</div><div>${esc(o.assignee)}</div></div>`).join("")}</div></button>`; }).join("")}</div></div>
      <div class="card"><div style="font-weight:700;margin-bottom:14px">日付クリック詳細</div>${!state.selectedCalendarDate?`<div class="muted">カレンダーの日付をクリックすると、その日の案件が表示されます。</div>`: selectedOrders.length===0?`<div class="muted">${new Date(state.selectedCalendarDate).toLocaleDateString('ja-JP')} の案件はありません。</div>`: selectedOrders.map(o=>`<div class="detail-item"><div style="font-weight:700">${esc(o.projectName)}</div><div class="muted" style="margin-top:6px">顧客: ${esc(o.client)} / 担当: ${esc(o.assignee)}</div><div class="badges" style="margin-top:10px"><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span><span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span></div></div>`).join("")}</div></div>`;
}
function renderOutsource(){
  const outs = state.orders.filter(o => o.judge === "外注推奨" || o.status === "納期NG");
  const receivedCount = state.orders.filter(o => o.status === "納品受信").length;
  const total = outs.reduce((s,o)=>s+Number(o.amount||0),0);
  return `<div class="page-head"><div><div class="page-title">外注管理</div><div class="page-sub">外注候補案件の確認と受信管理</div></div></div><div class="stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${statCard("外注候補件数", outs.length, "")}${statCard("外注候補合計金額", formatYen(total), "")}${statCard("受信済み件数", receivedCount, "")}</div><div style="margin-top:16px">${outs.length===0?`<div class="card muted">現在、外注候補案件はありません。</div>`: outs.map(o=>`<div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap"><div><div style="font-size:18px;font-weight:800">${esc(o.projectName)}</div><div class="muted" style="margin-top:6px">顧客: ${esc(o.client)} / 担当: ${esc(o.assignee)}</div><div class="muted" style="margin-top:6px">金額: ${formatYen(o.amount)} / 完了予定: ${esc(o.finishDate||"未設定")}</div></div><div class="badges"><span class="badge ${statusClass(o.status)}">${esc(o.status)}</span><span class="badge ${judgeClass(o.judge)}">${esc(o.judge)}</span></div></div><div class="top-actions" style="margin-top:14px"><button class="btn">指示書を見る</button><button class="btn primary" onclick="markReceived(${o.id})">納品受信にする</button></div></div>`).join("")}</div>`;
}

function renderOrderModal(){
  const order = state.orders.find(o => o.id === state.selectedOrderId);
  if(!order) return "";
  const historyHtml = order.history.length ? order.history.map(h=>`<div class="history-item">${esc(h)}</div>`).join("") : `<div class="muted">履歴なし</div>`;
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeOrder()"><div class="modal"><div class="modal-grid"><div><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px"><div><h3>案件編集</h3><p class="sub">案件情報を編集して保存できます</p></div><div class="muted">ID: ${order.id}</div></div>
    <input value="${esc(order.projectName)}" oninput="patchSelected('projectName', this.value)"><div style="height:8px"></div>
    <input value="${esc(order.client)}" oninput="patchSelected('client', this.value)"><div style="height:8px"></div>
    <input value="${esc(order.amount)}" oninput="patchSelected('amount', this.value.replace(/[^0-9]/g,''))"><div style="height:8px"></div>
    <select onchange="patchSelected('assignee', this.value)">${staffOptions.map(n=>`<option ${order.assignee===n?'selected':''}>${n}</option>`).join("")}</select><div style="height:8px"></div>
    <input type="date" value="${esc(order.finishDate||"")}" oninput="patchSelected('finishDate', this.value)"><div style="height:8px"></div>
    <select class="${statusClass(order.status)}" onchange="patchSelected('status', this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${order.status===s?'selected':''}>${s}</option>`).join("")}</select>
    <div class="top-actions" style="margin-top:16px"><button class="btn primary" onclick="saveSelected()">保存する</button><button class="btn" onclick="duplicateSelected()">複製する</button><button class="btn danger" onclick="deleteSelected()">削除する</button><button class="btn" onclick="closeOrder()">閉じる</button></div></div>
    <div><div style="font-weight:700;margin-bottom:10px">通知文面プレビュー</div><div class="notice-box">${esc(buildNotice(order))}</div><div style="font-weight:700;margin:16px 0 10px">現在の判定</div><div class="badge ${judgeClass(statusToJudge(order.status))}">${statusToJudge(order.status)}</div></div>
    <div><div style="font-weight:700;margin-bottom:10px">変更履歴</div><div class="history-box">${historyHtml}</div></div></div></div></div>`;
}
function renderCreateModal(){
  if(!state.createOpen) return "";
  const f = state.createForm;
  const e = state.createErrors || {};
  return `<div class="modal-backdrop" onclick="if(event.target===this) closeCreate()"><div class="modal" style="width:min(820px,100%)">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px"><div><h3>新規案件追加</h3><p class="sub">顧客名と案件名を先に入れると進めやすいです。PDFを添付すると候補を自動入力します。</p></div><button class="btn" onclick="closeCreate()">閉じる</button></div>
    <div class="upload-box">
      <div style="font-weight:700;margin-bottom:6px">PDF発注書を読み込む</div>
      <div class="help">PDFの中の文字から、顧客名・案件名・金額・完了予定日の候補を自動入力します。</div>
      <div style="margin-top:10px"><input type="file" accept="application/pdf" onchange="handlePdfUpload(event)"></div>
      ${state.pdfLoading ? `<div class="help" style="margin-top:8px">PDFを読み込み中...</div>` : ""}
      ${f.sourceFileName ? `<div class="file-pill">${esc(f.sourceFileName)}</div>` : ""}
    </div>
    <div class="form-grid" style="margin-top:16px">
      <div><div class="help" style="margin-bottom:6px">顧客名 *</div><input autofocus placeholder="例：テスト株式会社" value="${esc(f.client)}" oninput="patchCreate('client', this.value)">${e.client?`<div class="error">${esc(e.client)}</div>`:""}</div>
      <div><div class="help" style="margin-bottom:6px">案件名 *</div><input placeholder="例：Instagramバナー" value="${esc(f.projectName)}" oninput="patchCreate('projectName', this.value)">${e.projectName?`<div class="error">${esc(e.projectName)}</div>`:""}</div>
      <div><div class="help" style="margin-bottom:6px">金額 *</div><input inputmode="numeric" placeholder="例：90000" value="${esc(f.amount)}" oninput="patchCreate('amount', this.value.replace(/[^0-9]/g,''))">${e.amount?`<div class="error">${esc(e.amount)}</div>`:""}</div>
      <div><div class="help" style="margin-bottom:6px">担当者</div><select onchange="patchCreate('assignee', this.value)">${staffOptions.map(n=>`<option ${f.assignee===n?'selected':''}>${n}</option>`).join("")}</select></div>
      <div><div class="help" style="margin-bottom:6px">完了予定日 *</div><input type="date" value="${esc(f.finishDate)}" oninput="patchCreate('finishDate', this.value)">${e.finishDate?`<div class="error">${esc(e.finishDate)}</div>`:""}</div>
      <div><div class="help" style="margin-bottom:6px">ステータス</div><select class="${statusClass(f.status)}" onchange="patchCreate('status', this.value)">${["納期OK","納期NG","納品受信"].map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join("")}</select></div>
    </div>
    <div class="notice-box" style="margin-top:16px"><div style="font-weight:700;margin-bottom:8px">通知文面プレビュー</div>${esc(buildNotice({...f, amount:Number(f.amount||0)}))}</div>
    <div class="top-actions" style="justify-content:space-between;margin-top:16px"><div class="help">* は必須項目です</div><div class="top-actions"><button class="btn" onclick="closeCreate()">キャンセル</button><button class="btn primary" onclick="createOrder()">追加する</button></div></div>
  </div></div>`;
}

function patchSelected(key,val){ state.orders = state.orders.map(o => o.id===state.selectedOrderId ? {...o,[key]:val} : o); render(); }
function saveSelected(){ const order = state.orders.find(o=>o.id===state.selectedOrderId); if(!order) return; order.judge = statusToJudge(order.status); order.notice = buildNotice(order); order.history = [...order.history, "案件情報を保存しました"]; persist(); render(); }
function duplicateSelected(){ const order = state.orders.find(o=>o.id===state.selectedOrderId); if(!order) return; state.orders = [{...order,id:Date.now(),history:[...(order.history||[]),"案件を複製しました"]}, ...state.orders]; persist(); render(); }
function deleteSelected(){ state.orders = state.orders.filter(o=>o.id!==state.selectedOrderId); state.selectedOrderId = null; persist(); render(); }
function updateStatus(id,status){ state.orders = state.orders.map(o=>{ if(o.id!==id) return o; const updated = {...o,status,judge:statusToJudge(status)}; return {...updated,notice:buildNotice(updated),history:[...(o.history||[]),`ステータス変更: ${status}`]}; }); persist(); render(); }
function patchCreate(key,val){ state.createForm[key]=val; if(state.createErrors[key]) delete state.createErrors[key]; render(); }
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
  const next = { id: Date.now(), client: f.client, projectName: f.projectName, amount: Number(f.amount||0), assignee: f.assignee, finishDate: f.finishDate, status: f.status, judge: statusToJudge(f.status), history: ["新規案件を追加しました"] };
  next.notice = buildNotice(next);
  state.orders = [next, ...state.orders];
  state.createForm = { client:"", projectName:"", amount:"80000", assignee:staffOptions[0], finishDate:"2026-03-31", status:"納期OK", sourceFileName:"", extractedText:"" };
  state.createErrors = {};
  state.createOpen = false;
  state.currentPage = "orders";
  persist(); render();
}
function changeMonth(delta){ let {year, month} = state.calendarMonth; month += delta; if(month < 0){ month = 11; year -= 1; } if(month > 11){ month = 0; year += 1; } state.calendarMonth = {year, month}; render(); }
function selectCalendarDate(iso){ state.selectedCalendarDate = iso; render(); }
function markReceived(id){ state.orders = state.orders.map(o=>{ if(o.id!==id) return o; const next = {...o,status:"納品受信",judge:"納品受信",history:[...(o.history||[]),"外注案件を納品受信に変更"]}; next.notice = buildNotice(next); return next; }); persist(); render(); }
function renderPage(){ if(state.currentPage === "dashboard") return renderDashboard(); if(state.currentPage === "orders") return renderOrders(); if(state.currentPage === "staff") return renderStaff(); if(state.currentPage === "templates") return renderTemplates(); if(state.currentPage === "calendar") return renderCalendar(); return renderOutsource(); }

function extractFieldsFromText(text){
  const cleaned = text.replace(/\s+/g, " ").trim();
  let client = "";
  let projectName = "";
  let amount = "";
  let finishDate = "";

  const clientPatterns = [
    /(?:顧客名|クライアント名|発注者|御社名|会社名)\s*[:：]?\s*([^\n\r]{2,40})/i,
    /([^\s]{2,30}株式会社)/,
    /([^\s]{2,30}有限会社)/,
  ];
  const projectPatterns = [
    /(?:案件名|件名|プロジェクト名|制作物|タイトル)\s*[:：]?\s*([^\n\r]{2,60})/i,
    /(?:依頼内容|内容)\s*[:：]?\s*([^\n\r]{2,60})/i,
  ];
  const amountPatterns = [
    /(?:金額|予算|見積|見積額|請求額)\s*[:：]?\s*¥?\s*([0-9,]{3,})/i,
    /¥\s*([0-9,]{3,})/,
  ];
  const datePatterns = [
    /(?:納期|完了予定日|納品日|希望納期)\s*[:：]?\s*(20[0-9]{2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/i,
    /(20[0-9]{2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/,
  ];

  for (const p of clientPatterns) { const m = cleaned.match(p); if (m && m[1]) { client = m[1].trim(); break; } }
  for (const p of projectPatterns) { const m = cleaned.match(p); if (m && m[1]) { projectName = m[1].trim(); break; } }
  for (const p of amountPatterns) { const m = cleaned.match(p); if (m && m[1]) { amount = m[1].replace(/,/g, ""); break; } }
  for (const p of datePatterns) { const m = cleaned.match(p); if (m && m[1]) { finishDate = m[1].replace(/\./g, "-").replace(/\//g, "-"); break; } }

  return { client, projectName, amount, finishDate, extractedText: cleaned.slice(0, 1200) };
}

async function handlePdfUpload(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  state.pdfLoading = true;
  state.createForm.sourceFileName = file.name;
  render();
  try{
    if(!window.pdfjsLib) throw new Error("PDFライブラリの読み込みに失敗しました");
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for(let pageNum=1; pageNum<=pdf.numPages; pageNum++){
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    const fields = extractFieldsFromText(text);
    state.createForm = {
      ...state.createForm,
      client: fields.client || state.createForm.client,
      projectName: fields.projectName || state.createForm.projectName,
      amount: fields.amount || state.createForm.amount,
      finishDate: fields.finishDate || state.createForm.finishDate,
      extractedText: fields.extractedText || "",
      sourceFileName: file.name,
    };
    state.createErrors = {};
  }catch(err){
    alert("PDFの読み込みに失敗しました。文字が入ったPDFか確認してください。");
    console.error(err);
  }finally{
    state.pdfLoading = false;
    render();
  }
}

function render(){
  document.getElementById("app").innerHTML = `<div class="layout">${renderNav()}<main class="main">${renderPage()}</main>${renderOrderModal()}${renderCreateModal()}</div>`;
}
render();
