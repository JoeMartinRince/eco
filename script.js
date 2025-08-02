const factors = {
  car: 0.17,
  bus: 0.089,
  train: 0.041,
  plane: 0.255,
};

function calcCO2() {
  const mode = document.getElementById('transport').value;
  const km = +document.getElementById('distance').value;
  const co2 = (factors[mode] * km).toFixed(2);
  const trees = Math.ceil(co2 / 21);
  document.getElementById('co2-result').textContent = `${co2} kg CO₂ ≈ plant ${trees} tree${trees > 1 ? 's' : ''}.`;
}

function fetchAQI(lat, lon) {
  fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`)
    .then(r => r.json())
    .then(d => {
      document.getElementById('aqi-result').innerHTML = `<strong>AQI: ${d.data.aqi}</strong> – ${d.data.city.name}`;
    })
    .catch(() => {
      document.getElementById('aqi-result').textContent = 'Could not load AQI';
    });
}

navigator.geolocation?.getCurrentPosition(
  p => fetchAQI(p.coords.latitude, p.coords.longitude),
  () => document.getElementById('aqi-result').textContent = 'Location denied'
);

function loadMap() {
  const token = document.getElementById('mb-token').value.trim();
  if (!token) { alert('Token required'); return; }
  mapboxgl.accessToken = token;
  const mapDiv = document.getElementById('map');
  mapDiv.style.height = '400px';
  new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 2
  });
}

const presetAnswers = {
  when: "Early mornings (6-8 AM) and late evenings (after 7 PM) usually have the cleanest air.",
  reduce: "Use public transport, fly economy, and offset emissions with tree-planting.",
  offset: "One mature tree absorbs ≈ 21 kg CO₂/year. Divide your CO₂ by 21.",
  transport: "Train < Bus < Car < Plane. Rail is usually the greenest option.",
  aqi: "Your current AQI is shown above. If AQI > 100, limit outdoor activity.",
  tips: "1) Pack light, 2) Refill bottles, 3) Book eco-certified stays."
};

function sendPreset(val) {
  if (!val) return;
  addMessage(document.querySelector(`#chat-select option[value="${val}"]`).text, 'user');
  addMessage(presetAnswers[val], 'bot');
}

function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  const reply = presetAnswers[text.toLowerCase()] || "I'm a basic assistant – choose a question or type 'tips', 'reduce', etc.";
  setTimeout(() => addMessage(reply, 'bot'), 400);
}

function addMessage(text, sender) {
  const box = document.getElementById('chat-box');
  box.insertAdjacentHTML('beforeend', `<div class="chat-message ${sender}">${text}</div>`);
  box.scrollTop = box.scrollHeight;
}
