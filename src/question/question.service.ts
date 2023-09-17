import { Injectable } from '@nestjs/common';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private questionRepository: Repository<Question>) {}
  create(createQuestionInput: CreateQuestionInput) {
    return 'This action adds a new question';
  }

  findAll() {
    return `This action returns all question`;
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
