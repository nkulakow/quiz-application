import { InputType, Field } from '@nestjs/graphql';
import { UpdateAnswerInput } from '@ent/answer/dto/update-answer.input';
import { CreateAnswerInput } from '@ent/answer/dto/create-answer.input';

@InputType()
export class UpdateQuestionInput {
  @Field()
  id: string;
  @Field({ nullable: true })
  question: string;
  @Field({ nullable: true })
  singleAnswer: boolean;
  @Field({ nullable: true })
  multipleAnswer: boolean;
  @Field({ nullable: true })
  sorting: boolean;
  @Field({ nullable: true })
  plainText: boolean;

  @Field(() => [UpdateAnswerInput], { nullable: true })
  answers: UpdateAnswerInput[];

  @Field(() => [CreateAnswerInput], { nullable: true })
  newAnswers: CreateAnswerInput[];

  @Field(() => [String], { nullable: true })
  deleteAnswers: string[];
}
