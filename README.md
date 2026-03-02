# Kuruma Netejes V4 (Admin + Editor)

## Rodar
```bash
npm install
npm run dev
```

## Login (modo demo)
1) Copia `.env.example` → `.env`
2) Define:
- `DEMO_AUTH=1`
- `ADMIN_PASSWORD=uma_senha_forte`

Depois:
- `/login` → entrar
- `/admin` → painel

## Supabase (opcional, para persistir config)
Preenche no `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Roda o SQL em `docs/supabase.sql`.

## Imagens (já no projeto)
`public/images/`
- hero.webp
- texture.webp
- service-before-after.webp
- service-polishing.webp
- service-foam.webp
