
const API_KEY = "132b30257849c39a18fc144865735dd3";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const currentWeather = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecastContainer");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

// Search button event
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);
});

// Enter key event
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

// Location button event
locationBtn.addEventListener("click", getCurrentLocationWeather);

// Fetch current weather and forecast by city
async function getWeather(city) {
    loading.classList.remove("hidden");
    error.classList.add("hidden");
    currentWeather.innerHTML = "";
    forecastContainer.innerHTML = "";

    try {
        const currentURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentURL),
            fetch(forecastURL)
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        if (!currentResponse.ok) {
            throw new Error("Current Weather: " + currentData.message);
        }

        if (!forecastResponse.ok) {
            throw new Error("Forecast: " + forecastData.message);
        }

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (err) {
        showError(err.message || "Unable to connect. Please try again.");
    } finally {
        loading.classList.add("hidden");
    }
}

// Fetch weather using current location
function getCurrentLocationWeather() {

    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    loading.classList.remove("hidden");
    error.classList.add("hidden");
    currentWeather.innerHTML = "";
    forecastContainer.innerHTML = "";

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const currentURL =
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

                const forecastURL =
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

                const [currentResponse, forecastResponse] =
                    await Promise.all([
                        fetch(currentURL),
                        fetch(forecastURL)
                    ]);

                const currentData = await currentResponse.json();
                const forecastData = await forecastResponse.json();

                if (!currentResponse.ok) {
                    throw new Error("Current Weather: " + currentData.message);
                }

                if (!forecastResponse.ok) {
                    throw new Error("Forecast: " + forecastData.message);
                }

                displayCurrentWeather(currentData);
                displayForecast(forecastData);

            } catch (err) {
                showError(err.message || "Unable to fetch weather.");
            } finally {
                loading.classList.add("hidden");
            }
        },

        (err) => {
            loading.classList.add("hidden");

            if (err.code === 1) {
                showError("Location permission denied.");
            } else if (err.code === 2) {
                showError("Location information unavailable.");
            } else {
                showError("Location request timed out.");
            }
        }
    );
}

// Display current weather
function displayCurrentWeather(data) {
    const icon = data.weather[0].icon;

    currentWeather.innerHTML = `
        <div class="weather-heading">
            <div>
                <h2>${data.name}, ${data.sys.country}</h2>
                <p class="weather-description">
                    ${data.weather[0].description}
                </p>
            </div>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${data.weather[0].description}"
            >
        </div>

        <div class="weather-temperature">
            <h1>${Math.round(data.main.temp)}°C</h1>
            <p>Feels Like ${Math.round(data.main.feels_like)}°C</p>
        </div>

        <div class="weather-details">
            <div>
                <span>Humidity</span>
                <strong>${data.main.humidity}%</strong>
            </div>

            <div>
                <span>Wind Speed</span>
                <strong>${data.wind.speed} m/s</strong>
            </div>
        </div>
    `;
}

// Display 3-day forecast
function displayForecast(data) {
    const dailyForecasts = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    ).slice(0, 3);

    if (dailyForecasts.length === 0) {
        forecastContainer.textContent =
            "Forecast data is currently unavailable.";
        return;
    }

    dailyForecasts.forEach(item => {
        const date = new Date(item.dt_txt);

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const icon = item.weather[0].icon;

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <h3>${day}</h3>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${item.weather[0].description}"
            >

            <h3>${Math.round(item.main.temp)}°C</h3>
            <p>${item.weather[0].description}</p>
        `;

        forecastContainer.appendChild(card);
    });
}

// Display error message
function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
}

// Initial city
getWeather("Hyderabad");
