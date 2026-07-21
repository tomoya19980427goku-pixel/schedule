/* =========================================================
   ERINA Zoom Schedule Ver5
   app.js
   ========================================================= */

"use strict";

/* =========================================================
   1. 基本設定
   ========================================================= */

const DATA_URL =
"https://erina-manager.tomoya19980427goku.workers.dev/?action=events";

/*
  予定データ確認間隔
  30秒ごとにevents.jsonの変更を確認する
*/
const UPDATE_INTERVAL = 30 * 1000;

let events = [];

let currentYear;
let currentMonth;

let lastDataSignature = "";

let refreshTimer = null;

// 表示形式
// schedule = スケジュール表
// calendar = カレンダー
let displayMode = "schedule";

/* =========================================================
   2. DOM
   ========================================================= */

const todayEventElement =
    document.getElementById("todayEvent");

const nextEventElement =
    document.getElementById("nextEvent");

const weekEventsElement =
    document.getElementById("weekEvents");

const calendarElement =
    document.getElementById("calendar");

const monthTitleElement =
    document.getElementById("monthTitle");

const prevMonthButton =
    document.getElementById("prevMonth");

const nextMonthButton =
    document.getElementById("nextMonth");

const eventModal =
    document.getElementById("eventModal");

const closeModalButton =
    document.getElementById("closeModal");

const eventImageArea =
    document.getElementById("eventImageArea");

const eventDetail =
    document.getElementById("eventDetail");

const updateToast =
    document.getElementById("updateToast");


/* =========================================================
   3. 初期化
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


async function initializeApp() {

    const now = new Date();

    currentYear = now.getFullYear();

    currentMonth =
        now.getMonth() + 1;


    /*
      最初に最新データを取得
    */

    await loadEvents({
        firstLoad: true
    });


    /*
      画面表示
    */

    renderAll();


    /*
      ボタンなどのイベント設定
    */

    setupEventListeners();


    /*
      自動更新開始
    */

    startAutoRefresh();


    /*
      Service Worker登録
    */

    registerServiceWorker();

}


/* =========================================================
   4. events.json取得

   重要：
   iPhone PWAで古い予定を表示しないため
   毎回違うURLとして取得する

   ?t=現在時刻
   ========================================================= */

async function loadEvents(
    {
        firstLoad = false,
        silent = false
    } = {}
) {

    try {

        const cacheBuster =
            Date.now();

        const response =
    await fetch(
        `${DATA_URL}&t=${cacheBuster}`,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {
                        "Cache-Control":
                            "no-cache, no-store, must-revalidate",

                        "Pragma":
                            "no-cache"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `events.json取得失敗: ${response.status}`
            );

        }


        const newEvents =
            await response.json();


        if (!Array.isArray(newEvents)) {

            throw new Error(
                "events.jsonの形式が正しくありません"
            );

        }


        /*
          データを正規化
        */

        const normalizedEvents =
            newEvents
                .map(normalizeEvent)
                .filter(Boolean);


        /*
          並び替え
        */

        normalizedEvents.sort(
            compareEvents
        );


        /*
          データ変更判定
        */

        const newSignature =
            createDataSignature(
                normalizedEvents
            );


        const changed =
            lastDataSignature !== "" &&
            lastDataSignature !==
                newSignature;


        events =
            normalizedEvents;

        lastDataSignature =
            newSignature;


        /*
          初回以外で変更があれば
          画面を自動更新
        */

        if (
            changed &&
            !firstLoad
        ) {

            renderAll();

            if (!silent) {

                showToast(
                    "予定を最新情報に更新しました"
                );

            }

        }


        return true;

    }

    catch (error) {

        console.error(
            "予定データ取得エラー",
            error
        );


        /*
          初回読み込み失敗時
        */

        if (firstLoad) {

            showLoadError();

        }


        return false;

    }

}


/* =========================================================
   5. イベントデータ正規化

   Ver5では基本的に

   date: "2026-07-26"

   を使用する。

   ただし旧Ver4の

   year
   month
   date: 26

   形式も読み込めるようにする。
   ========================================================= */

