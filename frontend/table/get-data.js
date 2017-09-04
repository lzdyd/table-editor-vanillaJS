'use strict';

const get = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(Error(xhr.statusText));
      }
    };

    xhr.onerror = () => reject(Error('Network error'));

    xhr.send();
  });
};

let obj;

get('./data.json')
  .then((response) => {
    obj = JSON.parse(response).people;
  })
  .catch(error => console.error(error));

export default function () {
  return obj;
}
