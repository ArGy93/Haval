// import $ from 'jquery';
import Inputmask from "inputmask";
import svg4everybody from 'svg4everybody';
import Glide from '@glidejs/glide';

svg4everybody();

Inputmask("(999) 999-99-99").mask('.cheaper__form input[type=tel]');



// About button scripts

document.querySelectorAll('.btn__about').forEach(item => {
  item.addEventListener('mouseenter', arrowMoveForward);
  item.addEventListener('mouseleave', arrowMoveBack);
});

function arrowMoveForward() {
  const $target = this;
  const $line = $target.querySelector('.arrow-line');

  $target.classList.add('active');
  setTimeout(() => {
    $line.classList.add('active');
  }, 400);

}

function arrowMoveBack() {
  const $target = this;
  const $line = $target.querySelector('.arrow-line');

  $line.classList.remove('active');
  setTimeout(() => {
    $target.classList.remove('active');
  }, 400);

}



// Mobile menu

document.querySelector('.main-menu__icon')
        .addEventListener('click', () => {
          document.querySelector('.mob-menu')
                  .classList.add('active');
        });

document.querySelector('.icon-close')
        .addEventListener('click', () => {
          document.querySelector('.mob-menu')
                  .classList.remove('active');
        });



// Add animations and customize header

let mainBlockHeight;
const mainMenu = document.querySelector('.main-menu');
const windowWidth = window.innerWidth;

if (window.innerWidth < 992) {
  mainBlockHeight = document.querySelector('.F7')
                            .getBoundingClientRect().top + pageYOffset;
} else {
  mainBlockHeight = document.querySelector('.main-nav')
                            .getBoundingClientRect().top + pageYOffset;
}

window.onscroll = () => {
  document.querySelectorAll('.animated').forEach(item => {
    let imagePos = item.getBoundingClientRect().top + pageYOffset;
    let topOfWindow = window.pageYOffset || document.documentElement.scrollTop;
    let windowHeight = window.outerHeight;
		let bottomOfWindow = windowHeight - (windowHeight / 3);

    if (imagePos < topOfWindow + bottomOfWindow) {
      if (item.classList.contains('first')) {
        item.classList.add('bounceInLeft');
      } else if (item.classList.contains('second')) {
        item.classList.add('bounceInRight');
      } else if (item.classList.contains('third')) {
        item.classList.add('zoomIn');
      }
    }
  })

  let windowScroll = window.pageYOffset;

  if (windowScroll > mainBlockHeight) {
    mainMenu.style.backgroundColor = '#3f3f3f';
  } else {
    mainMenu.style.backgroundColor = 'transparent';
  }
};



// Add Glide-slider

if (document.querySelector('.glide')) {
  new Glide('.glide', {
    type: 'carousel',
    startAt: 0,
    perView: 1,
    autoplay: 10000,
    animationDuration: 2000,
    animationTimingFunc: 'ease'
  }).mount();
}

