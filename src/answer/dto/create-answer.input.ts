import { InputType, Int, Field } from "@nestjs/graphql";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

@InputType()
export class CreateAnswerInput {
  constructor(
    answer: string,
    correct: boolean,
    number: number,
    questionId?: string
  ) {
    this.answer = answer;
    this.correct = correct;
    this.number = number;
    this.questionId = questionId;
  }

  @Field()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  correct: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  number: number;

  @Field({ nullable: true })
  questionId: string;
}
