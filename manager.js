// =====================================
// ERINA 管理画面
// manager.js Ver2.0 Part1/3
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
const addEventButton = document.getElementById("addEventButton");

const imageUpload = document.getElementById("imageUpload");
const uploadImageButton = document.getElementById("uploadImageButton");


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

    if(password.value === ADMIN_PASSWORD){

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


        eventList.innerHTML += `


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


    editingIndex = index;


    const e = events[index];


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
// 削除
// ------------------------------

function deleteEvent(index){


    const e = events[index];


    const result = confirm(

        `${e.title}\n\nこのイベントを削除しますか？`

    );


    if(!result){

        return;

    }


    events.splice(index,1);



    editingIndex=null;


    editor.style.display="none";



    loadEventList();



    saveEventsToGitHub();


}
// ------------------------------
// 保存
// ------------------------------

saveButton.addEventListener("click",()=>{


    const newEvent = {


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



    // 新規追加

    if(editingIndex === null){


        events.push(newEvent);



    }else{


        // 編集更新

        events[editingIndex] = newEvent;


    }



    loadEventList();


    saveEventsToGitHub();



});




// ------------------------------
// 新しいイベント追加
// ------------------------------

addEventButton.addEventListener("click",()=>{


    editingIndex = null;


    editor.style.display="block";



    editYear.value = new Date().getFullYear();


    editMonth.value = new Date().getMonth()+1;


    editDate.value = new Date().getDate();



    editTime.value="";


    editEndTime.value="";



    editTitle.value="";


    editShortTitle.value="";



    editImage.value="";


    editUrl.value="";



    editColor.value="#ff69b4";


    editCategory.value="";



    editor.scrollIntoView({

        behavior:"smooth"

    });



});





// ------------------------------
// GitHub保存
// ------------------------------

async function saveEventsToGitHub(){


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


}
// ------------------------------
// イベント複製
// ------------------------------

function duplicateEvent(index){


    const original = events[index];


    const copy = {


        year: original.year,


        month: original.month,


        date: original.date,


        time: original.time,


        endTime: original.endTime || "",



        title: original.title + "（コピー）",


        shortTitle: original.shortTitle || "",



        image: original.image || "",


        url: original.url || "",



        color: original.color || "#ff69b4",


        category: original.category || ""


    };



    // コピー追加

    events.push(copy);



    // 一覧更新

    loadEventList();



    // 追加したイベントを編集状態へ

    editingIndex = events.length - 1;



    editEvent(editingIndex);



}
// ------------------------------
// 画像アップロード
// ------------------------------

uploadImageButton.addEventListener("click", async()=>{


    const file = imageUpload.files[0];


    if(!file){

        alert("画像を選択してください");

        return;

    }



    const reader = new FileReader();



    reader.onload = async()=>{


        const base64 = reader.result.split(",")[1];



        try{


            const response = await fetch(

                "https://erina-manager.tomoya19980427goku.workers.dev/",

                {

                    method:"POST",

                    headers:{

                        "Content-Type":"application/json"

                    },


                    body:JSON.stringify({

                        type:"image",

                        filename:file.name,

                        content:base64

                    })

                }

            );



            const result = await response.json();



            if(result.success){


                editImage.value = result.url;


                alert("画像アップロードしました！");


            }else{


                alert(

                    "アップロード失敗\n"+

                    result.error

                );


            }



        }catch(error){


            alert(

                "通信エラー\n"+

                error

            );


        }


    };



    reader.readAsDataURL(file);



});