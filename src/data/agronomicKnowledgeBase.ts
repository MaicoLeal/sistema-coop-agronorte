import { Language } from '../types';
import type { VoiceAssistantResponse } from '../services/voiceAssistantService';

export interface AgronomicKnowledgeItem {
  id: string;
  category: 'hidroponia' | 'tomate' | 'pimentao' | 'agricultura_estufas' | 'pragas_doencas' | 'colheita_operacao';
  keywordsPt: string[];
  keywordsEs: string[];
  titlePt: string;
  titleEs: string;
  answerPt: string;
  answerEs: string;
  speakPt: string;
  speakEs: string;
  actionType?: 'open_harvest' | 'open_pest_diagnosis' | 'show_greenhouses' | 'none';
}

export const AGRONOMIC_KNOWLEDGE_BASE: AgronomicKnowledgeItem[] = [
  // ==========================================
  // HIDROPONIA & SOLUÇÕES NUTRITIVAS
  // ==========================================
  {
    id: 'hidroponia_geral_sistemas',
    category: 'hidroponia',
    keywordsPt: ['hidroponia', 'hidroponico', 'sistema hidroponico', 'o que e hidroponia', 'como funciona hidroponia', 'nft', 'substrato'],
    keywordsEs: ['hidroponia', 'hidroponico', 'sistema hidroponico', 'que es hidroponia', 'como funciona hidroponia', 'nft', 'sustrato'],
    titlePt: 'Sistemas de Hidroponia (NFT e Substrato)',
    titleEs: 'Sistemas Hidropónicos (NFT y Sustrato)',
    answerPt: 'Na Coop Agronorte utilizamos principalmente dois sistemas: 1) Sistema NFT (fluxo laminar de nutrientes) para hortaliças e fases iniciais, e 2) Semi-hidroponia em substrato inerte (fibra de coco e casca de arroz carbonizada) com gotejamento fertirrigado para tomate e pimentão, garantindo melhor suporte radicular e aeração constante.',
    answerEs: 'En la Coop Agronorte usamos dos sistemas principales: 1) Sistema NFT (técnica de lámina de nutrientes) para hortalizas y fases iniciales, y 2) Semi-hidroponía en sustrato inerte (fibra de coco y cascarilla de arroz carbonizada) con fertirriego por goteo para tomate y locote, asegurando anclaje y oxigenación radicular.',
    speakPt: 'Na hidroponia da Agronorte, usamos o sistema NFT e também cultivo em substrato de fibra de coco com fertirrigação por gotejamento, ideal para tomate e pimentão com raízes bem oxigenadas.',
    speakEs: 'En hidroponía manejamos el sistema NFT y cultivo en sustrato de fibra de coco con fertirriego por goteo, perfecto para tomate y locote con raíces bien oxigenadas.',
    actionType: 'none'
  },
  {
    id: 'hidroponia_ph_manejo',
    category: 'hidroponia',
    keywordsPt: ['ph hidroponia', 'regular ph', 'ph ideal', 'ph da agua', 'ph solucao', 'acido nitrico', 'acido fosforico', 'como corrigir ph'],
    keywordsEs: ['ph hidroponia', 'regular ph', 'ph ideal', 'ph del agua', 'ph solucion', 'acido nitrico', 'acido fosforico', 'como corregir ph'],
    titlePt: 'Manejo e Correção do pH na Hidroponia',
    titleEs: 'Manejo y Corrección del pH en Hidroponía',
    answerPt: 'A faixa ideal de pH para hidroponia e fertirrigação é entre 5.8 e 6.2 (aceitável de 5.5 a 6.5). Se o pH estiver acima de 6.5, nutrientes como ferro, fósforo e zinco precipitam. Para baixar o pH, use solução diluída de ácido nítrico (fase vegetativa) ou ácido fosfórico (floração/frutificação). Para subir, use hidróxido de potássio (KOH). Meça diariamente sempre no mesmo horário.',
    answerEs: 'El rango óptimo de pH en hidroponía es de 5.8 a 6.2 (tolerable de 5.5 a 6.5). Con pH superior a 6.5 se precipitan el hierro, fósforo y zinc. Para bajar el pH se usa ácido nítrico diluido o ácido fosfórico; para subirlo, hidróxido de potasio. Debe medirse todos los días a la misma hora.',
    speakPt: 'O pH ideal da água deve ficar entre 5.8 e 6.2. Se passar de 6.5, a planta não consegue absorver ferro e fósforo. Para baixar use ácido nítrico ou fosfórico, e para subir hidróxido de potássio. Lembre de medir todo dia.',
    speakEs: 'El pH ideal debe mantenerse entre 5.8 y 6.2. Si sube de 6.5, la planta no absorbe hierro ni fósforo. Para bajarlo usamos ácido nítrico o fosfórico, y para subirlo hidróxido de potasio.',
    actionType: 'none'
  },
  {
    id: 'hidroponia_ec_condutividade',
    category: 'hidroponia',
    keywordsPt: ['ec', 'condutividade', 'condutividade eletrica', 'ce hidroponia', 'salinidade', 'adubacao agua', 'concentracao adubo'],
    keywordsEs: ['ec', 'conductividad', 'conductividad electrica', 'ce hidroponia', 'salinidad', 'abono agua', 'concentracion nutrientes'],
    titlePt: 'Condutividade Elétrica (EC) e Salinidade',
    titleEs: 'Conductividad Eléctrica (CE) y Salinidad',
    answerPt: 'A condutividade elétrica (EC) mede a quantidade de nutrientes dissolvidos na água. Para mudas novas, mantemos EC entre 1.2 e 1.5 mS/cm; em crescimento vegetativo, 1.8 a 2.2 mS/cm; na frutificação do tomate, 2.2 a 2.8 mS/cm; e no pimentão verde, entre 1.8 e 2.4 mS/cm. Se a EC subir demais em dias quentes devido à evaporação, adicione água pura para evitar queima de raízes.',
    answerEs: 'La conductividad eléctrica (CE) mide la concentración de sales y abono disuelto. En plantines usamos 1.2 a 1.5 mS/cm; en desarrollo vegetativo 1.8 a 2.2 mS/cm; en fructificación de tomate 2.2 a 2.8 mS/cm; y en locote entre 1.8 y 2.4 mS/cm. Si la CE sube por calor extremo, agregue agua pura al reservorio.',
    speakPt: 'A condutividade elétrica mede os nutrientes na água. No tomate varia de 2.0 a 2.8 mS/cm e no pimentão entre 1.8 e 2.4. Se a condutividade subir muito nos dias quentes, complete com água limpa para não estressar as raízes.',
    speakEs: 'La conductividad eléctrica mide los nutrientes en agua. Para tomate va de 2.0 a 2.8 mS/cm y para locote entre 1.8 y 2.4. Si sube mucho por el calor, agregue agua pura al tanque.',
    actionType: 'none'
  },
  {
    id: 'hidroponia_oxigenio_temperatura',
    category: 'hidroponia',
    keywordsPt: ['temperatura da agua', 'oxigenacao hidroponica', 'oxigenio raiz', 'agua quente hidroponia', 'reservatorio', 'bomba hidroponica'],
    keywordsEs: ['temperatura del agua', 'oxigenacion hidroponica', 'oxigeno raiz', 'agua caliente hidroponia', 'reservorio', 'bomba hidroponica'],
    titlePt: 'Oxigenação e Temperatura da Solução Nutritiva',
    titleEs: 'Oxigenación y Temperatura de la Solución',
    answerPt: 'A temperatura ideal da solução nutritiva deve ficar entre 18°C e 24°C. Temperaturas acima de 26°C reduzem drasticamente o oxigênio dissolvido na água e favorecem fungos radiculares como Pythium (podridão de raiz). Mantenha o reservatório sombreado, use retorno de água com efeito cascata ou venturi e garanta oxigênio dissolvido acima de 6 mg/L.',
    answerEs: 'La temperatura óptima de la solución nutritiva está entre 18°C y 24°C. Superar 26°C reduce drásticamente el oxígeno disuelto y abre paso al Pythium o pudrición de raíz. Mantenga el tanque aislado del sol directo y asegure aireación con retorno en cascada o sistema venturi.',
    speakPt: 'Mantenha a água da hidroponia fresca, entre 18 e 24 graus. Se a água passar de 26 graus, falta oxigênio para as raízes e pode dar podridão por Pythium. Mantenha os reservatórios bem protegidos do sol.',
    speakEs: 'Mantenga el agua entre 18 y 24 grados. Si pasa de 26 grados, las raíces se asfixian por falta de oxígeno y favorece la pudrición por hongos. Mantenga el reservorio bien sombreado.',
    actionType: 'none'
  },

  // ==========================================
  // CULTIVO DE TOMATE (TOMATEIRO)
  // ==========================================
  {
    id: 'tomate_manejo_geral',
    category: 'tomate',
    keywordsPt: ['cultivo de tomate', 'como plantar tomate', 'como cultivar tomate', 'manejo do tomate', 'tomateiro', 'cultivar tomate', 'saladete', 'san marzano'],
    keywordsEs: ['cultivo de tomate', 'como plantar tomate', 'como cultivar tomate', 'manejo de tomate', 'tomatera', 'cultivar tomate', 'saladete', 'san marzano'],
    titlePt: 'Guia Completo de Cultivo do Tomate',
    titleEs: 'Guía de Manejo del Tomate',
    answerPt: 'O tomateiro exige alta luminosidade, temperatura diurna entre 21°C e 27°C e noturna de 16°C a 19°C. Na hidroponia em substrato, manejamos pH de 5.8 a 6.3 e EC de 2.0 a 2.8 mS/cm. Os pilares do manejo são: tutoramento vertical em fitilho, desbrota semanal de ramos axilares, desfolha baixeira preventiva e nutrição rica em Cálcio, Potássio e Magnésio.',
    answerEs: 'El tomate requiere alta luminosidad, temperatura diurna de 21°C a 27°C y nocturna de 16°C a 19°C. En sustrato manejamos pH de 5.8 a 6.3 y CE de 2.0 a 2.8 mS/cm. Los pasos clave son: tutorado vertical con hilo, desbrote semanal de axilares, deshoje basal sanitario y buen balance de Calcio, Potasio y Magnesio.',
    speakPt: 'O tomateiro precisa de boa luz e temperatura entre 21 e 27 graus. Mantenha o pH entre 5.8 e 6.3 e a condutividade em 2.2 a 2.8. Não descuide da desbrota semanal dos brotos ladrões e do tutoramento com fitilho.',
    speakEs: 'El tomate necesita buena luz y temperatura entre 21 y 27 grados. Manejamos pH entre 5.8 y 6.3 y conductividad de 2.2 a 2.8. No olvide el desbrote semanal y el tutorado con hilo.',
    actionType: 'none'
  },
  {
    id: 'tomate_poda_desbrota',
    category: 'tomate',
    keywordsPt: ['poda do tomate', 'desbrota tomate', 'broto ladrao', 'desfolha tomate', 'como podar tomate', 'tutoramento tomate', 'conducao tomate'],
    keywordsEs: ['poda del tomate', 'desbrote tomate', 'chupones tomate', 'deshoje tomate', 'como podar tomate', 'tutorado tomate', 'conduccion tomate'],
    titlePt: 'Poda, Desbrota e Desfolha do Tomateiro',
    titleEs: 'Poda, Desbrote y Deshoje del Tomate',
    answerPt: 'A desbrota deve ser feita semanalmente, retirando manualmente os brotos axilares ("ladrões") quando tiverem de 3 a 5 cm, preferencialmente pela manhã com as plantas secas para rápida cicatrização. Conduza com 1 ou 2 hastes principais tutoradas com fitilho. Conforme as pencas inferiores amadurecem, faça a desfolha baixeira retirando 3 a 4 folhas abaixo da última penca colhida para favorecer aeração e diminuir fungos.',
    answerEs: 'El desbrote debe hacerse semanalmente retirando los brotes axilares (chupones) de 3 a 5 cm, preferiblemente en la mañana cuando las hojas estén secas. Conduzca la planta a 1 o 2 tallos tutorados con hilo. Realice deshoje sanitario de las hojas basales por debajo de los racimos cosechados para mejorar la ventilación.',
    speakPt: 'Faça a desbrota toda semana tirando os brotos ladrões ainda pequenos, com 3 a 5 centímetros, sempre pela manhã com as folhas secas. Conforme for colhendo as pencas de baixo, tire as folhas velhas para circular o ar.',
    speakEs: 'Haga el desbrote cada semana quitando los chupones pequeños de 3 a 5 centímetros en horas de la mañana con hojas secas. Al cosechar los racimos inferiores, quite las hojas viejas para ventilar.',
    actionType: 'none'
  },
  {
    id: 'tomate_podridao_apical',
    category: 'tomate',
    keywordsPt: ['podridao apical', 'fundo preto tomate', 'fundo preto', 'deficiencia de calcio', 'tomate com bunda preta', 'mancha preta fundo tomate', 'blossom end rot'],
    keywordsEs: ['podredumbre apical', 'culo negro tomate', 'fondo negro tomate', 'deficiencia de calcio', 'mancha negra base tomate', 'blossom end rot'],
    titlePt: 'Podridão Apical (Fundo Preto) no Tomate e Pimentão',
    titleEs: 'Podredumbre Apical (Fondo Negro)',
    answerPt: 'A podridão apical é um distúrbio fisiológico causado por deficiência localizada de Cálcio nos tecidos em crescimento do fruto. Geralmente decorre de: 1) Oscilações no fornecimento de água (estresse hídrico que interrompe o fluxo de cálcio pelo xilema); 2) Excesso de calor e ar seco (VPD > 1.5 kPa); 3) Excesso de potássio ou amônio que compete com o cálcio. Solução: estabilizar a fertirrigação, manter VPD entre 0.9 e 1.2 kPa e aplicar nitrato de cálcio ou cloreto de cálcio foliar a 0.5% nas flores e frutos novos.',
    answerEs: 'La podredumbre apical o fondo negro es un desorden fisiológico por falta de Calcio en el ápice del fruto. Ocurre por: 1) Estrés hídrico o riego irregular; 2) Aire muy caliente y seco (VPD alto); 3) Exceso de potasio o amonio que bloquea al calcio. Corrección: regular el riego, controlar el VPD entre 0.9 y 1.2 kPa y aplicar nitrato de calcio foliar al 0.5% en frutos jóvenes.',
    speakPt: 'O fundo preto é falta de cálcio no fruto, quase sempre provocada por estresse de água ou calor excessivo. O cálcio viaja com a água: se o ar seca demais ou a rega oscila, o fruto sofre. Regule a irrigação e aplique cálcio foliar nas flores e frutos pequenos.',
    speakEs: 'El fondo negro se debe a falta de calcio, casi siempre provocada por desequilibrio en el riego o exceso de calor. Ajuste la frecuencia de riego y aplique calcio foliar al 0.5% en flores y frutitos.',
    actionType: 'open_pest_diagnosis'
  },
  {
    id: 'tomate_pragas_tuta_mildio',
    category: 'tomate',
    keywordsPt: ['pragas do tomate', 'traca do tomateiro', 'tuta absoluta', 'requeima tomate', 'mildio tomate', 'doencas do tomate', 'oidio tomate'],
    keywordsEs: ['plagas del tomate', 'polilla del tomate', 'tuta absoluta', 'tizon tomate', 'mildiu tomate', 'enfermedades del tomate', 'oidio tomate'],
    titlePt: 'Pragas e Doenças Principais do Tomateiro',
    titleEs: 'Plagas y Enfermedades del Tomate',
    answerPt: 'As ameaças mais frequentes são: 1) Traça-do-tomateiro (Tuta absoluta), que broca ponteiros e folhas; controle com armadilhas de feromônio e Bacillus thuringiensis. 2) Requeima/Míldio (Phytophthora infestans), com manchas aquosas escuras em folhas e frutos sob alta umidade; evite molhar a folhagem e melhore a ventilação. 3) Mosca-branca, transmissora de geminivírus; instale telas anti-insetos de 50 mesh e armadilhas adesivas amarelas.',
    answerEs: 'Las principales amenazas son: 1) Polilla del tomate (Tuta absoluta), que barrena brotes y hojas; control con trampas de feromona y Bacillus thuringiensis. 2) Tizón tardío / Mildiu (Phytophthora), con manchas oscuras acuosas; ventilar bien el invernadero. 3) Mosca blanca, transmisora de virus; colocar mallas de 50 mesh y trampas amarillas.',
    speakPt: 'No tomate, as maiores pragas são a traça Tuta absoluta e a mosca-branca, além do míldio se a umidade subir. Use armadilhas adesivas amarelas, feromônio para a traça e Bacillus thuringiensis. Tire uma foto na câmera para analisar na hora.',
    speakEs: 'En el tomate debemos cuidar la polilla Tuta absoluta y la mosca blanca, además del mildiu si hay humedad. Use trampas amarillas y Bacillus thuringiensis. Puedes usar el botón de la cámara para diagnosticar con foto.',
    actionType: 'open_pest_diagnosis'
  },

  // ==========================================
  // CULTIVO DE PIMENTÃO VERDE (LOCOTE VERDE)
  // ==========================================
  {
    id: 'pimentao_manejo_geral',
    category: 'pimentao',
    keywordsPt: ['pimentao', 'pimentao verde', 'locote', 'locote verde', 'cultivo de pimentao', 'como plantar pimentao', 'nathalie f1', 'manejo pimentao'],
    keywordsEs: ['locote', 'locote verde', 'pimenton', 'pimenton verde', 'cultivo de locote', 'como plantar locote', 'nathalie f1', 'manejo locote'],
    titlePt: 'Cultivo de Pimentão Verde (Locote Verde)',
    titleEs: 'Cultivo de Locote Verde (Pimentón)',
    answerPt: 'O pimentão verde (conhecido no Paraguai como locote) é uma cultura de alto valor na Coop Agronorte (destaque para a cultivar Nathalie F1). Exige temperaturas entre 22°C e 28°C durante o dia e 18°C a 20°C à noite. É mais sensível à salinidade do que o tomate, requerendo EC de 1.8 a 2.4 mS/cm e pH de 5.8 a 6.2. Precisa de excelente luminosidade e substrato com drenagem perfeita.',
    answerEs: 'El locote verde (pimentón) es un cultivo clave en la Coop Agronorte (variedad destacada Nathalie F1). Exige temperaturas de 22°C a 28°C de día y 18°C a 20°C de noche. Es más sensible a la salinidad que el tomate, requiriendo CE de 1.8 a 2.4 mS/cm y pH de 5.8 a 6.2 en sustrato con óptimo drenaje.',
    speakPt: 'O cultivo do locote verde pede temperatura entre 22 e 28 graus. O pimentão é mais sensível ao excesso de adubo que o tomate, então mantenha a condutividade elétrica entre 1.8 e 2.4 mS/cm e o pH em torno de 6.0.',
    speakEs: 'El locote verde requiere temperatura entre 22 y 28 grados. Es más sensible al exceso de sales que el tomate, por lo que cuidamos la conductividad entre 1.8 y 2.4 y el pH en 6.0.',
    actionType: 'none'
  },
  {
    id: 'pimentao_flor_rei_poda',
    category: 'pimentao',
    keywordsPt: ['flor rei', 'poda do pimentao', 'primeira flor pimentao', 'desbaste pimentao', 'conducao pimentao', 'flor primeira bifurcacao', 'locote flor'],
    keywordsEs: ['flor rey', 'poda del locote', 'primera flor locote', 'desbaste locote', 'conduccion locote', 'primera bifurcacion locote', 'poda pimenton'],
    titlePt: 'Poda da Primeira Flor ("Flor Rei") e Condução do Pimentão',
    titleEs: 'Poda de la Primera Flor ("Flor Rey") en Locote',
    answerPt: 'Prática agronômica fundamental no pimentão: retire SEMPRE a flor da primeira bifurcação (chamada "flor rei" ou "fruto coroa"). Se deixada, ela suga grande parte dos fotoassimilados e paralisa o crescimento vegetativo da planta, reduzindo a produtividade total em mais de 30%. Conduza a planta com 2 a 4 hastes principais bem tutoradas por fitilhos paralelos.',
    answerEs: 'Regla de oro en locote: retire SIEMPRE la primera flor que aparece en la primera bifurcación ("flor rey"). Si se deja, frena el vigor de la planta y disminuye la cosecha total en más de un 30%. Conduzca el cultivo a 2 o 4 ramas principales tutoradas con hilos guía.',
    speakPt: 'Atenção com a primeira flor do pimentão na bifurcação, a chamada flor rei. É fundamental tirar essa primeira flor! Se você deixar, ela trava o crescimento da planta e você perde até 30% da colheita final.',
    speakEs: '¡Mucho ojo con la flor rey en la primera bifurcación del locote! Es vital eliminar esa primera flor para que la planta tome fuerza vegetativa y no se frene la producción total.',
    actionType: 'none'
  },
  {
    id: 'pimentao_aborto_temperatura',
    category: 'pimentao',
    keywordsPt: ['flor caindo pimentao', 'aborto flor pimentao', 'pimentao caindo flor', 'calor pimentao', 'temperatura locote', 'locote caindo flor'],
    keywordsEs: ['caida de flor locote', 'aborto flor locote', 'locote cae flor', 'calor locote', 'temperatura pimenton', 'aborto floral locote'],
    titlePt: 'Aborto Floral e Sensibilidade Térmica no Pimentão',
    titleEs: 'Aborto Floral por Temperatura en Locote',
    answerPt: 'O pimentão verde é extremamente sensível a extremos térmicos. Temperaturas superiores a 32°C ou inferiores a 15°C durante a floração causam esterilidade do pólen e abortamento massivo de flores e frutos pequenos. Para prevenir no calor: aumente a ventilação das cortinas laterais da estufa, use tela termo-refletora (Aluminet 40-50%) e mantenha a umidade do ar para o VPD não disparar.',
    answerEs: 'El locote es muy sensible al estrés térmico. Temperaturas mayores a 32°C o menores a 15°C esterilizan el polen y provocan aborto masivo de flores. Para prevenir: ventile bien con cortinas laterales, use malla termo-reflectante al 40-50% y mantenga humedad para estabilizar el VPD.',
    speakPt: 'Se as flores do pimentão estão caindo, a causa mais comum é o calor acima de 32 graus na estufa, que esteriliza o pólen. Abra as cortinas laterais e use telas de sombreamento para refrescar o ambiente.',
    speakEs: 'Si las flores del locote se caen, la causa principal es calor por encima de 32 grados en el invernadero. Abra las cortinas laterales y use malla sombra para enfriar las plantas.',
    actionType: 'show_greenhouses'
  },
  {
    id: 'pimentao_colheita_ponto',
    category: 'pimentao',
    keywordsPt: [
      'colheita pimentao verde',
      'colheita do pimentao verde',
      'ponto colheita locote',
      'ponto de colheita do locote',
      'ponto de colheita locote',
      'quando colher pimentao',
      'quando colher locote',
      'tamanho locote verde',
      'colheita locote',
      'colheita do locote',
      'colher locote'
    ],
    keywordsEs: [
      'cosecha locote verde',
      'cosecha de locote verde',
      'punto cosecha locote',
      'punto de cosecha del locote',
      'punto de cosecha locote',
      'cuando cosechar locote',
      'cuando cosechar pimenton',
      'tamano locote',
      'cajas locote',
      'cosechar locote'
    ],
    titlePt: 'Ponto Ideal de Colheita do Pimentão Verde',
    titleEs: 'Punto Óptimo de Cosecha del Locote Verde',
    answerPt: 'O pimentão verde deve ser colhido quando atinge o tamanho comercial padrão (8 a 10 cm de diâmetro e peso de 180 a 250g), paredes grossas, polpa firme e coloração verde-escura brilhante, antes de começar a pintar de vermelho. A colheita deve ser feita com tesoura higienizada, deixando 2 a 3 cm de pedúnculo para evitar a entrada de podridões bacterianas no pós-colheita.',
    answerEs: 'El locote verde se cosecha al alcanzar tamaño comercial (180 a 250 gramos), paredes gruesas y color verde oscuro brillante, antes de que vire al rojo. Se debe cortar con tijera desinfectada dejando 2 a 3 cm de pedúnculo para protegerlo de bacterias en postcosecha.',
    speakPt: 'Colha o pimentão verde quando estiver bem firme, pesado e com verde escuro brilhante, antes de começar a avermelhar. Use sempre tesoura limpa deixando dois centímetros de cabo no fruto para proteger contra fungos.',
    speakEs: 'Coseche el locote verde cuando esté firme y con brillo verde oscuro intenso. Corte con tijera limpia dejando dos centímetros de pedúnculo para evitar pudriciones.',
    actionType: 'open_harvest'
  },
  {
    id: 'pimentao_antracnose_acaro',
    category: 'pimentao',
    keywordsPt: ['pragas pimentao', 'antracnose locote', 'acaro branco pimentao', 'locote folha enrolada', 'mancha no locote', 'trips pimentao'],
    keywordsEs: ['plagas locote', 'antracnosis locote', 'acaro blanco locote', 'locote hoja arrugada', 'mancha en fruto locote', 'trips locote'],
    titlePt: 'Pragas e Doenças do Pimentão Verde',
    titleEs: 'Plagas y Enfermedades del Locote',
    answerPt: '1) Antracnose (Colletotrichum): causa lesões circulares deprimidas nos frutos; controle com calda bordalesa preventiva ou oxicloreto de cobre e evite respingos d’água. 2) Ácaro-branco (Polyphagotarsonemus latus): ataca brotos novos deixando folhas duras e encarquilhadas ("folha em colher"); controle com enxofre pó molhável ou óleo de neem. 3) Trips: vetor do vírus vira-cabeça; controle com armadilhas azuis e predadores naturais.',
    answerEs: '1) Antracnosis: manchas circulares hundidas en el fruto; prevenga con oxicloruro de cobre y evite mojar las plantas. 2) Ácaro blanco: hojas apicales encrespadas y endurecidas; controle con azufre o aceite de neem. 3) Trips: transmisor del virus de la peste negra; use trampas adhesivas azules.',
    speakPt: 'No pimentão, fique atento ao ácaro-branco que enrola as folhas novas e à antracnose nos frutos. Use enxofre ou óleo de neem para ácaros, e armadilhas azuis contra trips. Se ver manchas, tire uma foto para diagnóstico.',
    speakEs: 'En el locote preste atención al ácaro blanco que arruga los brotes tiernos y a la antracnosis en frutos. Si nota hojas enrolladas o manchas, use la cámara para revisarlo.',
    actionType: 'open_pest_diagnosis'
  },

  // ==========================================
  // AGRICULTURA & MANEJO DE ESTUFAS (MICROCLIMA)
  // ==========================================
  {
    id: 'estufas_vpd_clima',
    category: 'agricultura_estufas',
    keywordsPt: ['vpd', 'microclima', 'umidade da estufa', 'deficit de pressao', 'transpiracao', 'abafado', 'ventilacao estufa'],
    keywordsEs: ['vpd', 'microclima', 'humedad invernadero', 'deficit presion vapor', 'transpiracion', 'ventilacion invernadero'],
    titlePt: 'VPD e Conforto Climático nas Estufas',
    titleEs: 'VPD y Microclima en Invernaderos',
    answerPt: 'O VPD (Déficit de Pressão de Vapor) mede a força de sucção com que o ar retira água da planta. A faixa ideal para tomate e pimentão é entre 0.8 e 1.2 kPa. Abaixo de 0.6 kPa o ar fica saturado, a planta não transpira e atrai míldio e botrytis. Acima de 1.4 kPa o ar está seco demais, os estômatos se fecham para economizar água e as folhas murcham, provocando aborto floral e podridão apical.',
    answerEs: 'El VPD mide la capacidad del aire para que la planta respire y transpire agua con nutrientes. El rango ideal para tomate y locote es de 0.8 a 1.2 kPa. Menos de 0.6 kPa indica exceso de humedad y hongos; más de 1.4 kPa indica aire muy seco que marchita las hojas y quema los frutos.',
    speakPt: 'O VPD indica o conforto das plantas na estufa. O valor perfeito fica entre 0.8 e 1.2 kPa. Se estiver alto, o ar está seco e a planta sofre sede; se estiver baixo, o ar fica abafado e atrai mofo.',
    speakEs: 'El VPD muestra el bienestar del cultivo. Lo óptimo es entre 0.8 y 1.2 kPa. Si sube de 1.4 el aire está muy seco, y si baja de 0.6 hay peligro de hongos.',
    actionType: 'show_greenhouses'
  },
  {
    id: 'estufas_status_tempo_real',
    category: 'agricultura_estufas',
    keywordsPt: ['estufa agora', 'como estao as estufas', 'sensores estufa', 'invernadero estado', 'status estufa', 'estufa 1', 'estufa 2'],
    keywordsEs: ['como estan los invernaderos', 'sensores invernadero', 'estado invernadero', 'invernadero 1', 'invernadero 2'],
    titlePt: 'Status Atual das Estufas Agronorte',
    titleEs: 'Estado Actual de los Invernaderos',
    answerPt: 'A Estufa 1 (Tomate Saladete San Marzano) está com parâmetros ótimos: pH em 6.1, EC em 2.1 mS/cm e temperatura de 24°C. A Estufa 2 (Locote Verde Nathalie F1) registrou VPD em 1.35 kPa com leve calor. Recomendo manter as cortinas laterais abertas para boa circulação de ar.',
    answerEs: 'El Invernadero 1 (Tomate Saladete) presenta parámetros estables: pH en 6.1, CE en 2.1 mS/cm y temperatura de 24°C. El Invernadero 2 (Locote Verde Nathalie F1) tiene VPD en 1.35 kPa con ambiente algo seco. Se sugiere ventilar abriendo cortinas laterales.',
    speakPt: 'Consultei seus sensores. A Estufa 1 de Tomate está perfeita, com pH 6.1 e adubação ideal. Na Estufa 2 de Locote está um pouco quente e seco, então recomendo abrir as cortinas para correr um ar fresco.',
    speakEs: 'Revisé los sensores. El Invernadero 1 de Tomate está en punto ideal con pH 6.1. En el Invernadero 2 de Locote hace algo de calor seco; conviene ventilar las cortinas laterales.',
    actionType: 'show_greenhouses'
  },

  // ==========================================
  // OPERAÇÃO & COLHEITA
  // ==========================================
  {
    id: 'operacao_registrar_colheita',
    category: 'colheita_operacao',
    keywordsPt: ['registrar colheita', 'como registro a colheita', 'anotar caixas', 'embalar colheita', 'romaneio', 'registrar caixas', 'colher hoje'],
    keywordsEs: ['registrar cosecha', 'como registro la cosecha', 'anotar cajas', 'embalar cosecha', 'registrar cajas', 'cosechar hoy'],
    titlePt: 'Registro de Caixas e Lotes de Colheita',
    titleEs: 'Registro de Cajas y Cosecha',
    answerPt: 'Para registrar sua colheita na plataforma Coop Agronorte: 1) Selecione a estufa correspondente (ex: Estufa 01 de Tomate ou Estufa 02 de Locote); 2) Digite a quantidade de caixas comerciais colhidas hoje; 3) O sistema gera automaticamente o lote rastreável e o QR Code oficial da cooperativa. Clique no botão "Registrar Colheita" para iniciar.',
    answerEs: 'Para registrar la cosecha: 1) Seleccione el invernadero de origen (ej: Invernadero 01 Tomate o 02 Locote); 2) Ingrese el número de cajas recolectadas; 3) El sistema genera el código de lote y código QR de trazabilidad. Presione "Registrar Cosecha" para comenzar.',
    speakPt: 'Para registrar a colheita é muito fácil. Basta selecionar a estufa, informar o total de caixas colhidas e o sistema gera o lote e o QR Code de rastreabilidade na hora. Se quiser, clique em Registrar Colheita que te acompanho.',
    speakEs: 'Para registrar la cosecha solo elige el invernadero, ingresa las cajas recolectadas y el sistema genera la etiqueta QR de trazabilidad al instante. ¡Haz clic en Registrar Cosecha y lo hacemos!',
    actionType: 'open_harvest'
  }
];

