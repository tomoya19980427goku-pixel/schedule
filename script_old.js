const calendar = document.getElementById("calendar");

events.forEach(event => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <div class="date">${event.day}</div>

        <div class="time">${event.time}</div>

        <div class="title"
             style="color:${event.color};">
             ${event.title}
        </div>

        ${
            event.url
            ? `<a class="join"
                  href="${event.url}"
                  target="_blank">
                  Zoomに参加
               </a>`
            : `<div class="wait">
                  URL準備中
               </div>`
        }
    `;

    calendar.appendChild(card);

});
