'use strict';

import template from './table-load-form.hbs';
import './table-load-form.scss';

export default class TableLoadForm {
  constructor() {
    this.elem = document.createElement('div');
    this.elem.className = 'table-load-form';

    this.elem.innerHTML = template();

    this.elem.querySelector('.load-form').addEventListener('click', (e) => {
      e.preventDefault();
    });
  }
}
