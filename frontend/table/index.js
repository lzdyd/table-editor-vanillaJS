'use strict';

import TableControllers from '../table-controllers';
import TableRows from '../table-rows';

import template from './table.hbs';
import templateModalBox from './modal-box.hbs';
import './table.scss';
import '../common/style.scss';

import getData from './get-data';
import sortData from './sort-data';

let tableData;
let tempTableData;
let selectedTableRow;
let selectedTableCell;
let showConfirmingModalBoxAnswer;
let lastId;

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
        const index = Array.prototype.indexOf.call(selectedTableRow.parentNode.children,
          selectedTableRow);
        this.showConfirmingModalBox(index - 1);
      } else {
        this.addEmptyRow();
      }
    });

    // Delete row button
    this.deleteRowBtn = this.elem.querySelector('#delete-row');
    this.deleteRowBtn.addEventListener('click', () => {
      if (selectedTableRow) {
        const selectedRowId = selectedTableRow.firstElementChild.value;
        this.deleteRow(selectedRowId);
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

    // Sorts data
    this.sortDataBtns = this.elem.querySelectorAll('.table-header');
    this.sortDataBtnsArray = Array.from(this.sortDataBtns);

    this.sortDataBtnsArray.forEach((item) => {
      item.addEventListener('click', () => {
        const sortedData = sortData(tableData, item.id, item.dataset.sortState);
        console.log(sortedData);
      });
    });

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

    lastId = tableRowsArray[tableRowsArray.length - 1].firstElementChild.value;
  }

  updateTableData(e) {
    const id = e.target.parentNode.firstElementChild.value;
    const newValue = e.target.firstChild.data;
    const field = e.target.getAttribute('data-field');

    //tableData[id][field] = newValue;

    for (let key in tableData) {
      if (tableData[key].id === id) {
        tableData[key][field] = newValue;
        break;
      }
    }
  }

  addEmptyRow(options) {
    lastId = +lastId + 1;
    const emptyRow = {
      id: JSON.stringify(lastId),
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

  deleteRow(id) {
    let i = 0;

    for (let key in tableData) {
      if (tableData[key].id === id) {
        break;
      }
      i += 1;
    }

    tableData.splice(i, 1);

    const mainTable = this.elem.querySelector('#main-table');
    const rowToDelete = mainTable.querySelector(`input[value="${i}"]`).parentNode;

    mainTable.removeChild(rowToDelete);

    //selectedTableRow = null;
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
