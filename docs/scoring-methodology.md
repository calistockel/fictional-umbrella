# Méthodologie de l'Opportunity Score

Ce document décrit comment le score d'opportunité (0-100) et ses trois
sous-scores — **Développement**, **Urbanisme**, **Contraintes** — sont
calculés. Le code de référence est `src/lib/opportunityScoring.ts` : ce
document doit rester synchronisé avec ce fichier ; en cas de divergence,
le code fait foi.

## Statut : méthodologie réelle, données simulées

**Important.** Les formules ci-dessous sont réelles et tournent en
production dans le prototype. Les **données qui les alimentent** sont
aujourd'hui fictives (voir `src/data/`) — parcelles, permis comparables et
statistiques communales inventées mais structurées comme le seraient de
vraies données. Aucune parcelle, aucun permis, aucune statistique
communale de ce document ne correspond à la réalité du terrain belge.

Le but de cette architecture est précisément de pouvoir remplacer les
entrées mockées par de vraies données (cadastre, Omgevingsloket, NOVA,
zonage, contraintes environnementales — voir la note de stack de données
en fin de document) **sans toucher au moteur de scoring** : celui-ci ne
connaît que la forme des entrées (`ScoringInputs`), pas leur origine.

## Principe général

```
Opportunity Score = 0,35 × Développement + 0,40 × Urbanisme + 0,25 × Contraintes
```

Les trois sous-scores sont sur 0-100, où **plus haut est toujours
meilleur** (y compris Contraintes : 100 = aucune contrainte identifiée).

Pondération et justification :

- **Urbanisme (40 %)** — le poids le plus élevé, parce que le risque
  d'approbation est le principal verrou de toute la thèse d'investissement.
  Un site au potentiel énorme ne vaut rien s'il n'obtient jamais son permis.
- **Développement (35 %)** — vient ensuite parce que c'est ce qui pilote
  l'ampleur du gain économique une fois le permis obtenu.
- **Contraintes (25 %)** — le poids le plus faible, à la fois parce que
  certains effets de contrainte se reflètent déjà dans le sous-score
  Urbanisme (le délai de décision, par exemple), et parce que ce
  sous-score existe spécifiquement pour capturer un risque physique/légal
  durable qu'aucune accélération procédurale ne résout (inondation,
  patrimoine).

## 1. Développement

Mesure combien de capacité constructible reste sur la table.

| Facteur | Poids / plafond | Rationale |
|---|---|---|
| Ratio de gain (uplift) | jusqu'à 75 pts | `(constructible médian − bâti actuel) / surface terrain`, plafonné à 1,2. Un ratio de 1,0 (constructible ≈ pleine emprise du terrain) donne une base de 75/100. |
| Bonus sous-exploitation | jusqu'à +15 pts | `1 − (bâti / terrain)` — combien l'usage actuel gâche le potentiel de la parcelle, indépendamment du gain constructible. |
| Bonus zoning | +10 (fort) / +4 (modéré) / 0 | Détection de mots-clés dans le texte de zoning : bonus de densité explicite ou rezonage récent = fort ; mention de mixité ou de transport = modéré. Voir limitation ci-dessous. |
| Bonus transport | jusqu'à +10 pts | Dégressif linéaire de 0 à 12 minutes à pied ; au-delà, la proximité aux transports n'apporte plus rien au dossier. |

```
buildableMid = (buildableM2[0] + buildableM2[1]) / 2
upliftRatio  = clamp((buildableMid − builtAreaM2) / siteAreaM2, 0, 1.2)
underuse     = clamp(1 − builtAreaM2 / siteAreaM2, 0, 1)

Développement = clamp(
  upliftRatio × 75
  + underuse × 15
  + bonusZoning
  + bonusTransport,
  0, 100
)
```

## 2. Urbanisme (confiance d'approbation)

C'est directement la « probabilité d'issue favorable » affichée dans le
produit — `planningConfidencePct` est une copie de ce sous-score, il n'y a
plus qu'une seule source de vérité pour ce chiffre.

