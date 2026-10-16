'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Inbox,
  X
} from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  isDestructive?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filters?: FilterOption[];
  bulkActions?: BulkAction<T>[];
  pageSize?: number;
  emptyState?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  isLoading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  filters = [],
  bulkActions = [],
  pageSize = 15,
  emptyState = {
    title: 'No se encontraron resultados',
    description: 'Intenta ajustando los filtros o el término de búsqueda.',
  },
  isLoading = false,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const currentSearch = searchValue !== undefined ? searchValue : internalSearch;
  const handleSearch = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
    setCurrentPage(1);
  };

  // 1. Filtrado y ordenamiento en cliente
  const sortedData = useMemo(() => {
    let result = [...data];

    // Búsqueda en texto general si no está manejada externamente
    if (!onSearchChange && currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val || '').toLowerCase().includes(q)
        )
      );
    }

    // Ordenamiento
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortDirection === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, currentSearch, onSearchChange, sortKey, sortDirection]);

  // Paginación
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Manejo de orden
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Selección de filas
  const isAllSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedIds.has(r[keyField]));
  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (isAllSelected) {
      paginatedData.forEach((r) => newSelected.delete(r[keyField]));
    } else {
      paginatedData.forEach((r) => newSelected.add(r[keyField]));
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectRow = (id: any) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectedRows = useMemo(() => {
    return data.filter((r) => selectedIds.has(r[keyField]));
  }, [data, selectedIds, keyField]);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-13 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-[#F58220] transition-colors"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Dropdowns */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <div key={f.key} className="relative">
                <select
                  value={f.value}
                  onChange={(e) => {
                    f.onChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-12 font-medium text-zinc-700 cursor-pointer focus:outline-none focus:border-[#F58220] transition-colors"
                >
                  <option value="">{f.label}: Todos</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra de Acciones Masivas Flotante si hay selección */}
      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="bg-zinc-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-12 font-semibold">
            <span className="bg-[#F58220] text-black px-2 py-0.5 rounded font-bold">
              {selectedIds.size}
            </span>
            <span>seleccionado(s)</span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  action.onClick(selectedRows);
                  setSelectedIds(new Set());
                }}
                className={`px-3 py-1.5 rounded text-12 font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  action.isDestructive
                    ? 'bg-red-900/60 hover:bg-red-800 text-red-200'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-11 text-zinc-400 hover:text-white underline cursor-pointer ml-2"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-11 font-heading font-bold text-zinc-600 uppercase tracking-wider select-none">
                {bulkActions.length > 0 && (
                  <th className="py-3 px-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-300 text-[#F58220] focus:ring-[#F58220] cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col, idx) => {
                  const isSortable = col.sortable && col.accessorKey;
                  const isCurrentSort = sortKey === col.accessorKey;

                  return (
                    <th
                      key={idx}
                      onClick={() => isSortable && handleSort(col.accessorKey as string)}
                      className={`py-3 px-4 ${isSortable ? 'cursor-pointer hover:bg-zinc-100 transition-colors' : ''} ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {isSortable && (
                          <span className="text-zinc-400">
                            {isCurrentSort ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#F58220]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#F58220]" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3 h-3 text-zinc-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-13 text-zinc-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                    className="py-12 px-4 text-center"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-15 text-zinc-800 uppercase">
                        {emptyState.title}
                      </h4>
                      <p className="text-12 text-zinc-500">
                        {emptyState.description}
                      </p>
                      {emptyState.actionLabel && emptyState.onAction && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={emptyState.onAction}
                            className="px-4 py-2 bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold text-12 uppercase rounded-lg transition-colors cursor-pointer"
                          >
                            {emptyState.actionLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const id = row[keyField];
                  const isSelected = selectedIds.has(id);

                  return (
                    <tr
                      key={String(id)}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        isSelected ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      {bulkActions.length > 0 && (
                        <td className="py-3 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(id)}
                            className="rounded border-zinc-300 text-[#F58220] focus:ring-[#F58220] cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className={`py-3 px-4 ${col.className || ''}`}>
                          {col.cell
                            ? col.cell(row)
                            : col.accessorKey
                            ? String(row[col.accessorKey] ?? '—')
                            : null}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalItems > 0 && (
          <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-12 text-zinc-500 font-medium">
            <div>
              Mostrando{' '}
              <span className="font-bold text-zinc-800">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              a{' '}
              <span className="font-bold text-zinc-800">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>{' '}
              de <span className="font-bold text-zinc-800">{totalItems}</span>{' '}
              registros
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-zinc-600"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-zinc-800 text-12">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-zinc-600"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
