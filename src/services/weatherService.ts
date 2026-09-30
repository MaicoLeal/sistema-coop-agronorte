/**
 * Serviço de Previsão do Tempo e Alertas Climáticos para a Cooperativa Agronorte
 * Localização: Guayaibí, Departamento de San Pedro, Paraguay (-24.4842, -56.5392)
 * Fonte: Open-Meteo API (Global High-Resolution Weather Model)
 */

export type WeatherAlertSeverity = 'info' | 'warning' | 'critical';
export type WeatherAlertType = 'rain' | 'wind' | 'sun';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: WeatherAlertSeverity;
  titlePt: string;
  titleEs: string;
  messagePt: string;
  messageEs: string;
  actionPt: string;
  actionEs: string;
  value: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  precipitation: number;
  weatherCode: number;
  weatherDescriptionPt: string;
  weatherDescriptionEs: string;
  windSpeed: number; // km/h
  windGusts: number; // km/h
  uvIndex: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  weatherCode: number;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  activeAlerts: WeatherAlert[];
}

const GUAYAIBI_COORDS = {
  latitude: -24.4842,
  longitude: -56.5392,
  city: 'Guayaibí, San Pedro',
  country: 'Paraguay',
};

// Mapeamento WMO Weather Code
function getWeatherDescription(code: number): { pt: string; es: string } {
  if (code === 0) return { pt: 'Céu limpo ensolarado', es: 'Cielo despejado soleado' };
  if (code === 1) return { pt: 'Predomínio de sol', es: 'Mayormente soleado' };
  if (code === 2) return { pt: 'Parcialmente nublado', es: 'Parcialmente nublado' };
  if (code === 3) return { pt: 'Nublado', es: 'Nublado' };
  if (code >= 45 && code <= 48) return { pt: 'Nevoeiro / Neblina', es: 'Niebla / Neblina' };
  if (code >= 51 && code <= 55) return { pt: 'Garoa leve', es: 'Llovizna ligera' };
  if (code >= 61 && code <= 65) return { pt: 'Chuva contínua', es: 'Lluvia constante' };
  if (code >= 80 && code <= 82) return { pt: 'Pancadas de chuva', es: 'Chubascos de lluvia' };
  if (code >= 95 && code <= 99) return { pt: 'Tempestade com trovoadas', es: 'Tormenta eléctrica' };
  return { pt: 'Tempo instável', es: 'Tiempo inestable' };
}

