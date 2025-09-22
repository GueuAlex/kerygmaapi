#!/bin/bash

# Script de vérification des migrations manquantes
# Utilisation: ./scripts/check-migrations.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Vérification des migrations manquantes...${NC}"

# Vérifier si les services Docker sont actifs
if ! docker-compose -f docker/docker-compose.yml ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Services Docker dev non actifs${NC}"
    echo -e "${BLUE}💡 Démarrage des services pour la vérification...${NC}"
    docker-compose -f docker/docker-compose.yml up -d
    echo -e "${BLUE}⏳ Attente que la base soit prête...${NC}"
    sleep 10
fi

# Créer un nom de migration temporaire
TEMP_MIGRATION_NAME="CheckPendingChanges$(date +%s)"

# Générer la migration de test
MIGRATION_OUTPUT=$(pnpm typeorm migration:generate "src/migrations/$TEMP_MIGRATION_NAME" -d src/config/typeorm-migration.config.ts 2>&1)

if echo "$MIGRATION_OUTPUT" | grep -q "has been generated successfully"; then
    echo -e "${YELLOW}⚠️  Changements détectés !${NC}"
    echo ""
    echo -e "${BLUE}📋 Résumé:${NC}"
    echo "• Des modifications d'entités nécessitent une migration"
    echo "• Migration générée: src/migrations/$TEMP_MIGRATION_NAME.ts"
    echo ""
    echo -e "${YELLOW}🔧 Prochaines étapes:${NC}"
    echo "1. Vérifiez la migration: cat src/migrations/$TEMP_MIGRATION_NAME.ts"
    echo "2. Si correcte, commitez:"
    echo "   git add src/migrations/ && git commit -m 'feat: migrate entity changes'"
    echo "3. Puis déployez: ./scripts/deploy-manual.sh"
    echo ""
    echo -e "${RED}⛔ Ne déployez PAS avant d'avoir commité cette migration${NC}"
    
elif echo "$MIGRATION_OUTPUT" | grep -q "No changes in database schema were found"; then
    # Nettoyer le fichier vide si créé
    rm -f "src/migrations/$TEMP_MIGRATION_NAME.ts"
    echo -e "${GREEN}✅ Parfait ! Aucune migration manquante${NC}"
    echo -e "${BLUE}🚀 Vous pouvez déployer en toute sécurité avec: ./scripts/deploy-manual.sh${NC}"
    
else
    echo -e "${RED}❌ Erreur lors de la vérification:${NC}"
    echo "$MIGRATION_OUTPUT"
    exit 1
fi