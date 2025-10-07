// src/components/ProductFilters.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const PRODUCT_CATEGORIES = [
  // Electronics
  { id: 'laptop', name: 'Laptops', category: 'Electronics' },
  { id: 'smartphone', name: 'Smartphones', category: 'Electronics' },
  { id: 'headphones', name: 'Headphones', category: 'Electronics' },
  { id: 'keyboard', name: 'Keyboards', category: 'Electronics' },
  { id: 'tablet', name: 'Tablets', category: 'Electronics' },
  { id: 'smartwatch', name: 'Smartwatches', category: 'Electronics' },
  { id: 'camera', name: 'Cameras', category: 'Electronics' },
  
  // Home & Kitchen
  { id: 'refrigerator', name: 'Refrigerators', category: 'Home & Kitchen' },
  { id: 'washing_machine', name: 'Washing Machines', category: 'Home & Kitchen' },
  { id: 'microwave', name: 'Microwaves', category: 'Home & Kitchen' },
  { id: 'air_conditioner', name: 'Air Conditioners', category: 'Home & Kitchen' },
  
  // Clothing & Fashion
  { id: 'shoes', name: 'Shoes', category: 'Fashion' },
  { id: 'clothing', name: 'Clothing', category: 'Fashion' },
  { id: 'watch', name: 'Watches', category: 'Fashion' },
  
  // Beauty & Personal Care
  { id: 'skincare', name: 'Skincare', category: 'Beauty' },
  { id: 'makeup', name: 'Makeup', category: 'Beauty' },
  { id: 'perfume', name: 'Perfumes', category: 'Beauty' },
  
  // Books & Media
  { id: 'books', name: 'Books', category: 'Media' },
  { id: 'music', name: 'Music', category: 'Media' },
  
  // Sports & Fitness
  { id: 'fitness_equipment', name: 'Fitness Equipment', category: 'Sports' },
  { id: 'sports_gear', name: 'Sports Gear', category: 'Sports' },
  
  // Toys & Games
  { id: 'toys', name: 'Toys', category: 'Toys' },
  { id: 'video_games', name: 'Video Games', category: 'Games' },
  
  // Other Categories
  { id: 'car_accessories', name: 'Car Accessories', category: 'Automotive' },
  { id: 'pet_supplies', name: 'Pet Supplies', category: 'Pets' },
  { id: 'office_supplies', name: 'Office Supplies', category: 'Office' },
  { id: 'garden_supplies', name: 'Garden Supplies', category: 'Garden' },
  { id: 'food', name: 'Food & Beverages', category: 'Food' },
];

