import { FC, useCallback, useMemo, useState } from 'react'

import { useSnackbar } from 'notistack'

import { ANY } from '@kathena/types'
import { FormDialog } from '@kathena/ui'
import {
  ClassworkMaterial,
  useDetailClassworkMaterialQuery,
  useUpdateClassworkMaterialMutation,
} from 'graphql/generated'

import {
  FormContent,
  UpdateClassworkMaterialsFormInput,
  validationSchema,
} from './UpdateClassworkMaterials.from'

export type ClassworkMaterialWithId = {
  classworkMaterialId: string
}

export type ClassworkMaterialWithClassworkMaterial = {
  classworkMaterial: Pick<ClassworkMaterial, 'id' | 'title' | 'description'>
}

export type UpdateClassworkMaterialDialogProps = {
  open: boolean
  onClose: () => void
} & (ClassworkMaterialWithId | ClassworkMaterialWithClassworkMaterial)

const UpdateClassworkMaterialDialog: FC<UpdateClassworkMaterialDialogProps> = (
  props,
) => {
  const { open, onClose } = props
  const { classworkMaterialId } = props as ClassworkMaterialWithId

  const { classworkMaterial: classworkMaterialProp } =
    props as ClassworkMaterialWithClassworkMaterial

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateClassworkMaterial, { error }] =
    useUpdateClassworkMaterialMutation()
  const { data } = useDetailClassworkMaterialQuery({
    variables: { Id: classworkMaterialId },
    skip: !!classworkMaterialProp,
  })

  const classworkMaterial = useMemo(
    () => classworkMaterialProp || data?.classworkMaterial,
    [data?.classworkMaterial, classworkMaterialProp],
  )
  const { enqueueSnackbar } = useSnackbar()

  const initialValues: ANY = useMemo(
    () => classworkMaterial,
    [classworkMaterial],
  )
  // Video
  const { data: dataIframeVideo } = useDetailClassworkMaterialQuery({
    variables: { Id: classworkMaterial.id },
  })
  const classworkMaterialVideo = useMemo(
    () => dataIframeVideo?.classworkMaterial,
    [dataIframeVideo],
  )

  const [iframeVideos, setVideos] = useState<string[]>(
    classworkMaterialVideo?.iframeVideos ?? [],
  )
  const handleUpdateClassworkMaterial = useCallback(
    async (input: UpdateClassworkMaterialsFormInput) => {
      try {
        const { data: dataUpdated } = await updateClassworkMaterial({
          variables: {
            classworkMaterialId: classworkMaterial.id,
            updateClassworkMaterialInput: {
              title: input.title,
              description: input.description,
              iframeVideos,
            },
          },
        })
        const classworkMaterialUpdated = dataUpdated?.updateClassworkMaterial
        // console.log(classworkMaterialProp.id)
        if (!classworkMaterialUpdated) {
          return
        }

        enqueueSnackbar(`Sửa tài liệu thành công`, {
          variant: 'success',
        })
        onClose()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    },
    [
      updateClassworkMaterial,
      enqueueSnackbar,
      onClose,
      classworkMaterial.id,
      iframeVideos,
    ],
  )
  // Thêm/Xóa iframVideo
  const addIframe = (iframe: string) => {
    if (iframe.startsWith(`<iframe`) && iframe.endsWith(`></iframe>`)) {
      const arr = [...iframeVideos]
      arr.push(iframe)
      setVideos(arr)
    } else {
      enqueueSnackbar(`Vui lòng nhập đúng định dạng iframe video`, {
        variant: 'error',
      })
    }
  }
  const removeIframe = (index: number) => {
    const arr = [...iframeVideos]
    arr.splice(index, 1)
    setVideos(arr)
  }
  //----------------

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleUpdateClassworkMaterial}
      dialogTitle="Sửa tài liệu"
      submitButtonLabel="Sửa"
      backgroundButton="primary"
    >
      <FormContent
        iframeVideos={iframeVideos}
        addIframe={addIframe}
        removeIframe={removeIframe}
      />
    </FormDialog>
  )
}

export default UpdateClassworkMaterialDialog
