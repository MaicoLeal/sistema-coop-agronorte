import React, { useState, useMemo } from 'react';
import { Language, InputItem, InputMovement, NutrientRecipe, FertigationLog, ProductionZone, UserProfile, InputCategory, GrowthPhase } from '../types';
import { StorageService } from '../services/storageService';
import {
  Package, FlaskConical, History, Plus, ArrowDownCircle, ArrowUpCircle, AlertTriangle,
  Beaker, Droplets, CheckCircle2, Clock, ChevronRight, Search, Filter, X, Clipboard
} from 'lucide-react';

interface InputsManagementProps {
  lang: Language;
  inputItems: InputItem[];
  inputMovements: InputMovement[];
  recipes: NutrientRecipe[];
  fertigationLogs: FertigationLog[];
  zones: ProductionZone[];
  currentUser: UserProfile;
  onRefreshData: () => void;
}

const categoryLabels: Record<InputCategory, { es: string; pt: string; color: string; bg: string }> = {
  fertilizante: { es: 'Fertilizante', pt: 'Fertilizante', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  defensivo: { es: 'Defensivo', pt: 'Defensivo', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  substrato: { es: 'Sustrato', pt: 'Substrato', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  semente: { es: 'Semilla/Plantín', pt: 'Semente/Muda', color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' },
  embalagem: { es: 'Empaque', pt: 'Embalagem', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  agua: { es: 'Agua', pt: 'Água', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  outro: { es: 'Otro', pt: 'Outro', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' }
};

const phaseLabels: Record<GrowthPhase, { es: string; pt: string; color: string }> = {
  mudas: { es: 'Plántulas', pt: 'Mudas', color: 'bg-lime-100 text-lime-800' },
  vegetativo: { es: 'Vegetativo', pt: 'Vegetativo', color: 'bg-green-100 text-green-800' },
  floracao: { es: 'Floración', pt: 'Floração', color: 'bg-pink-100 text-pink-800' },
  frutificacao: { es: 'Fructificación', pt: 'Frutificação', color: 'bg-red-100 text-red-800' },
  maturacao: { es: 'Maduración', pt: 'Maturação', color: 'bg-amber-100 text-amber-800' }
};

const unitLabels: Record<string, string> = {
  kg: 'kg', L: 'L', mL: 'mL', g: 'g', unidade: 'un.',
  saco_25kg: 'saco 25kg', saco_50kg: 'saco 50kg'
};

type SubTab = 'stock' | 'recipes' | 'fertigation';

export const InputsManagement: React.FC<InputsManagementProps> = ({
  lang, inputItems, inputMovements, recipes, fertigationLogs, zones, currentUser, onRefreshData
}) => {
  const isEs = lang === 'es-PY';
  const [subTab, setSubTab] = useState<SubTab>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InputCategory | 'all'>('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Movement modal state
  const [movType, setMovType] = useState<'entrada' | 'saida'>('entrada');
  const [movQty, setMovQty] = useState('');
  const [movNotes, setMovNotes] = useState('');
  const [movZoneId, setMovZoneId] = useState('');
  const [movInvoice, setMovInvoice] = useState('');

  const filteredItems = useMemo(() => {
    let items = inputItems.filter(i => i.isActive);
    if (categoryFilter !== 'all') {
      items = items.filter(i => i.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.tradeName.toLowerCase().includes(q) ||
        i.supplierName.toLowerCase().includes(q)
      );
    }
    return items;
  }, [inputItems, categoryFilter, searchQuery]);

  const stockAlerts = useMemo(() => {
    return inputItems.filter(i => i.isActive && i.currentStockQty <= i.minStockQty);
  }, [inputItems]);

  const handleOpenMovement = (itemId: string, type: 'entrada' | 'saida') => {
    setSelectedItemId(itemId);
    setMovType(type);
    setMovQty('');
    setMovNotes('');
    setMovZoneId('');
    setMovInvoice('');
    setShowMovementModal(true);
  };

  const handleSubmitMovement = () => {
    if (!selectedItemId || !movQty || Number(movQty) <= 0) return;
    const movement: InputMovement = {
      id: `mov-${Date.now()}`,
      tenantId: 'tenant-agronorte',
      inputItemId: selectedItemId,
      type: movType,
      quantity: Number(movQty),
      date: new Date().toISOString(),
      zoneId: movZoneId || undefined,
      operatorId: currentUser.name,
      notes: movNotes || undefined,
      invoiceRef: movInvoice || undefined
    };
    StorageService.addInputMovement(movement);
    StorageService.appendAudit(
      currentUser.email, currentUser.role,
      movType === 'entrada' ? 'INPUT_STOCK_ENTRY' : 'INPUT_STOCK_EXIT',
      'InputItem', selectedItemId,
      `${movType === 'entrada' ? 'Entrada' : 'Saída'} de ${movQty} unidades — ${movNotes || 'Sem observações'}`
    );
    setShowMovementModal(false);
    onRefreshData();
  };

  const formatGs = (value: number): string => {
    return `₲ ${value.toLocaleString('es-PY')}`;
  };

  const subTabs = [
    { id: 'stock' as SubTab, label: isEs ? 'Stock de Insumos' : 'Estoque de Insumos', icon: Package },
    { id: 'recipes' as SubTab, label: isEs ? 'Recetas Nutricionales' : 'Receitas Nutricionais', icon: FlaskConical },
    { id: 'fertigation' as SubTab, label: isEs ? 'Historial Fertirrigación' : 'Histórico Fertirrigação', icon: History }
  ];

  return (
    <div className="space-y-5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            {isEs ? 'Gestión de Insumos & Fertirrigación' : 'Gestão de Insumos & Fertirrigação'}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isEs
              ? 'Control de stock, recetas de solución nutritiva e historial de fertirrigación por invernadero'
              : 'Controle de estoque, receitas de solução nutritiva e histórico de fertirrigação por estufa'}
          </p>
        </div>

        {/* Stock Alerts Badge */}
        {stockAlerts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            {stockAlerts.length} {isEs ? 'insumo(s) con stock bajo' : 'insumo(s) com estoque baixo'}
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 border border-outline-variant/30">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === STOCK TAB === */}
      {subTab === 'stock' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar insumo por nombre, marca o proveedor...' : 'Buscar insumo por nome, marca ou fornecedor...'}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as InputCategory | 'all')}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">{isEs ? 'Todas las categorías' : 'Todas as categorias'}</option>
                {(Object.keys(categoryLabels) as InputCategory[]).map(cat => (
                  <option key={cat} value={cat}>{isEs ? categoryLabels[cat].es : categoryLabels[cat].pt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredItems.map(item => {
              const cat = categoryLabels[item.category];
              const stockRatio = item.minStockQty > 0 ? item.currentStockQty / item.minStockQty : 10;
              const stockPct = Math.min(100, (item.currentStockQty / Math.max(item.minStockQty * 3, 1)) * 100);
              const isLow = stockRatio <= 1;
              const isWarning = stockRatio <= 2 && stockRatio > 1;

              return (
                <div
                  key={item.id}
                  className={`bg-surface-container-lowest border rounded-2xl p-4 space-y-3 transition-all hover:shadow-md ${
                    isLow ? 'border-red-300 shadow-red-100/50' : 'border-outline-variant/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cat.bg} ${cat.color}`}>
                          {isEs ? cat.es : cat.pt}
                        </span>
                        {item.senaveRegistration && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 border border-green-200">
                            SENAVE
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-on-surface leading-tight truncate">{item.name}</h3>
                      <p className="text-[10px] text-on-surface-variant truncate">{item.tradeName} • {item.supplierName}</p>
                    </div>
                    {isLow && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>

                  {/* Stock Bar */}
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-black text-on-surface">
                        {item.currentStockQty}
                        <span className="text-[10px] font-medium text-on-surface-variant ml-1">{unitLabels[item.unit] || item.unit}</span>
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        mín: {item.minStockQty}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>{isEs ? 'Costo unitario' : 'Custo unitário'}: {formatGs(item.costPerUnit)}</span>
                    <span>{isEs ? 'Valor stock' : 'Valor estoque'}: {formatGs(item.currentStockQty * item.costPerUnit)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenMovement(item.id, 'entrada')}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <ArrowDownCircle className="w-3 h-3" />
                      {isEs ? 'Entrada' : 'Entrada'}
                    </button>
                    <button
                      onClick={() => handleOpenMovement(item.id, 'saida')}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                    >
                      <ArrowUpCircle className="w-3 h-3" />
                      {isEs ? 'Salida' : 'Saída'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === RECIPES TAB === */}
      {subTab === 'recipes' && (
        <div className="space-y-4">
          {recipes.filter(r => r.isActive).map(recipe => {
            const phase = phaseLabels[recipe.growthPhase];
            return (
              <div key={recipe.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                {/* Recipe Header */}
                <div className="px-5 py-4 border-b border-outline-variant/20 bg-gradient-to-r from-emerald-50/50 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${phase.color}`}>
                          {isEs ? phase.es : phase.pt}
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                          {recipe.cropType === 'tomate' ? '🍅' : '🫑'} {recipe.cropType === 'tomate' ? 'Tomate' : 'Locote'}
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant">v{recipe.version}</span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface">{recipe.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      {recipe.approvedBy ? (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isEs ? 'Aprobada' : 'Aprovada'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                          {isEs ? 'Pendiente' : 'Pendente'}
                        </div>
                      )}
                      {recipe.approvedBy && (
                        <p className="text-[9px] text-on-surface-variant mt-0.5">{recipe.approvedBy}</p>
                      )}
                    </div>
                  </div>

                  {/* pH/EC Targets */}
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] text-on-surface-variant">pH:</span>
                      <span className="text-xs font-bold text-on-surface">{recipe.targetPH.min} – {recipe.targetPH.max}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] text-on-surface-variant">EC:</span>
                      <span className="text-xs font-bold text-on-surface">{recipe.targetEC.min} – {recipe.targetEC.max} mS/cm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-[10px] text-on-surface-variant">{isEs ? 'Agua' : 'Água'}:</span>
                      <span className="text-xs font-bold text-on-surface">{recipe.waterVolumeLiters}L</span>
                    </div>
                  </div>
                </div>

                {/* Components Table */}
                <div className="px-5 py-3">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                        <th className="text-left py-1.5 pr-2">#</th>
                        <th className="text-left py-1.5">{isEs ? 'Componente' : 'Componente'}</th>
                        <th className="text-right py-1.5">{isEs ? 'Cantidad' : 'Quantidade'}</th>
                        <th className="text-right py-1.5">{isEs ? 'Unidad' : 'Unidade'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.components.sort((a, b) => a.orderOfAddition - b.orderOfAddition).map(comp => (
                        <tr key={comp.inputItemId} className="border-t border-outline-variant/15 text-xs text-on-surface hover:bg-surface-container/50 transition-colors">
                          <td className="py-2 pr-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold inline-flex items-center justify-center">
                              {comp.orderOfAddition}
                            </span>
                          </td>
                          <td className="py-2 font-medium">{comp.inputName}</td>
                          <td className="py-2 text-right font-mono font-bold">{comp.quantityPerBatch}</td>
                          <td className="py-2 text-right text-on-surface-variant">{unitLabels[comp.unit] || comp.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                {recipe.notes && (
                  <div className="px-5 pb-4">
                    <div className="bg-surface-container/50 rounded-lg px-3 py-2 text-[10px] text-on-surface-variant leading-relaxed border border-outline-variant/20">
                      <span className="font-bold">📋 </span>{recipe.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === FERTIGATION HISTORY TAB === */}
      {subTab === 'fertigation' && (
        <div className="space-y-3">
          {fertigationLogs.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              {isEs ? 'Sin registros de fertirrigación aún.' : 'Sem registros de fertirrigação ainda.'}
            </div>
          ) : (
            fertigationLogs
              .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
              .map(log => {
                const recipe = recipes.find(r => r.id === log.recipeId);
                const zone = zones.find(z => z.id === log.zoneId);
                const phImproved = Math.abs(log.phAfter - (recipe?.targetPH.min || 5.8 + (recipe?.targetPH.max || 6.2)) / 2) <
                  Math.abs(log.phBefore - (recipe?.targetPH.min || 5.8 + (recipe?.targetPH.max || 6.2)) / 2);

                return (
                  <div key={log.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{recipe?.name || log.recipeId}</h4>
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <ChevronRight className="w-3 h-3" />
                          {zone?.name || log.zoneId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-on-surface">
                          {new Date(log.appliedAt).toLocaleDateString(isEs ? 'es-PY' : 'pt-BR')}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {new Date(log.appliedAt).toLocaleTimeString(isEs ? 'es-PY' : 'pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Before → After readings */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      <div className="bg-surface-container rounded-xl px-3 py-2 text-center">
                        <p className="text-[9px] text-on-surface-variant uppercase font-bold">pH {isEs ? 'Antes' : 'Antes'}</p>
                        <p className="text-base font-black text-on-surface">{log.phBefore.toFixed(2)}</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-[9px] text-emerald-700 uppercase font-bold">pH {isEs ? 'Después' : 'Depois'}</p>
                        <p className="text-base font-black text-emerald-700">{log.phAfter.toFixed(2)}</p>
                      </div>
                      <div className="bg-surface-container rounded-xl px-3 py-2 text-center">
                        <p className="text-[9px] text-on-surface-variant uppercase font-bold">EC {isEs ? 'Antes' : 'Antes'}</p>
                        <p className="text-base font-black text-on-surface">{log.ecBefore.toFixed(2)}</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-[9px] text-emerald-700 uppercase font-bold">EC {isEs ? 'Después' : 'Depois'}</p>
                        <p className="text-base font-black text-emerald-700">{log.ecAfter.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                      <span>💧 {log.volumeAppliedLiters}L {isEs ? 'aplicados' : 'aplicados'}</span>
                      <span>👤 {log.operatorId}</span>
                    </div>

                    {log.observations && (
                      <div className="mt-2 bg-surface-container/50 rounded-lg px-3 py-1.5 text-[10px] text-on-surface-variant border border-outline-variant/20">
                        {log.observations}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && selectedItemId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                {movType === 'entrada' ? (
                  <><ArrowDownCircle className="w-4 h-4 text-emerald-600" /> {isEs ? 'Registrar Entrada' : 'Registrar Entrada'}</>
                ) : (
                  <><ArrowUpCircle className="w-4 h-4 text-sky-600" /> {isEs ? 'Registrar Salida' : 'Registrar Saída'}</>
                )}
              </h3>
              <button onClick={() => setShowMovementModal(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              {inputItems.find(i => i.id === selectedItemId)?.name} — {inputItems.find(i => i.id === selectedItemId)?.tradeName}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  {isEs ? 'Cantidad' : 'Quantidade'} *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={movQty}
                  onChange={e => setMovQty(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              {movType === 'saida' && (
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {isEs ? 'Invernadero Destino' : 'Estufa Destino'}
                  </label>
                  <select
                    value={movZoneId}
                    onChange={e => setMovZoneId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="">—</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {movType === 'entrada' && (
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {isEs ? 'Nro. Factura / Remisión' : 'Nro. Nota Fiscal'}
                  </label>
                  <input
                    type="text"
                    value={movInvoice}
                    onChange={e => setMovInvoice(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={isEs ? 'NF-PROVEEDOR-2026-0000' : 'NF-FORN-2026-0000'}
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  {isEs ? 'Observaciones' : 'Observações'}
                </label>
                <textarea
                  value={movNotes}
                  onChange={e => setMovNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowMovementModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                {isEs ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                onClick={handleSubmitMovement}
                disabled={!movQty || Number(movQty) <= 0}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEs ? 'Confirmar' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