const BUDGET_RANGES = [
  { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-300', label: '$100 - $300', min: 100, max: 300 },
  { id: '300-500', label: '$300 - $500', min: 300, max: 500 },
  { id: '500-1000', label: '$500 - $1,000', min: 500, max: 1000 },
  { id: '1000-1500', label: '$1,000 - $1,500', min: 1000, max: 1500 },
  { id: '1500-2500', label: '$1,500 - $2,500', min: 1500, max: 2500 },
  { id: 'over-2500', label: 'Over $2,500', min: 2500, max: 10000 },
  { id: 'custom', label: 'Custom Range', min: 0, max: 0 },
];

const BRANDS = {
  // Electronics
  laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer', 'Microsoft'],
  smartphone: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Sony', 'Motorola'],
  headphones: ['Sony', 'Bose', 'Apple', 'Sennheiser', 'Audio-Technica', 'Beats', 'JBL', 'Skullcandy'],
  keyboard: ['Logitech', 'Corsair', 'Razer', 'SteelSeries', 'Keychron', 'Das Keyboard', 'Cherry'],
  tablet: ['Apple', 'Samsung', 'Microsoft', 'Amazon', 'Lenovo', 'Huawei', 'Google'],
  smartwatch: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Amazfit', 'Fossil', 'Huawei'],
  camera: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Olympus', 'Panasonic', 'Leica'],
  
  // Home & Kitchen
  refrigerator: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Frigidaire', 'KitchenAid', 'Bosch'],
  washing_machine: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Maytag', 'Bosch', 'Electrolux'],
  microwave: ['Panasonic', 'Samsung', 'LG', 'GE', 'Sharp', 'Whirlpool', 'Breville'],
  air_conditioner: ['Carrier', 'Trane', 'Daikin', 'Mitsubishi', 'LG', 'Samsung', 'Frigidaire'],
  
  // Fashion
  shoes: ['Nike', 'Adidas', 'Puma', 'New Balance', 'Converse', 'Vans', 'Under Armour', 'Reebok'],
  clothing: ['H&M', 'Zara', 'Uniqlo', 'Gap', 'Levi\'s', 'Nike', 'Adidas', 'Ralph Lauren'],
  watch: ['Rolex', 'Casio', 'Seiko', 'Citizen', 'Fossil', 'Timex', 'Tag Heuer', 'Omega'],
  
  // Beauty
  skincare: ['CeraVe', 'Neutrogena', 'L\'Oreal', 'Olay', 'Clinique', 'The Ordinary', 'Cetaphil'],
  makeup: ['Maybelline', 'L\'Oreal', 'MAC', 'Urban Decay', 'Sephora', 'NYX', 'Revlon'],
  perfume: ['Chanel', 'Dior', 'Calvin Klein', 'Hugo Boss', 'Versace', 'Armani', 'Dolce & Gabbana'],
  
  // Media
  books: ['Penguin', 'HarperCollins', 'Random House', 'Simon & Schuster', 'Macmillan', 'Scholastic'],
  music: ['Universal', 'Sony Music', 'Warner Music', 'Atlantic', 'Columbia', 'Capitol'],
  
  // Sports & Fitness
  fitness_equipment: ['Bowflex', 'NordicTrack', 'Peloton', 'Life Fitness', 'Nautilus', 'Schwinn'],
  sports_gear: ['Nike', 'Adidas', 'Under Armour', 'Wilson', 'Spalding', 'Rawlings', 'Easton'],
  
  // Toys & Games
  toys: ['LEGO', 'Mattel', 'Hasbro', 'Fisher-Price', 'Playmobil', 'VTech', 'Melissa & Doug'],
  video_games: ['PlayStation', 'Xbox', 'Nintendo', 'Steam', 'Epic Games', 'Ubisoft', 'EA'],
  
  // Other
  car_accessories: ['Garmin', 'Pioneer', 'Kenwood', 'Alpine', 'JBL', 'Thule', 'WeatherTech'],
  pet_supplies: ['Purina', 'Hill\'s', 'Royal Canin', 'Blue Buffalo', 'Pedigree', 'Whiskas'],
  office_supplies: ['HP', 'Canon', 'Epson', 'Brother', 'Staples', '3M', 'Post-it'],
  garden_supplies: ['Miracle-Gro', 'Scotts', 'Black & Decker', 'WORX', 'Greenworks', 'Sun Joe'],
  food: ['Organic Valley', 'Nature\'s Path', 'Annie\'s', 'Whole Foods', 'Trader Joe\'s', 'Kellogg\'s'],
};

const USE_CASES = {
  // Electronics
  laptop: ['Gaming', 'Work/Business', 'Student', 'Creative Work', 'Programming', 'General Use'],
  smartphone: ['Photography', 'Gaming', 'Business', 'Social Media', 'General Use'],
  headphones: ['Music', 'Gaming', 'Work/Calls', 'Travel', 'Exercise', 'General Use'],
  keyboard: ['Gaming', 'Programming', 'Writing', 'General Use'],
  tablet: ['Drawing/Design', 'Reading', 'Entertainment', 'Note Taking', 'General Use'],
  smartwatch: ['Fitness Tracking', 'Smart Notifications', 'Health Monitoring', 'Sports', 'General Use'],
  camera: ['Photography', 'Video Recording', 'Travel', 'Professional Work', 'Hobby'],
  
  // Home & Kitchen
  refrigerator: ['Family Use', 'Single Person', 'Energy Efficient', 'Large Capacity', 'Compact'],
  washing_machine: ['Large Family', 'Small Household', 'Energy Efficient', 'Quick Wash', 'Delicate Care'],
  microwave: ['Basic Heating', 'Cooking', 'Defrosting', 'Grilling', 'Convection'],
  air_conditioner: ['Small Room', 'Large Room', 'Energy Efficient', 'Quiet Operation', 'Smart Control'],
  
  // Fashion
  shoes: ['Running', 'Walking', 'Formal', 'Casual', 'Sports', 'Hiking', 'Fashion'],
  clothing: ['Casual', 'Work/Business', 'Formal', 'Sports', 'Outdoor', 'Fashion'],
  watch: ['Dress Watch', 'Sports Watch', 'Casual', 'Luxury', 'Everyday Use'],
  
  // Beauty
  skincare: ['Dry Skin', 'Oily Skin', 'Sensitive Skin', 'Anti-Aging', 'Acne Treatment', 'Daily Care'],
  makeup: ['Everyday Look', 'Professional', 'Party/Event', 'Natural Look', 'Bold Look'],
  perfume: ['Everyday', 'Special Occasions', 'Work', 'Date Night', 'Fresh Scent', 'Strong Scent'],
  
  // Media
  books: ['Fiction', 'Non-Fiction', 'Educational', 'Self-Help', 'Biography', 'Children'],
  music: ['Pop', 'Rock', 'Classical', 'Jazz', 'Electronic', 'Country', 'Hip-Hop'],
  
  // Sports & Fitness
  fitness_equipment: ['Home Gym', 'Cardio', 'Strength Training', 'Yoga', 'Small Space', 'Professional'],
  sports_gear: ['Team Sports', 'Individual Sports', 'Outdoor Activities', 'Professional', 'Recreational'],
  
  // Toys & Games
  toys: ['Educational', 'Creative Play', 'Outdoor Play', 'Building', 'Role Play', 'STEM'],
  video_games: ['Action', 'Adventure', 'RPG', 'Sports', 'Strategy', 'Casual', 'Multiplayer'],
  
  // Other
  car_accessories: ['Safety', 'Entertainment', 'Convenience', 'Navigation', 'Charging', 'Storage'],
  pet_supplies: ['Dogs', 'Cats', 'Small Pets', 'Training', 'Health', 'Entertainment'],
  office_supplies: ['Home Office', 'Corporate', 'Students', 'Creative Work', 'Organization'],
  garden_supplies: ['Indoor Plants', 'Outdoor Garden', 'Vegetables', 'Flowers', 'Tools', 'Maintenance'],
  food: ['Healthy Eating', 'Quick Meals', 'Organic', 'Snacks', 'Beverages', 'Special Diet'],
};

export function ProductFilters({ onFiltersChange, isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [customBudget, setCustomBudget] = useState({ min: '', max: '' });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    budget: false,
    brands: false,
    useCase: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedBrands([]); // Reset brands when category changes
    setSelectedUseCase(''); // Reset use case when category changes
    updateFilters({ category: categoryId, brands: [], useCase: '' });
  };

  const handleBudgetChange = (budgetId) => {
    setSelectedBudget(budgetId);
    if (budgetId !== 'custom') {
      const budget = BUDGET_RANGES.find(b => b.id === budgetId);
      updateFilters({ budget: { min: budget.min, max: budget.max } });
    }
  };

  const handleCustomBudgetChange = (field, value) => {
    const newCustomBudget = { ...customBudget, [field]: value };
    setCustomBudget(newCustomBudget);
    if (selectedBudget === 'custom' && newCustomBudget.min && newCustomBudget.max) {
      updateFilters({ 
        budget: { 
          min: parseInt(newCustomBudget.min), 
          max: parseInt(newCustomBudget.max) 
        } 
      });
    }
  };

  const handleBrandToggle = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    updateFilters({ brands: newBrands });
  };

  const handleUseCaseChange = (useCase) => {
    setSelectedUseCase(useCase);
    updateFilters({ useCase });
  };

  const updateFilters = (newFilters) => {
    const currentFilters = {
      category: selectedCategory,
      budget: selectedBudget === 'custom' ? customBudget : 
               BUDGET_RANGES.find(b => b.id === selectedBudget) || null,
      brands: selectedBrands,
      useCase: selectedUseCase,
      ...newFilters
    };
    onFiltersChange(currentFilters);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBudget('');
    setCustomBudget({ min: '', max: '' });
    setSelectedBrands([]);
    setSelectedUseCase('');
    onFiltersChange({});
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between transition-colors"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" style={{ color: '#00d4ff' }} />
        ) : (
          <ChevronDownIcon className="w-5 h-5" style={{ color: '#00d4ff' }} />
        )}
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find Your Perfect Product
        </h2>
        <p className="text-gray-600">
          Use filters below to narrow down your search and get personalized recommendations
        </p>
      </div>

      {/* Clear Filters Button */}
      {(selectedCategory || selectedBudget || selectedBrands.length > 0 || selectedUseCase) && (
        <div className="text-center">
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Category Selection */}
      <FilterSection
        title="Product Category"
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-6">
          {/* Group categories by type */}
          {Object.entries(
            PRODUCT_CATEGORIES.reduce((groups, category) => {
              const group = category.category || 'Other';
              if (!groups[group]) groups[group] = [];
              groups[group].push(category);
              return groups;
            }, {})
          ).map(([groupName, categories]) => (
            <div key={groupName}>
              <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: '#00d4ff' }}>
                {groupName}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className="p-4 rounded-xl transition-all text-center"
                    style={{
                      backdropFilter: 'blur(10px)',
                      background: selectedCategory === category.id 
                        ? 'rgba(0, 212, 255, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedCategory === category.id 
                        ? '2px solid #00d4ff' 
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      color: selectedCategory === category.id ? '#00d4ff' : 'white'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-sm font-medium text-center">{category.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Budget Range */}
      <FilterSection
        title="Budget Range"
        isExpanded={expandedSections.budget}
        onToggle={() => toggleSection('budget')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BUDGET_RANGES.map((budget) => (
              <button
                key={budget.id}
                onClick={() => handleBudgetChange(budget.id)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedBudget === budget.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {budget.label}
              </button>
            ))}
          </div>

          {/* Custom Budget Range */}
          {selectedBudget === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center space-x-4 pt-4 border-t border-gray-100"
            >
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customBudget.min}
                  onChange={(e) => handleCustomBudgetChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="text-gray-400 pt-6">to</div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={customBudget.max}
                  onChange={(e) => handleCustomBudgetChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          )}
        </div>
      </FilterSection>

      {/* Brand Selection */}
      {selectedCategory && (
        <FilterSection
          title="Preferred Brands"
          isExpanded={expandedSections.brands}
          onToggle={() => toggleSection('brands')}
        >
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {(BRANDS[selectedCategory] || []).map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandToggle(brand)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedBrands.includes(brand)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Use Case */}
      {selectedCategory && (
        <FilterSection
          title="Primary Use Case"
          isExpanded={expandedSections.useCase}
          onToggle={() => toggleSection('useCase')}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(USE_CASES[selectedCategory] || []).map((useCase) => (
              <button
                key={useCase}
                onClick={() => handleUseCaseChange(useCase)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedUseCase === useCase
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {useCase}
              </button>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}