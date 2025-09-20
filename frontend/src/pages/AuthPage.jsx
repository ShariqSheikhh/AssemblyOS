import React, { useState } from 'react';
import axios from 'axios';
import { TextInput, Button, Paper, Title, Text, Group, SegmentedControl } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('signIn'); // 'signIn' or 'signUp'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (view === 'signIn') {
      try {
        const response = await axios.post('http://localhost:3000/api/users/login', { email, password });
        localStorage.setItem('token', response.data.token); // Save the token
        notifications.show({
          title: 'Login Successful!',
          message: 'Redirecting to your dashboard...',
          color: 'green',
        });
        navigate('/dashboard'); // Redirect to dashboard
      } catch (error) {
        notifications.show({
          title: 'Login Failed',
          message: error.response?.data?.error || 'An unknown server error occurred.',
          color: 'red',
        });
      }
    } else {
      if (password !== confirmPassword) {
        notifications.show({
          title: 'Error',
          message: 'Passwords do not match!',
          color: 'red',
        });
        return;
      }
      try {
        await axios.post('http://localhost:3000/api/users/register', {
          name: `${firstName} ${lastName}`,
          email,
          password,
        });
        notifications.show({
          title: 'Registration Successful!',
          message: 'You can now sign in with your new account.',
          color: 'green',
        });
        setView('signIn');
      } catch (error) {
        notifications.show({
          title: 'Registration Failed',
          message: error.response?.data?.error || 'An unknown server error occurred.',
          color: 'red',
        });
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundImage: 'url("/background.jpg")', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'darken'
    }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%', maxWidth: '420px' }}>
          <Title ta="center" order={2}>
            {view === 'signIn' ? 'Access Your Account' : 'Sign Up to Explore'}
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            {view === 'signIn' ? 'Welcome back!' : 'Create an account to get started.'}
          </Text>

          <SegmentedControl
            fullWidth
            value={view}
            onChange={setView}
            data={[
              { label: 'Sign In', value: 'signIn' },
              { label: 'Sign Up', value: 'signUp' },
            ]}
            mt="xl"
            color="violet"
          />

          <form onSubmit={handleSubmit}>
            {view === 'signUp' && (
              <Group grow>
                <TextInput label="First Name" placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required mt="md" />
                <TextInput label="Last Name" placeholder="Your last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required mt="md" />
              </Group>
            )}
            <TextInput label="Email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required mt="md" />
            <TextInput type="password" label="Password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required mt="md" />
            {view === 'signUp' && (
              <TextInput type="password" label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required mt="md" />
            )}
            <Button type="submit" fullWidth mt="xl" color="violet">
              {view === 'signIn' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default AuthPage;