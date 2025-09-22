#!/bin/bash

# Script de déploiement manuel minimaliste DIGIFAZ
# Utilise l'archive générée par generate-deploy.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="kerygmaapi"
VPS_HOST="194.163.136.227"
VPS_USER="root"
SSH_KEY="$HOME/.ssh/kerygmaapi_deploy_key"
DEPLOY_ARCHIVE="${PROJECT_NAME}-deploy.tar.gz"

info() {
    echo -e "${BLUE}ℹ️  [INFO] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ [SUCCESS] $1${NC}"
}

error() {
    echo -e "${RED}❌ [ERROR] $1${NC}"
}

# Vérifier les prérequis
info "Vérification des prérequis..."

# Vérifier que l'archive existe
if [ ! -f "$DEPLOY_ARCHIVE" ]; then
    error "Archive $DEPLOY_ARCHIVE non trouvée"
    info "Exécutez d'abord: ./scripts/generate-deploy.sh"
    exit 1
fi

# Vérifier la clé SSH
if [ ! -f "$SSH_KEY" ]; then
    error "Clé SSH non trouvée: $SSH_KEY"
    exit 1
fi

# Tester la connexion SSH
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" > /dev/null 2>&1; then
    error "Impossible de se connecter au VPS via SSH"
    exit 1
fi

success "Prérequis OK"

# Vérification des migrations manquantes
info "Vérification des migrations manquantes..."

# Vérifier si les services Docker dev sont actifs pour la génération de migration
if ! docker-compose -f docker/docker-compose.yml ps | grep -q "Up"; then
    info "Démarrage des services Docker dev pour vérification..."
    docker-compose -f docker/docker-compose.yml up -d > /dev/null 2>&1
    info "Attente que la base de données dev soit prête..."
    sleep 10
fi

# Créer un fichier temporaire pour la migration de test
TEMP_MIGRATION_NAME="CheckPendingChanges$(date +%s)"
MIGRATION_CHECK_OUTPUT=$(pnpm typeorm migration:generate "src/migrations/$TEMP_MIGRATION_NAME" -d src/config/typeorm-migration.config.ts 2>&1)

if echo "$MIGRATION_CHECK_OUTPUT" | grep -q "has been generated successfully"; then
    error "⚠️  ATTENTION: Des changements d'entités non migrés ont été détectés !"
    error "Une migration a été générée: src/migrations/$TEMP_MIGRATION_NAME.ts"
    echo ""
    echo -e "${YELLOW}🔧 Actions requises:${NC}"
    echo "1. Vérifiez la migration générée dans src/migrations/"
    echo "2. Si correcte, commitez-la:"
    echo "   git add src/migrations/"
    echo "   git commit -m 'feat: migrate pending entity changes'"
    echo "   git push origin main"
    echo "3. Relancez le déploiement: ./scripts/deploy-manual.sh"
    echo ""
    echo -e "${RED}❌ Déploiement annulé pour éviter les erreurs de synchronisation${NC}"
    exit 1
elif echo "$MIGRATION_CHECK_OUTPUT" | grep -q "No changes in database schema were found"; then
    # Supprimer le fichier de migration vide qui a pu être créé
    rm -f "src/migrations/$TEMP_MIGRATION_NAME.ts"
    success "✅ Aucune migration manquante détectée"
else
    error "Erreur lors de la vérification des migrations:"
    echo "$MIGRATION_CHECK_OUTPUT"
    exit 1
fi

# 1. Upload de l'archive
info "Upload de l'archive vers le VPS..."
scp -i "$SSH_KEY" "$DEPLOY_ARCHIVE" "$VPS_USER@$VPS_HOST:/opt/"
success "Archive uploadée"

# 2. Arrêt des services actuels (si ils existent)
info "Arrêt des services actuels..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "
    cd /opt
    if [ -d kerygmaapi ]; then
        cd kerygmaapi
        docker-compose -f docker/docker-compose.prod.yml --env-file environments/prod/.env down || true
        cd /opt
        rm -rf kerygmaapi
    fi
"

# 3. Extraction de l'archive
info "Extraction de l'archive..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "
    cd /opt
    tar -xzf $DEPLOY_ARCHIVE
    rm -f $DEPLOY_ARCHIVE
"
success "Archive extraite"

# 4. Déploiement des containers
info "Démarrage des services Docker..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "
    cd /opt/kerygmaapi
    docker-compose -f docker/docker-compose.prod.yml --env-file environments/prod/.env up --build -d
"
success "Services démarrés"

# 5. Vérification rapide
info "Vérification des services..."
sleep 10

# Tester l'API
if curl -f -s "http://$VPS_HOST:3001/api/v1/health" > /dev/null; then
    success "✅ API Health Check: OK"
else
    error "❌ API Health Check: ÉCHEC"
fi

echo -e "\n${GREEN}🎉 DÉPLOIEMENT TERMINÉ !${NC}"
echo -e "${BLUE}🌐 API DIGIFAZ: http://$VPS_HOST:3001${NC}"
echo -e "${BLUE}🗄️  phpMyAdmin: http://$VPS_HOST:8100${NC}"