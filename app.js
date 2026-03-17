const state = {
  currentPage: 'dashboard',
  orders: [
    {
      id: 1,
      projectName: 'バナー制作',
      client: 'A社',
      status: '納期OK',
      judge: '社内対応',
      amount: 50000,
      assignee: '田中',
      finishDate: '2026-03-25',
      history: [],
      notice: ''
    },
    {
      id: 2,
      projectName: 'LPデザイン',
      client: 'B社',
      status: '納期NG',
      judge: '外注推奨',
      amount: 120000,
      assignee: '佐藤',
      finishDate: '2026-03-28',
      history: [],
      notice: ''
    },
    {
      id: 3,
      projectName: 'SNSキャンペーン画像',
      client: 'チャッピー株式会社',
      status: '納品受信',
      judge: '納品受信',
      amount: 330000,
      assignee: '高橋',
      finishDate: '2026-03-20',
      history: ['外注先より納品完了'],
      notice: ''
    }
  ],
  staff: [
    { id: 1, name: '田中', role: 'ディレクター', email: 'tanaka@design.co.jp', hoursPerDay: 8, skills: ['進行管理','クライアント対応'] },
    { id: 2, name: '佐藤', role: 'デザイナー', email: 'sato@design.co.jp', hoursPerDay: 8, skills: ['LP','バナー','UI'] },
    { id: 3, name: '鈴木', role: 'イラストレーター', email: 'suzuki@design.co.jp', hoursPerDay: 8, skills: ['イラスト','パッケージ'] },
    { id: 4, name: '高橋', role: 'フロントエンド', email: 'takahashi@design.co.jp', hoursPerDay: 8, skills: ['コーディング','レスポンシブ'] },
    { id: 5, name: '上部', role: 'アシスタント', email: 'uwabe@design.co.jp', hoursPerDay: 8, skills: ['進行補助','入稿'] }
  ],
  templates: [
    { id: 1, title: 'ロゴデザイン基本', category: 'ロゴデザイン', price: 150000, hours: 24, tasks: ['ヒアリング','ラフ作成','デザイン制作','修正対応','納品'] },
    { id: 2, title: 'ウェブサイトデザイン', category: 'ウェブデザイン', price: 500000, hours: 60, tasks: ['構成整理','ワイヤー','トップ制作','下層制作','レスポンシブ対応'] },
    { id: 3, title: 'パッケージデザイン', category: 'パッケージ', price: 300000, hours: 40, tasks: ['コンセプト設計','デザイン作成','展開案','入稿データ','確認'] },
    { id: 4, title: '広告バナー制作', category: '広告デザイン', price: 80000, hours: 12, tasks: ['構成確認','制作','リサイズ','最終確認'] }
  ],
  orderQuery: '',
  selectedOrderId: null,
  calendarMonth: new Date(2026, 2, 1),
  calendarSelected: null,
};

function buildNotice(order) {
  return `案件: ${order.projectName}\n顧客: ${order.client}\n担当: ${order.assignee}\n金額: ${order.amount}\n完了予定: ${order.finishDate || '未設定'}\nステータス: ${order.status}`;
}
function statusToJudge(status) {
  if (status === '納期NG') return '外注推奨';
  if (status === '納品受信') return '納品受信';
  return '社内対応';
}
function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function monthCells(currentMonth){
  const start=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),1);
  const end=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,0);
  const out=[]; const first=start.getDay();
  for(let i=0;i<first;i++) out.push(null);
  for(let d=1;d<=end.getDate();d++) out.push(new Date(currentMonth.getFullYear(),currentMonth.getMonth(),d));
  while(out.length%7!==0) out.push(null);
  return out;
}
function badgeClass(status){return status==='納期OK'?'ok':status==='納期NG'?'ng':'recv'}
function judgeClass(judge){return judge==='社内対応'?'in':judge==='外注推奨'?'out':'recv'}
function templateClass(category){return category==='ロゴデザイン'?'out':category==='ウェブデザイン'?'in':category==='パッケージ'?'ok':'recv'}
function money(n){return `¥${Number(n||0).toLocaleString('ja-JP')}`}
function busyHours(name){return state.orders.filter(o=>o.assignee===name&&o.status!=='納品受信').reduce((sum,o)=>sum+Math.max(Math.round(Number(o.amount||0)/10000),4),0)}
function getSelectedOrder(){return state.orders.find(o=>o.id===state.selectedOrderId) || null}

