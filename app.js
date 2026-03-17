const staffOptions = ["田中", "佐藤", "鈴木", "高橋", "上部"];

let orders = [
  {
    id: 1,
    projectName: "バナー制作",
    client: "A社",
    status: "納期OK",
    judge: "社内対応",
    amount: 50000,
    assignee: "田中",
    finishDate: "2026-03-25",
    history: [],
  },
  {
    id: 2,
    projectName: "LPデザイン",
    client: "B社",
    status: "納期NG",
    judge: "外注推奨",
    amount: 120000,
    assignee: "佐藤",
    finishDate: "2026-03-28",
    history: [],
  },
];

let query = "";
let selectedId = null;

function buildNotice(order) {
  return `案件: ${order.projectName}\n顧客: ${order.client}\n担当: ${order.assignee}\n金額: ${order.amount}\n完了予定: ${order.finishDate || "未設定"}\nステータス: ${order.status}`;
}

function statusToJudge(status) {
  if (status === "納期NG") return "外注推奨";
  if (status === "納品受信") return "納品受信";
  return "社内対応";
}

function statusClass(status) {
  if (status === "納期OK") return "status-ok";
  if (status === "納期NG") return "status-ng";
  return "status-done";
}

function judgeClass(judge) {
  if (judge === "社内対応") return "judge-in";
  if (judge === "外注推奨") return "judge-out";
  return "judge-done";
}

function filteredOrders() {
  return orders.filter((o) =>
    [String(o.id), o.projectName, o.client, o.assignee, o.status].join(" ").toLowerCase().includes(query.toLowerCase())
  );
}

function totalAmount() {
  return filteredOrders().reduce((sum, o) => sum + Number(o.amount || 0), 0);
}

function setStatus(id, status) {
  orders = orders.map((o) => {
    if (o.id !== id) return o;
    return {
      ...o,
      status,
      judge: statusToJudge(status),
      history: [...o.history, `ステータス変更: ${status}`],
    };
  });
  render();
}

function openDetail(id) {
  selectedId = id;
  render();
}

function closeDetail() {
  selectedId = null;
  render();
}

function saveDetail() {
  const id = selectedId;
  const original = orders.find((o) => o.id === id);
  if (!original) return;

  const projectName = document.getElementById("edit-projectName").value;
  const client = document.getElementById("edit-client").value;
  const amount = document.getElementById("edit-amount").value;
  const assignee = document.getElementById("edit-assignee").value;
  const finishDate = document.getElementById("edit-finishDate").value;
  const status = document.getElementById("edit-status").value;

  const history = [...original.history];
  if (original.projectName !== projectName) history.push(`案件名変更: ${original.projectName} → ${projectName}`);
  if (original.client !== client) history.push(`顧客変更: ${original.client} → ${client}`);
  if (String(original.amount) !== String(amount)) history.push(`金額変更: ${original.amount} → ${amount}`);
  if (original.assignee !== assignee) history.push(`担当変更: ${original.assignee} → ${assignee}`);
  if ((original.finishDate || "") !== (finishDate || "")) history.push(`完了予定日変更: ${original.finishDate || "未設定"} → ${finishDate || "未設定"}`);
  if (original.status !== status) history.push(`ステータス変更: ${original.status} → ${status}`);

  orders = orders.map((o) => o.id === id ? {
    ...o,
    projectName,
    client,
    amount,
    assignee,
    finishDate,
    status,
    judge: statusToJudge(status),
    history,
  } : o);

  closeDetail();
}

function duplicateDetail() {
  const current = orders.find((o) => o.id === selectedId);
  if (!current) return;
  const clone = {
    ...current,
    id: Date.now(),
    history: [...current.history, "案件を複製しました"],
  };
  orders = [clone, ...orders];
  selectedId = clone.id;
  render();
}

function deleteDetail() {
  orders = orders.filter((o) => o.id !== selectedId);
  closeDetail();
}

