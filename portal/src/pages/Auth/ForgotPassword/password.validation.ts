export const passwordValidation = {
  required: 'Password is required',
  minLength: {
    value: 8,
    message: 'Password must be at least 8 characters',
  },
  pattern: {
    value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
    message:
      'Password must include 1 uppercase, 1 number, and 1 special character',
  },
};
