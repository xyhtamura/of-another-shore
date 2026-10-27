const apiKey = '577a29cc9a4c7e6bc3cb4675384e8d4e';

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.main.humidity;
    } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error);
        return null;
    }
}

async function updateHumidityWords() {
    const humidityWords = document.querySelectorAll('.humidity-word');

    for (const span of humidityWords) {
        const city = span.dataset.city; // Get city name from data attribute
        let mainText = span.querySelector('.main-text'); // Select or create .main-text
        let cityInfo = span.querySelector('.city-info'); // Select or create .city-info

        // Ensure mainText and cityInfo exist
        if (!mainText) {
            mainText = document.createElement('span');
            mainText.className = 'main-text';
            span.appendChild(mainText);
        }

        if (!cityInfo) {
            cityInfo = document.createElement('span');
            cityInfo.className = 'city-info';
            cityInfo.style.display = 'block'; // Ensure it's block-level for visibility
            span.appendChild(cityInfo);
        }

        // Fetch humidity for the city
        const humidity = await getWeather(city);

        if (humidity !== null) {
            // Update main text content based on humidity
            if (humidity < 30) {
                mainText.textContent = 'blue';
                mainText.style.color = '#6FA7A2'; // Blue color
            } else if (humidity < 60) {
                mainText.textContent = 'green';
                mainText.style.color = '#A1CFB2'; // Green color
            } else {
                if (city === 'Manila') {
                    mainText.textContent = 'bell';
                    mainText.style.color = '#FFA500'; // Orange color for Manila
                } else {
                    mainText.textContent = 'red';
                    mainText.style.color = '#FFB4A2'; // Red color for others
                }
            }

            // Update city-info with city and humidity details
            cityInfo.textContent = `(${city}, Humidity: ${humidity}%)`;
        } else {
            // Handle errors or null humidity data
            mainText.textContent = 'Error';
            mainText.style.color = '#6C757D'; // Gray color for errors
            cityInfo.textContent = '(Error fetching data)';
        }
    }
}

// Update on page load
updateHumidityWords();

// Optionally, update every 5 minutes
setInterval(updateHumidityWords, 300000);
