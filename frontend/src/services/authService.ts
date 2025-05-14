import axios from '../api/axios';
import api from '../config/api';

interface RegisterData {
  name: string;
  full_name: string;
  number: string;
  email: string;
  password: string;
  bank_account_number: string;
  bank_account_balance: string;
}

interface Data {
  name: string;
  full_name: string;
  number: string;
  email: string;
  password: string;
  bank_account_number: string;
  bank_account_balance: string;
  role: string; // <- required for createUser
}


interface LoginData {
  email: string;
  password: string;
}

// Register API call
export const registerUser = async (userData: RegisterData) => {
  try {
    // Validate bank account balance
    const balance = parseFloat(userData.bank_account_balance);
    if (isNaN(balance) || balance < 0) {
      throw new Error('Please enter a valid number for bank account balance');
    }

    // Prepare the request body with required fields
    const body = {
      ...userData,
      role: 'user',  // Add the required role field
      bank_account_balance: balance  // Send as number
    };
    
    console.log('Sending registration request to:', api.defaults.baseURL + '/api/users');
    console.log('Request body:', body);
    
    const response = await api.post('/api/users', body);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    // Handle different types of errors
    if (error.response?.data?.errors) {
      throw new Error(JSON.stringify(error.response.data.errors));
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check if the backend server is running.');
    } else if (error.response?.status === 500) {
      throw new Error('Internal server error. Please try again later.');
    } else {
      throw new Error('Registration failed. Please check your details and try again.');
    }
  }
};

// Admin create user API call (with role selection)
export const createUser = async (userData: Data) => {
  try {
    const balance = parseFloat(userData.bank_account_balance);
    if (isNaN(balance) || balance < 0) {
      throw new Error('Please enter a valid number for bank account balance');
    }

    const body = {
      ...userData,
      bank_account_balance: balance
    };

    console.log('Sending create user request to:', api.defaults.baseURL + '/api/users');
    console.log('Request body:', body);

    const response = await api.post('/api/users', body);
    console.log('Create user response:', response.data);
    return response.data;

  } catch (error: any) {
    console.error('Create user error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.data?.errors) {
      throw new Error(JSON.stringify(error.response.data.errors));
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else {
      throw new Error('Creating user failed. Please try again.');
    }
  }
};


// Login API call
export const loginUser = async (credentials: LoginData) => {
  try {
    // Validate credentials
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    console.log('Sending login request with:', {
      email: credentials.email,
      passwordLength: credentials.password.length
    });

    const res = await axios.post('users/login', credentials);
    
    console.log('Login response:', {
      statusCode: res.status,
      data: res.data
    });

    return res.data;
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.errors) {
      throw new Error(JSON.stringify(error.response.data.errors));
    } else {
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }
};