function normalizeEvent(event) {

    if (
        !event ||
        typeof event !== "object"
    ) {

        return null;

    }


    let year;
    let month;
    let day;


    /*
      新Ver5形式

      date:
      "2026-07-26"
    */

    if (
        typeof event.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            event.date
        )
    ) {

        const parts =
            event.date.split("-");

        year =
            Number(parts[0]);

        month =
            Number(parts[1]);

        day =
            Number(parts[2]);

    }

    /*
      旧Ver4形式

      year: 2026
      month: 7
      date: 26
    */

    else if (
        Number.isFinite(
            Number(event.year)
        ) &&
        Number.isFinite(
            Number(event.month)
        ) &&
        Number.isFinite(
            Number(event.date)
        )
    ) {

        year =
            Number(event.year);

        month =
            Number(event.month);

        day =
            Number(event.date);

    }

    else {

        return null;

    }


    const startTime =
        event.startTime ||
        event.time ||
        "";


    const endTime =
        event.endTime ||
        "";


    const zoomUrl =
        event.zoomUrl ||
        event.zoom ||
        event.url ||
        "";


    const program =
        Array.isArray(event.program)
            ? event.program
            : [];


    return {

        ...event,

        id:
            event.id ||
            createFallbackId(
                year,
                month,
                day,
                startTime,
                event.title
            ),

        year,

        month,

        day,

        date:
            createDateString(
                year,
                month,
                day
            ),

        startTime,

        endTime,

        zoomUrl,

        title:
            event.title ||
            "名称未設定",

        shortTitle:
            event.shortTitle ||
            event.title ||
            "予定",

        image:
            event.image ||
            "",

        color:
            event.color ||
            "#247447",

        category:
            event.category ||
            "",

        program

    };

}


/* =========================================================
   6. フォールバックID
   ========================================================= */

function createFallbackId(
    year,
    month,
    day,
    time,
    title
) {

    return [
        year,
        month,
        day,
        time,
        title || ""
    ].join("-");

}


/* =========================================================
   7. データ変更判定
   ========================================================= */

function createDataSignature(data) {

    try {

        return JSON.stringify(data);

    }

    catch {

        return String(Date.now());

    }

}


/* =========================================================
   8. 全画面再描画
   ========================================================= */

function renderAll() {

    renderTodayEvents();

    renderNextEvent();

    renderWeekEvents();

    renderScheduleList();

    renderCalendar();


}


/* =========================================================
   9. 今日のZoom
   ========================================================= */

function renderTodayEvents() {

    if (!todayEventElement) {

        return;

    }


    const now =
        new Date();


    const todayEvents =
        events.filter(event => {

            return isSameDate(
                event,
                now
            );

        });


    todayEventElement.innerHTML =
        "";


    if (
        todayEvents.length === 0
    ) {

        todayEventElement.innerHTML = `

            <div class="empty-message">

                今日のZoomはありません

            </div>

        `;

        return;

    }


    todayEvents
        .sort(compareEvents)
        .forEach(event => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "today-event";


            card.innerHTML = `

                <div class="today-event-time">

                    ${escapeHTML(
                        formatEventTime(event)
                    )}

                </div>

                <div class="today-event-title">

                    ${escapeHTML(
                        event.title
                    )}

                </div>

                ${createQuickZoomButton(
                    event
                )}

            `;


            /*
              カード本体クリックで詳細
            */

            card.addEventListener(
                "click",
                eventObject => {

                    /*
                      Zoomボタンを押した時は
                      モーダルを開かない
                    */

                    if (
                        eventObject.target.closest(
                            ".quick-zoom-button"
                        )
                    ) {

                        return;

                    }

                    openEventModal(event);

                }
            );


            todayEventElement
                .appendChild(card);

        });

}


/* =========================================================
   10. 次回Zoom
   ========================================================= */