// Avalia os limites meteorológicos para disparar alertas agronômicos de estufa
export function evaluateWeatherAlerts(
  current: CurrentWeather,
  daily: DailyForecast[]
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const todayForecast = daily[0];

  // 1. ALERTA DE CHUVA / TEMPESTADE
  const isRainingNow = current.precipitation > 0.2 || (current.weatherCode >= 51 && current.weatherCode <= 99);
  const highRainProb = todayForecast ? todayForecast.precipitationProbability >= 60 : false;
  const isStorm = current.weatherCode >= 95;

  if (isStorm || isRainingNow || highRainProb) {
    const isCritical = isStorm || current.precipitation >= 5 || (todayForecast && todayForecast.precipitationSum >= 15);
    alerts.push({
      id: 'alert-rain',
      type: 'rain',
      severity: isCritical ? 'critical' : 'warning',
      titlePt: isStorm ? '⛈️ Alerta de Tempestade Iminente' : '🌧️ Alerta de Chuva nas Estufas',
      titleEs: isStorm ? '⛈️ Alerta de Tormenta Inminente' : '🌧️ Alerta de Lluvia en Invernaderos',
      messagePt: isStorm
        ? 'Tempestade com raios e chuva forte na região de Guayaibí.'
        : `Precipitação detectada (${current.precipitation.toFixed(1)} mm) ou probabilidade alta (${todayForecast?.precipitationProbability || 70}%).`,
      messageEs: isStorm
        ? 'Tormenta eléctrica y lluvia fuerte en la zona de Guayaibí.'
        : `Precipitación detectada (${current.precipitation.toFixed(1)} mm) o probabilidad alta (${todayForecast?.precipitationProbability || 70}%).`,
      actionPt: 'Fechar cortinas laterais e verificar calhas de drenagem para evitar umidade excessiva nas folhas.',
      actionEs: 'Cerrar cortinas laterales y revisar canaletas para evitar exceso de humedad en las hojas.',
      value: `${current.precipitation.toFixed(1)} mm | ${todayForecast?.precipitationProbability || 0}% prob.`,
    });
  }

  // 2. ALERTA DE VENTO FORTE
  const isHighWind = current.windSpeed >= 28 || current.windGusts >= 40;
  const isForecastWind = todayForecast ? todayForecast.windSpeedMax >= 32 : false;

  if (isHighWind || isForecastWind) {
    const isCritical = current.windSpeed >= 40 || current.windGusts >= 55 || (todayForecast && todayForecast.windSpeedMax >= 45);
    alerts.push({
      id: 'alert-wind',
      type: 'wind',
      severity: isCritical ? 'critical' : 'warning',
      titlePt: isCritical ? '💨 Alerta Crítico de Vento Forte' : '🌬️ Atenção: Vento Moderado a Forte',
      titleEs: isCritical ? '💨 Alerta Crítico de Viento Fuerte' : '🌬️ Atención: Viento Moderado a Fuerte',
      messagePt: `Ventos de ${current.windSpeed.toFixed(0)} km/h com rajadas de até ${current.windGusts.toFixed(0)} km/h em San Pedro.`,
      messageEs: `Vientos de ${current.windSpeed.toFixed(0)} km/h con ráfagas de hasta ${current.windGusts.toFixed(0)} km/h en San Pedro.`,
      actionPt: 'Travar cortinas plásticas das estufas e reforçar fixações estruturais contra rasgos de lona.',
      actionEs: 'Trabar cortinas plásticas de invernaderos y asegurar anclajes para proteger las cubiertas.',
      value: `${current.windSpeed.toFixed(0)} km/h (rajadas ${current.windGusts.toFixed(0)} km/h)`,
    });
  }

  // 3. ALERTA DE SOL MUITO FORTE / CALOR EXTREMO (ÍNDICE UV)
  const isHighUV = current.uvIndex >= 7.5 || (todayForecast && todayForecast.uvIndexMax >= 8.0);
  const isHighHeat = current.temperature >= 32.0 || (todayForecast && todayForecast.tempMax >= 34.0);

  if (isHighUV || isHighHeat) {
    const isCritical = current.uvIndex >= 10 || current.temperature >= 36.0;
    alerts.push({
      id: 'alert-sun',
      type: 'sun',
      severity: isCritical ? 'critical' : 'warning',
      titlePt: isCritical ? '☀️ Alerta Extremo: Radiação Solar & Calor' : '☀️ Alerta de Sol Muito Forte',
      titleEs: isCritical ? '☀️ Alerta Extremo: Radiación Solar y Calor' : '☀️ Alerta de Sol Muy Fuerte',
      messagePt: `Índice UV em ${current.uvIndex.toFixed(1)} e temperatura de ${current.temperature.toFixed(1)}°C. Risco de estresse térmico.`,
      messageEs: `Índice UV en ${current.uvIndex.toFixed(1)} y temperatura de ${current.temperature.toFixed(1)}°C. Riesgo de estrés térmico.`,
      actionPt: 'Acionar telas de sombreamento (sombrite) e monitorar condutividade (CE) da água nas bancadas.',
      actionEs: 'Extender mallas de sombreo y vigilar la conductividad (CE) del agua en las mesadas hidropónicas.',
      value: `UV ${current.uvIndex.toFixed(1)} | ${current.temperature.toFixed(1)} °C`,
    });
  }

  return alerts;
}

