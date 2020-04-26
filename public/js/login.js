const register = document.getElementById('register');
const login = document.getElementById('login');
const invalidErrorElement = document.querySelector('.invalid-error');
const emptyUserErrorElement = document.querySelector('.empty-user');
const emptyPasswordErrorElement = document.querySelector('.empty-password');
const userExistsErrorElement = document.querySelector('.user-exists');

function toggleError(errorElement, hideError) {
  if (typeof hideError === 'undefined'|| hideError) {
    errorElement.classList.add('hide-error');
  } else {
    errorElement.classList.remove('hide-error');
  }
}

function sendRequest(url) {
  const form = document.querySelector('form');
  const formData = new FormData(form);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: formData.get('username'),
      password: formData.get('password')
    })
  })
  .then(res => res.json())
  .then (res => {
    toggleError(emptyUserErrorElement, res.username);
    toggleError(emptyPasswordErrorElement, res.password);
    toggleError(userExistsErrorElement, !res.userExists);
    toggleError(invalidErrorElement, res.authenticated);
    return res;
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

register.addEventListener('click', () => {
  sendRequest('/register').then(({ registered }) => {
    if (registered) window.location.href = '/chat';
  });;
});

login.addEventListener('click', () => {
  sendRequest('/login').then(({ authenticated }) => {
    if (authenticated) window.location.href = '/chat';
  });
});