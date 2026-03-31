import { generateId } from '../utils/unitConverter';

const STORAGE_KEY = 'weeklybite_grocerylist';

export const loadGroceryList = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) { console.error('Failed to load grocery list:', err); return null; }
};

export const saveGroceryList = (list) => {
  if (list) localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const generateWeeklyGroceryList = (weekStartDate, mealPlans, recipes, pantryItems, checkPantry = true) => {
  const weekPlans = mealPlans.filter(p => {
    const d = new Date(p.date);
    const start = new Date(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 7);
    return d >= start && d < end;
  });

  const aggregated = {};
  for (const plan of weekPlans) {
    const recipe = recipes.find(r => r.id === plan.recipeId);
    if (!recipe) continue;
    const ratio = plan.servingsPlanned / recipe.servingSize;
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`;
      if (aggregated[key]) {
        aggregated[key].quantityNeeded += ing.quantity * ratio;
      } else {
        aggregated[key] = {
          id: generateId(),
          name: ing.name,
          quantityNeeded: ing.quantity * ratio,
          quantityInPantry: 0,
          quantityToBuy: 0,
          unit: ing.unit,
          category: 'Other',
          isPurchased: false,
          isCustomItem: false,
          isInPantry: false,
        };
      }
    }
  }

  const items = Object.values(aggregated).map(item => {
    let quantityInPantry = 0;
    if (checkPantry) {
      const pantryItem = pantryItems.find(
        p => p.name.toLowerCase() === item.name.toLowerCase() && p.unit === item.unit
      );
      if (pantryItem) {
        quantityInPantry = pantryItem.quantityOnHand;
        item.isInPantry = true;
        item.category = pantryItem.category || 'Other';
      }
    }
    const quantityToBuy = Math.max(0, Math.round((item.quantityNeeded - quantityInPantry) * 100) / 100);
    return { ...item, quantityInPantry, quantityToBuy };
  }).filter(item => item.quantityToBuy > 0 || !checkPantry);

  const list = {
    id: generateId(),
    weekStartDate,
    includesPantryCheck: checkPantry,
    items,
  };
  saveGroceryList(list);
  return list;
};

export const toggleItem = (list, itemId) => {
  const updated = {
    ...list,
    items: list.items.map(item =>
      item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
    ),
  };
  saveGroceryList(updated);
  return updated;
};

export const addCustomItem = (list, name, quantityToBuy, unit, category) => {
  const item = {
    id: generateId(),
    name,
    quantityNeeded: quantityToBuy,
    quantityInPantry: 0,
    quantityToBuy,
    unit,
    category: category || 'Other',
    isPurchased: false,
    isCustomItem: true,
    isInPantry: false,
  };
  const updated = { ...list, items: [...list.items, item] };
  saveGroceryList(updated);
  return updated;
};

export const removeItem = (list, itemId) => {
  const updated = { ...list, items: list.items.filter(i => i.id !== itemId) };
  saveGroceryList(updated);
  return updated;
};

export const addLowStockToList = (list, lowStockItems) => {
  const existingNames = new Set(list.items.map(i => i.name.toLowerCase()));
  const newItems = lowStockItems
    .filter(item => !existingNames.has(item.name.toLowerCase()))
    .map(item => ({
      id: generateId(),
      name: item.name,
      quantityNeeded: item.minimumStockLevel - item.quantityOnHand,
      quantityInPantry: item.quantityOnHand,
      quantityToBuy: Math.max(0, item.minimumStockLevel - item.quantityOnHand),
      unit: item.unit,
      category: item.category,
      isPurchased: false,
      isCustomItem: false,
      isInPantry: true,
    }));
  const updated = { ...list, items: [...list.items, ...newItems] };
  saveGroceryList(updated);
  return updated;
};