const STOP_WORDS = new Set([
  'qual', 'quais', 'como', 'onde', 'quando', 'porque', 'por', 'que', 'para',
  'com', 'sem', 'mais', 'menos', 'uma', 'uns', 'umas', 'esse', 'essa', 'este',
  'esta', 'isso', 'aquilo', 'muito', 'pouco', 'deve', 'fazer', 'sobre', 'estao',
  'qualquer', 'algo', 'pode', 'posso', 'tenho', 'meu', 'minha', 'dele', 'dela',
  'dizer', 'saber', 'qual', 'quais', 'preciso', 'devo', 'ser', 'tem',
  'cual', 'cuales', 'donde', 'cuando', 'este', 'esta', 'para', 'con', 'sin', 'hacer'
]);

/**
 * Normalizes query string for robust fuzzy keyword matching
 */
export function normalizeAgronomicText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesWholePhrase(query: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
  return rx.test(query);
}

/**
 * Intelligent semantic score matching for farmer queries
 */
export function findAgronomicAnswer(
  rawQuery: string,
  lang: Language,
  _context?: {
    greenhouse1Status?: string;
    greenhouse2Status?: string;
    activeBatchCode?: string;
  }
): VoiceAssistantResponse {
  const isPt = lang === 'pt-BR';
  const query = normalizeAgronomicText(rawQuery);
  const contentWords = query
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (contentWords.length === 0) {
    return getContextualFallback(lang, rawQuery);
  }

  let bestScore = 0;
  let bestItem: AgronomicKnowledgeItem | null = null;

  for (const item of AGRONOMIC_KNOWLEDGE_BASE) {
    const keywords = isPt ? item.keywordsPt : item.keywordsEs;
    let itemScore = 0;

    for (const kw of keywords) {
      const normKw = normalizeAgronomicText(kw);
      if (query === normKw) {
        itemScore += 100; // Exact match
      } else if (matchesWholePhrase(query, normKw)) {
        itemScore += normKw.split(' ').length * 25; // Full phrase bounded match
      } else {
        const kwParts = normKw.split(' ').filter((w) => !STOP_WORDS.has(w));
        for (const word of contentWords) {
          if (kwParts.includes(word)) {
            itemScore += 7;
          }
        }
      }
    }

    // Domain intent boosts for high-specificity queries
    if (
      item.id === 'pimentao_colheita_ponto' &&
      (query.includes('colheita') || query.includes('colher') || query.includes('cosecha') || query.includes('cosechar')) &&
      (query.includes('locote') || query.includes('pimentao') || query.includes('pimenton'))
    ) {
      itemScore += 45;
    }

    if (
      item.id === 'tomate_poda_desbrota' &&
      (query.includes('desbrota') || query.includes('desbrote') || query.includes('ladrao') || query.includes('chupon'))
    ) {
      itemScore += 50;
    }

    if (
      item.id === 'pimentao_flor_rei_poda' &&
      (query.includes('flor rei') || query.includes('flor rey') || query.includes('primeira flor') || query.includes('primera flor'))
    ) {
      itemScore += 50;
    }

    if (
      item.id === 'tomate_podridao_apical' &&
      (query.includes('fundo preto') || query.includes('podridao apical') || query.includes('podredumbre apical') || query.includes('calcio'))
    ) {
      itemScore += 50;
    }

    if (itemScore > bestScore) {
      bestScore = itemScore;
      bestItem = item;
    }
  }

  // If a solid match is found
  if (bestItem && bestScore >= 12) {
    return {
      answerText: isPt ? bestItem.answerPt : bestItem.answerEs,
      speakText: isPt ? bestItem.speakPt : bestItem.speakEs,
      actionType: bestItem.actionType ?? 'none'
    };
  }

  // Contextual fallback that offers intelligent guidance instead of repeating greetings
  return getContextualFallback(lang, rawQuery);
}

