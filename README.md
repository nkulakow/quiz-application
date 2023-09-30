# Quiz App

_Nel Kułakowska_

## Program description

Quiz Backend API that allows:

- teachers to create and edit quizzes
- students to view the quizzes and submit their answers to get their results (results are not saved)

App uses PostgreSQL database run on Docker. API is based on GraphQL and was created using NestJS and TypeScript.

## How to run and use API

Run command `$ npm run start`.  
Make sure you can connect to the database.

To see how all the queries and mutations work go to [GraphQl playground](localhost:3000/graphql "link").

### GraphQL playground

1. To create new quiz use createQuiz mutation, e.g.:

   ```GraphQL
   mutation {
     createQuiz(createQuizInput: {
       name: "History Quiz"
       questions: [
         {
           question: "Which countries were part of the Allied Powers during World War II?"
           multipleAnswer: true
           answers : [
             { answer : "United States"
             correct: true}
             { answer : "Ireland"
             correct: false}
             { answer : "Soviet Union"
             correct: true}
             { answer : "France"
             correct: true}
             { answer : "Egypt"
             correct: false}
             { answer : "Austria"
             correct: false}
           ]
           }
         {
           question: "What year did WW2 start?"
             singleAnswer: true
             answers : [
             { answer : "1939"
             correct: true}
             { answer : "1959"
             correct: false}
             ]
         }
         {
           question: "Arrange the following historical events in chronological order, from earliest to latest:"
           sorting: true
           answers : [
             { answer : "American Revolution"
             number: 3}
             { answer : "French Revolution"
             number: 4}
             { answer : "Renaissance"
             number: 2}
             { answer : "Industrial Revolution"
             number: 5}
             { answer : "Ancient Egypt Civilization"
             number: 1}
           ]
         }
       ]
     })
     {
       id
     }
   }
   ```
   You can get ids (and all of given information) in return.

2. To remove a quiz use removeQuiz mutation, e.g.:

   ```GraphQL
   mutation {
     removeQuiz (id: "b57822fd-f8ad-4611-b45b-68714b7228f6"){
       id
     }
   }
   ```

3. To change the name of the quiz use updateQuiz mutation, e.g.:

   ```GraphQL
   mutation {
     updateQuiz (
       updateQuizInput : {
         id: "7465f8bd-7273-4763-8b3d-27dd2f3bcd45"
         name: "Worlds History Quiz"
       }
     )
     {
       id
       name
     }
   }
   ```

4. To get all the quizzes in the database use getAllQuizzes query, e.g.:

   ```GraphQL
   query {
     getAllQuizzes {
       id
       name
       questions {
         id
         question
         type
         answers {
           id
           answer
           correct
           number
         }
       }
     }
   }
   ```

5. To get one specific quiz use getOneQuiz query, e.g:

   ```GraphQL
   query {
     getOneQuiz(id: "7465f8bd-7273-4763-8b3d-27dd2f3bcd45") {
       id
       name
       questions {
         id
         question
         type
         possibleAnswers {
           id
           answer
         }
       }
     }
   }
   ```

6. To add question to the quiz use addQuestion mutation, e.g.:

   ```GraphQL
   mutation {
     addQuestion (addQuestionInput : {
       quizId: "7465f8bd-7273-4763-8b3d-27dd2f3bcd45"
       question: "Who was the first President of the United States?"
       plainText: true
       answers : [
         { answer : "George Washington"}
       ]
     }
     )
     {
       id
     }
   }
   ```

7. To remove a question use removeQuestion mutation, e.g.:

   ```GraphQL
   mutation {
     removeQuestion(id: "507f3733-602f-4518-9bfb-5a80acd8ed30")
     {
       id
     }
   }
   ```

8. To update question use updateQuestion mutation, e.g.:
   ```GraphQL
   mutation{
     updateQuestion(updateQuestionInput: {
       id: "d7f5e8f8-75b1-4581-a3c5-e9f500b3436c"
       question: "Select the countries that were part of the Allied Powers during World War II:"
       multipleAnswer: true
       answers: [
       {
       id: "5716638e-d405-4802-a783-c4c9961cadca"
       answer: "United States of America"
       }
       ]
       newAnswers: [
         {
           answer: "Belgium"
           correct: false
         }
       ]
       deleteAnswers: [
         "8be8a1e5-6c06-4bcd-bbf6-2a0efdaabf15",
         "bcc6c31f-608d-4d54-bf6d-f3aa8afc689f"

       ]
     }
     ){
       id
       question
       answers {
         id
         answer
         correct
       }
     }
   }
   ```
   You can change the type and name of question (remember that after changing the type then answers must correspond to it).    
   While updating you can also: update answers using answers field; add new answers using newAnswers field; delete saved earlier answers using deleteAnswers field.    