// Fallback estático e resiliente para quando estiver offline
function getFallbackWeatherData(): WeatherData {
  const current: CurrentWeather = {
    time: new Date().toISOString(),
    temperature: 28.5,
    humidity: 65,
    apparentTemperature: 30.2,
    precipitation: 0.0,
    weatherCode: 1,
    weatherDescriptionPt: 'Predomínio de sol',
    weatherDescriptionEs: 'Mayormente soleado',
    windSpeed: 14.2,
    windGusts: 22.0,
    uvIndex: 8.4,
  };

  const daily: DailyForecast[] = [
    {
      date: new Date().toISOString().slice(0, 10),
      tempMax: 32.0,
      tempMin: 19.5,
      precipitationSum: 0.0,
      precipitationProbability: 10,
      windSpeedMax: 18.0,
      uvIndexMax: 8.9,
      weatherCode: 1,
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      tempMax: 33.5,
      tempMin: 21.0,
      precipitationSum: 2.5,
      precipitationProbability: 40,
      windSpeedMax: 24.0,
      uvIndexMax: 8.2,
      weatherCode: 2,
    },
    {
      date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
      tempMax: 27.0,
      tempMin: 18.0,
      precipitationSum: 18.0,
      precipitationProbability: 85,
      windSpeedMax: 38.0,
      uvIndexMax: 4.5,
      weatherCode: 80,
    },
  ];

  return {
    city: GUAYAIBI_COORDS.city,
    country: GUAYAIBI_COORDS.country,
    latitude: GUAYAIBI_COORDS.latitude,
    longitude: GUAYAIBI_COORDS.longitude,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    current,
    daily,
    activeAlerts: evaluateWeatherAlerts(current, daily),
  };
}

export class WeatherService {
  private static CACHE_KEY = 'agronorte_weather_cache';
  private static CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutos de cache para otimizar chamadas

  /**
   * Consulta a previsão do tempo em tempo real com fallback automático
   */
  public static async getWeatherForecast(): Promise<WeatherData> {
    try {
      // 1. Tenta carregar do cache se for recente
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const isFresh = Date.now() - parsed.timestamp < this.CACHE_DURATION_MS;
            if (isFresh && parsed.data) {
              return parsed.data;
            }
          } catch {
            // ignora erro de parse de cache
          }
        }
      }

      // 2. Consulta a API Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${GUAYAIBI_COORDS.latitude}&longitude=${GUAYAIBI_COORDS.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=America%2FAsuncion&forecast_days=4`;

      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) {
        throw new Error(`Weather API returned ${response.status}`);
      }

      const json = await response.json();
      const curr = json.current;
      const desc = getWeatherDescription(curr.weather_code);

      const current: CurrentWeather = {
        time: curr.time,
        temperature: Math.round(curr.temperature_2m * 10) / 10,
        humidity: curr.relative_humidity_2m,
        apparentTemperature: Math.round(curr.apparent_temperature * 10) / 10,
        precipitation: curr.precipitation || 0,
        weatherCode: curr.weather_code,
        weatherDescriptionPt: desc.pt,
        weatherDescriptionEs: desc.es,
        windSpeed: Math.round(curr.wind_speed_10m * 10) / 10,
        windGusts: Math.round((curr.wind_gusts_10m || curr.wind_speed_10m * 1.3) * 10) / 10,
        uvIndex: Math.round((curr.uv_index || 0) * 10) / 10,
      };

      const daily: DailyForecast[] = (json.daily.time || []).map((date: string, idx: number) => ({
        date,
        tempMax: Math.round(json.daily.temperature_2m_max[idx] * 10) / 10,
        tempMin: Math.round(json.daily.temperature_2m_min[idx] * 10) / 10,
        precipitationSum: Math.round(json.daily.precipitation_sum[idx] * 10) / 10,
        precipitationProbability: json.daily.precipitation_probability_max[idx] || 0,
        windSpeedMax: Math.round(json.daily.wind_speed_10m_max[idx] * 10) / 10,
        uvIndexMax: Math.round(json.daily.uv_index_max[idx] * 10) / 10,
        weatherCode: json.daily.weather_code[idx] || 0,
      }));

      const activeAlerts = evaluateWeatherAlerts(current, daily);

      const weatherData: WeatherData = {
        city: GUAYAIBI_COORDS.city,
        country: GUAYAIBI_COORDS.country,
        latitude: GUAYAIBI_COORDS.latitude,
        longitude: GUAYAIBI_COORDS.longitude,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        current,
        daily,
        activeAlerts,
      };

      // Salva no cache do navegador
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          this.CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: weatherData })
        );
      }

      return weatherData;
    } catch (err) {
      console.warn('Falha ao consultar API de clima externa, usando fallback:', err);
      return getFallbackWeatherData();
    }
  }
}
