import React from 'react'
import fetch from 'isomorphic-unfetch'
import Comment from './comment'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Input,
  Button,
  Alert,
  Notification,
  Placeholder
} from 'rsuite'
const { Paragraph } = Placeholder

class Comments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMore: true,
      items: [],
      count: 15,
      commentText: ''
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
      this.setState({ hasMore: false })
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
          count: this.state.count + 15
        })
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      hasMore,
      items
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
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>No More Comments...</b>
            </p>
          }
        >
          <div className='infinite-scroll-item-wrapper'>
            {items.map(comment => {
              return <Comment user={this.props.user.email} onDelete={this.handleDeleteComment} data={comment} key={comment.id} />
            })}
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
            height: 56px;
            margin: 10px;
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