function renderNextEvent() {

    if (!nextEventElement) {

        return;

    }


    const now =
        new Date();


    /*
      「次回」は
      現在時刻より後のイベント

      開催中イベントは
      終了時間がまだなら対象にする
    */

    const futureEvents =
        events
            .filter(event => {

                const endDate =
                    getEventEndDate(event);

                return endDate >= now;

            })
            .sort(compareEvents);


    nextEventElement.innerHTML =
        "";


    if (
        futureEvents.length === 0
    ) {

        nextEventElement.innerHTML = `

            <div class="empty-message">

                次回の予定はありません

            </div>

        `;

        return;

    }


    /*
      今日のイベントがある場合でも
      「次回Zoom」には
      現在または次のイベントを表示
    */

    const event =
        futureEvents[0];


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "next-event";


    card.innerHTML = `

        <div class="next-event-date">

            ${escapeHTML(
                formatJapaneseDate(event)
            )}

        </div>

        <div class="next-event-time">

            ${escapeHTML(
                formatEventTime(event)
            )}

        </div>

        <div class="next-event-title">

            ${escapeHTML(
                event.title
            )}

        </div>

        ${createQuickZoomButton(
            event
        )}

    `;


    card.addEventListener(
        "click",
        eventObject => {

            if (
                eventObject.target.closest(
                    ".quick-zoom-button"
                )
            ) {

                return;

            }

            openEventModal(event);

        }
    );


    nextEventElement
        .appendChild(card);

}


/* =========================================================
   11. 今週の予定

   「今日を含めて7日間」

   例：
   7月21日に確認

   7月21日〜7月27日
   ========================================================= */

function renderWeekEvents() {

    if (!weekEventsElement) {

        return;

    }


    const start =
        startOfDay(
            new Date()
        );


    const end =
        new Date(start);

    end.setDate(
        end.getDate() + 6
    );

    end.setHours(
        23,
        59,
        59,
        999
    );


    const weekEvents =
        events
            .filter(event => {

                const eventDate =
                    getEventStartDate(
                        event
                    );

                return (
                    eventDate >= start &&
                    eventDate <= end
                );

            })
            .sort(compareEvents);


    weekEventsElement.innerHTML =
        "";


    if (
        weekEvents.length === 0
    ) {

        weekEventsElement.innerHTML = `

            <div class="empty-message">

                7日以内の予定はありません

            </div>

        `;

        return;

    }


    weekEvents.forEach(event => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "week-event";


        item.innerHTML = `

            <div class="week-event-date">

                ${escapeHTML(
                    formatShortDate(event)
                )}

            </div>

            <div class="week-event-info">

                <div class="week-event-time">

                    ${escapeHTML(
                        formatEventTime(event)
                    )}

                </div>

                <div class="week-event-title">

                    ${escapeHTML(
                        event.title
                    )}

                </div>

            </div>

        `;


        item.addEventListener(
            "click",
            () => {

                openEventModal(event);

            }
        );


        weekEventsElement
            .appendChild(item);

    });

}


/* =========================================================
   12. カレンダー
   月曜日始まり
   ========================================================= */

function renderCalendar() {

    if (
        !calendarElement ||
        !monthTitleElement
    ) {

        return;

    }


    calendarElement.innerHTML =
        "";


    monthTitleElement.textContent =
        `${currentYear}年 ${currentMonth}月`;


    /*
      月初
    */

    const firstDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );


    /*
      日曜0 → 月曜始まりへ変換

      月曜 = 0
      火曜 = 1
      ...
      日曜 = 6
    */

    const firstWeekIndex =
        firstDate.getDay() === 0
            ? 6
            : firstDate.getDay() - 1;


    /*
      表示開始日

      月初を含む週の月曜日
    */

    const calendarStart =
        new Date(firstDate);

    calendarStart.setDate(
        firstDate.getDate() -
        firstWeekIndex
    );


    /*
      6週間分表示
      42マス
    */

    for (
        let index = 0;
        index < 42;
        index++
    ) {

        const cellDate =
            new Date(
                calendarStart
            );

        cellDate.setDate(
            calendarStart.getDate() +
            index
        );


        const cell =
            createCalendarDay(
                cellDate
            );


        calendarElement
            .appendChild(cell);

    }

}


/* =========================================================
   13. カレンダー1日分
   ========================================================= */

