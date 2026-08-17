# 🍅 Pomodoro Timer

Timer de foco baseado na técnica Pomodoro, com ciclos configuráveis e histórico diário de sessões. Funciona como PWA (Progressive Web App) e pode ser instalado no celular ou desktop.

## Funcionalidades

- Três modos: **Foco**, **Pausa curta** e **Pausa longa**, cada um com sua própria cor de destaque
- Duração de cada modo e número de ciclos até a pausa longa são configuráveis
- Alterna automaticamente entre foco e pausas ao final de cada ciclo
- Som de notificação ao concluir uma sessão
- Histórico de sessões concluídas no dia, salvo localmente (`localStorage`)
- Instalável como app (PWA) com ícone e service worker para uso offline

## Como usar

Não há build nem dependências — é só HTML, CSS e JavaScript puros.

1. Clone o repositório:
   ```bash
   git clone https://github.com/Rubenssilvajr/pomodoro-timer.git
   cd pomodoro-timer
   ```
2. Abra o `index.html` no navegador, ou sirva a pasta com um servidor estático (necessário para o service worker funcionar corretamente), por exemplo:
   ```bash
   npx serve .
   ```

## Estrutura do projeto

| Arquivo | Descrição |
|---|---|
| `index.html` | Estrutura da página |
| `style.css` | Estilos e temas por modo |
| `script.js` | Lógica do timer, histórico e integração PWA |
| `sw.js` | Service worker (cache offline) |
| `manifest.json` | Manifesto do PWA (ícones, cores, nome) |
| `gen_icons.py` | Script auxiliar para gerar os ícones do app |
