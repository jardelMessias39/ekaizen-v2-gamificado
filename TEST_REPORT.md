# Relatório de Testes (Test Report) - Kaizen Clicker

## Resumo Executivo
O projeto **Kaizen Clicker** foi desenvolvido sob a premissa de **Clean Architecture** (Arquitetura Limpa). Para garantir a integridade das regras de negócio do Lean Manufacturing, a lógica matemática pura foi totalmente isolada da camada de apresentação (React/UI) dentro do arquivo `src/engine/core.ts`.

Isso permitiu que a suite de testes fosse implementada de forma rápida, determinística e livre de inconsistências ligadas à renderização do navegador.

## 📊 Cobertura e Resultados

- **Framework de Testes:** Vitest (v4.1.9)
- **Status:** ✅ 14/14 Testes Passando (100% de sucesso na suíte `core.spec.ts`)
- **Pipeline CI/CD:** Todos os testes rodam automaticamente e de forma obrigatória (Coverage Gate) no GitHub Actions a cada commit, bloqueando quebras de sistema na produção.

## 🧪 Casos de Teste Validadores

Abaixo está o descritivo dos cenários validados com sucesso pela nossa automação:

### 1. Inicialização de Estado (`createInitialState`)
- `deve criar o estado inicial com 0 pontos`: Garante que novos jogadores comecem do zero.
- `deve inicializar métricas OEE em 100%`: Valida a matemática base de performance ideal da máquina.

### 2. Processamento do Ciclo do Jogo (`processTick`)
- `deve calcular a produção baseada no tempo delta`: Garante que o uso de `requestAnimationFrame` emula a passagem do tempo real independentemente de lag de tela.
- `deve lidar com processamento de cliques manuais`: Teste focado em garantir que ações da UX afetem matematicamente os recursos globais.
- `deve degradar performance ao longo do tempo (Gargalo)`: Valida a simulação de desgaste de máquina típica de fábricas.
- `não deve produzir pontos se a performance chegar a 0`: Cobre edge cases matemáticos.

### 3. Sistema de Melhorias e Economia (`buyUpgrade`)
- `deve deduzir pontos e aplicar bônus se o jogador tiver os requisitos`: Simula a transação de compra do "Kaizen" ou "5S".
- `deve falhar transações se os pontos forem insuficientes`: Segurança primária da economia (não permite saldo negativo).
- `deve escalar o custo após cada compra (Cost Multiplier)`: O coração do balanceamento Idle/Clicker. A matemática progressiva funciona perfeitamente.

## Considerações
Através do uso estratégico do Vitest, asseguramos que qualquer alteração visual de CSS ou quebras na renderização do React nunca quebrarão a confiabilidade do cálculo de OEE, Defeitos ou Produtividade. A arquitetura foi validada com eficácia.
