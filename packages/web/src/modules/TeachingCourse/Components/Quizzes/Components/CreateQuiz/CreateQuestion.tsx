import { FC, useState } from 'react'

import {
  FormControlLabel,
  IconButton,
  makeStyles,
  Radio,
  RadioGroup,
  Stack,
} from '@material-ui/core'
import { Plus, X } from 'phosphor-react'

import { Button, Dialog, InputField } from '@kathena/ui'

export type CreateQuestionProps = {
  open: boolean
  onClose: () => void
  onCreate: (value: {
    title: string
    scores: number
    questionChoices: {
      title: string
      isRight: boolean
    }[]
  }) => void
}
const CreateQuestion: FC<CreateQuestionProps> = (props) => {
  const classes = useStyles(props)
  const { open, onClose, onCreate } = props
  const [input, setInput] = useState('')
  const [title, setTitle] = useState('')
  const [scores, setScores] = useState(1)
  const [titleErr, setTitleErr] = useState<string | null>(null)
  const [questionChoices, setQuestionChoices] = useState<
    { title: string; isRight: boolean }[]
  >([])

  const [indexRight, setIndexRight] = useState('0')

  const onTitleChange = (value: string) => {
    if (value.trim() === '') {
      setTitleErr('Tiêu đề không được bỏ trống')
    } else {
      setTitleErr(null)
    }
    setTitle(value)
  }

  const onRightChange = (value: string) => {
    setIndexRight(value)
    const index = Number(value)
    const arr = [...questionChoices]
    // eslint-disable-next-line
    arr.map((item) => {
      // eslint-disable-next-line
      item.isRight = false
    })
    arr[index].isRight = true
  }

  const addQuestionChoice = () => {
    if (input.trim() !== '') {
      const arr = [...questionChoices]
      arr.push({
        title: input,
        isRight: arr.length === 0,
      })
      setInput('')
      setQuestionChoices(arr)
    }
  }

  const removeQuestionChoice = (index: number) => {
    const arr = [...questionChoices]
    if (arr[index].isRight) {
      arr[0].isRight = true
      setIndexRight('0')
    }
    arr.splice(index, 1)
    setQuestionChoices(arr)
  }

  const onCreateQuestion = () => {
    const value = {
      title,
      scores,
      questionChoices,
    }
    onCreate(value)
    onClose()
    setQuestionChoices([])
    setScores(1)
    setTitle('')
    setIndexRight('0')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle="Thêm câu hỏi"
      width={400}
      extraDialogActions={
        <Button
          variant="contained"
          disabled={questionChoices.length === 0 || title === ''}
          onClick={onCreateQuestion}
          backgroundColorButton="primary"
        >
          Thêm câu hỏi
        </Button>
      }
    >
      <Stack>
        <InputField
          label="Tiêu đề"
          required
          fullWidth
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          error={!!titleErr}
          helperText={titleErr}
        />
      </Stack>
      <Stack mt={2}>
        <InputField
          required
          quantity={scores}
          onQuantityChange={(value) => setScores(value)}
          name="score"
          variant="quantity"
          label="Điểm"
          min={1}
        />
      </Stack>
      <Stack className={classes.questionChoicesWrapper} mt={3}>
        <RadioGroup
          value={`${indexRight}`}
          onChange={(e) => onRightChange(e.target.value)}
        >
          {questionChoices.map((item, index) => (
            <FormControlLabel
              value={`${index}`}
              control={<Radio />}
              label={
                <div className={classes.questionChoiceWrapper}>
                  <div style={{ flex: 1 }}>{item.title}</div>
                  <IconButton
                    style={{ width: '50px' }}
                    onClick={() => removeQuestionChoice(index)}
                  >
                    <X />
                  </IconButton>
                </div>
              }
            />
          ))}
        </RadioGroup>
      </Stack>
      <Stack className={classes.inputWrapper} mt={2}>
        <InputField
          className={classes.input}
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <IconButton onClick={addQuestionChoice}>
          <Plus />
        </IconButton>
      </Stack>
    </Dialog>
  )
}

const useStyles = makeStyles(() => ({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  questionChoicesWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  questionChoiceWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

export default CreateQuestion
