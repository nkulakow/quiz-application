import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { GiveAnswerInput } from './dto/give-answers.input';
import { type } from 'os';
import { ScoreForQuestionOutput } from './dto/score-for-question.output';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(protected readonly questionService: QuestionService) {}

  @Mutation(() => Question, { name: 'createQuestion' })
  createQuestion(@Args('createQuestionInput') createQuestionInput: CreateQuestionInput) {
    let valueToReturn = this.questionService.create(createQuestionInput);
    return valueToReturn;
  }

  @Query(() => [Question], { name: 'getAllQuestions' })
  findAll() {
    return this.questionService.findAll();
  }

  @Query(() => Question, { name: 'getOneQuestion' })
  findOne(@Args('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Mutation(() => Question)
  updateQuestion(@Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput) {
    return this.questionService.update(updateQuestionInput);
  }

  @Mutation(() => Question)
  removeQuestion(@Args('id') id: string) {
    return this.questionService.remove(id);
  }
  
  @ResolveField(() => String, { nullable: true })
  type(@Parent() question: Question): string | null {
    if (question.singleAnswer) {
      return 'Single Answer';
    } else if (question.multipleAnswer) {
      return 'Multiple Answer';
    } else if (question.sorting) {
      return 'Sorting Question';
    } else if (question.plainText) {
      return 'Plain Text Answer';
    } else {
      return null;
    }
  }
  
  @Query(() => ScoreForQuestionOutput, { name: 'checkAnswer' })
  checkAnswer(@Args('givenAnswer') givenAnswer: GiveAnswerInput) {
    return this.questionService.checkAnswer(givenAnswer);
  }
  
}

