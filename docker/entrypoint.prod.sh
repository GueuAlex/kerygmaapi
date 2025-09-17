#!/bin/sh

# Script d'entrée pour la production
# Exécute les migrations avant de démarrer l'application

set -e

echo "🚀 Démarrage de l'application en production..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
until nc -z db 3306; do
  echo "Base de données non prête, attente..."
  sleep 2
done
echo "✅ Base de données prête"

# Exécuter les migrations
echo "📦 Exécution des migrations..."
if [ -f "src/config/typeorm-migration.config.ts" ]; then
  pnpm typeorm migration:run -d src/config/typeorm-migration.config.ts || echo "⚠️ Erreur lors des migrations"
  echo "✅ Migrations terminées"
else
  echo "⚠️ Configuration de migration non trouvée, ignoré"
fi

# Démarrer l'application
echo "🎯 Démarrage de l'application NestJS..."
exec node dist/main.js