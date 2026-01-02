const apiKey = "47412a413fe70d9acfa25e7f083b9cc6"; // <-- PUT your OpenWeather API key here
// Show default content on page load
window.onload = () => {
  document.getElementById("result").innerHTML = `
    <div class="weather-card">
      <h2>🌍 Welcome!</h2>
      <p style="margin-top:10px; opacity:0.9;">
        Search any city to get real-time weather updates.
      </p>
      <p style="margin-top:8px; font-size:14px;">
        Built using OpenWeather API & JavaScript
      </p>
    </div>
  `;
};

document.getElementById("checkBtn").addEventListener("click", getWeather);
document.getElementById("city").addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});

async function getWeather(defaultCity) {
  const cityInput = document.getElementById("city");
  const result = document.getElementById("result");
  const city = (defaultCity !== undefined)
  ? defaultCity
  : cityInput.value.trim();



  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  // show loading
  result.innerHTML = `<div class="loading">Loading weather for <strong>${escapeHtml(city)}</strong>…</div>`;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      if (resp.status === 404) {
        result.innerHTML = `<div class="error">City not found. Check the spelling.</div>`;
      } else if (resp.status === 401) {
        result.innerHTML = `<div class="error">Invalid API key. Put the correct key in script.js.</div>`;
      } else {
        result.innerHTML = `<div class="error">Error: ${resp.status} ${resp.statusText}</div>`;
      }
      return;
    }

    const data = await resp.json();
    renderWeather(data);

  } catch (err) {
    console.error(err);
    result.innerHTML = `<div class="error">Network error — check your connection.</div>`;
  }
}

// Render nice output and convert wind to km/h
function renderWeather(data) {
  const result = document.getElementById("result");
  const name = data.name;
  const country = data.sys?.country || "";
  const temp = Math.round(data.main.temp);
  const desc = capitalizeFirst(data.weather[0].description);
  const humidity = data.main.humidity;
  const windMs = data.wind.speed; // m/s
  const windKmh = Math.round(windMs * 3.6); // convert to km/h
  const iconId = data.weather[0].icon; // e.g. "01d"

  // OpenWeather provides icon images at this URL
  const iconUrl = `https://openweathermap.org/img/wn/${iconId}@2x.png`;

 result.innerHTML = `
  <div class="weather-card">
    <h2>${name}, ${country}</h2>

    <img src="https://openweathermap.org/img/wn/${iconId}@4x.png" width="120">

    <div class="temp">${temp}°C</div>
    <div class="desc">${desc}</div>

    <div class="details">
      <div>
        💧 <br>${humidity}%
      </div>
      <div>
        🌬 <br>${windKmh} km/h
      </div>
      <div>
        🔽 <br>${data.main.pressure} hPa
      </div>
    </div>
  </div>
`;

}

// small helpers
function capitalizeFirst(s){ return s.charAt(0).toUpperCase() + s.slice(1) }
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
  });
}
// Auto load default city weather
getWeather("Tirunelveli");

