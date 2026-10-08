# Hamdouni's Chicken — online ordering

Customer ordering app (sur place / à emporter / livraison), loyalty points, feedback,
and a staff admin (orders board, menu, stock, analytics). Based on the Sindibad
Feedback-Client app, rebranded for Hamdouni's Chicken.

## Run locally

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

`.env` (see `.env.example`) needs `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
Admin lives at `/admin`.

## Branding

- Colours & fonts: `src/app/globals.css` (`--hc-*` tokens) and `src/app/layout.tsx`
- Logo: `public/brand/logo.png` (also `src/app/icon.png` for the favicon)
- WhatsApp / Instagram links: `src/lib/brand.ts`
- Menu: `prisma/seed.ts` — **prices are placeholders**; edit them in `/admin/menu`
- Dish photos: `public/menu/items/` (cropped from the printed menu — replace with real photos)

Deployment: see `DEPLOY.md`.
