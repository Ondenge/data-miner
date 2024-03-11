import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update import statement
import ListPage from './components/ListPage';
import PullForm from './components/PullForm';

const App = () => {
  return (
    <Router>
      <Routes> {/* Replace Switch with Routes */}
        <Route exact path="/" element={<ListPage />} /> {/* Use "element" instead of "component" */}
        <Route path="/create" element={<PullForm />} /> {/* Use "element" instead of "component" */}
      </Routes>
    </Router>
  );
};

export default App;
