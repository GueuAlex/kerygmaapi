// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './config/typeorm.config';
import databaseConfig from './config/database.config';

// Import des modules métier
// import { UsersModule } from './modules/users/users.module';
// import { ParishesModule } from './modules/parishes/parishes.module';
// import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    // Configuration TypeORM avec factory
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),

    // Modules métier (décommentez selon vos besoins)
    // UsersModule,
    // ParishesModule,
    // AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