function createCalendarDay(
    date
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "calendar-day";


    /*
      他月
    */

    if (
        date.getMonth() + 1 !==
        currentMonth
    ) {

        cell.classList.add(
            "other-month"
        );

    }


    /*
      今日
    */

    if (
        isSameActualDate(
            date,
            new Date()
        )
    ) {

        cell.classList.add(
            "today"
        );

    }


    /*
      土日
    */

    if (
        date.getDay() === 6
    ) {

        cell.classList.add(
            "saturday"
        );

    }


    if (
        date.getDay() === 0
    ) {

        cell.classList.add(
            "sunday"
        );

    }


    /*
      日付
    */

    const dateNumber =
        document.createElement(
            "div"
        );

    dateNumber.className =
        "calendar-date";

    dateNumber.textContent =
        date.getDate();


    cell.appendChild(
        dateNumber
    );


    /*
      この日のイベント
    */

    const dayEvents =
        getEventsForDate(date);


    if (
        dayEvents.length > 0
    ) {

        const container =
            document.createElement(
                "div"
            );

        container.className =
            "calendar-events";


        dayEvents
            .sort(compareEvents)
            .forEach(event => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";

                button.className =
                    "calendar-event";

                button.style.backgroundColor =
                    event.color ||
                    "#247447";


                button.innerHTML = `

                    <span class="calendar-event-time">

                        ${escapeHTML(
                            event.startTime
                        )}

                    </span>

                    <span class="calendar-event-title">

                        ${escapeHTML(
                            event.shortTitle
                        )}

                    </span>

                `;


                button.addEventListener(
                    "click",
                    eventObject => {

                        eventObject
                            .stopPropagation();

                        openEventModal(
                            event
                        );

                    }
                );


                container.appendChild(
                    button
                );

            });


        cell.appendChild(
            container
        );

    }


    /*
      日付自体をクリック

      その日に1件だけなら詳細を開く
      複数なら最初の予定を開く

      後で必要なら
      「その日の予定一覧」に変更可能
    */

    if (
        dayEvents.length > 0
    ) {

        cell.style.cursor =
            "pointer";


        cell.addEventListener(
            "click",
            () => {

                openEventModal(
                    dayEvents[0]
                );

            }
        );

    }


    return cell;

}


/* =========================================================
   14. 指定日のイベント取得
   ========================================================= */

function getEventsForDate(date) {

    return events.filter(event => {

        return (
            event.year ===
                date.getFullYear() &&

            event.month ===
                date.getMonth() + 1 &&

            event.day ===
                date.getDate()
        );

    });

}


/* =========================================================
   15. イベント詳細モーダル
   ========================================================= */

