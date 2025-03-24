# Handling binary data in Elixir
March 24, 2025

Hello,

I like functional programming and the associated benefit/safety of immutable data structures.

I finished reading [Elixir in Action](https://www.manning.com/books/elixir-in-action) and I find it incredibly well written. Along with that, I've been solving challenges on the [hackattic](https://hackattic.com) website using Elixir lang. It has given me the opportunity to work with binaries while decoding base64 encoded data, reading `.wav` and `.rdb` files.

In the beginning it was difficult to even read a fixed number of bytes but I've slowly started to appreciate the macros and the pattern matching constructs of the Elixir lang that have made the process much simpler.

I'd like to show you a few techniques that I think will help you.
### Types

In Elixir, binaries and bitstrings are represented using the special form `<<>>` available as `Kernel.<<>>`. There are a few types available but we will focus on `bitstring`, `binary` and `integer`.

- _`bitstring`_ - as the name suggests, a sequence of bits.
- _`binary`_ - a sequence of bits but the # of bits is a multiple of 8, i.e, a sequence of bytes
- _`integer`_ - an 8bit number

In addition, the above types can be paired with `unit` and `size`.

From docs:
> The length of the match is equal to the unit (a number of bits) times the size (the number of repeated segments of length unit).

Combining {type, unit, size} combo with Elixir's pattern matching construct is what makes working with binary data a breeze.

See the following examples for a better understanding.

### Working with bits

To fetch the two most significant bits of an 8 byte integer

```elixir
<< first_two::bitstring-size(2), rest::bitstring >> = number
```

It is important to note that `rest` is not guaranteed to be a `binary` and hence it is safe to use `bitstring`.

You can go further and pattern match on the `first_two` bits to see what they represent

```elixir
case first_2 do
    <<0::2>> ->
        IO.puts("ZERO")

    <<0::1, 1::1>> ->
        IO.puts("ONE")

    <<1::1, 0::1>> ->
        IO.puts("TWO")

    <<1::1, 1::1>> ->
        IO.puts("THREE")
end
```

Know that `<<0::2>>` is equivalent to `<<0::1, 0::1>>`.

### Endianness

To read a signed 32bit integer in little endian from a bitstring

```elixir
<< number::integer-signed-32-little, rest::bitstring >> = data
```

likewise, to read an unsigned 64bit integer in big endian

```elixir
<< number::integer-unsigned-64-big, rest::bitstring >> = data
```



### Bonus

If you're interested in how a Base64 deocder can be written, check out [my implementation](https://github.com/rahultumpala/hackattic/blob/master/lib/the_redis_one/base64.ex) here.

As always, the official [elixir documentation](https://hexdocs.pm/elixir/Kernel.SpecialForms.html#%3C%3C%3E%3E/1) is your best friend.

_~rahultumpala_