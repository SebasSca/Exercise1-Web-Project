const bookForm = document.getElementById("book-form");
const bookStatus = document.getElementById("book-status");
const bookResults = document.getElementById("book-results");

async function searchBooks(title) {
  bookResults.innerHTML = "";
  bookStatus.className = "";
  bookStatus.textContent = "Loading...";
  try {
    const url =
      "https://openlibrary.org/search.json?limit=10&fields=key,title,author_name,first_publish_year&title=" +
      encodeURIComponent(title);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Open Library responded with HTTP " + res.status);
    const data = await res.json();
    if (data.docs.length === 0) {
      bookStatus.textContent = "No books found.";
      return;
    }
    data.docs.forEach((b) => {
      const li = document.createElement("li");
      const authors = b.author_name ? b.author_name.join(", ") : "Unknown author";
      li.textContent = `${b.title} - ${authors} (${b.first_publish_year || "n/a"})`;
      bookResults.appendChild(li);
    });
    bookStatus.textContent = `${data.docs.length} result(s).`;
  } catch (err) {
    bookStatus.className = "error";
    bookStatus.textContent = "Search failed: " + err.message;
  }
}

bookForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const title = document.getElementById("book-title").value.trim();
  if (!title) {
    bookStatus.className = "error";
    bookStatus.textContent = "Please enter a title.";
    return;
  }
  searchBooks(title);
});