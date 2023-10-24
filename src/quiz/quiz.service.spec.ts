import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity";
import { Quiz } from "../../src/quiz/entities/quiz.entity";
import { QuizService } from "../../src/quiz/quiz.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateQuizInput } from "./dto/create-quiz.input";
import { CreateQuestionInput } from "@src/question/dto/create-question.input";
import { CreateAnswerInput } from "@src/answer/dto/create-answer.input";
import { UpdateQuizInput } from "./dto/update-quiz.input";
import { QuestionService } from "@src/question/question.service";
import { AnswerService } from "@src/answer/answer.service";
import { NotFoundException } from "@nestjs/common";
import { ValidationException } from "@src/exceptions/validation-exception";

interface EntityWithId {
  id: string;
}

class MockRepository<T extends EntityWithId> {
  entities: T[] = [];
  create(entity: T): T {
    let id: string;
    if (entity instanceof CreateAnswerInput) id = "generated-answer-id";
    else if (entity instanceof CreateQuestionInput)
      id = "generated-question-id";
    else id = "custom-quiz-id";
    entity.id = id;
    return entity;
  }
  async save(entity: T): Promise<T> {
    if (this.entities.every((item) => item instanceof Quiz)) {
      const index = quizRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1 && entity instanceof UpdateQuizInput) {
        if (entity.name) quizRepositoryMock.entities[index].name = entity.name;
        return entity;
      }
    }
    this.entities.push(entity);
    return entity;
  }
  findOne(query: any): T | undefined {
    const id = query.where.id;
    const foundEntity = this.entities.find((entity) => entity.id === id);
    return foundEntity || undefined;
  }
  remove(entity: T): T {
    const index = this.entities.findIndex((e) => e.id === entity.id);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
    return entity;
  }
}

const questionRepositoryMock = new MockRepository<Question>();
const answerRepositoryMock = new MockRepository<Answer>();
const quizRepositoryMock = new MockRepository<Quiz>();

describe("QuizService", () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = module.get<QuizService>(QuizService);
  });

  it("should create a quiz without questions", async () => {
    const createQuizInput = new CreateQuizInput("Test Quiz", []);

    const createdQuiz = await service.create(createQuizInput);
    expect(createdQuiz).toEqual(createQuizInput);
    expect(createdQuiz.questions).toEqual([]);
  });

  it("should throw ValidationException while creating a quiz with name length = 0", async () => {
    const badQuizInput = new CreateQuizInput("", []);
    expect(service.create(badQuizInput)).rejects.toThrow(ValidationException);
  });

  it("should create a quiz with a question", async () => {
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];

    const answersInput = [
      new CreateAnswerInput("Paris", true, null),
      new CreateAnswerInput("London", false, null),
    ];
    const createQuestionInput = new CreateQuestionInput(
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answersInput,
      "custom-quiz-id"
    );
    const createQuizInput = new CreateQuizInput("Test Quiz", [
      createQuestionInput,
    ]);

    const createdQuiz = await service.create(createQuizInput);
    expect(createdQuiz).toEqual(createQuizInput);
    expect(createdQuiz.questions[0].id).toEqual("generated-question-id");
    expect(createdQuiz.questions[0].question).toEqual(
      "What is the capital of France?"
    );
    expect(createdQuiz.questions[0].answers[0].id).toEqual(
      "generated-answer-id"
    );
    expect(createdQuiz.questions[0].answers[0].answer).toEqual("Paris");
    expect(createdQuiz.questions[0].answers[0].correct).toEqual(true);
  });

  it("should update a quiz", async () => {
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];

    const createQuizInput = new CreateQuizInput("Test Quiz", []);

    const updateQuizInput = new UpdateQuizInput(
      "custom-quiz-id",
      "Test Quiz Updated"
    );

    await service.create(createQuizInput);
    const updatedQuiz = await service.update(updateQuizInput);
    expect(updatedQuiz.name).toEqual(updateQuizInput.name);
  });

  it("should throw NotFoundException while updating a quiz", async () => {
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];

    const createQuizInput = new CreateQuizInput("Test Quiz", []);

    const updateQuizInput = new UpdateQuizInput(
      "another-quiz-id",
      "Test Quiz Updated"
    );

    await service.create(createQuizInput);
    try {
      await service.update(updateQuizInput);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it("should remove a quiz", async () => {
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];

    const createQuizInput = new CreateQuizInput("Test Quiz", []);

    await service.create(createQuizInput);
    const removedQuiz = await service.remove("custom-quiz-id");
    expect(removedQuiz.id).toEqual("custom-quiz-id");
    expect(quizRepositoryMock.entities.length).toEqual(0);
  });
});
