# Configuration Docker Sécurisée

## Structure des fichiers

### Docker Compose
- `docker-compose.yml` - Configuration de développement
- `docker-compose.prod.yml` - Configuration de production  
- `docker-compose.test.yml` - Configuration de test

### Variables d'environnement
Toutes les variables sensibles sont maintenant externalisées dans les fichiers d'environnement :
- `../environments/dev/.env.template` - Variables de développement
- `../environments/prod/.env` - Variables de production
- `../environments/test/.env.template` - Variables de test

## Utilisation

### Développement
```bash
docker compose -f docker/docker-compose.yml up --build -d
```

### Production
```bash
docker compose -f docker/docker-compose.prod.yml up --build -d
```

### Test
```bash
docker compose -f docker/docker-compose.test.yml up --build -d
```

## Ports par défaut

| Environnement | API | MySQL | phpMyAdmin |
|--------------|-----|-------|------------|
| Développement | 3000 | 3306 | 8081 |
| Production | 3001 | 3307 | 8082 |
| Test | 3002 | 3308 | 8083 |

## Variables externalisées

### Variables sensibles sécurisées
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD` 
- `JWT_SECRET`
- `PMA_PASSWORD`

### Variables de configuration
- `APP_EXTERNAL_PORT`
- `DB_EXTERNAL_PORT`
- `PHPMYADMIN_EXTERNAL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `PMA_HOST`, `PMA_PORT`, `PMA_USER`

## Avantages de cette structure

1. **Sécurité** : Aucune donnée sensible en dur dans les fichiers Docker
2. **Flexibilité** : Ports et configurations facilement modifiables
3. **Multi-environnement** : Configurations séparées et cohérentes
4. **Maintenabilité** : Structure claire et documentée