import { Answer } from "../../src/answer/entities/answer.entity";
import { Question } from "../../src/question/entities/question.entity"; 
import { Test, TestingModule } from '@nestjs/testing';
import { AnswerDoesNotBelongToQuestionException, QuestionService } from '../../src/question/question.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateQuestionInput } from "../../src/question/dto/create-question.input";
import { CreateAnswerInput } from "../../src/answer/dto/create-answer.input";
import { UpdateQuestionInput } from "../../src/question/dto/update-question.input";
import { UpdateAnswerInput } from "../../src/answer/dto/update-answer.input";
import { async } from "rxjs";

interface EntityWithId {
  id: string;
}

class MockRepository<T extends EntityWithId> {
    entities: T[] = [];
  
    create(entity: T): T {
      this.entities.push(entity);
      return entity;
    }
  
    async save(entity: T): Promise<T> {
      return entity; // Simulate saving to the database
    }
  
    findOne(query: any): T | undefined {
      if (query.where && query.where.id) {
        const id = query.where.id;
        const foundEntity = this.entities.find((entity) => {
            return entity.id === id;
        });

        return foundEntity || undefined; // Return the found entity or undefined
    }
    return undefined;
    }
    

  }
  
  // Create instances of the mock repository for Question and Answer entities
  const questionRepositoryMock = new MockRepository<Question>();
  const answerRepositoryMock = new MockRepository<Answer>();
  
  // Configure mock functions for the methods used in your service
  jest.spyOn(questionRepositoryMock, 'create').mockImplementation(questionRepositoryMock.create);
  jest.spyOn(questionRepositoryMock, 'save').mockImplementation(questionRepositoryMock.save);
  jest.spyOn(questionRepositoryMock, 'findOne').mockImplementation(questionRepositoryMock.findOne);
  jest.spyOn(answerRepositoryMock, 'create').mockImplementation(answerRepositoryMock.create);
  jest.spyOn(answerRepositoryMock, 'save').mockImplementation(answerRepositoryMock.save);
  jest.spyOn(answerRepositoryMock, 'findOne').mockImplementation(answerRepositoryMock.findOne);



// Define the MockRepository class and mock functions as shown in the previous answer

