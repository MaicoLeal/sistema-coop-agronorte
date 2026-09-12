# Tela inicial animada

A abertura usa a imagem limpa das estufas, os arquivos originais dos logos e textos HTML. O vídeo anterior continua em `public/assets`, mas não é utilizado nesta tela.

## Onde editar

- `src/config/landingContent.ts`: títulos, descrições, botões, indicadores e contatos, com versões em espanhol e português. Os indicadores são conteúdo institucional configurável, não leituras de telemetria ao vivo.
- `src/components/AnimatedLandingPage.css`: cores, espaçamentos, tamanhos e efeitos de mouse/foco.
- `src/components/LandingScene.tsx`: movimento localizado da bandeira e do cultivo, cores da luz e duração do amanhecer.

Os logos utilizados são `logo-oficial-agronorte-tight.png` e `logo-oficial-agronorte-white-tight.png`; a paisagem é `agronorte-scenic-daylight.jpg`.

## Comportamento

O sol nasce na abertura e a luz se estabiliza. A bandeira e as plantas continuam com movimentos suaves. O botão de pausa congela o cenário e permite retomar. A animação é suspensa quando a aba fica oculta ou a paisagem sai da área visível. A preferência de movimento reduzido exibe a cena estática, e a imagem original funciona como alternativa em dispositivos sem WebGL.

Os indicadores e recursos recebem realce ao passar o mouse ou focar com o teclado. Os dois acessos continuam abrindo os modos Gestão e Produtor. Em celulares, as informações seguem abaixo do cenário e permanecem visíveis com rolagem.

## Verificação local

`node scripts/verify-landing-interactions.mjs` verifica movimento, pausa, realces, idiomas, acessos e larguras de 320 a 1366 px. Capturas ficam em `docs/landing-review`. O script utiliza Edge; outro Chromium pode ser indicado pela variável `CHROME_PATH`. Requer o servidor Vite na porta 3000.
