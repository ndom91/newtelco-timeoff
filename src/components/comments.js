import React from 'react'
import fetch from 'isomorphic-unfetch'
import Comment from './comment'
import InfiniteScroll from 'react-infinite-scroll-component'
import BarLoader from 'react-spinners/ClipLoader'
import {
  Input,
  Button,
  Notification
} from 'rsuite'

class Comments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMore: true,
      items: [],
      count: 15,
      commentText: '',
      commentsLoading: true
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
          this.notifyInfo('Comment Posted')
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
          this.notifyWarn('Error Posting Comment')
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
          this.notifyInfo('Comment Deleted')
          const comments = this.state.items
          const remainingComments = comments.filter(com => com.id !== id)
          this.setState({
            items: remainingComments
          })
        } else {
          this.notifyWarn('Error Deleting Comment')
        }
      })
      .catch(err => console.error(err))
  }

  handleCommentChange = (data) => {
    this.setState({
      commentText: data
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
        this.setState({
          items: data.resp,
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
      commentsLoading
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
            rows={3}
            style={{ width: '80%', resize: 'auto' }}
            placeholder='What do you want to say?'
            value={this.state.commentText}
            onChange={this.handleCommentChange}
          />
          <Button
            className='comment-submit-btn'
            appearance='primary'
            onClick={this.handleSubmit}
          >
            Post
          </Button>
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
            justify-content: flex-start;
          }
          :global(.comment-input-wrapper) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            overflow-y: scroll;
            margin-top: 25px;
          }
          :global(.comment-submit-btn) {
            height: 45px;
            margin: 5px;
            margin-right: 15px;
            box-shadow: 0 2px 0 rgba(90,97,105,.11), 0 4px 7px rgba(90,97,105,.22), 0 10px 10px rgba(90,7,105,.26), 0 7px 70px rgba(90,97,105,.1);
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
