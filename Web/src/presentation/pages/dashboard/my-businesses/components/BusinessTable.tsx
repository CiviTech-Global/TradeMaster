import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TMButton } from '../../../../components';
import { formatDate } from '../../../../../infrastructure/i18n/format';
import type { Business } from '../../../../../domain/types/business';

interface BusinessTableProps {
  businesses: Business[];
  onEdit: (business: Business) => void;
  onDelete: (id: number) => void;
}

const BusinessTable: React.FC<BusinessTableProps> = ({
  businesses,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'businessTable' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const [sortField, setSortField] = useState<keyof Business>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Business) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle undefined values
    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    // Handle different data types
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });



  const formatLocation = (lat: number | string, lng: number | string) => {
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

    if (isNaN(latNum) || isNaN(lngNum)) {
      return t('invalidCoordinates');
    }

    return `${latNum.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}, ${lngNum.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  };

  const getSortIcon = (field: keyof Business) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (businesses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__content">
          <h3>{t('noBusinessesYet')}</h3>
          <p>{t('createFirstHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-table-container">
      <div className="table-responsive">
        <table className="business-table">
          <thead>
            <tr>
              <th
                className="sortable"
                onClick={() => handleSort('title')}
              >
                {t('title')} {getSortIcon('title')}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('address')}
              >
                {t('address')} {getSortIcon('address')}
              </th>
              <th>{t('location')}</th>
              <th>{t('category')}</th>
              <th>{t('contact')}</th>
              <th
                className="sortable"
                onClick={() => handleSort('is_active')}
              >
                {t('status')} {getSortIcon('is_active')}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('createdAt')}
              >
                {t('created')} {getSortIcon('createdAt')}
              </th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedBusinesses.map((business) => (
              <tr key={business.id}>
                <td>
                  <div className="business-title">
                    {business.logo && (
                      <img
                        src={business.logo}
                        alt={business.title}
                        className="business-logo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span>{business.title}</span>
                  </div>
                </td>
                <td>
                  <div className="business-address">
                    {business.address}
                  </div>
                </td>
                <td>
                  <div className="business-location" dir="ltr">
                    <small>{formatLocation(business.latitude, business.longitude)}</small>
                  </div>
                </td>
                <td>
                  <span className="category-badge">
                    {business.category ? business.category.name : '-'}
                  </span>
                </td>
                <td>
                  <div className="business-contact">
                    <div className="contact-emails">
                      {business.emails.slice(0, 2).map((email, index) => (
                        <div key={index} className="contact-item">
                          <small>📧 <bdi dir="ltr">{email}</bdi></small>
                        </div>
                      ))}
                      {business.emails.length > 2 && (
                        <small>{t('emailMore', { count: business.emails.length - 2 })}</small>
                      )}
                    </div>
                    <div className="contact-phones">
                      {business.phones.slice(0, 2).map((phone, index) => (
                        <div key={index} className="contact-item">
                          <small>📞 <bdi dir="ltr">{phone}</bdi></small>
                        </div>
                      ))}
                      {business.phones.length > 2 && (
                        <small>{t('phoneMore', { count: business.phones.length - 2 })}</small>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${business.is_active ? 'active' : 'inactive'}`}>
                    {business.is_active ? commonT('active') : commonT('inactive')}
                  </span>
                </td>
                <td>
                  <small>{formatDate(business.createdAt)}</small>
                </td>
                <td>
                  <div className="table-actions">
                    <TMButton
                      variant="outline"
                      onClick={() => onEdit(business)}
                      style={{ minHeight: '36px', padding: '8px 12px' }}
                    >
                      {commonT('edit')}
                    </TMButton>
                    <TMButton
                      variant="outline"
                      onClick={() => onDelete(business.id)}
                      style={{ minHeight: '36px', padding: '8px 12px' }}
                    >
                      {commonT('delete')}
                    </TMButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <p>
          {businesses.length === 1
            ? t('showing', { count: businesses.length })
            : t('showingPlural', { count: businesses.length })}
          {businesses.filter(b => b.is_active).length > 0 && (
            <span> • {t('activeCount', { count: businesses.filter(b => b.is_active).length })}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default BusinessTable;
