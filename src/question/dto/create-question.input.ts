import { InputType, Field } from "@nestjs/graphql";
import { CreateAnswerInput } from "@ent/answer/dto/create-answer.input";
import {
  IsNotEmpty,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
} from "class-validator";

@InputType()
export class CreateQuestionInput {
  constructor(
    question: string,
    singleAnswer: boolean,
    multipleAnswer: boolean,
    sorting: boolean,
    plainText: boolean,
    answers: CreateAnswerInput[],
    quizId?: string
  ) {
    this.question = question;
    this.singleAnswer = singleAnswer;
    this.multipleAnswer = multipleAnswer;
    this.sorting = sorting;
    this.plainText = plainText;
    this.answers = answers;
    this.quizId = quizId;
  }

  @Field()
  @IsNotEmpty()
  @IsString()
  question: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  singleAnswer: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  multipleAnswer: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  sorting: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  plainText: boolean;

  @Field(() => [CreateAnswerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  answers: CreateAnswerInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  quizId: string;
}
