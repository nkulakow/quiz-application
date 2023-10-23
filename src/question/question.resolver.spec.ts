import { Test, TestingModule } from "@nestjs/testing";
import { QuestionResolver } from "./question.resolver";
import { QuestionService } from "./question.service";
import { AnswerService } from "@src/answer/answer.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity";

class MockRepository<T> {}
const answerRepositoryMock = new MockRepository<Answer>();
const questionRepositoryMock = new MockRepository<Question>();

describe("QuestionResolver", () => {
  let resolver: QuestionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionResolver,
        QuestionService,
        AnswerService,
        {
          provide: getRepositoryToken(Answer),
          useValue: answerRepositoryMock,
        },
        {
          provide: getRepositoryToken(Question),
          useValue: questionRepositoryMock,
        },
      ],
    }).compile();

    resolver = module.get<QuestionResolver>(QuestionResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });

  describe("type", () => {
    it('should return "Single Answer" when singleAnswer is true', () => {
      const question = new Question(
        "id",
        "question",
        true,
        null,
        null,
        null,
        [],
        null,
        null
      );
      expect(resolver.type(question)).toEqual("Single Answer");
    });

    it('should return "Plain Text Answer" when plainText is true', () => {
      const question = new Question(
        "id",
        "question",
        null,
        null,
        null,
        true,
        [],
        null,
        null
      );
      expect(resolver.type(question)).toEqual("Plain Text Answer");
    });
  });

  describe("possibleAnswers", () => {
    it("should return null when plainText is true", () => {
      const question = new Question(
        "id",
        "question",
        null,
        null,
        null,
        true,
        [],
        null,
        null
      );
      expect(resolver.possibleAnswers(question)).toBeNull();
    });

    it("should return answers when it is not plain text answer question", () => {
      const answer = new Answer("id", "answer", true, 1, null, null);
      const question = new Question(
        "id",
        "question",
        true,
        null,
        null,
        null,
        [answer],
        null,
        null
      );
      expect(resolver.possibleAnswers(question)).toEqual([answer]);
    });
  });
});