// Describe and write your test suite
describe('QuestionService', () => {
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

  it('should create a question with answers', async () => {
    // Arrange
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

    questionRepositoryMock.create = jest.fn().mockReturnValue(createQuestionInput);
    questionRepositoryMock.save = jest.fn().mockReturnValue(createQuestionInput);
    answerRepositoryMock.create = jest.fn().mockImplementation((answer) => ({
      ...answer,
      id: 'generated-answer-id',
    }));
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);

    // Act
    const createdQuestion = await service.create(createQuestionInput, answersInput);

    // Assert
    expect(createdQuestion).toEqual(createQuestionInput);
    expect(createdQuestion.answers).toHaveLength(answersInput.length);
    expect(questionRepositoryMock.create).toHaveBeenCalledWith(createQuestionInput);
    expect(questionRepositoryMock.save).toHaveBeenCalledWith(createQuestionInput);

    for (const answerInput of answersInput) {
      expect(answerRepositoryMock.create).toHaveBeenCalledWith(answerInput);
      expect(answerRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining(answerInput));
    }
    
    expect(createdQuestion.answers[0].id).toEqual('generated-answer-id');
    expect(createdQuestion.answers[1].id).toEqual('generated-answer-id');
    expect([createdQuestion.answers[0].answer, createdQuestion.answers[1].answer]).toContain('Paris');
    expect([createdQuestion.answers[0].answer, createdQuestion.answers[1].answer]).toContain('London');
    for (const answer of createdQuestion.answers) {
      if (answer.answer === 'Paris') {
        expect(answer.correct).toBe(true);
      } else {
        expect(answer.correct).toBe(false);
      }
    }
  });
  
  
  it('should update a question', async () => {
    
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    
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
    
    const updateQuestionInput = new UpdateQuestionInput();
    updateQuestionInput.question = 'Choose the capital of France:';
    updateQuestionInput.id = 'custom-question-id';
    const updateAnswersInput = [];

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-question-id';
      return entity;
    });
    
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.question) questionRepositoryMock.entities[index].question = entity.question;
        if(entity.singleAnswer) questionRepositoryMock.entities[index].singleAnswer = entity.singleAnswer;
      }
      else {
        questionRepositoryMock.entities.push(entity);
      }
      return entity;
    });
    
    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });
    
    answerRepositoryMock.create = jest.fn().mockImplementation((answer) => ({
      ...answer,
      id: 'generated-answer-id',
    }));
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);

    
    await service.create(createQuestionInput, answersInput);
    const updatedQuestion = await service.update(updateQuestionInput, updateAnswersInput);
    expect(updatedQuestion.question).toEqual(updateQuestionInput.question);
    expect(updatedQuestion.singleAnswer).toEqual(true);
  });
  
  
  it('should throw an error when updating a question with an answer that does not belong to it', async () => {
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    
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
    
    const updateQuestionInput = new UpdateQuestionInput();
    updateQuestionInput.question = 'Choose the capital of France:';
    updateQuestionInput.id = 'custom-question-id';
    const updateAnswersInput = [
      new UpdateAnswerInput(),
    ];
    updateAnswersInput[0].id = 'generated-answer-id';
    updateAnswersInput[0].answer = 'Paris!!!';
    updateAnswersInput[0].correct = true;

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-question-id';
      return entity;
    });
    
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.question) questionRepositoryMock.entities[index].question = entity.question;
        if(entity.singleAnswer) questionRepositoryMock.entities[index].singleAnswer = entity.singleAnswer;
      }
      else {
        questionRepositoryMock.entities.push(entity);
      }
      return entity;
    });
    
    questionRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = questionRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });
    
    answerRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'generated-answer-id';
      if (entity.answer === 'Paris') entity.questionId = 'another-question-id';
      return entity;
    });
    
    answerRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = answerRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.answer) answerRepositoryMock.entities[index].answer = entity.answer;
        if(entity.correct) answerRepositoryMock.entities[index].correct = entity.correct;
      }
      else {
        answerRepositoryMock.entities.push(entity);
      }
      return entity;
    });
    
    answerRepositoryMock.findOne = jest.fn().mockImplementation((query) => {
      const id = query.where.id;
      const foundEntity = answerRepositoryMock.entities.find((entity) => entity.id === id);
      return foundEntity || undefined;
    });
    
    await service.create(createQuestionInput, answersInput);
    expect(service.update(updateQuestionInput, updateAnswersInput)).rejects.toThrow(AnswerDoesNotBelongToQuestionException);

  });

  it('answer for a single answer question should be correct', async () => {
    
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    
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

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-question-id';
      return entity;
    });
    
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.question) questionRepositoryMock.entities[index].question = entity.question;
        if(entity.singleAnswer) questionRepositoryMock.entities[index].singleAnswer = entity.singleAnswer;
      }
      else {
        questionRepositoryMock.entities.push(entity);
      }
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
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);
    
    await service.create(createQuestionInput, answersInput);
    const answer = await service.checkAnswer('custom-question-id', ['generated-answer-id-Paris']);
    expect(answer).toBe(true);
    const incorrectAnswer = await service.checkAnswer('custom-question-id', ['generated-answer-id-London']);
    expect(incorrectAnswer).toBe(false);
  });
  
  it('answer for a multiple answers question should be correct', async () => {
    
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    
    const createQuestionInput = new CreateQuestionInput();
    createQuestionInput.question = 'Which cities are in Europe?';
    createQuestionInput.multipleAnswer = true
    
    const answersInput = [
      new CreateAnswerInput(),
      new CreateAnswerInput(),
      new CreateAnswerInput(),
      new CreateAnswerInput(),
    ];
    answersInput[0].answer = 'Paris';
    answersInput[0].correct = true;
    answersInput[1].answer = 'London';
    answersInput[1].correct = true;
    answersInput[2].answer = 'New York';
    answersInput[2].correct = false;
    answersInput[3].answer = 'Tokyo';
    answersInput[3].correct = false;
    

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-question-id';
      return entity;
    });
    
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.question) questionRepositoryMock.entities[index].question = entity.question;
        if(entity.singleAnswer) questionRepositoryMock.entities[index].singleAnswer = entity.singleAnswer;
      }
      else {
        questionRepositoryMock.entities.push(entity);
      }
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
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);
    
    await service.create(createQuestionInput, answersInput);
    const answer = await service.checkAnswer('custom-question-id', ['generated-answer-id-Paris', 'generated-answer-id-London']);
    expect(answer).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer('custom-question-id', ['generated-answer-id-Tokyo']);
    expect(incorrectAnswer1).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer('custom-question-id', ['generated-answer-id-Tokyo', 'generated-answer-id-Paris', 'generated-answer-id-London']);
    expect(incorrectAnswer2).toBe(false);
    const incorrectAnswer3 = await service.checkAnswer('custom-question-id', ['generated-answer-id-Tokyo', 'generated-answer-id-London']);
    expect(incorrectAnswer3).toBe(false);
  });
  
  it('answer for a sorting question should be correct', async () => {
    
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    
    const createQuestionInput = new CreateQuestionInput();
    createQuestionInput.question = 'Sort the years in ascending order';
    createQuestionInput.sorting = true
    
    const answersInput = [
      new CreateAnswerInput(),
      new CreateAnswerInput(),
      new CreateAnswerInput(),
    ];
    answersInput[0].answer = '1290';
    answersInput[0].number = 2;
    answersInput[1].answer = '1900';
    answersInput[1].number = 3;
    answersInput[2].answer = '990';
    answersInput[2].number = 1;
    

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-question-id';
      return entity;
    });
    
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.question) questionRepositoryMock.entities[index].question = entity.question;
        if(entity.singleAnswer) questionRepositoryMock.entities[index].singleAnswer = entity.singleAnswer;
      }
      else {
        questionRepositoryMock.entities.push(entity);
      }
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
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);
    
    await service.create(createQuestionInput, answersInput);
    const answer = await service.checkAnswer('custom-question-id', ['generated-answer-id-990', 'generated-answer-id-1290', 'generated-answer-id-1900']);
    expect(answer).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer('custom-question-id', ['generated-answer-id-1290', 'generated-answer-id-1900', 'generated-answer-id-990']);
    expect(incorrectAnswer1).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer('custom-question-id', ['generated-answer-id-990']);
    expect(incorrectAnswer2).toBe(false);
  });
  
  it('answer for a plain text answer question should be correct', async () => {
    
    answerRepositoryMock.entities = [];
    questionRepositoryMock.entities = [];
    
    const createQuestionInput = new CreateQuestionInput();
    createQuestionInput.question = 'What is the capital of El Salvador?';
    createQuestionInput.plainText = true
    
    const answersInput = [
      new CreateAnswerInput(),
    ];
    answersInput[0].answer = 'San Salvador';

    questionRepositoryMock.create = jest.fn().mockImplementation((entity) => {
      entity.id = 'custom-question-id';
      return entity;
    });
    
    questionRepositoryMock.save = jest.fn().mockImplementation((entity) => {
      const index = questionRepositoryMock.entities.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        if(entity.question) questionRepositoryMock.entities[index].question = entity.question;
        if(entity.singleAnswer) questionRepositoryMock.entities[index].singleAnswer = entity.singleAnswer;
      }
      else {
        questionRepositoryMock.entities.push(entity);
      }
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
    answerRepositoryMock.save = jest.fn().mockImplementation((answer) => answer);
    
    await service.create(createQuestionInput, answersInput);
    const correctAnswer1 = await service.checkAnswer('custom-question-id', ['San Salvador']);
    expect(correctAnswer1).toBe(true);
    const correctAnswer2 = await service.checkAnswer('custom-question-id', ['  san SAlvador.  ']);
    expect(correctAnswer2).toBe(true);
    const incorrectAnswer1 = await service.checkAnswer('custom-question-id', ['San Francisco']);
    expect(incorrectAnswer1).toBe(false);
    const incorrectAnswer2 = await service.checkAnswer('custom-question-id', ['SanSalvador']);
    expect(incorrectAnswer2).toBe(false);
  });
  
});
