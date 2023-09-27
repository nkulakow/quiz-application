import { InputType, Field } from '@nestjs/graphql';
import { CreateAnswerInput } from '@ent/answer/dto/create-answer.input';

@InputType()
export class CreateQuestionInput {
  @Field()
  question: string;
  @Field({ nullable: true })
  singleAnswer: boolean;
  @Field({ nullable: true })
  multipleAnswer: boolean;
  @Field({ nullable: true })
  sorting: boolean;
  @Field({ nullable: true })
  plainText: boolean;

  @Field(() => [CreateAnswerInput])
  answers: CreateAnswerInput[];

  @Field({ nullable: true })
  quizId: string;
}
