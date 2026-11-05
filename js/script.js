// Personal NASA API key from https://api.nasa.gov
const API_KEY = "QLRFcHPDgRtg7qcJQMBWbMRJh9cC7z7pnqKFFMKR";
const APOD_URL = "https://api.nasa.gov/planetary/apod";
const APOD_FIRST_DATE = "1995-06-16";
const GALLERY_SIZE = 9;

const SPACE_FACTS = [
  "A galaxy is a huge collection of gas, dust, and billions of stars held together by gravity.",
  "A day on Venus is longer than its year — it takes 243 Earth days to rotate once, but only 225 to orbit the Sun.",
  "Neutron stars can spin up to 600 times per second.",
  "There are more stars in the universe than grains of sand on every beach on Earth.",
  "The Sun accounts for about 99.86% of all the mass in our solar system.",
  "One million Earths could fit inside the Sun.",
  "Space is completely silent because there is no atmosphere for sound to travel through.",
  "The footprints left by Apollo astronauts on the Moon will likely stay there for millions of years since there's no wind to erode them.",
  "A nebula is a giant cloud of dust and gas in space, often the birthplace of new stars.",
  "Saturn's rings are made mostly of ice particles, with a smaller amount of rocky debris and dust.",
  "The International Space Station orbits Earth roughly every 90 minutes.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
];

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const fetchBtn = document.getElementById("fetch-btn");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const gallery = document.getElementById("gallery");
const factText = document.getElementById("fact-text");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalMedia = document.getElementById("modal-media");
const modalTitle = document.getElementById("modal-title");
const modalDate = document.getElementById("modal-date");
const modalExplanation = document.getElementById("modal-explanation");

function toDateString(date) {
  return date.toISOString().split("T")[0];
}

function setDefaultDates() {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - (GALLERY_SIZE - 1));

  const todayStr = toDateString(today);
  const startStr = toDateString(start);

  startDateInput.value = startStr;
  endDateInput.value = todayStr;
  startDateInput.min = APOD_FIRST_DATE;
  endDateInput.min = APOD_FIRST_DATE;
  startDateInput.max = todayStr;
  endDateInput.max = todayStr;
}

function showRandomFact() {
  const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  factText.textContent = fact;
}

function showLoading(isLoading) {
  loadingMessage.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  if (!message) {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";
    return;
  }
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

async function fetchApod(startDate, endDate) {
  const url = `${APOD_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.msg || `Request failed with status ${response.status}`);
  }

  return response.json();
}

function createGalleryItem(entry) {
  const item = document.createElement("div");
  item.className = "gallery-item";

  const media = document.createElement("div");
  media.className = "gallery-media";

  if (entry.media_type === "video") {
    media.innerHTML = `
      <div class="video-thumb">
        <span class="play-icon">▶</span>
        <span class="video-label">Video</span>
      </div>
    `;
  } else {
    const img = document.createElement("img");
    img.src = entry.url;
    img.alt = entry.title;
    img.loading = "lazy";
    media.appendChild(img);
  }

  const info = document.createElement("div");
  info.className = "gallery-info";
  info.innerHTML = `
    <h3>${entry.title}</h3>
    <p class="date">${entry.date}</p>
  `;

  item.appendChild(media);
  item.appendChild(info);
  item.addEventListener("click", () => openModal(entry));

  return item;
}

function renderGallery(entries) {
  gallery.innerHTML = "";
  entries.forEach((entry) => gallery.appendChild(createGalleryItem(entry)));
}

function openModal(entry) {
  modalTitle.textContent = entry.title;
  modalDate.textContent = entry.date;
  modalExplanation.textContent = entry.explanation;

  if (entry.media_type === "video") {
    modalMedia.innerHTML = `<iframe src="${entry.url}" allowfullscreen title="${entry.title}"></iframe>`;
  } else {
    const fullImage = entry.hdurl || entry.url;
    modalMedia.innerHTML = `<img src="${fullImage}" alt="${entry.title}" />`;
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modalMedia.innerHTML = "";
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

async function handleFetchClick() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  showError(null);

  if (!startDate || !endDate) {
    showError("Please choose both a start and end date.");
    return;
  }
  if (new Date(startDate) > new Date(endDate)) {
    showError("Start date must be before the end date.");
    return;
  }

  gallery.innerHTML = "";
  showLoading(true);

  try {
    const data = await fetchApod(startDate, endDate);
    const entries = (Array.isArray(data) ? data : [data])
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, GALLERY_SIZE);

    if (entries.length === 0) {
      showError("No images found for that date range.");
    } else {
      renderGallery(entries);
    }
  } catch (err) {
    showError(`Could not load space photos: ${err.message}`);
  } finally {
    showLoading(false);
  }
}

fetchBtn.addEventListener("click", handleFetchClick);

setDefaultDates();
showRandomFact();
handleFetchClick();
