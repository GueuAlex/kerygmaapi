import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration du prefixe API global
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Configuration de la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configuration Swagger
  const isProduction = process.env.NODE_ENV === 'production';

  const config = new DocumentBuilder()
    .setTitle('KERYGMA API REST FULL')
    .setDescription(
      `
**Version 2.0** avec système de permissions granulaires avancé

---

## 🔐 Authentification

Pour utiliser les endpoints protégés :

1. **S'inscrire** : \`POST /auth/register\` avec un rôle
2. **Se connecter** : \`POST /auth/login\`
3. **Utiliser le token** : \`Authorization: Bearer <token>\`

---

## 🎯 **NOUVEAU : Système de Permissions Granulaires**

### 📌 **Concept**
Le système utilise des permissions **par ressource et par action** au lieu des rôles simples.

### 🔑 **Format des permissions**
\`\`\`json
{
  "users": ["read", "write", "delete"],
  "parishes": ["read", "write"],
  "masses": ["read", "write", "delete"],
  "roles": ["read", "write"]
}
\`\`\`

### 🛠️ **Actions disponibles**
- **read** : Consultation (GET)
- **write** : Création/Modification (POST, PUT)
- **delete** : Suppression (DELETE)
- ***** : Toutes les actions (super-admin)

### 🏷️ **Ressources disponibles**
- **users** : Gestion des utilisateurs
- **parishes** : Gestion des paroisses  
- **masses** : Calendrier et demandes de messes
- **roles** : Gestion des rôles et permissions
- **offerings** : Gestion des offrandes et campagnes
- ***** : Toutes les ressources (super-admin)

---

## 👥 **Rôles prédéfinis**

### 🔴 **super_admin**
- **Permissions** : \`{"*": ["*"]}\` (accès total)
- **Usage** : Administration système complète

### 🟣 **parish_priest** 
- **Permissions** : Gestion paroissiale complète sauf système
- **Usage** : Curé de paroisse

### 🟡 **treasurer**
- **Permissions** : Gestion financière et rapports
- **Usage** : Trésorier paroissial

### 🟢 **secretary**
- **Permissions** : Gestion administrative limitée
- **Usage** : Secrétaire de paroisse

### 🔵 **basic_user**
- **Permissions** : Consultation et profil personnel
- **Usage** : Fidèle standard

---

## 🚀 **Utilisation pour les développeurs**

### 1️⃣ **Créer un rôle personnalisé**
\`\`\`bash
POST /roles
{
  "name": "mon_role_custom",
  "description": "Rôle spécialisé",
  "permissions": {
    "masses": ["read", "write"],
    "parishes": ["read"]
  }
}
\`\`\`

### 2️⃣ **Assigner un rôle à un utilisateur**
\`\`\`bash
POST /roles/{roleId}/assign
{
  "user_id": "uuid-de-l-utilisateur"
}
\`\`\`

### 3️⃣ **Vérifier les permissions d'un utilisateur**
\`\`\`bash
GET /roles/user/{userId}/permissions
\`\`\`

### 4️⃣ **Messages d'erreur explicites**
En cas d'accès refusé :
\`\`\`json
{
  "message": "Permission refusée. Ressource: masses, Action: write",
  "error": "Forbidden",
  "statusCode": 403
}
\`\`\`

---

## 🏗️ **Modules disponibles**

✅ **Auth** : Inscription, connexion, récupération mot de passe  
✅ **Users** : Gestion complète des utilisateurs  
✅ **Roles** : Système de permissions granulaires  
✅ **Parishes** : Gestion des paroisses  
✅ **Masses** : Calendrier liturgique et types de célébrations  
✅ **Mass-Requests** : Demandes de messes et intentions  
✅ **Offerings** : Gestion des offrandes, types et campagnes avec dons anonymes

🔄 **À venir** : Contributions, Finances, Rapports

---

## ⚠️ **Migration depuis l'ancien système**

Les anciens rôles (\`admin\`, \`priest\`, \`user\`) sont automatiquement migrés vers le nouveau système lors de l'inscription. Les utilisateurs existants conservent leurs accès via leurs rôles simples.

---

**💡 Conseil** : Utilisez les endpoints \`/roles\` pour explorer et tester les permissions avant de les implémenter dans votre application.
`,
    )
    .setVersion('1.0.0')
    .setContact('DIGIFAZ Team', 'https://digifaz.com', 'contact@digifaz.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenu lors de la connexion',
      },
      'JWT-auth',
    );

  // Ajouter les serveurs selon l'environnement (serveur par défaut en premier)
  if (isProduction) {
    config
      .addServer(
        'http://194.163.136.227:3001',
        'Production (Serveur principal)',
      )
      .addServer('http://localhost:3000', 'Développement local');
  } else {
    config
      .addServer(
        'http://localhost:3000',
        'Développement local (Serveur principal)',
      )
      .addServer('http://194.163.136.227:3001', 'Production');
  }

  const swaggerConfig = config.build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    customSiteTitle: 'Kerygma API Documentation',
    customCssUrl:
      'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-material.css',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      // Forcer l'utilisation du premier serveur de la liste
      defaultServerIndex: 0,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  const baseUrl = isProduction
    ? `http://194.163.136.227:${port}`
    : `http://localhost:${port}`;

  console.log(`🚀 Kerygma API démarrée sur ${baseUrl}`);
  console.log(`📚 Documentation Swagger : ${baseUrl}/${apiPrefix}/docs`);
  console.log(`🔗 JSON Schema : ${baseUrl}/${apiPrefix}/docs-json`);
}

void bootstrap();
