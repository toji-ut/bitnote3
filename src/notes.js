import { pb } from './pocketbase/pocketbase';

let currentUser = pb.authStore.model?.id;

async function displayNotes() {
  try {
    const allNotes = await pb.collection('notes').getList(1, 100, {
      sort: 'created',
      author: currentUser,
      cache: 'no-store',
    });

    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = '';

    if (allNotes && Array.isArray(allNotes.items)) {
      allNotes.items.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.id = note.id;
        noteItem.classList.add('note-container');

        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = `
          <h3>${note.title}</h3>
          <p>${note.content}</p>
          <small>Created: ${formatTime(note.created)}</small>
        `;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('editNoteButton');
        editButton.dataset.id = note.id;
        editButton.addEventListener('click', () => editNoteButton(note.id)); 

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteNoteButton');
        deleteButton.dataset.id = note.id;
        deleteButton.addEventListener('click', () => deleteNoteButton(note.id));

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('note-buttons');
        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(deleteButton);

        noteItem.appendChild(noteContent);
        noteItem.appendChild(buttonsContainer);

        notesContainer.appendChild(noteItem);
      });
    }
  } catch (error) {
    console.error('Error displaying notes:', error);
  }
}

async function createNote() {
  try {
    const noteTitle = document.getElementById('noteTitle').value;
    const noteContent = document.getElementById('noteContent').value;

    if (!noteTitle || !noteContent) {
      alert('Please enter both a title and content for the note.');
      return;
    }

    await pb.collection('notes').create({
      title: noteTitle,
      content: noteContent,
      author: currentUser,
    });

    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';

    displayNotes();
  } catch (error) {
    console.error('Error creating note:', error);
  }
}

async function editNoteButton(noteId) {
  try {
    const newTitle = prompt('Enter the updated title for the note:');
    const newContent = prompt('Enter the updated content for the note:');
    
    if (newTitle === null || newContent === null || newTitle === '' || newContent === '') {
      return;
    }

    const updatedNote = await pb.collection('notes').update(noteId, { title: newTitle, content: newContent });
    console.log('Note updated:', updatedNote);

    displayNotes();
  } catch (error) {
    console.error('Error updating note:', error);
  }
}

async function deleteNoteButton(noteId) {
  try {
    console.log('Attempting to delete note with ID:', noteId);

    const deleted = await pb.collection('notes').delete(noteId);
    const deletedNoteElement = document.getElementById(noteId);
    if (deletedNoteElement) {
      deletedNoteElement.remove();
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

function formatTime(created) {
  const date = new Date(created);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function signOutButton() {
  pb.authStore.clear();
  window.location.href = "../index.html";
}

const userInfoElement = document.getElementById('userInfo');

function displayCurrentUser() {
  if (currentUser) {
    const currentUserInfo = document.createElement('p');
    currentUserInfo.textContent = `Signed in as: ${pb.authStore.model?.username}`; 

    userInfoElement.innerHTML = '';
    userInfoElement.appendChild(currentUserInfo);
  } else {
    userInfoElement.textContent = 'Not signed in.';
  }
}

displayCurrentUser();

document.getElementById('addNoteButton').addEventListener('click', createNote);

document.getElementById('signOutButton').addEventListener('click', signOutButton);

displayNotes();
