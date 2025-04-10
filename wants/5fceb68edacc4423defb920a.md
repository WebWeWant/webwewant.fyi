---
title: I want to disable idle/background throttling when using a `CanvasCaptureMediaStream`
date: 2020-12-07T23:11:10.731Z
submitter: PRIVATE
number: 5fceb68edacc4423defb920a
tags: [ performance ]
discussion: https://github.com/WebWeWant/webwewant.fyi/discussions/733
status: discussing
---

Today, it's easily possible to build full live video mixers using existing APIs such as the `CanvasCaptureMediaStream`.  However, the capability is crippled by the browser attempting to optimize canvas drawing and `requestAnimationFrame` timers.  If the tab/window is backgrounded, drawing to the canvas stops and timers only run once per second.  This happens in all common user agents.

When a canvas is being captured, all of this throttling should be disabled.

If necessary, perhaps a permission/request can be made, similar to `WakeLock`.

The only workaround for this today is to use pop-up windows for the UI.  However, this has been proven to be less reliable, as browsers are starting to implement optimizations when the window is covered but not minimized.  Additionally, if the user minimizes the window, everything stops.  This is preventing the deployment of several video-related applications.
