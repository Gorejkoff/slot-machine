// строгий режим
"use strict"


class Wheel {
   constructor(screen, wheel, image) {
      this.SCREEN = document.querySelector('.' + screen);
      this.WHEEL = this.SCREEN.querySelector('.' + wheel);
      this.IMAGE = this.SCREEN.getElementsByClassName(image);
      this.WHEEL_HEIGHT = this.WHEEL.offsetHeight;
      this.IMAGE_HEIGHT = this.IMAGE[0].offsetHeight;
      this.stop_action = true;
      this.start_action = true;
      this.slowing_finish = false;
      this.time_action = 3;
      this.transform_value = -this.IMAGE_HEIGHT / 2;
      this.start_time = Date.now();
      this.finish_position;
      this.speed = {
         max: 30,
         boost: 20,
      }
      this.travel_time = 0;
      this.speed_value = 0;
      this.time_to = Date.now();
   }

   init = () => {
      this.WHEEL.prepend(this.IMAGE[this.IMAGE.length - 1].cloneNode(true));
      this.WHEEL.prepend(this.IMAGE[this.IMAGE.length - 2].cloneNode(true));
      this.WHEEL.prepend(this.IMAGE[this.IMAGE.length - 3].cloneNode(true));

      this.addTransform(this.transform_value);
   }

   moveWheel = () => {
      this.travelTime();
      this.transform_value = this.transform_value - this.speed_value;


      this.styleValue = getComputedStyle(this.WHEEL);
      this.gettransform_value = new DOMMatrix(this.styleValue.transform);

      // коррекция transform_value при максимальном смещении картинок
      if (parseInt(this.gettransform_value.m42) + this.IMAGE_HEIGHT / 2 <= -this.WHEEL_HEIGHT) {
         this.transform_value = this.transform_value + this.WHEEL_HEIGHT;
      }

      // разгон если не максимальные скорость и время работы
      if (this.speed_value < this.speed.max && (Date.now() - this.start_time) / 1000 < this.time_action) {
         this.speed_value = this.calcSpeed(this.speed_value, this.travel_time, this.speed.boost);
      }
      // не больше максимальной скорости
      if (this.speed_value > this.speed.max) {
         this.speed_value = this.speed.max;
      }




      if ((Date.now() - this.start_time) / 1000 > this.time_action) {
         this.speed_value = this.calcSpeed(this.speed_value, this.travel_time, -this.speed.boost);
         this.speed_value < 5 && this.activeElement();
      }
      if (this.speed_value < 5 && this.slowing_finish) {
         this.speed_value = 5;
         this.WHEEL.style.transition = 'transform 1s cubic-bezier(.02,1,.62,1.01)';
         this.transform_value = -this.finish_position;
         this.slowing_finish = false;
         this.stop_action = true;
         setTimeout(() => { this.start_action = true }, 1000)
      }



      this.addTransform(this.transform_value);

      if (!this.stop_action) {
         this.time_to = Date.now();
         requestAnimationFrame(this.moveWheel);
      }
   }


   start = () => {
      this.stop_action = false;
      this.start_action = false;
      this.WHEEL.style.transition = '';
      for (let item of this.IMAGE) {
         item.classList.remove('active');
      }
      this.time_action = 3 + 5 * Math.random();
      this.speed.boost = 10 + 20 * Math.random()
      this.slowing_finish = false;
      this.start_time = Date.now();
      this.time_to = Date.now();
      this.finish_position = 0;
      this.travel_time = 0;
      this.speed_value = 0;
      requestAnimationFrame(this.moveWheel)
   }

   addTransform = (value) => {
      this.WHEEL.style.transform = `translateY(${value}px)`;
   }

   /* скорость в момент времени "t" при ускорении "a" */
   calcSpeed = (v, t, a) => {
      return this.number(v + a * t);
   }

   // расчёт времени между вызовами функции
   travelTime = () => {
      this.travel_time = this.number((Date.now() - this.time_to) / 1000);
   }

   /* возвращает тип данных number после округления до целых*/
   number = (n) => {
      return Number(n.toFixed(4))
   }


   activeElement = () => {
      let screen_offset = this.SCREEN.getBoundingClientRect().top;
      for (let i = 0; i < this.IMAGE.length - 1; i++) {
         let image_offset = this.IMAGE[i].getBoundingClientRect().top;
         if (screen_offset - image_offset + this.IMAGE_HEIGHT < 0) {
            this.IMAGE[i].classList.add('active');
            this.finish_position = this.IMAGE[i].offsetTop - this.IMAGE_HEIGHT / 2 - 5;
            this.slowing_finish = true;
            break;
         }
      }
   }


}



let wheel1 = new Wheel('screen-1', 'slot-machine__wheel', 'slot-machine__image');
wheel1.init();
let wheel2 = new Wheel('screen-2', 'slot-machine__wheel', 'slot-machine__image');
wheel2.init();
let wheel3 = new Wheel('screen-3', 'slot-machine__wheel', 'slot-machine__image');
wheel3.init();




let coins = document.querySelector('.slot-machine__coins-text');
let text = document.querySelector('.slot-machine__info');
let value_data = [];
let coins_value = 100;
coins.innerHTML = coins_value;
const BUTTON_START = document.querySelector('.button-start');

let next_start = true;
BUTTON_START.addEventListener('click', (event) => {
   if (next_start) {
      value_data = [];
      wheel1.start();
      wheel2.start();
      wheel3.start();
      next_start = false;
      testValue();
      text.innerHTML = '';
   }


})



function testValue() {
   if (wheel1.start_action && wheel2.start_action && wheel3.start_action) {
      let elements = document.querySelectorAll('.slot-machine__wheel .active');
      next_start = true;
      if (elements.length == 3) {
         elements.forEach((e) => {
            value_data.push(e.dataset.wheel);
         })
         console.log(value_data);
         comparisonValue();
         return;
      }
   }
   setTimeout(() => { testValue() }, 500)
}


function comparisonValue() {
   if (value_data[0] == value_data[1] && value_data[0] == value_data[2] && value_data[1] == value_data[2]) {
      text.innerHTML = 'УРА ТЫ ВЫИГРАЛ !!!';
      coins_value = coins_value + 30;
      coins.innerHTML = coins_value;
   } else if (value_data[0] == value_data[1] || value_data[0] == value_data[2] || value_data[1] == value_data[2]) {
      text.innerHTML = 'Две одинаковые !!!';
      coins_value = coins_value + 5;
      coins.innerHTML = coins_value;
   } else if (value_data[0] !== value_data[1] && value_data[0] !== value_data[2] && value_data[1] !== value_data[2]) {
      text.innerHTML = 'Нет совпадений';
      coins_value = coins_value - 1;
      coins.innerHTML = coins_value;
   }
}

