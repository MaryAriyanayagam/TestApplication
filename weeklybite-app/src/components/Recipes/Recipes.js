import React, { useState } from 'react';
import { Search, Plus, Heart, Clock, Users, ChevronRight, Trash2, Edit2, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { RECIPE_CATEGORIES, UNITS, generateId } from '../../utils/unitConverter';
import Modal from '../common/Modal';

export default function Recipes() {
  const { recipes, recipeActions } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [form, setForm] = useState(defaultForm());

  function defaultForm() {
    return {
      name: '',
      description: '',
      category: 'Dinner',
      servingSize: 2,
      prepTimeMinutes: 30,
      instructions: '',
      ingredients: [{ ingredientId: generateId(), name: '', quantity: 1, unit: 'piece' }],
    };
  }

  const categories = ['All', ...RECIPE_CATEGORIES];
  const filtered = recipes.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchFav = !showFavoritesOnly || r.isFavorite;
    return matchSearch && matchCat && matchFav;
  });

  const openDetail = (recipe) => { setSelectedRecipe(recipe); setShowDetailModal(true); };

  const openEdit = (recipe) => {
    setForm({
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      servingSize: recipe.servingSize,
      prepTimeMinutes: recipe.prepTimeMinutes,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients.map(i => ({ ...i })),
    });
    setSelectedRecipe(recipe);
    setShowEditModal(true);
  };

  const handleSave = (isEdit = false) => {
    if (!form.name.trim()) return;
    const data = { ...form, servingSize: Number(form.servingSize), prepTimeMinutes: Number(form.prepTimeMinutes) };
    if (isEdit) {
      recipeActions.update(selectedRecipe.id, data);
    } else {
      recipeActions.add(data);
    }
    setShowAddModal(false);
    setShowEditModal(false);
    setForm(defaultForm());
  };

  const addIngredient = () => setForm(f => ({
    ...f,
    ingredients: [...f.ingredients, { ingredientId: generateId(), name: '', quantity: 1, unit: 'piece' }],
  }));

  const removeIngredient = (idx) => setForm(f => ({
    ...f,
    ingredients: f.ingredients.filter((_, i) => i !== idx),
  }));

  const updateIngredient = (idx, field, value) => setForm(f => ({
    ...f,
    ingredients: f.ingredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing),
  }));

  const RecipeForm = ({ isEdit }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Recipe name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} placeholder="Brief description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {RECIPE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <input type="number" min="1" value={form.servingSize} onChange={e => setForm(f => ({ ...f, servingSize: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
        <input type="number" min="1" value={form.prepTimeMinutes} onChange={e => setForm(f => ({ ...f, prepTimeMinutes: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Ingredients</label>
          <button onClick={addIngredient} className="text-xs text-green-600 flex items-center gap-1"><Plus size={14} />Add</button>
        </div>
        <div className="space-y-2">
          {form.ingredients.map((ing, idx) => (
            <div key={ing.ingredientId} className="flex gap-2 items-center">
              <input value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)}
                placeholder="Ingredient" className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="number" min="0" step="0.1" value={ing.quantity} onChange={e => updateIngredient(idx, 'quantity', parseFloat(e.target.value))}
                className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <select value={ing.unit} onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                className="w-20 border border-gray-200 rounded-lg px-1 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" rows={4} placeholder="Step-by-step instructions..." />
      </div>
      <button onClick={() => handleSave(isEdit)} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">
        {isEdit ? 'Save Changes' : 'Add Recipe'}
      </button>
    </div>
  );

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800">Recipes</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFavoritesOnly(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                showFavoritesOnly ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-600'
              }`}>
              <Heart size={15} className={showFavoritesOnly ? 'fill-red-400' : ''} />
            </button>
            <button onClick={() => { setForm(defaultForm()); setShowAddModal(true); }}
              className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-2 rounded-xl text-sm font-medium">
              <Plus size={16} />Add
            </button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No recipes found</p>
            <p className="text-sm mt-1">Try a different search or add a new recipe</p>
          </div>
        ) : (
          filtered.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4" onClick={() => openDetail(recipe)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">{recipe.name}</h3>
                      {recipe.isFavorite && <Heart size={14} className="text-red-400 fill-red-400 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{recipe.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">{recipe.category}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />{recipe.prepTimeMinutes}m</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={12} />{recipe.servingSize}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRecipe && (
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedRecipe.name}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">{selectedRecipe.category}</span>
              <span className="flex items-center gap-1 text-sm text-gray-500"><Clock size={14} />{selectedRecipe.prepTimeMinutes} min</span>
              <span className="flex items-center gap-1 text-sm text-gray-500"><Users size={14} />{selectedRecipe.servingSize} servings</span>
            </div>
            {selectedRecipe.description && <p className="text-sm text-gray-600">{selectedRecipe.description}</p>}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Ingredients</h4>
              <div className="space-y-1">
                {selectedRecipe.ingredients.map(ing => (
                  <div key={ing.ingredientId} className="flex items-center gap-2 text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-500 w-16 text-right flex-shrink-0">{ing.quantity} {ing.unit}</span>
                    <span className="text-gray-800">{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {selectedRecipe.instructions && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Instructions</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{selectedRecipe.instructions}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => recipeActions.toggleFav(selectedRecipe.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium ${
                  selectedRecipe.isFavorite ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600'
                }`}>
                <Heart size={16} className={selectedRecipe.isFavorite ? 'fill-red-400' : ''} />
                {selectedRecipe.isFavorite ? 'Favorited' : 'Favorite'}
              </button>
              <button onClick={() => { setShowDetailModal(false); openEdit(selectedRecipe); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">
                <Edit2 size={16} />Edit
              </button>
              <button onClick={() => { recipeActions.delete(selectedRecipe.id); setShowDetailModal(false); }}
                className="flex items-center justify-center p-2.5 rounded-xl border border-red-200 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Recipe">
        <RecipeForm isEdit={false} />
      </Modal>

      {selectedRecipe && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Recipe">
          <RecipeForm isEdit={true} />
        </Modal>
      )}
    </div>
  );
}
