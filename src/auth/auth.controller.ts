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
import {
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/forgot-password.dto';
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
          email: 'test@test.com',
          password: 'P@ssword',
        },
      },
      admin: {
        summary: 'Administrateur',
        description: "Connexion d'un administrateur",
        value: {
          email: 'admin@digifaz.com',
          password: 'P@ssword',
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
  async getProfile(@Request() req: { user: any }) {
    return await this.authService.getProfile(req.user.userId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demande de réinitialisation de mot de passe',
    description: `
🔓 **Endpoint public** - Accessible sans authentification

Initie le processus de récupération de mot de passe en envoyant un code OTP.

**Processus de sécurité :**
1. Vérification de l'existence de l'utilisateur
2. Invalidation des anciens codes non utilisés
3. Génération d'un code OTP à 6 chiffres (validité 10 minutes)
4. Envoi par SMS (priorité) ou email selon disponibilité

**Politique de sécurité :**
- Même réponse que l'email existe ou non (protection contre l'énumération)
- Un seul OTP actif par utilisateur à la fois
- Expiration automatique après 10 minutes

**Méthodes d'envoi (par priorité) :**
1. 📱 SMS si numéro de téléphone disponible
2. 📧 Email si pas de téléphone

**Exemple d'utilisation :**
\`\`\`json
{
  "email": "user@digifaz.com"
}
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: "Demande traitée (que l'email existe ou non)",
    example: {
      message: 'Si cet email existe, un code de vérification a été envoyé',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email invalide (validation échouée)',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérification du code OTP',
    description: `
🔓 **Endpoint public** - Accessible sans authentification

Valide le code OTP reçu et retourne un token de réinitialisation temporaire.

**Processus de validation :**
1. Vérification du code OTP (6 chiffres)
2. Contrôle de l'expiration (10 minutes max)
3. Vérification du nombre de tentatives (5 max)
4. Génération d'un token de réinitialisation (validité 5 minutes)

**Sécurités implémentées :**
- Maximum 5 tentatives par OTP
- Token de réinitialisation temporaire (5 minutes)
- Invalidation automatique après usage
- Protection contre le brute force

**Étape suivante :**
Utiliser le \`resetToken\` reçu avec \`POST /auth/reset-password\`

**Exemple d'utilisation :**
\`\`\`json
{
  "email": "user@digifaz.com",
  "otp": "123456"
}
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP validé avec succès, token de réinitialisation fourni',
    example: {
      resetToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
      message:
        'Code vérifié. Vous pouvez maintenant réinitialiser votre mot de passe',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Code OTP invalide, expiré ou trop de tentatives',
  })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ resetToken: string; message: string }> {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialisation du mot de passe',
    description: `
🔓 **Endpoint public** - Accessible sans authentification

Finalise la réinitialisation du mot de passe avec le token temporaire.

**Processus de réinitialisation :**
1. Validation du token de réinitialisation (5 minutes max)
2. Vérification de la correspondance des mots de passe
3. Application des règles de complexité
4. Hachage sécurisé et mise à jour
5. Invalidation du token utilisé

**Règles de mot de passe :**
- Minimum 8 caractères, maximum 50
- Au moins 1 minuscule, 1 majuscule, 1 chiffre
- Au moins 1 caractère spécial (@$!%*?&)

**Sécurités :**
- Token à usage unique (invalidé après utilisation)
- Expiration rapide du token (5 minutes)
- Hachage bcrypt avec salt rounds élevé

**Exemple d'utilisation :**
\`\`\`json
{
  "resetToken": "a1b2c3d4e5f6...",
  "newPassword": "NouveauMotDePasse123*",
  "confirmPassword": "NouveauMotDePasse123*"
}
\`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
    example: {
      message: 'Mot de passe réinitialisé avec succès',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token invalide/expiré ou mots de passe non conformes',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
