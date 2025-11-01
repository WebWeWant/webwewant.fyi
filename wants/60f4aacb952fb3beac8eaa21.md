---
title: I want a token field element
date: 2021-07-18T22:27:23.367Z
submitter: Sam Henri-Gold
number: 60f4aacb952fb3beac8eaa21
tags:
  - html
  - forms
  - ux
discussion: https://github.com/WebWeWant/webwewant.fyi/discussions/425
status: discussing
related:
  - title: "HTML Standard - Forms"
    url: https://html.spec.whatwg.org/#forms
    type: spec
---

I want a standard, accessible HTML form element similar to macOS's token field for addresses and item tags.

Token fields (also known as tag inputs or chip inputs) are common UI patterns used across many applications for entering multiple discrete values like email addresses, tags, or categories. Currently, developers must create custom implementations using JavaScript, which often results in inconsistent accessibility and user experience.

A native token field element would provide:

- **Consistent user experience** across different websites and applications
- **Built-in accessibility** with proper ARIA attributes and keyboard navigation
- **Mobile-friendly interaction** patterns optimized for touch devices
- **Standardized styling** that can be customized with CSS while maintaining core functionality
- **Form integration** that works seamlessly with existing form submission and validation

This would be particularly valuable for:
- Email address entry (To, CC, BCC fields)
- Tagging systems (blog tags, categories, labels)
- Multi-select with custom values
- Contact lists and address management

By standardizing this common pattern, we can improve accessibility and reduce the JavaScript overhead currently required for this functionality.
