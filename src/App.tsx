import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import { CustomProvider } from 'rsuite';
import Dashboard from './components/Dashboard';
import 'rsuite/dist/rsuite.min.css';

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast" | undefined>('dark');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <CustomProvider theme={theme}>
      <Dashboard />
     </CustomProvider>
  );
}

export default App;
