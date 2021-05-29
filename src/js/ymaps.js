
let myMap;
let coords;
const map = document.querySelector('#map');

map.addEventListener('click', function () {

})

function mapInit() {
    ymaps.ready(() => {
        myMap = new ymaps.Map('map', {
            center: [56.32, 44.00],
            zoom: 12,
            behaviors: ['drag']
        }, {
            searchControlProvider: 'yandex#search'
        })
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
        myMap.geoObjects.add(clusterer);

        myMap.events.add('click', function (event) {
            openModal(event);
        });

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

function addListeners() {
    const form = document.querySelector('.form');
    const modal = document.querySelector('.form__review');

    const inputs = document.querySelectorAll('.input');
    const inputName = document.querySelector('#name');
    const inputPlace = document.querySelector('#place');
    const inputReview = document.querySelector('#feedback');
    const balloonName = document.querySelector('.review__name');
    const balloonPlace = document.querySelector('.review__place');
    const balloonArea = document.querySelector('.review__text');

    for (const input of inputs) {
        input.value = "";
    }

    form.addEventListener('submit', (event) => {
        console.log(event)
        event.preventDefault();
        balloonName.textContent = inputName.value;
        balloonPlace.textContent = inputPlace.value;
        balloonArea.textContent = inputReview.value;

        if (!validateForm()) {
            return;
        }


        let placemark = new ymaps.Placemark(coords, {
            balloonContent: modal.innerHTML
        });
        // clusterer.add(placemark);
        myMap.geoObjects.add(placemark);

        balloonName.textContent = '';
        balloonPlace.textContent = '';
        balloonArea.textContent = '';

        modal.style.display = 'none';
    })

    
}


function openModal(event) {
    // event.preventDefault();
    let posX = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientX;
    let posY = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientY;
    coords = event.get('coords');
    getClickCoords(coords);

    const modal = document.querySelector('.form__review');
    modal.style.display = 'block';
    modal.style.left = `${posX}px`;
    modal.style.top = `${posY}px`;
    
    addListeners();
}

function getClickCoords(coords) {
    return ymaps.geocode(coords)
        .then(response => resolve(response.geoObjects.get(0).getAddressLine()))
        .catch(e => reject(e))
}

export {
    mapInit,
    addListeners,
    openModal,
    validateForm,
    getClickCoords
}