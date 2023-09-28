import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity";
import { Test, TestingModule } from "@nestjs/testing";
import {
  AnswerDoesNotBelongToQuestionException,
  QuestionService,
} from "../../src/question/question.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateQuestionInput } from "../../src/question/dto/create-question.input";
import { CreateAnswerInput } from "../../src/answer/dto/create-answer.input";
import { UpdateQuestionInput } from "../../src/question/dto/update-question.input";
import { UpdateAnswerInput } from "../../src/answer/dto/update-answer.input";
import { GiveAnswerInput } from "./dto/give-answers.input";

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

    questionRepositoryMock.create = jest
      .fn()
      .mockReturnValue(createQuestionInput);
    questionRepositoryMock.save = jest
      .fn()
      .mockReturnValue(createQuestionInput);
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

  it("should throw an error when updating a question with an answer that does not belong to it", async () => {
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
      AnswerDoesNotBelongToQuestionException
    );
    expect(service.update(updateQuestionInput2)).rejects.toThrow(
      AnswerDoesNotBelongToQuestionException
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
    updateQuestionInput.question = "Choose the capital of France:";
    updateQuestionInput.id = "custom-question-id";

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

  it("answer for a single answer question should be correct", async () => {
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

    const givenAnswerInput = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-Paris",
    ]);

    const incorrectAnswerInput = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-London",
    ]);

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
      id: "generated-answer-id-" + answer.answer,
    }));
    answerRepositoryMock.save = jest
      .fn()
      .mockImplementation((answer) => answer);

    await service.create(createQuestionInput);
    const answer = await service.checkAnswer(givenAnswerInput);
    expect(answer.correct).toBe(true);
    const incorrectAnswer = await service.checkAnswer(incorrectAnswerInput);
    expect(incorrectAnswer.correct).toBe(false);
  });

  it("answer for a multiple answers question should be correct", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

    const answersInput = [
      new CreateAnswerInput("Paris", true, null),
      new CreateAnswerInput("London", true, null),
      new CreateAnswerInput("New York", false, null),
      new CreateAnswerInput("Tokyo", false, null),
    ];
    const createQuestionInput = new CreateQuestionInput(
      "Which cities are in Europe?",
      null,
      true,
      null,
      null,
      answersInput
    );

    const correctAnswerInput = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-Paris",
      "generated-answer-id-London",
    ]);
    const incorrectAnswerInput1 = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-Tokyo",
    ]);
    const incorrectAnswerInput2 = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-Tokyo",
      "generated-answer-id-Paris",
      "generated-answer-id-London",
    ]);
    const incorrectAnswerInput3 = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-Tokyo",
      "generated-answer-id-London",
    ]);

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
      id: "generated-answer-id-" + answer.answer,
    }));
    answerRepositoryMock.save = jest
      .fn()
      .mockImplementation((answer) => answer);

    await service.create(createQuestionInput);
    const answer = await service.checkAnswer(correctAnswerInput);
    expect(answer.correct).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer(incorrectAnswerInput1);
    expect(incorrectAnswer1.correct).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer(incorrectAnswerInput2);
    expect(incorrectAnswer2.correct).toBe(false);
    const incorrectAnswer3 = await service.checkAnswer(incorrectAnswerInput3);
    expect(incorrectAnswer3.correct).toBe(false);
  });

  it("answer for a sorting question should be correct", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

    const answersInput = [
      new CreateAnswerInput("1290", null, 2),
      new CreateAnswerInput("1900", null, 3),
      new CreateAnswerInput("990", null, 1),
    ];
    const createQuestionInput = new CreateQuestionInput(
      "Sort the years in ascending order",
      null,
      null,
      true,
      null,
      answersInput
    );

    const correctAnswerInput = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-990",
      "generated-answer-id-1290",
      "generated-answer-id-1900",
    ]);
    const incorrectAnswerInput1 = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-1290",
      "generated-answer-id-1900",
      "generated-answer-id-990",
    ]);
    const incorrectAnswerInput2 = new GiveAnswerInput("custom-question-id", [
      "generated-answer-id-990",
    ]);

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
      id: "generated-answer-id-" + answer.answer,
    }));
    answerRepositoryMock.save = jest
      .fn()
      .mockImplementation((answer) => answer);

    await service.create(createQuestionInput);
    const answer = await service.checkAnswer(correctAnswerInput);
    expect(answer.correct).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer(incorrectAnswerInput1);
    expect(incorrectAnswer1.correct).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer(incorrectAnswerInput2);
    expect(incorrectAnswer2.correct).toBe(false);
  });

  it("answer for a plain text answer question should be correct", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

    const answersInput = [new CreateAnswerInput("San Salvador", null, null)];
    const createQuestionInput = new CreateQuestionInput(
      "What is the capital of El Salvador?",
      null,
      null,
      null,
      true,
      answersInput
    );

    const correctAnswerInput1 = new GiveAnswerInput("custom-question-id", [
      "San Salvador",
    ]);
    const correctAnswerInput2 = new GiveAnswerInput("custom-question-id", [
      "san SAlvador  ",
    ]);
    const incorrectAnswerInput1 = new GiveAnswerInput("custom-question-id", [
      "San Francisco",
    ]);
    const incorrectAnswerInput2 = new GiveAnswerInput("custom-question-id", [
      "San Salvador2",
    ]);

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
      id: "generated-answer-id-" + answer.answer,
    }));
    answerRepositoryMock.save = jest
      .fn()
      .mockImplementation((answer) => answer);

    await service.create(createQuestionInput);
    const answer1 = await service.checkAnswer(correctAnswerInput1);
    expect(answer1.correct).toBe(true);
    const answer2 = await service.checkAnswer(correctAnswerInput2);
    expect(answer2.correct).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer(incorrectAnswerInput1);
    expect(incorrectAnswer1.correct).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer(incorrectAnswerInput2);
    expect(incorrectAnswer2.correct).toBe(false);
  });

  it("should return correct answers", async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];

    const createQuestionInput1 = new CreateQuestionInput(
      "What is the capital of El Salvador?",
      null,
      null,
      null,
      true,
      [new CreateAnswerInput("San Salvador", true, null)]
    );

    const answersInput2 = [
      new CreateAnswerInput("1290", null, 2),
      new CreateAnswerInput("1900", null, 3),
      new CreateAnswerInput("990", null, 1),
    ];
    const createQuestionInput2 = new CreateQuestionInput(
      "Sort the years in ascending order",
      null,
      null,
      true,
      null,
      answersInput2
    );

    const answersInput3 = [
      new CreateAnswerInput("Paris", true, null),
      new CreateAnswerInput("London", true, null),
      new CreateAnswerInput("New York", false, null),
      new CreateAnswerInput("Tokyo", false, null),
    ];
    const createQuestionInput3 = new CreateQuestionInput(
      "Which cities are in Europe?",
      null,
      true,
      null,
      null,
      answersInput3
    );

    const answersInput4 = [
      new CreateAnswerInput("Paris", true, null),
      new CreateAnswerInput("London", false, null),
    ];
    const createQuestionInput4 = new CreateQuestionInput(
      "What is the capital of France?",
      true,
      null,
      null,
      null,
      answersInput4
    );

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id =
        "custom-question-id-" + questionRepositoryMock.entities.length;
      return entity;
    });

    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex(
        (e) => e.id === entity.id
      );
      if (index !== -1) {
        if (entity.question)
          questionRepositoryMock.entities[index].question = entity.question;
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
      id: "generated-answer-id-" + answer.answer,
    }));
    answerRepositoryMock.save = jest
      .fn()
      .mockImplementation((answer) => answer);

    await service.create(createQuestionInput1);
    await service.create(createQuestionInput2);
    await service.create(createQuestionInput3);
    await service.create(createQuestionInput4);

    let question = await service.findOne("custom-question-id-0");
    let correctAnswers = service.getCorrectAnswers(question);
    expect(correctAnswers[0].answer).toEqual("San Salvador");
    question = await service.findOne("custom-question-id-1");
    correctAnswers = service.getCorrectAnswers(question);
    expect(correctAnswers[0].id).toEqual("generated-answer-id-990");
    expect(correctAnswers[1].id).toEqual("generated-answer-id-1290");
    expect(correctAnswers[2].id).toEqual("generated-answer-id-1900");
    question = await service.findOne("custom-question-id-2");
    correctAnswers = service.getCorrectAnswers(question);
    let correctAnswersOnlyAnswers = correctAnswers.map(
      (answer) => answer.answer
    );
    expect(correctAnswersOnlyAnswers).toContain("Paris");
    expect(correctAnswersOnlyAnswers).toContain("London");
    question = await service.findOne("custom-question-id-3");
    correctAnswers = service.getCorrectAnswers(question);
    expect(correctAnswers[0].answer).toEqual("Paris");
  });
});
