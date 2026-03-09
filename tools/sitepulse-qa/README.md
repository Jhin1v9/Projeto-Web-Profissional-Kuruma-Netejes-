# SitePulse QA (Kuruma)

Auditor via CMD/Playwright para validar o site real com relatorio tecnico e explicacao para leigos.

## O que verifica
- botoes sem efeito
- erros de rota (404)
- erros de request/fetch (4xx/5xx)
- request failed
- runtime JS error
- console error
- regras visuais de ordem de secoes (ex.: FAQ antes do footer)
- secao obrigatoria ausente/invisivel

Cada issue sai com:
- `code`
- explicacao tecnica
- explicacao leiga
- resolucao recomendada
- prompt de correcao por issue (`recommendedPrompt`)

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

Campos importantes:
- `sectionOrderRules`: regras de ordem visual por seletor
- `sectionOrderWaitMs`: espera antes de validar ordem visual
- `ignoredRequestFailedErrors`: ruido de rede para ignorar

Exemplo de `sectionOrderRules`:
```json
[
  {
    "id": "faq-before-footer",
    "routes": ["/"],
    "beforeSelector": "#service-details",
    "afterSelector": "#footer",
    "required": true
  }
]
```

## Saida
Arquivos na pasta `reports/`:
- `*-sitepulse-report-final.json`
- `*-sitepulse-report-final.md`
- `*-sitepulse-issues-final.log`

Quando pausa por tempo, gera `partial` e checkpoint para retomada.

No JSON final:
- `promptPack.masterPrompt`: prompt inteligente consolidado para corrigir tudo.
- `promptPack.issuePrompts`: prompt individual por issue.
