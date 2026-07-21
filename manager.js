"use strict";

/* =========================================================
   ERINA Zoom Schedule Ver5
   manager.js
   ========================================================= */


/* =========================================================
   1. 設定
   ========================================================= */

/*
  後で現在使用中のCloudflare Worker URLに変更します。

  例：
  https://xxxxx.xxxxx.workers.dev
*/

const WORKER_URL =
    "https://erina-manager.tomoya19980427goku.workers.dev";


/*
  公開側のevents.json

  キャッシュを避けるため
  毎回 ?t= を付けて取得します。
*/

const EVENTS_URL =
    "data/events.json";


/* =========================================================
   2. データ
   ========================================================= */

let events = [];

let editingEventId = null;

let selectedImageFile = null;

let removeCurrentImage = false;


/* =========================================================
   3. DOM
   ========================================================= */

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const eventList =
    document.getElementById(
        "eventList"
    );

const editorPanel =
    document.getElementById(
        "editorPanel"
    );

const editorTitle =
    document.getElementById(
        "editorTitle"
    );


const eventIdInput =
    document.getElementById(
        "eventId"
    );

const titleInput =
    document.getElementById(
        "title"
    );

const shortTitleInput =
    document.getElementById(
        "shortTitle"
    );

const categoryInput =
    document.getElementById(
        "category"
    );

const eventDateInput =
    document.getElementById(
        "eventDate"
    );

const eventColorInput =
    document.getElementById(
        "eventColor"
    );

const startTimeInput =
    document.getElementById(
        "startTime"
    );

const endTimeInput =
    document.getElementById(
        "endTime"
    );

const zoomUrlInput =
    document.getElementById(
        "zoomUrl"
    );


const imageFileInput =
    document.getElementById(
        "imageFile"
    );

const imagePreviewArea =
    document.getElementById(
        "imagePreviewArea"
    );

const currentImageInput =
    document.getElementById(
        "currentImage"
    );


const programList =
    document.getElementById(
        "programList"
    );


const newEventButton =
    document.getElementById(
        "newEventButton"
    );

const reloadButton =
    document.getElementById(
        "reloadButton"
    );

const removeImageButton =
    document.getElementById(
        "removeImageButton"
    );

const addProgramButton =
    document.getElementById(
        "addProgramButton"
    );

const saveButton =
    document.getElementById(
        "saveButton"
    );

const deleteButton =
    document.getElementById(
        "deleteButton"
    );

const clearButton =
    document.getElementById(
        "clearButton"
    );


/* =========================================================
   4. 初期化
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeManager
);


async function initializeManager() {

    setupEventListeners();

    clearEditor();

    await loadEvents();

}


/* =========================================================
   5. イベント設定
   ========================================================= */

function setupEventListeners() {

    newEventButton.addEventListener(
        "click",
        () => {

            clearEditor();

            editorPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            titleInput.focus();

        }
    );


    reloadButton.addEventListener(
        "click",
        async () => {

            await loadEvents();

        }
    );


    imageFileInput.addEventListener(
        "change",
        handleImageSelection
    );


    removeImageButton.addEventListener(
        "click",
        removeImage
    );


    addProgramButton.addEventListener(
        "click",
        () => {

            addProgramEditor();

        }
    );


    saveButton.addEventListener(
        "click",
        saveEvent
    );


    deleteButton.addEventListener(
        "click",
        deleteCurrentEvent
    );


    clearButton.addEventListener(
        "click",
        clearEditor
    );

}


/* =========================================================
   6. events.json取得
   ========================================================= */

