const GOOGLE_MAP_TOKEN = 'pk.eyJ1Ijoic2FrZTIxMTAiLCJhIjoiY2szbjRhMmJiMDdzYzNkcWUwamZiNGswdCJ9.eF2G_hlyhZPfZ0XSGMZuKQ';
const IMAGE_API_KEY = '8226d696e33281b8ad77329f899972e326239bbb631c172df2093a250b2b1371';

const GEOCODING_KEY = 'd37c0dbff3f843eeb3445e13d02fd1a8';

const WEATHER_API_KEY = '9317f348a91e26e03fbeb67473c96ff4';

const GLOSSARY = {
  en: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    fillLike: 'fill like:',
    wind: 'wind:',
    mS: 'M/S',
    humidity: 'humidity:',
    searchCity: 'Search city',
    search: 'Search',
    latitude: 'latitude:',
    longitude: 'longitude:',
  },
  ru: {
    days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    month: ['Январь', 'Февраль', 'March', 'April', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    fillLike: 'ощущается как:',
    wind: 'ветер:',
    mS: 'M/С',
    humidity: 'влажность:',
    searchCity: 'Поиск города',
    search: 'Поиск',
    latitude: 'широта:',
    longitude: 'долгота:',
  },
  be: {
    days: ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацьвер', 'Пятніца', 'Сыбота'],
    month: ['Студзень', 'Люты', 'Сакавік', 'Красавік', 'Травень ', 'Чэрвень', 'Ліпень', 'Жнівень', 'Верасень', 'Кастрычнік', 'Лістапад', 'Снежань'],
    fillLike: 'aдчуваeцца як:',
    wind: 'вецер:',
    mS: 'M/C',
    humidity: 'вільготнасць:',
    searchCity: 'Пошук горада',
    search: 'Пошук',
    latitude: 'шырата:',
    longitude: 'даўгата:',
  },
};

let activeTemperature = 'celsius';

const fancyWeatherElement = document.getElementById('fancyWeather');

const backgroundButton = document.getElementById('buttonBackground');
const languageSelect = document.getElementById('menu__controlsSelect');

const dayOfWeekElement = document.getElementById('dayOfWeek');
const numberDayElement = document.getElementById('numberDay');
const monthElement = document.getElementById('month');
const timeElement = document.getElementById('time');

const searchCity = document.getElementById('searchCity');
const formElement = document.getElementById('form');

const degreesElement = document.getElementById('degrees');

let language = languageSelect.value;
let latitude = null;
let longitude = null;

let currentLocationDate = new Date();

function updateDateTimeElements(locationDate) {
  dayOfWeekElement.textContent = GLOSSARY[language].days[locationDate.getDay()];
  numberDayElement.textContent = `${locationDate.getDate()}`;
  monthElement.textContent = GLOSSARY[language].month[locationDate.getMonth()];
  timeElement.textContent = `${locationDate.getHours()}:${locationDate.getMinutes()}`;
}

// eslint-disable-next-line no-unused-vars,max-len
let allMinutes = Number(currentLocationDate.getHours()) * 60 + Number(currentLocationDate.getMinutes());

function getTime() {
  allMinutes += 1;

  let hours = Math.floor(allMinutes / 60);
  let minutes = allMinutes - (hours * 60);

  hours = convertNumberToTimeString(hours);
  minutes = convertNumberToTimeString(minutes);

  updateTime(hours, minutes);
}

function updateTime(hours, minutes) {
  timeElement.textContent = `${hours}:${minutes}`;
}

function convertNumberToTimeString(number) {
  let result = number;

  if (number < 10) {
    result = `0${number}`;
  }
  return result;
}

setInterval(getTime, 60 * 1000);

