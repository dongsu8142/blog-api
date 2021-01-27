import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConnectinService } from './database-connection.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useClass: DatabaseConnectinService
  }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
