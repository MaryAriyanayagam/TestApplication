import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import BottomNav from './components/common/BottomNav';
import Dashboard from './components/Dashboard/Dashboard';
import MealPlanner from './components/MealPlanner/MealPlanner';
import Recipes from './components/Recipes/Recipes';
import Pantry from './components/Pantry/Pantry';
import ShoppingList from './components/ShoppingList/ShoppingList';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<MealPlanner />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/shopping" element={<ShoppingList />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