9. To get one specific question you can use getOneQuestion query, e.g:
      ```GraphQL
      query {
        getOneQuestion (id: "1a925f34-1f72-43f7-86c8-df8e0e6d656a"){
          id
          question
          possibleAnswers {
            id
            answer
          }
        }
      }   
      ```

    
10. To submit answers use submitAnswers query, e.g:
      ```GraphQL
      query {
        submitAnswers(
          id: "4faded2e-0ade-4e8d-b98d-21ddad355f4c"
          givenAnswers: [
            {
              questionId: "1a925f34-1f72-43f7-86c8-df8e0e6d656a"
              answers: [
               "535a7ee0-65eb-4f0c-8c73-71a68158f739",
               "0cf72a8d-7ec3-4dec-bce9-5ce78e49dd33",
               "0d062b7d-b6e5-43dd-9633-0b588dca4b0c"
            ]
            }
            {
              questionId: "89d250f9-e53e-4017-a4aa-90f426508467"
              answers: ["George Washington"]
            }
            {
              questionId: "12995a17-4d5f-4c5f-80ce-1398db7c0472"
              answers: [
                "3fbcf064-7bf5-40ee-af49-42a6c979a89c",
                "5f90891b-a7bd-42e0-9a65-3e194ad9286c",
                "0d4506f8-8ce6-4610-b304-56f6ef9aa2d5",
                "bb5840a5-7c2c-4fd3-bf5e-c3dcff66a148",
                "5dab754e-1d5e-4083-a21a-5ba86d04b3a6"
                
              ]
         }
       ]
        )
        {
         score 
          questions {
            question
            correct
            answered
            givenAnswers {
              answer
            }
            correctAnswers {
              answer
            }
          }
        }
      }
      ```
      The first id is the id of the quiz.     
      For answer to be correct you need to fill givenAnswers input:   
         - give id of 1 correct answer in [] if it is single answer question    
         - give ids of all correct answers in [] if it is multiple answer question   
         - give ids of all answers sorted in [] if it is sorting question (e.g. if answer1<answer2 then answer1.id is before answer2.id in submitted array)   
         - give one answer in [] if it is plain text answer question. Upper letters and double spaces don't matter   
      You need to remember that answered questions must belong to quiz and answers to theirs questions. Also, ids and answers for plain text answer questions are strings.    
      You can get overall score and view of which questions were answered correctly and what are correct answers.     

**Notes about fields**
- _possibleAnswers_ in question is what should be displayed for students (e.g. to choose one correct). _answers_ in questions are answers given by teacher.    
- _type_ in question returns string informing what is the type of the question - sorting, single answer etc.      
- only one of the fields _singleAnswer_, _multipleAnswer_, _sorting_ and _plainText_ in question can be marked as true, they are the ones that indicate the type of question.    

## More about the code
**ER diagram**   
![image](https://github.com/nkulakow/quiz-application/assets/117579584/9c77ccc0-5b68-49ee-b259-e185618f7cdc)   
Questions belong to the quiz. Answers, given by teachers, belong to questions.   

**Inputs**   
Given inputs are checked. If program notices an incorrectness, corresponing error is thrown. Custom exceptions are in the folder "src/excpetions/.   

**Services**   
- _AnswerService_ is responsible for managing "Answer" entity in DB - creating, finding one and updating anwers.   
- _QuestionService_ is responsible for managing "Question" entity in DB - creating, finding one, updating and removing questions. It uses injected _AnswerService_ to manage answers (because they depend on questions). It checks if given answer for specific question is correct.    
- _QuizService_ is responsible for managing "Quiz" entity in DB - creating, finding one, finding all, updating and removing quizes. Like _QuestionService_ it sometimes uses injected _QuestionService_ to manage questions. It allows to submit answers and to get a result.    

**Resolvers**    
- _QuestionResolver_ allows to add question to quiz, find one, update or remove question. It also resolves fields _type_ and _possibleAnswers_.     
- _QuizResolver_ allows to create quiz (with or without questions), find one/all, update or remove quiz and submit answers.   
 
**Tests**     
To run use `npm run test` or `npm test -- --testPathPattern=src/question/question.service.spec.ts` for specific file.   
Tested are: QuestionService and QuizService. Resolvers had to be tested "manually" (in GraphQL Playground).   
In tests database is mocked and needed methods are mocked individually in different unit tests (as there were different things needed).    

