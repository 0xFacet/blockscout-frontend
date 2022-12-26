export type SearchResultType = 'token' | 'address' | 'block' | 'transaction';

export interface SearchResultToken {
  type: 'token';
  name: string;
  symbol: string;
  address: string;
  token_url: string;
  address_url: string;
}

export interface SearchResultAddress {
  type: 'address';
  name: string | null;
  address: string;
  url: string;
}

export interface SearchResultBlock {
  type: 'block';
  block_number: number;
  block_hash: string;
  url: string;
}

export interface SearchResultTx {
  type: 'transaction';
  tx_hash: string;
  url: string;
}

export type SearchResultItem = SearchResultToken | SearchResultAddress | SearchResultBlock | SearchResultTx;

export interface SearchResult {
  items: Array<SearchResultItem>;
  next_page_params: {
    'address_hash': string | null;
    'block_hash': string | null;
    'holder_count': number | null;
    'inserted_at': string | null;
    'item_type': SearchResultType;
    'items_count': number;
    'name': string;
    'q': string;
    'tx_hash': string | null;
  } | null;
}
