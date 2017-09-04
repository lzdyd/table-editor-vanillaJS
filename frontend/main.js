'use strict';

import 'normalize.css';

/*import TableLoadForm from './table-load-form';

const tableLoadForm = new TableLoadForm();

document.body.appendChild(tableLoadForm.elem);*/

/*
document.getElementById('load-table').onclick = () => {
  document.body.removeChild(tableLoadForm.elem);

  require.ensure([], (require) => {
    const Table = require('./table').default;

    const table = new Table();

    document.body.appendChild(table.elem);
  });
};
*/

import Table from './table';
//const Table = require('./table').default;

const table = new Table();

document.body.appendChild(table.elem);
//document.body.insertBefore(table.elem, document.body.getElementsByTagName('script')[0]);
