# CLAUDE.md

Ce fichier fournit des directives a Claude Code (claude.ai/code) pour travailler avec le code de ce depot.

## Commandes de developpement

### Installation et demarrage
```bash
# Installation des dependances
pnpm install

# Demarrage en mode developpement (hors Docker)
pnpm run start:dev

# Demarrage avec Docker (recommande pour le developpement complet)
docker compose -f docker/docker-compose.yml up --build

# Production
docker compose -f docker/docker-compose.prod.yml up -d --build
```

### Construction et tests
```bash
# Construction
pnpm run build

# Linting et formatage
pnpm run lint
pnpm run format

# Tests
pnpm run test              # Tests unitaires
pnpm run test:watch        # Tests en mode watch
pnpm run test:cov          # Coverage
pnpm run test:e2e          # Tests end-to-end
```

### Acces aux services en developpement
- API: http://localhost:3000
- Base de donnees MySQL: localhost:3306 (dev/devpass)
- phpMyAdmin: http://localhost:8081

## Architecture du projet

### Structure generale
Ce projet suit une architecture modulaire NestJS avec TypeScript et MySQL. Chaque module represente un domaine metier isole (users, parishes, payments, etc.).

### Configuration multi-environnements
- Variables d'environnement dans `/environments/{dev,test,prod}/.env.template`
- Configuration centralisee dans `/src/config/`
- Base de donnees MySQL avec TypeORM

### Modules principaux
- **users/**: Gestion des utilisateurs avec statuts (active, inactive, suspended, guest)
- **parishes/**: Gestion des paroisses
- **payments/**: Systeme de paiement multi-gateway avec transactions
- **masses/**: Calendrier et types de messes, demandes de messes
- **offerings/**: Gestion des offrandes et campagnes
- **contributions/**: Gestion des cotisations avec cartes et campagnes
- **roles/**: Systeme de roles et permissions
- **reports/**: Generation de rapports
- **notifications/**: Systeme de notifications

### Patterns d'architecture NestJS
Chaque module suit la structure standard :
- `*.controller.ts`: Gestion des routes HTTP
- `*.service.ts`: Logique metier
- `*.module.ts`: Configuration du module NestJS
- `dto/`: Data Transfer Objects pour la validation
- `entities/`: Entites TypeORM pour la base de donnees

### Configuration TypeORM
- Entites auto-chargees depuis `src/**/*.entity.ts`
- Synchronisation automatique en dev (`TYPEORM_SYNCHRONIZE=true`)
- Logging active en dev (`TYPEORM_LOGGING=true`)
- Configuration MySQL avec pool de connexions

### Docker et orchestration
- `docker/Dockerfile`: Image multi-stage (dev/prod)
- `docker-compose.yml`: Environnement de dev avec hot-reload et phpMyAdmin
- `docker-compose.prod.yml`: Configuration optimisee pour la production
- Services : app NestJS, MySQL, phpMyAdmin

### Variables d'environnement importantes
- `NODE_ENV`: environnement (development/production)
- `DB_*`: Configuration base de donnees
- `TYPEORM_*`: Configuration ORM
- `JWT_*`: Configuration authentification
- `PORT`: Port d'ecoute (defaut: 3000)

### Fichiers de configuration cles
- `src/main.ts`: Point d'entree de l'application
- `src/app.module.ts`: Module racine (modules metier commentes par defaut)
- `src/config/database.config.ts`: Configuration DB avec variables d'environnement
- `src/config/typeorm.config.ts`: Factory TypeORM avec ConfigService

## Notes de developpement

Les modules metier sont commentes dans `app.module.ts` par defaut. Decommenter selon les besoins du developpement.

Le projet utilise pnpm comme gestionnaire de packages et ESLint avec TypeScript pour la qualite du code.

## Directives specifiques

### Processus de versionnement et deploiement
- Pour les commits, push et deploiements, je (le developpeur) indiquerai quand les effectuer