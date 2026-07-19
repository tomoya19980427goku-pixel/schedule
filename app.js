// ==========================================
// ERINA Zoom Schedule Ver3
// app.js
// 第1弾
// ==========================================

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

const monthTitle = document.getElementById("monthTitle");
const calendarBody = document.getElementById("calendarBody");

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

        cell.innerHTML=`<strong>${day}</strong>`;

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

    eventLabel.textContent = e.title;

    eventLabel.style.background = e.color;
    eventLabel.style.color = "#fff";
    eventLabel.style.fontSize = "11px";
    eventLabel.style.marginTop = "3px";
    eventLabel.style.padding = "2px 4px";
    eventLabel.style.borderRadius = "4px";
    eventLabel.style.whiteSpace = "nowrap";
    eventLabel.style.overflow = "hidden";
    eventLabel.style.textOverflow = "ellipsis";

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
// 今週の予定
// ==============================

function loadWeekEvents(){

    const now=new Date();

    const week=new Date();

    week.setDate(now.getDate()+7);

    const list=events.filter(e=>{

        const d=eventDate(e);

        return d>=now && d<=week;

    });

    if(list.length===0){

        weekEvents.innerHTML="今週の予定はありません。";

        return;

    }

    weekEvents.innerHTML="";

    list.forEach(e=>{

        weekEvents.innerHTML+=`
        <p>
        <strong>${e.month}/${e.date}</strong>
        ${e.time}<br>
        ${e.title}
        </p>
        `;

    });

}
// ==============================
// 日付クリックで予定表示
// ==============================

function showEvents(day){

    const list=events.filter(e=>

        e.year===currentYear &&
        e.month===currentMonth &&
        e.date===day

    );

    if(list.length===0){

        selectedDate.innerHTML=`
        <p>${currentMonth}月${day}日の予定はありません。</p>
        `;

        return;

    }

    let html=`<h3>${currentMonth}月${day}日の予定</h3>`;

    list.forEach(e=>{

        html+=`
        <div style="margin:15px 0;padding:10px;border-left:5px solid ${e.color};background:#fafafa;">
            <strong>${e.time}</strong><br>
            ${e.title}<br>
        `;

        if(e.url){

            html+=`
            <a
                class="zoom-button"
                href="${e.url}"
                target="_blank"
            >
                Zoomに参加する
            </a>
            `;

        }else{

            html+=`
            <p style="color:#888;">
                Zoom URL準備中
            </p>
            `;

        }

        html+=`</div>`;

    });

    selectedDate.innerHTML=html;

}

// ==============================
// 前月・次月ボタン
// ==============================

prevMonth.addEventListener("click",()=>{

    currentMonth--;

    if(currentMonth<1){

        currentMonth=12;
        currentYear--;

    }

    renderCalendar();

});

nextMonth.addEventListener("click",()=>{

    currentMonth++;

    if(currentMonth>12){

        currentMonth=1;
        currentYear++;

    }

    renderCalendar();

});
