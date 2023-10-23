import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { QuestionService } from "../../src/question/question.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateQuestionInput } from "../../src/question/dto/create-question.input";
import { CreateAnswerInput } from "../../src/answer/dto/create-answer.input";
import { UpdateQuestionInput } from "../../src/question/dto/update-question.input";
import { UpdateAnswerInput } from "../../src/answer/dto/update-answer.input";
import { AnswerService } from "@src/answer/answer.service";
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

describe("QuestionService", () => {
  let service: QuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it("should create a question with answers", async () => {
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
      answersInput
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
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

    const createdQuestion = await service.create(createQuestionInput);

    expect(createdQuestion).toEqual(createQuestionInput);
    expect(createdQuestion.answers).toHaveLength(answersInput.length);
    expect(questionRepositoryMock.create).toHaveBeenCalledWith(
      createQuestionInput
    );
    expect(questionRepositoryMock.save).toHaveBeenCalledWith(
      createQuestionInput
    );

    for (const answerInput of answersInput) {
      expect(answerRepositoryMock.create).toHaveBeenCalledWith(answerInput);
      expect(answerRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining(answerInput)
      );
    }

    expect(createdQuestion.answers[0].id).toEqual("generated-answer-id");
    expect(createdQuestion.answers[1].id).toEqual("generated-answer-id");
    expect([
      createdQuestion.answers[0].answer,
      createdQuestion.answers[1].answer,
    ]).toContain("Paris");
    expect([
      createdQuestion.answers[0].answer,
      createdQuestion.answers[1].answer,
    ]).toContain("London");
    for (const answer of createdQuestion.answers) {
      if (answer.answer === "Paris") {
        expect(answer.correct).toBe(true);
      } else {
        expect(answer.correct).toBe(false);
      }
    }
  });

  it("should throw ValidationException while creating the question with question length = 0", async () => {
    const answersInput = [
      new CreateAnswerInput("Paris", true, null),
      new CreateAnswerInput("London", false, null),
    ];
    const createQuestionInput = new CreateQuestionInput(
      "",
      true,
      null,
      null,
      null,
      answersInput
    );

    expect(service.create(createQuestionInput)).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw ValidationException while creating the question with incorrect field", async () => {
    const createQuestionInput1 = new CreateQuestionInput(
      "Question",
      true,
      true,
      null,
      null,
      [
        new CreateAnswerInput("Paris", true, null),
        new CreateAnswerInput("London", false, null),
      ]
    );
    const createQuestionInput2 = new CreateQuestionInput(
      "Question",
      false,
      false,
      true,
      null,
      [
        new CreateAnswerInput("Paris", null, null),
        new CreateAnswerInput("London", null, 1),
      ]
    );
    const createQuestionInput3 = new CreateQuestionInput(
      "Question",
      false,
      true,
      null,
      null,
      [
        new CreateAnswerInput("Paris", null, null),
        new CreateAnswerInput("London", false, null),
      ]
    );
    const createQuestionInput4 = new CreateQuestionInput(
      "Question",
      null,
      null,
      null,
      true,
      [
        new CreateAnswerInput("Paris", null, null),
        new CreateAnswerInput("London", null, null),
      ]
    );
    const createQuestionInput5 = new CreateQuestionInput(
      "Question",
      true,
      null,
      null,
      null,
      [
        new CreateAnswerInput("Paris", true, null),
        new CreateAnswerInput("London", true, null),
      ]
    );

    expect(service.create(createQuestionInput1)).rejects.toThrow(
      ValidationException
    );
    expect(service.create(createQuestionInput2)).rejects.toThrow(
      ValidationException
    );
    expect(service.create(createQuestionInput3)).rejects.toThrow(
      ValidationException
    );
    expect(service.create(createQuestionInput4)).rejects.toThrow(
      ValidationException
    );
    expect(service.create(createQuestionInput5)).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw ValidationException while creating the question with duplicate answer", async () => {
    const answersInput = [
      new CreateAnswerInput("Paris", true, null),
      new CreateAnswerInput("Paris", false, null),
    ];
    const createQuestionInput = new CreateQuestionInput(
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answersInput
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
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

    expect(service.create(createQuestionInput)).rejects.toThrow(
      ValidationException
    );
  });

  it("should update a question", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

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
      answersInput
    );

    const updateQuestionInput = new UpdateQuestionInput(
      "custom-question-id",
      "Choose the capital of France:",
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
      return entity;
    });

    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.question)
          questionRepositoryMock.entities[index].question = entity.question;
        if (entity.singleAnswer)
          questionRepositoryMock.entities[index].singleAnswer =
            entity.singleAnswer;
      } else {
        questionRepositoryMock.entities.push(entity);
      }
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

    await service.create(createQuestionInput);
    const updatedQuestion = await service.update(updateQuestionInput);
    expect(updatedQuestion.question).toEqual(updateQuestionInput.question);
    expect(updatedQuestion.singleAnswer).toEqual(true);
  });

  it("should throw an ValidationException when updating a question with an answer that does not belong to it", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

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
      answersInput
    );

    const updateAnswersInput = [
      new UpdateAnswerInput("generated-answer-id-Paris", "Paris", false, null),
    ];
    const updateQuestionInput = new UpdateQuestionInput(
      "custom-question-id",
      "Choose the capital of France:",
      null,
      null,
      null,
      null,
      updateAnswersInput,
      null,
      null
    );

    const updateQuestionInput2 = new UpdateQuestionInput(
      "custom-question-id",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      ["generated-answer-id-sth"]
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
      return entity;
    });

    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.question)
          questionRepositoryMock.entities[index].question = entity.question;
        if (entity.singleAnswer)
          questionRepositoryMock.entities[index].singleAnswer =
            entity.singleAnswer;
      } else {
        questionRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    answerRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "generated-answer-id-" + entity.answer;
      if (entity.answer === "Paris") entity.questionId = "another-question-id";
      return entity;
    });

    answerRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = answerRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.answer)
          answerRepositoryMock.entities[index].answer = entity.answer;
        if (entity.correct)
          answerRepositoryMock.entities[index].correct = entity.correct;
      } else {
        answerRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    await service.create(createQuestionInput);
    expect(service.update(updateQuestionInput)).rejects.toThrow(
      ValidationException
    );
    expect(service.update(updateQuestionInput2)).rejects.toThrow(
      ValidationException
    );
  });

  it("should throw an ValidationException when updating a question with duplicate answer", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

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
      answersInput
    );

    const newAnswers = [new CreateAnswerInput("Paris", false, null)];
    const updateQuestionInput = new UpdateQuestionInput(
      "custom-question-id",
      "Choose the capital of France:",
      null,
      null,
      null,
      null,
      null,
      newAnswers,
      null
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
      return entity;
    });

    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.question)
          questionRepositoryMock.entities[index].question = entity.question;
        if (entity.singleAnswer)
          questionRepositoryMock.entities[index].singleAnswer =
            entity.singleAnswer;
      } else {
        questionRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    answerRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "generated-answer-id-" + entity.answer;
      return entity;
    });

    answerRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = answerRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.answer)
          answerRepositoryMock.entities[index].answer = entity.answer;
        if (entity.correct)
          answerRepositoryMock.entities[index].correct = entity.correct;
      } else {
        answerRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    await service.create(createQuestionInput);
    expect(service.update(updateQuestionInput)).rejects.toThrow(
      ValidationException
    );
  });

  it("should create new answer while updating the question", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

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
      answersInput
    );

    const updateQuestionInput = new UpdateQuestionInput(
      "custom-question-id",
      "Choose the capital of France:",
      null,
      null,
      null,
      null,
      null,
      [new CreateAnswerInput("Madrid", false, null)],
      null
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
      return entity;
    });

    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.question)
          questionRepositoryMock.entities[index].question = entity.question;
        if (entity.singleAnswer)
          questionRepositoryMock.entities[index].singleAnswer =
            entity.singleAnswer;
      } else {
        questionRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    answerRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "generated-answer-id-" + entity.answer;
      return entity;
    });

    answerRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = answerRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.answer)
          answerRepositoryMock.entities[index].answer = entity.answer;
        if (entity.correct)
          answerRepositoryMock.entities[index].correct = entity.correct;
      } else {
        answerRepositoryMock.entities.push(entity);
      }
      return entity;
    });

    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    await service.create(createQuestionInput);
    const updatedQuestion = await service.update(updateQuestionInput);
    expect(updatedQuestion.answers).toHaveLength(3);
    expect(updatedQuestion.answers.map((answer) => answer.answer)).toContain(
      "Madrid"
    );
  });

  it("should remove answer while updating the question", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

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
      answersInput
    );

    const updateQuestionInput = new UpdateQuestionInput(
      "custom-question-id",
      "Choose the capital of France:",
      null,
      null,
      null,
      null,
      null,
      null,
      ["generated-answer-id-London"]
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
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

    answerRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "generated-answer-id-" + entity.answer;
      return entity;
    });

    answerRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      answerRepositoryMock.entities.push(entity);
      return entity;
    });

    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    answerRepositoryMock.remove = jest.fn().mockImplementation((entities) => {
      for (let entity of entities) {
        const index = answerRepositoryMock.entities.findIndex(
          (e) => e.id === entity.id
        );
        if (index !== -1) {
          answerRepositoryMock.entities.splice(index, 1);
        }
      }
      return entities;
    });

    await service.create(createQuestionInput);
    await service.update(updateQuestionInput);
    expect(answerRepositoryMock.entities).toHaveLength(1);
  });

  it("should remove question", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

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
      answersInput
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "custom-question-id";
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

    questionRepositoryMock.remove = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        questionRepositoryMock.entities.splice(index, 1);
      }
      return entity;
    });

    answerRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = "generated-answer-id-" + entity.answer;
      return entity;
    });

    answerRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      answerRepositoryMock.entities.push(entity);
      return entity;
    });

    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find(
        (entity) => entity.id === id
      );
      return foundEntity || undefined;
    });

    answerRepositoryMock.remove = jest.fn().mockImplementation((entities) => {
      for (let entity of entities) {
        const index = answerRepositoryMock.entities.findIndex(
          (e) => e.id === entity.id
        );
        if (index !== -1) {
          answerRepositoryMock.entities.splice(index, 1);
        }
      }
      return entities;
    });

    await service.create(createQuestionInput);
    const questionRemoved = await service.remove("custom-question-id");
    expect(questionRemoved.question).toEqual(createQuestionInput.question);
    expect(questionRepositoryMock.entities).toHaveLength(0);
  });
});
