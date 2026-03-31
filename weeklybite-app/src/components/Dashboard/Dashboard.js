import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ShoppingCart, Utensils, Package, Calendar, TrendingDown, Plus, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getLowStockItems, getExpiringItems, getExpiredItems } from '../../services/pantryService';
import { getWeeklyMealPlan } from '../../services/mealPlanService';
import { getMonday, formatDisplayDate } from '../../utils/dateUtils';

export default function Dashboard() {
  const { pantryItems, mealPlans, recipes, groceryList } = useApp();
  const navigate = useNavigate();
  const today = getMonday();

  const lowStock = getLowStockItems(pantryItems);
  const expiring = getExpiringItems(pantryItems, 3);
  const expired = getExpiredItems(pantryItems);
  const weekMeals = getWeeklyMealPlan(mealPlans, today);
  const purchasedCount = groceryList ? groceryList.items.filter(i => i.isPurchased).length : 0;
  const totalCount = groceryList ? groceryList.items.length : 0;

  const upcomingMeals = weekMeals
    .filter(m => !m.isPrepared)
    .slice(0, 3)
    .map(m => ({ ...m, recipe: recipes.find(r => r.id === m.recipeId) }));

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">WeeklyBite 🥗</h1>
        <p className="text-gray-500 text-sm mt-1">Your weekly meal & grocery companion</p>
      </div>

      {(expired.length > 0 || expiring.length > 0 || lowStock.length > 0) && (
        <div className="space-y-2 mb-4">
          {expired.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl cursor-pointer" onClick={() => navigate('/pantry')}>
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">{expired.length} item{expired.length > 1 ? 's' : ''} expired</p>
                <p className="text-xs text-red-500">{expired.slice(0, 2).map(i => i.name).join(', ')}</p>
              </div>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl cursor-pointer" onClick={() => navigate('/pantry')}>
              <Clock size={20} className="text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700">{expiring.length} item{expiring.length > 1 ? 's' : ''} expiring soon</p>
                <p className="text-xs text-yellow-600">{expiring.slice(0, 2).map(i => i.name).join(', ')}</p>
              </div>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer" onClick={() => navigate('/pantry')}>
              <TrendingDown size={20} className="text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-700">{lowStock.length} item{lowStock.length > 1 ? 's' : ''} low in stock</p>
                <p className="text-xs text-orange-500">{lowStock.slice(0, 2).map(i => i.name).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm cursor-pointer" onClick={() => navigate('/recipes')}>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-green-500" />
            <span className="text-xs text-gray-500">Recipes</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{recipes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm cursor-pointer" onClick={() => navigate('/pantry')}>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-blue-500" />
            <span className="text-xs text-gray-500">Pantry Items</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{pantryItems.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm cursor-pointer" onClick={() => navigate('/planner')}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="text-purple-500" />
            <span className="text-xs text-gray-500">This Week Meals</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{weekMeals.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm cursor-pointer" onClick={() => navigate('/shopping')}>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={18} className="text-orange-500" />
            <span className="text-xs text-gray-500">Shopping</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{purchasedCount}/{totalCount}</p>
        </div>
      </div>

      {upcomingMeals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800">Upcoming Meals</h2>
            <button onClick={() => navigate('/planner')} className="text-sm text-green-600">View all</button>
          </div>
          <div className="divide-y">
            {upcomingMeals.map(meal => (
              <div key={meal.id} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Utensils size={18} className="text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{meal.recipe?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{formatDisplayDate(meal.date)} · {meal.mealType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/planner')} className="flex items-center gap-2 p-4 bg-green-500 text-white rounded-xl font-medium text-sm">
          <Plus size={18} />
          Add Meal
        </button>
        <button onClick={() => navigate('/shopping')} className="flex items-center gap-2 p-4 bg-orange-500 text-white rounded-xl font-medium text-sm">
          <ShoppingCart size={18} />
          Shopping List
        </button>
      </div>
    </div>
  );
}
