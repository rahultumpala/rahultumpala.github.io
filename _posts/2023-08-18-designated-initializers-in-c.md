---
title: Designated Initializers in C
---

# Designated Initializers in C

I've been writing a lot of code in the C programming language lately, and I came across a strange looking syntax used to initialize structs. Honestly, I did not expect the C lang type system to have such an initialization syntax. It felt good :)

Let's get into it.

First let us define a `struct Point` that consists of two members `x` and `y`.

```c
typedef struct {
    int x;
    int y;
} Point;
```
How do you initialize the struct locally?

The usual way would be to declare a variable of the struct type and set its fields one by one. Something like this:

```c
Point point1;

point1.x = 6;
point1.y = 9;
```

Looks good, but the language spec allows for something more artsy, called as a **Designated Initializer**

```c
Point point1 = {
        .x = 6,
        .y = 9
    };
```

According to GCC:

> Standard C90 requires the elements of an initializer to appear in a fixed order, the same as the order of the elements in the array or structure being initialized.
>
> In ISO C99 you can give the elements in any order, specifying the array indices or structure field names they apply to, and GNU C allows this as an extension in C90 mode as well. This extension is not implemented in GNU C++.

The order while initializing no longer needs to be preseved, the elements can be arbitrarily placed inside the designator.

### Designator syntax

> The ‘[index]’ or ‘.fieldname’ is known as a designator.

```c
// struct
struct <name> <var> = { .<member> = <expression> ( , .<member> = <expression> )* };

// union
union <name> <var> =  { .<member> = <expression> };

// array 1D
<type> <var>[] = { [<index>] = <value> };

// array 2D
<type> <var>[][] = { [<x>][<y>] = <value> };
```

Scalar and Aggregate types in C:

Arithmetic types and pointer types are collectively called scalar types. Array and structure types are collectively called aggregate types

### Initializing aggregate types

**Array**

Array initialization can be more expressive when using designated initializers. This is especially useful when dealing with multi-dimensional arrays.

```c

// 1D
int array[2] = { [0] = 100, [1] = 101 };
int array[2] = { 100, [1] = 101 };

// 2D
int matrix[2][2] = {  [0][0] = 1, [0][1] = 1,
                      [1][0] = 1, [1][1] = 1 };  // much more readable
int matrix[2][2] = {   { 0, 0},
                       [1][0] = 1, [1][1] = 1   }
```

**Struct**

```c
// defining the struct and declaring a variable at the same time
struct box {
    int length;
    int breadth;
} rect = { .length  =  100,
           .breadth =  50  };

// nested structs can be initialized too
typedef struct  {
    struct Engine {
        int capacity;
        int cylinders;
    } engine;
    char *model;
    float weight;
} Car;

char *m = "sedan";
Car ford = { .engine.capacity = 1483,
             .engine.cylinders = 4,
             .model =  m,
             .weight = 601 // performs an implicit cast
            };
```

**Union**

```c
union A {
    uint8_t b;
    double c;
};

union A dummy = { .c = 99 }; // converts 99 to double
```


### Where can this be used ?

An interesting and a not so obvious example is a multi-dimensional array of structs.

Consider this: you are writing a calculator program and you want to invoke the negation function when you encounter a `minus (-)` token in the prefix position and the subtraction function when you find it in an infix position.

A classic solution is to have an `nx3` table that holds function pointers in the first two columns and the precedence value of the arithmetic operator in the final column. Infact, this table is the outline of an implementation of Top Down Operator Precedence parsing.

```
+++++++++++++++++++++++++++++++++++++++++++++++++++++
+                +               +                  +
+    prefixFn    +    infixFn    +    precedence    +
+                +               +                  +
+++++++++++++++++++++++++++++++++++++++++++++++++++++
+                +               +                  +
+    negate      +   subtract    +        0         +
+                +               +                  +
+++++++++++++++++++++++++++++++++++++++++++++++++++++
```

Using the above layout, it's easy to register the parse functions for the `MINUS` token by using a desginator, like this:

```c
typedef struct {} token;

typedef enum { MINUS, PLUS } tokenType;

typedef struct {
    void (*prefixFn) (token value);
    void (*infixFn ) (token left, token right);
    uint8_t precedence;
} table;

// enum is technically an unsigned int and can be used as index
table rules[] = { [MINUS] = {negate, subtract, 0},
                  [PLUS] =  {NULL,   add,      0} };
```

This makes code easier to read, and to modify, and for this exact reason, table driven testing is not uncommon.

Hope you found this as fascinating as I did.

_~rahultumpala_