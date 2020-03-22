# RenCloud OTP Gen

One Time Password Generator PWA.

Progressive web application to generate Time-based One Time passwords.
This application can work offline and can be installed as a normal
application on mobile devices. Supports cloud-based import/export of secrets.

Application is available on [ren-otp.netlify.com][webapp].

[![Netlify Status](https://api.netlify.com/api/v1/badges/3ed5d499-a469-4cdc-8589-aa41001c151c/deploy-status)](https://app.netlify.com/sites/ren-otp/deploys)

## Warning ⚠

This application is deprecated and is no longer being developed.

Please, use [Authy][authy], [Aegis][aegis] or [any][googleauth] [other][microsoftauth] similar application instead.

## Production build

```
npm install --only=dev
npm build
```

## Dev build

These commands will start a local development server.

```
npm install --only=dev
npm start
```

## Server

Sync server's source code is availale
in a separate [repository][serverrepo].

[webapp]: https://ren-otp.netlify.com
[authy]: https://authy.com/download/
[aegis]: https://getaegis.app/
[googleauth]: https://support.google.com/accounts/answer/1066447
[microsoftauth]: https://www.microsoft.com/en-us/account/authenticator
[serverrepo]: https://github.com/rensatsu/otp-gen-server
