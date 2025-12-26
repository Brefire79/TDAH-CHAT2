# Rotina Calma — PWA

PWA leve para crianças (10–12) com TDAH leve, focado em rotina, foco e autonomia. Interface calma, textos curtos, poucos estímulos e feedback positivo. Offline-first com service worker.

## Funcionalidades
- Perfil: nome, idade, avatar, som/contraste/fonte grande.
- Rotina visual: manhã/tarde/noite, tarefas com ícone, tempo, começar/concluir.
- Modo foco: timer curto (10/15/20 min) com feedback calmo.
- Recompensas: estrelas, streak diária e medalhas simples.
- Regulação emocional: emojis grandes e uma dica por vez.
- Painel dos pais: PIN, toggles de recompensas/foco, mensagem do dia.
- Acessibilidade: foco visível, fonte configurável, contraste opcional, navegação por teclado.
- Onboarding de 3 passos no primeiro uso (salva flag em localStorage).

## Rodando localmente
1. `git clone https://github.com/Brefire79/TDAH-CHAT2.git`
2. `cd TDAH-CHAT2`
3. Servir estaticamente (necessário para ES Modules):
   - `npx serve .` **ou**
   - `python -m http.server 8000`
4. Abrir http://localhost:8000
5. Instalar como PWA (Add to Home Screen) e testar offline.

## Estrutura
- index.html — layout, onboarding, binds de aria.
- style.css — tema azul/branco/amarelo, foco visível, fonte grande.
- src/
  - app.js — orquestra módulos, onboarding, preferências, painel pais.
  - storage.js — persistência local e flags.
  - routine.js — rotina visual (máx 3 ações: nova, começar, concluir).
  - focus.js — timer curto com feedback calmo.
  - rewards.js — estrelas, streak, medalhas leves.
  - emotions.js — check-in emocional com dica única.
- manifest.json — metadados PWA.
- service-worker.js — cache versionado (cache-first assets, network-first dados).
- icons/ — ícones SVG 192/512.

## Princípios
- Menos é mais: uma ação principal por seção, textos curtos.
- Inclusivo: contraste opcional, fonte ajustável, foco claro, sem anúncios.
- Sem dados sensíveis: armazenamento local apenas.
- Progresso pessoal: recompensas leves, sem competitividade.
