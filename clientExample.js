// @ts-check


/**
 * @param {string} id
 */
async function doDeleteCar(id) {
  const response = await fetch(`/cars/${id}`, {
    method: 'delete'
  })

  if (!response.ok) {
    throw new Error('Delete failed')
  }
}

function doDeleteXHR(id) {

  const xhr = new XMLHttpRequest();
  xhr.open('delete', `/cars/${id}`);

  xhr.addEventListener('load', (e) => {

  });

  xhr.send();
}
