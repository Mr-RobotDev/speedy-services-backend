export default () => ({
  port: process.env.PORT || 8080,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  secrets: {
    forgotPassword: process.env.FORGOT_PASSWORD_SECRET,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  sendgrid: {
    key: process.env.SG_API_KEY,
    from: process.env.SG_FROM,
    activateAccountTemplate: process.env.SG_ACTIVATE_ACCOUNT_TEMPLATE,
    resetPasswordTemplate: process.env.SG_RESET_PASSWORD_TEMPLATE,
  },
  spaces: {
    cdn: process.env.SPACES_CDN_ENDPOINT,
    endpoint: process.env.SPACES_ENDPOINT,
    bucket: process.env.SPACES_BUCKET,
    region: process.env.SPACES_REGION,
    accessKey: process.env.SPACES_ACCESS_KEY,
    secretKey: process.env.SPACES_SECRET_KEY,
  },
});
