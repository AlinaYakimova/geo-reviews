import reviewsTemplate from '../templates/reviews.hbs'
import popupTemplate from '../templates/form.hbs'

function mapInit() {
    // let objData = {};
    //инициализация карты
    ymaps.ready(() => {
        let myMap = new ymaps.Map('map', {
            center: [56.32, 44.00],
            zoom: 12,
            behaviors: ['drag']
        }, {
            searchControlProvider: 'yandex#search'
        });

        // Создаем собственный макет с информацией о выбранном геообъекте.
        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
            '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
        );

        //добавляем кластер
        let clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем стандартный макет балуна кластера "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            clusterBalloonItemContentLayout: customItemContentLayout,
            // Устанавливаем режим открытия балуна.
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 270,
            clusterBalloonContentLayoutHeight: 130,
            // Устанавливаем максимальное количество элементов в нижней панели на одной странице
            clusterBalloonPagerSize: 5
            // Настройка внешнего вида нижней панели.
            // Режим marker рекомендуется использовать с небольшим количеством элементов.
            // clusterBalloonPagerType: 'marker',
            // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
            // clusterBalloonCycling: false,
            // Можно отключить отображение меню навигации.
            // clusterBalloonPagerVisible: false
        });
        // console.log('clusterer', clusterer);
        myMap.geoObjects.add(clusterer);

        //слушатель кликов по карте
        myMap.events.add('click', function (e) {
            let clickCoords = e.get('coords'); //получение координат по клику
            let myGeoCoder = ymaps.geocode(clickCoords);// получение адреса по координатам карты
            let position = e.get('position');// координаты клика в px
            myGeoCoder.then(res => {
                let obj = new Object();
                obj.coords = clickCoords;
                obj.address = res.geoObjects.get(0).properties.get('text');
                obj.comments = [];
                obj.position = position;
                obj.myMap = myMap;
                obj.clusterer = clusterer;

                console.log(obj);
                openModal(obj);
            });
        });

        // myMap.events.add('click', function (event) {
        //     let coords = event.get('coords');

        //     objData.myMap = myMap;
        //     objData.coords = coords;
        //     objData.clusterer = clusterer;

        //     getClickCoords(objData, event);
        // });
    })
}

// function getClickCoords(obj, event) {
//     ymaps.geocode(obj.coords)
//         .then(
//             openModal(event, obj))
//         .catch(e => reject(e))
// }

function clickOnPlacemark(mark, obj) {
    let hintFromMark = mark.properties._data.hintContent;
    mark.events.add('click', () => {
        console.log('click on placemark')
        openModal(obj, hintFromMark);
    })
}
// function clickOnClusterer(cluster, obj) {
//     let hintFromClusterer = cluster.properties._data.hintContent;

//     cluster.events.add('click', (event) => {
//         console.log('click on clusterer', hintFromClusterer);

//         openModal(event, obj, hintFromClusterer);
//     });
// }

function openModal(obj, hint = '') {
    // event.preventDefault();
    //координаты модального окна в документе (по верхнему левому углу)
    // let posX = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientX;
    // let posY = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientY;


    let posX = obj.position[0];
    let posY = obj.position[1];

    const popup = document.querySelector('.popup');
    popup.innerHTML = popupTemplate(); //рендерим модалку шаблона в popup

    const render = document.querySelector('.reviews__list');
    render.innerHTML = hint; // рендерим блок отзывов из хинта в модалку(в блок <ul>)

    const modal = document.querySelector('.form__review');
    modal.style.display = 'block';
    modal.style.left = `${posX}px`;
    modal.style.top = `${posY}px`;

    const closeModal = document.querySelector('.form__close');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });


    addFeedback(obj, hint);
}

function addFeedback(obj, hint) {
    const form = document.querySelector('.form');
    const modal = document.querySelector('.form__review');
    const render = document.querySelector('.reviews__list');

    const inputs = document.querySelectorAll('.input');
    const inputName = document.querySelector('#name');
    const inputPlace = document.querySelector('#place');
    const inputReview = document.querySelector('#feedback');

    for (const input of inputs) {
        input.value = "";
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        let placemark = new ymaps.Placemark(obj.coords, {
            // balloonContentHeader: inputName.value,
            // balloonContentBody: inputPlace.value,
            // balloonContentFooter: inputReview.value,
            hintContent: render.innerHTML = reviewsTemplate({
                review: [
                    {
                        name: inputName.value,
                        place: inputPlace.value,
                        feedback: inputReview.value
                    }
                ]
            }),
            balloonContentHeader: inputName.value,
            balloonContentBody: inputPlace.value,
            balloonContentFooter: inputReview.value
        }, {
            openHintOnHover: false,
            hasBalloon: false
        });

        obj.myMap.geoObjects.add(placemark);
        obj.clusterer.add(placemark);

        modal.style.display = 'none';

        clickOnPlacemark(placemark, obj);
        // clickOnClusterer(obj.clusterer, obj);
    })
}

function validateForm() {
    const form = document.querySelector('.form');
    let valid = true;
    if (!validate(form.elements.name)) {
        valid = false;
    }
    if (!validate(form.elements.place)) {
        valid = false;
    }
    // console.log('valid',form.elements.place);
    if (!validate(form.elements.comment)) {
        valid = false;
    }
    // console.log('valid',form.elements.comment.value);
    return valid;
}

function validate(element) {
    element.value = element.value.trim(); // для удаления пробелов сначала и в конце.
    // console.log(element.value)
    if (!element.value) {
        element.style.border = "1px solid red";
        return false;
    } else {
        element.style.border = "1px solid #CFCFCF";
        return true;
    }
}

export {
    mapInit
}