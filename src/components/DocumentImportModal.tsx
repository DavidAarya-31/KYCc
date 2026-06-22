import React, { useMemo, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PaymentMethod } from '../lib/supabase';
import { callVisionModel, ExtractedTransaction } from '../utils/ai';

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

type ImportedRow = ExtractedTransaction & {
  category_id: string | null;
  payment_method: PaymentMethod | null;
  include: boolean;
};

type DocumentImportModalProps = {
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  onImport: (rows: any[]) => void;
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractPdfImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const images: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    images.push(canvas.toDataURL('image/png'));
  }

  return images;
}

export function DocumentImportModal({ open, onClose, categories, onImport }: DocumentImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewRows, setReviewRows] = useState<ImportedRow[]>([]);

  const otherCategoryId = useMemo(() => {
    return categories.find(category => category.name.toLowerCase() === 'other')?.id || null;
  }, [categories]);

  const reset = () => {
    setFile(null);
    setLoading(false);
    setError('');
    setReviewRows([]);
  };

  React.useEffect(() => {
    if (open) reset();
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.type.startsWith('image/')) {
      setError('Please select a PDF or Image file.');
      return;
    }
    setFile(selected);
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      let base64Images: string[] = [];
      if (file.type === 'application/pdf') {
        base64Images = await extractPdfImages(file);
      } else {
        base64Images = [await fileToBase64(file)];
      }

      const extracted = await callVisionModel(base64Images, categories);
      
      const rows = extracted.map(row => {
        // Find matching category ID based on suggested name
        const matchedCategory = categories.find(
          c => c.name.toLowerCase() === row.suggested_category?.toLowerCase()
        );
        
        return {
          ...row,
          category_id: matchedCategory?.id || otherCategoryId,
          payment_method: null,
          include: true,
        };
      });

      setReviewRows(rows);
      if (rows.length === 0) {
        setError('No transactions were detected in the document.');
      }
    } catch (err: any) {
      console.error('Extraction failed:', err);
      setError(err.message || 'Failed to extract transactions from the document.');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index: number, key: keyof ImportedRow, value: any) => {
    setReviewRows(prev => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  };

  const handleImport = () => {
    const rows = reviewRows
      .filter(row => row.include)
      .map(row => ({
        amount: parseFloat(row.amount),
        date: row.date || new Date().toISOString().slice(0, 10),
        category_id: row.category_id || otherCategoryId,
        category: 'Other',
        description: row.description || 'Imported Transaction',
        payment_method: row.payment_method || null,
        type: row.type || 'expense',
      }))
      .filter(row => !Number.isNaN(row.amount) && row.amount > 0 && row.date && row.category_id);

    onImport(rows);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Import Document (AI Vision)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload a receipt image or PDF statement to extract transactions.</p>
          </div>
          <button className="text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="space-y-4">
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 dark:text-gray-200"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              onClick={handleExtract}
              disabled={!file || loading}
            >
              {loading ? 'Extracting with AI...' : 'Extract Transactions'}
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>

          {file && <p className="text-sm text-gray-500 dark:text-gray-400">Selected: {file.name}</p>}
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-200">{error}</div>}

          {reviewRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Review extracted rows</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{reviewRows.length} detected</span>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {reviewRows.map((row, index) => (
                  <div key={`${row.description}-${index}`} className={`grid gap-3 rounded-xl border p-4 md:grid-cols-6 ${row.confidence === 'low' ? 'border-yellow-300 bg-yellow-50/70 dark:border-yellow-800 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                    <label className="flex items-center gap-2 text-sm md:flex-col md:items-start">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Include</span>
                      <input type="checkbox" checked={row.include} onChange={e => updateRow(index, 'include', e.target.checked)} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Date</span>
                      <input className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800" type="date" value={row.date} onChange={e => updateRow(index, 'date', e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Amount</span>
                      <input className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800" type="number" min="0" step="0.01" value={row.amount} onChange={e => updateRow(index, 'amount', e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm md:col-span-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
                      <input className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800" type="text" value={row.description} onChange={e => updateRow(index, 'description', e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Payment Method</span>
                      <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800" value={row.payment_method || ''} onChange={e => updateRow(index, 'payment_method', (e.target.value || null) as PaymentMethod | null)}>
                        <option value="">Unspecified</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                        <option value="debit_card">Debit Card</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm md:col-span-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                      <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800" value={row.category_id || ''} onChange={e => updateRow(index, 'category_id', e.target.value || null)}>
                        <option value="">Other</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50" onClick={handleImport} disabled={reviewRows.length === 0}>Import Selected</button>
                <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
