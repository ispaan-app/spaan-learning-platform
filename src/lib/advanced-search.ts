// Comprehensive advanced search system with filters, faceted search, and full-text search

export interface SearchQuery {
  query?: string
  filters: SearchFilter[]
  facets: string[]
  sort: SortOption[]
  pagination: PaginationOptions
  highlight: boolean
  fuzzy: boolean
  boost: Record<string, number>
}

export interface SearchFilter {
  field: string
  operator: FilterOperator
  value: any
  type: FilterType
  nested?: SearchFilter[]
}

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with' 
  | 'greater_than' 
  | 'less_than' 
  | 'greater_than_or_equal' 
  | 'less_than_or_equal' 
  | 'between' 
  | 'in' 
  | 'not_in' 
  | 'exists' 
  | 'not_exists' 
  | 'regex' 
  | 'geo_distance' 
  | 'geo_bounding_box'

export type FilterType = 'text' | 'number' | 'date' | 'boolean' | 'array' | 'geo' | 'nested'

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  mode?: 'min' | 'max' | 'sum' | 'avg' | 'median'
}

export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

export interface SearchResult<T = any> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  facets: FacetResult[]
  highlights: HighlightResult[]
  suggestions: string[]
  searchTime: number
  query: SearchQuery
}

export interface FacetResult {
  field: string
  name: string
  type: 'terms' | 'range' | 'date_histogram' | 'geo_distance'
  buckets: FacetBucket[]
  total: number
}

export interface FacetBucket {
  key: string
  count: number
  selected: boolean
  min?: number
  max?: number
  from?: number
  to?: number
}

export interface HighlightResult {
  field: string
  fragments: string[]
  score: number
}

export interface SearchIndex {
  name: string
  fields: IndexField[]
  settings: IndexSettings
  mappings: Record<string, FieldMapping>
}

export interface IndexField {
  name: string
  type: FieldType
  analyzer?: string
  searchable: boolean
  filterable: boolean
  sortable: boolean
  facetable: boolean
  boost?: number
}

export type FieldType = 
  | 'text' 
  | 'keyword' 
  | 'long' 
  | 'integer' 
  | 'short' 
  | 'byte' 
  | 'double' 
  | 'float' 
  | 'boolean' 
  | 'date' 
  | 'geo_point' 
  | 'geo_shape' 
  | 'nested' 
  | 'object'

export interface IndexSettings {
  numberOfShards: number
  numberOfReplicas: number
  refreshInterval: string
  maxResultWindow: number
  analysis: AnalysisSettings
}

export interface AnalysisSettings {
  analyzer: Record<string, AnalyzerConfig>
  tokenizer: Record<string, TokenizerConfig>
  filter: Record<string, FilterConfig>
}

export interface AnalyzerConfig {
  type: string
  tokenizer: string
  filter: string[]
  char_filter?: string[]
}

export interface TokenizerConfig {
  type: string
  pattern?: string
  flags?: string
  min_gram?: number
  max_gram?: number
}

export interface FilterConfig {
  type: string
  stopwords?: string[]
  synonyms?: string[]
  min_length?: number
  max_length?: number
}

export interface FieldMapping {
  type: FieldType
  properties?: Record<string, FieldMapping>
  analyzer?: string
  search_analyzer?: string
  index?: boolean
  store?: boolean
  doc_values?: boolean
}

class AdvancedSearchEngine {
  private static instance: AdvancedSearchEngine
  private indexes: Map<string, SearchIndex> = new Map()
  private searchHistory: Map<string, SearchQuery> = new Map()
  private searchStats: Map<string, number> = new Map()

  static getInstance(): AdvancedSearchEngine {
    if (!AdvancedSearchEngine.instance) {
      AdvancedSearchEngine.instance = new AdvancedSearchEngine()
    }
    return AdvancedSearchEngine.instance
  }

  async createIndex(indexName: string, index: SearchIndex): Promise<void> {
    this.indexes.set(indexName, index)
    console.log(`Search index created: ${indexName}`)
  }

