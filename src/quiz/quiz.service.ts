import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizInput } from './dto/create-quiz.input';
import { UpdateQuizInput } from './dto/update-quiz.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from '@src/question/entities/question.entity';
import { Repository } from 'typeorm';
import { QuestionService } from '@src/question/question.service';
import { Answer } from '@src/answer/entities/answer.entity';
import { GiveAnswerInput } from '@src/question/dto/give-answers.input';
import { GetResultOutput } from './dto/get-result.output';
import { ResultForQuestionOutput } from '@src/question/dto/result-for-question.output';
import { AnswerForResultOutput } from '@src/answer/dto/answer-for-result.output';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer) private answerRepository: Repository<Answer>,
  ) {}

  async create(createQuizInput: CreateQuizInput) {
    let quizToCreate = this.quizRepository.create(createQuizInput);
    let createdQuiz = await this.quizRepository.save(quizToCreate);
    let quizId = createdQuiz.id;
    let questionsInput = createQuizInput.questions;
    createdQuiz.questions = [];
    const QuestionServiceInstance = new QuestionService(
      this.questionRepository,
      this.answerRepository,
    );
    for (let questionInput of questionsInput) {
      questionInput.quizId = quizId;
      let question = await QuestionServiceInstance.create(questionInput);
      createdQuiz.questions.push(question);
    }
    return createdQuiz;
  }

  findAll() {
    return this.quizRepository.find({
      relations: ['questions', 'questions.answers'],
    });
  }

  findOne(id: string) {
    return this.quizRepository.findOne({
      where: { id: id },
      relations: ['questions', 'questions.answers'],
    });
  }

  update(updateQuizInput: UpdateQuizInput) {
    if (!this.findOne(updateQuizInput.id)) {
      throw new NotFoundException(
        `Quiz with id ${updateQuizInput.id} not found`,
      );
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
    const QuestionServiceInstance = new QuestionService(
      this.questionRepository,
      this.answerRepository,
    );
    for (let question of questionsToRemove) {
      await QuestionServiceInstance.remove(question.id);
    }
    await this.quizRepository.remove(quizToRemove);
    quizToRemove.id = id;
    return quizToRemove;
  }

  async submitAnswers(id: string, givenAnswers: GiveAnswerInput[]) {
    let score = 0;
    const QuestionServiceInstance = new QuestionService(
      this.questionRepository,
      this.answerRepository,
    );
    let getResultOutput = new GetResultOutput();
    getResultOutput.quizId = id;
    getResultOutput.questions = [];
    let answeredQuestionsIds = [];

    for (let givenAnswer of givenAnswers) await processAnswer(givenAnswer);
    let quiz = await this.findOne(id);
    getResultOutput.score = (score * 100) / quiz.questions.length;
    processUnansweredQuestions(quiz);

    return getResultOutput;

    async function processAnswer(givenAnswer: GiveAnswerInput) {
      const scoreForQuestion =
        await QuestionServiceInstance.checkAnswer(givenAnswer);
      if (scoreForQuestion.correct) score++;
      getResultOutput.questions.push(scoreForQuestion);
      answeredQuestionsIds.push(givenAnswer.questionId);
    }

    async function processUnansweredQuestions(quiz: Quiz) {
      for (let question of quiz.questions) {
        if (!answeredQuestionsIds.includes(question.id)) {
          const scoreForQuestion =
            await createScoreForUnansweredQuestion(question);
          getResultOutput.questions.push(scoreForQuestion);
        }
      }
    }

    async function createScoreForUnansweredQuestion(question: Question) {
      const scoreForQuestion = new ResultForQuestionOutput();
      scoreForQuestion.id = question.id;
      scoreForQuestion.answered = false;
      scoreForQuestion.correct = false;
      scoreForQuestion.givenAnswers = [];
      scoreForQuestion.question = question.question;
      const correctAnswers =
        QuestionServiceInstance.getCorrectAnswers(question);
      scoreForQuestion.correctAnswers = correctAnswers.map(
        (answer) => new AnswerForResultOutput(answer.id, answer.answer),
      );
      return scoreForQuestion;
    }
  }
}
