import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '@src/answer/entities/answer.entity';
import { AnswerService } from '@src/answer/answer.service';
import { UpdateAnswerInput } from '@src/answer/dto/update-answer.input';
import { GiveAnswerInput } from './dto/give-answers.input';
import { ScoreForQuestionOutput } from './dto/score-for-question.output';
import { AnswerForScoreOutput } from '@src/answer/dto/answer-for-score.output';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private questionRepository: Repository<Question>, 
  @InjectRepository(Answer) private answerRepository: Repository<Answer>) {}
  
  async create(createQuestionInput: CreateQuestionInput) {
    let questionToCreate = this.questionRepository.create(createQuestionInput);
    let createdQuestion = await this.questionRepository.save(questionToCreate);
    let questionId = createdQuestion.id;
    let answersInput = createQuestionInput.answers;
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

  async update( updateQuestionInput: UpdateQuestionInput) {
    if (!this.findOne(updateQuestionInput.id)) {
      throw new NotFoundException(`Question with id ${updateQuestionInput.id} not found`);
    }
    let updateAnswersInput = updateQuestionInput.answers;
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
    const answersToRemove = questionToRemove.answers;
    await this.answerRepository.remove(answersToRemove);
    await this.questionRepository.remove(questionToRemove); 
    questionToRemove.id = id;
    return questionToRemove;
  }
  
  async checkAnswer(givenAnswer: GiveAnswerInput){
    let question = await this.findOne(givenAnswer.questionId);
    if (question.singleAnswer){
      return this.checkSingleAnswer(question, givenAnswer.answers[0]);
    }
    if (question.multipleAnswer){
      return this.checkMultipleAnswer(question, givenAnswer.answers);
    }
    if (question.sorting){
      return this.checkSortingAnswer(question, givenAnswer.answers);
    }
    if (question.plainText){
      return this.checkPlainTextAnswer(question, givenAnswer.answers[0]);
    }
  }
  
  private checkSingleAnswer(question:Question, answerId: string){
    let correctAnswer = question.answers.find(answer => answer.correct);
    let givenAnswers = [question.answers.find(answer => answer.id === answerId).id];
    let scoreForQuestion = this.createScoreForQuestionOutput(question, correctAnswer.id === answerId, [correctAnswer.id], givenAnswers);
    return scoreForQuestion;
  }
  
  private checkMultipleAnswer(question:Question, answerIds: string[]){
    let correctAnswers = question.answers.filter(answer => answer.correct);
    let correctAnswerIds = correctAnswers.map(answer => answer.id);
    let isCorrect = true;
    if (correctAnswerIds.length !== answerIds.length){
      isCorrect = false;
    }
    for (let answerId of answerIds){
      if (!correctAnswerIds.includes(answerId)){
        isCorrect = false;
      }
    }
    return this.createScoreForQuestionOutput(question, isCorrect, correctAnswerIds, answerIds);
  }
  
  private async checkSortingAnswer(question:Question, answerIds: string[]){
    let Answers = question.answers.sort((a,b) => a.number - b.number);
    let isCorrect = true;
    for (let i = 0; i < Answers.length; i++){
      if (Answers[i].id !== answerIds[i]){
        isCorrect = false;
      }
    }
    let correctAnswerIds = Answers.map(answer => answer.id);
    return this.createScoreForQuestionOutput(question, isCorrect, correctAnswerIds, answerIds);
  }
  
  private async checkPlainTextAnswer(question:Question, answer: string){
    let correctAnswer = question.answers[0].answer.toLowerCase().trim().replace(/ +/g, ' ').replace(/[.,-]/g, '');
    let trimmedAnswer = answer.toLowerCase().trim().replace(/ +/g, ' ').replace(/[.,-]/g, '');
    let scoreForQuestion = new ScoreForQuestionOutput();
    scoreForQuestion.answered = true;
    scoreForQuestion.correct = correctAnswer === trimmedAnswer;
    scoreForQuestion.id = question.id;
    scoreForQuestion.question = question.question;
    scoreForQuestion.correctAnswers = [new AnswerForScoreOutput(null, question.answers[0].answer)];
    scoreForQuestion.givenAnswers = [new AnswerForScoreOutput(null, answer)];
    return scoreForQuestion;
  }
  
  private createScoreForQuestionOutput(question: Question, correct:boolean, correctAnswersIds: string[], givenAnswersIds: string[]){
    let scoreForQuestion = new ScoreForQuestionOutput();
    scoreForQuestion.answered = true;
    scoreForQuestion.correct = correct;
    scoreForQuestion.id = question.id;
    scoreForQuestion.question = question.question;
    let correctAnswers = [];
    for (let correctAnswerId of correctAnswersIds){
      let correctAnswer = question.answers.find(answer => answer.id === correctAnswerId);
      if (question.sorting){correctAnswers.push(new AnswerForScoreOutput(correctAnswer.id, correctAnswer.answer + ' - ' + correctAnswer.number));}
      else{correctAnswers.push(new AnswerForScoreOutput(correctAnswer.id, correctAnswer.answer));}
    }
    scoreForQuestion.correctAnswers = correctAnswers;
    let givenAnswers = [];
    for (let index:number = 0; index < givenAnswersIds.length; index++){
      let givenAnswer = question.answers.find(answer => answer.id === givenAnswersIds[index]);
      if (question.sorting){givenAnswers.push(new AnswerForScoreOutput(givenAnswer.id, givenAnswer.answer + ' - ' + (index+1)));}
      else{givenAnswers.push(new AnswerForScoreOutput(givenAnswer.id, givenAnswer.answer));}
    }
    scoreForQuestion.givenAnswers = givenAnswers;
    return scoreForQuestion;
  }
 
  
  getCorrectAnswers (question: Question) : Answer[]{
    let correctAnswers: Answer[] = [];
    if (question.plainText){ return question.answers;}
    if (question.sorting) {
      correctAnswers = [...question.answers.sort((a,b) => a.number - b.number)];
      correctAnswers.forEach(answer => answer.answer = answer.answer + ' - ' + answer.number);
      return correctAnswers;
    }
    correctAnswers = question.answers.filter(answer => answer.correct);
    return correctAnswers;
  }
  
}

export class AnswerDoesNotBelongToQuestionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnswerDoesNotBelongToQuestionException';
  }
}