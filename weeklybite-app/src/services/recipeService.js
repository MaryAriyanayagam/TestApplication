import { generateId } from '../utils/unitConverter';
import { sampleRecipes } from '../data/sampleData';

const STORAGE_KEY = 'weeklybite_recipes';

export const loadRecipes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    saveRecipes(sampleRecipes);
    return sampleRecipes;
  } catch (err) { console.error('Failed to load recipes:', err); return sampleRecipes; }
};

export const saveRecipes = (recipes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
};

export const createRecipe = (recipes, data) => {
  const recipe = { id: generateId(), isFavorite: false, ...data };
  const updated = [...recipes, recipe];
  saveRecipes(updated);
  return updated;
};

export const updateRecipe = (recipes, id, data) => {
  const updated = recipes.map(r => r.id === id ? { ...r, ...data } : r);
  saveRecipes(updated);
  return updated;
};

export const deleteRecipe = (recipes, id) => {
  const updated = recipes.filter(r => r.id !== id);
  saveRecipes(updated);
  return updated;
};

export const toggleFavorite = (recipes, id) => {
  const updated = recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
  saveRecipes(updated);
  return updated;
};

export const scaleRecipe = (recipe, newServings) => {
  const ratio = newServings / recipe.servingSize;
  return {
    ...recipe,
    servingSize: newServings,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: Math.round(ing.quantity * ratio * 100) / 100,
    })),
  };
};
