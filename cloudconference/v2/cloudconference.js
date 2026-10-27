const participants = {
  Manila: { latitude: 14.5995, longitude: 120.9842, role: 'warm pool', interjection: 'Send your winds to me. I can hold what they push until I cannot.' },
  Honolulu: { latitude: 21.3099, longitude: -157.8581, role: 'trade wind', interjection: 'I have not weakened. I have been listening eastward.' },
  Tokyo: { latitude: 35.6762, longitude: 139.6503, role: 'walker cell', interjection: 'The humans drew arrows over us while we were speaking.' },
  Iloilo: { latitude: 10.7202, longitude: 122.5621, role: 'rainband', interjection: 'They ask which of us moved the rain away from their rice.' },
  'Los Angeles': { latitude: 34.0522, longitude: -118.2437, role: 'upwelling', interjection: 'When warm water arrives, I cannot reach my microphone.' },
  Shenyang: { latitude: 41.8057, longitude: 123.4315, role: 'winter high', interjection: 'They have mistaken a cycle for a family.' }
};

// ENSO mechanics: https://www.aoml.noaa.gov/general/enso_faq/
// and https://oceanservice.noaa.gov/facts/ninonina.html
const turns = [
  ['Manila', 'warm pool', 'Before we begin, confirm who has been sending winds to me.'],
  ['Honolulu', 'trade wind', 'I send them west. You keep the heat at the end of the table.'],
  ['Iloilo', 'rainband', 'And I follow the heat. Stop describing this as loyalty.'],
  ['Los Angeles', 'upwelling', 'I speak when the surface is carried away.'],
  ['Tokyo', 'walker cell', 'Agenda item one: Trade Wind has been arriving weaker.'],
  ['Honolulu', 'trade wind', 'I have not weakened. I have been listening eastward.'],
  ['system', 'automated notice', 'The warm pool changes seats.'],
  ['Manila', 'warm pool', 'Los Angeles, I am sending water to you.'],
  ['Los Angeles', 'upwelling', 'Do not call it a gift. When you arrive, I cannot reach my microphone.'],
  ['system', 'automated notice', 'Agenda item two: El Niño.'],
  ['Iloilo', 'rainband', 'The humans have named the warm water after a child.'],
  ['Shenyang', 'winter high', 'They name a returning thing so it can arrive only once.'],
  ['Tokyo', 'walker cell', 'They draw arrows across us, then stand where an arrow ends and call it weather.'],
  ['Honolulu', 'trade wind', 'They ask which of us moved the rain away from their rice.'],
  ['Iloilo', 'rainband', 'They have planted calendars at the shoreline.'],
  ['Manila', 'warm pool', 'Tell them no heat was made in this room.'],
  ['Los Angeles', 'upwelling', 'No heat disappeared. Some was kept beneath the table.'],
  ['system', 'automated notice', 'Agenda item three: La Niña.'],
  ['Shenyang', 'winter high', 'They called the cold water a girl. Neither child has attended.'],
  ['Honolulu', 'trade wind', 'In the next session I will speak louder.'],
  ['Manila', 'warm pool', 'Then send your winds to me. I will hold what they push until I cannot.'],
  ['system', 'automated notice', 'Quorum lost. The sea keeps its own minutes.']
];

const fallbackHumidity = {
  Manila: 76,
  Honolulu: 68,
  Tokyo: 61,
  Iloilo: 83,
  'Los Angeles': 48,
  Shenyang: 57
};

const speaker = document.querySelector('#speaker');
const utterance = document.querySelector('#utterance');
const counter = document.querySelector('#counter');
const minutes = document.querySelector('#minutes');
const status = document.querySelector('#status');
const nextButton = document.querySelector('#next');
const soundButton = document.querySelector('#sound');
const participantButtons = [...document.querySelectorAll('.participant')];

let turnIndex = -1;
let audioContext;

function setSpeaking(city) {
  participantButtons.forEach((button) => {
    button.dataset.state = button.dataset.city === city ? 'speaking' : 'listening';
  });
}

