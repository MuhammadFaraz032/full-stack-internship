'use strict';

// ─── CONFIG ──────────────────────────────────────────
const API_KEY = '527ef75332373e39f7db69c6252fb4c9';
const BASE    = 'https://api.openweathermap.org/data/2.5/weather';

// ─── CITIES LIST ─────────────────────────────────────
const CITIES = [
  // Pakistan
  {name:'Karachi',country:'PK'},{name:'Lahore',country:'PK'},{name:'Islamabad',country:'PK'},
  {name:'Rawalpindi',country:'PK'},{name:'Faisalabad',country:'PK'},{name:'Multan',country:'PK'},
  {name:'Peshawar',country:'PK'},{name:'Quetta',country:'PK'},{name:'Hyderabad',country:'PK'},
  // USA
  {name:'New York',country:'US'},{name:'Los Angeles',country:'US'},{name:'Chicago',country:'US'},
  {name:'Houston',country:'US'},{name:'Phoenix',country:'US'},{name:'Philadelphia',country:'US'},
  {name:'San Antonio',country:'US'},{name:'San Diego',country:'US'},{name:'Dallas',country:'US'},
  {name:'San Francisco',country:'US'},{name:'Seattle',country:'US'},{name:'Miami',country:'US'},
  {name:'Boston',country:'US'},{name:'Denver',country:'US'},{name:'Las Vegas',country:'US'},
  // UK
  {name:'London',country:'GB'},{name:'Manchester',country:'GB'},{name:'Birmingham',country:'GB'},
  {name:'Leeds',country:'GB'},{name:'Glasgow',country:'GB'},{name:'Edinburgh',country:'GB'},
  {name:'Liverpool',country:'GB'},{name:'Bristol',country:'GB'},{name:'Sheffield',country:'GB'},
  // Europe
  {name:'Paris',country:'FR'},{name:'Lyon',country:'FR'},{name:'Marseille',country:'FR'},
  {name:'Berlin',country:'DE'},{name:'Munich',country:'DE'},{name:'Hamburg',country:'DE'},
  {name:'Frankfurt',country:'DE'},{name:'Cologne',country:'DE'},
  {name:'Madrid',country:'ES'},{name:'Barcelona',country:'ES'},{name:'Seville',country:'ES'},
  {name:'Rome',country:'IT'},{name:'Milan',country:'IT'},{name:'Naples',country:'IT'},
  {name:'Amsterdam',country:'NL'},{name:'Brussels',country:'BE'},{name:'Zurich',country:'CH'},
  {name:'Vienna',country:'AT'},{name:'Prague',country:'CZ'},{name:'Warsaw',country:'PL'},
  {name:'Budapest',country:'HU'},{name:'Lisbon',country:'PT'},{name:'Athens',country:'GR'},
  {name:'Stockholm',country:'SE'},{name:'Oslo',country:'NO'},{name:'Copenhagen',country:'DK'},
  {name:'Helsinki',country:'FI'},{name:'Kyiv',country:'UA'},{name:'Bucharest',country:'RO'},
  // Middle East
  {name:'Dubai',country:'AE'},{name:'Abu Dhabi',country:'AE'},{name:'Riyadh',country:'SA'},
  {name:'Jeddah',country:'SA'},{name:'Doha',country:'QA'},{name:'Kuwait City',country:'KW'},
  {name:'Muscat',country:'OM'},{name:'Manama',country:'BH'},{name:'Beirut',country:'LB'},
  {name:'Amman',country:'JO'},{name:'Baghdad',country:'IQ'},{name:'Tehran',country:'IR'},
  // South Asia
  {name:'Mumbai',country:'IN'},{name:'Delhi',country:'IN'},{name:'Bangalore',country:'IN'},
  {name:'Hyderabad',country:'IN'},{name:'Chennai',country:'IN'},{name:'Kolkata',country:'IN'},
  {name:'Pune',country:'IN'},{name:'Ahmedabad',country:'IN'},{name:'Jaipur',country:'IN'},
  {name:'Dhaka',country:'BD'},{name:'Chittagong',country:'BD'},
  {name:'Colombo',country:'LK'},{name:'Kathmandu',country:'NP'},{name:'Kabul',country:'AF'},
  // East Asia
  {name:'Tokyo',country:'JP'},{name:'Osaka',country:'JP'},{name:'Kyoto',country:'JP'},
  {name:'Beijing',country:'CN'},{name:'Shanghai',country:'CN'},{name:'Guangzhou',country:'CN'},
  {name:'Shenzhen',country:'CN'},{name:'Chengdu',country:'CN'},{name:'Wuhan',country:'CN'},
  {name:'Seoul',country:'KR'},{name:'Busan',country:'KR'},{name:'Taipei',country:'TW'},
  {name:'Hong Kong',country:'HK'},{name:'Singapore',country:'SG'},
  // Southeast Asia
  {name:'Bangkok',country:'TH'},{name:'Jakarta',country:'ID'},{name:'Manila',country:'PH'},
  {name:'Kuala Lumpur',country:'MY'},{name:'Ho Chi Minh City',country:'VN'},{name:'Hanoi',country:'VN'},
  {name:'Yangon',country:'MM'},{name:'Phnom Penh',country:'KH'},
  // Africa
  {name:'Cairo',country:'EG'},{name:'Lagos',country:'NG'},{name:'Nairobi',country:'KE'},
  {name:'Johannesburg',country:'ZA'},{name:'Cape Town',country:'ZA'},{name:'Casablanca',country:'MA'},
  {name:'Accra',country:'GH'},{name:'Addis Ababa',country:'ET'},{name:'Tunis',country:'TN'},
  {name:'Algiers',country:'DZ'},{name:'Khartoum',country:'SD'},
  // Americas
  {name:'Toronto',country:'CA'},{name:'Vancouver',country:'CA'},{name:'Montreal',country:'CA'},
  {name:'Calgary',country:'CA'},{name:'Ottawa',country:'CA'},
  {name:'Mexico City',country:'MX'},{name:'Guadalajara',country:'MX'},{name:'Monterrey',country:'MX'},
  {name:'São Paulo',country:'BR'},{name:'Rio de Janeiro',country:'BR'},{name:'Brasilia',country:'BR'},
  {name:'Buenos Aires',country:'AR'},{name:'Santiago',country:'CL'},{name:'Lima',country:'PE'},
  {name:'Bogota',country:'CO'},{name:'Caracas',country:'VE'},{name:'Quito',country:'EC'},
  // Oceania
  {name:'Sydney',country:'AU'},{name:'Melbourne',country:'AU'},{name:'Brisbane',country:'AU'},
  {name:'Perth',country:'AU'},{name:'Adelaide',country:'AU'},{name:'Auckland',country:'NZ'},
  {name:'Wellington',country:'NZ'},
  // Russia & Central Asia
  {name:'Moscow',country:'RU'},{name:'Saint Petersburg',country:'RU'},{name:'Novosibirsk',country:'RU'},
  {name:'Almaty',country:'KZ'},{name:'Tashkent',country:'UZ'},{name:'Baku',country:'AZ'},
  {name:'Tbilisi',country:'GE'},{name:'Yerevan',country:'AM'},
];

