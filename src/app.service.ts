import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  goTo(): string {
    return 'Go to: localhost:3000/graphql';
  }
}
