import { InputType, Field } from "@nestjs/graphql";
import { CreateQuestionInput } from "@ent/question/dto/create-question.input";

@InputType()
export class CreateQuizInput {
  constructor(name: string, questions: CreateQuestionInput[]) {
    this.name = name;
    this.questions = questions;
  }

  @Field()
  name: string;

  @Field(() => [CreateQuestionInput])
  questions: CreateQuestionInput[];
}
