import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../../components';
import { productService } from '../../../../infrastructure/api/productService';
import { categoryService } from '../../../../infrastructure/api/categoryService';
import { uploadService } from '../../../../infrastructure/api/uploadService';
import { formatNumber } from '../../../../infrastructure/i18n/format';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductImage,
} from '../../../../domain/types/product';
import type { Category } from '../../../../domain/types/category';
import './Products.css';

interface VariantFormData {
  name: string;
  value: string;
  price_modifier: string;
  stock_quantity: string;
}

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  stock_quantity: string;
  category_id: string;
  is_active: boolean;
}

const emptyForm: ProductFormData = {
  title: '',
  description: '',
  price: '',
  currency: 'USD',
  stock_quantity: '0',
  category_id: '',
  is_active: true,
};

const emptyVariant: VariantFormData = {
  name: '',
  value: '',
  price_modifier: '0',
  stock_quantity: '0',
};

const Products: React.FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'products' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image state
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const numericBusinessId = businessId ? parseInt(businessId, 10) : null;

  // Load products
  const loadProducts = useCallback(async () => {
    if (!numericBusinessId) return;
    setIsLoading(true);
    try {
      const result = await productService.getProductsByBusiness(numericBusinessId);
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [numericBusinessId]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const result = await categoryService.getAllCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Clean up image preview URLs on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const resetForm = () => {
    setFormData(emptyForm);
    setVariants([]);
    setExistingImages([]);
    setNewImageFiles([]);
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setNewImagePreviews([]);
    setFormErrors([]);
    setEditingProduct(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      currency: product.currency,
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id ? product.category_id.toString() : '',
      is_active: product.is_active,
    });
    setExistingImages(product.images || []);
    setVariants(
      (product.variants || []).map(v => ({
        name: v.name,
        value: v.value,
        price_modifier: v.price_modifier.toString(),
        stock_quantity: v.stock_quantity.toString(),
      }))
    );
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleFormChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const previews = fileArray.map(f => URL.createObjectURL(f));

    setNewImageFiles(prev => [...prev, ...fileArray]);
    setNewImagePreviews(prev => [...prev, ...previews]);

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (image: ProductImage) => {
    if (!editingProduct) return;
    const confirmed = window.confirm(t('imageDeleteConfirm'));
    if (!confirmed) return;

    try {
      const success = await productService.deleteProductImage(editingProduct.id, image.id);
      if (success) {
        setExistingImages(prev => prev.filter(img => img.id !== image.id));
      } else {
        alert(t('deleteImageFailed'));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert(t('deleteImageFailed'));
    }
  };

  // Variant handling
  const handleAddVariant = () => {
    setVariants(prev => [...prev, { ...emptyVariant }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantFormData, value: string) => {
    setVariants(prev =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Validate form
  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push(t('titleRequired'));
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) errors.push(t('priceInvalid'));
    const stock = parseInt(formData.stock_quantity, 10);
    if (isNaN(stock) || stock < 0) errors.push(t('stockInvalid'));

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name.trim()) errors.push(t('variantNameRequired', { index: i + 1 }));
      if (!v.value.trim()) errors.push(t('variantValueRequired', { index: i + 1 }));
    }
    return errors;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);
    setIsSubmitting(true);

    try {
      let product: Product;

      if (editingProduct) {
        // Update existing product
        const updateData: UpdateProductRequest = {
          title: formData.title,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          currency: formData.currency,
          stock_quantity: parseInt(formData.stock_quantity, 10),
          category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
          is_active: formData.is_active,
        };
        product = await productService.updateProduct(editingProduct.id, updateData);

        // Handle variant syncing for existing product
        // Delete variants that were removed
        const existingVariantNames = (editingProduct.variants || []).map(v => `${v.name}:${v.value}`);
        const newVariantNames = variants.map(v => `${v.name}:${v.value}`);

        for (const ev of editingProduct.variants || []) {
          const key = `${ev.name}:${ev.value}`;
          if (!newVariantNames.includes(key)) {
            await productService.deleteVariant(editingProduct.id, ev.id);
          }
        }

        // Create new variants
        for (const v of variants) {
          const key = `${v.name}:${v.value}`;
          if (!existingVariantNames.includes(key)) {
            await productService.createVariant(product.id, {
              name: v.name,
              value: v.value,
              price_modifier: parseFloat(v.price_modifier) || 0,
              stock_quantity: parseInt(v.stock_quantity, 10) || 0,
            });
          }
        }
      } else {
        // Create new product
        if (!numericBusinessId) return;
        const createData: CreateProductRequest = {
          business_id: numericBusinessId,
          title: formData.title,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          currency: formData.currency,
          stock_quantity: parseInt(formData.stock_quantity, 10),
          category_id: formData.category_id ? parseInt(formData.category_id, 10) : undefined,
          is_active: formData.is_active,
        };
        product = await productService.createProduct(createData);

        // Create variants
        for (const v of variants) {
          await productService.createVariant(product.id, {
            name: v.name,
            value: v.value,
            price_modifier: parseFloat(v.price_modifier) || 0,
            stock_quantity: parseInt(v.stock_quantity, 10) || 0,
          });
        }
      }

      // Upload new images if any
      if (newImageFiles.length > 0) {
        try {
          await productService.uploadProductImages(product.id, newImageFiles);
        } catch (err) {
          console.error('Image upload failed:', err);
          alert(t('imageUploadFailed'));
        }
      }

      await loadProducts();
      setShowForm(false);
      resetForm();
      alert(editingProduct ? t('productUpdated') : t('productCreated'));
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(t('saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      const success = await productService.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert(t('productDeleted'));
      } else {
        alert(t('deleteFailed'));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(t('deleteFailed'));
    }
  };

  // Helper: get stock badge class
  const getStockBadgeClass = (qty: number): string => {
    if (qty <= 0) return 'out-of-stock';
    if (qty <= 10) return 'low-stock';
    return 'in-stock';
  };

  const getStockLabel = (qty: number): string => {
    if (qty <= 0) return t('outOfStock');
    if (qty <= 10) return t('lowStock', { count: qty });
    return qty.toString();
  };

  // Get primary image URL
  const getPrimaryImage = (product: Product): string | null => {
    if (!product.images || product.images.length === 0) return null;
    const primary = product.images.find(img => img.is_primary);
    return primary ? primary.url : product.images[0].url;
  };

  const getImageUrl = (url: string): string => {
    if (url.startsWith('http')) return url;
    return uploadService.getFullUrl(url);
  };

  if (!numericBusinessId || isNaN(numericBusinessId)) {
    return (
      <div className="dashboard-page fade-in">
        <div className="dashboard-page__content">
          <p>{t('invalidBusinessId')}</p>
          <button className="products-back-link" onClick={() => navigate('/dashboard/my-businesses')}>
            {t('backToMyBusinesses')}
          </button>
        </div>
      </div>
    );
  }

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
        <button
          className="products-back-link"
          onClick={() => navigate('/dashboard/my-businesses')}
        >
          {t('backToMyBusinesses')}
        </button>
        <h1 className="dashboard-page__title">{t('title')}</h1>
        <p className="dashboard-page__subtitle">
          {t('subtitle')}
        </p>
        <div className="dashboard-page__actions">
          <Button variant="primary" onClick={handleOpenCreate}>
            {t('addNewProduct')}
          </Button>
        </div>
      </div>

      <div className="dashboard-page__content">
        {/* Create / Edit Form */}
        {showForm && (
          <div className="product-creation-section">
            <div className="product-creation__header">
              <h2>{editingProduct ? t('editProduct') : t('createNewProduct')}</h2>
              <Button variant="secondary" onClick={handleCancel}>
                {commonT('cancel')}
              </Button>
            </div>

            <form className="product-creation__form" onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="form-section">
                <h4>{t('basicInformation')}</h4>
                <div className="product-form-grid">
                  <div className="form-row form-row--full">
                    <Input
                      label={t('productTitle')}
                      type="text"
                      placeholder={t('productTitlePlaceholder')}
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-row form-row--full">
                    <label className="input-label">{t('description')}</label>
                    <textarea
                      className="form-textarea"
                      placeholder={t('descriptionPlaceholder')}
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label={t('price')}
                      type="number"
                      placeholder={t('pricePlaceholder')}
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label className="input-label">{t('currency')}</label>
                    <select
                      className="category-select"
                      value={formData.currency}
                      onChange={(e) => handleFormChange('currency', e.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                      <option value="AZN">AZN</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <Input
                      label={t('stockQuantity')}
                      type="number"
                      placeholder={t('stockPlaceholder')}
                      value={formData.stock_quantity}
                      onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label className="input-label">{commonT('category')}</label>
                    <select
                      className="category-select"
                      value={formData.category_id}
                      onChange={(e) => handleFormChange('category_id', e.target.value)}
                    >
                      <option value="">{commonT('noCategory')}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row form-row--full">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleFormChange('is_active', e.target.checked)}
                      />
                      {t('activeVisible')}
                    </label>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="image-upload-section">
                <h4>{t('productImages')}</h4>

                {/* Existing images (edit mode) */}
                {existingImages.length > 0 && (
                  <div className="image-preview-grid">
                    {existingImages.map(img => (
                      <div key={img.id} className="image-preview-item">
                        <img src={getImageUrl(img.url)} alt={img.alt_text || t('productImages')} />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => handleRemoveExistingImage(img)}
                          title={t('removeImage')}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {newImagePreviews.length > 0 && (
                  <div className="image-preview-grid">
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="image-preview-item">
                        <img src={preview} alt={`New upload ${index + 1}`} />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => handleRemoveNewImage(index)}
                          title={t('removeImage')}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="image-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>{t('uploadImages')}</span>
                  <p>{t('uploadImagesHint')}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="image-upload-input"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
              </div>

              {/* Variants */}
              <div className="variant-section">
                <h4>{t('productVariants')}</h4>
                {variants.length > 0 && (
                  <div className="variant-list">
                    {variants.map((variant, index) => (
                      <div key={index} className="variant-item">
                        <input
                          type="text"
                          placeholder={t('variantNamePlaceholder')}
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder={t('variantValuePlaceholder')}
                          value={variant.value}
                          onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder={t('variantPriceModifierPlaceholder')}
                          value={variant.price_modifier}
                          onChange={(e) => handleVariantChange(index, 'price_modifier', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder={t('variantStockPlaceholder')}
                          value={variant.stock_quantity}
                          onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                        />
                        <button
                          type="button"
                          className="variant-remove-btn"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          {t('remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" className="variant-add-btn" onClick={handleAddVariant}>
                  {t('addVariant')}
                </button>
              </div>

              {/* Errors */}
              {formErrors.length > 0 && (
                <div className="form-errors">
                  <h5>{t('fixErrors')}</h5>
                  <ul>
                    {formErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="form-actions">
                <Button variant="secondary" onClick={handleCancel}>
                  {commonT('cancel')}
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t('saving')
                    : editingProduct
                    ? t('updateProduct')
                    : t('createProduct')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {!showForm && (
          <div className="businesses-section">
            <div className="businesses-table-section">
              <div className="businesses-header">
                <h3>{t('productsCount', { count: products.length })}</h3>
              </div>

              {products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__content">
                    <h3>{t('noProductsYet')}</h3>
                    <p>{t('createFirstProduct')}</p>
                  </div>
                </div>
              ) : (
                <div className="business-table-container">
                  <div className="table-responsive">
                    <table className="product-table">
                      <thead>
                        <tr>
                          <th>{t('productTitle')}</th>
                          <th>{t('price')}</th>
                          <th>{t('stockQuantity')}</th>
                          <th>{commonT('category')}</th>
                          <th>{commonT('status')}</th>
                          <th>{commonT('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => {
                          const imageUrl = getPrimaryImage(product);
                          return (
                            <tr key={product.id}>
                              <td>
                                <div className="product-title-cell">
                                  {imageUrl ? (
                                    <img
                                      src={getImageUrl(imageUrl)}
                                      alt={product.title}
                                      className="product-thumbnail"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="product-thumbnail-placeholder">?</div>
                                  )}
                                  <span>{product.title}</span>
                                </div>
                              </td>
                              <td>
                                <span className="product-price">
                                  {formatNumber(Number(product.price), { style: 'currency', currency: product.currency || 'USD' })}
                                </span>
                              </td>
                              <td>
                                <span className={`stock-badge ${getStockBadgeClass(product.stock_quantity)}`}>
                                  {getStockLabel(product.stock_quantity)}
                                </span>
                              </td>
                              <td>
                                {product.Category ? product.Category.name : '-'}
                              </td>
                              <td>
                                <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                  {product.is_active ? commonT('active') : commonT('inactive')}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <Button variant="secondary" onClick={() => handleOpenEdit(product)}>
                                    {commonT('edit')}
                                  </Button>
                                  <Button variant="secondary" onClick={() => handleDeleteProduct(product.id)}>
                                    {commonT('delete')}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-summary">
                    <p>
                      {products.length === 1
                        ? t('showingProducts', { count: products.length })
                        : t('showingProductsPlural', { count: products.length })}
                      {products.filter(p => p.is_active).length > 0 && (
                        <span> • {t('activeCount', { count: products.filter(p => p.is_active).length })}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