| Facteur | Poids | Rationale |
|---|---|---|
| Taux d'approbation historique de la commune | 45 % | Le meilleur signal de base disponible sans regarder le dossier lui-même. |
| Taux d'approbation des permis comparables, pondéré par distance | 45 % | Un permis approuvé à 50 m pèse presque autant que le site lui-même ; un permis à 1 km pèse beaucoup moins. Poids = `1 / (1 + distance_m / 250)`. Seuls les permis **décidés** (approuvés ou refusés) entrent dans le calcul — les dossiers retirés ou en attente n'ont pas de verdict et sont exclus plutôt que comptés comme un échec. |
| Facteur qualitatif (development friendliness) | 10 % | Une petite place pour des signaux que les statistiques dures ne capturent pas (précédent politique, volonté locale). |
| Ajustement de tendance | `+ tendance_24mois × 0,8` | Une commune qui devient nettement plus permissive (ou plus stricte) doit déplacer la confiance, pas seulement la moyenne historique. |
| Pénalité dossiers incomplets | `− taux_incomplets × 0,25` | Une administration qui renvoie souvent les dossiers pour incomplétude est un risque procédural, indépendant du mérite du projet. |

```
comparableRate = moyenne pondérée par distance des permis DÉCIDÉS
                 (fallback : taux d'approbation de la commune si aucun permis décidé)

Urbanisme = clamp(
  0,45 × approbation_commune
  + 0,45 × comparableRate
  + 0,10 × (friendliness × 10)
  + tendance × 0,8
  − incomplets × 0,25,
  0, 100
)
```

## 3. Contraintes

Part de 100 et retire des pénalités fixes ou proportionnelles pour chaque
risque physique/légal durable.

| Pénalité | Montant | Rationale |
|---|---|---|
| Risque d'inondation | 0 / 18 / 40 (faible/moyen/élevé) | Contrainte technique et réglementaire lourde, en particulier sur les niveaux bas. |
| Contrainte patrimoniale | 15 | Ajoute une couche de validation et de délai difficilement compressible. |
| Délai de décision de la commune | `max(0, jours_médian − 220) × 0,12` | 220 jours est la commune la plus rapide de l'échantillon — la référence « pas de pénalité ». Chaque jour au-delà coûte 0,12 pt. |
| Grande parcelle | 5 si `surface > 3 500 m²` | Les projets de grande envergure, plus visibles, déclenchent plus souvent une enquête publique. |

```
Contraintes = clamp(
  100 − pénalitéInondation − pénalitéPatrimoine
      − pénalitéDélai − pénalitéGrandeParcelle,
  0, 100
)
```

## Exemple travaillé : Waterloo — Chaussée de Bruxelles 214

Entrées (mockées) :

```
siteAreaM2 = 4 760   builtAreaM2 = 620   buildableM2 = [3 100, 3 900]
zoning = "Résidentiel — densité mixte"   floodRisk = low   heritage = false
transitWalkMin = 6
commune (Waterloo) : approvalRate = 79 %, trend = +11 pts,
                     medianDecisionDays = 214, incompleteFileRate = 14 %,
                     friendliness = 8,2
12 permis comparables liés, dont 11 approuvés, 1 retiré
```

Calcul :

```
Développement
  upliftRatio = (3 500 − 620) / 4 760 = 0,605
  underuse    = 1 − 620/4 760 = 0,870
  base        = 0,605 × 75 = 45,4
  bonus zoning "densité mixte" → modéré = +4
  bonus transport (6 min < 12) = (12−6)/12 × 10 = +5
  underuseBonus = 0,870 × 15 = 13,1
  → 45,4 + 13,1 + 4 + 5 ≈ 67

Urbanisme
  décidés = 11 approuvés + 0 refusés (le retiré est exclu) → comparableRate = 100 %
  base = 0,45×79 + 0,45×100 + 0,10×82 = 35,55 + 45 + 8,2 = 88,75
  tendance = 11 × 0,8 = +8,8
  incomplets = 14 × 0,25 = −3,5
  → 88,75 + 8,8 − 3,5 ≈ 94

Contraintes
  inondation faible = 0, patrimoine = 0
  délai = max(0, 214−220) × 0,12 = 0
  grande parcelle : 4 760 < 3 500 ? non → 0
  → 100 − 0 ≈ 95 (léger écart d'arrondi possible)

Opportunity Score = 0,35×67 + 0,40×94 + 0,25×95 ≈ 85
```