function setNextNameDays() {
  if ((currentLocationDate.getDay() + 1) > 6) {
    document.getElementById('nameFirstDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() - 6];
  } else {
    document.getElementById('nameFirstDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 1];
  }

  if ((currentLocationDate.getDay() + 2) > 6) {
    document.getElementById('nameSecondDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 1 - 6];
  } else {
    document.getElementById('nameSecondDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 2];
  }

  if ((currentLocationDate.getDay() + 3) > 6) {
    document.getElementById('nameThirdDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 2 - 6];
  } else {
    document.getElementById('nameThirdDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 3];
  }
}

setNextNameDays();

function updateTranslationMessages() {
  document.getElementById('fillLike').textContent = GLOSSARY[language].fillLike;
  document.getElementById('wind').textContent = GLOSSARY[language].wind;
  document.getElementById('windMsName').textContent = GLOSSARY[language].mS;
  document.getElementById('humidity').textContent = GLOSSARY[language].humidity;

  document.getElementById('searchCity').placeholder = GLOSSARY[language].searchCity;
  document.getElementById('searchButton').textContent = GLOSSARY[language].search;

  document.getElementById('latitude').textContent = GLOSSARY[language].latitude;
  document.getElementById('longitude').textContent = GLOSSARY[language].longitude;
}

async function handleChangeLanguage() {
  language = languageSelect.value;
  updateDateTimeElements(currentLocationDate);
  updateTranslationMessages();
  await setWeatherData();
  setNextNameDays();
}

async function getImageBackgroundUrl() {
  const data = await getWeatherData();
  const currentWeather = data.daily.data[0].precipType;
  const { timezone } = data;
  const url = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=${currentWeather},${timezone}&client_id=${IMAGE_API_KEY}`;

  const response = await fetch(url);
  const imageData = await response.json();
  const { regular: imageUrl } = imageData.urls;

  return imageUrl;
}

async function handleClickChangeBackground() {
  const imageUrl = await getImageBackgroundUrl();

  fancyWeatherElement.style.background = `url(${imageUrl})`;
  fancyWeatherElement.style.backgroundSize = 'cover';
}

async function handleClickDegreesButton(event) {
  const fahrenheitButton = document.getElementById('fahrenheit');
  const celsiusButton = document.getElementById('celsius');
  const { target } = event;

  if (target === fahrenheitButton) {
    celsiusButton.classList.remove('menu__controlsTemperature--active');
    fahrenheitButton.classList.add('menu__controlsTemperature--active');

    await setWeatherData();
    activeTemperature = 'fahrenheit';
  } else if (target === celsiusButton) {
    fahrenheitButton.classList.remove('menu__controlsTemperature--active');
    celsiusButton.classList.add('menu__controlsTemperature--active');

    await setWeatherData();
    activeTemperature = 'celsius';
  }
}

async function getWeatherData() {
  const url = `https://api.darksky.net/forecast/${WEATHER_API_KEY}/${latitude},${longitude}?lang=${language}`;
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  const response = await fetch(proxyUrl + url);
  const data = await response.json();

  return data;
}

function convertTemperatureToCelsius(temperatureInFahrenheit) {
  const result = Math.round((5 / 9) * (temperatureInFahrenheit - 32));

  return result;
}

function setIconSkycans(IconName, id) {
  const skycons = new Skycons({ color: '#ffffff' });
  skycons.add(id, Skycons[IconName]);
  skycons.play();
}

function setTodayWeatherData(data) {
  const dailyData = data.daily.data[0];

  const temperatureInCelsius = convertTemperatureToCelsius(dailyData.temperatureHigh);
  const temperatureInFahrenheit = Math.round(dailyData.temperatureHigh);
  const fillLikeInCelsius = convertTemperatureToCelsius(dailyData.apparentTemperatureLow);
  const fillLikeInFahrenheit = Math.round(dailyData.apparentTemperatureLow);
  const weatherDescription = dailyData.summary;
  const { windSpeed } = dailyData;
  const humidity = dailyData.humidity * 100;
  const weatherIconName = dailyData.icon.toUpperCase().split('-').join('_');

  if (activeTemperature === 'celsius') {
    document.getElementById('temperatureToday').innerHTML = `${temperatureInCelsius}&deg;`;
    document.getElementById('fillLikeTemperature').innerHTML = ` ${fillLikeInCelsius}&deg;`;
  } else if (activeTemperature === 'fahrenheit') {
    document.getElementById('temperatureToday').innerHTML = `${temperatureInFahrenheit}&deg;`;
    document.getElementById('fillLikeTemperature').innerHTML = ` ${fillLikeInFahrenheit}&deg;`;
  }
  document.getElementById('nameCity').textContent = data.timezone;

  document.getElementById('weatherDescription').textContent = weatherDescription;
  document.getElementById('windSpeed').textContent = ` ${windSpeed} `;
  document.getElementById('humidityPercent').textContent = ` ${humidity} %`;

  setIconSkycans(weatherIconName, 'skyconsToday');
}

async function setWeatherData() {
  const data = await getWeatherData();

  setTodayWeatherData(data);
  setTemperatureForFollowingDays(data);
}

function setTemperatureForFollowingDays(data) {
  const dailyDataFirstDay = data.daily.data[1];
  const dailyDataSecondDay = data.daily.data[2];
  const dailyDataThirdDay = data.daily.data[3];

  const weatherIconNameFirstDay = dailyDataFirstDay.icon.toUpperCase().split('-').join('_');
  const weatherIconNameSecondDay = dailyDataSecondDay.icon.toUpperCase().split('-').join('_');
  const weatherIconNameThirdDay = dailyDataThirdDay.icon.toUpperCase().split('-').join('_');

  const tempInCelsiusFirstDay = convertTemperatureToCelsius(dailyDataFirstDay.temperatureHigh);
  const tempInCelsiusSecondDay = convertTemperatureToCelsius(dailyDataSecondDay.temperatureHigh);
  const tempInCelsiusThirdDay = convertTemperatureToCelsius(dailyDataThirdDay.temperatureHigh);

  const tempInFahrenheitFirstDay = Math.round(dailyDataFirstDay.temperatureHigh);
  const tempInFahrenheitSecondDay = Math.round(dailyDataSecondDay.temperatureHigh);
  const tempInFahrenheitThirdDay = Math.round(dailyDataThirdDay.temperatureHigh);

  if (activeTemperature === 'celsius') {
    document.getElementById('temperatureFirstDay').innerHTML = `${tempInCelsiusFirstDay}&deg;`;
    document.getElementById('temperatureSecondDay').innerHTML = `${tempInCelsiusSecondDay}&deg;`;
    document.getElementById('temperatureThirdDay').innerHTML = `${tempInCelsiusThirdDay}&deg;`;
  } else if (activeTemperature === 'fahrenheit') {
    document.getElementById('temperatureFirstDay').innerHTML = `${tempInFahrenheitFirstDay}&deg;`;
    document.getElementById('temperatureSecondDay').innerHTML = `${tempInFahrenheitSecondDay}&deg;`;
    document.getElementById('temperatureThirdDay').innerHTML = `${tempInFahrenheitThirdDay}&deg;`;
  }


  setIconSkycans(weatherIconNameFirstDay, 'skyconsFirstDay');
  setIconSkycans(weatherIconNameSecondDay, 'skyconsSecondDay');
  setIconSkycans(weatherIconNameThirdDay, 'skyconsThirdDay');
}

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function showCoordinates() {
  document.getElementById('latitudeDegrees').textContent = latitude.toFixed(6);
  document.getElementById('longitudeDegrees').textContent = longitude.toFixed(6);
}

async function geolocationSuccess(position) {
  const { coords } = position;

  latitude = coords.latitude;
  longitude = coords.longitude;

  showCoordinates();

  await loadAndInitializeSettings();
}

async function loadAndInitializeSettings() {
  initializeMap();
  await setWeatherData();
  await handleClickChangeBackground();
}

function geolocationError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function initializeCurrentPositionAndSettings() {
  navigator.geolocation.getCurrentPosition(
    geolocationSuccess, geolocationError, geolocationOptions,
  );
}

function initializeMap() {
  mapboxgl.accessToken = GOOGLE_MAP_TOKEN;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [longitude, latitude],
    zoom: 9,
  });

  new mapboxgl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);
}

async function handleSubmitForm(event) {
  event.preventDefault();
  const nameCity = searchCity.value;

  await setGeocoding(nameCity);
  await loadAndInitializeSettings();
}


async function setGeocoding(city) {
  const urlGeocoding = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${GEOCODING_KEY}`;

  const response = await fetch(urlGeocoding);
  const data = await response.json();

  const closestData = data.results[0];

  latitude = closestData.geometry.lat;
  longitude = closestData.geometry.lng;

  showCoordinates();

  currentLocationDate = getCityDate(closestData.annotations.timezone.offset_sec);
  updateDateTimeElements(currentLocationDate);

  const currentHours = Number(currentLocationDate.getHours());
  const currentMinutes = Number(currentLocationDate.getMinutes());

  allMinutes = currentHours * 60 + currentMinutes;
}

function getCityDate(cityTimeZoneOffsetSeconds) {
  const currentDate = new Date();
  const currentTime = currentDate.getTime();
  const timezoneOffsetInMS = currentDate.getTimezoneOffset() * 60000; // MS - milliseconds
  const cityTimeZoneOffsetInMS = cityTimeZoneOffsetSeconds * 1000;

  const cityDate = new Date(currentTime + timezoneOffsetInMS + cityTimeZoneOffsetInMS);

  return cityDate;
}

initializeCurrentPositionAndSettings();
updateDateTimeElements(currentLocationDate);
updateTranslationMessages();


languageSelect.addEventListener('change', handleChangeLanguage);
formElement.addEventListener('submit', handleSubmitForm);
degreesElement.addEventListener('click', handleClickDegreesButton);
backgroundButton.addEventListener('click', handleClickChangeBackground);
