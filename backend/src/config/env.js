const isProduction = process.env.NODE_ENV === 'production';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!isProduction) return 'dev-only-change-me';
  throw new Error('JWT_SECRET is required');
};

const getMongoUri = () => process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-notes-workspace';

module.exports = { getJwtSecret, getMongoUri, isProduction };
