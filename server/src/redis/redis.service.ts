import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigType } from '@nestjs/config';
import redisConfig from './redis.config';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(redisConfig.KEY)
    private readonly serviceConfig: ConfigType<typeof redisConfig>,
  ) {
    super({ ...serviceConfig });

    this.on('connect', this.handleConnect.bind(this));
    this.on('ready', this.handleReady.bind(this));
    this.on('error', this.handleError.bind(this));
    this.on('close', this.handleClose.bind(this));
    this.on('reconnecting', this.handleReconnecting.bind(this));
    this.on('end', this.handleEnd.bind(this));
  }

  onModuleDestroy() {
    this.disconnect(false);
  }

  private handleConnect() {
    this.logger.log('Redis connecting...', { type: 'REDIS_CONNECTING' });
  }

  private handleReady() {
    this.logger.log('Redis connected!', { type: 'REDIS_CONNECTED' });
  }

  private handleClose() {
    this.logger.warn('Redis disconnected!', { type: 'REDIS_DISCONNECTED' });
  }

  private handleReconnecting() {
    this.logger.log('Redis reconnecting!', { type: 'REDIS_RECONNECTING' });
  }

  private handleEnd() {
    this.logger.warn('Redis connection ended!', { type: 'REDIS_CONN_ENDED' });
  }

  private handleError(err: any) {
    this.logger.error('Redis error occurred', { type: 'REDIS_ERROR', err });
  }
}
