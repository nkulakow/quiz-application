import { InputType, Field } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class GiveAnswerInput {
  constructor(questionId: string, answers: string[]) {
    this.questionId = questionId;
    this.answers = answers;
  }

  @Field()
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @Field(() => [String])
  @IsNotEmpty()
  @IsString({ each: true })
  answers: string[];
}
