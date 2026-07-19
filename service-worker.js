// ==========================================
// ERINA Zoom Schedule
// service-worker.js
// ==========================================

const CACHE_NAME = "erina-zoom-v3";


// キャッシュする基本ファイルだけ
const FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];



// インストール

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(FILES);

        })

    );


    // 新しいSWをすぐ有効化

    self.skipWaiting();

});





// 通信処理

self.addEventListener("fetch", event => {


    const url = new URL(event.request.url);



    // ==================================
    // 常に最新取得するもの
    // ==================================

    if(

        url.pathname.includes("/data/events.js") ||

        url.pathname.includes("/images/")

    ){

        event.respondWith(

            fetch(event.request)

        );


        return;

    }





    // ==================================
    // その他はキャッシュ優先
    // ==================================

    event.respondWith(

        caches.match(event.request)

        .then(response => {


            return response || fetch(event.request);


        })

    );


});





// 古いキャッシュ削除

self.addEventListener("activate", event => {


    event.waitUntil(


        caches.keys()

        .then(keys => {


            return Promise.all(

                keys.map(key => {


                    if(key !== CACHE_NAME){


                        return caches.delete(key);


                    }


                })

            );


        })


    );


    // すぐ反映

    self.clients.claim();


});