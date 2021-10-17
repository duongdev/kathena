/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useMemo, useState } from 'react'

import { IconButton, makeStyles, Stack } from '@material-ui/core'
import { Plus, X } from 'phosphor-react'

import yup, { SchemaOf } from '@kathena/libs/yup'
import { ANY } from '@kathena/types'
import {
  EditorFormField,
  InputField,
  TextFormField,
  useDialogState,
} from '@kathena/ui'
import InputFieldLabel from '@kathena/ui/InputField/InputFieldLabel'

import kminLogo from './kmin-logo.png'

export type ClassworkMaterialWithId = {
  iframeVideos: string[]
  addIframe: (iframe: string) => void
  removeIframe: (index: number) => void
}
export type UpdateClassworkMaterialsFormInput = {
  title: string
  description: string
  video: string[]
}

export const labels: Record<keyof UpdateClassworkMaterialsFormInput, string> = {
  title: 'Tiêu đề',
  description: 'Mô tả',
  video: 'Video muốn thêm',
}

export const validationSchema: SchemaOf<UpdateClassworkMaterialsFormInput> =
  yup.object({
    title: yup.string().label(labels.title).trim().required(),
    description: yup.string().label(labels.description).required(),
    video: yup.string().label(labels.video).notRequired() as ANY,
  })

export const FormContent: FC<ClassworkMaterialWithId> = (props) => {
  const { iframeVideos, addIframe, removeIframe } =
    props as ClassworkMaterialWithId
  const classes = useStyles()
  const [inputValue, setInputValue] = useState<string>('')
  const [open, handleOpenDialog, handleCloseDialog] = useDialogState()
  const [currentIndex, setCurrentIndex] = useState(0)
  return (
    <Stack spacing={2} className={classes.root}>
      <TextFormField required autoFocus label={labels.title} name="title" />
      <EditorFormField required name="description" label={labels.description} />

      <div className={classes.root}>
        {/* Start Video */}
        <InputFieldLabel>Danh sách iframe video: </InputFieldLabel>
        <div className={classes.iframeContainer}>
          {iframeVideos.map((item, index) => (
            <>
              <div
                onClick={() => {
                  handleOpenDialog()
                  setCurrentIndex(index)
                }}
                className={classes.iframeWrapper}
              >
                <img
                  style={{ borderRadius: '5px' }}
                  src={kminLogo}
                  title={item}
                  alt="Video"
                  width={50}
                  height={50}
                />
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    removeIframe(index)
                  }}
                  className={classes.removeWrapper}
                >
                  <X width={14} />
                </div>
              </div>
            </>
          ))}
        </div>
        <InputFieldLabel>Iframe video: </InputFieldLabel>
        <div style={{ display: 'flex' }}>
          <InputField
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <IconButton
            onClick={() => {
              // console.log(inputValue);
              if (inputValue !== '' || inputValue.length < 1) {
                addIframe(inputValue)
                setInputValue('')
              }
            }}
          >
            <Plus />
          </IconButton>
        </div>
        {/* End Video---------------- */}
      </div>
      {/* {error && <ApolloErrorList error={error} />} */}
    </Stack>
  )
}
const useStyles = makeStyles(() => ({
  root: {},
  iframeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  iframeWrapper: {
    margin: '10px 10px 0px 0px',
    position: 'relative',
    cursor: 'pointer',
  },
  removeWrapper: {
    position: 'absolute',
    right: '-6px',
    top: '-6px',
    cursor: 'pointer',
    width: 18,
    height: 18,
    background: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
}))
