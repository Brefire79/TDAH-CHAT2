# Rotina Calma — PWA MVP

Aplicativo PWA simples para crianças (10–12) com TDAH leve, focado em rotina, foco e autonomia. Interface calma, textos curtos, poucos estímulos e feedback suave. Offline-first com service worker.

## Funcionalidades
- Perfil: nome, idade, avatar, preferências de som/contraste.
- Rotina visual: manhã/tarde/noite, tarefas com ícone, tempo, começar/concluir.
- Modo foco: timer curto (10/15/20 min), animação calma, mensagem positiva.
- Recompensas: estrelas, streak diária e medalhas simples.
- Regulação emocional: check-in rápido com emojis e dicas curtas.
- Painel dos pais: PIN, ajustes de recompensas/foco, mensagem do dia.
- Acessibilidade: fonte grande, contraste opcional, suporte a leitores de tela, animações suaves.

## Rodando localmente
1. Clonar: `git clone https://github.com/Brefire79/TDAH-CHAT2.git`
2. Entrar na pasta: `cd TDAH-CHAT2`
3. Servir estaticamente (exemplos):
   - `npx serve .` **ou**
   - `python -m http.server 8000`
4. Abrir no navegador: http://localhost:8000
5. Instalar como PWA (Add to Home Screen) e testar offline.

## Estrutura
- index.html — layout principal e seções.
- style.css — tema azul/branco/amarelo, mobile-first, contraste opcional.
- app.js — estado local, rotina, foco, recompensas, humor, painel pais, storage.
- manifest.json — metadados PWA.
- service-worker.js — cache estático para modo offline.
- icons/ — ícones SVG 192/512.

## Próximos upgrades sugeridos
- Onboarding animado em 3 passos (leve, skippable).
- Flag escolar com rotinas pré-carregadas e travas infantis.
- Relatórios em PDF para responsáveis.
- Voz suave (TTS) opcional para feedback.
- Versão institucional (multi-perfis/turmas, políticas de privacidade claras).

## Princípios
- Menos é mais: poucos botões por tela, textos curtos.
- Inclusivo: alto contraste opcional, foco visível, sem publicidade.
- Sem dados sensíveis: armazenamento local apenas.
- Sem competitividade: progresso pessoal, medalhas leves.
