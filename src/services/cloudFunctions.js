// services/cloudFunctions.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

export const sendContactMessage = async (data) => {
  try {
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    const result = await sendEmailFunction(data);
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

