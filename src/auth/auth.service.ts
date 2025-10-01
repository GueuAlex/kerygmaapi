import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  User,
  UserStatus,
} from '../modules/users/entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import {
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/forgot-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { NotificationService } from './services/notification.service';
import { RolesService } from '../modules/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private rolesService: RolesService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, fullName, phone, defaultRole } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hash du mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Assigner automatiquement le rôle avancé correspondant
    try {
      await this.assignDefaultAdvancedRole(savedUser.id, defaultRole || 'parishioner');
    } catch (error) {
      console.warn(
        "Erreur lors de l'assignation du rôle avancé:",
        error instanceof Error ? error.message : 'Erreur inconnue',
      );
    }

    // Recuperer l'utilisateur avec ses roles pour la reponse
    const userWithRoles = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    // Extraire les roles et permissions
    const roles = userWithRoles?.userRoles?.map((ur) => ur.role.name) || [];
    const allPermissions = userWithRoles?.userRoles?.flatMap((ur) => {
      const rolePermissions = ur.role.permissions;
      if (!rolePermissions || typeof rolePermissions !== 'object') {
        return [];
      }
      return Object.entries(rolePermissions).flatMap(([module, actions]) => {
        if (Array.isArray(actions)) {
          return actions.map((action) => `${module}.${action}`);
        }
        return [];
      });
    }) || [];
    const permissions = [...new Set(allPermissions)];

    // Générer le token JWT
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        status: savedUser.status,
        roles,
        permissions,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Trouver l'utilisateur avec le mot de passe et ses roles
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'status'],
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le statut de l'utilisateur
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException(
        "Compte suspendu. Contactez l'administrateur",
      );
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Compte inactif. Activez votre compte');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Extraire les roles et permissions
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    const allPermissions = user.userRoles?.flatMap((ur) => {
      const rolePermissions = ur.role.permissions;
      if (!rolePermissions || typeof rolePermissions !== 'object') {
        return [];
      }
      return Object.entries(rolePermissions).flatMap(([module, actions]) => {
        if (Array.isArray(actions)) {
          return actions.map((action) => `${module}.${action}`);
        }
        return [];
      });
    }) || [];
    const permissions = [...new Set(allPermissions)];

    // Générer le token JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles,
        permissions,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Extraire les roles et permissions
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    const allPermissions = user.userRoles?.flatMap((ur) => {
      const rolePermissions = ur.role.permissions;
      if (!rolePermissions || typeof rolePermissions !== 'object') {
        return [];
      }
      return Object.entries(rolePermissions).flatMap(([module, actions]) => {
        if (Array.isArray(actions)) {
          return actions.map((action) => `${module}.${action}`);
        }
        return [];
      });
    }) || [];
    const permissions = [...new Set(allPermissions)];

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      status: user.status,
      roles,
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'phone', 'fullName'],
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non pour la sécurité
      return {
        message: 'Si cet email existe, un code de vérification a été envoyé',
      };
    }

    // Invalider les anciens OTP non utilisés
    await this.passwordResetRepository.update(
      { email, isUsed: false },
      { isUsed: true },
    );

    // Générer un OTP à 6 chiffres
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder l'OTP
    const passwordReset = this.passwordResetRepository.create({
      email,
      otp,
      otpExpiresAt,
      attempts: 0,
    });

    await this.passwordResetRepository.save(passwordReset);

    // Envoyer l'OTP (priorité au téléphone si disponible)
    if (user.phone) {
      await this.notificationService.sendOtpBySms(user.phone, otp);
    } else {
      await this.notificationService.sendOtpByEmail(email, otp);
    }

    return {
      message: 'Si cet email existe, un code de vérification a été envoyé',
    };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ resetToken: string; message: string }> {
    const { email, otp } = verifyOtpDto;

    // Chercher l'OTP valide
    const passwordReset = await this.passwordResetRepository.findOne({
      where: {
        email,
        otp,
        isUsed: false,
        otpExpiresAt: MoreThan(new Date()),
      },
    });

    if (!passwordReset) {
      // Incrémenter les tentatives si l'OTP existe mais est incorrect
      await this.passwordResetRepository.update(
        { email, isUsed: false },
        { attempts: () => 'attempts + 1' },
      );

      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    // Vérifier le nombre de tentatives (max 5)
    if (passwordReset.attempts >= 5) {
      await this.passwordResetRepository.update(
        { id: passwordReset.id },
        { isUsed: true },
      );
      throw new BadRequestException(
        'Trop de tentatives. Demandez un nouveau code',
      );
    }

    // Générer un token de réinitialisation temporaire (5 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Mettre à jour avec le token
    await this.passwordResetRepository.update(
      { id: passwordReset.id },
      { resetToken, tokenExpiresAt },
    );

    return {
      resetToken,
      message:
        'Code vérifié. Vous pouvez maintenant réinitialiser votre mot de passe',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { resetToken, newPassword, confirmPassword } = resetPasswordDto;

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe et sa confirmation ne correspondent pas',
      );
    }

    // Chercher le token valide
    const passwordReset = await this.passwordResetRepository.findOne({
      where: {
        resetToken,
        isUsed: false,
        tokenExpiresAt: MoreThan(new Date()),
      },
    });

    if (!passwordReset) {
      throw new BadRequestException(
        'Token de réinitialisation invalide ou expiré',
      );
    }

    // Trouver l'utilisateur
    const user = await this.userRepository.findOne({
      where: { email: passwordReset.email },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await this.userRepository.update(
      { id: user.id },
      { password: hashedPassword },
    );

    // Marquer le token comme utilisé
    await this.passwordResetRepository.update(
      { id: passwordReset.id },
      { isUsed: true },
    );

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  /**
   * Assigne automatiquement un rôle avancé basé sur le rôle enum
   */
  private async assignDefaultAdvancedRole(
    userId: string,
    roleName: string,
  ): Promise<void> {
    // Rôles disponibles dans le système avancé
    const validRoles = [
      'super_admin',
      'parish_manager',
      'priest',
      'treasurer',
      'secretary',
      'volunteer',
      'parishioner',
    ];

    const advancedRoleName = validRoles.includes(roleName)
      ? roleName
      : 'parishioner';

    try {
      // Chercher le rôle avancé par nom
      const roles = await this.rolesService.findAllRoles();
      const targetRole = roles.find((role) => role.name === advancedRoleName);

      if (targetRole) {
        // Assigner le rôle avancé
        await this.rolesService.assignRoleToUser(userId, targetRole.id);
      }
    } catch (error) {
      // Si les rôles avancés n'existent pas encore, les créer d'abord
      const isNotFoundError =
        (error instanceof Error && error.message.includes('non trouvé')) ||
        (error && typeof error === 'object' && 'status' in error && error.status === 404);

      if (isNotFoundError) {
        await this.rolesService.seedDefaultRoles();
        // Retry l'assignation
        const roles = await this.rolesService.findAllRoles();
        const targetRole = roles.find((role) => role.name === advancedRoleName);
        if (targetRole) {
          await this.rolesService.assignRoleToUser(userId, targetRole.id);
        }
      }
    }
  }
}
