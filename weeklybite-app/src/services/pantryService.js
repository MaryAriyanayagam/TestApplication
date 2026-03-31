import { generateId } from '../utils/unitConverter';
import { formatDate, daysUntilExpiry } from '../utils/dateUtils';
import { samplePantryItems } from '../data/sampleData';

const ITEMS_KEY = 'weeklybite_pantry';
const TRANSACTIONS_KEY = 'weeklybite_transactions';

export const loadPantryItems = () => {
  try {
    const stored = localStorage.getItem(ITEMS_KEY);
    if (stored) return JSON.parse(stored);
    savePantryItems(samplePantryItems);
    return samplePantryItems;
  } catch (err) { console.error('Failed to load pantry items:', err); return samplePantryItems; }
};

export const savePantryItems = (items) => {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

export const loadTransactions = () => {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) { console.error('Failed to load transactions:', err); return []; }
};

export const saveTransactions = (transactions) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const addTransaction = (transactions, pantryItemId, type, quantity, unit, reason, relatedMealPlanId = null) => {
  const t = {
    id: generateId(),
    pantryItemId,
    type,
    quantity,
    unit,
    transactionDate: formatDate(new Date()),
    reason,
    relatedMealPlanId,
  };
  const updated = [t, ...transactions].slice(0, 200);
  saveTransactions(updated);
  return updated;
};

export const addToPantry = (items, transactions, data) => {
  const item = {
    id: generateId(),
    quantityOnHand: 0,
    minimumStockLevel: 0,
    location: 'Pantry',
    expirationDate: null,
    lastUpdated: formatDate(new Date()),
    ...data,
  };
  const updatedItems = [...items, item];
  savePantryItems(updatedItems);
  const updatedTx = addTransaction(transactions, item.id, 'Added', item.quantityOnHand, item.unit, 'Initial stock');
  return { items: updatedItems, transactions: updatedTx };
};

export const updatePantryItem = (items, id, data) => {
  const updated = items.map(item =>
    item.id === id ? { ...item, ...data, lastUpdated: formatDate(new Date()) } : item
  );
  savePantryItems(updated);
  return updated;
};

export const deletePantryItem = (items, id) => {
  const updated = items.filter(item => item.id !== id);
  savePantryItems(updated);
  return updated;
};

export const adjustQuantity = (items, transactions, itemId, newQuantity, reason) => {
  const item = items.find(i => i.id === itemId);
  if (!item) return { items, transactions };
  const diff = newQuantity - item.quantityOnHand;
  const updatedItems = updatePantryItem(items, itemId, { quantityOnHand: newQuantity });
  const updatedTx = addTransaction(transactions, itemId, 'Adjusted', Math.abs(diff), item.unit, reason || 'Manual adjustment');
  return { items: updatedItems, transactions: updatedTx };
};

export const consumeIngredients = (items, transactions, ingredients, mealPlanId) => {
  let currentItems = [...items];
  let currentTx = [...transactions];
  for (const ing of ingredients) {
    const pantryItem = currentItems.find(
      i => i.name.toLowerCase() === ing.name.toLowerCase() && i.unit === ing.unit
    );
    if (pantryItem) {
      const newQty = Math.max(0, pantryItem.quantityOnHand - ing.quantity);
      currentItems = updatePantryItem(currentItems, pantryItem.id, { quantityOnHand: newQty });
      currentTx = addTransaction(currentTx, pantryItem.id, 'Consumed', ing.quantity, ing.unit, 'Used for meal', mealPlanId);
    }
  }
  return { items: currentItems, transactions: currentTx };
};

export const isAvailableInPantry = (items, name, quantity, unit) => {
  const item = items.find(i => i.name.toLowerCase() === name.toLowerCase() && i.unit === unit);
  return item ? item.quantityOnHand >= quantity : false;
};

export const getLowStockItems = (items) =>
  items.filter(i => i.minimumStockLevel > 0 && i.quantityOnHand <= i.minimumStockLevel);

export const getExpiringItems = (items, daysAhead = 3) =>
  items.filter(i => {
    if (!i.expirationDate) return false;
    const days = daysUntilExpiry(i.expirationDate);
    return days !== null && days >= 0 && days <= daysAhead;
  });

export const getExpiredItems = (items) =>
  items.filter(i => {
    if (!i.expirationDate) return false;
    const days = daysUntilExpiry(i.expirationDate);
    return days !== null && days < 0;
  });

export const addPurchasedItems = (items, transactions, groceryItems) => {
  let currentItems = [...items];
  let currentTx = [...transactions];
  for (const groceryItem of groceryItems) {
    const existing = currentItems.find(i => i.name.toLowerCase() === groceryItem.name.toLowerCase());
    if (existing) {
      const newQty = existing.quantityOnHand + groceryItem.quantityToBuy;
      currentItems = updatePantryItem(currentItems, existing.id, { quantityOnHand: newQty });
      currentTx = addTransaction(currentTx, existing.id, 'Added', groceryItem.quantityToBuy, groceryItem.unit, 'Purchased from shopping list');
    } else {
      const result = addToPantry(currentItems, currentTx, {
        name: groceryItem.name,
        quantityOnHand: groceryItem.quantityToBuy,
        unit: groceryItem.unit,
        category: groceryItem.category,
        location: 'Pantry',
      });
      currentItems = result.items;
      currentTx = result.transactions;
    }
  }
  return { items: currentItems, transactions: currentTx };
};
