---
title: I want `Float.toFixed()` to take an optional argument to choose the rounding function
date: 2020-05-26
submitter: Kilian Valkhof
number: TBD
tags: [ javascript ]
discussion: https://github.com/WebWeWant/webwewant.fyi/discussions/55/
---

It’s relatively easy to turn a float into a number with a fixed set of decimals, but these decimals are always rounded. 4.445 will become 4.45 for example, which isn't always what you want.

This means that if you want to explicitly do a `floor` or a `ceil`, you have to resort to something like this

```js
const formattedNumber = Math.floor(number * 100) / 100
const formattedNumber = Math.ceil(number * 100) / 100
```

And neither of these is a particularly clear bit of JavaScript.

If `toFixed()` took an optional second argument—perhaps an object, for future extensibility—that would empower developers to choose an existing function or supply their own function to use in rounding the number, which would create a much nicer (and self-documenting) experience:

```js
// regular
const formattedNumber = number.toFixed(2);

// floor
const formattedFlooredNumber = number.toFixed(2, { rounding: Math.floor });

// ceil
const formattedFlooredNumber = number.toFixed(2, { rounding: Math.ceil });

// gamble
const formattedFlooredNumber = number.toFixed(
  2, 
  { rounding: Math.random() > 0.5 ? Math.floor : Math.ceil }
);

// custom
const formattedFlooredNumber = number.toFixed(
  2,
  { rounding: myCustomFunction }
);
```

The custom function could receive either the original number and the number of decimals, or get a float that needs to be rounded to an int. It can then convert that to a string with the proper number of decimals.
