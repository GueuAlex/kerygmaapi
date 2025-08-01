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
  const config = new DocumentBuilder()
    .setTitle('KERYGMA API REST FULL')
    .setDescription(
      `
API pour la gestion des paroisses et services religieux

## 🔐 Authentification

Pour utiliser les endpoints protégés, vous devez :

1. **S'inscrire** avec \`POST /auth/register\`
2. **Se connecter** avec \`POST /auth/login\` 
3. **Utiliser le token** reçu dans le header : \`Authorization: Bearer <token>\`

## 📋 Rôles utilisateurs

- **admin** : Accès complet à toutes les fonctionnalités
- **priest** : Gestion des messes et sacrements 
- **parish_admin** : Administration d'une paroisse
- **user** : Utilisateur standard

## 🏗️ Modules disponibles

- **Auth** : Inscription, connexion, gestion des tokens
- **Users** : Gestion des utilisateurs (à venir)
- **Parishes** : Gestion des paroisses (à venir)
- **Masses** : Calendrier et demandes de messes (à venir)
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
    )
    .addServer(`http://localhost:3000/${apiPrefix}`, 'Développement local')
    .addServer(`http://194.163.136.227:3001/${apiPrefix}`, 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
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
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Kerygma API démarrée sur http://localhost:${port}`);
  console.log(
    `📚 Documentation Swagger : http://localhost:${port}/${apiPrefix}/docs`,
  );
  console.log(
    `🔗 JSON Schema : http://localhost:${port}/${apiPrefix}/docs-json`,
  );
}

void bootstrap();