function addMinute(city, text, index) {
  const item = document.createElement('li');
  item.dataset.time = String(index + 1).padStart(2, '0');
  item.textContent = `${city}: ${text}`;
  minutes.prepend(item);

  while (minutes.children.length > 5) {
    minutes.lastElementChild.remove();
  }
}

function showTurn(city, role, text, index, retain = true) {
  setSpeaking(city);
  speaker.innerHTML = `${city}<br>${role}`;
  utterance.classList.remove('entering');
  void utterance.offsetWidth;
  utterance.textContent = text;
  utterance.classList.add('entering');
  counter.textContent = `${String(index + 1).padStart(2, '0')} / ${turns.length}`;

  if (retain) addMinute(city, text, index);
  nextButton.textContent = index === turns.length - 1 ? 'begin meeting again' : 'receive next transmission';
  ping(city);
}

function nextTurn() {
  turnIndex = (turnIndex + 1) % turns.length;
  const [city, role, text] = turns[turnIndex];
  showTurn(city, role, text, turnIndex);
}

function interrupt(city) {
  const participant = participants[city];
  showTurn(city, participant.role, participant.interjection, Math.max(turnIndex, 0), false);
}

async function updateWeather() {
  const entries = Object.entries(participants);
  const latitudes = entries.map(([, data]) => data.latitude).join(',');
  const longitudes = entries.map(([, data]) => data.longitude).join(',');
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=relative_humidity_2m&timezone=auto`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) throw new Error(`Weather response ${response.status}`);
    const payload = await response.json();
    const reports = Array.isArray(payload) ? payload : [payload];

    entries.forEach(([city], index) => {
      const humidity = Math.round(reports[index]?.current?.relative_humidity_2m ?? fallbackHumidity[city]);
      renderWeather(city, humidity, 'live');
    });
    status.textContent = 'live weather received';
  } catch (error) {
    entries.forEach(([city]) => renderWeather(city, fallbackHumidity[city], 'last known'));
    status.textContent = 'weather channel absent';
  } finally {
    window.clearTimeout(timeout);
  }
}

function renderWeather(city, humidity, source) {
  const button = participantButtons.find((item) => item.dataset.city === city);
  button.style.setProperty('--humidity', humidity);
  button.querySelector('.participant-meta').innerHTML = `${participants[city].role}<br>humidity ${humidity}% / ${source}`;
}

function startRoomTone() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gain = audioContext.createGain();
  const oscillator = audioContext.createOscillator();
  const tremolo = audioContext.createOscillator();
  const tremoloGain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 78;
  tremolo.frequency.value = 0.17;
  tremoloGain.gain.value = 0.009;
  gain.gain.value = 0.014;

  tremolo.connect(tremoloGain).connect(gain.gain);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  tremolo.start();
}

function toggleSound() {
  if (!audioContext) {
    startRoomTone();
    soundButton.textContent = 'mute room';
    soundButton.setAttribute('aria-pressed', 'true');
    return;
  }

  const isRunning = audioContext.state === 'running';
  if (isRunning) audioContext.suspend();
  else audioContext.resume();
  soundButton.textContent = isRunning ? 'unmute room' : 'mute room';
  soundButton.setAttribute('aria-pressed', String(!isRunning));
}

function ping(city) {
  if (!audioContext || audioContext.state !== 'running' || city === 'system') return;
  const button = participantButtons.find((item) => item.dataset.city === city);
  const humidity = Number(getComputedStyle(button).getPropertyValue('--humidity')) || 50;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.frequency.value = 180 + humidity * 2.6;
  gain.gain.setValueAtTime(0.025, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

nextButton.addEventListener('click', nextTurn);
soundButton.addEventListener('click', toggleSound);
participantButtons.forEach((button) => {
  button.addEventListener('click', () => interrupt(button.dataset.city));
});

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowRight') && event.target === document.body) {
    event.preventDefault();
    nextTurn();
  }
});

updateWeather();
