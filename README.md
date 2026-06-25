<div align="center">

# ▲ Ascend — Système d'habitudes & de récompenses gamifié

**🇫🇷 Français** · [🇬🇧 English](README.en.md)

Transformez la discipline en récompenses. **Ascend** est une application de productivité premium, en mode sombre, où vous **gagnez des points** en accomplissant vos habitudes, en **perdez** quand vous les négligez, **montez en niveau**, et dépensez votre solde dans une **boutique de récompenses** personnelle.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Licence](https://img.shields.io/badge/Licence-MIT-22c55e)

</div>

> Conçu **entièrement à la main** avec un système de design sur mesure — glassmorphism, dégradés, graphiques SVG faits maison et animations fluides. Aucun framework de composants, aucune librairie de graphiques.

## 🔗 Démo en ligne

👉 **[Ouvrir la démo en ligne](https://hamoux.github.io/ascend/)**

> _Le lien sera actif une fois GitHub Pages activé (voir [Déploiement](#-déploiement-sur-github-pages)). Astuce : ajoutez ici une capture d'écran ou un GIF du tableau de bord et du changement de langue 🇫🇷 ⇄ 🇬🇧._

---

## ✨ Fonctionnalités

- **Tableau de bord motivant** — solde de points animé, progression de niveau & XP, anneau de complétion, séries, graphique de dynamique, actions rapides du jour, fil d'activité récente et messages de motivation contextuels.
- **Système d'habitudes** — nom, description, catégorie, emoji, fréquence (quotidienne / hebdomadaire / mensuelle / annuelle), points positifs & négatifs, notes. Tâches **récurrentes** ou **uniques**. Terminer / ignorer, modifier, supprimer et historique complet par habitude.
- **Points & niveaux** — chaque réussite rapporte des points et de l'XP à vie ; les abandons en retirent. Le solde se met à jour instantanément (animation de comptage). L'XP totale fait progresser un niveau + titre (Initié → Légende).
- **Boutique de récompenses** — créez des récompenses avec coût, catégorie, description et image optionnelle. Les récompenses abordables débloquent un bouton d'échange (avec confettis 🎉) ; les autres affichent la progression en temps réel. Historique des échanges complet.
- **Sanctions** — définissez des conséquences réelles déclenchées quand votre solde passe sous un seuil ou que les abandons s'accumulent sur 7 jours. Les sanctions actives apparaissent sur le tableau de bord et dans les notifications.
- **Statistiques** — taux de réussite, série actuelle & record, points gagnés vs perdus, graphique hebdomadaire, habitudes les plus réussies / abandonnées et détail du taux de réussite par habitude. Filtre de période (30 j / 90 j / 1 an).
- **Calendrier & carte de chaleur** — grille mensuelle avec score net quotidien et compteurs de réussites/abandons, panneau de détail par jour, et carte de régularité façon GitHub.
- **Bilingue — Français / English** — changez toute la langue de l'interface depuis les Réglages. Le changement est **instantané** (sans rechargement), **persiste** entre les sessions, et localise aussi les dates, noms de jours/mois et durées relatives.
- **UX soignée** — notifications, boîtes de confirmation, états vides, écran de chargement, transitions de page, recherche / filtres / tri, mise en page responsive bureau + mobile, et fenêtres modales accessibles au clavier (Échap pour fermer).
- **Persistance locale** — tout est enregistré dans le `localStorage`. Exportez / importez une sauvegarde JSON, chargez les données de démo, ou réinitialisez depuis les Réglages. Pas de compte, pas de serveur — vos données ne quittent jamais le navigateur.

## 🛠 Stack technique

| Aspect | Choix |
| --- | --- |
| Framework | **React 18** + **TypeScript** (strict) |
| Build | **Vite 5** |
| État | **Zustand** avec middleware `persist` |
| Animations | **Framer Motion** |
| Icônes | **lucide-react** |
| Graphiques | **SVG faits main** (aucune dépendance de graphiques) |
| Style | **CSS Modules** + un système de tokens de design (sans framework utilitaire) |
| i18n | **Sur mesure** — dictionnaires typés EN/FR, aucune dépendance |

## 🚀 Démarrage

```bash
# installer les dépendances
npm install

# lancer le serveur de développement (http://localhost:5173)
npm run dev

# vérification des types + build de production
npm run build

# prévisualiser le build de production
npm run preview
```

> Au premier lancement, ~7 semaines de données de démo sont générées pour remplir graphiques, séries et carte de chaleur. Effacez-les à tout moment depuis **Réglages → Données → Effacer toutes les données**.

## 🚢 Déploiement sur GitHub Pages

Le dépôt inclut un workflow GitHub Actions (`.github/workflows/deploy.yml`) qui **construit et publie automatiquement** le site à chaque `push` sur `main`.

1. Poussez le projet sur GitHub (voir ci-dessous).
2. Sur GitHub : **Settings → Pages → Build and deployment → Source : `GitHub Actions`**.
3. Le workflow se lance tout seul. Une fois terminé (onglet **Actions**), votre site est en ligne à :
   **https://hamoux.github.io/ascend/**

> La configuration Vite utilise `base: './'`, donc l'application fonctionne quel que soit le sous-chemin du dépôt — aucune modification nécessaire.

## 🧱 Architecture

```
src/
├─ main.tsx               # point d'entrée ; monte <App>, importe les styles globaux
├─ App.tsx                # providers, fond aurora, écran de chargement, toasts
│
├─ styles/
│  ├─ tokens.css          # tokens de design (couleurs, typo, espace, motion, élévation)
│  └─ global.css          # reset, typographie de base, fond aurora animé
│
├─ types/                 # modèle métier (Habit, Reward, LogEntry, Punishment…)
│
├─ lib/                   # helpers purs — date, format, niveaux, image, id, cx, constantes
│
├─ i18n/                  # dictionnaires en/fr + hook useT() (traduction + dates localisées)
│
├─ store/
│  ├─ useStore.ts         # store Zustand : état + actions + persistance localStorage
│  ├─ selectors.ts        # analyses dérivées pures (solde, séries, agrégats)
│  ├─ derived.ts          # hooks pratiques (useBalance, useLevel)
│  └─ seed.ts             # générateur de données de démo au premier lancement
│
├─ hooks/                 # useCountUp, useMediaQuery, useElementSize
│
├─ components/
│  ├─ ui/                 # primitives du design system (Button, Card, Modal, Toast…)
│  ├─ charts/             # AreaChart, BarChart, Heatmap (SVG réutilisables)
│  ├─ common/             # SectionHeader, StatCard, Confetti
│  └─ layout/             # AppShell, Sidebar, Topbar, MobileNav, UIProvider, Splash
│
└─ features/              # un dossier par écran
   ├─ dashboard/
   ├─ habits/
   ├─ rewards/
   ├─ analytics/
   ├─ calendar/
   ├─ punishments/
   └─ settings/
```

### Principes de conception

- **Une seule source de vérité pour le style.** Les composants référencent les variables CSS de `tokens.css` ; aucune couleur ni valeur magique codée en dur.
- **Logique pure et testable.** Toutes les analyses vivent dans `selectors.ts` comme fonctions pures sur les collections brutes ; les composants les mémoïsent.
- **État dérivé, jamais dupliqué.** Le solde de points et le niveau sont calculés à partir des journaux et des échanges plutôt que stockés — ils ne peuvent donc jamais diverger.
- **Primitives réutilisables.** Chaque écran est composé du même kit `ui/` et des mêmes `charts/` — aucun style en ligne, aucun widget copié-collé.
- **i18n typée.** `fr.ts` doit fournir chaque clé de `en.ts`, sinon le build TypeScript échoue : impossible d'oublier une traduction.

## ⌨️ Notes

- Chaque entrée de journal capture le nom et l'icône de l'habitude, pour que l'historique et les statistiques survivent aux modifications et suppressions.
- Les séries utilisent un index de période sensible à la fréquence : les habitudes hebdomadaires/mensuelles comptent correctement, pas seulement les quotidiennes.
- Les images de récompense sont redimensionnées sur l'appareil (canvas) avant stockage, pour garder le `localStorage` léger.

---

<div align="center">

Conçu pour l'élan. ▲

</div>
