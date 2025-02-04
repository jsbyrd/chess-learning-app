import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  providers: [MyGateway],
  imports: [RedisModule],
})
export class GatewayModule {}
