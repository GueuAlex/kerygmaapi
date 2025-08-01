import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendOtpByEmail(email: string, otp: string): Promise<void> {
    // Simulation de l'envoi d'email
    this.logger.log(`📧 [SIMULATION] Envoi OTP par email à ${email}`);
    this.logger.log(`📧 [SIMULATION] Code OTP: ${otp}`);
    this.logger.log(`📧 [SIMULATION] Sujet: Réinitialisation de votre mot de passe DIGIFAZ`);
    this.logger.log(`📧 [SIMULATION] Corps: Votre code de vérification est: ${otp}. Ce code expire dans 10 minutes.`);
    
    // TODO: Remplacer par l'envoi réel d'email
    // await this.emailService.send({
    //   to: email,
    //   subject: 'Réinitialisation de votre mot de passe DIGIFAZ',
    //   template: 'forgot-password',
    //   context: { otp, expiresIn: '10 minutes' }
    // });
  }

  async sendOtpBySms(phone: string, otp: string): Promise<void> {
    // Simulation de l'envoi de SMS
    this.logger.log(`📱 [SIMULATION] Envoi OTP par SMS au ${phone}`);
    this.logger.log(`📱 [SIMULATION] Code OTP: ${otp}`);
    this.logger.log(`📱 [SIMULATION] Message: DIGIFAZ - Votre code de vérification: ${otp}. Expire dans 10min.`);
    
    // TODO: Remplacer par l'envoi réel de SMS
    // await this.smsService.send({
    //   to: phone,
    //   message: `DIGIFAZ - Votre code de vérification: ${otp}. Expire dans 10min.`
    // });
  }
}