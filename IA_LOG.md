# Diário de Bordo da IA e Análise Arquitetural (IA_LOG)

Este documento foi elaborado para detalhar o raciocínio por trás do desenvolvimento do **Kaizen Clicker**, a arquitetura do projeto e a interação iterativa entre o desenvolvedor (Jardel) e a IA assistente. 

## 1. Visão Geral do Projeto e Regras de Ouro
O objetivo foi desenvolver um jogo do gênero "Clicker/Idle" focado na metodologia **Lean Manufacturing**. Desde o início, o projeto seguiu diretrizes restritas:
- **Design de Alta Qualidade (WOW Effect):** Uso de Glassmorphism, paletas ricas (Dark Mode com neons), micro-animações dinâmicas e tipografia moderna. Nenhum design "genérico" foi aceito.
- **Engajamento Visual (Juice):** O jogo responde a cada interação. Partículas flutuantes ao clicar, botões arrastáveis (Framer Motion), letreiros interativos e um termômetro que reage ao "esforço" do jogador.
- **Stack Moderna e Sólida:** React 19, Zustand (para gestão de estado), TailwindCSS 4 (estilização rápida), Vite 8, Recharts e Vitest.

## 2. Estratégia de "Commits Atômicos"
Para garantir rastreabilidade e facilidade de revisão, adotamos a estratégia de Commits Atômicos. Cada implementação, por menor que fosse, foi isolada em seu próprio commit com escopo definido (seguindo o padrão *Conventional Commits*):
- `feat(ui):` Para novas interfaces (ex: painel de diagnóstico, letreiro de ranking).
- `style(layout):` Para ajustes de espaçamento e correções visuais finas (ex: margin-top das telas).
- `fix(ci):` Para correções na linha de montagem do GitHub Actions.
- Isso mostra um rigor técnico na construção do software, permitindo reversões (rollbacks) seguras.

## 3. Entendendo a Lógica do Código (Arquitetura Central)
O projeto é dividido em camadas de responsabilidade bem definidas:

### A. O Motor do Jogo (`src/engine/core.ts`)
O coração do jogo não depende do React. Ele é puramente matemático.
- **`processTick`**: Função pura que recebe o estado atual, o tempo passado (delta) e calcula quantas peças foram produzidas, quantos defeitos ocorreram e qual o OEE atual.
- **Design Pattern**: Usamos conceitos funcionais para que a lógica de negócio possa ser 100% testada (Vitest) isoladamente do visual.

### B. O Loop Principal (`src/hooks/useGameLoop.ts`)
Para evitar que o React travasse com `setInterval`, usamos `requestAnimationFrame`.
- A cada quadro (frame) da tela, o hook captura o tempo, passa para o `processTick` e despacha os novos pontos para o estado global. Isso garante 60FPS constantes e uma sensação de fluidez absoluta.

### C. Gestão de Estado Global (`src/store/gameStore.ts`)
Usamos o **Zustand** no lugar de Context API ou Redux.
- Ele permite que componentes como o `RankingTicker` e o `Dashboard` acesssem a pontuação em tempo real sem causar re-renderização em toda a árvore de componentes (o que destruiria a performance do jogo).
- **Persistência**: O Zustand salva o progresso do jogador automaticamente no `localStorage`. Você pode fechar a aba e voltar depois.

### D. Componentes Visuais Independentes
- **`Dashboard.tsx`**: Renderiza 4 gráficos usando a biblioteca Recharts, e um Termômetro customizado que reage ao clique manual do usuário escutando um evento global (`window.addEventListener('manual-click')`).
- **`FactoryDisplay.tsx`**: Gerencia a Física do botão principal usando `framer-motion` (propriedades de `drag`).

## 4. O Sistema de Ranking e Auto-Save
O requisito exigia que o jogo não salvasse a pontuação incessantemente, mas sim a cada ciclo de 5 minutos, garantindo otimização de rede (pensando em uma futura API).
1. O jogador insere seu nome clicando no letreiro.
2. Em background, um `setInterval` de 5 minutos captura o estado global silenciosamente e atualiza o Recorde.
3. Para dar o efeito *Juice*, disparamos um "Flash de Câmera" branco na tela com a mensagem "Auto-Save", mostrando ao jogador o valor exato salvo naquele instante, recompensando a paciência de jogar por longos períodos.

## Conclusão da Interação IA + Desenvolvedor
A interação funcionou no formato "Pair Programming" (Programação em Par). Enquanto as lógicas matemáticas e regras de arquitetura eram sugeridas e implementadas em pequenos blocos isolados, a crítica estética, percepção de bugs visuais e direção do produto (como afastar o gráfico ou alterar o tempo de 1 para 5 min) foram calibradas iterativamente. O resultado é um produto sofisticado, otimizado, de altíssimo nível profissional e visualmente espetacular.
