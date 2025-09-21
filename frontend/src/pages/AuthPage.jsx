import React from 'react';
import axios from 'axios';
import { 
  TextInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Group, 
  SegmentedControl,
  PasswordInput,
  Container,
  Stack,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { jwtDecode } from 'jwt-decode';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [view, setView] = React.useState('signIn');
  
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => {
        if (view === 'signUp') {
          if (value.length < 8) return 'Password must be at least 8 characters';
          if (!/[A-Z]/.test(value)) return 'Password must include uppercase letter';
          if (!/[a-z]/.test(value)) return 'Password must include lowercase letter';
          if (!/[0-9]/.test(value)) return 'Password must include number';
          if (!/[^A-Za-z0-9]/.test(value)) return 'Password must include special character';
        }
        return null;
      },
      username: (value) => {
        if (view === 'signUp') {
          if (!value) return 'Username is required';
          if (value.length < 6 || value.length > 12) return 'Username must be between 6-12 characters';
        }
        return null;
      },
      confirmPassword: (value, values) => 
        view === 'signUp' && value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      
      if (view === 'signIn') {
        const response = await axios.post('http://localhost:3000/api/users/login', {
          email: values.email,
          password: values.password
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          const decodedToken = jwtDecode(response.data.token);
          localStorage.setItem('userRole', decodedToken.role || 'user');

          notifications.show({
            title: 'Success',
            message: 'Login successful!',
            color: 'green'
          });

          navigate('/dashboard');
        }
      } else {
        // Registration validation
        if (!values.username || values.username.length < 6 || values.username.length > 12) {
          notifications.show({
            title: 'Error',
            message: 'Username must be between 6 and 12 characters',
            color: 'red'
          });
          return;
        }

        if (values.password !== values.confirmPassword) {
          notifications.show({
            title: 'Error',
            message: 'Passwords do not match',
            color: 'red'
          });
          return;
        }

        const response = await axios.post('http://localhost:3000/api/users/register', {
          username: values.username,
          email: values.email,
          password: values.password
        });

        if (response.data) {
          notifications.show({
            title: 'Success',
            message: 'Account created successfully! Please sign in.',
            color: 'green'
          });
          setView('signIn');
          form.reset();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'An unexpected error occurred',
        color: 'red'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        <Title ta="center" order={2}>
          {view === 'signIn' ? 'Welcome Back' : 'Create Account'}
        </Title>
        
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {view === 'signIn' ? 'Login to your account' : 'Register a new account'}
        </Text>

        <SegmentedControl
          fullWidth
          value={view}
          onChange={(value) => {
            setView(value);
            form.reset();
          }}
          data={[
            { label: 'Sign In', value: 'signIn' },
            { label: 'Sign Up', value: 'signUp' }
          ]}
          mt="xl"
          color="blue"
        />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack mt="md">
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps('email')}
            />

            {view === 'signUp' && (
              <TextInput
                required
                label="Username"
                placeholder="6-12 characters"
                {...form.getInputProps('username')}
              />
            )}

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />

            {view === 'signUp' && (
              <PasswordInput
                required
                label="Confirm Password"
                placeholder="Confirm your password"
                {...form.getInputProps('confirmPassword')}
              />
            )}

            <Button type="submit" fullWidth mt="xl" color="blue">
              {view === 'signIn' ? 'Sign In' : 'Create Account'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default AuthPage;