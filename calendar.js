// ==========================================
// Zoomスケジュールカレンダー
// Version 2.0
// ==========================================

const calendarBody = document.getElementById("calendarBody");
const monthTitle = document.getElementById("monthTitle");

// 年・月
monthTitle.textContent = `${year}年${month}月`;

// 月初
const firstDay = new Date(year, month - 1, 1);

// 月末
const lastDay = new Date(year, month, 0);

// 月初の曜日
let startDay = firstDay.getDay();

// 日曜始まり→月曜始まりへ変換
startDay = startDay === 0 ? 6 : startDay - 1;

// 月の日数
const totalDays = lastDay.getDate();

// 今日
const today = new Date();

// カレンダーを空にする
calendarBody.innerHTML = "";
// ==========================================
// 空白セル（月初まで）
// ==========================================

for (let i = 0; i < startDay; i++) {

    const empty = document.createElement("div");

    empty.className = "day empty";

    calendarBody.appendChild(empty);

}

// ==========================================
// 日付セル作成
// ==========================================

for (let day = 1; day <= totalDays; day++) {

    const cell = document.createElement("div");

    cell.className = "day";

    // 今日なら黄色
    if (
        today.getFullYear() === year &&
        today.getMonth() + 1 === month &&
        today.getDate() === day
    ) {
        cell.classList.add("today");
    }

    // 日付
    const number = document.createElement("div");

    number.className = "day-number";

    number.textContent = day;

    cell.appendChild(number);

    // イベント表示は後で追加
    calendarBody.appendChild(cell);

}
// ==========================================
// イベント表示
// ==========================================

const cells = document.querySelectorAll(".day");

events.forEach(event => {

    // 月初の空白セルがあるので位置を調整
    const cell = cells[event.date + startDay - 1];

    if (!cell) return;

    const link = document.createElement("a");

    link.className = "event";

    link.href = event.url || "#";

    link.target = "_blank";

    link.style.background = event.color;

    link.innerHTML = `
        <strong>${event.time}</strong><br>
        ${event.title}
    `;

    if (event.url === "") {

        link.removeAttribute("href");

        link.style.cursor = "default";

        link.style.opacity = ".6";

        link.innerHTML = `
            <strong>${event.time}</strong><br>
            ${event.title}<br>
            <small>準備中</small>
        `;

    }

    cell.appendChild(link);

});
// ==========================================
// 土日の日付の色変更
// ==========================================

const allDays = document.querySelectorAll(".day");

allDays.forEach((cell, index) => {

    // 空白セルは除く
    if (cell.classList.contains("empty")) return;

    // 曜日（月曜始まり）
    const week = index % 7;

    const number = cell.querySelector(".day-number");

    if (!number) return;

    // 土曜日
    if (week === 5) {
        number.style.color = "#2563eb";
    }

    // 日曜日
    if (week === 6) {
        number.style.color = "#dc2626";
    }

});

// ==========================================
// イベントが無い日は少し薄く表示
// ==========================================

allDays.forEach(cell => {

    if (cell.classList.contains("empty")) return;

    const event = cell.querySelector(".event");

    if (!event) {
        cell.style.background = "#fafafa";
    }

});

// ==========================================
// URLがあるイベントだけクリック可能
// ==========================================

document.querySelectorAll(".event").forEach(event => {

    if (event.getAttribute("href") === "#") {

        event.removeAttribute("href");
        event.style.cursor = "default";
        event.style.opacity = ".6";

    }

});