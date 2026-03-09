# SitePulse QA (Kuruma)

Auditor via CMD/Playwright para validar o site real com relatorio tecnico e explicacao para leigos.

## O que verifica
- botoes sem efeito
- erros de rota (404)
- erros de request/fetch (4xx/5xx)
- request failed
- runtime JS error
- console error

Cada issue sai com:
- `code`
- explicacao tecnica
- explicacao leiga
- resolucao recomendada

## Uso rapido
1. Entre em `tools/sitepulse-qa`
2. Rode `npm install`
3. Rode uma das opcoes:
   - `npm run audit` (desktop, headless)
   - `npm run audit:mobile` (mobile, headless)
   - `npm run audit:headed` (desktop com navegador aberto)
   - `npm run audit:auto` (retoma checkpoints ate concluir)

Ou use:
- `run-audit.cmd`
- `run-audit-auto.cmd`

## Configs
- `audit.kuruma.json` (desktop)
- `audit.kuruma.mobile.json` (mobile)

## Saida
Arquivos na pasta `reports/`:
- `*-sitepulse-report-final.json`
- `*-sitepulse-report-final.md`
- `*-sitepulse-issues-final.log`

Quando pausa por tempo, gera `partial` e checkpoint para retomada.
