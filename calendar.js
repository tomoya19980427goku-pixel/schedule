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

    const weeks = ["月","火","水","木","金","土","日"];

const weekIndex = (startDay + day - 1) % 7;

number.innerHTML = `
${day}
<div style="
font-size:12px;
font-weight:normal;
margin-top:3px;
">
(${weeks[weekIndex]})
</div>
`;

    cell.appendChild(number);

    // イベント表示は後で追加
    calendarBody.appendChild(cell);

}
// ==========================================
// イベント表示
// ==========================================

const cells = document.querySelectorAll(".day");

events.forEach(event => {

    // 今表示している月以外は表示しない
    if (event.month !== month) return;

    // 月初の空白セルがあるので位置を調整
    const cell = cells[event.date + startDay - 1];

    if (!cell) return;

    const link = document.createElement("a");

    link.className = "event";

    link.href = event.url || "#";

    link.target = "_blank";

    link.style.background = event.color;

    link.innerHTML = `
        <div style="font-size:12px;opacity:.9;">
            🕒 ${event.time}
        </div>

        <div style="margin-top:6px;">
            ${event.title}
        </div>
    `;

    if (event.url === "") {

        link.removeAttribute("href");

        link.style.cursor = "default";

        link.style.opacity = ".6";

        link.innerHTML = `
            <div style="font-size:12px;opacity:.9;">
                🕒 ${event.time}
            </div>

            <div style="margin-top:6px;">
                ${event.title}
            </div>

            <div style="margin-top:6px;font-size:11px;">
                🔒 URL準備中
            </div>
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
// ==========================================
// 今日のZoomを表示
// ==========================================

const todayEventBox = document.getElementById("todayEvent");

const todayEvents = events.filter(event => {

    return (
    event.month === month &&
    event.date === today.getDate()
);

});

if (todayEvents.length === 0) {

    todayEventBox.innerHTML = "本日の予定はありません";

} else {

    todayEventBox.innerHTML = "";

    todayEvents.forEach(event => {
       if (event.month !== month) return;
        const item = document.createElement("div");

        item.style.marginBottom = "15px";

        if (event.url) {

            item.innerHTML = `
                <strong>${event.title}</strong><br>
                ${event.time}<br><br>

                <a href="${event.url}"
                   target="_blank"
                   class="event"
                   style="display:inline-block;background:${event.color};">
                   Zoomに参加
                </a>
            `;

        } else {

            item.innerHTML = `
                <strong>${event.title}</strong><br>
                ${event.time}<br><br>

                <span style="
                    display:inline-block;
                    padding:8px 14px;
                    background:#999;
                    color:white;
                    border-radius:8px;
                ">
                    URL準備中
                </span>
            `;

        }

        todayEventBox.appendChild(item);

    });

}
// ==========================================
// 今日までスクロール
// ==========================================

const todayCell = document.querySelector(".today");

if (todayCell) {

    setTimeout(() => {

        todayCell.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }, 300);

}
// ==========================================
// 今週の予定を表示
// ==========================================

const weekEvents = document.getElementById("weekEvents");

if (weekEvents) {

    weekEvents.innerHTML = "";

    const currentDay = today.getDate();

    const upcomingEvents = events.filter(event =>

    event.month === month &&
    event.date >= currentDay

);
    if (upcomingEvents.length === 0) {

        weekEvents.innerHTML = "<p>今週の予定はありません。</p>";

    } else {

        upcomingEvents.slice(0, 5).forEach(event => {

            const item = document.createElement("div");

            item.className = "week-item";

            item.innerHTML = `
                <div class="week-date">
                    ${event.date}日
                </div>

                <div class="week-title">
                    ${event.title}
                </div>

                <div class="week-time">
                    🕒 ${event.time}
                </div>
            `;

            weekEvents.appendChild(item);

        });

    }

}