// ─── STATE ───────────────────────────────────────────
let isCelsius     = true;
let lastData      = null;
let activeIndex   = -1;
let suggestions   = [];

// ─── DOM ─────────────────────────────────────────────
const searchInput   = document.getElementById('searchInput');
const searchBtn     = document.getElementById('searchBtn');
const suggestionsEl = document.getElementById('suggestions');
const unitToggle    = document.getElementById('unitToggle');
const unitC         = document.getElementById('unitC');
const unitF         = document.getElementById('unitF');
const loadingState  = document.getElementById('loadingState');
const errorState    = document.getElementById('errorState');
const errorMsg      = document.getElementById('errorMsg');
const weatherCard   = document.getElementById('weatherCard');
const idleState     = document.getElementById('idleState');
const particles     = document.getElementById('particles');

const cityName      = document.getElementById('cityName');
const countryDate   = document.getElementById('countryDate');
const weatherIcon   = document.getElementById('weatherIcon');
const tempMain      = document.getElementById('tempMain');
const conditionText = document.getElementById('conditionText');
const feelsLike     = document.getElementById('feelsLike');
const humidity      = document.getElementById('humidity');
const windSpeed     = document.getElementById('windSpeed');
const visibility    = document.getElementById('visibility');
const pressure      = document.getElementById('pressure');

