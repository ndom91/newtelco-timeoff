import React from 'react'
import fetch from 'isomorphic-unfetch'
import Comment from './comment'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Input,
  Button,
  Alert
} from 'rsuite'
class InfiniteHistory extends React.Component {
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

  componentDidMount () {
    this.fetchData()
  }

  submitComment = () => {
    const protocol = window.location.protocol
    const host = window.location.host
    const team = this.props.team
    const user = encodeURIComponent(this.props.user)
    const body = encodeURIComponent(this.state.commentText)
    const pageRequest = `${protocol}//${host}/api/comments/post?team=${team}&user=${user}&body=${body}`
    fetch(pageRequest)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.discussionInsert.affectedRows === 1) {
          Alert.success('Comment Posted')
        } else {
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
        console.log(data)
        if (data.discussionDelete.affectedRows === 1) {
          Alert.success('Comment Deleted')
        } else {
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
      <div id='scrollablediv'>
        <InfiniteScroll
          dataLength={this.state.items.length}
          next={this.fetchData}
          hasMore={hasMore}
          // scrollThreshold='900px'
          // scrollableTarget='scrolltarget'
          // scrollableTarget='scrollablediv'
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
              return <Comment onDelete={this.handleDeleteComment} data={comment} key={comment.id} />
            })}
          </div>
        </InfiniteScroll>
        <hr />
        <div className='comment-input-wrapper'>
          <Input
            componentClass='textarea'
            rows={3}
            style={{ width: '80%', resize: 'auto' }}
            placeholder='What do you want to say?'
            onChange={this.handleCommentChange}
          />
          <Button
            className='comment-submit-btn'
            appearance='primary'
            onClick={this.submitComment}
          >
            Post
          </Button>
        </div>
        <style jsx>{`
          :global(.infinite-scroll-item-wrapper) {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          :global(.comment-input-wrapper) {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          :global(.comment-submit-btn) {
            height: 56px;
            margin: 10px;
          }
        `}
        </style>
      </div>
    )
  }
}

export default InfiniteHistory
