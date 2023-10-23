import { Test, TestingModule } from "@nestjs/testing";
import { AnswerSubmitterService } from "./answer-submitter.service";
import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity";
import { Quiz } from "../../src/quiz/entities/quiz.entity";
import { QuizService } from "@src/quiz/quiz.service";
import { AnswerService } from "@src/answer/answer.service";
import { QuestionService } from "@src/question/question.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GiveAnswerInput } from "@src/question/dto/give-answers.input";
import { ValidationException } from "@src/exceptions/validation-exception";

interface EntityWithId {
  id: string;
}

class MockRepository<T extends EntityWithId> {
  entities: T[] = [];
  create(entity: T): T {
    return entity;
  }
  async save(entity: T): Promise<T> {
    return entity;
  }
  findOne(query: any): T | undefined {
    return undefined;
  }
  remove(entity: T): T {
    return entity;
  }
  //they are actually implemented in the tests (see below)
}

const questionRepositoryMock = new MockRepository<Question>();
const answerRepositoryMock = new MockRepository<Answer>();
const quizRepositoryMock = new MockRepository<Quiz>();

describe("AnswerSubmitterService", () => {
  let service: AnswerSubmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerSubmitterService,
        QuizService,
        QuestionService,
        AnswerService,
        {
          provide: getRepositoryToken(Question),
          useValue: questionRepositoryMock,
        },
        {
          provide: getRepositoryToken(Answer),
          useValue: answerRepositoryMock,
        },
        {
          provide: getRepositoryToken(Quiz),
          useValue: quizRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<AnswerSubmitterService>(AnswerSubmitterService);
  });

  it("should submit answers and give score", async () => {
    const givenAnswersInput = [new GiveAnswerInput("question-1", ["id-Paris"])];

    const answers = [
      new Answer("id-Paris", "Paris", true, null, null, "question-1"),
      new Answer("id-London", "London", true, null, null, "question-1"),
    ];
    const answers2 = [
      new Answer("id-Paris", "Paris", true, null, null, "question-2"),
      new Answer("id-London", "London", true, null, null, "question-2"),
    ];

    const question = new Question(
      "question-1",
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answers,
      null,
      "custom-quiz-id"
    );
    const question2 = new Question(
      "question-2",
      "What is the capital of UK?",
      true,
      null,
      null,
      null,
      answers2,
      null,
      "custom-quiz-id"
    );
    const quiz = new Quiz("custom-quiz-id", "Test Quiz", [question, question2]);
    questionRepositoryMock.entities = [question, question2];

    quizRepositoryMock.findOne = jest.fn().mockResolvedValue(quiz);
    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    const score = await service.submitAnswers(
      "custom-quiz-id",
      givenAnswersInput
    );
    expect(score.score).toEqual(50);
    expect(score.questions[0].correct).toEqual(true);
    expect(score.questions[0].answered).toEqual(true);
    expect(score.questions[1].answered).toEqual(false);
    expect(score.questions[1].correct).toEqual(false);
  });

  it("answer for a single answer question should be correct", async () => {
    const givenAnswerInput = new GiveAnswerInput("question-1", ["id-Paris"]);
    const incorrectAnswerInput = new GiveAnswerInput("question-1", [
      "id-London",
    ]);

    const answers = [
      new Answer("id-Paris", "Paris", true, null, null, "question-1"),
      new Answer("id-London", "London", true, null, null, "question-1"),
    ];

    const question = new Question(
      "question-1",
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answers,
      null,
      "quiz-id"
    );

    questionRepositoryMock.findOne = jest.fn().mockResolvedValue(question);

    const answer = await service.checkAnswer(givenAnswerInput, "quiz-id");
    expect(answer.correct).toBe(true);
    const incorrectAnswer = await service.checkAnswer(
      incorrectAnswerInput,
      "quiz-id"
    );
    expect(incorrectAnswer.correct).toBe(false);
  });

  it("answer for a multiple answers question should be correct", async () => {
    const givenAnswerInput = new GiveAnswerInput("question-1", [
      "id-Paris",
      "id-London",
    ]);
    const incorrectAnswerInput1 = new GiveAnswerInput("question-1", [
      "id-Tokyo",
    ]);
    const incorrectAnswerInput2 = new GiveAnswerInput("question-1", [
      "id-Tokyo",
      "id-Paris",
      "id-London",
    ]);
    const incorrectAnswerInput3 = new GiveAnswerInput("question-1", [
      "id-Tokyo",
      "id-Paris",
    ]);

    const answers = [
      new Answer("id-Paris", "Paris", true, null, null, "question-1"),
      new Answer("id-London", "London", true, null, null, "question-1"),
      new Answer("id-New-York", "New York", false, null, null, "question-1"),
      new Answer("id-Tokyo", "Tokyo", false, null, null, "question-1"),
    ];

    const question = new Question(
      "question-1",
      "Which cities are in Europe?",
      null,
      true,
      null,
      null,
      answers,
      null,
      "quiz-id"
    );

    questionRepositoryMock.findOne = jest.fn().mockResolvedValue(question);

    const answer = await service.checkAnswer(givenAnswerInput, "quiz-id");
    expect(answer.correct).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer(
      incorrectAnswerInput1,
      "quiz-id"
    );
    expect(incorrectAnswer1.correct).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer(
      incorrectAnswerInput2,
      "quiz-id"
    );
    expect(incorrectAnswer2.correct).toBe(false);
    const incorrectAnswer3 = await service.checkAnswer(
      incorrectAnswerInput3,
      "quiz-id"
    );
    expect(incorrectAnswer3.correct).toBe(false);
  });
  it("answer for a multiple answers question should be correct", async () => {
    const givenAnswerInput = new GiveAnswerInput("question-1", [
      "id-990",
      "id-1290",
      "id-1900",
    ]);
    const incorrectAnswerInput1 = new GiveAnswerInput("question-1", [
      "id-1290",
      "id-1900",
      "id-990",
    ]);
    const incorrectAnswerInput2 = new GiveAnswerInput("question-1", ["id-990"]);

    const answers = [
      new Answer("id-990", "990", null, 1, null, "question-1"),
      new Answer("id-1290", "1290", null, 2, null, "question-1"),
      new Answer("id-1900", "1900", null, 3, null, "question-1"),
    ];

    const question = new Question(
      "question-1",
      "Sort the years in ascending order",
      null,
      null,
      true,
      null,
      answers,
      null,
      "quiz-id"
    );

    questionRepositoryMock.findOne = jest.fn().mockResolvedValue(question);

    const answer = await service.checkAnswer(givenAnswerInput, "quiz-id");
    expect(answer.correct).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer(
      incorrectAnswerInput1,
      "quiz-id"
    );
    expect(incorrectAnswer1.correct).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer(
      incorrectAnswerInput2,
      "quiz-id"
    );
    expect(incorrectAnswer2.correct).toBe(false);
  });

  it("should return correct answers", async () => {
    const correctAnswerInput1 = new GiveAnswerInput("question-1", [
      "San Salvador",
    ]);
    const correctAnswerInput2 = new GiveAnswerInput("question-1", [
      "san SAlvador  ",
    ]);
    const incorrectAnswerInput1 = new GiveAnswerInput("question-1", [
      "San Francisco",
    ]);
    const incorrectAnswerInput2 = new GiveAnswerInput("question-1", [
      "San Salvador2",
    ]);

    const answers = [
      new Answer(
        "id-San-Salvador",
        "San Salvador",
        null,
        1,
        null,
        "question-1"
      ),
    ];

    const question = new Question(
      "question-1",
      "What is the capital of El Salvador?",
      null,
      null,
      null,
      true,
      answers,
      null,
      "quiz-id"
    );

    questionRepositoryMock.findOne = jest.fn().mockResolvedValue(question);

    const answer = await service.checkAnswer(correctAnswerInput1, "quiz-id");
    expect(answer.correct).toBe(true);
    const answer2 = await service.checkAnswer(correctAnswerInput2, "quiz-id");
    expect(answer2.correct).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer(
      incorrectAnswerInput1,
      "quiz-id"
    );
    expect(incorrectAnswer1.correct).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer(
      incorrectAnswerInput2,
      "quiz-id"
    );
    expect(incorrectAnswer2.correct).toBe(false);
  });

  it("answer for a single answer question should be correct", async () => {
    const givenAnswerInput = new GiveAnswerInput("question-1", ["id-Paris"]);
    const incorrectAnswerInput = new GiveAnswerInput("question-1", [
      "id-London",
    ]);

    const answers1 = [
      new Answer("id-Paris", "Paris", true, null, null, "question-1"),
      new Answer("id-London", "London", true, null, null, "question-1"),
    ];
    const question1 = new Question(
      "question-1",
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answers1,
      null,
      "quiz-id"
    );
    const answers2 = [
      new Answer("id-Paris", "Paris", true, null, null, "question-1"),
      new Answer("id-London", "London", true, null, null, "question-1"),
      new Answer("id-New-York", "New York", false, null, null, "question-1"),
      new Answer("id-Tokyo", "Tokyo", false, null, null, "question-1"),
    ];
    const question2 = new Question(
      "question-1",
      "Which cities are in Europe?",
      null,
      true,
      null,
      null,
      answers2,
      null,
      "quiz-id"
    );
    const answers3 = [
      new Answer("id-990", "990", null, 1, null, "question-1"),
      new Answer("id-1290", "1290", null, 2, null, "question-1"),
      new Answer("id-1900", "1900", null, 3, null, "question-1"),
    ];
    const question3 = new Question(
      "question-1",
      "Sort the years in ascending order",
      null,
      null,
      true,
      null,
      answers3,
      null,
      "quiz-id"
    );
    const answers4 = [
      new Answer(
        "id-San-Salvador",
        "San Salvador",
        null,
        1,
        null,
        "question-1"
      ),
    ];
    const question4 = new Question(
      "question-1",
      "What is the capital of El Salvador?",
      null,
      null,
      null,
      true,
      answers4,
      null,
      "quiz-id"
    );

    questionRepositoryMock.entities = [
      question1,
      question2,
      question3,
      question4,
    ];

    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });
    let correctAnswers = service.getCorrectAnswers(question1);
    expect(correctAnswers[0].answer).toEqual("Paris");
    correctAnswers = service.getCorrectAnswers(question2);
    let correctAnswersOnlyAnswers = correctAnswers.map(
      (answer) => answer.answer
    );
    expect(correctAnswersOnlyAnswers).toContain("Paris");
    expect(correctAnswersOnlyAnswers).toContain("London");
    correctAnswers = service.getCorrectAnswers(question3);
    expect(correctAnswers[0].id).toEqual("id-990");
    expect(correctAnswers[1].id).toEqual("id-1290");
    expect(correctAnswers[2].id).toEqual("id-1900");
    correctAnswers = service.getCorrectAnswers(question4);
    expect(correctAnswers[0].answer).toEqual("San Salvador");
  });

  it("should throw ValidationException while checking answer with question not belonging to quiz", async () => {
    const givenAnswerInput = new GiveAnswerInput("question-1", ["id-Paris"]);

    const answers = [
      new Answer("id-Paris", "Paris", true, null, null, "question-1"),
      new Answer("id-London", "London", true, null, null, "question-1"),
    ];

    const question = new Question(
      "question-1",
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answers,
      null,
      "quiz-id"
    );

    questionRepositoryMock.findOne = jest.fn().mockResolvedValue(question);

    expect(
      service.checkAnswer(givenAnswerInput, "another-quiz-id")
    ).rejects.toThrow(ValidationException);
  });
});