// ─── AUTOCOMPLETE ────────────────────────────────────
function getSuggestions(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return CITIES
    .filter(c => c.name.toLowerCase().startsWith(q))
    .slice(0, 6);
}

function renderSuggestions(list) {
  suggestions = list;
  activeIndex = -1;
  suggestionsEl.innerHTML = '';

  if (!list.length) {
    suggestionsEl.classList.remove('open');
    return;
  }

  list.forEach((city, i) => {
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.innerHTML = `
      <span class="sug-icon">📍</span>
      <span>${city.name}</span>
      <span class="sug-country">${city.country}</span>
    `;
    li.addEventListener('mousedown', e => {
      e.preventDefault(); // prevent blur before click
      selectSuggestion(city.name);
    });
    suggestionsEl.appendChild(li);
  });

  suggestionsEl.classList.add('open');
}

function selectSuggestion(name) {
  searchInput.value = name;
  suggestionsEl.classList.remove('open');
  fetchWeather(name);
}

function highlightSuggestion(idx) {
  const items = suggestionsEl.querySelectorAll('.suggestion-item');
  items.forEach(el => el.classList.remove('active-suggestion'));
  if (idx >= 0 && idx < items.length) {
    items[idx].classList.add('active-suggestion');
    searchInput.value = suggestions[idx].name;
  }
}

// ─── UI STATE ────────────────────────────────────────
function showLoading() {
  loadingState.classList.add('visible');
  errorState.classList.remove('visible');
  weatherCard.classList.remove('visible');
  idleState.style.display = 'none';
  searchBtn.disabled = true;
  suggestionsEl.classList.remove('open');
}

function showError(msg) {
  loadingState.classList.remove('visible');
  errorState.classList.add('visible');
  weatherCard.classList.remove('visible');
  idleState.style.display = 'none';
  errorMsg.textContent = msg;
  searchBtn.disabled = false;
  document.body.classList.add('has-result');
}

function showWeather() {
  loadingState.classList.remove('visible');
  errorState.classList.remove('visible');
  weatherCard.classList.add('visible');
  idleState.style.display = 'none';
  searchBtn.disabled = false;
  document.body.classList.add('has-result');
}

function showIdle() {
  loadingState.classList.remove('visible');
  errorState.classList.remove('visible');
  weatherCard.classList.remove('visible');
  idleState.style.display = 'flex';
  searchBtn.disabled = false;
}

