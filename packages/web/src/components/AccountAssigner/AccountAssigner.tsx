/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-console */
import { FC, useEffect, useState } from 'react'

import {
  Grid,
  TextField,
  AutocompleteProps,
  Autocomplete,
} from '@material-ui/core'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'

import { ANY } from '@kathena/types'
import { Typography, withComponentHocs } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { Account, useOrgAccountListQuery } from 'graphql/generated'

type Role = 'owner' | 'admin' | 'staff' | 'lecturer' | 'student'

export type AccountAssignerProps = Omit<
  AutocompleteProps<Account, boolean, boolean, boolean>,
  'options' | 'renderInput'
> & {
  label: string
  roles?: Role[]
  limit?: number
}

const AccountAssigner: FC<AccountAssignerProps> = (props) => {
  const { label, roles, limit, ...autocompleteProps } = props
  const { $org: org } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const { data, loading } = useOrgAccountListQuery({
    variables: {
      orgId: org.id,
      limit: !limit ? 20 : limit,
      skip: 0,
      searchText: inputValue,
      roles,
    },
  })
  const [options, setOptions] = useState<Account[]>([])

  useEffect(() => {
    let active = true
    if (active) {
      let newOptions = [] as Account[]
      if (data?.orgAccounts.accounts) {
        newOptions = [...(data.orgAccounts.accounts as Account[])]
      }
      setOptions(newOptions)
    }
    return () => {
      active = false
    }
  }, [data?.orgAccounts.accounts])

  return (
    <Autocomplete
      loading={loading}
      options={options}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      getOptionLabel={(option: Account) =>
        typeof option.displayName === 'string'
          ? option.displayName
          : option.username
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          margin="normal"
        />
      )}
      renderOption={(p, option) => {
        const matches = match(option.displayName as ANY, inputValue)
        const parts = parse(option.displayName as ANY, matches)
        return (
          <li {...p}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <AccountAvatar size={24} account={option} />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{ fontWeight: part.highlight ? 700 : 400 }}
                  >
                    {part.text}
                  </span>
                ))}
                <Typography variant="body2" color="textSecondary">
                  @{option.username}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )
      }}
      disableCloseOnSelect
      filterSelectedOptions
      {...autocompleteProps}
    />
  )
}

export default withComponentHocs(AccountAssigner)
