import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateWeatherAlerts,
  WeatherService,
  CurrentWeather,
  DailyForecast,
} from '../src/services/weatherService';

const baseCurrent: CurrentWeather = {
  time: '2026-09-30T12:00',
  temperature: 24.0,
  humidity: 60,
  apparentTemperature: 24.0,
  precipitation: 0.0,
  weatherCode: 1,
  weatherDescriptionPt: 'Predomínio de sol',
  weatherDescriptionEs: 'Mayormente soleado',
  windSpeed: 12.0,
  windGusts: 18.0,
  uvIndex: 5.0,
};

const baseDaily: DailyForecast[] = [
  {
    date: '2026-09-30',
    tempMax: 26.0,
    tempMin: 18.0,
    precipitationSum: 0.0,
    precipitationProbability: 15,
    windSpeedMax: 15.0,
    uvIndexMax: 6.0,
    weatherCode: 1,
  },
];

test('não emite alertas quando as condições climáticas são amenas', () => {
  const alerts = evaluateWeatherAlerts(baseCurrent, baseDaily);
  assert.equal(alerts.length, 0);
});

test('dispara alerta de chuva quando há precipitação ativa ou probabilidade elevada', () => {
  const rainingCurrent: CurrentWeather = {
    ...baseCurrent,
    precipitation: 4.5,
    weatherCode: 63,
  };
  const alerts = evaluateWeatherAlerts(rainingCurrent, baseDaily);
  const rainAlert = alerts.find((a) => a.type === 'rain');

  assert.ok(rainAlert, 'deveria conter alerta de chuva');
  assert.match(rainAlert.titlePt, /Chuva/);
  assert.match(rainAlert.actionPt, /cortinas/i);
});

test('dispara alerta de vento forte quando a velocidade ou rajadas excedem limites seguros da estufa', () => {
  const windyCurrent: CurrentWeather = {
    ...baseCurrent,
    windSpeed: 38.0,
    windGusts: 52.0,
  };
  const alerts = evaluateWeatherAlerts(windyCurrent, baseDaily);
  const windAlert = alerts.find((a) => a.type === 'wind');

  assert.ok(windAlert, 'deveria conter alerta de vento');
  assert.match(windAlert.titlePt, /Vento/);
  assert.match(windAlert.actionPt, /cortinas plásticas/i);
});

test('dispara alerta de sol muito forte e UV alto para proteção com sombrite e CE', () => {
  const sunnyCurrent: CurrentWeather = {
    ...baseCurrent,
    temperature: 34.5,
    uvIndex: 9.2,
  };
  const alerts = evaluateWeatherAlerts(sunnyCurrent, baseDaily);
  const sunAlert = alerts.find((a) => a.type === 'sun');

  assert.ok(sunAlert, 'deveria conter alerta de sol forte');
  assert.match(sunAlert.titlePt, /Sol Muito Forte|Radiação Solar/);
  assert.match(sunAlert.actionPt, /sombreamento|CE/i);
});

test('WeatherService devolve dados válidos de Guayaibí mesmo com fallback offline', async () => {
  const data = await WeatherService.getWeatherForecast();
  assert.ok(data.city.includes('Guayaibí'));
  assert.ok(data.country.includes('Paraguay'));
  assert.ok(typeof data.current.temperature === 'number');
  assert.ok(Array.isArray(data.daily));
  assert.ok(Array.isArray(data.activeAlerts));
});
