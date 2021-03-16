import { FC, ReactNode, useCallback } from 'react'

import {
  Container,
  ContainerProps,
  Grid,
  makeStyles,
  Theme,
  Skeleton,
} from '@material-ui/core'
import { CaretLeft } from 'phosphor-react'
import { Helmet } from 'react-helmet-async'
import { useHistory } from 'react-router-dom'

import { APP_BAR_HEIGHT } from '@kathena/theme'

import Button from '../Button'
import { ContentSkeleton } from '../skeletons/ContentSkeleton'
import Typography from '../Typography'

export type PageContainerProps = {
  title?: string
  subtitle?: ReactNode
  actions?: ReactNode[]
  maxWidth?: ContainerProps['maxWidth']
  paperBackground?: boolean
  withBackButton?:
    | boolean
    | string
    | ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
  backButtonLabel?: string
  disableFooter?: boolean
}

const PageContainer: FC<PageContainerProps> = (props) => {
  const {
    actions,
    backButtonLabel,
    children,
    maxWidth,
    subtitle,
    title,
    withBackButton,
  } = props
  const classes = useStyles(props)

  const history = useHistory()

  const handleGoBack = useCallback(
    // eslint-disable-next-line consistent-return
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      if (withBackButton === true) {
        return history.goBack()
      }

      if (typeof withBackButton === 'function') {
        withBackButton(event)
      }
    },
    [history, withBackButton],
  )

  return (
    <div className={classes.root}>
      {title && typeof title === 'string' && <Helmet title={title} />}
      <Container maxWidth={maxWidth} className={classes.container}>
        <div className={classes.header}>
          {!withBackButton ? null : (
            <Button
              link={
                typeof withBackButton === 'string' ? withBackButton : undefined
              }
              onClick={handleGoBack}
              color="primary"
              size="small"
              startIcon={<CaretLeft weight="duotone" />}
              className={classes.backButton}
            >
              {backButtonLabel ?? 'Trở về'}
            </Button>
          )}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Grid container spacing={1} direction="column" wrap="nowrap">
                <Grid item>
                  <Typography variant="h1">{title}</Typography>
                </Grid>
                {subtitle && <Grid item>{subtitle}</Grid>}
              </Grid>
            </Grid>
            {actions && (
              <Grid item>
                <Grid container spacing={2}>
                  {actions.map((action, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Grid item key={idx}>
                      {action}
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        </div>

        <div>{children}</div>
      </Container>
    </div>
  )
}

export const PageContainerSkeleton: FC<PageContainerProps> = (props) => {
  const classes = useStyles(props)
  const { maxWidth } = props

  return (
    <div className={classes.root}>
      <Container maxWidth={maxWidth}>
        <div className={classes.header}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Grid container spacing={1} direction="column" wrap="nowrap">
                <Grid item>
                  <Skeleton>
                    <Typography variant="h1">Sample long title.</Typography>
                  </Skeleton>
                </Grid>
                <Grid item>
                  <Skeleton>
                    <Typography>Sample subtitle ________</Typography>
                  </Skeleton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={2}>
                <Grid item>
                  <Skeleton>
                    <Button>Action</Button>
                  </Skeleton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div>
          <ContentSkeleton />
        </div>
      </Container>
    </div>
  )
}

const useStyles = makeStyles<Theme, PageContainerProps>(
  ({ palette, spacing }) => ({
    '@global': {
      body: ({ paperBackground }) =>
        paperBackground
          ? {
              backgroundColor: palette.background.paper,
            }
          : {},
    },
    root: {
      padding: spacing(4, 2),
      minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
      display: 'flex',
      flexDirection: 'column',
    },
    container: {
      marginBottom: 'auto',
    },
    header: {
      marginBottom: spacing(5),
    },
    backButton: {
      marginLeft: -5,
      height: 'unset',
    },
  }),
)

export default PageContainer
