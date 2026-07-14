import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trademaster/presentation/providers/category_provider.dart';
import 'package:trademaster/presentation/providers/product_provider.dart';

final _createProductLoadingProvider = StateProvider<bool>((ref) => false);

class CreateProductScreen extends ConsumerStatefulWidget {
  final int businessId;

  const CreateProductScreen({super.key, required this.businessId});

  @override
  ConsumerState<CreateProductScreen> createState() => _CreateProductScreenState();
}

class _CreateProductScreenState extends ConsumerState<CreateProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController(text: '0');
  int? _selectedCategoryId;
  final List<File> _selectedImages = [];
  final _picker = ImagePicker();

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final images = await _picker.pickMultiImage(maxWidth: 1920, maxHeight: 1080, imageQuality: 85);
    if (images.isNotEmpty) {
      setState(() {
        _selectedImages.addAll(images.map((x) => File(x.path)));
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    ref.read(_createProductLoadingProvider.notifier).state = true;

    try {
      final datasource = ref.read(productDatasourceProvider);

      // Create product
      final product = await datasource.createProduct(
        businessId: widget.businessId,
        title: _titleController.text.trim(),
        price: double.parse(_priceController.text.trim()),
        description: _descriptionController.text.trim().isNotEmpty
            ? _descriptionController.text.trim()
            : null,
        categoryId: _selectedCategoryId,
        stockQuantity: int.tryParse(_stockController.text.trim()) ?? 0,
      );

      // Upload images if any
      if (_selectedImages.isNotEmpty) {
        await datasource.uploadProductImages(
          productId: product.id,
          images: _selectedImages,
          setPrimary: true,
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Product created successfully')),
        );
        context.pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create product: $e')),
        );
      }
    } finally {
      ref.read(_createProductLoadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLoading = ref.watch(_createProductLoadingProvider);
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Product'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Image section
            Text('Product Images', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            SizedBox(
              height: 120,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  ..._selectedImages.asMap().entries.map((entry) {
                    final index = entry.key;
                    final file = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(file,
                                width: 120, height: 120, fit: BoxFit.cover),
                          ),
                          Positioned(
                            top: 4,
                            right: 4,
                            child: GestureDetector(
                              onTap: () => _removeImage(index),
                              child: Container(
                                decoration: const BoxDecoration(
                                  color: Colors.black54,
                                  shape: BoxShape.circle,
                                ),
                                padding: const EdgeInsets.all(4),
                                child: const Icon(Icons.close,
                                    color: Colors.white, size: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  if (_selectedImages.length < 5)
                    GestureDetector(
                      onTap: _pickImages,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: theme.colorScheme.outline, width: 2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_photo_alternate_outlined,
                                size: 32,
                                color: theme.colorScheme.onSurfaceVariant),
                            const SizedBox(height: 4),
                            Text('Add',
                                style: theme.textTheme.bodySmall
                                    ?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Title
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Product Title *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Title is required';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Price
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(
                labelText: 'Price *',
                prefixText: '\$ ',
                border: OutlineInputBorder(),
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Price is required';
                }
                final price = double.tryParse(value.trim());
                if (price == null || price < 0) {
                  return 'Enter a valid price';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Stock
            TextFormField(
              controller: _stockController,
              decoration: const InputDecoration(
                labelText: 'Stock Quantity',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Category
            categories.when(
              data: (cats) => DropdownButtonFormField<int>(
                initialValue: _selectedCategoryId,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem<int>(
                    value: null,
                    child: Text('No category'),
                  ),
                  ...cats.map((cat) => DropdownMenuItem<int>(
                        value: cat.id,
                        child: Text(cat.name),
                      )),
                ],
                onChanged: (value) {
                  setState(() => _selectedCategoryId = value);
                },
              ),
              loading: () => const LinearProgressIndicator(),
              error: (_, _) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 16),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 24),

            // Submit button
            FilledButton(
              onPressed: isLoading ? null : _submit,
              style: FilledButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
              child: isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Create Product'),
            ),
          ],
        ),
      ),
    );
  }
}
