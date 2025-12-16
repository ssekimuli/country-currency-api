// app.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { CountriesModule } from './countries/countries.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    CountriesModule,
  ],
})
export class AppModule {}
