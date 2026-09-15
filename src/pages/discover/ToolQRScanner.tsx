import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Upload, QrCode, CreditCard, Sparkles, Check, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { DiscoverSubNav } from '../../components/catalog/DiscoverSubNav';
import { supabase } from '../../lib/supabase';
import { getCatalogCards } from '../../lib/catalog';
import type { CatalogCard } from '../../types/catalog';

interface UPIData {
  raw: string;
  payeeVpa?: string;
  payeeName?: string;
  mcc?: string;
  amount?: string;
  transactionNote?: string;
  category?: string;
  categoryDesc?: string;
}

// Standard MCC database mapping for instant fallback
const COMMON_MCCS: Record<string, { category: string; desc: string; emoji: string }> = {
  '5411': { category: 'Grocery', desc: 'Grocery Stores, Supermarkets', emoji: '🛒' },
  '5462': { category: 'Grocery', desc: 'Bakeries', emoji: '🥖' },
  '5499': { category: 'Grocery', desc: 'Misc Food Stores, Convenience', emoji: '🏪' },
  '5812': { category: 'Dining', desc: 'Restaurants & Eating Places', emoji: '🍽️' },
  '5813': { category: 'Dining', desc: 'Bars, Taverns, Lounges', emoji: '🍸' },
  '5814': { category: 'Dining', desc: 'Fast Food Restaurants', emoji: '🍔' },
  '5691': { category: 'Apparel', desc: "Men's and Women's Clothing Stores", emoji: '👗' },
  '5651': { category: 'Apparel', desc: 'Family Clothing Stores', emoji: '👔' },
  '5541': { category: 'Fuel', desc: 'Service Stations / Petrol Pumps', emoji: '⛽' },
  '5542': { category: 'Fuel', desc: 'Automated Fuel Dispensers', emoji: '⛽' },
  '4900': { category: 'Utility', desc: 'Utilities - Electric, Gas, Water', emoji: '⚡' },
  '4814': { category: 'Utility', desc: 'Telecommunication Services, Mobile Recharge', emoji: '📱' },
  '4511': { category: 'Travel', desc: 'Airlines & Air Carriers', emoji: '✈️' },
  '7011': { category: 'Hotels', desc: 'Hotels, Motels, Resorts', emoji: '🏨' },
  '7832': { category: 'Entertainment', desc: 'Motion Picture Theatres / Cinema', emoji: '🎬' },
  '5399': { category: 'Online', desc: 'General Merchandise / E-Commerce', emoji: '🛍️' },
  '5912': { category: 'Healthcare', desc: 'Drug Stores and Pharmacies', emoji: '💊' },
  '8062': { category: 'Healthcare', desc: 'Hospitals', emoji: '🏥' },
  '8220': { category: 'Education', desc: 'Colleges, Universities', emoji: '🎓' },
  '8299': { category: 'Education', desc: 'Schools and Educational Services', emoji: '📚' },
};

