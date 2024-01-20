---
title: Writing a JSON Parser in C
---

# Writing a JSON Parser in C

This post is long overdue.

Grab a coffee, this is an in-depth article and will take a while.

Newly equipped with the knowledge of writing a parser and a compiler for the makeshift programming language called [lox](https://craftinginterpreters.com/the-lox-language.html), I was determined to do something on my own, without relying on any tutorials. I decided to start with the simplest of all, a JSON Parser. I completed writing a JSON Library called **_blason_** in the beginning of December 2023, this blog is a walkthrough of the incredible journey.

_JSON (JavaScript Object Notation)_

_JSON is omnipresent - me (2023)_

## Grammar

JSON is a data interchange format and its structure can be described using a context-free grammar. Presence of context-free grammar implies a recursive descent parser can be written, and that is what I did.

The McKeeman form of JSON grammar is loosely described in a side note on the [JSON org site](https://www.json.org/json-en.html), however the details can be found in the [redirect](https://www.crockford.com/mckeeman.html). If you're familiar with the Backus-Naur Form(BNF) grammar, then McKeeman form is only a simplified version of it.

> Douglas Crockford, the creator of JSON had business cards with the whole grammar printed on the back of them! [Image](https://github.com/rahultumpala/blason/blob/master/grammar.png)

A simplified flow of the structure, visually:

![](https://www.json.org/img/object.png)

More visuals can be found [here](https://www.json.org/json-en.html).

Broadly speaking, the entire notation can be described as follows:

1. An object contains members
2. A member contains pair(s)
3. A pair contains a key(always a string) and a value
4. A value can contain a terminal symbol, an array or another object.
5. An array contains element(s)
6. An element contains value(s)


## Parser

Okay, now that we have the entire flow in our mind, it's time to start writing the parser.

The whole process is divided into the following two steps:
1. Lexer
2. Syntax Parsing

We'll start with the Lexer.

### Lexer

This stage is also referred to as **_Tokenizing_**.

Our implementation of the lexing phase involves reading the entire file into memory and then performing the tokenization.It's simpler to begin with, although it can be improved to read from a stream and perform tokenization on the fly.

Goal: Read each character from the json file and convert the character(s) into tokens, if valid and recognized by the specification.

Before we start reading the file, let us define the `Token` struct and the `TokenType` enum.

```c
typedef enum {
    LBRACE,
    RBRACE,
    LSQUARE,
    RSQUARE,
    NUMBER,
    STRING,
    COLON,
    COMMA,
    TRUE,
    FALSE,
    NIL,
    TOKEN_EOF,
} TokenType;

typedef struct {
    TokenType type;
    int length;
    char *value;
} Token;
```

All streams of characters that are valid and recognized by the specification will be converted into a `Token` struct and be given the respective `TokenType` enum. This is the heart of our parser. These two composite types will be used by the Lexer and the syntax analyzer.

Also, while we are here, let us define two more structs called `Lexer` that holds references to the `start` and `current` positions of our character stream, and `Parser` that holds references to `current` and `previous` tokens.

```c
typedef struct {
    char *start;
    char *current;
} Lexer;

typedef struct {
    Token *previous;
    Token *current;
} Parser;
```

Now, to read the file.

1. Load the file into a file descriptor
2. Seek to the end, allocate a buffer with capacity of file size
3. Read characters into the buffer
4. Close the file, return the buffer

```c
static char *readFile(const char *path) {
    FILE *file;
    file = fopen(path, "rb");
    if (file == NULL) {
        fprintf(stderr, "Could not open file \"%s\".\n", path);
        exit(74);
    }

    fseek(file, 0l, SEEK_END);
    size_t fileSize = ftell(file);
    rewind(file);

    char *buffer = (char *)malloc(fileSize + 1);
    if (buffer == NULL) {
        fprintf(stderr, "Could not allocate enough memory to read \"%s\".\n", path);
        exit(74);
    }

    size_t bytesRead = fread(buffer, sizeof(char), fileSize, file);
    if (bytesRead < fileSize) {
        fprintf(stderr, "Could not read file \"%s\".\n", path);
        exit(74);
    }

    buffer[bytesRead] = '\0'; // null byte

    fclose(file);
    return buffer;
}
```
We point the lexer to the beginning of the buffer.

```c
static void lex(char *path) {
    lexer.start = readFile(path);
    lexer.current = lexer.start;
}
```

Since we need to be tokenizing one token at a time, we will need to _advance_ one token at a time. There is a handy method to do that.

```c
static void advance() {
    parser.previous = parser.current;
    parser.current = scanToken();
}


static Token *scanToken() {
    skipWs();
    lexer.start = lexer.current;

    if (end())
        return createToken(TOKEN_EOF);
    char c = *lexer.current++;

    if (isAlpha(c))
        return literal();
    if (isDigit(c) || c == '-')
        return number();

    switch (c) {
    case '{':
        return createToken(LBRACE);
    case '}':
        return createToken(RBRACE);
    case '[':
        return createToken(LSQUARE);
    case ']':
        return createToken(RSQUARE);
    case ':':
        return createToken(COLON);
    case ',':
        return createToken(COMMA);
    case '"':
        return string();
    default:
        fprintf(stderr, "Unknown character '%c'.\n", c);
        exit(74);
    }
}
```

> **fprintf()** is used to write characters to an output stream such as stdout or stderr, while **printf()** is used to write to stdout.

`skipWs()` discards all the whitespaces in our character stream, since our parse will be expected to work on a _minified JSON_ string as well.

`end()` checks if current char is the null byte, which marks the end of our character stream. `TOKEN_EOF` is used to mark the end of our token stream.

`isAlpha()` and `isDigit()` check if current char is an alphabet or a digit, respectively.

`createToken(tokenType)` is a generic function that creates a token struct with the given tokenType.

```c
static Token *createToken(TokenType type) {
    Token *token = (Token *)malloc(sizeof(Token));
    token->type = type,
    token->length = (int)(lexer.current - lexer.start),
    token->value = lexer.start;
    lexer.start = lexer.current;
    return token;
}
```

We **need** to use `malloc` here, we can't use just a designated initializer and return the object, because the created object's life ends when the function returns, and the object will be removed from the _stack memory_. `malloc` returns a pointer to the _heap memory_ which is long lived.

### Syntax Parsing

Alright, now that we have our token stream, we can start analyzing it and putting the tokens into their respective structures.