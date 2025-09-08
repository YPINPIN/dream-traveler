import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

export const swiper = new Swiper('.bgSwiper', {
  modules: [Navigation, Pagination],
  grabCursor: true,
  resistanceRatio: 0,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  }
})
