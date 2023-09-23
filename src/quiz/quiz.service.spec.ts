import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity"; 
import { Quiz } from "../../src/quiz/entities/quiz.entity";
import { QuizService } from "../../src/quiz/quiz.service";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateQuizInput } from "./dto/create-quiz.input";
import { CreateQuestionInput } from "@src/question/dto/create-question.input";
import { CreateAnswerInput } from "@src/answer/dto/create-answer.input";
import { UpdateQuizInput } from "./dto/update-quiz.input";
import { GiveAnswerInput } from "@src/question/dto/give-answers.input";

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
const quizRepositoryMock = new MockRepository<Quiz>();


describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
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
  
  
  it('should create a quiz without questions', async () => {
    
    const createQuizInput = new CreateQuizInput();
    createQuizInput.name = "Test Quiz";
    createQuizInput.questions = [];
    quizRepositoryMock.create = jest.fn().mockReturnValue(createQuizInput);
    quizRepositoryMock.save = jest.fn().mockReturnValue(createQuizInput);
    
    const createdQuiz = await service.create(createQuizInput);
    expect(createdQuiz).toEqual(createQuizInput);
    expect(quizRepositoryMock.create).toBeCalledWith(createQuizInput);
    expect(quizRepositoryMock.save).toBeCalledWith(createQuizInput);
    expect(createdQuiz.questions).toEqual([]);
  });
  
  it('should create a quiz with a question', async () => {
    
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];
    
    const createQuizInput = new CreateQuizInput();
    createQuizInput.name = "Test Quiz";
    const createQuestionInput = new CreateQuestionInput();
    createQuestionInput.question = 'What is the capital of France?';
    createQuestionInput.singleAnswer = true
    const answersInput = [
      new CreateAnswerInput(),
      new CreateAnswerInput(),
    ];
    answersInput[0].answer = 'Paris';
    answersInput[0].correct = true;
    answersInput[1].answer = 'London';
    answersInput[1].correct = false;
    createQuestionInput.answers = answersInput;
    createQuizInput.questions = [createQuestionInput];
    
    quizRepositoryMock.create = jest.fn().mockReturnValue(createQuizInput);
    quizRepositoryMock.save = jest.fn().mockReturnValue(createQuizInput);
    questionRepositoryMock.create = jest.fn().mockImplementation((question) => ({
      ...question,
      id: 'generated-question-id',
    }));
    questionRepositoryMock.save = jest.fn().mockImplementation((question) => question);
    answerRepositoryMock.create = jest.fn().mockImplementation((answer) => ({
      ...answer,
      id: 'generated-answer-id',
    }));
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);

    const createdQuiz = await service.create(createQuizInput);
    expect(createdQuiz).toEqual(createQuizInput);
    expect(createdQuiz.questions[0].id).toEqual('generated-question-id');
    expect(createdQuiz.questions[0].question).toEqual('What is the capital of France?');
    expect(createdQuiz.questions[0].answers[0].id).toEqual('generated-answer-id');
    expect(createdQuiz.questions[0].answers[0].answer).toEqual('Paris');
    expect(createdQuiz.questions[0].answers[0].correct).toEqual(true);
  });
  
  it('should update a quiz', async () => {
    
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];
    
    const createQuizInput = new CreateQuizInput();
    createQuizInput.name = "Test Quiz";
    createQuizInput.questions = [];
    
    const updateQuizInput = new UpdateQuizInput();
    updateQuizInput.id = 'custom-quiz-id';
    updateQuizInput.name = "Test Quiz Updated";
    
    quizRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-quiz-id';
      return entity;
    });
    
    quizRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = quizRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.name) quizRepositoryMock.entities[index].name = entity.name;
      }
      else {
        quizRepositoryMock.entities.push(entity);
      }
      return entity;
    });
    
    quizRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = quizRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });
    
    await service.create(createQuizInput);
    const updatedQuiz = await service.update(updateQuizInput);
    expect(updatedQuiz.name).toEqual(updateQuizInput.name);
    
  });
  
  
  it('should submit answers and give score', async () => {
    
    quizRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    answerRepositoryMock.entities = [];
    
    const createQuizInput = new CreateQuizInput();
    createQuizInput.name = "Test Quiz";
    const createQuestionInput = new CreateQuestionInput();
    createQuestionInput.question = 'What is the capital of France?';
    createQuestionInput.singleAnswer = true
    const answersInput = [
      new CreateAnswerInput(),
      new CreateAnswerInput(),
    ];
    answersInput[0].answer = 'Paris';
    answersInput[0].correct = true;
    answersInput[1].answer = 'London';
    answersInput[1].correct = false;
    createQuestionInput.answers = answersInput;

    const createQuestionInput2 = new CreateQuestionInput();
    createQuestionInput.question = 'What is the capital of UK?';
    createQuestionInput.singleAnswer = true
    const answersInput2 = [
      new CreateAnswerInput(),
      new CreateAnswerInput(),
    ];
    answersInput2[0].answer = 'Paris';
    answersInput2[0].correct = false;
    answersInput2[1].answer = 'London';
    answersInput2[1].correct = true;
    createQuestionInput2.answers = answersInput2;
    createQuizInput.questions = [createQuestionInput, createQuestionInput2];
    
    const givenAnswersInput = [
      new GiveAnswerInput(),
    ];
    givenAnswersInput[0].questionId = 'generated-question-id-0';
    givenAnswersInput[0].answers = ['generated-answer-id-Paris'];;
    
    quizRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-quiz-id';
      return entity;
    });
    quizRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      quizRepositoryMock.entities.push(entity);
      return entity;
    });
    quizRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = quizRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });
    questionRepositoryMock.create = jest.fn().mockImplementation((question) => ({
      ...question,
      id: 'generated-question-id-' + questionRepositoryMock.entities.length,
    }));
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) =>{
      questionRepositoryMock.entities.push(entity)
      return entity;
    });
    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });
    answerRepositoryMock.create = jest.fn().mockImplementation((answer) => ({
      ...answer,
      id: 'generated-answer-id-' + answer.answer,
    }));
    answerRepositoryMock.save = jest.fn().mockImplementation((entity) =>{
      answerRepositoryMock.entities.push(entity)
      return entity;
    });
    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });

    await service.create(createQuizInput);
    let score = await service.submitAnswers('custom-quiz-id', givenAnswersInput);
    expect(score.score).toEqual(50);
    expect(score.questions[0].correct).toEqual(true);
    expect(score.questions[0].answered).toEqual(true);
    expect(score.questions[1].answered).toEqual(false);
    expect(score.questions[1].correct).toEqual(false);
    
  });
  
});