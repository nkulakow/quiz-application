import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { CreateAnswerInput } from 'src/answer/dto/create-answer.input';
import { UpdateAnswerInput } from 'src/answer/dto/update-answer.input';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(protected readonly questionService: QuestionService) {}

  @Mutation(() => Question, { name: 'createQuestion' })
  createQuestion(@Args('createQuestionInput') createQuestionInput: CreateQuestionInput, @Args('answersInput',  { type: () => [CreateAnswerInput] }) answersInput: CreateAnswerInput[]) {
    let valueToReturn = this.questionService.create(createQuestionInput, answersInput);
    console.log("valueToReturn", valueToReturn);
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
  updateQuestion(@Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput, @Args('updateAnswersInput',  { type: () => [UpdateAnswerInput] }) updateAnswersInput: UpdateAnswerInput[]) {
    return this.questionService.update(updateQuestionInput, updateAnswersInput);
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
  
}

