---
title: The ability to specify `line-spacing` instead of `line-height`
date: 2020-07-06T14:47:13.204Z
submitter: ephys
number: 5f033971446abbbbcfbdab4a
tags: [ css ]
status: in-progress
related:
  - title: CSS Inline Layout Module Level 3
    url: https://www.w3.org/TR/css-inline-3/#leading-trim
    type: draft
  - title: "Leading-Trim: The Future of Digital Typesetting"
    url: https://medium.com/microsoft-design/leading-trim-the-future-of-digital-typesetting-d082d84b202
    type: article
---

Currently if you want to add spacing between two lines, you need to use `line-height.` This property has the annoying effect of always adding an amount of spacing above and below the block of text.

I’d suggest something like `line-spacing` that would, instead, specify how much spacing should be added between lines only. No padding would be added at the bottom and top of the block of text.