state.orders = state.orders.map(o=>({...o, notice: buildNotice(o)}));

function render(){
  const app=document.getElementById('app');
  const selected=getSelectedOrder();
  app.innerHTML=`
  <div class="app">
    <aside class="sidebar">
      <div class="brand"><h1>デザインマネージャー</h1><p>クリエイティブ管理</p></div>
      <div class="nav">
        ${navButton('dashboard','ダッシュボード')}
        ${navButton('orders','受注管理')}
        ${navButton('staff','スタッフ管理')}
        ${navButton('templates','テンプレート管理')}
        ${navButton('calendar','日程カレンダー')}
        ${navButton('outsource','外注管理')}
      </div>
      <div class="version">デザインマネージャー 公開版 v2.0</div>
    </aside>
    <main class="main">${pageContent()}</main>
    ${selected ? modalContent(selected) : ''}
  </div>`;

  bindEvents();
}
function navButton(key,label){return `<button class="${state.currentPage===key?'active':''}" data-nav="${key}">${label}</button>`}
function pageContent(){
  switch(state.currentPage){
    case 'dashboard': return dashboardPage();
    case 'orders': return ordersPage();
    case 'staff': return staffPage();
    case 'templates': return templatesPage();
    case 'calendar': return calendarPage();
    case 'outsource': return outsourcePage();
    default: return '';
  }
}
function dashboardPage(){
  const total=state.orders.reduce((s,o)=>s+Number(o.amount||0),0);
  const active=state.orders.filter(o=>o.status!=='納品受信').length;
  const ng=state.orders.filter(o=>o.status==='納期NG').length;
  const recv=state.orders.filter(o=>o.status==='納品受信').length;
  return `
  <div class="header-row">
    <div><h1 class="page-title">ダッシュボード</h1><p class="page-sub">案件の概要と進捗状況</p></div>
    <div class="top-pill">チャッピー株式会社</div>
  </div>
  <div class="stats">
    ${stat('すべてのプロジェクト',state.orders.length,'登録済み')}
    ${stat('進行中',active,'アクティブ')}
    ${stat('納期NG',ng,'要対応')}
    ${stat('納品受信',recv,'完了扱い')}
    ${stat('受注総額',money(total),'累計')}
  </div>
  <div class="two-col" style="margin-top:18px">
    <div class="card pad">
      <div class="card-title">最近の受注</div>
      <div class="list" style="margin-top:16px">
        ${state.orders.slice(0,5).map(order=>`
          <div class="list-item">
            <div>
              <div class="list-item-title">${escapeHtml(order.client)} / ${escapeHtml(order.projectName)}</div>
              <div class="list-item-sub">担当: ${escapeHtml(order.assignee)} ・ 納期: ${escapeHtml(order.finishDate || '未設定')}</div>
            </div>
            <div class="badges">
              <span class="badge ${badgeClass(order.status)}">${escapeHtml(order.status)}</span>
              <span class="badge ${judgeClass(order.judge)}">${escapeHtml(order.judge)}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="card pad">
      <div class="card-title">運用設定</div>
      <div class="list" style="margin-top:16px">
        <div class="list-item"><div>会社名: チャッピー株式会社</div></div>
        <div class="list-item"><div>通知文面の自動生成: ON</div></div>
        <div class="list-item"><div>外注自動判定: ON</div></div>
        <div class="list-item"><div>LINE通知文生成: ON</div></div>
        <div class="list-item"><div>スタッフ数: ${state.staff.length}人</div></div>
      </div>
    </div>
  </div>`;
}
function stat(t,v,s){return `<div class="card stat-card"><div class="stat-title">${t}</div><div class="stat-value">${v}</div><div class="stat-sub">${s}</div></div>`}
function filteredOrders(){
  return state.orders.filter(o=>[String(o.id),o.projectName,o.client,o.assignee,o.status].join(' ').toLowerCase().includes(state.orderQuery.toLowerCase()));
}
function ordersPage(){
  const filtered=filteredOrders();
  const total=filtered.reduce((s,o)=>s+Number(o.amount||0),0);
  return `
  <div class="header-row">
    <div><h1 class="page-title">受注管理 V3.1</h1><p class="page-sub">一覧ステータス変更・詳細編集・通知文面更新・履歴管理</p></div>
    <div class="top-pill">表示案件合計: <strong>${money(total)}</strong></div>
  </div>
  <div class="card search-card"><input id="order-query" class="search-input" placeholder="案件名・顧客・担当者・ステータスで検索" value="${escapeAttr(state.orderQuery)}"></div>
  <div class="card table-wrap" style="margin-top:18px">
    <div class="table-head"><div>ID</div><div>案件</div><div>顧客</div><div>金額</div><div>担当</div><div>完了予定</div><div>ステータス</div><div>操作</div></div>
    ${filtered.length===0?`<div class="empty">一致する案件がありません</div>`:filtered.map(order=>`
      <div class="table-row">
        <div><strong>${order.id}</strong></div>
        <div><strong>${escapeHtml(order.projectName)}</strong></div>
        <div>${escapeHtml(order.client)}</div>
        <div>${money(order.amount)}</div>
        <div>${escapeHtml(order.assignee)}</div>
        <div>${escapeHtml(order.finishDate||'未設定')}</div>
        <div>
          <select data-status-id="${order.id}" class="badge ${badgeClass(order.status)}">
            <option value="納期OK" ${order.status==='納期OK'?'selected':''}>納期OK</option>
            <option value="納期NG" ${order.status==='納期NG'?'selected':''}>納期NG</option>
            <option value="納品受信" ${order.status==='納品受信'?'selected':''}>納品受信</option>
          </select>
        </div>
        <div><button class="action-btn" data-open-order="${order.id}">開く</button></div>
      </div>`).join('')}
  </div>`;
}
function staffPage(){
  return `
  <div class="header-row"><div><h1 class="page-title">スタッフ管理</h1><p class="page-sub">担当者の役割と稼働状況</p></div></div>
  <div class="staff-grid">
    ${state.staff.map(member=>{
      const load=busyHours(member.name); const percent=Math.min(Math.round((load/40)*100),100);
      return `<div class="card staff-card">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
          <div><div class="card-title">${escapeHtml(member.name)}</div><div class="muted" style="margin-top:6px">${escapeHtml(member.role)}</div></div>
          <div class="badge ok">稼働中</div>
        </div>
        <div class="muted" style="margin-top:14px">${escapeHtml(member.email)}</div>
        <div style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b"><span>想定稼働</span><span>${load}時間</span></div><div class="bar"><div style="width:${percent}%"></div></div></div>
        <div class="skills">${member.skills.map(skill=>`<span class="skill">${escapeHtml(skill)}</span>`).join('')}</div>
      </div>`;
    }).join('')}
  </div>`;
}
function templatesPage(){
  return `
  <div class="header-row"><div><h1 class="page-title">テンプレート管理</h1><p class="page-sub">制作テンプレートの一覧と標準工数</p></div></div>
  <div class="templates">
    ${state.templates.map(tpl=>`<div class="card template-card">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div><div class="card-title">${escapeHtml(tpl.title)}</div><div class="badge ${templateClass(tpl.category)}" style="margin-top:10px">${escapeHtml(tpl.category)}</div></div>
        <div style="text-align:right;font-size:14px;color:#64748b"><div>${money(tpl.price)}</div><div style="margin-top:4px">${tpl.hours}時間</div></div>
      </div>
      <div class="list" style="margin-top:16px">${tpl.tasks.map(task=>`<div class="list-item" style="padding:10px 12px"><div>${escapeHtml(task)}</div></div>`).join('')}</div>
    </div>`).join('')}
  </div>`;
}
function calendarPage(){
  const weekdays=['日','月','火','水','木','金','土'];
  const cells=monthCells(state.calendarMonth);
  const today=new Date();
  const selectedDate=state.calendarSelected? new Date(state.calendarSelected): null;
  const ordersForDate=(date)=>state.orders.filter(order=>{const d=new Date(order.finishDate); return !Number.isNaN(d.getTime()) && sameDay(d,date)});
  const selectedOrders=selectedDate?ordersForDate(selectedDate):[];
  return `
  <div class="header-row"><div><h1 class="page-title">日程カレンダー</h1><p class="page-sub">完了予定日ベースの月間表示</p></div></div>
  <div class="card calendar-card">
    <div class="calendar-head">
      <button class="ghost-btn" id="prev-month">前月</button>
      <div class="card-title">${state.calendarMonth.getFullYear()}年 ${state.calendarMonth.getMonth()+1}月</div>
      <button class="ghost-btn" id="next-month">次月</button>
    </div>
    <div class="calendar-weekdays">${weekdays.map(d=>`<div>${d}</div>`).join('')}</div>
    <div class="calendar-grid">
      ${cells.map((cell,idx)=>{
        if(!cell) return `<div class="calendar-empty" key="${idx}"></div>`;
        const dayOrders=ordersForDate(cell);
        return `<button class="calendar-cell ${sameDay(cell,today)?'today':''}" data-calendar-date="${cell.toISOString()}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="date">${cell.getDate()}</span>${dayOrders.length?`<span class="badge" style="background:#f1f5f9;color:#475569;border-color:#e2e8f0;padding:3px 8px;font-size:10px">${dayOrders.length}件</span>`:''}</div>
          ${dayOrders.slice(0,3).map(order=>`<div class="calendar-chip ${badgeClass(order.status)}"><div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(order.projectName)}</div><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(order.assignee)}</div></div>`).join('')}
        </button>`;
      }).join('')}
    </div>
  </div>
  <div class="card pad" style="margin-top:18px">
    <div class="card-title" style="font-size:18px">日付クリック詳細</div>
    <div style="margin-top:14px">
    ${!selectedDate?`<div class="muted">カレンダーの日付をクリックすると、その日の案件が表示されます。</div>`:
      selectedOrders.length===0?`<div class="muted">${selectedDate.getFullYear()}/${selectedDate.getMonth()+1}/${selectedDate.getDate()} の案件はありません。</div>`:
      `<div class="list">${selectedOrders.map(order=>`<div class="list-item"><div><div class="list-item-title">${escapeHtml(order.projectName)}</div><div class="list-item-sub">顧客: ${escapeHtml(order.client)} / 担当: ${escapeHtml(order.assignee)}</div></div><div class="badges"><span class="badge ${badgeClass(order.status)}">${escapeHtml(order.status)}</span><span class="badge ${judgeClass(order.judge)}">${escapeHtml(order.judge)}</span></div></div>`).join('')}</div>`}
    </div>
  </div>`;
}
function outsourcePage(){
  const outs=state.orders.filter(order=>order.judge==='外注推奨'||order.status==='納期NG');
  const recv=state.orders.filter(o=>o.status==='納品受信').length;
  const total=outs.reduce((s,o)=>s+Number(o.amount||0),0);
  return `
  <div class="header-row"><div><h1 class="page-title">外注管理</h1><p class="page-sub">外注候補案件の確認と受信管理</p></div></div>
  <div class="summary-grid">
    ${stat('外注候補件数',outs.length,'要確認')}
    ${stat('外注候補合計金額',money(total),'候補合計')}
    ${stat('受信済み件数',recv,'完了扱い')}
  </div>
  <div class="list" style="margin-top:18px">
    ${outs.length===0?`<div class="card pad"><div class="muted">現在、外注候補案件はありません。</div></div>`:
      outs.map(order=>`<div class="card out-card">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">
          <div>
            <div class="card-title">${escapeHtml(order.projectName)}</div>
            <div class="muted" style="margin-top:6px">顧客: ${escapeHtml(order.client)} / 担当: ${escapeHtml(order.assignee)}</div>
            <div class="muted" style="margin-top:6px">金額: ${money(order.amount)} / 完了予定: ${escapeHtml(order.finishDate||'未設定')}</div>
          </div>
          <div class="badges"><span class="badge ${badgeClass(order.status)}">${escapeHtml(order.status)}</span><span class="badge ${judgeClass(order.judge)}">${escapeHtml(order.judge)}</span></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
          <button class="ghost-btn">指示書を見る</button>
          <button class="primary-btn" data-received-id="${order.id}">納品受信にする</button>
        </div>
      </div>`).join('')}
  </div>`;
}
function modalContent(selected){
  return `<div class="modal-backdrop" id="modal-close-bg">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-grid">
        <div>
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px">
            <div><h2>案件編集</h2><div class="sub">案件情報を編集して保存できます</div></div>
            <div class="sub">ID: ${selected.id}</div>
          </div>
          <div class="stack">
            <input id="edit-projectName" value="${escapeAttr(selected.projectName)}">
            <input id="edit-client" value="${escapeAttr(selected.client)}">
            <input id="edit-amount" value="${escapeAttr(selected.amount)}">
            <select id="edit-assignee">${state.staff.map(s=>`<option value="${escapeAttr(s.name)}" ${s.name===selected.assignee?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}</select>
            <input id="edit-finishDate" type="date" value="${escapeAttr(selected.finishDate||'')}">
            <select id="edit-status" class="badge ${badgeClass(selected.status)}">
              <option value="納期OK" ${selected.status==='納期OK'?'selected':''}>納期OK</option>
              <option value="納期NG" ${selected.status==='納期NG'?'selected':''}>納期NG</option>
              <option value="納品受信" ${selected.status==='納品受信'?'selected':''}>納品受信</option>
            </select>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
            <button class="primary-btn" id="save-order">保存する</button>
            <button class="ghost-btn" id="duplicate-order">複製する</button>
            <button class="danger-btn" id="delete-order">削除する</button>
            <button class="ghost-btn" id="close-order">閉じる</button>
          </div>
        </div>
        <div>
          <div class="card-title" style="font-size:18px;margin-bottom:12px">通知文面プレビュー</div>
          <div class="preview">${escapeHtml(buildNotice(selected))}</div>
          <div class="card-title" style="font-size:18px;margin-top:16px;margin-bottom:12px">現在の判定</div>
          <div class="badge ${judgeClass(statusToJudge(selected.status))}">${escapeHtml(statusToJudge(selected.status))}</div>
        </div>
        <div>
          <div class="card-title" style="font-size:18px;margin-bottom:12px">変更履歴</div>
          <div class="history">${selected.history.length===0?`<div class="muted">履歴なし</div>`:selected.history.map(h=>`<div class="history-item">${escapeHtml(h)}</div>`).join('')}</div>
        </div>
      </div>
    </div>
  </div>`;
}
function bindEvents(){
  document.querySelectorAll('[data-nav]').forEach(btn=>btn.onclick=()=>{state.currentPage=btn.dataset.nav; render();});
  const query=document.getElementById('order-query'); if(query) query.oninput=e=>{state.orderQuery=e.target.value; render();};
  document.querySelectorAll('[data-status-id]').forEach(sel=>sel.onchange=e=>{
    const id=Number(sel.dataset.statusId); const status=e.target.value;
    state.orders=state.orders.map(o=>o.id!==id?o:{...o,status,judge:statusToJudge(status),notice:buildNotice({...o,status,judge:statusToJudge(status)}),history:[...(o.history||[]),`ステータス変更: ${status}`]});
    render();
  });
  document.querySelectorAll('[data-open-order]').forEach(btn=>btn.onclick=()=>{state.selectedOrderId=Number(btn.dataset.openOrder); render();});
  const prev=document.getElementById('prev-month'); if(prev) prev.onclick=()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1); render();};
  const next=document.getElementById('next-month'); if(next) next.onclick=()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1); render();};
  document.querySelectorAll('[data-calendar-date]').forEach(btn=>btn.onclick=()=>{state.calendarSelected=btn.dataset.calendarDate; render();});
  document.querySelectorAll('[data-received-id]').forEach(btn=>btn.onclick=()=>{const id=Number(btn.dataset.receivedId); state.orders=state.orders.map(order=>order.id!==id?order:{...order,status:'納品受信',judge:'納品受信',notice:`${order.notice}\n【外注更新】納品受信に変更しました。`,history:[...(order.history||[]),'外注案件を納品受信に変更']}); render();});
  const closeBg=document.getElementById('modal-close-bg'); if(closeBg) closeBg.onclick=()=>{state.selectedOrderId=null; render();};
  const close=document.getElementById('close-order'); if(close) close.onclick=()=>{state.selectedOrderId=null; render();};
  const save=document.getElementById('save-order'); if(save) save.onclick=saveOrder;
  const dup=document.getElementById('duplicate-order'); if(dup) dup.onclick=duplicateOrder;
  const del=document.getElementById('delete-order'); if(del) del.onclick=deleteOrder;
}
function saveOrder(){
  const selected=getSelectedOrder(); if(!selected) return;
  const updated={
    ...selected,
    projectName: document.getElementById('edit-projectName').value,
    client: document.getElementById('edit-client').value,
    amount: document.getElementById('edit-amount').value,
    assignee: document.getElementById('edit-assignee').value,
    finishDate: document.getElementById('edit-finishDate').value,
    status: document.getElementById('edit-status').value,
  };
  state.orders=state.orders.map(o=>{
    if(o.id!==updated.id) return o;
    const history=[...(o.history||[])];
    if(o.projectName!==updated.projectName) history.push(`案件名変更: ${o.projectName} → ${updated.projectName}`);
    if(o.client!==updated.client) history.push(`顧客変更: ${o.client} → ${updated.client}`);
    if(String(o.amount)!==String(updated.amount)) history.push(`金額変更: ${o.amount} → ${updated.amount}`);
    if(o.assignee!==updated.assignee) history.push(`担当変更: ${o.assignee} → ${updated.assignee}`);
    if((o.finishDate||'')!==(updated.finishDate||'')) history.push(`完了予定日変更: ${o.finishDate||'未設定'} → ${updated.finishDate||'未設定'}`);
    if(o.status!==updated.status) history.push(`ステータス変更: ${o.status} → ${updated.status}`);
    const next={...updated,judge:statusToJudge(updated.status)};
    return {...next,notice:buildNotice(next),history};
  });
  state.selectedOrderId=null; render();
}
function duplicateOrder(){
  const selected=getSelectedOrder(); if(!selected) return;
  const copy={...selected,id:Date.now(),history:[...(selected.history||[]),'案件を複製しました']};
  state.orders=[...state.orders,copy];
  state.selectedOrderId=null; render();
}
function deleteOrder(){
  const selected=getSelectedOrder(); if(!selected) return;
  state.orders=state.orders.filter(o=>o.id!==selected.id);
  state.selectedOrderId=null; render();
}
function escapeHtml(str){return String(str??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function escapeAttr(str){return escapeHtml(str).replace(/`/g,'&#96;')}

render();