async function loadEvents() {

    showStatus(
        "最新データを読み込んでいます...",
        "loading"
    );


    try {

        const response =
            await fetch(
                `${EVENTS_URL}?t=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "events.jsonの形式が正しくありません"
            );

        }


        events =
            data.sort(
                compareEvents
            );


        renderEventList();


        showStatus(
            "最新データを読み込みました。",
            "success"
        );


        setTimeout(
            hideStatus,
            1800
        );

    }

    catch (error) {

        console.error(error);


        eventList.innerHTML = `

            <div>

                データを読み込めませんでした。

            </div>

        `;


        showStatus(
            "予定データを読み込めませんでした。",
            "error"
        );

    }

}


/* =========================================================
   7. イベント一覧
   ========================================================= */

function renderEventList() {

    eventList.innerHTML = "";


    if (
        events.length === 0
    ) {

        eventList.innerHTML = `

            <div>

                登録されている催事はありません。

            </div>

        `;

        return;

    }


    events.forEach(event => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "event-list-item";


        const information =
            document.createElement(
                "div"
            );


        information.innerHTML = `

            <div class="event-list-title">

                ${escapeHTML(
                    event.title || ""
                )}

            </div>

            <div class="event-list-date">

                ${escapeHTML(
                    event.date || ""
                )}

                ${escapeHTML(
                    event.startTime || ""
                )}

            </div>

        `;


        const buttons =
            document.createElement(
                "div"
            );


        buttons.className =
            "event-list-buttons";


        const editButton =
            document.createElement(
                "button"
            );


        editButton.type =
            "button";

        editButton.className =
            "button button-blue";

        editButton.textContent =
            "編集";


        editButton.addEventListener(
            "click",
            () => {

                editEvent(
                    event.id
                );

            }
        );


        buttons.appendChild(
            editButton
        );


        item.appendChild(
            information
        );

        item.appendChild(
            buttons
        );


        eventList.appendChild(
            item
        );

    });

}


/* =========================================================
   8. 新規・クリア
   ========================================================= */

function clearEditor() {

    editingEventId =
        null;

    selectedImageFile =
        null;

    removeCurrentImage =
        false;


    eventIdInput.value =
        "";

    titleInput.value =
        "";

    shortTitleInput.value =
        "";

    categoryInput.value =
        "";

    eventDateInput.value =
        "";

    eventColorInput.value =
        "#247447";

    startTimeInput.value =
        "";

    endTimeInput.value =
        "";

    zoomUrlInput.value =
        "";

    imageFileInput.value =
        "";

    currentImageInput.value =
        "";

    imagePreviewArea.innerHTML =
        "";

    programList.innerHTML =
        "";


    editorTitle.textContent =
        "➕ 新しい催事を追加";


    deleteButton.style.display =
        "none";

}


/* =========================================================
   9. 編集
   ========================================================= */

function editEvent(id) {

    const event =
        events.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!event) {

        showStatus(
            "催事が見つかりません。",
            "error"
        );

        return;

    }


    editingEventId =
        event.id;

    selectedImageFile =
        null;

    removeCurrentImage =
        false;


    eventIdInput.value =
        event.id || "";

    titleInput.value =
        event.title || "";

    shortTitleInput.value =
        event.shortTitle || "";

    categoryInput.value =
        event.category || "";

    eventDateInput.value =
        event.date || "";

    eventColorInput.value =
        event.color ||
        "#247447";

    startTimeInput.value =
        event.startTime || "";

    endTimeInput.value =
        event.endTime || "";

    zoomUrlInput.value =
        event.zoomUrl ||
        event.zoom ||
        event.url ||
        "";

    currentImageInput.value =
        event.image || "";

    imageFileInput.value =
        "";


    renderCurrentImage(
        event.image || ""
    );


    renderProgramEditors(
        event.program || []
    );


    editorTitle.textContent =
        "✏️ 催事を編集";


    deleteButton.style.display =
        "inline-block";


    editorPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   10. 現在の画像表示
   ========================================================= */

function renderCurrentImage(
    imagePath
) {

    imagePreviewArea.innerHTML =
        "";


    if (!imagePath) {

        return;

    }


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "image-preview";

    image.src =
        `${imagePath}?v=${Date.now()}`;

    image.alt =
        "現在の催事画像";


    const status =
        document.createElement(
            "div"
        );


    status.className =
        "image-status";

    status.textContent =
        "現在登録されている画像";


    imagePreviewArea.appendChild(
        image
    );

    imagePreviewArea.appendChild(
        status
    );

}


/* =========================================================
   11. 新しい画像選択
   ========================================================= */

function handleImageSelection() {

    const file =
        imageFileInput.files[0];


    if (!file) {

        selectedImageFile =
            null;

        return;

    }


    /*
      画像形式確認
    */

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "JPEG・PNG・WebP画像を選択してください。"
        );

        imageFileInput.value =
            "";

        return;

    }


    /*
      15MB制限
    */

    const maxSize =
        15 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        alert(
            "画像サイズが大きすぎます。15MB以下の画像を選択してください。"
        );

        imageFileInput.value =
            "";

        return;

    }


    selectedImageFile =
        file;

    removeCurrentImage =
        false;


    const reader =
        new FileReader();


    reader.onload =
        event => {

            imagePreviewArea.innerHTML =
                "";


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "image-preview";

            image.src =
                event.target.result;

            image.alt =
                "アップロード予定画像";


            const status =
                document.createElement(
                    "div"
                );


            status.className =
                "image-status";

            status.textContent =
                "この画像を保存時にアップロードします";


            imagePreviewArea
                .appendChild(image);

            imagePreviewArea
                .appendChild(status);

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   12. 画像削除
   ========================================================= */

function removeImage() {

    selectedImageFile =
        null;

    imageFileInput.value =
        "";

    imagePreviewArea.innerHTML =
        "";


    if (
        currentImageInput.value
    ) {

        removeCurrentImage =
            true;


        const status =
            document.createElement(
                "div"
            );


        status.className =
            "image-status";

        status.textContent =
            "保存すると現在の画像表示を削除します";


        imagePreviewArea.appendChild(
            status
        );

    }

    else {

        removeCurrentImage =
            false;

    }

}


/* =========================================================
   13. プログラム編集欄表示
   ========================================================= */

function renderProgramEditors(
    program
) {

    programList.innerHTML =
        "";


    if (
        !Array.isArray(program)
    ) {

        return;

    }


    program.forEach(item => {

        addProgramEditor(
            item
        );

    });

}


/* =========================================================
   14. プログラム項目追加
   ========================================================= */

function addProgramEditor(
    item = {}
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "program-editor-item";


    wrapper.innerHTML = `

        <div class="program-row">

            <div class="field">

                <label>
                    時間
                </label>

                <input
                    type="time"
                    class="program-time-input"
                    value="${escapeAttribute(
                        item.time || ""
                    )}"
                >

            </div>


            <div class="field">

                <label>
                    項目
                </label>

                <input
                    type="text"
                    class="program-title-input"
                    placeholder="例：ナビゲーター"
                    value="${escapeAttribute(
                        item.title || ""
                    )}"
                >

            </div>


            <div class="field">

                <label>
                    担当者・内容
                </label>

                <textarea
                    class="program-person-input"
                    placeholder="例：豊島玲子さん"
                >${escapeHTML(
                    item.person || ""
                )}</textarea>

            </div>

        </div>


        <div class="program-actions">

            <button
                type="button"
                class="button button-secondary move-up"
            >
                ↑ 上へ
            </button>

            <button
                type="button"
                class="button button-secondary move-down"
            >
                ↓ 下へ
            </button>

            <button
                type="button"
                class="button button-danger remove-program"
            >
                削除
            </button>

        </div>

    `;


    /*
      上へ
    */

    wrapper
        .querySelector(
            ".move-up"
        )
        .addEventListener(
            "click",
            () => {

                const previous =
                    wrapper.previousElementSibling;


                if (previous) {

                    programList.insertBefore(
                        wrapper,
                        previous
                    );

                }

            }
        );


    /*
      下へ
    */

    wrapper
        .querySelector(
            ".move-down"
        )
        .addEventListener(
            "click",
            () => {

                const next =
                    wrapper.nextElementSibling;


                if (next) {

                    programList.insertBefore(
                        next,
                        wrapper
                    );

                }

            }
        );


    /*
      削除
    */

    wrapper
        .querySelector(
            ".remove-program"
        )
        .addEventListener(
            "click",
            () => {

                wrapper.remove();

            }
        );


    programList.appendChild(
        wrapper
    );

}


/* =========================================================
   15. プログラム取得
   ========================================================= */

function collectProgram() {

    const items = [];


    const editors =
        programList.querySelectorAll(
            ".program-editor-item"
        );


    editors.forEach(editor => {

        const time =
            editor
                .querySelector(
                    ".program-time-input"
                )
                .value
                .trim();


        const title =
            editor
                .querySelector(
                    ".program-title-input"
                )
                .value
                .trim();


        const person =
            editor
                .querySelector(
                    ".program-person-input"
                )
                .value
                .trim();


        /*
          全部空欄なら保存しない
        */

        if (
            !time &&
            !title &&
            !person
        ) {

            return;

        }


        items.push({

            time,

            title,

            person

        });

    });


    return items;

}


/* =========================================================
   16. 入力チェック
   ========================================================= */

function validateForm() {

    if (
        !titleInput.value.trim()
    ) {

        alert(
            "催事名を入力してください。"
        );

        titleInput.focus();

        return false;

    }


    if (
        !eventDateInput.value
    ) {

        alert(
            "開催日を選択してください。"
        );

        eventDateInput.focus();

        return false;

    }


    if (
        !startTimeInput.value
    ) {

        alert(
            "開始時間を入力してください。"
        );

        startTimeInput.focus();

        return false;

    }


    return true;

}


/* =========================================================
   17. 保存
   ========================================================= */

async function saveEvent() {

    if (
        !validateForm()
    ) {

        return;

    }


    if (
        WORKER_URL.includes(
            "ここにCloudflare"
        )
    ) {

        alert(
            "まだCloudflare Worker URLが設定されていません。\n後でWorker設定時に接続します。"
        );

        return;

    }


    saveButton.disabled =
        true;


    showStatus(
        "保存しています...",
        "loading"
    );


    try {

        /*
          ID

          新規の場合は
          日時 + ランダム文字で生成
        */

        const id =
            editingEventId ||
            createEventId();


        /*
          現在画像
        */

        let imagePath =
            currentImageInput.value ||
            "";


        /*
          画像削除指定
        */

        if (
            removeCurrentImage
        ) {

            imagePath =
                "";

        }


        /*
          新画像がある場合
          Workerへアップロード
        */

        if (
            selectedImageFile
        ) {

            showStatus(
                "画像をアップロードしています...",
                "loading"
            );


            imagePath =
                await uploadImage(
                    selectedImageFile,
                    id
                );

        }


        /*
          保存イベント
        */

        const eventData = {

            id,

            date:
                eventDateInput.value,

            startTime:
                startTimeInput.value,

            endTime:
                endTimeInput.value,

            title:
                titleInput.value.trim(),

            shortTitle:
                shortTitleInput
                    .value
                    .trim() ||
                titleInput
                    .value
                    .trim(),

            category:
                categoryInput.value,

            color:
                eventColorInput.value ||
                "#247447",

            image:
                imagePath,

            zoomUrl:
                zoomUrlInput
                    .value
                    .trim(),

            program:
                collectProgram()

        };


        /*
          保存API
        */

        showStatus(
            "催事データを保存しています...",
            "loading"
        );


        const response =
            await fetch(
                `${WORKER_URL}/events`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "save",

                            event:
                                eventData

                        })

                }
            );


        const result =
            await readJsonResponse(
                response
            );


        if (
            !response.ok ||
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "保存に失敗しました"
            );

        }


        showStatus(
            "保存しました。公開ページへ順次反映されます。",
            "success"
        );


        /*
          少し待ってGitHub側の
          最新データを再取得
        */

        await wait(
            1500
        );


        await loadEvents();


        /*
          保存したイベントを
          再度編集状態へ
        */

        const saved =
            events.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (saved) {

            editEvent(
                saved.id
            );

        }

        else {

            clearEditor();

        }

    }

    catch (error) {

        console.error(error);


        showStatus(
            `保存に失敗しました：${error.message}`,
            "error"
        );

    }

    finally {

        saveButton.disabled =
            false;

    }

}


/* =========================================================
   18. 画像アップロード

   Worker側で
   GitHub images/events/ に保存する
   ========================================================= */

async function uploadImage(
    file,
    eventId
) {

    /*
      Base64へ変換
    */

    const base64 =
        await fileToBase64(
            file
        );


    /*
      拡張子
    */

    const extension =
        getImageExtension(
            file
        );


    /*
      ファイル名自動生成

      例：
      20260726-cherry-1720000000.jpg
    */

    const safeEventId =
        String(eventId)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
            );


    const fileName =
        `${safeEventId}-${Date.now()}.${extension}`;


    const response =
        await fetch(
            `${WORKER_URL}/images`,
            {
                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        action:
                            "upload",

                        fileName,

                        content:
                            base64,

                        mimeType:
                            file.type

                    })

            }
        );


    const result =
        await readJsonResponse(
            response
        );


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "画像アップロードに失敗しました"
        );

    }


    if (
        !result.path
    ) {

        throw new Error(
            "画像保存先が返されませんでした"
        );

    }


    return result.path;

}


/* =========================================================
   19. 削除
   ========================================================= */

async function deleteCurrentEvent() {

    if (
        !editingEventId
    ) {

        return;

    }


    const event =
        events.find(
            item =>
                String(item.id) ===
                String(editingEventId)
        );


    if (!event) {

        return;

    }


    const confirmed =
        confirm(
            `「${event.title}」を削除しますか？\n\nこの操作は元に戻せません。`
        );


    if (!confirmed) {

        return;

    }


    if (
        WORKER_URL.includes(
            "ここにCloudflare"
        )
    ) {

        alert(
            "Cloudflare Worker URLが設定されていません。"
        );

        return;

    }


    deleteButton.disabled =
        true;


    showStatus(
        "削除しています...",
        "loading"
    );


    try {

        const response =
            await fetch(
                `${WORKER_URL}/events`,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "delete",

                            id:
                                editingEventId

                        })

                }
            );


        const result =
            await readJsonResponse(
                response
            );


        if (
            !response.ok ||
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "削除に失敗しました"
            );

        }


        clearEditor();


        showStatus(
            "催事を削除しました。",
            "success"
        );


        await wait(
            1200
        );


        await loadEvents();

    }

    catch (error) {

        console.error(error);


        showStatus(
            `削除に失敗しました：${error.message}`,
            "error"
        );

    }

    finally {

        deleteButton.disabled =
            false;

    }

}


/* =========================================================
   20. イベントID生成
   ========================================================= */

function createEventId() {

    const date =
        eventDateInput.value
            .replaceAll(
                "-",
                ""
            );


    const random =
        Math.random()
            .toString(36)
            .slice(
                2,
                8
            );


    return (
        `${date}-${random}`
    );

}


/* =========================================================
   21. File → Base64

   data:image/jpeg;base64,
   の先頭部分は削除して
   Workerへ送る
   ========================================================= */

function fileToBase64(file) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    const result =
                        String(
                            reader.result
                        );


                    const commaIndex =
                        result.indexOf(
                            ","
                        );


                    if (
                        commaIndex === -1
                    ) {

                        reject(
                            new Error(
                                "画像変換に失敗しました"
                            )
                        );

                        return;

                    }


                    resolve(
                        result.slice(
                            commaIndex + 1
                        )
                    );

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "画像を読み込めませんでした"
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   22. 画像拡張子
   ========================================================= */

function getImageExtension(file) {

    switch (
        file.type
    ) {

        case "image/png":

            return "png";


        case "image/webp":

            return "webp";


        case "image/jpeg":

        default:

            return "jpg";

    }

}


/* =========================================================
   23. レスポンス安全取得
   ========================================================= */

async function readJsonResponse(
    response
) {

    const text =
        await response.text();


    if (!text) {

        return {};

    }


    try {

        return JSON.parse(
            text
        );

    }

    catch {

        throw new Error(
            `サーバーから正しくない応答が返されました：${text.slice(
                0,
                150
            )}`
        );

    }

}


/* =========================================================
   24. ステータス
   ========================================================= */

function showStatus(
    message,
    type
) {

    statusMessage.textContent =
        message;


    statusMessage.className =
        type;

}


function hideStatus() {

    statusMessage.textContent =
        "";

    statusMessage.className =
        "";

}


/* =========================================================
   25. イベント並び替え
   ========================================================= */

function compareEvents(
    a,
    b
) {

    const dateA =
        `${a.date || ""}T${a.startTime || "00:00"}`;


    const dateB =
        `${b.date || ""}T${b.startTime || "00:00"}`;


    return dateA.localeCompare(
        dateB
    );

}


/* =========================================================
   26. 待機
   ========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   27. HTMLエスケープ
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
   28. 属性エスケープ
   ========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}