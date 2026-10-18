# Design Contract: HAILLA — site web
## Last Updated: 2026-10-18

## Identity
- **Brand Name:** HAILLA (« Hailla » — app de tourisme intelligent en Algérie)
- **Archetype:** L'Explorateur bienveillant (guide local qui connaît tout le monde)
- **Emotional Target:** confiance, curiosité, fierté locale
- **Visual Metaphor:** une traversée Nord → Sud : la Méditerranée (lagune → azur) qui devient Sahara (sable)
- **One Word:** Marhba (bienvenue)

## Audience
- **Primary User:** jeunes voyageurs algériens connectés, familles urbaines, diaspora et touristes étrangers
- **User Mindset:** « je veux réserver vite et ne pas me perdre une fois sur place »
- **Conversion Goal:** réserver un hébergement / poser une question au guide IA / télécharger l'app / devenir partenaire

## Design System
- **Preset:** sur-mesure (aucun preset Stitch — Stitch MCP non disponible)
- **Couleurs:** lagune #4ECDC4 · azur #2F6BF2 · abysse #0A1A3F (encre) · chaux #F4F7FB (fond) · soleil #FFD700 (CTA, texte abysse) · sable #E8C48A (Sud)
- **Display:** Unbounded 500/600, tracking serré — Latin uniquement
- **Body:** Readex Pro 300–600 (Latin + arabe, sert aussi les titres en mode AR)
- **Labels:** Reem Kufi 400–700 — coufique géométrique (Latin + arabe) pour étiquettes, coordonnées, prix
- **Radius:** arcs de la Casbah (999px 999px R R) pour les images; 16–24px pour les surfaces; pilules pour les contrôles
- **Spacing:** base 8px, échelle fluide clamp()

## Signature
- **Rail de latitude** : chaque page porte sa coordonnée (ex. 36.7538° N — Alger). Sur l'accueil, la section « La traversée » fait descendre de 36,9° N (Béjaïa) à 22,8° N (Tamanrasset) au scroll ; le fond passe de l'azur au sable. Nord = disponible (phase 1), Sud = bientôt (phase 2) — vraie information du business plan.
- **Images en arc** (portes de la Casbah) pour les cartes de destinations.

## Motion
- Lenis via Locomotive Scroll v5, GSAP ScrollTrigger (pin + scrub de la traversée, révélations sobres)
- Barba.js : rideau dégradé lagune → azur avec le « H » entre les pages
- Three.js : champ de points « Méditerranée » qui se transforme en monuments (Maqam Echahid, Mausolée royal de Maurétanie, pont Sidi M'Cid, arc de Trajan, dunes de Taghit), avec légende synchronisée
- Anime.js : bulles et indicateur de frappe du guide IA
- Lottie : coche de confirmation de réservation (chargé à la demande)

## Hard Constraints
- Contraste AA : texte abysse sur boutons soleil (jamais blanc sur jaune comme dans les maquettes)
- FR / EN / AR (RTL complet)
- Prix en DZD, contexte algérien
- Pas d'emoji comme icônes (SVG uniquement)
- Responsive 375 → 1440, focus visibles, prefers-reduced-motion respecté

## Changelog
- v2 (retour client) : Martian Mono remplacée par Reem Kufi (jugée générique) ; hero : vagues → morphing vers les monuments algériens ; Maqam Echahid remodélisé (palmes galbées, anneau, statues).
- v1 : contrat initial dérivé des maquettes de l'app, du business plan et de la mémoire projet.
