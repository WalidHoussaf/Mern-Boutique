import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'abc123';
  const expiration = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign(
    { id },
    secret,
    { expiresIn: expiration }
  );
};

export default generateToken; 