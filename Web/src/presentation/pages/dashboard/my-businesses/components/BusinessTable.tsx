import React, { useState } from 'react';
import { Button } from '../../../../components';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLocation = (lat: number | string, lng: number | string) => {
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

    if (isNaN(latNum) || isNaN(lngNum)) {
      return 'Invalid coordinates';
    }

    return `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`;
  };

  const getSortIcon = (field: keyof Business) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (businesses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__content">
          <h3>No businesses yet</h3>
          <p>Click "Create a new business" to add your first business location.</p>
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
                Title {getSortIcon('title')}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('address')}
              >
                Address {getSortIcon('address')}
              </th>
              <th>Location</th>
              <th>Contact</th>
              <th
                className="sortable"
                onClick={() => handleSort('is_active')}
              >
                Status {getSortIcon('is_active')}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('createdAt')}
              >
                Created {getSortIcon('createdAt')}
              </th>
              <th>Actions</th>
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
                  <div className="business-location">
                    <small>{formatLocation(business.latitude, business.longitude)}</small>
                  </div>
                </td>
                <td>
                  <div className="business-contact">
                    <div className="contact-emails">
                      {business.emails.slice(0, 2).map((email, index) => (
                        <div key={index} className="contact-item">
                          <small>📧 {email}</small>
                        </div>
                      ))}
                      {business.emails.length > 2 && (
                        <small>+{business.emails.length - 2} more</small>
                      )}
                    </div>
                    <div className="contact-phones">
                      {business.phones.slice(0, 2).map((phone, index) => (
                        <div key={index} className="contact-item">
                          <small>📞 {phone}</small>
                        </div>
                      ))}
                      {business.phones.length > 2 && (
                        <small>+{business.phones.length - 2} more</small>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${business.is_active ? 'active' : 'inactive'}`}>
                    {business.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <small>{formatDate(business.createdAt)}</small>
                </td>
                <td>
                  <div className="table-actions">
                    <Button
                      variant="secondary"
                      onClick={() => onEdit(business)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDelete(business.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <p>
          Showing {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
          {businesses.filter(b => b.is_active).length > 0 && (
            <span> • {businesses.filter(b => b.is_active).length} active</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default BusinessTable;