import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components';
import { businessService } from '../../../../infrastructure/api/businessService';
import { orderService } from '../../../../infrastructure/api/orderService';
import { useAppSelector } from '../../../../application/redux';
import { selectUser } from '../../../../application/redux';
import type { Business } from '../../../../domain/types/business';
import type { Order, OrderStatus } from '../../../../domain/types/order';
import './Orders.css';

type FilterTab = 'all' | OrderStatus;

interface StatusTabConfig {
  key: FilterTab;
  label: string;
}

const STATUS_TABS: StatusTabConfig[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const Orders: React.FC = () => {
  const user = useAppSelector(selectUser);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [showCancelInput, setShowCancelInput] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

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
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
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

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format status label
  const formatStatus = (status: OrderStatus): string => {
    return status.replace('_', ' ');
  };

  // Get business name by ID
  const getBusinessName = (businessId: number): string => {
    const business = businesses.find((b) => b.id === businessId);
    return business?.title || `Business #${businessId}`;
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__header">
          <h1 className="dashboard-page__title">Orders</h1>
        </div>
        <div className="dashboard-page__content">
          <div className="loading-spinner">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Orders</h1>
        <p className="dashboard-page__subtitle">
          Manage incoming orders across all your businesses
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
                  <h3>No orders found</h3>
                  <p>
                    {activeFilter === 'all'
                      ? 'You have no incoming orders yet.'
                      : `No orders with status "${formatStatus(activeFilter as OrderStatus)}".`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="business-table-container">
                <div className="table-responsive">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Buyer</th>
                        <th>Business</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
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
                                : `Buyer #${order.buyer_id}`}
                            </td>
                            <td>{getBusinessName(order.business_id)}</td>
                            <td>{order.items ? order.items.length : 0}</td>
                            <td>
                              <span className="order-amount">
                                {order.currency} {Number(order.total_amount).toFixed(2)}
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
                                      <h4>Order Items</h4>
                                      {order.items && order.items.length > 0 ? (
                                        <table className="order-items-table">
                                          <thead>
                                            <tr>
                                              <th>Product</th>
                                              <th>Variant</th>
                                              <th>Qty</th>
                                              <th>Unit Price</th>
                                              <th>Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {order.items.map((item) => (
                                              <tr key={item.id}>
                                                <td>
                                                  {item.product?.title ||
                                                    `Product #${item.product_id}`}
                                                </td>
                                                <td>
                                                  {item.variant
                                                    ? `${item.variant.name}: ${item.variant.value}`
                                                    : '-'}
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                  {order.currency}{' '}
                                                  {Number(item.unit_price).toFixed(2)}
                                                </td>
                                                <td>
                                                  {order.currency}{' '}
                                                  {Number(item.total_price).toFixed(2)}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p className="order-info-value--muted">
                                          No item details available.
                                        </p>
                                      )}
                                    </div>

                                    {/* Order Info */}
                                    <div className="order-info-section">
                                      <h4>Order Details</h4>
                                      <div className="order-info-item">
                                        <span className="order-info-label">
                                          Shipping Address
                                        </span>
                                        <span className="order-info-value">
                                          {order.shipping_address || (
                                            <span className="order-info-value--muted">
                                              Not provided
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <div className="order-info-item">
                                        <span className="order-info-label">Notes</span>
                                        <span className="order-info-value">
                                          {order.notes || (
                                            <span className="order-info-value--muted">
                                              No notes
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      {order.cancelled_reason && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            Cancellation Reason
                                          </span>
                                          <span className="order-info-value">
                                            {order.cancelled_reason}
                                          </span>
                                        </div>
                                      )}
                                      {order.confirmed_at && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            Confirmed At
                                          </span>
                                          <span className="order-info-value">
                                            {formatDate(order.confirmed_at)}
                                          </span>
                                        </div>
                                      )}
                                      {order.shipped_at && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            Shipped At
                                          </span>
                                          <span className="order-info-value">
                                            {formatDate(order.shipped_at)}
                                          </span>
                                        </div>
                                      )}
                                      {order.delivered_at && (
                                        <div className="order-info-item">
                                          <span className="order-info-label">
                                            Delivered At
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
                                            ? 'Updating...'
                                            : 'Confirm Order'}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          onClick={() => handleCancelOrder(order.id)}
                                          disabled={updatingOrderId === order.id}
                                        >
                                          Cancel Order
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
                                            ? 'Updating...'
                                            : 'Mark as Shipped'}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          onClick={() => handleCancelOrder(order.id)}
                                          disabled={updatingOrderId === order.id}
                                        >
                                          Cancel Order
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
                                          ? 'Updating...'
                                          : 'Mark as Delivered'}
                                      </Button>
                                    )}
                                    {(order.status === 'delivered' ||
                                      order.status === 'cancelled') && (
                                      <span className="order-info-value--muted">
                                        No actions available for this order.
                                      </span>
                                    )}
                                  </div>

                                  {/* Cancel Reason Input */}
                                  {showCancelInput === order.id && (
                                    <div className="cancel-reason-section">
                                      <label>Reason for cancellation (optional):</label>
                                      <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Enter reason for cancellation..."
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
                                            ? 'Cancelling...'
                                            : 'Confirm Cancellation'}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          onClick={() => {
                                            setShowCancelInput(null);
                                            setCancelReason('');
                                          }}
                                        >
                                          Dismiss
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
                    Showing {filteredOrders.length} order
                    {filteredOrders.length !== 1 ? 's' : ''}
                    {activeFilter !== 'all' && ` (filtered by ${formatStatus(activeFilter as OrderStatus)})`}
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
