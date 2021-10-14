import { useCallback, FC } from 'react'

import { MagnifyingGlass } from 'phosphor-react'

import { InputField, useLocationQuery } from '@kathena/ui'

export type SearchProps = {}

const Search: FC<SearchProps> = () => {
  const { updateQuery } = useLocationQuery()
  const handleSubmitSearch = useCallback(
    (value) => {
      updateQuery({ searchText: value }, { replace: true })
    },
    [updateQuery],
  )

  return (
    <InputField
      variant="text"
      style={{ background: 'white', borderColor: '#C9C9C9' }}
      startAdornment={<MagnifyingGlass />}
      placeholder="Tìm kiếm....."
      onBlur={(e) => handleSubmitSearch(e.currentTarget.value)}
      onKeyDown={(e) =>
        e.key === 'Enter' && handleSubmitSearch(e.currentTarget.value)
      }
    />
  )
}
export default Search