function openEventModal(event) {

    if (
        !eventModal ||
        !eventDetail ||
        !eventImageArea
    ) {

        return;

    }


    /*
      画像

      画像がある場合のみ表示。

      imageが空なら
      HTML自体を作らないため
      空白も発生しない。
    */

    eventImageArea.innerHTML =
        "";


    if (
        event.image &&
        event.image.trim() !== ""
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.className =
            "event-detail-image";

        image.src =
            addImageCacheBuster(
                event.image
            );

        image.alt =
            event.title;

        image.loading =
            "eager";


        /*
          画像取得失敗時も
          壊れた画像アイコンを
          表示しない
        */

        image.addEventListener(
            "error",
            () => {

                eventImageArea
                    .innerHTML = "";

            }
        );


        eventImageArea
            .appendChild(image);

    }


    /*
      詳細
    */

    eventDetail.innerHTML = `

        <h2 class="detail-title">

            ${escapeHTML(
                event.title
            )}

        </h2>

        <div class="detail-date">

            📅
            ${escapeHTML(
                formatJapaneseDate(event)
            )}

        </div>

        <div class="detail-time">

            🕒
            ${escapeHTML(
                formatEventTime(event)
            )}

        </div>

        ${createProgramHTML(event)}

        ${createDetailZoomButton(event)}

    `;


    /*
      表示
    */

    eventModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   16. プログラム表示

   program例

   [
      {
         "time": "13:00",
         "title": "ナビゲーター",
         "person": "豊島玲子さん"
      }
   ]
   ========================================================= */

function createProgramHTML(event) {

    if (
        !Array.isArray(
            event.program
        ) ||
        event.program.length === 0
    ) {

        return "";

    }


    const items =
        event.program
            .map(item => {

                if (!item) {

                    return "";

                }


                const time =
                    item.time
                        ? `

                            <div class="program-time">

                                ${escapeHTML(
                                    item.time
                                )}

                            </div>

                        `
                        : "";


                const title =
                    item.title
                        ? `

                            <div class="program-heading">

                                ⭐
                                ${escapeHTML(
                                    item.title
                                )}

                            </div>

                        `
                        : "";


                const person =
                    item.person
                        ? `

                            <div class="program-person">

                                ${escapeHTML(
                                    item.person
                                )}

                            </div>

                        `
                        : "";


                return `

                    <div class="program-item">

                        ${time}

                        ${title}

                        ${person}

                    </div>

                `;

            })
            .join("");


    return `

        <div class="detail-program">

            <h3 class="detail-program-title">

                📋 催事スケジュール

            </h3>

            ${items}

        </div>

    `;

}


/* =========================================================
   17. 詳細Zoomボタン
   ========================================================= */

function createDetailZoomButton(
    event
) {

    if (
        !event.zoomUrl ||
        event.zoomUrl.trim() === ""
    ) {

        return `

            <div class="zoom-unavailable">

                Zoom URLはまだ登録されていません

            </div>

        `;

    }


    return `

        <a
            class="zoom-button"
            href="${escapeAttribute(
                event.zoomUrl
            )}"
            target="_blank"
            rel="noopener noreferrer"
        >

            Zoomに参加

        </a>

    `;

}


/* =========================================================
   18. ホーム用Zoomボタン
   ========================================================= */

function createQuickZoomButton(
    event
) {

    if (
        !event.zoomUrl ||
        event.zoomUrl.trim() === ""
    ) {

        return "";

    }


    return `

        <a
            class="quick-zoom-button"
            href="${escapeAttribute(
                event.zoomUrl
            )}"
            target="_blank"
            rel="noopener noreferrer"
        >

            Zoomに参加

        </a>

    `;

}


/* =========================================================
   19. モーダルを閉じる
   ========================================================= */

function closeEventModal() {

    if (!eventModal) {

        return;

    }


    eventModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   20. イベントリスナー
   ========================================================= */

function setupEventListeners() {

    /*
      前月
    */

    if (prevMonthButton) {

        prevMonthButton.addEventListener(
            "click",
            () => {

                currentMonth--;

                if (
                    currentMonth < 1
                ) {

                    currentMonth = 12;

                    currentYear--;

                }

                renderCalendar();

            }
        );

    }


    /*
      翌月
    */

    if (nextMonthButton) {

        nextMonthButton.addEventListener(
            "click",
            () => {

                currentMonth++;

                if (
                    currentMonth > 12
                ) {

                    currentMonth = 1;

                    currentYear++;

                }

                renderCalendar();

            }
        );

    }


    /*
      ×
    */

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeEventModal
        );

    }


    /*
      モーダル外側
    */

    if (eventModal) {

        eventModal.addEventListener(
            "click",
            eventObject => {

                if (
                    eventObject.target ===
                    eventModal
                ) {

                    closeEventModal();

                }

            }
        );

    }


    /*
      ESC
    */

    document.addEventListener(
        "keydown",
        eventObject => {

            if (
                eventObject.key ===
                "Escape"
            ) {

                closeEventModal();

            }

        }
    );


    /*
      iPhone PWAなどで
      アプリを再表示した時

      即座に最新データ確認
    */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                !document.hidden
            ) {

                refreshLatestData();

            }

        }
    );


    /*
      ブラウザに戻ってきた時
    */

    window.addEventListener(
        "pageshow",
        () => {

            refreshLatestData();

        }
    );


    /*
      オフラインから
      オンライン復帰
    */

    window.addEventListener(
        "online",
        () => {

            refreshLatestData();

            showToast(
                "通信が復旧しました"
            );

        }
    );

}


