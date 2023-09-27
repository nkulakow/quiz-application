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

   You can get id of the created quiz and all of other information about it.

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
