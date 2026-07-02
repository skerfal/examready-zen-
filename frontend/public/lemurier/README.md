# Le Mûrier — Documents officiels

Ce dossier contient les documents officiels de l'École Le Mûrier (Ifrane) qui
s'affichent automatiquement dans la plateforme dès qu'ils sont déposés ici.

## Fichiers attendus

| Chemin | Description |
| --- | --- |
| `math-cover.jpg` | Couverture du livre **الجيد في الرياضيات** (6AEP, éd. Sept. 2020) |
| `math-sommaire.jpg` | Sommaire / table des matières du livre de maths 6AEP |
| `programme-hebdo.jpg` | Programme hebdomadaire de toute l'école (toutes les classes) |

Formats acceptés : **JPG, PNG, WEBP, PDF**. Pas de limite de taille pour les
fichiers servis directement (la limite 4 MB ne s'applique qu'aux téléversements
faits depuis l'interface, qui sont stockés dans `localStorage`).

## Étendre à d'autres matières

Pour ajouter une couverture / un sommaire pour une autre matière, mets le
fichier ici (ex. `francais-cover.jpg`) puis ajoute deux champs dans
`subjectsMurier` (dans `public/iqraanow-platform_4.html`) :

```js
{
  id: 'francais',
  ...,
  defaultCover:    '/lemurier/francais-cover.jpg',
  defaultSommaire: '/lemurier/francais-sommaire.jpg',
}
```

Les fichiers servent depuis `/lemurier/...` car Next.js sert tout le contenu de
`public/` à la racine du site.

## Comment ça s'affiche

Dans la plateforme :

1. Va sur **École Le Mûrier → Mathématiques** (matière)
2. La section **Documents pédagogiques** affiche automatiquement le cover et
   le sommaire si les fichiers sont présents ici, marqués **« Officiel »**.
3. Un admin peut **Remplacer** un document par défaut en uploadant un fichier
   via l'interface ; ce remplacement vit dans `localStorage` (par navigateur).
4. Le **bouton Supprimer (×)** ne s'affiche pas pour les fichiers officiels —
   seuls les téléversements perso peuvent être supprimés depuis l'UI.
