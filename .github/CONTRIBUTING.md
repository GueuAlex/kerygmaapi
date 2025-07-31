# Guide de Contribution - DIGIFAZ

Merci de votre intérêt pour contribuer à DIGIFAZ ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 🚀 Démarrage rapide

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez** une branche pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
4. **Commitez** vos changements : `git commit -m 'feat: ajouter ma fonctionnalité'`
5. **Push** vers votre fork : `git push origin feature/ma-fonctionnalite`
6. **Créez** une Pull Request

## 📋 Types de contributions

- 🐛 **Bug fixes** : Corrections de bugs
- ✨ **Features** : Nouvelles fonctionnalités
- 📚 **Documentation** : Améliorations de la documentation
- 🧪 **Tests** : Ajout ou amélioration des tests
- ⚡ **Performance** : Optimisations de performance
- 🔧 **Refactoring** : Restructuration du code

## 🛠️ Configuration de l'environnement de développement

### Prérequis
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- MySQL 8.0

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/votre-username/kerygmaapi.git
cd kerygmaapi

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp environments/dev/.env.template environments/dev/.env

# Démarrer les services de développement
docker-compose -f docker/docker-compose.yml up -d

# Démarrer l'application en mode développement
pnpm start:dev
```

## 📝 Conventions de code

### Style de code
- Utiliser **TypeScript** pour tout le code
- Suivre les règles **ESLint** et **Prettier**
- Utiliser **camelCase** pour les variables et fonctions
- Utiliser **PascalCase** pour les classes et interfaces

### Structure des commits
Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

[body optionnel]

[footer optionnel]
```

**Types valides :**
- `feat`: nouvelle fonctionnalité
- `fix`: correction de bug
- `docs`: documentation
- `style`: formatage
- `refactor`: refactoring
- `test`: tests
- `chore`: maintenance

**Exemples :**
```bash
feat(auth): ajouter authentification JWT
fix(payments): corriger le calcul des frais Wave
docs(api): mettre à jour la documentation Swagger
```

### Structure des branches
- `main` : branche de production
- `develop` : branche de développement
- `feature/nom-fonctionnalite` : nouvelles fonctionnalités
- `fix/nom-bug` : corrections de bugs
- `hotfix/nom-hotfix` : corrections urgentes

## 🧪 Tests

### Lancer les tests
```bash
# Tests unitaires
pnpm test

# Tests e2e
pnpm test:e2e

# Coverage
pnpm test:cov

# Tests en mode watch
pnpm test:watch
```

### Écrire des tests
- Chaque fonctionnalité doit avoir des tests unitaires
- Les endpoints API doivent avoir des tests e2e
- Viser un coverage > 80%

## 📋 Process de Pull Request

### Avant de soumettre
- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent
- [ ] Le linting passe (`pnpm lint`)
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les migrations de base de données sont incluses si nécessaire

### Description de la PR
- Utilisez le template de PR fourni
- Expliquez clairement les changements
- Liez les issues correspondantes
- Ajoutez des captures d'écran si pertinent

### Review process
1. **Automated checks** : CI/CD pipelines
2. **Code review** : Révision par l'équipe
3. **Testing** : Tests manuels si nécessaire
4. **Approval** : Approbation des mainteneurs
5. **Merge** : Fusion dans la branche principale

## 🏗️ Architecture du projet

```
src/
├── modules/          # Modules métier (users, parishes, etc.)
├── common/           # Code partagé (decorators, filters, etc.)
├── config/           # Configuration (database, env, etc.)
└── main.ts          # Point d'entrée de l'application

docker/               # Configuration Docker
environments/         # Variables d'environnement
scripts/             # Scripts de déploiement
```

## 🐛 Signaler des bugs

1. Vérifiez que le bug n'existe pas déjà dans les [issues](https://github.com/votre-org/kerygmaapi/issues)
2. Utilisez le template de bug report
3. Fournissez un maximum d'informations :
   - Version de DIGIFAZ
   - Environnement (OS, navigateur, etc.)
   - Steps to reproduce
   - Logs d'erreur

## 💡 Proposer des fonctionnalités

1. Créez une issue avec le template "Feature Request"
2. Décrivez clairement le besoin
3. Proposez une solution
4. Discutez avec la communauté

## 📞 Support

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : Pour les questions privées

## 📄 Licence

En contribuant à DIGIFAZ, vous acceptez que vos contributions soient sous la même licence que le projet.

---

Merci de contribuer à DIGIFAZ ! 🙏