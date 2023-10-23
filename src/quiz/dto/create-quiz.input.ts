import { InputType, Field } from "@nestjs/graphql";
import { CreateQuestionInput } from "@ent/question/dto/create-question.input";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

@InputType()
export class CreateQuizInput {
  constructor(name: string, questions: CreateQuestionInput[]) {
    this.name = name;
    this.questions = questions;
  }

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => [CreateQuestionInput])
  @IsNotEmpty()
  @ValidateNested({ each: true })
  questions: CreateQuestionInput[];
}
