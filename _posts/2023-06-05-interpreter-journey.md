## I wrote an Interpreter in C++.

I've been wanting to write one for many years and I'm happy I finally took out the time this year to fulfill my wish.

I followed Thorsten Balls' book **Writing an Interepreter in Go**. It was tough reading the book in Go and writing code in C++. Nevertheless, it was worth it. I gained a ton of knowledge and 

In this post, I will outline the phases involved in writing an interpreter and share my learnings from this beautiful journey.

### Phases

The process of writing a fully functional interpreter can be divided into 3 phases:

1. Lexer
2. Parser
3. Evaluator


#### Lexer

If you're following Thorsten's book, you'll be writing an interpeter for the Monkey programming language. Assuming each monkey script file has an extension .monkey, the job of the lexer would be to read this file and tokenize it.

In layman terms, Tokens are objects that the interpreter uses to make sense of the code written. 

Going a bit deeper, Tokens are the internal represenation of words, characters like {, }, comma, [, ], arithmetic operators, boolean operators and so on... that each interpreter has, which it later uses in the parsing stage to perform lookahead, or to invoke different parsing functions based on the type of the token encountered.












