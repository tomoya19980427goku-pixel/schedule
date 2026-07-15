// 今日の日付
const today = new Date();

// 現在の年月
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

// 表示する年月
let year = currentYear;
let month = currentMonth;

// =======================
// 2026年7月
// =======================

const julyEvents = [

    {
        month:7,
        date:11,
        time:"18:00",
        title:"💃 ワンコインダンス",
        url:"https://us06web.zoom.us/j/84128790586?pwd=5aqt5DJuxRTDKkn4kmaiRJ9FwcbC9v.1",
        color:"#9b59b6"
    },

    {
        month:7,
        date:12,
        time:"13:00",
        title:"💻 ミナソンクラブ",
        url:"https://us06web.zoom.us/j/88446459111?pwd=tkdvedhEoE5jn8F1TFc5YCxavxlY94.1",
        color:"#3498db"
    },

    {
        month:7,
        date:13,
        time:"12:00",
        title:"📻 FMなまず",
        url:"https://us06web.zoom.us/j/81820363801?pwd=o8kVMT44mpZi4S4ENQw6nIPxfUPRgv.1",
        color:"#f39c12"
    },

    {
        month:7,
        date:15,
        time:"13:00",
        title:"🍒 平日チェリーライブ",
        url:"https://us06web.zoom.us/j/88284911920?pwd=TPXNsyIFr0l814b5QC2mgtDva1AVIx.1",
        color:"#e74c3c"
    },

    {
        month:7,
        date:20,
        time:"12:00",
        title:"📻 FMなまず",
        url:"",
        color:"#f39c12"
    },

    {
        month:7,
        date:24,
        time:"13:00",
        title:"💻 佐賀オンラインセミナー",
        url:"",
        color:"#3498db"
    },

    {
        month:7,
        date:26,
        time:"13:00",
        title:"🍒 休日チェリーライブ",
        url:"",
        color:"#e74c3c"
    },

    {
        month:7,
        date:27,
        time:"19:00",
        title:"📻 ナイトFMなまず",
        url:"",
        color:"#f39c12"
    },

    {
        month:7,
        date:28,
        time:"19:00",
        title:"💻 竹の子族",
        url:"",
        color:"#3498db"
    },

    {
        month:7,
        date:29,
        time:"13:00",
        title:"🌸 サクラ咲く会",
        url:"",
        color:"#ff69b4"
    },

    {
        month:7,
        date:29,
        time:"20:00",
        title:"🧘 ヨガチャンネル",
        url:"",
        color:"#27ae60"
    },

    {
        month:7,
        date:31,
        time:"19:00",
        title:"🧪 理科の実験チャンネル",
        url:"",
        color:"#16a085"
    }

];

// =======================
// 2026年8月
// =======================

const augustEvents = [

    {
        month:8,
        date:1,
        time:"11:00",
        title:"💻 寺子屋チャンネル",
        url:"",
        color:"#3498db"
    },

    {
        month:8,
        date:3,
        time:"13:00",
        title:"💻 のびしろの会",
        url:"",
        color:"#3498db"
    },

    {
        month:8,
        date:3,
        time:"19:00",
        title:"📻 ナイトFM",
        url:"",
        color:"#f39c12"
    },

    {
        month:8,
        date:4,
        time:"19:00",
        title:"💻 竹の子族",
        url:"",
        color:"#3498db"
    },

    {
        month:8,
        date:9,
        time:"13:00",
        title:"🌸 サクラ咲く会",
        url:"",
        color:"#ff69b4"
    },

    {
        month:8,
        date:10,
        time:"12:00",
        title:"📻 FMなまず",
        url:"",
        color:"#f39c12"
    },

    {
        month:8,
        date:12,
        time:"13:00",
        title:"🍒 チェリーライブ",
        url:"",
        color:"#e74c3c"
    },

    {
        month:8,
        date:15,
        time:"13:00",
        title:"💃 ワンコインダンス",
        url:"",
        color:"#9b59b6"
    },

    {
        month:8,
        date:16,
        time:"13:00",
        title:"💻 ミナソンチャンネル",
        url:"",
        color:"#3498db"
    },

    {
        month:8,
        date:17,
        time:"12:00",
        title:"📻 FMなまず",
        url:"",
        color:"#f39c12"
    },

    {
        month:8,
        date:17,
        time:"20:00",
        title:"🤸 アスカストレッチ",
        url:"",
        color:"#f1c40f"
    },

    {
        month:8,
        date:21,
        time:"13:00",
        title:"💻 佐賀オンラインセミナー",
        url:"",
        color:"#3498db"
    },

    {
        month:8,
        date:24,
        time:"13:00",
        title:"🍒 チェリーライブ",
        url:"",
        color:"#e74c3c"
    },

    {
        month:8,
        date:25,
        time:"19:00",
        title:"💻 竹の子族",
        url:"",
        color:"#3498db"
    },

    {
        month:8,
        date:26,
        time:"13:00",
        title:"🌸 サクラ咲く会",
        url:"",
        color:"#ff69b4"
    },

    {
        month:8,
        date:26,
        time:"20:00",
        title:"🧘 ヨガチャンネル",
        url:"",
        color:"#27ae60"
    },

    {
        month:8,
        date:30,
        time:"13:00",
        title:"📻 FMなまず",
        url:"",
        color:"#f39c12"
    },

    {
        month:8,
        date:31,
        time:"19:00",
        title:"🧪 理科の実験チャンネル",
        url:"",
        color:"#16a085"
    }

];

// =======================
// 全イベント
// =======================

const events = [
    ...julyEvents,
    ...augustEvents
];