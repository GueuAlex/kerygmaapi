import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: "Inscription d'un nouvel utilisateur",
    description: `
Crée un nouveau compte utilisateur dans le système DIGIFAZ.

**Processus d'inscription :**
1. Validation des données (email unique, mot de passe sécurisé)
2. Hash du mot de passe avec bcryptjs
3. Création de l'utilisateur avec le rôle 'user' par défaut
4. Génération automatique d'un token JWT
5. Retour des informations utilisateur + token

**Rôle par défaut :** \`user\`  
**Statut par défaut :** \`active\`

**Exemple de test :**
\`\`\`json
{
  "fullName": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "password": "motdepasse123",
  "phone": "+237690123456"
}
\`\`\`
    `,
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        summary: 'Inscription standard',
        description: "Exemple d'inscription d'un utilisateur standard",
        value: {
          fullName: 'Marie Nguema',
          email: 'marie.nguema@digifaz.com',
          password: 'motdepasse123',
          phone: '+237690123456',
        },
      },
      example2: {
        summary: 'Inscription minimale',
        description: 'Inscription avec les champs obligatoires uniquement',
        value: {
          fullName: 'Paul Biya',
          email: 'paul.biya@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Utilisateur créé avec succès. Token JWT inclus pour connexion immédiate.',
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'uuid-1234-5678-9012',
        email: 'marie.nguema@digifaz.com',
        fullName: 'Marie Nguema',
        role: 'user',
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
    example: {
      statusCode: 409,
      message: 'Un utilisateur avec cet email existe déjà',
      error: 'Conflict',
    },
  })
  @ApiResponse({
    status: 400,
    description: "Données d'inscription invalides (validation échouée)",
    example: {
      statusCode: 400,
      message: [
        'Email invalide',
        'Mot de passe doit avoir au moins 6 caractères',
      ],
      error: 'Bad Request',
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description: `
Authentifie un utilisateur existant et retourne un token JWT.

**Processus de connexion :**
1. Vérification de l'existence de l'utilisateur
2. Contrôle du statut du compte (actif/suspendu/inactif)
3. Validation du mot de passe avec bcryptjs
4. Génération d'un nouveau token JWT
5. Retour des informations utilisateur + token

**Statuts de compte :**
- \`active\` : Connexion autorisée ✅
- \`inactive\` : Compte à activer ⚠️
- \`suspended\` : Compte suspendu ❌
- \`guest\` : Accès limité ⚠️

**Durée du token :** 24h par défaut

**Exemple de test :**
\`\`\`json
{
  "email": "marie.nguema@digifaz.com",
  "password": "motdepasse123"
}
\`\`\`
    `,
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      user: {
        summary: 'Utilisateur standard',
        description: "Connexion d'un utilisateur standard",
        value: {
          email: 'marie.nguema@digifaz.com',
          password: 'motdepasse123',
        },
      },
      admin: {
        summary: 'Administrateur',
        description: "Connexion d'un administrateur",
        value: {
          email: 'admin@digifaz.com',
          password: 'admin123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie. Token JWT valide retourné.',
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'uuid-1234-5678-9012',
        email: 'marie.nguema@digifaz.com',
        fullName: 'Marie Nguema',
        role: 'user',
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect, ou compte suspendu/inactif',
    example: {
      statusCode: 401,
      message: 'Email ou mot de passe incorrect',
      error: 'Unauthorized',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Données de connexion invalides (validation échouée)',
    example: {
      statusCode: 400,
      message: ['Email invalide', 'Mot de passe requis'],
      error: 'Bad Request',
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Profil utilisateur connecté',
    description: `
🔒 **Endpoint protégé** - Nécessite un token JWT valide

Retourne les informations du profil de l'utilisateur actuellement connecté.

**Utilisation :**
1. Se connecter avec \`POST /auth/login\` pour obtenir un token
2. Ajouter le token dans le header : \`Authorization: Bearer <token>\`
3. Appeler cet endpoint pour récupérer le profil

**Cas d'usage :**
- Affichage du profil utilisateur dans l'interface
- Vérification de l'état de la session
- Récupération des rôles et permissions
- Test de l'authentification JWT

**Note :** Si le token est expiré ou invalide, une erreur 401 sera retournée.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
    example: {
      userId: 'uuid-1234-5678-9012',
      email: 'marie.nguema@digifaz.com',
      role: 'user',
      fullName: 'Marie Nguema',
      iat: 1642000000,
      exp: 1642086400,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant, invalide ou expiré',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  getProfile(@Request() req: { user: any }) {
    return req.user;
  }
}
