import React from 'react'
import fetch from 'isomorphic-unfetch'
import Comment from './comment'
import InfiniteScroll from 'react-infinite-scroll-component'
import BarLoader from 'react-spinners/ClipLoader'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import {
  Input,
  Button,
  Notification,
  Alert,
  ButtonGroup,
  ButtonToolbar
} from 'rsuite'
// import {
//   faPaperPlane
// } from '@fortawesome/free-solid-svg-icons'
import {
  faPaperPlane,
  faSmileWink
} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Comments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMore: true,
      items: [],
      count: 15,
      commentText: '',
      commentsLoading: true,
      showEmoji: false
    }
    // Roll your own: https://www.taniarascia.com/add-comments-to-static-site/
  }

  notifyInfo = (header, text) => {
    Notification.info({
      title: header,
      duration: 2000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  notifyWarn = (header, text) => {
    Notification.warning({
      title: header,
      duration: 2000,
      description: <div className='notify-body'>{text}</div>
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  handleSubmit = () => {
    const protocol = window.location.protocol
    const host = window.location.host
    const team = this.props.team
    const user = encodeURIComponent(this.props.user.email)
    const body = encodeURIComponent(this.state.commentText)
    const pageRequest = `${protocol}//${host}/api/comments/post?team=${team}&user=${user}&body=${body}`
    fetch(pageRequest)
      .then(res => res.json())
      .then(data => {
        if (data.discussionInsert.affectedRows === 1) {
          // this.notifyInfo('Comment Posted')
          Alert.info('Comment Posted')
          const newComments = this.state.items
          const userFullname = this.props.user.name
          newComments.unshift({
            userDetails: {
              fname: userFullname.substr(0, userFullname.lastIndexOf(' ')),
              lname: userFullname.substr(userFullname.lastIndexOf(' '), userFullname.length),
              email: this.props.user.email
            },
            id: data.discussionInsert.insertId,
            body: this.state.commentText,
            datetime: new Date()
          })
          this.setState({
            items: newComments,
            commentText: ''
          })
        } else {
          // this.notifyWarn('Error Posting Comment')
          Alert.error('Error Posting Comment')
        }
      })
      .catch(err => console.error(err))
  }

  handleDeleteComment = (id) => {
    const protocol = window.location.protocol
    const host = window.location.host
    const pageRequest = `${protocol}//${host}/api/comments/delete?id=${id}`
    fetch(pageRequest)
      .then(res => res.json())
      .then(data => {
        if (data.discussionDelete.affectedRows === 1) {
          // this.notifyInfo('Comment Deleted')
          Alert.info('Comment Deleted')
          const comments = this.state.items
          const remainingComments = comments.filter(com => com.id !== id)
          this.setState({
            items: remainingComments
          })
        } else {
          // this.notifyWarn('Error Deleting Comment')
          Alert.error('Error Deleting Comment')
        }
      })
      .catch(err => console.error(err))
  }

  handleCommentChange = (data) => {
    this.setState({
      commentText: data
    })
  }

  addEmoji = (data) => {
    const {
      commentText
    } = this.state

    const newCommentText = `${commentText} ${data.native}`
    this.setState({
      showEmoji: !this.state.showEmoji,
      commentText: newCommentText
    })
  }

  showEmojiPicker = () => {
    this.setState({
      showEmoji: !this.state.showEmoji
    })
  }

  fetchData = () => {
    if (this.state.items.length >= this.props.length) {
      this.setState({ hasMore: false, commentsLoading: true })
      return
    }
    const protocol = window.location.protocol
    const host = window.location.host
    const team = this.props.team
    const pageRequest = `${protocol}//${host}/api/comments?team=${team}&count=${this.state.count}`
    fetch(pageRequest)
      .then(res => res.json())
      .then(data => {
        const returnBody = data.resp
        data.resp.forEach((comment, index) => {
          const buffer = Buffer.from(comment.body)
          var string = new TextDecoder('utf-8').decode(buffer)
          returnBody[index].body = string
        })
        this.setState({
          items: returnBody,
          count: this.state.count + 15,
          commentsLoading: false
        })
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      hasMore,
      items,
      commentsLoading,
      showEmoji
    } = this.state

    return (
      <div id='scrollablediv' className='comments-wrapper'>
        <InfiniteScroll
          dataLength={this.state.items.length}
          next={this.fetchData}
          hasMore={hasMore}
          scrollableTarget='content-wrapper'
          // scrollThreshold='900px'
          // initialScrollY='0.8'
          // loader={<h4 style={{ textAlign: 'center' }}>Loading..</h4>}
          loader={
            <div
              style={{
                width: '100%',
                height: commentsLoading ? '100px' : '0px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <BarLoader width={80} height={3} color='#575757' loading={commentsLoading} />
            </div>
          }
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>No More Comments...</b>
            </p>
          }
        >
          <div className='infinite-scroll-item-wrapper'>
            {items.length > 0 && (
              items.map(comment => {
                return <Comment user={this.props.user.email} onDelete={this.handleDeleteComment} data={comment} key={comment.id} />
              })
            )}
            {!commentsLoading && items.length === 0 && (
              <span
                style={{
                  width: '100%',
                  height: '60px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                You could be the first to post here!
              </span>
            )}
          </div>
        </InfiniteScroll>
        <div className='comment-input-wrapper'>
          <Input
            componentClass='textarea'
            rows={1}
            style={{ width: '100%', resize: 'auto', minHeight: '45px' }}
            placeholder='What do you want to say?'
            value={this.state.commentText}
            onChange={this.handleCommentChange}
          />
          <ButtonToolbar>
            <ButtonGroup>
              <Button
                onClick={this.showEmojiPicker}
                appearance='default'
                className='emoji-picker-btn'
              >
                <FontAwesomeIcon icon={faSmileWink} width='1.5rem' />
              </Button>
              <Button
                className='comment-submit-btn'
                appearance='primary'
                onClick={this.handleSubmit}
              >
                <FontAwesomeIcon icon={faPaperPlane} width='1.3rem' />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
          {showEmoji ? (
            <div className='emoji-picker'>
              <Picker
                set='emojione'
                onSelect={this.addEmoji}
                showPreview={false}
                title='Emoji Picker'
                style={{
                  width: '425px'
                }}
              />
            </div>
          ) : (
            null
          )}
        </div>
        <style jsx>{`
          :global(.comments-wrapper) {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            height: 100%;
          }
          :global(.infinite-scroll-item-wrapper) {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }
          :global(.comment-input-wrapper) {
            display: flex;
            width: 90%;
            justify-content: space-between;
            align-items: center;
            overflow-y: scroll;
            margin: 0 auto;
            margin-top: 25px;
            overflow: visible;
            position: relative;
          }
          :global(.rs-btn-toolbar) {
            margin-left: 10px;
            width: 150px;
          }
          :global(.emoji-picker) {
            z-index: 999;
            position: absolute;
            display: inline-block;
            top: 50px;
          }
          :global(.emoji-picker-btn) {
            height: 45px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 10px;
          }
          :global(.emoji-mart-search input) {
            width: 75%;
          }
          :global(.emoji-mart-preview) {
            display: none;
          }
          :global(.comment-submit-btn) {
            height: 45px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: box-shadow 250ms ease-in-out;
          }
          :global(.comment-submit-btn:hover) {
            box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 8px rgba(90,97,105,.12), 0 10px 10px rgba(90,97,105,.06), 0 7px 70px rgba(90,97,105,.1);
          }
          :global(.scrollable-div) {
            overflow-y: scroll;
          }
        `}
        </style>
      </div>
    )
  }
}

export default Comments
