document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  const resetButton = document.getElementById("resetSearch");
  resetButton.addEventListener("click", function () {
    document.getElementById("searchBookTitle").value = "";
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  function addBook() {
    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = Number(document.getElementById("bookFormYear").value);
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    const generateID = generateId();
    const bookObject = generateBookObject(
      generateID,
      title,
      author,
      year,
      isComplete
    );

    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function searchBook() {
    const searchTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchTitle)
    );
    renderSearchResults(filteredBooks);
  }

  function renderSearchResults(filteredBooks) {
    const uncompletedBookList = document.getElementById("incompleteBookList");
    const completedBookList = document.getElementById("completeBookList");

    uncompletedBookList.innerHTML = "";
    completedBookList.innerHTML = "";

    if (filteredBooks.length === 0) {
      const noResultsMessageUncompleted = document.createElement("p");
      noResultsMessageUncompleted.innerText = "Buku tidak ditemukan dalam rak.";
      uncompletedBookList.append(noResultsMessageUncompleted);

      const noResultsMessageCompleted = document.createElement("p");
      noResultsMessageCompleted.innerText = "Buku tidak ditemukan dalam rak.";
      completedBookList.append(noResultsMessageCompleted);
      return;
    }

    for (const bookItem of filteredBooks) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isComplete) {
        uncompletedBookList.append(bookElement);
      } else {
        completedBookList.append(bookElement);
      }
    }
  }

  function generateId() {
    return new Date().getTime();
  }

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  }
  
  const books = [];
  const RENDER_EVENT = "render-book";

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById("incompleteBookList");
    uncompletedBookList.innerHTML = "";

    const completedBookList = document.getElementById("completeBookList");
    completedBookList.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isComplete) uncompletedBookList.append(bookElement);
      else completedBookList.append(bookElement);
    }
  });

  function makeBook(bookObject) {
    const bookTitle = document.createElement("h3");
    bookTitle.innerText = bookObject.title;
    bookTitle.setAttribute("data-testid", "bookItemTitle");
 
    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = `Penulis: ${bookObject.author}`;
    bookAuthor.setAttribute("data-testid", "bookItemAuthor");
  
    const bookYear = document.createElement("p");
    bookYear.innerText = `Tahun: ${bookObject.year}`;
    bookYear.setAttribute("data-testid", "bookItemYear");
  
    const bookContainer = document.createElement("div");
    bookContainer.setAttribute("data-bookid", bookObject.id);
    bookContainer.setAttribute("data-testid", "bookItem");
  
    bookContainer.append(bookTitle, bookAuthor, bookYear);
  
    const bookAction = document.createElement("div");
  
    if (bookObject.isComplete) {
      const undoButton = document.createElement("button");
      undoButton.innerText = "Belum selesai dibaca";
      undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");
      undoButton.addEventListener("click", function () {
        undoBookFromComplete(bookObject.id);
      });
  
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Hapus buku";
      deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
      deleteButton.addEventListener("click", function () {
        deleteBook(bookObject.id);
      });
  
      const editButton = document.createElement("button");
      editButton.innerText = "Edit buku";
      editButton.setAttribute("data-testid", "bookItemEditButton");
      editButton.addEventListener("click", function () {
        openEditModal(bookObject.id);
      });
  
      bookAction.append(undoButton, deleteButton, editButton);
    } 
    else {
      const checkButton = document.createElement("button");
      checkButton.innerText = "Selesai dibaca";
      checkButton.setAttribute("data-testid", "bookItemIsCompleteButton");
      checkButton.addEventListener("click", function () {
        addBookToComplete(bookObject.id);
      });
  
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Hapus buku";
      deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
      deleteButton.addEventListener("click", function () {
        deleteBook(bookObject.id);
      });
  
      const editButton = document.createElement("button");
      editButton.innerText = "Edit buku";
      editButton.setAttribute("data-testid", "bookItemEditButton");
      editButton.addEventListener("click", function () {
        openEditModal(bookObject.id);
      });
  
      bookAction.append(checkButton, deleteButton, editButton);
    }

    bookContainer.append(bookAction);
  
    return bookContainer;
  }

  function addBookToComplete(bookId) {
    const bookIndex = findBookIndex(bookId);
    books[bookIndex].isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoBookFromComplete(bookId) {
    const bookIndex = findBookIndex(bookId);
    books[bookIndex].isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBookIndex(bookId) {
    for (let i = 0; i < books.length; i++) {
      if (books[i].id === bookId) {
        return i;
      }
    }
    return -1;
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  const STORAGE_KEY = "saved-book";
  const SAVED_EVENT = "bookshelf-apps";

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Browser Anda tidak mendukung local storage");
      return false;
    }
    return true;
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const bookItem of data) {
        books.push(bookItem);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const editBookModal = document.getElementById("editBookModal");
  const editForm = document.getElementById("editForm");
  const cancelButton = document.querySelector(".cancel-button");

  let editingBookId = null;

  function openEditModal(bookId) {
    editingBookId = bookId;
    const bookIndex = findBookIndex(bookId);
    const book = books[bookIndex];

    document.getElementById("editFormTitle").value = book.title;
    document.getElementById("editFormAuthor").value = book.author;
    document.getElementById("editFormYear").value = book.year;
    document.getElementById("editFormIsComplete").checked = book.isComplete;

    editBookModal.style.display = "flex";

    editForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (editingBookId === null) return;

      const bookIndex = findBookIndex(editingBookId);
      if (bookIndex === -1) return;

      books[bookIndex].title = document.getElementById("editFormTitle").value;
      books[bookIndex].author = document.getElementById("editFormAuthor").value;
      books[bookIndex].year = Number(document.getElementById("editFormYear").value);
      books[bookIndex].isComplete =
        document.getElementById("editFormIsComplete").checked;

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      editingBookId = null;
      closeEditModal();
    });
  }

  function closeEditModal() {
    editBookModal.style.display = "none";
  }

  cancelButton.addEventListener("click", function (event) {
    event.preventDefault();
    closeEditModal();
  });
});
