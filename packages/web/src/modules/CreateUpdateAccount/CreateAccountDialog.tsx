/* eslint-disable no-console */
import { FC } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
} from '@material-ui/core'
import { Form, Formik } from 'formik'

import { Alert, Button, TextFormField } from '@kathena/ui'

export type CreateAccountInput = {
  displayName: string
  username: string
  email: string
}

const initialValues: CreateAccountInput = {
  displayName: '',
  username: '',
  email: '',
}

export type CreateAccountDialogProps = {
  open: boolean
  onClose: () => void
}

const CreateAccountDialog: FC<CreateAccountDialogProps> = (props) => {
  const { open, onClose } = props
  const classes = useStyles(props)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.root}
      classes={{ paper: classes.dialogPaper }}
    >
      <Formik initialValues={initialValues} onSubmit={console.log}>
        {(formik) => (
          <Form>
            <DialogTitle>Tạo tài khoản người dùng</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <TextFormField
                  gridItem={{ xs: 12 }}
                  required
                  autoFocus
                  name="displayName"
                  label="Tên người dùng"
                />
                <TextFormField
                  gridItem={{ xs: 12 }}
                  required
                  name="email"
                  label="Địa chỉ email"
                />
                <TextFormField
                  gridItem={{ xs: 12 }}
                  required
                  name="username"
                  label="Tên đăng nhập"
                />
                <Alert severity="info" gridItem={{ xs: 12 }}>
                  Mật khẩu mặc định sẽ là địa chỉ email. Người dùng có thể thay
                  đổi sau khi đăng nhập thành công.
                </Alert>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={formik.isSubmitting}>
                Đóng
              </Button>
              <Button
                variant="contained"
                color="primary"
                loading={formik.isSubmitting}
                type="submit"
              >
                Tạo tài khoản
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
  dialogPaper: {
    width: 400,
    maxWidth: '95vw',
  },
}))

export default CreateAccountDialog
