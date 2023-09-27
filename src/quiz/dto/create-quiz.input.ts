import { InputType, Field } from '@nestjs/graphql';
import { CreateQuestionInput } from '@ent/question/dto/create-question.input';

@InputType()
export class CreateQuizInput {
  @Field()
  name: string;

  @Field(() => [CreateQuestionInput])
  questions: CreateQuestionInput[];
}
