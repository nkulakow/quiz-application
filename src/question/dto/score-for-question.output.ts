import { ObjectType, Field} from '@nestjs/graphql';
import { AnswerForScoreOutput } from '@src/answer/dto/answer-for-score.output';

@ObjectType()
export class ScoreForQuestionOutput {
  @Field()
  id: string;
  @Field()
  question: string;
  @Field()
  answered: boolean;
  @Field()
  correct: boolean;
  @Field(()=>[AnswerForScoreOutput], {nullable: true})
  givenAnswers: AnswerForScoreOutput[];
  @Field(()=>[AnswerForScoreOutput])
  correctAnswers: AnswerForScoreOutput[];
  
}
