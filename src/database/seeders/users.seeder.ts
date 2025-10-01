import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/roles/entities/user-role.entity';
import { UserHasRole } from '../../modules/roles/entities/user-has-role.entity';

export class UsersSeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const userRoleRepository = dataSource.getRepository(UserRole);
    const userHasRoleRepository = dataSource.getRepository(UserHasRole);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('P@ssword', salt);

    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@test.com',
        password: hashedPassword,
        fullName: 'Utilisateur Test',
        phone: '+237690000000',
        status: UserStatus.ACTIVE,
        roles: ['super_admin'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@digifaz.com',
        password: hashedPassword,
        fullName: 'Administrateur Systeme',
        phone: '+237690000001',
        status: UserStatus.ACTIVE,
        roles: ['super_admin'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'priest@digifaz.com',
        password: hashedPassword,
        fullName: 'Pere Jean Baptiste',
        phone: '+237690000002',
        status: UserStatus.ACTIVE,
        roles: ['priest'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'manager@digifaz.com',
        password: hashedPassword,
        fullName: 'Gestionnaire Paroisse',
        phone: '+237690000003',
        status: UserStatus.ACTIVE,
        roles: ['parish_manager'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'treasurer@digifaz.com',
        password: hashedPassword,
        fullName: 'Tresorier Paroisse',
        phone: '+237690000004',
        status: UserStatus.ACTIVE,
        roles: ['treasurer'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'secretary@digifaz.com',
        password: hashedPassword,
        fullName: 'Secretaire Paroisse',
        phone: '+237690000005',
        status: UserStatus.ACTIVE,
        roles: ['secretary'],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'user@digifaz.com',
        password: hashedPassword,
        fullName: 'Fidele Paroisse',
        phone: '+237690000006',
        status: UserStatus.ACTIVE,
        roles: ['volunteer'],
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const { roles, ...userDataWithoutRoles } = userData;
        const user = userRepository.create(userDataWithoutRoles);
        await userRepository.save(user);
        console.log(`Utilisateur cree: ${userData.email}`);

        for (const roleName of roles) {
          const role = await userRoleRepository.findOne({
            where: { name: roleName },
          });

          if (role) {
            const userHasRole = userHasRoleRepository.create({
              user_id: user.id,
              role_id: role.id,
            });
            await userHasRoleRepository.save(userHasRole);
            console.log(`Role ${roleName} assigne a ${userData.email}`);
          } else {
            console.log(`Role ${roleName} introuvable pour ${userData.email}`);
          }
        }
      } else {
        console.log(`Utilisateur existe deja: ${userData.email}`);
      }
    }
  }
}
