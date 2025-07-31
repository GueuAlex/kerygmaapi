#!/bin/bash

# Script de déploiement DIGIFAZ sur VPS
# Usage: ./deploy.sh [user@hostname]

set -e

# Configuration
VPS_USER_HOST=${1:-"user@your-vps-ip"}
PROJECT_NAME="kerygmaapi"
REMOTE_DIR="/opt/kerygmaapi"

echo "🚀 Déploiement de DIGIFAZ sur $VPS_USER_HOST"

# 1. Créer le répertoire sur le VPS et installer Docker si nécessaire
echo "📦 Préparation du VPS..."
ssh $VPS_USER_HOST "
    # Créer le répertoire
    sudo mkdir -p $REMOTE_DIR
    sudo chown \$(whoami):\$(whoami) $REMOTE_DIR
    
    # Installer Docker et Docker Compose si pas déjà installé
    if ! command -v docker &> /dev/null; then
        echo 'Installation de Docker...'
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker \$(whoami)
    fi
    
    if ! command -v docker compose &> /dev/null; then
        echo 'Docker Compose déjà inclus dans Docker moderne'
    fi
"

# 2. Copier les fichiers nécessaires
echo "📁 Copie des fichiers..."
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='dist' \
    ./ $VPS_USER_HOST:$REMOTE_DIR/

# 3. Lancer les conteneurs
echo "🐳 Lancement des conteneurs..."
ssh $VPS_USER_HOST "
    cd $REMOTE_DIR
    
    # Arrêter les anciens conteneurs s'ils existent
    docker compose -f docker/docker-compose.prod.yml down --remove-orphans
    
    # Construire et lancer les nouveaux
    docker compose -f docker/docker-compose.prod.yml up --build -d
    
    # Attendre que l'application soit prête
    echo 'Attente du démarrage...'
    sleep 30
    
    # Vérifier le statut
    docker compose -f docker/docker-compose.prod.yml ps
"

# 4. Test de santé
echo "🏥 Test de santé..."
sleep 10
if ssh $VPS_USER_HOST "curl -f http://localhost/health"; then
    echo "✅ Déploiement réussi ! L'API est accessible."
    echo "🌐 Votre API est maintenant disponible sur : http://$(echo $VPS_USER_HOST | cut -d'@' -f2)"
else
    echo "❌ Erreur : L'API ne répond pas"
    ssh $VPS_USER_HOST "cd $REMOTE_DIR && docker compose -f docker/docker-compose.prod.yml logs --tail=50"
    exit 1
fi

echo "🎉 Déploiement terminé avec succès !"