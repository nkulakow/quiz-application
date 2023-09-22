import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from '@src/question/entities/question.entity'
import { Repository } from 'typeorm';
import { QuestionService } from '@src/question/question.service';
import { Answer } from '@src/answer/entities/answer.entity';
import { GiveAnswerInput } from '@src/question/dto/give-answers.input';
import { GetScoreOutput } from './dto/get-score.output';
import { ScoreForQuestionOutput } from '@src/question/dto/score-for-question.output';
import { AnswerForScoreOutput } from '@src/answer/dto/answer-for-score.output';

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
    return this.quizRepository.find({ relations: ["questions", "questions.answers"] });
  }

  findOne(id: string) {
    return this.quizRepository.findOne({ where: {id: id}, relations: ["questions", "questions.answers"] });
  }

  update(updateQuizInput: UpdateQuizInput) {
    if (!this.findOne(updateQuizInput.id)) {
      throw new NotFoundException(`Quiz with id ${updateQuizInput.id} not found`);
    }
    let quizToUpdate = this.quizRepository.create(updateQuizInput);
    return this.quizRepository.save(quizToUpdate);
  }

  async remove(id: string) {
    let quizToRemove = await this.findOne(id);
    if (!quizToRemove) {
      throw new NotFoundException(`Quiz with id ${id} not found`);
    }
    const questionsToRemove = quizToRemove.questions;
    const QuestionServiceInstance = new QuestionService(this.questionRepository, this.answerRepository);
    for (let question of questionsToRemove) {
      await QuestionServiceInstance.remove(question.id);
    }
    await this.quizRepository.remove(quizToRemove);
    quizToRemove.id = id;
    return quizToRemove;
  }
  
  async submitAnswers(id: string, givenAnswers: GiveAnswerInput[]) {
    let score = 0;
    const QuestionServiceInstance = new QuestionService(this.questionRepository, this.answerRepository);
    let getScoreOutput = new GetScoreOutput();
    getScoreOutput.quizId = id;
    getScoreOutput.questions = [];
    let answeredQuestionsIds = [];
    for (let givenAnswer of givenAnswers){
      const scoreForQuestion = await QuestionServiceInstance.checkAnswer(givenAnswer);
      if (scoreForQuestion.correct) score++;
      console.log(scoreForQuestion);
      getScoreOutput.questions.push(scoreForQuestion);
      answeredQuestionsIds.push(givenAnswer.questionId);
    }
    getScoreOutput.score = score;
    let quiz = await this.findOne(id);
    getScoreOutput.score = (score*100)/quiz.questions.length;
    for (let question of quiz.questions){
      if (answeredQuestionsIds.includes(question.id)) continue;
      else{
        console.log("AAAAAAAAA", question.id, answeredQuestionsIds);
        let scoreForQuestion = new ScoreForQuestionOutput();
        scoreForQuestion.id = question.id;
        scoreForQuestion.answered = false;
        scoreForQuestion.correct = false;
        scoreForQuestion.givenAnswers = [];
        scoreForQuestion.question = question.question;
        let correctAnswers = QuestionServiceInstance.getCorrectAnswers(question); 
        scoreForQuestion.correctAnswers = []; 
        console.log("BBAAA", correctAnswers);
        for (let answer of correctAnswers){
          scoreForQuestion.correctAnswers.push(new AnswerForScoreOutput(answer.id, answer.answer));
        }
       
        getScoreOutput.questions.push(scoreForQuestion);
      }
    }
    return getScoreOutput;
    
  }
}
