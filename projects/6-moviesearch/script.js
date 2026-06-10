const API_KEY = 'c8a522fb';
const BASE_URL = 'https://www.omdbapi.com/';

// ── STATE ──
let state = {
  query: '',
  page: 1,
  totalPages: 1,
  results: [],
  activeView: 'search',
  lastDetailImdbId: null,
  genre: '',
  year: '',
  debounceTimer: null,
};

// ── DOM ──
const searchInput       = document.getElementById('searchInput');
const searchBtn         = document.getElementById('searchBtn');
const headerSearchInput = document.getElementById('headerSearchInput');
const headerSearchBtn   = document.getElementById('headerSearchBtn');
const movieGrid         = document.getElementById('movieGrid');
const favGrid           = document.getElementById('favGrid');
const pagination        = document.getElementById('pagination');
const statusEl          = document.getElementById('status');
const favStatusEl       = document.getElementById('favStatus');
const detailContainer   = document.getElementById('detailContainer');
const backBtn           = document.getElementById('backBtn');
const favCount          = document.getElementById('favCount');
const genreFilter       = document.getElementById('genreFilter');
const yearFilter        = document.getElementById('yearFilter');
const genreFilter2      = document.getElementById('genreFilter2');
const yearFilter2       = document.getElementById('yearFilter2');
const clearFavBtn       = document.getElementById('clearFavBtn');
const logoBtn           = document.getElementById('logoBtn');
const pageLoader        = document.getElementById('pageLoader');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchBtn   = document.getElementById('mobileSearchBtn');

// ── LOADER ──
function showLoader() { pageLoader.classList.add('visible'); }
function hideLoader() { pageLoader.classList.remove('visible'); }

// ── FAVOURITES ──
function getFavs() {
  return JSON.parse(localStorage.getItem('cinevault_favs') || '[]');
}
function saveFavs(favs) {
  localStorage.setItem('cinevault_favs', JSON.stringify(favs));
  updateFavCount();
}
function isFav(imdbId) {
  return getFavs().some(f => f.imdbID === imdbId);
}
function toggleFav(movie) {
  let favs = getFavs();
  if (isFav(movie.imdbID)) {
    favs = favs.filter(f => f.imdbID !== movie.imdbID);
  } else {
    favs.push(movie);
  }
  saveFavs(favs);
  return isFav(movie.imdbID);
}
function updateFavCount() {
  favCount.textContent = getFavs().length;
}

// ── YEAR FILTER ──
function populateYears() {
  const current = new Date().getFullYear();
  for (let y = current; y >= 1950; y--) {
    [yearFilter, yearFilter2].forEach(sel => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      sel.appendChild(opt);
    });
  }
}

// ── API ──
async function searchMovies(query, page = 1, year = '') {
  let url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`;
  if (year) url += `&y=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

async function fetchDetail(imdbId) {
  const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbId}&plot=full`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

// ── GENRE FILTER ──
function filterByGenre(movies, genre) {
  if (!genre) return movies;
  return movies.filter(m => m.Genre && m.Genre.toLowerCase().includes(genre.toLowerCase()));
}

// ── RENDER ──
function renderSkeletons(count = 8) {
  movieGrid.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton">
      <div class="skeleton-poster"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  `).join('');
}

