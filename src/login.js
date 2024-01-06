import { pb } from './pocketbase/pocketbase';

let username = '';
let password = '';
let errorMessage = '';

async function login() {
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  errorMessage = document.getElementById('errorMessage');

  if (!username || !password) {
    errorMessage.textContent = 'Please enter both a username and password.';
    return;
  }

  try {
    const user = await pb.collection('users').authWithPassword(username, password);
    console.log('Authentication successful: ', user);
    window.location.href = 'notes.html';

  } catch (error) {
    errorMessage.textContent = 'Incorrect username or password.';
  }
}

async function signUp() {
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  errorMessage = document.getElementById('errorMessage');

  if (!username || !password) {
    errorMessage.textContent = 'Please enter both a username and password.';
    return;
  }

  try {
    const data = {
      username,
      password,
      passwordConfirm: password,
      name: username,
    };
    const createdUser = await pb.collection('users').create(data);
    console.log("Created new account: ", createdUser);
  
    await login();
  } catch (error) {
    errorMessage.textContent = 'Error signing up. Please try again.';
  }
}

document.getElementById('loginButton').addEventListener('click', function(event) {
  event.preventDefault();
  login(); 
});
document.getElementById('signUpButton').addEventListener('click', function(event) {
  event.preventDefault(); 
  signUp();
});

