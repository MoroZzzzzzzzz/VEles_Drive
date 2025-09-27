import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, TrendingUp, History, BookmarkPlus, Star, Filter, 
  Zap, Target, Brain, Sparkles, Clock, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { advancedSearchAPI } from '../../services/api';
import { cn } from '../../lib/utils';

const SmartSearchBar = ({ onSearch, onSuggestionSelect, className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length >= 2) {
        try {
          setIsLoading(true);
          const data = await advancedSearchAPI.getSuggestions(query);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error loading suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = async (searchQuery = query) => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    handleSearch(suggestion.text);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'make': return '🏢';
      case 'model': return '🚗';
      case 'popular': return '🔥';
      case 'category': return '📂';
      default: return '💡';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Поиск: BMW седан до 3 миллионов, Mercedes новый, спорткар красный..."
          className="pl-10 pr-12 bg-gray-800 border-gray-600 text-white text-lg h-12"
        />
        <Button
          onClick={() => handleSearch()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 h-10"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
          ) : (
            'Найти'
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 shadow-xl z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <div>
                  <p className="text-white font-medium">{suggestion.text}</p>
                  <p className="text-gray-400 text-sm capitalize">{suggestion.type}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                {suggestion.count}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchResultCard = ({ vehicle, onVehicleSelect }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 cursor-pointer hover:border-amber-500/50 transition-colors"
      onClick={() => onVehicleSelect && onVehicleSelect(vehicle)}
    >
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="w-32 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            {vehicle.images && vehicle.images[0] ? (
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                🚗
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </h3>
                <p className="text-amber-400 font-bold text-xl">
                  {formatPrice(vehicle.price)}
                </p>
              </div>
              
              {vehicle.relevance_score && (
                <Badge className="bg-green-500/20 text-green-400">
                  {Math.round(vehicle.relevance_score)}% соответствие
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">
                Пробег: <span className="text-white">
                  {vehicle.mileage ? `${new Intl.NumberFormat('ru-RU').format(vehicle.mileage)} км` : 'Новый'}
                </span>
              </div>
              <div className="text-gray-400">
                Топливо: <span className="text-white">{vehicle.fuel_type || 'Не указан'}</span>
              </div>
              <div className="text-gray-400">
                Кузов: <span className="text-white">{vehicle.body_type || 'Не указан'}</span>
              </div>
              <div className="text-gray-400">
                Дилер: <span className="text-white">{vehicle.dealer_info?.name}</span>
                {vehicle.dealer_info?.rating > 0 && (
                  <Star className="inline w-3 h-3 ml-1 text-yellow-400 fill-current" />
                )}
              </div>
            </div>
            
            {vehicle.match_reasons && vehicle.match_reasons.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {vehicle.match_reasons.map((reason, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                    {reason}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TrendingSearches = ({ onTrendingClick }) => {
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const data = await advancedSearchAPI.getTrending();
      setTrending(data);
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-lg">
          <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
          Популярные запросы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trending.slice(0, 7).map((trend, index) => (
            <div
              key={index}
              onClick={() => onTrendingClick && onTrendingClick(trend.query)}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 font-bold text-sm">#{index + 1}</span>
                <span className="text-white text-sm">{trend.query}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    trend.growth > 50 ? "border-green-500/30 text-green-400" :
                    trend.growth > 20 ? "border-yellow-500/30 text-yellow-400" :
                    "border-gray-500/30 text-gray-400"
                  )}
                >
                  +{trend.growth}%
                </Badge>
                <span className="text-gray-400 text-xs">{trend.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SavedSearches = ({ onSearchExecute }) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      const data = await advancedSearchAPI.getSavedSearches();
      setSavedSearches(data);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || savedSearches.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-lg">
          <BookmarkPlus className="w-5 h-5 mr-2 text-amber-400" />
          Сохраненные поиски
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              onClick={() => onSearchExecute && onSearchExecute(search.query)}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-white font-medium">{search.name}</p>
                <p className="text-gray-400 text-sm">{search.query.query}</p>
              </div>
              {search.notifications && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Уведомления
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const AdvancedSearchPage = () => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    if (user) {
      loadSearchHistory();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    try {
      const data = await advancedSearchAPI.getSearchHistory();
      setSearchHistory(data);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const handleSearch = async (query, filters = {}) => {
    try {
      setIsLoading(true);
      const searchData = {
        query: query,
        max_results: 20,
        filters: filters,
        sort_by: 'relevance',
        sort_order: 'desc'
      };
      
      const results = await advancedSearchAPI.smartSearch(searchData);
      setSearchResults(results);
      
      if (user) {
        loadSearchHistory();
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    window.open(`/vehicles/${vehicle.id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Brain className="w-10 h-10 mr-3 text-amber-400" />
            Умный поиск автомобилей
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Используйте естественный язык для поиска: "BMW седан до 3 миллионов", 
            "Mercedes кроссовер новый", "спорткар красный"
          </p>
        </div>

        {/* Smart Search Bar */}
        <div className="mb-8">
          <SmartSearchBar
            onSearch={handleSearch}
            className="max-w-4xl mx-auto"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Searches */}
            <TrendingSearches onTrendingClick={handleSearch} />
            
            {/* Saved Searches */}
            {user && (
              <SavedSearches onSearchExecute={(query) => handleSearch(query.query)} />
            )}
            
            {/* Search History */}
            {user && searchHistory.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <History className="w-5 h-5 mr-2 text-amber-400" />
                    История поиска
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((search, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearch(search.query)}
                        className="p-2 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <p className="text-white text-sm">{search.query}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-400 text-xs">
                            {search.results_count} результатов
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(search.created_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b border-amber-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Ищем автомобили...</p>
                </div>
              </div>
            ) : searchResults ? (
              <div className="space-y-6">
                {/* Search Stats */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        Найдено {searchResults.total_count.toLocaleString()} автомобилей
                      </p>
                      <p className="text-gray-400 text-sm">
                        Время поиска: {searchResults.search_time.toFixed(2)}с
                      </p>
                    </div>
                    
                    {searchResults.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {searchResults.suggestions.map((suggestion, index) => (
                          <Badge key={index} variant="outline" className="border-amber-500/30 text-amber-400">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {suggestion.text}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                <div className="space-y-4">
                  {searchResults.vehicles.map((vehicle) => (
                    <SearchResultCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onVehicleSelect={handleVehicleSelect}
                    />
                  ))}
                </div>

                {/* Similar Searches */}
                {searchResults.similar_searches.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Target className="w-5 h-5 mr-2 text-amber-400" />
                        Похожие запросы
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {searchResults.similar_searches.map((similar, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearch(similar)}
                            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          >
                            {similar}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Начните поиск</h2>
                <p className="text-gray-400 mb-6">
                  Опишите автомобиль, который ищете, на естественном языке
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    "BMW X5 черный до 4 миллионов",
                    "Mercedes седан новый",
                    "Audi купе спорткар красный",
                    "Toyota гибрид экономичный"
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleSearch(example)}
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};