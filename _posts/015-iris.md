# Iris for Elixir

October 27, 2025

Hello,

I write code in Java a lot more than I write code in Elixir.

Exploring a new Elixir codebase, revisiting my old Elixir repo took more time than needed. I wanted a better way to skim through an Elixir codebase, to visualize my Elixir code. This is the basis for writing Iris.

Iris is an Elixir library that visualizes your codebase and plots function call paths as an interactive graph in your browser.

## Features

- Applications
  - Lists all your modules that implement the `Elixir.Application` behaviour in a column.
  - These are clickable and select the chosen application when clicked.
- Modules
  - Lists all Elixir Modules in the selected application in a column.
  - These are clickable and select the chosen module when clicked.
- Functions
  - Lists all functions of the selected module, both public and private in a column.
  - Iris denotes all recursive functions by placing an icon beside the respective function in the column.
- Documentation
  - Iris distinguishes modules and functions that have documentation against those that do not, by placing an interactive icon beside the modules, functions that have docs.
  - Iris uses ExDoc to generate documentation for modules, public functions and renders the doc in your browser.
- Function Call paths
  - Iris reads through your code and generates function call paths for each function.
  - In the default view only the selected function, callers and callees are shown.
  - Any function that is invoked by the selected function can be clicked, to expand the function call path.
  - Terminal functions that do not have any outgoing call paths cannot be clicked. These can be visually distinguished by looking at the styling.
- Hosting
  - The Iris view of your library can be hosted in hexdocs.pm and linked to in hex.pm. This opens up your library to everyone already reading documentation of your library on hexdocs.pm
  - In fact, the IrisUI of iris repo itself is hosted on hexdocs.pm at [https://hexdocs.pm/iris/irisui.html](https://hexdocs.pm/iris/irisui.html)!
  - Steps to implement this can be found in [iris github repository](https://github.com/rahultumpala/iris)

## Screenshot

<figure>
<img src="../../source_code/iris/screenshot.png" width="640" height="360">
</figure>

## Contribution

Feel free to open a github issue describing your problem in integrating iris with your project. This project's implementation can be improved a lot, pull requests that improve the codebase/address any issues are welcome.

---

I will continue to improve Iris with newer features.

Thanks for reading!

_~rahultumpala_