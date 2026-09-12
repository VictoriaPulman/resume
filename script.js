/* =========================================================
   НАСТРОЙКИ КАРУСЕЛИ
   ========================================================= */

/*
    Здесь мы запоминаем, на каком месте находится
    "паровозик" проектов и сертификатов.
*/

let carouselPosition = {
    portfolio: 0,
    certificates: 0
};


/*
    Функция движения карусели.

    type:
        portfolio
        certificates

    direction:
        -1 = назад
         1 = вперёд
*/

function moveCarousel(type, direction) {

    const track = document.getElementById(type + "-track");

    const cards = track.children;

    if (cards.length === 0) {
        return;
    }


    /*
        Ширина одной карточки + расстояние между карточками
    */

    const cardWidth =
        cards[0].offsetWidth + 25;


    carouselPosition[type] += direction;


    /*
        Не даём прокрутить слишком далеко назад
    */

    if (carouselPosition[type] < 0) {

        carouselPosition[type] = 0;

    }


    /*
        Сколько карточек может быть показано
    */

    const windowWidth =
        track.parentElement.offsetWidth;


    const visibleCards =
        Math.floor(windowWidth / cardWidth);


    /*
        Максимальная позиция
    */

    const maxPosition =
        Math.max(0, cards.length - visibleCards);


    /*
        Не даём прокрутить слишком далеко вперёд
    */

    if (carouselPosition[type] > maxPosition) {

        carouselPosition[type] = maxPosition;

    }


    /*
        Двигаем ленту
    */

    track.style.transform =
        `translateX(-${carouselPosition[type] * cardWidth}px)`;
}



/* =========================================================
   ПОЛНОЭКРАННАЯ ГАЛЕРЕЯ
   ========================================================= */


/*
    Здесь хранятся изображения проектов.
    
    ЗАМЕНИ НАЗВАНИЯ ФАЙЛОВ НА СВОИ.
*/

const galleries = {

    portfolio: [
        "project/p0.png",
        "project/p00.png",
        "project/p1.png",
        "project/p2.png",
        "project/p3.png",
        "project/p4.png",
        "project/p5.png"
    ],

    certificates: [
        "images/SQLsim.jpg",
        "images/it.jpg",
        "images/jte.jpg",
        "images/PYTHONsolo.jpg",
        "images/iPYTHONsolo.jpg",
        "images/iSQLsolo.jpg",
        "images/SQLsolo.jpg",
        "images/HTMLsolo.jpg",
        "images/CSSsolo.jpg",
        "images/JSsolo.jpg"

    ]

};


/*
    Текущая открытая галерея
*/

let currentGallery = "";

let currentImage = 0;



/*
    Открываем полноэкранный просмотр
*/

function openGallery(type, index) {

    currentGallery = type;

    currentImage = index;


    const lightbox =
        document.getElementById("lightbox");


    const image =
        document.getElementById("lightbox-image");


    image.src =
        galleries[type][index];


    lightbox.classList.add("active");


    /*
        Запрещаем прокрутку страницы,
        пока открыта большая картинка
    */

    document.body.style.overflow = "hidden";
}



/*
    Закрываем галерею
*/

function closeGallery() {

    const lightbox =
        document.getElementById("lightbox");


    lightbox.classList.remove("active");


    /*
        Возвращаем прокрутку страницы
    */

    document.body.style.overflow = "";
}



/*
    Следующая / предыдущая картинка
*/

function changeGalleryImage(direction) {

    const images =
        galleries[currentGallery];


    currentImage += direction;


    /*
        Если дошли до конца —
        начинаем сначала
    */

    if (currentImage >= images.length) {

        currentImage = 0;

    }


    /*
        Если ушли назад от первой —
        переходим к последней
    */

    if (currentImage < 0) {

        currentImage = images.length - 1;

    }


    document.getElementById("lightbox-image").src =
        images[currentImage];
}



/* =========================================================
   КЛАВИАТУРА
   ========================================================= */


/*
    Можно листать сертификаты и проекты
    клавишами клавиатуры.
*/

document.addEventListener("keydown", function (event) {

    const lightbox =
        document.getElementById("lightbox");


    /*
        Если галерея открыта
    */

    if (lightbox.classList.contains("active")) {

        if (event.key === "ArrowRight") {

            changeGalleryImage(1);

        }


        if (event.key === "ArrowLeft") {

            changeGalleryImage(-1);

        }


        if (event.key === "Escape") {

            closeGallery();

        }

    }

});



/* =========================================================
   ФОРМА ОБРАТНОЙ СВЯЗИ
   ========================================================= */

async function sendMessage(event) {

    // Не даём странице перезагрузиться
    event.preventDefault();
    // Показываем индикатор отправки
    showLoading();

    // Получаем данные из формы
    const name = document.getElementById("name").value;
    const organization = document.getElementById("organization").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;

    // Адрес нашего Google Apps Script
    const scriptURL = "https://script.google.com/macros/s/AKfycbwb3j0W3NFQFr2P7QE7iZ91gdWJNyJolCHT84CqfKG6jt6aQyEZh_RXUmhw7vXkZqUB/exec";

    // Отправляем данные в Google Таблицу
    try {

        await fetch(scriptURL, {
            method: "POST",
            mode: "no-cors",
            body: new URLSearchParams({
                name: name,
                organization: organization,
                email: email,
                phone: phone,
                message: message
            })
        });

        // Убираем индикатор
        hideLoading();

        // Сообщение после успешной отправки
        showSuccessMessage(name);

        // Очищаем форму
        event.target.reset();

    } catch (error) {

        // Если произошла ошибка
        alert("Не удалось отправить сообщение. Попробуйте ещё раз.");

        console.error(error);
    }
}

// Показываем индикатор загрузки
function showLoading() {

    const loader = document.createElement("div");

    loader.className = "form-loader";

    loader.innerHTML = `
        <div class="loader-letter">P</div>
    `;

    document.body.appendChild(loader);
}


// Скрываем индикатор загрузки
function hideLoading() {

    const loader = document.querySelector(".form-loader");

    if (loader) {
        loader.remove();
    }
}

// Красивое сообщение после отправки формы
function showSuccessMessage(name) {

    // Создаём окно
    const modal = document.createElement("div");

    modal.className = "success-modal";

    modal.innerHTML = `
        <div class="success-modal-content">

            <button class="success-close" onclick="this.closest('.success-modal').remove()">
                ×
            </button>

            <div class="success-icon">
                ✓
            </div>

            <h2>Сообщение принято</h2>

            <p>
                Спасибо, ${name}!
            </p>

            <p class="success-text">
                Ваше сообщение успешно отправлено.
                Я свяжусь с вами в ближайшее время.
            </p>

            <button class="success-button"
                    onclick="this.closest('.success-modal').remove()">
                Хорошо
            </button>

        </div>
    `;

    // Добавляем окно на страницу
    document.body.appendChild(modal);

    // Закрытие при клике на затемнённый фон
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}