'use strict';

import TableControllers from '../table-controllers';
import TableRows from '../table-rows';

import template from './table.hbs';
import templateModalBox from './modal-box.hbs';
import './table.scss';
import '../common/style.scss';

import getData from './get-data';

let tableData;
let tempTableData;
let selectedTableRow;
let selectedTableCell;
let showConfirmingModalBoxAnswer;

const tableHTMLTag = document.registerElement('table-editor', {
  prototype: Object.create(HTMLElement.prototype)
});

const newHTMLTags = [tableHTMLTag];

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(eventName, data) {
    const event = this.events[eventName];
    if (event) {
      event.forEach((fn) => {
        fn.call(null, data);
      });
    }
  }

  subscribe(eventName, fn) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(fn);

    return () => {
      this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
    };
  }
}

export default class Table {
  constructor() {
    this.elem = document.createElement('div');
    this.elem.className = 'table';

    this.elem.innerHTML = template();

    // Because of the promise in get-data.js
    setTimeout(() => {
      tableData = getData();
      tempTableData = tableData;
      this.renderTableRowsHTML();
    }, 0);

    newHTMLTags.forEach(Item => this.elem.insertBefore(new Item(), this.elem.lastElementChild));

    const tableControllers = new TableControllers();
    this.elem.getElementsByTagName('table-editor')[0].appendChild(tableControllers.elem);

    // Add row button
    this.addRowBtn = this.elem.querySelector('#add-row');
    this.addRowBtn.addEventListener('click', () => {
      if (selectedTableRow) {
        const selectedTableRowId = selectedTableRow.querySelector('input[type="hidden"').value;
        this.showConfirmingModalBox(selectedTableRowId);
      } else {
        this.addEmptyRow();
      }
    });

    // Saves value of selected table cell
    this.elem.addEventListener('focus', (e) => {
      if (e.target.classList.contains('table-cell-data')) {
        selectedTableCell = e.target.firstChild.data;
      } else {
        selectedTableCell = null;
      }
    }, true);

    // Updates tableData when table cell loses focus
    // if table cell was changed
    this.elem.addEventListener('blur', (e) => {
      if (e.target.classList.contains('table-cell-data')) {
        if (e.target.firstChild.data !== selectedTableCell) {
          this.updateTableData(e);
        }
      }
    }, true);

    // Highlights table row onclick
    document.body.addEventListener('click', (e) => {
      if (e.target.parentNode.classList.contains('table-row-data')) {
        this.highlightTableRow(e.target.parentNode);
      } else if (!e.target.parentNode.classList.contains('table-controllers-buttons')) {
        this.removeHighlightTableRow();
      }
    });

    // Prevents line-breaking from pressing Enter
    this.elem.addEventListener('keypress', (e) => {
      if (e.target.classList.contains('table-cell-data')) {
        if (e.which === 13) {
          e.preventDefault();
        }
      }
    });
  }

  renderTableRowsHTML() {
    const tableRowsElems = new TableRows(tableData).elem.querySelectorAll('.table-row');
    const tableRowsArray = Array.from(tableRowsElems);

    const tableRowsContainer = this.elem.querySelector('#main-table');

    tableRowsArray.forEach((item) => {
      tableRowsContainer.appendChild(item);
    });
  }

  updateTableData(e) {
    const id = e.target.parentNode.firstElementChild.value;
    const newValue = e.target.firstChild.data;
    const field = e.target.getAttribute('data-field');

    tableData[id][field] = newValue;
  }

  addEmptyRow(options) {
    const emptyRow = {
      id: JSON.stringify(tableData.length),
      name: ' ',
      age: ' ',
      city: ' '
    };

    if (options) {
      switch (options.pos) {
        case 'insert-before':
          tableData.splice(options.id, 0, emptyRow);
          this.renderNewEmptyRowInsert(options.id);
          break;
        default:
          tableData.splice(+options.id + 1, 0, emptyRow);
          this.renderNewEmptyRowInsert(+options.id + 1);
          break;
      }
    } else {
      tableData.push(emptyRow);
      this.renderNewEmptyRow();
    }
  }

  // TODO: make it look ok
  renderNewEmptyRow() {
    const emptyRowHTML = new TableRows([tableData[tableData.length - 1]]).elem.querySelector('.table-row');
    this.elem.querySelector('#main-table').appendChild(emptyRowHTML);
  }

  renderNewEmptyRowInsert(id) {
    const emptyRowHTML = new TableRows([tableData[id]]).elem.querySelector('.table-row');
    const mainTable = this.elem.querySelector('#main-table');
    mainTable.insertBefore(emptyRowHTML, mainTable.children[+id + 1]);
  }

  showCover() {
    const coverDiv = document.createElement('div');
    coverDiv.id = 'cover-div';
    document.body.appendChild(coverDiv);

    return coverDiv;
  }

  showConfirmingModalBox(id) {
    const coverDiv = this.showCover();

    const modalBox = document.createElement('div');
    modalBox.classList.add('modal-box');
    modalBox.innerHTML = templateModalBox();
    document.body.appendChild(modalBox);

    // create separate function for removing form
    modalBox.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.addEmptyRow({
          id,
          pos: e.target.id
        });
        document.body.removeChild(modalBox);
        coverDiv.parentNode.removeChild(coverDiv);
      } else if (e.target.classList.contains('modal-box')) {
        e.target.parentNode.removeChild(e.target);
        coverDiv.parentNode.removeChild(coverDiv);
      }
    });
  }

  highlightTableRow(node) {
    if (selectedTableRow) {
      selectedTableRow.classList.remove('selected');
    }
    selectedTableRow = node;
    selectedTableRow.classList.add('selected');
  }

  removeHighlightTableRow() {
    if (selectedTableRow) {
      selectedTableRow.classList.remove('selected');
      selectedTableRow = null;
    }
  }
}
