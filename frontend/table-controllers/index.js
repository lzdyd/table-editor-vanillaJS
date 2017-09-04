'use strict';

import template from './table-controllers.hbs';
import './table-controllers.scss';

export default class TableControllers {
  constructor() {
    this.elem = document.createElement('div');
    this.elem.className = 'table-controllers';
    this.elem.innerHTML = template();
  }
}
