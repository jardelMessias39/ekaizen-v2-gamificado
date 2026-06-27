# eKaizen: Desafio Corporativo 🏭

Bem-vindo ao **eKaizen**, um simulador web interativo construído para testar habilidades corporativas reais como Atenção Plena, Tomada de Decisão e Reflexo sob Pressão, envelopado em uma temática industrial de Manufatura Enxuta (Kaizen).

## 🎮 Sobre o Projeto
O projeto mescla a progressão passiva de um *Idle Game* (onde a fábrica nunca para) com a tensão ativa de um *Minigame de Separação de Peças*. O objetivo do jogador é gerenciar o OEE (Overall Equipment Effectiveness) da fábrica, mantendo os defeitos próximos de zero, e realizar investimentos estratégicos em metodologias Lean (5S, Poka-Yoke, Kanban) com os pontos gerados.

## 🚀 Tecnologias Utilizadas
- **React 18** (Vite)
- **TypeScript** (Tipagem forte para segurança)
- **Tailwind CSS** (Estilização baseada em utilitários e UI Glassmorphism)
- **Zustand** (Gerenciamento de Estado global leve e persistente)
- **Framer Motion** (Física avançada, Drag-and-Drop e Animações de Layout)
- **Lucide React** (Ícones SVG)

## ⚙️ Como Executar Localmente

### Pré-requisitos
- Node.js (v18 ou superior recomendado)
- NPM ou Yarn

### Instalação
1. Clone o repositório ou baixe os arquivos.
2. Abra o terminal na pasta raiz do projeto.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o navegador no endereço indicado (geralmente `http://localhost:5173`).

## 🧠 Metodologia Lean no Código
O projeto aplica conceitos da indústria no próprio código:
- **Kaizen (Melhoria Contínua)**: Desenvolvido de forma iterativa, começando com um MVP simples e escalando para física complexa.
- **Andon**: Regras de interdição (Game Over) quando os erros atingem um limite crítico.
- **Isolamento de Componentes**: A arquitetura do React foi otimizada com `React.memo` e abstração de estado (Ex: `ScoreOverlay`) para garantir 60FPS constantes mesmo com alto volume de re-renderizações lógicas.

## 👥 Autoria e Desenvolvimento
Desenvolvido por **Jardel Messias**.
(Documentação técnica detalhada das sessões de Pair Programming e QA pode ser encontrada no `IA_LOG.md`).