function renderMovieCard(movie, container) {
  const fav = isFav(movie.imdbID);
  const hasPoster = movie.Poster && movie.Poster !== 'N/A';
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    ${hasPoster
      ? `<img class="card-poster" src="${movie.Poster}" alt="${movie.Title}" loading="lazy" />`
      : `<div class="card-poster-placeholder">🎬</div>`}
    <button class="card-fav ${fav ? 'active' : ''}" data-id="${movie.imdbID}" title="Toggle favourite">
      ${fav ? '❤️' : '🤍'}
    </button>
    <div class="card-info">
      <div class="card-title">${movie.Title}</div>
      <div class="card-meta">
        <span>${movie.Year}</span>
        ${movie.imdbRating && movie.imdbRating !== 'N/A'
          ? `<span class="card-rating">★ ${movie.imdbRating}</span>`
          : ''}
      </div>
    </div>
  `;

  card.querySelector('.card-fav').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const nowFav = toggleFav(movie);
    btn.classList.toggle('active', nowFav);
    btn.textContent = nowFav ? '❤️' : '🤍';
    if (state.activeView === 'favourites') renderFavourites();
  });

  card.addEventListener('click', () => openDetail(movie.imdbID));
  container.appendChild(card);
}

function renderGrid(movies) {
  movieGrid.innerHTML = '';
  if (!movies.length) {
    setStatus('No movies found. Try a different search.');
    return;
  }
  setStatus('');
  movies.forEach(m => renderMovieCard(m, movieGrid));
}

function renderPagination(current, total) {
  pagination.innerHTML = '';
  if (total <= 1) return;

  const clamp = (n) => Math.max(1, Math.min(n, total));

  const addBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = `page-btn${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.disabled = disabled;
    btn.addEventListener('click', () => {
      state.page = clamp(page);
      doSearch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(btn);
  };

  const addEllipsis = () => {
    const span = document.createElement('span');
    span.className = 'page-ellipsis';
    span.textContent = '…';
    pagination.appendChild(span);
  };

  addBtn('←', current - 1, current === 1);

  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  pages.forEach(p => {
    if (p === '...') { addEllipsis(); return; }
    addBtn(p, p, false, p === current);
  });

  addBtn('→', current + 1, current === total);
}

// ── DETAIL VIEW ──
async function openDetail(imdbId) {
  showView('detail');
  state.lastDetailImdbId = imdbId;
  detailContainer.innerHTML = '<div class="status">Loading...</div>';

  try {
    const movie = await fetchDetail(imdbId);
    if (movie.Response === 'False') throw new Error(movie.Error);

    const fav = isFav(movie.imdbID);
    const hasPoster = movie.Poster && movie.Poster !== 'N/A';
    const genres = movie.Genre && movie.Genre !== 'N/A' ? movie.Genre.split(', ') : [];

    detailContainer.innerHTML = `
      <div>
        ${hasPoster
          ? `<img class="detail-poster" src="${movie.Poster}" alt="${movie.Title}" />`
          : `<div class="detail-poster-placeholder">🎬</div>`}
      </div>
      <div class="detail-info">
        <div class="detail-genre-tags">
          ${genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}
        </div>
        <h1 class="detail-title">${movie.Title}</h1>
        <div class="detail-meta">
          ${movie.imdbRating && movie.imdbRating !== 'N/A' ? `
            <div class="detail-rating">★ ${movie.imdbRating}
              <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem">/ 10</span>
            </div>` : ''}
          <span class="detail-meta-item">${movie.Year}</span>
          ${movie.Runtime && movie.Runtime !== 'N/A' ? `<span class="detail-meta-item">${movie.Runtime}</span>` : ''}
          ${movie.Rated && movie.Rated !== 'N/A' ? `<span class="detail-meta-item">${movie.Rated}</span>` : ''}
        </div>
        <p class="detail-plot">${movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.'}</p>
        <div class="detail-credits">
          ${movie.Director && movie.Director !== 'N/A' ? `
            <div class="credit-block">
              <div class="credit-label">Director</div>
              <div class="credit-value">${movie.Director}</div>
            </div>` : ''}
          ${movie.Actors && movie.Actors !== 'N/A' ? `
            <div class="credit-block">
              <div class="credit-label">Cast</div>
              <div class="credit-value">${movie.Actors}</div>
            </div>` : ''}
          ${movie.Writer && movie.Writer !== 'N/A' ? `
            <div class="credit-block">
              <div class="credit-label">Writer</div>
              <div class="credit-value">${movie.Writer}</div>
            </div>` : ''}
          ${movie.BoxOffice && movie.BoxOffice !== 'N/A' ? `
            <div class="credit-block">
              <div class="credit-label">Box Office</div>
              <div class="credit-value">${movie.BoxOffice}</div>
            </div>` : ''}
        </div>
        <button class="detail-fav-btn ${fav ? 'active' : ''}" id="detailFavBtn">
          ${fav ? '❤️ In Favourites' : '🤍 Add to Favourites'}
        </button>
      </div>
    `;

    document.getElementById('detailFavBtn').addEventListener('click', () => {
      const nowFav = toggleFav({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        imdbRating: movie.imdbRating,
      });
      const btn = document.getElementById('detailFavBtn');
      btn.classList.toggle('active', nowFav);
      btn.innerHTML = nowFav ? '❤️ In Favourites' : '🤍 Add to Favourites';
    });

  } catch (err) {
    detailContainer.innerHTML = `<div class="status error">Failed to load movie details. Try again.</div>`;
  }
}

// ── FAVOURITES VIEW ──
function renderFavourites() {
  favGrid.innerHTML = '';
  const favs = getFavs();
  if (!favs.length) {
    favStatusEl.textContent = 'No favourites yet. Heart a movie to save it here.';
    return;
  }
  favStatusEl.textContent = '';
  favs.forEach(m => renderMovieCard(m, favGrid));
}

// ── SEARCH ──
async function doSearch(resetPage = false) {
  if (resetPage) state.page = 1;
  const query = state.query.trim();

  if (!query) {
    setStatus('Type something to search for movies.');
    movieGrid.innerHTML = '';
    pagination.innerHTML = '';
    return;
  }

  // Trigger the hero→header transition
  document.body.classList.add('searched');
  // Sync both inputs
  searchInput.value = query;
  headerSearchInput.value = query;
  mobileSearchInput.value = query;

  showLoader();
  renderSkeletons();
  setStatus('');
  searchBtn.disabled = true;
  headerSearchBtn.disabled = true;

  try {
    const data = await searchMovies(query, state.page, state.year);

    if (data.Response === 'False') {
      movieGrid.innerHTML = '';
      pagination.innerHTML = '';
      setStatus(data.Error === 'Movie not found!' ? 'No results found. Try a different title.' : data.Error);
      return;
    }

    let movies = data.Search || [];
    state.totalPages = Math.ceil(parseInt(data.totalResults) / 10);

    // Genre filter — requires fetching full detail per card
    if (state.genre && movies.length) {
      setStatus('Filtering by genre...');
      const detailed = await Promise.all(
        movies.map(m => fetchDetail(m.imdbID).catch(() => null))
      );
      movies = detailed.filter(m => m && m.Response !== 'False' && filterByGenre([m], state.genre).length > 0);
      if (!movies.length) {
        movieGrid.innerHTML = '';
        pagination.innerHTML = '';
        setStatus(`No "${state.genre}" movies found for "${query}".`);
        return;
      }
    }

    state.results = movies;
    renderGrid(movies);
    renderPagination(state.page, state.totalPages);

  } catch (err) {
    movieGrid.innerHTML = '';
    setStatus('Something went wrong. Check your connection and try again.');
  } finally {
    hideLoader();
    searchBtn.disabled = false;
    headerSearchBtn.disabled = false;
  }
}

// ── VIEWS ──
function showView(view) {
  state.activeView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  if (view === 'search') {
    document.getElementById('searchView').classList.add('active');
    document.querySelector('[data-view="search"]').classList.add('active');
  } else if (view === 'detail') {
    document.getElementById('detailView').classList.add('active');
  } else if (view === 'favourites') {
    document.getElementById('favouritesView').classList.add('active');
    document.querySelector('[data-view="favourites"]').classList.add('active');
    renderFavourites();
  }
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (isError ? ' error' : '');
}

// ── EVENTS ──

// Hero search
searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => doSearch(true), 500);
});
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(state.debounceTimer);
    state.query = searchInput.value;
    doSearch(true);
  }
});
searchBtn.addEventListener('click', () => {
  state.query = searchInput.value;
  doSearch(true);
});

