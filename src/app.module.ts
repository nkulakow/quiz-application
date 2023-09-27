import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { QuestionModule } from "./question/question.module";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { ApolloDriver } from "@nestjs/apollo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnswerModule } from "./answer/answer.module";
import { QuizModule } from "./quiz/quiz.module";
import { MyConfigModule } from "../config/config.module";
import { AppConfigService } from "../config/config.service";

@Module({
  imports: [
    MyConfigModule,
    QuestionModule,
    AnswerModule,
    QuizModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql-schema.gql"),
    }),
    TypeOrmModule.forRootAsync({
      imports: [MyConfigModule], // Import the config module
      useFactory: (configService: AppConfigService) => ({
        type: "postgres",
        host: configService.host,
        port: configService.port,
        username: configService.username,
        password: configService.password,
        database: configService.database,
        entities: [configService.entities], // Note that entities should be an array
        synchronize: configService.synchronize,
      }),
      inject: [AppConfigService], // Inject the AppConfigService
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
  exports: [AppConfigService],
})
export class AppModule {}
