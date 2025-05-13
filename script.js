let currentPage = 0;
const limit = 5;

function fetchMovies(page = 0) {
  const search = document.getElementById('search').value;
  const year = document.getElementById('year').value;
  const offset = page * limit;

  let url = `http://localhost:3000/movies?limit=${limit}&offset=${offset}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (year) url += `&year=${encodeURIComponent(year)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      renderMovies(data);
      currentPage = page;
      document.getElementById('page-indicator').textContent = `Page ${currentPage + 1}`;
    });
}

function renderMovies(movies) {
  const container = document.getElementById('movie-list');
  container.innerHTML = '';
  if (movies.length === 0) {
    container.innerHTML = '<p>No movies found.</p>';
    return;
  }
  movies.forEach(movie => {
    const div = document.createElement('div');
    div.textContent = `${movie.title} (${movie.year}) - ${movie.genre}`;
    container.appendChild(div);
  });
}

function nextPage() {
  fetchMovies(currentPage + 1);
}

function previousPage() {
  if (currentPage > 0) {
    fetchMovies(currentPage - 1);
  }
}

document.getElementById('movie-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const genre = document.getElementById('genre').value;
  const year = document.getElementById('year').value;

  fetch('http://localhost:3000/movies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, genre, year })
  })
  .then(res => res.json())
  .then(data => {
    alert('Movie added!');
    fetchMovies(currentPage);
    document.getElementById('movie-form').reset();
  })
  .catch(err => {
    alert('Failed to add movie.');
    console.error(err);
  });
});
