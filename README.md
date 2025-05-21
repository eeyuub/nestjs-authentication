<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

A NestJS application with JWT authentication and role-based access control.

## Features

- JWT Authentication
- Role-based access control (RBAC)
- Modular database configuration
- User management with roles
- Guards and decorators for route protection
- Clean, modular architecture
- Password reset functionality with email notifications
- Account management (close/reactivate account)
- Default admin user creation
- Email service for notifications

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── decorators/        # Custom decorators (e.g., @Roles, @CurrentUser)
│   ├── dto/               # Data Transfer Objects for auth
│   ├── guards/            # Guards for route protection
│   ├── strategies/        # Passport strategies (JWT)
│   ├── auth.controller.ts # Auth endpoints
│   ├── auth.module.ts     # Auth module configuration
│   └── auth.service.ts    # Auth business logic
├── config/                # Configuration module
│   ├── config.module.ts   # Environment variables configuration
│   └── validation.schema.ts # Joi validation schema for env vars
├── db/                    # Database module
│   └── db.module.ts       # TypeORM configuration
├── email/                 # Email module
│   ├── templates/         # Email templates (Handlebars)
│   ├── email.module.ts    # Email module configuration
│   └── email.service.ts   # Email sending service
├── init/                  # Initialization module
│   ├── init.module.ts     # Init module configuration
│   └── init.service.ts    # Default admin user creation
├── users/                 # Users module
│   ├── dto/               # Data Transfer Objects for users
│   ├── entities/          # User entity
│   ├── enums/             # Role enum
│   ├── users.controller.ts # User endpoints
│   ├── users.module.ts    # Users module configuration
│   └── users.service.ts   # User business logic
├── app.controller.ts      # Main app controller
├── app.module.ts          # Main app module
├── app.service.ts         # Main app service
└── main.ts                # Application entry point
```

## Project setup

```bash
# Install dependencies
$ npm install

# Create .env file (copy from .env.example)
$ cp .env.example .env
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile (Authenticated users)
- `POST /auth/forgot-password` - Request password reset email
- `POST /auth/reset-password` - Reset password with token
- `PATCH /auth/change-password` - Change password (Authenticated users)
- `DELETE /auth/close-account` - Close account (Authenticated users)
- `PATCH /auth/reactivate-account` - Reactivate closed account (Authenticated users)

### Users

- `GET /users/profile` - Get current user profile (Authenticated users)
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin and Moderator)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

## Role-Based Access Control

The application uses a role-based access control system with the following roles:

- `USER` - Basic user role
- `MODERATOR` - Can view user details
- `ADMIN` - Full access to all endpoints

You can extend the roles by adding more values to the `Role` enum in `src/users/enums/role.enum.ts`.

## Using Guards and Decorators

### Role-Based Access Control

To protect routes with role-based access control:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('example')
export class ExampleController {
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminOnlyEndpoint() {
    return 'This endpoint is accessible only to admins';
  }
}
```

### Current User Decorator

The application provides a convenient `@CurrentUser()` decorator to easily access the authenticated user in your controllers:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('example')
export class ExampleController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

This decorator extracts the user object from the request, which is populated by the JWT strategy during authentication.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit the [Discord channel](https://discord.gg/G7Qnnhy).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