/* =========================================================
   21. 自動更新

   30秒ごとに
   events.jsonを確認
   ========================================================= */

function startAutoRefresh() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );

    }


    refreshTimer =
        setInterval(

            refreshLatestData,

            UPDATE_INTERVAL

        );

}


/* =========================================================
   22. 最新データ確認
   ========================================================= */

async function refreshLatestData() {

    /*
      非表示中は無駄な通信をしない

      再表示した瞬間に
      visibilitychangeで確認する
    */

    if (
        document.hidden
    ) {

        return;

    }


    await loadEvents({
        firstLoad: false,
        silent: false
    });

}


/* =========================================================
   23. Service Worker

   iPhone PWA対策

   新しいservice-workerが
   待機状態になった場合は
   自動で切り替える
   ========================================================= */

async function registerServiceWorker() {

    if (
        !(
            "serviceWorker"
            in navigator
        )
    ) {

        return;

    }


    try {

        const registration =
            await navigator
                .serviceWorker
                .register(
                    "./service-worker.js",
                    {
                        updateViaCache:
                            "none"
                    }
                );


        /*
          起動時に更新確認
        */

        registration.update();


        /*
          新しいService Worker検出
        */

        registration.addEventListener(
            "updatefound",
            () => {

                const newWorker =
                    registration.installing;


                if (!newWorker) {

                    return;

                }


                newWorker.addEventListener(
                    "statechange",
                    () => {

                        if (
                            newWorker.state ===
                                "installed" &&

                            navigator
                                .serviceWorker
                                .controller
                        ) {

                            /*
                              新版を即有効化
                            */

                            newWorker.postMessage({
                                type:
                                    "SKIP_WAITING"
                            });

                        }

                    }
                );

            }
        );


        /*
          Service Workerが
          新版へ切り替わったら

          1回だけページ更新
        */

        let refreshing =
            false;


        navigator
            .serviceWorker
            .addEventListener(
                "controllerchange",
                () => {

                    if (refreshing) {

                        return;

                    }

                    refreshing =
                        true;

                    window.location.reload();

                }
            );

    }

    catch (error) {

        console.error(
            "Service Worker登録失敗",
            error
        );

    }

}


/* =========================================================
   24. イベント開始日時
   ========================================================= */

function getEventStartDate(event) {

    const [
        hour,
        minute
    ] =
        parseTime(
            event.startTime
        );


    return new Date(
        event.year,
        event.month - 1,
        event.day,
        hour,
        minute,
        0,
        0
    );

}


/* =========================================================
   25. イベント終了日時
   ========================================================= */

function getEventEndDate(event) {

    /*
      終了時間あり
    */

    if (
        event.endTime
    ) {

        const [
            hour,
            minute
        ] =
            parseTime(
                event.endTime
            );


        return new Date(
            event.year,
            event.month - 1,
            event.day,
            hour,
            minute,
            59,
            999
        );

    }


    /*
      終了時間なしの場合

      開始時刻から2時間を
      仮の終了として扱う
    */

    const start =
        getEventStartDate(
            event
        );


    return new Date(
        start.getTime() +
        2 * 60 * 60 * 1000
    );

}


/* =========================================================
   26. 時刻解析
   ========================================================= */

function parseTime(time) {

    if (
        !time ||
        typeof time !== "string"
    ) {

        return [
            0,
            0
        ];

    }


    const parts =
        time.split(":");


    return [

        Number(parts[0]) || 0,

        Number(parts[1]) || 0

    ];

}


/* =========================================================
   27. イベント並び替え
   ========================================================= */

function compareEvents(a, b) {

    return (
        getEventStartDate(a) -
        getEventStartDate(b)
    );

}


/* =========================================================
   28. 今日判定
   ========================================================= */

function isSameDate(
    event,
    date
) {

    return (

        event.year ===
            date.getFullYear() &&

        event.month ===
            date.getMonth() + 1 &&

        event.day ===
            date.getDate()

    );

}