function getContextualFallback(lang: Language, _originalQuery: string = ''): VoiceAssistantResponse {
  const isPt = lang === 'pt-BR';

  if (isPt) {
    return {
      answerText:
        'Não encontrei esse termo específico na minha base imediata, mas posso te orientar em detalhes sobre:\n\n' +
        '• 🍅 **Cultivo de Tomate**: pH 5.8-6.3, desbrota, poda e prevenção de fundo preto (cálcio)\n' +
        '• 🫑 **Cultivo de Pimentão Verde / Locote**: poda da flor rei, controle de temperatura e ponto de colheita\n' +
        '• 💧 **Hidroponia & Solução Nutritiva**: sistemas NFT, substrato de coco, condutividade EC e oxigênio\n' +
        '• 🌿 **Manejo de Estufas**: VPD (0.8-1.2 kPa), ventilação e controle de pragas\n\n' +
        'Se você tiver uma planta com manchas ou pragas, pode clicar no botão da câmera para eu diagnosticar pela foto!',
      speakText:
        'Companheiro, não localizei esses dados específicos, mas posso te orientar sobre cultivo de tomate, pimentão verde, hidroponia, adubação ou manejo de estufas. Sobre qual desses você gostaria de tirar dúvidas?',
      actionType: 'none'
    };
  } else {
    return {
      answerText:
        'No localicé ese término específico en la memoria inmediata, pero puedo asesorarte a fondo sobre:\n\n' +
        '• 🍅 **Cultivo de Tomate**: pH 5.8-6.3, desbrote, poda y podredumbre apical (calcio)\n' +
        '• 🫑 **Cultivo de Locote Verde**: poda de la flor rey, temperatura y punto de cosecha\n' +
        '• 💧 **Hidroponía y Solución Nutritiva**: NFT, sustrato de coco, conductividad CE y oxígeno\n' +
        '• 🌿 **Clima en Invernaderos**: VPD (0.8-1.2 kPa), ventilación y control sanitario\n\n' +
        '¡O si notas plagas o manchas en las hojas, presiona la cámara para hacer un diagnóstico con foto!',
      speakText:
        'Amigo productor, no encontré esos datos exactos, pero puedo asesorarte en manejo de tomate, locote verde, hidroponía o clima de invernaderos. ¿Sobre cuál tema prefieres consultar?',
      actionType: 'none'
    };
  }
}
