# Relatório Técnico e Evolução do Projeto (IA_LOG)

**Autor:** Jardel Messias  
**Projeto:** eKaizen - Desafio Corporativo Gamificado  

## 1. O Desafio e o Propósito
Foi-me proposto um desafio pela empresa eKaizen focado na aplicação prática da metodologia Kaizen. Este documento serve como registro da arquitetura e desenvolvimento de um jogo gamificado, cujo intuito é simular a linha de produção de uma fábrica, equilibrando a eficiência autônoma das máquinas com a execução manual dos funcionários.

Através de sessões de *Pair Programming* com a IA (que atuou no desenvolvimento braçal e geração da base do código), consegui focar na implementação das regras de negócio do Kaizen e Kanban, transformando a teoria em uma simulação interativa real.

O intuito principal do jogo é simular e testar a **maestria do jogador na tomada de decisão, foco, melhoria contínua de processos e raciocínio rápido**. 

## 2. A Mecânica Principal (A Sacada)
Colocamos quatro tubos de coleta com cores diferentes no topo da tela e, na base, um motor de produção que libera quatro tipos de peças. 

A "sacada" do jogo é testar o jogador (que atua como o operário): ele precisa separar a produção em tempo real, arrastando as peças para os seus tubos correspondentes. Para escalar a dificuldade e testar o foco na execução, a ordem dos tubos é embaralhada aleatoriamente a cada 2 minutos.

**A Regra do Andon (Game Over):** Se o jogador colocar a peça errada no tubo correspondente, é acionado um termômetro de erro. Caso o jogador erre 10 peças, o termômetro estoura, declarando *Game Over* e a fábrica é interditada, respeitando os princípios de qualidade da metodologia.

## 3. Evolução do Projeto: Do Básico ao Estado da Arte
A medida que o jogo ia evoluindo, notamos melhorias significativas. Começamos com um projeto de *Idle Game* simples, onde o jogador apenas assistia a produção subir e clicava para comprar melhorias. 

Percebendo a necessidade de gerar mais engajamento, evoluímos a arquitetura para um **jogo ativo**, inserindo o minigame de separação física (Drag and Drop), mas mantendo a "prospecção de background" (a fábrica continua produzindo passivamente ao fundo).

## 4. Histórico de Testes (QA) e Resolução de Bugs
Foram detectados alguns bugs durante os nossos testes práticos que nos fizeram refinar a estratégia técnica de código, sem comprometer as regras da metodologia.

### 🐛 Desalinhamento no Mobile (Problema de Responsividade)
- **O que foi percebido:** Na tela mobile, os gráficos e o posicionamento dos componentes estavam desalinhados, quebrando o design e engolindo o botão de Produzir.
- **Como contornamos (Técnica):** Refatoramos a estrutura `flexbox` do React (nos arquivos `App.tsx` e `SortingMinigame.tsx`). Removemos alturas fixas e aplicamos classes dinâmicas do Tailwind (`h-full`, `flex-col lg:flex-row`), fazendo os painéis de melhorias se adaptarem corretamente em telas menores.

### 🐛 Sobreposição de Peças (Bug de Spawn)
- **O que foi percebido:** Ao clicar várias vezes seguidas no botão de acelerar a produção, as peças nasciam grudadas umas sobre as outras no exato centro da tela.
- **Como contornamos (Técnica):** Implementamos um cálculo de *Scatter* (Espalhamento). No código, passamos a gerar uma coordenada `startX` aleatória para cada nova caixa, criando um efeito visual realista das peças saindo espalhadas pela esteira.

### 🐛 "Pane" no Mouse (Bug de Performance no React)
- **O que foi percebido:** Foi detectada uma instabilidade no mouse, provocando um tipo de "mau contato" e travamento físico na hora de pegar as peças, principalmente quando a barra de erros já estava perto de estourar.
- **Como contornamos (Técnica):** Identifiquei que o problema era de performance de renderização do React. O componente principal estava escutando variáveis globais (Zustand) que mudavam toda hora. Quando o jogador errava, o termômetro atualizava e o React recarregava a tela toda, travando o sistema de física (`framer-motion`). 
Para resolver, apliquei técnicas de **Isolamento de Estado** (separando o placar e o termômetro em sub-componentes independentes) e **Memoização**, envelopando as peças arrastáveis com `React.memo`. Isso blindou a performance e deixou o arraste perfeitamente fluido.

## 5. Conclusão
A construção deste projeto não só aplicou os conceitos industriais de forma visual e interativa, como também serviu de campo de prova para arquitetura de software limpa, manipulação de estado otimizada e design responsivo no ecossistema moderno de frontend.
