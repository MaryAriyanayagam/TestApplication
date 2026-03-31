export const UNITS = ['g', 'kg', 'oz', 'lb', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'bunch', 'can', 'bag', 'box', 'bottle', 'slice', 'clove', 'head'];

export const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Grains', 'Canned', 'Frozen', 'Beverages', 'Condiments', 'Snacks', 'Spices', 'Bakery', 'Other'];

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export const LOCATIONS = ['Fridge', 'Freezer', 'Pantry', 'Cupboard'];

export const RECIPE_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Soup', 'Salad', 'Baked', 'Vegetarian', 'Vegan', 'Other'];

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
