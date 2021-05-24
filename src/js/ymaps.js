let myMap;
let coords;

function mapInit() {
    ymaps.ready(() => {
        let nizhnyNovgorod = new ymaps.Map('map', {
            center: [56.32, 44.00],
            zoom: 12,
            behaviors: ['drag']
        }, {
            searchControlProvider: 'yandex#search'
        })

        let placemark = new ymaps.Placemark([56.32, 43.98], {
            balloonContent: 'балун'
        });

        nizhnyNovgorod.geoObjects.add(placemark);
    })

    nizhnyNovgorod.add('click', function (event) {
        openModal(event);
    });

    addListener();
}

function validateForm() {
    return true;
}

function addListener() {
    const form = document.querySelector('.form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // validateForm();
    });
}

function openModal(event) {
    let posX = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientX;
    let posY = event.getSourceEvent().originalEvent.domEvent.originalEvent.clientY;
    coords = event.get('coords');
    getClickCoords(coords);


    const modal = document.querySelector('.form__review');
    modal.style.display = 'block';
    modal.style.left = `${posX}px`;
    modal.style.top = `${posY}px`;
}



export {
    mapInit,
    addListener
}