/* eslint-disable react/jsx-props-no-spreading */
import { FormEvent, ReactNode, useCallback, useEffect, useMemo } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from '@material-ui/core'
import {
  Form,
  Formik,
  FormikContextType,
  FormikHelpers,
  useFormikContext,
} from 'formik'

import { SchemaOf } from '@kathena/libs/yup'

import { ANY } from '../../types'
import Button from '../Button'

export type FormDialogProps<Values extends {}> = {
  open: boolean
  initialValues: Values
  validationSchema?: SchemaOf<Values>
  dialogTitle?: string
  extraDialogActions?: ReactNode
  submitButtonLabel?: string
  onSubmit: (values: Values) => Promise<ANY>
  onClose: () => ANY
  width?: number | string
  classes?: Partial<Record<'dialogPaper' | 'form', string>>
  children?:
    | React.ReactNode
    | ((formik: FormikContextType<Values>) => React.ReactNode)
}

const FormDialog = <Values extends {}>(
  props: FormDialogProps<Values>,
): JSX.Element => {
  const { initialValues, validationSchema } = props

  const handleSubmit = useCallback(
    async (values: Values, formikHelpers: FormikHelpers<Values>) => {
      formikHelpers.setSubmitting(true)
      await props.onSubmit(
        props.validationSchema
          ? (props.validationSchema.cast(values, {
              stripUnknown: true,
            }) as Values)
          : values,
      )
      formikHelpers.setSubmitting(false)
    },
    [props],
  )

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      <FormDialogContent {...props} />
    </Formik>
  )
}

const FormDialogContent = <Values extends {}>(
  props: FormDialogProps<Values>,
) => {
  const {
    open,
    dialogTitle,
    extraDialogActions,
    submitButtonLabel,
    children,
    onClose,
  } = props
  const classes = useStyles(props)
  const formik = useFormikContext<Values>()

  const handleClose = useCallback(() => {
    if (formik.isSubmitting) {
      return
    }
    onClose()
  }, [formik.isSubmitting, onClose])

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      formik.submitForm()
    },
    [formik],
  )

  const childrenContent = useMemo(() => {
    if (typeof children === 'function') {
      return children(formik)
    }
    return children
  }, [children, formik])

  useEffect(() => {
    if (open) {
      formik.resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      classes={{ paper: classes.dialogPaper }}
    >
      {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
      <Form onSubmit={handleFormSubmit} className={classes.form}>
        <>
          <DialogContent>{childrenContent}</DialogContent>
          <DialogActions>
            {extraDialogActions}
            <Button onClick={handleClose} disabled={formik.isSubmitting}>
              Đóng
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              loading={formik.isSubmitting}
            >
              {submitButtonLabel ?? 'Submit'}
            </Button>
          </DialogActions>
        </>
      </Form>
    </Dialog>
  )
}

const useStyles = makeStyles<
  Theme,
  FormDialogProps<ANY>,
  'dialogPaper' | 'form'
>(() => ({
  dialogPaper: {
    maxWidth: '95vw',
    width: ({ width }) => width,
  },
  form: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
}))

export default FormDialog
