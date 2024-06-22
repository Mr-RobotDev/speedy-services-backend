interface PopulateOptions {
  path: string;
  select?: string;
  match?: object;
  populate?: PopulateOptions;
}

export interface Options {
  page?: number;
  limit?: number;
  sortBy?: string;
  projection?: string;
  populate?: PopulateOptions[];
}
