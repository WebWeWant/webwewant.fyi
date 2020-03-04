[![Netlify Status](https://api.netlify.com/api/v1/badges/770267f7-c04f-4418-aca2-3a377b1059e0/deploy-status)](https://app.netlify.com/sites/webwewant/deploys)

# The Web We Want

## What is it?

If you build websites, you inevitably run into problems. Maybe there’s no way to achieve an aspect of your design using CSS. Or maybe there’s a device feature you really wish you could tap into using JavaScript. Or perhaps the in-browser DevTools don’t give you a key insight you need to do your job. We want to hear about it!

## Adding Events

[File a new event issue](https://github.com/WebWeWant/webwewant.fyi/issues/new?assignees=&labels=event&template=new-event.md&title=Event%3A+EVENT+NAME+-+DAY+MONTH+YEAR) and then [follow the instructions for creating a new event](https://github.com/WebWeWant/webwewant.fyi/wiki/Managing-Events).

## Adding Wants

[File a new "want" issue](https://github.com/WebWeWant/webwewant.fyi/issues/new?assignees=&labels=want&template=new-want.md&title=New+Want%3A+YOUR+WANT+TITLE).

## Local development

### 1. Clone this repository:

```
git clone https://github.com/WebWeWant/webwewant.fyi.git webwewant.fyi
```


### 2. Navigate to the directory

```
cd webwewant.fyi
```

### 3. Install dependencies

```
npm install
```

### 4. Run Eleventy (builds the site)

```
npx eleventy
```

Or build automatically when a template changes:
```
npx eleventy --watch
```

Or in debug mode:
```
DEBUG=* npx eleventy
```
