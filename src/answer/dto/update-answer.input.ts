import { InputType, Field, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

@InputType()
export class UpdateAnswerInput {
  constructor(
    id: string,
    answer: string,
    correct: boolean,
    number: number,
    questionId?: string
  ) {
    this.id = id;
    this.answer = answer;
    this.correct = correct;
    this.number = number;
    this.questionId = questionId;
  }

  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  correct: boolean;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  number: number;

  @Field({ nullable: true })
  questionId: string;
}
