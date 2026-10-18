# HAILLA — site web

Le site reprend les fonctionnalités de l'application HAILLA : réservation d'hébergements, guide IA 24 h/24,
carte interactive, espace découverte du patrimoine, favoris, avis, communauté, compte et préférences,
espace prestataires et tableau de bord institutions. Trilingue FR / EN / ع (RTL complet).

## Lancer en local

```bash
cd site
npm install
npm run dev          # http://localhost:5173
```

## Hébergement (GitHub Pages)

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui construit le site et le publie sur GitHub Pages.
Les chemins sont relatifs (`base: './'`), donc le site fonctionne à l'adresse `https://<utilisateur>.github.io/<dépôt>/`.
GitHub Pages ne sert que des fichiers statiques : le guide IA y fonctionne en mode local (sans Claude).

## Activer le guide IA avec Claude (facultatif)

Sans clé, le guide répond avec son moteur local (hors ligne). Pour brancher Claude :

```bash
npm run build
ANTHROPIC_API_KEY=sk-ant-... npm run serve   # http://localhost:8787 — sert dist/ + /api/chat
```

En développement, lancez `npm run serve` dans un second terminal : Vite relaie `/api` vers le port 8787.

## Pages

| Page | Fichier | Fonctionnalité de l'app |
|---|---|---|
| Accueil | `index.html` | Recherche, « La traversée » Nord → Sud, recommandations |
| Hébergements | `explorer.html` | Filtres budget / type / note / langues / Éco, tri, vue carte |
| Fiche lieu | `lieu.html?id=…` | Aperçu, photos, avis, communauté, réservation |
| Carte | `carte.html` | Catégories Café / Hôtel / Musée / Souvenirs…, géolocalisation |
| Patrimoine | `patrimoine.html` | 7 sites UNESCO, récits audio, visite immersive |
| Guide IA | `guide.html` | Chat, planificateur d'itinéraire, dictée vocale |
| Mes voyages | `voyages.html` | Réservations, annulation, export calendrier, favoris |
| Compte | `compte.html` | Connexion / inscription, préférences |
| Prestataires | `pro.html` | Formules (gratuit, commission 10 %, Pro), inscription, tableau de bord |
| À propos | `a-propos.html` | Mission, équipe, crédits photos |

## Notes

- Prototype : comptes, réservations, avis et favoris sont stockés dans le navigateur (localStorage).
- Les hébergements, cafés et boutiques sont fictifs ; les sites et monuments sont réels.
- Photos : Wikimedia Commons (licences libres) — crédits dans `a-propos.html#credits`.
- Fonds de carte : OpenStreetMap. Pour un trafic de production, passer à un fournisseur de tuiles hébergé.
- Stack : Vite, GSAP + ScrollTrigger, Locomotive Scroll v5 (Lenis), Barba.js, Three.js, Anime.js, Lottie, Leaflet.
- Design : contrat dans `.design-forge/contract/current.md`.
