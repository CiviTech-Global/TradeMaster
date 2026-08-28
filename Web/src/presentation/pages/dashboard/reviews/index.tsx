import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { businessService } from '../../../../infrastructure/api/businessService';
import { reviewService } from '../../../../infrastructure/api/reviewService';
import { formatDate } from '../../../../infrastructure/i18n/format';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Business } from '../../../../domain/types/business';
import type { Review, ReviewStats } from '../../../../domain/types/review';
import './Reviews.css';

type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

const renderStars = (rating: number): React.ReactNode => {
  const filled = Math.round(rating);
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= filled ? '\u2605' : '\u2606');
  }
  return <span className="review-stars">{stars.join('')}</span>;
};

const Reviews: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'reviews' });
  const user = useAppSelector(selectUser);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [businessFilter, setBusinessFilter] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const RATING_TABS: { key: RatingFilter; label: string }[] = [
    { key: 'all', label: t('allReviews') },
    { key: 5, label: t('fiveStars') },
    { key: 4, label: t('fourStars') },
    { key: 3, label: t('threeStars') },
    { key: 2, label: t('twoStars') },
    { key: 1, label: t('oneStar') },
  ];

  // Load businesses and then reviews for each
  const loadReviews = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userBusinesses = await businessService.getBusinessesByOwner(user.id);
      setBusinesses(userBusinesses);

      // Fetch reviews for all businesses in parallel
      const reviewPromises = userBusinesses.map((business) =>
        reviewService.getBusinessReviews(business.id)
      );
      const results = await Promise.all(reviewPromises);

      const allReviews: Review[] = [];
      let totalRating = 0;
      let totalCount = 0;

      for (const result of results) {
        allReviews.push(...result.reviews);
        // Aggregate stats from each business response
        if (result.stats) {
          totalRating += result.stats.averageRating * result.stats.totalReviews;
          totalCount += result.stats.totalReviews;
        }
      }

      // Sort by most recent first
      allReviews.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(allReviews);

      // Calculate aggregated stats
      if (totalCount > 0) {
        setStats({
          averageRating: Math.round((totalRating / totalCount) * 10) / 10,
          totalReviews: totalCount,
        });
      } else {
        // Fallback: compute from loaded reviews
        const avg =
          allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0;
        setStats({
          averageRating: Math.round(avg * 10) / 10,
          totalReviews: allReviews.length,
        });
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, businessFilter]);

  // Apply filters
  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter !== 'all' && review.rating !== ratingFilter) return false;
    if (businessFilter !== 'all' && review.business_id !== businessFilter) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get count per rating
  const getRatingCount = (rating: RatingFilter): number => {
    const base = businessFilter !== 'all'
      ? reviews.filter((r) => r.business_id === businessFilter)
      : reviews;
    if (rating === 'all') return base.length;
    return base.filter((r) => r.rating === rating).length;
  };

  // Get business name by ID
  const getBusinessName = (businessId: number): string => {
    const business = businesses.find((b) => b.id === businessId);
    return business?.title || t('businessName', { id: businessId });
  };



  if (isLoading) {
    return (
      <div className="dashboard-page fade-in">
        <div className="dashboard-page__header">
          <h1 className="dashboard-page__title">{t('title')}</h1>
        </div>
        <div className="dashboard-page__content">
          <div className="loading-spinner">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">{t('title')}</h1>
        <p className="dashboard-page__subtitle">
          {t('subtitle')}
        </p>
      </div>

      <div className="dashboard-page__content">
        {/* Stats Section */}
        <div className="reviews-stats">
          <div className="reviews-stats__card">
            <span className="reviews-stats__label">{t('averageRating')}</span>
            <div className="reviews-stats__stars">
              <span className="reviews-stats__average">{stats.averageRating.toFixed(1)}</span>
              {renderStars(stats.averageRating)}
            </div>
          </div>
          <div className="reviews-stats__card">
            <span className="reviews-stats__label">{t('totalReviews')}</span>
            <span className="reviews-stats__value">{stats.totalReviews}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="reviews-filters">
          {/* Business Filter */}
          {businesses.length > 1 && (
            <select
              className="reviews-filter-select"
              value={businessFilter}
              onChange={(e) =>
                setBusinessFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
            >
              <option value="all">{t('allBusinesses')}</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.title}
                </option>
              ))}
            </select>
          )}

          {/* Rating Filter Tabs */}
          <div className="reviews-rating-tabs">
            {RATING_TABS.map((tab) => {
              const count = getRatingCount(tab.key);
              return (
                <button
                  key={String(tab.key)}
                  className={`reviews-rating-tab ${
                    ratingFilter === tab.key ? 'reviews-rating-tab--active' : ''
                  }`}
                  onClick={() => setRatingFilter(tab.key)}
                >
                  {tab.label}
                  <span className="reviews-rating-tab__count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="businesses-section">
          <div className="businesses-table-section">
            {filteredReviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__content">
                  <h3>{t('noReviewsFound')}</h3>
                  <p>
                    {ratingFilter === 'all'
                      ? t('noCustomerReviews')
                      : ratingFilter === 1
                      ? t('noReviewsWithRating', { rating: ratingFilter })
                      : t('noReviewsWithRatingPlural', { rating: ratingFilter })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="business-table-container">
                <div className="table-responsive">
                  <table className="review-table">
                    <thead>
                      <tr>
                        <th>{t('reviewer')}</th>
                        <th>{t('business')}</th>
                        <th>{t('rating')}</th>
                        <th>{t('comment')}</th>
                        <th>{t('date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReviews.map((review) => (
                        <tr key={review.id}>
                          <td>
                            {review.reviewer
                              ? `${review.reviewer.firstname} ${review.reviewer.lastname}`
                              : t('userName', { id: review.reviewer_id })}
                          </td>
                          <td>{getBusinessName(review.business_id)}</td>
                          <td>{renderStars(review.rating)}</td>
                          <td>
                            {review.comment ? (
                              <span className="review-comment">{review.comment}</span>
                            ) : (
                              <span className="review-comment--empty">{t('noComment')}</span>
                            )}
                          </td>
                          <td>{formatDate(review.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="reviews-pagination">
                    <button
                      className="reviews-pagination__btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      {t('previous')}
                    </button>
                    <span className="reviews-pagination__info">
                      {t('pageInfo', { current: currentPage, total: totalPages })}
                    </span>
                    <button
                      className="reviews-pagination__btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      {t('next')}
                    </button>
                  </div>
                )}

                <div className="table-summary">
                  <p>
                    {filteredReviews.length === 1
                      ? t('showingReviews', { showing: paginatedReviews.length, total: filteredReviews.length })
                      : t('showingReviewsPlural', { showing: paginatedReviews.length, total: filteredReviews.length })}
                    {ratingFilter !== 'all' && (
                      ratingFilter === 1
                        ? t('filteredBy', { rating: ratingFilter })
                        : t('filteredByPlural', { rating: ratingFilter })
                    )}
                    {businessFilter !== 'all' && t('forBusiness', { business: getBusinessName(businessFilter) })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
