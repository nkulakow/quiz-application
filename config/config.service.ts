import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>("HOST");
  }

  get port(): number {
    return this.configService.get<number>("PORT");
  }

  get username(): string {
    return this.configService.get<string>("USERNAME");
  }

  get password(): string {
    return this.configService.get<string>("PASSWORD");
  }

  get database(): string {
    return this.configService.get<string>("DATABASE");
  }

  get entities(): string {
    return this.configService.get<string>("ENTITIES");
  }

  get synchronize(): boolean {
    return this.configService.get<boolean>("SYNCHRONIZE");
  }
}
