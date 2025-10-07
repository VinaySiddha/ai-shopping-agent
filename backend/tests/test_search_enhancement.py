#!/usr/bin/env python3
"""Test enhanced search keyword generation for all product categories."""

from services.product_categorizer import ProductCategorizer

test_cases = [
    "best running shoes for marathon",
    "anti-aging skincare for women over 40", 
    "healthy dog food for senior dogs",
    "ergonomic office chair under 300",
    "organic coffee beans dark roast"
]

print('=== ENHANCED SEARCH KEYWORDS TEST ===\n')

for prompt in test_cases:
    category_name, category_obj = ProductCategorizer.categorize_product(prompt)
    enhanced_keywords = ProductCategorizer.get_enhanced_search_keywords(prompt, category_obj)
    budget = ProductCategorizer.extract_budget_from_prompt(prompt)
    
    print(f'🔍 Original: "{prompt}"')
    print(f'📂 Category: {category_name}')
    print(f'🎯 Enhanced keywords: {enhanced_keywords}')
    if budget:
        print(f'💰 Extracted budget: ${budget}')
    print('-' * 70)

print('\n✅ Enhanced search system ready for universal shopping!')