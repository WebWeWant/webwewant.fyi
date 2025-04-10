---
title: I want HTTPS security on local devices (routers, cameras, printers, etc.)
date: 2020-12-07T23:24:58.845Z
submitter: Anonymous
number: 5fceb9cafdfdc42a3f49240a
tags: [ security ]
discussion: https://github.com/WebWeWant/webwewant.fyi/discussions/720
status: discussing
---

There are many devices on a typical home LAN that have built-in web servers.  These include the configuration pages for routers, security cameras, printers, IP phones, and other devices.

By their self-hosted nature, these devices do not have a valid HTTPS certificate installed on them and are therefore not considered a secure origin.  Many current web features are only available to secure origins.  (For instance, you cannot install a home screen shortcut to a web page on Android, because that requires a PWA, which requires a Service Worker, which requires a secure origin.)

In practice, we end up with a couple scenarios:

 - No HTTPS.  Device is used without any security of the connection and anyone can simply packet sniff to get the data.  Additionally the page hosted on the device has no modern web capability.  Insecure, and incapable.

 - HTTPS, with a certificate you have to install.  Large hurdle for users, enables capability, but is highly insecure as the manufacturers are asking users to install *root certificates* so that their PWA works.

Back in the day, it was easy for a user to trust a self-signed certificate right from the security prompt.  This option is no longer available, which undoubtedly makes day-to-day browsing more secure, but hurts the security for local device usage by forcing insecure scenarios.  There needs to be some other way to trust a self-signed certificate in certain scenarios.