/* eslint-disable no-console */
import { FC, useMemo } from 'react'

import { Grid, makeStyles } from '@material-ui/core'
import { Form, Formik } from 'formik'

import { Button, TextFormField } from '@kathena/ui'
import { useAuth } from 'common/auth'

export type ProfileSettingsInput = {
  displayName: string
  email: string
  username: string
}

export type ProfileSettingsFormProps = {}

const ProfileSettingsForm: FC<ProfileSettingsFormProps> = (props) => {
  const classes = useStyles(props)
  const { $account: account } = useAuth()

  const initialValues: ProfileSettingsInput = useMemo(
    () => ({
      displayName: account.displayName,
      email: account.email,
      username: account.username,
    }),
    [account.displayName, account.email, account.username],
  )

  return (
    <div className={classes.root}>
      <Formik initialValues={initialValues} onSubmit={console.log}>
        {(formik) => (
          <Form>
            <Grid container spacing={2}>
              <TextFormField
                gridItem={{ xs: 12 }}
                name="displayName"
                label="Tên hiển thị"
              />
              <TextFormField
                disabled
                gridItem={{ xs: 12 }}
                name="email"
                label="Địa chỉ email"
              />
              <TextFormField
                disabled
                gridItem={{ xs: 12 }}
                name="username"
                label="Tên đăng nhập"
              />

              <Button
                gridItem
                variant="contained"
                color="primary"
                loading={formik.isSubmitting}
                type="submit"
                sx={{ mt: 2 }}
              >
                Cập nhật
              </Button>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default ProfileSettingsForm
