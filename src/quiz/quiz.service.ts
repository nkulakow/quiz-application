import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateQuizInput } from "./dto/create-quiz.input";
import { UpdateQuizInput } from "./dto/update-quiz.input";
import { InjectRepository } from "@nestjs/typeorm";
import { Quiz } from "./entities/quiz.entity";
import { Question } from "@src/question/entities/question.entity";
import { Repository } from "typeorm";
import { QuestionService } from "@src/question/question.service";
import { GiveAnswerInput } from "@src/question/dto/give-answers.input";
import { GetResultOutput } from "./dto/get-result.output";
import { ResultForQuestionOutput } from "@src/question/dto/result-for-question.output";
import { AnswerForResultOutput } from "@src/answer/dto/answer-for-result.output";
import { LengthEqualsZeroException } from "@src/excpetions/length-equals-zero-exception";

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
    private questionService: QuestionService
  ) {}

  async create(createQuizInput: CreateQuizInput) {
    if (createQuizInput.name.length < 1) {
      throw new LengthEqualsZeroException(`Quiz name cannot be empty`);
    }
    let quizToCreate = this.quizRepository.create(createQuizInput);
    let createdQuiz = await this.quizRepository.save(quizToCreate);
    let quizId = createdQuiz.id;
    let questionsInput = createQuizInput.questions;
    createdQuiz.questions = [];
    for (let questionInput of questionsInput) {
      questionInput.quizId = quizId;
      let question = await this.questionService.create(questionInput);
      createdQuiz.questions.push(question);
    }
    return createdQuiz;
  }

  findAll() {
    return this.quizRepository.find({
      relations: ["questions", "questions.answers"],
    });
  }

  findOne(id: string) {
    return this.quizRepository.findOne({
      where: { id: id },
      relations: ["questions", "questions.answers"],
    });
  }

  update(updateQuizInput: UpdateQuizInput) {
    if (!this.findOne(updateQuizInput.id)) {
      throw new NotFoundException(
        `Quiz with id ${updateQuizInput.id} not found`
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
    for (let question of questionsToRemove) {
      await this.questionService.remove(question.id);
    }
    await this.quizRepository.remove(quizToRemove);
    quizToRemove.id = id;
    return quizToRemove;
  }

  async submitAnswers(id: string, givenAnswers: GiveAnswerInput[]) {
    let score = 0;
    let answeredQuestionsIds = [];
    let getResultOutput = new GetResultOutput(id, 0, []);

    for (let givenAnswer of givenAnswers)
      await processAnswer(givenAnswer, this.questionService);
    let quiz = await this.findOne(id);
    getResultOutput.score = (score * 100) / quiz.questions.length;

    processUnansweredQuestions(quiz, this.questionService);

    return getResultOutput;

    async function processAnswer(
      givenAnswer: GiveAnswerInput,
      questionService: QuestionService
    ) {
      const scoreForQuestion = await questionService.checkAnswer(givenAnswer);
      if (scoreForQuestion.correct) score++;
      getResultOutput.questions.push(scoreForQuestion);
      answeredQuestionsIds.push(givenAnswer.questionId);
    }

    async function processUnansweredQuestions(
      quiz: Quiz,
      questionService: QuestionService
    ) {
      for (let question of quiz.questions) {
        if (!answeredQuestionsIds.includes(question.id)) {
          const scoreForQuestion = await createScoreForUnansweredQuestion(
            question,
            questionService
          );
          getResultOutput.questions.push(scoreForQuestion);
        }
      }
    }

    async function createScoreForUnansweredQuestion(
      question: Question,
      questionService: QuestionService
    ) {
      const correctAnswers = questionService.getCorrectAnswers(question);
      const correctAnswersMapped = correctAnswers.map(
        (answer) => new AnswerForResultOutput(answer.id, answer.answer)
      );
      const scoreForQuestion = new ResultForQuestionOutput(
        question.id,
        question.question,
        false,
        false,
        [],
        correctAnswersMapped
      );
      return scoreForQuestion;
    }
  }
}
