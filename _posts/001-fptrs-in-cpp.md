# Function pointers in C++
May 17, 2023

Hello there,

I've been writing an interpreter for the Monkey programming langugage in C++ for over a month now. It is nearing completion :)

One of the steps involved in acheiving a fully functional interpreter is writing a parser. The interpreter I'm writing uses [top-down operator precedence](https://tdop.github.io/) by Vaughan Pratt. It is also popularly known as Pratt parsing.

Thorsten cleanly implements pratt parsing by storing parse functions for each different token encountered. The implementation is actually quite simple....in Golang :(

The implementation, when translated into C++ demands storage, retrieval and invocation of function pointers.

#### Function pointers are deceptively easy

A lot of tutorials online cover the usage of function pointers in very trivial situations, but storing functions defined in different namespaces, spanning different classes, having different return types...is most definitely harder than it looks.

It took me more effort than I anticipated to wrap my head around them, and I wish to put my findings in this article.

### fptr syntax

```c++
void (*fptr)();
```

`fptr` is a pointer to a function that takes no arguments and has a `void` return type

```c++
int (*fptr)(int, int);
```

`fptr` is a pointer to a function that takes two `int` arguments and has an `int` return type

- function pointer that takes in two pointers and returns a pointer?

```c++
int *(*fptr)(int *, int *);
```

The function now takes two pointers to `int` as arguments returns another pointer to `int`

- what if the objects span across different namespaces and classes?

```c++
ns1::object *(*fptr)(ns2::object *, ns3::object *);
```

let `ns1`, `ns2` and `ns3` be namespaces defined in the project

`fptr` is a pointer to a function that takes two pointers of type `object` that belong to `ns2` and `ns3` and returns a pointer to `object` belonging to `ns1`.

- binding a function pointer to point only to functions belonging to a namespace/class?

```c++
ns1::object *(*generic::fptr)(ns2::object *, ns3::object *);
```

now `fptr` points to functions that are defined in the `generic` namespace or class

### typedef to the rescue

If you're working in a large project, you're bound to end up classifying objects into separate namespaces, and eventually end up with a large, ambiguous (and ugly) syntax.

This is where `typedef` comes to rescue. But how would you define a generic structure for a function pointer **and** use the typedef at other places in your code?

```c++
// no args
typedef ns1::object *(generic::*ftype1)();


// takes in args
typedef ns1::object *(generic::*ftype1)(ns2::object *);
```

`ftype` now represents the type of function pointers that point to functions defined inside of `generic` namespace or class **and** return pointer to an `ns1::object`

- usage

```c++
ftype ptr;
```

### Storing function pointers

let's say you want to store function pointers inside a collection, like `std::map` or `std::vector`

simple enough

```c++
// key = int
// value = function pointer that returns pointer to int
std::map<int, int *(*)()> ptr_map;

// using typedef
std::map<int, ftype> ptr_map;
```

### Assigning fptrs to functions

what's point of defining function pointers if you can't actually assign them to methods defined in your libraries

let us first define a method named `some_method` inside namespace `ns1`

```c++
// ns1.h
namespace ns1{
    std::string *some_method(){
        std::string hello = "hello";
        return &hello;
    }
}
```

syntax for assigning

```c++
#include <ns1.h>

// explicit conversion
std::string *(*fptr)() { &ns1::some_method };

// implicit conversion
std::string *(*fptr)() { ns1::some_method };

// vectors
ptr_vec.push_back(&ns1::some_method);

// make associations inside maps
ptr_map[0] == &ns1::some_method;

// when key is enum
ptr_map[some_enum::name] = &ns1::some_method;
```

### Invocation

Congrats! Now you know how to create function pointers and assign them to functions already defined. Let's invoke these pointers now:

first, let us retrieve a pointer we earlier stored in a map, and assign it to a variable

```c++
// simple right
std::string *(*fptr)() = ptr_map[0];

// fptr now points to the some_method function we wrote earlier
```

what about namespaces and classes?
not so simple :(

```c++
genericNs::object *(genericClass::*fptr)() = ptr_map["key"]
```

`fptr` now points to an instance of `genericClass`

if you're running this inside the `genericClass` object, the invocation looks like this

```c++
// inside genericClass scope

std::string *result = (this->*fptr)();
```

you have to use the `this` pointer to access the function the pointer points to, which is done by de-referencing `fptr`.

If invocation doesn't happen inside `genericClass` scope, then it's pretty straight-forward: de-reference the pointer and invoke.

### Example

- **Higher order functions**

A higher order function is a function that takes in one or more functions as arguments or returns a function

Let's see how we can implement this in c++

This is a short example on how a general purpose function can be written, that ***applies*** a function on other arguments.

Below is a demonstration of one such general purpose function. The `calculate` method takes in `area` method and applies it on the `radius` argument.

The usage here is simple enough, but the idea is powerful. This `calculate` method is now agnostic of the object being passed in, so we can now calculate the area of a square or a circle.

```c++
// fptrs.cpp
#include <iostream>
#include <string>

using namespace std;

typedef string (*string_fptr)();
typedef int (*int_fptr)(int);

string even_string()
{
    return "result is even";
}

string odd_string()
{
    return "result is odd";
}

string_fptr calculate(int_fptr function, int value)
{
    int result = (*function)(value);
    if (result % 2 == 0)
        return &even_string;
    return &odd_string;
}

int area(int radius)
{
    return 3.14 * radius * radius; // say pi = 3.14
}

int main()
{
    string result = (*calculate(&area, 5))();
    cout << result << endl;
    return 0;
}
```

quick check using `g++`

```console
g++ ./fptrs.cpp -o output
./output
# result is even
```

And.....this is how you use function pointers. Simple, yet powerful stuff.

Well, that's it for this article. See you in the next one :)


_~rahultumpala_