import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Gift, Upload, Copy, Check, Sparkles, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { DiscoverSubNav } from '../../components/catalog/DiscoverSubNav';

interface ExtractedCard {
  brand: string;
  code: string;
  pin: string;
  amount: string;
  expiry: string;
  rawText: string;
}

const POPULAR_BRANDS = [
  { name: 'Amazon Pay', match: /amazon/i, redeemUrl: 'https://www.amazon.in/g/claim', emoji: '📦' },
  { name: 'Flipkart', match: /flipkart/i, redeemUrl: 'https://www.flipkart.com/account/giftcards', emoji: '🛍️' },
  { name: 'Myntra', match: /myntra/i, redeemUrl: 'https://www.myntra.com/my/giftcard', emoji: '👗' },
  { name: 'Swiggy Money', match: /swiggy/i, redeemUrl: 'https://www.swiggy.com', emoji: '🍔' },
  { name: 'Zomato', match: /zomato/i, redeemUrl: 'https://www.zomato.com', emoji: '🍕' },
  { name: 'MakeMyTrip', match: /makemytrip|mmt/i, redeemUrl: 'https://www.makemytrip.com', emoji: '✈️' },
  { name: 'Croma', match: /croma/i, redeemUrl: 'https://www.croma.com', emoji: '🔌' },
  { name: 'Apple Gift Card', match: /apple|itunes/i, redeemUrl: 'https://apple.co/redeem', emoji: '🍎' },
];

export function ToolGiftCard() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [card, setCard] = useState<ExtractedCard | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        extractGiftCard(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractGiftCard = async (imgData: string) => {
    setLoading(true);
    setProgress(10);
    try {
      const { data: { text } } = await Tesseract.recognize(imgData, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text' && m.progress) {
            setProgress(Math.round(m.progress * 90) + 10);
          }
        },
      });

      // Parse fields using regex patterns
      let detectedBrand = 'Generic Gift Card';
      for (const b of POPULAR_BRANDS) {
        if (b.match.test(text)) {
          detectedBrand = b.name;
          break;
        }
      }

      // Card / Claim Code: typically 14-16 chars or alphanumeric like XXXX-XXXX-XXXX
      const codePatterns = [
        /([A-Z0-9]{4}[-\s][A-Z0-9]{4}[-\s][A-Z0-9]{4}[-\s][A-Z0-9]{4})/i,
        /Claim\s*Code[:\s]*([A-Z0-9-]{12,20})/i,
        /Card\s*No[.:\s]*([A-Z0-9]{10,19})/i,
        /Code[:\s]*([A-Z0-9]{12,19})/i,
        /([A-Z0-9]{14,16})/,
      ];
      let extractedCode = '';
      for (const p of codePatterns) {
        const m = text.match(p);
        if (m) {
          extractedCode = m[1].replace(/\s+/g, '');
          break;
        }
      }

      // PIN / Security Code: 4 to 6 digits
      const pinMatch = text.match(/(?:PIN|Security\s*Code|Passcode)[:\s]*([0-9]{4,6})/i);
      const extractedPin = pinMatch ? pinMatch[1] : '';

      // Amount: ₹XXX or Rs. XXX
      const amountMatch = text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+)/i) || text.match(/([\d,]+)\s*(?:₹|Rs|INR)/i);
      const extractedAmount = amountMatch ? amountMatch[1].replace(/,/g, '') : '';

      // Expiry date
      const expMatch = text.match(/(?:Valid\s*Thru|Expiry|Exp\.?\s*Date)[:\s]*([0-9]{2}[/-][0-9]{2,4})/i);
      const extractedExp = expMatch ? expMatch[1] : '';

      setCard({
        brand: detectedBrand,
        code: extractedCode,
        pin: extractedPin,
        amount: extractedAmount,
        expiry: extractedExp,
        rawText: text,
      });
    } catch (err) {
      console.error('OCR Extraction error:', err);
      alert('Failed to process image. Please try uploading a clearer image.');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const brandInfo = POPULAR_BRANDS.find(b => b.name === card?.brand);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <DiscoverSubNav />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎁</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gift Card & Voucher Extractor</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload any gift card photo or e-voucher screenshot to instantly extract the claim code, PIN, and balance using local OCR.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center space-y-4 shadow-sm">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        {image ? (
          <div className="space-y-4">
            <div className="max-h-60 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 max-w-sm mx-auto shadow-sm">
              <img src={image} alt="Uploaded Gift Card" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 text-gray-700 dark:text-gray-200 transition"
              >
                Upload Different Image
              </button>
              <button
                onClick={() => extractGiftCard(image)}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Re-scan Image
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upload or Drop Gift Card Image</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Supports Amazon, Flipkart, Myntra, Swiggy, Apple, Google Play, Croma, and brand vouchers.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition"
            >
              Select Card Photo
            </button>
          </div>
        )}

        {/* OCR Progress Bar */}
        {loading && (
          <div className="max-w-md mx-auto space-y-2 pt-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Scanning card text...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Extracted Details Result */}
      {card && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{brandInfo?.emoji || '🎁'}</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{card.brand}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Extracted voucher details</p>
              </div>
            </div>
            {brandInfo?.redeemUrl && (
              <a
                href={brandInfo.redeemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
              >
                <span>Redeem Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card / Voucher Code */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Card / Claim Code</span>
                {card.code && (
                  <button
                    onClick={() => copyToClipboard(card.code, 'code')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'code' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <p className="text-base font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                {card.code || 'Not detected'}
              </p>
            </div>

            {/* PIN */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Card PIN / Passcode</span>
                {card.pin && (
                  <button
                    onClick={() => copyToClipboard(card.pin, 'pin')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'pin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'pin' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <p className="text-base font-mono font-bold text-gray-900 dark:text-white tracking-widest">
                {card.pin || 'No PIN Required / Detected'}
              </p>
            </div>

            {/* Value */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Value / Balance</span>
              <p className="text-base font-bold text-green-600 dark:text-green-400">
                {card.amount ? `₹${card.amount}` : 'Check at Redemption'}
              </p>
            </div>

            {/* Expiry */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Valid Thru / Expiry</span>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {card.expiry || 'Standard 1 Year'}
              </p>
            </div>
          </div>

          {/* Raw Text Accordion / Debug */}
          <details className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
            <summary className="cursor-pointer font-medium hover:text-gray-700 dark:hover:text-gray-300">
              View Raw OCR Transcript
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
              {card.rawText}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
