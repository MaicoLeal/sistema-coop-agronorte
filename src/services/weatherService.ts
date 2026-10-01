/**
 * Serviço de Previsão do Tempo e Alertas Climáticos para a Cooperativa Agronorte
 * Localização: Guayaibí, Departamento de San Pedro, Paraguay (-24.4842, -56.5392)
 * Fonte: Open-Meteo API (Global High-Resolution Weather Model)
 */

export type WeatherAlertSeverity = 'info' | 'warning' | 'critical';
export type WeatherAlertType = 'rain' | 'wind' | 'sun';
export type GreenhouseCrop = 'tomate' | 'locote';

export interface GreenhouseActionItem {
  id: 'curtains' | 'shading' | 'irrigation' | 'sanitary';
  titlePt: string;
  titleEs: string;
  status: 'ok' | 'warning' | 'alert';
  badgePt: string;
  badgeEs: string;
  instructionPt: string;
  instructionEs: string;
  reasonPt: string;
  reasonEs: string;
}

export interface CropGreenhouseAdvice {
  crop: GreenhouseCrop;
  cropNamePt: string;
  cropNameEs: string;
  cropEmoji: string;
  overallStatus: 'ideal' | 'attention' | 'critical';
  statusTitlePt: string;
  statusTitleEs: string;
  statusMessagePt: string;
  statusMessageEs: string;
  voiceBriefingPt: string;
  voiceBriefingEs: string;
  actions: GreenhouseActionItem[];
}

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
  greenhouseAdvice?: Record<GreenhouseCrop, CropGreenhouseAdvice>;
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