// ─── FETCH ───────────────────────────────────────────
async function fetchWeather(city) {
  if (!city.trim()) return;
  showLoading();
  try {
    const url = `${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (res.status === 404) { showError('City not found'); return; }
    if (res.status === 401) { showError('API key not yet active — try again in a few minutes'); return; }
    if (!res.ok)            { showError('Something went wrong'); return; }
    const data = await res.json();
    lastData = data;
    renderWeather(data);
    showWeather();
    applyTheme(data);
    renderParticles(data);
  } catch (err) {
    showError('Network error — check your connection');
  }
}

// ─── RENDER ──────────────────────────────────────────
function renderWeather(data) {
  const tempC  = data.main.temp;
  const feelsC = data.main.feels_like;
  const windMs = data.wind.speed;
  const temp   = isCelsius ? Math.round(tempC)  : cToF(tempC);
  const feels  = isCelsius ? Math.round(feelsC) : cToF(feelsC);
  const unit   = isCelsius ? '°C' : '°F';
  const wind   = isCelsius ? `${Math.round(windMs)} m/s` : `${Math.round(windMs * 2.237)} mph`;

  cityName.textContent      = data.name;
  countryDate.textContent   = `${data.sys.country} · ${getLocalTime(data.timezone)}`;
  weatherIcon.src           = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt           = data.weather[0].description;
  tempMain.textContent      = `${temp}${unit}`;
  conditionText.textContent = data.weather[0].description;
  feelsLike.textContent     = `Feels like ${feels}${unit}`;
  humidity.textContent      = `${data.main.humidity}%`;
  windSpeed.textContent     = wind;
  visibility.textContent    = data.visibility ? `${(data.visibility/1000).toFixed(1)} km` : 'N/A';
  pressure.textContent      = `${data.main.pressure} hPa`;
}

// ─── UNIT TOGGLE ─────────────────────────────────────
function cToF(c) { return Math.round(c * 9/5 + 32); }

unitToggle.addEventListener('click', () => {
  isCelsius = !isCelsius;
  unitC.classList.toggle('active-unit',  isCelsius);
  unitF.classList.toggle('active-unit', !isCelsius);
  if (lastData) renderWeather(lastData);
});

// ─── LOCAL TIME ──────────────────────────────────────
function getLocalTime(offset) {
  const utc   = Date.now() + new Date().getTimezoneOffset() * 60000;
  const local = new Date(utc + offset * 1000);
  return local.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
}

// ─── THEME ───────────────────────────────────────────
function applyTheme(data) {
  const id = data.weather[0].id;
  const isNight = data.weather[0].icon.includes('n');
  document.body.className = 'has-result';
  if      (id >= 200 && id < 300) document.body.classList.add('theme-thunderstorm');
  else if (id >= 300 && id < 600) document.body.classList.add('theme-rain');
  else if (id >= 600 && id < 700) document.body.classList.add('theme-snow');
  else if (id >= 700 && id < 800) document.body.classList.add('theme-mist');
  else if (id === 800)            document.body.classList.add(isNight ? 'theme-clear-night' : 'theme-clear-day');
  else                            document.body.classList.add('theme-clouds');
}

// ─── PARTICLES ───────────────────────────────────────
function renderParticles(data) {
  particles.innerHTML = '';
  const id = data.weather[0].id;
  let count = 0, type = '';
  if      (id >= 200 && id < 300) { count = 30; type = 'rain'; }
  else if (id >= 300 && id < 400) { count = 20; type = 'drizzle'; }
  else if (id >= 500 && id < 600) { count = 40; type = 'rain'; }
  else if (id >= 600 && id < 700) { count = 35; type = 'snow'; }

  for (let i = 0; i < count; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size = type === 'snow' ? Math.random() * 6 + 3 : Math.random() * 2 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-delay:${Math.random()*5}s;
      animation-duration:${type==='snow' ? Math.random()*6+6 : Math.random()*2+1.5}s;
      opacity:${Math.random()*0.5+0.3};
      ${type==='snow' ? 'background:rgba(255,255,255,0.8);' : 'background:rgba(180,220,255,0.6);border-radius:2px;width:1.5px;'}
    `;
    particles.appendChild(p);
  }
}

// ─── EVENTS ──────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const val = searchInput.value;
  renderSuggestions(getSuggestions(val));
});

searchInput.addEventListener('keydown', e => {
  const items = suggestionsEl.querySelectorAll('.suggestion-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    highlightSuggestion(activeIndex);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, -1);
    highlightSuggestion(activeIndex);
  } else if (e.key === 'Enter') {
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex].name);
    } else {
      suggestionsEl.classList.remove('open');
      fetchWeather(searchInput.value);
    }
  } else if (e.key === 'Escape') {
    suggestionsEl.classList.remove('open');
  }
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => suggestionsEl.classList.remove('open'), 150);
});

searchBtn.addEventListener('click', () => {
  suggestionsEl.classList.remove('open');
  fetchWeather(searchInput.value);
});

// ─── INIT ────────────────────────────────────────────
showIdle();
