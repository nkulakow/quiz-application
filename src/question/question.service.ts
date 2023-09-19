import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnswerInput } from 'src/answer/dto/create-answer.input';
import { Answer } from '../../src/answer/entities/answer.entity';
import { AnswerService } from '../../src/answer/answer.service';
import { UpdateAnswerInput } from '../../src/answer/dto/update-answer.input';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private questionRepository: Repository<Question>, 
  @InjectRepository(Answer) private answerRepository: Repository<Answer>) {}
  
  async create(createQuestionInput: CreateQuestionInput, answersInput: CreateAnswerInput[]) {
    let questionToCreate = this.questionRepository.create(createQuestionInput);
    let createdQuestion = await this.questionRepository.save(questionToCreate);
    let questionId = createdQuestion.id;
    createdQuestion.answers = [];
    const AnswerServiceInstance = new AnswerService(this.answerRepository);
    for (let answerInput of answersInput){
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

  async update( updateQuestionInput: UpdateQuestionInput, updateAnswersInput: UpdateAnswerInput[]) {
    if (!this.findOne(updateQuestionInput.id)) {
      throw new NotFoundException(`Question with id ${updateQuestionInput.id} not found`);
    }
    try{
      await this.updateAnswers(updateAnswersInput, updateQuestionInput.id);
    }
    catch (e){throw e;}
    let questionToUpdate = this.questionRepository.create(updateQuestionInput);
    this.questionRepository.save(questionToUpdate);
    return this.findOne(updateQuestionInput.id);
  }
  
  private async updateAnswers(updateAnswersInput: UpdateAnswerInput[], questionId: string){
    const AnswerServiceInstance = new AnswerService(this.answerRepository);
    for (let answerInput of updateAnswersInput) {
      let updatedAnswer = await AnswerServiceInstance.findOne(answerInput.id);
      if (updatedAnswer.questionId !== questionId) {
        throw new AnswerDoesNotBelongToQuestionException(`Answer with ID ${answerInput.id} does not belong to question with ID ${questionId}`);
      }
    }
    for (let answerInput of updateAnswersInput){
      await AnswerServiceInstance.update(answerInput);
    }
  }
  
  async remove(id: string) {
    let questionToRemove = await this.findOne(id);
    if (!questionToRemove) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    const answersToRemove = await this.answerRepository.find({ where : {question: questionToRemove} });
    await this.answerRepository.remove(answersToRemove);
    await this.questionRepository.remove(questionToRemove); 
    questionToRemove.id = id;
    return questionToRemove;
  }
  
  async checkAnswer(id:string, givenAnswerIds: string[]){
    let question = await this.findOne(id);
    if (question.singleAnswer){
      return this.checkSingleAnswer(question, givenAnswerIds[0]);
    }
    if (question.multipleAnswer){
      return this.checkMultipleAnswer(question, givenAnswerIds);
    }
    if (question.sorting){
      return this.checkSortingAnswer(question, givenAnswerIds);
    }
  }
  
  private checkSingleAnswer(question:Question, answerId: string){
    let correctAnswer = question.answers.find(answer => answer.correct);
    return correctAnswer.id === answerId;
  }
  
  private checkMultipleAnswer(question:Question, answerIds: string[]){
    let correctAnswers = question.answers.filter(answer => answer.correct);
    let correctAnswerIds = correctAnswers.map(answer => answer.id);
    if (correctAnswerIds.length !== answerIds.length){
      return false;
    }
    for (let answerId of answerIds){
      if (!correctAnswerIds.includes(answerId)){
        return false;
      }
    }
    return true;
  }
  
  private async checkSortingAnswer(question:Question, answerIds: string[]){
    let Answers = question.answers.sort((a,b) => a.number - b.number);
    console.log(Answers);
    for (let i = 0; i < Answers.length; i++){
      if (Answers[i].id !== answerIds[i]){
        return false;
      }
    }
    return true;
  }
  
}

export class AnswerDoesNotBelongToQuestionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnswerDoesNotBelongToQuestionException';
  }
}