  async search<T>(
    indexName: string,
    query: SearchQuery
  ): Promise<SearchResult<T>> {
    const startTime = Date.now()
    const index = this.indexes.get(indexName)
    
    if (!index) {
      throw new Error(`Index not found: ${indexName}`)
    }

    // Store search history
    const searchId = this.generateSearchId()
    this.searchHistory.set(searchId, query)

    // Update search stats
    this.updateSearchStats(query.query || '')

    try {
      // Build search query
      const searchQuery = this.buildSearchQuery(query, index)
      
      // Execute search
      const results = await this.executeSearch<T>(indexName, searchQuery)
      
      // Apply filters
      const filteredResults = this.applyFilters(results, query.filters)
      
      // Apply sorting
      const sortedResults = this.applySorting(filteredResults, query.sort)
      
      // Apply pagination
      const paginatedResults = this.applyPagination(sortedResults, query.pagination)
      
      // Generate facets
      const facets = await this.generateFacets(filteredResults, query.facets, index)
      
      // Generate highlights
      const highlights = query.highlight ? this.generateHighlights(paginatedResults.items, query.query || '') : []
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(query.query || '', indexName)
      
      const searchTime = Date.now() - startTime

      const result: SearchResult<T> = {
        items: paginatedResults.items,
        total: filteredResults.length,
        page: query.pagination.page,
        limit: query.pagination.limit,
        totalPages: Math.ceil(filteredResults.length / query.pagination.limit),
        hasNext: paginatedResults.items.length === query.pagination.limit,
        hasPrev: query.pagination.page > 1,
        facets,
        highlights,
        suggestions,
        searchTime,
        query
      }

      return result
    } catch (error) {
      console.error('Search failed:', error)
      throw error
    }
  }

  private buildSearchQuery(query: SearchQuery, index: SearchIndex): any {
    const searchQuery: any = {
      bool: {
        must: [],
        should: [],
        must_not: [],
        filter: []
      }
    }

    // Add text query
    if (query.query) {
      if (query.fuzzy) {
        searchQuery.bool.should.push({
          multi_match: {
            query: query.query,
            fields: this.getSearchableFields(index),
            fuzziness: 'AUTO',
            boost: 1.0
          }
        })
      } else {
        searchQuery.bool.must.push({
          multi_match: {
            query: query.query,
            fields: this.getSearchableFields(index),
            type: 'best_fields',
            boost: 1.0
          }
        })
      }
    }

    // Add filters
    for (const filter of query.filters) {
      const filterQuery = this.buildFilterQuery(filter)
      if (filterQuery) {
        searchQuery.bool.filter.push(filterQuery)
      }
    }

    // Add boost queries
    for (const [field, boost] of Object.entries(query.boost)) {
      searchQuery.bool.should.push({
        term: {
          [field]: {
            value: query.query,
            boost: boost
          }
        }
      })
    }

    return searchQuery
  }

  private buildFilterQuery(filter: SearchFilter): any {
    const { field, operator, value, type } = filter

    switch (operator) {
      case 'equals':
        return { term: { [field]: value } }
      
      case 'not_equals':
        return { bool: { must_not: [{ term: { [field]: value } }] } }
      
      case 'contains':
        return { wildcard: { [field]: `*${value}*` } }
      
      case 'not_contains':
        return { bool: { must_not: [{ wildcard: { [field]: `*${value}*` } }] } }
      
      case 'starts_with':
        return { wildcard: { [field]: `${value}*` } }
      
      case 'ends_with':
        return { wildcard: { [field]: `*${value}` } }
      
      case 'greater_than':
        return { range: { [field]: { gt: value } } }
      
      case 'less_than':
        return { range: { [field]: { lt: value } } }
      
      case 'greater_than_or_equal':
        return { range: { [field]: { gte: value } } }
      
      case 'less_than_or_equal':
        return { range: { [field]: { lte: value } } }
      
      case 'between':
        return { range: { [field]: { gte: value[0], lte: value[1] } } }
      
      case 'in':
        return { terms: { [field]: value } }
      
      case 'not_in':
        return { bool: { must_not: [{ terms: { [field]: value } }] } }
      
      case 'exists':
        return { exists: { field } }
      
      case 'not_exists':
        return { bool: { must_not: [{ exists: { field } }] } }
      
      case 'regex':
        return { regexp: { [field]: value } }
      
      case 'geo_distance':
        return {
          geo_distance: {
            distance: value.distance,
            [field]: {
              lat: value.lat,
              lon: value.lon
            }
          }
        }
      
      case 'geo_bounding_box':
        return {
          geo_bounding_box: {
            [field]: {
              top_left: value.top_left,
              bottom_right: value.bottom_right
            }
          }
        }
      
      default:
        return null
    }
  }

