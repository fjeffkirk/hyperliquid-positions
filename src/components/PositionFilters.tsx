import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type SortBy = 'symbol' | 'pnl' | 'size' | 'entry';
export type SortOrder = 'asc' | 'desc';
export type FilterSide = 'all' | 'long' | 'short';

interface PositionFiltersProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  filterSide: FilterSide;
  onSortByChange: (value: SortBy) => void;
  onSortOrderChange: (value: SortOrder) => void;
  onFilterSideChange: (value: FilterSide) => void;
}

export default function PositionFilters({
  sortBy,
  sortOrder,
  filterSide,
  onSortByChange,
  onSortOrderChange,
  onFilterSideChange,
}: PositionFiltersProps) {
  const handleSortByChange = (event: SelectChangeEvent) => {
    onSortByChange(event.target.value as SortBy);
  };

  const handleSortOrderChange = (
    _event: React.MouseEvent<HTMLElement>,
    newOrder: SortOrder | null,
  ) => {
    if (newOrder !== null) {
      onSortOrderChange(newOrder);
    }
  };

  const handleFilterSideChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSide: FilterSide | null,
  ) => {
    if (newSide !== null) {
      onFilterSideChange(newSide);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Sort By */}
        <div className="flex-1">
          <FormControl fullWidth size="small">
            <InputLabel 
              id="sort-by-label"
              sx={{ color: '#9ca3af', '&.Mui-focused': { color: '#3b82f6' } }}
            >
              Sort By
            </InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortByChange}
              sx={{
                color: '#ffffff',
                backgroundColor: '#374151',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4b5563',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6b7280',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
                '& .MuiSvgIcon-root': {
                  color: '#9ca3af',
                },
              }}
            >
              <MenuItem value="symbol">Symbol (A-Z)</MenuItem>
              <MenuItem value="pnl">uPnL</MenuItem>
              <MenuItem value="size">Size</MenuItem>
              <MenuItem value="entry">Entry Price</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 lg:inline hidden">Order:</span>
          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={handleSortOrderChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: '#9ca3af',
                borderColor: '#4b5563',
                backgroundColor: '#374151',
                '&.Mui-selected': {
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                },
                '&:hover': {
                  backgroundColor: '#4b5563',
                },
                padding: '6px 16px',
                fontSize: '0.875rem',
              },
            }}
          >
            <ToggleButton value="desc">High → Low</ToggleButton>
            <ToggleButton value="asc">Low → High</ToggleButton>
          </ToggleButtonGroup>
        </div>

        {/* Filter by Side */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 lg:inline hidden">Show:</span>
          <ToggleButtonGroup
            value={filterSide}
            exclusive
            onChange={handleFilterSideChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: '#9ca3af',
                borderColor: '#4b5563',
                backgroundColor: '#374151',
                '&.Mui-selected': {
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                },
                '&:hover': {
                  backgroundColor: '#4b5563',
                },
                padding: '6px 12px',
                fontSize: '0.875rem',
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="long">Long</ToggleButton>
            <ToggleButton value="short">Short</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
}

