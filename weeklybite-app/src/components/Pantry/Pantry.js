import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, Clock, TrendingDown, Package, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getLowStockItems, getExpiringItems, getExpiredItems } from '../../services/pantryService';
import { daysUntilExpiry } from '../../utils/dateUtils';
import { UNITS, CATEGORIES, LOCATIONS } from '../../utils/unitConverter';
import Modal from '../common/Modal';

export default function Pantry() {
  const { pantryItems, pantryActions } = useApp();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [adjustQty, setAdjustQty] = useState('');

  function defaultForm() {
    return { name: '', quantityOnHand: 0, unit: 'piece', category: 'Other', expirationDate: '', minimumStockLevel: 0, location: 'Pantry' };
  }

  const lowStock = getLowStockItems(pantryItems);
  const expiring = getExpiringItems(pantryItems, 3);
  const expired = getExpiredItems(pantryItems);

  const locations = ['All', ...LOCATIONS];

  const filtered = pantryItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchLoc = locationFilter === 'All' || item.location === locationFilter;
    return matchSearch && matchLoc;
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    pantryActions.add({
      ...form,
      quantityOnHand: Number(form.quantityOnHand),
      minimumStockLevel: Number(form.minimumStockLevel),
      expirationDate: form.expirationDate || null,
    });
    setShowAddModal(false);
    setForm(defaultForm());
  };

  const handleEdit = () => {
    if (!form.name.trim() || !selectedItem) return;
    pantryActions.update(selectedItem.id, {
      ...form,
      quantityOnHand: Number(form.quantityOnHand),
      minimumStockLevel: Number(form.minimumStockLevel),
      expirationDate: form.expirationDate || null,
    });
    setShowEditModal(false);
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      quantityOnHand: item.quantityOnHand,
      unit: item.unit,
      category: item.category,
      expirationDate: item.expirationDate || '',
      minimumStockLevel: item.minimumStockLevel,
      location: item.location,
    });
    setShowEditModal(true);
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setAdjustQty(String(item.quantityOnHand));
    setShowDetailModal(true);
  };

  const handleAdjust = () => {
    if (selectedItem) {
      pantryActions.adjust(selectedItem.id, Number(adjustQty), 'Manual adjustment');
      setShowDetailModal(false);
    }
  };

  const getExpiryBadge = (item) => {
    if (!item.expirationDate) return null;
    const days = daysUntilExpiry(item.expirationDate);
    if (days === null) return null;
    if (days < 0) return <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">Expired</span>;
    if (days <= 3) return <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Exp: {days}d</span>;
    return <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">Exp: {days}d</span>;
  };

  const ItemForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Item name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" min="0" step="0.1" value={form.quantityOnHand} onChange={e => setForm(f => ({ ...f, quantityOnHand: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
        <input type="date" value={form.expirationDate} onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stock Level</label>
        <input type="number" min="0" step="0.1" value={form.minimumStockLevel} onChange={e => setForm(f => ({ ...f, minimumStockLevel: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
    </div>
  );

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800">Pantry</h1>
          <button onClick={() => { setForm(defaultForm()); setShowAddModal(true); }}
            className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-2 rounded-xl text-sm font-medium">
            <Plus size={16} />Add
          </button>
        </div>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pantry..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {locations.map(loc => (
            <button key={loc} onClick={() => setLocationFilter(loc)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${locationFilter === loc ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {loc}
            </button>
          ))}
        </div>
      </div>

      {(expired.length > 0 || expiring.length > 0 || lowStock.length > 0) && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {expired.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs text-red-600 font-medium">{expired.length} expired</span>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
              <Clock size={14} className="text-yellow-600" />
              <span className="text-xs text-yellow-700 font-medium">{expiring.length} expiring</span>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
              <TrendingDown size={14} className="text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">{lowStock.length} low stock</span>
            </div>
          )}
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p>No items found</p>
          </div>
        ) : (
          filtered.map(item => {
            const isLow = item.minimumStockLevel > 0 && item.quantityOnHand <= item.minimumStockLevel;
            const isExp = !item.expirationDate ? false : (daysUntilExpiry(item.expirationDate) ?? 1) < 0;
            const isExpSoon = !item.expirationDate ? false : (() => { const d = daysUntilExpiry(item.expirationDate); return d !== null && d >= 0 && d <= 3; })();
            return (
              <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-3 cursor-pointer ${
                isExp ? 'border-red-200' : isExpSoon ? 'border-yellow-200' : isLow ? 'border-orange-200' : 'border-gray-100'
              }`} onClick={() => openDetail(item)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                      {getExpiryBadge(item)}
                      {isLow && <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full">Low</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600">{item.quantityOnHand} {item.unit}</span>
                      <span className="text-xs text-gray-400">{item.category} · {item.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); openEdit(item); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); pantryActions.delete(item.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Pantry Item">
        <div className="space-y-4">
          <ItemForm />
          <button onClick={handleAdd} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">Add Item</button>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Item">
        <div className="space-y-4">
          <ItemForm />
          <button onClick={handleEdit} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">Save Changes</button>
        </div>
      </Modal>

      {selectedItem && (
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedItem.name}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Current Stock</p>
                <p className="font-semibold text-gray-800">{selectedItem.quantityOnHand} {selectedItem.unit}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Min. Level</p>
                <p className="font-semibold text-gray-800">{selectedItem.minimumStockLevel} {selectedItem.unit}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Location</p>
                <p className="font-semibold text-gray-800">{selectedItem.location}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Category</p>
                <p className="font-semibold text-gray-800">{selectedItem.category}</p>
              </div>
            </div>
            {selectedItem.expirationDate && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">Expiration</p>
                <p className="font-semibold text-gray-800">{selectedItem.expirationDate}
                  {' '}{getExpiryBadge(selectedItem)}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjust Quantity</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="0.1" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <span className="flex items-center text-sm text-gray-500 px-2">{selectedItem.unit}</span>
              </div>
            </div>
            <button onClick={handleAdjust} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium">Update Quantity</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
