import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components';
import { businessService } from '../../../../infrastructure/api/businessService';
import { orderService } from '../../../../infrastructure/api/orderService';
import { formatDate, formatNumber } from '../../../../infrastructure/i18n/format';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Business } from '../../../../domain/types/business';
import type { Order, OrderStatus } from '../../../../domain/types/order';
import './Orders.css';

type FilterTab = 'all' | OrderStatus;

const Orders: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'orders' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const user = useAppSelector(selectUser);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [showCancelInput, setShowCancelInput] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const STATUS_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'pending', label: t('pending') },
    { key: 'confirmed', label: t('confirmed') },
    { key: 'in_transit', label: t('inTransit') },
    { key: 'delivered', label: t('delivered') },
    { key: 'cancelled', label: t('cancelled') },
  ];

  // Load businesses and then orders for each
  const loadOrders = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userBusinesses = await businessService.getBusinessesByOwner(user.id);
      setBusinesses(userBusinesses);

      // Fetch orders for all businesses in parallel
      const orderPromises = userBusinesses.map((business) =>
        orderService.getOrdersByBusiness(business.id)
      );
      const results = await Promise.all(orderPromises);

      const allOrders: Order[] = [];
      for (const result of results) {
        allOrders.push(...result.orders);
      }

      // Sort by most recent first
      allOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(allOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter orders by status
  const filteredOrders =
    activeFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  // Get count per status
  const getStatusCount = (status: FilterTab): number => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  // Toggle expanded order
  const handleRowClick = (orderId: number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    setShowCancelInput(null);
    setCancelReason('');
  };

  // Update order status
  const handleStatusUpdate = async (
    orderId: number,
    newStatus: OrderStatus,
    reason?: string
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus, reason);
      if (updated) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, ...updated } : order))
        );
        setShowCancelInput(null);
        setCancelReason('');
      } else {
        alert(t('updateFailed'));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert(t('updateFailed'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle cancel with reason
  const handleCancelOrder = (orderId: number) => {
    if (showCancelInput === orderId) {
      // Submit the cancellation
      handleStatusUpdate(orderId, 'cancelled', cancelReason || undefined);
    } else {
      setShowCancelInput(orderId);
      setCancelReason('');
    }
  };



  // Format status label
  const formatStatus = (status: OrderStatus): string => {
    return t(status);
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
        {/* Filter Tabs */}
        <div className="orders-filter-tabs">
          {STATUS_TABS.map((tab) => {
            const count = getStatusCount(tab.key);
            return (
              <button
                key={tab.key}
                className={`orders-filter-tab ${
                  activeFilter === tab.key ? 'orders-filter-tab--active' : ''
                }`}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
                <span className="orders-filter-tab__count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="businesses-section">
          <div className="businesses-table-section">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__content">
                  <h3>{t('noOrdersFound')}</h3>
                  <p>
                    {activeFilter === 'all'
                      ? t('noIncomingOrders')
                      : t('noOrdersWithStatus', { status: formatStatus(activeFilter as OrderStatus) })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="business-table-container">
                <div className="table-responsive">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>{t('orderNumber')}</th>
                        <th>{t('buyer')}</th>
                        <th>{t('business')}</th>
                        <th>{t('items')}</th>
                        <th>{t('total')}</th>
                        <th>{t('status')}</th>
                        <th>{t('date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr
                            className={
                              expandedOrderId === order.id
                                ? 'order-row--expanded'
                                : ''
                            }
                            onClick={() => handleRowClick(order.id)}
                          >
                            <td>{order.order_number}</td>
                            <td>
                              {order.buyer
                                ? `${order.buyer.firstname} ${order.buyer.lastname}`
                                : t('buyerName', { id: order.buyer_id })}
                            </td>
                            <td>{getBusinessName(order.business_id)}</td>
                            <td>{order.items ? order.items.length : 0}</td>
                            <td>
                              <span className="order-amount">
                                {formatNumber(Number(order.total_amount), { style: 'currency', currency: order.currency })}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`order-status-badge order-status-badge--${order.status}`}
                              >
                                {formatStatus(order.status)}
                              </span>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                          </tr>

                          {/* Expanded Detail Row */}
                          {expandedOrderId === order.id && (
                            <tr
                              className="order-detail-row"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <td colSpan={7}>
                                <div className="order-detail">
                                  <div className="order-detail__grid">
                                    {/* Order Items */}
                                    <div className="order-items-section">
                                      <h4>{t('orderItems')}</h4>
                                      {order.items && order.items.length > 0 ? (
                                        <table className="order-items-table">
                                          <thead>
                                            <tr>
                                              <th>{t('product')}</th>
                                              <th>{t('variant')}</th>
                                              <th>{t('qty')}</th>
                                              <th>{t('unitPrice')}</th>
                                              <th>{t('total')}</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {order.items.map((item) => (
                                              <tr key={item.id}>
                                                <td>
                                                  {item.product?.title ||
                                                    t('productName', { id: item.product_id })}
                                                </td>
                                                <td>
                                                  {item.variant
                                                    ? `${item.variant.name}: ${item.variant.value}`
                                                    : t('noVariant')}
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                  {formatNumber(Number(item.unit_price), { style: 'currency', currency: order.currency })}
                                                </td>
                                                <td>
                                                  {formatNumber(Number(item.total_price), { style: 'currency', currency: order.currency })}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p className="order-info-value--muted">
                                          {t('noItemDetails')}
                                        </p>
                                      )}
                                    </div>

                                    {/* Order Info */}
                                    <div className="order-info-section">
                                      <h4>{t('orderDetails')}</h4>
                                      <div className="order-info-item">
                                        <span className="order-info-label">
                                          {t('shippingAddress')}
                                        </span>
                                        <span className="order-info-value">
                                          {order.shipping_address || (
                                            <span className="order-info-value--muted">
                                              {t('notProvided')}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <div className="order-info-item">
                                        <span className="order-info-label">{t('notes')}</span>
                                        <span className="order-info-value">
                                          {order.notes || (
                                            <span className="order-info-value--muted">
                                              {t('noNotes')}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      {order.cancelled_reason && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            {t('cancellationReason')}
                                          </span>
                                          <span className="order-info-value">
                                            {order.cancelled_reason}
                                          </span>
                                        </div>
                                      )}
                                      {order.confirmed_at && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            {t('confirmedAt')}
                                          </span>
                                          <span className="order-info-value">
                                            {formatDate(order.confirmed_at)}
                                          </span>
                                        </div>
                                      )}
                                      {order.shipped_at && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            {t('shippedAt')}
                                          </span>
                                          <span className="order-info-value">
                                            {formatDate(order.shipped_at)}
                                          </span>
                                        </div>
                                      )}
                                      {order.delivered_at && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            {t('deliveredAt')}
                                          </span>
                                          <span className="order-info-value">
                                            {formatDate(order.delivered_at)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Actions */}
                                  <div className="order-detail__actions">
                                    {order.status === 'pending' && (
                                      <>
                                        <Button
                                          variant="primary"
                                          onClick={() =>
                                            handleStatusUpdate(order.id, 'confirmed')
                                          }
                                          disabled={updatingOrderId === order.id}
                                        >
                                          {updatingOrderId === order.id
                                            ? commonT('updating')
                                            : t('confirmOrder')}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          onClick={() => handleCancelOrder(order.id)}
                                          disabled={updatingOrderId === order.id}
                                        >
                                          {t('cancelOrder')}
                                        </Button>
                                      </>
                                    )}
                                    {order.status === 'confirmed' && (
                                      <>
                                        <Button
                                          variant="primary"
                                          onClick={() =>
                                            handleStatusUpdate(order.id, 'in_transit')
                                          }
                                          disabled={updatingOrderId === order.id}
                                        >
                                          {updatingOrderId === order.id
                                            ? commonT('updating')
                                            : t('markAsShipped')}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          onClick={() => handleCancelOrder(order.id)}
                                          disabled={updatingOrderId === order.id}
                                        >
                                          {t('cancelOrder')}
                                        </Button>
                                      </>
                                    )}
                                    {order.status === 'in_transit' && (
                                      <Button
                                        variant="primary"
                                        onClick={() =>
                                          handleStatusUpdate(order.id, 'delivered')
                                        }
                                        disabled={updatingOrderId === order.id}
                                      >
                                        {updatingOrderId === order.id
                                          ? commonT('updating')
                                          : t('markAsDelivered')}
                                      </Button>
                                    )}
                                    {(order.status === 'delivered' ||
                                      order.status === 'cancelled') && (
                                      <span className="order-info-value--muted">
                                        {t('noActionsAvailable')}
                                      </span>
                                    )}
                                  </div>

                                  {/* Cancel Reason Input */}
                                  {showCancelInput === order.id && (
                                    <div className="cancel-reason-section">
                                      <label>{t('cancelReasonLabel')}</label>
                                      <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder={t('cancelReasonPlaceholder')}
                                      />
                                      <div className="cancel-reason-actions">
                                        <Button
                                          variant="secondary"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              order.id,
                                              'cancelled',
                                              cancelReason || undefined
                                            )
                                          }
                                          disabled={updatingOrderId === order.id}
                                        >
                                          {updatingOrderId === order.id
                                            ? t('cancelling')
                                            : t('confirmCancellation')}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          onClick={() => {
                                            setShowCancelInput(null);
                                            setCancelReason('');
                                          }}
                                        >
                                          {t('dismiss')}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-summary">
                  <p>
                    {filteredOrders.length === 1
                      ? t('showingOrders', { count: filteredOrders.length })
                      : t('showingOrdersPlural', { count: filteredOrders.length })}
                    {activeFilter !== 'all' && t('filteredBy', { status: formatStatus(activeFilter as OrderStatus) })}
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

export default Orders;
