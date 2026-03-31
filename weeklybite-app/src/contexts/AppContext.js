import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadRecipes, createRecipe, updateRecipe, deleteRecipe, toggleFavorite } from '../services/recipeService';
import { loadMealPlans, addMeal, updateMeal, deleteMeal, markMealPrepared } from '../services/mealPlanService';
import { loadPantryItems, loadTransactions, addToPantry, updatePantryItem, deletePantryItem, adjustQuantity, consumeIngredients, addPurchasedItems } from '../services/pantryService';
import { loadGroceryList, generateWeeklyGroceryList, toggleItem, addCustomItem, removeItem, addLowStockToList, saveGroceryList } from '../services/groceryListService';

const AppContext = createContext(null);

const initialState = {
  recipes: [],
  mealPlans: [],
  pantryItems: [],
  transactions: [],
  groceryList: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT': return { ...state, ...action.payload };
    case 'SET_RECIPES': return { ...state, recipes: action.payload };
    case 'SET_MEAL_PLANS': return { ...state, mealPlans: action.payload };
    case 'SET_PANTRY': return { ...state, pantryItems: action.payload };
    case 'SET_TRANSACTIONS': return { ...state, transactions: action.payload };
    case 'SET_GROCERY_LIST': return { ...state, groceryList: action.payload };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({
      type: 'INIT',
      payload: {
        recipes: loadRecipes(),
        mealPlans: loadMealPlans(),
        pantryItems: loadPantryItems(),
        transactions: loadTransactions(),
        groceryList: loadGroceryList(),
      },
    });
  }, []);

  const recipeActions = {
    add: (data) => dispatch({ type: 'SET_RECIPES', payload: createRecipe(state.recipes, data) }),
    update: (id, data) => dispatch({ type: 'SET_RECIPES', payload: updateRecipe(state.recipes, id, data) }),
    delete: (id) => dispatch({ type: 'SET_RECIPES', payload: deleteRecipe(state.recipes, id) }),
    toggleFav: (id) => dispatch({ type: 'SET_RECIPES', payload: toggleFavorite(state.recipes, id) }),
  };

  const mealActions = {
    add: (date, mealType, recipeId, servings) =>
      dispatch({ type: 'SET_MEAL_PLANS', payload: addMeal(state.mealPlans, date, mealType, recipeId, servings) }),
    update: (id, data) => dispatch({ type: 'SET_MEAL_PLANS', payload: updateMeal(state.mealPlans, id, data) }),
    delete: (id) => dispatch({ type: 'SET_MEAL_PLANS', payload: deleteMeal(state.mealPlans, id) }),
    markPrepared: (id, ingredients) => {
      const updated = markMealPrepared(state.mealPlans, id);
      dispatch({ type: 'SET_MEAL_PLANS', payload: updated });
      if (ingredients && ingredients.length) {
        const { items, transactions } = consumeIngredients(state.pantryItems, state.transactions, ingredients, id);
        dispatch({ type: 'SET_PANTRY', payload: items });
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      }
    },
  };

  const pantryActions = {
    add: (data) => {
      const { items, transactions } = addToPantry(state.pantryItems, state.transactions, data);
      dispatch({ type: 'SET_PANTRY', payload: items });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    },
    update: (id, data) => dispatch({ type: 'SET_PANTRY', payload: updatePantryItem(state.pantryItems, id, data) }),
    delete: (id) => dispatch({ type: 'SET_PANTRY', payload: deletePantryItem(state.pantryItems, id) }),
    adjust: (id, qty, reason) => {
      const { items, transactions } = adjustQuantity(state.pantryItems, state.transactions, id, qty, reason);
      dispatch({ type: 'SET_PANTRY', payload: items });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    },
    addPurchased: (groceryItems) => {
      const { items, transactions } = addPurchasedItems(state.pantryItems, state.transactions, groceryItems);
      dispatch({ type: 'SET_PANTRY', payload: items });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    },
  };

  const groceryActions = {
    generate: (weekStart, checkPantry) => {
      const list = generateWeeklyGroceryList(weekStart, state.mealPlans, state.recipes, state.pantryItems, checkPantry);
      dispatch({ type: 'SET_GROCERY_LIST', payload: list });
    },
    toggle: (itemId) => {
      const updated = toggleItem(state.groceryList, itemId);
      dispatch({ type: 'SET_GROCERY_LIST', payload: updated });
    },
    addCustom: (name, qty, unit, category) => {
      const updated = addCustomItem(state.groceryList, name, qty, unit, category);
      dispatch({ type: 'SET_GROCERY_LIST', payload: updated });
    },
    remove: (itemId) => {
      const updated = removeItem(state.groceryList, itemId);
      dispatch({ type: 'SET_GROCERY_LIST', payload: updated });
    },
    addLowStock: (lowStockItems) => {
      const updated = addLowStockToList(state.groceryList, lowStockItems);
      dispatch({ type: 'SET_GROCERY_LIST', payload: updated });
    },
    completeTrip: () => {
      if (!state.groceryList) return;
      const purchased = state.groceryList.items.filter(i => i.isPurchased);
      pantryActions.addPurchased(purchased);
    },
    setList: (list) => {
      saveGroceryList(list);
      dispatch({ type: 'SET_GROCERY_LIST', payload: list });
    },
  };

  const clearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      ...state,
      recipeActions,
      mealActions,
      pantryActions,
      groceryActions,
      clearAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
