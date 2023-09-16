import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';;
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from './project/project.module';


@Module({
  imports: [EmployeeModule, ProjectModule, GraphQLModule.forRoot(
    {driver: ApolloDriver, autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),}
  ),
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'mypassword',
  database: 'test',
  entities: ["dist/**/*.entity{.ts,.js}"],
  synchronize: true,
}),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
