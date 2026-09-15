import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getArticleBySlug } from '../../lib/catalog';
import { FeeBadge } from '../../components/catalog/FeeBadge';
import type { CatalogArticle } from '../../types/catalog';

export function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<CatalogArticle | null>(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!slug) return;
    getArticleBySlug(slug).then(setArticle).catch(() => setArticle(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );

  if (!article) return (
    <div className="text-center py-20 max-w-3xl mx-auto">
      <p className="text-gray-500 dark:text-gray-400 mb-3">Article not found</p>
      <Link to="/discover/explore" className="text-sm text-blue-600 dark:text-blue-400 underline">Back to Explore</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <Link to="/discover/explore" className="hover:text-gray-900 dark:hover:text-white">Cards</Link>
        {article.card && (
          <>
            <span>/</span>
            <Link to={`/discover/explore/${article.card.slug}`}
              className="hover:text-gray-900 dark:hover:text-white">{article.card.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Review</span>
      </nav>

      {/* Article header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {article.card && <FeeBadge fee_type={article.card.fee_type} fee_label={article.card.fee_label} size="sm" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{article.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>By {article.author}</span>
          {article.published_at && (
            <>
              <span>·</span>
              <span>{new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </>
          )}
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
          }}
            className="ml-auto text-xs px-2.5 py-1 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Share
          </button>
        </div>
      </div>

      {/* Card thumbnail */}
      {article.thumbnail_url && (
        <img src={article.thumbnail_url} alt={article.title}
          className="w-full rounded-xl object-cover max-h-64" />
      )}

      {/* Markdown content container */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/70 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
        {article.content ? (
          <div className="markdown-content max-w-none text-base">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No content available for this article yet.</p>
        )}
      </div>

      {/* Sticky CTA */}
      {article.card?.affiliate_url && (
        <div className="sticky bottom-4 space-y-2 z-10">
          <a href={article.card.affiliate_url} target="_blank" rel="noopener noreferrer"
            className="block w-full text-center py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-base transition-all shadow-xl shadow-orange-500/20 active:scale-[0.99]">
            Apply for {article.card.name} →
          </a>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            * Referral link · you get the same benefits, we may earn a small commission
          </p>
        </div>
      )}

      {/* Explore More */}
      {article.card && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Explore More</p>
          <div className="flex flex-wrap gap-2">
            <Link to={`/discover/explore/${article.card.slug}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Card Summary →
            </Link>
            <Link to="/discover/guides/merchants"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Merchant Tips →
            </Link>
            <Link to={`/discover/tools/calculator/${article.card.slug}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Rewards Calculator →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
