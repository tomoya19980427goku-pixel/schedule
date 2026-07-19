// ==========================================
// ERINA Zoom Schedule Ver3
// app.js
// 第1弾
// ==========================================

// ==========================================
// イベントデータ読み込み
// ==========================================

let events = [];


async function loadEvents(){

    try{

        const response = await fetch(
            "./data/events.js?v=" + Date.now()
        );


        const text = await response.text();


        const json = text
            .replace("const events =", "")
            .replace(";", "")
            .trim();


        events = JSON.parse(json);


        startApp();


    }catch(error){

        console.error(
            "イベント読み込み失敗",
            error
        );

    }

}
// 今日の日付
const today = new Date();

// 表示中の年月
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1;

// HTML取得
const todayEvents = document.getElementById("todayEvents");
const nextEvent = document.getElementById("nextEvent");
const weekEvents = document.getElementById("weekEvents");
const selectedDate = document.getElementById("selectedDate");
const eventModal = document.getElementById("eventModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const monthTitle = document.getElementById("monthTitle");
const calendarBody = document.getElementById("calendarBody");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageModal = document.getElementById("closeImageModal");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

// ==============================
// 日付作成
// ==============================

function eventDate(event){

    return new Date(
        event.year,
        event.month - 1,
        event.date,
        Number(event.time.split(":")[0]),
        Number(event.time.split(":")[1])
    );

}

// ==============================
// イベント並び替え
// ==============================

events.sort((a,b)=>{

    return eventDate(a) - eventDate(b);

});

// ==============================
// 今日のZoom
// ==============================

function loadTodayEvents(){

    const todayList = events.filter(e=>{

        return (
            e.year===today.getFullYear() &&
            e.month===today.getMonth()+1 &&
            e.date===today.getDate()
        );

    });

    if(todayList.length===0){

        todayEvents.innerHTML="今日はZoom予定はありません。";
        return;

    }

    todayEvents.innerHTML="";

    todayList.forEach(e=>{

        let html=`
            <p>
                <strong>${e.time}</strong><br>
                ${e.title}
            </p>
        `;

        if(e.url){

            html+=`
            <a class="zoom-button"
               href="${e.url}"
               target="_blank">
               参加する
            </a>
            `;

        }

        todayEvents.innerHTML+=html;

    });

}

// ==============================
// 次回Zoom
// ==============================

function loadNextEvent(){

    const now=new Date();

    const future=events.filter(e=>{

        return eventDate(e)>=now;

    });

    if(future.length===0){

        nextEvent.innerHTML="予定はありません。";
        return;

    }

    const e=future[0];

    let html=`
        <p>
        <strong>${e.month}/${e.date}</strong><br>
        ${e.time}<br>
        ${e.title}
        </p>
    `;

    if(e.url){

        html+=`
        <a class="zoom-button"
        href="${e.url}"
        target="_blank">
        参加する
        </a>
        `;

    }

    nextEvent.innerHTML=html;

}
// ==============================
// カレンダー表示
// ==============================

function renderCalendar(){

    monthTitle.textContent=`${currentYear}年${currentMonth}月`;

    calendarBody.innerHTML="";

    const firstDay=new Date(currentYear,currentMonth-1,1);

    const lastDay=new Date(currentYear,currentMonth,0);

    let startDay=firstDay.getDay();

    // 月曜始まり
    startDay=(startDay===0)?6:startDay-1;

    const totalDays=lastDay.getDate();

    let row=document.createElement("tr");

    // 空白
    for(let i=0;i<startDay;i++){

        row.appendChild(document.createElement("td"));

    }

    // 日付
    for(let day=1;day<=totalDays;day++){

        const cell=document.createElement("td");

        cell.dataset.day=day;

        cell.innerHTML = `
<div class="day-number">${day}</div>
`;

        // 今日を黄色
        if(
            currentYear===today.getFullYear() &&
            currentMonth===today.getMonth()+1 &&
            day===today.getDate()
        ){

            cell.classList.add("today");

        }

        // イベント取得
        const dayEvents=events.filter(e=>

            e.year===currentYear &&
            e.month===currentMonth &&
            e.date===day

        );

  // イベント名を表示（最大2件）
dayEvents.slice(0, 2).forEach(e => {

    const eventLabel = document.createElement("div");

    eventLabel.className = "calendar-event";

    eventLabel.textContent = e.shortTitle || e.title;
    eventLabel.addEventListener("click", (event) => {
    event.stopPropagation();
    showEvents(day);
});

    eventLabel.style.background = e.color;
 

    cell.appendChild(eventLabel);

});

// 3件以上ある場合
if (dayEvents.length > 2) {

    const more = document.createElement("div");

    more.textContent = `+${dayEvents.length - 2}件`;

    more.style.fontSize = "10px";
    more.style.color = "#666";

    cell.appendChild(more);

}

        // 第3弾でクリック処理を追加
        cell.addEventListener("click",()=>{

            showEvents(day);

        });

        row.appendChild(cell);

        if((startDay+day)%7===0){

            calendarBody.appendChild(row);

            row=document.createElement("tr");

        }

    }

    // 最終行
    while(row.children.length<7){

        row.appendChild(document.createElement("td"));

    }

    calendarBody.appendChild(row);

}

// ==============================
// 近日の予定（今日から7日間）
// ==============================

function loadWeekEvents(){

    const now = new Date();
    now.setHours(0,0,0,0);

    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    end.setHours(23,59,59,999);

    const list = events.filter(e => {

        const d = eventDate(e);

        return d >= now && d <= end;

    });

    if(list.length === 0){

        weekEvents.innerHTML = "近日の予定はありません。";
        return;

    }

    weekEvents.innerHTML = "";

    const weekName = ["日","月","火","水","木","金","土"];

    list.forEach(e => {

        const d = eventDate(e);

        weekEvents.innerHTML += `
        <div style="margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #eee;">
            <strong>📅 ${e.month}/${e.date}（${weekName[d.getDay()]}）</strong><br>
            🕛 ${e.time}<br>
            📺 ${e.title}
        </div>
        `;

    });

}
// ==============================
// 日付クリックで予定表示
// ==============================

function showEvents(day){

    const list = events.filter(e=>

        e.year===currentYear &&
        e.month===currentMonth &&
        e.date===day

    );

    if(list.length===0){

        modalBody.innerHTML=`
        <h2>${currentMonth}月${day}日</h2>
        <p>予定はありません。</p>
        `;

        eventModal.style.display="block";

        return;

    }

    let html="";

    list.forEach(e=>{

        html+=`

        <div>

            <div class="modal-title">${e.title}</div>

            <div class="modal-time">
                🕛 ${e.time}${e.endTime ? " ～ " + e.endTime : ""}
            </div>

        `;

       if(e.image){

    html+=`

    <img
        src="${e.image}"
        alt="${e.title}"
        class="event-image"
        onclick="openImage('${e.image}')">

    `;

}

        if(e.url){

            html+=`

            <a
                class="zoom-button"
                href="${e.url}"
                target="_blank">

                Zoomに参加する

            </a>

            `;

        }

        html+=`

        </div>

        `;

    });

    modalBody.innerHTML=html;

    eventModal.style.display="block";

}

// ==============================
// 前月ボタン
// ==============================

prevMonth.addEventListener("click",()=>{

    currentMonth--;

    if(currentMonth<1){

        currentMonth=12;
        currentYear--;

    }

    renderCalendar();

});

// ==============================
// 次月ボタン
// ==============================

nextMonth.addEventListener("click",()=>{

    currentMonth++;

    if(currentMonth>12){

        currentMonth=1;
        currentYear++;

    }

    renderCalendar();

});

// ==============================
// ポップアップを閉じる
// ==============================

closeModal.onclick = function(){

    eventModal.style.display = "none";

};

window.onclick = function(event){

    if(event.target === eventModal){

        eventModal.style.display = "none";

    }

};
// ==============================
// アプリ開始
// ==============================

function startApp(){


    // イベント並び替え

    events.sort((a,b)=>{

        return eventDate(a)-eventDate(b);

    });


    loadTodayEvents();

    loadNextEvent();

    loadWeekEvents();

    renderCalendar();


}


// 読み込み開始

loadEvents();
// ==============================
// 画像拡大
// ==============================

function openImage(src){

    modalImage.src = src;

    imageModal.style.display = "flex";

}

closeImageModal.onclick = function(){

    imageModal.style.display = "none";

};

imageModal.onclick = function(e){

    if(e.target === imageModal){

        imageModal.style.display = "none";

    }

};