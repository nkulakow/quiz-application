import { Injectable } from '@nestjs/common';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnswerInput } from 'src/answer/dto/create-answer.input';
import { Answer } from 'src/answer/entities/answer.entity';
import { AnswerService } from 'src/answer/answer.service';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private questionRepository: Repository<Question>, 
  @InjectRepository(Answer) private answerRepository: Repository<Answer>) {}
  
  async create(createQuestionInput: CreateQuestionInput, answersInput: CreateAnswerInput[]) {
    let questionToCreate = this.questionRepository.create(createQuestionInput);
    let createdQuestion = await this.questionRepository.save(questionToCreate);
    let questionId = createdQuestion.id;
    createdQuestion.answers = [];
    for (let answerInput of answersInput){
      let AnswerServiceInstance = new AnswerService(this.answerRepository);
      answerInput.questionId = questionId;
      let answer = await AnswerServiceInstance.create(answerInput);
      createdQuestion.answers.push(answer);
    }
    return createdQuestion;
  }

  findAll() {
    return this.questionRepository.find({ relations: ["answers"] });
  }

  findOne(id: string) : Promise<Question> {
    return this.questionRepository.findOne({where : {id: id},  relations: ["answers"] });
  }

  update( updateQuestionInput: UpdateQuestionInput) {
    return `This action updates a #${updateQuestionInput.id} question`;
  }

  remove(id: string) {
    return `This action removes a #${id} question`;
  }
  
  checkAnswer(id:string, answer: string|string[]){
    let question = this.findOne(id);
    return `This action checks the answer`;
  }
  
  private checkSingleAnswer(id:string, answer: string[]){
    let question = this.findOne(id);
    return `This action checks the answer`;
  }
  
}
