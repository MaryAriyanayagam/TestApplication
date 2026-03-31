import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getWeekDays, formatDate, formatDisplayDate, formatFullDate, getMonday } from '../../utils/dateUtils';
import { MEAL_TYPES } from '../../utils/unitConverter';
import { canPrepareMeal, getMissingIngredients } from '../../services/mealPlanService';
import Modal from '../common/Modal';

export default function MealPlanner() {
  const { recipes, mealPlans, pantryItems, mealActions } = useApp();
  const [weekStart, setWeekStart] = useState(getMonday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [addForm, setAddForm] = useState({ recipeId: '', servings: 1, mealType: 'Breakfast' });

  const weekDays = getWeekDays(weekStart);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(formatDate(d));
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(formatDate(d));
  };

  const getMealsForDayAndType = (date, mealType) => {
    const dateStr = formatDate(date);
    return mealPlans.filter(m => m.date === dateStr && m.mealType === mealType);
  };

  const openAddModal = (date, mealType) => {
    setSelectedDate(formatDate(date));
    setSelectedMealType(mealType);
    setAddForm({ recipeId: recipes[0]?.id || '', servings: 1, mealType });
    setShowAddModal(true);
  };

  const handleAdd = () => {
    if (!addForm.recipeId) return;
    mealActions.add(selectedDate, selectedMealType, addForm.recipeId, Number(addForm.servings));
    setShowAddModal(false);
  };

  const openDetail = (meal) => {
    setSelectedMeal(meal);
    setShowDetailModal(true);
  };

  const handleMarkPrepared = (meal) => {
    const recipe = recipes.find(r => r.id === meal.recipeId);
    if (recipe) {
      const ratio = meal.servingsPlanned / recipe.servingSize;
      const scaledIngredients = recipe.ingredients.map(ing => ({ ...ing, quantity: ing.quantity * ratio }));
      mealActions.markPrepared(meal.id, scaledIngredients);
    }
    setShowDetailModal(false);
  };

  const today = formatDate(new Date());

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-800">Meal Planner</h1>
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={20} /></button>
            <button onClick={() => setWeekStart(getMonday())} className="text-xs text-green-600 font-medium px-2 py-1 rounded-lg hover:bg-green-50">Today</button>
            <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={20} /></button>
          </div>
        </div>
        <p className="text-sm text-gray-500">{formatFullDate(weekDays[0])} – {formatFullDate(weekDays[6])}</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="flex border-b bg-gray-50 sticky top-[73px] z-20">
            <div className="w-20 flex-shrink-0 p-2 text-xs text-gray-400 font-medium border-r">Meal</div>
            {weekDays.map(day => {
              const isToday = formatDate(day) === today;
              return (
                <div key={day.toISOString()} className={`w-32 flex-shrink-0 p-2 text-center border-r ${isToday ? 'bg-green-50' : ''}`}>
                  <p className={`text-xs font-semibold ${isToday ? 'text-green-600' : 'text-gray-500'}`}>
                    {formatDisplayDate(day)}
                  </p>
                </div>
              );
            })}
          </div>

          {MEAL_TYPES.map(mealType => (
            <div key={mealType} className="flex border-b">
              <div className="w-20 flex-shrink-0 p-2 border-r bg-gray-50 flex items-start">
                <span className="text-xs font-medium text-gray-600 mt-1">{mealType}</span>
              </div>
              {weekDays.map(day => {
                const meals = getMealsForDayAndType(day, mealType);
                const isToday = formatDate(day) === today;
                return (
                  <div key={day.toISOString()} className={`w-32 flex-shrink-0 p-1.5 border-r min-h-[80px] ${isToday ? 'bg-green-50/30' : ''}`}>
                    {meals.map(meal => {
                      const recipe = recipes.find(r => r.id === meal.recipeId);
                      const canPrepare = canPrepareMeal(pantryItems, recipe, meal.servingsPlanned);
                      return (
                        <div
                          key={meal.id}
                          onClick={() => openDetail(meal)}
                          className={`p-1.5 rounded-lg mb-1 cursor-pointer text-xs border ${
                            meal.isPrepared
                              ? 'bg-green-100 border-green-200 text-green-700'
                              : canPrepare
                              ? 'bg-blue-50 border-blue-100 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          <p className="font-medium leading-tight truncate">{recipe?.name || 'Unknown'}</p>
                          <p className="text-gray-400 mt-0.5">{meal.servingsPlanned} srv</p>
                          {meal.isPrepared && <CheckCircle size={10} className="text-green-500 mt-0.5" />}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => openAddModal(day, mealType)}
                      className="w-full flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add ${selectedMealType}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <p className="text-sm text-gray-600">{selectedDate ? formatFullDate(new Date(selectedDate + 'T12:00:00')) : ''}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipe</label>
            <select
              value={addForm.recipeId}
              onChange={e => setAddForm({ ...addForm, recipeId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
            <input
              type="number"
              min="1"
              value={addForm.servings}
              onChange={e => setAddForm({ ...addForm, servings: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button onClick={handleAdd} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">Add to Planner</button>
        </div>
      </Modal>

      {selectedMeal && (
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Meal Details">
          {(() => {
            const recipe = recipes.find(r => r.id === selectedMeal.recipeId);
            const missing = recipe ? getMissingIngredients(pantryItems, recipe, selectedMeal.servingsPlanned) : [];
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{recipe?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedMeal.mealType} · {formatDisplayDate(selectedMeal.date)} · {selectedMeal.servingsPlanned} servings</p>
                </div>
                {recipe && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ingredients needed:</p>
                    <div className="space-y-1">
                      {recipe.ingredients.map(ing => {
                        const ratio = selectedMeal.servingsPlanned / recipe.servingSize;
                        const qty = Math.round(ing.quantity * ratio * 100) / 100;
                        const isMissing = missing.some(m => m.ingredientId === ing.ingredientId);
                        return (
                          <div key={ing.ingredientId} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isMissing ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {isMissing ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                            <span>{qty} {ing.unit} {ing.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedMeal.isPrepared ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                    <CheckCircle size={18} className="text-green-500" />
                    <span className="text-sm text-green-700 font-medium">Meal prepared!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleMarkPrepared(selectedMeal)}
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Mark as Prepared
                    </button>
                    <button
                      onClick={() => { mealActions.delete(selectedMeal.id); setShowDetailModal(false); }}
                      className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Remove Meal
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
