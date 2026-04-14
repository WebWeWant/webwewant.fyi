---
title: I want 2D matrix dropdown form inputs
date: 2024-01-21T11:00:18.245Z
submitter: Christoph Paper
number: 18b2eec2-49ad-410f-be86-c20aaac2dfe9
tags:
  - html
  - forms
discussion: https://github.com/WebWeWant/webwewant.fyi/discussions/656
status: discussing
related:
  - title: HTML select element
    url: https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element
    type: spec
  - title: "EN 13402: Size designation of clothes"
    url: https://www.iso.org/standard/46154.html
    type: note
---

Many products require two-dimensional size or variant selection where both dimensions must be chosen together and most combinations are valid. Clothing is a common example: jeans require a girth and a length, bras require a girth and a cup size, and shoes sometimes require a length and a width (as defined in EN 13402-2). The same pattern applies to many other multi-attribute selections in forms, such as shirt size plus color, date components (day plus month), or typography settings (weight plus style).

Today, authors must implement this with two separate `<select>` elements and JavaScript to coordinate them, which is error-prone, inaccessible, and verbose. I want a native two-dimensional matrix mode for `<select>` that lets users pick a row and a column value simultaneously, clearly communicating the paired nature of the choice.

```html
<select type="matrix" name="size">
  <option row="XS" col="30">XS / 30</option>
  <option row="XS" col="32">XS / 32</option>
  <option row="S"  col="30">S / 30</option>
  <option row="S"  col="32">S / 32</option>
  <option row="M"  col="32">M / 32</option>
  <option row="M"  col="34">M / 34</option>
</select>
```

The submitted value could be the concatenation of both axes (e.g., `XS/30`) or a structured pair, while the UI would render as a matrix or grid so the user can clearly see which combinations are available. Unavailable combinations could be disabled or hidden. This would benefit accessibility by making the relationship between the two dimensions explicit to assistive technologies, and reduce the amount of JavaScript needed for common e-commerce and data-entry scenarios.
