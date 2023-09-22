import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionModule } from './question/question.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';;
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerModule } from './answer/answer.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [QuestionModule, AnswerModule, QuizModule, GraphQLModule.forRoot(
    {driver: ApolloDriver, autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),}
  ),
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'mypassword',
  database: 'quizapp',
  entities: ["dist/**/*.entity{.ts,.js}"],
  synchronize: true,
}),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