function render() {
  const app = document.getElementById("app");
  const rows = filteredOrders();
  const selected = orders.find((o) => o.id === selectedId) || null;

  app.innerHTML = `
    <div class="container">
      <div class="topbar">
        <div>
          <h1 class="h1">受注管理 V3.1</h1>
          <div class="sub">一覧ステータス変更・詳細編集・通知文面更新・履歴管理</div>
        </div>
        <div class="card summary">表示案件合計: <strong>¥${totalAmount().toLocaleString("ja-JP")}</strong></div>
      </div>

      <div class="card search-card">
        <input id="searchInput" class="input" placeholder="案件名・顧客・担当者・ステータスで検索" value="${escapeHtml(query)}" />
      </div>

      <div class="card table">
        <div class="table-head">
          <div>ID</div>
          <div>案件</div>
          <div>顧客</div>
          <div class="hide-md">金額</div>
          <div class="hide-sm">担当</div>
          <div class="hide-sm">完了予定</div>
          <div>ステータス</div>
          <div>操作</div>
        </div>
        ${rows.length === 0 ? `<div class="empty">一致する案件がありません</div>` : rows.map(order => `
          <div class="table-row">
            <div>${order.id}</div>
            <div class="project">${escapeHtml(order.projectName)}</div>
            <div class="muted">${escapeHtml(order.client)}</div>
            <div class="muted hide-md">¥${Number(order.amount).toLocaleString("ja-JP")}</div>
            <div class="muted hide-sm">${escapeHtml(order.assignee)}</div>
            <div class="muted hide-sm">${escapeHtml(order.finishDate || "未設定")}</div>
            <div>
              <select class="select ${statusClass(order.status)}" data-status-id="${order.id}">
                <option value="納期OK" ${order.status === "納期OK" ? "selected" : ""}>納期OK</option>
                <option value="納期NG" ${order.status === "納期NG" ? "selected" : ""}>納期NG</option>
                <option value="納品受信" ${order.status === "納品受信" ? "selected" : ""}>納品受信</option>
              </select>
            </div>
            <div class="row-actions"><button data-open-id="${order.id}">開く</button></div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="modal ${selected ? "open" : ""}" id="detailModal">
      ${selected ? `
      <div class="modal-box">
        <div>
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px">
            <div>
              <h2 class="section-title">案件編集</h2>
              <p class="section-sub">案件名・顧客・金額・担当者・完了予定日・ステータスを編集できます</p>
            </div>
            <div class="id-note">ID: ${selected.id}</div>
          </div>
          <div class="stack">
            <input id="edit-projectName" class="input" value="${escapeHtml(selected.projectName)}" />
            <input id="edit-client" class="input" value="${escapeHtml(selected.client)}" />
            <input id="edit-amount" class="input" value="${escapeHtml(String(selected.amount))}" />
            <select id="edit-assignee" class="select">
              ${staffOptions.map(name => `<option value="${name}" ${selected.assignee === name ? "selected" : ""}>${name}</option>`).join("")}
            </select>
            <input id="edit-finishDate" type="date" class="input" value="${escapeHtml(selected.finishDate || "")}" />
            <select id="edit-status" class="select ${statusClass(selected.status)}">
              <option value="納期OK" ${selected.status === "納期OK" ? "selected" : ""}>納期OK</option>
              <option value="納期NG" ${selected.status === "納期NG" ? "selected" : ""}>納期NG</option>
              <option value="納品受信" ${selected.status === "納品受信" ? "selected" : ""}>納品受信</option>
            </select>
          </div>
          <div class="actions">
            <button class="button primary" id="saveBtn">保存する</button>
            <button class="button" id="dupBtn">複製する</button>
            <button class="button danger" id="delBtn">削除する</button>
            <button class="button" id="closeBtn">閉じる</button>
          </div>
        </div>
        <div>
          <div class="section-title" style="font-size:16px">通知文面プレビュー</div>
          <div class="notice-box">${escapeHtml(buildNotice(selected))}</div>
          <div style="margin-top:14px" class="section-title">現在の判定</div>
          <div class="badge ${judgeClass(statusToJudge(selected.status))}">${statusToJudge(selected.status)}</div>
        </div>
        <div>
          <div class="section-title" style="font-size:16px">変更履歴</div>
          <div class="history-box">
            <div class="history-list">
              ${selected.history.length === 0 ? `<div class="muted">履歴なし</div>` : selected.history.map(h => `<div class="history-item">${escapeHtml(h)}</div>`).join("")}
            </div>
          </div>
        </div>
      </div>
      ` : ""}
    </div>
  `;

  document.getElementById("searchInput").addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });

  app.querySelectorAll("[data-status-id]").forEach(el => {
    el.addEventListener("change", (e) => setStatus(Number(e.target.dataset.statusId), e.target.value));
  });
  app.querySelectorAll("[data-open-id]").forEach(el => {
    el.addEventListener("click", (e) => openDetail(Number(e.target.dataset.openId)));
  });

  if (selected) {
    document.getElementById("saveBtn").addEventListener("click", saveDetail);
    document.getElementById("dupBtn").addEventListener("click", duplicateDetail);
    document.getElementById("delBtn").addEventListener("click", deleteDetail);
    document.getElementById("closeBtn").addEventListener("click", closeDetail);
    document.getElementById("detailModal").addEventListener("click", (e) => {
      if (e.target.id === "detailModal") closeDetail();
    });
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

render();
