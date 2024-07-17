# Static Site Generation with Bash
July 15, 2024
This website is generated using only bash. Understand how.

This website is generated using only bash. Read on to understand why & how.

One of the simplest ways to understand a seemingly complex concept is by just going through it.

A skim read or a hands on project or a full blown documentation dive, all of these work, and this is exactly how I built my shell scripting skills.

## Why?

I like writing code, writing tools that make lives easier, even if only by a little bit. Earlier, I used Jekyll, the static site generation tool, to generate this blog. It was working well, but it needed Ruby and RubyGems to be installed. It felt inconvenient and unacceptable. I already had GCC installed in my Windows pc that I use for development and it comes preinstalled in most linux distros too.

_I wanted software that didn't ask me to install other software for it to run._

Software built with zero dependency rule is self sustained software, it's beautiful in a way and is complete, truly. The idea of having control over every tiny little corner is soothing to the dev soul and is irreplacable. Diving into the zero-dependency rabbit hole will take you places.

I wanted something simple, offering me full control, runs as long as linux is alive and doesn't require sudo access to install.

Shell scripting was the obvious answer. Since I used jekyll to build the site, I wanted to make sure the shell output will also resemble the existing one without additional changes.


## How?

The entire requirement can be condensed into the flow:

```
                            [Markdown Blog Post]
                                    |
                                    v
                                [HTML Post]
                                    |
                                    v
        [Generate HTML HomePage with Links to all posts (newest first)]
                                    |
                                    v
                        [Maintain backwards compatibility]
```

I use `lowdown` to convert from Markdown to HTML.

The generated HTML only contains headers, paragraphs and everything else included in the markdown post. This is not sufficient to build a HTNL page that has the required styling. The solution is rather simple, have predefined layouts. 

Output of `lowdown` can be put inside a `post.html` that has a set placeholder for the content. Write the output into `content.html`

```shell
lowdown post.md -thtml --html-no-escapehtml --html-no-skiphtml -o content.html
```

Replace the placeholder in `post.html` with the contents of `content.html`. It can be done with `sed`.


```shell
# replace __content__ with whatever is inside content.html
    sed "/__content__/{
        s/__content__//g
        r content.html
    }" _layouts/post.html >_site/blog_post.html
```

`s/__content__//g` replaces  `__content__` with empty char `g`lobally.
`r content.html` reads `content.html` 
`>_site/blog_post.html` writes the output to `blog_post.html` inside `_site` directory.

This syntax was practically everything I needed. An additional `-i` flag can be given to `sed` to perform the substitutions in place.

Title is taken from first line of the markdown file, Date from second line and seo description is taken from the third line.

To extract the text from a given line in a file, assuming `CR` (carriage return) is the terminating character of each line, `awk` can be used.

```shell
awk "NR == 2" _posts/post.md
```

This returns the first line of `post.md`. `NR` stands for `NumRecord`. `CR` is the default record terminator in awk.

I used the `date` library present in linux core-utils to perform date conversion.

```shell
date --date="July 15, 2024" "+%d %b %Y"

# returns 15 Jul 2024
```

The output format is used to represent dates in the homepage.

A bit of code organization into functions and using the cryptic function syntax like `$1` to get first argument and `$@` to get all arguments...and we're done.

The whole script is around 190 lines with 153 loc (lines of code). It's available on my [github repo](https://github.com/rahultumpala/rahultumpala.github.io/blob/main/gen.sh) for this site.

I've never written a shell script before even a simple oneliner script. This project has been quite a learning experience for me and a rewarding one too.

~_rahultumpala_