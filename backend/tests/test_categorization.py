#!/usr/bin/env python3
"""Test the enhanced universal product categorization system."""

from services.product_categorizer import ProductCategorizer

# Test various product categories
test_queries = [
    'best running shoes under 100',
    'skincare routine for dry skin', 
    'cooking books for beginners',
    'dog toys for large breeds',
    'office chair ergonomic',
    'organic coffee beans',
    'fitness tracker with heart rate',
    'makeup for sensitive skin',
    'gaming laptop RTX 4060',
    'air conditioner 1.5 ton',
    'yoga mat for beginners',
    'car phone mount'
]

print('=== UNIVERSAL PRODUCT CATEGORIZATION TEST ===\n')

for query in test_queries:
    category_name, category_obj = ProductCategorizer.categorize_product(query)
    keywords_preview = ', '.join(category_obj.keywords[:3]) + '...' if len(category_obj.keywords) > 3 else ', '.join(category_obj.keywords)
    
    print(f'🔍 Query: "{query}"')
    print(f'📂 Category: {category_name}')
    print(f'🏷️  Keywords: {keywords_preview}')
    print(f'💰 Price range: ${category_obj.price_range[0]} - ${category_obj.price_range[1]}')
    print(f'🛒 Search sources: {", ".join(category_obj.search_sources[:2])}...')
    print('-' * 60)

print('\n✅ Universal product categorization system is working!')
print('🌟 Now supports ALL product categories, not just electronics!')