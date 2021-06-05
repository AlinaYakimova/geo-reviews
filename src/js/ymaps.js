import reviewsTemplate from '../templates/reviews.hbs'
import popupTemplate from '../templates/form.hbs'
// console.log(review);

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
        const popup = document.querySelector('.popup');
        popup.innerHTML = popupTemplate();
        console.log(popup.innerHTML);
        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // '<div class="form__review">' +
            // '<a href="#" class="form__close"></a>' +
            // '<div class="reviews__block">' +
            // '<ul class="reviews__list"></ul>' +
            // '</div>' +
            // '<h3 class="form__title">Отзыв:</h3>' +
            // '<form class="form">' +
            // '<div class="form__content">' +
            // '<input id="name" type="text" class="input" name="name" placeholder="Укажите ваше имя">' +
            // '<input id="place" type="text" class="input" name="place" placeholder="Укажите место">' +
            // '<textarea id="feedback" class="input input__textarea" name="comment" placeholder="Оставить отзыв"></textarea>' +
            // '</div>' +
            // '<input id="button" type="submit" class="form__button" value="Добавить">' +
            // '</form>' +
            // '</div>',
            popup.innerHTML,
            {
                build: function () {
                    customItemContentLayout.superclass.build.call(this);
                }
            });

        ymaps.layout.storage.add('customItemContentLayout', customItemContentLayout)
        //добавляем кластер
        let clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем стандартный макет балуна кластера "Карусель".
            // clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            clusterBalloonItemContentLayout: 'customItemContentLayout',
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
    mark.events.add('click', () => {
        openModal(obj);
    })
}
// function clickOnClusterer(cluster, obj) {
//     let hintFromClusterer = cluster.properties._data.hintContent;

//     cluster.events.add('click', (event) => {
//         console.log('click on clusterer', hintFromClusterer);

//         openModal(event, obj, hintFromClusterer);
//     })
// }

function openModal(obj) {
    // event.preventDefault();
    //координаты модального окна в документе (по верхнему левому углу)
    // let posX = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientX;
    // let posY = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientY;

    let posX = obj.position[0];
    let posY = obj.position[1];

    const popup = document.querySelector('.popup');
    popup.innerHTML = popupTemplate(); //рендерим модалку шаблона в popup

    const render = document.querySelector('.reviews__list');
    render.innerHTML = obj.comments; // рендерим блок отзывов из хинта в модалку(в блок <ul>)

    const modal = document.querySelector('.form__review');
    modal.style.display = 'block';
    modal.style.left = `${posX}px`;
    modal.style.top = `${posY}px`;

    addFeedback(obj);
}

function addFeedback(obj) {
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

        obj.comments = reviewsTemplate({
            review: [
                {
                    name: inputName.value,
                    place: inputPlace.value,
                    feedback: inputReview.value
                }
            ]
        });
        let placemark = new ymaps.Placemark(obj.coords, {
            // balloonContentHeader: inputName.value,
            // balloonContentBody: inputPlace.value,
            // balloonContentFooter: inputReview.value,
            // hintContent: render.innerHTML = obj.comments,
            // balloonContent: ''
        }, {
            openHintOnHover: false
        });
        // placemark.properties.set('balloonContentBody', `${comment.feedback}`
        // );
        // placemark.properties.set('balloonContentFooter', `${comment.date}`
        // );

        obj.myMap.geoObjects.add(placemark);
        obj.clusterer.add(placemark);
        placemark.balloon.open(obj.coords, {}, {layout: 'customItemContentLayout'});

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