  private getSearchableFields(index: SearchIndex): string[] {
    return index.fields
      .filter(field => field.searchable)
      .map(field => `${field.name}^${field.boost || 1}`)
  }

  private async executeSearch<T>(indexName: string, query: any): Promise<T[]> {
    // In a real implementation, this would execute the search against Elasticsearch, Solr, or similar
    console.log(`Executing search on ${indexName}:`, query)
    
    // Mock implementation
    return []
  }

  private applyFilters<T>(results: T[], filters: SearchFilter[]): T[] {
    // In a real implementation, this would apply filters to the results
    return results
  }

  private applySorting<T>(results: T[], sortOptions: SortOption[]): T[] {
    // In a real implementation, this would apply sorting to the results
    return results
  }

  private applyPagination<T>(results: T[], pagination: PaginationOptions): { items: T[] } {
    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit
    
    return {
      items: results.slice(start, end)
    }
  }

  private async generateFacets<T>(
    results: T[],
    facetFields: string[],
    index: SearchIndex
  ): Promise<FacetResult[]> {
    const facets: FacetResult[] = []

    for (const fieldName of facetFields) {
      const field = index.fields.find(f => f.name === fieldName)
      if (!field || !field.facetable) continue

      const facet: FacetResult = {
        field: fieldName,
        name: this.getFieldDisplayName(fieldName),
        type: this.getFacetType(field.type),
        buckets: [],
        total: 0
      }

      // Generate facet buckets based on field type
      if (field.type === 'text' || field.type === 'keyword') {
        facet.buckets = this.generateTermBuckets(results, fieldName)
      } else if (field.type === 'date') {
        facet.buckets = this.generateDateBuckets(results, fieldName)
      } else if (field.type === 'long' || field.type === 'integer' || field.type === 'double' || field.type === 'float') {
        facet.buckets = this.generateRangeBuckets(results, fieldName)
      }

      facet.total = facet.buckets.reduce((sum, bucket) => sum + bucket.count, 0)
      facets.push(facet)
    }

    return facets
  }

