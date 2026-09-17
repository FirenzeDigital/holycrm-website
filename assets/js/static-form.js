const url =
  'https://script.google.com/macros/s/AKfycbw6N8ZkxQ-BIg1m504SRnp8NJY2EcoVzolSm9WoPb-q0mDLlFfYzbXDV67i-YFsoUro/exec';

document
  .getElementById('contact-form')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Successful', data);
        this.reset();
      })
      .catch((err) => console.log('err', err));
  });
