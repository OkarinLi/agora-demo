import React from 'react'
// import AgoraRTC from './AgoraRTC'
import AgoraRTC from './AgoraRTC'
import AgoraRTS from './AgoraRTS'


// let client

class Agora extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.client = {}
    this.subscribedStreams = {}
    this.remoteStreams = {}
  }

  componentWillMount() {
    this.initAgora()
  }


  componentWillUnmount() {

    this.client &&
      this.client.leave(
        () => {
          console.log('Client succeed to leave.')
        },
        () => {
          console.log('Client failed to leave.')
        }
      )
  }
  // componentDidUpdate() {
  //   this.initAgora()
  // }
  initAgora = () => {
    // let rt = this
    if (!AgoraRTS.checkSystemRequirements()) {
      alert('您的浏览器不支持 RTS！')
    } else {
      console.log('check success')
    }
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' })
    AgoraRTS.init(AgoraRTC, {
      wasmDecoderPath: 'http://gcdncs.101.com/v0.1/static/nd_robot_steam_web_cs/AgoraRTS.wasm',
      asmDecoderPath: 'http://gcdncs.101.com/v0.1/static/nd_robot_steam_web_cs/AgoraRTS.asm'
    }).catch(e => {
      if (e === 'LOAD_DECODER_FAILED') {
        console.log('加载解码器失败！')
      }
    })
    AgoraRTS.proxy(this.client)
    this.client.init(
      '00640641460a183420abdf0556c3e6629e8IACKG+mIsW6IZ7zfm1cq2MF4SiDxDlzvnrKAjsXoGxjvWQx+f9gAAAAAEAARF0XbFiO8XQEAAQAXI7xd',
      () => {
        this.subscribeStreamEvents()
        this.client.join(null, 'test', null, uid => {
          console.log('uid', uid)
        })
      }
    )
  }



  subscribeStreamEvents = () => {
    let rt = this
    rt.client.on('stream-subscribed', function(e) {
      console.log('stream-subscribed')
      let stream = e.stream
      rt.subscribedStreams[stream.getId()] = stream
      rt.playRemoteStream(stream)
    })

    rt.client.on('stream-added', function(e) {
      let stream = e.stream
      console.log('start subscribe', stream)
      rt.remoteStreams[stream.getId()] = stream
      console.log(rt.client)
      rt.client.subscribe(stream, { video: true, audio: true })
      console.log('after subscribe', stream)
    })

    rt.client.on('stream-removed', function(e) {
      let stream = e.stream
      const id = stream.id
      delete rt.remoteStreams[id]
      delete rt.subscribedStreams[id]
    })

    rt.client.on('peer-leave', function(e) {
      let id = e.uid
      delete rt.remoteStreams[id]
      delete rt.subscribedStreams[id]
    })
  }
  playRemoteStream = stream => {
    stream.play('videoWrap')
  }



  render() {
    return <div id="videoWrap" style={{ height: '400px', width: '600px' }}></div>
  }
}

export default Agora
