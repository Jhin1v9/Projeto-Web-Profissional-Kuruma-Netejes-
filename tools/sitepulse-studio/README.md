# SitePulse Studio

Interface web para operar o `sitepulse-qa` com:
- iniciar/parar auditoria
- progresso + logs em tempo real
- evento atual (rota/acao) durante os cliques
- lista de relatorios
- abrir relatorio JSON/MD/LOG
- download de relatorio
- login por usuario com perfil padrao
- campo de URL override para auditar qualquer site
- checkbox `no-server` para auditar URL externa sem subir server local

## Rodar local

```bash
cd tools/sitepulse-studio
npm install
npm run dev
```

Abrir:
- `http://127.0.0.1:4577`

## Credenciais demo

- `admin / admin123` (perfil desktop)
- `mobile / mobile123` (perfil mobile)

Arquivo de usuarios:
- `tools/sitepulse-studio/data/users.json`

## Como funciona

- O Studio executa o CLI `tools/sitepulse-qa/src/index.mjs`.
- O botao `headed` abre o navegador real do Playwright para visualizar cliques.
- O progresso e lido do checkpoint do proprio auditor.
- A URL auditada pode vir do perfil do usuario ou do campo override na UI.

## Observacao sobre Vercel

Execucao Playwright + processo longo costuma ser limitada em ambiente serverless.

Pratica recomendada:
- usar o Studio local para executar auditoria;
- publicar os relatorios para consulta online.
