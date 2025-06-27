import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        },
      },
    });
  };
}

export function IsNotCommonPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotCommonPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // List of common passwords to reject
          const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            'dragon', '1234567890', 'password1', '123123', 'admin123'
          ];
          
          return !commonPasswords.includes(value.toLowerCase());
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password is too common. Please choose a more secure password';
        },
      },
    });
  };
}

export function IsNotProfane(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotProfane',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          
          // Basic profanity filter - extend as needed
          const profaneWords = ['badword1', 'badword2']; // Add actual profane words
          const lowerValue = value.toLowerCase();
          
          return !profaneWords.some(word => lowerValue.includes(word));
        },
        defaultMessage(args: ValidationArguments) {
          return 'Text contains inappropriate content';
        },
      },
    });
  };
}

export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Allow letters, spaces, hyphens, apostrophes
          const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
          return nameRegex.test(value.trim());
        },
        defaultMessage(args: ValidationArguments) {
          return 'Name must contain only letters, spaces, hyphens, and apostrophes, and be 1-50 characters long';
        },
      },
    });
  };
}
