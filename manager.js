// =====================================
// ERINA 管理画面
// manager.js Part①
// =====================================

// ------------------------------
// パスワード
// ------------------------------

const ADMIN_PASSWORD = "Tera0427";

// ------------------------------
// HTML取得
// ------------------------------

const loginArea = document.getElementById("loginArea");
const adminArea = document.getElementById("adminArea");

const password = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const eventList = document.getElementById("eventList");

const editor = document.getElementById("editor");

const editYear = document.getElementById("editYear");
const editMonth = document.getElementById("editMonth");
const editDate = document.getElementById("editDate");

const editTime = document.getElementById("editTime");
const editEndTime = document.getElementById("editEndTime");

const editTitle = document.getElementById("editTitle");
const editShortTitle = document.getElementById("editShortTitle");

const editImage = document.getElementById("editImage");
const editUrl = document.getElementById("editUrl");

const editColor = document.getElementById("editColor");
const editCategory = document.getElementById("editCategory");

const saveButton = document.getElementById("saveButton");

// 編集中イベント番号
let editingIndex = null;

// ------------------------------
// ログイン
// ------------------------------

loginButton.addEventListener("click", login);

password.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        login();

    }

});

function login(){

    if(password.value===ADMIN_PASSWORD){

        loginArea.style.display="none";
        adminArea.style.display="block";

        loadEventList();

    }else{

        loginMessage.textContent="パスワードが違います。";
        loginMessage.style.color="red";

    }

}

// ------------------------------
// イベント一覧
// ------------------------------

function loadEventList(){

    eventList.innerHTML="";

    events.forEach((e,index)=>{

        eventList.innerHTML+=`

        <div class="card" style="margin-bottom:15px;">

            <strong>

                ${e.month}/${e.date}

                ${e.time}

            </strong>

            <br>

            ${e.title}

            <br><br>

            <button onclick="editEvent(${index})">

                ✏ 編集

            </button>

            <button onclick="duplicateEvent(${index})">

                📄 複製

            </button>

            <button onclick="deleteEvent(${index})">

                🗑 削除

            </button>

        </div>

        `;

    });

}

// ------------------------------
// 編集
// ------------------------------

function editEvent(index){

    editingIndex=index;

    const e=events[index];

    editor.style.display="block";

    editYear.value=e.year;
    editMonth.value=e.month;
    editDate.value=e.date;

    editTime.value=e.time;
    editEndTime.value=e.endTime || "";

    editTitle.value=e.title;
    editShortTitle.value=e.shortTitle || "";

    editImage.value=e.image || "";
    editUrl.value=e.url || "";

    editColor.value=e.color || "#ff69b4";

    editCategory.value=e.category || "";

    editor.scrollIntoView({

        behavior:"smooth"

    });

}

// ------------------------------
// 仮機能
// ------------------------------

function duplicateEvent(index){

    alert("Part②で作ります。");

}

function deleteEvent(index){

    alert("Part②で作ります。");

}

// ------------------------------
// 保存
// ------------------------------

saveButton.addEventListener("click", async()=>{


    if(editingIndex === null){

        alert("編集するイベントを選択してください");

        return;

    }


    // 編集内容を反映

    events[editingIndex] = {

        year:Number(editYear.value),

        month:Number(editMonth.value),

        date:Number(editDate.value),

        time:editTime.value,

        endTime:editEndTime.value,


        title:editTitle.value,

        shortTitle:editShortTitle.value,


        image:editImage.value,

        url:editUrl.value,


        color:editColor.value,

        category:editCategory.value

    };


    // Workerへ送信

    try{


        const response = await fetch(
            "https://erina-manager.tomoya19980427goku.workers.dev/",
            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    events:events

                })

            }
        );


        const result = await response.json();



        if(result.success){


            alert("保存しました！");


            loadEventList();


        }else{


            alert(
                "保存失敗\n"+
                result.error
            );


        }


    }catch(error){


        alert(
            "通信エラー\n"+
            error
        );


    }


});