import { generateId } from '../utils/unitConverter';
import { formatDate } from '../utils/dateUtils';
import { sampleMealPlans } from '../data/sampleData';
import { isAvailableInPantry } from './pantryService';

const STORAGE_KEY = 'weeklybite_mealplans';

export const loadMealPlans = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    saveMealPlans(sampleMealPlans);
    return sampleMealPlans;
  } catch (err) { console.error('Failed to load meal plans:', err); return sampleMealPlans; }
};

export const saveMealPlans = (plans) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

export const addMeal = (plans, date, mealType, recipeId, servingsPlanned) => {
  const meal = {
    id: generateId(),
    date: formatDate(new Date(date)),
    mealType,
    recipeId,
    servingsPlanned,
    isPrepared: false,
  };
  const updated = [...plans, meal];
  saveMealPlans(updated);
  return updated;
};

export const updateMeal = (plans, id, data) => {
  const updated = plans.map(p => p.id === id ? { ...p, ...data } : p);
  saveMealPlans(updated);
  return updated;
};

export const deleteMeal = (plans, id) => {
  const updated = plans.filter(p => p.id !== id);
  saveMealPlans(updated);
  return updated;
};

export const markMealPrepared = (plans, id) => {
  const updated = plans.map(p => p.id === id ? { ...p, isPrepared: true } : p);
  saveMealPlans(updated);
  return updated;
};

export const getWeeklyMealPlan = (plans, weekStartDate) => {
  const start = new Date(weekStartDate);
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + 7);
  return plans.filter(p => {
    const d = new Date(p.date);
    return d >= start && d < end;
  });
};

export const canPrepareMeal = (pantryItems, recipe, servings) => {
  if (!recipe) return false;
  const ratio = servings / recipe.servingSize;
  return recipe.ingredients.every(ing =>
    isAvailableInPantry(pantryItems, ing.name, ing.quantity * ratio, ing.unit)
  );
};

export const getMissingIngredients = (pantryItems, recipe, servings) => {
  if (!recipe) return [];
  const ratio = servings / recipe.servingSize;
  return recipe.ingredients.filter(ing =>
    !isAvailableInPantry(pantryItems, ing.name, ing.quantity * ratio, ing.unit)
  ).map(ing => ({ ...ing, quantity: ing.quantity * ratio }));
};
