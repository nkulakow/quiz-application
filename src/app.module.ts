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
import { ConfigModule, ConfigService } from "@nestjs/config";
import dbConfig from "src/config/db.config";
import { DataSource } from "typeorm";
import { addTransactionalDataSource } from "typeorm-transactional";
import { AnswerSubmitterModule } from './answer-submitter/answer-submitter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
      envFilePath: [`.env`],
    }),
    QuestionModule,
    AnswerModule,
    QuizModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql-schema.gql"),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get("database")),
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error("Invalid options passed");
        }

        return addTransactionalDataSource(new DataSource(options));
      },
      inject: [ConfigService],
    }),
    AnswerSubmitterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
