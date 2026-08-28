'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/* ─── Types ─── */
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string; // ISO string from JSON
  category: Category;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

/* ─── Fallback categories (used if /api/categories fails) ───
   Update these values to match the slug column in your DB. */
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'الكل', slug: '' },
  { id: 2, name: 'أخبار', slug: 'News' },
  { id: 3, name: 'فعاليات', slug: 'Activities' },
  { id: 4, name: 'إنجازات', slug: 'Achievements' },
  { id: 5, name: 'فرص تدريب', slug: 'Opportunities' },
];

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  /* Debounce search input so we don't hammer the API */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  /* Fetch categories on mount */
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Category[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories([...data]);
        }
      })
      .catch((err) => {
      console.error("Fetch failed:", err);
    });
  }, []);

  useEffect(() => {
  console.log('Categories state updated:', categories);
  console.log('Posts state updated:', posts);
}, [categories]);

useEffect(() => {
  console.log('Posts state updated:', posts);
}, [posts]);

  /* Fetch posts whenever filters or page change */
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '9');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory) params.set('category', selectedCategory);

      try {
        const res = await fetch(`/api/posts?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data: PostsResponse = await res.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setPosts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [debouncedSearch, selectedCategory, page]);

  const handleCategoryClick = useCallback((slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  }, []);

  const shareOnFacebook = (post: Post) => {
    const url = `${window.location.origin}/posts/${post.slug}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnWhatsApp = (post: Post) => {
    const url = `${window.location.origin}/posts/${post.slug}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + url)}`,
      '_blank'
    );
  };

  return (
    <div dir="rtl">
      {/* ─── Hero ─── */}
      <section
        className="py-20 px-4 text-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(147,51,234,0.2) 0%, rgba(236,72,153,0.1) 100%)',
        }}
      >
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            <span className="gradient-text">الأخبار والفعاليات</span>
          </h1>
          <div className="w-16 h-1 gradient-bg mx-auto rounded mb-6" />
          <p className="text-gray-300">
            تابع آخر أخبار المؤسسة الليبية للشباب وفعالياتها
          </p>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="ابحث في الأخبار..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.slug || 'all'}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'gradient-bg text-white'
                      : 'glass-card text-gray-300 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <p className="text-gray-400 text-lg mb-2">
                لا توجد أخبار حتى الآن
              </p>
              <p className="text-gray-600 text-sm">سيتم نشر الأخبار قريباً</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="glass-card rounded-2xl overflow-hidden hover:border-pink-500/30 transition-all group"
                  >
                    {/* Image */}
                    <div
                      className="h-52 flex items-center justify-center relative"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(236,72,153,0.1))',
                      }}
                    >
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm">
                          الصورة ستُضاف لاحقاً
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs gradient-bg text-white px-2 py-0.5 rounded-full">
                          {post.category?.name || 'أخبار'}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(post.publishedAt).toLocaleDateString(
                            'ar-LY'
                          )}
                        </span>
                      </div>

                      <h3 className="font-bold text-white mb-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt || ''}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="gradient-text text-sm font-medium flex items-center gap-1 hover:opacity-80"
                        >
                          اقرأ المزيد <ArrowLeft size={13} />
                        </Link>

                        <div className="flex gap-2">
                          <button
                            onClick={() => shareOnFacebook(post)}
                            className="text-xs glass-card px-2 py-1 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all"
                          >
                            فيسبوك
                          </button>
                          <button
                            onClick={() => shareOnWhatsApp(post)}
                            className="text-xs glass-card px-2 py-1 rounded-lg text-green-400 hover:bg-green-500/20 transition-all"
                          >
                            واتساب
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-lg text-sm glass-card text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === p
                          ? 'gradient-bg text-white'
                          : 'glass-card text-gray-300 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="px-3 py-2 rounded-lg text-sm glass-card text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}