  private generateTermBuckets<T>(results: T[], fieldName: string): FacetBucket[] {
    const counts = new Map<string, number>()
    
    for (const result of results) {
      const value = (result as any)[fieldName]
      if (value !== undefined && value !== null) {
        const key = String(value)
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, count, selected: false }))
      .sort((a, b) => b.count - a.count)
  }

  private generateDateBuckets<T>(results: T[], fieldName: string): FacetBucket[] {
    // In a real implementation, this would generate date histogram buckets
    return []
  }

  private generateRangeBuckets<T>(results: T[], fieldName: string): FacetBucket[] {
    // In a real implementation, this would generate range buckets
    return []
  }

  private generateHighlights<T>(results: T[], query: string): HighlightResult[] {
    // In a real implementation, this would generate search highlights
    return []
  }

  private async generateSuggestions(query: string, indexName: string): Promise<string[]> {
    // In a real implementation, this would generate search suggestions
    return []
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'email': 'Email',
      'role': 'Role',
      'status': 'Status',
      'createdAt': 'Created Date',
      'updatedAt': 'Updated Date'
    }
    
    return displayNames[fieldName] || fieldName
  }

  private getFacetType(fieldType: FieldType): 'terms' | 'range' | 'date_histogram' | 'geo_distance' {
    switch (fieldType) {
      case 'text':
      case 'keyword':
        return 'terms'
      case 'date':
        return 'date_histogram'
      case 'geo_point':
      case 'geo_shape':
        return 'geo_distance'
      default:
        return 'range'
    }
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateSearchStats(query: string): void {
    const words = query.toLowerCase().split(/\s+/)
    for (const word of words) {
      if (word.length > 2) {
        this.searchStats.set(word, (this.searchStats.get(word) || 0) + 1)
      }
    }
  }

  getSearchHistory(): Map<string, SearchQuery> {
    return new Map(this.searchHistory)
  }

  getSearchStats(): Map<string, number> {
    return new Map(this.searchStats)
  }

  getPopularSearches(limit: number = 10): Array<{ query: string; count: number }> {
    return Array.from(this.searchStats.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }
}

// Search builder for easy query construction
export class SearchQueryBuilder {
  private query: SearchQuery

  constructor() {
    this.query = {
      filters: [],
      facets: [],
      sort: [],
      pagination: { page: 1, limit: 20 },
      highlight: false,
      fuzzy: false,
      boost: {}
    }
  }

  setQuery(query: string): SearchQueryBuilder {
    this.query.query = query
    return this
  }

  addFilter(field: string, operator: FilterOperator, value: any, type: FilterType = 'text'): SearchQueryBuilder {
    this.query.filters.push({ field, operator, value, type })
    return this
  }

  addFacet(field: string): SearchQueryBuilder {
    if (!this.query.facets.includes(field)) {
      this.query.facets.push(field)
    }
    return this
  }

  addSort(field: string, direction: 'asc' | 'desc' = 'desc'): SearchQueryBuilder {
    this.query.sort.push({ field, direction })
    return this
  }

  setPagination(page: number, limit: number): SearchQueryBuilder {
    this.query.pagination = { page, limit }
    return this
  }

  setHighlight(highlight: boolean): SearchQueryBuilder {
    this.query.highlight = highlight
    return this
  }

  setFuzzy(fuzzy: boolean): SearchQueryBuilder {
    this.query.fuzzy = fuzzy
    return this
  }

  addBoost(field: string, boost: number): SearchQueryBuilder {
    this.query.boost[field] = boost
    return this
  }

  build(): SearchQuery {
    return this.query
  }
}

// Search suggestions service
export class SearchSuggestionsService {
  private static instance: SearchSuggestionsService
  private suggestions: Map<string, string[]> = new Map()

  static getInstance(): SearchSuggestionsService {
    if (!SearchSuggestionsService.instance) {
      SearchSuggestionsService.instance = new SearchSuggestionsService()
    }
    return SearchSuggestionsService.instance
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) return []

    const suggestions = this.suggestions.get(query.toLowerCase()) || []
    return suggestions.slice(0, limit)
  }

  async addSuggestion(query: string, suggestion: string): Promise<void> {
    const key = query.toLowerCase()
    if (!this.suggestions.has(key)) {
      this.suggestions.set(key, [])
    }
    
    const suggestions = this.suggestions.get(key)!
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion)
      suggestions.sort()
    }
  }

  async removeSuggestion(query: string, suggestion: string): Promise<void> {
    const key = query.toLowerCase()
    const suggestions = this.suggestions.get(key)
    if (suggestions) {
      const index = suggestions.indexOf(suggestion)
      if (index > -1) {
        suggestions.splice(index, 1)
      }
    }
  }
}

// Export singleton instances
export const searchEngine = AdvancedSearchEngine.getInstance()
export const suggestionsService = SearchSuggestionsService.getInstance()
