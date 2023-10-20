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
import { GiveAnswerInput } from "@src/question/dto/give-answers.input";
import { QuestionService } from "@src/question/question.service";
import { AnswerService } from "@src/answer/answer.service";
import { LengthEqualsZeroException } from "@src/exceptions/length-equals-zero-exception";
import { NotFoundException } from "@nestjs/common";

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
    quizRepositoryMock.create = jest.fn().mockReturnValue(createQuizInput);
    quizRepositoryMock.save = jest.fn().mockReturnValue(createQuizInput);

    const createdQuiz = await service.create(createQuizInput);
    expect(createdQuiz).toEqual(createQuizInput);
    expect(quizRepositoryMock.create).toBeCalledWith(createQuizInput);
    expect(quizRepositoryMock.save).toBeCalledWith(createQuizInput);
    expect(createdQuiz.questions).toEqual([]);
  });

  it("should throw LengthEqualsZeroException while creating a quiz", async () => {
    const badQuizInput = new CreateQuizInput("", []);
    expect(service.create(badQuizInput)).rejects.toThrow(
      LengthEqualsZeroException
    );
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

    quizRepositoryMock.create = jest.fn().mockReturnValue(createQuizInput);
    questionRepositoryMock.save = jest
      .fn()
      .mockImplementation((question) => question);
    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "generated-question-id";
      return entity;
    });

    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      questionRepositoryMock.entities.push(entity);
      return entity;
    });

    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });
    answerRepositoryMock.create = jest.fn().mockImplementation((answer) => ({
      ...answer,
      id: "generated-answer-id",
    }));
    answerRepositoryMock.save = jest
      .fn()
      .mockImplementation((answer) => answer);

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

    quizRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-quiz-id";
      return entity;
    });

    quizRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = quizRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.name) quizRepositoryMock.entities[index].name = entity.name;
      } else {
        quizRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    quizRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = quizRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

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

    quizRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-quiz-id";
      return entity;
    });

    quizRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = quizRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.name) quizRepositoryMock.entities[index].name = entity.name;
      } else {
        quizRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    quizRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = quizRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

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

    quizRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-quiz-id";
      return entity;
    });

    quizRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = quizRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.name) quizRepositoryMock.entities[index].name = entity.name;
      } else {
        quizRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    quizRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = quizRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    quizRepositoryMock.remove = jest.fn().mockImplementation((entity) => {
      const index = quizRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        quizRepositoryMock.entities.splice(index, 1);
      }
      return entity;
    });

    await service.create(createQuizInput);
    const removedQuiz = await service.remove("custom-quiz-id");
    expect(removedQuiz.id).toEqual("custom-quiz-id");
    expect(quizRepositoryMock.entities.length).toEqual(0);
  });
});
