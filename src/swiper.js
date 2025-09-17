import Swiper from 'swiper';
import { Navigation, Pagination, Controller } from 'swiper/modules';

export const bgSwiper = new Swiper('.bgSwiper', {
  modules: [Navigation, Pagination, Controller],
  speed: 400,
  grabCursor: true,
  resistanceRatio: 0, // 避免滑動過界
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  }
});

const textSwiper = new Swiper('.textSwiper', { speed: 400, allowTouchMove: false });

bgSwiper.controller.control = textSwiper;
