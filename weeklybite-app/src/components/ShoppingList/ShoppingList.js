import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle, Circle, RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getMonday, formatFullDate } from '../../utils/dateUtils';
import { parseISO } from 'date-fns';
import { getLowStockItems } from '../../services/pantryService';
import { UNITS, CATEGORIES } from '../../utils/unitConverter';
import Modal from '../common/Modal';

export default function ShoppingList() {
  const { groceryList, groceryActions, pantryItems } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', quantity: 1, unit: 'piece', category: 'Other' });
  const [checkPantry, setCheckPantry] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const weekStart = getMonday();
  const lowStock = getLowStockItems(pantryItems);

  const generateList = () => {
    groceryActions.generate(weekStart, checkPantry);
  };

  const handleAddCustom = () => {
    if (!customForm.name.trim() || !groceryList) return;
    groceryActions.addCustom(customForm.name, Number(customForm.quantity), customForm.unit, customForm.category);
    setShowAddModal(false);
    setCustomForm({ name: '', quantity: 1, unit: 'piece', category: 'Other' });
  };

  const handleCompleteTrip = () => {
    groceryActions.completeTrip();
  };

  const allCategories = groceryList
    ? ['All', ...new Set(groceryList.items.map(i => i.category))]
    : ['All'];

  const displayItems = groceryList
    ? groceryList.items.filter(i => activeCategory === 'All' || i.category === activeCategory)
    : [];

  const purchasedCount = groceryList ? groceryList.items.filter(i => i.isPurchased).length : 0;
  const totalCount = groceryList ? groceryList.items.length : 0;

  const groupedItems = displayItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-800">Shopping List</h1>
          <div className="flex gap-2">
            {groceryList && (
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm font-medium">
                <Plus size={16} />Add
              </button>
            )}
          </div>
        </div>
        {groceryList && (
          <p className="text-xs text-gray-500">Week of {formatFullDate(parseISO(groceryList.weekStartDate))} · {purchasedCount}/{totalCount} items</p>
        )}
      </div>

      <div className="p-4">
        {!groceryList ? (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No Shopping List</h2>
            <p className="text-gray-400 text-sm mb-6">Generate a list based on your meal plan for this week.</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <input type="checkbox" id="checkPantry" checked={checkPantry} onChange={e => setCheckPantry(e.target.checked)}
                className="rounded" />
              <label htmlFor="checkPantry" className="text-sm text-gray-600">Check pantry stock first</label>
            </div>
            <button onClick={generateList}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto">
              <RefreshCw size={18} />Generate Weekly List
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: totalCount > 0 ? `${(purchasedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{purchasedCount} of {totalCount} items checked</p>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={generateList}
                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">
                <RefreshCw size={15} />Regenerate
              </button>
              {lowStock.length > 0 && (
                <button onClick={() => groceryActions.addLowStock(lowStock)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-orange-200 text-orange-600 py-2.5 rounded-xl text-sm font-medium">
                  <AlertTriangle size={15} />Add Low Stock
                </button>
              )}
              {purchasedCount > 0 && (
                <button onClick={handleCompleteTrip}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white py-2.5 rounded-xl text-sm font-medium">
                  <Package size={15} />Done Shopping
                </button>
              )}
            </div>

            {allCategories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                {allCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                      activeCategory === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>{cat}</button>
                ))}
              </div>
            )}

            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                {activeCategory === 'All' && (
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{category}</h3>
                )}
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      item.isPurchased ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'
                    }`}>
                      <button onClick={() => groceryActions.toggle(item.id)} className="flex-shrink-0">
                        {item.isPurchased
                          ? <CheckCircle size={22} className="text-green-500" />
                          : <Circle size={22} className="text-gray-300" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.isPurchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {Math.round(item.quantityToBuy * 100) / 100} {item.unit}
                          {item.isCustomItem && ' · custom'}
                        </p>
                      </div>
                      <button onClick={() => groceryActions.remove(item.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Custom Item">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={customForm.name} onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Item name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min="0.1" step="0.1" value={customForm.quantity}
                onChange={e => setCustomForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={customForm.unit} onChange={e => setCustomForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={customForm.category} onChange={e => setCustomForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handleAddCustom} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">Add to List</button>
        </div>
      </Modal>
    </div>
  );
}
