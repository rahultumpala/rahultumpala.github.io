#  Writing a Regex matcher
May 16, 2024

I've been trying to solve a problem for over a year, to write a working regex engine. I am now a step closer to it. I solved the leetcode hard problem [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/description/) and I am happy!

I first attempted solving this problem on Jun 10, 2023, right after completing the book, writing an interpreter in Go. I thought I could solve this with my newfound knowledge on writing a parser and a simple state machine. I was quickly humbled though.

I realized that my knowledge gap wasn't in implementing a parser or a state machine, it was the fact that I didn't know how to simplify complex thoughts and present them elegantly. I gave up a day later and I haven't attempted the problem until yesterday, when I actually solved it.

In the past 11 months, I completed the whole book [Crafting Intepreters](https://craftinginterpreters.com/), learnt a TON of things, and realized that I had actually known little when I first tried to solve the problem. Along with reading the book, I started solving the [CSES problemset](https://cses.fi/problemset/), to reinforce my fundamental concepts. This played a key role in finally being able to solve the problem.

Although I haven't written a fully functional state machine powered regex engine, this is a good first step in the right direction.

I'd like to show you my code and walk you through it.

#### Problem statement

Given an input string s and a pattern p, implement regular expression matching with support for '.' and '\*' where:

'.' Matches any single character.​​​​
'\*' Matches zero or more of the preceding element.
The matching should cover the entire input string (not partial).

Ex:  \
s = "aab"  \
p = "c*a*b"  \
result = true

#### my code


```c++
bool isMatch(string s, string p) {
    auto matching = [](char c, char pattern) -> bool {
        if (pattern == '.')
            return true;
        return pattern == c;
    };

    int stars_cnt = 1;
    for(char c: p) stars_cnt += (c == '*') ? stars_cnt + 1 : 0;

    int i = 0, l = 0, n = s.size();
    vector<int> visit_cnt(s.size(), 0);
    // store   l, i - to backtrack when match doesn't occur
    stack<pair<int, int>> stk;
    while (i < p.size()) {
        char c = p[i], next = (i + 1 == p.size() ? 'X' : p[i + 1]);
        if (next == '*') {
            while (l < n && matching(s[l], c)) {
                // match occurred & hence this op can be backtracked in
                // future mismatches
                if(visit_cnt[l] <= stars_cnt) {
                    stk.push({l, i + 2});
                    visit_cnt[l]++;
                }
                l++;
            }
            if(l != n)
                stk.push({l, i+2});
            i += 2;
        } else if (l < n && matching(s[l], c)) {
            l++;
            i++;
        } else {
            if (stk.empty())
                return false;
            l = stk.top().first;
            i = stk.top().second;
            stk.pop();
        }
    }
    return l == n;
}
```


Reading through the problem statement, we can deduce there'll be only 4 cases to deal with:

1. a dot
2. a character
3. a dot and a star
4. a character and a star

(we will refer to these as tokens from now on)

The first two cases are easy to check for a match...as long as there are no star characters in the pattern.

Matching becomes tricky when there are star chars in the pattern, because they signify zero or more matches of the preceding character.

From the pattern string in the example described above:  \
    input string = aab  \
    c* consumes in zero chars in the input string  \
    a* consumes two chars  \
    b consumes one char

This is simple, consider the following cases:


1. pattern = a\*ab  \
   input string = aaab

2. pattern = .*..  \
   input string = ab

Naively consuming all matching characters when a star is being processed will not work here.

From the second example we can deduce that there should be some mechanism that allows us to match an arbitrary number of characters from the input string while processing the star pattern and resume processing the next token from any point in this arbitrary length.

This calls for remembering the number of characters consumed per each star token and index of the token succeeding the star token. I figured I should use recursion and use the function call stack as our remembrance memory, but I felt the implementation would be too verbose and confusing, but implmenting the same thing iteratively would be easier and elegant.

The concept of using a while loop with some driving params & resetting these driving params based on some condition is like invoking a function with the said diriving params, except all of this is done iteratively. Just beautiful.

The stack in my code does this exact part. It stores the driving params of the while loop incase I decide to backtrack on my steps and begin processing the token succeeding the star token.

```c++
// store    l, i - to backtrack when match doesn't occur
stack<pair<int, int>> stk;
```

`l` here stores the current index of the input string
`i` stores the current index of the pattern string

we use `pattern[i]` and `pattern[i+1]` to decide the current token

if `i+1` exceeds the bounds of pattern we ignore the succeeding character while deciding the token.

| #   | pattern[i] | pattern[i+1] |      token       |
| --- | :--------: | :----------: | :--------------: |
| 1   |    dot     |  not a star  |       dot        |
| 2   | character  |  not a star  |    character     |
| 3   |    dot     |     star     |    dot & star    |
| 4   | character  |     star     | character & star |

For cases 3 and 4, we need to push all the matching characters into the stack. I wrote a helper method to decide if the token and char in the input string match.

```c++
auto matching = [](char c, char pattern) -> bool {
    if (pattern == '.')
        return true;
    return pattern == c;
};
```

A dot matches any lowercase character and if the pattern is not dot, just check if both are the same. I make sure star characters are not passed into the matching function. By the way, this is the functor syntax of declaring functions inside another functions. Return type is not needed explictly here but it is needed for functors that describe recursive functions.

For cases 1 and 2, when successful matches occur we can proceed further until the end of the string. When matches do not occur, we backtrack our steps and pop from the stack. Remember, the stack contains the init params of our recursion. Simply, pop from the stack and reset `l` and `i`.

The process repeats again.

Note this piece of code:
```c++
if(visit_cnt[l] <= stars_cnt) {
    stk.push({l, i + 2});
    visit_cnt[l]++;
}
```
We keep count of the number of times a char is added into the stack. This is the max number of times we can backtrack this step, obviously we cannot do this forever.

```c++
int stars_cnt = 1;
for(char c: p) stars_cnt += (c == '*') ? stars_cnt + 1 : 0;
```

`stars_cnt` is the max times we can backtrack a char. This is a cumulative prefix sum of the number of star characters in the pattern.

That's it. Simple mini-regex matcher.

See you in the next one.

_~rahultumpala_