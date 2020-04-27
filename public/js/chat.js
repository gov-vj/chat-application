const usersElement = document.querySelector('aside ul');
const chatsElement = document.querySelector('.window');
const inputElement = document.querySelector('input[type="text"]');
const sendButton = document.querySelector('input[value="Send"]');
const updateOnlineUsers = users => {
  usersElement.innerHTML = '';
  users.forEach (user => {
    const userElement = document.createElement('li');
    userElement.innerText = user;
    usersElement.appendChild(userElement);
  });
}

const loadChats = chats => {
  chatsElement.innerHTML = '';
  chats.forEach(chat => {
    loadNewMessage(chat);
  });
}

const loadNewMessage = chat => {
  const el = document.createElement('p');
  el.innerHTML = `<span>${chat.username}: </span> ${chat.message}`;
  chatsElement.appendChild(el);
  chatsElement.lastChild.scrollIntoView({ behavior: 'smooth' });;
}

const webSocket = new WebSocket('ws://localhost:3000');
webSocket.onerror = () => alert('Couldnot connect to the erver. Make sure you are logged in.');
webSocket.onopen = () => webSocket.send(JSON.stringify({ event: 'REQ_HISTORY' }));

webSocket.onmessage = ({data}) => {
  const parsedData = JSON.parse(data);
  switch(parsedData.event) {
    case 'NEW_MESSAGE':
      loadNewMessage(parsedData.data);
      break;
    case 'MESSAGE_HISTORY':
      loadChats(parsedData.data);
      break;
    case 'USER_CONNECTED':
    case 'USER_DISCONNECTED':
      updateOnlineUsers(parsedData.data);
      break;
  }
}

sendButton.addEventListener('click', () => {
  webSocket.send(JSON.stringify({
    event: 'NEW_MESSAGE',
    data: inputElement.value
  }));

  inputElement.value = '';
});