/* =========================================================
   29. Date同士の日付比較
   ========================================================= */

function isSameActualDate(
    a,
    b
) {

    return (

        a.getFullYear() ===
            b.getFullYear() &&

        a.getMonth() ===
            b.getMonth() &&

        a.getDate() ===
            b.getDate()

    );

}


/* =========================================================
   30. その日の0時
   ========================================================= */

function startOfDay(date) {

    const result =
        new Date(date);


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;

}


/* =========================================================
   31. YYYY-MM-DD
   ========================================================= */

function createDateString(
    year,
    month,
    day
) {

    return (

        String(year) +

        "-" +

        String(month)
            .padStart(
                2,
                "0"
            ) +

        "-" +

        String(day)
            .padStart(
                2,
                "0"
            )

    );

}


/* =========================================================
   32. 日付表示
   ========================================================= */

function formatJapaneseDate(event) {

    const date =
        new Date(
            event.year,
            event.month - 1,
            event.day
        );


    const weekdays = [

        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"

    ];


    return (

        `${event.year}年` +

        `${event.month}月` +

        `${event.day}日` +

        `（${weekdays[
            date.getDay()
        ]}）`

    );

}


/* =========================================================
   33. 今週用日付
   ========================================================= */

function formatShortDate(event) {

    const date =
        new Date(
            event.year,
            event.month - 1,
            event.day
        );


    const weekdays = [

        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"

    ];


    return (

        `${event.month}/${event.day}` +

        `（${weekdays[
            date.getDay()
        ]}）`

    );

}


/* =========================================================
   34. 時間表示
   ========================================================= */

function formatEventTime(event) {

    if (
        event.startTime &&
        event.endTime
    ) {

        return (

            `${event.startTime}` +

            `〜` +

            `${event.endTime}`

        );

    }


    if (
        event.startTime
    ) {

        return event.startTime;

    }


    return "時間未定";

}


/* =========================================================
   35. 画像キャッシュ対策

   同じファイル名の画像を
   GitHub側で差し替えても

   古い画像が残りにくくする
   ========================================================= */

function addImageCacheBuster(
    imageUrl
) {

    if (!imageUrl) {

        return "";

    }


    const separator =
        imageUrl.includes("?")
            ? "&"
            : "?";


    return (

        imageUrl +

        separator +

        "v=" +

        Date.now()

    );

}


/* =========================================================
   36. 更新通知
   ========================================================= */

let toastTimer = null;


function showToast(message) {

    if (!updateToast) {

        return;

    }


    updateToast.textContent =
        message;


    updateToast.classList.remove(
        "hidden"
    );


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        setTimeout(
            () => {

                updateToast
                    .classList
                    .add(
                        "hidden"
                    );

            },
            3500
        );

}


/* =========================================================
   37. 読み込み失敗
   ========================================================= */

function showLoadError() {

    const errorHTML = `

        <div class="empty-message">

            予定を読み込めませんでした。

            <br>

            インターネット接続を確認して
            もう一度開いてください。

        </div>

    `;


    if (todayEventElement) {

        todayEventElement.innerHTML =
            errorHTML;

    }


    if (nextEventElement) {

        nextEventElement.innerHTML =
            errorHTML;

    }


    if (weekEventsElement) {

        weekEventsElement.innerHTML =
            errorHTML;

    }

}


/* =========================================================
   38. HTMLエスケープ
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   39. HTML属性エスケープ
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);

}

function renderScheduleList(){

    const area =
    document.getElementById(
        "scheduleList"
    );

    if(!area){
        return;
    }


    area.innerHTML="";


    events
    .sort(compareEvents)
    .forEach(event=>{


        const div =
        document.createElement("div");


        div.className =
        "schedule-card";


        div.innerHTML = `

        <div class="schedule-date">

        ${formatJapaneseDate(event)}

        </div>


        <div class="schedule-time">

        🕒 ${event.startTime}

        </div>


        <div class="schedule-title">

        ${escapeHTML(event.title)}

        </div>

        `;


        div.onclick = ()=>{

            openEventModal(event);

        };


        area.appendChild(div);


    });


}