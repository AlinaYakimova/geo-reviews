import './css/index.css'
import review from './templates/reviews.hbs'
// console.log(review);
import { mapInit, addListeners, openModal, validateForm, getClickCoords } from './js/ymaps.js'
// console.log(addListener);
// console.log(openModal);

const render = document.querySelector('.reviews__list');
render.innerHTML += review({
  review: [
    {
      name: '',
      place: '',
      feedback: ''
    }
  ]
});

window.onload = mapInit()