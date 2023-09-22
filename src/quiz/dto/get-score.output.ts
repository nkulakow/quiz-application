import { ObjectType, Field, Float} from '@nestjs/graphql';
import { ScoreForQuestionOutput } from '@ent/question/dto/score-for-question.output';

@ObjectType()
export class GetScoreOutput {
  @Field()
  quizId: string;
  @Field(()=>Float)
  score: number;
  @Field(()=>[ScoreForQuestionOutput])
  questions: ScoreForQuestionOutput[];
  
}
