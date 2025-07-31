#!/bin/bash

# Script pour generer kerygmaapi-deploy.tar.gz pour deployment VPS
# Auteur: DIGIFAZ Team
# Date: $(date +%Y-%m-%d)

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="kerygmaapi"
DEPLOY_ARCHIVE="${PROJECT_NAME}-deploy.tar.gz"
TEMP_DIR="temp_deploy"

echo -e "${BLUE}=== DIGIFAZ - Generateur de package de deploiement ===${NC}"
echo -e "${YELLOW}Preparation du package pour le VPS...${NC}"

# Verifier qu'on est dans le bon repertoire
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}Erreur: Ce script doit etre execute depuis la racine du projet${NC}"
    exit 1
fi

# Nettoyer le repertoire temporaire s'il existe
if [ -d "$TEMP_DIR" ]; then
    echo -e "${YELLOW}Nettoyage du repertoire temporaire...${NC}"
    rm -rf "$TEMP_DIR"
fi

# Supprimer l'ancien archive s'il existe
if [ -f "$DEPLOY_ARCHIVE" ]; then
    echo -e "${YELLOW}Suppression de l'ancien archive...${NC}"
    rm -f "$DEPLOY_ARCHIVE"
fi

# Creer le repertoire temporaire
mkdir -p "$TEMP_DIR/$PROJECT_NAME"

echo -e "${BLUE}Copie des fichiers necessaires...${NC}"

# Copier les fichiers et dossiers necessaires
cp -r src "$TEMP_DIR/$PROJECT_NAME/"
cp -r docker "$TEMP_DIR/$PROJECT_NAME/"
cp -r environments "$TEMP_DIR/$PROJECT_NAME/"

# Copier les fichiers de configuration
cp package.json "$TEMP_DIR/$PROJECT_NAME/"
cp pnpm-lock.yaml "$TEMP_DIR/$PROJECT_NAME/"
cp tsconfig.json "$TEMP_DIR/$PROJECT_NAME/"
cp tsconfig.build.json "$TEMP_DIR/$PROJECT_NAME/"
cp nest-cli.json "$TEMP_DIR/$PROJECT_NAME/"

# Copier les fichiers de documentation et configuration
cp README.md "$TEMP_DIR/$PROJECT_NAME/" 2>/dev/null || echo "README.md non trouve, ignore"
cp CLAUDE.md "$TEMP_DIR/$PROJECT_NAME/" 2>/dev/null || echo "CLAUDE.md non trouve, ignore"
cp .dockerignore "$TEMP_DIR/$PROJECT_NAME/" 2>/dev/null || echo ".dockerignore non trouve, ignore"
cp .prettierrc "$TEMP_DIR/$PROJECT_NAME/" 2>/dev/null || echo ".prettierrc non trouve, ignore"
cp eslint.config.mjs "$TEMP_DIR/$PROJECT_NAME/" 2>/dev/null || echo "eslint.config.mjs non trouve, ignore"

# Copier le .gitignore (utile pour le developpement)
cp .gitignore "$TEMP_DIR/$PROJECT_NAME/" 2>/dev/null || echo ".gitignore non trouve, ignore"

echo -e "${BLUE}Creation de l'archive...${NC}"

# Creer l'archive tar.gz
cd "$TEMP_DIR"
tar -czf "../$DEPLOY_ARCHIVE" "$PROJECT_NAME"
cd ..

# Nettoyer le repertoire temporaire
rm -rf "$TEMP_DIR"

# Afficher les informations sur l'archive
ARCHIVE_SIZE=$(du -h "$DEPLOY_ARCHIVE" | cut -f1)
echo -e "${GREEN}=== Archive creee avec succes ===${NC}"
echo -e "${GREEN}Fichier: $DEPLOY_ARCHIVE${NC}"
echo -e "${GREEN}Taille: $ARCHIVE_SIZE${NC}"

echo -e "${BLUE}Contenu de l'archive:${NC}"
tar -tzf "$DEPLOY_ARCHIVE" | head -20
if [ $(tar -tzf "$DEPLOY_ARCHIVE" | wc -l) -gt 20 ]; then
    echo "... et $(expr $(tar -tzf "$DEPLOY_ARCHIVE" | wc -l) - 20) autres fichiers"
fi

echo ""
echo -e "${YELLOW}=== Instructions de deploiement ===${NC}"
echo -e "${GREEN}1. Copier l'archive sur le VPS:${NC}"
echo "   scp $DEPLOY_ARCHIVE root@194.163.136.227:/opt/"
echo ""
echo -e "${GREEN}2. Sur le VPS, extraire et deployer:${NC}"
echo "   cd /opt"
echo "   tar -xzf $DEPLOY_ARCHIVE"
echo "   cd $PROJECT_NAME"
echo "   docker-compose -f docker/docker-compose.prod.yml up --build -d"
echo ""
echo -e "${GREEN}3. Verifier le deploiement:${NC}"
echo "   curl http://194.163.136.227:3001/health"
echo "   docker-compose -f docker/docker-compose.prod.yml logs -f"

echo -e "${GREEN}=== Deploiement pret ! ===${NC}"