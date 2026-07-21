// ======================================
// ERINA Zoom Ver4
// service-worker.js
// ======================================

const CACHE_NAME = "erina-zoom-v4";

// キャッシュするファイル
const STATIC_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json"

];
self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(STATIC_FILES))

    );

});
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

        .then(keys =>

            Promise.all(

                keys.map(key => {

                    if(key !== CACHE_NAME){

                        return caches.delete(key);

                    }

                })

            )

        )

    );

    self.clients.claim();

});
self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    // events.jsonは絶対キャッシュしない
    if(url.pathname.endsWith("events.json")){

        event.respondWith(

            fetch(event.request,{

                cache:"no-store"

            })

        );

        return;

    }

    event.respondWith(

        caches.match(event.request)

        .then(cache =>{

            return cache || fetch(event.request);

        })

    );

});
// ======================================
// オフライン対応
// ======================================

self.addEventListener("fetch", event => {

    // GET以外は処理しない
    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // events.jsonは常に最新を取得
    if (url.pathname.endsWith("/data/events.json")) {

        event.respondWith(

            fetch(event.request, {
                cache: "no-store"
            }).catch(() => {

                return new Response("[]", {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

            })

        );

        return;

    }

    // その他はキャッシュ優先
    event.respondWith(

        caches.match(event.request)

        .then(cached => {

            return cached || fetch(event.request);

        })

    );

});
// ======================================
// ServiceWorker更新
// ======================================

self.addEventListener("message", event => {

    if (event.data === "skipWaiting") {

        self.skipWaiting();

    }

});
// ======================================
// バックグラウンド更新
// ======================================

self.addEventListener("activate", event => {

    event.waitUntil(

        self.clients.claim()

    );

});
// ======================================
// Push通知（将来用）
// ======================================

self.addEventListener("push", event => {

    if (!event.data) return;

    const data = event.data.json();

    event.waitUntil(

        self.registration.showNotification(

            data.title,

            {

                body: data.body,

                icon: "images/icon-192.png",

                badge: "images/icon-192.png"

            }

        )

    );

});
self.addEventListener("notificationclick", event => {

    event.notification.close();

    event.waitUntil(

        clients.openWindow("./")

    );

});