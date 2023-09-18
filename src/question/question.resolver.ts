import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { CreateAnswerInput } from 'src/answer/dto/create-answer.input';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(protected readonly questionService: QuestionService) {}

  @Mutation(() => Question, { name: 'createQuestion' })
  createQuestion(@Args('createQuestionInput') createQuestionInput: CreateQuestionInput, @Args('answersInput',  { type: () => [CreateAnswerInput] }) answersInput: CreateAnswerInput[]) {
    let valueToReturn = this.questionService.create(createQuestionInput, answersInput);
    console.log("valueToReturn", valueToReturn);
    return valueToReturn;
  }

  @Query(() => [Question], { name: 'question' })
  findAll() {
    return this.questionService.findAll();
  }

  @Query(() => Question, { name: 'question' })
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

  
}