// Avalia e gera orientações práticas de estufa para Tomate e Pimentão (Locote)
export function evaluateGreenhouseAdvice(
  current: CurrentWeather,
  daily: DailyForecast[],
  crop: GreenhouseCrop = 'tomate'
): CropGreenhouseAdvice {
  const isTomato = crop === 'tomate';
  const todayForecast = daily[0];
  const temp = current.temperature;
  const maxTemp = todayForecast?.tempMax ?? temp;
  const humidity = current.humidity;
  const rain = current.precipitation > 0.2 || (current.weatherCode >= 51 && current.weatherCode <= 99);
  const rainProb = todayForecast?.precipitationProbability ?? 0;
  const wind = current.windSpeed;
  const windGusts = current.windGusts;
  const uv = current.uvIndex;

  const actions: GreenhouseActionItem[] = [];

  // 1. CORTINAS LATERAIS (VENTILAÇÃO & PROTEÇÃO ESTRUTURAL)
  if (wind >= 38 || windGusts >= 50) {
    actions.push({
      id: 'curtains',
      titlePt: 'Cortinas Laterais',
      titleEs: 'Cortinas Laterales',
      status: 'alert',
      badgePt: 'Travar Cortinas',
      badgeEs: 'Trabar Cortinas',
      instructionPt: 'Travar cortinas plásticas para evitar rasgos na lona.',
      instructionEs: 'Trabar cortinas plásticas para proteger la estructura.',
      reasonPt: `Rajadas de vento atingindo ${windGusts.toFixed(0)} km/h em San Pedro.`,
      reasonEs: `Ráfagas de viento alcanzando ${windGusts.toFixed(0)} km/h en San Pedro.`,
    });
  } else if (rain || rainProb >= 70) {
    actions.push({
      id: 'curtains',
      titlePt: 'Cortinas Laterais',
      titleEs: 'Cortinas Laterales',
      status: 'warning',
      badgePt: 'Fechar Lado da Chuva',
      badgeEs: 'Cerrar Lado de Lluvia',
      instructionPt: 'Fechar cortinas para manter as folhas secas.',
      instructionEs: 'Cerrar cortinas para mantener follaje seco.',
      reasonPt: 'Respingo de chuva nas folhas é o principal gatilho de fungos na estufa.',
      reasonEs: 'Salpicaduras de lluvia son el principal disparador de hongos.',
    });
  } else if (temp >= 28 || maxTemp >= 30) {
    actions.push({
      id: 'curtains',
      titlePt: 'Cortinas Laterais',
      titleEs: 'Cortinas Laterales',
      status: 'warning',
      badgePt: 'Abrir Totalmente',
      badgeEs: 'Abrir Totalmente',
      instructionPt: 'Abrir laterais ao máximo para circulação de ar fresco.',
      instructionEs: 'Abrir laterales al máximo para ventilación cruzada.',
      reasonPt: isTomato
        ? 'Ventilação baixa a temperatura e evita o aborto de flores no tomate.'
        : 'Evita bolsões de ar quente que estressam o locote verde.',
      reasonEs: isTomato
        ? 'Ventilación baja la temperatura y evita aborto floral en tomate.'
        : 'Evita bolsas de aire caliente que estresan al locote verde.',
    });
  } else if (temp < 18) {
    actions.push({
      id: 'curtains',
      titlePt: 'Cortinas Laterais',
      titleEs: 'Cortinas Laterales',
      status: 'warning',
      badgePt: 'Manter Fechado',
      badgeEs: 'Mantener Cerrado',
      instructionPt: 'Manter cortinas fechadas para conservar o calor interno.',
      instructionEs: 'Mantener cortinas cerradas para conservar calor térmico.',
      reasonPt: 'Temperatura baixa desacelera o desenvolvimento das raízes.',
      reasonEs: 'Baja temperatura frena el desarrollo de las raíces.',
    });
  } else {
    actions.push({
      id: 'curtains',
      titlePt: 'Cortinas Laterais',
      titleEs: 'Cortinas Laterales',
      status: 'ok',
      badgePt: 'Abertura Ideal',
      badgeEs: 'Apertura Óptima',
      instructionPt: 'Manter cortinas em meia abertura para fluxo suave.',
      instructionEs: 'Mantener cortinas a media altura para flujo suave.',
      reasonPt: 'Ambiente arejado e seguro sem risco de vento forte.',
      reasonEs: 'Ambiente fresco sin riesgo de vientos dañinos.',
    });
  }

  // 2. SOMBRITE (TELA DE SOMBREAMENTO)
  if (isTomato) {
    if (uv >= 8.0 || temp >= 31 || maxTemp >= 33) {
      actions.push({
        id: 'shading',
        titlePt: 'Tela de Sombrite',
        titleEs: 'Malla de Sombreo',
        status: 'alert',
        badgePt: 'Puxar Sombrite 35-50%',
        badgeEs: 'Extender Sombreo 35-50%',
        instructionPt: 'Acionar sombrite entre 10h30 e 15h00.',
        instructionEs: 'Extender malla entre 10:30 y 15:00 horas.',
        reasonPt: 'Sol muito forte aborta pólen do tomate e queima folhas apicais.',
        reasonEs: 'Sol muy fuerte aborta polen del tomate y quema brotes.',
      });
    } else if (uv >= 6.5 || temp >= 27) {
      actions.push({
        id: 'shading',
        titlePt: 'Tela de Sombrite',
        titleEs: 'Malla de Sombreo',
        status: 'warning',
        badgePt: 'Alerta de Pico Solar',
        badgeEs: 'Atención Pico Solar',
        instructionPt: 'Deixar sombrite a postos para o horário mais quente.',
        instructionEs: 'Dejar malla lista para las horas más calurosas.',
        reasonPt: 'Atenua radiação direta sem bloquear fotossíntese necessária.',
        reasonEs: 'Atenúa radiación directa sin frenar fotosíntesis.',
      });
    } else {
      actions.push({
        id: 'shading',
        titlePt: 'Tela de Sombrite',
        titleEs: 'Malla de Sombreo',
        status: 'ok',
        badgePt: 'Sombrite Recolhido',
        badgeEs: 'Malla Recogida',
        instructionPt: 'Deixar luz plena para desenvolvimento dos frutos.',
        instructionEs: 'Permitir entrada plena de luz para crecimiento de frutos.',
        reasonPt: 'Níveis de radiação amenos ideais para frutificação do tomate.',
        reasonEs: 'Radiación moderada ideal para cuajado de frutos.',
      });
    }
  } else {
    // Locote (Pimentão) - Extra sensível ao golpe de sol (sunscald)
    if (uv >= 7.5 || temp >= 30 || maxTemp >= 32) {
      actions.push({
        id: 'shading',
        titlePt: 'Tela de Sombrite',
        titleEs: 'Malla de Sombreo',
        status: 'alert',
        badgePt: 'PROTEGER FRUTOS (Sombrite)',
        badgeEs: 'PROTEGER FRUTOS (Malla)',
        instructionPt: 'Estender sombrite para evitar queimadura (golpe de sol) nos locotes.',
        instructionEs: 'Extender malla para evitar golpe de sol en frutos de locote.',
        reasonPt: 'A casca do pimentão queima fácil e apodrece com sol direto intenso.',
        reasonEs: 'La cáscara del locote se quema y descompone con sol directo intenso.',
      });
    } else if (uv >= 6.0 || temp >= 26) {
      actions.push({
        id: 'shading',
        titlePt: 'Tela de Sombrite',
        titleEs: 'Malla de Sombreo',
        status: 'warning',
        badgePt: 'Sombreo Parcial',
        badgeEs: 'Sombreo Parcial',
        instructionPt: 'Puxar sombrite leve no meio do dia.',
        instructionEs: 'Extender sombreado en horas centrales.',
        reasonPt: 'Garante verde uniforme e casca brilhante de padrão comercial.',
        reasonEs: 'Asegura verde parejo y brillo comercial en los frutos.',
      });
    } else {
      actions.push({
        id: 'shading',
        titlePt: 'Tela de Sombrite',
        titleEs: 'Malla de Sombreo',
        status: 'ok',
        badgePt: 'Luz Apropriada',
        badgeEs: 'Luz Apropiada',
        instructionPt: 'Manter sombrite aberto sem necessidade de bloqueio.',
        instructionEs: 'Mantener malla abierta sin restricción.',
        reasonPt: 'Intensidade solar suave e segura para o locote.',
        reasonEs: 'Intensidad de luz suave y segura para el locote.',
      });
    }
  }

  // 3. FERTIRRIGAÇÃO & HIDRATAÇÃO
  if (isTomato) {
    if (temp >= 30 || maxTemp >= 32) {
      actions.push({
        id: 'irrigation',
        titlePt: 'Fertirrigação',
        titleEs: 'Fertirriego',
        status: 'warning',
        badgePt: 'Pulsos Curtos + Cálcio',
        badgeEs: 'Pulsos Cortos + Calcio',
        instructionPt: 'Aumentar pulsos curtos e reforçar Cálcio na solução.',
        instructionEs: 'Aumentar pulsos cortos y reforzar Calcio en solución.',
        reasonPt: 'Evita a podridão apical ("fundo preto") causada por calor e estresse hídrico.',
        reasonEs: 'Previene culillo negro (podredumbre apical) por calor y sed de la planta.',
      });
    } else if (humidity >= 80 || rain) {
      actions.push({
        id: 'irrigation',
        titlePt: 'Fertirrigação',
        titleEs: 'Fertirriego',
        status: 'warning',
        badgePt: 'Reduzir Pulsos',
        badgeEs: 'Reducir Pulsos',
        instructionPt: 'Espaçar regas para evitar encharcamento da raiz.',
        instructionEs: 'Espaciar riegos para evitar saturación de raíz.',
        reasonPt: 'Com umidade alta a planta transpira menos e absorve menos água.',
        reasonEs: 'Con alta humedad el cultivo transpira poco y ahorra agua.',
      });
    } else {
      actions.push({
        id: 'irrigation',
        titlePt: 'Fertirrigação',
        titleEs: 'Fertirriego',
        status: 'ok',
        badgePt: 'Nutrição Balanceada',
        badgeEs: 'Nutrición Normal',
        instructionPt: 'Manter EC entre 2.2 e 2.6 mS/cm e pH 6.0 a 6.3.',
        instructionEs: 'Mantener CE entre 2.2 y 2.6 mS/cm y pH 6.0 a 6.3.',
        reasonPt: 'Absorção contínua e equilíbrio nutricional excelente.',
        reasonEs: 'Nutrición balanceada y óptima absorción radicular.',
      });
    }
  } else {
    // Locote
    if (temp >= 30 || maxTemp >= 32) {
      actions.push({
        id: 'irrigation',
        titlePt: 'Fertirrigação',
        titleEs: 'Fertirriego',
        status: 'warning',
        badgePt: 'Hidratação Uniforme',
        badgeEs: 'Hidratación Uniforme',
        instructionPt: 'Manter substrato úmido sem oscilações bruscas.',
        instructionEs: 'Mantener humedad pareja en sustrato sin secar.',
        reasonPt: 'Oscilação hídrica em dias quentes deforma a parede do pimentão.',
        reasonEs: 'Falta de agua en calor deforma y agrieta las paredes del locote.',
      });
    } else if (humidity >= 80 || rain) {
      actions.push({
        id: 'irrigation',
        titlePt: 'Fertirrigação',
        titleEs: 'Fertirriego',
        status: 'warning',
        badgePt: 'Vigiar Drenagem',
        badgeEs: 'Vigilar Drenaje',
        instructionPt: 'Conferir vazão das calhas e espaçar fertirrigação.',
        instructionEs: 'Verificar drenaje de mesadas y espaciar riegos.',
        reasonPt: 'Raízes de pimentão não toleram asfixia por água parada.',
        reasonEs: 'Raíces de locote se asfixian si el sustrato queda anegado.',
      });
    } else {
      actions.push({
        id: 'irrigation',
        titlePt: 'Fertirrigação',
        titleEs: 'Fertirriego',
        status: 'ok',
        badgePt: 'Manejo Padrão',
        badgeEs: 'Manejo Habitual',
        instructionPt: 'Pulsos regulares com EC 1.8 a 2.3 mS/cm.',
        instructionEs: 'Pulsos regulares con CE 1.8 a 2.3 mS/cm.',
        reasonPt: 'Garante peso de polpa e paredes grossas no locote.',
        reasonEs: 'Asegura pulpa gruesa y peso comercial óptimo.',
      });
    }
  }

  // 4. SANIDADE FOLIAR & PREVENÇÃO DE FUNGOS/PRAGAS
  if (isTomato) {
    if ((humidity >= 75 && temp >= 18 && temp <= 28) || rain || rainProb >= 65) {
      actions.push({
        id: 'sanitary',
        titlePt: 'Sanidade & Fungos',
        titleEs: 'Sanidad y Hongos',
        status: 'alert',
        badgePt: 'ALTO RISCO DE REQUEIMA',
        badgeEs: 'ALTO RIESGO DE TIZÓN',
        instructionPt: 'Vistoriar folhas baixeiras e manter ventilação ativa.',
        instructionEs: 'Inspeccionar hojas basales y ventilar continuamente.',
        reasonPt: 'Clima úmido é o estopim de Requeima (Phytophthora) e Pinta Preta.',
        reasonEs: 'Alta humedad dispara Tizón Tardío y Mancha Negra en tomate.',
      });
    } else if (temp >= 31 && humidity < 50) {
      actions.push({
        id: 'sanitary',
        titlePt: 'Sanidade & Fungos',
        titleEs: 'Sanidad y Hongos',
        status: 'warning',
        badgePt: 'Atenção a Ácaros',
        badgeEs: 'Atención a Ácaros',
        instructionPt: 'Verificar face inferior das folhas contra ácaros.',
        instructionEs: 'Revisar envés de las hojas por presencia de ácaros.',
        reasonPt: 'Tempo quente e seco favorece ácaro-do-bronzeamento.',
        reasonEs: 'Calor seco favorece ácaros en la tomatera.',
      });
    } else {
      actions.push({
        id: 'sanitary',
        titlePt: 'Sanidade & Fungos',
        titleEs: 'Sanidad y Hongos',
        status: 'ok',
        badgePt: 'Folhas Seguras',
        badgeEs: 'Follaje Seguro',
        instructionPt: 'Sem risco iminente de fungos foliares hoje.',
        instructionEs: 'Sin riesgo inmediato de hongos foliares hoy.',
        reasonPt: 'Ambiente com baixa pressão sanitária.',
        reasonEs: 'Ambiente con baja presión sanitaria.',
      });
    }
  } else {
    // Locote
    if ((humidity >= 75 && temp >= 21) || rain || rainProb >= 65) {
      actions.push({
        id: 'sanitary',
        titlePt: 'Sanidade & Fungos',
        titleEs: 'Sanidad y Hongos',
        status: 'alert',
        badgePt: 'ALERTA DE ANTRACNOSE',
        badgeEs: 'ALERTA DE ANTRACNOSIS',
        instructionPt: 'Desinfetar tesouras de colheita e não molhar frutos.',
        instructionEs: 'Desinfectar tijeras y evitar mojar frutos de locote.',
        reasonPt: 'Calor com umidade causa manchas deprimidas nos frutos (Antracnose).',
        reasonEs: 'Humedad con calor genera manchas hundidas (Antracnosis).',
      });
    } else if (temp >= 29 && humidity < 55) {
      actions.push({
        id: 'sanitary',
        titlePt: 'Sanidade & Fungos',
        titleEs: 'Sanidad y Hongos',
        status: 'warning',
        badgePt: 'Atenção ao Ácaro Branco',
        badgeEs: 'Atención Ácaro Blanco',
        instructionPt: 'Examinar ponteiros novos (folhas encarquilhadas).',
        instructionEs: 'Revisar brotes tiernos (hojas curvadas).',
        reasonPt: 'Ácaro-branco paralisa brotação do pimentão sob sol quente.',
        reasonEs: 'Ácaro blanco detiene brotes nuevos del locote en calor.',
      });
    } else {
      actions.push({
        id: 'sanitary',
        titlePt: 'Sanidade & Fungos',
        titleEs: 'Sanidad y Hongos',
        status: 'ok',
        badgePt: 'Sanidade Ótima',
        badgeEs: 'Sanidad Óptima',
        instructionPt: 'Plantas sadias e frutos brilhantes.',
        instructionEs: 'Plantas sanas y frutos con brillo.',
        reasonPt: 'Clima favorável para desenvolvimento do locote.',
        reasonEs: 'Clima favorable para desarrollo del locote.',
      });
    }
  }

  // DETERMINAÇÃO DO STATUS GERAL ("SEMÁFORO")
  const hasAlert = actions.some((a) => a.status === 'alert');
  const hasWarning = actions.some((a) => a.status === 'warning');
  const overallStatus: 'ideal' | 'attention' | 'critical' = hasAlert
    ? 'critical'
    : hasWarning
    ? 'attention'
    : 'ideal';

  const cropNamePt = isTomato ? 'Tomate Hidropônico' : 'Pimentão (Locote)';
  const cropNameEs = isTomato ? 'Tomate Hidropónico' : 'Locote Verde';
  const cropEmoji = isTomato ? '🍅' : '🫑';

  let statusTitlePt = 'Estufa em Condições Excelentes';
  let statusTitleEs = 'Invernadero en Condiciones Excelentes';
  let statusMessagePt = `O clima hoje está equilibrado para o cultivo de ${cropNamePt.toLowerCase()}. Mantenha a rotina de manejo.`;
  let statusMessageEs = `El clima hoy está equilibrado para el cultivo de ${cropNameEs.toLowerCase()}. Mantenga el manejo habitual.`;

  if (overallStatus === 'critical') {
    statusTitlePt = 'Atenção Crítica: Ajustes Imediatos na Estufa';
    statusTitleEs = 'Atención Crítica: Ajustes Inmediatos en Invernadero';
    const alertAction = actions.find((a) => a.status === 'alert');
    statusMessagePt = alertAction ? `${alertAction.instructionPt} ${alertAction.reasonPt}` : `Condições climáticas exigem proteção para o ${cropNamePt.toLowerCase()}.`;
    statusMessageEs = alertAction ? `${alertAction.instructionEs} ${alertAction.reasonEs}` : `Condiciones climáticas exigen protección para el ${cropNameEs.toLowerCase()}.`;
  } else if (overallStatus === 'attention') {
    statusTitlePt = 'Manejo Preventivo do Dia';
    statusTitleEs = 'Manejo Preventivo del Día';
    const warningAction = actions.find((a) => a.status === 'warning');
    statusMessagePt = warningAction ? `${warningAction.instructionPt} ${warningAction.reasonPt}` : `Acompanhe a ventilação e a fertirrigação para o ${cropNamePt.toLowerCase()}.`;
    statusMessageEs = warningAction ? `${warningAction.instructionEs} ${warningAction.reasonEs}` : `Acompañe ventilación y fertirriego para el ${cropNameEs.toLowerCase()}.`;
  }

  // Roteiro de Áudio Direto para o Don Mateo Falar
  const voiceBriefingPt = isTomato
    ? `Olá amigo produtor! Aqui Don Mateo com o boletim da sua estufa de tomate. ${statusMessagePt} Verifique suas cortinas e o sombrite. Qualquer suspeita de mancha nas folhas, abra a câmera para diagnóstico rápido. Bom trabalho no campo!`
    : `Olá parceiro! Don Mateo na escuta com a orientação para seu pimentão locote. ${statusMessagePt} Cuidado com o sol forte nos frutos e mantenha boa ventilação. Bom manejo na estufa!`;

  const voiceBriefingEs = isTomato
    ? `¡Hola amigo productor! Aquí Don Mateo con el reporte para tu invernadero de tomate. ${statusMessageEs} Revisa cortinas y malla de sombreo. Ante cualquier mancha en hojas, usa la cámara para diagnóstico. ¡Buena jornada!`
    : `¡Hola amigo productor! Aquí Don Mateo con la guía para tu locote verde. ${statusMessageEs} Protege los frutos del sol fuerte y asegura buena ventilación. ¡Excelente trabajo en el campo!`;

  return {
    crop,
    cropNamePt,
    cropNameEs,
    cropEmoji,
    overallStatus,
    statusTitlePt,
    statusTitleEs,
    statusMessagePt,
    statusMessageEs,
    voiceBriefingPt,
    voiceBriefingEs,
    actions,
  };
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
    greenhouseAdvice: {
      tomate: evaluateGreenhouseAdvice(current, daily, 'tomate'),
      locote: evaluateGreenhouseAdvice(current, daily, 'locote'),
    },
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
        greenhouseAdvice: {
          tomate: evaluateGreenhouseAdvice(current, daily, 'tomate'),
          locote: evaluateGreenhouseAdvice(current, daily, 'locote'),
        },
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

  /**
   * Obtém a recomendação agronômica para o cultivo específico (Tomate ou Locote/Pimentão)
   */
  public static getGreenhouseAdvice(
    weather: WeatherData,
    crop: GreenhouseCrop = 'tomate'
  ): CropGreenhouseAdvice {
    if (weather.greenhouseAdvice && weather.greenhouseAdvice[crop]) {
      return weather.greenhouseAdvice[crop];
    }
    return evaluateGreenhouseAdvice(weather.current, weather.daily, crop);
  }
}