C'est exactement ce que produit `scoreOpportunity()` pour cette
opportunité — voir `opp-waterloo-01` dans `src/data/opportunities.ts`.

## Limitations connues (à traiter avant tout usage réel)

1. **Détection du zoning par mots-clés.** `classifyZoningTailwind()`
   cherche des motifs (« bonus », « rezoné », « mixte », « transport »)
   dans une chaîne de texte libre. C'est un pis-aller tant qu'il n'y a pas
   de code de zoning structuré (voir la couche `zoning` dans la stack de
   données ci-dessous) — un vrai système doit remplacer ceci par une
   jointure géospatiale sur les plans d'affectation réels.
2. **Poids non calibrés statistiquement.** 0,35 / 0,40 / 0,25 et toutes
   les constantes de ce document sont des estimations raisonnées, pas le
   résultat d'une régression sur des décisions réelles. Une fois de
   vraies données de permis disponibles (voir ci-dessous), ces poids
   doivent être recalibrés — idéalement validés par un urbaniste et
   testés contre des décisions historiques connues.
3. **Comparables = même commune, triés par distance croissante.** Le
   rayon réel (500 m / 1 km) et le filtre de type de projet
   (`residential`, densité comparable…) mentionnés dans la stack de
   données ci-dessous ne sont pas encore implémentés ; le prototype
   utilise une approximation (les N permis les plus proches de la
   commune).
4. **Pas d'incertitude affichée.** Le score est un nombre unique. Une
   vraie version devrait exposer un intervalle de confiance ou un niveau
   de complétude des données par parcelle (ex. « constructible estimé sur
   la base d'un zoning partiel »).

## Pour de vraies données : la stack visée (phase suivante, non démarrée)

Cette section documente l'intention, pas un travail en cours. Elle
reprend l'architecture de données discutée pour la V0 réelle : privilégier
l'ingestion de flux officiels (WFS / OGC API / GeoPackage) plutôt que le
scraping, avec `parcel` comme table centrale et un graphe
`parcel ↔ building ↔ permit ↔ applicant ↔ zoning ↔ constraints ↔ municipality`.

Priorités identifiées, dans l'ordre :

1. Parcelles cadastrales (SPF Finances, WFS)
2. Bâtiments (GRB/Buildingsregister en Flandre, UrbIS à Bruxelles)
3. Permis (Omgevingsloket en Flandre, NOVA à Bruxelles — jamais scraper
   les portails web, toujours le flux source)
4. Zonage / plans d'affectation (DSI Flandre, équivalents Bruxelles/Wallonie)
5. Contraintes (inondation, patrimoine, Natura 2000)
6. Entreprises (BCE/KBO, pour relier un permis à un promoteur)

Explicitement hors scope MVP : données de propriétaire (accès restreint,
usage commercial interdit par le SPF Finances), prix de transaction
(disponible mais nécessite une licence Consultimmo pour un usage pro),
mobilité, et toute couche au-delà des six ci-dessus.

Recommandation de séquencement : construire un premier jeu de données
réel sur **une seule commune** (ex. Overijse) — toutes les parcelles,
tous les bâtiments, tous les permis, le zonage et les contraintes — puis
faire tourner ce moteur de scoring dessus pour produire un vrai
« Top 20 » et juger si le résultat est réellement pertinent, avant
d'investir dans le reste du pipeline (PostgreSQL/PostGIS, historisation
quotidienne, résolution d'entités, extraction LLM du texte des permis).
