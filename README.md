# Kuruma Netejes V4

Landing page + painel Admin com editor visual, FAQ por servico, i18n e fluxo pronto para demo.

## 1) Rodar local

```bash
npm install
npm run dev
```

App:
- Site: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin`

## 2) Build de producao

```bash
npm run build
npm run start
```

Status atual: build validada com sucesso.

## 3) Login (demo)

1. Copie `.env.example` para `.env`
2. Defina:
   - `DEMO_AUTH=1`
   - `ADMIN_PASSWORD=uma_senha_forte`

Depois, acesse `/login` e entre no `/admin`.

## 4) Principais recursos para apresentar

### Site publico
- Hero com slides e CTA de WhatsApp
- Navegacao rapida por secoes (dock lateral no desktop)
- Barra de progresso de rolagem
- Acoes flutuantes (WhatsApp + voltar ao topo)
- Bloco "Infos + FAQ" por servico, com busca
- FAQ sempre antes do footer
- Seletor de idiomas com bandeiras (ajustado para tablet)
- Layout expandido para melhor uso de telas grandes

### Admin
- Dashboard com atalhos e indicadores rapidos
- Editor completo de:
  - Hero
  - Servicos
  - Infos + FAQ
  - Estimador/orcamento
  - Aparencia (cores, textura, cursor, status)
- Upload de imagem integrado
- Live preview dentro do painel
- Rascunho (guardar) + publicar

## 5) Roteiro rapido de demo (5-8 min)

1. Abrir home e mostrar:
   - dock lateral,
   - FAQ com busca,
   - botoes flutuantes,
   - responsividade no tablet.
2. Abrir admin e mostrar:
   - cards de produtividade,
   - atalhos rapidos,
   - edicao de um servico + FAQ,
   - mudanca visual em aparencia.
3. Guardar e publicar.
4. Voltar ao site e confirmar mudanca aplicada.

## 6) Supabase (opcional)

Se quiser persistencia externa, preencha no `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

E rode o SQL em `docs/supabase.sql`.

## 7) Bootstrap para novos repos

Arquivos incluidos:
- `templates/AGENTS.template.md`
- `templates/ci.template.yml`
- `scripts/bootstrap-codex.ps1`

Uso:

```powershell
.\scripts\bootstrap-codex.ps1 -RepoPath "C:\path\to\novo-repo"
```

Isso gera no repo destino:
- `AGENTS.md`
- `.github/workflows/ci.yml`

## 8) Auditoria automatica do site (CMD)

Ferramenta: `tools/sitepulse-qa`

Uso rapido:
```bash
cd tools/sitepulse-qa
npm install
npm run audit
npm run audit:mobile
npm run audit:cmd
```

Atalhos pela raiz:
```bash
npm run audit:run
npm run audit:run:mobile
npm run audit:cmd
npm run audit:cmd:mobile
```

Auditar URL custom via CMD:
```bash
cd tools/sitepulse-qa
run-audit-url.cmd https://meusite.com
```
Esse comando ja usa `--no-server` para nao subir app local.

Saidas:
- relatorio JSON
- relatorio Markdown
- log com codigo da issue + explicacao leiga + resolucao recomendada
- prompt master e prompts por issue para correcao automatizada
- deteccao visual de ordem de secoes (ex.: FAQ abaixo do footer)

## 9) Painel visual do auditor

Ferramenta: `tools/sitepulse-studio`

Uso:
```bash
cd tools/sitepulse-studio
npm install
npm run dev
```

Atalho pela raiz:
```bash
npm run audit:studio
```

Painel com:
- executar/parar auditoria
- progresso e logs em tempo real
- evento atual de clique/rota
- leitura de relatorios + download
- login por usuario com site/config padrao
- campo para URL override (auditar qualquer site)
- opcao `no-server` para auditoria externa

Credenciais demo do Studio:
- `admin / admin123`
- `mobile / mobile123`