export function ToolQRScanner() {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<UPIData | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [catalogCards, setCatalogCards] = useState<CatalogCard[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load user's active cards and catalog
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('cards').select('*').eq('user_id', data.user.id).then(({ data: c }) => {
          if (c) setUserCards(c);
        });
      }
    });
    getCatalogCards().then(setCatalogCards).catch(() => {});
  }, []);

  // Cleanup camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setScanning(true);
      scanQRCodeFrame();
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please grant camera permissions or use Image Upload / Manual Input.');
      setCameraActive(false);
    }
  };

  // Continuous frame scanner using BarcodeDetector if supported
  const scanQRCodeFrame = async () => {
    if (!videoRef.current || !streamRef.current) return;
    
    // Check native BarcodeDetector API
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const detectLoop = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              parseAndSetUPI(raw);
              stopCamera();
              return;
            }
          } catch {}
          if (streamRef.current) {
            requestAnimationFrame(detectLoop);
          }
        };
        detectLoop();
        return;
      } catch (e) {
        console.warn('BarcodeDetector fallback:', e);
      }
    }
  };

  // Parse standard UPI URI: upi://pay?pa=...&pn=...&mc=5411...
  const parseAndSetUPI = (rawStr: string) => {
    const trimmed = rawStr.trim();
    let payeeVpa = '';
    let payeeName = '';
    let mcc = '';
    let amount = '';
    let transactionNote = '';

    if (trimmed.startsWith('upi://pay') || trimmed.includes('?')) {
      try {
        const urlParams = new URLSearchParams(trimmed.split('?')[1] || trimmed);
        payeeVpa = urlParams.get('pa') || '';
        payeeName = decodeURIComponent(urlParams.get('pn') || '');
        mcc = urlParams.get('mc') || '';
        amount = urlParams.get('am') || '';
        transactionNote = decodeURIComponent(urlParams.get('tn') || '');
      } catch {}
    } else if (/^\d{4}$/.test(trimmed)) {
      mcc = trimmed;
    } else if (trimmed.includes('@')) {
      payeeVpa = trimmed;
    }

    // Lookup MCC details
    const mccInfo = mcc ? COMMON_MCCS[mcc] : null;

    setScannedData({
      raw: trimmed,
      payeeVpa,
      payeeName,
      mcc,
      amount,
      transactionNote,
      category: mccInfo?.category || (mcc ? 'General Merchant' : undefined),
      categoryDesc: mccInfo?.desc,
    });
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if ('BarcodeDetector' in window) {
      try {
        const bitmap = await createImageBitmap(file);
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await barcodeDetector.detect(bitmap);
        if (barcodes.length > 0) {
          parseAndSetUPI(barcodes[0].rawValue);
          return;
        }
      } catch (err) {
        console.warn('File barcode detection error:', err);
      }
    }

    // Fallback prompt user to paste content
    alert('QR code image loaded. If not automatically decoded by your browser, you can paste the UPI ID or MCC code below.');
  };

  // Find best cards for the detected MCC / category
  const getRecommendedCards = () => {
    if (!scannedData?.category && !scannedData?.mcc) return [];
    const cat = (scannedData.category || '').toLowerCase();
    
    // Check catalog cards that match category
    return catalogCards.filter(c => {
      const matchPerk = c.key_perks?.some(p => p.toLowerCase().includes(cat));
      const matchEarn = c.earns_on?.some(p => p.toLowerCase().includes(cat));
      const isRupay = (c.network || '').toLowerCase().includes('rupay');
      return matchPerk || matchEarn || isRupay;
    }).slice(0, 4);
  };

  const recommendedCards = getRecommendedCards();

  const handleCopy = () => {
    if (scannedData?.raw) {
      navigator.clipboard.writeText(scannedData.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <DiscoverSubNav />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📷</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UPI QR Scanner & MCC Detector</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Scan or upload any merchant UPI QR code to instantly identify the Merchant Category Code (MCC) and maximize your reward points.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => { setActiveTab('camera'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'camera'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Camera
        </button>
        <button
          onClick={() => { setActiveTab('upload'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload QR Image
        </button>
        <button
          onClick={() => { setActiveTab('manual'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'manual'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <QrCode className="w-4 h-4" /> Manual / Preset MCC
        </button>
      </div>

      {/* Camera View */}
      {activeTab === 'camera' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4 shadow-sm">
          {!cameraActive ? (
            <div className="py-12 space-y-4">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Point at any UPI QR Code</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  Works with BharatPe, Paytm, PhonePe, Google Pay, and standee merchant QRs.
                </p>
              </div>
              {cameraError && (
                <div className="flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition-colors"
              >
                Start Camera Scanner
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black max-w-md mx-auto aspect-square flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 border-2 border-dashed border-white/60 m-12 rounded-2xl pointer-events-none animate-pulse" />
              <button
                onClick={stopCamera}
                className="absolute bottom-4 px-4 py-1.5 bg-gray-900/80 text-white text-xs rounded-full backdrop-blur-sm hover:bg-gray-900 transition"
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload View */}
      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center space-y-4 shadow-sm">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upload QR screenshot or photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, or WEBP up to 10MB</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow hover:bg-gray-800 dark:hover:bg-white transition"
          >
            Select Image
          </button>
        </div>
      )}

      {/* Manual / Preset MCC View */}
      {activeTab === 'manual' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Enter UPI String or 4-Digit MCC Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 5411 or upi://pay?pa=merchant@okaxis&mc=5812..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => parseAndSetUPI(manualInput)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition"
              >
                Analyze
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COMMON_MCCS).slice(0, 8).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => parseAndSetUPI(`upi://pay?pa=merchant@upi&pn=Sample+${info.category}&mc=${code}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5"
                >
                  <span>{info.emoji}</span>
                  <span>{info.category} ({code})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scanned Result Card */}
      {scannedData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-2xl">
                {scannedData.mcc && COMMON_MCCS[scannedData.mcc]?.emoji ? COMMON_MCCS[scannedData.mcc].emoji : '🏪'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {scannedData.payeeName || 'Merchant QR Detected'}
                </h2>
                {scannedData.payeeVpa && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{scannedData.payeeVpa}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URI'}</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-semibold text-gray-400">MCC Code</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {scannedData.mcc || 'Not specified'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-semibold text-gray-400">Category</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {scannedData.category || 'General'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-semibold text-gray-400">Amount</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {scannedData.amount ? `₹${scannedData.amount}` : 'Open Amount'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-semibold text-gray-400">Payment Route</p>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                RuPay CC on UPI
              </p>
            </div>
          </div>

          {scannedData.categoryDesc && (
            <p className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
              💡 <strong>MCC Description:</strong> {scannedData.categoryDesc}. Spends at this merchant earn under the <strong>{scannedData.category}</strong> category.
            </p>
          )}

          {/* Card Recommendations */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Best Cards to Pay at this Merchant
              </h3>
            </div>

            {recommendedCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedCards.map(card => (
                  <Link
                    key={card.id}
                    to={`/discover/explore/${card.slug}`}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 transition group"
                  >
                    <span className="text-2xl mt-0.5">💳</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {card.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{card.bank} · {card.network || 'RuPay / Visa'}</p>
                      {card.key_perks?.[0] && (
                        <p className="text-[11px] text-green-600 dark:text-green-400 mt-1 line-clamp-1">
                          ✦ {card.key_perks[0]}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 space-y-1">
                <p>Use a <strong>RuPay Credit Card on UPI</strong> (e.g. Tata Neu Infinity, HDFC RuPay, BoB Eterna) to earn up to 5% cashback directly on scan-and-pay transactions.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