// Header search
headerSearchInput.addEventListener('input', () => {
  state.query = headerSearchInput.value;
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => doSearch(true), 500);
});
headerSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(state.debounceTimer);
    state.query = headerSearchInput.value;
    doSearch(true);
  }
});
headerSearchBtn.addEventListener('click', () => {
  state.query = headerSearchInput.value;
  doSearch(true);
});

// Filters — hero
genreFilter.addEventListener('change', () => {
  state.genre = genreFilter.value;
  genreFilter2.value = genreFilter.value;
  if (state.query) doSearch(true);
});
yearFilter.addEventListener('change', () => {
  state.year = yearFilter.value;
  yearFilter2.value = yearFilter.value;
  if (state.query) doSearch(true);
});

// Filters — post-search bar
genreFilter2.addEventListener('change', () => {
  state.genre = genreFilter2.value;
  genreFilter.value = genreFilter2.value;
  if (state.query) doSearch(true);
});
yearFilter2.addEventListener('change', () => {
  state.year = yearFilter2.value;
  yearFilter.value = yearFilter2.value;
  if (state.query) doSearch(true);
});

// Back button
backBtn.addEventListener('click', () => showView('search'));

// Logo — reset to home
logoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  document.body.classList.remove('searched');
  searchInput.value = '';
  headerSearchInput.value = '';
  state.query = '';
  state.genre = '';
  state.year = '';
  genreFilter.value = '';
  genreFilter2.value = '';
  yearFilter.value = '';
  yearFilter2.value = '';
  movieGrid.innerHTML = '';
  pagination.innerHTML = '';
  setStatus('Search for any movie to get started.');
  showView('search');
});

// Nav tabs
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => showView(tab.dataset.view));
});

// Clear favs
clearFavBtn.addEventListener('click', () => {
  if (confirm('Clear all favourites?')) {
    saveFavs([]);
    renderFavourites();
  }
});

mobileSearchInput.addEventListener('input', () => {
  state.query = mobileSearchInput.value;
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => doSearch(true), 500);
});
mobileSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(state.debounceTimer);
    state.query = mobileSearchInput.value;
    doSearch(true);
  }
});
mobileSearchBtn.addEventListener('click', () => {
  state.query = mobileSearchInput.value;
  doSearch(true);
});

// ── INIT ──
populateYears();
updateFavCount();
setStatus('Search for any movie to get started.');