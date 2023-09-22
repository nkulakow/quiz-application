import { Injectable } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from '@src/question/entities/question.entity'
import { Repository } from 'typeorm';
import { CreateQuestionInput } from '@src/question/dto/create-question.input';
import { QuestionService } from '@src/question/question.service';
import { Answer } from '@src/answer/entities/answer.entity';

@Injectable()
export class QuizService {
  constructor(@InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
  @InjectRepository(Question) private questionRepository: Repository<Question>,
  @InjectRepository(Answer) private answerRepository: Repository<Answer>) {}
  
  async create(createQuizInput: CreateQuizInput) {
    let quizToCreate = this.quizRepository.create(createQuizInput);
    let createdQuiz = await this.quizRepository.save(quizToCreate);
    let quizId = createdQuiz.id;
    let questionsInput = createQuizInput.questions;
    createdQuiz.questions = [];
    const QuestionServiceInstance = new QuestionService(this.questionRepository, this.answerRepository);
    for (let questionInput of questionsInput){
      questionInput.quizId = quizId;
      let question = await QuestionServiceInstance.create(questionInput);
      createdQuiz.questions.push(question);
    }
    return createdQuiz;
  }

  findAll() {
    return `This action returns all quiz`;
  }

  findOne(id: string) {
    return `This action returns a #${id} quiz`;
  }

  update(id: string, updateQuizInput: UpdateQuizInput) {
    return `This action updates a #${id} quiz`;
  }

  remove(id: string) {
    return `This action removes a #${id} quiz`;
  }
}
