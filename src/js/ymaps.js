import review from '../templates/reviews.hbs'
import popupTemplate from '../templates/form.hbs'
// console.log(review);

function mapInit() {
    let objData = {};
    //инициализация карты
    ymaps.ready(() => {
        let myMap = new ymaps.Map('map', {
            center: [56.32, 44.00],
            zoom: 12,
            behaviors: ['drag']
        }, {
            searchControlProvider: 'yandex#search'
        })
        //добавляем кластер
        let clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем стандартный макет балуна кластера "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            // clusterBalloonItemContentLayout: customItemContentLayout,
            // Устанавливаем режим открытия балуна.
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 200,
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
        myMap.events.add('click', function (event) {
            let coords = event.get('coords');

            objData.myMap = myMap;
            objData.coords = coords;
            objData.clusterer = clusterer;

            getClickCoords(objData, event);

        });
    })
}

function getClickCoords(obj, event) {
    ymaps.geocode(obj.coords)
        .then(
            openModal(event, obj))
        .catch(e => reject(e))
}

function clickOnPlacemark(mark, obj) {
    let hintFromMark = mark.properties._data.hintContent;

    mark.events.add('click', (event) => {
        console.log(hintFromMark);

        openModal(event, obj, hintFromMark);
    })
}
function clickOnClusterer(cluster, obj) {
    let hintFromClusterer = cluster.properties._data.hintContent;

    cluster.events.add('click', (event) => {
        console.log('click on clusterer', hintFromClusterer);

        openModal(event, obj, hintFromClusterer);
    })
}

function openModal(event, obj, hint = '') {
    // event.preventDefault();
    //координаты модального окна в документе (по верхнему левому углу)
    let posX = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientX;
    let posY = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientY;

    const popup = document.querySelector('.popup');
    const render = document.querySelector('.reviews__list');

    popup.innerHTML = popupTemplate(); //рендерим модалку шаблона в popup
    

    const modal = document.querySelector('.form__review');

    modal.style.display = 'block';
    modal.style.left = `${posX}px`;
    modal.style.top = `${posY}px`;

    addFeedback(obj, hint);
}

function addFeedback(obj, hint) {
    const form = document.querySelector('.form');
    const modal = document.querySelector('.form__review');
    const render = document.querySelector('reviews__list');

    const inputs = document.querySelectorAll('.input');
    const inputName = document.querySelector('#name');
    const inputPlace = document.querySelector('#place');
    const inputReview = document.querySelector('#feedback');

    render.innerHTML = hint; // рендерим блок отзывов из хинта в модалку(в блок <ul>)

    for (const input of inputs) {
        input.value = "";
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();


        if (!validateForm()) {
            return;
        }

        if (!hint) {
            let reviewTempl = feedbacksTemplate({
                review: [
                    {
                        name: inputName.value,
                        place: inputPlace.value,
                        feedback: inputReview.value
                    }
                ]
            });
            let placemark = new ymaps.Placemark(obj.coords, {
                hintContent: render.innerHTML = reviewTempl,
                balloonContent: ''
            }, {
                openHintOnHover: false
            });

            obj.myMap.geoObjects.add(placemark);
            obj.clusterer.add(placemark);

            modal.style.display = 'none';

            clickOnPlacemark(placemark, obj);
            // clickOnClusterer(obj.clusterer, obj);
        } else {
            modal.style.display = 'none';
            clickOnPlacemark(placemark, obj);
        }
    })
}

function validateForm() {
    const form = document.querySelector('.form');
    console.log(form.elements.comment);
    let valid = true;
    if (!validate(form.elements.name)) {
        valid = false;
    }
    if (!validate(form.elements.place)) {
        valid = false;
    }
    if (!validate(form.elements.comment)) {
        valid = false;
    }
    return valid;
}

function validate(element) {
    element.value = element.value.trim(); // для удаления пробелов сначала и в конце.
    console.log(element.checkValidity())
    if (!element.checkValidity()) {
        element.style.border = "1px solid red";
        return false;
    } else {
        // element.style.border = "none";
        return true;
    }
}

export {
    mapInit
}